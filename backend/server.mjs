import express from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data.json");

const app = express();
const port = Number(process.env.API_PORT || 8787);
const sessions = new Map();

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = ["http://localhost:8080", "http://127.0.0.1:8080"];
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("Origin not allowed"), false);
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "2mb" }));

const seedGigs = [
  { id: 1, title: "Fix React auth bug", price: 80, category: "Web", urgency: "Urgent", dev: "Sarah K.", rating: 4.9, lat: 40.7132, lng: -74.007, description: "OAuth callback loops for Safari users. Needs quick triage and patch." },
  { id: 2, title: "WordPress site down", price: 120, category: "Web", urgency: "ASAP", dev: "Mike R.", rating: 4.7, lat: 40.7118, lng: -74.0033, description: "Production 500 errors after plugin deployment, checkout is blocked." },
  { id: 3, title: "iOS app crash fix", price: 150, category: "Mobile", urgency: "Today", dev: "Alex T.", rating: 4.8, lat: 40.716, lng: -74.001, description: "React Native app crashes on launch for iOS 17. Need root-cause analysis." },
  { id: 4, title: "Stripe webhook setup", price: 60, category: "Backend", urgency: "Flexible", dev: "Jordan L.", rating: 4.6, lat: 40.709, lng: -74.012, description: "Implement secure webhook verification and event handling pipeline." },
  { id: 5, title: "DB query optimization", price: 200, category: "Backend", urgency: "This week", dev: "Chris P.", rating: 5, lat: 40.718, lng: -74.009, description: "Slow PostgreSQL reads on hot endpoints. Need indexes and SQL tuning." },
  { id: 6, title: "Model deployment support", price: 250, category: "AI", urgency: "Today", dev: "Priya S.", rating: 4.9, lat: 40.715, lng: -74.014, description: "Ship existing model behind an API with monitoring and autoscaling." },
  { id: 7, title: "React Native crash", price: 90, category: "Mobile", urgency: "Urgent", dev: "Tom W.", rating: 4.5, lat: 40.719, lng: -74.005, description: "Android image rendering crash after latest release." },
  { id: 8, title: "CSS layout broken", price: 45, category: "Debugging", urgency: "ASAP", dev: "Nina C.", rating: 4.8, lat: 40.7125, lng: -74.015, description: "Responsive layout fails between tablet breakpoints." },
];

const readData = async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.gigs) || parsed.gigs.length === 0) {
      parsed.gigs = seedGigs;
      await writeData(parsed);
    }
    return parsed;
  } catch {
    const initial = { users: [], profiles: [], gigs: seedGigs };
    await fs.writeFile(DATA_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
};

const writeData = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, hash) => {
  const [salt, key] = hash.split(":");
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(attempt), Buffer.from(key));
};

const toKm = (m) => m / 1000;
const toRad = (deg) => (deg * Math.PI) / 180;
const distanceMeters = (aLat, aLng, bLat, bLng) => {
  const earth = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) *
      Math.cos(toRad(bLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earth * c;
};

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = sessions.get(token);
  return next();
};

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({ error: "Invalid registration payload" });
  }

  const data = await readData();
  const normalizedEmail = String(email).trim().toLowerCase();
  const exists = data.users.some((u) => u.email === normalizedEmail);
  if (exists) return res.status(409).json({ error: "Email already exists" });

  const id = crypto.randomUUID();
  data.users.push({
    id,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(String(password)),
    createdAt: new Date().toISOString(),
  });
  await writeData(data);

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, id);
  return res.status(201).json({
    token,
    user: { id, name: String(name).trim(), email: normalizedEmail },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Invalid login payload" });

  const data = await readData();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = data.users.find((u) => u.email === normalizedEmail);
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, user.id);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/api/profile/me", auth, async (req, res) => {
  const data = await readData();
  const profile = data.profiles.find((p) => p.userId === req.userId);
  const user = data.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    profile: profile ?? null,
  });
});

app.post("/api/profile", auth, async (req, res) => {
  const { occupation, goal, profileImage, name, bio, interest } = req.body ?? {};
  const normalizedOccupation = String(occupation ?? "").trim();
  const normalizedGoal = String(goal ?? "").trim();
  const normalizedProfileImage = String(profileImage ?? "").trim();
  const normalizedName = String(name ?? "").trim();
  const normalizedBio = String(bio ?? "").trim();
  const normalizedInterest = String(interest ?? "").trim();

  const data = await readData();

  if (normalizedName) {
    const userIndex = data.users.findIndex((u) => u.id === req.userId);
    if (userIndex >= 0) {
      data.users[userIndex].name = normalizedName;
    }
  }

  const existingIndex = data.profiles.findIndex((p) => p.userId === req.userId);
  const next = {
    userId: req.userId,
    occupation: normalizedOccupation,
    goal: normalizedGoal,
    bio: normalizedBio,
    interest: normalizedInterest,
    profileImage: normalizedProfileImage,
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) data.profiles[existingIndex] = { ...data.profiles[existingIndex], ...next };
  else data.profiles.push(next);
  await writeData(data);

  return res.status(201).json({ profile: next });
});

app.get("/api/gigs/nearby", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm || 5);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng are required" });
  }
  const data = await readData();
  const withDistance = data.gigs
    .map((gig) => {
      const meters = distanceMeters(lat, lng, gig.lat, gig.lng);
      return {
        ...gig,
        distanceMeters: Math.round(meters),
        distanceKm: Number(toKm(meters).toFixed(2)),
      };
    })
    .filter((g) => g.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return res.json({ gigs: withDistance });
});

app.post("/api/gigs", auth, async (req, res) => {
  const { title, description, category, urgency, price, lat, lng } = req.body ?? {};
  const normalizedTitle = String(title ?? "").trim();
  const normalizedDescription = String(description ?? "").trim();
  const normalizedCategory = String(category ?? "").trim();
  const normalizedUrgency = String(urgency ?? "").trim();
  const normalizedPrice = Number(price);
  const normalizedLat = Number(lat);
  const normalizedLng = Number(lng);

  if (
    !normalizedTitle ||
    !normalizedDescription ||
    !normalizedCategory ||
    !normalizedUrgency ||
    !Number.isFinite(normalizedPrice) ||
    normalizedPrice <= 0 ||
    !Number.isFinite(normalizedLat) ||
    !Number.isFinite(normalizedLng)
  ) {
    return res.status(400).json({ error: "Invalid gig payload" });
  }

  const data = await readData();
  const user = data.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const nextGig = {
    id: Date.now(),
    title: normalizedTitle,
    price: Number(normalizedPrice.toFixed(2)),
    category: normalizedCategory,
    urgency: normalizedUrgency,
    dev: user.name,
    rating: 5,
    lat: normalizedLat,
    lng: normalizedLng,
    description: normalizedDescription,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
  };

  data.gigs.push(nextGig);
  await writeData(data);

  return res.status(201).json({ gig: nextGig });
});

app.listen(port, () => {
  // Minimal startup log without exposing user payloads.
  console.log(`API listening on ${port}`);
});
