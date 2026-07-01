import {
  formatTimeSlotLine,
  type TimeSlotDisplay,
} from "@/lib/time-slots-display";

interface EstablishmentHoursProps {
  timeSlots: TimeSlotDisplay[];
}

export function EstablishmentHours({ timeSlots }: EstablishmentHoursProps) {
  return (
    <section id="como-funciona" className="scroll-mt-20 border-b border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Horários de reserva
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Escolha data e horário disponíveis ao reservar online. Grupos maiores
          podem precisar de confirmação da casa.
        </p>
        {timeSlots.length > 0 ? (
          <ul className="mt-8 space-y-3">
            {timeSlots.map((slot) => (
              <li
                key={slot.id}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm"
              >
                {formatTimeSlotLine(slot)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Consulte disponibilidade ao reservar.
          </p>
        )}
      </div>
    </section>
  );
}
