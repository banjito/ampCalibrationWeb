-- AMP Calibration HR System Database Schema
-- Run this in Supabase SQL Editor to create all HR tables

-- ============================================
-- DROP EXISTING TABLES (CLEAN SLATE)
-- ============================================
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.training_records CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.onboarding_workflows CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;

-- ============================================
-- 1. EMPLOYEES TABLE
-- ============================================
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USER PROFILES TABLE
-- ============================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. ONBOARDING WORKFLOWS TABLE
-- ============================================
CREATE TABLE public.onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  template_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. BADGES TABLE
-- ============================================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  category TEXT DEFAULT 'safety',
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TRAINING RECORDS TABLE
-- ============================================
CREATE TABLE public.training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  training_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  start_date DATE,
  due_date DATE,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. DOCUMENTS TABLE
-- ============================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT,
  uploaded_by TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow authenticated users to access)
-- ============================================

-- Employees policies
DROP POLICY IF EXISTS "Allow authenticated users to view employees" ON public.employees;
CREATE POLICY "Allow authenticated users to view employees" ON public.employees FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert employees" ON public.employees;
CREATE POLICY "Allow authenticated users to insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update employees" ON public.employees;
CREATE POLICY "Allow authenticated users to update employees" ON public.employees FOR UPDATE TO authenticated USING (true);

-- User Profiles policies
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to view profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to insert profiles" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (true);

-- Onboarding policies
DROP POLICY IF EXISTS "Allow authenticated users to view onboarding" ON public.onboarding_workflows;
CREATE POLICY "Allow authenticated users to view onboarding" ON public.onboarding_workflows FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert onboarding" ON public.onboarding_workflows;
CREATE POLICY "Allow authenticated users to insert onboarding" ON public.onboarding_workflows FOR INSERT TO authenticated WITH CHECK (true);

-- Badges policies
DROP POLICY IF EXISTS "Allow authenticated users to view badges" ON public.badges;
CREATE POLICY "Allow authenticated users to view badges" ON public.badges FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert badges" ON public.badges;
CREATE POLICY "Allow authenticated users to insert badges" ON public.badges FOR INSERT TO authenticated WITH CHECK (true);

-- Training Records policies
DROP POLICY IF EXISTS "Allow authenticated users to view training" ON public.training_records;
CREATE POLICY "Allow authenticated users to view training" ON public.training_records FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert training" ON public.training_records;
CREATE POLICY "Allow authenticated users to insert training" ON public.training_records FOR INSERT TO authenticated WITH CHECK (true);

-- Documents policies
DROP POLICY IF EXISTS "Allow authenticated users to view documents" ON public.documents;
CREATE POLICY "Allow authenticated users to view documents" ON public.documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert documents" ON public.documents;
CREATE POLICY "Allow authenticated users to insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_badges_status ON public.badges(status);
CREATE INDEX IF NOT EXISTS idx_badges_expiry ON public.badges(expiry_date);

CREATE INDEX IF NOT EXISTS idx_training_status ON public.training_records(status);
CREATE INDEX IF NOT EXISTS idx_training_due_date ON public.training_records(due_date);

CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.employees TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.onboarding_workflows TO authenticated;
GRANT ALL ON public.badges TO authenticated;
GRANT ALL ON public.training_records TO authenticated;
GRANT ALL ON public.documents TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'HR System database schema created successfully!';
  RAISE NOTICE 'All tables, policies, and indexes are ready to use.';
END $$;

