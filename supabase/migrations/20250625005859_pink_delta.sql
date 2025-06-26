/*
  # Create user capsules table for indexing

  1. New Tables
    - `user_capsules`
      - `id` (bigint, primary key) - matches blockchain capsule ID
      - `title` (text) - capsule title
      - `owner_address` (text) - current owner's wallet address
      - `recipient_address` (text, nullable) - intended recipient address
      - `unlock_method` (text) - unlock method used
      - `content_type` (text) - text or video
      - `metadata_uri` (text, nullable) - IPFS metadata URI
      - `is_unlocked` (boolean) - unlock status
      - `created_at` (timestamptz) - creation timestamp
      - `updated_at` (timestamptz) - last update timestamp
      - `transaction_hash` (text) - creation transaction hash
      - `block_number` (bigint, nullable) - block number of creation

  2. Security
    - Enable RLS on `user_capsules` table
    - Add policies for users to read their own capsules
    - Add policies for authenticated users to insert/update their capsules

  3. Indexes
    - Index on owner_address for fast user queries
    - Index on recipient_address for recipient queries
    - Index on unlock_method for filtering
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS user_capsules (
  id bigint PRIMARY KEY,
  title text NOT NULL,
  owner_address text NOT NULL,
  recipient_address text,
  unlock_method text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  metadata_uri text,
  is_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  transaction_hash text,
  block_number bigint
);

-- Enable Row Level Security
ALTER TABLE user_capsules ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_capsules_owner_address ON user_capsules(owner_address);
CREATE INDEX IF NOT EXISTS idx_user_capsules_recipient_address ON user_capsules(recipient_address);
CREATE INDEX IF NOT EXISTS idx_user_capsules_unlock_method ON user_capsules(unlock_method);
CREATE INDEX IF NOT EXISTS idx_user_capsules_created_at ON user_capsules(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_capsules_is_unlocked ON user_capsules(is_unlocked);

-- RLS Policies

-- Users can read capsules they own or are recipients of
CREATE POLICY "Users can read own capsules"
  ON user_capsules
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'wallet_address' = owner_address OR 
    auth.jwt() ->> 'wallet_address' = recipient_address
  );

-- Users can read all capsules (for public viewing)
CREATE POLICY "Public read access"
  ON user_capsules
  FOR SELECT
  TO anon
  USING (true);

-- Users can insert capsules they create
CREATE POLICY "Users can insert own capsules"
  ON user_capsules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'wallet_address' = owner_address);

-- Users can update capsules they own
CREATE POLICY "Users can update own capsules"
  ON user_capsules
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'wallet_address' = owner_address)
  WITH CHECK (auth.jwt() ->> 'wallet_address' = owner_address);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_capsules_updated_at
    BEFORE UPDATE ON user_capsules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();