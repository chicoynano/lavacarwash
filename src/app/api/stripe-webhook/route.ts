console.log('Webhook file initialized');
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase'; // Asegúrate de que esta ruta sea correcta a tu instancia de Firebase
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendEmail } from '@/services/email'; // Asegúrate de que esta ruta sea correcta
import { format } from 'date-fns'; // Import format for date formatting

// Configura Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Cambiado a la versión esperada
});



// Obtén la clave secreta del webhook desde las variables de entorno
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json({ received: false, message: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Construye el evento verificando la firma
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ received: false, message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Maneja los eventos según su tipo
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;

      // Accede a los metadatos para obtener el bookingId
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        console.log(`💰 Pago recibido para la reserva: ${bookingId}`);

        try {
          // Opcional: Actualiza el estado de la reserva en tu base de datos (ej: a "pagado")
          const bookingRef = doc(db, "bookings", bookingId);
          await updateDoc(bookingRef, {
            paymentStatus: 'paid',
            paymentIntentId: session.payment_intent, // Guarda el ID del intento de pago
          });

          // Recupera los detalles completos de la reserva de Firebase si es necesario para el email
          const bookingSnap = await getDoc(bookingRef);
          if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();

            // Fetch service details to get the service name
            const serviceSnap = await getDoc(doc(db, "servicios", bookingData.serviceId));
            let serviceName = 'Servicio Desconocido'; // Default name if service not found

            if (serviceSnap.exists()) {
              serviceName = serviceSnap.data().name || serviceName;
            } else {
              console.error(`❌ No se encontró el servicio con ID: ${bookingData.serviceId} para la reserva ${bookingId}.`);
            }

            console.log("Datos de email para el cliente:", { to_email: bookingData.email, from_name: 'LavaCarWash', subject: `Confirmación de Reserva - ${serviceName}`, client_name: bookingData.name, service_name: serviceName, booking_date: bookingData.date ? format(bookingData.date.toDate(), 'dd/MM/yyyy') : 'Fecha no especificada', booking_time: bookingData.time, booking_address: bookingData.address, booking_phone: bookingData.phone, booking_comments: bookingData.comments || '', booking_id: bookingId, templateId: process.env.EMAILJS_TEMPLATE_ID!, name: bookingData.name, email: bookingData.email, });
            // Llama a la función para enviar el correo al usuario
            await sendEmail({
              to_email: bookingData.email,
              from_name: 'LavaCarWash',
              subject: `Confirmación de Reserva - ${serviceName}`,
              client_name: bookingData.name,
              service_name: serviceName,
              booking_date: bookingData.date ? format(bookingData.date.toDate(), 'dd/MM/yyyy') : 'Fecha no especificada',
              booking_time: bookingData.time,
              booking_address: bookingData.address,
              booking_phone: bookingData.phone,
              booking_comments: bookingData.comments || '',
              booking_id: bookingId,
              templateId: process.env.EMAILJS_TEMPLATE_ID!,
              name: bookingData.name,
              email: bookingData.email,
            });
            console.log(`📧 Correo de confirmación enviado al usuario para la reserva: ${bookingId}`);

            console.log("Datos de email para el administrador:", { to_email: "chicoynano1@gmail.com", from_name: 'LavaCarWash', subject: `Nueva Reserva Recibida - ${serviceName} (${bookingId})`, client_name: bookingData.name, service_name: serviceName, booking_date: bookingData.date ? format(bookingData.date.toDate(), 'dd/MM/yyyy') : 'Fecha no especificada', booking_time: bookingData.time, booking_address: bookingData.address, booking_phone: bookingData.phone, booking_comments: bookingData.comments || '', booking_id: bookingId, templateId: "template_lsv899c", name: bookingData.name, email: bookingData.email, client_email: bookingData.email, });
            // Llama a la función para enviar el correo al administrador
            await sendEmail({
              to_email: "chicoynano1@gmail.com",
              from_name: 'LavaCarWash',
              subject: `Nueva Reserva Recibida - ${serviceName} (${bookingId})`,
              client_name: bookingData.name,
              service_name: serviceName,
              booking_date: bookingData.date ? format(bookingData.date.toDate(), 'dd/MM/yyyy') : 'Fecha no especificada',
              booking_time: bookingData.time,
              booking_address: bookingData.address,
              booking_phone: bookingData.phone,
              booking_comments: bookingData.comments || '',
              booking_id: bookingId,
              templateId: "template_lsv899c",
              name: bookingData.name,
              email: bookingData.email,
              client_email: bookingData.email,
            });
            console.log(`📧 Correo de notificación enviado al administrador para la reserva: ${bookingId}`);

          } else {
            console.error(`❌ No se encontró la reserva con ID: ${bookingId} en Firebase.`);
          }

        } catch (error) {
          console.error(`❌ Error procesando el pago completado para la reserva ${bookingId}:`, error);
          // Dependiendo de tus necesidades, podrías querer reintentar o notificar
        }

      } else {
        console.error('⚠️  Evento checkout.session.completed sin bookingId en los metadatos.');
      }

      break;

    // Puedes manejar otros tipos de eventos aquí si es necesario
    // case 'payment_intent.succeeded':
    //   const paymentIntent = event.data.object;
    //   console.log(`PaymentIntent was ${paymentIntent.status}`);
    //   break;
    default:
      // Maneja cualquier otro tipo de evento de webhook
      console.log(`Unhandled event type ${event.type}`);
  }

  // Devuelve una respuesta 200 para indicar que el evento fue recibido correctamente
  return NextResponse.json({ received: true });
}

