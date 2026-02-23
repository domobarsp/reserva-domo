"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AdminRole } from "@/types";
import { createAdminUser } from "@/app/admin/(authenticated)/acessos/actions";

const schema = z
  .object({
    login: z
      .string()
      .min(3, { message: "Mínimo 3 caracteres" })
      .max(30, { message: "Máximo 30 caracteres" })
      .regex(/^[a-z0-9._-]+$/i, {
        message: "Apenas letras, números, pontos, hífens e underscores",
      }),
    displayName: z.string().min(2, { message: "Mínimo 2 caracteres" }),
    password: z.string().min(8, { message: "Mínimo 8 caracteres" }),
    confirmPassword: z.string(),
    role: z.nativeEnum(AdminRole),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const roleLabels: Record<AdminRole, string> = {
  [AdminRole.OWNER]: "Proprietário",
  [AdminRole.MANAGER]: "Gerente",
  [AdminRole.STAFF]: "Operador",
};

interface InviteAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdminDialog({
  open,
  onOpenChange,
}: InviteAdminDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      login: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      role: AdminRole.STAFF,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const result = await createAdminUser({
      login: values.login,
      password: values.password,
      displayName: values.displayName,
      role: values.role,
    });
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Usuário criado com sucesso!");
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login</FormLabel>
                  <FormControl>
                    <Input placeholder="joao.silva" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Usado para entrar no painel. Sem espaços.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de exibição</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AdminRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabels[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {isLoading ? "Criando..." : "Criar usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
