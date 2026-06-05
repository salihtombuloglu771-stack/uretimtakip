import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const strip = (s = "") => s.replace(/^﻿/, "").trim();
const url = strip(process.env.SUPABASE_URL);
const key = strip(process.env.SUPABASE_KEY);

export const supabase = createClient(url, key);
