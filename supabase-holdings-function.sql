-- SQL function to calculate user holdings from transactions
-- This function performs all calculations on the database side for better performance

CREATE OR REPLACE FUNCTION get_user_holdings(user_id_param UUID)
RETURNS TABLE (
  symbol TEXT,
  total_amount NUMERIC,
  average_price NUMERIC,
  total_cost_usd NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH transaction_totals AS (
    SELECT 
      t.symbol,
      -- Calculate net amount (buys - sells)
      COALESCE(SUM(
        CASE 
          WHEN t.type = 'buy' THEN t.amount::NUMERIC
          WHEN t.type = 'sell' THEN -t.amount::NUMERIC
          ELSE 0
        END
      ), 0) as net_amount,
      -- Calculate total cost for buys only
      COALESCE(SUM(
        CASE 
          WHEN t.type = 'buy' THEN (t.amount * t.price)::NUMERIC
          ELSE 0
        END
      ), 0) as total_buy_cost,
      -- Calculate total amount from buys only (for average price calculation)
      COALESCE(SUM(
        CASE 
          WHEN t.type = 'buy' THEN t.amount::NUMERIC
          ELSE 0
        END
      ), 0) as total_buy_amount
    FROM transactions t
    WHERE t.user_id = user_id_param
    GROUP BY t.symbol
  )
  SELECT 
    tt.symbol::TEXT,
    tt.net_amount as total_amount,
    CASE 
      WHEN tt.total_buy_amount > 0 THEN (tt.total_buy_cost / tt.total_buy_amount)::NUMERIC
      ELSE 0::NUMERIC
    END as average_price,
    tt.total_buy_cost as total_cost_usd
  FROM transaction_totals tt
  WHERE tt.net_amount > 0  -- Only return holdings with positive amounts
  ORDER BY tt.net_amount DESC;
END;
$$;
