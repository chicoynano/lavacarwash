// src/app/confirmacion.tsx

"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmacionPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4">
			<CheckCircle className="text-green-500 mb-4" size={64} />
			<h1 className="text-3xl font-bold text-center text-primary mb-2">
				¡Gracias por tu pago!
			</h1>
			<p className="text-center text-muted-foreground mb-6">
				Tu reserva ha sido confirmada correctamente. Te hemos enviado un correo con todos los detalles.
			</p>
			<Link href="/">
				<Button variant="default" size="lg">
					Volver al inicio
				</Button>
			</Link>
		</div>
	);
}
