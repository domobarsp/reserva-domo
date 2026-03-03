import Link from "next/link";
import { CalendarDays, User, CheckCircle2, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Restaurant, TimeSlot } from "@/types";

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default async function HomePage() {
  const supabase = createAdminClient();

  const [{ data: restaurantData }, { data: timeSlotsData }] = await Promise.all(
    [
      supabase
        .from("restaurants")
        .select("name, address, phone, email")
        .single(),
      supabase
        .from("time_slots")
        .select("id, name, start_time, end_time, days_of_week")
        .eq("is_active", true)
        .order("start_time"),
    ]
  );

  const restaurant = restaurantData as Pick<
    Restaurant,
    "name" | "address" | "phone" | "email"
  > | null;
  const timeSlots = (timeSlotsData ?? []) as Pick<
    TimeSlot,
    "id" | "name" | "start_time" | "end_time" | "days_of_week"
  >[];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Reservas Online
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Reserve sua mesa com facilidade
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Escolha a data, horário e acomodação ideais. Confirmação imediata,
            sem complicações.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-xl px-8 py-3.5 h-auto text-sm font-medium">
              <Link href="/reserva">Fazer uma Reserva</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-4 bg-card border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Simples e rápido
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Como funciona
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">Escolha a data e horário</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Selecione o dia e o turno disponível que melhor se encaixam na sua agenda.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">Informe seus dados</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Preencha nome, email e telefone. Em casos especiais, informe um cartão de garantia.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">Confirmação imediata</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receba a confirmação por email com todos os detalhes e link de cancelamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Informações do restaurante */}
      <section id="informacoes" className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Venha nos visitar
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Informações
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Contato &amp; Localização
              </h3>
              <ul className="space-y-3">
                {restaurant?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{restaurant.address}</span>
                  </li>
                )}
                {restaurant?.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {restaurant.phone}
                    </a>
                  </li>
                )}
                {restaurant?.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    <a
                      href={`mailto:${restaurant.email}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {restaurant.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Horários */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Horários de Funcionamento
              </h3>
              {timeSlots.length > 0 ? (
                <ul className="space-y-3">
                  {timeSlots.map((slot) => (
                    <li key={slot.id} className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{slot.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(slot.start_time)} às {formatTime(slot.end_time)}
                          {slot.days_of_week?.length > 0 && (
                            <span className="ml-1">
                              ({slot.days_of_week.map((d: number) => dayNames[d]).join(", ")})
                            </span>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Consulte a disponibilidade ao fazer sua reserva.
                </p>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="rounded-xl px-8 py-3.5 h-auto text-sm font-medium">
              <Link href="/reserva">Reservar uma mesa</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
