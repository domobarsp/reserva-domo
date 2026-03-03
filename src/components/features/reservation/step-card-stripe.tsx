"use client";

import { useEffect, useState, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ShieldAlert, Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function formatFee(amountInCents: number): string {
  return `R$ ${(amountInCents / 100).toFixed(2).replace(".", ",")}`;
}

// ─── Inner form (precisa estar dentro de <Elements>) ─────────────────────────

interface CardFormProps {
  stripeCustomerId: string;
  onSuccess: (stripeCustomerId: string, paymentMethodId: string) => void;
  onError: (message: string) => void;
  triggerRef: React.MutableRefObject<(() => Promise<void>) | null>;
}

function CardForm({
  stripeCustomerId,
  onSuccess,
  onError,
  triggerRef,
}: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    triggerRef.current = async () => {
      if (!stripe || !elements) return;

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (error) {
        onError(error.message ?? "Erro ao validar cartão");
        return;
      }

      if (setupIntent?.status === "succeeded") {
        const paymentMethodId =
          typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method?.id ?? "";

        onSuccess(stripeCustomerId, paymentMethodId);
      }
    };
  }, [stripe, elements, stripeCustomerId, onSuccess, onError, triggerRef]);

  return <PaymentElement />;
}

// ─── Public component ────────────────────────────────────────────────────────

interface StepCardStripeProps {
  email: string;
  name: string;
  noShowFee?: number; // em centavos
  onSuccess: (stripeCustomerId: string, paymentMethodId: string) => void;
  onError: (message: string) => void;
  triggerRef: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function StepCardStripe({
  email,
  name,
  noShowFee,
  onSuccess,
  onError,
  triggerRef,
}: StepCardStripeProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/stripe/setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLoadError(data.error);
        } else {
          setClientSecret(data.clientSecret);
          setStripeCustomerId(data.stripeCustomerId);
        }
      })
      .catch(() => setLoadError("Não foi possível inicializar o pagamento."));
  }, [email, name]);

  return (
    <div className="space-y-5">
      {/* Aviso de garantia — tom parchment/dourado */}
      <div className="flex items-start gap-3 rounded-xl border border-[#C9A96E] bg-[#FAF4E8] p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#8B6914]" />
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-[#4A3500]">
            Garantia com cartão de crédito
          </p>
          <p className="text-sm text-[#5C4510] leading-relaxed">
            Para confirmar sua reserva nesta data, solicitamos um cartão como
            garantia.{" "}
            <strong>Nenhuma cobrança será feita agora.</strong>
          </p>
          <p className="text-sm text-[#5C4510]">
            Em caso de não comparecimento, será cobrado{" "}
            <strong>
              {noShowFee != null
                ? formatFee(noShowFee)
                : "conforme política do estabelecimento"}
            </strong>
            .
          </p>
        </div>
      </div>

      {/* Stripe Elements */}
      <div className="rounded-xl border border-border bg-white p-6">
        {loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : !clientSecret ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando formulário de cartão...
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              locale: "pt-BR",
              appearance: { theme: "stripe" },
            }}
          >
            <CardForm
              stripeCustomerId={stripeCustomerId}
              onSuccess={onSuccess}
              onError={onError}
              triggerRef={triggerRef}
            />
          </Elements>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Seus dados são processados com segurança. A cobrança só ocorrerá em
        caso de não comparecimento.
      </p>
    </div>
  );
}
