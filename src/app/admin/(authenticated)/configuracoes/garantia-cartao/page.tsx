import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CardGuaranteeForm } from "@/components/features/admin/settings/card-guarantee-form";
import { getSettings } from "@/app/admin/(authenticated)/configuracoes/actions";

export default async function GarantiaCartaoPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Garantia com Cartão</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure quais dias exigem garantia com cartão de crédito.
          </p>
        </div>
      </div>

      <CardGuaranteeForm settings={settings} />
    </div>
  );
}
