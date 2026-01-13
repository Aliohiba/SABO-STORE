import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "@/lib/i18n"; // Import i18n config

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = (trpc as any).createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async headers() {
        // This function is called with EACH request, allowing dynamic token reading
        const headers: Record<string, string> = {};

        const adminToken = localStorage.getItem("adminToken");
        if (adminToken) {
          headers["x-admin-token"] = adminToken;
        }

        const customerToken = localStorage.getItem("customerToken");
        // Only send customer token if NOT in admin area
        // This prevents the customer token from overriding the admin cookie session in sdk.authenticateRequest
        if (customerToken && !window.location.pathname.startsWith("/admin")) {
          headers["Authorization"] = `Bearer ${customerToken}`;
        }

        return headers;
      },
      fetch(input: RequestInfo | URL, init?: RequestInit) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

console.log("[App] Starting application...");
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("[App] Root element not found!");
  throw new Error("Root element not found. Make sure there is a <div id='root'></div> in the HTML.");
}
console.log("[App] Root element found, rendering React app...");

const TrpcProvider = (trpc as any).Provider;

createRoot(rootElement).render(
  <TrpcProvider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </TrpcProvider>
);
