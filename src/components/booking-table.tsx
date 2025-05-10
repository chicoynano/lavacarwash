'use client';

import React from "react"; // 👈 Importación necesaria
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { jsPDF } from "jspdf";


export default function AdminPanel() {
  const [reservas, setReservas] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchReservas() {
      const reservasRef = collection(db, "reservas");
      const q = query(reservasRef, orderBy("date"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setReservas(data);
    }
    fetchReservas();
  }, []);

  async function marcarComoRealizado(id: string) {
    const reservaRef = doc(db, "reservas", id);
    await updateDoc(reservaRef, { status: "completed" });
    setReservas(prev =>
      prev.map(r => r.id === id ? { ...r, status: "completed" } : r)
    );
  }

  function generarPDF(reserva: any) {
    const doc = new jsPDF();
    doc.text(`Reserva para: ${reserva.name}`, 10, 10);
    doc.text(`Servicio: ${reserva.serviceName}`, 10, 20);
    const fecha = reserva.date?.seconds
      ? new Date(reserva.date.seconds * 1000).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "Fecha no disponible";

    doc.text(`Fecha: ${fecha}`, 10, 30);

    doc.text(`Hora: ${reserva.time}`, 10, 40);
    doc.text(`Teléfono: ${reserva.phone}`, 10, 50);
    doc.text(`Dirección: ${reserva.address}`, 10, 60);
    doc.save(`reserva-${reserva.name}.pdf`);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Reservas</h1>
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Servicio</th>
            <th className="border px-4 py-2">Fecha</th>
            <th className="border px-4 py-2">Hora</th>
            <th className="border px-4 py-2">Teléfono</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Dirección</th>
            <th className="border px-4 py-2">Comentarios</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id} className={reserva.status === "completed" ? "bg-green-50" : ""}>
              <td className="border px-4 py-2">{reserva.name}</td>
              <td className="border px-4 py-2">{reserva.serviceName}</td>
              <td className="border px-4 py-2">
                {reserva.date?.seconds
                  ? new Date(reserva.date.seconds * 1000).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : ""}
              </td>
              <td className="border px-4 py-2">{reserva.time}</td>
              <td className="border px-4 py-2">{reserva.phone}</td>
              <td className="border px-4 py-2">{reserva.email}</td>
              <td className="border px-4 py-2">{reserva.address}</td>
              <td className="border px-4 py-2">{reserva.comments || "-"}</td>
              <td className="border px-4 py-2">
                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    onClick={() => marcarComoRealizado(reserva.id)}
                    disabled={reserva.status === "completed"}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-white text-sm transition ${reserva.status === "completed"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    ✅ Realizado
                  </button>
                  <button
                    onClick={() => generarPDF(reserva)}
                    className="flex items-center gap-1 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-sm transition"
                  >
                    🧾 PDF
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

