/*
  # Initial Schema Setup for Career Portal

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `profile_picture` (text, optional)
      - `resume` (text, optional)
      - `skills` (text array)
      - `education` (jsonb array)
      - `experience` (jsonb array)
      - `saved_jobs` (uuid array)
      - `applied_jobs` (uuid array)
      - `created_at` (timestamptz)
    
    - `employers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `profile_picture` (text, optional)
      - `company_name` (text)
      - `company_logo` (text, optional)
      - `company_description` (text)
      - `industry` (text)
      - `location` (text)
      - `website` (text, optional)
      - `created_at` (timestamptz)
    
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `profile_picture` (text, optional)
      - `created_at` (timestamptz)
    
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `company_logo` (text, optional)
      - `location` (text)
      - `is_remote` (boolean)
      - `type` (text, enum: 'internship', 'full-time', 'part-time', 'contract')
      - `category` (text)
      - `description` (text)
      - `requirements` (text array)
      - `responsibilities` (text array)
      - `salary_min` (integer, optional)
      - `salary_max` (integer, optional)
      - `salary_currency` (text, optional)
      - `stipend_amount` (integer, optional)
      - `stipend_currency` (text, optional)
      - `stipend_period` (text, optional, enum: 'hourly', 'daily', 'weekly', 'monthly')
      - `duration` (text, optional)
      - `application_deadline` (date)
      - `posted_by` (uuid, references employers)
      - `posted_at` (timestamptz)
      - `status` (text, enum: 'pending', 'approved', 'rejected')
      - `applicants` (uuid array)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text, enum: 'webinar', 'hackathon', 'workshop', 'networking')
      - `date` (date)
      - `time` (text)
      - `location` (text, optional)
      - `is_online` (boolean)
      - `link` (text, optional)
      - `organizer` (uuid, references employers)
      - `image` (text, optional)
      - `registrations` (uuid array)
    
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `instructor` (text)
      - `category` (text)
      - `level` (text, enum: 'beginner', 'intermediate', 'advanced')
      - `duration` (text)
      - `price_amount` (numeric)
      - `price_currency` (text)
      - `discount_amount` (numeric, optional)
      - `discount_currency` (text, optional)
      - `image` (text, optional)
      - `enrollments` (uuid array)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and manage their own data
    - Add policies for employers to manage their job listings
    - Add policies for admins to manage all data
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  profile_picture text,
  resume text,
  skills text[] DEFAULT '{}',
  education jsonb[] DEFAULT '{}',
  experience jsonb[] DEFAULT '{}',
  saved_jobs uuid[] DEFAULT '{}',
  applied_jobs uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create employers table
CREATE TABLE IF NOT EXISTS employers (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  profile_picture text,
  company_name text NOT NULL,
  company_logo text,
  company_description text NOT NULL,
  industry text NOT NULL,
  location text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  profile_picture text,
  created_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  company_logo text,
  location text NOT NULL,
  is_remote boolean DEFAULT false,
  type text NOT NULL CHECK (type IN ('internship', 'full-time', 'part-time', 'contract')),
  category text NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL,
  responsibilities text[] NOT NULL,
  salary_min integer,
  salary_max integer,
  salary_currency text,
  stipend_amount integer,
  stipend_currency text,
  stipend_period text CHECK (stipend_period IN ('hourly', 'daily', 'weekly', 'monthly')),
  duration text,
  application_deadline date NOT NULL,
  posted_by uuid REFERENCES employers NOT NULL,
  posted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applicants uuid[] DEFAULT '{}'
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('webinar', 'hackathon', 'workshop', 'networking')),
  date date NOT NULL,
  time text NOT NULL,
  location text,
  is_online boolean DEFAULT false,
  link text,
  organizer uuid REFERENCES employers NOT NULL,
  image text,
  registrations uuid[] DEFAULT '{}'
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  instructor text NOT NULL,
  category text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration text NOT NULL,
  price_amount numeric NOT NULL,
  price_currency text NOT NULL,
  discount_amount numeric,
  discount_currency text,
  image text,
  enrollments uuid[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create storage buckets using the correct API
DO $$
BEGIN
  -- Create avatars bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('avatars', 'avatars')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create resumes bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('resumes', 'resumes')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create company_logos bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('company_logos', 'company_logos')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create event_images bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('event_images', 'event_images')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create course_images bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('course_images', 'course_images')
  ON CONFLICT (id) DO NOTHING;
  
  -- Update buckets to be public
  UPDATE storage.buckets SET public = TRUE WHERE id IN ('avatars', 'resumes', 'company_logos', 'event_images', 'course_images');
EXCEPTION
  WHEN undefined_column THEN
    -- If 'public' column doesn't exist, we'll skip that part
    NULL;
END $$;

-- Create policies for students
CREATE POLICY "Students can read their own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update their own data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for employers
CREATE POLICY "Employers can read their own data"
  ON employers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employers can update their own data"
  ON employers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for jobs
CREATE POLICY "Anyone can read approved jobs"
  ON jobs
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Employers can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Employers can update their own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = posted_by);

CREATE POLICY "Employers can delete their own jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = posted_by);

-- Create policies for events
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  USING (true);

CREATE POLICY "Employers can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer);

CREATE POLICY "Employers can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer);

CREATE POLICY "Employers can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer);

-- Create policies for courses
CREATE POLICY "Anyone can read courses"
  ON courses
  FOR SELECT
  USING (true);

-- Create admin policies for all tables
CREATE POLICY "Admins can do anything with students"
  ON students
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can do anything with employers"
  ON employers
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can do anything with jobs"
  ON jobs
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can do anything with events"
  ON events
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins can do anything with courses"
  ON courses
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Create storage policies
DO $$
BEGIN
  -- Create storage policies for avatars
  CREATE POLICY "Anyone can read avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

  CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

  -- Create storage policies for resumes
  CREATE POLICY "Anyone can read resumes"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'resumes');

  CREATE POLICY "Authenticated users can upload resumes"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

  -- Create storage policies for company logos
  CREATE POLICY "Anyone can read company logos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'company_logos');

  CREATE POLICY "Employers can upload company logos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'company_logos' AND EXISTS (SELECT 1 FROM employers WHERE id = auth.uid()));

  -- Create storage policies for event images
  CREATE POLICY "Anyone can read event images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'event_images');

  CREATE POLICY "Employers can upload event images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'event_images' AND EXISTS (SELECT 1 FROM employers WHERE id = auth.uid()));

  -- Create storage policies for course images
  CREATE POLICY "Anyone can read course images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'course_images');

  CREATE POLICY "Admins can upload course images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'course_images' AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));
EXCEPTION
  WHEN duplicate_object THEN
    -- If policies already exist, we'll skip
    NULL;
END $$;