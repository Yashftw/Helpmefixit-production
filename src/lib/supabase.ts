import { createClient } from "@supabase/supabase-js";

// Production Keys provided by the user for Vercel Serverless environment
const supabaseUrl = "https://ddqtjvrhexzidqyoxioq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcXRqdnJoZXh6aWRxeW94aW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzY4NDksImV4cCI6MjA5MTg1Mjg0OX0.DfhmYS0fFKpqRIdop_pdpep_CWW--Xy-WZWbWcRNyrk";

export const supabase = createClient(supabaseUrl, supabaseKey);
