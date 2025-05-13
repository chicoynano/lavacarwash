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
	console.log("Valor inicial de rest.comments:", rest.comments);

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
		console.log("Intentando guardar en la colección:", "reservas");
		console.log("Datos a guardar:", reservaData);
		const docRef = await addDoc(collection(db, "reservas"), reservaData);
		console.log("Reserva guardada con ID:", docRef.id);

		// Prepare data for EmailJS template based on the EmailData interface
		const emailParams: EmailData = {
			to_email: rest.email, // Assuming your template variable is {{to_email}}
			from_name: "LavaCarWash", // Your business name (can be customized)
			subject: `Confirmación de Reserva - ${selectedService.name}`, // More specific subject // Corresponds to {{subject}} or {{title}}
			client_name: rest.name, // Corresponds to {{client_name}} in template_cliente
			// Note: If your template actually uses {{name}} instead of {{client_name}}, make sure to adjust the property name to 'name' here.
			service_name: selectedService.name, // Corresponds to {{service_name}}
			booking_date: formattedDateForEmail, // Corresponds to {{booking_date}}
			booking_time: rest.time, // Corresponds to {{booking_time}}
			booking_address: rest.address, // Corresponds to {{booking_address}}
			booking_id: docRef.id, // Include booking ID for the client template
			booking_phone: rest.phone, // Include phone for the client template
			booking_comments: rest.comments, // Include comments for the client template
			// Use variable names exactly as in your EmailJS template
			// e.g., booking_id: docRef.id,
			// e.g., comments: rest.comments || 'Ninguno',
		};
		console.log("Value of rest.comments:", rest.comments);
		console.log("emailParams before sending:", emailParams);
		const userEmailTemplateId = "template_0f6ylcp";

		// Send email confirmation using the updated service
		try {
			const emailResult = await sendEmail({ ...emailParams, templateId: userEmailTemplateId });

			if (emailResult && 'error' in emailResult) {
				console.error("Error al enviar el email de confirmación:", emailResult.error);
				// Return success for booking, but indicate email failed with details
				return {
					success: true, // Booking saved successfully
					message: `¡Reserva guardada! Sin embargo, hubo un problema al enviar el correo de confirmación: ${emailResult.error}`,
					bookingId: docRef.id,
				};
			}

			console.log("Email de confirmación enviado a:", rest.email);
		} catch (error) {
			console.error("Error inesperado al enviar el email:", error);
			return {
				success: true, // Booking saved successfully
				message: `¡Reserva guardada! Sin embargo, hubo un error inesperado al intentar enviar el correo de confirmación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
				bookingId: docRef.id,
			};
		}

		// Prepare data for Admin EmailJS template
		const adminEmailParams = {
			to_email: "chicoynano1@gmail.com", // Admin email address
			from_name: "LavaCarWash",
			subject: `Nueva Reserva - ${selectedService.name}`, // Assuming {{subject}} or adjust to {{title}} if your template uses {{title}} for subject
			client_name: rest.name, // Assuming {{client_name}} or adjust to {{name}} if your template uses {{name}} for client name
			service_name: selectedService.name,
			booking_date: formattedDateForEmail,
			booking_time: rest.time,
			booking_address: rest.address,
			booking_id: docRef.id, // Corresponds to {{booking_id}}
			booking_comments: rest.comments, // Corresponds to {{booking_comments}}
			client_email: rest.email, // Include client email for admin
			booking_phone: rest.phone, // Include client phone for admin - Corresponds to {{booking_phone}}
		};
		console.log("adminEmailParams before sending:", adminEmailParams);
		const adminEmailTemplateId = "template_lsv899c";

		// Send admin email
		try {
			const adminEmailResult = await sendEmail({ ...adminEmailParams, templateId: adminEmailTemplateId });
			if (adminEmailResult && 'error' in adminEmailResult) {
				console.error("Error al enviar el email al administrador:", adminEmailResult.error);
				// Consider if you want to return a different message or log this error specifically
			}
			console.log("Email al administrador enviado a:", adminEmailParams.to_email);
		} catch (error) {
			console.error("Error inesperado al enviar el email al administrador:", error);
			// Consider if you want to return a different message or log this error specifically
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

