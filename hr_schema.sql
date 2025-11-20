-- ============================================
-- AMP CALIBRATION HR SYSTEM - DATABASE SCHEMA
-- ============================================
-- This schema supports the complete HR dashboard system
-- Drop into Supabase SQL Editor to create all tables
-- NO SAMPLE DATA - Clean schema only

-- ============================================
-- 1. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ENHANCE USER_PROFILES TABLE
-- ============================================
-- Add columns to existing user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 3. BADGES & CERTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('certification', 'clearance', 'training', 'role')),
  issued_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired', 'pending')),
  issuing_authority TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_expiry_date ON public.badges(expiry_date);
CREATE INDEX IF NOT EXISTS idx_badges_status ON public.badges(status);

-- ============================================
-- 4. TRAINING RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('safety', 'technical', 'compliance', 'professional')),
  duration_hours INTEGER,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue')),
  start_date DATE,
  completion_date DATE,
  due_date DATE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_user_id ON public.training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON public.training_records(status);
CREATE INDEX IF NOT EXISTS idx_training_due_date ON public.training_records(due_date);

-- ============================================
-- 5. ONBOARDING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position_type TEXT NOT NULL,
  duration_weeks INTEGER,
  steps JSONB NOT NULL, -- Array of onboarding steps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.onboarding_templates(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  target_completion_date DATE,
  actual_completion_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_step INTEGER DEFAULT 0,
  steps_data JSONB, -- Tracks completion of each step
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.onboarding_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding_workflows(status);

-- ============================================
-- 6. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.document_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_kb INTEGER,
  version TEXT DEFAULT '1.0',
  uploaded_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending_review')),
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- ============================================
-- 7. HR REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hr_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('headcount', 'compliance', 'performance', 'attendance', 'custom')),
  generated_by UUID REFERENCES auth.users(id),
  date_range_start DATE,
  date_range_end DATE,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  parameters JSONB, -- Store report parameters
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.hr_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON public.hr_reports(generated_by);

-- ============================================
-- 8. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON public.audit_log(table_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Everyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Users can view own badges" ON public.badges;
DROP POLICY IF EXISTS "Admins can view all badges" ON public.badges;
DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;
DROP POLICY IF EXISTS "Users can view own training" ON public.training_records;
DROP POLICY IF EXISTS "Admins can view all training" ON public.training_records;
DROP POLICY IF EXISTS "Admins can manage training" ON public.training_records;
DROP POLICY IF EXISTS "Everyone can view training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can manage training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Users can view own onboarding" ON public.onboarding_workflows;
DROP POLICY IF EXISTS "Admins can manage onboarding" ON public.onboarding_workflows;
DROP POLICY IF EXISTS "Everyone can view public documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage reports" ON public.hr_reports;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.hr_settings;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;

-- Departments: Admins can manage, everyone can view
CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT USING (true);

-- User Profiles: Users can view their own, admins can view all
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Badges: Users can view their own, admins manage all
CREATE POLICY "Users can view own badges" ON public.badges
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all badges" ON public.badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Training: Similar to badges
CREATE POLICY "Users can view own training" ON public.training_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all training" ON public.training_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage training" ON public.training_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Everyone can view training courses
CREATE POLICY "Everyone can view training courses" ON public.training_courses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage training courses" ON public.training_courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Onboarding: Users can view their own, admins manage all
CREATE POLICY "Users can view own onboarding" ON public.onboarding_workflows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage onboarding" ON public.onboarding_workflows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents: Public docs for all, private for admins only
CREATE POLICY "Everyone can view public documents" ON public.documents
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Reports: Admins only
CREATE POLICY "Admins can manage reports" ON public.hr_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Settings: Admins only
CREATE POLICY "Admins can manage settings" ON public.hr_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit Log: Admins can view, system can insert
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_badges_updated_at ON public.badges;
DROP TRIGGER IF EXISTS update_training_records_updated_at ON public.training_records;
DROP TRIGGER IF EXISTS update_onboarding_workflows_updated_at ON public.onboarding_workflows;
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
DROP TRIGGER IF EXISTS check_badge_expiry ON public.badges;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON public.training_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_workflows_updated_at BEFORE UPDATE ON public.onboarding_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update badge status based on expiry
CREATE OR REPLACE FUNCTION public.update_badge_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.status = 'expired';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'expiring';
    ELSE
      NEW.status = 'active';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_badge_expiry BEFORE INSERT OR UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.update_badge_status();

-- Drop existing views to recreate them
DROP VIEW IF EXISTS public.vw_users_full;
DROP VIEW IF EXISTS public.vw_expiring_badges;
DROP VIEW IF EXISTS public.vw_training_stats;

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- View: Users with full details
CREATE OR REPLACE VIEW public.vw_users_full AS
SELECT 
  au.id,
  au.email,
  au.created_at as user_created_at,
  au.last_sign_in_at,
  up.role,
  up.full_name,
  up.phone,
  up.position,
  up.hire_date,
  up.status,
  d.name as department_name,
  d.abbreviation as department_abbr
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
LEFT JOIN public.departments d ON up.department_id = d.id;

-- View: Expiring badges (next 30 days)
CREATE OR REPLACE VIEW public.vw_expiring_badges AS
SELECT 
  b.*,
  up.full_name,
  au.email
FROM public.badges b
JOIN auth.users au ON b.user_id = au.id
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE b.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND b.status != 'expired'
ORDER BY b.expiry_date;

-- View: Training completion statistics
CREATE OR REPLACE VIEW public.vw_training_stats AS
SELECT 
  up.full_name,
  au.email,
  COUNT(*) FILTER (WHERE tr.status = 'completed') as completed_courses,
  COUNT(*) FILTER (WHERE tr.status = 'in_progress') as in_progress_courses,
  COUNT(*) FILTER (WHERE tr.status = 'overdue') as overdue_courses,
  COUNT(*) as total_assigned_courses
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
LEFT JOIN public.training_records tr ON up.id = tr.user_id
GROUP BY up.id, up.full_name, au.email;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users (RLS will control actual access)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant select on views
GRANT SELECT ON public.vw_users_full TO authenticated;
GRANT SELECT ON public.vw_expiring_badges TO authenticated;
GRANT SELECT ON public.vw_training_stats TO authenticated;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ HR System Schema Created Successfully!';
  RAISE NOTICE '📊 Tables: departments, user_profiles (enhanced), badges, training_courses, training_records, onboarding_templates, onboarding_workflows, documents, hr_reports, hr_settings, audit_log';
  RAISE NOTICE '🔒 RLS Policies: Enabled on all tables';
  RAISE NOTICE '📈 Views: vw_users_full, vw_expiring_badges, vw_training_stats';
  RAISE NOTICE '🎯 Schema ready - No sample data included';
END $$;

