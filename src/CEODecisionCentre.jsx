import React from 'react';

const ACTION_STORAGE_KEY = 'ceo_recommendation_actions_v2';
const DEFAULT_SNOOZE_DAYS = 7;

const I18N = {
  en: {
    title: 'CEO Decision Centre',
    subtitle: 'Owner-only business command centre. Read-only advisory mode with local-AI-ready support.',
    advisory: 'Advisory only',
    period: 'Period',
    view: 'View',
    shop: 'Shop',
    allShops: 'All Shops',
    today: 'Today',
    yesterday: 'Yesterday',
    custom: 'Custom Range',
    startDate: 'Start Date',
    endDate: 'End Date',
    week: 'This Week to Date',
    lastweek: 'Last Week',
    month: 'This Month to Date',
    lastmonth: 'Last Month',
    threeMonths: 'Last 3 Months',
    sixMonths: 'Last 6 Months',
    year: 'This Year',
    summary: 'Summary View',
    table: 'Table View',
    chart: 'Chart View',
    graph: 'Graph View',
    grid: 'Grid View',
    board: 'Board View',
    action: 'Action View',
    risk: 'Risk View',
    products: 'Product Command Centre',
    ai: 'Local AI Advisor',
    totalSales: 'Total Sales',
    grossProfit: 'Gross Profit',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    profitMargin: 'Profit Margin',
    stockValue: 'Stock Value',
    creditOutstanding: 'Credit Outstanding',
    changeLedger: 'Chenji ya Mteja',
    mobileCommission: 'Mobile/Bank Commission',
    gasProfit: 'Gas Profit',
    businessPulse: 'Business Pulse',
    ceoMessage: 'CEO Message',
    dataConfidence: 'Data Confidence',
    recordsLoaded: 'Data Used for This Analysis',
    recommendationControl: 'Recommendation Control',
    recommendations: 'Recommendations',
    topProfitProducts: 'Top Profit Products',
    slowStock: 'Slow / Sleeping Stock',
    highPriority: 'Highest Priority Actions',
    shopPerformance: 'Shop Performance',
    productCommand: 'Product Command Centre',
    capitalEfficiency: 'Capital Efficiency',
    investmentOpportunities: 'Investment Opportunities',
    shopRoles: 'Shop Role Identification',
    attendantQuestions: 'What to Ask Shop Attendants',
    question: 'Question',
    productMix: 'Product Mix Intelligence',
    creditRisk: 'Credit Risk',
    mobileMoney: 'Mobile Money & Float',
    gasIntelligence: 'Gas Intelligence',
    recordingDiscipline: 'Recording Discipline',
    qty: 'Qty',
    sales: 'Sales',
    profit: 'Profit',
    product: 'Product',
    productsLabel: 'Products',
    shopLabel: 'Shop',
    stock: 'Stock',
    buy: 'Buy',
    sell: 'Sell',
    category: 'Category',
    expiry: 'Expiry',
    margin: 'Margin',
    lastSale: 'Last Sale',
    soldPeriod: 'Sold in Period',
    status: 'Status',
    advice: 'Advice',
    priority: 'Priority',
    evidence: 'Evidence',
    suggestedAction: 'Suggested Action',
    ownerAction: 'Owner Action',
    done: 'Done',
    planned: 'Planned',
    snooze7: 'Snooze 7d',
    notRelevant: 'Not relevant',
    addNote: 'Note',
    up: 'Up',
    down: 'Down',
    stable: 'Stable',
    noData: 'No data found for this view.',
    noIssues: 'No major data confidence issue detected.',
    localAiIntro: 'This panel is local-AI-ready. It will work only if a local AI service such as Ollama is running on this computer. The CEO dashboard itself works without AI.',
    aiEndpoint: 'Local AI endpoint',
    aiModel: 'Model name',
    aiPlaceholder: 'Ask local AI, for example: Why did profit reduce? Which products should I stop buying? Which shop needs attention?',
    askAi: 'Ask Local AI',
    askingAi: 'Asking Local AI...',
    aiNotConnected: 'Local AI is not connected or blocked. The CEO dashboard still works without AI.',
    explainBusiness: 'Explain Business',
    whyProfitDrop: 'Why did profit drop?',
    findDuplicates: 'Find duplicate products',
    weeklyPlan: 'Suggest weekly action plan',
    investmentQuestion: 'Find investment opportunities',
    searchProduct: 'Search product...',
    filterStatus: 'Filter status',
    allStatuses: 'All statuses',
    riskStatus: 'Risk',
    goodStatus: 'Good',
    watchStatus: 'Watch',
    dangerStatus: 'Danger',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    dataPartial: 'This recommendation is based on available loaded data. Longer history may improve accuracy.',
    list: 'List View',
    compact: 'Compact View',
    ceoTotals: 'CEO Totals',
    estimatedLostSales: 'Estimated Lost Sales',
    slowStockCapital: 'Slow Stock Capital',
    expiryRiskValue: 'Expiry Risk Value',
    outOfStockProducts: 'Out-of-stock Products',
    transferOpportunities: 'Transfer Opportunities',
    comparedToYesterday: 'Compared to yesterday',
    comparedToDayBefore: 'Compared to the day before yesterday',
    comparedToPreviousEquivalent: 'Compared to the previous equivalent period',
    comparisonSales: 'Comparison sales',
    sittingDays: 'Days since last sale',
    possibleSourceShop: 'Possible source shop',
    productsAnalyzed: 'Products analyzed',
    salesRecordsAnalyzed: 'Sales records analyzed',
    expenseRecordsAnalyzed: 'Expense records analyzed',
    recordsMeaning: 'These are the records currently available under the selected period and shop filter.',
    yesterdaySales: 'Yesterday sales',
    dayBeforeYesterdaySales: 'Day before yesterday sales',
    previousEquivalentSales: 'Previous equivalent period sales',
    actionPlan: 'Action Plan',
    auditTrail: 'Audit Trail',
    actionDate: 'Date',
    challenge: 'Challenge',
    response: 'Response',
    implementedStatus: 'Implemented?',
    implemented: 'Implemented',
    notImplemented: 'Not yet implemented',
    noAuditTrail: 'No action has been recorded yet.',
    actionPlanNote: 'Actions recorded here also hide the same issue from other views where appropriate.',
  },
  sw: {
    title: 'Kituo cha Maamuzi ya Biashara',
    subtitle: 'Eneo la mmiliki pekee kwa kuona mwenendo, hatari, fursa na hatua za kuchukua. Ni ushauri tu, halibadilishi taarifa moja kwa moja.',
    advisory: 'Ushauri tu',
    period: 'Kipindi',
    view: 'Muonekano',
    shop: 'Duka',
    allShops: 'Maduka yote',
    today: 'Leo',
    yesterday: 'Jana',
    custom: 'Chagua Tarehe',
    startDate: 'Tarehe ya Mwanzo',
    endDate: 'Tarehe ya Mwisho',
    week: 'Wiki hii hadi leo',
    lastweek: 'Wiki iliyopita',
    month: 'Mwezi huu hadi leo',
    lastmonth: 'Mwezi uliopita',
    threeMonths: 'Miezi 3 iliyopita',
    sixMonths: 'Miezi 6 iliyopita',
    year: 'Mwaka huu',
    summary: 'Muhtasari',
    table: 'Jedwali',
    chart: 'Chati',
    graph: 'Mwenendo',
    grid: 'Gridi',
    board: 'Bodi',
    action: 'Hatua za Kuchukua',
    risk: 'Hatari',
    products: 'Kituo cha Bidhaa',
    ai: 'Mshauri wa AI wa Ndani',
    totalSales: 'Jumla ya Mauzo',
    grossProfit: 'Faida Kabla ya Matumizi',
    expenses: 'Matumizi',
    netProfit: 'Faida Halisi',
    profitMargin: 'Asilimia ya Faida',
    stockValue: 'Thamani ya Stock',
    creditOutstanding: 'Madeni ya Wateja',
    changeLedger: 'Chenji ya Mteja',
    mobileCommission: 'Kamisheni ya Wakala na Benki',
    gasProfit: 'Faida ya Gesi',
    businessPulse: 'Mwenendo wa Haraka wa Biashara',
    ceoMessage: 'Ujumbe wa Biashara kwa Mmiliki',
    dataConfidence: 'Usahihi wa Taarifa',
    recordsLoaded: 'Taarifa Zilizotumika kwenye Uchambuzi Huu',
    recommendationControl: 'Udhibiti wa Ushauri',
    recommendations: 'Mapendekezo',
    topProfitProducts: 'Bidhaa Zilizoleta Faida Zaidi',
    slowStock: 'Bidhaa/Stock Isiyozunguka',
    highPriority: 'Mambo Muhimu Zaidi',
    shopPerformance: 'Mwenendo wa Kila Duka',
    productCommand: 'Kituo cha Bidhaa',
    capitalEfficiency: 'Ufanisi wa Pesa kwenye Bidhaa',
    investmentOpportunities: 'Fursa za Uwekezaji',
    shopRoles: 'Nguvu ya Kila Duka',
    attendantQuestions: 'Maswali ya Kuuliza Wahudumu',
    question: 'Swali',
    productMix: 'Mchanganyiko wa Bidhaa',
    creditRisk: 'Hatari ya Madeni',
    mobileMoney: 'Wakala na Mtaji/Float',
    gasIntelligence: 'Uchambuzi wa Gesi',
    recordingDiscipline: 'Utaratibu wa Kurekodi',
    qty: 'Idadi',
    sales: 'Mauzo',
    profit: 'Faida',
    product: 'Bidhaa',
    productsLabel: 'Bidhaa',
    shopLabel: 'Duka',
    stock: 'Stock',
    buy: 'Bei ya Kununua',
    sell: 'Bei ya Kuuza',
    category: 'Kundi',
    expiry: 'Expiry',
    margin: 'Margin',
    lastSale: 'Mauzo ya Mwisho',
    soldPeriod: 'Iliyouzwa Kipindi Hiki',
    status: 'Hali',
    advice: 'Ushauri',
    priority: 'Umuhimu',
    evidence: 'Ushahidi',
    suggestedAction: 'Ushauri wa Hatua',
    ownerAction: 'Uamuzi wa Mmiliki',
    done: 'Imefanyika',
    planned: 'Imepangwa Kufanyika',
    snooze7: 'Ficha siku 7',
    notRelevant: 'Haihitajiki',
    addNote: 'Andika Maelezo',
    up: 'Imeongezeka',
    down: 'Imepungua',
    stable: 'Imetulia',
    noData: 'Hakuna taarifa kwa muonekano huu.',
    noIssues: 'Hakuna tatizo kubwa la uaminifu wa taarifa lililoonekana.',
    localAiIntro: 'Sehemu hii imeandaliwa kwa AI ya ndani. Itafanya kazi tu kama huduma ya AI kama Ollama inaendeshwa kwenye kompyuta hii. Dashboard yenyewe inaendelea kufanya kazi bila AI.',
    aiEndpoint: 'Anwani ya AI ya ndani',
    aiModel: 'Jina la model',
    aiPlaceholder: 'Uliza AI ya ndani, mfano: Kwa nini faida imeshuka? Ni bidhaa gani niache kununua? Duka gani linahitaji uangalizi?',
    askAi: 'Uliza AI ya Ndani',
    askingAi: 'Inauliza AI...',
    aiNotConnected: 'AI ya ndani haijaunganishwa au imezuiwa. Dashboard ya CEO bado inafanya kazi bila AI.',
    explainBusiness: 'Eleza Biashara',
    whyProfitDrop: 'Kwa nini faida imeshuka?',
    findDuplicates: 'Tafuta bidhaa zinazojirudia',
    weeklyPlan: 'Pendekeza mpango wa wiki',
    investmentQuestion: 'Tafuta fursa za uwekezaji',
    searchProduct: 'Tafuta bidhaa...',
    filterStatus: 'Chuja hali',
    allStatuses: 'Hali zote',
    riskStatus: 'Hatari',
    goodStatus: 'Nzuri',
    watchStatus: 'Angalia',
    dangerStatus: 'Hatari',
    critical: 'Muhimu Sana',
    high: 'Juu',
    medium: 'Kati',
    low: 'Chini',
    dataPartial: 'Pendekezo hili limetokana na taarifa zilizopatikana. Historia ndefu zaidi inaweza kuongeza usahihi.',
    list: 'Orodha',
    compact: 'Muonekano Mfupi',
    ceoTotals: 'Jumla Muhimu kwa Biashara',
    estimatedLostSales: 'Makadirio ya Mauzo Yanayoweza Kupotea',
    slowStockCapital: 'Pesa iliyo kwenye Bidhaa/Stock Isiyozunguka',
    expiryRiskValue: 'Thamani ya Stock iliyo Karibu na Expiry',
    outOfStockProducts: 'Bidhaa Zilizoisha Stock',
    transferOpportunities: 'Mahali pa Kuhamisha Stock',
    comparedToYesterday: 'Ikilinganishwa na jana',
    comparedToDayBefore: 'Ikilinganishwa na juzi',
    comparedToPreviousEquivalent: 'Ikilinganishwa na kipindi kilichopita chenye urefu sawa',
    comparisonSales: 'Mauzo ya kulinganisha',
    sittingDays: 'Siku tangu iuzwe mwisho',
    possibleSourceShop: 'Duka linaloweza kutoa stock',
    productsAnalyzed: 'Bidhaa zilizotumika kwenye uchambuzi',
    salesRecordsAnalyzed: 'Rekodi za mauzo zilizotumika',
    expenseRecordsAnalyzed: 'Rekodi za matumizi zilizotumika',
    recordsMeaning: 'Hizi ndizo taarifa zilizopatikana kwa kipindi na duka ulilochagua.',
    yesterdaySales: 'Mauzo ya jana',
    dayBeforeYesterdaySales: 'Mauzo ya juzi',
    previousEquivalentSales: 'Mauzo ya kipindi kilichopita chenye urefu sawa',
    actionPlan: 'Hatua za Kuchukua',
    auditTrail: 'Historia ya Hatua',
    actionDate: 'Tarehe',
    challenge: 'Changamoto',
    response: 'Jibu / Hatua Iliyowekwa',
    implementedStatus: 'Imefanyika?',
    implemented: 'Imefanyika',
    notImplemented: 'Bado haijafanyika',
    noAuditTrail: 'Hakuna hatua iliyowekwa bado.',
    actionPlanNote: 'Hatua ikiwekwa hapa, jambo hilo hilo halitaendelea kuonekana kwenye maeneo mengine inapofaa.',
  },
};

const CATEGORY_LABELS = {
  en: {
    'Basic Medicines': 'Basic Medicines',
    Drinks: 'Drinks',
    'Gas Products': 'Gas Products',
    'Baby Products': 'Baby Products',
    'Hygiene & Household': 'Hygiene & Household',
    'General Products': 'General Products',
  },
  sw: {
    'Basic Medicines': 'Dawa Rahisi',
    Drinks: 'Vinywaji',
    'Gas Products': 'Gesi',
    'Baby Products': 'Bidhaa za Watoto',
    'Hygiene & Household': 'Usafi na Nyumbani',
    'General Products': 'Bidhaa za Kawaida',
  },
};

function useT(language) {
  const lang = language === 'en' ? 'en' : 'sw';
  return React.useCallback((key) => I18N[lang][key] || I18N.en[key] || key, [lang]);
}

function tr(language, key) {
  const lang = language === 'en' ? 'en' : 'sw';
  return I18N[lang][key] || I18N.en[key] || key;
}

function catLabel(category, language) {
  return CATEGORY_LABELS[language === 'en' ? 'en' : 'sw'][category] || category;
}

