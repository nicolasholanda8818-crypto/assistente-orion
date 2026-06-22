CREATE TABLE IF NOT EXISTS system_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS websocket_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL DEFAULT '{}',
    connection_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload_ciphertext BLOB NOT NULL,
    nonce BLOB NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orion_user_profiles (
    user_id TEXT PRIMARY KEY,
    display_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orion_user_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    fact_type TEXT NOT NULL CHECK (fact_type IN ('preference', 'topic', 'project')),
    fact_value TEXT NOT NULL,
    weight INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES orion_user_profiles(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, fact_type, fact_value)
);

CREATE TABLE IF NOT EXISTS orion_user_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'conversation',
    weight INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES orion_user_profiles(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, summary)
);

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
