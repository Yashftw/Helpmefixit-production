import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthPanel from "@/components/AuthPanel";
import ProfileSetup from "@/components/ProfileSetup";
import MainApp from "@/components/MainApp";
import { getMe } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const Silk = lazy(() => import("@/components/Silk"));

type AppState = "hero" | "auth" | "profile" | "main";

const Index = () => {
  const [state, setState] = useState<AppState>("hero");
  const [token, setToken] = useState<string>(() => localStorage.getItem("helpmefixit_token") || "");

  if (state === "main") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 z-0 w-screen h-screen">
          <Suspense fallback={<div className="w-full h-full gradient-hero" />}>
            <div className="w-full h-full">
              <Silk speed={3} scale={1.5} color="#4a1d96" noiseIntensity={1.2} rotation={0.2} />
            </div>
          </Suspense>
          <div className="absolute inset-0 bg-background/55" />
        </div>
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <MainApp key="main" token={token} />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Silk 3D background */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <Suspense fallback={<div className="w-full h-full gradient-hero" />}>
          <div className="w-full h-full">
            <Silk speed={3} scale={1.5} color="#4a1d96" noiseIntensity={1.2} rotation={0.2} />
          </div>
        </Suspense>
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Back under logo */}
      <div className="fixed top-12 left-6 z-50">
        {state !== "hero" && (
          <button
            type="button"
            onClick={() => setState(state === "profile" ? "auth" : "hero")}
            className="inline-flex items-center gap-1 rounded-full glass-surface px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}
      </div>

      {/* Logo */}
      <motion.div
        className="fixed top-4 left-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-display text-xl font-bold tracking-tight">
          HELPME<span className="text-primary">FIXIT</span>
        </span>
      </motion.div>

      {/* Content area */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {state === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -120, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center px-4 max-w-3xl"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-block px-4 py-1.5 rounded-full glass-surface text-sm font-medium text-primary mb-8"
              >
                Location-based developer marketplace
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] font-display"
              >
                Fix Real Problems.{" "}
                <span className="bg-clip-text text-transparent gradient-primary inline-block">
                  Right Where You Are.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Connect with skilled developers nearby or find freelance gigs in your area.
                The immediacy of ride-sharing meets the power of a creative marketplace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setState("auth")}
                  className="px-10 py-4 rounded-full gradient-primary text-primary-foreground font-semibold text-lg shadow-glow hover:shadow-[0_0_60px_hsl(258,70%,58%,0.35)] transition-shadow duration-300"
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {state === "auth" && (
            <AuthPanel
              key="auth"
              onComplete={async ({ token: nextToken, mode }) => {
                localStorage.setItem("helpmefixit_token", nextToken);
                setToken(nextToken);
                if (mode === "login") {
                  setState("main");
                  return;
                }
                const me = await getMe(nextToken);
                setState(me.profile ? "main" : "profile");
              }}
            />
          )}

          {state === "profile" && (
            <ProfileSetup key="profile" token={token} onComplete={() => setState("main")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
