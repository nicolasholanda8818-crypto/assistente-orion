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
