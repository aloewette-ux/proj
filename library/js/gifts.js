let activeFilters = {
  rarity: new Set(),
  statusType: new Set(),
  buffType: new Set()
};

async function init() {
  await loadData();
  renderFilterButtons();
  renderGiftGrid();
}

function getRarityDisplay(rarity) {
  const rarityMap = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'EX'
  };
  return rarityMap[rarity] || rarity;
}

function getStatusIconPath(statusType) {
  return `../html/assets/icons/keywords/${statusType.toLowerCase()}.png`;
}

function renderFilterButtons() {
  const rarities = getRarities();
  const rarityContainer = document.getElementById('rarityFilterButtons');
  rarities.forEach(rarity => {
    const displayText = getRarityDisplay(rarity);
    const btn = createFilterButton(displayText, rarity, () => toggleFilter('rarity', rarity));
    rarityContainer.appendChild(btn);
  });

  const statusTypes = getStatusTypes();
  const statusContainer = document.getElementById('statusFilterButtons');
  statusTypes.forEach(type => {
    const btn = createStatusFilterButton(type, () => toggleFilter('statusType', type));
    statusContainer.appendChild(btn);
  });

  const buffTypes = getBuffTypes();
  const buffContainer = document.getElementById('buffFilterButtons');
  buffTypes.forEach(type => {
    const btn = createFilterButton(type, type, () => toggleFilter('buffType', type));
    buffContainer.appendChild(btn);
  });
}

function createFilterButton(label, rawValue, onClick) {
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.textContent = label;
  btn.dataset.value = rawValue;
  btn.addEventListener('click', onClick);
  return btn;
}

function createStatusFilterButton(type, onClick) {
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.dataset.value = type;

  const icon = document.createElement('img');
  icon.src = getStatusIconPath(type);
  icon.alt = type;
  icon.className = 'filter-btn-icon';
  icon.onerror = () => { icon.style.display = 'none'; };

  const label = document.createElement('span');
  label.textContent = type;

  btn.appendChild(icon);
  btn.appendChild(label);
  btn.addEventListener('click', onClick);
  return btn;
}

function toggleFilter(filterType, value) {
  const filterSet = activeFilters[filterType];

  if (filterSet.has(value)) {
    filterSet.delete(value);
  } else {
    filterSet.clear();
    filterSet.add(value);
  }

  const activeValue = filterSet.size > 0 ? Array.from(filterSet)[0] : null;
  updateFilterButtonStates(filterType, activeValue);
  renderGiftGrid();
}

function updateFilterButtonStates(filterType, activeValue) {
  let containerId;
  if (filterType === 'rarity') containerId = 'rarityFilterButtons';
  else if (filterType === 'statusType') containerId = 'statusFilterButtons';
  else if (filterType === 'buffType') containerId = 'buffFilterButtons';

  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('filter-btn--active'));

  if (activeValue !== null) {
    const activeButton = Array.from(buttons).find(btn => btn.dataset.value === String(activeValue));
    if (activeButton) activeButton.classList.add('filter-btn--active');
  }
}

function filterGifts() {
  return giftsData.filter(gift => {
    if (activeFilters.rarity.size > 0 && !activeFilters.rarity.has(gift.rarity)) return false;
    if (activeFilters.statusType.size > 0) {
      if (!gift.statusTypes.some(type => activeFilters.statusType.has(type))) return false;
    }
    if (activeFilters.buffType.size > 0) {
      if (!gift.buffTypes.some(type => activeFilters.buffType.has(type))) return false;
    }
    return true;
  });
}

function renderGiftGrid() {
  const grid = document.getElementById('giftGrid');
  grid.innerHTML = '';

  const filteredGifts = filterGifts();

  if (filteredGifts.length === 0) {
    grid.innerHTML = '<p class="no-results">No gifts match the selected filters.</p>';
    return;
  }

  filteredGifts.forEach(gift => {
    const card = createGiftCard(gift);
    grid.appendChild(card);
  });
}

