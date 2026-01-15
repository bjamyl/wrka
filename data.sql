CREATE TABLE public.handyman_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bio text,
  years_experience integer,
  hourly_rate numeric,
  is_available boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  total_jobs integer DEFAULT 0,
  location_lat numeric,
  location_lng numeric,
  service_radius_km integer DEFAULT 10,
  profile_id uuid NOT NULL,
  certified boolean DEFAULT false,
  certificates jsonb,
  CONSTRAINT handyman_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT handyman_profiles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- =============================================
-- EARNINGS & TRANSACTIONS TABLES
-- =============================================

-- Platform settings for configurable values
CREATE TABLE public.platform_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT platform_settings_pkey PRIMARY KEY (id)
);

-- Insert default settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('platform_fee_percentage', '{"value": 15}'),
  ('min_withdrawal_amount', '{"value": 20}');

-- Transactions table for earnings and withdrawals
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  handyman_id uuid NOT NULL,
  service_request_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['earning'::text, 'withdrawal'::text])),
  amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) DEFAULT 0,
  net_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_handyman_id_fkey FOREIGN KEY (handyman_id) REFERENCES public.profiles(id),
  CONSTRAINT transactions_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id)
);

-- Withdrawals table for MoMo payouts
CREATE TABLE public.withdrawals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  handyman_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  momo_provider text NOT NULL CHECK (momo_provider = ANY (ARRAY['mtn'::text, 'vodafone'::text, 'airteltigo'::text])),
  momo_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  reference text,
  failure_reason text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT withdrawals_pkey PRIMARY KEY (id),
  CONSTRAINT withdrawals_handyman_id_fkey FOREIGN KEY (handyman_id) REFERENCES public.profiles(id)
);

-- View for handyman balances (computed from transactions)
CREATE OR REPLACE VIEW public.handyman_balances AS
SELECT
  handyman_id,
  COALESCE(SUM(CASE WHEN type = 'earning' AND status = 'completed' THEN net_amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as available_balance,
  COALESCE(SUM(CASE WHEN type = 'earning' AND status = 'completed' THEN net_amount ELSE 0 END), 0) as total_earnings,
  COUNT(CASE WHEN type = 'earning' AND status = 'completed' THEN 1 END) as total_jobs
FROM public.transactions
GROUP BY handyman_id;

-- Payment methods table for storing MoMo details
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  handyman_id uuid NOT NULL,
  momo_provider text NOT NULL CHECK (momo_provider = ANY (ARRAY['mtn'::text, 'vodafone'::text, 'airteltigo'::text])),
  momo_number text NOT NULL,
  account_name text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_handyman_id_fkey FOREIGN KEY (handyman_id) REFERENCES public.profiles(id)
);

-- Ensure only one default payment method per handyman
CREATE UNIQUE INDEX idx_payment_methods_default
ON public.payment_methods(handyman_id)
WHERE is_default = true;

-- Indexes for performance
CREATE INDEX idx_transactions_handyman_id ON public.transactions(handyman_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_withdrawals_handyman_id ON public.withdrawals(handyman_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_payment_methods_handyman_id ON public.payment_methods(handyman_id);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  avatar_url text,
  role text NOT NULL CHECK (role = ANY (ARRAY['customer'::text, 'handyman'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  id_type text,
  id_number text,
  city text,
  region text,
  district text,
  locality text,
  country text DEFAULT 'Ghana'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
