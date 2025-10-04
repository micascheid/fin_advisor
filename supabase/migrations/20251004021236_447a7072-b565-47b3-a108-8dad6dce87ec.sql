-- Create role enum
CREATE TYPE public.app_role AS ENUM ('advisor', 'client');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create advisor_client_assignments table
CREATE TABLE public.advisor_client_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (client_id)
);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  net_worth DECIMAL(15, 2),
  annual_income DECIMAL(15, 2),
  monthly_expenses DECIMAL(15, 2),
  risk_note TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_allocations table
CREATE TABLE public.portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  asset_name TEXT NOT NULL,
  allocation_percentage DECIMAL(5, 2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all advisor profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (role = 'advisor' OR id = auth.uid());

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for advisor_client_assignments
CREATE POLICY "Advisors can view their assignments"
  ON public.advisor_client_assignments FOR SELECT
  TO authenticated
  USING (advisor_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Clients can create assignments"
  ON public.advisor_client_assignments FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() AND public.has_role(auth.uid(), 'client'));

-- RLS Policies for portfolios
CREATE POLICY "Advisors can manage their portfolios"
  ON public.portfolios FOR ALL
  TO authenticated
  USING (advisor_id = auth.uid() AND public.has_role(auth.uid(), 'advisor'));

CREATE POLICY "Clients can view their portfolios"
  ON public.portfolios FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() AND public.has_role(auth.uid(), 'client'));

-- RLS Policies for portfolio_allocations
CREATE POLICY "Advisors can manage allocations for their portfolios"
  ON public.portfolio_allocations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_allocations.portfolio_id
      AND portfolios.advisor_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view allocations for their portfolios"
  ON public.portfolio_allocations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_allocations.portfolio_id
      AND portfolios.client_id = auth.uid()
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::app_role,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();