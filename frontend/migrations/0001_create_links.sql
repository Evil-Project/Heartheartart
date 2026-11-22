CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link TEXT,
  title TEXT,
  description TEXT,
  author TEXT,
  screenshot TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_timestamp_id
  ON links (timestamp DESC, id DESC);
