import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Wrench, AlertCircle, Upload } from "lucide-react";
import { saveProfile } from "@/lib/api";

interface ProfileSetupProps {
  token: string;
  onComplete: () => void;
}

const steps = [
  { key: "occupation", label: "What do you do?" },
  { key: "goal", label: "What brings you here?", type: "choice" },
  { key: "profileImage", label: "Add your profile picture", type: "file" },
];

const ProfileSetup = ({ token, onComplete }: ProfileSetupProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ occupation: "", goal: "", profileImage: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async () => {
    setError("");
    const value = data[current.key as keyof typeof data];
    if (!String(value).trim()) {
      setError("This field is required.");
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    const normalizedOccupation = data.occupation.trim();
    const normalizedGoal = data.goal.trim();
    const normalizedProfileImage = data.profileImage.trim();
    if (!normalizedOccupation || !normalizedGoal || !normalizedProfileImage) {
      setError("Please complete all fields with valid values.");
      return;
    }

    setLoading(true);
    try {
      await saveProfile(token, {
        occupation: normalizedOccupation,
        goal: normalizedGoal,
        profileImage: normalizedProfileImage,
      });
      onComplete();
    } catch (err) {
      console.warn("Profile save skipped for now:", err);
      // Do not block access if profile save fails.
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Please upload an image under 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = typeof reader.result === "string" ? reader.result : "";
      if (!nextImage) {
        setError("Unable to read image file.");
        return;
      }
      setData((prev) => ({ ...prev, profileImage: nextImage }));
      setError("");
    };
    reader.onerror = () => setError("Unable to read image file.");
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, filter: "blur(8px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -80, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto px-4"
    >
      <div className="glass-surface rounded-3xl p-8 shadow-card">
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-secondary/50 mb-8 overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="text-center mb-8">
          <motion.p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Step {step + 1} of {steps.length}
          </motion.p>
          <motion.h2
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold tracking-tight font-display"
          >
            {current.label}
          </motion.h2>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {current.type === "choice" ? (
            <div className="space-y-3">
              {[
                { value: "find-work", label: "Find Work", icon: Wrench, desc: "Browse gigs near me" },
                { value: "post-issue", label: "Post an Issue", icon: AlertCircle, desc: "Get help from a developer" },
              ].map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setData({ ...data, goal: opt.value })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${
                    data.goal === opt.value
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border/50 bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.goal === opt.value ? "gradient-primary" : "bg-secondary"
                  }`}>
                    <opt.icon className={`w-4 h-4 ${data.goal === opt.value ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : current.type === "file" ? (
            <div className="space-y-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleProfileImageSelect(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                <div className="w-full rounded-2xl border border-border/50 bg-secondary/30 px-4 py-5 text-sm text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer flex items-center gap-3">
                  <Upload className="w-4 h-4" />
                  Upload profile image (PNG, JPG, WEBP)
                </div>
              </label>
              {data.profileImage && (
                <div className="flex justify-center">
                  <img
                    src={data.profileImage}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full object-cover border border-border/60"
                  />
                </div>
              )}
            </div>
          ) : (
            <input
              type={current.inputType || "text"}
              value={data[current.key as keyof typeof data]}
              onChange={(e) => setData({ ...data, [current.key]: e.target.value })}
              className="w-full px-5 py-3.5 rounded-2xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 placeholder:text-muted-foreground"
              autoFocus
            />
          )}
        </motion.div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={loading}
          className="w-full mt-6 py-3.5 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center justify-center gap-2"
        >
          {loading ? "Saving profile..." : step < steps.length - 1 ? "Continue" : "Get Started"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <button
          type="button"
          onClick={onComplete}
          className="w-full mt-3 py-3 rounded-2xl bg-secondary/50 text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileSetup;
