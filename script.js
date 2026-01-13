const goldPriceEl = document.getElementById('goldPrice');
const goldMinusEl = document.getElementById('goldMinusTwo');
const onzasEl = document.getElementById('onzas');
const fetchBtn = document.getElementById('fetchBtn');
const shareBtn = document.getElementById('shareBtn');

const shareCard = document.getElementById('shareCard');
const shareText = document.getElementById('shareText');

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatNYDateTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
}

// ---- PRICE LOGIC ----
function updateMinusThree() {
  const gp = parseFloat(goldPriceEl.value);
  if (!isFinite(gp)) {
    goldMinusEl.value = '';
    return;
  }
  goldMinusEl.value = round2(gp - 3).toFixed(2);
}

goldPriceEl.addEventListener('input', updateMinusThree);
fetchBtn.addEventListener('click', fetchPrice);
shareBtn.addEventListener('click', shareImage);

async function fetchPrice() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU');
    const data = await res.json();
    if (typeof data.price === 'number') {
      goldPriceEl.value = data.price.toFixed(2);
      updateMinusThree();
    }
  } catch (e) {
    alert('Failed to fetch gold price');
  }
}

// ---- SHARE IMAGE ----
function shareImage() {
  const onzas = onzasEl.value;
  const price = goldMinusEl.value;
  if (!onzas || !price) {
    alert('Enter Onzas and fetch price first.');
    return;
  }

  shareText.innerHTML = `
    <div style="font-size:42px;font-weight:700;">
      ${onzas} Onzas @ ${price}
    </div>
    <div style="font-size:22px;opacity:0.85;margin-top:14px;">
      ${formatNYDateTime()}
    </div>
  `;

  html2canvas(shareCard, { scale: 3 }).then(canvas => {
    canvas.toBlob(blob => {
      const file = new File([blob], 'gold-share.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] });
      } else {
        const a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'gold-share.png';
        a.click();
      }
    });
  });
}

// ---- ONZAS BUTTONS (append digits) ----
document.querySelectorAll('.onzas-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    onzasEl.value += btn.dataset.onzas;
  });
});

// Auto-fetch on load
fetchPrice();
