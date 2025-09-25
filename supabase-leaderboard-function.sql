-- SQL function to calculate leaderboard data for all users
-- This function performs all calculations on the database side for better performance
-- Uses Supabase auth.users table for user information

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  total_portfolio_value_usd NUMERIC,
  total_cost_usd NUMERIC,
  total_profit_loss_usd NUMERIC,
  total_profit_loss_percentage NUMERIC,
  holdings_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_holdings AS (
    SELECT 
      u.id as user_id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as full_name,
      u.created_at,
      -- Calculate total portfolio value (sum of all holdings)
      COALESCE(SUM(
        CASE 
          WHEN uh.total_amount > 0 THEN 
            -- For now, we'll use the cost as current value
            -- In a real app, you'd multiply by current market prices
            uh.total_cost_usd
          ELSE 0
        END
      ), 0) as total_portfolio_value_usd,
      -- Calculate total cost
      COALESCE(SUM(uh.total_cost_usd), 0) as total_cost_usd,
      -- Count of unique holdings
      COUNT(CASE WHEN uh.total_amount > 0 THEN 1 END) as holdings_count
    FROM auth.users u
    LEFT JOIN LATERAL (
      SELECT 
        t.symbol,
        -- Calculate net amount (buys - sells)
        COALESCE(SUM(
          CASE 
            WHEN t.type = 'buy' THEN t.amount::NUMERIC
            WHEN t.type = 'sell' THEN -t.amount::NUMERIC
            ELSE 0
          END
        ), 0) as total_amount,
        -- Calculate total cost for buys only
        COALESCE(SUM(
          CASE 
            WHEN t.type = 'buy' THEN (t.amount * t.price)::NUMERIC
            ELSE 0
          END
        ), 0) as total_cost_usd
      FROM transactions t
      WHERE t.user_id = u.id
      GROUP BY t.symbol
    ) uh ON true
    GROUP BY u.id, u.email, u.raw_user_meta_data, u.created_at
  )
  SELECT 
    uh.user_id,
    uh.email::TEXT,
    uh.full_name::TEXT,
    uh.created_at,
    uh.total_portfolio_value_usd,
    uh.total_cost_usd,
    -- Calculate profit/loss
    (uh.total_portfolio_value_usd - uh.total_cost_usd) as total_profit_loss_usd,
    -- Calculate profit/loss percentage
    CASE 
      WHEN uh.total_cost_usd > 0 THEN 
        ((uh.total_portfolio_value_usd - uh.total_cost_usd) / uh.total_cost_usd * 100)
      ELSE 0
    END as total_profit_loss_percentage,
    uh.holdings_count
  FROM user_holdings uh
  WHERE uh.total_portfolio_value_usd > 0 OR uh.holdings_count > 0  -- Only include users with activity
  ORDER BY uh.total_portfolio_value_usd DESC;
END;
$$ SECURITY DEFINER;
