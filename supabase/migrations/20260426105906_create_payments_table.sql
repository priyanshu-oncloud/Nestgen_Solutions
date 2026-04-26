/*
  # Create payments table for Razorpay integration

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `razorpay_order_id` (text, unique)
      - `razorpay_payment_id` (text, nullable)
      - `razorpay_signature` (text, nullable)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `position` (text)
      - `amount` (integer, in paise)
      - `currency` (text, default 'INR')
      - `status` (text, default 'created')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payments` table
    - Allow authenticated users to read their own payments
    - Allow service role full access for edge functions
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id text UNIQUE NOT NULL,
  razorpay_payment_id text,
  razorpay_signature text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text,
  amount integer NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'created',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own payments by email"
  ON payments FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');
