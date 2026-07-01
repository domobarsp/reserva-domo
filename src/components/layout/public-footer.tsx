import { createAdminClient } from "@/utils/supabase/admin";
import { formatTimeShort, formatTimeSlotDays } from "@/lib/time-slots-display";
import type { Restaurant, TimeSlot } from "@/types";

export async function PublicFooter() {
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

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Col 1 — Logo + tagline */}
          <div className="space-y-2">
            <p className="text-lg font-semibold tracking-tight text-primary">
              {restaurant?.name ?? "Dōmo"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bar & restaurante. Terça a sábado, 19h–24h.
            </p>
          </div>

          {/* Col 2 — Horários */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Horários</p>
            {timeSlots.length > 0 ? (
              <ul className="space-y-1.5">
                {timeSlots.map((slot) => (
                  <li key={slot.id} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {slot.name}
                    </span>{" "}
                    — {formatTimeShort(slot.start_time)} às {formatTimeShort(slot.end_time)}
                    {slot.days_of_week?.length > 0 && (
                      <span className="ml-1 text-xs">
                        ({formatTimeSlotDays(slot.days_of_week)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Consulte disponibilidade ao reservar.
              </p>
            )}
          </div>

          {/* Col 3 — Contato */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Contato</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {restaurant?.address && <li>{restaurant.address}</li>}
              {restaurant?.phone && (
                <li>
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {restaurant.phone}
                  </a>
                </li>
              )}
              {restaurant?.email && (
                <li>
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {restaurant.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {restaurant?.name ?? "Dōmo"}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
