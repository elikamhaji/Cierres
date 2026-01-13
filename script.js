const goldPriceEl = document.getElementById('goldPrice');
const goldMinusTwoEl = document.getElementById('goldMinusTwo');
const onzasEl = document.getElementById('onzas');
const fetchBtn = document.getElementById('fetchBtn');
const shareBtn = document.getElementById('shareBtn');

const shareCard = document.getElementById('shareCard');
const shareText = document.getElementById('shareText');

function round2(n){
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatNYDateTime(){
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

function updateMinusTwo(){
  const gp = parseFloat(goldPriceEl.value);
  if (!isFinite(gp)) {
    goldMinusTwoEl.value = '';
    return;
  }
  const minusTwo = round2(gp - 3);
  goldMinusTwoEl.value = minusTwo.toFixed(2);
}

goldPriceEl.addEventListener('input', updateMinusTwo);
fetchBtn.addEventListener('click', fetchPrice);
shareBtn.addEventListener('click', shareImage);

async function fetchPrice(){
  try{
    const res = await fetch('https://api.gold-api.com/price/XAU');
    const data = await res.json();
    if (typeof data?.price === 'number'){
      goldPriceEl.value = data.price.toFixed(2);
      updateMinusTwo();
    }
  }catch(e){
    console.log('fetch error', e);
  }
}

function buildShareString(){
  const onzas = (onzasEl.value || '').trim();
  const minusTwo = (goldMinusTwoEl.value || '').trim();
  const ny = formatNYDateTime();

  if (!onzas) return null;
  if (!minusTwo) return null;

  return `${onzas} Onzas @ ${minusTwo} ${ny}`;
}

async function shareImage(){
  const text = buildShareString();
  if (!text){
    alert('Enter Onzas and fetch price first.');
    return;
  }

  shareText.textContent = text;

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

// Auto fetch on load
fetchPrice();
