import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EstablishmentSettingsContent } from "@/components/features/admin/settings/establishment-settings-content";
import { getEstablishmentProfile } from "./actions";

export default async function EstabelecimentoPage() {
  const { restaurant, photos } = await getEstablishmentProfile();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Estabelecimento</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Edite a página pública: descrição, fotos e localização
          </p>
        </div>
      </div>

      <EstablishmentSettingsContent restaurant={restaurant} photos={photos} />
    </div>
  );
}
