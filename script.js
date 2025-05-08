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
        const res = await fetch(`http://localhost:3000/check-payment?memo=${memo}`);
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
  
  // === Cash App Pay Init ===
  async function initializeCashAppPay() {
    const memo = getMemo();
    const memoEl = document.getElementById('memo');
    if (memoEl) memoEl.textContent = memo;
    copyMemo(); // Auto-copy
  
    if (!window.Square) {
      alert('Square Web Payments SDK failed to load.');
      return;
    }
  
    const payments = window.Square.payments('sandbox-sq0idb-Wxe_ATUmje7sHXMCfPyZfw', 'LNCJT5NTH3KNV');
  
    const paymentRequest = payments.paymentRequest({
      countryCode: 'US',
      currencyCode: 'USD',
      total: {
        amount: '0.01',
        label: 'Total',
      },
    });
  
    const options = {
      redirectURL: window.location.href,
      referenceId: memo,
    };
  
    try {
      const cashAppPay = await payments.cashAppPay(paymentRequest, options);
  
      cashAppPay.addEventListener('ontokenization', async (event) => {
        const { tokenResult } = event.detail;
        if (tokenResult.status === 'OK') {
          try {
            const res = await fetch('https://square-api-server.onrender.com/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: 0.01,
                memo,
                source_id: tokenResult.token
              })
            });
  
            const data = await res.json();
            if (data.payment?.status === 'COMPLETED') {
              window.location.href = `payment-success.html?memo=${memo}`;
            } else {
              window.location.href = `payment-failed.html?memo=${memo}`;
            }
          } catch (err) {
            console.error('Payment processing error:', err);
            alert('Payment failed. Try again.');
          }
        } else {
          console.error('Tokenization failed:', tokenResult);
          alert('Tokenization failed.');
        }
      });
  
      await cashAppPay.attach('#cash-app-pay-button', {
        shape: 'semiround',
        width: 'full'
      });
    } catch (e) {
      console.error('Cash App Pay initialization failed:', e);
      alert('Cash App Pay is not supported or failed to initialize.');
    }
  }
  
  // === Init on Load ===
  window.addEventListener('DOMContentLoaded', initializeCashAppPay);
  