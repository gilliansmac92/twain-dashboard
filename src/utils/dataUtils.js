export function normalizeSender(raw) {
  if (!raw) return 'Unknown';
  const s = raw.trim();
  if (s.startsWith('SLC')) return 'Samuel L. Clemens';
  if (s.startsWith('OLC')) return 'Olivia L. Clemens';
  if (s === 'IVL') return 'Isabel V. Lyon';
  return s;
}

export function normalizeReceiver(raw) {
  if (!raw) return 'Unknown';
  const s = raw.trim();
  if (s === 'SLC') return 'Samuel L. Clemens';
  if (s === 'OLC') return 'Olivia L. Clemens';
  if (s === 'IVL') return 'Isabel V. Lyon';
  return s;
}

export function normalizeLocation(raw) {
  if (!raw || raw.trim() === '' || raw.toLowerCase().includes('unknown')) return 'Unknown';
  const s = raw.trim();
  if (s.toLowerCase().includes('hartford')) return 'Hartford, CT';
  if (s.toLowerCase().includes('new york')) return 'New York, NY';
  if (s.toLowerCase().includes('london')) return 'London, England';
  if (s.toLowerCase().includes('san francisco')) return 'San Francisco, CA';
  if (s.toLowerCase().includes('elmira')) return 'Elmira, NY';
  if (s.toLowerCase().includes('washington')) return 'Washington, DC';
  if (s.toLowerCase().includes('boston')) return 'Boston, MA';
  if (s.toLowerCase().includes('vienna')) return 'Vienna, Austria';
  if (s.toLowerCase().includes('paris')) return 'Paris, France';
  if (s.toLowerCase().includes('berlin')) return 'Berlin, Germany';
  if (s.toLowerCase().includes('florence')) return 'Florence, Italy';
  if (s.toLowerCase().includes('venice')) return 'Venice, Italy';
  if (s.toLowerCase().includes('rome')) return 'Rome, Italy';
  if (s.toLowerCase().includes('chicago')) return 'Chicago, IL';
  if (s.toLowerCase().includes('cincinnati')) return 'Cincinnati, OH';
  if (s.toLowerCase().includes('buffalo')) return 'Buffalo, NY';
  if (s.toLowerCase().includes('philadelphia')) return 'Philadelphia, PA';
  if (s.toLowerCase().includes('st. louis') || s.toLowerCase().includes('st louis')) return 'St. Louis, MO';
  if (s.toLowerCase().includes('hannibal')) return 'Hannibal, MO';
  if (s.toLowerCase().includes('quarry farm')) return 'Elmira, NY';
  if (s.toLowerCase().includes('redding')) return 'Redding, CT';
  if (s.toLowerCase().includes('dublin')) return 'Dublin, NH';
  if (s.toLowerCase().includes('york harbor')) return 'York Harbor, ME';
  if (s.toLowerCase().includes('bermuda')) return 'Bermuda';
  if (s.toLowerCase().includes('munich')) return 'Munich, Germany';
  if (s.toLowerCase().includes('heidelberg')) return 'Heidelberg, Germany';
  if (s.toLowerCase().includes('geneva')) return 'Geneva, Switzerland';
  if (s.toLowerCase().includes('zurich')) return 'Zurich, Switzerland';
  if (s.toLowerCase().includes('naples')) return 'Naples, Italy';
  if (s.toLowerCase().includes('liverpool')) return 'Liverpool, England';
  if (s.toLowerCase().includes('oxford')) return 'Oxford, England';
  if (s.toLowerCase().includes('edinburgh')) return 'Edinburgh, Scotland';
  if (s.toLowerCase().includes('montreal')) return 'Montreal, Canada';
  return s;
}

export function extractYear(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/\b([12]\d{3})\b/);
  return match ? parseInt(match[1], 10) : null;
}

