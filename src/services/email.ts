import type { Timestamp } from 'firebase/firestore'; // Asegúrate de tener esta importación si usas Timestamp en EmailData

export interface EmailData {
  to_email: string;
  from_name: string;
  subject: string;
  client_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  booking_address: string;
  booking_phone: string;
  booking_comments: string;
  date?: any; // Puedes considerar si esto realmente se necesita o si siempre se formatea a booking_date
  time?: any; // Puedes considerar si esto realmente se necesita o si siempre se formatea a booking_time
  booking_id: string; // Necesario para las plantillas que muestren el ID de reserva
  name?: string; // Coincide con {{name}} si tu plantilla lo usa
  title?: string; // Coincide con {{title}} si tu plantilla lo usa (a veces se usa para el asunto)
  email?: string; // Coincide con {{email}} si tu plantilla lo usa (a veces se usa para el email del cliente)
  client_email?: string; // Para plantillas de administrador, el email del cliente
  templateId: string; // ID de la plantilla de EmailJS a usar
}

export async function sendEmail(data: EmailData) {
  // Ensure this function is only called on the server
  if (typeof window !== 'undefined') {
    console.error("sendEmail should only be called on the server.");
    // Return an error indication specific to being called on the client
    return { success: false, error: "Attempted to send email from client-side." };
  }

  const templateParams = {
    // Ensure these parameters match your EmailJS template variables EXACTLY
    to_email: data.to_email,
    from_name: data.from_name,
    subject: data.subject,
    client_name: data.client_name,
    service_name: data.service_name,
    booking_date: data.booking_date,
    booking_time: data.booking_time,
    booking_address: data.booking_address,
    booking_phone: data.booking_phone,
    booking_comments: data.booking_comments || '', // Usa || '' para asegurar que siempre sea un string
    booking_id: data.booking_id,
    name: data.name, // Asegúrate de incluir todas las propiedades definidas en EmailData
    title: data.title,
    email: data.email,
    client_email: data.client_email,
    // No incluyas templateId aquí, ya que es parte de la carga útil de la API, no de template_params
  };

  console.log("EmailJS Request Body:", templateParams);

  // Get EmailJS credentials from environment variables
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY; // Use public key as user_id for server-side

  // Check if environment variables are defined
  if (!serviceId || !publicKey) {
    console.error("EmailJS environment variables not defined.");
    return { success: false, error: "Email sending not configured: Missing service ID or public key." };
  }

  try {
    const apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    const body = {
      service_id: serviceId,
      template_id: data.templateId, // Aquí se usa data.templateId
      user_id: publicKey, // Use public key as user_id for server-side
      template_params: templateParams,
    };

    console.log("EmailJS Request Body:", JSON.stringify(body));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email sending failed with status ${response.status}: ${errorText}`);
    }

    console.log("Email sent successfully via EmailJS API");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send email via EmailJS:", error);
    return { success: false, error: error.message || "An unknown error occurred during email sending." };
  }
}