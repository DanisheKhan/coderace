-- CodeRace DB Migration: Admin Approvals & Email Tracking
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Populate email for any existing profiles from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Pre-approve all existing users so they don't get locked out
UPDATE public.profiles SET approved = true;

-- 4. Set Danish Khan specifically as admin and approved
UPDATE public.profiles
SET is_admin = true, approved = true
WHERE id = '61da0782-203b-44b6-8558-b3c18bc1eca4';

-- 5. Set up Row Level Security (RLS) policies for approvals
-- Drop the existing update policy
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Create the new update policy that allows users to update their own profile,
-- and allows admins to update any profile (e.g. to approve users).
CREATE POLICY "Allow users or admins to update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    auth.uid() = id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Create a delete policy allowing admins to decline/delete profiles
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.profiles;
CREATE POLICY "Allow admins to delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );
