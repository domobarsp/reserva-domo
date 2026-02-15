"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import { StepReservationInfo } from "./step-reservation-info";
import { StepCustomerInfo } from "./step-customer-info";
import { StepCardPlaceholder } from "./step-card-placeholder";
import { StepConfirmation } from "./step-confirmation";

interface ReservationFormProps {
  initialBookingWindow: { min: string; max: string };
  closedDates: string[];
}

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

  // Fetch availability when date changes
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
        if (!cancelled) {
          setIsLoadingAvailability(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const needsCard = availabilityData?.requiresCard ?? false;

  // Calcular total de steps e labels dinamicamente
  const totalSteps = needsCard ? 4 : 3;
  const stepLabels = needsCard
    ? ["Reserva", "Dados", "Cartão", "Confirmação"]
    : ["Reserva", "Dados", "Confirmação"];

  // Mapear step lógico para componente
  const getConfirmationStep = () => (needsCard ? 4 : 3);
  const getCardStep = () => (needsCard ? 3 : null);

  const validateCurrentStep = useCallback(
    async (): Promise<boolean> => {
      if (currentStep === 1) {
        const values = form.getValues();
        const result = reservationInfoSchema.safeParse(values);
        if (!result.success) {
          // Trigger validation on step 1 fields
          const isValid = await form.trigger([
            "date",
            "time_slot_id",
            "accommodation_type_id",
            "party_size",
          ]);
          return isValid;
        }
        return true;
      }
      if (currentStep === 2) {
        const values = form.getValues();
        const result = customerInfoSchema.safeParse(values);
        if (!result.success) {
          const isValid = await form.trigger([
            "first_name",
            "last_name",
            "email",
            "phone",
          ]);
          return isValid;
        }
        return true;
      }
      // Card step (3 when needsCard) and confirmation don't need validation
      return true;
    },
    [currentStep, form]
  );

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [validateCurrentStep, totalSteps]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const values = form.getValues();
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
  }, [form, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Fazer Reserva</CardTitle>
          <StepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            labels={stepLabels}
          />
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1 — Informações da Reserva */}
              {currentStep === 1 && (
                <StepReservationInfo
                  bookingWindow={initialBookingWindow}
                  closedDates={closedDates}
                  availabilityData={availabilityData}
                  isLoadingAvailability={isLoadingAvailability}
                />
              )}

              {/* Step 2 — Dados do Cliente */}
              {currentStep === 2 && <StepCustomerInfo />}

              {/* Step 3 — Cartão (condicional) */}
              {currentStep === getCardStep() && <StepCardPlaceholder />}

              {/* Step final — Confirmação */}
              {currentStep === getConfirmationStep() && (
                <StepConfirmation
                  needsCard={needsCard}
                  availabilityData={availabilityData}
                />
              )}

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < getConfirmationStep() ? (
                  <Button type="button" onClick={handleNext}>
                    Avançar
                  </Button>
                ) : currentStep === getConfirmationStep() ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
