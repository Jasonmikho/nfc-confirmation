// db.js
const Database = require('better-sqlite3');
const db = new Database('payments.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memo TEXT UNIQUE,
    method TEXT,
    status TEXT DEFAULT 'pending',
    amount TEXT,
    sender TEXT,
    createdAt TEXT,
    confirmedAt TEXT
  )
`).run();

module.exports = {
  addPayment: (memo, method) =>
    db.prepare("INSERT INTO payments (memo, method, createdAt) VALUES (?, ?, datetime('now'))").run(memo, method),

  confirmPayment: (memo, sender, amount) =>
    db.prepare("UPDATE payments SET status='confirmed', sender=?, amount=?, confirmedAt=datetime('now') WHERE memo=?")
      .run(sender, amount, memo),

  findByMemo: (memo) =>
    db.prepare("SELECT * FROM payments WHERE memo=?").get(memo),
};
