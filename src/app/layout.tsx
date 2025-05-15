import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter for a clean look
import Link from 'next/link';
import { User2Icon } from 'lucide-react';
import './globals.css';
import { cn } from '@/lib/utils';
import Footer from "@/components/Footer";
const user = { isAdmin: true }; // You should replace this with actual user data

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'LavaCarWash - Reserva de Lavado de Coches', // Changed title to Spanish
  description: 'Reserva tu próximo lavado de coche fácilmente con LavaCarWash.', // Changed description to Spanish
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>{/* Changed lang to es */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <div className="flex flex-col min-h-screen">
          {/* Basic Header */}
          <header
            className="sticky top-0 z-50 w-full border-b"
            style={{ backgroundColor: "rgb(212, 241, 249)" }}
          >
            <div className="container flex items-center justify-between md:h-20">
              <div className="flex items-center gap-2">
                <Link href="./">
                  <img title="Inicio" src="/logo.svg" alt="Logo" className="h-8" /></Link>
                <span className="font-bold text-l">Especialistas en lavado de vehículos a domicilio</span>
              </div>
              {user.isAdmin && (
                <Link href="/panel" className="mr-4 font-bold flex items-center gap-2">
                  <User2Icon className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}


            </div>
          </header>





          {/* Main Content Area */}
          <main className="flex-grow">
            {children}
          </main>
          <main>
            {/* contenido principal */}
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
