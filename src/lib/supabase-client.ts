
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const SUPABASE_URL = "https://esmihgtxdovyxuvspttj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbWloZ3R4ZG92eXh1dnNwdHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzE3NjUsImV4cCI6MjA2MTA0Nzc2NX0.Z2tPIEvpxK7stGqn-tdeWFd0NVLNBrMPChO-p5JG6jE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
