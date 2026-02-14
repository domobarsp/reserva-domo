"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
