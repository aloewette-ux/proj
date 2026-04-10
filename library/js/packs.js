let activeFloorFilter = null;

async function init() {
  await loadData();
  renderFloorFilterButtons();
  renderPackGrid();
}

function renderFloorFilterButtons() {
  const filterBar = document.getElementById('filterBar');
  if (!filterBar) return;

  filterBar.innerHTML = `
    <h2 class="filter-bar-title">Filter by Floor</h2>
    <div class="filter-bar-buttons" id="floorFilterButtons"></div>
  `;

  const buttonContainer = document.getElementById('floorFilterButtons');

  const floorRanges = [
    { label: 'Floors 1-5',   value: '1-5'   },
    { label: 'Floors 6-10',  value: '6-10'  },
    { label: 'Floors 11-15', value: '11-15' }
  ];

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn filter-btn--active';
  allBtn.textContent = 'All Floors';
  allBtn.addEventListener('click', () => {
    setFloorFilter(null, allBtn, buttonContainer);
  });
  buttonContainer.appendChild(allBtn);

  floorRanges.forEach(range => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = range.label;
    btn.addEventListener('click', () => {
      setFloorFilter(range.value, btn, buttonContainer);
    });
    buttonContainer.appendChild(btn);
  });
}

function setFloorFilter(value, clickedBtn, container) {
  container.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.remove('filter-btn--active')
  );
  clickedBtn.classList.add('filter-btn--active');
  activeFloorFilter = value;
  renderPackGrid();
}

function filterPacks() {
  if (!activeFloorFilter) return packsData;

  return packsData.filter(pack => {
    if (activeFloorFilter === '1-5') {
      return pack.floors.some(f => f >= 1 && f <= 4);
    } else if (activeFloorFilter === '6-10') {
      return pack.floors.includes(5);
    } else if (activeFloorFilter === '11-15') {
      return pack.floors.includes(11);
    }
    return true;
  });
}

function renderPackGrid() {
  const grid = document.getElementById('packGrid');
  grid.innerHTML = '';

  const filteredPacks = filterPacks();

  if (filteredPacks.length === 0) {
    grid.innerHTML = '<p class="no-results">No packs match the selected filter.</p>';
    return;
  }

  filteredPacks.forEach(pack => {
    const card = createPackCard(pack);
    grid.appendChild(card);
  });
}

function createPackCard(pack) {
  const card = document.createElement('div');
  card.className = 'pack-card';
  card.dataset.packId = pack.id;

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.src = pack.image;
  img.alt = pack.name;
  img.className = 'pack-card-image';
  img.onerror = () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-img';
    placeholder.style.backgroundColor = getFloorColor(pack.floors);
    img.parentNode.replaceChild(placeholder, img);
  };

  const name = document.createElement('p');
  name.className = 'pack-card-name';
  name.textContent = pack.name;

  card.appendChild(img);
  card.appendChild(name);

  card.addEventListener('mouseenter', (e) => showPackPopup(pack, e));
  card.addEventListener('mouseleave', hidePackPopup);

  return card;
}

function getFloorColor(floors) {
  const minFloor = Math.min(...floors);
  const colors = {
    1: '#4a5a4a', 2: '#4a4a5a', 3: '#5a4a5a',
    4: '#5a5a4a', 5: '#5a4a4a', 11: '#6a4a4a'
  };
  return colors[minFloor] || '#4a4a4a';
}

function showPackPopup(pack, event) {
  const popup = document.getElementById('packPopup');

  document.getElementById('popupPackName').textContent = pack.name;

  const bossDiv = document.getElementById('popupPackBoss');
  bossDiv.innerHTML = `<strong>${pack.boss.length > 1 ? 'Bosses' : 'Boss'}:</strong> ${pack.boss.join(', ')}`;

  const giftsDiv = document.getElementById('popupPackGifts');
  giftsDiv.innerHTML = '';

  const label = document.createElement('p');
  label.className = 'pack-popup-exclusive-label';
  label.textContent = 'Exclusive Gifts:';
  giftsDiv.appendChild(label);

  if (pack.exclusiveGifts.length === 0) {
    const noGifts = document.createElement('p');
    noGifts.className = 'pack-popup-no-gifts';
    noGifts.textContent = 'No exclusive gifts available.';
    giftsDiv.appendChild(noGifts);
  } else {
    const giftsGrid = document.createElement('div');
    giftsGrid.className = 'pack-popup-gifts-grid';

    pack.exclusiveGifts.forEach(giftId => {
      const gift = getGiftById(giftId);
      if (!gift) return;

      const giftCard = document.createElement('div');
      giftCard.className = 'popup-gift-card';

      const giftImg = document.createElement('img');
      giftImg.src = gift.icon;
      giftImg.alt = gift.name;
      giftImg.className = 'popup-gift-card-image';
      giftImg.loading = 'lazy';
      giftImg.onerror = () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-img';
        placeholder.style.backgroundColor = getRarityColor(gift.rarity);
        giftImg.parentNode.replaceChild(placeholder, giftImg);
      };

      const giftName = document.createElement('p');
      giftName.className = 'popup-gift-card-name';
      giftName.textContent = gift.name;

      giftCard.appendChild(giftImg);
      giftCard.appendChild(giftName);
      giftsGrid.appendChild(giftCard);
    });

    giftsDiv.appendChild(giftsGrid);
  }

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

function hidePackPopup() {
  document.getElementById('packPopup').hidden = true;
}

function getRarityColor(rarity) {
  const colors = {
    1: '#4a4a4a', 2: '#5a6a4a', 3: '#5a5a6a',
    4: '#6a5a6a', 5: '#6a5a5a', 6: '#6a6a5a'
  };
  return colors[rarity] || '#4a4a4a';
}

document.addEventListener('DOMContentLoaded', init);