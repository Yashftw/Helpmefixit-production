import { motion } from "framer-motion";
import { X, MapPin, Star, IndianRupee, Clock, ArrowRight } from "lucide-react";

interface Gig {
  id: number;
  title: string;
  price: number;
  distanceKm: number;
  rating: number;
  urgency: string;
  dev: string;
  category: string;
  description: string;
}

interface GigDetailProps {
  gig: Gig;
  onClose: () => void;
}

const GigDetail = ({ gig, onClose }: GigDetailProps) => {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
      >
        <div className="max-w-lg mx-auto glass-surface rounded-3xl shadow-card p-6 border border-border/30">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-display">{gig.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">Posted by {gig.dev}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {gig.description}
          </p>

          <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <IndianRupee className="w-4 h-4 text-primary" />
              {gig.price}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {gig.distanceKm} km
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Star className="w-4 h-4 text-primary" />
              {gig.rating}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {gig.urgency}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 hover:shadow-[0_0_50px_hsl(258,70%,58%,0.3)] transition-shadow duration-300"
          >
            Accept This Job
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default GigDetail;
