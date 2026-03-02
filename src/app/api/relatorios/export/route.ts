import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import { formatTime } from "@/lib/utils";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

function escapeCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  seated: "Sentado",
  complete: "Completo",
  no_show: "Não Compareceu",
  cancelled: "Cancelado",
};

const SOURCE_LABELS: Record<string, string> = {
  online: "Online",
  admin: "Admin",
  phone: "Telefone",
};

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Parâmetros start e end são obrigatórios" }, { status: 400 });
  }

  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id,
      date,
      reservation_time,
      party_size,
      status,
      source,
      no_show_charged,
      no_show_charge_amount,
      special_requests,
      customer:customers(first_name, last_name, email, phone),
      accommodation_type:accommodation_types(name),
      time_slot:time_slots(name)
    `)
    .eq("restaurant_id", restaurantId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true })
    .order("reservation_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type ExportRow = {
    id: string;
    date: string;
    reservation_time: string;
    party_size: number;
    status: string;
    source: string;
    no_show_charged: boolean;
    no_show_charge_amount: number | null;
    special_requests: string | null;
    customer: { first_name: string; last_name: string; email: string; phone: string | null } | null;
    accommodation_type: { name: string } | null;
    time_slot: { name: string } | null;
  };

  const rows = (data ?? []) as unknown as ExportRow[];

  const headers = [
    "ID",
    "Data",
    "Horário",
    "Nome",
    "Email",
    "Telefone",
    "Acomodação",
    "Turno",
    "Pessoas",
    "Status",
    "Fonte",
    "Solicitações",
    "No-Show Cobrado",
    "Valor No-Show (R$)",
  ];

  const csvRows = rows.map((r) => {
    const customer = r.customer;
    const accommodation = r.accommodation_type;
    const timeSlot = r.time_slot;
    return [
      escapeCsv(r.id),
      escapeCsv(formatDate(r.date)),
      escapeCsv(formatTime(r.reservation_time)),
      escapeCsv(customer ? `${customer.first_name} ${customer.last_name}` : ""),
      escapeCsv(customer?.email),
      escapeCsv(customer?.phone),
      escapeCsv(accommodation?.name),
      escapeCsv(timeSlot?.name),
      escapeCsv(String(r.party_size)),
      escapeCsv(STATUS_LABELS[r.status] ?? r.status),
      escapeCsv(SOURCE_LABELS[r.source] ?? r.source),
      escapeCsv(r.special_requests),
      escapeCsv(r.no_show_charged ? "Sim" : "Não"),
      escapeCsv(r.no_show_charged ? formatCurrency(r.no_show_charge_amount as number | null) : ""),
    ].join(",");
  });

  // UTF-8 BOM for Excel compatibility
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...csvRows].join("\n");

  const filename = `relatorio-${start}-${end}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
