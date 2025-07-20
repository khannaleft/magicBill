import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// These are public-facing keys, safe to be exposed in a client-side app.
const supabaseUrl = 'https://wvwlofrguqnmynhqsnml.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2d2xvZnJndXFubXluaHFzbm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTk1MzMsImV4cCI6MjA2ODU5NTUzM30.yP5BDu-DHj4PdW8qzatkSVz9VEElRBTA5HXBPiNX538';

// Create a single, shared Supabase client for the whole app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * A note for the developer reviewing this code:
 *
 * This version introduces user authentication and profiles.
 * You will need to run the following SQL in your Supabase project's SQL Editor.
 *
 * 1. CREATE THE PROFILES TABLE:
 *    This table stores clinic information linked to a user.
 *
 *    CREATE TABLE public.profiles (
 *      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 *      updated_at timestamptz,
 *      clinic_name TEXT,
 *      clinic_address TEXT,
 *      clinic_contact TEXT,
 *      clinic_reg_no TEXT,
 *      clinic_logo_url TEXT
 *    );
 *
 * 2. UPDATE THE INVOICES TABLE:
 *    Add a user_id to link invoices to users.
 *
 *    ALTER TABLE public.invoices
 *    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
 *
 * 3. CREATE A STORAGE BUCKET:
 *    In the Supabase Dashboard, go to Storage and create a new public bucket named 'logos'.
 *
 * 4. ENABLE ROW LEVEL SECURITY (RLS):
 *    This is crucial for protecting user data.
 *
 *    -- Enable RLS for profiles and invoices
 *    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 *    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
 *
 *    -- Policies for 'profiles' table
 *    CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
 *    CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
 *    CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
 *
 *    -- Policies for 'invoices' table
 *    CREATE POLICY "Users can manage their own invoices." ON public.invoices FOR ALL
 *    USING (auth.uid() = user_id)
 *    WITH CHECK (auth.uid() = user_id);
 *
 * 5. ADD STORAGE POLICIES:
 *    These policies allow authenticated users to upload to the 'logos' bucket
 *    and allow anyone to read from it, which is necessary for logos on invoices.
 *
 *    -- Policy for logo uploads
 *    CREATE POLICY "Authenticated users can upload logos." ON storage.objects
 *    FOR INSERT TO authenticated
 *    WITH CHECK (bucket_id = 'logos');
 *
 *    -- Policy for logo access
 *    CREATE POLICY "Anyone can view logos." ON storage.objects
 *    FOR SELECT
 *    USING (bucket_id = 'logos');
 */
