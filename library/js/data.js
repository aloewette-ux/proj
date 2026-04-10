let giftsData = [];
let packsData = [];

const statusTypeOrder = [
  'Bleed',
  'Burn',
  'Tremor',
  'Rupture',
  'Sinking',
  'Poise',
  'Charge',
  'Slash',
  'Pierce',
  'Blunt'
];

async function loadData() {
  try {
    const [giftsResponse, packsResponse] = await Promise.all([
      fetch('../data/gifts.json'),
      fetch('../data/packs.json')
    ]);
    
    giftsData = await giftsResponse.json();
    packsData = await packsResponse.json();
    
    console.log(`Loaded ${giftsData.length} gifts and ${packsData.length} packs`);
    return { gifts: giftsData, packs: packsData };
  } catch (error) {
    console.error('Error loading data:', error);
    return { gifts: [], packs: [] };
  }
}

function getGiftById(id) {
  return giftsData.find(gift => gift.id === id);
}

function getPackById(id) {
  return packsData.find(pack => pack.id === id);
}

function getUniqueGiftValues(field) {
  const values = new Set();
  giftsData.forEach(gift => {
    if (Array.isArray(gift[field])) {
      gift[field].forEach(val => values.add(val));
    } else if (gift[field]) {
      values.add(gift[field]);
    }
  });
  return Array.from(values).sort();
}

function getStatusTypes() {
  const typesSet = new Set();
  giftsData.forEach(gift => {
    gift.statusTypes.forEach(type => typesSet.add(type));
  });
  
  const typesArray = Array.from(typesSet);
  
  return typesArray.sort((a, b) => {
    const indexA = statusTypeOrder.indexOf(a);
    const indexB = statusTypeOrder.indexOf(b);
    
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

function getBuffTypes() {
  return getUniqueGiftValues('buffTypes');
}

function getRarities() {
  return getUniqueGiftValues('rarity');
}
