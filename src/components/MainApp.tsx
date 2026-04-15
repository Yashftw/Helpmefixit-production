import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Clock, Code, Smartphone, Server, Brain, Bug, Zap, Filter, Map, Briefcase, PlusCircle, ArrowLeft, Edit, Save, X, Upload } from "lucide-react";
import StaggeredMenu from "@/components/StaggeredMenu/StaggeredMenu";
import GigDetail from "@/components/GigDetail";
import MapSection from "@/components/MapSection";
import { getMe, getNearbyGigs, NearbyGig, saveProfile } from "@/lib/api";
import GigCreator from "@/components/GigCreator";

const categories = [
  { label: "All", icon: Zap },
  { label: "Web", icon: Code },
  { label: "Mobile", icon: Smartphone },
  { label: "Backend", icon: Server },
  { label: "AI", icon: Brain },
  { label: "Debugging", icon: Bug },
];

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

type MainView = "home" | "finder" | "creator" | "profile";

interface MainAppProps {
  token: string;
}

const MainApp = ({ token }: MainAppProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [gigs, setGigs] = useState<NearbyGig[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [view, setView] = useState<MainView>("home");
  const [profile, setProfile] = useState<{ name: string; occupation?: string; goal?: string; profileImage?: string; bio?: string; interest?: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ name: "", occupation: "", goal: "", profileImage: "", bio: "", interest: "" });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        const result = await getNearbyGigs({ ...coords, radiusKm: 12 });
        setGigs(result.gigs);
        setLoading(false);
      },
      () => {
        setLocationError("Location access is required to load nearby gigs.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      try {
        const me = await getMe(token);
        setProfile({
          name: me.user.name,
          occupation: me.profile?.occupation,
          goal: me.profile?.goal,
          profileImage: me.profile?.profileImage,
          bio: me.profile?.bio,
          interest: me.profile?.interest,
        });
      } catch {
        setProfile(null);
      }
    };
    loadProfile();
  }, [token]);

  const filtered = useMemo(
    () =>
      gigs.filter((l) => {
        const matchCat = activeCategory === "All" || l.category === activeCategory;
        const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [activeCategory, gigs, search],
  );

  const urgencyColor = (u: string) => {
    if (u === "Urgent" || u === "ASAP") return "text-destructive bg-destructive/10";
    if (u === "Today") return "text-primary bg-primary/10";
    return "text-muted-foreground bg-secondary";
  };

  const handleEditProfileSave = async () => {
    if (!token) return;
    try {
      setLoading(true);
      await saveProfile(token, editData);
      setProfile((prev) => ({ ...prev, ...editData }));
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditData((p) => ({ ...p, profileImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-background/45"
    >
      <StaggeredMenu
        isFixed
        position="right"
        colors={["hsl(258, 70%, 25%)", "hsl(258, 70%, 15%)", "hsl(240, 20%, 8%)"]}
        accentColor="#7c3aed"
        menuButtonColor="#e2e2e2"
        openMenuButtonColor="#ffffff"
        items={[
          { label: "Home", onClick: () => setView("home") },
          { label: "Gig Finder", onClick: () => setView("finder") },
          { label: "Gig Creator", onClick: () => setView("creator") },
          { label: "Profile", onClick: () => setView("profile") },
        ]}
        socialItems={[
          { label: "Twitter", href: "https://twitter.com" },
          { label: "GitHub", href: "https://github.com" },
          { label: "Discord", href: "https://discord.com" },
        ]}
        logoContent={
          <span className="font-display text-xl font-bold tracking-tight">
            HELPME<span className="text-primary">FIXIT</span>
          </span>
        }
      />

      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <div className="fixed top-12 left-6 z-30 flex items-center gap-2">
          {view !== "home" && (
            <button
              type="button"
              onClick={() => setView("home")}
              className="inline-flex items-center gap-1 rounded-full glass-surface px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
        </div>

        {view === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <button
              onClick={() => setView("finder")}
              className="glass-surface rounded-[2rem] p-6 border border-border/40 text-left hover:shadow-glow transition-all bg-[radial-gradient(140%_120%_at_20%_0%,hsl(258_70%_58%/.15),transparent_55%),radial-gradient(120%_100%_at_90%_100%,hsl(210_80%_60%/.14),transparent_60%)]"
            >
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">Gig Finder</h2>
              <p className="text-sm text-muted-foreground">
                Search gigs around you, open the live map, and accept work instantly.
              </p>
            </button>
            <button
              onClick={() => setView("creator")}
              className="glass-surface rounded-[2rem] p-6 border border-border/40 text-left hover:shadow-glow transition-all bg-[radial-gradient(140%_120%_at_20%_0%,hsl(258_70%_58%/.15),transparent_55%),radial-gradient(120%_100%_at_90%_100%,hsl(210_80%_60%/.14),transparent_60%)]"
            >
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                <PlusCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">Gig Creator</h2>
              <p className="text-sm text-muted-foreground">
                Post a new gig from your current location so nearby developers can find it on the map.
              </p>
            </button>
          </motion.div>
        )}

        {(view === "home" || view === "finder") && (
          <>
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              aria-label="Search gigs"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl glass-surface border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <motion.button
              key={cat.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.label
                  ? "text-primary-foreground shadow-glow bg-[radial-gradient(130%_130%_at_25%_15%,hsl(258_70%_62%),hsl(210_80%_60%))]"
                  : "glass-surface text-muted-foreground hover:text-foreground bg-[radial-gradient(120%_120%_at_20%_0%,hsl(258_70%_58%/.12),transparent_55%),radial-gradient(110%_110%_at_90%_100%,hsl(210_80%_60%/.1),transparent_60%)]"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </motion.button>
          ))}
        </div>

        <div className="mb-5 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {location
              ? `Tracking gigs near ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
              : locationError || "Requesting your location..."}
          </p>
          <button
            onClick={() => setMapOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 gradient-primary text-primary-foreground text-sm"
          >
            <Map className="h-4 w-4" />
            {mapOpen ? "Hide Map" : "Open Map"}
          </button>
        </div>

        <AnimatePresence>
          {mapOpen && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <MapSection
                gigs={filtered}
                center={location}
                zoom={zoom}
                onZoomIn={() => setZoom((z) => Math.min(18, z + 1))}
                onZoomOut={() => setZoom((z) => Math.max(4, z - 1))}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listings grid */}
        <h2 className="text-lg font-bold font-display mb-4">Available Gigs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((gig, i) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => setSelectedGig(gig)}
              className="glass-surface rounded-2xl p-5 shadow-card hover:shadow-glow transition-shadow duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyColor(gig.urgency)}`}>
                  {gig.urgency}
                </span>
                <span className="text-lg font-bold text-primary">₹{gig.price}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors duration-300">
                {gig.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">by {gig.dev}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gig.distanceKm} km</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" />{gig.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{gig.category}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && <p className="text-sm text-muted-foreground py-6">Loading gigs around you...</p>}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">whoops looks like we gotta wait now</p>
          </div>
        )}
          </>
        )}

        {(view === "home" || view === "creator") && (
          <div className="mt-8">
            <GigCreator
              token={token}
              location={location}
              onGigCreated={(next) => {
                setGigs(next);
                setView("finder");
                setMapOpen(true);
              }}
            />
          </div>
        )}

        {view === "profile" && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-surface rounded-[2rem] p-8 border border-border/40 mt-8 w-1/2 mx-auto min-w-[340px] text-center shadow-card relative"
          >
            {isEditingProfile ? (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-bold">Edit Profile</h2>
                  <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-full hover:bg-secondary transition-colors"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex flex-col items-center gap-3 mb-6">
                  {editData.profileImage ? (
                    <img src={editData.profileImage} alt="Preview" className="h-28 w-28 rounded-full object-cover border border-border/50" />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground"><Upload className="w-8 h-8"/></div>
                  )}
                  <label className="text-sm text-primary font-medium cursor-pointer hover:underline">
                    Change Picture
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground ml-1">Name</label>
                    <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="w-full px-4 py-2.5 mt-1 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:ring-1 focus:ring-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground ml-1">Profession</label>
                      <input value={editData.occupation} onChange={e => setEditData(d => ({ ...d, occupation: e.target.value }))} className="w-full px-4 py-2.5 mt-1 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground ml-1">Interest</label>
                      <input value={editData.interest} onChange={e => setEditData(d => ({ ...d, interest: e.target.value }))} className="w-full px-4 py-2.5 mt-1 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:ring-1 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground ml-1">Bio / Goal</label>
                    <textarea rows={3} value={editData.bio} onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))} className="w-full px-4 py-2.5 mt-1 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:ring-1 focus:ring-primary/50 resize-none" />
                  </div>
                </div>
                <button onClick={handleEditProfileSave} className="w-full mt-4 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold flex flex-row items-center justify-center gap-2 shadow-glow hover:scale-[1.02] transition-transform">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => {
                    setEditData({
                      name: profile?.name || "",
                      occupation: profile?.occupation || "",
                      goal: profile?.goal || "",
                      bio: profile?.bio || "",
                      interest: profile?.interest || "",
                      profileImage: profile?.profileImage || "",
                    });
                    setIsEditingProfile(true);
                  }}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-lg mb-4" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-secondary border-4 border-background shadow-lg mb-4 flex items-center justify-center"><Brain className="w-8 h-8 text-muted-foreground" /></div>
                )}
                <h2 className="text-3xl font-bold mb-1">{profile?.name || "Your account"}</h2>
                <p className="text-primary font-medium mb-3">{profile?.occupation || "Profession not set"}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {profile?.interest && (
                    <span className="px-3 py-1 rounded-full bg-secondary/70 text-xs text-muted-foreground border border-border/50">
                      Interest: {profile.interest}
                    </span>
                  )}
                  {profile?.goal && (
                    <span className="px-3 py-1 rounded-full bg-secondary/70 text-xs text-muted-foreground border border-border/50">
                      Goal: {profile.goal}
                    </span>
                  )}
                </div>
                {profile?.bio && (
                  <div className="bg-secondary/30 rounded-2xl p-4 w-full text-sm text-center leading-relaxed border border-border/30">
                    {profile.bio}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}
      </div>

      {/* Gig Detail Slide-up */}
      <AnimatePresence>
        {selectedGig && <GigDetail gig={selectedGig} onClose={() => setSelectedGig(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainApp;
