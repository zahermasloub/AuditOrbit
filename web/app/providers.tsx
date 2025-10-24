"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Prevent stale client instances across HMR boundaries
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
