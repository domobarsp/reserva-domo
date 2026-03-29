import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CardGuaranteeForm } from "@/components/features/admin/settings/card-guarantee-form";
import { NoShowFeeForm } from "@/components/features/admin/settings/no-show-fee-form";
import { getSettings } from "@/app/admin/(authenticated)/configuracoes/actions";

export default async function GarantiaNoShowPage() {
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
          <h1 className="text-2xl font-semibold">Garantia & No-Show</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure a garantia com cartão e a taxa de não comparecimento
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-zinc-800 mb-3">Garantia com Cartão</h2>
          <CardGuaranteeForm settings={settings} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-zinc-800 mb-3">Taxa de No-Show</h2>
          <NoShowFeeForm settings={settings} />
        </div>
      </div>
    </div>
  );
}
