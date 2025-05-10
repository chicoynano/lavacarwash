"use server";

import { z } from "zod";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import type { Service, Booking } from "@/types";
import { db } from "@/lib/firebase";
import { sendEmail, type EmailData } from "@/services/email"; // Import sendEmail and EmailData type

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
export async function saveBooking(data: BookingFormInput): Promise<{
    success: boolean;
    message: string;
    errors?: z.ZodIssue[]; // Include potential validation errors
    bookingId?: string; // Optionally return the booking ID
}> {
  const result = bookingSchema.safeParse(data);

  if (!result.success) {
    console.error("Server-side validation failed:", result.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Errores de validación. Por favor, corrige los campos marcados.",
      errors: result.error.issues, // Return detailed issues
    };
  }

  const { serviceId, payNow, date, ...rest } = result.data; // Destructure date

  try {
    const services = await getServices();
    const selectedService = services.find((s) => s.id === serviceId);

    if (!selectedService) {
      return { success: false, message: "Servicio no encontrado." };
    }

    // Format date for Firestore and email
    const formattedDateForFirestore = Timestamp.fromDate(date);
    const formattedDateForEmail = date.toLocaleDateString('es-ES', { // Format date for email (Spanish locale)
        year: 'numeric', month: 'long', day: 'numeric'
      });

    // Prepare data for Firestore document
    const reservaData: Omit<Booking, "id" | "paymentIntentId" | "createdAt" | "status" | "date"> & { // Exclude id and fields with default/generated values
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


    // Save booking to Firestore
    const docRef = await addDoc(collection(db, "reservas"), reservaData);
    console.log("Reserva guardada con ID:", docRef.id);

    // Prepare data for EmailJS template based on the EmailData interface
    const emailParams: EmailData = {
      to_email: rest.email, // Assuming your template variable is {{to_email}}
      from_name: "LavaCarWash", // Your business name (can be customized)
      subject: `Confirmación de Reserva - ${selectedService.name}`, // More specific subject
      client_name: rest.name, // Corresponds to {{client_name}}
      service_name: selectedService.name, // Corresponds to {{service_name}}
      booking_date: formattedDateForEmail, // Corresponds to {{booking_date}}
      booking_time: rest.time, // Corresponds to {{booking_time}}
      booking_address: rest.address, // Corresponds to {{booking_address}}
      // Add any other variables needed by your specific EmailJS template
      // e.g., booking_id: docRef.id,
      // e.g., comments: rest.comments || 'Ninguno',
    };


    // Send email confirmation using the updated service
    try {
        await sendEmail(emailParams);
        console.log("Email de confirmación enviado a:", rest.email);
    } catch (emailError) {
        console.error("Error al enviar el email de confirmación:", emailError);
        // Return success for booking, but indicate email failed
        return {
            success: true, // Booking saved successfully
            message: "¡Reserva guardada! Sin embargo, hubo un problema al enviar el correo de confirmación.",
            bookingId: docRef.id,
        };
    }


    return {
        success: true,
        message: "¡Reserva enviada correctamente! Revisa tu correo para la confirmación.",
        bookingId: docRef.id,
     };
  } catch (error) {
    console.error("Error al guardar reserva o enviar email:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, message: `Error al procesar la reserva: ${errorMessage}` };
  }
}
