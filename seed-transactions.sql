-- Seed transaction for earnings
-- handyman_id: ff67d648-41af-4e04-ac56-82616283ff7d
-- service_request_id: 3a498707-00e3-4c35-90bb-856c6a3e2bd5

INSERT INTO public.transactions (
  handyman_id,
  service_request_id,
  type,
  amount,
  platform_fee,
  net_amount,
  status,
  description,
  created_at
) VALUES (
  'ff67d648-41af-4e04-ac56-82616283ff7d',
  '3a498707-00e3-4c35-90bb-856c6a3e2bd5',
  'earning',
  150.00,           -- Gross amount charged to customer
  22.50,            -- 15% platform fee
  127.50,           -- Net amount handyman receives (150 - 22.50)
  'completed',
  'Payment for completed job',
  NOW()
);
