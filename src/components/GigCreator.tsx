import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LocateFixed } from "lucide-react";
import { createGig, getNearbyGigs, NearbyGig } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GigCreatorProps {
  token: string;
  location: { lat: number; lng: number } | null;
  onGigCreated: (next: NearbyGig[]) => void;
}

const categories = ["Web", "Mobile", "Backend", "AI", "Debugging"];
const urgencyLevels = ["Urgent", "ASAP", "Today", "Flexible", "This week"];

const GigCreator = ({ token, location, onGigCreated }: GigCreatorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web");
  const [urgency, setUrgency] = useState("Today");
  const [price, setPrice] = useState("80");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => !!token && !!location && title.trim() && description.trim() && Number(price) > 0,
    [token, location, title, description, price],
  );

  const handleCreate = async () => {
    setError("");
    if (!title.trim() || !description.trim() || Number(price) <= 0) {
      setError("Please fill out Title, Description, and a valid Price.");
      return;
    }
    if (!location) {
      setError("Location is required. Please enable location permissions.");
      return;
    }

    setLoading(true);
    try {
      await createGig(token, {
        title: title.trim(),
        description: description.trim(),
        category,
        urgency,
        price: Number(price),
        lat: location.lat,
        lng: location.lng,
      });
      const updated = await getNearbyGigs({ lat: location.lat, lng: location.lng, radiusKm: 10 });
      onGigCreated(updated.gigs);
      setTitle("");
      setDescription("");
      setPrice("80");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post gig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-surface rounded-3xl p-6 border border-border/40"
    >
      <h2 className="text-lg font-bold font-display mb-4">Create a New Gig</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Gig title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-border/50 bg-secondary/40 px-4 py-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Price (INR)</label>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-2xl border border-border/50 bg-secondary/40 px-4 py-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full h-[46px] rounded-tl-[24px] rounded-bl-[24px] rounded-tr-[24px] rounded-br-[6px] border border-border/50 bg-secondary/40 px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 flex transition-all">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
              <SelectGroup>
                {categories.map((item) => (
                  <SelectItem key={item} value={item} className="rounded-lg cursor-pointer">
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Urgency</label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="w-full h-[46px] rounded-tl-[24px] rounded-bl-[24px] rounded-tr-[24px] rounded-br-[6px] border border-border/50 bg-secondary/40 px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 flex transition-all">
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
              <SelectGroup>
                {urgencyLevels.map((item) => (
                  <SelectItem key={item} value={item} className="rounded-lg cursor-pointer">
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-xs text-muted-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-border/50 bg-secondary/40 px-4 py-3 text-sm"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <LocateFixed className="w-4 h-4" />
        {location
          ? `Posting from ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
          : "Allow location access to post gigs"}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCreate}
        disabled={loading}
        className="mt-5 w-full rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2"
      >
        {loading ? "Publishing gig..." : "Publish gig"}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.section>
  );
};

export default GigCreator;