export function processData(rows) {
  const processed = rows.map(row => ({
    ...row,
    senderNorm: normalizeSender(row.sender),
    receiverNorm: normalizeReceiver(row.receiver),
    locationNorm: normalizeLocation(row.location),
    year: extractYear(row.date),
  }));

  const lettersPerYearMap = {};
  processed.forEach(r => {
    if (r.year) {
      lettersPerYearMap[r.year] = (lettersPerYearMap[r.year] || 0) + 1;
    }
  });
  const lettersPerYear = Object.entries(lettersPerYearMap)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  const senderCounts = {};
  processed.forEach(r => {
    senderCounts[r.senderNorm] = (senderCounts[r.senderNorm] || 0) + 1;
  });
  const topSenders = Object.entries(senderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  const receiverCounts = {};
  processed.forEach(r => {
    receiverCounts[r.receiverNorm] = (receiverCounts[r.receiverNorm] || 0) + 1;
  });
  const topReceivers = Object.entries(receiverCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  const locationCounts = {};
  processed.forEach(r => {
    locationCounts[r.locationNorm] = (locationCounts[r.locationNorm] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  const uniqueSenders = Object.keys(senderCounts).length;
  const uniqueReceivers = Object.keys(receiverCounts).length;

  const years = processed.filter(r => r.year).map(r => r.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const receiverSpanMap = {};
  processed.forEach(r => {
    if (!r.year) return;
    const name = r.receiverNorm;
    if (!receiverSpanMap[name]) {
      receiverSpanMap[name] = { minYear: r.year, maxYear: r.year, count: 0 };
    }
    receiverSpanMap[name].count++;
    if (r.year < receiverSpanMap[name].minYear) receiverSpanMap[name].minYear = r.year;
    if (r.year > receiverSpanMap[name].maxYear) receiverSpanMap[name].maxYear = r.year;
  });
  const correspondenceSpans = Object.entries(receiverSpanMap)
    .map(([name, d]) => ({ name, ...d, span: d.maxYear - d.minYear }))
    .sort((a, b) => b.count - a.count);

  const allPeopleSet = new Set();
  Object.entries(senderCounts).sort((a,b) => b[1]-a[1]).slice(0,50).forEach(([n]) => allPeopleSet.add(n));
  Object.entries(receiverCounts).sort((a,b) => b[1]-a[1]).slice(0,50).forEach(([n]) => allPeopleSet.add(n));
  const allPeople = Array.from(allPeopleSet).sort();

  const top5Senders = topSenders.slice(0, 5).map(s => s.name);
  const stackedByYear = {};
  processed.forEach(r => {
    if (!r.year) return;
    if (!stackedByYear[r.year]) {
      stackedByYear[r.year] = { year: r.year };
      top5Senders.forEach(s => { stackedByYear[r.year][s] = 0; });
      stackedByYear[r.year]['Others'] = 0;
    }
    if (top5Senders.includes(r.senderNorm)) {
      stackedByYear[r.year][r.senderNorm]++;
    } else {
      stackedByYear[r.year]['Others']++;
    }
  });
  const stackedData = Object.values(stackedByYear).sort((a, b) => a.year - b.year);

  return {
    processed,
    lettersPerYear,
    topSenders,
    topReceivers,
    topLocations,
    uniqueSenders,
    uniqueReceivers,
    minYear,
    maxYear,
    correspondenceSpans,
    allPeople,
    top5Senders,
    stackedData,
    senderCounts,
    receiverCounts,
  };
}

export function buildNetworkData(processed, centerPerson, maxNodes = 25) {
  const edgeMap = {};
  processed.forEach(r => {
    const a = r.senderNorm;
    const b = r.receiverNorm;
    if (!a || !b || a === b) return;
    const key = a < b ? `${a}|||${b}` : `${b}|||${a}`;
    edgeMap[key] = (edgeMap[key] || 0) + 1;
  });

  const directConnections = {};
  Object.entries(edgeMap).forEach(([key, count]) => {
    const [a, b] = key.split('|||');
    if (a === centerPerson) directConnections[b] = (directConnections[b] || 0) + count;
    else if (b === centerPerson) directConnections[a] = (directConnections[a] || 0) + count;
  });

  const topConnections = Object.entries(directConnections)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxNodes - 1)
    .map(([name]) => name);

  const nodeSet = new Set([centerPerson, ...topConnections]);

  const nodes = Array.from(nodeSet).map(name => ({
    id: name,
    isCenter: name === centerPerson,
    value: directConnections[name] || 0,
  }));

  const links = [];
  Object.entries(edgeMap).forEach(([key, count]) => {
    const [a, b] = key.split('|||');
    if (nodeSet.has(a) && nodeSet.has(b)) {
      links.push({ source: a, target: b, value: count });
    }
  });

  return { nodes, links };
}

export function getPersonData(processed, personName) {
  const sent = processed.filter(r => r.senderNorm === personName);
  const received = processed.filter(r => r.receiverNorm === personName);

  const toMap = {};
  sent.forEach(r => { toMap[r.receiverNorm] = (toMap[r.receiverNorm] || 0) + 1; });
  const topTo = Object.entries(toMap).sort((a,b) => b[1]-a[1]).slice(0,10).map(([name,count]) => ({name,count}));

  const fromMap = {};
  received.forEach(r => { fromMap[r.senderNorm] = (fromMap[r.senderNorm] || 0) + 1; });
  const topFrom = Object.entries(fromMap).sort((a,b) => b[1]-a[1]).slice(0,10).map(([name,count]) => ({name,count}));

  const locMap = {};
  [...sent, ...received].forEach(r => { locMap[r.locationNorm] = (locMap[r.locationNorm] || 0) + 1; });
  const topLocs = Object.entries(locMap).sort((a,b) => b[1]-a[1]).slice(0,10).map(([name,count]) => ({name,count}));

  const timeMap = {};
  sent.forEach(r => { if (r.year) timeMap[r.year] = (timeMap[r.year] || 0) + 1; });
  const timeline = Object.entries(timeMap).map(([year,count]) => ({year: parseInt(year), count})).sort((a,b) => a.year-b.year);

  const years = [...sent, ...received].filter(r => r.year).map(r => r.year);
  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;

  return { sent: sent.length, received: received.length, topTo, topFrom, topLocs, timeline, minYear, maxYear };
}
