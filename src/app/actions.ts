"use server";

import { z } from "zod";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import type { Booking, Service } from "@/types/index"; // Corrected import path


import { db } from "@/lib/firebase";
import { sendEmail, type EmailData } from "@/services/email"; // Import sendEmail and EmailData type
import Stripe from "stripe";

// Define una interfaz para el tipo de retorno de saveBooking
interface SaveBookingResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[]; // Include potential validation errors
  bookingId?: string; // Optionally return the booking ID
  stripeCheckoutUrl?: string | null; // Make stripeCheckoutUrl optional and allow null
}

// Obtener lista de servicios desde Firestore
export async function getServices(): Promise<Service[]> {
  try {
    const servicesSnapshot = await getDocs(collection(db, "servicios")); // Corrected collection name to "servicios"
    return servicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, "id">),
    }));
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw new Error("No se pudieron cargar los servicios.");
  }
}

// Esquema de validación del formulario (lado servidor)
const bookingSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Correo inválido." }),
  phone: z.string().min(9, { message: "Teléfono inválido. Debe tener al menos 9 dígitos." }), // Adjusted min length for Spanish phones
  address: z.string().min(5, { message: "Dirección inválida." }),
  serviceId: z.string().min(1, { message: "Selecciona un servicio." }),
  date: z.date({ required_error: "Selecciona una fecha válida." }),
  time: z.string().min(1, { message: "Selecciona una hora." }),
  comments: z.string().optional(),
  payNow: z.boolean().optional(), // Keep if needed, but not used in email
});

export type BookingFormInput = z.infer<typeof bookingSchema>;

// Guardar reserva en Firestore y enviar email
export async function saveBooking(data: BookingFormInput): Promise<SaveBookingResult> {
  const result = bookingSchema.safeParse(data);

  if (!result.success) {
    console.error("Server-side validation failed:", result.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Errores de validación. Por favor, corrige los campos marcados.",
      errors: result.error.issues, // Return detailed issues
    };
  }

  const { serviceId, payNow, date, ...rest } = result.data; // Destructure date and payNow
  console.log("Valor inicial de rest.comments:", rest.comments);
  try {
    const services = await getServices();
    const selectedService = services.find((s) => s.id === serviceId);

    if (!selectedService) {
      return { success: false, message: "Servicio no encontrado." };
    }

    // Format date for Firestore and email
    const formattedDateForFirestore = Timestamp.fromDate(date);
    const formattedDateForEmail = date.toLocaleDateString("es-ES", {
      // Format date for email (Spanish locale)
      year: "numeric", month: "long", day: "numeric",
    });

    // Prepare data for Firestore document
    const reservaData: Omit<Booking, "id" | "paymentIntentId" | "createdAt" | "status" | "date"> & {
      createdAt: Timestamp;
      status: Booking["status"];
      date: Timestamp; // Use Timestamp for Firestore
    } = {
      name: rest.name,
      email: rest.email,
      phone: rest.phone,
      address: rest.address,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: formattedDateForFirestore, // Save Timestamp to Firestore
      time: rest.time,
      comments: rest.comments || '', // Ensure comments is a string
      status: "pending", // Default status
      createdAt: Timestamp.now(),
    };

    console.log("Intentando guardar en la colección:", "reservas");
    console.log("Datos a guardar:", reservaData);
    const docRef = await addDoc(collection(db, "reservas"), reservaData);
    console.log("Reserva guardada con ID:", docRef.id);

    if (payNow === true) { // Check if payNow is explicitly true
      // Lógica para crear la sesión de Checkout de Stripe
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-04-30.basil', // Cambiado a la versión esperada
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'eur', // Cambia a tu moneda si es necesario
                product_data: {
                  name: selectedService.name,
                  description: `Fecha: ${formattedDateForEmail}, Hora: ${rest.time}`, // Añadir fecha y hora a la descripción
                },
                unit_amount: Math.round(selectedService.price * 100), // Precio en céntimos
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?bookingId=${docRef.id}`, // URL de éxito
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel?bookingId=${docRef.id}`,   // URL de cancelación
          metadata: {
            bookingId: docRef.id,
            clientEmail: rest.email,
            clientName: rest.name,
            serviceName: selectedService.name,
            bookingDate: formattedDateForEmail, // Pass formatted date to webhook
            bookingTime: rest.time,
            bookingAddress: rest.address,
            bookingPhone: rest.phone,
            bookingComments: rest.comments || '',
          },
        });

        // Devolver la URL de la sesión para redirigir al cliente
        return {
          success: true,
          message: "Reserva guardada. Redirigiendo para completar el pago...",
          bookingId: docRef.id,
          stripeCheckoutUrl: session.url, // Incluir la URL de Stripe
        };

      } catch (stripeError: any) {
        console.error("Error al crear la sesión de Checkout de Stripe:", stripeError);
        // Considerar cómo manejar este error: podrías marcar la reserva con un estado de pago fallido
        return {
          success: false,
          message: `Error al iniciar el proceso de pago: ${stripeError.message || "Error desconocido"}`,
          bookingId: docRef.id, // Aún devolvemos el ID de la reserva creada
        };
      }
    }

    // If payNow is false, return the original success response
    return {
      success: true, // Booking saved successfully
      message: "¡Reserva guardada! Completa el pago para confirmar. Te enviaremos un email después del pago.", // Updated message
      bookingId: docRef.id,
    };
  } catch (error) {
    console.error("Error al guardar reserva o enviar email:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, message: `Error al procesar la reserva: ${errorMessage}` };
  }
}