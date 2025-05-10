import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Tipo de datos que recibe el formulario
type BookingFormInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceId: string;
  date: string;
  time: string;
  comments: string;
};

export async function saveBooking(data: BookingFormInput) {
  try {
    await addDoc(collection(db, "reservas"), {
      nombre_cliente: data.name,
      email_cliente: data.email,
      telefono: data.phone,
      direccion: data.address,
      servicio_id: data.serviceId,
      fecha: new Date(data.date),
      hora: data.time,
      comentarios: data.comments,
      estado_pago: false,
    });

    return {
      success: true,
      message: "Reserva guardada correctamente",
    };
  } catch (error) {
    console.error("Error guardando en Firestore:", error);
    return {
      success: false,
      message: "Error al guardar la reserva",
    };
  }
}