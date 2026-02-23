"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const emailToUse = identifier.includes("@")
      ? identifier
      : `${identifier.trim().toLowerCase()}@domo.local`;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (authError) {
      setError("Usuário ou senha inválidos.");
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 text-2xl font-bold tracking-tight">Domo</div>
          <CardTitle>Painel Administrativo</CardTitle>
          <CardDescription>
            Faça login para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Usuário ou email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="joao.silva"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
