"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-zinc-900">
          Algo deu errado
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            Página inicial
          </Button>
        </div>
      </div>
    </div>
  );
}
