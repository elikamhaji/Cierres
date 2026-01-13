const goldPriceEl = document.getElementById('goldPrice');
const goldMinusEl = document.getElementById('goldMinus');
const onzasEl = document.getElementById('onzas');

const fetchBtn = document.getElementById('fetchBtn');
const shareBtn = document.getElementById('shareBtn');

const shareCard = document.getElementById('shareCard');
const shareText = document.getElementById('shareText');

const digitButtons = document.querySelectorAll('[data-digit]');
const backspaceBtn = document.getElementById('backspace');

/* Helpers */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatNYTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
}

/* Gold logic */
function updateMinus() {
  const gp = parseFloat(goldPriceEl.value);
  if (!isFinite(gp)) {
    goldMinusEl.value = '';
    return;
  }
  goldMinusEl.value = (gp - 3).toFixed(2);
}

async function fetchPrice() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU');
    const data = await res.json();
    if (typeof data?.price === 'number') {
      goldPriceEl.value = data.price.toFixed(2);
      updateMinus();
    }
  } catch (e) {
    console.error(e);
  }
}

/* Onzas keypad logic */
digitButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    onzasEl.value += btn.dataset.digit;
  });
});

backspaceBtn.addEventListener('click', () => {
  onzasEl.value = onzasEl.value.slice(0, -1);
});

/* Share image */
async function shareImage() {
  const onzas = onzasEl.value;
  const price = goldMinusEl.value;

  if (!onzas || !price) {
    alert('Enter Onzas and fetch price first.');
    return;
  }

  shareText.innerHTML = `
    ${onzas} Onzas @ ${price}<br>
    <span style="font-size:18px;font-weight:500;opacity:0.85">
      ${formatNYTime()}
    </span>
  `;

  const canvas = await html2canvas(shareCard, { scale: 3 });

  canvas.toBlob(async blob => {
    if (!blob) return;

    const file = new File([blob], 'gold-share.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = 'gold-share.png';
      link.click();
    }
  });
}

/* Events */
goldPriceEl.addEventListener('input', updateMinus);
fetchBtn.addEventListener('click', fetchPrice);
shareBtn.addEventListener('click', shareImage);

/* Auto fetch on load */
fetchPrice();
