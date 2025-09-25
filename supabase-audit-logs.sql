-- Create audit logs table in Supabase
-- This table tracks all user CRUD operations for transactions

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('import', 'create', 'update', 'delete')),
  entity_type VARCHAR(20) NOT NULL DEFAULT 'transaction',
  entity_id UUID,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create a function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR(20),
  p_description TEXT,
  p_entity_type VARCHAR(20) DEFAULT 'transaction',
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description,
    old_values,
    new_values,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_description,
    p_old_values,
    p_new_values,
    p_metadata,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get audit logs with pagination
CREATE OR REPLACE FUNCTION get_user_audit_logs(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_action_filter VARCHAR(20) DEFAULT NULL,
  p_entity_type_filter VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  action VARCHAR(20),
  entity_type VARCHAR(20),
  entity_id UUID,
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  total_records BIGINT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_records
  FROM audit_logs
  WHERE user_id = p_user_id
    AND (p_action_filter IS NULL OR action = p_action_filter)
    AND (p_entity_type_filter IS NULL OR entity_type = p_entity_type_filter);

  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.description,
    al.old_values,
    al.new_values,
    al.metadata,
    al.ip_address,
    al.user_agent,
    al.created_at,
    total_records
  FROM audit_logs al
  WHERE al.user_id = p_user_id
    AND (p_action_filter IS NULL OR al.action = p_action_filter)
    AND (p_entity_type_filter IS NULL OR al.entity_type = p_entity_type_filter)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ SECURITY DEFINER;

-- Create trigger function for INSERT operations
CREATE OR REPLACE FUNCTION audit_transaction_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description,
    new_values,
    metadata
  ) VALUES (
    NEW.user_id,
    'create',
    'transaction',
    NEW.id,
    'Created transaction: ' || NEW.symbol || ' (' || NEW.type || ')',
    to_jsonb(NEW),
    jsonb_build_object(
      'symbol', NEW.symbol,
      'type', NEW.type,
      'amount', NEW.amount,
      'price', NEW.price,
      'network', NEW.network,
      'transaction_id', NEW.transaction_id,
      'file_name', NEW.file_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for UPDATE operations
CREATE OR REPLACE FUNCTION audit_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if there are actual changes
  IF OLD IS DISTINCT FROM NEW THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      old_values,
      new_values,
      metadata
    ) VALUES (
      NEW.user_id,
      'update',
      'transaction',
      NEW.id,
      'Updated transaction: ' || NEW.symbol || ' (' || NEW.type || ')',
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'symbol', NEW.symbol,
        'type', NEW.type,
        'changed_fields', (
          SELECT jsonb_agg(new_data.key)
          FROM jsonb_each(to_jsonb(NEW)) AS new_data
          JOIN jsonb_each(to_jsonb(OLD)) AS old_data ON new_data.key = old_data.key
          WHERE new_data.value IS DISTINCT FROM old_data.value
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for DELETE operations
CREATE OR REPLACE FUNCTION audit_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description,
    old_values,
    metadata
  ) VALUES (
    OLD.user_id,
    'delete',
    'transaction',
    OLD.id,
    'Deleted transaction: ' || OLD.symbol || ' (' || OLD.type || ')',
    to_jsonb(OLD),
    jsonb_build_object(
      'symbol', OLD.symbol,
      'type', OLD.type,
      'amount', OLD.amount,
      'price', OLD.price,
      'network', OLD.network,
      'transaction_id', OLD.transaction_id,
      'file_name', OLD.file_name
    )
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers on transactions table
DROP TRIGGER IF EXISTS audit_transaction_insert_trigger ON transactions;
CREATE TRIGGER audit_transaction_insert_trigger
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION audit_transaction_insert();

DROP TRIGGER IF EXISTS audit_transaction_update_trigger ON transactions;
CREATE TRIGGER audit_transaction_update_trigger
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION audit_transaction_update();

DROP TRIGGER IF EXISTS audit_transaction_delete_trigger ON transactions;
CREATE TRIGGER audit_transaction_delete_trigger
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION audit_transaction_delete();

-- Create a function to log CSV import activities (for bulk operations)
CREATE OR REPLACE FUNCTION log_csv_import_activity(
  p_user_id UUID,
  p_file_name TEXT,
  p_transaction_count INTEGER,
  p_symbols TEXT[]
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'import',
    'transaction',
    'Imported ' || p_transaction_count || ' transactions from ' || p_file_name,
    jsonb_build_object(
      'fileName', p_file_name,
      'transactionCount', p_transaction_count,
      'symbols', p_symbols,
      'importType', 'csv'
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
