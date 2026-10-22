import React from 'react';
import { supabase } from './supabaseClient';
import {
  getLiveRemittanceShopPosition,
  AUTOMATIC_EXPENSE_PILOT_START_DATE,
} from './remittance/DailyRemittanceCentre';

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
    done: 'Tayari nimefanyia kazi',
planned: 'Nimepanga kuifanyia kazi',
snooze7: 'Nikumbushe baada ya siku 7',
notRelevant: 'Sio tatizo kwa bidhaa hii',
addNote: 'Andika maelezo mafupi',
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
    watchStatus: 'Ya kuangalia',
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

function roundQty(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

function qtyText(value) {
  const rounded = roundQty(value, 2);
  return Number.isInteger(rounded)
    ? String(rounded)
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(rounded);
}

function unitText(unit) {
  const cleanUnit = String(unit || 'pc').trim().toLowerCase();

  if (cleanUnit === 'kg') return 'kg';
  if (cleanUnit === 'ltr' || cleanUnit === 'liter' || cleanUnit === 'litre') return 'ltr';
  if (cleanUnit === 'pc' || cleanUnit === 'pcs' || cleanUnit === 'piece') return 'pc';

  return cleanUnit || 'pc';
}

function qtyWithUnit(value, unit) {
  return `${qtyText(value)}${unitText(unit)}`;
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

const WARNING_HISTORY_STORAGE_KEY = 'ceo_warning_lifecycle_history_v1';

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

function readWarningHistory() {
  try {
    const rows = JSON.parse(localStorage.getItem(WARNING_HISTORY_STORAGE_KEY) || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeWarningHistory(rows) {
  localStorage.setItem(WARNING_HISTORY_STORAGE_KEY, JSON.stringify(Array.isArray(rows) ? rows : []));
}

function addWarningHistoryEntry(entry) {
  const history = readWarningHistory();

  const nextEntry = {
    id: `warning-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };

  writeWarningHistory([nextEntry, ...history].slice(0, 500));

  return nextEntry;
}

async function saveCeoActionToSupabase(actionRecord) {
  if (!navigator.onLine) return;

  const row = {
    recommendation_id: actionRecord.recommendationId,
    recommendation_type: actionRecord.type || '',
    priority: actionRecord.priority || '',

    action_status: actionRecord.status || '',
    action_note: actionRecord.note || '',

    shop_id: actionRecord.shopId || '',
    shop_name: actionRecord.shopName || '',

    product_code: actionRecord.productCode || '',
    product_name: actionRecord.productName || '',

    user_id: actionRecord.userId || '',
    user_name: actionRecord.userName || '',
    user_role: actionRecord.userRole || '',

    hidden_until: actionRecord.snoozeUntil || null,
    updated_at: actionRecord.updatedAt || new Date().toISOString(),
  };

  const { error } = await supabase
    .from('ceo_recommendation_actions')
    .upsert(row, { onConflict: 'recommendation_id' });

  if (error) {
    console.error('CEO action Supabase save failed:', error);
  }
}

async function saveCeoWarningHistoryToSupabase(entry) {
  if (!navigator.onLine) return;

  const row = {
    recommendation_id: entry.recommendationId,
    recommendation_type: entry.type || '',
    priority: entry.priority || '',

    warning_title: entry.challenge || '',
    warning_evidence: entry.evidence || '',
    recommended_action: entry.suggestedAction || '',

    warning_status: entry.status || 'open',

    shop_id: entry.shopId || '',
    shop_name: entry.shopName || '',

    product_code: entry.productCode || '',
    product_name: entry.productName || '',

    user_id: entry.userId || '',
    user_name: entry.userName || '',
    user_role: entry.userRole || '',

    resolved_at: entry.implemented ? new Date().toISOString() : null,
    hidden_until: entry.snoozeUntil || null,

    created_at: entry.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('ceo_warning_history')
    .insert([row]);

  if (error) {
    console.error('CEO warning history Supabase save failed:', error);
  }
}

function actionHidden(action) {
  if (!action) return false;

  // Once the owner/shop user has acted on an item, the same issue should not keep repeating in other views.
  // Done and Planned are treated as action already recorded.
  if (['Done', 'Planned'].includes(action.status)) return true;

  // Snoozed, Not Relevant and Ignored are hidden only for the snooze period.
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

function getSwahiliOrderedVerb(productName = '') {
  const cleanName = String(productName || '').trim().toLowerCase();
  const firstWord = cleanName.split(/\s+/)[0] || '';

  if (!cleanName) return 'imeagizwa';

  const yameWords = [
    'mayai',
    'maji',
    'maziwa',
    'mafuta',
    'mafiga',
    'magodoro',
    'machungwa',
    'maembe',
  ];

  if (yameWords.some((word) => cleanName.startsWith(word))) {
    return 'yameagizwa';
  }

  if (firstWord.startsWith('vi') || firstWord.startsWith('vy')) {
    return 'vimeagizwa';
  }

  if (firstWord.startsWith('ki') || firstWord.startsWith('ch')) {
    return 'kimeagizwa';
  }

  return 'imeagizwa';
}

function recText(language, template, vars = {}) {
  const sw = language !== 'en';
  const v = (key) => vars[key] ?? '';
  const shop = formatShopForText(v('shop'), language);
  const fromShop = formatShopForText(v('from'), language);
  const toShop = formatShopForText(v('to'), language);

  const templates = {
    belowCost: sw
      ? `Bei ya kuuzia ${v('product')} ipo chini ya bei ya manunuzi katika ${shop}`
      : `The selling price of ${v('product')} is below the purchase price in ${shop}`,
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
  const allProducts = Array.isArray(data?.products)
    ? data.products.filter((product) => !product?.archived)
    : [];
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
const isShopUser = String(data?.currentUser?.role || '') === 'shop';

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
            unit: unitText(product?.baseUnit || product?.baseunit || product?.unit || item?.baseUnit || item?.baseunit || item?.unit || 'pc'),
            stock: product ? getProductStock(product) : 0,
            stockValue: product ? getProductStock(product) * getProductBuyPrice(product) : 0,
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

function getProductMovementRhythm(productCode, shopId) {
  const saleDates = [];

  allSales.forEach((sale) => {
    if (String(sale.shop_id || '') !== String(shopId)) return;

    const saleDate = getDateValue(sale);
    if (!saleDate) return;

    const hasProduct = getSaleItems(sale).some((item) => {
      const product = productById.get(getItemProductId(item));
      const code = product
        ? getProductCode(product)
        : String(item.standard_product_code || item.standardProductCode || getItemName(item)).trim().toLowerCase();

      return String(code || '') === String(productCode || '');
    });

    if (hasProduct) saleDates.push(saleDate);
  });

  const uniqueDates = Array.from(new Set(saleDates)).sort();

  if (uniqueDates.length < 2) {
    return {
      hasEnoughHistory: false,
      averageDaysBetweenSales: null,
      saleDays: uniqueDates.length,
    };
  }

  const firstDate = startOfDay(uniqueDates[0]);
  const lastDate = startOfDay(uniqueDates[uniqueDates.length - 1]);
  const historyDays = Math.max(1, Math.floor((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1);
  const averageDaysBetweenSales = Math.max(1, Math.round(historyDays / uniqueDates.length));

  return {
    hasEnoughHistory: true,
    averageDaysBetweenSales,
    saleDays: uniqueDates.length,
  };
}

const movementList = Object.values(movement).sort((a, b) => b.profit - a.profit);

  const totalSales = sales.reduce(
    (sum, sale) => sum + num(sale.total || 0),
    0
  );

  const previousTotalSales = previousSales.reduce(
    (sum, sale) => sum + num(sale.total || 0),
    0
  );

  const summarizeRemittanceRange = (
    startDateKey,
    endDateKey,
    shopsToSummarize = analysisShops
  ) => {
    const summary = {
      grossProfit: 0,
      expenses: 0,
      netProfit: 0,
      ownerProfit: 0,
      shopReserve: 0,
      amountToSubmit: 0,
    };

    const effectiveStartKey =
      startDateKey < AUTOMATIC_EXPENSE_PILOT_START_DATE
        ? AUTOMATIC_EXPENSE_PILOT_START_DATE
        : startDateKey;

    const todayKey = toISO(new Date());

    const effectiveEndKey =
      endDateKey > todayKey
        ? todayKey
        : endDateKey;

    if (effectiveStartKey > effectiveEndKey) {
      return summary;
    }

    shopsToSummarize.forEach((shop) => {
      let dateCursor = startOfDay(
        `${effectiveStartKey}T00:00:00`
      );

      const finalDate = startOfDay(
        `${effectiveEndKey}T00:00:00`
      );

      while (dateCursor <= finalDate) {
        const dateKey = toISO(dateCursor);

        const position =
          getLiveRemittanceShopPosition({
            data,
            shopId: shop.id,
            calculationDateKey: dateKey,
          });

        summary.grossProfit += Number(
          position?.gross || 0
        );

        summary.expenses += Number(
          position?.expensesFundedAutomatically || 0
        );

        summary.netProfit += Number(
          position?.netProfit || 0
        );

        summary.ownerProfit += Number(
          position?.ownerProfit || 0
        );

        summary.shopReserve += Number(
          position?.shopReserve || 0
        );

        summary.amountToSubmit += Number(
          position?.cashAmountRequiredToSubmit || 0
        );

        summary.gasProfit =
          Number(summary.gasProfit || 0) +
          Number(position?.gasProfitToday || 0);

        summary.gasReserve =
          Number(summary.gasReserve || 0) +
          Number(position?.gasReserveAmount || 0);

        summary.gasDistributable =
          Number(summary.gasDistributable || 0) +
          Number(
            position?.gasDistributableAmount || 0
          );

        summary.gasUsedForExpenses =
          Number(
            summary.gasUsedForExpenses || 0
          ) +
          Number(position?.gasUsedForArrears || 0);

        summary.gasOwnerProfit =
          Number(summary.gasOwnerProfit || 0) +
          Number(position?.gasOwnerProfit || 0);

        summary.gasHomeExpenses =
          Number(summary.gasHomeExpenses || 0) +
          Number(
            position?.gasHomeExpensesContribution ||
              0
          );

        dateCursor = addDays(dateCursor, 1);
      }
    });

    return summary;
  };

  const remittanceSummary =
    summarizeRemittanceRange(
      range.start,
      range.end
    );

  const previousRemittanceSummary =
    summarizeRemittanceRange(
      range.previousStart,
      range.previousEnd
    );

  const grossProfit =
    remittanceSummary.grossProfit;

  const previousGrossProfit =
    previousRemittanceSummary.grossProfit;

  const totalExpenses =
    remittanceSummary.expenses;

  const previousTotalExpenses =
    previousRemittanceSummary.expenses;

  const netProfit =
    remittanceSummary.netProfit;

  const previousNetProfit =
    previousRemittanceSummary.netProfit;
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

  const gasEntries = allGasEntries.filter(
    (entry) =>
      sameShop(entry) &&
      inRange(
        entry,
        range.start,
        range.end
      ) &&
      entry?.confirmed !== false
  );

  const gasProfit = Number(
    remittanceSummary.gasProfit || 0
  );

  const gasReserve = Number(
    remittanceSummary.gasReserve || 0
  );

  const gasDistributable = Number(
    remittanceSummary.gasDistributable || 0
  );

  const gasUsedForExpenses = Number(
    remittanceSummary.gasUsedForExpenses || 0
  );

  const gasOwnerProfit = Number(
    remittanceSummary.gasOwnerProfit || 0
  );

  const gasHomeExpenses = Number(
    remittanceSummary.gasHomeExpenses || 0
  );

  const shopPerformance = shops
    .filter((shop) => !selectedShopId || String(shop.id) === selectedShopId)
    .map((shop) => {
      const shopSales = sales.filter(
        (sale) =>
          String(sale.shop_id || '') ===
          String(shop.id)
      );

      const shopProducts = allProducts.filter(
        (product) =>
          String(product.shop_id || '') ===
          String(shop.id)
      );

      const shopMovements = movementList.filter(
        (movementItem) =>
          String(movementItem.shopId) ===
          String(shop.id)
      );

      const shopRemittanceSummary =
        summarizeRemittanceRange(
          range.start,
          range.end,
          [shop]
        );

      const salesValue = shopSales.reduce(
        (sum, sale) =>
          sum + num(sale.total || 0),
        0
      );

      const expenseValue =
        shopRemittanceSummary.expenses;

      const gross =
        shopRemittanceSummary.grossProfit;

      const net =
        shopRemittanceSummary.netProfit;
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

    const currentSales = allSales.filter(
      (sale) =>
        sameShop(sale) &&
        inRange(sale, r.start, r.end)
    );

    const previousSalesX = allSales.filter(
      (sale) =>
        sameShop(sale) &&
        inRange(
          sale,
          r.previousStart,
          r.previousEnd
        )
    );

    const currentSummary =
      summarizeRemittanceRange(
        r.start,
        r.end
      );

    const previousSummary =
      summarizeRemittanceRange(
        r.previousStart,
        r.previousEnd
      );

    const salesValue = currentSales.reduce(
      (sum, sale) =>
        sum + num(sale.total || 0),
      0
    );

    const previousSalesValue =
      previousSalesX.reduce(
        (sum, sale) =>
          sum + num(sale.total || 0),
        0
      );

    return {
      sales: salesValue,
      previousSales: previousSalesValue,

      grossProfit:
        currentSummary.grossProfit,

      previousGrossProfit:
        previousSummary.grossProfit,

      expenses:
        currentSummary.expenses,

      previousExpenses:
        previousSummary.expenses,

      netProfit:
        currentSummary.netProfit,

      previousNetProfit:
        previousSummary.netProfit,
    };
  }

  const pulse = {
    today: simplePeriodMetrics('today'),
    yesterday: simplePeriodMetrics('yesterday'),
    week: simplePeriodMetrics('week'),
    month: simplePeriodMetrics('month'),
  };

  function buildDailySalesTarget() {
    const today = startOfDay(new Date());
    const todayIso = toISO(today);
    const year = today.getFullYear();
    const month = today.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthStartIso = toISO(monthStart);
    const daysInMonth = monthEnd.getDate();

    const saleShopId = (sale) => String(sale?.shop_id || sale?.shopId || '');
    const saleDate = (sale) => getDateValue(sale);

    function averageOf(values) {
      const safeValues = values.filter((value) => Number(value || 0) > 0);
      if (!safeValues.length) return 0;
      return safeValues.reduce((sum, value) => sum + Number(value || 0), 0) / safeValues.length;
    }

    function calculateShopMonthlyTarget(shopId) {
      const shopSales = allSales.filter((sale) => saleShopId(sale) === String(shopId));

      const salesByDate = shopSales.reduce((acc, sale) => {
        const dateValue = saleDate(sale);

        if (!dateValue || dateValue >= monthStartIso) return acc;

        acc[dateValue] = (acc[dateValue] || 0) + Number(sale.total || 0);
        return acc;
      }, {});

      const salesDateEntries = Object.entries(salesByDate)
        .filter(([, value]) => Number(value || 0) > 0)
        .sort(([a], [b]) => String(a).localeCompare(String(b)));

      const valuesFromLastDaysBeforeMonth = (days) => {
        const startDate = toISO(addDays(monthStart, -Number(days || 0)));

        return salesDateEntries
          .filter(([dateValue]) => String(dateValue) >= startDate && String(dateValue) < monthStartIso)
          .map(([, value]) => Number(value || 0))
          .filter((value) => value > 0);
      };

      const recentActiveValues = salesDateEntries
        .map(([, value]) => Number(value || 0))
        .filter((value) => value > 0)
        .slice(-14);

      const recentActiveAverage = averageOf(recentActiveValues);
      const last30Average = averageOf(valuesFromLastDaysBeforeMonth(30));
      const last90Average = averageOf(valuesFromLastDaysBeforeMonth(90));
      const last180Average = averageOf(valuesFromLastDaysBeforeMonth(180));

      const monthDailyTargets = Array.from({ length: daysInMonth }, (_, index) => {
        const targetDate = new Date(year, month, index + 1);
        const targetDay = targetDate.getDay();

        const sameWeekdayValues = salesDateEntries
          .filter(([dateValue]) => {
            const d = startOfDay(dateValue);
            return !Number.isNaN(d.getTime()) && d.getDay() === targetDay;
          })
          .map(([, value]) => Number(value || 0))
          .filter((value) => value > 0)
          .slice(-4);

        const sameWeekdayAverage = averageOf(sameWeekdayValues);

        const targetSources = [
          { value: sameWeekdayAverage, weight: 40 },
          { value: recentActiveAverage, weight: 25 },
          { value: last30Average, weight: 20 },
          { value: last90Average || last180Average, weight: 15 },
        ].filter((item) => item.value > 0);

        if (!targetSources.length) return 0;

        const weightedTotal = targetSources.reduce((sum, item) => sum + item.value * item.weight, 0);
        const weightTotal = targetSources.reduce((sum, item) => sum + item.weight, 0);
        const baseTarget = weightTotal > 0 ? weightedTotal / weightTotal : 0;

        return Math.round(baseTarget * 1.05);
      });

      const monthlyTarget = monthDailyTargets.reduce((sum, value) => sum + Number(value || 0), 0);

      const todaySales = shopSales
        .filter((sale) => saleDate(sale) === todayIso)
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

      return {
        shopId,
        monthlyTarget,
        dailyTarget: daysInMonth > 0 ? Math.round(monthlyTarget / daysInMonth) : 0,
        todaySales,
        daysInMonth,
      };
    }

    const shopIdsForTarget = selectedShopId
      ? [selectedShopId]
      : analysisShops.map((shop) => String(shop.id)).filter(Boolean);

    const shopTargets = shopIdsForTarget.map(calculateShopMonthlyTarget);

    const target = shopTargets.reduce((sum, row) => sum + Number(row.dailyTarget || 0), 0);
    const todaySales = shopTargets.reduce((sum, row) => sum + Number(row.todaySales || 0), 0);

    const remaining = Math.max(0, target - todaySales);
    const exceeded = Math.max(0, todaySales - target);
    const actualProgress = target > 0 ? (todaySales / target) * 100 : 0;
    const progress = Math.min(100, actualProgress);

    return {
      hasTarget: target > 0,
      target,
      todaySales,
      progress,
      actualProgress,
      remaining,
      exceeded,
      source: selectedShopId ? 'monthly-target-shop' : 'monthly-target-shops-sum',
      shopTargets,
    };
  }

  const dailySalesTarget = buildDailySalesTarget();

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
      const unit = shopInfo.products?.[0]?.baseUnit || shopInfo.products?.[0]?.baseunit || 'pc';
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
            ? `Previous period sold ${qtyText(prevSold)} units. Available stock is zero.`
            : `Kipindi kilichopita ziliuzwa ${qtyText(prevSold)}. Stock ya sasa ni sifuri.`,
          action: language === 'en'
            ? 'Restock or transfer from another shop before concluding that demand has reduced.'
            : 'Ongeza stock au hamisha kutoka duka jingine kabla ya kuamua kuwa uhitaji umepungua.',
          question: language === 'en'
            ? `Ask if customers still ask for ${productName} after it finished.`
            : `Muulize mhudumu kama wateja bado wanaulizia ${productName} baada ya kuisha.`,
        });
      }

      const rhythmForReorder = getProductMovementRhythm(group.code, shopInfo.shopId);
      const reorderLastSaleDate = allMovement[key]?.lastSaleDate || '';
      const reorderDaysSinceLastSale = daysSinceDate(reorderLastSaleDate);

      const reorderFreshnessDays = Math.max(1, Math.min(14, Math.ceil(range.days / 2)));
      const reorderMinimumSold = range.days > 7 ? 2 : 1;

      const hasRecentReorderDemand =
        sold >= reorderMinimumSold &&
        reorderLastSaleDate &&
        reorderDaysSinceLastSale !== null &&
        reorderDaysSinceLastSale <= reorderFreshnessDays;

      const hasHistoricalReorderRhythm =
        rhythmForReorder.hasEnoughHistory &&
        rhythmForReorder.averageDaysBetweenSales !== null &&
        reorderDaysSinceLastSale !== null &&
        reorderDaysSinceLastSale <= Math.max(3, rhythmForReorder.averageDaysBetweenSales * 2);

      if (
        stock > 0 &&
        sold > 0 &&
        daysLeft !== null &&
        daysLeft <= 7 &&
        hasRecentReorderDemand &&
        hasHistoricalReorderRhythm
      ) {
        addRec({
          type: 'Reorder Needed',
          priority: daysLeft <= 3 ? 'Critical' : 'High',
          productCode: group.code,
          productName,
          shopId: shopInfo.shopId,
          shopName: shopInfo.shopName,
          title: recText(language, 'reorder', { product: productName, shop: shopInfo.shopName }),
          evidence: language === 'en'
            ? `Available stock ${qtyWithUnit(stock, unit)}; sold ${qtyWithUnit(sold, unit)} within ${range.days} day${range.days === 1 ? '' : 's'} (${range.start} to ${range.end}); last sale was ${reorderLastSaleDate || 'not found'}${reorderDaysSinceLastSale !== null ? ` (${reorderDaysSinceLastSale} day(s) ago)` : ''}; normal rhythm is about every ${rhythmForReorder.averageDaysBetweenSales} day(s); estimated days left ${daysLeft.toFixed(1)}.`
            : `Stock iliyopo ${qtyWithUnit(stock, unit)}; zimeuzwa ${qtyWithUnit(sold, unit)} ndani ya siku ${range.days} (${range.start} mpaka ${range.end}); mauzo ya mwisho yalikuwa ${reorderLastSaleDate || 'hayajaonekana'}${reorderDaysSinceLastSale !== null ? `, siku ${reorderDaysSinceLastSale} zilizopita` : ''}; kawaida huuzwa takribani kila siku ${rhythmForReorder.averageDaysBetweenSales}; inakadiriwa kubaki siku ${daysLeft.toFixed(1)}.`,
          action: language === 'en'
            ? 'Reorder because current stock is low and recent/history sales confirm active demand.'
            : 'Ongeza stock kwa sababu stock iliyopo ni ndogo na historia ya mauzo inaonyesha bado ina uhitaji.',
          question: language === 'en'
  ? isShopUser
    ? `Confirm whether ${productName} has already been ordered. If not, consider ordering it now.`
    : `Confirm whether ${productName} has already been ordered.`
  : isShopUser
    ? `Thibitisha kama ${productName} tayari ${getSwahiliOrderedVerb(productName)}. Kama bado, angalia uwezekano wa kuagiza sasa hivi.`
    : `Muulize mhudumu kama ${productName} tayari ${getSwahiliOrderedVerb(productName)}.`,
        });
      }

const rhythm = getProductMovementRhythm(group.code, shopInfo.shopId);
const lastSaleDate = allMovement[key]?.lastSaleDate || '';
const daysSilent = daysSinceDate(lastSaleDate);

if (
  stock > 0 &&
  rhythm.hasEnoughHistory &&
  daysSilent !== null &&
  daysSilent >= Math.max(3, rhythm.averageDaysBetweenSales * 2)
) {
  const priority =
    daysSilent >= rhythm.averageDaysBetweenSales * 4
      ? 'High'
      : daysSilent >= rhythm.averageDaysBetweenSales * 3
        ? 'Medium'
        : 'Low';

  addRec({
    type: 'Mwenendo wa Bidhaa',
    priority,
    productCode: group.code,
    productName,
    shopId: shopInfo.shopId,
    shopName: shopInfo.shopName,
    title: language === 'en'
      ? `${productName} has stayed longer than its normal sales rhythm in ${shopInfo.shopName}`
      : `${productName} haijauzwa muda mrefu kuliko kawaida katika ${formatShopForText(shopInfo.shopName, language)}`,
    evidence: language === 'en'
      ? `Normally this product sells about every ${rhythm.averageDaysBetweenSales} day(s). It has now stayed ${daysSilent} day(s) without sale. Current stock is ${stock}.`
      : `Kwa kawaida bidhaa hii huuzwa takribani kila siku ${rhythm.averageDaysBetweenSales}. Sasa haijauzwa kwa siku ${daysSilent}. Stock iliyopo ni ${stock}.`,
    action: language === 'en'
      ? 'Check visibility, price, customer demand, and whether this stock should be promoted or transferred.'
      : 'Hakiki kama bidhaa ipo sehemu inayoonekana, angalia kama bei ni sahihi, uliza kama wateja bado wanaihitaji, kisha fikiria kuitangaza au kuihamisha.',
    question: language === 'en'
      ? `Ask why ${productName} is selling slower than its normal rhythm.`
      : `Uliza kwa nini ${productName} inakwenda taratibu kuliko kawaida yake.`,
  });
} else if (stock > 0 && sold === 0 && prevSold === 0 && !rhythm.hasEnoughHistory) {
  addRec({
    type: 'Do Not Buy',
    priority: 'Medium',
    productCode: group.code,
    productName,
    shopId: shopInfo.shopId,
    shopName: shopInfo.shopName,
    title: recText(language, 'doNotBuy', { product: productName, shop: shopInfo.shopName }),
    evidence: language === 'en'
      ? `Current stock is ${qtyText(stock)}, but there is not enough sales history to confirm normal movement.`
      : `Stock iliyopo ni ${qtyText(stock)}, lakini bado hakuna historia ya kutosha kuthibitisha mwenendo wake wa kawaida.`,
    action: language === 'en'
      ? 'Avoid buying more until there is clearer demand.'
      : 'Usiongeze bidhaa hii kwa sasa mpaka kuwe na uhakika wa uhitaji wake.',
    question: language === 'en'
      ? `Ask whether customers still request ${productName}.`
      : `Uliza kama wateja bado wanaihitaji ${productName}.`,
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

        const destLastSaleDate = allMovement[`${group.code}__${dest.shopId}`]?.lastSaleDate || '';
        const destDaysSinceLastSale = daysSinceDate(destLastSaleDate);
        const sourceLastSaleDate = allMovement[`${group.code}__${source.shopId}`]?.lastSaleDate || '';
        const sourceDaysSinceLastSale = daysSinceDate(sourceLastSaleDate);

        const demandFreshnessDays = Math.max(1, Math.min(14, Math.ceil(range.days / 2)));
        const minimumDemandQty = range.days > 7 ? 2 : 1;

        const hasClearDestinationDemand =
          destSold >= minimumDemandQty &&
          destLastSaleDate &&
          destDaysSinceLastSale !== null &&
          destDaysSinceLastSale <= demandFreshnessDays;

        if (
          source.stock >= 5 &&
          destSold > sourceSold &&
          dest.stock <= Math.max(2, destSold) &&
          hasClearDestinationDemand
        ) {
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
              ? `Destination: ${dest.shopName} sold ${destSold} in the selected period; last sale was ${destLastSaleDate || 'not found'}${destDaysSinceLastSale !== null ? ` (${destDaysSinceLastSale} day(s) ago)` : ''}; current stock is ${dest.stock}. Source: ${source.shopName} has stock ${source.stock}, sold ${sourceSold} in the selected period; last sale was ${sourceLastSaleDate || 'not found'}${sourceDaysSinceLastSale !== null ? ` (${sourceDaysSinceLastSale} day(s) ago)` : ''}.`
              : `Duka linalohitaji: ${formatShopForText(dest.shopName, language)} limeuza ${destSold} katika kipindi ulichochagua; mauzo ya mwisho yalikuwa ${destLastSaleDate || 'hayajaonekana'}${destDaysSinceLastSale !== null ? `, siku ${destDaysSinceLastSale} zilizopita` : ''}; stock iliyopo ni ${dest.stock}. Duka linaloweza kutoa: ${formatShopForText(source.shopName, language)} lina stock ${source.stock}, limeuza ${sourceSold} katika kipindi hiki; mauzo ya mwisho yalikuwa ${sourceLastSaleDate || 'hayajaonekana'}${sourceDaysSinceLastSale !== null ? `, siku ${sourceDaysSinceLastSale} zilizopita` : ''}.`,
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
          ? daysLeft < 0
            ? stock > 0
              ? 'First confirm whether the expiry date was recorded correctly. If the product has truly expired, stop selling it, separate it from normal stock, and arrange disposal/removal.'
              : 'No stock remains, so confirm that the expiry record is correct and close the issue.'
            : stock > 0
              ? 'Sell, discount, promote or transfer before expiry. Do not reorder this item until current stock is cleared.'
              : 'No stock remains, so only confirm that records are correct.'
          : daysLeft < 0
            ? stock > 0
              ? 'Kwanza thibitisha kama tarehe ya mwisho wa matumizi iliwekwa sahihi. Kama bidhaa imeisha muda wake kweli, usiiuze tena; itenge na bidhaa nyingine, kisha iharibu.'
              : 'Stock imeisha; thibitisha kama rekodi ya expiry iko sahihi na funga suala hili.'
            : stock > 0
              ? 'Iuze, ipunguzie bei, itangaze au ihamishe kabla ya kuisha muda wa matumizi. Usinunue tena mpaka stock iliyopo iishe.'
              : 'Stock imeisha; thibitisha tu kama rekodi ziko sahihi.',
        question: language === 'en'
          ? daysLeft < 0
            ? stock > 0
              ? `Ask the attendant to confirm whether ${name} has truly expired or whether the expiry date was recorded wrongly. If it has expired, remove it from sale and arrange disposal.`
              : `Confirm whether ${name} is actually finished and whether the expiry record should be closed.`
            : stock > 0
              ? `Ask why ${name} still has ${stock} in stock near expiry, whether demand reduced, and whether it can be transferred or discounted.`
              : `Confirm whether ${name} is actually finished and whether the expiry record should be closed.`
          : daysLeft < 0
            ? stock > 0
              ? `Muulize mhudumu athibitishe kama ${name} imeisha muda wake kweli au tarehe ya expiry iliwekwa kimakosa. Kama imeisha muda wake, iondolewe kwenye mauzo na ipangiwe disposal.`
              : `Muulize mhudumu kama ${name} kweli imeisha na kama rekodi ya expiry ifungwe.`
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

    const daySales = sales.filter(
      (sale) =>
        getDateValue(sale) === currentDate
    );

    const dayMobileEntries = mobileEntries.filter(
      (entry) =>
        getDateValue(entry) === currentDate
    );

    const dayGasEntries = gasEntries.filter(
      (entry) =>
        getDateValue(entry) === currentDate
    );

    const daySalesValue = daySales.reduce(
      (sum, sale) =>
        sum + num(sale.total || 0),
      0
    );

    const dayRemittanceSummary =
      summarizeRemittanceRange(
        currentDate,
        currentDate
      );

    const dayGrossProfit =
      dayRemittanceSummary.grossProfit;

    const dayExpenseValue =
      dayRemittanceSummary.expenses;

    const dayMobileCommission = dayMobileEntries.reduce((sum, entry) => {
      const mobile = (entry.networks || []).reduce((s, n) => s + num(n.commission || 0), 0);
      const bank = (entry.banks || []).reduce((s, b) => s + num(b.commission || 0), 0);
      return sum + mobile + bank;
    }, 0);

    const dayGasProfit = Number(
      dayRemittanceSummary.gasProfit || 0
    );

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
    dailySalesTarget,
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

    ownerProfit:
      remittanceSummary.ownerProfit,

    shopReserve:
      remittanceSummary.shopReserve,

    amountToSubmit:
      remittanceSummary.amountToSubmit,

    previousOwnerProfit:
      previousRemittanceSummary.ownerProfit,

    previousShopReserve:
      previousRemittanceSummary.shopReserve,

    previousAmountToSubmit:
      previousRemittanceSummary.amountToSubmit,

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

        const qty = moves.reduce((s, m) => s + Number(m.qty || 0), 0);
        const sales = moves.reduce((s, m) => s + Number(m.sales || 0), 0);
        const profit = moves.reduce((s, m) => s + Number(m.profit || 0), 0);
        const transactions = moves.reduce((s, m) => s + Number(m.transactions || 0), 0);
        const lastSaleDate = moves
          .map((m) => m.lastSaleDate || '')
          .filter(Boolean)
          .sort()
          .slice(-1)[0] || '-';

        const stock = Number(shopInfo.stock || 0);
        const stockValue = Number(shopInfo.stockValue || 0);
        const efficiency = stockValue ? profit / stockValue : 0;
        const productName = Array.from(shopInfo.productNames)[0] || Array.from(group.names)[0] || group.code;
        const firstProduct = shopInfo.products?.[0] || {};
        const unit = unitText(firstProduct.baseUnit || firstProduct.baseunit || firstProduct.unit || 'pc');
        const stockedDate =
          firstProduct.createdAt ||
          firstProduct.created_at ||
          firstProduct.date ||
          firstProduct.purchaseDate ||
          firstProduct.purchasedate ||
          '-';

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
          unit,
          stock: roundQty(stock, 2),
          qty: roundQty(qty, 2),
          qtySold: roundQty(qty, 2),
          sales: Math.round(Number(sales || 0)),
          profit: Math.round(Number(profit || 0)),
          transactions,
          margin: sales > 0 ? roundQty((profit / sales) * 100, 1) : 0,
          stockValue: Math.round(Number(stockValue || 0)),
          efficiency,
          label,
          stockedDate,
          lastSaleDate,
        };
      });
    })
    .filter((item) => Number(item.stock || 0) > 0 && Number(item.stockValue || 0) > 0)
    .sort((a, b) => {
      const aWeakDemand = Number(a.transactions || 0) <= 1 ? 1 : 0;
      const bWeakDemand = Number(b.transactions || 0) <= 1 ? 1 : 0;

      if (aWeakDemand !== bWeakDemand) return bWeakDemand - aWeakDemand;

      const aPressure = Number(a.stockValue || 0) - Number(a.profit || 0);
      const bPressure = Number(b.stockValue || 0) - Number(b.profit || 0);

      return bPressure - aPressure;
    })
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

    if (expenseChange > salesChange && expenseChange > 10) {
      msg += ' Matumizi yanaongezeka kwa kasi kuliko mauzo, hivyo linahitaji uangalizi wa karibu.';
    }

    const shopNameForMessage = weakest?.shopName
      ? formatShopForText(weakest.shopName, language).replace(/^duka/, 'Duka')
      : 'Biashara';

    msg += ` ${shopNameForMessage} lina hatari kubwa ${critical} na ushauri muhimu ${high} unaohitaji maamuzi.`;

    return msg;
  }

  let message = `Business sales are ${salesText} compared to the previous equivalent period. Net profit is ${profitText}.`;
  if (expenseChange > salesChange && expenseChange > 10) message += ' Expenses are growing faster than sales, so expense pressure should be reviewed.';
  if (weakest && weakest.status !== 'Good') message += ` ${weakest.shopName} needs attention because its status is ${weakest.status}.`;
  if (critical || high) message += ` There are ${critical} critical and ${high} high-priority recommendations requiring owner attention.`;
  return message;
}

function detectAiIntent(question = '') {
  const q = String(question || '').toLowerCase();

  if (
    q.includes('duplicate') ||
    q.includes('duplicates') ||
    q.includes('jirudia') ||
    q.includes('zinazojirudia') ||
    q.includes('majina tofauti') ||
    q.includes('same product') ||
    q.includes('repeated product')
  ) {
    return 'duplicate_products';
  }

  if (
    q.includes('profit drop') ||
    q.includes('profit reduce') ||
    q.includes('profit reduced') ||
    q.includes('faida imeshuka') ||
    q.includes('faida imepungua') ||
    q.includes('kwa nini faida') ||
    q.includes('why profit')
  ) {
    return 'profit_drop';
  }

  if (
    q.includes('weekly') ||
    q.includes('week plan') ||
    q.includes('mpango wa wiki') ||
    q.includes('wiki hii') ||
    q.includes('action plan') ||
    q.includes('hatua za wiki')
  ) {
    return 'weekly_plan';
  }

  if (
    q.includes('investment') ||
    q.includes('invest') ||
    q.includes('uwekezaji') ||
    q.includes('fursa') ||
    q.includes('opportunity') ||
    q.includes('opportunities')
  ) {
    return 'investment';
  }

  if (
    q.includes('reorder') ||
    q.includes('restock') ||
    q.includes('stock') ||
    q.includes('ongeza stock') ||
    q.includes('kununua') ||
    q.includes('buy more') ||
    q.includes('stop buying') ||
    q.includes('niache kununua')
  ) {
    return 'stock_reorder';
  }

  if (
    q.includes('shop') ||
    q.includes('duka') ||
    q.includes('maduka') ||
    q.includes('performance') ||
    q.includes('mwenendo')
  ) {
    return 'shop_performance';
  }

  return 'general_business';
}

function normalizeProductNameForDuplicate(name = '') {
  return String(name || '')
    .toLowerCase()
    .replace(/\b(kg|g|gram|grams|ltr|liter|litre|ml|pcs|pc|box|pkt|packet|small|big|kubwa|ndogo)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDuplicateGroups(productRows = []) {
  const groups = {};

  (productRows || []).forEach((row) => {
    const normalizedName = normalizeProductNameForDuplicate(row.productName);
    const shopName = String(row.shopName || '').trim();

    if (!normalizedName || !shopName) return;

    const key = `${shopName.toLowerCase()}__${normalizedName}`;

    if (!groups[key]) {
      groups[key] = {
        key,
        normalizedName,
        shopName,
        rows: [],
      };
    }

    groups[key].rows.push(row);
  });

  return Object.values(groups)
    .filter((group) => group.rows.length > 1)
    .map((group) => ({
      ...group,
      reason: 'Same or very similar product name in the same shop after cleaning size/unit words.',
    }))
    .sort((a, b) => b.rows.length - a.rows.length);
}

function buildAiContextPack({ analytics, visibleRecommendations, intent, language }) {
  const sw = language !== 'en';

  const recommendationText = (items = [], limit = 20) =>
    items.slice(0, limit).map((r, idx) => (
      `${idx + 1}. ${r.title}. ${sw ? 'Duka' : 'Shop'}: ${r.shopName || '-'}; ${sw ? 'Bidhaa' : 'Product'}: ${r.productName || '-'}; ${sw ? 'Ushahidi' : 'Evidence'}: ${r.evidence || '-'}; ${sw ? 'Hatua' : 'Action'}: ${r.action || '-'}; Priority: ${r.priority || '-'}`
    )).join('\n');

  const productRowsText = (rows = [], limit = 40) =>
    rows.slice(0, limit).map((row, idx) => (
      `${idx + 1}. ${row.productName}; ${sw ? 'Duka' : 'Shop'}: ${row.shopName}; stock: ${row.stock}; ${sw ? 'kununua' : 'buy'}: TZS ${money(row.buy)}; ${sw ? 'kuuza' : 'sell'}: TZS ${money(row.sell)}; ${sw ? 'mauzo' : 'sales'}: TZS ${money(row.sales)}; ${sw ? 'faida' : 'profit'}: TZS ${money(row.profit)}; status: ${row.status}; advice: ${row.advice}`
    )).join('\n');

  const shopText = (rows = [], limit = 15) =>
    rows.slice(0, limit).map((s, idx) => (
      `${idx + 1}. ${s.shopName}; ${sw ? 'mauzo' : 'sales'}: TZS ${money(s.sales)}; ${sw ? 'faida halisi' : 'net profit'}: TZS ${money(s.netProfit)}; ${sw ? 'matumizi' : 'expenses'}: TZS ${money(s.expenses)}; ${sw ? 'stock' : 'stock value'}: TZS ${money(s.stockValue)}; margin: ${pct(s.margin)}; status: ${s.status}; strength: ${s.strength}`
    )).join('\n');

  const movementText = (rows = [], limit = 25) =>
    rows.slice(0, limit).map((m, idx) => (
      `${idx + 1}. ${m.productName}; ${sw ? 'Duka' : 'Shop'}: ${m.shopName}; qty: ${m.qty}; ${sw ? 'mauzo' : 'sales'}: TZS ${money(m.sales)}; ${sw ? 'faida' : 'profit'}: TZS ${money(m.profit)}; ${sw ? 'mauzo ya mwisho' : 'last sale'}: ${m.lastSaleDate || '-'}`
    )).join('\n');

  const productMixText = (rows = [], limit = 10) =>
    rows.slice(0, limit).map((c, idx) => (
      `${idx + 1}. ${catLabel(c.category, language)}; qty: ${c.qty}; ${sw ? 'mauzo' : 'sales'}: TZS ${money(c.sales)}; ${sw ? 'faida' : 'profit'}: TZS ${money(c.profit)}; margin: ${pct(c.margin)}`
    )).join('\n');

  const duplicateGroups = buildDuplicateGroups(analytics.productCommandRows || []);

  const duplicateGroupsText = duplicateGroups.slice(0, 30).map((group, groupIndex) => {
    const rowsText = group.rows.map((row, rowIndex) => (
      `   ${rowIndex + 1}. ${row.productName}; ${sw ? 'Duka' : 'Shop'}: ${row.shopName}; stock: ${row.stock}; ${sw ? 'kununua' : 'buy'}: TZS ${money(row.buy)}; ${sw ? 'kuuza' : 'sell'}: TZS ${money(row.sell)}; ${sw ? 'mauzo' : 'sales'}: TZS ${money(row.sales)}; ${sw ? 'faida' : 'profit'}: TZS ${money(row.profit)}; status: ${row.status}`
    )).join('\n');

    return `${groupIndex + 1}. ${sw ? 'Kundi linaloweza kujirudia' : 'Possible duplicate group'}: ${group.normalizedName}
${sw ? 'Sababu' : 'Reason'}: ${group.reason}
${rowsText}`;
  }).join('\n\n');

  const belowCost = visibleRecommendations.filter((r) => r.type === 'Loss Making Product');
  const lowMargin = visibleRecommendations.filter((r) => r.type === 'Low Margin Product');
  const reorder = visibleRecommendations.filter((r) => r.type === 'Reorder Needed');
  const slow = visibleRecommendations.filter((r) => r.type === 'Do Not Buy');
  const transfer = visibleRecommendations.filter((r) => r.type === 'Stock Transfer');
  const expiry = visibleRecommendations.filter((r) => String(r.type || '').toLowerCase().includes('expiry') || String(r.type || '').toLowerCase().includes('expired'));
  const opportunities = visibleRecommendations.filter((r) => ['Stock Transfer', 'Missing Product Opportunity', 'Investment Opportunity'].includes(r.type));

  const commonHeader = `
${sw ? 'MUHTASARI WA BIASHARA' : 'BUSINESS SUMMARY'}
${sw ? 'Kipindi' : 'Period'}: ${analytics.range?.start || '-'} to ${analytics.range?.end || '-'}
${sw ? 'Mauzo' : 'Sales'}: TZS ${money(analytics.totalSales)}
${sw ? 'Mauzo ya kipindi kilichopita' : 'Previous sales'}: TZS ${money(analytics.previousTotalSales)}
${sw ? 'Faida ghafi' : 'Gross profit'}: TZS ${money(analytics.grossProfit)}
${sw ? 'Faida halisi' : 'Net profit'}: TZS ${money(analytics.netProfit)}
${sw ? 'Matumizi' : 'Expenses'}: TZS ${money(analytics.totalExpenses)}
${sw ? 'Thamani ya stock' : 'Stock value'}: TZS ${money(analytics.stockValue)}
${sw ? 'Madeni ya wateja' : 'Credit outstanding'}: TZS ${money(analytics.creditOutstanding)}
${sw ? 'Chenji ya mteja' : 'Customer change ledger'}: TZS ${money(analytics.changeOutstanding)}
${sw ? 'Kamisheni ya wakala/benki' : 'Wakala/bank commission'}: TZS ${money(analytics.mobileCommission)}
${sw ? 'Faida ya gesi' : 'Gas profit'}: TZS ${money(analytics.gasProfit)}
`;

  if (intent === 'duplicate_products') {
    return `${commonHeader}

${sw ? 'LENGO LA SWALI: TAFUTA BIDHAA ZINAZOWEZA KUJIRUDIA' : 'QUESTION FOCUS: POSSIBLE DUPLICATE PRODUCTS'}

${sw
  ? 'Sheria: AI iruhusiwe kutaja bidhaa zilizopo kwenye makundi hapa chini tu. Ikiwa hakuna kundi, iseme wazi kuwa haijaona duplicate kwenye data iliyotolewa.'
  : 'Rule: The AI may only mention products listed in the groups below. If there is no group, it must clearly say no duplicate was found in the provided data.'}

${sw ? 'Makundi ya bidhaa yanayoweza kujirudia kutoka kwenye data halisi:' : 'Possible duplicate groups from actual data:'}
${duplicateGroupsText || (sw ? 'Hakuna kundi la bidhaa zinazojirudia lililopatikana kwenye data iliyotolewa.' : 'No duplicate product group was found in the provided data.')}

${sw ? 'Mapendekezo mengine yanayohusiana na bidhaa:' : 'Other product-related recommendations:'}
${recommendationText(visibleRecommendations.filter((r) => ['Possible Duplicate Product', 'Loss Making Product', 'Low Margin Product'].includes(r.type)), 20)}
`;
  }

  if (intent === 'profit_drop') {
    return `${commonHeader}

${sw ? 'LENGO LA SWALI: KWA NINI FAIDA IMESHUKA AU IMEKUWA NDOGO' : 'QUESTION FOCUS: WHY PROFIT DROPPED OR REMAINED WEAK'}

${sw ? 'Mwenendo wa maduka:' : 'Shop performance:'}
${shopText(analytics.shopPerformance, 15)}

${sw ? 'Bidhaa zilizoleta faida kubwa zaidi:' : 'Top profit products:'}
${movementText(analytics.topProducts, 20)}

${sw ? 'Hatari za bei chini ya manunuzi:' : 'Below-cost risks:'}
${recommendationText(belowCost, 20)}

${sw ? 'Bidhaa zenye margin ndogo:' : 'Low-margin products:'}
${recommendationText(lowMargin, 20)}
`;
  }

  if (intent === 'weekly_plan') {
    return `${commonHeader}

${sw ? 'LENGO LA SWALI: MPANGO WA HATUA ZA WIKI' : 'QUESTION FOCUS: WEEKLY ACTION PLAN'}

${sw ? 'Hatari muhimu na vipaumbele:' : 'Important risks and priorities:'}
${recommendationText(visibleRecommendations, 30)}

${sw ? 'Bidhaa za kuongeza stock:' : 'Reorder items:'}
${recommendationText(reorder, 20)}

${sw ? 'Bidhaa za kutonunua/stock iliyolala:' : 'Do-not-buy / sleeping stock:'}
${recommendationText(slow, 20)}

${sw ? 'Fursa za kuhamisha stock:' : 'Stock transfer opportunities:'}
${recommendationText(transfer, 20)}

${sw ? 'Hatari za expiry:' : 'Expiry risks:'}
${recommendationText(expiry, 20)}
`;
  }

  if (intent === 'investment') {
    return `${commonHeader}

${sw ? 'LENGO LA SWALI: FURSA ZA UWEKEZAJI' : 'QUESTION FOCUS: INVESTMENT OPPORTUNITIES'}

${sw ? 'Mchanganyiko wa bidhaa kwa mauzo/faida:' : 'Product mix by sales/profit:'}
${productMixText(analytics.productMix, 12)}

${sw ? 'Bidhaa na fursa zilizotambuliwa:' : 'Opportunity recommendations:'}
${recommendationText(opportunities, 30)}

${sw ? 'Mwenendo wa maduka:' : 'Shop performance:'}
${shopText(analytics.shopPerformance, 15)}
`;
  }

  if (intent === 'stock_reorder') {
    return `${commonHeader}

${sw ? 'LENGO LA SWALI: STOCK, KUONGEZA, KUPUNGUZA AU KUACHA KUNUNUA' : 'QUESTION FOCUS: STOCK, REORDER, STOP BUYING'}

${sw ? 'Bidhaa za kuongeza stock:' : 'Reorder items:'}
${recommendationText(reorder, 25)}

${sw ? 'Bidhaa za kutonunua kwa sasa:' : 'Do-not-buy items:'}
${recommendationText(slow, 25)}

${sw ? 'Bidhaa zilizo kwenye product command centre:' : 'Product command rows:'}
${productRowsText(analytics.productCommandRows, 50)}
`;
  }

  if (intent === 'shop_performance') {
    return `${commonHeader}

${sw ? 'LENGO LA SWALI: MWENENDO WA MADUKA' : 'QUESTION FOCUS: SHOP PERFORMANCE'}

${sw ? 'Mwenendo wa kila duka:' : 'Shop performance:'}
${shopText(analytics.shopPerformance, 20)}

${sw ? 'Maswali ya kuuliza wahudumu:' : 'Questions to ask attendants:'}
${(analytics.attendantQuestions || []).slice(0, 20).map((q, idx) => `${idx + 1}. ${q.shopName}; ${q.priority}; ${q.question}; ${q.evidence || ''}`).join('\n')}
`;
  }

  return `${commonHeader}

${sw ? 'LENGO LA SWALI: UCHAMBUZI WA JUMLA WA BIASHARA' : 'QUESTION FOCUS: GENERAL BUSINESS ANALYSIS'}

${sw ? 'Ujumbe wa mfumo:' : 'System message:'}
${analytics.businessMessage}

${sw ? 'Mwenendo wa maduka:' : 'Shop performance:'}
${shopText(analytics.shopPerformance, 15)}

${sw ? 'Mapendekezo muhimu:' : 'Important recommendations:'}
${recommendationText(visibleRecommendations, 30)}

${sw ? 'Bidhaa zilizoleta faida zaidi:' : 'Top profit products:'}
${movementText(analytics.topProducts, 15)}
`;
}

function getTrendLabel(value, language, dataKey = '') {
  const sw = language !== 'en';
  const safeValue = Number(value || 0);
  const absValue = Math.abs(safeValue).toFixed(1);

  if (!sw) {
    if (safeValue >= 5) return `Increased ${safeValue.toFixed(1)}%`;
    if (safeValue <= -5) return `Reduced ${absValue}%`;
    return 'Stable';
  }

  const wordingByKey = {
    sales: {
      increased: 'Mauzo yameongezeka',
      reduced: 'Mauzo yamepungua',
      stable: 'Mauzo yametulia',
    },
    expenses: {
      increased: 'Matumizi yameongezeka',
      reduced: 'Matumizi yamepungua',
      stable: 'Matumizi yametulia',
    },
    netProfit: {
      increased: 'Faida imeongezeka',
      reduced: 'Faida imepungua',
      stable: 'Faida imetulia',
    },
    mobileCommission: {
      increased: 'Kamisheni imeongezeka',
      reduced: 'Kamisheni imepungua',
      stable: 'Kamisheni imetulia',
    },
  };

  const wording = wordingByKey[dataKey] || {
    increased: 'Imeongezeka',
    reduced: 'Imepungua',
    stable: 'Imetulia',
  };

  if (safeValue >= 5) return `${wording.increased} ${safeValue.toFixed(1)}%`;
  if (safeValue <= -5) return `${wording.reduced} ${absValue}%`;
  return wording.stable;
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

function ExecutiveMetric({ label, value, hint, trend, gradient = 'from-emerald-500 to-green-400', icon = '●' }) {
  return (
    <div
      className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-semibold text-white shadow-sm`}>
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[10px] font-semibold leading-4 text-slate-600">
            {label}
          </p>

          <p className="mt-2 break-words text-[15px] font-bold leading-[1.2] tracking-tight text-slate-950">
            {value}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {trend !== undefined ? (
              <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${trendClass(trend)}`}>
                {trend >= 0 ? '↑ ' : '↓ '}{Math.abs(trend).toFixed(1)}%
              </span>
            ) : null}

            {hint ? (
              <span className="min-w-0 truncate text-[9px] font-medium text-slate-500">
                {hint}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// Product-specific marketing intelligence: explicit product identities take priority over categories.
// Claims about a brand's performance or past customers are read from product records, not invented.
function ceoMarketingProfile(productName, productRows = []) {
  const raw = String(productName || '').trim();
  const name = raw.toLocaleLowerCase().replace(/\s+/g, ' ');
  const includes = (...terms) => terms.some(term => name.includes(term));
  const facts = productRows.flatMap(p => [p?.sellingPoints, p?.selling_points, p?.marketingDescription, p?.marketing_description])
    .filter(v => typeof v === 'string' && v.trim()).map(v => v.trim()).filter((v,i,arr) => arr.indexOf(v) === i).join('; ');
  const feedback = productRows.flatMap(p => [p?.verifiedCustomerFeedback, p?.verified_customer_feedback])
    .filter(v => typeof v === 'string' && v.trim()).map(v => v.trim()).filter((v,i,arr) => arr.indexOf(v) === i).join('; ');
  // Distinguish product names before falling back to type-based guidance.
  let kind = 'unknown';
  if (includes('toss')) kind = 'toss';
  else if (includes('uzi black', 'uzi mweusi', 'thread black')) kind = 'black-thread';
  else if (includes('uzi ', 'thread')) kind = 'thread';
  else if (includes('mayai', 'egg')) kind = 'eggs';
  else if (includes('azam ngano')) kind = 'azam-wheat';
  else if (includes('ngano', 'wheat flour')) kind = 'wheat';
  else if (includes('mafuta ya kupima', 'mafuta ya kupikia', 'sunflower', 'alizeti', 'cooking oil')) kind = 'oil';
  else if (includes('mchele', 'rice')) kind = 'rice';
  else if (includes('sabuni', 'soap', 'omo', 'detergent', 'kleesoft', 'whitedent')) kind = 'soap';
  else if (includes('dagaa')) kind = 'fish';
  else if (includes('pepsi', 'fanta', 'coke', 'soda', 'sprite', 'juice')) kind = 'drink';
  else if (includes('unga', 'flour')) kind = 'flour';
  else if (includes('sukari', 'sugar')) kind = 'sugar';
  else if (includes('maziwa', 'milk')) kind = 'milk';
  else if (includes('mkate', 'bread')) kind = 'bread';
  else if (includes('maandazi', 'donut')) kind = 'snack';
  else if (includes('chumvi', 'salt')) kind = 'salt';
  else if (includes('biskuti', 'biscuit')) kind = 'biscuit';
  else if (includes('dawa', 'panadol', 'paracetamol', 'amoxicillin')) kind = 'medicine';
  return { kind, facts, feedback };
}

function ceoProductSellingPlan({ name, productRows, declining, stock, previousQty, currentQty, last7, last30, expiry, todayKey, sw }) {
  const { kind, facts, feedback } = ceoMarketingProfile(name, productRows);
  const scripts = {
    toss: ['Onyesha Toss Gram 500 kwa wateja wanaonunua mahitaji ya kufulia. Waeleze kuwa ni sabuni ya kufulia, waonyeshe ukubwa wa gramu 500 na bei yake. Tumia maelezo ya harufu, povu na uwezo wa kuondoa uchafu yaliyo kwenye kifungashio wakati wa kuwashawishi. Pendekeza pamoja na ndoo, brashi au bidhaa nyingine za kufulia zinazouzwa dukani.', 'Present Toss 500g to laundry shoppers. Show its pack size and price, use the pack’s descriptions of fragrance, lather and cleaning performance, and offer it with other laundry supplies.'],
    'black-thread': ['Waonyeshe wateja Uzi Black kwa kushona au kurekebisha nguo nyeusi. Waeleze kuwa rangi nyeusi husaidia mshono usionekane sana kwenye kitambaa cheusi. Wape pendekezo la kununua uzi pamoja na sindano na vifungo; weka uzi karibu na vifaa hivyo.', 'Offer black thread for sewing or repairing black garments. Explain colour matching, and suggest needles and buttons alongside it.'],
    thread: ['Waonyeshe wateja rangi ya uzi na aina ya kazi za kushona zinazofaa. Pendekeza uzi pamoja na sindano, vifungo na vifaa vingine vya ushonaji vilivyopo dukani.', 'Show the thread colour and relevant sewing uses. Offer needles and buttons alongside it.'],
    eggs: ['Pendekeza mayai kwa wateja wanaonunua mkate, chai, mafuta ya kupikia na mahitaji ya kifungua kinywa. Waeleze kwamba mayai yanaweza kuchemshwa, kukaangwa au kutumika kuandaa vitafunwa. Onyesha bei ya yai moja na bei ya mayai mengi ili mteja achague kiasi anachohitaji.', 'Offer eggs with bread, tea and breakfast ingredients. Suggest boiling, frying or baking, and display single-egg and multi-egg prices.'],
    'azam-wheat': ['Waeleze wateja wanaonunua mafuta, sukari au hamira kwamba unga wa Azam Ngano unaweza kutumika kuandaa chapati, maandazi na vyakula vya ngano. Waonyeshe kiasi kinachouzwa na bei yake. Pendekeza unga pamoja na mafuta ya kupikia au hamira kwa anayepanga kupika chapati au maandazi.', 'Show Azam wheat flour to shoppers buying oil, sugar or yeast. Explain its use for chapati and maandazi and suggest the complementary ingredients.'],
    wheat: ['Pendekeza unga wa ngano kwa wateja wanaonunua mafuta ya kupikia, sukari au hamira. Waeleze matumizi ya unga katika chapati na maandazi, na waonyeshe bei kwa kiasi wanachotaka.', 'Offer wheat flour with cooking oil, sugar and yeast for chapati and maandazi.'],
    oil: ['Waeleze wateja wanaonunua mchele, unga, viazi au viungo kwamba mafuta haya yanafaa kwa kupikia na kukaangia. Waonyeshe rangi, aina na bei ya mafuta yanayouzwa. Pendekeza kiasi cha mafuta kinachoendana na chakula wanachonunua; yaweke karibu na bidhaa za kupikia.', 'Offer cooking oil to shoppers buying rice, flour, potatoes or spices. Show the oil type, price and pack size, and suggest a suitable quantity for their cooking.'],
    rice: ['Waonyeshe wateja punje za mchele huu na waeleze aina yake, bei kwa kilo na matumizi yake. Eleza harufu, ladha na namna unavyoiva kwa kutumia sifa halisi za mchele uliopo. Pendekeza mchele pamoja na maharage, mafuta ya kupikia na viungo.', 'Show the rice grains, variety and price per kilogram. Discuss the rice’s actual aroma and cooking characteristics, and offer it with beans, oil or spices.'],
    soap: ['Waonyeshe wateja sabuni hii na ukubwa wake. Eleza matumizi yake ya kuondoa uchafu, povu na harufu kwa kuzingatia maelezo ya bidhaa yenyewe. Pendekeza pamoja na brashi, ndoo na mahitaji mengine ya usafi.', 'Show the soap and pack size. Explain its labelled cleaning, lather and fragrance features and offer it with cleaning supplies.'],
    fish: ['Waonyeshe wateja ukubwa na hali ya dagaa waliopo. Waeleze namna ya kuwaandaa kwa nyanya, vitunguu na mafuta, na pendekeza dagaa kwa anayenunua unga wa ugali au viungo vya kupikia.', 'Show the dried fish and suggest preparing it with tomatoes, onions and oil. Offer it to customers buying maize flour or spices.'],
    drink: ['Pendekeza kinywaji hiki kwa wateja wanaonunua maandazi, biskuti au chakula. Waonyeshe ukubwa wa chupa na bei; kama kipo kwenye friji, toa chaguo la kunywa kikiwa baridi.', 'Offer the drink with pastries, biscuits or meals. Show the bottle size and price; offer a chilled bottle when stocked.'],
    flour: ['Waeleze wateja matumizi ya unga huu katika chakula wanachopika. Pendekeza pamoja na mafuta, sukari au viungo vinavyotumika kwenye chakula hicho.', 'Explain the flour’s cooking uses and offer relevant cooking ingredients.'],
    sugar: ['Pendekeza sukari kwa wateja wanaonunua chai, kahawa, maziwa au unga wa kuoka. Waonyeshe bei ya kiasi kidogo na kikubwa ili wachague kinachowafaa.', 'Offer sugar with tea, coffee, milk or baking ingredients and show available quantity prices.'],
    milk: ['Pendekeza maziwa kwa wateja wanaonunua chai, kahawa, mkate au nafaka za kifungua kinywa. Waonyeshe ukubwa wa kifungashio na bei.', 'Offer milk with tea, coffee, bread or breakfast cereals and show the pack size and price.'],
    bread: ['Pendekeza mkate kwa wateja wanaonunua mayai, chai, maziwa au siagi. Waonyeshe aina na bei ya mkate unaopatikana leo.', 'Offer bread with eggs, tea, milk or butter. Show the available variety and price.'],
    snack: ['Pendekeza kitafunwa hiki kwa wateja wanaonunua chai, kahawa, maziwa au soda. Kiweke sehemu safi inayoonekana karibu na vinywaji.', 'Offer the snack with tea, coffee, milk or soda, and display it cleanly near drinks.'],
    salt: ['Pendekeza chumvi kwa wateja wanaonunua mchele, unga, maharage au viungo vya kupikia. Waonyeshe ukubwa wa kifungashio na bei.', 'Offer salt to customers buying rice, flour, beans or cooking ingredients.'],
    biscuit: ['Pendekeza biskuti kwa wateja wanaonunua chai, maziwa, kahawa au soda. Waonyeshe ladha, ukubwa wa kifungashio na bei.', 'Offer biscuits with tea, milk, coffee or soda. Show the flavour, pack size and price.'],
    medicine: ['Onyesha taarifa za kifungashio na maelekezo ya matumizi. Usitumie madai ya tiba yasiyo kwenye maelekezo au kushawishi matumizi yasiyofaa.', 'Show the labelled directions; avoid unsupported medical claims or inappropriate upselling.'],
    unknown: ['Mwonyeshe mteja bidhaa hii kwa jina lake na bei yake. Muulize anaitumia kwa kazi gani, kisha umwonyeshe ukubwa na matumizi yaliyoandikwa kwenye kifungashio. Rekodi aina sahihi ya bidhaa ili ushauri unaofuata uwe maalumu zaidi.', 'Show the named product and its price. Ask what the customer needs it for, show its labelled uses and record its correct product type for future targeted guidance.']
  };
  const script = (scripts[kind] || scripts.unknown)[sw ? 0 : 1];
  const sold7 = Number(last7 || 0), sold30 = Number(last30 || 0);
  const qtyBefore = Math.max(0, Number(previousQty || 0));
  const qtyNow = Math.max(0, Number(currentQty || 0));
  const stockKnown = stock !== null && Number.isFinite(Number(stock));
  const available = stockKnown ? Math.max(0, Number(stock)) : null;
  const dailyRate = Math.max(sold7 / 7, sold30 / 30);
  const qtyGap = Math.max(0, qtyBefore - qtyNow);
  const recovery = available === null ? qtyGap : Math.min(available, qtyGap);
  const target = declining && recovery > 0
    ? (sw ? `Lengo: rejesha mauzo ya ${qtyText(recovery)} zaidi ya kipindi hiki, hadi kufikia ${qtyText(qtyNow + recovery)}; stock iliyorekodiwa sasa ni ${qtyText(available)}.` : `Target: recover ${qtyText(recovery)} units to reach ${qtyText(qtyNow + recovery)} in a comparable period; current recorded stock is ${qtyText(available)}.`)
    : '';
  const verified = facts ? (sw ? `Sifa zilizorekodiwa za ${name}: ${facts}.` : `Recorded features of ${name}: ${facts}.`) : '';
  const testimony = feedback ? (sw ? `Wateja walivyosema kwenye rekodi: ${feedback}.` : `Recorded customer feedback: ${feedback}.`) : '';
  if (expiry && expiry < todayKey) return {
    action: sw ? `Ondoa ${name} kwenye mauzo; tarehe ya mwisho ya matumizi iliyoandikwa ni ${expiry}. Rekodi kiasi kilichotengwa.` : `Remove ${name} from sale: recorded expiry date is ${expiry}. Record the quantity removed.`,
    followup: sw ? 'Hakikisha bidhaa zilizotengwa hazijarudishwa kwenye mauzo.' : 'Verify removed stock does not return to sale.'
  };
  if (available === 0 || available === null) {
    const need = Math.max(0, Math.ceil(dailyRate * 7));
    const supply = available === null
      ? (sw ? `Kiasi cha stock ya ${name} hakipo kwenye rekodi. Mauzo ya siku 7 ni ${qtyText(sold7)} na siku 30 ni ${qtyText(sold30)}; andaa upatikanaji wa takriban ${qtyText(need)} kwa wiki moja kwa kuzingatia mahitaji haya.` : `Stock quantity for ${name} is not recorded. Sales: ${qtyText(sold7)} in seven days and ${qtyText(sold30)} in thirty; plan about ${qtyText(need)} for one week.`)
      : (sw ? `Stock ya ${name} imefika sifuri. Mauzo ya siku 7 ni ${qtyText(sold7)} na siku 30 ni ${qtyText(sold30)}; andaa takriban ${qtyText(need)} kwa wiki moja.` : `${name} is out of stock. Sales: ${qtyText(sold7)} in seven days and ${qtyText(sold30)} in thirty; plan about ${qtyText(need)} for one week.`);
    return { action: `${supply} ${script} ${verified} ${testimony}`.trim(), followup: sw ? 'Baada ya kupatikana, pima mauzo ya bidhaa na faida kwa siku zinazolingana.' : 'After restocking, compare unit sales and gross profit on matching days.' };
  }
  const expiryDays = expiry && expiry >= todayKey ? Math.ceil((new Date(`${expiry}T12:00:00`) - new Date(`${todayKey}T12:00:00`)) / 86400000) : null;
  const expiryNote = expiryDays !== null && expiryDays <= 14 ? (sw ? `Bidhaa imebakiza siku ${expiryDays} kabla ya tarehe ya mwisho ya matumizi; ipe kipaumbele leo.` : `${expiryDays} days remain until recorded expiry; prioritize today.`) : '';
  return {
    action: [script, verified, testimony, target, expiryNote].filter(Boolean).join(' '),
    followup: sw ? `Jaribu kwa siku 3 na pima idadi na faida. Mauzo ya siku 7: ${qtyText(sold7)}; siku 30: ${qtyText(sold30)}; stock sasa: ${qtyText(available)}.` : `Test for three days and measure units and profit. Sold in seven days: ${qtyText(sold7)}; thirty days: ${qtyText(sold30)}; stock now: ${qtyText(available)}.`
  };
}


// Sales coaching is advisory content only: no writes to POS, stock, or sales records.
const SALES_COACHING_TECHNIQUES = [
  {
    "group": "Huduma kwa mteja",
    "title": "Mkaribishe na umtambue kila mteja, hata ukiwa na wateja wengi",
    "situation": "Mteja anaingia huku unamhudumia mwingine au kuna foleni.",
    "how": "Msalimie mara moja na umhakikishie kuwa umemwona. Endelea kumhudumia aliyetangulia, kisha fuata mpangilio wa waliofika. Ikiwa wateja ni wengi, toa maelezo mafupi bila kuacha mtu akihisi amepuuzwa.",
    "say": "Karibu sana, habari za leo! Nimekuona. Naomba unipe muda kidogo nimalize kumhudumia huyu mteja, kisha nitakuhudumia. Asante kwa uvumilivu wako.",
    "goal": "Kila mteja ajisikie anaheshimiwa hata asipohudumiwa mara moja."
  },
  {
    "group": "Huduma kwa mteja",
    "title": "Msaidie mteja anayeonekana kutafuta kitu",
    "situation": "Mteja anazunguka au anaangalia bidhaa kwa muda bila kuomba msaada.",
    "how": "Mkaribie kwa upole na muulize kama anahitaji msaada. Akisema anaangalia tu, mpe nafasi. Usimuulize maswali mengi mteja ambaye tayari ametaja bidhaa anayotaka.",
    "say": "Karibu sana. Kuna bidhaa maalumu unayotafuta nikusaidie kuipata? Kama unaangalia kwanza, karibu ujisikie huru.",
    "goal": "Kumsaidia mteja aliyekwama bila kumshinikiza."
  },
  {
    "group": "Huduma kwa mteja",
    "title": "Bidhaa haipo: tafuta mbadala unaofaa",
    "situation": "Mteja ameomba chapa, ukubwa au aina ambayo imeisha.",
    "how": "Kagua kwanza kama bidhaa haipo kweli. Tafuta mbadala wa matumizi yanayofanana uliopo dukani; linganisha chapa, kiasi, bei na tofauti muhimu. Usidai bidhaa mbili zinafanana kabisa bila ushahidi.",
    "say": "Samahani, bidhaa hiyo haipo kwa sasa. Tuna chaguo jingine linaloweza kukusaidia kwa matumizi yanayofanana. Nikueleze tofauti ya bei, ukubwa na matumizi yake uamue kama linakufaa?",
    "goal": "Kutoa suluhisho badala ya kuishia kusema hatuna."
  },
  {
    "group": "Huduma kwa mteja",
    "title": "Bei ni kubwa: tafuta chaguo la bajeti yake",
    "situation": "Mteja analalamikia bei au anasema hana fedha za kutosha.",
    "how": "Msikilize bila kubishana. Mwonyeshe kifungashio kidogo au bidhaa mbadala yenye matumizi yanayofanana. Eleza gharama kwa kiasi kilichomo pale inapofaa; usiahidi punguzo lisiloidhinishwa.",
    "say": "Nakuelewa kuhusu bei. Tunaweza kuangalia kifungashio kidogo au bidhaa nyingine yenye bei tofauti. Nikueleze kiasi unachopata kwenye kila moja ili uchague inayolingana na bajeti yako?",
    "goal": "Kusaidia mteja kununua kinachomfaa bila kumdharau."
  },
  {
    "group": "Huduma kwa mteja",
    "title": "Mteja anasita: eleza tofauti na mpe nafasi",
    "situation": "Mteja analinganisha bidhaa mbili au zaidi na bado hajaamua.",
    "how": "Muulize kigezo kinachomuhusu zaidi, kama bei, ukubwa au matumizi. Eleza tofauti zilizothibitishwa, kisha mpe nafasi ya kuamua bila haraka.",
    "say": "Unaweza kuchukua muda wako. Hizi bidhaa zinatofautiana kwa bei, ukubwa na matumizi. Ni jambo gani muhimu zaidi kwako? Nikueleze tofauti zake ili uchague inayokufaa.",
    "goal": "Kujenga imani na kufanya uamuzi kuwa rahisi."
  },
  {
    "group": "Vyakula",
    "title": "Mchele: onyesha sampuli na matumizi ya wali",
    "situation": "Mteja anaulizia mchele au hajui aina ipi achague.",
    "how": "Mwonyeshe sampuli ya mchele na bei ya kila aina. Eleza sifa za harufu, mwonekano na jinsi unavyopikwa pale tu zinapojulikana kwa aina hiyo. Kisha mkumbushe mahitaji ya mlo anayopanga.",
    "say": "Karibu uangalie sampuli ya mchele wetu. Tuna aina hizi na bei zake. Kama unapenda wali wenye harufu nzuri, nikueleze aina inayokufaa. Je, utahitaji pia maharage, mafuta, vitunguu au viungo vya kupikia?",
    "goal": "Kumsaidia kuchagua mchele na kukamilisha mahitaji ya wali."
  },
  {
    "group": "Vyakula",
    "title": "Maharage: eleza kuiva haraka na ladha nzuri",
    "situation": "Mteja anachagua maharage na anataka kujua ubora wake.",
    "how": "Mteja wa maharage hujali hasa muda wa kuiva na ladha. Tambua aina husika; ikiwa umehakikisha kwamba yanaiva haraka na yana ladha nzuri kupitia uzoefu wa kuaminika au taarifa za bidhaa, eleza faida hizo. Usiahidi muda maalumu wa kuiva bila uthibitisho, kwa sababu muda hutegemea aina, umri wa maharage na namna ya kupika. Pendekeza viungo vya mchuzi.",
    "say": "Karibu uangalie maharage haya. Kwa aina ambayo tumethibitisha, yanaiva haraka na yana ladha nzuri; unaweza kupunguza muda wa kupika na kupata chakula kitamu. Ukipika na nyanya, vitunguu na viungo, mchuzi unakuwa mzuri zaidi. Je, nikupatie pia mafuta au mchele?",
    "goal": "Kuuza maharage kwa faida inayomgusa mteja: muda wa kupika, ladha na mlo kamili."
  },
  {
    "group": "Vyakula",
    "title": "Nyanya: kamilisha mchuzi wenye ladha",
    "situation": "Mteja amechagua nyanya za kupikia.",
    "how": "Hakikisha nyanya ni nzuri. Muulize kwa kifupi kama anapika mchuzi; pendekeza vitunguu, kitunguu saumu, binzari na mafuta kulingana na mapishi yake, ikiwa vipo dukani.",
    "say": "Nyanya hizi unaweza kuzitumia kwa mchuzi. Ukizipika pamoja na vitunguu, kitunguu saumu na binzari, unaweza kupata mchuzi wenye harufu na ladha nzuri. Je, viungo na mafuta unavyo nyumbani au nikupatie pia?",
    "goal": "Kukamilisha mahitaji ya mchuzi, si kuuza nyanya pekee."
  },
  {
    "group": "Vyakula",
    "title": "Mayai: pendekeza kifungua kinywa kamili",
    "situation": "Mteja ananunua mayai.",
    "how": "Hakikisha mayai yanafaa kuuzwa. Eleza chaguo la kuchemsha au kukaanga na muulize kama anahitaji mkate, nyanya, vitunguu au mafuta. Usiongeze bidhaa bila kuhusisha matumizi yake.",
    "say": "Mayai unaweza kuyachemsha au kuyakaanga na nyanya na vitunguu. Kama ni kifungua kinywa, unaweza kuyala na mkate. Je, mkate, mafuta au nyanya unavyo tayari?",
    "goal": "Kumsaidia kuandaa chakula cha haraka na kuongeza bidhaa zinazofaa."
  },
  {
    "group": "Vyakula",
    "title": "Unga wa ngano: chapati au maandazi",
    "situation": "Mteja anachukua unga wa ngano.",
    "how": "Muulize anapanga kupika nini ili ujue bidhaa nyingine zinazohitajika. Kwa maandazi pendekeza sukari, mafuta na hamira pale mapishi yanapohitaji; kwa chapati pendekeza mafuta.",
    "say": "Unapanga kupika chapati au maandazi? Kama ni maandazi, je, una sukari, mafuta na hamira? Kama ni chapati, mafuta yanatosha? Nikusaidie kukamilisha mahitaji yako.",
    "goal": "Kuunganisha unga na mahitaji halisi ya mapishi."
  },
  {
    "group": "Vyakula",
    "title": "Mafuta ya kupikia: uliza chakula kinachoandaliwa",
    "situation": "Mteja ananunua mafuta.",
    "how": "Ikiwa ana nafasi ya kuzungumza, uliza anapika nini. Kwa maharage pendekeza nyanya na vitunguu; kwa maandazi unga na sukari; kwa wali mchele au viungo. Pendekeza vilivyopo tu.",
    "say": "Mafuta haya unayachukua kwa kupika chakula gani? Kama ni maharage, tuna nyanya na vitunguu pia; kama ni maandazi, tuna unga na sukari. Kuna kitu nikukamilishie?",
    "goal": "Kutambua mahitaji mengine kupitia matumizi ya mafuta."
  },
  {
    "group": "Vyakula",
    "title": "Viungo: eleza faida kwa mapishi husika",
    "situation": "Mteja ananunua mahitaji ya mchuzi au chakula kingine.",
    "how": "Uliza anapika nini na ladha anayopenda. Pendekeza kiungo kimoja au viwili vinavyofaa kwa mapishi yake na eleza matumizi yake, badala ya kumpa orodha ndefu.",
    "say": "Kwa mchuzi unaopika, unaweza kuongeza vitunguu, kitunguu saumu au binzari kulingana na ladha unayoipenda. Je, ungependa kiasi kidogo cha kujaribu?",
    "goal": "Kuuza viungo kwa kuonyesha matokeo yake kwenye chakula."
  },
  {
    "group": "Usafi",
    "title": "Sabuni ya kufulia: harufu na matumizi sahihi",
    "situation": "Mteja anatafuta sabuni ya kufulia au analinganisha chapa.",
    "how": "Muulize kama anafua kwa mikono au mashine. Mwonyeshe ukubwa, bei, harufu na maelekezo ya matumizi. Eleza povu au uwezo wa kuondoa uchafu ikiwa sifa hizo zimethibitishwa; usidai povu jingi linamaanisha kutumia maji kidogo.",
    "say": "Unafua kwa mikono au mashine? Karibu uangalie sabuni hizi na harufu zake. Nikueleze ukubwa na kiasi cha kutumia kulingana na maelekezo. Je, unahitaji pia brashi au ndoo ya kufulia?",
    "goal": "Kumsaidia kupata sabuni inayofaa na vifaa vya kufulia."
  },
  {
    "group": "Usafi",
    "title": "Sabuni ya vyombo: suluhisho la kuosha",
    "situation": "Mteja anaomba sabuni ya kuoshea vyombo.",
    "how": "Mwonyeshe bidhaa inayofaa, kiasi na maelekezo yake. Kama sifongo au brashi ipo, pendekeza ili kukamilisha kazi ya kuosha vyombo.",
    "say": "Kwa kuoshea vyombo tuna sabuni hii na ukubwa tofauti. Nikueleze matumizi yake. Je, una sifongo au brashi inayofaa, au nikupatie pia?",
    "goal": "Kuuza bidhaa na kifaa kinachosaidia matumizi yake."
  },
  {
    "group": "Usafi",
    "title": "Dawa ya meno: kumbusha mswaki",
    "situation": "Mteja ananunua dawa ya meno au mswaki.",
    "how": "Angalia kama bidhaa inayotumika pamoja nayo ipo. Pendekeza kwa heshima bila kutoa ahadi za matibabu zisizothibitishwa.",
    "say": "Umechukua dawa ya meno. Je, mswaki wako bado unafaa, au ungependa kuangalia miswaki tuliyonayo ili uchague inayokufaa?",
    "goal": "Kukamilisha mahitaji ya usafi wa kinywa."
  },
  {
    "group": "Usafi",
    "title": "Usafi wa nyumba: chagua kwa eneo",
    "situation": "Mteja anahitaji kusafisha sakafu, bafu au choo.",
    "how": "Muulize eneo linalosafishwa, chagua bidhaa yenye maelekezo yanayofaa na mweleze namna salama ya kutumia. Pendekeza brashi au kitambaa. Usimshauri kuchanganya kemikali.",
    "say": "Unasafisha sakafu, bafu au choo? Nikusaidie kuchagua bidhaa inayofaa na kueleza matumizi yake. Je, una brashi au kitambaa cha usafi?",
    "goal": "Kutoa suluhisho salama na kamili la usafi."
  },
  {
    "group": "Vifaa",
    "title": "Uzi wa kushona: linganisha rangi na nguo",
    "situation": "Mteja anahitaji uzi wa kushona au kurekebisha nguo.",
    "how": "Muulize rangi na aina ya kitambaa. Mwonyeshe uzi wa rangi inayofaa na mkumbushe sindano ikiwa ipo.",
    "say": "Unashona nguo ya rangi gani? Kama ni nyeusi, tuna uzi mweusi. Karibu tuulinganishe na kitambaa chako. Je, sindano unayo au nikupatie pia?",
    "goal": "Kumsaidia kuchagua uzi sahihi na vifaa vya kushona."
  },
  {
    "group": "Vinywaji",
    "title": "Kinywaji: pendekeza kitafunwa",
    "situation": "Mteja amechukua maji, juisi au soda.",
    "how": "Pendekeza kitafunwa kinachoendana na kinywaji na ambacho kipo dukani. Taja bei wazi, na ukikataliwa endelea na mauzo kwa heshima.",
    "say": "Asante kwa kuchukua kinywaji. Je, ungependa pia biskuti au kitafunwa cha kuambatana nacho? Naweza kukuonyesha chaguo na bei zake.",
    "goal": "Kuongeza thamani ya ununuzi bila kumlazimisha mteja."
  },
  {
    "group": "Huduma kwa mteja",
    "title": "Kabla ya malipo: kumbusha mahitaji muhimu",
    "situation": "Mteja amemaliza kuchagua na yuko tayari kulipa.",
    "how": "Angalia bidhaa alizochukua. Uliza swali moja fupi kuhusu bidhaa inayotumika pamoja nazo; usimsomee orodha ndefu, hasa ikiwa wateja wengine wanasubiri.",
    "say": "Kabla hatujamaliza, umechukua mchele na maharage. Je, nyanya, vitunguu au mafuta unavyo vya kutosha nyumbani? Kama unavyo, sawa kabisa.",
    "goal": "Kumsaidia mteja asisahau kitu muhimu na kuongeza mauzo kwa heshima."
  },
  {
    "group": "Huduma kwa mteja",
    "title": "Mshukuru mteja na mkaribishe tena",
    "situation": "Mteja amemaliza kununua au ameondoka bila kupata bidhaa.",
    "how": "Hakiki bidhaa, malipo na chenji. Mshukuru bila kujali kiasi alichonunua. Ikiwa hakupata bidhaa, mkaribishe kuulizia tena bila kuahidi tarehe ambayo haijathibitishwa.",
    "say": "Asante sana kwa kututembelea na kutuamini. Karibu tena wakati wowote. Ukihitaji msaada wa kuchagua bidhaa tutafurahi kukuhudumia.",
    "goal": "Kujenga uaminifu na kuwafanya wateja warudi."
  }
];

function SalesCoachingTechniques({ sw = true }) {
  const [expanded, setExpanded] = React.useState(false);
  const [group, setGroup] = React.useState('all');
  const groups = ['all', ...new Set(SALES_COACHING_TECHNIQUES.map(item => item.group))];
  const matching = group === 'all' ? SALES_COACHING_TECHNIQUES : SALES_COACHING_TECHNIQUES.filter(item => item.group === group);
  const visible = expanded ? matching : matching.slice(0, 5);

  return <div className="mt-5 rounded-xl border border-blue-200 bg-white p-4 sm:p-5 text-slate-800">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h4 className="text-xl font-black text-[#07517e]">{sw ? 'Mbinu 20 za Kumhudumia Mteja na Kuongeza Mauzo' : '20 Practical Customer Service and Selling Techniques'}</h4>
        <p className="mt-1 text-base leading-7 text-slate-600">{sw ? 'Kila mbinu inaeleza hali ya mteja, hatua za kuchukua, maneno halisi na lengo lake. Mbinu 5 zinaonekana kwanza.' : 'Each technique explains the situation, practical steps, exact words and objective. Five appear first.'}</p>
      </div>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-base font-bold text-[#07517e]">20 {sw ? 'mbinu' : 'techniques'}</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {groups.map(g => <button key={g} type="button" onClick={() => { setGroup(g); setExpanded(false); }} className={`rounded-lg border px-4 py-2 text-base font-bold ${group === g ? 'border-[#07517e] bg-[#07517e] text-white' : 'border-blue-200 bg-white text-[#07517e]'}`}>{g === 'all' ? (sw ? 'Zote' : 'All') : g}</button>)}
    </div>
    <div className="mt-4 overflow-x-auto rounded-lg border border-blue-200">
      <table className="w-full min-w-[1080px] border-collapse text-left text-base leading-7">
        <thead className="bg-[#07517e] text-white">
          <tr>
            <th className="w-[19%] border-r border-blue-400 px-4 py-3 font-bold">{sw ? 'Kundi / Mbinu' : 'Category / Technique'}</th>
            <th className="w-[18%] border-r border-blue-400 px-4 py-3 font-bold">{sw ? 'Hali ya mteja' : 'Customer situation'}</th>
            <th className="w-[25%] border-r border-blue-400 px-4 py-3 font-bold">{sw ? 'Namna ya kufanya' : 'What to do'}</th>
            <th className="w-[26%] border-r border-blue-400 px-4 py-3 font-bold">{sw ? 'Mwambie mteja' : 'Say to the customer'}</th>
            <th className="w-[12%] px-4 py-3 font-bold">{sw ? 'Lengo' : 'Objective'}</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((item, index) => <tr key={item.title} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-t border-blue-100 align-top`}>
            <td className="border-r border-blue-100 px-4 py-4"><span className="block text-sm font-bold text-[#07517e]">{item.group}</span><strong className="mt-1 block text-base font-bold text-slate-950">{item.title}</strong></td>
            <td className="border-r border-blue-100 px-4 py-4 text-slate-800">{item.situation}</td>
            <td className="border-r border-blue-100 px-4 py-4 text-slate-800">{item.how}</td>
            <td className="border-r border-blue-100 px-4 py-4 font-medium text-slate-950">“{item.say}”</td>
            <td className="px-4 py-4 text-slate-800">{item.goal}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {matching.length > 5 && <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="mt-4 w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-center text-base font-black text-[#07517e]">{expanded ? (sw ? 'Ficha mbinu za ziada ▲' : 'Hide additional techniques ▲') : (sw ? `Onyesha mbinu nyingine ${matching.length - 5} ▼` : `Show ${matching.length - 5} more techniques ▼`)}</button>}
    <p className="mt-3 text-base leading-7 text-slate-600">{sw ? 'Pendekeza bidhaa zilizopo dukani pekee. Hakiki sifa za bidhaa kabla ya kuzitaja; mheshimu mteja na usitoe ahadi zisizothibitishwa.' : 'Recommend available products only, verify claims, respect customers and avoid unsupported promises.'}</p>
  </div>;
}

// STEP 1: Business performance comparison.
// Keep OwnerSummaryPanel untouched; use confirmed POS sales and explicit comparable dates.
function BusinessPerformanceComparison({ data, shopFilter, language, historicalDaily = [], historicalReady = false }) {
  const sw = language !== 'en';
  const [mode, setMode] = React.useState('weekday');
  const [showDays, setShowDays] = React.useState(7);
  const today = startOfDay(new Date());
  const todayKey = toISO(today);
  const shops = Array.isArray(data?.shops) ? data.shops : [];
  const sales = Array.isArray(data?.sales) ? data.sales : [];
  const products = Array.isArray(data?.products) ? data.products : [];

  // Read-only fallback: the POS already saves this reporting summary in IndexedDB.
  // It is NOT inserted into operational sales or the cashier Journal.
  const [cachedHistory, setCachedHistory] = React.useState(null);
  React.useEffect(() => {
    let active = true;
    if (typeof indexedDB === 'undefined') return undefined;
    try {
      const request = indexedDB.open('rafikiai_pos_db');
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('pos_data')) { db.close(); return; }
        const tx = db.transaction('pos_data', 'readonly');
        const get = tx.objectStore('pos_data').get('ceo_daily_sales_summary_v1');
        get.onsuccess = () => {
          const result = get.result;
          // Support both direct and wrapped IndexedDB values.
          const candidate = Array.isArray(result?.rows) ? result
            : Array.isArray(result?.value?.rows) ? result.value : null;
          if (active && candidate) setCachedHistory(candidate.rows);
        };
        get.onerror = () => console.warn('CEO history cache read failed:', get.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => db.close();
      };
      request.onerror = () => console.warn('CEO history database unavailable:', request.error);
    } catch (error) {
      console.warn('CEO history cache unavailable:', error);
    }
    return () => { active = false; };
  }, []);
  const effectiveHistoricalDaily = historicalReady && Array.isArray(historicalDaily) && historicalDaily.length
    ? historicalDaily : (cachedHistory || (Array.isArray(historicalDaily) ? historicalDaily : []));
  const effectiveHistoricalReady = effectiveHistoricalDaily.length > 0;

  const [openPanel, setOpenPanel] = React.useState(null);
  const [openShop, setOpenShop] = React.useState(null);
  const [openFinding, setOpenFinding] = React.useState(null);
  const togglePanel = (id) => { setOpenPanel(current => current === id ? null : id); setOpenShop(null); setOpenFinding(null); };
  const selectedShops = shops.filter((s) => shopFilter === 'all' || String(s.id) === String(shopFilter));
  const shopIds = new Set(selectedShops.map((s) => String(s.id)));
  const weekdaySw = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  const weekdayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = sw ? weekdaySw : weekdayEn;
  const fromKey = (key) => new Date(`${key}T12:00:00`);
  const dateLabel = (key) => fromKey(key).toLocaleDateString(sw ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const shortDate = (key) => fromKey(key).toLocaleDateString(sw ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'short' });
  const cash = (n) => `TZS ${money(n)}`;
  const signedMoney = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${cash(Math.abs(n))}`;
  const percentage = (a, b) => {
    const current = Number(a);
    const previous = Number(b);

    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return null;
    }

    if (previous === 0) {
      return null;
    }

    return ((current - previous) / Math.abs(previous)) * 100;
  };
  const signedPercent = (n) => n === null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1)}%`;
  const tone = (n) => n < 0 ? 'text-rose-700' : n > 0 ? 'text-emerald-700' : 'text-slate-700';

  const salesByDay = React.useMemo(() => {
    const map = new Map();
    sales.forEach((sale) => {
      if (!shopIds.has(String(sale?.shop_id || sale?.shopId || ''))) return;
      // Exclude explicitly unconfirmed/failed records. Existing confirmed records may have no status.
      if (sale?.confirmed === false || sale?.synced === false ||
          ['pending', 'failed', 'cancelled', 'canceled', 'void', 'rejected', 'draft']
            .includes(String(sale?.status || sale?.sync_status || '').toLowerCase())) return;
      const key = getDateValue(sale);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || key > todayKey) return;
      const amount = Number(sale?.total);
      if (!Number.isFinite(amount) || amount < 0) return;
      const row = map.get(key) || { sales: 0, count: 0, items: new Map(), shops: new Map() };
      const sid = String(sale?.shop_id || sale?.shopId || '');
      const shopRow = row.shops.get(sid) || { sales: 0, items: new Map() };
      shopRow.sales += amount;
      row.sales += amount;
      row.count += 1;
      getSaleItems(sale).forEach((item) => {
        const name = getItemName(item);
        const qty = getItemQty(item);
        const value = getItemSales(item);
        if (!name || !Number.isFinite(value) || value < 0) return;
        const keyName = name.trim().toLocaleLowerCase();
        const existing = row.items.get(keyName) || { name, qty: 0, value: 0 };
        existing.qty += qty;
        existing.value += value;
        row.items.set(keyName, existing);
        const shopItem = shopRow.items.get(keyName) || { name, qty: 0, value: 0 };
        shopItem.qty += qty; shopItem.value += value;
        shopRow.items.set(keyName, shopItem);
      });
      row.shops.set(sid, shopRow);
      map.set(key, row);
    });
    // Historical summaries come from a read-only Supabase aggregation.
    // They are kept outside the operational POS sales array.
    if (effectiveHistoricalReady) {
      const historicalByDate = new Map();
      effectiveHistoricalDaily.forEach((item) => {
        const date = String(item?.sale_date || '').slice(0, 10);
        const sid = String(item?.shop_id || '');
        if (!shopIds.has(sid) || !date || date > todayKey) return;
        const shopMap = historicalByDate.get(date) || new Map();
        shopMap.set(sid, {
          sales: Number(item.sales_total || 0),
          count: Number(item.transaction_count || 0),
        });
        historicalByDate.set(date, shopMap);
      });
      historicalByDate.forEach((shopMap, date) => {
        const row = map.get(date) || {
          sales: 0, count: 0, items: new Map(), shops: new Map()
        };
        // Authoritative day/shop totals; preserve any loaded item breakdown.
        shopMap.forEach((value, sid) => {
          const previous = row.shops.get(sid) || { sales: 0, items: new Map() };
          row.shops.set(sid, { ...previous, sales: value.sales });
        });
        row.sales = [...row.shops.values()].reduce((n, sh) => n + sh.sales, 0);
        row.count = [...shopMap.values()].reduce((n, sh) => n + sh.count, 0);
        map.set(date, row);
      });
    }
    return map;
  }, [sales, shopFilter, data?.shops, todayKey, effectiveHistoricalDaily, effectiveHistoricalReady]);

  const summarize = React.useCallback((start, end) => {
    let amount = 0, recordedDays = 0, transactions = 0;
    const items = new Map();
    const shopTotals = new Map();
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const row = salesByDay.get(toISO(d));
      if (!row) continue;
      amount += row.sales;
      recordedDays++;
      transactions += row.count;
      row.shops.forEach((shopRow, sid) => {
        const old = shopTotals.get(sid) || { sales: 0, items: new Map() };
        old.sales += shopRow.sales;
        shopRow.items.forEach((item, key) => {
          const prior = old.items.get(key) || { name: item.name, qty: 0, value: 0 };
          prior.qty += item.qty; prior.value += item.value; old.items.set(key, prior);
        });
        shopTotals.set(sid, old);
      });
      row.items.forEach((item, key) => {
        const previous = items.get(key) || { name: item.name, qty: 0, value: 0 };
        previous.qty += item.qty;
        previous.value += item.value;
        items.set(key, previous);
      });
    }
    return { sales: amount, recordedDays, transactions, items, shops: shopTotals };
  }, [salesByDay]);

  const dailyRows = React.useMemo(() =>
    Array.from({ length: showDays }, (_, i) => {
      const date = addDays(today, i - showDays + 1);
      const compareDate = addDays(date, mode === 'day' ? -1 : -7);
      const key = toISO(date), previousKey = toISO(compareDate);
      return {
        key, previousKey, currentStart: key, currentEnd: key,
        previousStart: previousKey, previousEnd: previousKey,
        label: weekday[date.getDay()], current: salesByDay.get(key) || null,
        previous: salesByDay.get(previousKey) || null,
        days: 1, partial: key === todayKey
      };
    }).reverse(), [salesByDay, showDays, mode, todayKey, sw]);

  const weeklyRows = React.useMemo(() => {
    const monday = startOfWeek(today);
    const elapsed = Math.round((today.getTime() - monday.getTime()) / 86400000) + 1;
    return Array.from({ length: 5 }, (_, i) => {
      const offset = 4 - i;
      const start = addDays(monday, -offset * 7);
      const end = addDays(start, offset === 0 ? elapsed - 1 : 6);
      const prevStart = addDays(start, -7);
      const prevEnd = addDays(prevStart, offset === 0 ? elapsed - 1 : 6);
      return {
        key: toISO(start), currentStart: toISO(start), currentEnd: toISO(end),
        previousStart: toISO(prevStart), previousEnd: toISO(prevEnd),
        label: `${shortDate(toISO(start))}–${shortDate(toISO(end))}`,
        current: summarize(start, end), previous: summarize(prevStart, prevEnd),
        days: offset === 0 ? elapsed : 7, partial: offset === 0
      };
    }).reverse();
  }, [summarize, todayKey, sw]);

  const earliestRecordedMonth = React.useMemo(() => {
    const keys = [...salesByDay.keys()].filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
    return keys.length ? keys[0].slice(0, 7) : null;
  }, [salesByDay]);
  const monthlyRows = React.useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const offset = 11 - i;

    const start = new Date(
      today.getFullYear(),
      today.getMonth() - offset,
      1
    );

    const prevStart = new Date(
      start.getFullYear(),
      start.getMonth() - 1,
      1
    );

    const monthDays = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0
    ).getDate();

    const prevDays = new Date(
      prevStart.getFullYear(),
      prevStart.getMonth() + 1,
      0
    ).getDate();

    const isCurrentMonth = offset === 0;

    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      isCurrentMonth ? today.getDate() : monthDays
    );

    const prevEnd = new Date(
      prevStart.getFullYear(),
      prevStart.getMonth(),
      isCurrentMonth
        ? Math.min(today.getDate(), prevDays)
        : prevDays
    );

    return {
      key: toISO(start),
      currentStart: toISO(start),
      currentEnd: toISO(end),
      previousStart: toISO(prevStart),
      previousEnd: toISO(prevEnd),

      label: start.toLocaleDateString(
        sw ? 'sw-TZ' : 'en-GB',
        { month: 'long', year: 'numeric' }
      ),

      current: summarize(start, end),
      previous: summarize(prevStart, prevEnd),

      days: isCurrentMonth ? today.getDate() : monthDays,
      partial: isCurrentMonth
    };
  }).reverse().filter(r => !earliestRecordedMonth || r.key.slice(0, 7) >= earliestRecordedMonth), [summarize, todayKey, sw, earliestRecordedMonth]);

  const rows = mode === 'week'
    ? weeklyRows
    : mode === 'month'
      ? monthlyRows
      : dailyRows;

  const isDaily = mode === 'weekday' || mode === 'day';

  // Daily rows use `count`; summarized week/month rows use `transactions`.
  // A missing current-day record represents zero sales, not a missing comparison.
  const comparable = (r) => Boolean(
    Number(r.current?.sales || 0) > 0 ||
    Number(r.previous?.sales || 0) > 0 ||
    Number(r.current?.count || r.current?.transactions || 0) > 0 ||
    Number(r.previous?.count || r.previous?.transactions || 0) > 0
  );

  // Keep completed comparisons for detailed findings.
  const completeRows = rows.filter((r) =>
    comparable(r) &&
    !(isDaily && r.key === todayKey)
  );

  // The three summary cards describe the selected comparison,
  // including today even when its sales are zero.
  const summaryRows = isDaily
    ? rows.filter((r) => r.key === todayKey)
    : rows.filter((r) => r.partial);

  const selectedSummaryRows = summaryRows.length
    ? summaryRows
    : rows.slice(0, 1);

  const sumCurrent = selectedSummaryRows.reduce(
    (sum, r) => sum + Number(r.current?.sales || 0),
    0
  );

  const sumPrevious = selectedSummaryRows.reduce(
    (sum, r) => sum + Number(r.previous?.sales || 0),
    0
  );

  const totalDiff = sumCurrent - sumPrevious;
  const totalPct = percentage(sumCurrent, sumPrevious);

  const summaryPeriod = selectedSummaryRows[0];

  const summaryCurrentLabel = !summaryPeriod
    ? (sw ? 'Mauzo ya sasa' : 'Current sales')
    : isDaily
      ? `${sw ? 'Mauzo' : 'Sales'}: ${weekday[fromKey(summaryPeriod.currentStart).getDay()]} ${dateLabel(summaryPeriod.currentStart)}`
      : mode === 'week'
        ? `${sw ? 'Wiki hii' : 'This week'}: ${shortDate(summaryPeriod.currentStart)} – ${shortDate(summaryPeriod.currentEnd)}`
        : `${sw ? 'Mwezi huu' : 'This month'}: ${shortDate(summaryPeriod.currentStart)} – ${shortDate(summaryPeriod.currentEnd)}`;

  const summaryPreviousLabel = !summaryPeriod
    ? (sw ? 'Mauzo ya kipindi kilichopita' : 'Previous period sales')
    : isDaily
      ? `${sw ? 'Mauzo' : 'Sales'}: ${weekday[fromKey(summaryPeriod.previousStart).getDay()]} ${dateLabel(summaryPeriod.previousStart)}`
      : mode === 'week'
        ? `${sw ? 'Wiki iliyopita' : 'Previous week'}: ${shortDate(summaryPeriod.previousStart)} – ${shortDate(summaryPeriod.previousEnd)}`
        : `${sw ? 'Mwezi uliopita' : 'Previous month'}: ${shortDate(summaryPeriod.previousStart)} – ${shortDate(summaryPeriod.previousEnd)}`;
  const maxSales = Math.max(1, ...rows.flatMap((r) => [r.current?.sales || 0, r.previous?.sales || 0]));
  const previousHeading = mode === 'day' ? (sw ? 'Siku iliyotangulia' : 'Previous day')
    : mode === 'week' ? (sw ? 'Wiki iliyotangulia' : 'Previous week')
    : mode === 'month' ? (sw ? 'Mwezi uliotangulia' : 'Previous month')
    : (sw ? 'Siku sawa wiki iliyopita' : 'Same day last week');

  const describeRow = (r) => {
    const diff = r.current.sales - r.previous.sales;
    const pctValue = percentage(r.current.sales, r.previous.sales);
    const label = isDaily ? `${r.label} tarehe ${dateLabel(r.key)}` :
      mode === 'week' ? `wiki ya ${dateLabel(r.currentStart)} hadi ${dateLabel(r.currentEnd)}` :
      `${r.label} (tarehe ${dateLabel(r.currentStart)} hadi ${dateLabel(r.currentEnd)})`;
    const previousLabel = isDaily ? `${weekday[fromKey(r.previousStart).getDay()]} tarehe ${dateLabel(r.previousStart)}` :
      `${dateLabel(r.previousStart)} hadi ${dateLabel(r.previousEnd)}`;
    return { label, previousLabel, diff, pctValue };
  };

  // Every comparable date is available, in the same order as the main comparison table.
  const keyRows = completeRows;

  const productDifferences = (r) => {
    const currentItems = r.current?.items;
    const previousItems = r.previous?.items;
    if (!currentItems || !previousItems || !currentItems.size && !previousItems.size) return [];
    const names = new Set([...currentItems.keys(), ...previousItems.keys()]);
    return [...names].map((key) => {
      const now = currentItems.get(key), before = previousItems.get(key);
      return { name: now?.name || before?.name || key, now: now?.value || 0,
        before: before?.value || 0, nowQty: now?.qty || 0, beforeQty: before?.qty || 0,
        difference: (now?.value || 0) - (before?.value || 0) };
    }).filter((item) => item.difference !== 0)
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)).slice(0, 3);
  };

  // Stock is a CURRENT snapshot. Historical stockouts require dated movement/stock evidence.
  const productRowsByShop = React.useMemo(() => {
    const index = new Map();
    products.filter(p => !p?.archived).forEach(p => {
      const sid = String(p?.shop_id || p?.shopId || '');
      const key = `${sid}::${getProductName(p).trim().toLowerCase()}`;
      index.set(key, [...(index.get(key) || []), p]);
    });
    return index;
  }, [products]);

  const inventoryByShop = React.useMemo(() => {
    const index = new Map();
    products.filter(p => !p?.archived).forEach(p => {
      const sid = String(p?.shop_id || p?.shopId || '');
      const name = getProductName(p).trim().toLowerCase();
      const key = `${sid}::${name}`;
      const previous = index.get(key) || { stock: 0, rows: 0, expiry: [] };
      previous.stock += getProductStock(p);
      previous.rows++;
      const expiry = p?.expiryDate || p?.expirydate;
      if (expiry) previous.expiry.push(String(expiry).slice(0, 10));
      index.set(key, previous);
    });
    return index;
  }, [products]);

  const shopBreakdown = (r) => selectedShops.map(shop => {
    const sid = String(shop.id);
    const now = r.current?.shops?.get(sid);
    const before = r.previous?.shops?.get(sid);
    const current = now?.sales || 0;
    const previous = before?.sales || 0;
    return { sid, name: shop.name, current, previous, diff: current - previous,
      nowItems: now?.items || new Map(), beforeItems: before?.items || new Map(),
      hasCurrent: !!now, hasPrevious: !!before };
  }).sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));

  const productBreakdown = (shop) => [...new Set([...shop.nowItems.keys(), ...shop.beforeItems.keys()])]
    .map(key => {
      const now = shop.nowItems.get(key), before = shop.beforeItems.get(key);
      const inventory = inventoryByShop.get(`${shop.sid}::${key}`);
      const last30 = Array.from({ length: 30 }, (_, i) => toISO(addDays(today, -i)))
        .reduce((sum, date) => sum + (salesByDay.get(date)?.shops?.get(shop.sid)?.items?.get(key)?.qty || 0), 0);
      const last7 = Array.from({ length: 7 }, (_, i) => toISO(addDays(today, -i)))
        .reduce((sum, date) => sum + (salesByDay.get(date)?.shops?.get(shop.sid)?.items?.get(key)?.qty || 0), 0);
      const current = now?.value || 0, previous = before?.value || 0;
      return { key, name: now?.name || before?.name || key, current, previous,
        diff: current - previous, currentQty: now?.qty || 0, previousQty: before?.qty || 0,
        stock: inventory?.stock ?? null, expiry: inventory?.expiry?.sort()[0] || '',
        last7, last30, duplicateRows: (inventory?.rows || 0) > 1 };
    }).filter(p => p.diff !== 0).sort((x,y) => Math.abs(y.diff) - Math.abs(x.diff));

  const shopDetails = (r) => <div className="mt-4 space-y-4">
    <p className="text-base font-black text-slate-900">{sw ? 'Maduka yaliyosababisha tofauti ya mauzo' : 'Shop contribution to the sales change'}</p>
    {openShop && openShop.startsWith(`${r.key}:`) && <button type="button" onClick={() => setOpenShop(null)} className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-base font-bold text-[#07517e]">{sw ? '← Rudi kwenye maduka yote' : '← Back to all shops'}</button>}
    {shopBreakdown(r).filter(shop => !openShop || openShop === `${r.key}:${shop.sid}`).map(shop => <div key={shop.sid} className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xl font-black text-slate-950">{shop.name}</p>
          <p className="text-base text-slate-700">{cash(shop.previous)} → {cash(shop.current)}</p></div>
        <div className="text-right"><p className={`text-xl font-black ${tone(shop.diff)}`}>{signedMoney(shop.diff)}</p>
          <p className={`text-base font-bold ${tone(shop.diff)}`}>{signedPercent(percentage(shop.current, shop.previous))}</p></div>
        <button type="button" className="rounded-xl bg-emerald-700 px-4 py-2 text-base font-bold text-white"
          onClick={() => setOpenShop(current => current === `${r.key}:${shop.sid}` ? null : `${r.key}:${shop.sid}`)}>
          {openShop === `${r.key}:${shop.sid}` ? (sw ? 'Ficha uchunguzi' : 'Hide investigation') : (sw ? 'Chunguza bidhaa na stock' : 'Investigate products and stock')}
        </button>
      </div>
      {openShop === `${r.key}:${shop.sid}` && <div className="mt-4">
        {!shop.hasCurrent || !shop.hasPrevious ? <p className="mb-3 text-base font-semibold text-amber-800">{sw ? 'Hakuna rekodi za mauzo za duka hili katika upande mmoja wa ulinganisho; sifuri haijathibitishwa.' : 'Sales records are absent on one side; zero sales are not verified.'}</p> : null}
        <div className="overflow-x-auto"><table className="w-full min-w-[940px] border-collapse text-[16px] leading-6">
          <thead className="bg-[#07517e] text-white"><tr>
            <th className="border-r border-blue-400/40 px-4 py-4 text-left font-bold">{sw ? 'Bidhaa' : 'Product'}</th>
            <th className="border-r border-blue-400/40 px-4 py-4 text-right font-bold">{sw ? 'Mauzo zamani → sasa' : 'Sales before → now'}</th>
            <th className="border-r border-blue-400/40 px-4 py-4 text-right font-bold">{sw ? 'Tofauti' : 'Change'}</th>
            <th className="border-r border-blue-400/40 px-4 py-4 text-right font-bold">{sw ? 'Ziliuzwa siku 7 / 30' : 'Units sold 7d / 30d'}</th>
            <th className="border-r border-blue-400/40 px-4 py-4 text-right font-bold">{sw ? 'Stock ya sasa' : 'Current stock'}</th>
            <th className="border-r border-blue-400/40 px-4 py-4 text-left font-bold">{sw ? 'Tathmini' : 'Assessment'}</th>
          </tr></thead><tbody className="divide-y divide-blue-100 [&>tr:nth-child(odd)]:bg-[#eaf5fc] [&>tr:nth-child(even)]:bg-white">
          {productBreakdown(shop).slice(0, 12).map(p => <tr key={p.key}>
            <td className="px-4 py-4 font-bold">{p.name}<div className="text-base font-normal text-slate-600">{sw ? 'Idadi kipindi' : 'Period units'}: {qtyText(p.previousQty)} → {qtyText(p.currentQty)}</div></td>
            <td className="border-r border-blue-400/40 px-4 py-4 text-right font-bold">{cash(p.previous)} → {cash(p.current)}</td>
            <td className={`p-3 text-right font-bold ${tone(p.diff)}`}>{signedMoney(p.diff)}</td>
            <td className="border-r border-blue-400/40 px-4 py-4 text-right font-bold">{qtyText(p.last7)} / {qtyText(p.last30)}</td>
            <td className="px-4 py-4 text-right font-bold">{p.stock === null ? '—' : qtyText(p.stock)}</td>
            <td className="px-4 py-4 text-left text-[16px] leading-7">{(() => {
              const change = percentage(p.current, p.previous);
              const monthName = (date) => new Intl.DateTimeFormat(sw ? 'sw-TZ' : 'en-GB', { month: 'long' }).format(fromKey(date));
             const previousMonth = monthName(r.previousStart);
const currentMonth = monthName(r.currentStart);

const comparisonIsHistorical = r.currentEnd < todayKey;

const salesVerb = p.diff < 0
  ? (comparisonIsHistorical ? 'yalipungua' : 'yamepungua')
  : p.diff > 0
    ? (comparisonIsHistorical ? 'yaliongezeka' : 'yameongezeka')
    : (comparisonIsHistorical ? 'hayakubadilika' : 'hayajabadilika');

const quantityVerb = p.currentQty < p.previousQty
  ? (comparisonIsHistorical ? 'ilipungua' : 'imepungua')
  : p.currentQty > p.previousQty
    ? (comparisonIsHistorical ? 'iliongezeka' : 'imeongezeka')
    : (comparisonIsHistorical ? 'haikubadilika' : 'haijabadilika');

const recentDaily = Number(p.last7 || 0) / 7;
              const averageDaily = Number(p.last30 || 0) / 30;
              // TATHMINI ONLY: product-specific, evidence-based action.
              // The "Tufanye nini?" recommendation engine is unchanged.

              const productName = String(p.name || '').trim();

              const normalizeProductName = (value) =>
                String(value || '')
                  .toLocaleLowerCase()
                  .replace(/\bya\b/g, ' ')
                  .replace(/[^\p{L}\p{N}]+/gu, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

              const canonicalName = normalizeProductName(productName);

              const possibleDuplicate = productBreakdown(shop).find(
                (other) =>
                  other.key !== p.key &&
                  normalizeProductName(other.name) === canonicalName &&
                  String(other.name).toLocaleLowerCase() !==
                    productName.toLocaleLowerCase()
              );

              const stockAvailable =
                p.stock !== null &&
                Number.isFinite(Number(p.stock));

              const currentStock = stockAvailable
                ? Math.max(0, Number(p.stock))
                : null;

              const recentUnits = Math.max(0, Number(p.last7 || 0));
              const monthlyUnits = Math.max(0, Number(p.last30 || 0));

              const recentRate = recentUnits / 7;
              const averageRate = monthlyUnits / 30;

              const stockDays =
                currentStock !== null && recentRate > 0
                  ? currentStock / recentRate
                  : null;

              const isDeclining = p.diff < 0;
              const isGrowing = p.diff > 0;

              const monthlyChange =
                p.previous > 0
                  ? ((p.current - p.previous) / p.previous) * 100
                  : null;

              const action = (() => {
                // 1. Expired stock takes priority.
                if (p.expiry && p.expiry < todayKey) {
                  return sw
                    ? `Tenganisha ${productName} yenye tarehe ya mwisho ${p.expiry}; hakiki kiasi kilichopo kabla ya kuendelea kuiuza.`
                    : `Separate ${productName} with recorded expiry ${p.expiry}; verify the affected quantity before further sales.`;
                }

                // 2. Possible duplicate product names.
                if (possibleDuplicate) {
                  return sw
                    ? `Kagua kama "${productName}" na "${possibleDuplicate.name}" ni bidhaa moja iliyorekodiwa kwa majina tofauti kabla ya kuhitimisha kwamba mauzo ${isDeclining ? 'yameshuka' : 'yameongezeka'}.`
                    : `Check whether "${productName}" and "${possibleDuplicate.name}" are the same product recorded under different names before interpreting the sales change.`;
                }

                // 3. Missing stock record.
                if (currentStock === null) {
                  return sw
                    ? `Hakiki stock ya ${productName} kwenye POS; bila kiasi sahihi, haiwezekani kufanya uamuzi wa kuongeza manunuzi.`
                    : `Verify ${productName} stock in POS before deciding on replenishment.`;
                }

                // 4. Product has recent demand but no stock.
                if (currentStock === 0 && recentUnits > 0) {
                  return sw
                    ? `${productName} imeisha stock huku ${qtyText(recentUnits)} zikiuzwa siku 7 zilizopita. Hakiki mzigo unaoingia na panga kujaza stock.`
                    : `${productName} is out of stock after ${qtyText(recentUnits)} units sold in seven days. Verify incoming supply and arrange replenishment.`;
                }

                // 5. Stock is likely to run out within 3 days.
                if (stockDays !== null && stockDays <= 3) {
                  return sw
                    ? `Stock ya ${productName} ni ${qtyText(currentStock)}, inayoweza kutosha siku ${stockDays.toFixed(1)} kwa kasi ya sasa. Hakiki upatikanaji wa mzigo kabla haijaisha.`
                    : `${productName} has ${qtyText(currentStock)} in stock, approximately ${stockDays.toFixed(1)} days at its recent sales rate. Check replenishment.`;
                }

                // 6. Sales declining and recent demand weakening.
                if (
                  isDeclining &&
                  recentRate < averageRate &&
                  averageRate > 0
                ) {
                  return sw
                    ? `Mauzo ya ${productName} yameshuka ${monthlyChange === null ? '' : `kwa ${Math.abs(monthlyChange).toFixed(1)}% `}na kasi ya siku 7 imepungua. Hakiki bei, upatikanaji na sababu za wateja kupunguza ununuzi kabla ya kuongeza stock.`
                    : `${productName} sales and recent demand have declined. Check price, availability and customer demand before buying more stock.`;
                }

                // 7. Sales declining, but recent demand recovering.
                if (
                  isDeclining &&
                  recentRate > averageRate &&
                  averageRate > 0
                ) {
                  return sw
                    ? `Mauzo ya ${productName} yalishuka mwezi huu, lakini kasi ya siku 7 inaanza kuimarika. Fuatilia mauzo ya wiki ijayo kabla ya kubadili kiwango cha manunuzi.`
                    : `${productName} monthly sales declined, but recent demand is improving. Monitor the next week before changing purchase quantities.`;
                }

                // 8. Sales declining without sufficient recent evidence.
                if (isDeclining) {
                  return sw
                    ? `Mauzo ya ${productName} yameshuka kutoka ${cash(p.previous)} hadi ${cash(p.current)}. Hakiki bei, stock na mahitaji ya bidhaa hii kabla ya kuagiza zaidi.`
                    : `${productName} sales fell from ${cash(p.previous)} to ${cash(p.current)}. Check price, stock and demand before reordering.`;
                }

                // 9. Sales growing but stock is relatively low.
                if (
                  isGrowing &&
                  stockDays !== null &&
                  stockDays <= 7
                ) {
                  return sw
                    ? `Mauzo ya ${productName} yameongezeka, lakini stock ya ${qtyText(currentStock)} inaweza kutosha siku ${stockDays.toFixed(1)} tu. Panga kuongeza stock kulingana na kasi halisi ya mauzo.`
                    : `${productName} sales increased, but current stock may last only ${stockDays.toFixed(1)} days. Replenish according to actual demand.`;
                }

                // 10. Growing sales with adequate stock.
                if (isGrowing && recentUnits > 0) {
                  return sw
                    ? `Mauzo ya ${productName} yameongezeka kutoka ${cash(p.previous)} hadi ${cash(p.current)}. Fuatilia kama ongezeko linaendelea kabla ya kuongeza kiasi cha manunuzi.`
                    : `${productName} sales increased from ${cash(p.previous)} to ${cash(p.current)}. Confirm sustained demand before increasing purchases.`;
                }

                // 11. No recent movement despite recorded stock.
                if (currentStock > 0 && recentUnits === 0) {
                  return sw
                    ? `${productName} ina stock ${qtyText(currentStock)} lakini hakuna mauzo ya siku 7 yaliyorekodiwa. Hakiki kama bidhaa inaonekana dukani na kama bei yake inakubalika.`
                    : `${productName} has ${qtyText(currentStock)} in stock but no recorded sales in seven days. Check display and price.`;
                }

                // 12. Stable or insufficient evidence.
                return sw
                  ? `Fuatilia mauzo ya ${productName} na stock ${qtyText(currentStock)} kabla ya kubadili kiwango cha manunuzi.`
                  : `Monitor ${productName} sales and stock ${qtyText(currentStock)} before changing purchase quantities.`;
              })();

              const plan = { action };
              const direction = recentDaily < averageDaily ? 'chini' : recentDaily > averageDaily ? 'juu' : 'sawa';
              return <div className="space-y-3">
                <div>
                  <div className="font-black text-[#07517e]">{sw ? 'Mauzo ya mwezi' : 'Monthly sales'}</div>
                  <div className={`text-xl font-black ${tone(p.diff)}`}>{signedPercent(change)}</div>
                  <p className="mt-1 text-slate-700">{sw
                    ? `Mauzo ${salesVerb} kutoka ${cash(p.previous)} ${previousMonth} hadi ${cash(p.current)} ${currentMonth}. Idadi ${quantityVerb} kutoka ${qtyText(p.previousQty)} hadi ${qtyText(p.currentQty)}.`
                    : `Sales changed from ${cash(p.previous)} in ${previousMonth} to ${cash(p.current)} in ${currentMonth}. Quantity changed from ${qtyText(p.previousQty)} to ${qtyText(p.currentQty)}.`}</p>
                </div>
                <div>
                  <div className="font-black text-[#07517e]">{sw ? 'Mwenendo wa sasa' : 'Recent trend'}</div>
                  <p className="mt-1 text-slate-700">{sw
                    ? `Kasi ya mauzo ya siku 7 zilizopita iko ${direction} ${direction === 'sawa' ? 'na' : 'ya'} wastani wa siku 30. Stock iliyorekodiwa sasa ni ${p.stock === null ? 'haijathibitishwa' : qtyText(p.stock)}.`
                    : `Sales pace over the last 7 days is ${direction === 'chini' ? 'below' : direction === 'juu' ? 'above' : 'equal to'} the 30-day average. Stock currently recorded is ${p.stock === null ? 'unverified' : qtyText(p.stock)}.`}</p>
                </div>
                <div>
                  <div className="font-black text-[#07517e]">{sw ? 'Hatua inayopendekezwa' : 'Recommended action'}</div>
                  <p className="mt-1 text-slate-800" title={plan.action} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{plan.action}</p>
                </div>
              </div>;
            })()}</td>
          </tr>)}
          </tbody></table></div>
        <p className="mt-3 text-base leading-6 text-slate-600">{sw
          ? 'Uchunguzi huu unaonyesha bidhaa zilizobadilisha mauzo, idadi iliyouzwa na stock ya sasa. Sababu ya kihistoria (stockout, bei, kufungwa duka au mahitaji) haijathibitishwa bila rekodi za stock kwa tarehe husika. Hatujaita tofauti ya mauzo kuwa mauzo yaliyopotea.'
          : 'Shows recorded product differences and current inventory. Historical stockouts, pricing and demand causes require dated evidence. Sales differences are not automatically lost sales.'}</p>
      </div>}
    </div>)}
  </div>;

  return (
    <section className="mt-5 rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-5 shadow-lg shadow-emerald-100/70"
      style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-emerald-950">{sw ? 'Biashara inaendeleaje?' : 'How is the business performing?'}</h3>
          <p className="mt-1 text-base leading-6 text-slate-600">{sw
            ? 'Linganisha siku zinazofanana, wiki na miezi kwa kutumia mauzo yaliyorekodiwa kwenye POS.'
            : 'Compare equivalent weekdays, weeks and months using recorded POS sales.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ['weekday', sw ? 'Siku sawa wiki iliyopita' : 'Same weekday last week'],
            ['day', sw ? 'Siku na siku' : 'Day to day'],
            ['week', sw ? 'Wiki na wiki' : 'Week to week'],
            ['month', sw ? 'Mwezi na mwezi' : 'Month to month']
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => { setMode(value); setOpenPanel(null); setOpenShop(null); setOpenFinding(null); }}
              className={`rounded-full px-4 py-2 text-base font-bold transition ${mode === value
                ? 'bg-emerald-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50'}`}>{label}</button>
          ))}
        </div>
      </div>

      {isDaily && <label className="mt-4 flex items-center gap-2 text-base font-semibold text-slate-700">
        {sw ? 'Onyesha siku' : 'Show days'}
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base"
          value={showDays} onChange={(e) => { setShowDays(Number(e.target.value)); setOpenPanel(null); setOpenShop(null); setOpenFinding(null); }}>
          <option value={7}>7</option><option value={14}>14</option><option value={28}>28</option>
        </select>
      </label>}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          {
            label: summaryCurrentLabel,
            value: cash(sumCurrent),
            note: sw ? 'Mauzo yaliyorekodiwa kwenye POS' : 'Recorded POS sales'
          },
          {
            label: summaryPreviousLabel,
            value: cash(sumPrevious),
            note: sw ? 'Kipindi cha kulinganisha' : 'Comparison period'
          },
          {
            label: sw ? 'Tofauti ya mauzo' : 'Sales difference',
            value: `${signedMoney(totalDiff)} | ${signedPercent(totalPct)}`,
            note: totalDiff > 0
              ? (sw ? 'Mauzo yameongezeka' : 'Sales increased')
              : totalDiff < 0
                ? (sw ? 'Mauzo yamepungua' : 'Sales decreased')
                : (sw ? 'Hakuna tofauti ya mauzo' : 'No sales difference')
          }
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-emerald-100 bg-white p-4"
          >
            <p className="text-base font-semibold text-slate-600">
              {card.label}
            </p>

            <p className={`mt-2 text-xl font-black ${
              i === 2 ? tone(totalDiff) : 'text-slate-950'
            }`}>
              {card.value}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {card.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-blue-200 bg-white shadow-sm">
        <table className="w-full min-w-[1260px] border-collapse text-left text-[16px] leading-6">
          <thead className="bg-[#07517e] text-white"><tr>
            <th className="border-r border-blue-300/30 px-4 py-4 font-bold">{sw ? 'Siku / kipindi na tarehe' : 'Day / period and dates'}</th>
            <th className="border-r border-blue-300/30 px-4 py-4 text-right font-bold">{sw ? 'Mauzo sasa' : 'Current sales'}</th>
            <th className="border-r border-blue-300/30 px-4 py-4 text-right font-bold">{previousHeading}</th>
            <th className="border-r border-blue-300/30 px-4 py-4 text-right font-bold">{sw ? 'Tofauti (TZS na %)' : 'Difference (TZS and %)'}</th>
            <th className="border-r border-blue-300/30 px-4 py-4 font-bold">{sw ? 'Grafu ya mauzo' : 'Sales bars'}</th>
            <th className="px-4 py-4 font-bold">{sw ? 'Maduka na Bidhaa zinazochangia' : 'Contributing shops and products'}</th>
          </tr></thead>
          <tbody className="divide-y divide-blue-100">
            {rows.map((r) => {
              const valid = comparable(r);
              const currentSales = Number(r.current?.sales ?? 0);
const previousSales = Number(r.previous?.sales ?? 0);

const diff = valid ? currentSales - previousSales : 0;
const percent = valid ? percentage(currentSales, previousSales) : null;
              const unfinished = isDaily && r.key === todayKey;
              return <React.Fragment key={r.key}><tr className={`align-middle whitespace-nowrap ${rows.indexOf(r) % 2 === 0 ? "bg-[#eaf5fc]" : "bg-white"}`}>
                <td className="border-r border-blue-200 px-4 py-4 font-bold text-slate-900">
                  {isDaily ? `${r.label} ${dateLabel(r.key)}` : r.label}
                  <span className="ml-2 text-sm font-normal text-slate-600">({shortDate(r.previousStart)} → {shortDate(r.currentStart)})</span>
                  {unfinished && <span className="ml-2 text-sm font-bold text-amber-700">{sw ? 'Leo inaendelea' : 'Today ongoing'}</span>}
                  {mode === 'month' && r.partial && (
                    <span className="ml-2 text-sm font-bold text-amber-700">
                      {sw
                        ? `Mwezi unaendelea: 1–${fromKey(r.currentEnd).getDate()}`
                        : `Month to date: 1–${fromKey(r.currentEnd).getDate()}`}
                    </span>
                  )}
                  {mode === 'week' && r.partial && (
                    <span className="ml-2 text-sm font-bold text-amber-700">
                      {sw ? 'Wiki inaendelea' : 'Week in progress'}
                    </span>
                  )}
                </td>
                <td className="border-r border-blue-200 px-4 py-4 text-right font-bold">{r.current ? cash(r.current.sales) : (isDaily && r.key === todayKey ? cash(0) : '—')}</td>
                <td className="border-r border-blue-300/30 px-4 py-4 text-right font-bold">{r.previous ? cash(r.previous.sales) : '—'}</td>
                <td className={`px-4 py-3 text-right font-bold ${valid ? tone(diff) : 'text-slate-500'}`}>
                  {valid ? <span className="inline-flex items-center gap-3 whitespace-nowrap"><span>{signedMoney(diff)}</span><span className="rounded-md bg-white/70 px-2 py-1 text-sm">{signedPercent(percent)}</span></span> : '—'}
                </td>
                <td className="min-w-[150px] px-4 py-4">
                  {valid ? <div className="space-y-2">
                    <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500"
                      style={{ width: `${Number(r.current?.sales || 0) / maxSales * 100}%` }} /></div>
                    <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-slate-400"
                      style={{ width: `${Number(r.previous?.sales || 0) / maxSales * 100}%` }} /></div>
                  </div> : <span className="text-base text-amber-700">
                    {sw
                      ? 'Hakuna mauzo yaliyorekodiwa katika vipindi vyote viwili'
                      : 'No recorded sales in either comparison period'}
                  </span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => togglePanel(`period:${r.key}`)}
                    aria-expanded={openPanel === `period:${r.key}`}
                    className="whitespace-nowrap rounded-lg bg-[#07517e] px-4 py-2 text-base font-bold text-white hover:bg-[#063b5b]">
                    {openPanel === `period:${r.key}` ? (sw ? 'Ficha uchunguzi ▲' : 'Close ▲') : (sw ? 'Angalia maduka na Bidhaa ▼' : 'View shops and products ▼')}
                  </button>
                </td>
              </tr>
              {openPanel === `period:${r.key}` && <tr className="bg-[#f1f8fd]"><td colSpan={6} className="px-5 py-5">{shopDetails(r)}</td></tr>}</React.Fragment>;
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button type="button" onClick={() => togglePanel('findings')} aria-expanded={openPanel === 'findings'}
          className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left text-lg font-black ${openPanel === 'findings' ? 'border-[#07517e] bg-[#07517e] text-white' : 'border-blue-200 bg-white text-[#07517e]'}`}>
          <span>{sw ? 'Mfumo umeona nini?' : 'What did the system find?'}</span><span>{openPanel === 'findings' ? '▲' : '▼'}</span>
        </button>
        <button type="button" onClick={() => togglePanel('solutions')} aria-expanded={openPanel === 'solutions'}
          className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left text-lg font-black ${openPanel === 'solutions' ? 'border-[#07517e] bg-[#07517e] text-white' : 'border-blue-200 bg-white text-[#07517e]'}`}>
          <span>{sw ? 'Tufanye nini?' : 'What should we do?'}</span><span>{openPanel === 'solutions' ? '▲' : '▼'}</span>
        </button>
      </div>
      {openPanel === 'findings' && (
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-5 text-base leading-7 text-slate-800">
        
        {!completeRows.length ? <p>{sw
          ? 'Bado hakuna siku au vipindi vilivyokamilika vyenye rekodi za mauzo pande zote mbili. Mfumo hauwezi kusema mauzo yameongezeka au kupungua bila taarifa hizo.'
          : 'No completed periods have matching sales records on both sides; no increase or decrease is inferred.'}</p> : <>
          <p className="font-semibold">{sw
            ? `Kwa siku/vipindi vilivyokamilika vinavyoonekana hapa, mauzo ni ${cash(sumCurrent)} dhidi ya ${cash(sumPrevious)} ya tarehe zinazolingana. Tofauti ni ${signedMoney(totalDiff)} (${signedPercent(totalPct)}).`
            : `Completed comparable periods: ${cash(sumCurrent)} versus ${cash(sumPrevious)}; change ${signedMoney(totalDiff)} (${signedPercent(totalPct)}).`}</p>
          <div className="mt-4 space-y-4">
            {openFinding !== null && <button type="button" onClick={() => setOpenFinding(null)}
              className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-base font-bold text-[#07517e]">
              {sw ? '← Rudi kwenye siku zote' : '← Back to all dates'}
            </button>}
            {keyRows.filter(r => openFinding === null || openFinding === r.key).map((r) => {
              const detail = describeRow(r);
              const changes = productDifferences(r);
              return <div key={r.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <button type="button" onClick={() => setOpenFinding(current => current === r.key ? null : r.key)}
                  aria-expanded={openFinding === r.key}
                  className="flex w-full items-center justify-between gap-4 rounded-lg bg-[#07517e] px-4 py-3 text-left text-base font-bold text-white">
                  <span>{isDaily ? `${r.label} ${dateLabel(r.key)}` : `${dateLabel(r.currentStart)} – ${dateLabel(r.currentEnd)}`}</span>
                  <span>{signedMoney(detail.diff)} ({signedPercent(detail.pctValue)}) {openFinding === r.key ? '▲' : '▼'}</span>
                </button>
                {openFinding === r.key && <div className="mt-4">
                <p className="font-bold text-slate-950">{sw
                  ? `${detail.diff > 0 ? 'Mauzo yameongezeka' : detail.diff < 0 ? 'Mauzo yamepungua' : 'Mauzo hayajabadilika'}: ${detail.label}`
                  : `Sales ${detail.diff > 0 ? 'increased' : detail.diff < 0 ? 'decreased' : 'unchanged'}: ${detail.label}`}</p>
                <p className="mt-1">{sw
                  ? `Mauzo yalikuwa ${cash(r.current.sales)}, ikilinganishwa na ${cash(r.previous.sales)} ya ${detail.previousLabel}. Tofauti ni ${signedMoney(detail.diff)} (${signedPercent(detail.pctValue)}).`
                  : `${cash(r.current.sales)} versus ${cash(r.previous.sales)} for ${detail.previousLabel}: ${signedMoney(detail.diff)} (${signedPercent(detail.pctValue)}).`}</p>

                {changes.length > 0 ? <div className="mt-3">
                  <p className="font-bold">{sw ? 'Bidhaa zenye tofauti kubwa kwenye mauzo yaliyorekodiwa:' : 'Largest recorded product sales changes:'}</p>
                  <div className="mt-2 overflow-x-auto rounded-lg border border-blue-200"><table className="w-full min-w-[550px] text-[16px]">
                    <thead><tr className="border-b border-blue-300 bg-[#07517e] text-white">
                      <th className="py-2 text-left">Bidhaa</th>
                      <th className="py-2 text-right">{sw ? 'Zamani' : 'Previous'}</th>
                      <th className="py-2 text-right">{sw ? 'Sasa' : 'Current'}</th>
                      <th className="py-2 text-right">{sw ? 'Tofauti' : 'Difference'}</th>
                    </tr></thead>
                    <tbody>{changes.map((item) => <tr key={item.name} className="border-b border-slate-100">
                      <td className="py-2 font-semibold">{item.name}<div className="text-base font-normal text-slate-500">
                        {sw ? 'Idadi' : 'Units'}: {qtyText(item.beforeQty)} → {qtyText(item.nowQty)}</div></td>
                      <td className="py-2 text-right">{cash(item.before)}</td>
                      <td className="py-2 text-right">{cash(item.now)}</td>
                      <td className={`py-2 text-right font-bold ${tone(item.difference)}`}>{signedMoney(item.difference)}</td>
                    </tr>)}</tbody>
                  </table></div>
                  <p className="mt-2 text-base text-slate-600">{sw
                    ? 'Hizi ni tofauti za mauzo ya Bidhaa, si uthibitisho kwamba bei, mahitaji au stock ndiyo sababu. Bidhaa zenye majina tofauti au mauzo yasiyo na maelezo kamili zinaweza kuhitaji uchunguzi zaidi.'
                    : 'Product sales differences are not proof of the underlying cause; missing or inconsistent item records may affect this analysis.'}</p>
                </div> : <p className="mt-2 text-base text-amber-700">{sw
                  ? 'Hakuna maelezo ya Bidhaa ya kutosha kuonyesha zilizochangia tofauti hii.'
                  : 'Insufficient product-level detail to attribute the difference.'}</p>}
                </div>}
              </div>;
            })}
          </div>
        </>}
      </div>
      )}
      {openPanel === 'solutions' && <div className="mt-3 rounded-xl border border-blue-200 bg-white p-5 text-base leading-7 text-slate-800">
        <h4 className="mb-4 text-xl font-black text-[#07517e]">{sw ? 'Hatua zinazopendekezwa kutokana na mauzo' : 'Recommended sales actions'}</h4>
        {!keyRows.length ? <p>{sw ? 'Hakuna tarehe zenye mauzo yaliyolinganishwa.' : 'No comparable recorded dates.'}</p> : (
          <div className="space-y-3">
            {openFinding !== null && <button type="button" onClick={() => setOpenFinding(null)}
              className="rounded-lg border border-blue-300 px-4 py-2 text-base font-bold text-[#07517e]">
              {sw ? '← Onyesha tarehe zote' : '← Show all dates'}
            </button>}
            {keyRows.filter(r => openFinding === null || openFinding === r.key).map(r => {
              const shopsForDay = shopBreakdown(r).filter(shop => shop.hasCurrent && shop.hasPrevious);
              const period = describeRow(r);
              return <div key={r.key} className="overflow-hidden rounded-xl border border-blue-200 bg-white">
                <button type="button" onClick={() => setOpenFinding(old => old === r.key ? null : r.key)}
                  aria-expanded={openFinding === r.key}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-base font-black ${openFinding === r.key ? 'bg-[#07517e] text-white' : 'bg-[#eaf5fc] text-[#07517e]'}`}>
                  <span>{isDaily ? `${r.label} ${dateLabel(r.key)}` : `${dateLabel(r.currentStart)} – ${dateLabel(r.currentEnd)}`}</span>
                  <span className="shrink-0">{signedMoney(period.diff)} · {signedPercent(period.pctValue)} {openFinding === r.key ? '▲' : '▼'}</span>
                </button>
                {openFinding === r.key && <div className="space-y-4 p-4">
                  {shopsForDay.map(shop => {
                    const candidates = productBreakdown(shop);
                    const falling = candidates.filter(p => p.diff < 0).sort((a,b) => a.diff-b.diff).slice(0,4);
                    const rising = candidates.filter(p => p.diff > 0).sort((a,b) => b.diff-a.diff).slice(0,2);
                    const actions = falling.length ? falling : rising;
                    return <div key={shop.sid} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-3">
                        <div className="text-lg font-black text-slate-950">{shop.name}</div>
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-black ${tone(shop.diff)}`}>{signedMoney(shop.diff)}</span>
                          <span className={`text-base font-bold ${tone(shop.diff)}`}>{signedPercent(percentage(shop.current,shop.previous))}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-base text-slate-700">{cash(shop.previous)} → {cash(shop.current)} · {period.previousLabel} → {period.label}</p>
                      {actions.length ? <div className="mt-3 overflow-x-auto rounded-lg border border-blue-200">
                        <table className="w-full min-w-[1050px] table-fixed border-collapse text-[16px] leading-7">
                          <colgroup><col style={{width:'17%'}}/><col style={{width:'13%'}}/><col style={{width:'11%'}}/><col style={{width:'11%'}}/><col style={{width:'48%'}}/></colgroup>
                          <thead className="bg-[#07517e] text-white"><tr>
                            <th className="px-3 py-3 text-left">{sw ? 'Bidhaa' : 'Product'}</th>
                            <th className="px-3 py-3 text-right">{sw ? 'Zamani → sasa' : 'Before → now'}</th>
                            <th className="px-3 py-3 text-right">{sw ? 'Tofauti TZS' : 'TZS change'}</th>
                            <th className="px-3 py-3 text-right">{sw ? 'Stock sasa' : 'Stock now'}</th>
                            <th className="px-3 py-3 text-left">{sw ? 'Hatua ya kuchukua' : 'Recommended action'}</th>
                          </tr></thead>
                          <tbody className="divide-y divide-blue-100 [&>tr:nth-child(odd)]:bg-[#eaf5fc] [&>tr:nth-child(even)]:bg-white">
                            {actions.map(p => {
                              const pctUnits = p.previousQty > 0 ? (p.currentQty - p.previousQty) / p.previousQty * 100 : null;
                              const plan = ceoProductSellingPlan({
                                name: p.name,
                                productRows: productRowsByShop.get(`${shop.sid}::${p.key}`) || [],
                                declining: p.diff < 0,
                                stock: p.stock,
                                previousQty: p.previousQty,
                                currentQty: p.currentQty,
                                last7: p.last7,
                                last30: p.last30,
                                expiry: p.expiry,
                                todayKey,
                                sw
                              });
                              const recommendation = plan.action;
                              const followup = plan.followup;
                              return <tr key={p.key}>
                                <td className="px-3 py-3 align-top font-bold text-slate-950">{p.name}<div className="font-normal text-slate-600">{sw ? 'Idadi' : 'Units'}: {qtyText(p.previousQty)} → {qtyText(p.currentQty)}</div></td>
                                <td className="px-3 py-3 text-right align-top">{cash(p.previous)} → {cash(p.current)}</td>
                                <td className={`px-3 py-3 text-right align-top font-black ${tone(p.diff)}`}>{signedMoney(p.diff)}<div className="text-base">{signedPercent(pctUnits)}</div></td>
                                <td className="px-3 py-3 text-right align-top font-bold">{p.stock === null ? '—' : qtyText(p.stock)}</td>
                                <td className="px-3 py-3 align-top"><p className="font-semibold text-slate-950">{recommendation}</p><p className="mt-2 text-slate-600"><strong>{sw ? 'Ufuatiliaji:' : 'Follow-up:'}</strong> {followup}</p></td>
                              </tr>;
                            })}
                          </tbody>
                        </table>
                      </div> : <p className="mt-3 text-base">{sw ? 'Hakuna tofauti ya bidhaa iliyoainishwa kwenye rekodi za mauzo za kipindi hiki.' : 'No product-level difference is recorded for this period.'}</p>}
                    </div>;
                  })}
                </div>}
              </div>;
            })}
          </div>
        )}
      </div>}
      <SalesCoachingTechniques sw={sw} />
      <p className="mt-3 text-base leading-6 text-slate-600">{sw
        ? 'Kumbuka: Kutokuwepo kwa mauzo kwenye rekodi si uthibitisho kuwa duka halikuuza. Inawezekana duka lilifungwa au mauzo hayajasawazishwa. Siku ya leo bado inaendelea. Sehemu hii inaonyesha mauzo pekee; Muhtasari wa Mmiliki na hesabu zake za Remittance hazijabadilishwa.'
        : 'Missing records do not prove zero sales; a shop may have been closed or data may be unsynced. Today is incomplete. This panel covers sales only; the Owner Summary and Remittance calculations remain unchanged.'}</p>
    </section>
  );
}

