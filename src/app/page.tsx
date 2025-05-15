import { BookingForm } from "@/components/booking-form";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster for notifications

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 flex flex-col lg:flex-row justify-center items-center lg:items-start">
      {/* Contenedor de las imágenes y texto (Columna Izquierda en lg) */}
      {/* Añadimos items-center para centrar en móviles y lg:mr-8 para espaciado en lg */}
      <div className="flex flex-col items-center mb-8 lg:mb-0 lg:mr-8">
        {/* Grupo 1 de imágenes y texto */}
        {/* Centrar en móvil, margen inferior para separar grupos */}
        <div className="flex flex-col items-center mb-8">
          <img src="/lavado.png" alt="Lavado Profesional" className="w-48 h-48 object-cover rounded-lg shadow-lg mb-2 image-with-border" /> {/* Añadimos clase image-with-border */}
          <p className="text-center text-primary-foreground mb-8 text-with-background">Lavado Profesional</p> {/* Añadimos clase text-with-background */}
        </div>

        {/* Grupo 2 de imágenes y texto */}
        {/* Centrar en móvil */}
        <div className="flex flex-col items-center">
          <img src="/interior.png" alt="Detallado de Interiores" className="w-48 h-48 object-cover rounded-lg shadow-lg mb-2 image-with-border" /> {/* Añadimos clase image-with-border */}
          <p className="text-center text-primary-foreground mb-8 text-with-background">Detallado de Interiores</p> {/* Añadimos clase text-with-background */}
        </div>
      </div>

      {/* Contenedor principal del formulario */}
      <div className="flex-grow max-w-lg mx-auto lg:mx-0"> {/* mx-auto para centrar en móviles, mx-0 en lg */}
        <BookingForm />
        <Toaster /> {/* Add Toaster component here */}
      </div>

      {/* Contenedor de las otras dos imágenes y textos (Columna Derecha en lg) */}
      {/* Añadimos items-center para centrar en móviles y lg:ml-8 para espaciado en lg */}
      <div className="flex flex-col items-center lg:ml-8">
        {/* Grupo 3 de imágenes y texto */}
        {/* Centrar en móvil, margen inferior para separar grupos */}
        <div className="flex flex-col items-center mb-8">
          <img src="/encerado.png" alt="Protección con Encerado" className="w-48 h-48 object-cover rounded-lg shadow-lg mb-2 image-with-border" /> {/* Añadimos clase image-with-border */}
          <p className="text-center text-primary-foreground mb-8 text-with-background">Protección con Encerado</p> {/* Añadimos clase text-with-background */}
        </div>

        {/* Grupo 4 de imágenes y texto */}
        {/* Centrar en móvil */}
        <div className="flex flex-col items-center">
          <img src="/pulido.png" alt="Pulido y Restauración" className="w-48 h-48 object-cover rounded-lg shadow-lg mb-2 image-with-border" /> {/* Añadimos clase image-with-border */}
          <p className="text-center text-primary-foreground mb-8 text-with-background">Pulido y Restauración</p> {/* Añadimos clase text-with-background */}
        </div>
      </div>
    </main>
  );
}
