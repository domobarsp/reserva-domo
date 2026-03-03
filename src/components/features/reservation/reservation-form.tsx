"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  fullReservationSchema,
  type FullReservationData,
  reservationInfoSchema,
  customerInfoSchema,
} from "@/lib/validations/reservation";
import type { AvailabilityResponse } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepReservationInfo } from "./step-reservation-info";
import { StepCustomerInfo } from "./step-customer-info";
import { StepCardStripe } from "./step-card-stripe";
import { StepConfirmation } from "./step-confirmation";

interface ReservationFormProps {
  initialBookingWindow: { min: string; max: string };
  closedDates: string[];
}

const STEP_INFO: Record<string, { title: string; description: string }> = {
  Reserva: {
    title: "Escolha a data e horário",
    description: "Selecione quando você gostaria de vir",
  },
  Dados: {
    title: "Seus dados",
    description: "Como podemos entrar em contato com você",
  },
  Cartão: {
    title: "Garantia com cartão",
    description: "Necessário para reservas nesta data",
  },
  Confirmação: {
    title: "Revise sua reserva",
    description: "Confirme os detalhes antes de finalizar",
  },
};

export function ReservationForm({
  initialBookingWindow,
  closedDates,
}: ReservationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityResponse | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Stripe state
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [isConfirmingCard, setIsConfirmingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const cardTriggerRef = useRef<(() => Promise<void>) | null>(null);

  const form = useForm<FullReservationData>({
    resolver: zodResolver(fullReservationSchema),
    defaultValues: {
      date: "",
      time_slot_id: "",
      accommodation_type_id: "",
      party_size: 0,
      special_requests: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      preferred_locale: "pt",
    },
    mode: "onTouched",
  });

  const selectedDate = form.watch("date");

  useEffect(() => {
    if (!selectedDate) {
      setAvailabilityData(null);
      return;
    }
    let cancelled = false;
    setIsLoadingAvailability(true);
    fetch(`/api/availability?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data: AvailabilityResponse) => {
        if (!cancelled) {
          setAvailabilityData(data);
          setIsLoadingAvailability(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const needsCard = availabilityData?.requiresCard ?? false;

  const totalSteps = needsCard ? 4 : 3;
  const stepLabels = needsCard
    ? ["Reserva", "Dados", "Cartão", "Confirmação"]
    : ["Reserva", "Dados", "Confirmação"];

  const getConfirmationStep = () => (needsCard ? 4 : 3);
  const getCardStep = () => (needsCard ? 3 : null);

  const currentLabel = stepLabels[currentStep - 1];
  const currentStepInfo = STEP_INFO[currentLabel] ?? {
    title: currentLabel,
    description: "",
  };

  const validateCurrentStep = useCallback(
    async (): Promise<boolean> => {
      if (currentStep === 1) {
        const result = reservationInfoSchema.safeParse(form.getValues());
        if (!result.success) {
          return form.trigger([
            "date",
            "time_slot_id",
            "accommodation_type_id",
            "party_size",
          ]);
        }
        return true;
      }
      if (currentStep === 2) {
        const result = customerInfoSchema.safeParse(form.getValues());
        if (!result.success) {
          return form.trigger(["first_name", "last_name", "email", "phone"]);
        }
        return true;
      }
      return true;
    },
    [currentStep, form]
  );

  const handleNext = useCallback(async () => {
    if (currentStep === getCardStep()) {
      if (!cardTriggerRef.current) return;
      setCardError(null);
      setIsConfirmingCard(true);
      await cardTriggerRef.current();
      setIsConfirmingCard(false);
      return;
    }
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [currentStep, validateCurrentStep, totalSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleCardSuccess = useCallback(
    (custId: string, pmId: string) => {
      setStripeCustomerId(custId);
      setPaymentMethodId(pmId);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    },
    [totalSteps]
  );

  const handleCardError = useCallback((message: string) => {
    setCardError(message);
  }, []);

  const handleSubmit = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const values = form.getValues();
      const body: Record<string, unknown> = { ...values };

      if (needsCard && stripeCustomerId && paymentMethodId) {
        body.stripe_customer_id = stripeCustomerId;
        body.stripe_payment_method_id = paymentMethodId;
      }

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro ao criar reserva:", errorData.error);
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      const params = new URLSearchParams({
        id: data.id,
        token: data.cancellation_token,
        date: data.date,
        time_slot_id: data.time_slot_id,
        accommodation_type_id: data.accommodation_type_id,
        party_size: String(data.party_size),
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });

      router.push(`/reserva/sucesso?${params.toString()}`);
    } catch {
      setIsSubmitting(false);
    }
  }, [form, router, needsCard, stripeCustomerId, paymentMethodId]);

  const values = form.getValues();
  const customerName = `${values.first_name} ${values.last_name}`.trim();

  return (
    <div className="bg-background min-h-full px-4 py-12">
      {/* Logo placeholder */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <span className="text-2xl font-bold tracking-tight">D</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Restaurante Domo
        </p>
      </div>

      <Card className="mx-auto max-w-xl overflow-hidden rounded-2xl shadow-md">
        {/* Progress bar — flush ao topo do card */}
        <div className="flex w-full h-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 transition-colors duration-300",
                i + 1 <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <CardHeader className="pt-6 pb-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {currentStepInfo.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {currentStepInfo.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && (
                <StepReservationInfo
                  bookingWindow={initialBookingWindow}
                  closedDates={closedDates}
                  availabilityData={availabilityData}
                  isLoadingAvailability={isLoadingAvailability}
                />
              )}

              {currentStep === 2 && <StepCustomerInfo />}

              {currentStep === getCardStep() && (
                <div>
                  <StepCardStripe
                    email={values.email}
                    name={customerName}
                    onSuccess={handleCardSuccess}
                    onError={handleCardError}
                    triggerRef={cardTriggerRef}
                  />
                  {cardError && (
                    <p className="mt-3 text-sm text-destructive">{cardError}</p>
                  )}
                </div>
              )}

              {currentStep === getConfirmationStep() && (
                <StepConfirmation
                  needsCard={needsCard}
                  availabilityData={availabilityData}
                />
              )}

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between gap-3">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isSubmitting || isConfirmingCard}
                    className="h-12 rounded-xl px-8 font-medium text-muted-foreground"
                  >
                    Voltar
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < getConfirmationStep() ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isConfirmingCard}
                    className="h-12 rounded-xl px-8 font-medium"
                  >
                    {isConfirmingCard && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isConfirmingCard ? "Validando cartão..." : "Avançar"}
                  </Button>
                ) : currentStep === getConfirmationStep() ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl px-8 font-medium"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Confirmando..." : "Confirmar Reserva"}
                  </Button>
                ) : null}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
