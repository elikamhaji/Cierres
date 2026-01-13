const goldPriceEl = document.getElementById('goldPrice');
const goldMinusTwoEl = document.getElementById('goldMinusTwo'); // internal minus-3 value
const onzasEl = document.getElementById('onzas');
const fetchBtn = document.getElementById('fetchBtn');
const shareBtn = document.getElementById('shareBtn');

const shareCard = document.getElementById('shareCard');
const shareText = document.getElementById('shareText');

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatNYDateTime() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return fmt.format(new Date());
}

function updateMinusThree() {
  const gp = parseFloat(goldPriceEl.value);
  if (!isFinite(gp)) {
    goldMinusTwoEl.value = '';
    return;
  }

  const minusThree = round2(gp - 3);
  goldMinusTwoEl.value = minusThree.toFixed(2);
}

goldPriceEl.addEventListener('input', updateMinusThree);
fetchBtn.addEventListener('click', fetchPrice);
shareBtn.addEventListener('click', shareImage);

async function fetchPrice() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU');
    const data = await res.json();

    if (typeof data?.price === 'number') {
      goldPriceEl.value = data.price.toFixed(2);
      updateMinusThree();
    }
  } catch (e) {
    console.error('Gold fetch error:', e);
  }
}

function buildShareData() {
  const onzas = (onzasEl.value || '').trim();
  const price = (goldMinusTwoEl.value || '').trim();
  const ny = formatNYDateTime();

  if (!onzas || !price) return null;

  return {
    line1: `${onzas} Onzas @ ${price}`,
    line2: ny
  };
}

async function shareImage() {
  const data = buildShareData();
  if (!data) {
    alert('Enter Onzas and fetch price first.');
    return;
  }

  // Two-line layout (clean + intentional)
  shareText.innerHTML = `
    <div style="font-size:42px; font-weight:700; line-height:1.2;">
      ${data.line1}
    </div>
    <div style="font-size:22px; opacity:0.85; margin-top:12px;">
      ${data.line2}
    </div>
  `;

  const canvas = await html2canvas(shareCard, { scale: 3 });

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const file = new File([blob], 'gold-share.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'gold-share.png';
      link.click();
    }
  });
}

// Auto-fetch on page load
fetchPrice();
