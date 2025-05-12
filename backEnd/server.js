// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3202;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: '*/*' })); // Required for Mailgun plain text bodies

// === GET /check-payment?memo=BARBER-XYZ ===
app.get('/check-payment', (req, res) => {
  const memo = req.query.memo;
  if (!memo) return res.status(400).json({ confirmed: false });

  const payment = db.findByMemo(memo);
  const confirmed = payment?.status === 'confirmed';

  res.json({ confirmed });
});

// === POST /start-payment ===
app.post('/start-payment', (req, res) => {
  const { memo, method } = req.body;
  if (!memo || !method) return res.status(400).json({ ok: false });

  try {
    db.addPayment(memo, method);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// === POST /parse-email (Mailgun webhook) ===
app.post('/parse-email', (req, res) => {
  console.log('📩 /parse-email HIT');
  console.log('🔍 Request body keys:', Object.keys(req.body));

  // Mailgun sends the plain body in 'body-plain' or 'stripped-text'
  const raw = req.body['body-plain'] || req.body['stripped-text'];

  if (!raw || typeof raw !== 'string') {
    console.log('❌ Invalid or missing email body:', raw);
    return res.status(400).end();
  }

  const memoMatch = raw.match(/BARBER-[A-Z0-9]+/);
  const amountMatch = raw.match(/\$([\d.]+)/);
  const senderMatch = raw.match(/from (.+?) via/) || raw.match(/from (.+?) sent you/);

  if (!memoMatch) {
    console.log('❌ No memo found in email.');
    return res.status(200).end();
  }

  const memo = memoMatch[0];
  const amount = amountMatch?.[1] || '';
  const sender = senderMatch?.[1] || 'Unknown';

  db.confirmPayment(memo, sender, amount);
  console.log(`✅ [MAILGUN] Confirmed ${memo} from ${sender} for $${amount}`);

  res.status(200).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
