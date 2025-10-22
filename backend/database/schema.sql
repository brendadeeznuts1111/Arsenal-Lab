-- Build Configuration Arsenal Database Schema
-- SQLite3 compatible schema

-- Build configurations table
CREATE TABLE IF NOT EXISTS build_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  config_json TEXT NOT NULL,
  preset_type TEXT DEFAULT 'custom',
  user_id TEXT,
  team_id TEXT,
  is_public INTEGER DEFAULT 0,
  is_template INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Build history table
CREATE TABLE IF NOT EXISTS build_history (
  id TEXT PRIMARY KEY,
  config_id TEXT NOT NULL,
  build_name TEXT NOT NULL,
  status TEXT DEFAULT 'building',
  input_files TEXT,
  output_files TEXT,
  performance_metrics TEXT,
  logs TEXT,
  duration_ms INTEGER,
  bundle_size_kb REAL,
  s3_artifact_path TEXT,
  nu_fire_storage_id TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (config_id) REFERENCES build_configs (id) ON DELETE CASCADE
);

-- Build analytics table
CREATE TABLE IF NOT EXISTS build_analytics (
  id TEXT PRIMARY KEY,
  config_id TEXT NOT NULL,
  build_count INTEGER DEFAULT 0,
  total_duration_ms INTEGER DEFAULT 0,
  total_bundle_size_kb REAL DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_performance_impact REAL DEFAULT 0,
  last_build_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (config_id) REFERENCES build_configs (id) ON DELETE CASCADE
);

-- Team collaborators table
CREATE TABLE IF NOT EXISTS team_collaborators (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by TEXT,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_build_configs_user_id ON build_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_build_configs_team_id ON build_configs(team_id);
CREATE INDEX IF NOT EXISTS idx_build_configs_preset_type ON build_configs(preset_type);
CREATE INDEX IF NOT EXISTS idx_build_configs_is_public ON build_configs(is_public);
CREATE INDEX IF NOT EXISTS idx_build_configs_created_at ON build_configs(created_at);

CREATE INDEX IF NOT EXISTS idx_build_history_config_id ON build_history(config_id);
CREATE INDEX IF NOT EXISTS idx_build_history_user_id ON build_history(user_id);
CREATE INDEX IF NOT EXISTS idx_build_history_status ON build_history(status);
CREATE INDEX IF NOT EXISTS idx_build_history_created_at ON build_history(created_at);

CREATE INDEX IF NOT EXISTS idx_build_analytics_config_id ON build_analytics(config_id);

CREATE INDEX IF NOT EXISTS idx_team_collaborators_team_id ON team_collaborators(team_id);
CREATE INDEX IF NOT EXISTS idx_team_collaborators_user_id ON team_collaborators(user_id);
