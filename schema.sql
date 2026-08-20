CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  attending INTEGER NOT NULL,        -- 1 = θα έρθει, 0 = δεν θα έρθει
  guest_count INTEGER NOT NULL DEFAULT 1,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
