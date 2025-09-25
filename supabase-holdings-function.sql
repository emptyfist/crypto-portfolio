-- SQL function to calculate user holdings from transactions with real-time prices
-- This function performs all calculations on the database side for better performance

CREATE OR REPLACE FUNCTION get_user_holdings(user_id_param UUID)
RETURNS TABLE (
  symbol TEXT,
  total_amount NUMERIC,
  average_price NUMERIC,
  total_cost_usd NUMERIC,
  current_price_usd NUMERIC,
  total_value_usd NUMERIC,
  profit_loss_usd NUMERIC,
  profit_loss_percentage NUMERIC
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
    tt.total_buy_cost as total_cost_usd,
    COALESCE(tp.price_usd, 0)::NUMERIC as current_price_usd,
    (tt.net_amount * COALESCE(tp.price_usd, 0))::NUMERIC as total_value_usd,
    ((tt.net_amount * COALESCE(tp.price_usd, 0)) - tt.total_buy_cost)::NUMERIC as profit_loss_usd,
    CASE 
      WHEN tt.total_buy_cost > 0 THEN 
        (((tt.net_amount * COALESCE(tp.price_usd, 0)) - tt.total_buy_cost) / tt.total_buy_cost * 100)::NUMERIC
      ELSE 0::NUMERIC
    END as profit_loss_percentage
  FROM transaction_totals tt
  LEFT JOIN token_prices tp ON UPPER(tt.symbol) = UPPER(tp.symbol)
  WHERE tt.net_amount > 0  -- Only return holdings with positive amounts
  ORDER BY (tt.net_amount * COALESCE(tp.price_usd, 0)) DESC;
END;
$$ SECURITY DEFINER;
