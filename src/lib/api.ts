import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Profile {
  userId: string;
  name?: string;
  occupation: string;
  goal: string;
  bio?: string;
  interest?: string;
  profileImage: string;
  updatedAt: string;
}

export interface NearbyGig {
  id: number;
  title: string;
  price: number;
  category: string;
  urgency: string;
  dev: string;
  rating: number;
  description: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceKm: number;
}

export interface CreateGigPayload {
  title: string;
  description: string;
  category: string;
  urgency: string;
  price: number;
  lat: number;
  lng: number;
}

export const register = async (payload: { name: string; email: string; password: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { data: { name: payload.name } },
  });
  if (error) throw error;
  if (!data.session) throw new Error("Registration succeeded but no session was returned.");
  return {
    token: data.session.access_token,
    user: {
      id: data.user!.id,
      name: data.user!.user_metadata?.name || "",
      email: data.user!.email || "",
    },
  };
};

export const login = async (payload: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw error;
  if (!data.session) throw new Error("Login failed (no session).");
  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      name: data.user.user_metadata?.name || "",
      email: data.user.email || "",
    },
  };
};

export const getMe = async (token: string) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user: {
      id: user.id,
      name: user.user_metadata?.name || "",
      email: user.email || "",
    },
    profile: profile
      ? {
        userId: profile.id,
        name: user.user_metadata?.name || "",
        occupation: profile.occupation,
        goal: profile.goal,
        bio: profile.bio,
        interest: profile.interest,
        profileImage: profile.profile_image,
        updatedAt: profile.updated_at,
      }
      : null,
  };
};

export const saveProfile = async (
  token: string,
  payload: { name?: string; occupation: string; goal?: string; profileImage: string; bio?: string; interest?: string },
) => {
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) throw new Error("Unauthorized");

  if (payload.name && payload.name !== user.user_metadata?.name) {
    await supabase.auth.updateUser({ data: { name: payload.name } });
  }

  const profileData = {
    id: user.id,
    occupation: payload.occupation,
    goal: payload.goal,
    profile_image: payload.profileImage,
    bio: payload.bio,
    interest: payload.interest,
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(profileData)
    .select()
    .single();

  if (error) throw error;

  return {
    profile: {
      userId: profile.id,
      name: payload.name || user.user_metadata?.name || "",
      occupation: profile.occupation,
      goal: profile.goal,
      bio: profile.bio,
      interest: profile.interest,
      profileImage: profile.profile_image,
      updatedAt: profile.updated_at,
    },
  };
};

export const getNearbyGigs = async (payload: { lat: number; lng: number; radiusKm?: number }) => {
  const { data, error } = await supabase.rpc("get_nearby_gigs", {
    user_lat: payload.lat,
    user_lng: payload.lng,
    radius_km: payload.radiusKm ?? 5,
  });

  if (error) throw error;

  return {
    gigs: (data || []).map((g: any) => ({
      id: g.id,
      title: g.title,
      price: g.price,
      category: g.category,
      urgency: g.urgency,
      dev: g.dev,
      rating: g.rating,
      description: g.description,
      lat: g.lat,
      lng: g.lng,
      distanceKm: g.distance_km,
      distanceMeters: Math.round(g.distance_km * 1000),
    })),
  };
};

export const createGig = async (token: string, payload: CreateGigPayload) => {
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("gigs")
    .insert({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      urgency: payload.urgency,
      price: payload.price,
      lat: payload.lat,
      lng: payload.lng,
      dev: user.user_metadata?.name || "Unknown Dev",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    gig: {
      id: data.id,
      title: data.title,
      price: data.price,
      category: data.category,
      urgency: data.urgency,
      dev: data.dev,
      rating: data.rating,
      description: data.description,
      lat: data.lat,
      lng: data.lng,
      distanceKm: 0,
      distanceMeters: 0,
    },
  };
};

// --------------- GIG CONNECTION & CHAT APIs --------------- //

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const acceptGigAction = async (token: string, gigId: number) => {
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) throw new Error("Unauthorized");

  // 1. Find the parent Gig inside Supabase so we know who to connect you with
  const { data: gigInfo, error: gigErr } = await supabase
    .from("gigs")
    .select("created_by")
    .eq("id", gigId)
    .single();

  // If gig doesn't exist (like the dummy data in Discover), we generate a fake ID just for UI testing 
  let ownerId = gigInfo?.created_by || "00000000-0000-0000-0000-000000000000";

  // 2. Establish the Chat Connection
  const { data, error } = await supabase
    .from("gig_connections")
    .insert({
      gig_id: gigId,
      worker_id: user.id,
      owner_id: ownerId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getConnectionMessages = async (token: string, connectionId: string) => {
  const { error: authErr } = await supabase.auth.getUser(token);
  if (authErr) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Message[];
};

export const sendMessage = async (token: string, connectionId: string, content: string) => {
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("messages")
    .insert({
      connection_id: connectionId,
      sender_id: user.id,
      content
    });

  if (error) throw error;
};