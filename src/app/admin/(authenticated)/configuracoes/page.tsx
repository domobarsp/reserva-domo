import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Armchair,
  Users,
  CreditCard,
  AlertTriangle,
  CalendarOff,
} from "lucide-react";

const settingsPages = [
  {
    href: "/admin/configuracoes/horarios",
    title: "Horários",
    description: "Horários de reserva disponíveis por turno",
    icon: Clock,
  },
  {
    href: "/admin/configuracoes/acomodacoes",
    title: "Acomodações",
    description: "Tipos de acomodação e tamanhos min/max",
    icon: Armchair,
  },
  {
    href: "/admin/configuracoes/capacidade",
    title: "Capacidade",
    description: "Máximo de pessoas por acomodação e turno",
    icon: Users,
  },
  {
    href: "/admin/configuracoes/garantia-cartao",
    title: "Garantia com Cartão",
    description: "Dias da semana que exigem cartão de crédito",
    icon: CreditCard,
  },
  {
    href: "/admin/configuracoes/no-show",
    title: "Taxa de No-Show",
    description: "Valor da taxa de não comparecimento",
    icon: AlertTriangle,
  },
  {
    href: "/admin/configuracoes/excecoes",
    title: "Exceções",
    description: "Fechamentos e ajustes de capacidade por data",
    icon: CalendarOff,
  },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Configurações</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie as configurações do restaurante.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <page.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{page.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {page.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