function createGiftCard(gift) {
  const card = document.createElement('div');
  card.className = 'gift-card';
  card.dataset.giftId = gift.id;

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'gift-card-image-wrapper';

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.src = gift.icon;
  img.alt = gift.name;
  img.className = 'gift-card-image';
  img.onerror = function () {
    this.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-img';
    placeholder.style.backgroundColor = getRarityColor(gift.rarity);
    imageWrapper.insertBefore(placeholder, this);
  };

  imageWrapper.appendChild(img);

  if (gift.statusTypes.length > 0) {
    const statusIcon = document.createElement('img');
    statusIcon.src = getStatusIconPath(gift.statusTypes[0]);
    statusIcon.alt = gift.statusTypes[0];
    statusIcon.className = 'gift-card-status-icon';
    statusIcon.onerror = () => { statusIcon.style.display = 'none'; };
    imageWrapper.appendChild(statusIcon);
  }

  const name = document.createElement('p');
  name.className = 'gift-card-name';
  name.textContent = gift.name;

  card.appendChild(imageWrapper);
  card.appendChild(name);

  card.addEventListener('mouseenter', (e) => showGiftPopup(gift, e));
  card.addEventListener('mouseleave', hideGiftPopup);

  return card;
}

function getRarityColor(rarity) {
  const colors = {
    1: '#4a4a4a',
    2: '#5a6a4a',
    3: '#5a5a6a',
    4: '#6a5a6a',
    5: '#6a5a5a',
    6: '#6a6a5a'
  };
  return colors[rarity] || '#4a4a4a';
}

function showGiftPopup(gift, event) {
  const popup = document.getElementById('giftPopup');

  popup.innerHTML = '';

  const name = document.createElement('h3');
  name.className = 'gift-popup-name';
  name.textContent = gift.name;
  popup.appendChild(name);

  const rarity = document.createElement('p');
  rarity.className = 'gift-popup-rarity';
  rarity.textContent = `Rarity: ${getRarityDisplay(gift.rarity)}`;
  popup.appendChild(rarity);

  const body = document.createElement('div');
  body.className = 'gift-popup-body';

  const statusDiv = document.createElement('div');
  statusDiv.className = 'gift-popup-tags';
  statusDiv.innerHTML = gift.statusTypes.length > 0
    ? `<strong>Status:</strong> ${gift.statusTypes.join(', ')}`
    : '';

  const buffDiv = document.createElement('div');
  buffDiv.className = 'gift-popup-tags';
  buffDiv.innerHTML = gift.buffTypes.length > 0
    ? `<strong>Effects:</strong> ${gift.buffTypes.join(', ')}`
    : '';

  const recipeDiv = document.createElement('div');
  recipeDiv.className = 'gift-popup-recipe';
  if (gift.fusionIngredients) {
    const ingredients = gift.fusionIngredients
      .map(id => getGiftById(id)?.name || id)
      .join(' + ');
    recipeDiv.innerHTML = `<strong>Fusion Recipe:</strong><br>${ingredients} → ${gift.name}`;
  } else if (gift.fusionResult.length > 0) {
    const results = gift.fusionResult
      .map(id => getGiftById(id)?.name || id)
      .join(', ');
    recipeDiv.innerHTML = `<strong>Used in:</strong><br>${results}`;
  }

  const packDiv = document.createElement('div');
  packDiv.className = 'gift-popup-pack';
  if (gift.packExclusive.length > 0) {
    const packs = gift.packExclusive
      .map(id => getPackById(id)?.name || id)
      .join(', ');
    packDiv.innerHTML = `<strong>Exclusive to:</strong><br>${packs}`;
  }

  body.appendChild(statusDiv);
  body.appendChild(recipeDiv);
  body.appendChild(buffDiv);
  body.appendChild(packDiv);
  popup.appendChild(body);

  const offsetX = 12;
  const offsetY = 12;
  popup.style.left = (event.clientX + offsetX) + 'px';
  popup.style.top = (event.clientY + offsetY) + 'px';
  popup.hidden = false;

  const rect = popup.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (rect.right > vw) {
    popup.style.left = (event.clientX - rect.width - offsetX) + 'px';
  }
  if (rect.bottom > vh) {
    popup.style.top = (event.clientY - rect.height - offsetY) + 'px';
  }
}

function hideGiftPopup() {
  document.getElementById('giftPopup').hidden = true;
}

document.addEventListener('DOMContentLoaded', init);