// src/app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { bookingId, serviceId } = body;

		const servicesMap: Record<string, { name: string; price: number }> = {
			"1": { name: "Lavado básico", price: 50 },
			"2": { name: "Lavado completo", price: 100 },
			"3": { name: "Lavado premium", price: 350 },
		};

		const selectedService = servicesMap[serviceId];

		if (!selectedService) {
			return NextResponse.json({ error: "Servicio no encontrado" }, { status: 400 });
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: [
				{
					price_data: {
						currency: "eur",
						product_data: { name: selectedService.name },
						unit_amount: selectedService.price,
					},
					quantity: 1,
				},
			],
			success_url: `${process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL}?bookingId=${bookingId}`,
			cancel_url: `${process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL}`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("❌ Error al crear la sesión de Stripe:", error);
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
	}
}
