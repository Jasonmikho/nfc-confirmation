
# 💸 NFC Web Payment Flow — Cash App Pay + Memo Verification

This project enables customers to pay via **Cash App** using an NFC-enabled tag that launches a **mobile-friendly web flow**. The system handles payment through **Square’s Web Payments SDK** and verifies completion by tracking the **memo field**.

---

## 🧠 How It Works

### 🔁 Customer Flow
1. Customer taps NFC tag → opens landing page.
2. Selects payment method (e.g., Cash App).
3. A unique **memo** is generated and displayed (e.g., `BARBER-8FJ29K`).
4. Taps **“Pay with Cash App”**.
5. Cash App opens and pre-fills:
   - $ amount
   - Memo
6. Customer completes payment in Cash App.
7. Returns to site and taps “I’ve Paid.”
8. Web app polls backend to verify the memo was used.
9. Shows **success** or **receipt upload fallback** if no match.

---

## 🧩 Project Structure

project-root/
├── index.html                 # Landing page (select payment method)
├── cashapp.html               # Main Cash App Pay integration page
├── poll.html                  # Polling screen after "I’ve Paid"
├── payment-success.html       # Payment success screen
├── payment-failed.html        # Fallback if memo isn’t found
├── style.css                  # Shared styling
├── script.js                  # Shared JS logic (memo handling, polling)
├── server.js                  # Express backend for Square Payments API
├── .env                       # (local only) Square access token & location ID
├── README.md                  # You're here

---

## 🚀 Deployment

### 🖥️ Frontend (static)
Deploy `*.html`, `style.css`, `script.js` to a static host:
- Netlify
- Vercel
- Render static sites

Make sure it runs over HTTPS.

### ⚙️ Backend (`server.js`)
Deploy on Render as a **Web Service** (Node.js).

#### 🔑 Environment Variables (in Render dashboard):
| Key                   | Value                             |
|----------------------|-----------------------------------|
| `SQUARE_ACCESS_TOKEN`| Your Square **production** token  |
| `SQUARE_LOCATION_ID` | Your **location ID**              |

In `server.js`, it pulls these via `process.env`.

---

## 🛠️ Usage

### 1. Open `index.html`
Tap or visit the landing page. It generates a unique memo and forwards to `cashapp.html`.

### 2. `cashapp.html`
- Shows memo and amount
- Auto-copies memo
- Renders Cash App Pay button (via Square)
- On success, sends payment request to backend
- Redirects to success/fail page

### 3. `poll.html`
If user manually paid through Cash App:
- Clicks “I’ve Paid”
- Page polls backend (`/check-payment?memo=BARBER-XXX`)
- Redirects to success or failure page

---

## 📦 API Endpoints

### `POST /payments`
- Used by frontend after Cash App tokenization
- Payload:
  ```json
  {
    "amount": 0.01,
    "memo": "BARBER-XXXX",
    "source_id": "<token_from_square_sdk>"
  }
  ```

### `GET /check-payment?memo=BARBER-XXXX`
- (You will implement this if not already)
- Backend checks whether a payment with the given memo exists

---

## 🔐 Notes

- App ID and Location ID in frontend must match Square **production** credentials.
- App must be registered on Square with **Cash App Pay enabled**.
- `cashapp.html` uses the production Square SDK:
  ```html
  <script src="https://web.squarecdn.com/v1/square.js"></script>
  ```

---

## 💬 Example Square Setup (Production)

- App ID: `sq0idp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Location ID: `LNCJT5NTH3KNV`
- Access Token: (set in Render only)

---

## ✅ To Do

- Hella shit

---

## 🧼 Local Development

```bash
# install deps
npm install

# run square server
node server.js

# run on mobile
ngrok http 5500

```

Set up `.env` file locally:
```
SQUARE_ACCESS_TOKEN=your_token
SQUARE_LOCATION_ID=your_location
```

Use a tool like `ngrok` to expose your local server if needed for webhook testing.
