CREATE TABLE IF NOT EXISTS orion_files (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    original_name TEXT NOT NULL,
    safe_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'geral',
    source TEXT NOT NULL DEFAULT 'upload',
    storage_path TEXT NOT NULL,
    analysis_status TEXT NOT NULL DEFAULT 'pending',
    summary TEXT,
    keywords_json TEXT NOT NULL DEFAULT '[]',
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES orion_user_profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orion_files_user_created
ON orion_files (user_id, created_at DESC);

INSERT INTO system_metadata (key, value)
VALUES ('schema_version', '5')
ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP;