function money(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function num(value) {
  return Number(value || 0);
}

function pct(value) {
  if (!Number.isFinite(Number(value))) return '0.0%';
  return `${Number(value || 0).toFixed(1)}%`;
}

function getDateValue(item) {
  return String(item?.date || item?.created_at || item?.createdAt || '').slice(0, 10);
}

function startOfDay(input = new Date()) {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(input = new Date()) {
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(input, days) {
  const d = new Date(input);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function startOfWeek(input = new Date()) {
  const d = startOfDay(input);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(input = new Date()) {
  const d = new Date(input);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(input = new Date()) {
  const d = new Date(input);
  return new Date(d.getFullYear(), 0, 1);
}

function getPeriodRange(period, customStart = '', customEnd = '') {
  const today = startOfDay(new Date());
  let start = today;
  let end = today;

  if (period === 'yesterday') {
    start = addDays(today, -1);
    end = addDays(today, -1);
  } else if (period === 'today') {
    start = today;
  } else if (period === 'week') {
    start = startOfWeek(today);
  } else if (period === 'lastweek') {
    const thisWeekStart = startOfWeek(today);
    start = addDays(thisWeekStart, -7);
    end = addDays(thisWeekStart, -1);
  } else if (period === 'month') {
    start = startOfMonth(today);
  } else if (period === 'lastmonth') {
    const thisMonthStart = startOfMonth(today);
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    end = addDays(thisMonthStart, -1);
  } else if (period === '3months') {
    start = addDays(today, -89);
  } else if (period === '6months') {
    start = addDays(today, -179);
  } else if (period === 'year') {
    start = startOfYear(today);
  } else if (period === 'custom') {
    const parsedStart = customStart ? startOfDay(customStart) : addDays(today, -29);
    const parsedEnd = customEnd ? startOfDay(customEnd) : today;
    start = parsedStart > parsedEnd ? parsedEnd : parsedStart;
    end = parsedStart > parsedEnd ? parsedStart : parsedEnd;
  }

  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(days - 1));

  return {
    start: toISO(start),
    end: toISO(end),
    previousStart: toISO(previousStart),
    previousEnd: toISO(previousEnd),
    days,
  };
}

function getNamedRange(name) {
  const today = startOfDay(new Date());
  if (name === 'today') return { start: toISO(today), end: toISO(today), previousStart: toISO(addDays(today, -1)), previousEnd: toISO(addDays(today, -1)), days: 1 };
  if (name === 'yesterday') return { start: toISO(addDays(today, -1)), end: toISO(addDays(today, -1)), previousStart: toISO(addDays(today, -2)), previousEnd: toISO(addDays(today, -2)), days: 1 };
  if (name === 'week') return getPeriodRange('week');
  if (name === 'lastweek') return getPeriodRange('lastweek');
  if (name === 'month') return getPeriodRange('month');
  if (name === 'lastmonth') return getPeriodRange('lastmonth');
  return getPeriodRange('month');
}

function inRange(item, start, end) {
  const date = getDateValue(item);
  return Boolean(date && date >= start && date <= end);
}

function percentChange(current, previous) {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (!p && c) return 100;
  if (!p && !c) return 0;
  return ((c - p) / Math.abs(p)) * 100;
}

function profitMargin(profit, sales) {
  if (!Number(sales || 0)) return 0;
  return (Number(profit || 0) / Number(sales || 0)) * 100;
}

function getShopName(shops, shopId) {
  return shops.find((shop) => String(shop.id) === String(shopId))?.name || String(shopId || 'Unknown Shop');
}

function getProductName(product) {
  return String(product?.name || product?.productName || 'Unknown Product').trim();
}

function getProductCode(product) {
  return String(
    product?.standard_product_code ||
      product?.standardProductCode ||
      product?.productCode ||
      product?.name ||
      ''
  ).trim().toLowerCase();
}

function getProductStock(product) {
  return num(product?.stockBaseQty ?? product?.stockQty ?? product?.stock ?? 0);
}

function getProductBuyPrice(product) {
  return num(product?.buyPrice ?? product?.buyingprice ?? 0);
}

function getProductSellPrice(product) {
  return num(product?.sellPrice ?? product?.sellingprice ?? 0);
}

function getSaleItems(sale) {
  return Array.isArray(sale?.items) ? sale.items : [];
}

function getItemProductId(item) {
  return String(item?.productId || item?.product_id || item?.id || '').trim();
}

function getItemName(item) {
  return String(item?.name || item?.productName || item?.product || 'Unknown Product').trim();
}

function getItemQty(item) {
  return num(item?.quantity ?? item?.qty ?? 0);
}

function getItemSellPrice(item) {
  return num(item?.sellPrice ?? item?.price ?? item?.sellingprice ?? 0);
}

function getItemBuyPrice(item) {
  return num(item?.buyPrice ?? item?.buyingprice ?? item?.cost ?? 0);
}

function getItemSales(item) {
  return getItemQty(item) * getItemSellPrice(item);
}

function getItemProfit(item) {
  return getItemQty(item) * (getItemSellPrice(item) - getItemBuyPrice(item));
}

function detectCategory(name) {
  const n = String(name || '').toLowerCase();

  const medicines = ['panadol', 'paracetamol', 'mifupen', 'diclofenac', 'hedex', 'ors', 'dawa', 'malaria', 'amoxicillin', 'aspirin'];
  const drinks = ['azam cola', 'azam embe', 'mo ', 'coke', 'pepsi', 'fanta', 'sprite', 'juice', 'maji', 'water', 'soda'];
  const gas = ['taifa gas', 'oryx', 'o gas', 'ogas', 'mihan', 'gas', 'gesi'];
  const baby = ['baby', 'pampers', 'babycare', 'softcare'];
  const hygiene = ['sabuni', 'soap', 'kleesoft', 'whitedent', 'tooth', 'paste', 'jamaa', 'omo'];

  if (medicines.some((x) => n.includes(x))) return 'Basic Medicines';
  if (drinks.some((x) => n.includes(x))) return 'Drinks';
  if (gas.some((x) => n.includes(x))) return 'Gas Products';
  if (baby.some((x) => n.includes(x))) return 'Baby Products';
  if (hygiene.some((x) => n.includes(x))) return 'Hygiene & Household';
  return 'General Products';
}

function readActions() {
  try {
    return JSON.parse(localStorage.getItem(ACTION_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeActions(actions) {
  localStorage.setItem(ACTION_STORAGE_KEY, JSON.stringify(actions || {}));
}

function actionHidden(action) {
  if (!action) return false;

  // Once the owner has acted on an item, the same issue should not keep repeating in other views.
  // Done and Planned are treated as owner action already recorded.
  if (['Done', 'Planned'].includes(action.status)) return true;

  // Snoozed and Not Relevant are hidden only for the snooze period.
  if (['Snoozed', 'Not Relevant', 'Ignored'].includes(action.status)) {
    if (!action.snoozeUntil) return false;
    return action.snoozeUntil >= toISO(new Date());
  }

  return false;
}

function priorityRank(priority) {
  return { Critical: 1, High: 2, Medium: 3, Low: 4 }[priority] || 9;
}

function priorityBadge(priority) {
  if (priority === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
  if (priority === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (priority === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function shopStatusBadge(status) {
  if (status === 'Good') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Watch') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-700';
}

function statusBadge(status) {
  if (status === 'Done') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Planned') return 'bg-blue-100 text-blue-700';
  if (status === 'Snoozed') return 'bg-purple-100 text-purple-700';
  if (status === 'Not Relevant') return 'bg-slate-200 text-slate-700';
  return 'bg-slate-100 text-slate-600';
}


function formatShopForText(name, language) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  if (language === 'en') return raw;
  const cleaned = raw
    .replace(/\s+shop\s*$/i, '')
    .replace(/^duka\s+la\s+/i, '')
    .trim();
  return cleaned ? `duka la ${cleaned}` : raw;
}

function recText(language, template, vars = {}) {
  const sw = language !== 'en';
  const v = (key) => vars[key] ?? '';
  const shop = formatShopForText(v('shop'), language);
  const fromShop = formatShopForText(v('from'), language);
  const toShop = formatShopForText(v('to'), language);

  const templates = {
    belowCost: sw
      ? `Bei ya ${v('product')} iko chini ya gharama katika ${shop}`
      : `${v('product')} is selling below cost in ${shop}`,
    weakMargin: sw
      ? `Faida ya ${v('product')} ni ndogo katika ${shop}`
      : `${v('product')} has weak margin in ${shop}`,
    stockout: sw
      ? `${v('product')} ilikuwa ikiuzwa katika ${shop}, lakini sasa stock imeisha`
      : `${v('product')} used to sell in ${shop} but is now out of stock`,
    reorder: sw
      ? `Stock ya ${v('product')} inaweza kuisha muda mfupi katika ${shop}`
      : `${v('product')} may finish soon in ${shop}`,
    doNotBuy: sw
      ? `Usiongeze stock ya ${v('product')} kwa sasa katika ${shop}`
      : `Do not buy more ${v('product')} for ${shop} now`,
    transfer: sw
      ? `Fikiria kuhamisha ${v('product')} kutoka ${fromShop} kwenda ${toShop}`
      : `Consider transferring ${v('product')} from ${fromShop} to ${toShop}`,
    missing: sw
      ? `Kuna mauzo ya ${v('product')} kwenye maduka mengine, lakini bidhaa hiyo haipo katika ${shop}`
      : `${v('product')} sells in other shops but is missing in ${shop}`,
    priceEffect: sw
      ? `Mauzo ya ${v('product')} yamepungua baada ya bei kubadilika katika ${shop}`
      : `${v('product')} slowed after price change in ${shop}`,
    expiry: sw
      ? `Stock ya ${v('product')} iko kwenye hatari ya expiry katika ${shop}`
      : `${v('product')} has expiry risk in ${shop}`,
    noSalesToday: sw
      ? `${shop} halina mauzo yaliyorekodiwa leo`
      : `${shop} has no sales recorded today`,
    noPurchases: sw
      ? `${shop} lina mauzo, lakini hakuna rekodi za manunuzi`
      : `${shop} has sales but no purchase records`,
    investment: sw
      ? `Kundi la ${v('category')} linaweza kuwa eneo zuri la kuongeza uwekezaji`
      : `${v('category')} may be an investment opportunity`,
    duplicate: sw
      ? `Inaonekana kuna bidhaa inayoweza kuwa imejirudia katika ${shop}`
      : `Possible repeated product in ${shop}`,
  };

  return templates[template] || template;
}

function averageSellPriceFromProducts(products = []) {
  const prices = products.map((p) => getProductSellPrice(p)).filter((v) => v > 0);
  if (!prices.length) return 0;
  return prices.reduce((s, v) => s + v, 0) / prices.length;
}

function daysSinceDate(dateValue) {
  if (!dateValue || dateValue === '-') return null;
  const d = startOfDay(dateValue);
  const today = startOfDay(new Date());
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((today.getTime() - d.getTime()) / 86400000));
}

function describeSourceShop(source, language) {
  if (!source) return '';
  const sw = language !== 'en';
  const shopName = formatShopForText(source.shopName, language);
  const daysText = source.daysSinceLastSale === null
    ? (sw ? 'hakuna mauzo yaliyoonekana kwenye taarifa zilizopo' : 'no sale found in the available history')
    : (sw ? `haijauzwa kwa siku ${source.daysSinceLastSale}` : `no sale for ${source.daysSinceLastSale} days`);
  return sw
    ? `${shopName}: stock ${source.stock}; ${daysText}; mauzo ya kipindi hiki ${source.currentSold}.`
    : `${shopName} has stock ${source.stock}; ${daysText}; current-period sales ${source.currentSold}.`;
}

function buildAnalytics({ data, period, shopFilter, language, customStart, customEnd }) {
  const shops = Array.isArray(data?.shops) ? data.shops : [];
  const allProducts = Array.isArray(data?.products) ? data.products : [];
  const allSales = Array.isArray(data?.sales) ? data.sales : [];
  const allExpenses = Array.isArray(data?.expenses) ? data.expenses : [];
  const allPurchases = Array.isArray(data?.purchases) ? data.purchases : [];
  const allCreditSales = Array.isArray(data?.creditSales) ? data.creditSales : [];
  const allChangeLedger = Array.isArray(data?.changeLedger) ? data.changeLedger : [];
  const allMobileMoneyEntries = Array.isArray(data?.mobileMoneyEntries) ? data.mobileMoneyEntries : [];
  const allMonthlyWakalaCommissions = Array.isArray(data?.monthlyWakalaCommissions) ? data.monthlyWakalaCommissions : [];
  const allGasEntries = Array.isArray(data?.gasEntries) ? data.gasEntries : [];
const range = getPeriodRange(period, customStart, customEnd);
const selectedShopId = shopFilter === 'all' ? '' : String(shopFilter);

const sameShop = (item) => !selectedShopId || String(item?.shop_id || item?.shopId || '') === selectedShopId;

const analysisShops = selectedShopId
  ? shops.filter((shop) => String(shop.id) === selectedShopId)
  : shops;

  const products = allProducts.filter(sameShop);
  const sales = allSales.filter((sale) => sameShop(sale) && inRange(sale, range.start, range.end));
  const previousSales = allSales.filter((sale) => sameShop(sale) && inRange(sale, range.previousStart, range.previousEnd));
  const expenses = allExpenses.filter((expense) => sameShop(expense) && inRange(expense, range.start, range.end));
  const previousExpenses = allExpenses.filter((expense) => sameShop(expense) && inRange(expense, range.previousStart, range.previousEnd));

  const productById = new Map();
  allProducts.forEach((p) => {
    if (p?.id) productById.set(String(p.id), p);
  });

  const productGroups = {};
  products.forEach((product) => {
    const code = getProductCode(product);
    if (!code) return;

    const shopId = String(product.shop_id || product.shopId || '');
    const stock = getProductStock(product);
    const buy = getProductBuyPrice(product);
    const name = getProductName(product);
    const category = detectCategory(name);

    if (!productGroups[code]) {
      productGroups[code] = {
        code,
        names: new Set(),
        category,
        productRows: [],
        shops: {},
        totalStock: 0,
        totalStockValue: 0,
      };
    }

    if (!productGroups[code].shops[shopId]) {
      productGroups[code].shops[shopId] = {
        shopId,
        shopName: getShopName(shops, shopId),
        stock: 0,
        stockValue: 0,
        productNames: new Set(),
        products: [],
      };
    }

    productGroups[code].names.add(name);
    productGroups[code].productRows.push(product);
    productGroups[code].shops[shopId].stock += stock;
    productGroups[code].shops[shopId].stockValue += stock * buy;
    productGroups[code].shops[shopId].productNames.add(name);
    productGroups[code].shops[shopId].products.push(product);
    productGroups[code].totalStock += stock;
    productGroups[code].totalStockValue += stock * buy;
  });

  function movementFrom(sourceSales) {
    const movement = {};

    sourceSales.forEach((sale) => {
      const shopId = String(sale.shop_id || '');
      getSaleItems(sale).forEach((item) => {
        const product = productById.get(getItemProductId(item));
        const code = product ? getProductCode(product) : String(item.standard_product_code || item.standardProductCode || getItemName(item)).trim().toLowerCase();
        if (!code) return;

        const key = `${code}__${shopId}`;
        if (!movement[key]) {
          const productName = product ? getProductName(product) : getItemName(item);
          movement[key] = {
            code,
            shopId,
            shopName: getShopName(shops, shopId),
            productName,
            category: product ? detectCategory(productName) : detectCategory(productName),
            qty: 0,
            sales: 0,
            profit: 0,
            transactions: 0,
            prices: [],
            lastSaleDate: '',
          };
        }

        movement[key].qty += getItemQty(item);
        movement[key].sales += getItemSales(item);
        movement[key].profit += getItemProfit(item);
        movement[key].transactions += 1;
        movement[key].prices.push(getItemSellPrice(item));

        const d = getDateValue(sale);
        if (d && d > movement[key].lastSaleDate) movement[key].lastSaleDate = d;
      });
    });

    return movement;
  }

  const movement = movementFrom(sales);
  const previousMovement = movementFrom(previousSales);
  const allMovement = movementFrom(allSales);
  const movementList = Object.values(movement).sort((a, b) => b.profit - a.profit);

  const totalSales = sales.reduce((sum, sale) => sum + num(sale.total || 0), 0);
  const previousTotalSales = previousSales.reduce((sum, sale) => sum + num(sale.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + num(expense.amount || 0), 0);
  const previousTotalExpenses = previousExpenses.reduce((sum, expense) => sum + num(expense.amount || 0), 0);

  const grossProfit = sales.reduce((sum, sale) => sum + getSaleItems(sale).reduce((s, item) => s + getItemProfit(item), 0), 0);
  const previousGrossProfit = previousSales.reduce((sum, sale) => sum + getSaleItems(sale).reduce((s, item) => s + getItemProfit(item), 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const previousNetProfit = previousGrossProfit - previousTotalExpenses;
  const stockValue = products.reduce((sum, p) => sum + getProductStock(p) * getProductBuyPrice(p), 0);

  const creditRows = allCreditSales.filter(sameShop);
  const creditOutstanding = creditRows.reduce((sum, c) => {
    const balance = c.balance !== undefined ? num(c.balance) : Math.max(0, num(c.amount) - num(c.paid));
    return sum + balance;
  }, 0);

  const creditAging = creditRows.reduce(
    (acc, c) => {
      const balance = c.balance !== undefined ? num(c.balance) : Math.max(0, num(c.amount) - num(c.paid));
      if (balance <= 0) return acc;
      const d = getDateValue(c);
      const age = d ? Math.floor((startOfDay(new Date()).getTime() - startOfDay(d).getTime()) / 86400000) : 0;
      if (age <= 7) acc.days0to7 += balance;
      else if (age <= 30) acc.days8to30 += balance;
      else acc.days31plus += balance;
      return acc;
    },
    { days0to7: 0, days8to30: 0, days31plus: 0 }
  );

  const changeOutstanding = allChangeLedger.filter(sameShop).reduce((sum, c) => sum + num(c.amountOwed || c.amount || 0), 0);

  const mobileEntries = allMobileMoneyEntries.filter((e) => sameShop(e) && inRange(e, range.start, range.end));
  const previousMobileEntries = allMobileMoneyEntries.filter((e) => sameShop(e) && inRange(e, range.previousStart, range.previousEnd));

  const commissionMonthInRange = (record, start, end, selectedPeriod = period) => {
    if (!record?.commissionMonth) return false;

    // Monthly commission is a monthly record, not a daily or weekly transaction.
    // It should therefore appear in month-based views, not Today/Yesterday/Week.
    if (['today', 'yesterday', 'week', 'lastweek'].includes(selectedPeriod)) return false;

    const [year, month] = String(record.commissionMonth).split('-').map(Number);
    if (!year || !month) return false;

    const commissionMonthStart = new Date(year, month - 1, 1);
    const rangeMonthStart = startOfMonth(start);
    const rangeMonthEnd = startOfMonth(end);

    return commissionMonthStart >= rangeMonthStart && commissionMonthStart <= rangeMonthEnd;
  };

  const monthlyCommissionRecords = allMonthlyWakalaCommissions.filter((record) => sameShop(record) && commissionMonthInRange(record, range.start, range.end, period));
  const previousMonthlyCommissionRecords = allMonthlyWakalaCommissions.filter((record) => sameShop(record) && commissionMonthInRange(record, range.previousStart, range.previousEnd, period));

  const summarizeMobileFloat = (entries) =>
    entries.reduce(
      (acc, e) => {
        const mobileFloat = (e.networks || []).reduce((s, n) => s + num(n.float || n.capital || n.balance || 0), 0);
        const bankFloat = (e.banks || []).reduce((s, b) => s + num(b.float || b.capital || b.balance || 0), 0);
        acc.float += mobileFloat + bankFloat;
        acc.mobileFloat += mobileFloat;
        acc.bankFloat += bankFloat;
        return acc;
      },
      { float: 0, mobileFloat: 0, bankFloat: 0 }
    );

  const summarizeMonthlyCommission = (records) =>
    records.reduce(
      (acc, record) => {
        acc.mobile += num(record.mobileTotal || 0);
        acc.bank += num(record.bankTotal || 0);
        acc.total += num(record.grandTotal || num(record.mobileTotal || 0) + num(record.bankTotal || 0));
        return acc;
      },
      { mobile: 0, bank: 0, total: 0 }
    );

  const mobileFloatSummary = summarizeMobileFloat(mobileEntries);
  const monthlyCommissionSummary = summarizeMonthlyCommission(monthlyCommissionRecords);
  const previousMonthlyCommissionSummary = summarizeMonthlyCommission(previousMonthlyCommissionRecords);
  const mobileCommission = monthlyCommissionSummary.total;
  const previousMobileCommission = previousMonthlyCommissionSummary.total;
  const floatEstimate = mobileFloatSummary.float;
  const mobileWakalaCommission = monthlyCommissionSummary.mobile;
  const bankWakalaCommission = monthlyCommissionSummary.bank;

  const gasEntries = allGasEntries.filter((e) => sameShop(e) && inRange(e, range.start, range.end));
  const gasProfit = gasEntries.reduce((sum, e) => {
    const small = (num(e.smallGasSellPrice) - num(e.smallGasBuyPrice)) * num(e.smallGasSoldToday);
    const big = (num(e.bigGasSellPrice) - num(e.bigGasBuyPrice)) * num(e.bigGasSoldToday);
    return sum + small + big;
  }, 0);

  const shopPerformance = shops
    .filter((shop) => !selectedShopId || String(shop.id) === selectedShopId)
    .map((shop) => {
      const shopSales = sales.filter((s) => String(s.shop_id || '') === String(shop.id));
      const shopExpenses = expenses.filter((e) => String(e.shop_id || '') === String(shop.id));
      const shopProducts = allProducts.filter((p) => String(p.shop_id || '') === String(shop.id));
      const shopMovements = movementList.filter((m) => String(m.shopId) === String(shop.id));
      const salesValue = shopSales.reduce((sum, sale) => sum + num(sale.total || 0), 0);
      const expenseValue = shopExpenses.reduce((sum, expense) => sum + num(expense.amount || 0), 0);
      const gross = shopSales.reduce((sum, sale) => sum + getSaleItems(sale).reduce((s, item) => s + getItemProfit(item), 0), 0);
      const net = gross - expenseValue;
      const stock = shopProducts.reduce((sum, p) => sum + getProductStock(p) * getProductBuyPrice(p), 0);
      const expensePressure = gross ? (expenseValue / gross) * 100 : 0;
      const gasSales = shopMovements.filter((m) => m.category === 'Gas Products').reduce((s, m) => s + m.sales, 0);
      const medicineSales = shopMovements.filter((m) => m.category === 'Basic Medicines').reduce((s, m) => s + m.sales, 0);
      const drinksSales = shopMovements.filter((m) => m.category === 'Drinks').reduce((s, m) => s + m.sales, 0);

      let status = 'Good';
      if (expensePressure >= 80 || net < 0) status = 'Danger';
      else if (expensePressure >= 50 || profitMargin(net, salesValue) < 8) status = 'Watch';

      const strengths = [
        { label: 'Gas', value: gasSales },
        { label: 'Medicines', value: medicineSales },
        { label: 'Drinks', value: drinksSales },
        { label: 'Retail Profit', value: net },
      ].sort((a, b) => b.value - a.value);

      return {
        shopId: shop.id,
        shopName: shop.name,
        sales: salesValue,
        grossProfit: gross,
        expenses: expenseValue,
        netProfit: net,
        margin: profitMargin(net, salesValue),
        stockValue: stock,
        expensePressure,
        status,
        strength: strengths[0]?.value > 0 ? strengths[0].label : 'General',
      };
    })
    .sort((a, b) => b.netProfit - a.netProfit);

  function simplePeriodMetrics(namedPeriod) {
    const r = getNamedRange(namedPeriod);
    const currentSales = allSales.filter((sale) => sameShop(sale) && inRange(sale, r.start, r.end));
    const previousSalesX = allSales.filter((sale) => sameShop(sale) && inRange(sale, r.previousStart, r.previousEnd));
    const currentExpenses = allExpenses.filter((expense) => sameShop(expense) && inRange(expense, r.start, r.end));
    const previousExpensesX = allExpenses.filter((expense) => sameShop(expense) && inRange(expense, r.previousStart, r.previousEnd));

    const s = currentSales.reduce((sum, sale) => sum + num(sale.total || 0), 0);
    const ps = previousSalesX.reduce((sum, sale) => sum + num(sale.total || 0), 0);
    const gp = currentSales.reduce((sum, sale) => sum + getSaleItems(sale).reduce((x, item) => x + getItemProfit(item), 0), 0);
    const pgp = previousSalesX.reduce((sum, sale) => sum + getSaleItems(sale).reduce((x, item) => x + getItemProfit(item), 0), 0);
    const ex = currentExpenses.reduce((sum, e) => sum + num(e.amount || 0), 0);
    const pex = previousExpensesX.reduce((sum, e) => sum + num(e.amount || 0), 0);

    return { sales: s, previousSales: ps, grossProfit: gp, previousGrossProfit: pgp, expenses: ex, previousExpenses: pex, netProfit: gp - ex, previousNetProfit: pgp - pex };
  }

  const pulse = {
    today: simplePeriodMetrics('today'),
    yesterday: simplePeriodMetrics('yesterday'),
    week: simplePeriodMetrics('week'),
    month: simplePeriodMetrics('month'),
  };

  const recommendations = [];

  function addRec(rec) {
    const keyParts = [rec.type || 'General', rec.productCode || '', rec.shopId || '', rec.fromShopId || '', rec.toShopId || '', rec.title || ''];
    const id = keyParts.join('__').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    recommendations.push({
      ...rec,
      id,
      type: rec.type || 'General',
      priority: rec.priority || 'Medium',
      title: rec.title || 'Untitled recommendation',
      productCode: rec.productCode || '',
      productName: rec.productName || '',
      shopId: rec.shopId || '',
      shopName: rec.shopName || '',
      fromShopId: rec.fromShopId || '',
      toShopId: rec.toShopId || '',
      evidence: rec.evidence || '',
      action: rec.action || '',
      question: rec.question || '',
      estimatedLostSales: num(rec.estimatedLostSales || 0),
    });
  }

  Object.values(productGroups).forEach((group) => {
    group.productRows.forEach((p) => {
      const buy = getProductBuyPrice(p);
      const sell = getProductSellPrice(p);
      const stock = getProductStock(p);
      const name = getProductName(p);
      const shopName = getShopName(shops, p.shop_id);
      const margin = profitMargin(sell - buy, sell);

      if (buy > 0 && sell > 0 && sell < buy) {
        addRec({
          type: 'Loss Making Product',
          priority: 'Critical',
          productCode: group.code,
          productName: name,
          shopId: p.shop_id,
          shopName,
          title: recText(language, 'belowCost', { product: name, shop: shopName }),
          evidence: language === 'en'
            ? `Buying price is TZS ${money(buy)} and selling price is TZS ${money(sell)}.`
            : `Bei ya kununua ni TZS ${money(buy)} na bei ya kuuza ni TZS ${money(sell)}.`,
          action: language === 'en' ? 'Review selling price or supplier cost immediately.' : 'Pitia bei ya kuuza au gharama ya kununua haraka.',
          question: language === 'en' ? `Ask why ${name} is being sold below cost.` : `Uliza kwa nini ${name} inauzwa chini ya gharama.`,
        });
      } else if (buy > 0 && sell > 0 && stock > 0 && margin < 10) {
        addRec({
          type: 'Low Margin Product',
          priority: 'High',
          productCode: group.code,
          productName: name,
          shopId: p.shop_id,
          shopName,
          title: recText(language, 'weakMargin', { product: name, shop: shopName }),
          evidence: language === 'en' ? `Margin is about ${pct(margin)}.` : `Margin ni takribani ${pct(margin)}.`,
          action: language === 'en' ? 'Review selling price or buying cost.' : 'Pitia bei ya kuuza au bei ya kununua.',
          question: language === 'en' ? `Confirm whether the current price of ${name} is intentional.` : `Muulize mhudumu kama bei ya sasa ya ${name} imewekwa kwa makusudi.`,
        });
      }
    });
  });

  Object.values(productGroups).forEach((group) => {
    Object.values(group.shops).forEach((shopInfo) => {
      const key = `${group.code}__${shopInfo.shopId}`;
      const cur = movement[key];
      const prev = previousMovement[key];
      const stock = shopInfo.stock;
      const sold = num(cur?.qty);
      const prevSold = num(prev?.qty);
      const avgDaily = sold / Math.max(1, range.days);
      const daysLeft = avgDaily ? stock / avgDaily : null;
      const productName = Array.from(shopInfo.productNames)[0] || Array.from(group.names)[0] || group.code;

      const sourceCandidates = Object.values(group.shops || {})
        .filter((source) => String(source.shopId) !== String(shopInfo.shopId) && source.stock > 0)
        .map((source) => {
          const sourceCurrent = movement[`${group.code}__${source.shopId}`];
          const sourcePrevious = previousMovement[`${group.code}__${source.shopId}`];
          const sourceAll = allMovement[`${group.code}__${source.shopId}`];
          const currentSold = num(sourceCurrent?.qty);
          const previousSoldSource = num(sourcePrevious?.qty);
          const lastSaleDate = sourceAll?.lastSaleDate || sourceCurrent?.lastSaleDate || sourcePrevious?.lastSaleDate || '';
          return {
            shopId: source.shopId,
            shopName: source.shopName,
            stock: source.stock,
            currentSold,
            previousSold: previousSoldSource,
            lastSaleDate,
            daysSinceLastSale: daysSinceDate(lastSaleDate),
          };
        })
        .sort((a, b) => {
          const aMovement = a.currentSold + a.previousSold;
          const bMovement = b.currentSold + b.previousSold;
          if (aMovement !== bMovement) return aMovement - bMovement;
          return b.stock - a.stock;
        });

      const bestSource = sourceCandidates[0];
      const sourceText = describeSourceShop(bestSource, language);
      const avgSellPrice = averageSellPriceFromProducts(shopInfo.products);
      const estimatedLostSales = stock <= 0 && prevSold > 0 ? prevSold * avgSellPrice : 0;

      if (stock <= 0 && prevSold > 0) {
        addRec({
          type: 'Stockout / Lost Sales Risk',
          priority: 'High',
          productCode: group.code,
          productName,
          shopId: shopInfo.shopId,
          shopName: shopInfo.shopName,
          title: recText(language, 'stockout', { product: productName, shop: shopInfo.shopName }),
          evidence: language === 'en'
            ? `Previous period sold ${prevSold} units. Stock iliyopo is zero.`
            : `Kipindi kilichopita ziliuzwa ${prevSold}. stock ya sasa ni sifuri.`,
          action: language === 'en'
            ? 'Restock or transfer from another shop before concluding that demand has reduced.'
            : 'Ongeza stock au hamisha kutoka duka jingine kabla ya kuamua kuwa uhitaji umepungua.',
          question: language === 'en'
            ? `Ask if customers still ask for ${productName} after it finished.`
            : `Muulize mhudumu kama wateja bado wanaulizia ${productName} baada ya kuisha.`,
        });
      }

      if (stock > 0 && sold > 0 && daysLeft !== null && daysLeft <= 7) {
        addRec({
          type: 'Reorder Needed',
          priority: daysLeft <= 3 ? 'Critical' : 'High',
          productCode: group.code,
          productName,
          shopId: shopInfo.shopId,
          shopName: shopInfo.shopName,
          title: recText(language, 'reorder', { product: productName, shop: shopInfo.shopName }),
          evidence: language === 'en'
            ? `Available stock ${stock}; sold ${sold} units within ${range.days} day${range.days === 1 ? '' : 's'} (${range.start} to ${range.end}); estimated days left ${daysLeft.toFixed(1)}.`
            : `Stock iliyopo ${stock}; zimeuzwa ${sold} ndani ya siku ${range.days} (${range.start} mpaka ${range.end}); inakadiriwa kubaki siku ${daysLeft.toFixed(1)}.`,
          action: language === 'en' ? 'Reorder or transfer from a slower shop.' : 'Ongeza stock au hamisha kutoka duka ambalo bidhaa hiyo haizunguki vizuri.',
          question: language === 'en' ? `Confirm whether ${productName} has already been ordered.` : `Muulize mhudumu kama ${productName} tayari imeagizwa.`,
        });
      }

      if (stock > 0 && sold === 0 && prevSold === 0) {
        addRec({
          type: 'Do Not Buy',
          priority: 'Medium',
          productCode: group.code,
          productName,
          shopId: shopInfo.shopId,
          shopName: shopInfo.shopName,
          title: recText(language, 'doNotBuy', { product: productName, shop: shopInfo.shopName }),
          evidence: language === 'en'
            ? `Stock iliyopo is ${stock}, with no movement in current and previous periods.`
            : `Stock iliyopo ni ${stock}, lakini hakuna mauzo katika kipindi hiki wala kilichopita.`,
          action: language === 'en' ? 'Avoid tying more capital unless there is a known demand reason.' : 'Usiongeze pesa kwenye bidhaa hii isipokuwa kuna sababu maalum ya uhitaji.',
          question: language === 'en' ? `Ask whether customers reject ${productName} or whether it is not visible.` : `Uliza kama wateja hawaipendi ${productName} au haionekani vizuri dukani.`,
        });
      }
    });
  });

  Object.values(productGroups).forEach((group) => {
    const rows = Object.values(group.shops);
    if (rows.length < 2) return;

    rows.forEach((source) => {
      rows.forEach((dest) => {
        if (source.shopId === dest.shopId) return;
        const sourceSold = num(movement[`${group.code}__${source.shopId}`]?.qty);
        const destSold = num(movement[`${group.code}__${dest.shopId}`]?.qty);

        if (source.stock >= 5 && destSold > sourceSold && dest.stock <= Math.max(2, destSold)) {
          const productName = Array.from(group.names)[0] || group.code;
          const suggestedQty = Math.max(1, Math.min(Math.floor(source.stock / 2), Math.ceil(destSold - sourceSold)));

          addRec({
            type: 'Stock Transfer',
            priority: dest.stock <= 1 ? 'High' : 'Medium',
            productCode: group.code,
            productName,
            fromShopId: source.shopId,
            toShopId: dest.shopId,
            title: recText(language, 'transfer', { product: productName, from: source.shopName, to: dest.shopName }),
            evidence: language === 'en'
              ? `${dest.shopName} sold ${destSold} while ${source.shopName} sold ${sourceSold}. Source stock is ${source.stock}; destination stock is ${dest.stock}. ${describeSourceShop({
                  shopName: source.shopName,
                  stock: source.stock,
                  currentSold: sourceSold,
                  daysSinceLastSale: daysSinceDate(allMovement[`${group.code}__${source.shopId}`]?.lastSaleDate || ''),
                }, language)}`
              : `${formatShopForText(dest.shopName, language)}: mauzo ${destSold}. ${formatShopForText(source.shopName, language)}: mauzo ${sourceSold}. Stock ya chanzo ni ${source.stock}; stock ya duka linalohitaji ni ${dest.stock}. ${describeSourceShop({
                  shopName: source.shopName,
                  stock: source.stock,
                  currentSold: sourceSold,
                  daysSinceLastSale: daysSinceDate(allMovement[`${group.code}__${source.shopId}`]?.lastSaleDate || ''),
                }, language)}`,
            action: language === 'en' ? `Consider transferring about ${suggestedQty} units.` : `Fikiria kuhamisha takribani ${suggestedQty}.`,
            question: language === 'en' ? `Confirm whether transfer from ${source.shopName} to ${dest.shopName} is practical.` : `Muulize mhudumu kama kuhamisha kutoka ${source.shopName} kwenda ${dest.shopName} kunawezekana.`,
          });
        }
      });
    });
  });

  Object.values(productGroups).forEach((group) => {
    const shopsWithProduct = new Set(Object.keys(group.shops));
    const activeMoves = Object.values(movement).filter((m) => m.code === group.code && m.qty > 0);
    const qty = activeMoves.reduce((s, m) => s + m.qty, 0);
    const salesValue = activeMoves.reduce((s, m) => s + m.sales, 0);
    const profit = activeMoves.reduce((s, m) => s + m.profit, 0);

    if (activeMoves.length >= 1 && qty >= 3) {
      analysisShops.forEach((shop) => {
  if (!shopsWithProduct.has(String(shop.id))) {
          const productName = Array.from(group.names)[0] || group.code;
          addRec({
            type: 'Missing Product Opportunity',
            priority: 'Medium',
            productCode: group.code,
            productName,
            shopId: shop.id,
            shopName: shop.name,
            title: recText(language, 'missing', { product: productName, shop: shop.name }),
            evidence: language === 'en'
              ? `Other shops sold ${qty} units worth TZS ${money(salesValue)} with gross profit of TZS ${money(profit)}.`
              : `Maduka mengine yameuza ${qty} zenye thamani ya TZS ${money(salesValue)} na faida ghafi ya TZS ${money(profit)}.`,
            action: language === 'en' ? `Consider introducing ${productName} in ${shop.name}.` : `Fikiria kuweka ${productName} kwenye ${formatShopForText(shop.name, language)}.`,
            question: language === 'en' ? `Ask if customers in ${shop.name} request ${productName}.` : `Uliza kama wateja wa ${shop.name} wanaulizia ${productName}.`,
          });
        }
      });
    }
  });

  Object.values(movement).forEach((cur) => {
    const prev = previousMovement[`${cur.code}__${cur.shopId}`];
    if (!prev || !cur.prices.length || !prev.prices.length) return;

    const curPrice = cur.prices.reduce((s, p) => s + num(p), 0) / cur.prices.length;
    const prevPrice = prev.prices.reduce((s, p) => s + num(p), 0) / prev.prices.length;

    if (curPrice > prevPrice * 1.1 && cur.qty < prev.qty * 0.7) {
      addRec({
        type: 'Price Change Effect',
        priority: 'Medium',
        productCode: cur.code,
        productName: cur.productName,
        shopId: cur.shopId,
        shopName: cur.shopName,
        title: recText(language, 'priceEffect', { product: cur.productName, shop: cur.shopName }),
        evidence: language === 'en'
          ? `Average price increased from TZS ${money(prevPrice)} to TZS ${money(curPrice)}; quantity reduced from ${prev.qty} to ${cur.qty}.`
          : `Bei ya wastani imeongezeka kutoka TZS ${money(prevPrice)} hadi TZS ${money(curPrice)}; idadi iliyouzwa imeshuka kutoka ${prev.qty} hadi ${cur.qty}.`,
        action: language === 'en' ? 'Review whether the price increase affected demand.' : 'Pitia kama ongezeko la bei limepunguza mauzo.',
        question: language === 'en' ? `Ask whether customers complain about the new price of ${cur.productName}.` : `Muulize mhudumu kama wateja wanalalamikia bei mpya ya ${cur.productName}.`,
      });
    }
  });

  products.forEach((p) => {
    const expiryText = p.expiryDate || p.expirydate;
    if (!expiryText) return;
    const expiry = startOfDay(expiryText);
    const daysLeft = Math.ceil((expiry.getTime() - startOfDay(new Date()).getTime()) / 86400000);

    if (daysLeft <= 30) {
      const name = getProductName(p);
      const shopName = getShopName(shops, p.shop_id);
      const stock = getProductStock(p);
      addRec({
        type: daysLeft < 0 ? 'Expired Stock' : 'Expiry Risk',
        priority: daysLeft < 0 ? 'Critical' : daysLeft <= 7 ? 'High' : 'Medium',
        productCode: getProductCode(p),
        productName: name,
        shopId: p.shop_id,
        shopName,
        title: recText(language, 'expiry', { product: name, shop: shopName }),
        evidence: daysLeft < 0
          ? language === 'en'
            ? `Expired ${Math.abs(daysLeft)} days ago. Stock iliyopo is ${stock}.`
            : `Ime-expire siku ${Math.abs(daysLeft)} zilizopita. Stock iliyopo ni ${stock}.`
          : language === 'en'
            ? `Expires in ${daysLeft} days. Stock iliyopo is ${stock}.`
            : `Imebaki siku ${daysLeft} ku-expire. Stock iliyopo ni ${stock}.`,
        action: language === 'en'
          ? stock > 0
            ? 'Sell, discount, promote or transfer before expiry. Do not reorder this item until current stock is cleared.'
            : 'No stock remains, so only confirm that records are correct.'
          : stock > 0
            ? 'Iuze, ipunguzie bei, itangaze au ihamishe kabla ya expiry. Usinunue tena mpaka stock iliyopo iishe.'
            : 'Stock imeisha; thibitisha tu kama rekodi ziko sahihi.',
        question: language === 'en'
          ? stock > 0
            ? `Ask why ${name} still has ${stock} in stock near expiry, whether demand reduced, and whether it can be transferred or discounted.`
            : `Confirm whether ${name} is actually finished and whether the expiry record should be closed.`
          : stock > 0
            ? `Uliza kwa nini ${name} bado ina stock ${stock} karibu na expiry, kama mauzo yamepungua, na kama inaweza kuhamishwa au kupunguziwa bei.`
            : `Muulize mhudumu kama ${name} kweli imeisha na kama rekodi ya expiry ifungwe.`,
      });
    }
  });

  analysisShops.forEach((shop) => {
  const shopSales = allSales.filter((s) => String(s.shop_id || '') === String(shop.id));
    const daysWithSales = new Set(shopSales.map(getDateValue).filter(Boolean));
    const today = toISO(new Date());
    const activeDaysLast14 = Array.from({ length: 14 }, (_, i) => toISO(addDays(new Date(), -i))).filter((d) => daysWithSales.has(d)).length;

    if (activeDaysLast14 >= 8 && !daysWithSales.has(today)) {
      addRec({
        type: 'Recording Discipline',
        priority: 'High',
        shopId: shop.id,
        shopName: shop.name,
        title: recText(language, 'noSalesToday', { shop: shop.name }),
        evidence: language === 'en'
          ? `${shop.name} recorded sales on ${activeDaysLast14} of the last 14 days, but none today.`
          : `${formatShopForText(shop.name, language)} lilirekodi mauzo siku ${activeDaysLast14} kati ya siku 14 zilizopita, lakini leo hakuna mauzo.`,
        action: language === 'en' ? 'Ask the attendant to confirm whether sales have been recorded.' : 'Muulize mhudumu kuthibitisha kama mauzo yamerekodiwa.',
        question: language === 'en' ? `Ask ${shop.name} attendant why there are no sales today.` : `Muulize mhudumu wa ${formatShopForText(shop.name, language)} kwa nini hakuna mauzo leo.`,
      });
    }

    const shopPurchases = allPurchases.filter((p) => String(p.shop_id || '') === String(shop.id));
    if (shopSales.length > 0 && shopPurchases.length === 0) {
      addRec({
        type: 'Recording Discipline',
        priority: 'Medium',
        shopId: shop.id,
        shopName: shop.name,
        title: recText(language, 'noPurchases', { shop: shop.name }),
        evidence: language === 'en'
          ? 'The system found sales records but no purchase records for this shop.'
          : 'Mfumo umeona kuna mauzo lakini hakuna rekodi za manunuzi kwa duka hili.',
        action: language === 'en' ? 'Confirm whether purchases are being recorded properly.' : 'Muulize mhudumu kama manunuzi yanarekodiwa vizuri.',
        question: language === 'en' ? `Ask ${shop.name} attendant how stock is replenished if purchases are not recorded.` : `Muulize mhudumu wa ${formatShopForText(shop.name, language)} stock inaongezwaje kama manunuzi hayarekodiwi.`,
      });
    }
  });

  const mobileGrowth = percentChange(mobileCommission, previousMobileCommission);
  if (mobileCommission > 0 && mobileGrowth >= 25) {
    addRec({
      type: 'Mobile Money Capital',
      priority: 'Medium',
      title: language === 'en' ? 'Mobile money and bank commission has increased' : 'Kamisheni ya wakala/benki imeongezeka',
      evidence: language === 'en'
        ? `Commission increased from TZS ${money(previousMobileCommission)} to TZS ${money(mobileCommission)}.`
        : `Kamisheni imeongezeka kutoka TZS ${money(previousMobileCommission)} hadi TZS ${money(mobileCommission)}.`,
      action: language === 'en' ? 'Consider reviewing float/capital allocation for active shops.' : 'Fikiria kuongeza au kupanga upya float/pesa kwenye maduka yenye miamala mingi.',
      question: language === 'en' ? 'Ask whether any shop lost transactions because of low float.' : 'Uliza kama kuna duka limekosa miamala kwa sababu ya float ndogo.',
    });
  }

  const categoryStats = {};
  movementList.forEach((m) => {
    const cat = m.category || 'General Products';
    if (!categoryStats[cat]) categoryStats[cat] = { category: cat, qty: 0, sales: 0, profit: 0, products: new Set(), shops: new Set() };
    categoryStats[cat].qty += m.qty;
    categoryStats[cat].sales += m.sales;
    categoryStats[cat].profit += m.profit;
    categoryStats[cat].products.add(m.productName);
    categoryStats[cat].shops.add(m.shopName);
  });

  Object.values(categoryStats).forEach((cat) => {
    if (cat.qty >= 10 && cat.profit > 0 && profitMargin(cat.profit, cat.sales) >= 15) {
      const productNames = Array.from(cat.products).slice(0, 5).join(', ');
      const categoryName = catLabel(cat.category, language);
      const medicineNote = cat.category === 'Basic Medicines'
        ? language === 'en' ? ' Subject to legal and regulatory requirements.' : ' Hili lifanyike kwa kuzingatia leseni na masharti ya sheria.'
        : '';

      addRec({
        type: 'Investment Opportunity',
        priority: cat.profit >= 100000 ? 'High' : 'Medium',
        title: recText(language, 'investment', { category: categoryName }),
        evidence: language === 'en'
          ? `${categoryName} sold ${cat.qty} units, generated TZS ${money(cat.sales)}, and produced TZS ${money(cat.profit)} gross profit. Products include: ${productNames}.`
          : `Kundi la ${categoryName} limeuza ${cat.qty}, limeingiza TZS ${money(cat.sales)}, na kutoa faida ghafi TZS ${money(cat.profit)}. Bidhaa: ${productNames}.`,
        action: language === 'en'
          ? `Consider expanding this category or studying it as a stronger business line.${medicineNote}`
          : `Fikiria kupanua kundi hili au kulichunguza kama eneo la biashara linaloweza kukua.${medicineNote}`,
        question: language === 'en' ? `Study whether ${categoryName} needs more capital or dedicated space.` : `Chunguza kama ${categoryName} linahitaji pesa zaidi au eneo maalum.`,
      });
    }
  });

  Object.values(productGroups).forEach((group) => {
    Object.values(group.shops).forEach((shopInfo) => {
      if (shopInfo.products.length > 1) {
        const productNames = Array.from(shopInfo.productNames).join(', ');
        addRec({
          type: 'Possible Duplicate Product',
          priority: 'Low',
          productCode: group.code,
          productName: productNames,
          shopId: shopInfo.shopId,
          shopName: shopInfo.shopName,
          title: recText(language, 'duplicate', { shop: shopInfo.shopName }),
          evidence: language === 'en'
            ? `${shopInfo.products.length} rows share the same standard product code. Names: ${productNames}.`
            : `Mistari ${shopInfo.products.length} ina product code inayofanana. Majina: ${productNames}.`,
          action: language === 'en' ? 'Review later. Do not merge automatically.' : 'Pitia baadaye. Usiunganishe bidhaa moja kwa moja.',
          question: language === 'en' ? 'Confirm if these are truly the same product or different sizes.' : 'Muulize mhudumu kama kweli ni bidhaa moja au ukubwa tofauti.',
        });
      }
    });
  });

  const topProducts = movementList.slice(0, 12);

  const slowProductsAll = Object.values(productGroups)
    .flatMap((group) => Object.values(group.shops).map((shopInfo) => {
      const move = movement[`${group.code}__${shopInfo.shopId}`];
      const prev = previousMovement[`${group.code}__${shopInfo.shopId}`];
      const allMove = allMovement[`${group.code}__${shopInfo.shopId}`];
      return {
        code: group.code,
        productName: Array.from(shopInfo.productNames)[0] || Array.from(group.names)[0] || group.code,
        shopName: shopInfo.shopName,
        shopId: shopInfo.shopId,
        stock: shopInfo.stock,
        stockValue: shopInfo.stockValue,
        qtySold: move?.qty || 0,
        previousQtySold: prev?.qty || 0,
        lastSaleDate: allMove?.lastSaleDate || '-',
        daysSinceLastSale: daysSinceDate(allMove?.lastSaleDate || ''),
      };
    }))
    .filter((row) => row.stock > 0 && row.qtySold === 0 && row.previousQtySold === 0)
    .sort((a, b) => b.stockValue - a.stockValue);

  const slowProducts = slowProductsAll.slice(0, 30);

  const productCommandRows = products.map((p) => {
    const code = getProductCode(p);
    const shopId = String(p.shop_id || p.shopId || '');
    const move = movement[`${code}__${shopId}`];
    const previousMove = previousMovement[`${code}__${shopId}`];
    const stock = getProductStock(p);
    const buy = getProductBuyPrice(p);
    const sell = getProductSellPrice(p);
    const margin = sell ? profitMargin(sell - buy, sell) : 0;

    let status = 'Good';
    let advice = language === 'en' ? 'Maintain' : 'Fuatilia';
    if (sell && buy && sell < buy) {
      status = 'Risk';
      advice = language === 'en' ? 'Review price immediately' : 'Pitia bei haraka';
    } else if (stock <= 0 && previousMove?.qty > 0) {
      status = 'Risk';
      advice = language === 'en' ? 'Restock or transfer' : 'Ongeza au hamisha stock';
    } else if (stock > 0 && !move?.qty && !previousMove?.qty) {
      status = 'Watch';
      advice = language === 'en' ? 'Do not buy more now' : 'Usiongeze stock kwa sasa';
    } else if (move?.qty > 0 && stock <= Math.max(2, move.qty)) {
      status = 'Watch';
      advice = language === 'en' ? 'May need reorder' : 'Inaweza kuhitaji kuongeza stock';
    }

    return {
      id: p.id,
      productName: getProductName(p),
      shopName: getShopName(shops, shopId),
      stock,
      buy,
      sell,
      stockValue: stock * buy,
      category: detectCategory(getProductName(p)),
      expiry: p.expiryDate || p.expirydate || '-',
      sold: move?.qty || 0,
      sales: move?.sales || 0,
      profit: move?.profit || 0,
      lastSaleDate: move?.lastSaleDate || '-',
      margin,
      status,
      advice,
    };
  });

  const missingCodes = allProducts.filter((p) => !getProductCode(p)).length;
  const missingBuy = allProducts.filter((p) => !getProductBuyPrice(p)).length;
  const missingSell = allProducts.filter((p) => !getProductSellPrice(p)).length;
  const missingExpiry = allProducts.filter((p) => !(p.expiryDate || p.expirydate)).length;

  const dataIssues = [];
  if (missingCodes) dataIssues.push(language === 'en' ? `${missingCodes} products have no standard product code.` : `Bidhaa ${missingCodes} hazina product code maalum.`);
  if (missingBuy) dataIssues.push(language === 'en' ? `${missingBuy} products have no buying price.` : `Bidhaa ${missingBuy} hazina bei ya kununua.`);
  if (missingSell) dataIssues.push(language === 'en' ? `${missingSell} products have no selling price.` : `Bidhaa ${missingSell} hazina bei ya kuuza.`);
  if (missingExpiry) dataIssues.push(language === 'en' ? `${missingExpiry} products have no expiry date, so expiry analysis may be incomplete.` : `Bidhaa ${missingExpiry} hazina tarehe ya expiry; hivyo uchambuzi wa expiry unaweza kuwa pungufu.`);

  const productMix = buildProductMix({ movementList, language });
  const capitalEfficiency = buildCapitalEfficiency({ productGroups: Object.values(productGroups), movement, language });
  const shopRoles = shopPerformance.map((s) => ({
    shopName: s.shopName,
    role: language === 'en' ? `${s.strength} strength` : `Nguvu yake: ${s.strength}`,
    evidence: language === 'en'
      ? `Sales TZS ${money(s.sales)}, net profit TZS ${money(s.netProfit)}, stock value TZS ${money(s.stockValue)}.`
      : `Mauzo TZS ${money(s.sales)}, faida halisi TZS ${money(s.netProfit)}, thamani ya stock TZS ${money(s.stockValue)}.`,
    status: s.status,
  }));

  const attendantQuestions = recommendations
    .filter((r) => r.question)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 12)
    .map((r) => ({
      question: r.question,
      issue: r.title,
      evidence: r.evidence,
      action: r.action,
      shopName: r.shopName || '-',
      priority: r.priority,
    }));

  const trendRows = [];

  for (let i = 0; i < range.days; i += 1) {
    const currentDate = toISO(addDays(range.start, i));

    const daySales = sales.filter((sale) => getDateValue(sale) === currentDate);
    const dayExpenses = expenses.filter((expense) => getDateValue(expense) === currentDate);
    const dayMobileEntries = mobileEntries.filter((entry) => getDateValue(entry) === currentDate);
    const dayGasEntries = gasEntries.filter((entry) => getDateValue(entry) === currentDate);

    const daySalesValue = daySales.reduce((sum, sale) => sum + num(sale.total || 0), 0);
    const dayGrossProfit = daySales.reduce((sum, sale) => {
      return sum + getSaleItems(sale).reduce((itemSum, item) => itemSum + getItemProfit(item), 0);
    }, 0);
    const dayExpenseValue = dayExpenses.reduce((sum, expense) => sum + num(expense.amount || 0), 0);

    const dayMobileCommission = dayMobileEntries.reduce((sum, entry) => {
      const mobile = (entry.networks || []).reduce((s, n) => s + num(n.commission || 0), 0);
      const bank = (entry.banks || []).reduce((s, b) => s + num(b.commission || 0), 0);
      return sum + mobile + bank;
    }, 0);

    const dayGasProfit = dayGasEntries.reduce((sum, entry) => {
      const small = (num(entry.smallGasSellPrice) - num(entry.smallGasBuyPrice)) * num(entry.smallGasSoldToday);
      const big = (num(entry.bigGasSellPrice) - num(entry.bigGasBuyPrice)) * num(entry.bigGasSoldToday);
      return sum + small + big;
    }, 0);

    trendRows.push({
      date: currentDate,
      sales: daySalesValue,
      grossProfit: dayGrossProfit,
      expenses: dayExpenseValue,
      netProfit: dayGrossProfit - dayExpenseValue,
      mobileCommission: dayMobileCommission,
      gasProfit: dayGasProfit,
    });
  }

  const expiryRiskValue = products.reduce((sum, p) => {
    const expiryText = p.expiryDate || p.expirydate;
    if (!expiryText) return sum;
    const expiry = startOfDay(expiryText);
    const daysLeft = Math.ceil((expiry.getTime() - startOfDay(new Date()).getTime()) / 86400000);
    if (daysLeft <= 30) return sum + getProductStock(p) * getProductBuyPrice(p);
    return sum;
  }, 0);

  const estimatedLostSales = recommendations.reduce((sum, r) => sum + num(r.estimatedLostSales || 0), 0);
  const summaryTotals = {
    estimatedLostSales,
    slowStockCapital: slowProductsAll.reduce((sum, row) => sum + num(row.stockValue), 0),
    expiryRiskValue,
    outOfStockProducts: recommendations.filter((r) => r.type === 'Stockout / Lost Sales Risk').length,
    transferOpportunities: recommendations.filter((r) => r.type === 'Stock Transfer').length,
    activeRecommendations: recommendations.length,
  };

  const businessMessage = buildMessage({
    totalSales,
    previousTotalSales,
    netProfit,
    previousNetProfit,
    totalExpenses,
    previousTotalExpenses,
    shopPerformance,
    recommendations,
    language,
  });

  return {
    range,
    shops,
    products,
    sales,
    expenses,
    allProducts,
    allSales,
    allExpenses,
    allPurchases,
    totalSales,
    previousTotalSales,
    totalExpenses,
    previousTotalExpenses,
    grossProfit,
    previousGrossProfit,
    netProfit,
    previousNetProfit,
    stockValue,
    creditOutstanding,
    creditAging,
    changeOutstanding,
    mobileCommission,
    mobileWakalaCommission,
    bankWakalaCommission,
    previousMobileCommission,
    floatEstimate,
    gasProfit,
    productGroups: Object.values(productGroups),
    movementList,
    topProducts,
    slowProducts,
    productCommandRows,
    shopPerformance,
    recommendations,
    dataIssues,
    businessMessage,
    pulse,
    productMix,
    capitalEfficiency,
    shopRoles,
    attendantQuestions,
    trendRows,
    summaryTotals,
  };
}

function buildProductMix({ movementList, language }) {
  const categories = {};
  movementList.forEach((m) => {
    const cat = m.category || 'General Products';
    if (!categories[cat]) categories[cat] = { category: cat, sales: 0, profit: 0, qty: 0 };
    categories[cat].sales += m.sales;
    categories[cat].profit += m.profit;
    categories[cat].qty += m.qty;
  });

  return Object.values(categories)
    .map((c) => ({
      ...c,
      margin: profitMargin(c.profit, c.sales),
      message: language === 'en'
        ? `${catLabel(c.category, language)} sold ${c.qty} units and produced TZS ${money(c.profit)} profit.`
        : `Kundi la ${catLabel(c.category, language)} limeuza ${c.qty} na kutoa faida TZS ${money(c.profit)}.`,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8);
}

function buildCapitalEfficiency({ productGroups, movement, language }) {
  return productGroups
    .flatMap((group) => {
      return Object.values(group.shops || {}).map((shopInfo) => {
        const moves = Object.values(movement).filter(
          (m) => m.code === group.code && String(m.shopId) === String(shopInfo.shopId)
        );
        const sales = moves.reduce((s, m) => s + m.sales, 0);
        const profit = moves.reduce((s, m) => s + m.profit, 0);
        const stockValue = shopInfo.stockValue;
        const efficiency = stockValue ? profit / stockValue : profit > 0 ? 999 : 0;
        const productName = Array.from(shopInfo.productNames)[0] || Array.from(group.names)[0] || group.code;
        let label = language === 'en' ? 'Monitor' : 'Fuatilia';

        if (profit > 0 && efficiency >= 0.2) {
          label = language === 'en' ? 'Capital working well' : 'Mtaji unafanya kazi vizuri';
        }

        if (stockValue > 0 && profit <= 0) {
          label = language === 'en' ? 'Capital sleeping' : 'Mtaji umelala';
        }

        return {
          productName,
          shopName: shopInfo.shopName,
          stock: shopInfo.stock,
          sales,
          profit,
          stockValue,
          efficiency,
          label,
        };
      });
    })
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 20);
}

function buildMessage({ totalSales, previousTotalSales, netProfit, previousNetProfit, totalExpenses, previousTotalExpenses, shopPerformance, recommendations, language }) {
  const sw = language !== 'en';
  const salesChange = percentChange(totalSales, previousTotalSales);
  const profitChange = percentChange(netProfit, previousNetProfit);
  const expenseChange = percentChange(totalExpenses, previousTotalExpenses);
  const weakest = shopPerformance.slice().sort((a, b) => a.netProfit - b.netProfit)[0];
  const critical = recommendations.filter((r) => r.priority === 'Critical').length;
  const high = recommendations.filter((r) => r.priority === 'High').length;

  const salesText = salesChange >= 5 ? (sw ? 'yanaongezeka' : 'improving') : salesChange <= -5 ? (sw ? 'yanapungua' : 'reducing') : (sw ? 'yametulia' : 'stable');
  const profitText = profitChange >= 5 ? (sw ? 'inaongezeka' : 'improving') : profitChange <= -5 ? (sw ? 'inapungua' : 'reducing') : (sw ? 'imetulia' : 'stable');

  if (sw) {
    let msg = `Mauzo ya biashara ${salesText} ukilinganisha na kipindi kilichopita. Faida halisi ${profitText}.`;
    if (expenseChange > salesChange && expenseChange > 10) msg += ' Matumizi yanaongezeka kwa kasi kuliko mauzo, hivyo zinahitaji kuangaliwa.';
    if (weakest && weakest.status !== 'Good') msg += ` ${weakest.shopName} linahitaji uangalizi kwa sababu hali yake ni ${weakest.status}.`;
    if (critical || high) msg += ` Kuna ushauri ${critical} ya hatari sana na ${high} ya umuhimu wa juu unaohitaji uamuzi wa mmiliki.`;
    return msg;
  }

  let message = `Business sales are ${salesText} compared to the previous equivalent period. Net profit is ${profitText}.`;
  if (expenseChange > salesChange && expenseChange > 10) message += ' Expenses are growing faster than sales, so expense pressure should be reviewed.';
  if (weakest && weakest.status !== 'Good') message += ` ${weakest.shopName} needs attention because its status is ${weakest.status}.`;
  if (critical || high) message += ` There are ${critical} critical and ${high} high-priority recommendations requiring owner attention.`;
  return message;
}

function getTrendLabel(value, language) {
  const sw = language !== 'en';
  if (value >= 5) return sw ? `Imeongezeka ${Math.abs(value).toFixed(1)}%` : `Up ${Math.abs(value).toFixed(1)}%`;
  if (value <= -5) return sw ? `Imepungua ${Math.abs(value).toFixed(1)}%` : `Down ${Math.abs(value).toFixed(1)}%`;
  return sw ? 'Imetulia' : 'Stable';
}

function trendClass(value) {
  if (value >= 5) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (value <= -5) return 'bg-rose-50 text-rose-700 ring-rose-200';
  return 'bg-slate-50 text-slate-600 ring-slate-200';
}

function priorityTone(priority) {
  if (priority === 'Critical') return 'from-rose-50 to-red-50 text-rose-900 ring-1 ring-rose-100';
  if (priority === 'High') return 'from-orange-50 to-amber-50 text-orange-900 ring-1 ring-orange-100';
  if (priority === 'Medium') return 'from-yellow-50 to-amber-50 text-amber-900 ring-1 ring-amber-100';
  return 'from-slate-50 to-slate-100 text-slate-800 ring-1 ring-slate-100';
}

function statusTone(status) {
  if (status === 'Good') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'Watch') return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-rose-50 text-rose-700 ring-rose-200';
}

function ExecutiveMetric({ label, value, hint, trend, gradient = 'from-slate-700 to-slate-500', icon = '●' }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-4 shadow-lg shadow-slate-200/70 backdrop-blur-md">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-15`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          {hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-md`}>
          {icon}
        </div>
      </div>
      {trend !== undefined ? (
        <div className={`relative mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${trendClass(trend)}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
        </div>
      ) : null}
    </div>
  );
}

function SoftTile({ label, value, className = '', strong = false }) {
  return (
    <div className={`rounded-3xl border border-white/60 p-4 shadow-sm ${className}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 ${strong ? 'text-2xl' : 'text-xl'} font-black text-slate-950`}>{value}</div>
    </div>
  );
}

function SelectControl({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-white/75">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/25 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-white/70"
      >
        {children}
      </select>
    </label>
  );
}

function DropdownPanel({ title, subtitle, badge, children, defaultOpen = false, tone = 'slate' }) {
  const toneMap = {
    slate: 'from-slate-50 to-white',
    blue: 'from-blue-50 to-white',
    emerald: 'from-emerald-50 to-white',
    amber: 'from-amber-50 to-white',
    rose: 'from-rose-50 to-white',
    violet: 'from-violet-50 to-white',
  };

  return (
    <details open={defaultOpen} className={`group rounded-[30px] border border-white/70 bg-gradient-to-br ${toneMap[tone] || toneMap.slate} shadow-lg shadow-slate-200/70`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            {badge ? <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{badge}</span> : null}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition group-open:rotate-180">⌄</div>
      </summary>
      <div className="border-t border-white/70 p-5 pt-4">{children}</div>
    </details>
  );
}

function MiniBar({ label, value, max, gradient = 'from-indigo-500 to-fuchsia-500' }) {
  const width = max ? Math.min(100, Math.max(3, (Number(value || 0) / max) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-xs font-semibold text-slate-600">
        <span className="truncate">{label}</span>
        <span className="shrink-0">TZS {money(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ShopCard({ shop, maxSales, maxProfit, language }) {
  const sw = language !== 'en';
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xl font-black text-slate-950">{shop.shopName}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{sw ? 'Nguvu kuu' : 'Main strength'}: {shop.strength}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(shop.status)}`}>{shop.status}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-blue-50 p-3">
          <p className="text-xs font-bold text-blue-700">{sw ? 'Mauzo' : 'Sales'}</p>
          <p className="mt-1 text-lg font-black text-slate-950">TZS {money(shop.sales)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-xs font-bold text-emerald-700">{sw ? 'Faida halisi' : 'Net profit'}</p>
          <p className="mt-1 text-lg font-black text-slate-950">TZS {money(shop.netProfit)}</p>
        </div>
        <div className="rounded-2xl bg-orange-50 p-3">
          <p className="text-xs font-bold text-orange-700">{sw ? 'Matumizi' : 'Expenses'}</p>
          <p className="mt-1 text-lg font-black text-slate-950">TZS {money(shop.expenses)}</p>
        </div>
        <div className="rounded-2xl bg-violet-50 p-3">
          <p className="text-xs font-bold text-violet-700">{sw ? 'Stock' : 'Stock value'}</p>
          <p className="mt-1 text-lg font-black text-slate-950">TZS {money(shop.stockValue)}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <MiniBar label={sw ? 'Nguvu ya mauzo' : 'Sales strength'} value={shop.sales} max={maxSales} gradient="from-blue-500 to-cyan-500" />
        <MiniBar label={sw ? 'Nguvu ya faida' : 'Profit strength'} value={Math.max(0, shop.netProfit)} max={maxProfit} gradient="from-emerald-500 to-teal-500" />
      </div>

      <div className="mt-4 rounded-2xl bg-slate-950 p-3 text-white">
        <p className="text-xs font-bold text-white/60">{sw ? 'Margin ya faida' : 'Profit margin'}</p>
        <p className="text-xl font-black">{pct(shop.margin)}</p>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, actionRecord, onDecision, language }) {
  const sw = language !== 'en';
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-md shadow-slate-200/60">
      <div className={`bg-gradient-to-r ${priorityTone(rec.priority)} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide opacity-80">{rec.type}</p>
            <h4 className="mt-1 text-base font-black leading-6">{rec.title}</h4>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black shadow-sm">{rec.priority}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-black uppercase text-slate-400">{sw ? 'Ushahidi' : 'Evidence'}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{rec.evidence || '-'}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-xs font-black uppercase text-emerald-600">{sw ? 'Hatua inayopendekezwa' : 'Suggested action'}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{rec.action || '-'}</p>
          </div>
        </div>
        {rec.question ? <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{rec.question}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => onDecision(rec, 'Done')}>{sw ? 'Imefanyika' : 'Done'}</button>
          <button className="rounded-2xl bg-blue-100 px-3 py-2 text-xs font-black text-blue-700" onClick={() => onDecision(rec, 'Planned')}>{sw ? 'Imepangwa' : 'Planned'}</button>
          <button className="rounded-2xl bg-purple-100 px-3 py-2 text-xs font-black text-purple-700" onClick={() => onDecision(rec, 'Snoozed')}>{sw ? 'Ficha siku 7' : 'Snooze 7d'}</button>
          <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => onDecision(rec, 'Not Relevant')}>{sw ? 'Haihitajiki' : 'Not relevant'}</button>
          <button className="rounded-2xl bg-yellow-100 px-3 py-2 text-xs font-black text-yellow-800" onClick={() => onDecision(rec, 'Note')}>{sw ? 'Maelezo' : 'Note'}</button>
        </div>
        {actionRecord?.status ? (
          <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusBadge(actionRecord.status)}`}>{actionRecord.status}</div>
        ) : null}
      </div>
    </div>
  );
}

function CompactTable({ rows, columns, emptyText }) {
  if (!rows.length) return <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{emptyText}</div>;
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-950 text-white">
          <tr>
            {columns.map((col) => <th key={col.key} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || `${row.productName || row.shopName || idx}-${idx}`} className="border-t border-slate-100">
              {columns.map((col) => <td key={col.key} className="px-4 py-3 align-top text-slate-700">{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartCard({ title, subtitle, explanation, children, className = '' }) {
  return (
    <div className={`rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-md ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black uppercase tracking-wide text-slate-900">{title}</h4>
          {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
      {explanation ? (
        <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
          {explanation}
        </p>
      ) : null}
    </div>
  );
}

function EmptyVisual({ text }) {
  return <div className="flex min-h-[180px] items-center justify-center rounded-3xl bg-slate-50 text-sm font-semibold text-slate-400">{text}</div>;
}

function SimpleLineChart({ rows = [], lines = [], height = 220 }) {
  const width = 720;
  const pad = 34;
  const safeRows = rows.filter(Boolean);
  const allValues = safeRows.flatMap((row) => lines.map((line) => Number(row[line.key] || 0)));
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const range = Math.max(1, maxValue - minValue);
  const xStep = safeRows.length > 1 ? (width - pad * 2) / (safeRows.length - 1) : 0;

  if (!safeRows.length) return <EmptyVisual text="No trend data" />;

  const pointsFor = (key) => safeRows.map((row, idx) => {
    const x = pad + idx * xStep;
    const y = height - pad - ((Number(row[key] || 0) - minValue) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full overflow-visible">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e2e8f0" strokeWidth="2" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#e2e8f0" strokeWidth="2" />
        {[0.25, 0.5, 0.75].map((v) => (
          <line key={v} x1={pad} y1={pad + (height - pad * 2) * v} x2={width - pad} y2={pad + (height - pad * 2) * v} stroke="#f1f5f9" strokeWidth="2" />
        ))}
        {lines.map((line) => (
          <polyline key={line.key} points={pointsFor(line.key)} fill="none" stroke={line.stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {safeRows.map((row, idx) => {
          if (idx !== 0 && idx !== safeRows.length - 1 && idx % Math.ceil(Math.max(1, safeRows.length / 4)) !== 0) return null;
          return <text key={row.date || idx} x={pad + idx * xStep} y={height - 8} textAnchor="middle" fontSize="18" fill="#64748b">{String(row.date || '').slice(5)}</text>;
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: line.stroke }} />
            {line.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalBarChart({ rows = [], valueKey = 'value', labelKey = 'label', height = 220, barClass = 'from-blue-400 to-cyan-400' }) {
  const safeRows = rows.filter(Boolean).slice(0, 8);
  const maxValue = Math.max(...safeRows.map((row) => Math.abs(Number(row[valueKey] || 0))), 1);

  if (!safeRows.length) return <EmptyVisual text="No bar chart data" />;

  return (
    <div className="flex min-h-[220px] items-end gap-3 rounded-3xl bg-slate-50 p-4">
      {safeRows.map((row, idx) => {
        const value = Math.abs(Number(row[valueKey] || 0));
        const heightPct = Math.max(6, (value / maxValue) * 100);
        return (
          <div key={`${row[labelKey]}-${idx}`} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <div className="text-[10px] font-black text-slate-500">{money(value)}</div>
            <div className="flex h-36 w-full items-end justify-center rounded-2xl bg-white/80 p-1 shadow-inner">
              <div className={`w-full rounded-xl bg-gradient-to-t ${barClass}`} style={{ height: `${heightPct}%` }} />
            </div>
            <div className="w-full truncate text-center text-[10px] font-bold text-slate-600" title={row[labelKey]}>{row[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBarList({ rows = [], valueKey = 'value', labelKey = 'label', maxRows = 8, barClass = 'from-emerald-400 to-teal-400' }) {
  const safeRows = rows.filter(Boolean).slice(0, maxRows);
  const maxValue = Math.max(...safeRows.map((row) => Math.abs(Number(row[valueKey] || 0))), 1);

  if (!safeRows.length) return <EmptyVisual text="No list data" />;

  return (
    <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
      {safeRows.map((row, idx) => {
        const value = Math.abs(Number(row[valueKey] || 0));
        const width = Math.max(4, (value / maxValue) * 100);
        return (
          <div key={`${row[labelKey]}-${idx}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
              <span className="truncate">{row[labelKey]}</span>
              <span className="shrink-0">TZS {money(value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ items = [], centerLabel = '', centerValue = '', language = 'sw' }) {
  const sw = language !== 'en';
  const safeItems = items.filter((item) => Number(item.value || 0) > 0).slice(0, 6);
  const total = safeItems.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const colors = ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#fb7185', '#94a3b8'];
  let current = 0;
  const stops = safeItems.map((item, idx) => {
    const start = current;
    const end = current + (Number(item.value || 0) / Math.max(1, total)) * 100;
    current = end;
    return `${colors[idx]} ${start}% ${end}%`;
  }).join(', ');

  if (!safeItems.length) return <EmptyVisual text={sw ? 'Hakuna data ya chart' : 'No chart data'} />;

  return (
    <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 md:grid-cols-[180px_1fr] md:items-center">
      <div className="relative mx-auto h-44 w-44 rounded-full shadow-inner" style={{ background: `conic-gradient(${stops})` }}>
        <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
          <div className="text-[10px] font-black uppercase text-slate-400">{centerLabel}</div>
          <div className="mt-1 text-lg font-black text-slate-950">{centerValue}</div>
        </div>
      </div>
      <div className="space-y-2">
        {safeItems.map((item, idx) => (
          <div key={`${item.label}-${idx}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2 text-xs font-bold text-slate-600">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[idx] }} />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0">TZS {money(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeCard({ label, value, max = 100, suffix = '', tone = 'emerald' }) {
  const percent = Math.min(100, Math.max(0, (Number(value || 0) / Math.max(1, Number(max || 1))) * 100));
  const toneClass = tone === 'rose' ? 'from-rose-400 to-red-500' : tone === 'amber' ? 'from-amber-300 to-orange-400' : 'from-emerald-400 to-teal-500';
  return (
    <div className="rounded-3xl bg-white/85 p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <div className={`h-full rounded-full bg-gradient-to-r ${toneClass}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 text-2xl font-black text-slate-950">{money(value)}{suffix}</div>
    </div>
  );
}



function compareText(current, previous, language, label = '') {
  const sw = language !== 'en';
  const c = Number(current || 0);
  const p = Number(previous || 0);
  const change = percentChange(c, p);
  const absChange = Math.abs(change).toFixed(1);

  if (!c && !p) {
    return sw
      ? `${label ? `${label} ` : ''}hakuna rekodi katika kipindi hiki wala kipindi kilichopita.`
      : `${label ? `${label} ` : ''}has no record in this period or the previous equivalent period.`;
  }

  if (!p && c) {
    return sw
      ? `${label ? `${label} ` : ''}imeonekana kipindi hiki kwa TZS ${money(c)}, lakini kipindi kilichopita ilikuwa sifuri.`
      : `${label ? `${label} ` : ''}appeared this period at TZS ${money(c)}, while the previous equivalent period was zero.`;
  }

  if (p && !c) {
    return sw
      ? `${label ? `${label} ` : ''}imeshuka mpaka sifuri kutoka TZS ${money(p)} kipindi kilichopita.`
      : `${label ? `${label} ` : ''}fell to zero from TZS ${money(p)} in the previous equivalent period.`;
  }

  if (change >= 5) {
    return sw
      ? `${label ? `${label} ` : ''}imeongezeka kutoka TZS ${money(p)} hadi TZS ${money(c)}; ongezeko ni ${absChange}%.`
      : `${label ? `${label} ` : ''}increased from TZS ${money(p)} to TZS ${money(c)}, up ${absChange}%.`;
  }

  if (change <= -5) {
    return sw
      ? `${label ? `${label} ` : ''}imepungua kutoka TZS ${money(p)} hadi TZS ${money(c)}; punguzo ni ${absChange}%.`
      : `${label ? `${label} ` : ''}reduced from TZS ${money(p)} to TZS ${money(c)}, down ${absChange}%.`;
  }

  return sw
    ? `${label ? `${label} ` : ''}imetulia karibu na kipindi kilichopita: sasa TZS ${money(c)}, awali TZS ${money(p)}.`
    : `${label ? `${label} ` : ''}remained close to the previous period: now TZS ${money(c)}, previously TZS ${money(p)}.`;
}

function buildMiniKpiExplanation(dataKey, trend, language, currentValue = 0, previousValue = 0) {
  const sw = language !== 'en';

  if (dataKey === 'sales') {
    const base = compareText(currentValue, previousValue, language, sw ? 'Mauzo' : 'Sales');
    return sw
      ? `${base} Mstari mdogo unaonyesha siku ambazo mauzo yalikuwa na nguvu au yalipungua ndani ya kipindi ulichochagua.`
      : `${base} The mini line shows which days were stronger or weaker inside the selected period.`;
  }

  if (dataKey === 'netProfit') {
    const base = compareText(currentValue, previousValue, language, sw ? 'Faida halisi' : 'Net profit');
    if (Number(currentValue || 0) < 0) {
      return sw
        ? `${base} Kwa sasa faida ni hasi; angalia gharama ya bidhaa, matumizi na bidhaa zinazouzwa chini ya gharama.`
        : `${base} Profit is negative, so check product costs, expenses and items selling below cost.`;
    }
    if (Number(currentValue || 0) === 0) {
      return sw
        ? `${base} Kama mauzo yapo lakini faida ni sifuri, hakiki bei za kununua, bei za kuuza na matumizi.`
        : `${base} If sales exist but profit is zero, verify buying prices, selling prices and expenses.`;
    }
    return sw
      ? `${base} Kama mauzo yameongezeka lakini faida haijaongezeka, tatizo linaweza kuwa kwenye margin au matumizi.`
      : `${base} If sales rose but profit did not, the issue may be margin or expenses.`;
  }

  if (dataKey === 'expenses') {
    const base = compareText(currentValue, previousValue, language, sw ? 'Matumizi' : 'Expenses');
    if (Number(trend || 0) >= 5) {
      return sw
        ? `${base} Kwa kuwa matumizi yameongezeka, linganisha na ongezeko la mauzo; yakikua haraka kuliko mauzo, faida itabanwa.`
        : `${base} Since expenses increased, compare them with sales growth; if they grow faster than sales, profit will be squeezed.`;
    }
    return sw
      ? `${base} Hii inaonyesha kama matumizi yamedhibitiwa au bado yanahitaji kupitiwa.`
      : `${base} This shows whether expenses are controlled or still need review.`;
  }

  if (dataKey === 'mobileCommission') {
    const base = compareText(currentValue, previousValue, language, sw ? 'Kamisheni ya wakala' : 'Wakala commission');
    if (Number(currentValue || 0) === 0) {
      return sw
        ? `${base} Kumbuka kamisheni ni taarifa ya mwezi; inaweza isionekane kwenye Leo, Jana au Wiki ikiwa haijarekodiwa kama mwezi.`
        : `${base} Remember commission is monthly; it may not appear in Today, Yesterday or Week views if recorded as a monthly item.`;
    }
    return sw
      ? `${base} Hii inaonyesha mchango wa huduma za wakala kwenye faida ya biashara, tofauti na mauzo ya bidhaa.`
      : `${base} This shows the contribution of agency services to profit, separate from product sales.`;
  }

  return compareText(currentValue, previousValue, language);
}

function getWaterfallExplanation(analytics, language, costOfGoods, totalBusinessProfit) {
  const sw = language !== 'en';
  const sales = Number(analytics.totalSales || 0);
  const gross = Number(analytics.grossProfit || 0);
  const expenses = Number(analytics.totalExpenses || 0);
  const net = Number(analytics.netProfit || 0);
  const gas = Number(analytics.gasProfit || 0);
  const commission = Number(analytics.mobileCommission || 0);

  if (!sales && !gross && !expenses && !gas && !commission) {
    return sw
      ? 'Hakuna takwimu za kutosha kwenye kipindi hiki. Waterfall inaonyesha sifuri kwa sababu mauzo, matumizi, gesi na kamisheni hazijapatikana kwenye kipindi ulichochagua.'
      : 'There is not enough activity in this period. The waterfall shows zero because sales, expenses, gas and commission were not found in the selected period.';
  }

  const retailText = net >= 0
    ? (sw ? `baada ya matumizi TZS ${money(expenses)}, duka limebaki na faida ya TZS ${money(net)}` : `after expenses of TZS ${money(expenses)}, retail profit is TZS ${money(net)}`)
    : (sw ? `baada ya matumizi TZS ${money(expenses)}, duka limepata hasara ya TZS ${money(Math.abs(net))}` : `after expenses of TZS ${money(expenses)}, retail made a loss of TZS ${money(Math.abs(net))}`);

  return sw
    ? `Mauzo ni TZS ${money(sales)}. Gharama ya bidhaa imechukua TZS ${money(costOfGoods)}, hivyo faida ghafi ni TZS ${money(gross)}. ${retailText}. Gesi imeongeza TZS ${money(gas)} na wakala ameongeza TZS ${money(commission)}; faida ya mwisho ya biashara ni TZS ${money(totalBusinessProfit)}.`
    : `Sales are TZS ${money(sales)}. Product cost took TZS ${money(costOfGoods)}, leaving gross profit of TZS ${money(gross)}. ${retailText}. Gas added TZS ${money(gas)} and wakala added TZS ${money(commission)}, so final business profit is TZS ${money(totalBusinessProfit)}.`;
}

function getShopScoreMeaning(shop, language) {
  const sw = language !== 'en';
  const score = Number(shop.score || 0);
  const parts = [];

  if (Number(shop.sales || 0) <= 0) parts.push(sw ? 'hakuna mauzo yaliyopatikana' : 'no sales were found');
  if (Number(shop.netProfit || 0) < 0) parts.push(sw ? `faida ni hasi kwa TZS ${money(Math.abs(shop.netProfit))}` : `profit is negative by TZS ${money(Math.abs(shop.netProfit))}`);
  else if (Number(shop.netProfit || 0) === 0) parts.push(sw ? 'faida halisi ni sifuri' : 'net profit is zero');
  if (Number(shop.expensePressure || 0) >= 50) parts.push(sw ? `matumizi ni makubwa ukilinganisha na faida ghafi (${pct(shop.expensePressure)})` : `expense pressure is high at ${pct(shop.expensePressure)}`);
  if (Number(shop.margin || 0) < 8 && Number(shop.sales || 0) > 0) parts.push(sw ? `margin ni ndogo (${pct(shop.margin)})` : `margin is weak at ${pct(shop.margin)}`);
  if (Number(shop.critical || 0) > 0 || Number(shop.high || 0) > 0) parts.push(sw ? `kuna hatari ${shop.critical} kubwa na vipaumbele ${shop.high} vya juu` : `there are ${shop.critical} critical and ${shop.high} high-priority risks`);

  if (!parts.length) {
    return sw
      ? `Alama ${score}/100 inaonyesha duka linaonekana vizuri kwa kipindi hiki: mauzo ni TZS ${money(shop.sales)}, faida ni TZS ${money(shop.netProfit)}, na matumizi yako kwenye ${pct(shop.expensePressure)} ya faida ghafi.`
      : `Score ${score}/100 means the shop looks healthy in this period: sales are TZS ${money(shop.sales)}, profit is TZS ${money(shop.netProfit)}, and expense pressure is ${pct(shop.expensePressure)} of gross profit.`;
  }

  return sw
    ? `Alama ${score}/100 imeshushwa na haya: ${parts.join('; ')}. Kipaumbele ni kukagua mauzo, margin, matumizi na hatari za duka hili.`
    : `Score ${score}/100 is pulled down by: ${parts.join('; ')}. Priority is to review this shop's sales, margin, expenses and risks.`;
}

function getTrendChartExplanation(analytics, language) {
  const sw = language !== 'en';
  const sales = compareText(analytics.totalSales, analytics.previousTotalSales, language, sw ? 'Mauzo' : 'Sales');
  const profit = compareText(analytics.netProfit, analytics.previousNetProfit, language, sw ? 'Faida halisi' : 'Net profit');
  const expenses = compareText(analytics.totalExpenses, analytics.previousTotalExpenses, language, sw ? 'Matumizi' : 'Expenses');
  return sw
    ? `${sales} ${profit} ${expenses}`
    : `${sales} ${profit} ${expenses}`;
}

function getProductMixExplanation(analytics, language) {
  const sw = language !== 'en';
  const rows = analytics.productMix || [];
  const top = rows.slice().sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))[0];
  if (!top) return sw ? 'Hakuna mauzo ya makundi ya bidhaa katika kipindi hiki.' : 'No product-category sales were found in this period.';
  const total = rows.reduce((s, r) => s + Number(r.sales || 0), 0);
  const share = total ? (Number(top.sales || 0) / total) * 100 : 0;
  return sw
    ? `Kundi lenye nguvu zaidi ni ${catLabel(top.category, language)}, mauzo TZS ${money(top.sales)} sawa na ${share.toFixed(1)}% ya mauzo ya makundi yaliyoonekana.`
    : `The strongest category is ${catLabel(top.category, language)}, with TZS ${money(top.sales)} sales, equal to ${share.toFixed(1)}% of category sales found.`;
}

function getTopProductsExplanation(analytics, language) {
  const sw = language !== 'en';
  const top = (analytics.topProducts || [])[0];
  if (!top) return sw ? 'Hakuna bidhaa yenye faida iliyoonekana katika kipindi hiki.' : 'No profit-generating product was found in this period.';
  return sw
    ? `Bidhaa inayoongoza ni ${top.productName} katika ${formatShopForText(top.shopName, language)}: faida TZS ${money(top.profit)} na mauzo TZS ${money(top.sales)}. Hakikisha stock yake haikosekani.`
    : `The leading product is ${top.productName} in ${top.shopName}: profit TZS ${money(top.profit)} and sales TZS ${money(top.sales)}. Make sure it does not run out of stock.`;
}

function getCapitalExplanation(analytics, language) {
  const sw = language !== 'en';
  const top = (analytics.capitalEfficiency || []).slice().sort((a, b) => Number(b.stockValue || 0) - Number(a.stockValue || 0))[0];
  if (!top) return sw ? 'Hakuna bidhaa yenye thamani ya stock ya kuchambua.' : 'No stock-value item was found for analysis.';
  return sw
    ? `${top.productName} katika ${formatShopForText(top.shopName, language)} inashikilia mtaji mkubwa zaidi: TZS ${money(top.stockValue)}. Linganisha na faida yake TZS ${money(top.profit)} ili kujua kama mtaji unafanya kazi au umelala.`
    : `${top.productName} in ${top.shopName} is holding the largest capital: TZS ${money(top.stockValue)}. Compare this with profit of TZS ${money(top.profit)} to see whether capital is working or sleeping.`;
}

function getRiskExplanation(visibleRecommendations, language) {
  const sw = language !== 'en';
  const critical = visibleRecommendations.filter((rec) => rec.priority === 'Critical').length;
  const high = visibleRecommendations.filter((rec) => rec.priority === 'High').length;
  const medium = visibleRecommendations.filter((rec) => rec.priority === 'Medium').length;
  const low = visibleRecommendations.filter((rec) => rec.priority === 'Low').length;
  if (!visibleRecommendations.length) return sw ? 'Hakuna hatari hai iliyobaki baada ya hatua ulizoweka.' : 'No active risk remains after the actions you recorded.';
  return sw
    ? `Kuna hatari ${critical} za Critical, ${high} za High, ${medium} za Medium na ${low} za Low. Anza na Critical na High kwa sababu ndizo zinaweza kuumiza biashara haraka.`
    : `There are ${critical} Critical, ${high} High, ${medium} Medium and ${low} Low risks. Start with Critical and High because they can hurt the business faster.`;
}

function getWakalaGasExplanation(analytics, language) {
  const sw = language !== 'en';
  const items = [
    { label: sw ? 'wakala wa simu' : 'mobile wakala', value: Number(analytics.mobileWakalaCommission || 0) },
    { label: sw ? 'wakala wa benki' : 'bank wakala', value: Number(analytics.bankWakalaCommission || 0) },
    { label: sw ? 'gesi' : 'gas', value: Number(analytics.gasProfit || 0) },
  ].sort((a, b) => b.value - a.value);
  const top = items[0];
  return sw
    ? `Mchango mkubwa zaidi hapa unatoka ${top.label}: TZS ${money(top.value)}. Jumla ya wakala na gesi ni TZS ${money(Number(analytics.mobileCommission || 0) + Number(analytics.gasProfit || 0))}.`
    : `The largest contribution here is from ${top.label}: TZS ${money(top.value)}. Total wakala and gas contribution is TZS ${money(Number(analytics.mobileCommission || 0) + Number(analytics.gasProfit || 0))}.`;
}

function getBusinessPulseExplanation(analytics, language) {
  const sw = language !== 'en';
  const today = analytics.pulse?.today || {};
  const yesterday = analytics.pulse?.yesterday || {};
  return sw
    ? `Leo mauzo ni TZS ${money(today.sales)}, faida ni TZS ${money(today.netProfit)} na matumizi ni TZS ${money(today.expenses)}. Jana mauzo yalikuwa TZS ${money(yesterday.sales)} na faida TZS ${money(yesterday.netProfit)}.`
    : `Today sales are TZS ${money(today.sales)}, profit is TZS ${money(today.netProfit)} and expenses are TZS ${money(today.expenses)}. Yesterday sales were TZS ${money(yesterday.sales)} and profit was TZS ${money(yesterday.netProfit)}.`;
}

function getMiniKpiExplanation(dataKey, trend, language, currentValue = 0, previousValue = 0) {
  const sw = language !== 'en';
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);
  const difference = current - previous;
  const absDifference = Math.abs(difference);

  const names = {
    sales: sw ? 'Mauzo' : 'Sales',
    netProfit: sw ? 'Faida halisi' : 'Net profit',
    expenses: sw ? 'Matumizi' : 'Expenses',
    mobileCommission: sw ? 'Kamisheni ya wakala' : 'Wakala commission',
  };

  const name = names[dataKey] || (sw ? 'Taarifa hii' : 'This item');

  if (!previous && current > 0) {
    return sw
      ? `${name} ya kipindi hiki ni TZS ${money(current)}. Kipindi kilichopita hakikuwa na kiasi cha kulinganisha, hivyo hili linaonekana kama ongezeko jipya.`
      : `${name} for this period is TZS ${money(current)}. The previous period had no comparable amount, so this appears as new growth.`;
  }

  if (previous > 0 && !current) {
    return sw
      ? `${name} imeshuka mpaka TZS 0 kutoka TZS ${money(previous)}. Angalia kama biashara kweli imeshuka au taarifa hazijaingizwa.`
      : `${name} dropped to TZS 0 from TZS ${money(previous)}. Check whether business really reduced or records were not entered.`;
  }

  if (difference > 0) {
    return sw
      ? `${name} imeongezeka kwa TZS ${money(absDifference)}, kutoka TZS ${money(previous)} hadi TZS ${money(current)}.`
      : `${name} increased by TZS ${money(absDifference)}, from TZS ${money(previous)} to TZS ${money(current)}.`;
  }

  if (difference < 0) {
    return sw
      ? `${name} imepungua kwa TZS ${money(absDifference)}, kutoka TZS ${money(previous)} hadi TZS ${money(current)}.`
      : `${name} reduced by TZS ${money(absDifference)}, from TZS ${money(previous)} to TZS ${money(current)}.`;
  }

  return sw
    ? `${name} imebaki TZS ${money(current)}, sawa na kipindi kilichopita.`
    : `${name} remained at TZS ${money(current)}, the same as the previous period.`;
}

function MiniSparkline({ rows = [], dataKey = 'value', stroke = '#38bdf8' }) {
  const safeRows = rows.filter(Boolean).slice(-14);
  const width = 180;
  const height = 54;
  const pad = 6;
  const values = safeRows.map((row) => Number(row[dataKey] || 0));
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(1, maxValue - minValue);
  const step = safeRows.length > 1 ? (width - pad * 2) / (safeRows.length - 1) : 0;
  const points = safeRows.map((row, idx) => {
    const x = pad + idx * step;
    const y = height - pad - ((Number(row[dataKey] || 0) - minValue) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  if (!safeRows.length) {
    return <div className="h-[54px] rounded-2xl bg-slate-50" />;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[54px] w-full">
      <defs>
        <linearGradient id={`mini-${dataKey}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${pad},${height - pad} ${points} ${width - pad},${height - pad}`} fill={`url(#mini-${dataKey})`} opacity="0.16" />
    </svg>
  );
}

function MiniKpiCard({ label, value, trend, rows, dataKey, stroke, tone = 'blue', language, currentValue = 0, previousValue = 0 }) {
  const sw = language !== 'en';
  const toneMap = {
    blue: 'from-blue-50 to-cyan-50 text-blue-700',
    emerald: 'from-emerald-50 to-teal-50 text-emerald-700',
    orange: 'from-orange-50 to-rose-50 text-orange-700',
    violet: 'from-violet-50 to-fuchsia-50 text-violet-700',
  };

  return (
    <div className={`overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br ${toneMap[tone] || toneMap.blue} p-4 shadow-lg shadow-slate-200/60`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide opacity-75">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${trendClass(trend)}`}>
          {getTrendLabel(trend, language)}
        </span>
      </div>
      <div className="mt-3 rounded-2xl bg-white/70 p-3 shadow-inner">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between gap-3 text-[11px] font-black text-slate-700">
              <span>{sw ? 'Kipindi hiki' : 'This period'}</span>
              <span>TZS {money(currentValue)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.max(
                    4,
                    (Number(currentValue || 0) / Math.max(Number(currentValue || 0), Number(previousValue || 0), 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-3 text-[11px] font-black text-slate-500">
              <span>{sw ? 'Kipindi kilichopita' : 'Previous period'}</span>
              <span>TZS {money(previousValue)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-300"
                style={{
                  width: `${Math.max(
                    4,
                    (Number(previousValue || 0) / Math.max(Number(currentValue || 0), Number(previousValue || 0), 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 rounded-2xl bg-white/65 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
        {getMiniKpiExplanation(dataKey, trend, language, currentValue, previousValue)}
      </p>
    </div>
  );
}

function KpiMiniChartPanel({ analytics, language }) {
  const sw = language !== 'en';
  const rows = analytics.trendRows || [];
  const salesTrend = percentChange(analytics.totalSales, analytics.previousTotalSales);
  const profitTrend = percentChange(analytics.netProfit, analytics.previousNetProfit);
  const expenseTrend = percentChange(analytics.totalExpenses, analytics.previousTotalExpenses);
  const commissionTrend = percentChange(analytics.mobileCommission, analytics.previousMobileCommission);

  return (
    <DropdownPanel
      title={sw ? 'Kadi Muhimu za Ulinganisho' : 'Key Comparison Cards'}
      subtitle={sw ? 'Kila kadi inaonyesha matokeo ya kipindi hiki dhidi ya kipindi kilichopita ili kuona kilichoongezeka, kilichopungua au kilichotulia.' : 'Each card compares this period with the previous period so you can see what increased, reduced, or remained stable.'}
      badge={sw ? 'Muonekano wa CEO' : 'CEO view'}
      defaultOpen
      tone="blue"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniKpiCard label={sw ? 'Mauzo' : 'Sales'} value={`TZS ${money(analytics.totalSales)}`} trend={salesTrend} rows={rows} dataKey="sales" stroke="#38bdf8" tone="blue" language={language} currentValue={analytics.totalSales} previousValue={analytics.previousTotalSales} />
        <MiniKpiCard label={sw ? 'Faida halisi' : 'Net profit'} value={`TZS ${money(analytics.netProfit)}`} trend={profitTrend} rows={rows} dataKey="netProfit" stroke="#10b981" tone="emerald" language={language} currentValue={analytics.netProfit} previousValue={analytics.previousNetProfit} />
        <MiniKpiCard label={sw ? 'Matumizi' : 'Expenses'} value={`TZS ${money(analytics.totalExpenses)}`} trend={expenseTrend} rows={rows} dataKey="expenses" stroke="#f97316" tone="orange" language={language} currentValue={analytics.totalExpenses} previousValue={analytics.previousTotalExpenses} />
        <MiniKpiCard label={sw ? 'Kamisheni ya wakala' : 'Wakala commission'} value={`TZS ${money(analytics.mobileCommission)}`} trend={commissionTrend} rows={rows} dataKey="mobileCommission" stroke="#8b5cf6" tone="violet" language={language} currentValue={analytics.mobileCommission} previousValue={analytics.previousMobileCommission} />
      </div>
    </DropdownPanel>
  );
}

function ProfitWaterfallChart({ analytics, language }) {
  const sw = language !== 'en';
  const costOfGoods = Math.max(0, Number(analytics.totalSales || 0) - Number(analytics.grossProfit || 0));
  const totalBusinessProfit = Number(analytics.netProfit || 0) + Number(analytics.gasProfit || 0) + Number(analytics.mobileCommission || 0);

  const rows = [
    { label: sw ? 'Mauzo' : 'Sales', value: Number(analytics.totalSales || 0), kind: 'positive' },
    { label: sw ? 'Gharama ya bidhaa' : 'Cost of goods', value: -costOfGoods, kind: 'negative' },
    { label: sw ? 'Faida ghafi' : 'Gross profit', value: Number(analytics.grossProfit || 0), kind: 'subtotal' },
    { label: sw ? 'Matumizi' : 'Expenses', value: -Number(analytics.totalExpenses || 0), kind: 'negative' },
    { label: sw ? 'Faida ya duka' : 'Retail net profit', value: Number(analytics.netProfit || 0), kind: 'subtotal' },
    { label: sw ? 'Faida ya gesi' : 'Gas profit', value: Number(analytics.gasProfit || 0), kind: 'positive' },
    { label: sw ? 'Kamisheni ya wakala' : 'Wakala commission', value: Number(analytics.mobileCommission || 0), kind: 'positive' },
    { label: sw ? 'Faida ya biashara' : 'Business profit', value: totalBusinessProfit, kind: 'total' },
  ];

  const maxValue = Math.max(...rows.map((row) => Math.abs(row.value)), 1);

  return (
    <DropdownPanel
      title={sw ? 'Waterfall ya Faida ya Biashara' : 'Business Profit Waterfall'}
      subtitle={sw ? 'Inaonyesha namna mauzo yanavyoshuka na kupanda mpaka kufikia faida ya mwisho.' : 'Shows how sales move through costs and income lines into final business profit.'}
      badge={`TZS ${money(totalBusinessProfit)}`}
      defaultOpen
      tone="violet"
    >
      <div className="rounded-[28px] bg-white/80 p-4 shadow-inner">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => {
            const width = Math.max(8, (Math.abs(row.value) / maxValue) * 100);
            const isNegative = row.value < 0;
            const tone = row.kind === 'total'
              ? 'from-slate-800 to-slate-950'
              : row.kind === 'subtotal'
                ? 'from-violet-400 to-indigo-500'
                : isNegative
                  ? 'from-rose-300 to-orange-400'
                  : 'from-emerald-300 to-teal-500';

            return (
              <div key={row.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{row.label}</p>
                <p className={`mt-2 text-xl font-black ${isNegative ? 'text-rose-700' : 'text-slate-950'}`}>
                  {isNegative ? '-' : ''}TZS {money(Math.abs(row.value))}
                </p>
                <div className="mt-4 h-4 overflow-hidden rounded-full bg-white shadow-inner">
                  <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Waterfall explanation removed */}
      </div>
    </DropdownPanel>
  );
}

function calculateShopScore(shop, visibleRecommendations = []) {
  const marginScore = Math.max(0, Math.min(30, Number(shop.margin || 0) * 1.5));
  const expenseScore = Math.max(0, Math.min(25, 25 - Number(shop.expensePressure || 0) / 4));
  const profitScore = Number(shop.netProfit || 0) > 0 ? 20 : 0;
  const salesScore = Number(shop.sales || 0) > 0 ? 15 : 0;
  const shopRisks = visibleRecommendations.filter((rec) => String(rec.shopId || '') === String(shop.shopId || ''));
  const riskPenalty = shopRisks.reduce((sum, rec) => {
    if (rec.priority === 'Critical') return sum + 12;
    if (rec.priority === 'High') return sum + 7;
    if (rec.priority === 'Medium') return sum + 4;
    return sum + 1;
  }, 0);
  return Math.max(0, Math.min(100, Math.round(marginScore + expenseScore + profitScore + salesScore + 10 - riskPenalty)));
}

function ShopScorecardPanel({ analytics, visibleRecommendations, language }) {
  const sw = language !== 'en';
  const rows = (analytics.shopPerformance || []).map((shop) => {
    const score = calculateShopScore(shop, visibleRecommendations);
    const shopRisks = visibleRecommendations.filter((rec) => String(rec.shopId || '') === String(shop.shopId || ''));
    return {
      ...shop,
      score,
      critical: shopRisks.filter((rec) => rec.priority === 'Critical').length,
      high: shopRisks.filter((rec) => rec.priority === 'High').length,
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <DropdownPanel
      title={sw ? 'Scorecard za Maduka' : 'Shop Scorecards'}
      subtitle={sw ? 'Kila duka linapewa alama kwa kuangalia mauzo, faida, matumizi na hatari zilizopo.' : 'Each shop is scored using sales, profit, expense pressure and current risks.'}
      badge={`${rows.length} ${sw ? 'maduka' : 'shops'}`}
      defaultOpen
      tone="emerald"
    >
      <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
        {rows.length
          ? (sw
            ? `Duka lenye alama nzuri zaidi ni ${rows[0].shopName} (${rows[0].score}/100). ${rows[rows.length - 1]?.shopName || rows[0].shopName} lina alama ya chini zaidi (${rows[rows.length - 1]?.score ?? rows[0].score}/100), hivyo ndilo la kuanza kulikagua.`
            : `The best score is ${rows[0].shopName} (${rows[0].score}/100). ${rows[rows.length - 1]?.shopName || rows[0].shopName} has the lowest score (${rows[rows.length - 1]?.score ?? rows[0].score}/100), so start reviewing it first.`)
          : (sw ? 'Hakuna duka lenye data ya kutosha kupewa alama.' : 'No shop has enough data to be scored.')}
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((shop) => {
          const tone = shop.score >= 75 ? 'emerald' : shop.score >= 55 ? 'amber' : 'rose';
          const bar = tone === 'emerald' ? 'from-emerald-400 to-teal-500' : tone === 'amber' ? 'from-amber-300 to-orange-400' : 'from-rose-400 to-red-500';

          return (
            <div key={shop.shopId} className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xl font-black text-slate-950">{shop.shopName}</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{sw ? 'Nguvu kuu' : 'Main strength'}: {shop.strength}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(shop.status)}`}>{shop.status}</span>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">{sw ? 'Alama ya duka' : 'Shop score'}</p>
                    <p className="mt-1 text-4xl font-black text-slate-950">{shop.score}<span className="text-lg text-slate-400">/100</span></p>
                  </div>
                  <div className="text-right text-xs font-bold text-slate-500">
                    <div>{sw ? 'Margin' : 'Margin'}: {pct(shop.margin)}</div>
                    <div>{sw ? 'Matumizi/Gross' : 'Expense pressure'}: {pct(shop.expensePressure)}</div>
                  </div>
                </div>
                <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                  <div className={`h-full rounded-full bg-gradient-to-r ${bar}`} style={{ width: `${shop.score}%` }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <SoftTile label={sw ? 'Mauzo' : 'Sales'} value={`TZS ${money(shop.sales)}`} className="bg-blue-50" />
                <SoftTile label={sw ? 'Faida' : 'Profit'} value={`TZS ${money(shop.netProfit)}`} className="bg-emerald-50" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">{shop.critical} {sw ? 'hatari kubwa' : 'critical'}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{shop.high} {sw ? 'vipaumbele juu' : 'high priority'}</span>
              </div>

              <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
                {getShopScoreMeaning(shop, language)}
              </p>
            </div>
          );
        })}
        {!rows.length ? <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{sw ? 'Hakuna duka la kuonyesha.' : 'No shop to show.'}</div> : null}
      </div>
    </DropdownPanel>
  );
}


function BIVisualDashboard({ analytics, visibleRecommendations, language }) {
  const sw = language !== 'en';
  const trendRows = analytics.trendRows || [];
  const shopRows = (analytics.shopPerformance || []).slice(0, 8).map((shop) => ({ label: shop.shopName, sales: shop.sales, profit: Math.max(0, shop.netProfit), expenses: shop.expenses }));
  const topProfitRows = (analytics.topProducts || []).slice(0, 8).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.profit }));
  const productMixRows = (analytics.productMix || []).map((item) => ({ label: catLabel(item.category, language), value: item.sales }));
  const capitalRows = (analytics.capitalEfficiency || []).slice(0, 8).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.stockValue }));
  const riskItems = ['Critical', 'High', 'Medium', 'Low'].map((priority) => ({ label: priority, value: visibleRecommendations.filter((rec) => rec.priority === priority).length }));
  const wakalaRows = [
    { label: sw ? 'Simu' : 'Mobile', value: analytics.mobileWakalaCommission || 0 },
    { label: sw ? 'Benki' : 'Bank', value: analytics.bankWakalaCommission || 0 },
    { label: sw ? 'Gesi' : 'Gas', value: analytics.gasProfit || 0 },
  ];

  return (
    <DropdownPanel
      title={sw ? 'Dashboard ya Picha na Chati' : 'Visual Business Intelligence'}
      subtitle={sw ? 'Chati hizi hazitumii mfano; zinatumia mauzo, matumizi, bidhaa, gesi na wakala za kipindi na duka ulilochagua.' : 'These visuals are not samples; they use sales, expenses, products, gas and wakala data from the selected period and shop filter.'}
      badge={sw ? 'Data halisi' : 'Real data'}
      defaultOpen
      tone="blue"
    >
      <ProfitWaterfallChart analytics={analytics} language={language} />

      <ShopScorecardPanel analytics={analytics} visibleRecommendations={visibleRecommendations} language={language} />

      <div className="grid gap-4 xl:grid-cols-12">
        <ChartCard title={sw ? 'Mwenendo wa Mauzo, Faida na Matumizi' : 'Sales, Profit and Expenses Trend'} subtitle={`${analytics.range.start} — ${analytics.range.end}`} explanation={getTrendChartExplanation(analytics, language)} className="xl:col-span-8">
          <SimpleLineChart
            rows={trendRows}
            lines={[
              { key: 'sales', label: sw ? 'Mauzo' : 'Sales', stroke: '#38bdf8' },
              { key: 'netProfit', label: sw ? 'Faida' : 'Profit', stroke: '#34d399' },
              { key: 'expenses', label: sw ? 'Matumizi' : 'Expenses', stroke: '#f59e0b' },
            ]}
          />
        </ChartCard>

        <ChartCard title={sw ? 'Mchanganyiko wa Bidhaa' : 'Product Mix'} subtitle={sw ? 'Mgawanyo kwa makundi ya bidhaa' : 'Sales share by category'} explanation={getProductMixExplanation(analytics, language)} className="xl:col-span-4">
          <DonutChart items={productMixRows} centerLabel={sw ? 'Mauzo' : 'Sales'} centerValue={`TZS ${money(analytics.totalSales)}`} language={language} />
        </ChartCard>

        <ChartCard title={sw ? 'Ulinganisho wa Maduka kwa Mauzo' : 'Shop Sales Comparison'} subtitle={sw ? 'Maduka yenye nguvu ya mauzo' : 'Sales strength by shop'} explanation={sw ? 'Nguzo ndefu inaonyesha duka lililouza zaidi. Tumia hii kuona duka linalovuta mauzo na duka linalohitaji kuchunguzwa.' : 'A taller bar means the shop sold more. Use this to see which shop is driving sales and which shop needs attention.'} className="xl:col-span-6">
          <VerticalBarChart rows={shopRows} valueKey="sales" labelKey="label" barClass="from-blue-300 to-cyan-400" />
        </ChartCard>

        <ChartCard title={sw ? 'Ulinganisho wa Maduka kwa Faida' : 'Shop Profit Comparison'} subtitle={sw ? 'Faida halisi kwa kila duka' : 'Net profit by shop'} explanation={sw ? 'Nguzo ndefu inaonyesha duka lililoleta faida zaidi baada ya matumizi. Kama duka lina mauzo makubwa lakini faida ndogo, angalia bei, gharama au matumizi.' : 'A taller bar means the shop produced more profit after expenses. If a shop has high sales but weak profit, check prices, costs or expenses.'} className="xl:col-span-6">
          <VerticalBarChart rows={shopRows} valueKey="profit" labelKey="label" barClass="from-emerald-300 to-teal-400" />
        </ChartCard>

        <ChartCard title={sw ? 'Bidhaa Zinazoleta Faida Zaidi' : 'Top Profit Products'} subtitle={sw ? 'Bidhaa bora kwa faida katika kipindi hiki' : 'Best profit products in this period'} explanation={getTopProductsExplanation(analytics, language)} className="xl:col-span-6">
          <HorizontalBarList rows={topProfitRows} valueKey="value" labelKey="label" barClass="from-emerald-400 to-teal-400" />
        </ChartCard>

        <ChartCard title={sw ? 'Mtaji Uliokaa kwenye Stock' : 'Capital Sitting in Stock'} subtitle={sw ? 'Bidhaa zenye thamani kubwa ya stock' : 'Highest stock-value products'} explanation={getCapitalExplanation(analytics, language)} className="xl:col-span-6">
          <HorizontalBarList rows={capitalRows} valueKey="value" labelKey="label" barClass="from-violet-300 to-indigo-400" />
        </ChartCard>

        <ChartCard title={sw ? 'Hatari kwa Vipaumbele' : 'Risk by Priority'} subtitle={sw ? 'Idadi ya mapendekezo kwa umuhimu' : 'Recommendation count by priority'} explanation={getRiskExplanation(visibleRecommendations, language)} className="xl:col-span-4">
          <DonutChart items={riskItems} centerLabel={sw ? 'Ushauri' : 'Insights'} centerValue={visibleRecommendations.length} language={language} />
        </ChartCard>

        <ChartCard title={sw ? 'Wakala, Benki na Gesi' : 'Wakala, Bank and Gas'} subtitle={sw ? 'Kamisheni na faida ya gesi' : 'Commissions and gas profit'} explanation={getWakalaGasExplanation(analytics, language)} className="xl:col-span-4">
          <HorizontalBarList rows={wakalaRows} valueKey="value" labelKey="label" maxRows={3} barClass="from-cyan-300 to-blue-400" />
        </ChartCard>

        <ChartCard title={sw ? 'Vipimo vya Haraka vya Hatari' : 'Quick Risk Gauges'} subtitle={sw ? 'Muhtasari wa thamani zilizo kwenye hatari' : 'Summary of values at risk'} explanation={sw ? 'Vipimo hivi vinaonyesha sehemu ya thamani ya stock iliyo kwenye hatari, hasa stock isiyozunguka na stock iliyo karibu na expiry.' : 'These gauges show the share of stock value at risk, especially slow-moving stock and stock near expiry.'} className="xl:col-span-4">
          <div className="grid gap-3">
            <GaugeCard label={sw ? 'Stock isiyozunguka' : 'Slow stock capital'} value={analytics.summaryTotals.slowStockCapital} max={Math.max(1, analytics.stockValue)} tone="amber" />
            <GaugeCard label={sw ? 'Stock karibu na expiry' : 'Expiry risk value'} value={analytics.summaryTotals.expiryRiskValue} max={Math.max(1, analytics.stockValue)} tone="rose" />
          </div>
        </ChartCard>
      </div>
    </DropdownPanel>
  );
}

export default function CEODecisionCentre({ data, language = 'sw' }) {
  const t = useT(language);
  const sw = language !== 'en';
  const [period, setPeriod] = React.useState('month');
  const [customStart, setCustomStart] = React.useState(toISO(addDays(new Date(), -29)));
  const [customEnd, setCustomEnd] = React.useState(toISO(new Date()));
  const [viewMode, setViewMode] = React.useState('summary');
  const [shopFilter, setShopFilter] = React.useState('all');
  const [actions, setActions] = React.useState(() => readActions());
  const [productSearch, setProductSearch] = React.useState('');
  const [productStatusFilter, setProductStatusFilter] = React.useState('all');
  const [aiEndpoint, setAiEndpoint] = React.useState('http://localhost:11434/api/generate');
  const [aiModel, setAiModel] = React.useState('llama3.2:3b');
  const [aiQuestion, setAiQuestion] = React.useState('');
  const [aiAnswer, setAiAnswer] = React.useState('');
  const [aiError, setAiError] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  const analytics = React.useMemo(
    () => buildAnalytics({ data, period, shopFilter, language, customStart, customEnd }),
    [data, period, shopFilter, language, customStart, customEnd]
  );

  const visibleRecommendations = React.useMemo(() => {
    return analytics.recommendations
      .filter((rec) => !actionHidden(actions[rec.id]))
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  }, [analytics.recommendations, actions]);

  const criticalRecommendations = visibleRecommendations.filter((rec) => rec.priority === 'Critical');
  const highRecommendations = visibleRecommendations.filter((rec) => rec.priority === 'High');
  const opportunityRecommendations = visibleRecommendations.filter((rec) => ['Stock Transfer', 'Missing Product Opportunity', 'Investment Opportunity'].includes(rec.type));

  const productRows = React.useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return analytics.productCommandRows
      .filter((row) => !query || row.productName.toLowerCase().includes(query) || row.shopName.toLowerCase().includes(query))
      .filter((row) => productStatusFilter === 'all' || row.status === productStatusFilter)
      .slice(0, 300);
  }, [analytics.productCommandRows, productSearch, productStatusFilter]);

  const auditTrail = React.useMemo(() => {
    return Object.values(actions || {})
      .filter((item) => item && item.recommendationId)
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }, [actions]);

  const handleDecision = (rec, status) => {
    let note = actions[rec.id]?.note || '';

    if (status === 'Note') {
      note = window.prompt(sw ? 'Andika jibu au hatua iliyowekwa:' : 'Write owner response/action note:', note) || note;
      status = actions[rec.id]?.status || 'Planned';
    } else if (['Done', 'Planned', 'Snoozed', 'Not Relevant'].includes(status)) {
      const existingNote = actions[rec.id]?.note || '';
      const promptText = sw ? 'Hiari: andika hatua iliyowekwa au sababu ya uamuzi huu:' : 'Optional: write what was done or why this action was chosen:';
      note = window.prompt(promptText, existingNote) || existingNote;
    }

    const snoozeUntil = ['Snoozed', 'Not Relevant'].includes(status) ? toISO(addDays(new Date(), DEFAULT_SNOOZE_DAYS)) : '';
    const implemented = status === 'Done';

    const next = {
      ...actions,
      [rec.id]: {
        recommendationId: rec.id,
        type: rec.type,
        productCode: rec.productCode,
        productName: rec.productName,
        shopName: rec.shopName,
        challenge: rec.title,
        evidence: rec.evidence,
        suggestedAction: rec.action,
        status,
        note,
        implemented,
        snoozeUntil,
        updatedAt: new Date().toISOString(),
      },
    };
    setActions(next);
    writeActions(next);
  };

  const setAiQuickQuestion = (type) => {
    const map = {
      explain: sw ? 'Eleza mwenendo wa biashara na hatua muhimu za kuchukua.' : 'Explain business performance and the most important actions.',
      profit: sw ? 'Kwa nini faida inaweza kuwa imeshuka au kuwa chini?' : 'Why might profit have reduced or remained weak?',
      duplicates: sw ? 'Tafuta bidhaa zinazoweza kujirudia au kuandikwa kwa majina tofauti.' : 'Find possible duplicate products or products recorded with different names.',
      weekly: sw ? 'Pendekeza mpango wa hatua za wiki hii kwa mmiliki.' : 'Suggest this week action plan for the owner.',
      investment: sw ? 'Tafuta fursa za uwekezaji kutokana na mwenendo wa bidhaa, maduka, gesi na wakala.' : 'Find investment opportunities from products, shops, gas and mobile money trends.',
    };
    setAiQuestion(map[type] || map.explain);
  };

  const buildAiPrompt = () => {
    const recs = visibleRecommendations.slice(0, 15).map((r, idx) => `${idx + 1}. ${r.title}. ${sw ? 'Ushahidi' : 'Evidence'}: ${r.evidence}. ${sw ? 'Hatua' : 'Action'}: ${r.action}. Priority: ${r.priority}.`);
    return `
You are a local AI business advisor for a multi-shop POS system.
Respond in ${language === 'en' ? 'English' : 'Kiswahili'}.
Use only the provided facts. Do not invent missing data.
Do not recommend automatic changes to stock, prices, names, sales or Supabase records.
For medicine-related products, mention licensing/legal requirements.

Period: ${period}
Shop filter: ${shopFilter}
Sales: TZS ${money(analytics.totalSales)}
Previous sales: TZS ${money(analytics.previousTotalSales)}
Gross profit: TZS ${money(analytics.grossProfit)}
Net profit: TZS ${money(analytics.netProfit)}
Expenses: TZS ${money(analytics.totalExpenses)}
Stock value: TZS ${money(analytics.stockValue)}
Credit outstanding: TZS ${money(analytics.creditOutstanding)}
Change ledger outstanding: TZS ${money(analytics.changeOutstanding)}
Mobile commission: TZS ${money(analytics.mobileWakalaCommission || 0)}
Bank commission: TZS ${money(analytics.bankWakalaCommission || 0)}
Total Wakala commission: TZS ${money(analytics.mobileCommission)}
Gas profit: TZS ${money(analytics.gasProfit)}

CEO message:
${analytics.businessMessage}

Data confidence:
${analytics.dataIssues.length ? analytics.dataIssues.join(' ') : (sw ? 'Hakuna tatizo kubwa lililoonekana.' : 'No major issue detected.')}

Top active recommendations:
${recs.join('\n')}

Owner question:
${aiQuestion || (sw ? 'Eleza mwenendo wa biashara na pendekeza hatua muhimu zaidi.' : 'Explain the business performance and suggest the most important actions.')}
`;
  };

  const askLocalAi = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAnswer('');
    try {
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: aiModel, prompt: buildAiPrompt(), stream: false }),
      });
      if (!response.ok) throw new Error(`Local AI responded with status ${response.status}`);
      const result = await response.json();
      setAiAnswer(result?.response || result?.message?.content || 'Local AI returned no response.');
    } catch (error) {
      setAiError(`${sw ? 'AI ya ndani haijaunganishwa au imezuiwa. Dashboard bado inafanya kazi bila AI.' : 'Local AI is not connected or blocked. The dashboard still works without AI.'} Details: ${error?.message || 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const salesTrend = percentChange(analytics.totalSales, analytics.previousTotalSales);
  const profitTrend = percentChange(analytics.netProfit, analytics.previousNetProfit);
  const expenseTrend = percentChange(analytics.totalExpenses, analytics.previousTotalExpenses);
  const commissionTrend = percentChange(analytics.mobileCommission, analytics.previousMobileCommission);
  const maxShopSales = Math.max(...analytics.shopPerformance.map((s) => s.sales), 1);
  const maxShopProfit = Math.max(...analytics.shopPerformance.map((s) => Math.max(0, s.netProfit)), 1);
  const healthStatus = criticalRecommendations.length ? (sw ? 'Hatari zinahitaji uamuzi' : 'Critical action needed') : highRecommendations.length ? (sw ? 'Inahitaji uangalizi' : 'Needs attention') : (sw ? 'Inaonekana vizuri' : 'Looks healthy');

  const showSummary = viewMode === 'summary' || viewMode === 'grid';
  const showRisks = viewMode === 'summary' || viewMode === 'risk' || viewMode === 'action';
  const showProducts = viewMode === 'products' || viewMode === 'table';
  const showAi = viewMode === 'ai';

  return (
    <div className="mt-6 rounded-[36px] bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4 shadow-2xl shadow-slate-200/80">
      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/55 backdrop-blur-xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-800 to-sky-800 p-6 text-white">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-cyan-100 ring-1 ring-white/15">
                {sw ? 'Dashboard ya maamuzi ya mmiliki' : 'Owner decision dashboard'}
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{t('title')}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">{analytics.businessMessage}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950">{healthStatus}</span>
                <span className="rounded-full bg-rose-500/15 px-4 py-2 text-xs font-black text-rose-100 ring-1 ring-rose-300/20">{criticalRecommendations.length} {sw ? 'hatari kubwa' : 'critical risks'}</span>
                <span className="rounded-full bg-amber-500/15 px-4 py-2 text-xs font-black text-amber-100 ring-1 ring-amber-300/20">{visibleRecommendations.length} {sw ? 'ushauri hai' : 'active insights'}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SelectControl label={t('period')} value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="today">{t('today')}</option>
                <option value="yesterday">{t('yesterday')}</option>
                <option value="week">{t('week')}</option>
                <option value="lastweek">{t('lastweek')}</option>
                <option value="month">{t('month')}</option>
                <option value="lastmonth">{t('lastmonth')}</option>
                <option value="3months">{t('threeMonths')}</option>
                <option value="6months">{t('sixMonths')}</option>
                <option value="year">{t('year')}</option>
                <option value="custom">{t('custom')}</option>
              </SelectControl>
              <SelectControl label={t('shop')} value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
                <option value="all">{t('allShops')}</option>
                {(data?.shops || []).map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
              </SelectControl>
              <SelectControl label={t('view')} value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="summary">{sw ? 'Muhtasari' : 'Summary'}</option>
                <option value="grid">{sw ? 'Gridi ya BI' : 'BI Grid'}</option>
                <option value="chart">{sw ? 'Chati' : 'Charts'}</option>
                <option value="graph">{sw ? 'Mwenendo' : 'Trends'}</option>
                <option value="products">{sw ? 'Bidhaa' : 'Products'}</option>
                <option value="risk">{sw ? 'Hatari' : 'Risks'}</option>
                <option value="opportunity">{sw ? 'Fursa' : 'Opportunities'}</option>
                <option value="table">{sw ? 'Majedwali' : 'Tables'}</option>
                <option value="action">{sw ? 'Hatua' : 'Actions'}</option>
                <option value="ai">{sw ? 'AI ya Ndani' : 'AI Advisor'}</option>
              </SelectControl>
            </div>
          </div>

          {period === 'custom' ? (
            <div className="relative mt-5 grid gap-3 rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-white/70">{t('startDate')}</span>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full rounded-2xl border border-white/25 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-white/70">{t('endDate')}</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full rounded-2xl border border-white/25 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800" />
              </label>
            </div>
          ) : null}
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ExecutiveMetric label={t('totalSales')} value={`TZS ${money(analytics.totalSales)}`} hint={getTrendLabel(salesTrend, language)} trend={salesTrend} gradient="from-blue-500 to-cyan-400" icon="↗" />
            <ExecutiveMetric label={t('netProfit')} value={`TZS ${money(analytics.netProfit)}`} hint={getTrendLabel(profitTrend, language)} trend={profitTrend} gradient="from-emerald-500 to-teal-400" icon="✓" />
            <ExecutiveMetric label={t('expenses')} value={`TZS ${money(analytics.totalExpenses)}`} hint={getTrendLabel(expenseTrend, language)} trend={expenseTrend} gradient="from-orange-400 to-rose-400" icon="!" />
            <ExecutiveMetric label={t('mobileCommission')} value={`TZS ${money(analytics.mobileCommission)}`} hint={getTrendLabel(commissionTrend, language)} trend={commissionTrend} gradient="from-violet-500 to-fuchsia-400" icon="₮" />
          </div>

          {viewMode === 'summary' ? (
            <>
              <KpiMiniChartPanel analytics={analytics} language={language} />

              <ProfitWaterfallChart analytics={analytics} language={language} />

              <ShopScorecardPanel analytics={analytics} visibleRecommendations={visibleRecommendations} language={language} />

              <DropdownPanel title={sw ? 'Muhtasari wa Faida za Biashara' : 'Business Profit Breakdown'} subtitle={sw ? 'Vipengele vikuu vya faida vikiwa vimetenganishwa ili kuepuka msongamano.' : 'Main profit lines separated for quick executive reading.'} defaultOpen tone="violet">
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                  <SoftTile label={sw ? 'Faida ya duka baada ya matumizi' : 'Retail profit after expenses'} value={`TZS ${money(analytics.netProfit)}`} className="bg-gradient-to-br from-fuchsia-50 to-purple-50" />
                  <SoftTile label={t('gasProfit')} value={`TZS ${money(analytics.gasProfit)}`} className="bg-gradient-to-br from-orange-50 to-rose-50" />
                  <SoftTile label={sw ? 'Kamisheni za simu' : 'Mobile commission'} value={`TZS ${money(analytics.mobileWakalaCommission || 0)}`} className="bg-gradient-to-br from-cyan-50 to-sky-50" />
                  <SoftTile label={sw ? 'Kamisheni za benki' : 'Bank commission'} value={`TZS ${money(analytics.bankWakalaCommission || 0)}`} className="bg-gradient-to-br from-blue-50 to-indigo-50" />
                  <SoftTile label={sw ? 'Jumla ya kamisheni ya wakala' : 'Total Wakala commission'} value={`TZS ${money(analytics.mobileCommission)}`} className="bg-gradient-to-br from-emerald-50 to-teal-50" />
                  <SoftTile label={sw ? 'Jumla ya faida za biashara' : 'Total business profit'} value={`TZS ${money(analytics.netProfit + analytics.gasProfit + analytics.mobileCommission)}`} strong className="bg-gradient-to-br from-violet-100 to-indigo-100" />
                </div>
              </DropdownPanel>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SoftTile label={t('grossProfit')} value={`TZS ${money(analytics.grossProfit)}`} className="bg-white/80" />
                <SoftTile label={t('stockValue')} value={`TZS ${money(analytics.stockValue)}`} className="bg-white/80" />
                <SoftTile label={t('creditOutstanding')} value={`TZS ${money(analytics.creditOutstanding)}`} className="bg-white/80" />
                <SoftTile label={t('changeLedger')} value={`TZS ${money(analytics.changeOutstanding)}`} className="bg-white/80" />
              </div>

              <DropdownPanel title={sw ? 'Mambo ya Haraka kwa Mmiliki' : 'Owner Quick Priorities'} subtitle={sw ? 'Haya ni mambo machache muhimu zaidi, si kila taarifa ya mfumo.' : 'Only the most important current items are shown here.'} badge={`${visibleRecommendations.slice(0, 5).length} ${sw ? 'vitu' : 'items'}`} defaultOpen tone="amber">
                <div className="grid gap-4 lg:grid-cols-2">
                  {visibleRecommendations.slice(0, 4).map((rec) => (
                    <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                  ))}
                  {!visibleRecommendations.length ? <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div> : null}
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'grid' ? (
            <>
              <KpiMiniChartPanel analytics={analytics} language={language} />

              <ShopScorecardPanel analytics={analytics} visibleRecommendations={visibleRecommendations} language={language} />

              <DropdownPanel title={sw ? 'Gridi ya Taarifa Muhimu za Biashara' : 'Business Intelligence Grid'} subtitle={sw ? 'Kila kadi inaonyesha kipimo kimoja muhimu kwa kipindi ulichochagua.' : 'Each card shows one important business measure for the selected period.'} defaultOpen tone="blue">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SoftTile label={t('totalSales')} value={`TZS ${money(analytics.totalSales)}`} strong className="bg-gradient-to-br from-blue-50 to-cyan-50" />
                  <SoftTile label={t('grossProfit')} value={`TZS ${money(analytics.grossProfit)}`} strong className="bg-gradient-to-br from-emerald-50 to-teal-50" />
                  <SoftTile label={t('expenses')} value={`TZS ${money(analytics.totalExpenses)}`} strong className="bg-gradient-to-br from-orange-50 to-rose-50" />
                  <SoftTile label={t('netProfit')} value={`TZS ${money(analytics.netProfit)}`} strong className="bg-gradient-to-br from-violet-50 to-indigo-50" />
                  <SoftTile label={t('stockValue')} value={`TZS ${money(analytics.stockValue)}`} className="bg-white/80" />
                  <SoftTile label={t('gasProfit')} value={`TZS ${money(analytics.gasProfit)}`} className="bg-white/80" />
                  <SoftTile label={sw ? 'Kamisheni za simu' : 'Mobile commission'} value={`TZS ${money(analytics.mobileWakalaCommission || 0)}`} className="bg-white/80" />
                  <SoftTile label={sw ? 'Kamisheni za benki' : 'Bank commission'} value={`TZS ${money(analytics.bankWakalaCommission || 0)}`} className="bg-white/80" />
                  <SoftTile label={t('creditOutstanding')} value={`TZS ${money(analytics.creditOutstanding)}`} className="bg-white/80" />
                  <SoftTile label={t('changeLedger')} value={`TZS ${money(analytics.changeOutstanding)}`} className="bg-white/80" />
                  <SoftTile label={sw ? 'Stock isiyozunguka' : 'Slow stock capital'} value={`TZS ${money(analytics.summaryTotals.slowStockCapital)}`} className="bg-white/80" />
                  <SoftTile label={sw ? 'Stock karibu na expiry' : 'Expiry risk value'} value={`TZS ${money(analytics.summaryTotals.expiryRiskValue)}`} className="bg-white/80" />
                </div>
              </DropdownPanel>

              <DropdownPanel title={t('businessPulse')} subtitle={sw ? 'Mwenendo mfupi wa leo, wiki na mwezi.' : 'Quick movement for today, week and month.'} defaultOpen tone="slate">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(analytics.pulse).map(([key, item]) => (
                    <div key={key} className="rounded-[26px] bg-white/80 p-4 shadow-sm">
                      <h4 className="text-sm font-black capitalize text-slate-900">{key}</h4>
                      <div className="mt-3 space-y-3">
                        <MiniBar label={t('sales')} value={item.sales} max={Math.max(analytics.totalSales, item.sales, 1)} gradient="from-blue-500 to-cyan-500" />
                        <MiniBar label={t('profit')} value={Math.max(0, item.netProfit)} max={Math.max(analytics.netProfit, item.netProfit, 1)} gradient="from-emerald-500 to-teal-500" />
                        <MiniBar label={t('expenses')} value={item.expenses} max={Math.max(analytics.totalExpenses, item.expenses, 1)} gradient="from-orange-400 to-rose-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'chart' ? (
            <BIVisualDashboard analytics={analytics} visibleRecommendations={visibleRecommendations} language={language} />
          ) : null}

          {viewMode === 'graph' ? (
            <>
              <DropdownPanel title={sw ? 'Mwenendo wa Biashara kwa Muda' : 'Business Trends Over Time'} subtitle={`${analytics.range.start} — ${analytics.range.end}`} defaultOpen tone="blue">
                <div className="grid gap-4 xl:grid-cols-12">
                  <ChartCard title={sw ? 'Mauzo, Faida na Matumizi' : 'Sales, Profit and Expenses'} subtitle={sw ? 'Mwenendo ndani ya kipindi ulichochagua' : 'Movement inside the selected period'} explanation={sw ? 'Mstari wa mauzo, faida na matumizi unaonyesha siku ambazo biashara ilifanya vizuri au kushuka. Ukitaka kujua chanzo, angalia siku ambazo matumizi yalipanda au faida ilishuka.' : 'The sales, profit and expense lines show the days when the business improved or reduced. To find the cause, check the days when expenses rose or profit fell.'} className="xl:col-span-8">
                    <SimpleLineChart
                      rows={analytics.trendRows || []}
                      lines={[
                        { key: 'sales', label: sw ? 'Mauzo' : 'Sales', stroke: '#38bdf8' },
                        { key: 'netProfit', label: sw ? 'Faida' : 'Profit', stroke: '#34d399' },
                        { key: 'expenses', label: sw ? 'Matumizi' : 'Expenses', stroke: '#f59e0b' },
                      ]}
                    />
                  </ChartCard>
                  <ChartCard title={sw ? 'Gesi na Wakala' : 'Gas and Wakala'} subtitle={sw ? 'Mwenendo wa faida ya gesi na kamisheni' : 'Gas profit and commission movement'} explanation={sw ? 'Mstari huu unaonyesha kama faida ya gesi na kamisheni ya wakala zinaongeza nguvu ya biashara au zimepungua katika kipindi ulichochagua.' : 'This line shows whether gas profit and wakala commission are strengthening or weakening in the selected period.'} className="xl:col-span-4">
                    <SimpleLineChart
                      rows={analytics.trendRows || []}
                      lines={[
                        { key: 'gasProfit', label: sw ? 'Gesi' : 'Gas', stroke: '#fb7185' },
                        { key: 'mobileCommission', label: sw ? 'Wakala' : 'Wakala', stroke: '#a78bfa' },
                      ]}
                    />
                  </ChartCard>
                </div>
              </DropdownPanel>

              <DropdownPanel title={t('businessPulse')} subtitle={sw ? 'Muhtasari wa leo, jana, wiki na mwezi.' : 'Summary for today, yesterday, week and month.'} defaultOpen tone="slate">
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {sw
                    ? getBusinessPulseExplanation(analytics, language)
                    : getBusinessPulseExplanation(analytics, language)}
                </p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(analytics.pulse).map(([key, item]) => (
                    <div key={key} className="rounded-[26px] bg-white/80 p-4 shadow-sm">
                      <h4 className="text-sm font-black capitalize text-slate-900">{key}</h4>
                      <div className="mt-3 space-y-3">
                        <MiniBar label={t('sales')} value={item.sales} max={Math.max(analytics.totalSales, item.sales, 1)} gradient="from-blue-500 to-cyan-500" />
                        <MiniBar label={t('profit')} value={Math.max(0, item.netProfit)} max={Math.max(analytics.netProfit, item.netProfit, 1)} gradient="from-emerald-500 to-teal-500" />
                        <MiniBar label={t('expenses')} value={item.expenses} max={Math.max(analytics.totalExpenses, item.expenses, 1)} gradient="from-orange-400 to-rose-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'products' ? (
            <>
              <DropdownPanel title={t('productCommand')} subtitle={sw ? 'Tafuta bidhaa na chuja hali bila kuonyesha taarifa zote kwa wakati mmoja.' : 'Search and filter product intelligence without clutter.'} badge={`${productRows.length} ${sw ? 'bidhaa' : 'products'}`} defaultOpen tone="emerald">
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {sw
                    ? `${(productRows.filter((row) => row.status === 'Risk').length)} bidhaa ziko kwenye Risk kati ya ${productRows.length}. Anza na bidhaa hizo kwa sababu bei, stock au margin zake zinahitaji ukaguzi.`
                    : `${productRows.filter((row) => row.status === 'Risk').length} products are marked Risk out of ${productRows.length}. Start with those items because price, stock or margin needs review.`}
                </p>
                <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
                  <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder={t('searchProduct')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
                  <select value={productStatusFilter} onChange={(e) => setProductStatusFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200">
                    <option value="all">{t('allStatuses')}</option>
                    <option value="Good">{t('goodStatus')}</option>
                    <option value="Watch">{t('watchStatus')}</option>
                    <option value="Risk">{t('riskStatus')}</option>
                  </select>
                </div>
                <CompactTable
                  rows={productRows.slice(0, 80)}
                  emptyText={t('noData')}
                  columns={[
                    { key: 'productName', label: t('product') },
                    { key: 'shopName', label: t('shopLabel') },
                    { key: 'stock', label: t('stock'), render: (row) => money(row.stock) },
                    { key: 'buy', label: t('buy'), render: (row) => `TZS ${money(row.buy)}` },
                    { key: 'sell', label: t('sell'), render: (row) => `TZS ${money(row.sell)}` },
                    { key: 'margin', label: t('margin'), render: (row) => pct(row.margin) },
                    { key: 'status', label: t('status'), render: (row) => <span className={`rounded-full px-3 py-1 text-xs font-black ${row.status === 'Risk' ? 'bg-rose-100 text-rose-700' : row.status === 'Watch' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{row.status}</span> },
                  ]}
                />
              </DropdownPanel>

              <DropdownPanel title={sw ? 'Bidhaa na Mtaji' : 'Products and Capital'} subtitle={sw ? 'Bidhaa zinazoleta faida na bidhaa zinazokalia mtaji.' : 'Profit products and products tying capital.'} defaultOpen tone="emerald">
                <div className="grid gap-4 xl:grid-cols-2">
                  <ChartCard title={sw ? 'Bidhaa zinazoleta faida zaidi' : 'Top profit products'} explanation={getTopProductsExplanation(analytics, language)}>
                    <HorizontalBarList rows={(analytics.topProducts || []).slice(0, 10).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.profit }))} valueKey="value" labelKey="label" barClass="from-emerald-400 to-teal-400" />
                  </ChartCard>
                  <ChartCard title={sw ? 'Mtaji uliokaa kwenye stock' : 'Capital sitting in stock'} explanation={getCapitalExplanation(analytics, language)}>
                    <HorizontalBarList rows={(analytics.capitalEfficiency || []).slice(0, 10).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.stockValue }))} valueKey="value" labelKey="label" barClass="from-violet-300 to-indigo-400" />
                  </ChartCard>
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'risk' ? (
            <>
              <DropdownPanel title={sw ? 'Muonekano wa Hatari' : 'Risk Intelligence'} subtitle={sw ? 'Hatari zimepangwa kwa picha, vipaumbele na thamani iliyo hatarini.' : 'Risks are shown by priority, urgency and value at risk.'} defaultOpen tone="rose">
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {sw
                    ? getRiskExplanation(visibleRecommendations, language)
                    : getRiskExplanation(visibleRecommendations, language)}
                </p>
                <div className="grid gap-4 xl:grid-cols-12">
                  <ChartCard title={sw ? 'Piramidi ya Hatari' : 'Risk Pyramid'} subtitle={sw ? 'Juu ni hatari za haraka zaidi' : 'Top layers need faster decisions'} explanation={getRiskExplanation(visibleRecommendations, language)} className="xl:col-span-4">
                    <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
                      {['Critical', 'High', 'Medium', 'Low'].map((priority, idx) => {
                        const count = visibleRecommendations.filter((rec) => rec.priority === priority).length;
                        const widths = ['w-full', 'w-10/12', 'w-8/12', 'w-6/12'];
                        const tones = ['bg-rose-100 text-rose-700', 'bg-orange-100 text-orange-700', 'bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-700'];
                        return (
                          <div key={priority} className={`mx-auto rounded-2xl px-4 py-3 text-center text-sm font-black ${widths[idx]} ${tones[idx]}`}>
                            {priority}: {count}
                          </div>
                        );
                      })}
                    </div>
                  </ChartCard>
                  <ChartCard title={sw ? 'Hatari kwa Vipaumbele' : 'Risk by Priority'} explanation={getRiskExplanation(visibleRecommendations, language)} className="xl:col-span-4">
                    <DonutChart
                      items={['Critical', 'High', 'Medium', 'Low'].map((priority) => ({ label: priority, value: visibleRecommendations.filter((rec) => rec.priority === priority).length }))}
                      centerLabel={sw ? 'Ushauri' : 'Insights'}
                      centerValue={visibleRecommendations.length}
                      language={language}
                    />
                  </ChartCard>
                  <ChartCard title={sw ? 'Vipimo vya Haraka vya Hatari' : 'Quick Risk Gauges'} explanation={sw ? 'Vipimo hivi vinaonyesha kiasi cha stock kilicho hatarini ukilinganisha na stock yote. Kadiri kipimo kinavyojaa, ndivyo hatari inavyokuwa kubwa.' : 'These gauges show how much stock is at risk compared with total stock. The fuller the gauge, the larger the risk.'} className="xl:col-span-4">
                    <div className="grid gap-3">
                      <GaugeCard label={sw ? 'Stock isiyozunguka' : 'Slow stock capital'} value={analytics.summaryTotals.slowStockCapital} max={Math.max(1, analytics.stockValue)} tone="amber" />
                      <GaugeCard label={sw ? 'Stock karibu na expiry' : 'Expiry risk value'} value={analytics.summaryTotals.expiryRiskValue} max={Math.max(1, analytics.stockValue)} tone="rose" />
                    </div>
                  </ChartCard>
                </div>
              </DropdownPanel>

              <DropdownPanel title={sw ? 'Hatari kubwa' : 'Critical Risks'} subtitle={sw ? 'Hatari kubwa pekee zinazohitaji uamuzi wa haraka.' : 'Only critical risks requiring urgent decisions.'} badge={`${criticalRecommendations.length} ${sw ? 'hatari' : 'risks'}`} defaultOpen={criticalRecommendations.length > 0} tone="rose">
                <div className="space-y-3">
                  {criticalRecommendations.length ? criticalRecommendations.map((rec) => (
                    <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                  )) : <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div>}
                </div>
              </DropdownPanel>

              <DropdownPanel title={sw ? 'Vipaumbele vya juu' : 'High Priorities'} subtitle={sw ? 'Vipaumbele vya juu bila kuchanganya na fursa.' : 'High-priority items separated from opportunities.'} badge={`${highRecommendations.length} ${sw ? 'vipaumbele' : 'priorities'}`} defaultOpen={!criticalRecommendations.length && highRecommendations.length > 0} tone="amber">
                <div className="space-y-3">
                  {highRecommendations.length ? highRecommendations.slice(0, 10).map((rec) => (
                    <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                  )) : <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div>}
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'opportunity' ? (
            <>
              <DropdownPanel title={sw ? 'Fursa za Biashara' : 'Business Opportunities'} subtitle={sw ? 'Fursa za kuhamisha stock, kuongeza bidhaa, na kuongeza uwekezaji.' : 'Stock transfer, missing product and investment opportunities.'} badge={`${opportunityRecommendations.length} ${sw ? 'fursa' : 'opportunities'}`} defaultOpen tone="emerald">
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {sw
                    ? 'Fursa siyo tatizo; ni mahali ambapo biashara inaweza kuongeza mauzo au kutumia stock vizuri zaidi. Zitumie kwa maamuzi ya kuongeza bidhaa, kuhamisha stock au kuongeza mtaji.'
                    : 'Opportunities are not problems; they show where the business can increase sales or use stock better. Use them for product expansion, stock transfer or capital allocation decisions.'}
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                  {opportunityRecommendations.length ? opportunityRecommendations.slice(0, 12).map((rec) => (
                    <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                  )) : <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div>}
                </div>
              </DropdownPanel>

              <DropdownPanel title={sw ? 'Makundi Yanayoweza Kuongezewa Nguvu' : 'Category Investment Signals'} subtitle={sw ? 'Makundi yanayoonyesha faida au mwenendo mzuri.' : 'Categories showing profit or stronger movement.'} defaultOpen tone="emerald">
                <div className="grid gap-4 xl:grid-cols-2">
                  <ChartCard title={sw ? 'Mchanganyiko wa bidhaa' : 'Product mix'} explanation={sw ? 'Duara hili linaonyesha makundi ya bidhaa yanayochangia mauzo. Kundi kubwa zaidi linaonyesha sehemu yenye nguvu zaidi kwa kipindi hiki.' : 'This donut shows which product groups contribute sales. The largest group is the strongest area in this period.'}>
                    <DonutChart items={(analytics.productMix || []).map((item) => ({ label: catLabel(item.category, language), value: item.sales }))} centerLabel={sw ? 'Mauzo' : 'Sales'} centerValue={`TZS ${money(analytics.totalSales)}`} language={language} />
                  </ChartCard>
                  <ChartCard title={sw ? 'Ufanisi wa mtaji' : 'Capital efficiency'} explanation={sw ? 'Hii inaonyesha bidhaa ambazo mtaji wake unaonekana kuleta faida. Bidhaa zilizo juu zinaweza kuwa maeneo mazuri ya kuongeza nguvu.' : 'This shows products where capital appears to produce profit. Items at the top may be good areas to strengthen.'}>
                    <HorizontalBarList rows={(analytics.capitalEfficiency || []).slice(0, 10).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.profit }))} valueKey="value" labelKey="label" barClass="from-emerald-300 to-teal-400" />
                  </ChartCard>
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'table' ? (
            <>
              <DropdownPanel title={t('shopPerformance')} subtitle={sw ? 'Mwenendo wa kila duka kwenye jedwali.' : 'Shop performance table.'} badge={`${analytics.shopPerformance.length} ${sw ? 'maduka' : 'shops'}`} defaultOpen tone="blue">
                <CompactTable
                  rows={analytics.shopPerformance}
                  emptyText={t('noData')}
                  columns={[
                    { key: 'shopName', label: t('shopLabel') },
                    { key: 'sales', label: t('sales'), render: (row) => `TZS ${money(row.sales)}` },
                    { key: 'grossProfit', label: t('grossProfit'), render: (row) => `TZS ${money(row.grossProfit)}` },
                    { key: 'expenses', label: t('expenses'), render: (row) => `TZS ${money(row.expenses)}` },
                    { key: 'netProfit', label: t('netProfit'), render: (row) => `TZS ${money(row.netProfit)}` },
                    { key: 'margin', label: t('margin'), render: (row) => pct(row.margin) },
                    { key: 'status', label: t('status') },
                  ]}
                />
              </DropdownPanel>

              <DropdownPanel title={t('productCommand')} subtitle={sw ? 'Jedwali la bidhaa kwa ukaguzi wa kina.' : 'Detailed product table.'} badge={`${productRows.length} ${sw ? 'bidhaa' : 'products'}`} defaultOpen tone="emerald">
                <CompactTable
                  rows={productRows.slice(0, 200)}
                  emptyText={t('noData')}
                  columns={[
                    { key: 'productName', label: t('product') },
                    { key: 'shopName', label: t('shopLabel') },
                    { key: 'stock', label: t('stock'), render: (row) => money(row.stock) },
                    { key: 'buy', label: t('buy'), render: (row) => `TZS ${money(row.buy)}` },
                    { key: 'sell', label: t('sell'), render: (row) => `TZS ${money(row.sell)}` },
                    { key: 'stockValue', label: t('stockValue'), render: (row) => `TZS ${money(row.stockValue)}` },
                    { key: 'margin', label: t('margin'), render: (row) => pct(row.margin) },
                    { key: 'status', label: t('status') },
                  ]}
                />
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'action' ? (
            <>
              <DropdownPanel title={t('auditTrail')} subtitle={t('actionPlanNote')} badge={`${auditTrail.length} ${sw ? 'hatua' : 'actions'}`} defaultOpen tone="slate">
                <CompactTable
                  rows={auditTrail.slice(0, 80)}
                  emptyText={t('noAuditTrail')}
                  columns={[
                    { key: 'updatedAt', label: t('actionDate'), render: (row) => String(row.updatedAt || '').slice(0, 10) },
                    { key: 'challenge', label: t('challenge') },
                    { key: 'status', label: t('status'), render: (row) => <span className={`rounded-full px-3 py-1 text-xs font-black ${statusBadge(row.status)}`}>{row.status}</span> },
                    { key: 'note', label: t('response') },
                  ]}
                />
              </DropdownPanel>

              <DropdownPanel title={sw ? 'Mapendekezo Yanayosubiri Uamuzi' : 'Recommendations Awaiting Decision'} subtitle={sw ? 'Chagua Imefanyika, Imepangwa, Ficha siku 7 au Haihitajiki.' : 'Mark as done, planned, snoozed or not relevant.'} badge={`${visibleRecommendations.length} ${sw ? 'ushauri' : 'insights'}`} defaultOpen tone="amber">
                <div className="grid gap-4 lg:grid-cols-2">
                  {visibleRecommendations.slice(0, 12).map((rec) => (
                    <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                  ))}
                  {!visibleRecommendations.length ? <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div> : null}
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'ai' ? (
            <DropdownPanel title={t('ai')} subtitle={t('localAiIntro')} defaultOpen tone="violet">
              <div className="grid gap-3 md:grid-cols-2">
                <input value={aiEndpoint} onChange={(e) => setAiEndpoint(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" placeholder={t('aiEndpoint')} />
                <input value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" placeholder={t('aiModel')} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => setAiQuickQuestion('explain')}>{t('explainBusiness')}</button>
                <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => setAiQuickQuestion('profit')}>{t('whyProfitDrop')}</button>
                <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => setAiQuickQuestion('duplicates')}>{t('findDuplicates')}</button>
                <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => setAiQuickQuestion('weekly')}>{t('weeklyPlan')}</button>
                <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => setAiQuickQuestion('investment')}>{t('investmentQuestion')}</button>
              </div>
              <textarea value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} className="mt-3 min-h-[110px] w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-violet-200" placeholder={t('aiPlaceholder')} />
              <button onClick={askLocalAi} disabled={aiLoading} className="mt-3 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60">{aiLoading ? t('askingAi') : t('askAi')}</button>
              {aiError ? <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-700">{aiError}</div> : null}
              {aiAnswer ? <div className="mt-3 whitespace-pre-wrap rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm">{aiAnswer}</div> : null}
            </DropdownPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
