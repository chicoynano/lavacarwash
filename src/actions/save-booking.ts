import { addDoc, collection, Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookingFormInput } from '../app/actions'; // Import the type
import fetch from 'node-fetch';

// Helper function to send email using EmailJS (server-side)
// This function should ideally be in a separate server-side file
async function sendEmail(templateId: string, templateParams: any, toEmail: string) {
  // Ensure this function is only called on the server
  if (typeof window !== 'undefined') {
    console.error("sendEmail should only be called on the server.");
    return;
  }

  try {
    const body = {
      service_id: process.env.EMAILJS_SERVICE_ID!,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY!, // Use public key as user_id
      template_params: templateParams,
    };
    console.log("EmailJS Request Body:", JSON.stringify(body)); // Log the request body
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Email sending failed with status: ${response.status}`);
    }
  } catch (error) {
    throw new Error("Failed to send email");
  }
}
export async function saveBooking(data: BookingFormInput) {
  console.log("Received booking data:", data); // Log received data

  try {
    const docRef = await addDoc(collection(db, "reservas"), {
      nombre_cliente: data.name,
      email_cliente: data.email,
      telefono: data.phone,
      direccion: data.address,
      servicio_id: data.serviceId,
      fecha: Timestamp.fromDate(new Date(data.date)),
      hora: data.time,
      comentarios: data.comments,
      estado_pago: false, // Restore original field
    });

    // Format the date to YYYY-MM-DD string
    const bookingDate = data.date;
    const year = bookingDate.getFullYear();
    const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = bookingDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const userEmailParams = {
      client_name: data.name,
      email: data.email,
      booking_id: docRef.id,
      service_name: data.serviceId, // You might want to map this to a service name
      booking_date: data.date,
      booking_time: data.time,
      booking_address: data.address, // Use the formatted date
      booking_phone: data.phone,
      booking_comments: data.comments,
    };

    const adminEmailParams = {
      name: data.name,
      // Add other booking details as needed for the admin email template
      booking_id: docRef.id,
      service_name: data.serviceId,
    };

    console.log("User email parameters:", userEmailParams); // Log user email parameters

    return {
      success: true,
      message: "¡Reserva guardada! Completa el pago para confirmar. Te enviaremos un email después del pago."
    };
  } catch (error: any) {
    console.error("Error guardando en Firestore o enviando correo:", error);

    // Differentiate between database save error and email sending error
    if (error.message === "Failed to send email") {
      return {
        success: true, // Booking was saved successfully
        message: "¡Reserva guardada! Sin embargo, hubo un problema al enviar el correo de confirmación."
      };
    }
    console.error("Error guardando en Firestore:", error);
    return {
      success: false,
      message: "Error al guardar la reserva",
    };
  }
}