function OwnerSummaryPanel({ analytics, visibleRecommendations = [], language, salesTrend = 0, profitTrend = 0 }) {
  const sw = language !== 'en';
  const dailyTarget = analytics?.dailySalesTarget || {};
  const targetProgress = Math.min(100, Math.max(0, Number(dailyTarget.progress || 0)));

  const criticalAlerts = (visibleRecommendations || [])
    .filter((rec) => ['Critical', 'High'].includes(rec.priority))
    .slice(0, 3);

  const summaryRows = [
    {
      icon: '🛍️',
      label: sw ? 'Jumla ya Mauzo' : 'Total Sales',
      value: `TZS ${money(analytics.totalSales)}`,
      badge: `${salesTrend >= 0 ? '+' : ''}${Number(salesTrend || 0).toFixed(1)}%`,
    },
    {
      icon: '🟢',
      label: sw ? 'Faida Halisi' : 'Net Profit',
      value: `TZS ${money(analytics.netProfit)}`,
      badge: `${profitTrend >= 0 ? '+' : ''}${Number(profitTrend || 0).toFixed(1)}%`,
    },
    {
      icon: '💼',
      label: sw
        ? 'Faida ya Mmiliki'
        : 'Owner Profit',
      value: `TZS ${money(
        analytics.ownerProfit
      )}`,
      badge: '70%',
    },
    {
      icon: '🏪',
      label: sw
        ? 'Akiba ya Duka'
        : 'Shop Reserve',
      value: `TZS ${money(
        analytics.shopReserve
      )}`,
      badge: '30%',
    },
    {
      icon: '💵',
      label: sw
        ? 'Kiasi cha Kutoa'
        : 'Amount to Submit',
      value: `TZS ${money(
        analytics.amountToSubmit
      )}`,
      badge: sw ? 'Makusanyo' : 'Remittance',
    },
    {
      icon: '📊',
      label: sw ? 'Margin ya Faida' : 'Profit Margin',
      value: pct(profitMargin(analytics.netProfit, analytics.totalSales)),
      badge: sw ? 'Margin' : 'Margin',
    },
    {
      icon: '👤',
      label: sw ? 'Madeni ya Wateja' : 'Credit Outstanding',
      value: `TZS ${money(analytics.creditOutstanding)}`,
      badge: sw ? 'Angalia' : 'Watch',
    },
    {
      icon: '🔥',
      label: sw ? 'Faida ya Gesi' : 'Gas Profit',
      value: `TZS ${money(analytics.gasProfit)}`,
      badge: sw ? 'Gesi' : 'Gas',
    },
  ];

  return (
    <aside
      className="xl:sticky xl:top-4 self-start rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 shadow-lg shadow-emerald-100/70"
      style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold tracking-tight text-slate-950">
          {sw ? 'Muhtasari wa Mmiliki' : 'Owner Summary'}
        </h3>
      </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryRows.map((row) => (
          <div key={row.label} className="rounded-[22px] border border-emerald-50 bg-white/90 px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-base">
                {row.icon}
              </span>

              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                {row.badge}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-[11px] font-bold leading-4 text-slate-500">
              {row.label}
            </p>

            <p className="mt-1 break-words text-sm font-bold leading-tight text-slate-950">
              {row.value}
            </p>
          </div>
        ))}

        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-emerald-800">
            <span>{sw ? 'Lengo la Mauzo' : 'Sales Target'}</span>
            <span>{Number(dailyTarget.actualProgress ?? dailyTarget.progress ?? 0).toFixed(0)}%</span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
              style={{ width: `${targetProgress}%` }}
            />
          </div>

          <div className="mt-3 text-[11px] font-semibold leading-5 text-emerald-700">
            {sw ? (
              dailyTarget.exceeded > 0
                ? `Leo: TZS ${money(dailyTarget.todaySales || 0)} | Lengo: TZS ${money(dailyTarget.target || 0)} | Umezidi kwa TZS ${money(dailyTarget.exceeded || 0)}`
                : `Leo: TZS ${money(dailyTarget.todaySales || 0)} | Lengo: TZS ${money(dailyTarget.target || 0)} | Bado TZS ${money(dailyTarget.remaining || 0)}`
            ) : (
              dailyTarget.exceeded > 0
                ? `Today: TZS ${money(dailyTarget.todaySales || 0)} | Target: TZS ${money(dailyTarget.target || 0)} | Exceeded by TZS ${money(dailyTarget.exceeded || 0)}`
                : `Today: TZS ${money(dailyTarget.todaySales || 0)} | Target: TZS ${money(dailyTarget.target || 0)} | Remaining TZS ${money(dailyTarget.remaining || 0)}`
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900">
            {sw ? 'Tahadhari Muhimu' : 'Critical Alerts'}
          </h4>

          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-700">
            {criticalAlerts.length}
          </span>
        </div>

        <div className="space-y-2">
          {criticalAlerts.length ? (
            criticalAlerts.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800"
              >
                <div className="line-clamp-1">{rec.title}</div>
                <div className="mt-1 text-[11px] text-rose-600">
                  {rec.priority}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              {sw ? 'Hakuna tahadhari kubwa kwa sasa.' : 'No major alert for now.'}
            </div>
          )}
        </div>
      </div>
    </aside>
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

function CeoSidebar({ viewMode, setViewMode, language, isShopScope = false }) {
  const sw = language !== 'en';

  const navItems = [
    { id: 'summary', icon: '⌂', label: sw ? 'Muhtasari' : 'Summary' },
    { id: 'products', icon: '▣', label: sw ? 'Bidhaa' : 'Products' },
    { id: 'risk', icon: '⚠', label: sw ? 'Hatari' : 'Risks' },
    { id: 'opportunity', icon: '✦', label: sw ? 'Fursa' : 'Opportunities' },
    { id: 'action', icon: '☑', label: sw ? 'Hatua' : 'Actions' },
    { id: 'ai', icon: 'AI', label: sw ? 'AI Advisor' : 'AI Advisor' },
  ];

  return (
    <aside className="hidden min-h-[calc(100vh-2rem)] w-[250px] shrink-0 border-r border-slate-100 bg-white px-4 py-5 shadow-sm shadow-slate-200/70 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-2xl text-emerald-700 ring-1 ring-emerald-100">
          🛍
        </div>
        <div>
          <div className="text-xl font-black text-emerald-800">
            {isShopScope ? (sw ? 'Nyumbani Shop' : 'Nyumbani Shop') : (sw ? 'Nyumbani Multi Shop pos' : 'Nyumbani Multipos')}
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Smart Retail
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = viewMode === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewMode(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                active
                  ? 'bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-100 pt-5">
        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
            <span>●</span>
            <span>{sw ? 'Ushauri tu' : 'Advisory'}</span>
          </div>
          <div className="mt-3 text-xs font-medium leading-5 text-emerald-700">
            {sw
              ? 'Dashboard hii ni kwa uchambuzi na hatua za kufuatilia. Haibadilishi mauzo wala stock.'
              : 'This dashboard is for analysis and follow-up actions. It does not change sales or stock.'}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SelectControl({ label, value, onChange, children, darkLabel = false }) {
  return (
    <label className="block">
      <span className={`mb-1 block text-xs font-black uppercase tracking-wide ${darkLabel ? "text-[#f3d295]" : "text-slate-500"}`}>{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-[#b88b45]/60 bg-[#102542] px-3 py-2 text-sm font-bold text-[#f3d295] shadow-sm outline-none transition focus:border-[#f3d295] focus:ring-2 focus:ring-[#b88b45]/30 [&>option]:bg-[#102542] [&>option]:text-[#f3d295]"
      >
        {children}
      </select>
    </label>
  );
}

function DropdownPanel({ title, subtitle, badge, children, defaultOpen = false, tone = 'slate' }) {
  const toneMap = {
    slate: 'from-white to-slate-50',
    blue: 'from-white to-blue-50',
    emerald: 'from-white to-emerald-50',
    amber: 'from-white to-amber-50',
    rose: 'from-white to-rose-50',
    violet: 'from-white to-violet-50',
  };

  return (
    <details open={defaultOpen} className={`group overflow-hidden rounded-[26px] border border-slate-100 bg-gradient-to-br ${toneMap[tone] || toneMap.slate} shadow-sm shadow-slate-200/70`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black text-slate-950">{title}</h3>
            {badge ? <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100">{badge}</span> : null}
          </div>
          {subtitle ? <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-100 transition group-open:rotate-180">⌄</div>
      </summary>
      <div className="border-t border-slate-100 bg-white/55 p-5 pt-4">{children}</div>
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

function RecommendationCard({
  rec,
  actionRecord,
  onDecision,
  language,
}) {
  const sw = language !== 'en';

  const priority = String(
    rec.priority || ''
  ).toLowerCase();

  const isCritical =
    priority === 'critical' ||
    priority === 'urgent';

  const typeLabel =
    sw && rec.type === 'REORDER NEEDED'
      ? 'STOCK INAHITAJI KUAGIZWA'
      : rec.type;

  const priorityLabel = sw
    ? isCritical
      ? 'Hatua Inahitajika Leo'
      : 'Inahitaji Uangalizi'
    : isCritical
      ? 'Action Required Today'
      : 'Needs Attention';

  return (
    <div
      className={`overflow-hidden rounded-3xl border shadow-sm ${
        isCritical
          ? 'border-[#d5b16c]/55 border-l-4 border-l-[#102746] bg-gradient-to-br from-white to-[#f7f9fc]'
          : 'border-[#d5b16c]/55 border-l-4 border-l-[#b89250] bg-gradient-to-br from-white to-[#fffaf0]'
      }`}
    >
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  isCritical
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {priorityLabel}
              </span>

              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {typeLabel}
              </span>
            </div>

            <h4 className="mt-3 text-lg font-black leading-7 text-slate-950">
              {rec.title}
            </h4>

            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                {sw
                  ? 'Hatua ya Kuchukua'
                  : 'Required Action'}
              </p>

              <p className="mt-2 text-base font-bold leading-7 text-slate-900">
                {rec.action || '-'}
              </p>
            </div>

            {rec.question ? (
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                {rec.question}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 lg:w-56 lg:flex-col">
            <button
              type="button"
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
              onClick={() =>
                onDecision(rec, 'Done')
              }
            >
              {sw
                ? 'Thibitisha Imefanyika'
                : 'Confirm Completed'}
            </button>

            <button
              type="button"
              className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-100"
              onClick={() =>
                onDecision(rec, 'Planned')
              }
            >
              {sw
                ? 'Weka Kama Imepangwa'
                : 'Mark as Planned'}
            </button>
          </div>
        </div>

        <details className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-600">
            {sw
              ? 'Onyesha ushahidi na chaguo nyingine'
              : 'Show evidence and other options'}
          </summary>

          <div className="border-t border-slate-200 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              {sw ? 'Ushahidi' : 'Evidence'}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {rec.evidence || '-'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                onClick={() =>
                  onDecision(rec, 'Snoozed')
                }
              >
                {sw
                  ? 'Ficha siku 7'
                  : 'Snooze 7 days'}
              </button>

              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                onClick={() =>
                  onDecision(rec, 'Not Relevant')
                }
              >
                {sw
                  ? 'Haihitajiki'
                  : 'Not Relevant'}
              </button>

              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                onClick={() =>
                  onDecision(rec, 'Note')
                }
              >
                {sw
                  ? 'Weka Maelezo'
                  : 'Add Note'}
              </button>
            </div>
          </div>
        </details>

        {actionRecord?.status ? (
          <div
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusBadge(
              actionRecord.status
            )}`}
          >
            {actionRecord.status}
          </div>
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
    <div className={`rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/70 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-black uppercase tracking-wide text-slate-900">{title}</h4>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
      {explanation ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
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

  const verbs = {
    sales: {
      increased: 'yameongezeka',
      reduced: 'yamepungua',
      remained: 'yamebaki',
      droppedToZero: 'yameshuka mpaka',
    },
    expenses: {
      increased: 'yameongezeka',
      reduced: 'yamepungua',
      remained: 'yamebaki',
      droppedToZero: 'yameshuka mpaka',
    },
    netProfit: {
      increased: 'imeongezeka',
      reduced: 'imepungua',
      remained: 'imebaki',
      droppedToZero: 'imeshuka mpaka',
    },
    mobileCommission: {
      increased: 'imeongezeka',
      reduced: 'imepungua',
      remained: 'imebaki',
      droppedToZero: 'imeshuka mpaka',
    },
  };

  const name = names[dataKey] || (sw ? 'Taarifa hii' : 'This item');
  const verb = verbs[dataKey] || {
    increased: 'imeongezeka',
    reduced: 'imepungua',
    remained: 'imebaki',
    droppedToZero: 'imeshuka mpaka',
  };

  if (!previous && current > 0) {
    return sw
      ? `${name} ya kipindi hiki ni TZS ${money(current)}. Kipindi kilichopita hakikuwa na kiasi cha kulinganisha, hivyo hili linaonekana kama ongezeko jipya.`
      : `${name} for this period is TZS ${money(current)}. The previous period had no comparable amount, so this appears as new growth.`;
  }

  if (previous > 0 && !current) {
    return sw
      ? `${name} ${verb.droppedToZero} TZS 0 kutoka TZS ${money(previous)}. Angalia kama biashara kweli imeshuka au taarifa hazijaingizwa.`
      : `${name} dropped to TZS 0 from TZS ${money(previous)}. Check whether business really reduced or records were not entered.`;
  }

  if (difference > 0) {
    return sw
      ? `${name} ${verb.increased} kwa TZS ${money(absDifference)}, kutoka TZS ${money(previous)} hadi TZS ${money(current)}.`
      : `${name} increased by TZS ${money(absDifference)}, from TZS ${money(previous)} to TZS ${money(current)}.`;
  }

  if (difference < 0) {
    return sw
      ? `${name} ${verb.reduced} kwa TZS ${money(absDifference)}, kutoka TZS ${money(previous)} hadi TZS ${money(current)}.`
      : `${name} reduced by TZS ${money(absDifference)}, from TZS ${money(previous)} to TZS ${money(current)}.`;
  }

  return sw
    ? `${name} ${verb.remained} TZS ${money(current)}, sawa na kipindi kilichopita.`
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
    blue: { header: 'bg-sky-700', border: 'border-sky-200', surface: 'bg-sky-50/70', bar: 'bg-sky-600', text: 'text-sky-800' },
    emerald: { header: 'bg-emerald-700', border: 'border-emerald-200', surface: 'bg-emerald-50/70', bar: 'bg-emerald-600', text: 'text-emerald-800' },
    orange: { header: 'bg-orange-700', border: 'border-orange-200', surface: 'bg-orange-50/70', bar: 'bg-orange-600', text: 'text-orange-800' },
    violet: { header: 'bg-violet-700', border: 'border-violet-200', surface: 'bg-violet-50/70', bar: 'bg-violet-600', text: 'text-violet-800' },
  };
  const colors = toneMap[tone] || toneMap.blue;
  const maxValue = Math.max(Number(currentValue || 0), Number(previousValue || 0), 1);
  const currentWidth = Number(currentValue || 0) > 0 ? Math.max(4, Number(currentValue) / maxValue * 100) : 0;
  const previousWidth = Number(previousValue || 0) > 0 ? Math.max(4, Number(previousValue) / maxValue * 100) : 0;

  return (
    <div className={`overflow-hidden rounded-2xl border ${colors.border} bg-white shadow-md shadow-slate-200/60`}>
      <div className={`${colors.header} px-4 py-3 text-white`}>
        <p className="text-xs font-black uppercase tracking-wide text-white/90">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-white">{value}</p>
      </div>
      <div className={`space-y-3 ${colors.surface} p-4`}>
        <span className={`inline-flex rounded-full border border-white bg-white px-3 py-1 text-xs font-black shadow-sm ${trendClass(trend)}`}>
          {getTrendLabel(trend, language, dataKey)}
        </span>
        <div className="rounded-xl border border-white bg-white p-3 shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-slate-800">
            <span>{sw ? 'Kipindi hiki' : 'This period'}</span><span>TZS {money(currentValue)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${currentWidth}%` }} /></div>
          <div className="mb-1 mt-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
            <span>{sw ? 'Kipindi kilichopita' : 'Previous period'}</span><span>TZS {money(previousValue)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-400" style={{ width: `${previousWidth}%` }} /></div>
        </div>
        <p className={`rounded-xl border border-white bg-white px-3 py-2 text-xs font-semibold leading-5 ${colors.text}`}>
          {getMiniKpiExplanation(dataKey, trend, language, currentValue, previousValue)}
        </p>
      </div>
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
            <div
              key={shop.shopId}
              className="relative overflow-hidden rounded-[24px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-green-50 p-5 shadow-sm shadow-emerald-100/70"
              style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/40 blur-2xl" />
              <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-slate-950">{shop.shopName}</h4>
                  <p className="mt-1 text-xs font-medium text-slate-500">{sw ? 'Nguvu kuu' : 'Main strength'}: {shop.strength}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(shop.status)}`}>{shop.status}</span>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{sw ? 'Alama ya duka' : 'Shop score'}</p>
                    <p className="mt-1 text-3xl font-bold leading-none text-slate-950">
                      {shop.score}
                      <span className="ml-1 text-base font-semibold text-slate-400">/100</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-medium leading-5 text-slate-500">
                    <div>{sw ? 'Margin' : 'Margin'}: {pct(shop.margin)}</div>
                    <div>{sw ? 'Matumizi/Gross' : 'Expense pressure'}: {pct(shop.expensePressure)}</div>
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full bg-gradient-to-r ${bar}`} style={{ width: `${shop.score}%` }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <SoftTile label={sw ? 'Mauzo' : 'Sales'} value={`TZS ${money(shop.sales)}`} className="bg-blue-50" />
                <SoftTile label={sw ? 'Faida' : 'Profit'} value={`TZS ${money(shop.netProfit)}`} className="bg-emerald-50" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{shop.critical} {sw ? 'hatari kubwa' : 'critical'}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{shop.high} {sw ? 'vipaumbele juu' : 'high priority'}</span>
              </div>

              <p className="mt-4 rounded-2xl bg-white/75 px-3 py-2 text-xs font-medium leading-5 text-slate-600 ring-1 ring-emerald-50">
                {getShopScoreMeaning(shop, language)}
              </p>
              </div>
            </div>
          );
        })}
        {!rows.length ? <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{sw ? 'Hakuna duka la kuonyesha.' : 'No shop to show.'}</div> : null}
      </div>
    </DropdownPanel>
  );
}

function buildAdvisorIntelligence(data, shopFilter, period, customStart = '', customEnd = '') {
  const allSales = Array.isArray(data?.sales) ? data.sales : [];
  const products = Array.isArray(data?.products) ? data.products : [];
  const shops = Array.isArray(data?.shops) ? data.shops : [];
  const selectedRange = getPeriodRange(period, customStart, customEnd);
  const parseDate = (value) => startOfDay(`${value}T00:00:00`);
  const start = parseDate(selectedRange.start);
  const end = parseDate(selectedRange.end);
  let previousStart = parseDate(selectedRange.previousStart);
  let previousEnd = parseDate(selectedRange.previousEnd);
  // Daily comparisons use the same weekday in the previous week.
  if (period === 'today' || period === 'yesterday') {
    previousStart = addDays(start, -7);
    previousEnd = addDays(end, -7);
  }
  // A full calendar month is compared with the full preceding calendar month.
  if (period === 'lastmonth') {
    previousStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    previousEnd = addDays(start, -1);
  }
  const currentRange = [toISO(start), toISO(end)];
  const previousRange = [toISO(previousStart), toISO(previousEnd)];
  const productById = new Map(products.filter(p => p?.id != null).map(p => [String(p.id), p]));
  const shopNameById = new Map(shops.map(sh => [String(sh.id), sh.name]));
  const chosen = String(shopFilter || 'all');
  const byProduct = new Map();
  const totals = { current: { sales: 0, profit: 0, qty: 0 }, previous: { sales: 0, profit: 0, qty: 0 } };
  let matchedSales = 0;
  for (const sale of allSales) {
    const shopId = String(sale?.shop_id || sale?.shopId || '');
    if (chosen !== 'all' && shopId !== chosen) continue;
    const date = getDateValue(sale);
    const bucket = date >= currentRange[0] && date <= currentRange[1] ? 'current' : date >= previousRange[0] && date <= previousRange[1] ? 'previous' : null;
    if (!bucket) continue;
    matchedSales++;
    for (const item of getSaleItems(sale)) {
      const product = productById.get(getItemProductId(item));
      const name = product ? getProductName(product) : getItemName(item);
      const code = product ? getProductCode(product) : String(item?.standard_product_code || item?.standardProductCode || name).trim().toLowerCase();
      const unit = unitText(product?.baseUnit || product?.baseunit || product?.unit || item?.baseUnit || item?.baseunit || item?.unit || 'pc');
      const key = `${shopId}__${code}__${unit}`;
      if (!byProduct.has(key)) byProduct.set(key, { key, name, shopName: shopNameById.get(shopId) || shopId, unit, stock: product ? getProductStock(product) : null, current: { qty: 0, sales: 0, profit: 0 }, previous: { qty: 0, sales: 0, profit: 0 }, profitReliable: true });
      const row = byProduct.get(key);
      const qty = getItemQty(item);
      const salesValue = getItemSales(item);
      const hasBuy = item?.buyPrice != null || item?.buyingprice != null || item?.cost != null;
      const profit = hasBuy ? getItemProfit(item) : 0;
      row[bucket].qty += qty; row[bucket].sales += salesValue; row[bucket].profit += profit;
      if (!hasBuy) row.profitReliable = false;
      totals[bucket].qty += qty; totals[bucket].sales += salesValue; totals[bucket].profit += profit;
    }
  }
  const rows = Array.from(byProduct.values()).map(row => ({ ...row, salesDelta: row.current.sales - row.previous.sales, profitDelta: row.current.profit - row.previous.profit, qtyDelta: row.current.qty - row.previous.qty }));
  const profitReliable = rows.every(row => row.profitReliable);
  return { rows, totals, profitReliable, matchedSales, currentRange, previousRange,
    winners: rows.filter(r => r.salesDelta > 0 || (r.profitReliable && r.profitDelta > 0)).sort((a,b) => (b.salesDelta + (b.profitReliable ? b.profitDelta : 0)) - (a.salesDelta + (a.profitReliable ? a.profitDelta : 0))),
    losers: rows.filter(r => r.salesDelta < 0 || (r.profitReliable && r.profitDelta < 0)).sort((a,b) => (a.salesDelta + (a.profitReliable ? a.profitDelta : 0)) - (b.salesDelta + (b.profitReliable ? b.profitDelta : 0))) };
}

function DecisionAdvisorPanel({ data, shopFilter, language, isShopScope }) {
  const sw = language !== 'en';
  const [period, setPeriod] = React.useState('today');
  const [customStart, setCustomStart] = React.useState(toISO(addDays(new Date(), -7)));
  const [customEnd, setCustomEnd] = React.useState(toISO(new Date()));
  const [showAllLosers, setShowAllLosers] = React.useState(false);
  const [showAllWinners, setShowAllWinners] = React.useState(false);
  const report = React.useMemo(() => buildAdvisorIntelligence(data, shopFilter, period, customStart, customEnd), [data, shopFilter, period, customStart, customEnd]);
  const { totals, rows, winners, losers, profitReliable } = report;
  const todayWithoutSales = period === 'today' && totals.current.sales === 0 && totals.current.qty === 0;
  const deltaSales = totals.current.sales - totals.previous.sales;
  const deltaProfit = totals.current.profit - totals.previous.profit;
  const amount = n => `TZS ${money(Math.abs(n))}`;
  const signed = n => `${n >= 0 ? '+' : '−'}TZS ${money(Math.abs(n))}`;
  const unitQty = (n, unit) => `${qtyText(n)} ${unitText(unit)}`;
  const summary = row => `${row.name}${shopFilter === 'all' ? ` (${row.shopName})` : ''}: ${unitQty(row.previous.qty,row.unit)} → ${unitQty(row.current.qty,row.unit)}; TZS ${money(row.previous.sales)} → TZS ${money(row.current.sales)} (${signed(row.salesDelta)}).${row.profitReliable ? ` Faida: ${signed(row.profitDelta)}.` : ' Faida haijakokotolewa kwa kuwa bei ya manunuzi haipo kwenye baadhi ya rekodi.'}`;
  const action = row => {
    const product = row.name;
    const unit = unitText(row.unit);
    const loss = amount(row.salesDelta);
    if (row.salesDelta < 0 && row.current.qty === 0 && row.previous.qty > 0) {
      return row.stock === 0
        ? `Stock ya sasa ya ${product} imeisha. Tumia mauzo ya kipindi kilichopita (${unitQty(row.previous.qty,unit)}) kupanga kiasi cha kuagiza; hakikisha mahitaji bado yapo.`
        : `${product} haijauzwa kipindi hiki licha ya mauzo ya ${unitQty(row.previous.qty,unit)} kipindi kilichopita. Pitia bei, nafasi ya bidhaa dukani na mahitaji ya wateja kabla ya kuongeza stock.`;
    }
    if (row.salesDelta < 0) {
      return `Mauzo ya ${product} yamepungua kwa ${loss} (${unitQty(Math.abs(row.qtyDelta),unit)} ${row.qtyDelta < 0 ? 'chini' : 'tofauti'}). Linganisha bei na mwenendo wa idadi iliyouzwa, kisha weka lengo la kurejesha angalau ${unitQty(row.previous.qty,unit)} kwa kipindi kinacholingana.`;
    }
    if (row.profitReliable && row.profitDelta < 0) {
      return `Mauzo ya ${product} yameongezeka, lakini faida imepungua kwa ${amount(row.profitDelta)}. Kagua gharama ya kununua na bei ya kuuza; usiongeze stock bila kuthibitisha kiwango cha faida.`;
    }
    return `Endelea kuhakikisha ${product} inapatikana. Mauzo yameongezeka kwa ${amount(row.salesDelta)} na idadi imefikia ${unitQty(row.current.qty,unit)}; tumia kasi hiyo kupanga manunuzi bila kuzidisha stock.`;
  };
  const salesVerb = name => /^(mayai|maji|mafuta|maziwa|machungwa|maembe|magodoro|mafiga)\b/i.test(String(name).trim()) ? 'yameongeza' : /^(vi|vy)/i.test(String(name).trim()) ? 'vimeongeza' : /^(ki|ch)/i.test(String(name).trim()) ? 'kimeongeza' : 'imeongeza';
  const lowMargin = rows.filter(r => r.profitReliable && r.current.sales > 0 && r.current.profit / r.current.sales < 0.1).sort((a,b) => b.current.sales-a.current.sales);
  const marginDrop = profitReliable && deltaSales > 0 && deltaProfit < 0;
  const periodLabel = ({ today: 'Leo', yesterday: 'Jana', week: 'Wiki hii hadi leo', lastweek: 'Wiki iliyopita', month: 'Mwezi huu hadi leo', lastmonth: 'Mwezi uliopita', '3months': 'Miezi 3 iliyopita', '6months': 'Miezi 6 iliyopita', year: 'Mwaka huu', custom: 'Chagua Tarehe' })[period] || 'Kipindi';
  const card = 'overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm';
  const head = 'bg-[#09547e] px-4 py-3 font-bold text-white';
  const productTable = (items, positive) => (
    <div className={card}>
      <h4 className={head}>{positive ? 'Bidhaa Zilizofanya Vizuri' : 'Bidhaa Zilizofanya Vibaya'}</h4>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-sky-50 text-slate-700"><tr><th className="p-3">Bidhaa</th><th className="p-3">Idadi iliyopita → sasa</th><th className="p-3">Mauzo yaliyopita → sasa</th><th className="p-3">Tofauti ya mauzo</th><th className="p-3">Tofauti ya faida</th></tr></thead><tbody>
      {items.slice(0,5).map((r,i) => <tr key={r.key} className={i%2===0?'bg-[#e9f5fc]':'bg-white'}><td className="p-3 font-bold">{r.name}{shopFilter === 'all' ? <span className="block text-xs font-normal text-slate-500">{r.shopName}</span> : null}</td><td className="p-3">{unitQty(r.previous.qty,r.unit)} → {unitQty(r.current.qty,r.unit)}</td><td className="p-3">{amount(r.previous.sales)} → {amount(r.current.sales)}</td><td className={`p-3 font-bold ${r.salesDelta>=0?'text-emerald-700':'text-rose-700'}`}>{signed(r.salesDelta)}</td><td className="p-3">{r.profitReliable ? signed(r.profitDelta) : 'Haijathibitishwa'}</td></tr>)}
      {!items.length && <tr><td colSpan={5} className="p-4 text-slate-500">Hakuna mabadiliko yaliyothibitishwa kwa kipindi hiki.</td></tr>}</tbody></table></div>
      {items.length>5 && <details className="border-t p-3"><summary className="cursor-pointer font-bold text-[#09547e]">Onyesha bidhaa zote ({items.length})</summary><div className="mt-2 space-y-2">{items.slice(5).map(r=><p key={r.key} className="border-b py-2 text-sm">{summary(r)}</p>)}</div></details>}
    </div>
  );
  const insightTable = (title, items, positive, expanded, setExpanded) => (
    <div className={card}>
      <h4 className="bg-emerald-700 px-4 py-3 font-bold text-white">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-100 text-emerald-950"><tr>
            <th className="p-3">Bidhaa / Sababu</th>
            <th className="p-3">Idadi iliyopita → sasa</th>
            <th className="p-3">Mauzo yaliyopita → sasa</th>
            <th className="p-3">Mabadiliko ya mauzo</th>
            <th className="p-3">Maelezo na Ushahidi</th>
          </tr></thead>
          <tbody>
            {(expanded ? items : items.slice(0,5)).map((r,i) => (
              <tr key={r.key} className={i%2===0?'bg-[#e9f5fc]':'bg-white'}>
                <td className="p-3 font-bold">{r.name}{shopFilter === 'all' && <span className="block text-xs font-normal text-slate-500">{r.shopName}</span>}</td>
                <td className="p-3">{unitQty(r.previous.qty,r.unit)} → {unitQty(r.current.qty,r.unit)}</td>
                <td className="p-3">{amount(r.previous.sales)} → {amount(r.current.sales)}</td>
                <td className={`p-3 font-bold ${r.salesDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{signed(r.salesDelta)}</td>
                <td className="p-3">
                  {positive
                    ? `Mauzo ya ${r.name} yameongezeka kwa ${amount(r.salesDelta)}; ${r.qtyDelta >= 0 ? 'idadi iliyouzwa imeongezeka' : 'idadi iliyouzwa imepungua'} kwa ${unitQty(Math.abs(r.qtyDelta),r.unit)}.`
                    : `Mauzo ya ${r.name} yamepungua kwa ${amount(r.salesDelta)}; ${r.qtyDelta < 0 ? 'idadi iliyouzwa imepungua' : r.qtyDelta > 0 ? 'idadi iliyouzwa imeongezeka' : 'idadi iliyouzwa haijabadilika'}${r.qtyDelta === 0 ? '' : ` kwa ${unitQty(Math.abs(r.qtyDelta),r.unit)}`}.`}
                  <details className="mt-2"><summary className="cursor-pointer font-bold text-[#09547e]">Ushahidi / zaidi</summary><p className="mt-2 leading-6 text-slate-700">{summary(r)}</p></details>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="p-4 text-slate-500">Hakuna mabadiliko yaliyothibitishwa kwa kipindi hiki.</td></tr>}
          </tbody>
        </table>
      </div>
      {items.length > 5 && <button type="button" onClick={() => setExpanded(!expanded)} className="w-full border-t border-emerald-100 px-4 py-3 text-left font-bold text-[#09547e] hover:bg-emerald-50">
        {expanded ? '▼ Ficha bidhaa za ziada' : `▶ Onyesha bidhaa zote (${items.length})`}
      </button>}
      {!positive && marginDrop && <div className="border-t border-emerald-100 bg-amber-50 p-3 text-sm"><strong>Mauzo yameongezeka lakini faida ghafi imepungua.</strong> Pitia bidhaa zenye faida ndogo.
        <details className="mt-2"><summary className="cursor-pointer font-bold text-[#09547e]">Onyesha bidhaa na ushahidi</summary><div className="mt-2 space-y-1">{lowMargin.length ? lowMargin.map(r=><p key={r.key}>{r.name}: mauzo {amount(r.current.sales)}, faida {amount(r.current.profit)}, kiwango cha faida {pct(profitMargin(r.current.profit,r.current.sales))}</p>) : <p>Hakuna bidhaa yenye kiwango chini ya 10% iliyobainika; kagua bidhaa zote.</p>}</div></details>
      </div>}
    </div>
  );
  const insight = (text, key, evidence, tone='sky') => <div key={key} className={`rounded-xl border border-sky-100 p-3 ${tone==='rose'?'bg-rose-50/60':'bg-sky-50/60'}`}><p className="text-sm font-semibold leading-6 text-slate-800">{text}</p><details className="mt-2"><summary className="cursor-pointer text-xs font-bold text-[#09547e]">Ushahidi / zaidi</summary><p className="mt-2 text-sm leading-6 text-slate-700">{evidence}</p></details></div>;
  return <div className="space-y-4 rounded-[26px] border border-sky-100 bg-[#f7fbfe] p-4 shadow-sm" style={{fontFamily:'"Century Gothic", CenturyGothic, Arial, sans-serif'}}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Mshauri wa Leo</p>
        <h3 className="mt-1 text-xl font-black text-slate-950">Uchambuzi wa mauzo, idadi ya bidhaa na faida</h3>
        <p className="mt-1 text-sm text-slate-600">Mafanikio, changamoto na hatua zinazotokana na rekodi za biashara.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
          <option value="today">Leo</option>
          <option value="yesterday">Jana</option>
          <option value="week">Wiki hii hadi leo</option>
          <option value="lastweek">Wiki iliyopita</option>
          <option value="month">Mwezi huu hadi leo</option>
          <option value="lastmonth">Mwezi uliopita</option>
          <option value="3months">Miezi 3 iliyopita</option>
          <option value="6months">Miezi 6 iliyopita</option>
          <option value="year">Mwaka huu</option>
          <option value="custom">Chagua Tarehe</option>
        </select>
        {period === 'custom' && <>
          <label className="text-xs font-semibold text-slate-600">Kuanzia <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="ml-1 rounded-lg border bg-white px-2 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Hadi <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="ml-1 rounded-lg border bg-white px-2 py-2 text-sm" /></label>
        </>}
      </div>
    </div>
    <p className="text-xs text-slate-600">{periodLabel}: {report.currentRange.join(' hadi ')} | Ulinganisho: {report.previousRange.join(' hadi ')} {['today','yesterday'].includes(period) ? '(siku sawa ya wiki iliyopita)' : ''}. {report.matchedSales} rekodi za mauzo zimechambuliwa.</p>
    <div className="grid gap-3 sm:grid-cols-3">{[['Mauzo ya kipindi',totals.current.sales,deltaSales],['Idadi iliyouzwa',totals.current.qty,totals.current.qty-totals.previous.qty],['Faida ghafi ya bidhaa',totals.current.profit,deltaProfit]].map(([label,value,change],i)=><div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-lg font-black">{i===1?qtyText(value):amount(value)}</p><p className={`text-sm font-bold ${change>=0?'text-emerald-700':'text-rose-700'}`}>{i===2&&!profitReliable?'Bei ya manunuzi haijakamilika':i===1?`${change>=0?'+':''}${qtyText(change)}`:signed(change)}</p></div>)}</div>
    {todayWithoutSales && <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-900">Leo bado hakuna mauzo yaliyorekodiwa. Taarifa za siku ya leo zinaendelea kukusanywa; mfumo hautahitimisha kuwa mauzo yameshuka wala kutaja bidhaa zilizofanya vibaya kabla ya mauzo ya leo kupatikana. Chagua “Jana” kuona uchambuzi wa siku iliyopita.</p>}
    {!profitReliable && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Baadhi ya rekodi hazina bei ya manunuzi. Faida ya bidhaa na hitimisho zinazohusu faida ni za sehemu yenye taarifa kamili pekee; usizitumie kama jumla ya faida iliyothibitishwa.</p>}
    {!todayWithoutSales && <>
    <div className="grid gap-3 xl:grid-cols-2">{productTable(winners,true)}{productTable(losers,false)}</div>
    {insightTable('Nini Kimekuangusha?', losers, false, showAllLosers, setShowAllLosers)}
    {insightTable('Nini Kimekupaisha?', winners, true, showAllWinners, setShowAllWinners)}
    <div className={card}><h4 className={head}>Tufanye Nini?</h4><div className="space-y-3 p-3">{[...losers.slice(0,3),...winners.slice(0,2)].map(r=>insight(action(r),r.key,summary(r)))}{marginDrop&&insight('Pitia bidhaa zenye faida ndogo kabla ya kubadili bei. Linganisha gharama za kununua, bei za kuuza na kiasi kinachouzwa.','margin-action',lowMargin.length?lowMargin.map(r=>`${r.name}: margin ${pct(profitMargin(r.current.profit,r.current.sales))}, mauzo ${amount(r.current.sales)}`).join(' | '):'Pitia jedwali la bidhaa na faida.')} {!rows.length&&<p className="text-sm text-slate-600">Hakuna rekodi za bidhaa za kutosha kutoa hatua mahsusi.</p>}</div></div>
    </>}
    <p className="text-xs leading-5 text-slate-500">Ushahidi: mauzo na idadi ni rekodi za miamala; faida ni ghafi ya bidhaa kutoka bei za manunuzi zilizo kwenye miamala, si faida halisi baada ya matumizi. Stock ya sasa haiwezi kuthibitisha siku ambayo bidhaa iliisha. Makadirio ya mauzo yaliyopotea hayajachanganywa na mauzo yaliyothibitishwa.</p>
  </div>;
}

function BIVisualDashboard({ analytics, visibleRecommendations, language }) {
  const sw = language !== 'en';
  const trendRows = analytics.trendRows || [];
  const shopRows = (analytics.shopPerformance || []).slice(0, 8).map((shop) => ({ label: shop.shopName, sales: shop.sales, profit: Math.max(0, shop.netProfit), expenses: shop.expenses }));
  const topProfitRows = (analytics.topProducts || []).slice(0, 8).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.profit }));
  const productMixRows = (analytics.productMix || []).map((item) => ({ label: catLabel(item.category, language), value: item.sales }));
  const capitalRows = (analytics.capitalEfficiency || []).slice(0, 8).map((item) => ({ label: `${item.productName} — ${item.shopName}`, value: item.stockValue }));
  const riskItems = ['Critical', 'High', 'Medium', 'Low'].map((priority) => ({
  label: priority,
  value: visibleRecommendations.filter((rec) => rec.priority === priority).length,
}));
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

// Seven-day potential stockout exposure; advisory only, not realized losses.
function normalizeAlertProductName(value) {
  return String(value || '').toLowerCase().normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

// Seven-day stockout forecast. This does not book lost sales or automatically order stock.
function estimateAlertFinancialExposure(rec, data) {
  if (!['Reorder Needed', 'Stockout / Lost Sales Risk'].includes(rec?.type) || !rec?.shopId) return null;
  const products = (Array.isArray(data?.products) ? data.products : []).filter(
    (p) => String(p.shop_id || p.shopId || '') === String(rec.shopId)
  );
  const code = String(rec.productCode || '').trim().toLowerCase();
  const targetName = normalizeAlertProductName(rec.productName || '');
  const target = products.filter((p) =>
    (code && getProductCode(p) === code) ||
    (targetName && normalizeAlertProductName(getProductName(p)) === targetName)
  );
  if (!target.length) return { available: false, reason: 'product-unmatched' };
  const ids = new Set(target.map((p) => String(p.id)));
  const names = new Set(target.map((p) => normalizeAlertProductName(getProductName(p))));
  const codes = new Set(target.map((p) => getProductCode(p)));
  const activeTarget = target.filter((p) => !p.archived);
  const productUnits = [...new Set(activeTarget.map((p) => unitText(p.baseUnit || p.baseunit || p.unit || 'pc')))];
  const forecastUnit = productUnits.length === 1 ? productUnits[0] : '';
  const stock = activeTarget.reduce((sum, p) => sum + Math.max(0, getProductStock(p)), 0);
  const today = toISO(new Date());
  const from = toISO(addDays(new Date(), -29));
  const records = [];
  (Array.isArray(data?.sales) ? data.sales : []).forEach((sale) => {
    if (String(sale.shop_id || sale.shopId || '') !== String(rec.shopId)) return;
    if (sale.status && !['confirmed', 'completed'].includes(String(sale.status).toLowerCase())) return;
    const date = getDateValue(sale);
    if (!date || date < from || date > today) return;
    getSaleItems(sale).forEach((item) => {
      const itemId = getItemProductId(item);
      const itemCode = String(item.standard_product_code || item.standardProductCode || '').trim().toLowerCase();
      const itemName = normalizeAlertProductName(getItemName(item));
      if (!ids.has(itemId) && !(itemCode && codes.has(itemCode)) && !names.has(itemName)) return;
      const qty = getItemQty(item);
      const sell = getItemSellPrice(item);
      const buy = getItemBuyPrice(item);
      if (qty > 0 && sell > 0) records.push({ date, qty, sell, buy });
    });
  });
  const qty30 = records.reduce((sum, x) => sum + x.qty, 0);
  if (!qty30) return { available: false, reason: 'no-matched-sales', stock };
  const distinctDates = [...new Set(records.map((x) => x.date))].sort();
  const firstSale = distinctDates[0];
  // A recently introduced product is assessed on the days observed, not rejected
  // simply because seven days have not yet elapsed. Mark that forecast provisional.
  const observedDays = Math.max(1, Math.min(30, Math.round((new Date(today) - new Date(firstSale)) / 86400000) + 1));
  const provisional = observedDays < 14 || distinctDates.length < 3;
  const qty7 = records.filter((x) => x.date >= toISO(addDays(new Date(), -6))).reduce((sum, x) => sum + x.qty, 0);
  const average30 = qty30 / observedDays;
  const average7 = qty7 / Math.min(7, observedDays);
  const expected7 = average30 * 7;
  const shortage = Math.max(0, expected7 - stock);
  const avgSell = records.reduce((sum, x) => sum + x.qty * x.sell, 0) / qty30;
  const costRecords = records.filter((x) => x.buy > 0);
  const pricedQty = costRecords.reduce((sum, x) => sum + x.qty, 0);
  const avgUnitProfit = pricedQty > 0
    ? costRecords.reduce((sum, x) => sum + x.qty * (x.sell - x.buy), 0) / pricedQty
    : null;
  return {
    available: true, stock, unit: forecastUnit, average30, average7, shortage, observedDays, provisional,
    salesAtRisk: shortage * avgSell,
    grossProfitAtRisk: avgUnitProfit === null ? null : shortage * avgUnitProfit,
    partialCost: pricedQty < qty30,
  };
}

// Eligibility is decided before counts and all downstream warning views are built.
// A low-stock signal alone is not a management exception.
function isActionableStockWarning(rec, data) {
  if (!['Reorder Needed', 'Stockout / Lost Sales Risk'].includes(rec?.type)) return true;
  const estimate = estimateAlertFinancialExposure(rec, data);
  if (estimate?.available) {
    // The same seven-day demand model drives both warning eligibility and advice.
    return estimate.shortage > 0;
  }
  // A verified previous-period stockout remains a data-quality exception when
  // current product identity cannot be reconciled. Never order on that basis alone.
  return rec.type === 'Stockout / Lost Sales Risk';
}

function alertFinancialDecision(rec, data, sw) {
  const estimate = estimateAlertFinancialExposure(rec, data);
  if (!estimate) return { estimate: null, action: rec.action || '—' };
  if (!estimate.available) return {
    estimate,
    action: sw
      ? 'Hakiki historia ya mauzo, stock na utambulisho wa bidhaa; usiagize bila kuthibitisha mahitaji.'
      : 'Verify sales, stock and product identity; do not order without confirming demand.',
  };
  if (estimate.shortage <= 0) return {
    estimate,
    action: sw
      ? 'Stock inatosha kwa makadirio ya siku 7; usiongeze kwa sasa, endelea kufuatilia.'
      : 'Stock covers estimated 7-day demand; monitor before buying.',
  };
  return {
    estimate,
    action: sw
      ? `Kagua kwanza, kisha agiza angalau ${qtyText(Math.ceil(estimate.shortage))}${estimate.unit ? ` ${estimate.unit}` : ' (hakiki kipimo cha bidhaa)'} kwa mahitaji ya siku 7${estimate.provisional ? '; hakiki pia makadirio kwa kuwa historia ya mauzo ni fupi.' : '.'}`
      : `Review ordering about ${qtyText(Math.ceil(estimate.shortage))} more for 7-day demand${estimate.provisional ? '; first verify limited history.' : '.'}`,
  };
}

export default function CEODecisionCentre({
  data,
  historicalDaily = [],
  historicalReady = false,
  language = 'sw',
  scope = 'owner',
  lockedShopId = '',
  titleOverride = '',
  ownerPeriod = '',
  selectedPeriod = '',
  customStartDate = '',
  customEndDate = '',
}) {
  const t = useT(language);
  const sw = language !== 'en';
  const isShopScope = scope === 'shop';
const isOwnerScope = !isShopScope;
const initialShopFilter = isShopScope && lockedShopId ? String(lockedShopId) : 'all';

  const externalPeriod = selectedPeriod || ownerPeriod || '';

  const [period, setPeriod] = React.useState(externalPeriod || 'month');
  const [customStart, setCustomStart] = React.useState(customStartDate || toISO(addDays(new Date(), -29)));
  const [customEnd, setCustomEnd] = React.useState(customEndDate || toISO(new Date()));

  React.useEffect(() => {
    if (externalPeriod) {
      setPeriod(externalPeriod);
    }
  }, [externalPeriod]);

  React.useEffect(() => {
    if (customStartDate) {
      setCustomStart(customStartDate);
    }

    if (customEndDate) {
      setCustomEnd(customEndDate);
    }
  }, [customStartDate, customEndDate]);
  const [viewMode, setViewMode] = React.useState('summary');
  const [summaryView, setSummaryView] = React.useState('owner-summary');
  const [opportunityView, setOpportunityView] = React.useState('stock-transfer');
  const [riskView, setRiskView] = React.useState('reorder-needed');
  const [shopFilter, setShopFilter] = React.useState(initialShopFilter);
  const [actions, setActions] = React.useState(() => readActions());
  const [productSearch, setProductSearch] = React.useState('');
  const [productStatusFilter, setProductStatusFilter] = React.useState('all');
  const [aiEndpoint, setAiEndpoint] = React.useState('http://localhost:11434/api/generate');
  const [aiModel, setAiModel] = React.useState('llama3.2:3b');
  const [aiQuestion, setAiQuestion] = React.useState('');
  const [aiAnswer, setAiAnswer] = React.useState('');
  const [aiConversation, setAiConversation] = React.useState([]);
  const [aiError, setAiError] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  const analytics = React.useMemo(
    () => buildAnalytics({ data, period, shopFilter, language, customStart, customEnd }),
    [data, period, shopFilter, language, customStart, customEnd]
  );

  const visibleRecommendations = React.useMemo(() => {
    return analytics.recommendations
      .filter((rec) => !actionHidden(actions[rec.id]))
      .filter((rec) => isActionableStockWarning(rec, data))
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  }, [analytics.recommendations, actions, data]);

  const ownerOnlyRecommendationTypes = ['Stock Transfer', 'Missing Product Opportunity', 'Investment Opportunity'];

  const safeVisibleRecommendations = isShopScope
    ? visibleRecommendations.filter((rec) => !ownerOnlyRecommendationTypes.includes(rec.type))
    : visibleRecommendations;

  const criticalRecommendations = safeVisibleRecommendations.filter((rec) => rec.priority === 'Critical');
  const highRecommendations = safeVisibleRecommendations.filter((rec) => rec.priority === 'High');
    const reorderNeededRecommendations = safeVisibleRecommendations.filter(
    (rec) => rec.type === 'Reorder Needed'
  );

  const expiredStockRecommendations = safeVisibleRecommendations.filter(
    (rec) => rec.type === 'Expired Stock'
  );

  const nearExpiryStockRecommendations = safeVisibleRecommendations.filter(
    (rec) => rec.type === 'Expiry Risk'
  );

  const opportunityRecommendations = isOwnerScope
    ? safeVisibleRecommendations.filter((rec) => ownerOnlyRecommendationTypes.includes(rec.type))
    : [];

  const stockTransferRecommendations = opportunityRecommendations.filter(
    (rec) => rec.type === 'Stock Transfer'
  );

  const investmentOpportunityRecommendations = opportunityRecommendations.filter(
    (rec) => rec.type === 'Investment Opportunity'
  );

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

  const warningHistory = React.useMemo(() => {
    return readWarningHistory()
      .filter((item) => item && item.recommendationId)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [actions, analytics.recommendations]);

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

    const actionRecord = {
      recommendationId: rec.id,
      type: rec.type,
      priority: rec.priority || '',
      productCode: rec.productCode,
      productName: rec.productName,
      shopName: rec.shopName,
      shopId: rec.shopId || '',
      challenge: rec.title,
      evidence: rec.evidence,
      suggestedAction: rec.action,
      status,
      note,
      implemented,
      snoozeUntil,
      userId: analytics?.currentUser?.id || analytics?.currentUser?.auth_user_id || '',
      userName: analytics?.currentUser?.name || analytics?.currentUser?.username || '',
      userRole: analytics?.currentUser?.role || '',
      updatedAt: new Date().toISOString(),
    };

    const next = {
      ...actions,
      [rec.id]: actionRecord,
    };

    setActions(next);
    writeActions(next);

    saveCeoActionToSupabase(actionRecord).catch((error) => {
      console.error('CEO action background save failed:', error);
    });

    const historyEntry = addWarningHistoryEntry({
      recommendationId: rec.id,
      eventType: 'ACTION_RECORDED',
      type: rec.type,
      productCode: rec.productCode || '',
      productName: rec.productName || '',
      shopId: rec.shopId || '',
      shopName: rec.shopName || '',
      challenge: rec.title || '',
      evidence: rec.evidence || '',
      suggestedAction: rec.action || '',
      status,
      note,
      implemented,
      snoozeUntil,
      message:
        language === 'en'
          ? `Action recorded: ${status}`
          : `Hatua imehifadhiwa: ${status}`,
    });

    saveCeoWarningHistoryToSupabase(historyEntry).catch((error) => {
      console.error('CEO warning history background save failed:', error);
    });
  };

  const setAiQuickQuestion = (type) => {
    const map = {
      explain: sw
        ? 'Kwa kutumia taarifa halisi za CEO dashboard, eleza mwenendo wa biashara kwa kipindi nilichochagua. Taja maduka, bidhaa, kiasi cha mauzo, faida, matumizi, stock na hatua muhimu za mmiliki kuchukua.'
        : 'Using the actual CEO dashboard data, explain the business performance for the selected period. Mention shops, products, sales, profit, expenses, stock and the most important owner actions.',

      profit: sw
        ? 'Kwa kutumia data iliyopo, eleza kwa nini faida imeshuka au imekuwa ndogo. Taja sababu mahsusi kama mauzo, matumizi, bidhaa zenye margin ndogo, bidhaa zinazouzwa chini ya bei ya manunuzi, duka husika na hatua ya kuchukua.'
        : 'Using the available data, explain why profit reduced or remained weak. Mention specific causes such as sales, expenses, low-margin products, below-purchase-price products, affected shop and recommended action.',

      duplicates: sw
        ? 'Tafuta bidhaa zinazoweza kuwa zimejirudia kwenye mfumo. Taja majina ya bidhaa, maduka, bei ya kununua, bei ya kuuza, stock, na kwa nini unadhani zinaweza kuwa duplicate. Usitoe ushauri wa jumla bila kutaja bidhaa.'
        : 'Find possible duplicate products in the system. Mention product names, shops, buying price, selling price, stock, and why they may be duplicates. Do not give generic advice without naming products.',

      weekly: sw
        ? 'Tengeneza mpango wa hatua za wiki hii kwa mmiliki kwa kutumia data halisi. Panga hatua kwa umuhimu: hatari kubwa, bidhaa za kuongeza stock, bidhaa za kutonunua, stock ya kuhamisha, expiry risk, na maswali ya kuuliza wahudumu.'
        : 'Create this week owner action plan using actual data. Rank actions by priority: critical risks, items to restock, items to stop buying, stock transfers, expiry risk, and questions to ask attendants.',

      investment: sw
        ? 'Tafuta fursa za uwekezaji kwa kutumia data halisi ya bidhaa, maduka, margin, mauzo, faida, gesi na wakala. Taja maeneo mahsusi ya kuongeza mtaji na maeneo ya kuepuka.'
        : 'Find investment opportunities using actual product, shop, margin, sales, profit, gas and wakala data. Mention specific areas to increase capital and areas to avoid.',
    };

    setAiQuestion(map[type] || map.explain);
  };

  const buildAiPrompt = (questionOverride = '') => {
    const effectiveQuestion = questionOverride || aiQuestion;
    const intent = detectAiIntent(effectiveQuestion);
    const contextPack = buildAiContextPack({
      analytics,
      visibleRecommendations,
      intent,
      language,
    });

    const conversationText = aiConversation
      .slice(-6)
      .map((item, idx) => {
        const role = item.role === 'assistant' ? 'AI' : 'Owner';
        return `${idx + 1}. ${role}: ${item.content}`;
      })
      .join('\n');

    return `
You are a local AI business analyst inside this POS CEO Decision Centre.

LANGUAGE RULE:
Respond only in ${language === 'en' ? 'English' : 'practical Tanzanian Kiswahili'}.
If responding in Kiswahili, use natural business Kiswahili. Examples:
- "Mauzo yameongezeka", not "Mauzo imeongezeka".
- "Matumizi yameongezeka", not "Matumizi imeongezeka".
- "Bei ya kuuzia iko chini ya bei ya manunuzi", not vague wording.

IMPORTANT BEHAVIOUR RULES:
1. Use only the business data provided below.
2. Never mention a product, shop, amount, date, or risk unless it appears in the BUSINESS DATA PACK.
3. Do not invent examples. Do not use sample products. Do not guess missing products.
4. If the owner asks for duplicate products and no duplicate group is shown in the data pack, say clearly: "Sijaona bidhaa zinazojirudia kwenye data niliyopewa."
5. Do not give generic advice such as "you need to analyze the data" because the data has already been provided.
6. Mention specific shop names, product names, amounts, dates, risks and actions only where available in the data pack.
7. If the exact data needed is not available in the provided pack, say exactly what is missing.
5. Do not recommend automatic changes to stock, prices, names, sales or Supabase records.
6. For medicine-related products, mention that legal/licensing requirements must be considered.
7. Give practical owner-level advice: what to check first, what to ask attendants, and what action to take.
8. Keep the response structured and direct. Avoid long theory.

QUESTION INTENT:
${intent}

SELECTED PERIOD AND SHOP:
Period: ${period}
Shop filter: ${shopFilter}

BUSINESS DATA PACK:
${contextPack}

RECENT AI CONVERSATION FOR FOLLOW-UP CONTEXT:
${conversationText || 'No previous AI conversation in this session.'}

OWNER QUESTION:
${effectiveQuestion || (language === 'en' ? 'Explain the business performance and suggest the most important actions.' : 'Eleza mwenendo wa biashara na pendekeza hatua muhimu zaidi.')}
`;
  };

  const askLocalAi = async () => {
    const ownerQuestion =
      aiQuestion ||
      (sw
        ? 'Eleza mwenendo wa biashara na pendekeza hatua muhimu zaidi.'
        : 'Explain the business performance and suggest the most important actions.');

    setAiLoading(true);
    setAiError('');
    setAiAnswer('');

    const userMessage = {
      role: 'user',
      content: ownerQuestion,
      createdAt: new Date().toISOString(),
    };

    setAiConversation((prev) => [...prev, userMessage].slice(-10));

    try {
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: aiModel, prompt: buildAiPrompt(ownerQuestion), stream: false }),
      });

      if (!response.ok) throw new Error(`Local AI responded with status ${response.status}`);

      const result = await response.json();
      const answer = result?.response || result?.message?.content || 'Local AI returned no response.';

      setAiAnswer(answer);

      setAiConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          createdAt: new Date().toISOString(),
        },
      ].slice(-10));
    } catch (error) {
      const errorMessage = `${sw ? 'AI ya ndani haijaunganishwa au imezuiwa. Dashboard bado inafanya kazi bila AI.' : 'Local AI is not connected or blocked. The dashboard still works without AI.'} Details: ${error?.message || 'Unknown error'}`;

      setAiError(errorMessage);

      setAiConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          createdAt: new Date().toISOString(),
        },
      ].slice(-10));
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

  const showSummary = viewMode === 'summary';
  const showRisks = viewMode === 'risk';
  const showProducts = viewMode === 'products';
  const showAi = viewMode === 'ai';

  return (
    <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex min-h-[720px]">
        <CeoSidebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          language={language}
          isShopScope={Boolean(data?.shops?.length === 1)}
        />

        <main className="min-w-0 flex-1 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
          <div className="overflow-hidden border-white/70 bg-white/55 backdrop-blur-xl">
        <div className="border-b border-[#b88b45]/35 bg-[#102542] px-6 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                {t('title')}
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-200">
                {analytics.businessMessage}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[620px]">
                            {!ownerPeriod ? (
                <SelectControl darkLabel label={t('period')} value={period} onChange={(e) => setPeriod(e.target.value)}>
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
              ) : null}

              {isShopScope ? (
                <div className="rounded-2xl border border-[#b88b45]/50 bg-[#203651] px-4 py-2 text-sm font-semibold text-[#f3d295] shadow-sm">
                  {sw ? 'Taarifa za duka hili pekee' : 'This shop only'}
                </div>
              ) : (
                <SelectControl darkLabel label={t('shop')} value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
                  <option value="all">{t('allShops')}</option>
                  {(data?.shops || []).map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                </SelectControl>
              )}

              <SelectControl darkLabel label={t('view')} value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="summary">{sw ? 'Muhtasari' : 'Summary'}</option>
                <option value="products">{sw ? 'Bidhaa' : 'Products'}</option>
                <option value="risk">{sw ? 'Hatari' : 'Risks'}</option>
                <option value="opportunity">{sw ? 'Fursa' : 'Opportunities'}</option>
                <option value="action">{sw ? 'Hatua' : 'Actions'}</option>
                <option value="ai">{sw ? 'AI Advisor' : 'AI Advisor'}</option>
              </SelectControl>
            </div>
          </div>

          {period === 'custom' ? (
            <div className="mt-5 grid gap-3 rounded-3xl border border-[#b88b45]/40 bg-[#203651] p-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-[#f3d295]">{t('startDate')}</span>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-[#f3d295]">{t('endDate')}</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800" />
              </label>
            </div>
          ) : null}
        </div>

<div className="space-y-6 px-6 py-6">
    {viewMode === 'summary' ? (
  <>
    <div
      className="mb-5 rounded-[24px] border border-[#b88b45]/40 bg-[#102542] p-3 shadow-sm shadow-slate-200/70"
      style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
    >
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'owner-summary', label: sw ? 'Muhtasari wa Mmiliki' : 'Owner Summary' },
          { id: 'critical-alerts', label: sw ? 'Tahadhari Muhimu' : 'Critical Alerts' },
          { id: 'key-comparisons', label: sw ? 'Ulinganisho Muhimu' : 'Key Comparisons' },
          { id: 'profit-waterfall', label: sw ? 'Mtiririko wa Faida' : 'Profit Waterfall' },
          { id: 'shop-scorecard', label: sw ? 'Alama za Maduka' : 'Shop Scorecard' },
          { id: 'profit-breakdown', label: sw ? 'Mgawanyo wa Faida' : 'Profit Breakdown' },
          { id: 'today-advisor', label: sw ? 'Mshauri wa Leo' : 'Today Advisor' },
          { id: 'quick-priorities', label: sw ? 'Vipaumbele vya Haraka' : 'Quick Priorities' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSummaryView(item.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              summaryView === item.id
                ? 'bg-[#d7ac43] text-[#102542] shadow-sm'
                : 'bg-[#203651] text-white hover:bg-[#2d4769] hover:text-[#f3d295]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>

   {summaryView === 'owner-summary' ? (
    <div className="w-full">
      <OwnerSummaryPanel
        analytics={analytics}
        visibleRecommendations={safeVisibleRecommendations}
        language={language}
        salesTrend={salesTrend}
        profitTrend={profitTrend}
      />
      <BusinessPerformanceComparison data={data} shopFilter={shopFilter} language={language} historicalDaily={historicalDaily} historicalReady={historicalReady} />
    </div>
  ) : null}
  </>
  ) : null}

  {viewMode === 'summary' ? (
            <>


              {summaryView === 'key-comparisons' ? (
                <DropdownPanel
                  title={sw ? 'Ulinganisho Muhimu' : 'Key Comparisons'}
                  subtitle={sw ? 'Hapa unaona ulinganisho wa mauzo, faida na mwenendo muhimu wa biashara.' : 'Compare sales, profit, and important business movement in one place.'}
                  defaultOpen
                  tone="blue"
                >
                  <KpiMiniChartPanel analytics={analytics} language={language} />
                </DropdownPanel>
              ) : null}

              {summaryView === 'profit-waterfall' ? (
                <DropdownPanel
                  title={sw ? 'Mtiririko wa Faida' : 'Profit Waterfall'}
                  subtitle={sw ? 'Hapa unaona jinsi mauzo, faida na matumizi yanavyoathiri faida ya mwisho.' : 'See how sales, gross profit, and expenses affect the final profit.'}
                  defaultOpen
                  tone="emerald"
                >
                  <ProfitWaterfallChart analytics={analytics} language={language} />
                </DropdownPanel>
              ) : null}

              {summaryView === 'shop-scorecard' ? (
                <DropdownPanel
                  title={sw ? 'Alama za Maduka' : 'Shop Scorecard'}
                  subtitle={sw ? 'Hapa unaona nguvu na udhaifu wa kila duka kwa muhtasari.' : 'See each shop’s strength and weakness in one focused view.'}
                  defaultOpen
                  tone="emerald"
                >
                  <ShopScorecardPanel analytics={analytics} visibleRecommendations={visibleRecommendations} language={language} />
                </DropdownPanel>
              ) : null}
                            {summaryView === 'profit-breakdown' ? (

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
                            ) : null}

                            {summaryView === 'critical-alerts' ? (
                <DropdownPanel
                  title={sw ? 'Tahadhari Muhimu' : 'Critical Alerts'}
                  subtitle={sw ? 'Hapa unaona hatari muhimu pekee zinazohitaji uamuzi wa mmiliki.' : 'Only important risks that need owner attention are shown here.'}
                  badge={`${safeVisibleRecommendations.filter((rec) => rec.priority === 'Critical' || rec.priority === 'High').length} ${sw ? 'tahadhari' : 'alerts'}`}
                  defaultOpen
                  tone="rose"
                >
                  <div className="overflow-x-auto rounded-2xl border border-sky-200 bg-white shadow-sm">
                    <table className="w-full min-w-[1180px] border-collapse text-left text-sm text-slate-800">
                      <thead className="bg-[#075581] text-white">
                        <tr>
                          <th className="px-4 py-3 font-bold">{sw ? 'Tahadhari' : 'Alert'}</th>
                          <th className="px-4 py-3 font-bold">{sw ? 'Hatua ya Kuchukua' : 'Required Action'}</th>
                          <th className="px-4 py-3 font-bold">{sw ? 'Athari za Kifedha (TZS)' : 'Financial Exposure (TZS)'}</th>
                          <th className="px-4 py-3 font-bold">{sw ? 'Ushahidi na Maelezo' : 'Evidence and Details'}</th>
                          <th className="px-4 py-3 font-bold">{sw ? 'Uamuzi wa Mmiliki' : 'Owner Decision'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {safeVisibleRecommendations
                          .filter((rec) => rec.priority === 'Critical' || rec.priority === 'High')
                          .slice(0, 6)
                          .map((rec, index) => (
                            <tr key={rec.id} className={index % 2 ? 'bg-white' : 'bg-[#e9f5fc]'}>
                              <td className="min-w-[230px] px-4 py-2 align-middle text-sm font-bold leading-5 text-slate-950"><span className="line-clamp-2" title={rec.title}>{rec.title}</span></td>
                              <td className="min-w-[250px] px-4 py-2 align-middle text-sm font-medium leading-5"><span className="line-clamp-2" title={alertFinancialDecision(rec, data, sw).action}>{alertFinancialDecision(rec, data, sw).action}</span>
                                
                              </td>
                              <td className="min-w-[205px] px-4 py-2 align-middle text-sm leading-5">
                                {(() => {
                                  const estimate = estimateAlertFinancialExposure(rec, data);
                                  if (!estimate) return <span className="text-slate-500">{sw ? 'Haihusiani na upotevu wa stock' : 'Not a stock-loss forecast'}</span>;
                                  if (!estimate.available) return <span className="text-slate-500">{sw ? 'Hakiki rekodi za mauzo / bidhaa' : 'Verify sales / product records'}</span>;
                                  if (estimate.shortage <= 0) return <span className="font-semibold text-emerald-700">{sw ? 'Stock inatosha kwa siku 7; hakuna mauzo hatarini kwa makadirio haya.' : 'Stock covers 7-day forecast; no sales at risk in this estimate.'}</span>;
                                  return (
                                    <div title={sw ? 'Makadirio ya siku 7 kutokana na wastani wa mauzo ya siku 30; si hasara iliyotokea.' : 'Seven-day forecast from 30-day sales history; not a realized loss.'}>
                                      <div className="font-semibold text-rose-700">{sw ? 'Mauzo yaliyopo hatarini kupotea:' : 'Sales at risk:'} TZS {money(estimate.salesAtRisk)}</div>
                                      <div className="font-semibold text-slate-800">{sw ? 'Faida iliyopo hatarini kupotea:' : 'Profit at risk:'} {estimate.grossProfitAtRisk === null ? '—' : `TZS ${money(estimate.grossProfitAtRisk)}`}</div>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="min-w-[220px] px-4 py-2 align-middle">
                                <details className="rounded-lg border border-slate-200 bg-white">
                                  <summary className="cursor-pointer px-2 py-1.5 text-xs font-semibold text-[#075581]">{sw ? 'Ushahidi / zaidi' : 'Evidence / more'}</summary>
                                  <div className="space-y-3 border-t border-slate-200 px-3 py-3">
                                    <p className="text-sm leading-6 text-slate-700">{rec.evidence || '—'}</p>
                                    {(() => {
                                      const estimate = estimateAlertFinancialExposure(rec, data);
                                      if (!estimate?.available) return <p className="text-xs text-slate-600">{sw ? 'Hakiki bidhaa, rekodi za zamani na mauzo yaliyohifadhiwa kwa jina jingine.' : 'Check product identity, earlier records and alternate names.'}</p>;
                                      return <p className="text-xs leading-5 text-slate-600">{sw
                                        ? `Makadirio ya siku 7: wastani wa siku ${estimate.observedDays} ni ${qtyText(estimate.average30)} kwa siku; siku 7 za karibuni ni ${qtyText(estimate.average7)} kwa siku; stock ${qtyText(estimate.stock)}; upungufu unaokadiriwa ${qtyText(estimate.shortage)}. Haya ni mauzo na faida ghafi zinazoweza kukosekana, si hasara halisi.${estimate.provisional ? ' Makadirio ya awali: historia ni fupi.' : ''}${estimate.partialCost ? ' Baadhi ya rekodi hazina bei ya kununua; makadirio ya faida yana uhakika mdogo.' : ''}`
                                        : `7-day estimate: ${estimate.observedDays}-day observed average ${qtyText(estimate.average30)}/day; recent 7-day average ${qtyText(estimate.average7)}/day; stock ${qtyText(estimate.stock)}; estimated shortfall ${qtyText(estimate.shortage)}. Potential revenue and gross profit, not realized loss.${estimate.provisional ? ' Provisional: limited history.' : ''}${estimate.partialCost ? ' Some historical purchase costs are missing.' : ''}`}</p>;
                                    })()}
                                    <div className="flex flex-wrap gap-2">
                                      <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 font-semibold" onClick={() => handleDecision(rec, 'Snoozed')}>{sw ? 'Ficha siku 7' : 'Snooze 7 days'}</button>
                                      <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 font-semibold" onClick={() => handleDecision(rec, 'Not Relevant')}>{sw ? 'Haihitajiki' : 'Not Relevant'}</button>
                                      <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 font-semibold" onClick={() => handleDecision(rec, 'Note')}>{sw ? 'Weka Maelezo' : 'Add Note'}</button>
                                    </div>
                                  </div>
                                </details>
                              </td>
                              <td className="w-[205px] px-4 py-2 align-middle">
                                <div className="flex flex-wrap gap-1.5">
                                  <button type="button" className="rounded-lg bg-[#075581] px-2 py-1.5 text-xs font-bold text-white hover:bg-[#06466b]" onClick={() => handleDecision(rec, 'Done')}>{sw ? 'Thibitisha Imefanyika' : 'Confirm Completed'}</button>
                                  <button type="button" className="rounded-lg border border-[#075581] bg-white px-2 py-1.5 text-xs font-semibold text-[#075581] hover:bg-sky-50" onClick={() => handleDecision(rec, 'Planned')}>{sw ? 'Weka Kama Imepangwa' : 'Mark as Planned'}</button>
                                  {actions[rec.id]?.status ? <span className={`self-start rounded-full px-3 py-1 text-xs font-bold ${statusBadge(actions[rec.id].status)}`}>{actions[rec.id].status}</span> : null}
                                </div>
                              </td>
                            </tr>
                          ))}
                        {!safeVisibleRecommendations.some((rec) => rec.priority === 'Critical' || rec.priority === 'High') ? (
                          <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-600">{sw ? 'Hakuna tahadhari kubwa kwa sasa.' : 'No critical alerts at the moment.'}</td></tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </DropdownPanel>
              ) : null}

              {summaryView === 'key-comparisons' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SoftTile label={t('grossProfit')} value={`TZS ${money(analytics.grossProfit)}`} className="bg-white/80" />
                  <SoftTile label={t('stockValue')} value={`TZS ${money(analytics.stockValue)}`} className="bg-white/80" />
                  <SoftTile label={t('creditOutstanding')} value={`TZS ${money(analytics.creditOutstanding)}`} className="bg-white/80" />
                  <SoftTile label={t('changeLedger')} value={`TZS ${money(analytics.changeOutstanding)}`} className="bg-white/80" />
                </div>
              ) : null}

              {summaryView === 'today-advisor' ? (
                <DecisionAdvisorPanel
                  data={data}
                  shopFilter={shopFilter}
                  recommendations={safeVisibleRecommendations}
                  analytics={analytics}
                  language={language}
                  isShopScope={isShopScope}
                  onDecision={handleDecision}
                />
              ) : null}

              {summaryView === 'quick-priorities' ? (
                <DropdownPanel title={sw ? 'Mambo ya Haraka kwa Mmiliki' : 'Owner Quick Priorities'} subtitle={sw ? 'Haya ni mambo machache muhimu zaidi, si kila taarifa ya mfumo.' : 'Only the most important current items are shown here.'} badge={`${visibleRecommendations.slice(0, 5).length} ${sw ? 'vitu' : 'items'}`} defaultOpen tone="emerald">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {visibleRecommendations.slice(0, 4).map((rec) => (
                      <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                    ))}
                    {!visibleRecommendations.length ? <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div> : null}
                  </div>
                </DropdownPanel>
              ) : null}
            </>
          ) : null}

          {viewMode === 'grid' ? (
            <>
{summaryView === 'key-comparisons' ? (
  <KpiMiniChartPanel analytics={analytics} language={language} />
) : null}

              {summaryView === 'shop-scorecard' ? (
                <ShopScorecardPanel analytics={analytics} visibleRecommendations={visibleRecommendations} language={language} />
              ) : null}

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
            <BIVisualDashboard analytics={analytics} visibleRecommendations={safeVisibleRecommendations} language={language} />
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

              {summaryView === 'key-comparisons' ? (
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
                            ) : null}
            </>
          ) : null}

          {viewMode === 'products' ? (
            <>
              <DropdownPanel title={t('productCommand')} subtitle={sw ? 'Tafuta bidhaa na chuja hali bila kuonyesha taarifa zote kwa wakati mmoja.' : 'Search and filter product intelligence without clutter.'} badge={`${productRows.length} ${sw ? 'bidhaa' : 'products'}`} defaultOpen tone="emerald">
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {sw
  ? `Bidhaa ${productRows.filter((row) => row.status === 'Risk').length} kati ya ${productRows.length} zipo kwenye hatari, chunguza bidhaa hizo kwa sababu bei au faida zake zinahitaji ukaguzi.`
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
                    { key: 'status', label: t('status'), render: (row) => <span className={`rounded-full px-3 py-1 text-xs font-black ${row.status === 'Risk' ? 'bg-rose-100 text-rose-700' : row.status === 'Watch' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{sw ? (row.status === 'Risk' ? 'Hatari' : row.status === 'Watch' ? 'Ya kuangalia' : 'Nzuri') : row.status}</span> },
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

                <div
                  className="mt-5 overflow-hidden rounded-[24px] border border-emerald-200 bg-white shadow-md shadow-emerald-100/60 ring-1 ring-emerald-50"
                  style={{ fontFamily: 'Inter, "Segoe UI", Arial, sans-serif' }}
                >
                  <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-green-50 px-4 py-3">
                    <h4 className="text-sm font-bold text-slate-950">
                      {sw ? 'Maelezo ya Bidhaa Muhimu' : 'Product Contribution Details'}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {sw
                        ? 'Jedwali hili linaonyesha bidhaa zinavyochangia faida, mauzo, kiasi kilichouzwa na stock iliyopo.'
                        : 'This table explains how each product contributes profit, sales, quantity sold and current stock.'}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-left text-xs [&_tbody_td]:border-r [&_tbody_td]:border-orange-100/80 [&_tbody_td:last-child]:border-r-0">
                      <thead className="bg-emerald-100 text-slate-800">
                        <tr>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Aina' : 'Type'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Bidhaa' : 'Product'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Duka' : 'Shop'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Kiasi Kilichouzwa' : 'Qty Sold'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Idadi ya Mauzo' : 'No. of Sales'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Mauzo' : 'Sales'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Faida' : 'Profit'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Margin' : 'Margin'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Stock Iliyopo' : 'Current Stock'}</th>
                          <th className="border-b border-r border-emerald-200 px-4 py-3 font-bold">{sw ? 'Thamani ya Stock' : 'Stock Value'}</th>
                          <th className="border-b border-emerald-200 px-4 py-3 font-bold">{sw ? 'Maana yake' : 'Meaning'}</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {[
                          ...(analytics.topProducts || []).slice(0, 5).map((item) => ({
                            type: sw ? 'Faida' : 'Profit',
                            productName: item.productName,
                            shopName: item.shopName,
                            qty: item.qty,
                            unit: item.unit || 'pc',
                            transactions: item.transactions || 0,
                            sales: item.sales,
                            profit: item.profit,
                            margin: item.sales > 0 ? (item.profit / item.sales) * 100 : 0,
                            stock: Number(item.stock || 0),
                            stockValue: Number(item.stockValue || 0),
                            meaning: sw
                              ? `Bidhaa hii imechangia faida TZS ${money(item.profit)}. Kiasi kilichouzwa ni ${qtyWithUnit(item.qty || 0, item.unit || 'pc')}. ${
                                  Number(item.transactions || 0) >= 3
                                    ? 'Faida hii imetokana zaidi na bidhaa kuuzwa mara nyingi.'
                                    : (item.sales > 0 && (item.profit / item.sales) * 100 >= 30)
                                      ? 'Faida hii imetokana zaidi na bidhaa kuwa na margin kubwa.'
                                      : 'Faida hii imetokana na mchanganyiko wa kiasi kilichouzwa na margin ya bidhaa.'
                                }`
                              : `This product contributed TZS ${money(item.profit)} profit. Quantity sold was ${qtyWithUnit(item.qty || 0, item.unit || 'pc')}. ${
                                  Number(item.transactions || 0) >= 3
                                    ? 'This profit mainly came from frequent sales.'
                                    : (item.sales > 0 && (item.profit / item.sales) * 100 >= 30)
                                      ? 'This profit mainly came from a high margin.'
                                      : 'This profit came from a mix of quantity sold and product margin.'
                                }`,
                          })),
                          ...(analytics.capitalEfficiency || []).slice(0, 5).map((item) => ({
                            type: sw ? 'Mtaji' : 'Capital',
                            productName: item.productName,
                            shopName: item.shopName,
                            qty: item.qty || item.qtySold || 0,
                            unit: item.unit || 'pc',
                            transactions: item.transactions || 0,
                            sales: item.sales,
                            profit: item.profit,
                            margin: item.sales > 0 ? (item.profit / item.sales) * 100 : 0,
                            stock: item.stock ?? '-',
                            stockValue: item.stockValue,
                            meaning: sw
                              ? Number(item.qty || item.qtySold || 0) <= 0
                                ? `Bidhaa hii ina ${qtyWithUnit(item.stock || 0, item.unit || 'pc')} zenye thamani TZS ${money(item.stockValue)}. Ilinunuliwa tarehe ${item.stockedDate || '-' }, lakini mpaka sasa haijauzwa. Hii inaonyesha uhitaji wake ni mdogo kwenye eneo hili. Ushauri: usinunue tena kwa sasa; uza stock iliyopo kwanza au fikiria kuihamisha duka lenye uhitaji.`
                                : Number(item.transactions || 0) <= 2 && Number(item.margin || 0) >= 30
                                  ? `Bidhaa hii ina faida kubwa, lakini imeuzwa mara chache sana. Faida kwa kila unit inaweza kuwa nzuri, lakini stock ikikaa muda mrefu inafunga mtaji. Ushauri: nunua stock ndogo tu mpaka uone uhitaji unaongezeka.`
                                  : `Bidhaa hii ina ${qtyWithUnit(item.stock || 0, item.unit || 'pc')} zenye thamani TZS ${money(item.stockValue)}. Ilinunuliwa tarehe ${item.stockedDate || '-'}. Mpaka sasa imeuza ${qtyWithUnit(item.qty || item.qtySold || 0, item.unit || 'pc')} tu. Hii inaonyesha bidhaa inazunguka polepole ukilinganisha na stock iliyopo. Ushauri: usiongeze stock nyingi; nunua kidogo sana au hamisha sehemu yenye mauzo zaidi.`
                              : Number(item.qty || item.qtySold || 0) <= 0
                                ? `This product has ${qtyWithUnit(item.stock || 0, item.unit || 'pc')} worth TZS ${money(item.stockValue)}. Purchased on ${item.stockedDate || '-'}, but it has not sold yet. This suggests low demand in this area. Advice: do not buy more for now; sell current stock first or consider transferring it to a shop with demand.`
                                : Number(item.transactions || 0) <= 2 && Number(item.margin || 0) >= 30
                                  ? `This product has a high margin, but it has sold only a few times. Profit per unit may be good, but slow stock ties capital. Advice: buy very low stock until demand improves.`
                                  : `This product has ${qtyWithUnit(item.stock || 0, item.unit || 'pc')} worth TZS ${money(item.stockValue)}. Purchased on ${item.stockedDate || '-'}. So far it has sold only ${qtyWithUnit(item.qty || item.qtySold || 0, item.unit || 'pc')}. This suggests the product is moving slowly compared with current stock. Advice: do not add much stock; buy very little or transfer it to a stronger sales location.`,
                          })),
                        ].map((row, index) => (
                                                    <tr
                            key={`${row.type}-${row.productName}-${row.shopName}-${index}`}
                            className={`align-top transition ${
                              index % 2 === 0
                                ? '[&>td]:bg-orange-50/80'
                                : '[&>td]:bg-white'
                            } hover:[&>td]:bg-orange-100/80`}
                          >
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                                row.type === 'Faida' || row.type === 'Profit'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-violet-50 text-violet-700'
                              }`}>
                                {row.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{row.productName}</td>
                            <td className="px-4 py-3 text-slate-600">{row.shopName}</td>
                            <td className="px-4 py-3 text-slate-700">{qtyWithUnit(row.qty || 0, row.unit || 'pc')}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{row.transactions || 0}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">TZS {money(row.sales || 0)}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">TZS {money(row.profit || 0)}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{Number(row.margin || 0).toFixed(1)}%</td>
                            <td className="px-4 py-3 text-slate-700">{row.stock === '-' ? '-' : qtyWithUnit(row.stock, row.unit || 'pc')}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">TZS {money(row.stockValue || 0)}</td>
                            <td className="px-4 py-3 text-slate-600">{row.meaning}</td>
                          </tr>
                        ))}

                        {!(analytics.topProducts || []).length && !(analytics.capitalEfficiency || []).length ? (
                          <tr>
                            <td colSpan={11} className="px-4 py-5 text-center text-sm text-slate-500">
                              {t('noData')}
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'risk' ? (
            <>
              <div
                className="mb-5 rounded-[24px] border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/70"
                style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
              >
                <div className="flex flex-wrap gap-3 rounded-[22px] bg-slate-50/90 p-2 ring-1 ring-slate-200/80">
                  {[
                    { id: 'reorder-needed', label: sw ? 'Bidhaa za Kuongezwa' : 'Reorder Needed' },
                    { id: 'expired-stock', label: sw ? 'Bidhaa Zilizoisha Muda' : 'Expired Stock' },
                    { id: 'near-expiry-stock', label: sw ? 'Bidhaa Karibu Kuisha Muda' : 'Near Expiry Stock' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRiskView(item.id)}
                      className={`rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                        riskView === item.id
                          ? 'border-rose-600 bg-rose-600 text-white shadow-rose-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                      style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <DropdownPanel
                title={
                  riskView === 'reorder-needed'
                    ? (sw ? 'Bidhaa Zinazohitaji Kuongezwa' : 'Reorder Needed')
                    : riskView === 'expired-stock'
                      ? (sw ? 'Bidhaa Zilizoisha Muda wa Matumizi' : 'Expired Stock')
                      : (sw ? 'Bidhaa Zinazokaribia Kuisha Muda wa Matumizi' : 'Near Expiry Stock')
                }
                subtitle={
                  riskView === 'reorder-needed'
                    ? (sw
                        ? 'Bidhaa ambazo stock yake inaweza kuisha muda mfupi kwa sababu bado zinaonyesha mwenendo wa mauzo.'
                        : 'Products that may run out soon based on sales movement and current stock.')
                    : riskView === 'expired-stock'
                      ? (sw
                          ? 'Bidhaa ambazo tarehe yake ya mwisho wa matumizi tayari imepita.'
                          : 'Products whose expiry date has already passed.')
                      : (sw
                          ? 'Bidhaa ambazo bado hazijaisha muda wa matumizi, lakini zimekaribia tarehe ya mwisho wa matumizi.'
                          : 'Products that have not expired yet, but are close to expiry.')
                }
                badge={`${
                  riskView === 'reorder-needed'
                    ? reorderNeededRecommendations.length
                    : riskView === 'expired-stock'
                      ? expiredStockRecommendations.length
                      : nearExpiryStockRecommendations.length
                } ${sw ? 'vitu' : 'items'}`}
                defaultOpen
                tone="rose"
              >
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-medium leading-5 text-slate-600">
                  {riskView === 'reorder-needed'
                    ? (sw
                        ? 'Hapa unaona bidhaa zinazohitaji kuongezwa kwa sababu stock iliyopo inaweza kuisha muda mfupi, na historia ya mauzo inaonyesha bidhaa hizo bado zinauzika.'
                        : 'This shows products that need restocking where recent sales and history confirm active demand.')
                    : riskView === 'expired-stock'
                      ? (sw
                          ? 'Hapa unaona bidhaa ambazo muda wake wa matumizi umeshapita. Bidhaa hizi zinahitaji kutengwa, kuhakikiwa, kusitishwa kuuzwa, na kuchukuliwa hatua salama.'
                          : 'This shows products that are already expired. Actions include isolating them, confirming stock, stopping sale, and deciding safe disposal or other action.')
                      : (sw
                          ? 'Hapa unaona bidhaa ambazo bado hazijaisha muda wake wa matumizi, lakini zimekaribia. Hatua zinaweza kuwa kuuza mapema, kupunguza bei, kuhamisha kama kuna uhitaji, au kusitisha kununua tena.'
                          : 'This shows products close to expiry. Actions include selling early, discounting, transferring where demand exists, or stopping reorders.')}
                </p>

                <div className="space-y-4">
                  {(riskView === 'reorder-needed'
                    ? reorderNeededRecommendations
                    : riskView === 'expired-stock'
                      ? expiredStockRecommendations
                      : nearExpiryStockRecommendations
                  ).length ? (
                    (riskView === 'reorder-needed'
                      ? reorderNeededRecommendations
                      : riskView === 'expired-stock'
                        ? expiredStockRecommendations
                        : nearExpiryStockRecommendations
                    ).slice(0, 12).map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        rec={rec}
                        actionRecord={actions[rec.id]}
                        onDecision={handleDecision}
                        language={language}
                      />
                    ))
                  ) : (
                    <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div>
                  )}
                </div>
              </DropdownPanel>
            </>
          ) : null}

          {viewMode === 'opportunity' ? (
            <>
              <div
                className="mb-5 rounded-[24px] border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/70"
                style={{ fontFamily: '"Century Gothic", CenturyGothic, Arial, sans-serif' }}
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'stock-transfer', label: sw ? 'Stock Transfer' : 'Stock Transfer' },
                    { id: 'investment', label: sw ? 'Investment Opportunity' : 'Investment Opportunity' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOpportunityView(item.id)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        opportunityView === item.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <DropdownPanel
                title={
                  opportunityView === 'stock-transfer'
                    ? (sw ? 'Stock Transfer' : 'Stock Transfer')
                    : (sw ? 'Investment Opportunity' : 'Investment Opportunity')
                }
                subtitle={
                  opportunityView === 'stock-transfer'
                    ? (sw ? 'Fursa za kuhamisha stock pale ambapo duka moja lina uhitaji na duka jingine lina stock ya ziada.' : 'Stock transfer opportunities where one shop needs stock and another has excess stock.')
                    : (sw ? 'Fursa za kuongeza nguvu kwenye makundi au bidhaa zenye mwenendo mzuri.' : 'Investment opportunities for categories or products showing stronger movement.')
                }
                badge={`${
                  opportunityView === 'stock-transfer'
                    ? stockTransferRecommendations.length
                    : investmentOpportunityRecommendations.length
                } ${sw ? 'fursa' : 'opportunities'}`}
                defaultOpen
                tone="emerald"
              >
                <p className="mb-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {opportunityView === 'stock-transfer'
                    ? (sw
                        ? 'Hapa unaona mapendekezo ya kuhamisha stock. Tutayaboresha zaidi ili yasitokee bila ushahidi wa mauzo na tarehe ya mauzo ya mwisho.'
                        : 'These are stock transfer suggestions. We will further improve them so they appear only with clear sales evidence and last-sale date.')
                    : (sw
                        ? 'Hapa unaona fursa za kuongeza uwekezaji au nguvu kwenye bidhaa na makundi yanayoonyesha mwenendo mzuri.'
                        : 'These are opportunities to increase investment or focus on products and categories showing stronger movement.')}
                </p>

                <div className="grid gap-4 lg:grid-cols-2">
                  {(opportunityView === 'stock-transfer'
                    ? stockTransferRecommendations
                    : investmentOpportunityRecommendations
                  ).length ? (
                    (opportunityView === 'stock-transfer'
                      ? stockTransferRecommendations
                      : investmentOpportunityRecommendations
                    ).slice(0, 12).map((rec) => (
                      <RecommendationCard key={rec.id} rec={rec} actionRecord={actions[rec.id]} onDecision={handleDecision} language={language} />
                    ))
                  ) : (
                    <div className="rounded-3xl bg-white/70 p-5 text-sm text-slate-500">{t('noData')}</div>
                  )}
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
              <div className="mb-5 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-sm">
                <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                      {sw
                        ? 'Kipaumbele cha Sasa'
                        : 'Current Priority'}
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      {visibleRecommendations.length > 0
                        ? sw
                          ? `${visibleRecommendations.length} zinahitaji hatua`
                          : `${visibleRecommendations.length} require action`
                        : sw
                          ? 'Hakuna tahadhari inayosubiri'
                          : 'No alert is waiting'}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-800">
                      {visibleRecommendations.length > 0
                        ? sw
                          ? 'Anza na tahadhari ya kwanza hapa chini. Baada ya kuchukua hatua, bonyeza Thibitisha Imefanyika.'
                          : 'Start with the first alert below. After taking action, select Confirm Completed.'
                        : sw
                          ? 'Taarifa zote muhimu zimepatiwa hatua kwa sasa.'
                          : 'All important alerts have been handled for now.'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="min-w-28 rounded-2xl border border-amber-200 bg-amber-100 px-5 py-4 text-center text-amber-950">
                      <p className="text-3xl font-black">
                        {
                          visibleRecommendations.filter(
                            (rec) =>
                              rec.priority === 'Critical' ||
                              rec.priority === 'High'
                          ).length
                        }
                      </p>

                      <p className="mt-1 text-xs font-bold text-amber-800">
                        {sw ? 'Za Haraka' : 'Urgent'}
                      </p>
                    </div>

                    <div className="min-w-28 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-center text-emerald-950">
                      <p className="text-3xl font-black">
                        {visibleRecommendations.length}
                      </p>

                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        {sw ? 'Zote' : 'Total'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DropdownPanel
                title={
                  sw
                    ? 'Tahadhari Zinazohitaji Hatua'
                    : 'Alerts Requiring Action'
                }
                subtitle={
                  sw
                    ? 'Anza na tahadhari ya kwanza. Thibitisha baada ya hatua kukamilika.'
                    : 'Start with the first alert and confirm when the action is completed.'
                }
                badge={`${visibleRecommendations.length} ${
                  sw
                    ? 'zinahitaji hatua'
                    : 'require action'
                }`}
                defaultOpen
                tone="amber"
              >
                <div className="space-y-4">
                  {visibleRecommendations
                    .slice(0, 12)
                    .map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        rec={rec}
                        actionRecord={actions[rec.id]}
                        onDecision={handleDecision}
                        language={language}
                      />
                    ))}

                  {!visibleRecommendations.length ? (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                      <p className="text-base font-black text-emerald-800">
                        {sw
                          ? 'Hakuna tahadhari inayohitaji hatua kwa sasa.'
                          : 'No alerts require action at the moment.'}
                      </p>
                    </div>
                  ) : null}
                </div>
              </DropdownPanel>

              {warningHistory.some(
                (item) =>
                  item?.eventType === 'AUTO_RESOLVED'
              ) ? (
                <div className="mb-4 rounded-[26px] border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-emerald-800">
                        {sw
                          ? 'Kuna tahadhari zilizotatuliwa'
                          : 'Some warnings have been resolved'}
                      </p>

                      <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700">
                        {sw
                          ? 'Mfumo umeona baadhi ya changamoto hazionekani tena kwenye taarifa za sasa. Angalia Historia ya Tahadhari kwa maelezo.'
                          : 'The system detected that some issues no longer appear in the current data. Check Warning History for details.'}
                      </p>
                    </div>

                    <div className="rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm">
                      {sw
                        ? 'Hili limetatuliwa'
                        : 'Resolved'}
                    </div>
                  </div>
                </div>
              ) : null}

              <DropdownPanel
                title={t('auditTrail')}
                subtitle={t('actionPlanNote')}
                badge={`${auditTrail.length} ${
                  sw ? 'hatua' : 'actions'
                }`}
                defaultOpen={false}
                tone="slate"
              >
                <CompactTable
                  rows={auditTrail.slice(0, 80)}
                  emptyText={t('noAuditTrail')}
                  columns={[
                    {
                      key: 'updatedAt',
                      label: t('actionDate'),
                      render: (row) =>
                        String(
                          row.updatedAt || ''
                        ).slice(0, 10),
                    },
                    {
                      key: 'challenge',
                      label: t('challenge'),
                    },
                    {
                      key: 'status',
                      label: t('status'),
                      render: (row) => (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${statusBadge(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      ),
                    },
                    {
                      key: 'note',
                      label: t('response'),
                    },
                  ]}
                />
              </DropdownPanel>

              <DropdownPanel
                title={
                  sw
                    ? 'Historia ya Tahadhari'
                    : 'Warning History'
                }
                subtitle={
                  sw
                    ? 'Inaonyesha tahadhari zilizorekodiwa, zilizofichwa, na zilizotatuliwa ndani ya mfumo.'
                    : 'Shows recorded, hidden, and resolved warnings inside the system.'
                }
                badge={`${warningHistory.length} ${
                  sw ? 'rekodi' : 'records'
                }`}
                defaultOpen={false}
                tone="emerald"
              >
                <CompactTable
                  rows={warningHistory.slice(0, 120)}
                  emptyText={
                    sw
                      ? 'Hakuna historia ya tahadhari bado.'
                      : 'No warning history yet.'
                  }
                  columns={[
                    {
                      key: 'createdAt',
                      label: sw ? 'Tarehe' : 'Date',
                      render: (row) =>
                        String(
                          row.createdAt || ''
                        ).slice(0, 10),
                    },
                    {
                      key: 'eventType',
                      label: sw ? 'Tukio' : 'Event',
                      render: (row) =>
                        row.eventType ===
                        'AUTO_RESOLVED'
                          ? sw
                            ? 'Limetatuliwa'
                            : 'Resolved'
                          : sw
                            ? 'Hatua Imehifadhiwa'
                            : 'Action Recorded',
                    },
                    {
                      key: 'shopName',
                      label: t('shopLabel'),
                    },
                    {
                      key: 'challenge',
                      label: t('challenge'),
                    },
                    {
                      key: 'message',
                      label: sw
                        ? 'Ujumbe'
                        : 'Message',
                    },
                    {
                      key: 'status',
                      label: t('status'),
                      render: (row) => (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${statusBadge(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      ),
                    },
                  ]}
                />
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
                         {aiError ? (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-700">
                {aiError}
              </div>
            ) : null}

            {aiConversation.length ? (
              <div className="mt-4 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {sw ? 'Mazungumzo ya AI' : 'AI Conversation'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {sw
                        ? 'AI inatumia mazungumzo haya kusaidia maswali ya kufuatilia.'
                        : 'The AI uses this conversation to support follow-up questions.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAiConversation([]);
                      setAiAnswer('');
                      setAiError('');
                    }}
                    className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
                  >
                    {sw ? 'Futa mazungumzo' : 'Clear'}
                  </button>
                </div>

                <div className="space-y-3">
                  {aiConversation.map((item, idx) => {
                    const isUser = item.role === 'user';

                    return (
                      <div
                        key={`${item.createdAt || idx}-${idx}`}
                        className={`rounded-2xl p-4 text-sm leading-7 ${
                          isUser
                            ? 'bg-blue-50 text-blue-950'
                            : 'bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="mb-1 text-xs font-black uppercase tracking-wide opacity-70">
                          {isUser ? (sw ? 'Swali la Mmiliki' : 'Owner Question') : 'AI'}
                        </div>
                        <div className="whitespace-pre-wrap">{item.content}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            </DropdownPanel>
          ) : null}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
