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
