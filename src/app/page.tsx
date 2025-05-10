import { BookingForm } from "@/components/booking-form";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster for notifications

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
        <BookingForm />
        <Toaster /> {/* Add Toaster component here */}
    </main>
  );
}
