import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroVisual from "@/assets/hero-visual.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-[120px] float-delayed" />

      <div className="container relative z-10 flex flex-col items-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-surface text-sm font-medium text-primary mb-8">
            Location-based developer marketplace
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl leading-[1.05]"
        >
          Tech BROKEN?!.{" "}
          <span className="bg-clip-text text-transparent gradient-primary inline-block">
            Get a local developer here in under an hour.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Broken laptop. Website down. App not working. Whatever your tech problem is — stop Googling and get a real developer who can actually fix it. No bullshit. No waiting days. Just local devs ready to show up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-10 flex gap-4"
        >
          <button
            onClick={() => navigate("/select-mode")}
            className="px-8 py-4 rounded-full gradient-primary text-primary-foreground font-semibold text-lg shadow-glow hover:scale-105 transition-transform duration-300"
          >
            Get Started
          </button>
          <button className="px-8 py-4 rounded-full glass-surface font-semibold text-lg hover:scale-105 transition-transform duration-300">
            Learn More
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="mt-16 relative"
        >
          <div className="absolute inset-0 rounded-3xl shadow-glow" />
          <img
            src={heroVisual}
            alt="HELPMEFIXIT platform showing a glowing 3D map with location pins"
            width={640}
            height={400}
            className="rounded-3xl shadow-card max-w-2xl w-full"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
