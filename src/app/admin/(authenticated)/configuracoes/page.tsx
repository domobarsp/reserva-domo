import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Armchair,
  Users,
  ShieldCheck,
  CalendarOff,
} from "lucide-react";

const settingsPages = [
  {
    href: "/admin/configuracoes/horarios",
    title: "Horários",
    description: "Gerencie os períodos de funcionamento do restaurante",
    icon: Clock,
  },
  {
    href: "/admin/configuracoes/acomodacoes",
    title: "Acomodações",
    description: "Configure os tipos de acomodação disponíveis",
    icon: Armchair,
  },
  {
    href: "/admin/configuracoes/capacidade",
    title: "Capacidade",
    description: "Defina a capacidade máxima por acomodação e horário",
    icon: Users,
  },
  {
    href: "/admin/configuracoes/garantia-noshow",
    title: "Garantia & No-Show",
    description: "Garantia com cartão e taxa de não comparecimento",
    icon: ShieldCheck,
  },
  {
    href: "/admin/configuracoes/excecoes",
    title: "Exceções",
    description: "Crie regras especiais para datas específicas",
    icon: CalendarOff,
  },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Configurações</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Gerencie as configurações do restaurante.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="transition-colors hover:border-zinc-300">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <page.icon className="h-5 w-5 text-zinc-600" />
                </div>
                <CardTitle className="text-base">{page.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500">
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
