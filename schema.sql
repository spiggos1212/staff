CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  attending INTEGER NOT NULL,        -- 1 = θα έρθει, 0 = δεν θα έρθει
  guest_count INTEGER NOT NULL DEFAULT 1,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Στοιχεία της πρόσκλησης (μονή γραμμή, id πάντα 1), επεξεργάσιμα από το admin.
CREATE TABLE IF NOT EXISTS invitation (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  groom_name TEXT NOT NULL,
  groom_surname TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  bride_surname TEXT NOT NULL,
  event_date TEXT NOT NULL,          -- 'YYYY-MM-DD'
  event_time TEXT NOT NULL,          -- 'HH:MM'
  venue TEXT NOT NULL,
  kb_bride TEXT NOT NULL,
  kb_groom TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO invitation
  (id, groom_name, groom_surname, bride_name, bride_surname, event_date, event_time, venue, kb_bride, kb_groom)
VALUES
  (1, 'Ιωσήφ', 'Χριστιανάκης', 'Ναταλία', 'Παπαζαχαρίου', '2027-07-10', '19:00', 'Κτήμα Κλεοπάτρα', 'Κάτια Τουρκομάνη', 'Μάνος Γιαννουσάκης');
