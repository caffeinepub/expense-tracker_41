import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Shield, TrendingUp, Wallet, Zap } from "lucide-react";
import { motion } from "motion/react";

export function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    { icon: TrendingUp, label: "Track income & expenses" },
    { icon: Shield, label: "Secure on-chain storage" },
    { icon: Zap, label: "Real-time analytics" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.78 0.18 200 / 0.08), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.20 145 / 0.05), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.2), oklch(0.72 0.20 145 / 0.15))",
              border: "1px solid oklch(0.78 0.18 200 / 0.3)",
              boxShadow: "0 0 24px oklch(0.78 0.18 200 / 0.15)",
            }}
          >
            <Wallet className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
            <span className="gradient-text">Expenzo</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Your intelligent expense tracker
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
            boxShadow:
              "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="font-display text-xl font-semibold mb-2">
            Connect to get started
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in securely with Internet Identity to access your personal
            finance dashboard.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "oklch(var(--accent))",
                    border: "1px solid oklch(var(--border))",
                  }}
                >
                  <Icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <span className="text-sm text-foreground/80">{label}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-11 font-semibold text-base"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.18 200), oklch(0.72 0.20 145))",
              color: "oklch(0.06 0 0)",
              boxShadow: "0 0 20px oklch(0.78 0.18 200 / 0.3)",
            }}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Loading"
                  role="img"
                >
                  <title>Loading</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connecting…
              </span>
            ) : (
              "Connect with Internet Identity"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Your data is encrypted and stored on the Internet Computer
            blockchain.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
