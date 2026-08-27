-- Αιτήματα προσωπικού (tickets)
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- 'proslipseis' | 'adeies' | 'bebaioseis'
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  details TEXT,                     -- ελεύθερο κείμενο / παρατηρήσεις αιτούντα
  fields_json TEXT,                 -- πρόσθετα πεδία ανά κατηγορία (JSON string)
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'done'
  admin_note TEXT,                  -- σημείωση/απάντηση από τον admin
  archived INTEGER NOT NULL DEFAULT 0,  -- 1 = αρχειοθετημένο (κρύβεται από τη βασική λίστα, δεν διαγράφεται)
  access_token TEXT NOT NULL,       -- μυστικό token ώστε ο αιτών να ελέγχει το αίτημά του χωρίς login
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_access_token ON tickets(access_token);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_archived ON tickets(archived);

-- Συνημμένα αρχεία (είτε τα ανεβάζει ο αιτών, είτε ο admin ως απάντηση)
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  uploaded_by TEXT NOT NULL,        -- 'staff' | 'admin'
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attachments_ticket ON attachments(ticket_id);
