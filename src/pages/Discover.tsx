import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { MapPin, Star, Clock, DollarSign, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { acceptGigAction } from "@/lib/api";
import { toast } from "sonner";

interface Gig {
  id: number;
  title: string;
  price: string;
  distance: string;
  rating: number;
  urgency: string;
  description: string;
  dev: string;
  x: number;
  y: number;
}

const gigs: Gig[] = [
  { id: 1, title: "Fix React auth bug", price: "₹6500", distance: "0.3 mi", rating: 4.9, urgency: "Urgent", description: "Login flow breaks after OAuth redirect. Need someone who knows Supabase auth well.", dev: "Sarah K.", x: 30, y: 35 },
  { id: 2, title: "WordPress site down", price: "₹9500", distance: "0.7 mi", rating: 4.7, urgency: "ASAP", description: "E-commerce site throwing 500 errors after plugin update. Revenue loss per hour.", dev: "Mike R.", x: 55, y: 25 },
  { id: 3, title: "Mobile app crash on iOS", price: "₹12000", distance: "1.2 mi", rating: 4.8, urgency: "Today", description: "React Native app crashes on launch for iOS 17 users. Need immediate fix.", dev: "Alex T.", x: 70, y: 55 },
  { id: 4, title: "API integration help", price: "₹4800", distance: "0.5 mi", rating: 4.6, urgency: "Flexible", description: "Need help integrating Stripe webhook handling into existing Node.js backend.", dev: "Jordan L.", x: 25, y: 65 },
  { id: 5, title: "Database optimization", price: "₹16000", distance: "1.5 mi", rating: 5.0, urgency: "This week", description: "PostgreSQL queries taking 10s+. Need indexing strategy and query optimization.", dev: "Chris P.", x: 60, y: 70 },
];

const Discover = () => {
  const [selected, setSelected] = useState<Gig | null>(null);

  // Connect the Router for navigation
  const navigate = useNavigate();

  // The logic that gets triggered when you click the button 
  const handleAcceptJob = async (gigId: number) => {
    try {
      // 1. Alert immediately to prove it clicks!
      alert(`Button Clicked! Checking login for Gig #${gigId}...`);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("You are NOT logged in. Please login first to accept jobs!");
        return;
      }

      alert("Logged in! Setting up direct connection...");

      const connection = await acceptGigAction(session.access_token, gigId);

      alert("Gig accepted! Transferring you to chat...");

      navigate(`/connection/${connection.id}`);

    } catch (error: any) {
      console.error(error);
      alert(`ERROR: ${error.message || "Failed to connect to this job."}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 relative pt-20 bg-secondary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary/50">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        {gigs.map((gig) => (
          <motion.button
            key={gig.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: gig.id * 0.1, type: "spring" }}
            onClick={() => setSelected(gig)}
            className="absolute z-10 group"
            style={{ left: `${gig.x}%`, top: `${gig.y}%` }}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="relative w-10 h-10 rounded-full gradient-primary shadow-glow flex items-center justify-center hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="glass-surface rounded-xl px-3 py-2 shadow-card whitespace-nowrap">
                  <p className="text-xs font-semibold">{gig.title}</p>
                  <p className="text-xs text-muted-foreground">{gig.price} · {gig.distance}</p>
                </div>
              </div>
            </div>
          </motion.button>
        ))}

        <div className="absolute top-24 right-4 w-80 space-y-3 z-20 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          {gigs.map((gig, i) => (
            <motion.button
              key={gig.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              onClick={() => setSelected(gig)}
              className={`w-full text-left p-4 rounded-2xl glass-surface shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] ${selected?.id === gig.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{gig.title}</h3>
                <span className="text-xs font-bold text-primary">{gig.price}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gig.distance}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{gig.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{gig.urgency}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-30 p-4"
            >
              <div className="max-w-lg mx-auto glass-surface rounded-3xl shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selected.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Posted by {selected.dev}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{selected.description}</p>
                <div className="flex items-center gap-4 mb-6 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="w-4 h-4 text-primary" />{selected.price}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{selected.distance}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Star className="w-4 h-4 text-primary" />{selected.rating}</span>
                </div>
                {/* 
                   THE FIX IS HERE: The onClick attribute now successfully binds
                   the Click Event to the actual `handleAcceptJob` logic! 
                */}
                <button
                  onClick={() => handleAcceptJob(selected.id)}
                  className="w-full py-3.5 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform"
                >
                  Accept This Job
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Discover;