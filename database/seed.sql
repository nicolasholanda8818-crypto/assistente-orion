INSERT OR IGNORE INTO system_metadata (key, value)
VALUES
    ('project_name', 'Orion'),
    ('project_stage', 'pwa-foundation'),
    ('schema_version', '2'),
    ('frontend_type', 'pwa'),
    ('backend_framework', 'fastapi');

INSERT INTO system_metadata (key, value)
VALUES ('schema_version', '2')
ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP;
