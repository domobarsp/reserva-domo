"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Erro inesperado</h2>
          <p style={{ color: "#71717a", marginTop: "0.5rem" }}>
            Ocorreu um erro crítico. Tente recarregar a página.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "1px solid #d4d4d8", cursor: "pointer", background: "white" }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
