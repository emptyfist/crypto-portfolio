-- Create price tracking table in Supabase
-- This table stores current USD prices for cryptocurrency tokens

CREATE TABLE IF NOT EXISTS token_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price_usd DECIMAL(20, 8) NOT NULL CHECK (price_usd > 0),
  market_cap_usd BIGINT,
  volume_24h_usd BIGINT,
  price_change_24h DECIMAL(10, 4),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_prices_symbol ON token_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_token_prices_last_updated ON token_prices(last_updated);

-- Create unique constraint to prevent duplicate symbols
CREATE UNIQUE INDEX IF NOT EXISTS idx_token_prices_symbol_unique ON token_prices(symbol);

-- Enable Row Level Security (RLS)
ALTER TABLE token_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all authenticated users to read prices
CREATE POLICY "Anyone can view token prices" ON token_prices
  FOR SELECT USING (true);

-- Create policy to allow service role to insert/update prices
CREATE POLICY "Service role can manage token prices" ON token_prices
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to update or insert token prices
CREATE OR REPLACE FUNCTION upsert_token_price(
  p_symbol VARCHAR(10),
  p_name VARCHAR(100),
  p_price_usd DECIMAL(20, 8),
  p_market_cap_usd BIGINT DEFAULT NULL,
  p_volume_24h_usd BIGINT DEFAULT NULL,
  p_price_change_24h DECIMAL(10, 4) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO token_prices (
    symbol,
    name,
    price_usd,
    market_cap_usd,
    volume_24h_usd,
    price_change_24h,
    last_updated
  ) VALUES (
    p_symbol,
    p_name,
    p_price_usd,
    p_market_cap_usd,
    p_volume_24h_usd,
    p_price_change_24h,
    NOW()
  )
  ON CONFLICT (symbol) 
  DO UPDATE SET
    name = EXCLUDED.name,
    price_usd = EXCLUDED.price_usd,
    market_cap_usd = EXCLUDED.market_cap_usd,
    volume_24h_usd = EXCLUDED.volume_24h_usd,
    price_change_24h = EXCLUDED.price_change_24h,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current price for a symbol
CREATE OR REPLACE FUNCTION get_token_price(p_symbol VARCHAR(10))
RETURNS DECIMAL(20, 8) AS $$
DECLARE
  price DECIMAL(20, 8);
BEGIN
  SELECT price_usd INTO price
  FROM token_prices
  WHERE symbol = UPPER(p_symbol)
  ORDER BY last_updated DESC
  LIMIT 1;
  
  RETURN COALESCE(price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some initial mock data for common tokens
INSERT INTO token_prices (symbol, name, price_usd, market_cap_usd, volume_24h_usd, price_change_24h) VALUES
('BTC', 'Bitcoin', 50000.00, 980000000000, 25000000000, 2.5),
('ETH', 'Ethereum', 3200.00, 385000000000, 15000000000, -1.2),
('BNB', 'Binance Coin', 580.00, 87000000000, 1800000000, 0.8),
('ADA', 'Cardano', 0.45, 15500000000, 800000000, -0.5),
('SOL', 'Solana', 95.00, 41000000000, 1200000000, 3.2),
('DOT', 'Polkadot', 6.80, 8000000000, 400000000, 1.1),
('MATIC', 'Polygon', 0.85, 7800000000, 350000000, -0.8),
('AVAX', 'Avalanche', 28.50, 11000000000, 600000000, 2.3),
('LINK', 'Chainlink', 14.20, 7800000000, 450000000, 0.9),
('UNI', 'Uniswap', 6.50, 4900000000, 180000000, -1.5),
('ATOM', 'Cosmos', 8.90, 2600000000, 120000000, 1.8),
('LTC', 'Litecoin', 72.00, 5300000000, 280000000, 0.3),
('XRP', 'XRP', 0.52, 28000000000, 1500000000, -2.1),
('DOGE', 'Dogecoin', 0.08, 11000000000, 800000000, 5.2),
('SHIB', 'Shiba Inu', 0.000008, 4700000000, 120000000, -3.1),
('USDT', 'Tether', 1.00, 95000000000, 45000000000, 0.01),
('USDC', 'USD Coin', 1.00, 32000000000, 8500000000, 0.01),
('BUSD', 'Binance USD', 1.00, 7000000000, 2100000000, 0.01),
('DAI', 'Dai', 1.00, 4800000000, 950000000, 0.02)
ON CONFLICT (symbol) DO NOTHING;
