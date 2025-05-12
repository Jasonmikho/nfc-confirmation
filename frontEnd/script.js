// === Memo Utilities ===
function generateMemo() {
    const prefix = 'BARBER';
    const timestamp = Date.now().toString(36).toUpperCase(); // base-36 timestamp
    return `${prefix}-${timestamp}`;
  }
  
  function getMemo() {
    const params = new URLSearchParams(window.location.search);
    let memo = params.get('memo');
    if (!memo) {
      memo = generateMemo();
      params.set('memo', memo);
      window.location.search = params.toString(); // reload w/ memo
    }
    return memo;
  }

  function redirect(method) {
    const memo = getMemo();
    window.location.href = `${method}.html?memo=${memo}`;
  }  
  
  function copyMemo() {
    const memo = getMemo();
    navigator.clipboard.writeText(memo).then(() => {
      console.log('Memo copied to clipboard:', memo);
    }).catch(err => {
      console.error('Failed to copy memo:', err);
    });
  }
  
function goToPolling() {
  const memo = getMemo();
  const method = window.location.pathname.includes("cashapp") ? "cashapp" : "venmo";
  const statusEl = document.getElementById('status');
  const spinner = document.getElementById('spinner');

  if (statusEl) statusEl.textContent = 'Checking for payment...';
  if (spinner) spinner.style.display = 'block';

  fetch("https://nfc-confirmation.onrender.com/start-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memo, method, amount: "0.01" })
  })
    .then(res => res.text())
    .then(text => {
      console.log("✅ Payment registered:", text);
      pollForMemo();
    })
    .catch(err => {
      console.error("❌ Error starting payment:", err);
    });
}
  
  function openVenmo() {
    const memo = getMemo();
    const venmoLink = `venmo://paycharge?txn=pay&recipients=YourVenmoUsername&amount=0.01&note=${encodeURIComponent(memo)}`;
    const appStoreLink = 'https://apps.apple.com/us/app/venmo-send-receive-money/id351727428';
  
    const timeout = setTimeout(() => {
      window.location = appStoreLink;
    }, 1500);
  
    window.location = venmoLink;
  
    window.addEventListener('blur', () => {
      clearTimeout(timeout);
    });
  }
  
  function setMemoInView() {
    const memo = getMemo();
    const elem = document.getElementById('memo');
    if (elem) elem.textContent = memo;
  
    const input = document.getElementById('memoInput');
    if (input) input.value = memo;
  }

async function registerAndPoll() {
  const memo = getMemo();
  const method = window.location.pathname.includes("cashapp") ? "cashapp" : "venmo";
  console.log("🔸 registerAndPoll() triggered");
  console.log("Memo:", memo, "| Method:", method);

  try {
    const res = await fetch("https://nfc-confirmation.onrender.com/start-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo, method, amount: "0.01" })
    });
    const text = await res.text(); // In case server doesn't return JSON
    console.log("✅ start-payment response:", text);

    const statusEl = document.getElementById('status');
if (statusEl) statusEl.textContent = 'Checking for payment...';
const spinner = document.getElementById('spinner');
if (spinner) spinner.style.display = 'block';

pollForMemo();

  } catch (err) {
    console.error("❌ registerAndPoll() failed:", err);
  }
}

function goToPolling() {
  registerAndPoll();
}
  
  // === Polling logic (used on polling page) ===
  async function pollForMemo() {
  const memo = getMemo();
  const statusEl = document.getElementById('status');
  const spinner = document.getElementById('spinner');
  if (!memo || !statusEl) return;

  console.log("🔁 pollForMemo() starting for memo:", memo);

  let attempts = 0;
  const maxAttempts = 12;

  const poll = setInterval(async () => {
    try {
      console.log(`⏳ Attempt ${attempts + 1}: checking ${memo}`);
      const res = await fetch(`https://nfc-confirmation.onrender.com/check-payment?memo=${memo}`);
      const data = await res.json();
      console.log("📩 poll result:", data);

      if (data.confirmed) {
        console.log("✅ Payment confirmed. Redirecting...");
        clearInterval(poll);
        window.location.href = `payment-success.html?memo=${memo}`;
      } else if (++attempts >= maxAttempts) {
        console.warn("⚠️ Max attempts reached. Redirecting to failure.");
        clearInterval(poll);
        window.location.href = `payment-failed.html?memo=${memo}`;
      } else {
        statusEl.textContent = `Still checking... (${attempts} of ${maxAttempts})`;
      }
    } catch (err) {
      console.error("❌ Error during polling:", err);
      clearInterval(poll);
      statusEl.textContent = 'Something went wrong. Try again later.';
      if (spinner) spinner.style.display = 'none';
    }
  }, 5000);
}
  
  // === Cash App Open ===
  function openCashApp() {
    const memo = getMemo();
    const amount = 0.01; // in dollars
    const recipient = 'eshoangelo'; // replace with your actual $cashtag (no $ symbol)
  
    const cashAppLink = `https://cash.app/${recipient}`;
    const appStoreLink = 'https://apps.apple.com/us/app/cash-app/id711923939';
  
    const timeout = setTimeout(() => {
      window.location = appStoreLink; // fallback if app isn't installed
    }, 1500);
  
    window.location = cashAppLink;
  
    window.addEventListener('blur', () => {
      clearTimeout(timeout); // clear fallback if app opened
    });
  }  
  