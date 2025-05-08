const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // 👈 allows all origins

let attempts = 0;

app.get('/check-payment', (req, res) => {
  const { memo } = req.query;
  console.log(`Checking payment for memo: ${memo} [Attempt ${attempts + 1}]`);

  if (++attempts >= 4) {
    res.json({ confirmed: true });
  } else {
    res.json({ confirmed: false });
  }
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
