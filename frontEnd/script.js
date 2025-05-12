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
    window.location.href = `poll.html?memo=${memo}`;
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

let postSent = false;
(async () => {
  const memo = getMemo();
  if (postSent) return;
  postSent = true;
  const method = window.location.pathname.includes("cashapp") ? "cashapp" : "venmo";
  try {
    await fetch("https://3e22-2601-410-8680-a340-6ce8-63e2-b1d7-9be2.ngrok-free.app/start-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo, method, amount: "0.01" })
    });
    console.log("Payment intent registered with backend:", memo);
  } catch (err) {
    console.error("Failed to register payment intent:", err);
  }
})();
  
  // === Polling logic (used on polling page) ===
  async function pollForMemo() {
    const memo = getMemo();
    const statusEl = document.getElementById('status');
    const spinner = document.getElementById('spinner');
    if (!memo || !statusEl) return;
  
    let attempts = 0;
    const maxAttempts = 12;
  
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`https://3e22-2601-410-8680-a340-6ce8-63e2-b1d7-9be2.ngrok-free.app/check-payment?memo=${memo}`);
        const { confirmed } = await res.json();
  
        if (confirmed) {
          clearInterval(poll);
          window.location.href = 'payment-success.html?memo=' + memo;
        } else if (++attempts >= maxAttempts) {
          clearInterval(poll);
          window.location.href = 'payment-failed.html?memo=' + memo;
        } else {
          statusEl.textContent = `Still checking... (${attempts} of ${maxAttempts})`;
        }
      } catch (err) {
        clearInterval(poll);
        statusEl.textContent = 'Something went wrong. Try again later.';
        spinner.style.display = 'none';
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
  