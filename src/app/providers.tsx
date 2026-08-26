"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

/**
 * Wires React Aria's client-side routing into the Next.js App Router, so RAC
 * <Link>s and navigation-triggering components (Menu links, etc.) use Next's
 * router — with accessibility and focus management intact.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}
