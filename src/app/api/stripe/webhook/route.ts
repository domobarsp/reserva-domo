import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { createAdminClient } from "@/utils/supabase/admin";
import type Stripe from "stripe";

// Necessário para acessar o raw body na verificação de assinatura
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Assinatura ausente" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida";
    console.warn("[webhook] Assinatura inválida:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("no_show_charges")
        .update({ status: "succeeded" })
        .eq("stripe_payment_intent_id", pi.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const errorMessage =
        pi.last_payment_error?.message ?? "Pagamento recusado";
      await supabase
        .from("no_show_charges")
        .update({ status: "failed", error_message: errorMessage })
        .eq("stripe_payment_intent_id", pi.id);
      break;
    }

    default:
      // Ignorar eventos não tratados
      break;
  }

  return NextResponse.json({ received: true });
}
