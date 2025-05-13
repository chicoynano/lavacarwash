import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});


export async function createCheckoutSession(bookingId: string, amount: number) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: {
          name: "Reserva LavaCarWash",
        },
        unit_amount: amount * 100,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL}?bookingId=${bookingId}`,
    cancel_url: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL,
  });

  return session.url;
}


