import { AppLayout } from "@/components/AppLayout";
import { LoginScreen } from "@/components/LoginScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSeedData } from "@/hooks/useSeedData";
import { Wallet } from "lucide-react";

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();

  // Seed data on first load (only runs after authenticated)
  useSeedData();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.2), oklch(0.72 0.20 145 / 0.15))",
              border: "1px solid oklch(0.78 0.18 200 / 0.3)",
            }}
          >
            <Wallet className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <Skeleton className="h-2 w-32 mx-auto rounded-full" />
          <p className="text-xs text-muted-foreground">Loading Expenzo…</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginScreen />;
  }

  return <AppLayout />;
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.13 0.005 240)",
            border: "1px solid oklch(0.22 0.005 240)",
            color: "oklch(0.96 0 0)",
          },
        }}
      />
    </>
  );
}
