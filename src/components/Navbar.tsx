import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="container flex items-center justify-between glass-surface rounded-2xl px-6 py-3">
        <button onClick={() => navigate("/")} className="font-display text-xl font-bold tracking-tight">
          HELPME<span className="text-primary">FIXIT</span>
        </button>
          <button
            onClick={() => navigate("/select-mode")}
            className="px-5 py-2 rounded-full gradient-primary text-primary-foreground font-medium text-sm hover:scale-105 transition-transform"
          >
            Get Started
          </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
