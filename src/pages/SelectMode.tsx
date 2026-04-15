import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wrench, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";

const modes = [
  {
    title: "Find Work",
    description: "Browse nearby gigs and start earning with your developer skills.",
    icon: Wrench,
    path: "/discover",
    gradient: "from-primary to-accent",
  },
  {
    title: "Post an Issue",
    description: "Describe your problem and connect with a local developer instantly.",
    icon: MapPin,
    path: "/discover",
    gradient: "from-accent to-primary",
  },
];

const SelectMode = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
          >
            What brings you here?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground text-lg mb-14"
          >
            Choose your path to get started.
          </motion.p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {modes.map((mode, i) => (
              <motion.button
                key={mode.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.15 }}
                whileHover={{ scale: 1.04, rotateY: 3, rotateX: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(mode.path)}
                className="group relative w-72 md:w-80 p-8 rounded-3xl glass-surface shadow-card text-left cursor-pointer overflow-hidden transition-shadow duration-300 hover:shadow-glow"
                style={{ perspective: 800 }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${mode.gradient}`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                    <mode.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{mode.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectMode;
