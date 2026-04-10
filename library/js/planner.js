let activeStatusFilter = null;
let activePackCard = null;

async function init() {
  await loadData();
  renderStatusFilterButtons();
  renderPackGrid();
}

function renderStatusFilterButtons() {
  const container = document.getElementById('statusFilterButtons');
  const statusTypes = getStatusTypes();

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn filter-btn--active';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => {
    setActiveFilter(null, allBtn);
  });
  container.appendChild(allBtn);

  statusTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = type;
    btn.addEventListener('click', () => {
      setActiveFilter(type, btn);
    });
    container.appendChild(btn);
  });
}

function setActiveFilter(type, clickedBtn) {
  document.querySelectorAll('#statusFilterButtons .filter-btn').forEach(b =>
    b.classList.remove('filter-btn--active')
  );
  clickedBtn.classList.add('filter-btn--active');

  activeStatusFilter = type;

  renderPackGrid();

  if (activePackCard) {
    const packId = activePackCard.dataset.packId;
    const pack = getPackById(packId);
    if (pack) populateRightPanel(pack);
  }
}

function renderPackGrid() {
  const grid = document.getElementById('packGrid');
  grid.innerHTML = '';

  const packs = getFilteredPacks();

  if (packs.length === 0) {
    grid.innerHTML = '<p class="no-content">No packs found for this status type.</p>';
    return;
  }

  packs.forEach(pack => {
    const card = createPackCard(pack);
    grid.appendChild(card);
  });
}

function getFilteredPacks() {
  if (!activeStatusFilter) return packsData;

  return packsData.filter(pack => {
    if (pack.exclusiveGifts.length === 0) return false;
    return pack.exclusiveGifts.some(giftId => {
      const gift = getGiftById(giftId);
      return gift && gift.statusTypes.includes(activeStatusFilter);
    });
  });
}

function createPackCard(pack) {
  const card = document.createElement('div');
  card.className = 'pack-card';
  card.dataset.packId = pack.id;

  const img = document.createElement('img');
  img.className = 'pack-card-image';
  img.src = pack.image;
  img.alt = `${pack.name} theme pack`;
  img.loading = 'lazy';

  img.onerror = () => {
    const fallback = document.createElement('div');
    fallback.className = 'placeholder-img placeholder-img--rect';
    img.replaceWith(fallback);
  };

  card.appendChild(img);

  card.addEventListener('click', () => {
    if (activePackCard) {
      activePackCard.classList.remove('pack-card--active');
    }
    card.classList.add('pack-card--active');
    activePackCard = card;
    populateRightPanel(pack);
  });

  return card;
}

function populateRightPanel(pack) {
  document.getElementById('plannerRightDefault').hidden = true;
  document.getElementById('plannerRightDetail').hidden = false;

  document.getElementById('detailPackName').textContent = pack.name;

  document.getElementById('detailPackFloors').textContent =
    `Available on: ${formatFloors(pack.floors)}`;

  const bossContainer = document.getElementById('detailPackBoss');
  bossContainer.innerHTML = '';
  const bossLabel = document.createElement('p');
  bossLabel.className = 'boss-label';
  bossLabel.textContent = pack.boss.length > 1 ? 'Bosses:' : 'Boss:';
  bossContainer.appendChild(bossLabel);
  pack.boss.forEach(bossName => {
    const span = document.createElement('span');
    span.className = 'boss-name';
    span.textContent = bossName;
    bossContainer.appendChild(span);
  });

  renderExclusiveGifts(pack);
}

function formatFloors(floors) {
  return floors.map(f => {
    if (f === 5) return 'Floor 5 (eligible for 6-10)';
    if (f === 11) return 'Floors 11-15';
    return `Floor ${f}`;
  }).join(', ');
}

function renderExclusiveGifts(pack) {
  const container = document.getElementById('detailExclusiveGifts');
  container.innerHTML = '';

  if (pack.exclusiveGifts.length === 0) {
    container.innerHTML = '<p class="no-content">No exclusive gifts available.</p>';
    return;
  }

  pack.exclusiveGifts.forEach(giftId => {
    const gift = getGiftById(giftId);
    if (!gift) return;
    const card = createGiftCard(gift);
    container.appendChild(card);
  });
}

function createGiftCard(gift) {
  const card = document.createElement('div');
  card.className = 'gift-card';
  card.dataset.giftId = gift.id;

  const img = document.createElement('img');
  img.className = 'gift-card-image';
  img.src = gift.icon || '';
  img.alt = `${gift.name} icon`;
  img.loading = 'lazy';

  img.onerror = () => {
    const fallback = document.createElement('div');
    fallback.className = 'placeholder-img';
    fallback.style.backgroundColor = getRarityColor(gift.rarity);
    img.replaceWith(fallback);
  };

  const name = document.createElement('p');
  name.className = 'gift-card-name';
  name.textContent = gift.name;

  const rarity = document.createElement('p');
  rarity.className = 'gift-card-rarity';
  rarity.textContent = gift.rarity === 'EX' ? 'EX' : `Tier ${gift.rarity}`;

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(rarity);

  return card;
}

function getRarityColor(rarity) {
  const colors = {
    1: '#4a4a4a',
    2: '#4a5a4a',
    3: '#4a4a6a',
    4: '#6a4a6a',
    5: '#6a4a4a',
    'EX': '#6a6a4a'
  };
  return colors[rarity] || '#4a4a4a';
}

document.addEventListener('DOMContentLoaded', init);