import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { email, name } = body as { email?: string; name?: string };

  if (!email || !name) {
    return NextResponse.json(
      { error: "email e name são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // Buscar ou criar Stripe Customer por email
    const existing = await stripe.customers.search({
      query: `email:"${email}"`,
      limit: 1,
    });

    let customerId: string;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { source: "domo_reservation" },
      });
      customerId = customer.id;
    }

    // Criar SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: { email },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      stripeCustomerId: customerId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
