import { ExcecoesContent } from "@/components/features/admin/settings/excecoes-content";
import { getExceptionData } from "./actions";

export default async function ExcecoesPage() {
  const data = await getExceptionData();

  return (
    <ExcecoesContent
      initialExceptionDates={data.exceptionDates}
      accommodationTypes={data.accommodationTypes}
    />
  );
}
