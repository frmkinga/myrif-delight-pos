import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import { GasBusinessSection, GasDashboardCard, GasReportBlock, buildGasRecord, getGasDashboardSummary } from './GasBusinessSection';
import {
  ShoppingCart,
  AlertTriangle,
  LogOut,
  PlusCircle,
  Pencil,
  Trash2,
  Wallet,
  HandCoins,
  QrCode,
  ChevronLeft,
  Building2,
} from 'lucide-react';

const STORAGE_KEY = 'rafikiai_multi_shop_pos_v10';
const STORAGE_PRODUCTS_KEY = 'rafikiai_products';
const STORAGE_SALES_KEY = 'rafikiai_sales';
const STORAGE_PURCHASES_KEY = 'rafikiai_purchases';
const STORAGE_EXPENSES_KEY = 'rafikiai_expenses';
const STORAGE_CREDIT_KEY = 'rafikiai_credit_sales';
const STORAGE_CHANGE_KEY = 'rafikiai_change_ledger';
const STORAGE_MOBILE_MONEY_KEY = 'rafikiai_mobile_money';
const STORAGE_GAS_KEY = 'rafikiai_gas_business';
const STORAGE_META_KEY = 'rafikiai_storage_meta';
const STORAGE_SYNC_QUEUE_KEY = 'rafikiai_sync_queue';
const STORAGE_LAST_SYNC_KEY = 'rafikiai_last_sync';
const STORAGE_SESSION_KEY = 'rafikiai_current_user';
const DB_NAME = 'rafikiai_pos_db';
const DB_VERSION = 1;
const DB_STORE = 'pos_data';
const DB_DATA_KEY = 'app_data';
const APP_BACKUP_VERSION = 'v9';
const BACKUP_KEYS = [
  'rafikiai_multi_shop_pos_backup_1',
  'rafikiai_multi_shop_pos_backup_2',
  'rafikiai_multi_shop_pos_backup_3',
  'rafikiai_multi_shop_pos_backup_4',
  'rafikiai_multi_shop_pos_backup_5',
];
const DEFAULT_LANGUAGE = 'sw';
const MOBILE_PROVIDERS = ['M-Pesa', 'Mixx by Yas', 'Airtel Money', 'HaloPesa'];
const BANKS = ['CRDB', 'NMB', 'NBC', 'Equity', 'Absa', 'Stanbic', 'Exim', 'DTB', 'Azania'];
const GAS_TYPES = ['Taifa Gas', 'Oryx Gas', 'Mihan / Taifa Gas', 'O Gas', 'Other'];
const GAS_CYLINDER_SIZES = ['Small Cylinder', 'Big Cylinder'];
const t = (language, en, sw) => (language === 'sw' ? sw : en);
function readStorage(key, fallback = null) {
try {
const raw = localStorage.getItem(key);
if (raw === null) return fallback;
return JSON.parse(raw);
} catch {
return fallback;
}
}
function readSyncQueue() {
  return readStorage(STORAGE_SYNC_QUEUE_KEY, []);
}

function writeSyncQueue(queue) {
  writeStorage(STORAGE_SYNC_QUEUE_KEY, queue);
}

function addToSyncQueue(actionType, payload) {
  const queue = readSyncQueue();

  const payloadId = payload?.id || '';
  const alreadyExists = queue.some(
    (item) =>
      item.actionType === actionType &&
      (item.payload?.id || '') === payloadId &&
      item.synced === false
  );

  if (alreadyExists) return;

  queue.push({
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actionType,
    payload,
    createdAt: Date.now(),
    synced: false,
  });

  writeSyncQueue(queue);
}

function clearSyncedQueueItems() {
  const queue = readSyncQueue();
  const remaining = queue.filter((item) => !item.synced);
  writeSyncQueue(remaining);
}

async function processSyncQueue() {
  const queue = readSyncQueue();

  if (!queue.length) return;

  const updatedQueue = [...queue];

  for (let i = 0; i < updatedQueue.length; i += 1) {
    const item = updatedQueue[i];

    if (item.synced) continue;

    try {
      if (item.actionType === 'sale_created') {
        await supabase.from('sales').upsert(
          [
            {
              id: item.payload.id,
              shop_id: item.payload.shop_id,
              items: item.payload.items,
              total: item.payload.total,
              type: item.payload.type,
              date: item.payload.date,
              created_at: item.payload.created_at || new Date().toISOString(),
            },
          ],
          { onConflict: 'id' }
        );
if (Array.isArray(item.payload.products)) {
  const safeProductRows = item.payload.products
    .filter((p) => p.id && p.shop_id && p.name)
    .map((p) => ({
      id: p.id,
      name: String(p.name || '').trim(),
      buyingprice: Number(p.buyPrice || 0),
      sellingprice: Number(p.sellPrice || 0),
      stock: Number(p.stockBaseQty || 0),
      shop_id: p.shop_id,
      baseunit: p.baseUnit || 'pc',
      created_at: p.created_at || new Date().toISOString(),
    }));

  if (safeProductRows.length) {
    await supabase
      .from('products')
      .upsert(safeProductRows, { onConflict: 'id' });
  }
}
      } else if (item.actionType === 'purchase_created') {
        await supabase.from('purchases').upsert([item.payload], { onConflict: 'id' });
      } else if (item.actionType === 'expense_created') {
        await supabase.from('expenses').upsert([item.payload], { onConflict: 'id' });
      } else if (item.actionType === 'credit_created') {
        await supabase.from('creditSales').upsert([item.payload], { onConflict: 'id' });
      } else if (item.actionType === 'mobile_money_created') {
        await supabase.from('mobileMoneyEntries').upsert([item.payload], { onConflict: 'id' });
      } else if (item.actionType === 'gas_created') {
        await supabase.from('gasEntries').upsert([item.payload], { onConflict: 'id' });
      }

      updatedQueue[i] = {
        ...item,
        synced: true,
        syncedAt: Date.now(),
      };
    } catch (error) {
      console.error('Sync failed for queue item:', item, error);
    }
  }

  writeSyncQueue(updatedQueue);
  clearSyncedQueueItems();
}
function writeStorage(key, value) {
if (value === null || value === undefined) {
localStorage.removeItem(key);
return;
}
localStorage.setItem(key, JSON.stringify(value));
}
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function writeToDB(key, value) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readwrite');
    const store = transaction.objectStore(DB_STORE);
    const request = store.put(value, key);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

async function readFromDB(key) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readonly');
    const store = transaction.objectStore(DB_STORE);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}
const cn = (...classes) => classes.filter(Boolean).join(' ');
const currency = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));
const formatQty = (value) => {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
};
const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const startOfDay = (date) => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const startOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;

  const today = startOfDay(new Date());
  const expiry = startOfDay(expiryDate);

  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
function filterByPreset(items, preset, customDate) {
  const now = startOfDay(new Date());
  return items.filter((item) => {
    const d = startOfDay(new Date(item.date || item.createdAt || todayISO()));
    if (preset === 'today') return d.getTime() === now.getTime();
    if (preset === 'yesterday') return d.getTime() === addDays(now, -1).getTime();
    if (preset === 'date') {
  const value = item.date || item.createdAt || todayISO();
  if (typeof customDate === 'object' && customDate?.start && customDate?.end) {
    return value >= customDate.start && value <= customDate.end;
  }
  return value === customDate;
}
    if (preset === 'week') return d >= addDays(now, -6) && d <= now;
    if (preset === 'month') return d >= startOfMonth(now) && d <= now;
    if (preset === '3months') return d >= addDays(now, -89) && d <= now;
    if (preset === '6months') return d >= addDays(now, -179) && d <= now;
    if (preset === 'year') return d >= addDays(now, -364) && d <= now;
    return true;
  });
}

function makeSubUnits(unit, sellPrice, raw = '0.5,0.25') {
  const values = String(raw || '')
    .split(',')
    .map((x) => Number(x.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0 && n < 1);

  const uniqueValues = Array.from(new Set(values)).sort((a, b) => b - a);
  const baseLabel = unit === 'pc' ? '1pc' : unit === 'kg' ? '1kg' : '1ltr';
  const base = [{ id: `${unit}-1`, label: baseLabel, qty: 1, sellPrice: Number(sellPrice || 0) }];
  const subs = uniqueValues.map((qty, idx) => ({
    id: `${unit}-${idx}-${qty}`,
    label: `${formatQty(qty)}${unit}`,
    qty,
    sellPrice: Math.round(Number(sellPrice || 0) * qty),
  }));
  return [...base, ...subs];
}

const emptyProductRow = {
  id: '',
  name: '',
  unit: '',
  buyPrice: '',
  sellPrice: '',
  stockQty: '',
  minStockLevel: '5',
  expiryDate: '',
  subUnits: '0.75,0.5,0.25',
  qrCode: '',
};
const emptyPurchaseRow = { id: '', productId: '', quantity: '', unitCost: '', date: todayISO(), notes: '' };
const emptyExpenseRow = { id: '', title: '', amount: '', category: '', date: todayISO(), notes: '' };
const emptyCreditRow = { id: '', customerName: '', amount: '', phone: '', notes: '' };
const emptyChangeRow = { id: '', customerName: '', amountOwed: '', notes: '' };
const emptyNetworkRow = { provider: 'M-Pesa', float: '', commission: '' };
const emptyBankRow = { bankName: 'CRDB', float: '', commission: '' };
const emptyGasForm = {
  id: '',
  date: todayISO(),
  gasType: 'Taifa Gas',
  cylinderSize: 'Small Cylinder',
  totalCylinders: '',
  smallCylindersTotal: '',
  bigCylindersTotal: '',
  smallCylindersWithGas: '',
  bigCylindersWithGas: '',
  smallEmptyCylinders: '',
  bigEmptyCylinders: '',
  smallGasSoldToday: '',
  bigGasSoldToday: '',
  smallGasBuyPrice: '',
  smallGasSellPrice: '',
  bigGasBuyPrice: '',
  bigGasSellPrice: '',
};
const seedData = {
  currentUser: null,
  shops: [
    { id: 'shop-1', name: 'Nyumbani Shop' },
    { id: 'shop-2', name: 'Mkwajuni Shop' },
    { id: 'shop-3', name: 'Kwa Maganga Shop' },
    { id: 'shop-4', name: 'Shangwe Shop' },
    { id: 'shop-5', name: 'Mungu Mwema Shop' },
  ],
  users: [
  { id: 'u-owner', username: 'admin', email: 'admin@12345.com', password: 'admin123', role: 'owner', shop_id: null, name: 'Owner Admin' },
  { id: 'u-1', username: 'shop1', email: 'nyumbani@shop1.com', password: '1234', role: 'shop', shop_id: 'shop-1', shopId: 'shop-1', name: 'Nyumbani User' },
  { id: 'u-2', username: 'shop2', email: 'mkwajuni@shop2.com', password: '1234', role: 'shop', shop_id: 'shop-2', shopId: 'shop-2', name: 'Mkwajuni User' },
  { id: 'u-3', username: 'shop3', email: 'kwamaganga@shop3.com', password: '1234', role: 'shop', shop_id: 'shop-3', shopId: 'shop-3', name: 'Kwa Maganga User' },
  { id: 'u-4', username: 'shop4', email: 'shangwe@shop4.com', password: '1234', role: 'shop', shop_id: 'shop-4', shopId: 'shop-4', name: 'Shangwe User' },
  { id: 'u-5', username: 'shop5', email: 'mungumwema@shop5.com', password: '1234', role: 'shop', shop_id: 'shop-5', shopId: 'shop-5', name: 'Mungu Mwema User' },
],
  products: [],
  sales: [],
  creditSales: [],
  changeLedger: [],
  expenses: [],
    purchases: [],
  mobileMoneyEntries: [],
  gasEntries: [],
};

function getLegacyData() {
  const legacyProducts = readStorage('products', []);
  const legacySales = readStorage('sales', []);
  const legacyExpenses = readStorage('expenses', []);
  const legacyCredits = readStorage('credits', []);
  return {
    products: Array.isArray(legacyProducts) ? legacyProducts : [],
    sales: Array.isArray(legacySales) ? legacySales : [],
    expenses: Array.isArray(legacyExpenses) ? legacyExpenses : [],
    creditSales: Array.isArray(legacyCredits) ? legacyCredits : [],
  };
}

function normalizeProduct(product) {
  const {
    shopId,
    shopid,
    stockQty,
    unit,
    ...rest
  } = product || {};

  const baseUnit = rest.baseUnit || unit || 'pc';
  const sellPrice = Number(rest.sellPrice || 0);
  const normalizedShopId = rest.shop_id || shopId || shopid || '';
  let rawSubUnits = rest.subUnitsRaw || '';

  if (!rawSubUnits) {
    if (Array.isArray(rest.subUnits) && rest.subUnits.length > 0) {
      rawSubUnits = rest.subUnits
        .map((x) => Number(x.qty))
        .filter((qty) => qty > 0 && qty < 1)
        .sort((a, b) => b - a)
        .join(',');
    } else if (baseUnit === 'kg' || baseUnit === 'ltr') {
      rawSubUnits = '0.75,0.5,0.25';
    }
  }

      return {
    ...rest,
    name: String(rest.name || '').trim(),
    shop_id: normalizedShopId,
    baseUnit,
    buyPrice: Number(rest.buyPrice || 0),
    sellPrice,
    stockBaseQty: Number(rest.stockBaseQty || stockQty || 0),
    minStockLevel: Number(rest.minStockLevel || 5),
    expiryDate: rest.expiryDate || '',
    qrCode: rest.qrCode || '',
    subUnitsRaw: rawSubUnits,
    subUnits: makeSubUnits(baseUnit, sellPrice, rawSubUnits),
    createdAt: rest.createdAt || '',
  };
}

function normalizeData(parsed = {}) {
  return {
    ...seedData,
    ...parsed,
    products: Array.isArray(parsed.products) ? parsed.products.map(normalizeProduct) : [],
    sales: Array.isArray(parsed.sales) ? parsed.sales : [],
    creditSales: Array.isArray(parsed.creditSales) ? parsed.creditSales : [],
    changeLedger: Array.isArray(parsed.changeLedger) ? parsed.changeLedger : [],
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
    mobileMoneyEntries: Array.isArray(parsed.mobileMoneyEntries) ? parsed.mobileMoneyEntries : [],
    gasEntries: Array.isArray(parsed.gasEntries) ? parsed.gasEntries : [],
  };
}

async function readData() {
  try {
    if (navigator.onLine) {
  try {
    const savedSessionUser = readStorage(STORAGE_SESSION_KEY, null);
    const {
  data: { session },
} = await supabase.auth.getSession();

let sessionShopId = savedSessionUser?.shop_id || savedSessionUser?.shopId || null;

if (session?.user?.id) {
  const { data: shopUserRow } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('id', session.user.id)
    .maybeSingle();

  if (shopUserRow?.shop_id) {
    sessionShopId = shopUserRow.shop_id;
  }
}

    let productsQuery = supabase.from('products').select('*');
    let salesQuery = supabase.from('sales').select('*');
    let purchasesQuery = supabase.from('purchases').select('*');
    let expensesQuery = supabase.from('expenses').select('*');
    let creditQuery = supabase.from('creditSales').select('*');
    let mobileMoneyQuery = supabase.from('mobileMoneyEntries').select('*');
    let gasQuery = supabase.from('gasEntries').select('*');

    if (sessionShopId) {
      productsQuery = productsQuery.eq('shop_id', sessionShopId);
      salesQuery = salesQuery.eq('shop_id', sessionShopId);
      purchasesQuery = purchasesQuery.eq('shop_id', sessionShopId);
      expensesQuery = expensesQuery.eq('shop_id', sessionShopId);
      creditQuery = creditQuery.eq('shop_id', sessionShopId);
      mobileMoneyQuery = mobileMoneyQuery.eq('shop_id', sessionShopId);
      gasQuery = gasQuery.eq('shop_id', sessionShopId);
    }

    const [
      { data: cloudProducts },
      { data: cloudSales },
      { data: cloudPurchases },
      { data: cloudExpenses },
      { data: cloudCreditSales },
      { data: cloudMobileMoneyEntries },
      { data: cloudGasEntries },
    ] = await Promise.all([
      productsQuery,
      salesQuery,
      purchasesQuery,
      expensesQuery,
      creditQuery,
      mobileMoneyQuery,
      gasQuery,
    ]);

    const normalized = normalizeData({
      ...seedData,
      currentUser: savedSessionUser,
      products: (cloudProducts || []).map((p) => ({
  id: p?.id || '',
  name: String(p?.name || '').trim(),
  buyPrice: Number(p?.buyingprice || p?.buyPrice || 0),
  sellPrice: Number(p?.sellingprice || p?.sellPrice || 0),
  stockBaseQty: Number(p?.stock || p?.stockBaseQty || p?.stockQty || 0),
  stockQty: Number(p?.stock || p?.stockBaseQty || p?.stockQty || 0),
  shop_id: String(p?.shop_id || p?.shopId || p?.shopid || '').trim(),
  baseUnit: p?.baseunit || p?.baseUnit || 'pc',
  minStockLevel: Number(p?.minStockLevel || 5),
  expiryDate: p?.expiryDate || '',
  qrCode: p?.qrCode || '',
  subUnitsRaw: p?.subUnitsRaw || '',
  archived: Boolean(p?.archived),
  createdAt: p?.createdAt || (p?.created_at ? String(p.created_at).slice(0, 10) : ''),
  confirmed: true,
})),
      sales: (cloudSales || []).map((s) => ({
        ...s,
        shop_id: s?.shop_id || s?.shopid || '',
        date: s?.date || (s?.created_at ? String(s.created_at).slice(0, 10) : todayISO()),
      })),
      purchases: (cloudPurchases || []).map((p) => ({
        ...p,
        shop_id: p?.shop_id || p?.shopid || '',
        date: p?.date || (p?.created_at ? String(p.created_at).slice(0, 10) : todayISO()),
      })),
      expenses: (cloudExpenses || []).map((e) => ({
        id: e?.id || '',
        shop_id: e?.shop_id || e?.shopid || '',
        title: e?.title || e?.description || '',
        description: e?.description || e?.title || '',
        amount: Number(e?.amount || 0),
        category: e?.category || '',
        date: e?.date || (e?.created_at ? String(e.created_at).slice(0, 10) : todayISO()),
        notes: e?.notes || '',
        created_at: e?.created_at || '',
      })),
      creditSales: cloudCreditSales || [],
      mobileMoneyEntries: cloudMobileMoneyEntries || [],
      gasEntries: cloudGasEntries || [],
    });

    await writeToDB(DB_DATA_KEY, normalized);
    return normalized;
  } catch (error) {
    console.error('Cloud read failed, falling back to local:', error);
  }
}

    console.log('Reading data from localStorage first...');

    const raw = readStorage(STORAGE_KEY);

    if (raw) {
      const separateProducts = readStorage(STORAGE_PRODUCTS_KEY, null);
      const separateSales = readStorage(STORAGE_SALES_KEY, null);
      const separatePurchases = readStorage(STORAGE_PURCHASES_KEY, null);
      const separateExpenses = readStorage(STORAGE_EXPENSES_KEY, null);
      const separateCredit = readStorage(STORAGE_CREDIT_KEY, null);
      const separateChange = readStorage(STORAGE_CHANGE_KEY, null);
      const separateMobileMoney = readStorage(STORAGE_MOBILE_MONEY_KEY, null);
      const separateGas = readStorage(STORAGE_GAS_KEY, null);

           const savedSessionUser = readStorage(STORAGE_SESSION_KEY, null);

const fallbackProducts = (separateProducts || raw.products || []).filter(
  (p) =>
    !savedSessionUser?.shop_id ||
    String(p.shop_id || '') === String(savedSessionUser?.shop_id || savedSessionUser?.shopId || '')
);

const normalized = normalizeData({
  ...raw,
  currentUser: savedSessionUser,
  products: fallbackProducts,
  sales: separateSales || raw.sales,
  purchases: separatePurchases || raw.purchases,
    expenses: (separateExpenses || raw.expenses || []).filter(
    (e) =>
      !savedSessionUser?.shop_id ||
      String(e.shop_id || e.shopId || e.shopid || '') === String(savedSessionUser.shop_id)
  ),
  creditSales: separateCredit || raw.creditSales,
  changeLedger: separateChange || raw.changeLedger,
  mobileMoneyEntries: separateMobileMoney || raw.mobileMoneyEntries,
  gasEntries: separateGas || raw.gasEntries,
});

      await writeToDB(DB_DATA_KEY, normalized);
      return normalized;
    }

    console.log('No localStorage data found, checking IndexedDB...');
    const dbData = await readFromDB(DB_DATA_KEY);

    if (dbData) {
      return normalizeData(dbData);
    }

    const fallbackData = normalizeData(seedData);
    await writeToDB(DB_DATA_KEY, fallbackData);
    return fallbackData;
  } catch (error) {
    console.error('readData failed:', error);
    return normalizeData(seedData);
  }
}

function AppShell({ children }) {
  return <div className="min-h-screen bg-slate-50 p-4 md:p-6">{children}</div>;
}
function Card({ className = '', children }) {
  return <div className={cn('rounded-3xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>;
}
function CardHeader({ className = '', children }) {
  return <div className={cn('p-6 pb-3', className)}>{children}</div>;
}
function CardTitle({ className = '', children }) {
  return <h3 className={cn('text-xl font-semibold text-slate-900', className)}>{children}</h3>;
}
function CardContent({ className = '', children }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}
function Button({ className = '', variant = 'default', size = 'default', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  };
  const sizes = { default: 'h-10 px-4 text-sm', sm: 'h-9 px-3 text-sm' };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400',
        className,
      )}
      {...props}
    />
  );
}
function Label({ className = '', children }) {
  return <label className={cn('mb-1 block text-sm font-medium text-slate-700', className)}>{children}</label>;
}
function TabsList({ children }) {
  return <div className="mb-6 flex flex-wrap gap-2 rounded-3xl bg-white p-2 shadow-sm">{children}</div>;
}
function TabsTrigger({ value, activeValue, onClick, children }) {
  const active = value === activeValue;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl px-4 py-2 text-sm transition-colors',
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      )}
    >
      {children}
    </button>
  );
}
function TabsContent({ value, activeValue, children }) {
  return value === activeValue ? <div>{children}</div> : null;
}
function StatCard({ title, value, subtitle = '', icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
{subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Login({ onLogin, users, language, setLanguage }) {
  const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
  const [error, setError] = useState('');

    const submit = async (e) => {
    e.preventDefault();

    const found = users.find((u) => u.username === username);

    if (!found || !found.email) {
      return setError(t(language, 'Wrong username or password.', 'Jina la mtumiaji au nenosiri si sahihi.'));
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: found.email,
      password,
    });

    if (authError) {
      return setError(t(language, 'Wrong username or password.', 'Jina la mtumiaji au nenosiri si sahihi.'));
    }

    setError('');
    onLogin(found);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md pt-12">
        <Card>
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <CardTitle>{t(language, 'Multi-Shop POS', 'POS ya Maduka Mengi')}</CardTitle>
                <p className="mt-2 text-sm text-slate-500">
                  {t(language, 'Simple kiosk and wakala management.', 'Usimamizi rahisi wa kioski na wakala.')}
                </p>
              </div>
              <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="sw">Kiswahili</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>{t(language, 'Username', 'Jina la mtumiaji')}</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <Label>{t(language, 'Password', 'Nenosiri')}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {t(language, 'Login', 'Ingia')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function getMobileCapital(entry) {
  return Number(entry.mobileCashTotal || 0) + (entry.networks || []).reduce((a, n) => a + Number(n.float || 0), 0);
}
function getBankCapital(entry) {
  return Number(entry.bankCashTotal || 0) + (entry.banks || []).reduce((a, n) => a + Number(n.float || 0), 0);
}
function getMobileFloatTotal(entry) {
  return (entry.networks || []).reduce((a, n) => a + Number(n.float || 0), 0);
}

function getBankFloatTotal(entry) {
  return (entry.banks || []).reduce((a, n) => a + Number(n.float || 0), 0);
}

function getMobileCommissionTotal(entry) {
  return (entry.networks || []).reduce((a, n) => a + Number(n.commission || 0), 0);
}

function getBankCommissionTotal(entry) {
  return (entry.banks || []).reduce((a, n) => a + Number(n.commission || 0), 0);
}

function getFloatStatus(capital, floatTotal, commissionTotal, language) {
  const diff = Number(floatTotal || 0) - Number(capital || 0);

  if (diff === 0) {
    return t(language, 'Balanced', 'Imesawazika');
  }

  if (diff > 0) {
    return `${t(language, 'Warning: Float exceeds capital by TZS', 'Tahadhari: Float imezidi mtaji kwa TZS')} ${currency(diff)}`;
  }

  const gap = Math.abs(diff);
  if (commissionTotal > 0 && gap === Number(commissionTotal || 0)) {
    return `${t(language, 'Below capital, explained by commission: TZS', 'Chini ya mtaji, imeelezwa na kamisheni: TZS')} ${currency(commissionTotal)}`;
  }

  return `${t(language, 'Warning: Float is below capital by TZS', 'Tahadhari: Float iko chini ya mtaji kwa TZS')} ${currency(gap)}`;
}
function getLatestEntryForShop(entries, shopId) {
  const shopEntries = entries
    .filter((e) => String(e.shop_id) === String(shopId))
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return shopEntries[0] || null;
}

function OwnerDashboard({ data, setAppData, openShop, logout, exportBackup, importBackup, ownerPeriod, setOwnerPeriod, language, setLanguage }) {
const [currentPasswordInput, setCurrentPasswordInput] = useState('');
const [newPasswordInput, setNewPasswordInput] = useState('');
const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
const [passwordMessage, setPasswordMessage] = useState('');
const changeAdminPassword = () => {
  const ownerUser = data.users.find((u) => u.role === 'owner');

  if (!ownerUser) {
    setPasswordMessage(t(language, 'Owner account not found.', 'Akaunti ya mmiliki haikupatikana.'));
    return;
  }

  if (currentPasswordInput !== ownerUser.password) {
    setPasswordMessage(t(language, 'Current password is incorrect.', 'Nenosiri la sasa si sahihi.'));
    return;
  }

  if (!newPasswordInput.trim()) {
    setPasswordMessage(t(language, 'New password cannot be empty.', 'Nenosiri jipya haliwezi kuwa tupu.'));
    return;
  }

  if (newPasswordInput !== confirmPasswordInput) {
    setPasswordMessage(t(language, 'New passwords do not match.', 'Manenosiri mapya hayalingani.'));
    return;
  }

  const nextUsers = data.users.map((u) =>
    u.role === 'owner'
      ? { ...u, password: newPasswordInput }
      : u
  );

  const nextData = {
    ...data,
    users: nextUsers,
  };

  writeStorage(STORAGE_KEY, nextData);
setAppData(nextData);
  setPasswordMessage(t(language, 'Password changed successfully.', 'Nenosiri limebadilishwa kwa mafanikio.'));
  setCurrentPasswordInput('');
  setNewPasswordInput('');
  setConfirmPasswordInput('');
};
  const salesPeriod = filterByPreset(data.sales, ownerPeriod, todayISO());
  const expensesPeriod = filterByPreset(data.expenses, ownerPeriod, todayISO());
  const totalSales = salesPeriod.reduce((a, s) => a + Number(s.total || 0), 0);
  const totalExpenses = expensesPeriod.reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalRetailProfit = salesPeriod.reduce((sum, sale) => {
  return sum + (sale.items || []).reduce((itemSum, item) => {
    const qty = Number(item.quantity || 0);
    const sellPrice = Number(item.sellPrice ?? item.price ?? 0);
    const buyPrice = Number(item.buyPrice ?? 0);
    return itemSum + qty * (sellPrice - buyPrice);
  }, 0);
}, 0);

const totalProfit = totalRetailProfit - totalExpenses;
const totalGasProfit = (data.gasEntries || [])
  .filter((x) => filterByPreset([x], ownerPeriod, todayISO()).length > 0)
  .reduce((a, x) => {
    const small =
      (Number(x.smallGasSellPrice || 0) - Number(x.smallGasBuyPrice || 0)) *
      Number(x.smallGasSoldToday || 0);

    const big =
      (Number(x.bigGasSellPrice || 0) - Number(x.bigGasBuyPrice || 0)) *
      Number(x.bigGasSoldToday || 0);

    return a + small + big;
  }, 0);

const totalWakalaCommission = (data.mobileMoneyEntries || [])
  .filter((x) => filterByPreset([x], ownerPeriod, todayISO()).length > 0)
  .reduce((a, x) => {
    const mobileCommission = (x.networks || []).reduce((sum, n) => sum + Number(n.commission || 0), 0);
    const bankCommission = (x.banks || []).reduce((sum, b) => sum + Number(b.commission || 0), 0);
    return a + mobileCommission + bankCommission;
  }, 0);

const totalBusinessProfit = totalProfit + totalGasProfit + totalWakalaCommission;
  const latestPerShop = data.shops.map((shop) => getLatestEntryForShop(data.mobileMoneyEntries, shop.id)).filter(Boolean);
  const totalMobileCapital = latestPerShop.reduce((a, entry) => a + getMobileCapital(entry), 0);
  const totalBankCapital = latestPerShop.reduce((a, entry) => a + getBankCapital(entry), 0);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t(language, 'Owner Dashboard', 'Dashibodi ya Mmiliki')}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t(language, 'Open any shop and view its kiosk and wakala performance.', 'Fungua duka lolote na uone kioski na wakala wake.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="sw">Kiswahili</option>
            <option value="en">English</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={ownerPeriod} onChange={(e) => setOwnerPeriod(e.target.value)}>
            <option value="today">{t(language, 'Today', 'Leo')}</option>
            <option value="yesterday">{t(language, 'Yesterday', 'Jana')}</option>
            <option value="week">{t(language, 'Week', 'Wiki')}</option>
            <option value="month">{t(language, 'Month', 'Mwezi')}</option>
            <option value="3months">{t(language, '3 Months', 'Miezi 3')}</option>
            <option value="6months">{t(language, '6 Months', 'Miezi 6')}</option>
            <option value="year">{t(language, 'Year', 'Mwaka')}</option>
          </select>
          <Button variant="outline" onClick={exportBackup}>
  {t(language, 'Export Backup', 'Pakua Backup')}
</Button>

<Button variant="outline" onClick={importBackup}>
  {t(language, 'Import Backup', 'Rejesha Backup')}
</Button>

<Button variant="outline" onClick={logout}>
  <LogOut className="mr-2 h-4 w-4" />
  {t(language, 'Logout', 'Toka')}
</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title={t(language, 'Total Sales Today', 'Jumla ya Mauzo Leo')} value={`TZS ${currency(totalSales)}`} icon={ShoppingCart} />     
<StatCard title={t(language, 'Total Expenses Today', 'Jumla ya Matumizi Leo')} value={`TZS ${currency(totalExpenses)}`} icon={AlertTriangle} />
        <StatCard title={t(language, 'Profit Today', 'Faida ya Leo')} value={`TZS ${currency(totalProfit)}`} icon={Wallet} />
  
<StatCard title={t(language, 'Total Capital for Mobile Money', 'Jumla ya Mtaji wa Simu')} value={`TZS ${currency(totalMobileCapital)}`} icon={HandCoins} />
        <StatCard title={t(language, 'Total Capital for Banks', 'Jumla ya Mtaji wa Benki')} value={`TZS ${currency(totalBankCapital)}`} icon={Building2} />
      </div>
<Card className="mt-6">
  <CardHeader>
    <CardTitle>{t(language, 'Business Profit Breakdown', 'Muhtasari wa Faida za Biashara')}</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid gap-3 md:grid-cols-4 text-sm">
      <div className="rounded-2xl bg-slate-50 p-3">
        {t(language, 'Retail Profit', 'Faida ya Duka')}: TZS {currency(totalProfit)}
      </div>

      <div className="rounded-2xl bg-slate-50 p-3">
        {t(language, 'Gas Profit', 'Faida ya Gesi')}: TZS {currency(totalGasProfit)}
      </div>

      <div className="rounded-2xl bg-slate-50 p-3">
        {t(language, 'Wakala Commission', 'Kamisheni ya Wakala')}: TZS {currency(totalWakalaCommission)}
      </div>

      <div className="rounded-2xl bg-slate-100 p-3 font-semibold">
        {t(language, 'Total Business Profit', 'Jumla ya Faida za Biashara')}: TZS {currency(totalBusinessProfit)}
      </div>
    </div>
  </CardContent>
</Card>
      <div className="mt-6 grid gap-4 lg:grid-cols-3 text-base">
        {data.shops.map((shop) => {
          const shopSales = filterByPreset(
  data.sales.filter((s) => String(s.shop_id) === String(shop.id)),
  ownerPeriod,
  todayISO()
).reduce((a, s) => a + Number(s.total || 0), 0);

const shopExpenses = filterByPreset(
  data.expenses.filter((e) => String(e.shop_id) === String(shop.id)),
  ownerPeriod,
  todayISO()
).reduce((a, e) => a + Number(e.amount || 0), 0);
          const latest = getLatestEntryForShop(data.mobileMoneyEntries, shop.id);
          const mobileCapital = latest ? getMobileCapital(latest) : 0;
          const bankCapital = latest ? getBankCapital(latest) : 0;

          return (
            <Card key={shop.id}>
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>{t(language, 'Sales', 'Mauzo')}: TZS {currency(shopSales)}</div>
                <div>{t(language, 'Expenses', 'Matumizi')}: TZS {currency(shopExpenses)}</div>
                <div>{t(language, 'Profit', 'Faida')}: TZS {currency(shopSales - shopExpenses)}</div>
                <div>{t(language, 'Mobile Money Capital', 'Mtaji wa Simu')}: TZS {currency(mobileCapital)}</div>
                <div>{t(language, 'Bank Capital', 'Mtaji wa Benki')}: TZS {currency(bankCapital)}</div>
                <Button type="button" className="mt-2" onClick={() => openShop(shop.id)}>
                  {t(language, 'Open Shop', 'Fungua Duka')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function ShopDashboard({ shop, data, saveData, backToOwner, logout, canBack, language, setLanguage, exportBackup }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickSearch, setQuickSearch] = useState('');
const [stockSearch, setStockSearch] = useState('');
  const [scanCode, setScanCode] = useState('');
  const [cart, setCart] = useState([]);
  const [newProductRows, setNewProductRows] = useState([{ ...emptyProductRow }]);
  const [purchaseRows, setPurchaseRows] = useState([{ ...emptyPurchaseRow }]);
  const [expenseRows, setExpenseRows] = useState([{ ...emptyExpenseRow }]);
  const [creditRows, setCreditRows] = useState([{ ...emptyCreditRow }]);
  const [changeRows, setChangeRows] = useState([{ ...emptyChangeRow }]);
  const [reportPreset, setReportPreset] = useState('today');
const [reportDate, setReportDate] = useState(todayISO());
const [reportStartDate, setReportStartDate] = useState(todayISO());
const [reportEndDate, setReportEndDate] = useState(todayISO());
const [reportType, setReportType] = useState('stockValue');
  const [productFormError, setProductFormError] = useState('');
  const [saleError, setSaleError] = useState('');
const [saleSaving, setSaleSaving] = useState(false);
const saleLock = useRef(false);
  const [creditReduceMap, setCreditReduceMap] = useState({});
  const [changeReduceMap, setChangeReduceMap] = useState({});
const [gasForm, setGasForm] = useState({ ...emptyGasForm });
const [showGasStatus, setShowGasStatus] = useState(false);
const [showGasSales, setShowGasSales] = useState(false);
const [showGasPrices, setShowGasPrices] = useState(false);

const saveGas = async () => {
  const record = {
  ...buildGasRecord(gasForm),
  shop_id: shop.id,
};

  const nextGasEntries = [...(data.gasEntries || [])];
  const existingIndex = nextGasEntries.findIndex((x) => x.id === record.id);

  if (existingIndex >= 0) {
    nextGasEntries[existingIndex] = record;
  } else {
    nextGasEntries.push(record);
  }

  saveData({
    ...data,
    gasEntries: nextGasEntries,
  });

  addToSyncQueue('gas_created', record);

  const { error } = await supabase
    .from('gasEntries')
    .upsert([record], { onConflict: 'id' });

  if (error) {
    console.error('Gas save error:', error);
    alert(`Gas save error: ${error.message}`);
    return;
  }

  setGasForm({ ...emptyGasForm, date: todayISO() });
};
const editGas = (entry) => {
  setGasForm({
    id: entry.id,
    date: entry.date,
    gasType: entry.gasType || 'Taifa Gas',
    cylinderSize: entry.cylinderSize || 'Small Cylinder',
    totalCylinders: String(entry.totalCylinders || ''),
    smallCylindersTotal: String(entry.smallCylindersTotal || ''),
    bigCylindersTotal: String(entry.bigCylindersTotal || ''),
    smallCylindersWithGas: String(entry.smallCylindersWithGas || ''),
    bigCylindersWithGas: String(entry.bigCylindersWithGas || ''),
    smallEmptyCylinders: String(entry.smallEmptyCylinders || ''),
    bigEmptyCylinders: String(entry.bigEmptyCylinders || ''),
    smallGasSoldToday: String(entry.smallGasSoldToday || ''),
    bigGasSoldToday: String(entry.bigGasSoldToday || ''),
    smallGasBuyPrice: String(entry.smallGasBuyPrice || ''),
    smallGasSellPrice: String(entry.smallGasSellPrice || ''),
    bigGasBuyPrice: String(entry.bigGasBuyPrice || ''),
    bigGasSellPrice: String(entry.bigGasSellPrice || ''),
  });
};

const deleteGas = async (id) => {
  const nextGasEntries = (data.gasEntries || []).filter((entry) => entry.id !== id);

  saveData({
    ...data,
    gasEntries: nextGasEntries,
  });

  const { error } = await supabase.from('gasEntries').delete().eq('id', id);

  if (error) {
    console.error('Gas delete error:', error);
  }
};

const isSmallCylinder = gasForm.cylinderSize === 'Small Cylinder';
const isBigCylinder = gasForm.cylinderSize === 'Big Cylinder';

const [mobileMoneyForm, setMobileMoneyForm] = useState({
  id: '',
  date: todayISO(),
  mobileCashTotal: '',
  bankCashTotal: '',
  mobileCapital: '',
  bankCapital: '',
  networks: [{ ...emptyNetworkRow }],
  banks: [{ ...emptyBankRow }],
  notes: '',
});

    const products = data.products
    .filter((p) => String(p?.shop_id || '') === String(shop.id))
    .map(normalizeProduct)
    .filter((p) => p.id && String(p.name || '').trim());

const sales = data.sales.filter(
  (s) => String(s.shop_id) === String(shop.id)
);

const creditSales = data.creditSales.filter(
  (s) => String(s.shop_id) === String(shop.id)
);

const changeLedger = data.changeLedger.filter(
  (s) => String(s.shop_id) === String(shop.id)
);

const expenses = data.expenses.filter(
  (e) => String(e.shop_id) === String(shop.id)
);

const expenseEntries = data.expenses
  .map((e, originalIndex) => ({ ...e, originalIndex }))
  .filter((e) => String(e.shop_id) === String(shop.id));

const purchases = data.purchases.filter(
  (p) => String(p.shop_id) === String(shop.id)
);

const todayPurchases = purchases.filter(
  (p) => p.date === todayISO() && !p.confirmed
);

const todayProducts = data.products
  .filter((p) => String(p.shop_id) === String(shop.id) && p.confirmed !== true)
  .map(normalizeProduct);

const mobileMoneyEntries = data.mobileMoneyEntries.filter(
  (m) => String(m.shop_id) === String(shop.id)
);

const todayMobileMoneyEntries = mobileMoneyEntries.filter((m) => m.date === todayISO());

const gasEntries = (data.gasEntries || []).filter(
  (g) => String(g.shop_id) === String(shop.id)
);

const todayGasEntries = gasEntries.filter((g) => g.date === todayISO());

const reportDateValue =
  reportPreset === 'date'
    ? { start: reportStartDate, end: reportEndDate }
    : reportDate;

const filteredSales = filterByPreset(sales, reportPreset, reportDateValue);
const filteredPurchases = filterByPreset(purchases, reportPreset, reportDateValue);
const filteredExpenses = filterByPreset(expenses, reportPreset, reportDateValue);
const filteredMobileMoney = filterByPreset(mobileMoneyEntries, reportPreset, reportDateValue);

const mobileMoneyReportRows = useMemo(
  () =>
    filteredMobileMoney
      .slice()
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .map((entry) => {
        const networkMap = Object.fromEntries((entry.networks || []).map((n) => [n.provider, Number(n.float || 0)]));
        const bankMap = Object.fromEntries((entry.banks || []).map((b) => [b.bankName, Number(b.float || 0)]));

        return {
          ...entry,
          mobileCapital: Number(entry.mobileCapital || 0),
          bankCapital: Number(entry.bankCapital || 0),
          mobileCashTotal: Number(entry.mobileCashTotal || 0),
          bankCashTotal: Number(entry.bankCashTotal || 0),

          mpesaFloat: Number(networkMap['M-Pesa'] || 0),
          mixxFloat: Number(networkMap['Mixx by Yas'] || 0),
          airtelFloat: Number(networkMap['Airtel Money'] || 0),
          halopesaFloat: Number(networkMap['HaloPesa'] || 0),

          crdbFloat: Number(bankMap['CRDB'] || 0),
          nmbFloat: Number(bankMap['NMB'] || 0),
          nbcFloat: Number(bankMap['NBC'] || 0),
          
        };
      }),
  [filteredMobileMoney],
);
const mobileMoneyAllShopsRows = useMemo(() => {
  return data.shops
    .map((shop) => {
      const shopEntries = filterByPreset(
  (data.mobileMoneyEntries || []).filter((m) => String(m.shop_id) === String(shop.id)),
  reportPreset,
  reportDateValue
);

      if (!shopEntries.length) return null;

      const latest = shopEntries
        .slice()
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0];

      const networkMap = Object.fromEntries(
        (latest.networks || []).map((n) => [n.provider, Number(n.float || 0)])
      );

      const bankMap = Object.fromEntries(
        (latest.banks || []).map((b) => [b.bankName, Number(b.float || 0)])
      );

      return {
        shopName: shop.name,
        date: latest.date || '-',
notes: latest.notes || '',
        mobileCapital: Number(latest.mobileCapital || 0),
        bankCapital: Number(latest.bankCapital || 0),
        mobileCashTotal: Number(latest.mobileCashTotal || 0),
        bankCashTotal: Number(latest.bankCashTotal || 0),

        mpesaFloat: Number(networkMap['M-Pesa'] || 0),
        mixxFloat: Number(networkMap['Mixx by Yas'] || 0),
        airtelFloat: Number(networkMap['Airtel Money'] || 0),
        halopesaFloat: Number(networkMap['HaloPesa'] || 0),

        crdbFloat: Number(bankMap['CRDB'] || 0),
        nmbFloat: Number(bankMap['NMB'] || 0),
        nbcFloat: Number(bankMap['NBC'] || 0),
      };
    })
    .filter(Boolean);
}, [data.mobileMoneyEntries, data.shops, reportPreset, reportDateValue]);
const todaySales = filterByPreset(sales, 'today', todayISO()).reduce((a, s) => a + Number(s.total || 0), 0);
const todayExpenses = filterByPreset(expenses, 'today', todayISO()).reduce((a, e) => a + Number(e.amount || 0), 0);
const todayGasProfit = (data.gasEntries || [])
  .filter((x) => x.date === todayISO())
  .reduce((a, x) => {
    const small =
      (Number(x.smallGasSellPrice || 0) - Number(x.smallGasBuyPrice || 0)) *
      Number(x.smallGasSoldToday || 0);

    const big =
      (Number(x.bigGasSellPrice || 0) - Number(x.bigGasBuyPrice || 0)) *
      Number(x.bigGasSoldToday || 0);

    return a + small + big;
  }, 0);

  const totalSales = filteredSales.reduce((a, s) => a + Number(s.total || 0), 0);
  const totalExpenses = filteredExpenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalProfit = totalSales - totalExpenses;

const todayWakalaCommission = (data.mobileMoneyEntries || [])
  .filter((x) => x.date === todayISO())
  .reduce((a, x) => {
    const mobileCommission = (x.networks || []).reduce((sum, n) => sum + Number(n.commission || 0), 0);
    const bankCommission = (x.banks || []).reduce((sum, b) => sum + Number(b.commission || 0), 0);
    return a + mobileCommission + bankCommission;
  }, 0);

  const latestMobileEntry = getLatestEntryForShop(data.mobileMoneyEntries, shop.id);

const mobileCapital = latestMobileEntry ? Number(latestMobileEntry.mobileCapital || 0) : 0;
const bankCapital = latestMobileEntry ? Number(latestMobileEntry.bankCapital || 0) : 0;

const mobileFloat = latestMobileEntry ? getMobileFloatTotal(latestMobileEntry) : 0;
const bankFloat = latestMobileEntry ? getBankFloatTotal(latestMobileEntry) : 0;

const mobileCommission = latestMobileEntry ? getMobileCommissionTotal(latestMobileEntry) : 0;
const bankCommission = latestMobileEntry ? getBankCommissionTotal(latestMobileEntry) : 0;

  const quickProducts =
  quickSearch.trim() === ''
    ? []
    : products
        .filter((p) => !p.archived)
        .filter((p) =>
          p.name.toLowerCase().includes(quickSearch.toLowerCase())
        );

 const stockValueRows = useMemo(
  () =>
    products
      .filter((p) => !p.archived)
      .filter((p) =>
        String(p.name || '').toLowerCase().includes(stockSearch.toLowerCase())
      )
      .map((p) => ({
        ...p,
        stockValue: Number(p.stockBaseQty || 0) * Number(p.buyPrice || 0),
        totalProfitIfSold:
          Number(p.stockBaseQty || 0) *
          (Number(p.sellPrice || 0) - Number(p.buyPrice || 0)),
      })),
  [products, stockSearch],
);
const salesReportRows = useMemo(() => {
  const map = {};

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!map[item.productId]) {
  const product = products.find((p) => p.id === item.productId);

  if (!product) console.warn('Missing product for sale item:', item);
map[item.productId] = {
  productId: item.productId,
  name: item.name || product?.name || 'Unknown Product',
  unit: item.unit || product?.baseUnit || '-',
  buyPrice: Number(item.buyPrice ?? product?.buyPrice ?? 0),
  sellPrice: Number(item.sellPrice ?? item.price ?? product?.sellPrice ?? 0),
  balance: Number(product?.stockBaseQty || 0),
  soldQty: 0,
  profit: 0,
  date: sale.date,
};
}
      map[item.productId].soldQty += Number(item.quantity || 0);
      map[item.productId].profit +=
        Number(item.quantity || 0) *
        (map[item.productId].sellPrice - map[item.productId].buyPrice);
    });
  });

  const rows = Object.values(map);
  const totalSold = rows.reduce((a, r) => a + Number(r.soldQty || 0), 0);
  const totalProfit = rows.reduce((a, r) => a + Number(r.profit || 0), 0);
  const totalSalesAmount = rows.reduce((a, r) => a + Number(r.soldQty || 0) * Number(r.sellPrice || 0), 0);

  rows.sort((a, b) => b.soldQty - a.soldQty);

  return {
    rows,
    totalSold,
    totalProfit,
    totalSalesAmount,
  };
}, [filteredSales, products]);
const todayProfit = salesReportRows.totalProfit - todayExpenses; 
const todayRetailProfit = salesReportRows.totalProfit - todayExpenses;
const totalBusinessProfit =
  todayRetailProfit + todayGasProfit + todayWakalaCommission; 
  const movementRows = useMemo(
    () =>
      products.map((p) => {
        const soldQty = sales
          .flatMap((s) => s.items || [])
          .filter((item) => item.productId === p.id)
          .reduce((a, item) => a + Number(item.quantity || 0), 0);
        return { ...p, soldQty };
      }),
    [products, sales],
  );
const expiringProducts = useMemo(() => {
  return products
    .filter((p) => p.expiryDate)
    .map((p) => {
      const daysLeft = getDaysUntilExpiry(p.expiryDate);
     return {
  ...p,
  daysLeft,
};
    })
    .filter((p) => p.daysLeft !== null && p.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}, [products]);
const expiringSoonCount = expiringProducts.filter((p) => p.daysLeft >= 0 && p.daysLeft <= 7).length;
const expiredCount = expiringProducts.filter((p) => p.daysLeft < 0).length;
const lowStockCount = products.filter(
  (p) => Number(p.stockBaseQty || 0) <= Number(p.minStockLevel || 0)
).length;
  const stockTotals = useMemo(
    () => ({
      totalBalance: stockValueRows.reduce((a, r) => a + Number(r.stockBaseQty || 0), 0),
      totalStockValue: stockValueRows.reduce((a, r) => a + Number(r.stockValue || 0), 0),
      totalProfit: stockValueRows.reduce((a, r) => a + Number(r.totalProfitIfSold || 0), 0),
    }),
    [stockValueRows],
  );

  const purchasesTotal = filteredPurchases.reduce((a, p) => a + Number(p.quantity || 0) * Number(p.unitCost || 0), 0);
const profitLossReport = useMemo(() => {
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  let totalSalesAmount = 0;
  let totalCOGS = 0;
  let itemsSold = 0;

  const itemProfitMap = {};

  filteredSales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const fallbackProduct = productMap[item.productId] || {};

      const sellPrice = Number(item.sellPrice ?? item.price ?? fallbackProduct.sellPrice ?? 0);
      const buyPrice = Number(item.buyPrice ?? fallbackProduct.buyPrice ?? 0);

      const itemSales = sellPrice * quantity;
      const itemCOGS = buyPrice * quantity;
      const itemProfit = itemSales - itemCOGS;

      totalSalesAmount += itemSales;
      totalCOGS += itemCOGS;
      itemsSold += quantity;

      const key = item.productId || item.name || 'unknown-item';

      if (!itemProfitMap[key]) {
        itemProfitMap[key] = {
          productId: item.productId || '',
          name: item.name || fallbackProduct.name || 'Unknown Item',
          soldQty: 0,
          sales: 0,
          cogs: 0,
          profit: 0,
          margin: 0,
        };
      }

      itemProfitMap[key].soldQty += quantity;
      itemProfitMap[key].sales += itemSales;
      itemProfitMap[key].cogs += itemCOGS;
      itemProfitMap[key].profit += itemProfit;
    });
  });

  const rows = Object.values(itemProfitMap).map((row) => ({
    ...row,
    margin: row.sales > 0 ? (row.profit / row.sales) * 100 : 0,
  }));

  const grossProfit = totalSalesAmount - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  const topProfitItems = rows
    .slice()
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const lowMarginItems = rows
    .filter((row) => row.sales > 0)
    .slice()
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 5);

  return {
    totalSales: totalSalesAmount,
    totalCOGS,
    grossProfit,
    totalExpenses,
    netProfit,
    itemsSold,
    topProfitItems,
    lowMarginItems,
  };
}, [filteredSales, products, totalExpenses]);

  const isEditingProduct = newProductRows.some((row) => row.id);

  const resetProductForm = () => {
    setNewProductRows([{ ...emptyProductRow }]);
    setProductFormError('');
  };

  const quickAdd = (product, qty = 1) => {
    const quantity = Number(qty || 0);
    if (quantity <= 0) return;
    if (quantity > Number(product.stockBaseQty || 0)) {
      setSaleError(t(language, 'Quantity is greater than available stock.', 'Kiasi kimezidi stock iliyopo.'));
      return;
    }

    setSaleError('');
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      const nextQty = Number(existing?.quantity || 0) + quantity;
      if (nextQty > Number(product.stockBaseQty || 0)) {
        setSaleError(t(language, 'Total quantity in cart is greater than available stock.', 'Jumla ya kiasi kwenye kikapu imezidi stock iliyopo.'));
        return prev;
      }

      const unitPrice = Number(product.sellPrice || 0);

if (existing) {
  const updatedItem = {
    ...existing,
    quantity: nextQty,
    price: unitPrice,
    buyPrice: Number(product.buyPrice || 0),
    sellPrice: unitPrice,
    total: nextQty * unitPrice,
  };

  const remainingItems = prev.filter((c) => c.productId !== product.id);

  return [updatedItem, ...remainingItems];
}

     return [
  {
    productId: product.id,
    name: product.name,
    unit: product.baseUnit,
    price: unitPrice,
    buyPrice: Number(product.buyPrice || 0),
    sellPrice: unitPrice,
    quantity,
    total: quantity * unitPrice,
  },
  ...prev,
];
    });
  };

  const quickAddMeasured = (product, qty) => {
    const quantity = Number(qty || 0);
    if (quantity <= 0) return;
    if (quantity > Number(product.stockBaseQty || 0)) {
      setSaleError(t(language, 'Quantity is greater than available stock.', 'Kiasi kimezidi stock iliyopo.'));
      return;
    }

    setSaleError('');
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      const nextQty = Number(existing?.quantity || 0) + quantity;
      if (nextQty > Number(product.stockBaseQty || 0)) {
        setSaleError(t(language, 'Total quantity in cart is greater than available stock.', 'Jumla ya kiasi kwenye kikapu imezidi stock iliyopo.'));
        return prev;
      }

      const unitPrice = Number(product.sellPrice || 0);

if (existing) {
  const updatedItem = {
    ...existing,
    quantity: nextQty,
    price: unitPrice,
    buyPrice: Number(product.buyPrice || 0),
    sellPrice: unitPrice,
    total: nextQty * unitPrice,
  };

  const remainingItems = prev.filter((c) => c.productId !== product.id);

  return [updatedItem, ...remainingItems];
}

return [
  {
    productId: product.id,
    name: product.name,
    unit: product.baseUnit,
    price: unitPrice,
    buyPrice: Number(product.buyPrice || 0),
    sellPrice: unitPrice,
    quantity,
    total: quantity * unitPrice,
  },
  ...prev,
];
    });
  };
  const handleScanAdd = () => {
    const code = scanCode.trim();
    if (!code) return;
    const product = products.find((p) => String(p.qrCode || '').trim().toLowerCase() === code.toLowerCase());
    if (!product) return alert(t(language, 'No product matched that QR code.', 'Hakuna bidhaa iliyolingana na QR code hiyo.'));
    setQuickSearch(product.name);
    setScanCode('');
    setSaleError('');
  };

  const commitSale = async () => {
    if (!cart.length) return;

if (saleLock.current) return;
saleLock.current = true;

setSaleSaving(true);

    const nextProducts = [...data.products];
    for (const item of cart) {
      const idx = nextProducts.findIndex((p) => p.id === item.productId);
      if (idx >= 0) {
        const currentStock = Number(nextProducts[idx].stockBaseQty || 0);
        if (Number(item.quantity || 0) > currentStock) {
  setSaleError(t(language, 'One item has insufficient stock. Please check the cart.', 'Bidhaa moja haina stock ya kutosha. Tafadhali kagua kikapu.'));
  setSaleSaving(false);
saleLock.current = false;
  return;
}
      }
    }

    try {
  cart.forEach((item) => {
    const idx = nextProducts.findIndex((p) => p.id === item.productId);
    if (idx >= 0) {
      nextProducts[idx] = {
        ...normalizeProduct(nextProducts[idx]),
        stockBaseQty: Math.max(
          0,
          Number(nextProducts[idx].stockBaseQty || 0) - Number(item.quantity || 0)
        ),
      };
    }
  });

  const total = cart.reduce((a, c) => a + c.total, 0);

  const saleRecord = {
    id: `sale-${Date.now()}`,
    shop_id: shop.id,
    items: cart,
    total,
    type: 'cash',
    date: todayISO(),
    created_at: new Date().toISOString(),
  };

  saveData({
    ...data,
    products: nextProducts,
    sales: [...data.sales, saleRecord],
  });

    addToSyncQueue('sale_created', {
    ...saleRecord,
    products: nextProducts
      .filter((p) => String(p.shop_id) === String(shop.id))
      .map((p) => {
        const normalizedProduct = normalizeProduct(p);

        return {
          id: normalizedProduct.id,
          name: String(normalizedProduct.name || '').trim(),
          buyPrice: Number(normalizedProduct.buyPrice || 0),
          sellPrice: Number(normalizedProduct.sellPrice || 0),
          stockBaseQty: Number(normalizedProduct.stockBaseQty || 0),
          shop_id: normalizedProduct.shop_id || shop.id,
          baseUnit: normalizedProduct.baseUnit || 'pc',
          created_at:
            normalizedProduct.created_at ||
            (normalizedProduct.createdAt
              ? new Date(normalizedProduct.createdAt).toISOString()
              : new Date().toISOString()),
        };
      }),
  });

  console.log('Sending sale to Supabase:', saleRecord);

  const { error } = await supabase
    .from('sales')
    .insert([
      {
        id: saleRecord.id,
        shop_id: saleRecord.shop_id,
        items: saleRecord.items,
        total: saleRecord.total,
        type: saleRecord.type,
        date: saleRecord.date,
        created_at: saleRecord.created_at,
      },
    ]);

  if (error) {
    alert(`Sales sync failed: ${error.message}`);
    return;
  }

  const productRows = nextProducts
    .filter((p) => String(p.shop_id) === String(shop.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      buyingprice: Number(p.buyPrice || 0),
      sellingprice: Number(p.sellPrice || 0),
      stock: Number(p.stockBaseQty || 0),
      shop_id: p.shop_id,
      baseunit: p.baseUnit || 'pc',
      created_at: p.created_at || (p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()),
    }));

  const { error: productError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'id' });

  if (productError) {
    alert(`Product stock sync failed: ${productError.message}`);
    return;
  }

setCart([]);
setSaleError('');
} catch (err) {
  console.error('Unexpected commitSale error:', err);
  alert(`Unexpected sale error: ${err.message || err}`);
} finally {
  setSaleSaving(false);
  saleLock.current = false;
}
};
  const removeCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const importProductsFromExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataArray = new Uint8Array(e.target.result);
        const workbook = XLSX.read(dataArray, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const importedProducts = rows
          .map((row, index) => {
            const normalizedRow = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[String(key).trim().toLowerCase()] = row[key];
            });

            const productName = String(normalizedRow['product name'] || '').trim();
            const unitRaw = String(normalizedRow['unit'] || '').trim().toLowerCase();
            const stock = Number(normalizedRow['available stock'] || 0);
            const buyPrice = Number(normalizedRow['buying price'] || 0);
            const sellPrice = Number(normalizedRow['selling price'] || 0);
            const minStock = Number(normalizedRow['minimum stock'] || 5);
            const qrCode = String(normalizedRow['qr code'] || '').trim();

            const unit =
  unitRaw === 'kg' || unitRaw === 'kgs' || unitRaw === 'kilogram' || unitRaw === 'kilograms'
    ? 'kg'
    : unitRaw === 'ltr' || unitRaw === 'lt' || unitRaw === 'liter' || unitRaw === 'litre' || unitRaw === 'liters' || unitRaw === 'litres'
    ? 'ltr'
    : unitRaw === 'pc' || unitRaw === 'pcs' || unitRaw === 'piece' || unitRaw === 'pieces'
    ? 'pc'
    : '';

            if (!productName || !unit || buyPrice <= 0 || sellPrice <= 0) return null;

            const subUnitsRaw = unit === 'pc' ? '' : '0.75,0.5,0.25';

    return normalizeProduct({
  id: `import-${Date.now()}-${index}`,
  shop_id: shop.id,
  name: productName,
  baseUnit: unit,
  baseQty: 1,
  buyPrice,
  sellPrice,
  stockBaseQty: stock,
  minStockLevel: minStock,
  expiryDate: '',
  qrCode,
  subUnitsRaw,
  createdAt: todayISO(),
  confirmed: false,
});
          })
          .filter(Boolean);

        if (!importedProducts.length) {
          return alert(t(language, 'No valid products found in the Excel file.', 'Hakuna bidhaa sahihi zilizopatikana kwenye faili la Excel.'));
        }

        const nextProducts = [...data.products, ...importedProducts];
saveData({ ...data, products: nextProducts });

const rowsToSync = importedProducts.map((p) => ({
  id: p.id,
  name: p.name,
  buyingprice: Number(p.buyPrice || 0),
  sellingprice: Number(p.sellPrice || 0),
  stock: Number(p.stockBaseQty || 0),
  shop_id: p.shop_id,
  baseunit: p.baseUnit || 'pc',
  created_at: p.created_at || new Date().toISOString(),
}));

const { error } = await supabase
  .from('products')
  .upsert(rowsToSync, { onConflict: 'id' });

if (error) {
  alert(`Product import sync failed: ${error.message}`);
  return;
}
        alert(`${importedProducts.length} ${t(language, 'products imported successfully.', 'bidhaa zimeingizwa kwa mafanikio.')}`);
        event.target.value = '';
      } catch (error) {
        console.error(error);
        alert(t(language, 'Excel import failed.', 'Uingizaji wa Excel umeshindikana.'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addProductRow = () => setNewProductRows((prev) => [...prev, { ...emptyProductRow }]);
  const updateProductRow = (index, field, value) =>
    setNewProductRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removeProductRow = (index) => setNewProductRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const startEditProduct = (product) => {
    setActiveTab('products');
    setProductFormError('');
    setNewProductRows([
      {
        id: product.id,
        name: product.name || '',
        unit: product.baseUnit || 'pc',
        buyPrice: String(product.buyPrice || ''),
        sellPrice: String(product.sellPrice || ''),
        stockQty: String(product.stockBaseQty || ''),
        minStockLevel: String(product.minStockLevel || 5),
        expiryDate: product.expiryDate || '',
        subUnits:
          product.subUnitsRaw ||
          (Array.isArray(product.subUnits)
            ? product.subUnits
                .map((x) => Number(x.qty))
                .filter((qty) => qty > 0 && qty < 1)
                .sort((a, b) => b - a)
                .join(',')
            : ''),
        qrCode: product.qrCode || '',
      },
    ]);
  };

const deleteProduct = async (productId) => {
  const usedInSales = data.sales.some((sale) =>
    (sale.items || []).some((item) => item.productId === productId)
  );
  const usedInPurchases = data.purchases.some((purchase) => purchase.productId === productId);

  if (usedInSales || usedInPurchases) {
    alert(
      t(
        language,
        'This product is already used in sales or purchases, so it cannot be deleted.',
        'Bidhaa hii tayari imetumika kwenye mauzo au manunuzi, hivyo haiwezi kufutwa.',
      ),
    );
    return;
  }

  saveData({ ...data, products: data.products.filter((x) => x.id !== productId) });

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    alert(`Product delete failed: ${error.message}`);
    return;
  }

  if (newProductRows.some((row) => row.id === productId)) resetProductForm();
};

const saveProductRows = async () => {
  const rows = newProductRows.filter((r) => r.name || r.buyPrice || r.sellPrice || r.stockQty);
  if (!rows.length) {
    return setProductFormError(
      t(language, 'Please fill at least one product row.', 'Jaza angalau mstari mmoja wa bidhaa.')
    );
  }

  const nextProducts = [...data.products];

  for (let idx = 0; idx < rows.length; idx += 1) {
    const row = rows[idx];
    if (!row.name || !row.unit || !row.buyPrice || !row.sellPrice || row.stockQty === '') continue;

    const buyPrice = Number(row.buyPrice || 0);
    const sellPrice = Number(row.sellPrice || 0);

    if (sellPrice <= buyPrice) {
      setProductFormError(
        t(
          language,
          `Selling price must be greater than buying price for ${row.name || 'this product'}.`,
          `Bei ya kuuza lazima iwe kubwa kuliko bei ya kununua kwa ${row.name || 'bidhaa hii'}.`
        )
      );
      return;
    }

    const prepared = normalizeProduct({
      id: row.id || `p-${Date.now()}-${idx}`,
      shop_id: shop.id,
      name: row.name,
      buyPrice: Number(row.buyPrice),
      sellPrice: Number(row.sellPrice),
      stock: Number(row.stockQty),
      stockBaseQty: Number(row.stockQty),
      baseUnit: row.unit || 'pc',
      minStockLevel: Number(row.minStockLevel || 5),
      expiryDate: row.expiryDate || '',
      qrCode: row.qrCode || '',
      subUnitsRaw: row.unit === 'pc' ? '' : row.subUnits || '',
      created_at: new Date().toISOString(),
      createdAt: row.id
        ? (nextProducts.find((p) => p.id === row.id)?.createdAt || todayISO())
        : todayISO(),
      confirmed: true,
    });

    const existingIndex = nextProducts.findIndex((p) => p.id === prepared.id);
    if (existingIndex >= 0) nextProducts[existingIndex] = prepared;
    else nextProducts.push(prepared);
  }

  saveData({ ...data, products: nextProducts });

  const rowsToSync = nextProducts
    .filter((p) => String(p.shop_id) === String(shop.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      buyingprice: Number(p.buyPrice || 0),
      sellingprice: Number(p.sellPrice || 0),
      stock: Number(p.stockBaseQty || 0),
      shop_id: p.shop_id,
      baseunit: p.baseUnit || 'pc',
      created_at: p.created_at || new Date().toISOString(),
    }));

  const { error } = await supabase
    .from('products')
    .upsert(rowsToSync, { onConflict: 'id' });

  if (error) {
    alert(`Product sync failed: ${error.message}`);
    return;
  }

  setNewProductRows([{ ...emptyProductRow }]);
  setProductFormError('');
};

  const addPurchaseRow = () => setPurchaseRows((prev) => [...prev, { ...emptyPurchaseRow }]);
  const updatePurchaseRow = (index, field, value) =>
    setPurchaseRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removePurchaseRow = (index) => setPurchaseRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

const savePurchaseRows = () => {
  const rows = purchaseRows.filter((r) => r.productId && r.quantity && r.unitCost);
  if (!rows.length) return;

  const nextPurchases = [...data.purchases];
  const nextProducts = [...data.products];

  rows.forEach((row, idx) => {
    if (!row.productId || !row.quantity || !row.unitCost) return;

    const quantity = Number(row.quantity || 0);
    const unitCost = Number(row.unitCost || 0);

   const preparedPurchase = {
  id: row.id || `purchase-${Date.now()}-${idx}`,
  shop_id: shop.id,
  productId: row.productId,
  quantity,
  unitCost,
  notes: row.notes || '',
  date: row.date || todayISO(),
  confirmed: true,
};

const existingPurchaseIndex = nextPurchases.findIndex(
  (p) => p.id === preparedPurchase.id
);

if (existingPurchaseIndex >= 0) {
  nextPurchases[existingPurchaseIndex] = preparedPurchase;
} else {
  nextPurchases.push(preparedPurchase);
}

const productIndex = nextProducts.findIndex((p) => p.id === preparedPurchase.productId);

if (productIndex >= 0) {
  nextProducts[productIndex] = {
    ...nextProducts[productIndex],
    stockBaseQty:
      Number(nextProducts[productIndex].stockBaseQty || 0) +
      Number(preparedPurchase.quantity || 0),
    buyPrice:
      Number(preparedPurchase.unitCost || nextProducts[productIndex].buyPrice || 0),
  };
}
});
saveData({ ...data, purchases: nextPurchases, products: nextProducts });
nextPurchases.forEach((purchase) => addToSyncQueue('purchase_created', purchase));
nextPurchases.forEach((purchase) => {
  supabase.from('purchases').insert([purchase]);
});
setPurchaseRows([{ ...emptyPurchaseRow, productSearch: '' }]);
};

const addExpenseRow = () => setExpenseRows((prev) => [...prev, { ...emptyExpenseRow }]);
const updateExpenseRow = (index, field, value) =>
  setExpenseRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
const removeExpenseRow = (index) => setExpenseRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

const saveExpenseRows = async () => {
  const rows = expenseRows.filter((r) => r.title && r.amount);
  if (!rows.length) return;

  const nextExpenses = [...data.expenses];

  for (const [idx, row] of rows.entries()) {
    const preparedExpense = {
  ...row,
  id: row.id || `expense-${Date.now()}-${idx}`,
  shop_id: shop.id,
  title: row.title || '',
  description: row.title || '',
  amount: Number(row.amount || 0),
  category: row.category || '',
  date: row.date || todayISO(),
  created_at: row.created_at || new Date().toISOString(),
};

    const existingIndex = nextExpenses.findIndex((x) => x.id === preparedExpense.id);
    if (existingIndex >= 0) {
      nextExpenses[existingIndex] = preparedExpense;
    } else {
      nextExpenses.push(preparedExpense);
    }

    addToSyncQueue('expense_created', preparedExpense);
    console.log('Sending to Supabase:', preparedExpense);

    const { error } = await supabase
      .from('expenses')
      .upsert([preparedExpense], { onConflict: 'id' });

    if (error) {
      console.log('Expense sync error:', error);
      alert(`Expense sync failed: ${error.message}`);
    }
  }

  saveData({
    ...data,
    expenses: nextExpenses,
  });

  setExpenseRows([{ ...emptyExpenseRow }]);
};

  const addCreditRow = () => setCreditRows((prev) => [...prev, { ...emptyCreditRow }]);
  const updateCreditRow = (index, field, value) =>
    setCreditRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removeCreditRow = (index) => setCreditRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const saveCreditRows = () => {
    const rows = creditRows.filter((r) => r.customerName || r.amount);
    if (!rows.length) return;

    saveData({
      ...data,
      creditSales: [
        ...data.creditSales,
        ...rows
          .filter((r) => r.customerName && r.amount)
          .map((row, idx) => ({
  ...row,
  id: row.id || `credit-${Date.now()}-${idx}`,
  shop_id: shop.id,
  amount: Number(row.amount || 0),
  balance: Number(row.amount || 0),
  date: todayISO(),
}))
      ],
    });
rows
  .filter((r) => r.customerName && r.amount)
  .forEach((row, idx) => {
    const creditRecord = {
  ...row,
  id: row.id || `credit-${Date.now()}-${idx}`,
  shop_id: shop.id,
  amount: Number(row.amount || 0),
  paid: 0,
  date: todayISO(),
};

    addToSyncQueue('credit_created', creditRecord);
    supabase.from('creditSales').insert([creditRecord]);
  });
    setCreditRows([{ ...emptyCreditRow }]);
  };

  const reduceCredit = (creditId) => {
    const amount = Number(creditReduceMap[creditId] || 0);
    if (amount <= 0) return;
    saveData({
  ...data,
  creditSales: data.creditSales
    .map((c) =>
      c.id === creditId
        ? { ...c, balance: Math.max(0, Number(c.balance || 0) - amount) }
        : c
    )
    .filter((c) => Number(c.balance || 0) > 0),
});

setCreditReduceMap((prev) => ({ ...prev, [creditId]: '' }));
};

  const addChangeRow = () => setChangeRows((prev) => [...prev, { ...emptyChangeRow }]);
  const updateChangeRow = (index, field, value) =>
    setChangeRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removeChangeRow = (index) => setChangeRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const saveChangeRows = () => {
    const rows = changeRows.filter((r) => r.customerName || r.amountOwed);
    if (!rows.length) return;

    saveData({
      ...data,
      changeLedger: [
        ...data.changeLedger,
        ...rows
          .filter((r) => r.customerName && r.amountOwed)
          .map((row, idx) => ({
  ...row,
  id: row.id || `change-${Date.now()}-${idx}`,
  shop_id: shop.id,
  amountOwed: Number(row.amountOwed || 0),
  date: todayISO(),
}))
      ],
    });
    setChangeRows([{ ...emptyChangeRow }]);
  };

  const reduceChange = (changeId) => {
  const amount = Number(changeReduceMap[changeId] || 0);
  if (amount <= 0) return;

  saveData({
    ...data,
    changeLedger: data.changeLedger
      .map((c) =>
        c.id === changeId
          ? { ...c, amountOwed: Math.max(0, Number(c.amountOwed || 0) - amount) }
          : c
      )
      .filter((c) => Number(c.amountOwed || 0) > 0),
  });

  setChangeReduceMap((prev) => ({ ...prev, [changeId]: '' }));
};

  const updateNetworkRow = (index, field, value) =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      networks: prev.networks.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  const addNetworkRow = () =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      networks: [...prev.networks, { ...emptyNetworkRow }],
    }));
  const removeNetworkRow = (index) =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      networks: prev.networks.length === 1 ? prev.networks : prev.networks.filter((_, i) => i !== index),
    }));

  const updateBankRow = (index, field, value) =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      banks: prev.banks.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  const addBankRow = () =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      banks: [...prev.banks, { ...emptyBankRow }],
    }));
  const removeBankRow = (index) =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      banks: prev.banks.length === 1 ? prev.banks : prev.banks.filter((_, i) => i !== index),
    }));

  const saveMobileMoney = () => {
  const record = {
  id: mobileMoneyForm.id || `mm-${Date.now()}`,
  shop_id: shop.id,
  date: mobileMoneyForm.date || todayISO(),
  mobileCashTotal: Number(mobileMoneyForm.mobileCashTotal || 0),
  bankCashTotal: Number(mobileMoneyForm.bankCashTotal || 0),
  mobileCapital: Number(mobileMoneyForm.mobileCapital || 0),
  bankCapital: Number(mobileMoneyForm.bankCapital || 0),
  networks: mobileMoneyForm.networks.map((n) => ({
    provider: n.provider,
    float: Number(n.float || 0),
    commission: Number(n.commission || 0),
  })),
    banks: mobileMoneyForm.banks.map((b) => ({
      bankName: b.bankName,
      float: Number(b.float || 0),
      commission: Number(b.commission || 0),
    })),
    notes: mobileMoneyForm.notes || '',
  };

    const next = [...data.mobileMoneyEntries];
    const existingIndex = next.findIndex((x) => x.id === record.id);
    if (existingIndex >= 0) next[existingIndex] = record;
    else next.push(record);

    saveData({ ...data, mobileMoneyEntries: next });
addToSyncQueue('mobile_money_created', record);
supabase.from('mobileMoneyEntries').insert([record]);
    setMobileMoneyForm({
  id: '',
  date: todayISO(),
  mobileCashTotal: '',
  bankCashTotal: '',
  mobileCapital: '',
  bankCapital: '',
  networks: [{ ...emptyNetworkRow }],
  banks: [{ ...emptyBankRow }],
  notes: '',
});
  };

  const editMobileMoney = (entry) => {
  setActiveTab('mobilemoney');
  setMobileMoneyForm({
    id: entry.id,
    date: entry.date,
    mobileCashTotal: String(entry.mobileCashTotal || ''),
    bankCashTotal: String(entry.bankCashTotal || ''),
    mobileCapital: String(entry.mobileCapital || ''),
    bankCapital: String(entry.bankCapital || ''),
    networks: (entry.networks || []).length
      ? entry.networks.map((n) => ({
          provider: n.provider,
          float: String(n.float || ''),
          commission: String(n.commission || ''),
        }))
      : [{ ...emptyNetworkRow }],
    banks: (entry.banks || []).length
      ? entry.banks.map((b) => ({
          bankName: b.bankName,
          float: String(b.float || ''),
          commission: String(b.commission || ''),
        }))
      : [{ ...emptyBankRow }],
    notes: entry.notes || '',
  });
};

  const deleteMobileMoney = (id) => saveData({ ...data, mobileMoneyEntries: data.mobileMoneyEntries.filter((m) => m.id !== id) });
  const exportCurrentReportToExcel = () => {
    let rows = [];
    const reportDateLabel =
      reportPreset === 'date'
        ? `${reportStartDate}_to_${reportEndDate}`
        : reportPreset;

    if (reportType === 'stockValue') {
      rows = stockValueRows.map((row) => ({
        ProductName: row.name,
        DateRecorded: row.createdAt || '',
        Unit: row.baseUnit,
        Balance: Number(row.stockBaseQty || 0),
        BuyPrice: Number(row.buyPrice || 0),
        SellPrice: Number(row.sellPrice || 0),
        StockValue: Number(row.stockValue || 0),
        ProfitPerProduct: Number(row.totalProfitIfSold || 0),
      }));
    } else if (reportType === 'expiryAlert') {
      rows = expiringProducts.map((row) => ({
        ProductName: row.name,
        Unit: row.baseUnit,
        Balance: Number(row.stockBaseQty || 0),
        ExpiryDate: row.expiryDate || '',
        DaysLeft: Number(row.daysLeft || 0),
        BuyPrice: Number(row.buyPrice || 0),
        SellPrice: Number(row.sellPrice || 0),
      }));
    } else if (reportType === 'salesReport') {
      rows = salesReportRows.rows.map((row) => ({
        ProductName: row.name,
        Unit: row.unit,
        SoldQty: Number(row.soldQty || 0),
        BuyPrice: Number(row.buyPrice || 0),
        SellPrice: Number(row.sellPrice || 0),
        Balance: Number(row.balance || 0),
        Profit: Number(row.profit || 0),
      }));
    } else if (reportType === 'profitLoss') {
      rows = [
        {
          TotalSales: Number(profitLossReport.totalSales || 0),
          TotalCOGS: Number(profitLossReport.totalCOGS || 0),
          GrossProfit: Number(profitLossReport.grossProfit || 0),
          TotalExpenses: Number(profitLossReport.totalExpenses || 0),
          NetProfit: Number(profitLossReport.netProfit || 0),
          ItemsSold: Number(profitLossReport.itemsSold || 0),
        },
        ...profitLossReport.topProfitItems.map((row) => ({
          Section: 'Top Profit Item',
          ProductName: row.name,
          SoldQty: Number(row.soldQty || 0),
          Sales: Number(row.sales || 0),
          COGS: Number(row.cogs || 0),
          Profit: Number(row.profit || 0),
          MarginPercent: Number(row.margin || 0),
        })),
        ...profitLossReport.lowMarginItems.map((row) => ({
          Section: 'Low Margin Item',
          ProductName: row.name,
          SoldQty: Number(row.soldQty || 0),
          Sales: Number(row.sales || 0),
          COGS: Number(row.cogs || 0),
          Profit: Number(row.profit || 0),
          MarginPercent: Number(row.margin || 0),
        })),
      ];
    } else if (reportType === 'wakala') {
      rows = filteredMobileMoney.map((entry) => ({
        Date: entry.date || '',
        MobileCapital: Number(entry.mobileCapital || 0),
        BankCapital: Number(entry.bankCapital || 0),
        MobileCashTotal: Number(entry.mobileCashTotal || 0),
        BankCashTotal: Number(entry.bankCashTotal || 0),
        MobileFloatTotal: Number(getMobileFloatTotal(entry) || 0),
        BankFloatTotal: Number(getBankFloatTotal(entry) || 0),
        MobileCommissionTotal: Number(getMobileCommissionTotal(entry) || 0),
        BankCommissionTotal: Number(getBankCommissionTotal(entry) || 0),
        Notes: entry.notes || '',
      }));
    } else if (reportType === 'mobileMoneyDetailed') {
      rows = mobileMoneyReportRows.map((row) => ({
        Date: row.date || '',
        MobileCapital: Number(row.mobileCapital || 0),
        BankCapital: Number(row.bankCapital || 0),
        MobileCash: Number(row.mobileCashTotal || 0),
        BankCash: Number(row.bankCashTotal || 0),
        MpesaFloat: Number(row.mpesaFloat || 0),
        MixxFloat: Number(row.mixxFloat || 0),
        AirtelFloat: Number(row.airtelFloat || 0),
        HaloPesaFloat: Number(row.halopesaFloat || 0),
        CrdbFloat: Number(row.crdbFloat || 0),
        NmbFloat: Number(row.nmbFloat || 0),
        NbcFloat: Number(row.nbcFloat || 0),
      }));
    } else if (reportType === 'mobileMoneyAllShops') {
      rows = mobileMoneyAllShopsRows.map((row) => ({
        ShopName: row.shopName || '',
        Date: row.date || '',
        MobileCapital: Number(row.mobileCapital || 0),
        BankCapital: Number(row.bankCapital || 0),
        MobileCash: Number(row.mobileCashTotal || 0),
        BankCash: Number(row.bankCashTotal || 0),
        MpesaFloat: Number(row.mpesaFloat || 0),
        MixxFloat: Number(row.mixxFloat || 0),
        AirtelFloat: Number(row.airtelFloat || 0),
        HaloPesaFloat: Number(row.halopesaFloat || 0),
        CrdbFloat: Number(row.crdbFloat || 0),
        NmbFloat: Number(row.nmbFloat || 0),
        NbcFloat: Number(row.nbcFloat || 0),
        Notes: row.notes || '',
      }));
    } else if (reportType === 'gas') {
      const filteredGas = filterByPreset(gasEntries, reportPreset, reportDateValue);
      rows = filteredGas.map((row) => ({
        Date: row.date || '',
        GasType: row.gasType || '',
        CylinderSize: row.cylinderSize || '',
        TotalCylinders: Number(row.totalCylinders || 0),
        SmallCylindersTotal: Number(row.smallCylindersTotal || 0),
        BigCylindersTotal: Number(row.bigCylindersTotal || 0),
        SmallGasSoldToday: Number(row.smallGasSoldToday || 0),
        BigGasSoldToday: Number(row.bigGasSoldToday || 0),
        SmallGasBuyPrice: Number(row.smallGasBuyPrice || 0),
        SmallGasSellPrice: Number(row.smallGasSellPrice || 0),
        BigGasBuyPrice: Number(row.bigGasBuyPrice || 0),
        BigGasSellPrice: Number(row.bigGasSellPrice || 0),
      }));
    } else if (reportType === 'fastMoving') {
      rows = movementRows
        .slice()
        .sort((a, b) => Number(b.soldQty || 0) - Number(a.soldQty || 0))
        .map((row) => ({
          ProductName: row.name,
          Unit: row.baseUnit,
          CurrentStock: Number(row.stockBaseQty || 0),
          SoldQty: Number(row.soldQty || 0),
          BuyPrice: Number(row.buyPrice || 0),
          SellPrice: Number(row.sellPrice || 0),
        }));
    } else if (reportType === 'slowMoving') {
      rows = movementRows
        .slice()
        .sort((a, b) => Number(a.soldQty || 0) - Number(b.soldQty || 0))
        .map((row) => ({
          ProductName: row.name,
          Unit: row.baseUnit,
          CurrentStock: Number(row.stockBaseQty || 0),
          SoldQty: Number(row.soldQty || 0),
          BuyPrice: Number(row.buyPrice || 0),
          SellPrice: Number(row.sellPrice || 0),
        }));
    } else if (reportType === 'profitCompare') {
      rows = [
        {
          TotalPurchases: Number(purchasesTotal || 0),
          TotalSales: Number(totalSales || 0),
          TotalExpenses: Number(totalExpenses || 0),
          TotalProfit: Number(totalProfit || 0),
        },
      ];
    }

    if (!rows.length) {
      alert(t(language, 'No data to export.', 'Hakuna data ya kupakua.'));
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    const safeShopName = String(shop.name || 'shop').replace(/[^\w\-]+/g, '_');
    XLSX.writeFile(workbook, `${safeShopName}_${reportType}_${reportDateLabel}.xlsx`);
  };
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {canBack ? (
              <button type="button" onClick={backToOwner} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2 py-1 hover:bg-white">
                <ChevronLeft className="h-4 w-4" />
                {t(language, 'Back to owner', 'Rudi kwa mmiliki')}
              </button>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl font-semibold">{shop.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t(language, 'Independent shop view with sales, stock, credit and reports.', 'Mwonekano wa duka huru wenye mauzo, stock, madeni na ripoti.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="sw">Kiswahili</option>
            <option value="en">English</option>
          </select>
<Button variant="outline" onClick={() => exportBackup()}>
  {t(language, 'Export Backup', 'Pakua Backup')}
</Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t(language, 'Logout', 'Toka')}
          </Button>
        </div>
      </div>

      <TabsList>
  {[
    ['dashboard', t(language, 'Dashboard', 'Dashibodi')],
    ['products', t(language, 'Record Products', 'Sajili Bidhaa')],
    ['purchases', t(language, 'Record Purchases', 'Sajili Manunuzi')],
    ['pos', t(language, 'Sales', 'Mauzo')],
    ['expenses', t(language, 'Expenses', 'Matumizi')],
    ['credit', t(language, 'Credit', 'Madeni')],
    ['change', t(language, 'Customer Change', 'Chenji ya Mteja')],
    ['mobilemoney', t(language, 'Mobile Money', 'Wakala')],
    ['gas', t(language, 'Gas Business', 'Biashara ya Gesi')],
    ['reports', t(language, 'Reports', 'Ripoti')],
  ].map(([value, label]) => (
    <TabsTrigger key={value} value={value} activeValue={activeTab} onClick={() => setActiveTab(value)}>
      {label}
    </TabsTrigger>
  ))}
</TabsList>

     <TabsContent value="dashboard" activeValue={activeTab}>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    <StatCard title={t(language, 'Today Sales', 'Mauzo ya Leo')} value={`TZS ${currency(todaySales)}`} icon={ShoppingCart} />
    <StatCard title={t(language, 'Today Expenses', 'Matumizi ya Leo')} value={`TZS ${currency(todayExpenses)}`} icon={AlertTriangle} />
    <StatCard title={t(language, 'Today Profit', 'Faida ya Leo')} value={`TZS ${currency(todayProfit)}`} icon={Wallet} />

    <StatCard
      title={t(language, 'Expiry Alerts', 'Tahadhari za Muda wa Matumizi')}
      value={`${expiredCount} ${t(language, 'expired', 'zilizoisha')} / ${expiringSoonCount} ${t(language, 'soon', 'zinakaribia')}`}
      subtitle={t(language, 'Expired / due within 7 days', 'Zilizoisha / ndani ya siku 7')}
      icon={AlertTriangle}
    />
<StatCard
  title={t(language, 'Low Stock Alerts', 'Tahadhari za Stock Ndogo')}
  value={`${lowStockCount} ${t(language, 'items', 'bidhaa')}`}
  subtitle={t(language, 'At or below minimum stock', 'Ziko chini au sawa na kiwango cha chini')}
  icon={AlertTriangle}
/>
    <StatCard
      title={t(language, 'Mobile Money Capital', 'Mtaji wa Simu')}
      value={`TZS ${currency(mobileCapital)}`}
      subtitle={
        latestMobileEntry
          ? getFloatStatus(
              mobileCapital,
              mobileFloat,
              mobileCommission,
              language
            )
          : ''
      }
      icon={HandCoins}
    />
 <StatCard
  title={t(language, 'Bank Capital', 'Mtaji wa Benki')}
  value={`TZS ${currency(bankCapital)}`}
  subtitle={
    latestMobileEntry
      ? getFloatStatus(
          bankCapital,
          bankFloat,
          bankCommission,
          language
        )
      : ''
  }
  icon={Building2}
/>
        </div>

<Card>
  <CardHeader>
    <CardTitle>{t(language, 'Business Profit Breakdown', 'Muhtasari wa Faida za Biashara')}</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid gap-3 md:grid-cols-4 text-sm">

      <div className="rounded-2xl bg-slate-50 p-3">
        {t(language, 'Retail Profit', 'Faida ya Duka')}: TZS {currency(todayRetailProfit)}
      </div>

      <div className="rounded-2xl bg-slate-50 p-3">
        {t(language, 'Gas Profit', 'Faida ya Gesi')}: TZS {currency(todayGasProfit)}
      </div>

      <div className="rounded-2xl bg-slate-50 p-3">
        {t(language, 'Wakala Commission', 'Kamisheni ya Wakala')}: TZS {currency(todayWakalaCommission)}
      </div>

      <div className="rounded-2xl bg-slate-100 p-3 font-semibold">
        {t(language, 'Total Business Profit', 'Jumla ya Faida za Biashara')}: TZS {currency(totalBusinessProfit)}
      </div>

    </div>
  </CardContent>
</Card>
      </TabsContent>

      <TabsContent value="products" activeValue={activeTab}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEditingProduct ? t(language, 'Edit Product', 'Hariri Bidhaa') : t(language, 'Record New Products', 'Sajili Bidhaa Mpya')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {newProductRows.map((row, index) => {
                const buy = Number(row.buyPrice || 0);
                const sell = Number(row.sellPrice || 0);
                const unitProfit = sell - buy;

                return (
                  <div key={index} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {t(language, 'Item', 'Bidhaa')} {index + 1}
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeProductRow(index)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        {t(language, 'Delete', 'Futa')}
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
  <Input
    placeholder={t(language, 'Product name *', 'Jina la bidhaa *')}
    value={row.name}
    onChange={(e) => updateProductRow(index, 'name', e.target.value)}
  />
  {row.name.trim() &&
  products.some(
    (p) =>
      p.id !== row.id &&
      String(p.name || '').trim().toLowerCase() === String(row.name || '').trim().toLowerCase()
  ) ? (
    <div className="mt-1 text-xs text-amber-600">
      {t(
        language,
        'Suggestion: this product name already exists in Product List.',
        'Pendekezo: jina hili la bidhaa tayari lipo kwenye Orodha ya Bidhaa.'
      )}
    </div>
  ) : null}
</div>
                      <select className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={row.unit} onChange={(e) => updateProductRow(index, 'unit', e.target.value)}>
  <option value="">{t(language, 'Choose unit *', 'Chagua kipimo *')}</option>
  <option value="pc">pc</option>
  <option value="kg">kg</option>
  <option value="ltr">ltr</option>
</select>
                      <Input type="number" placeholder={t(language, 'Buying price *', 'Bei ya kununua *')} value={row.buyPrice} onChange={(e) => updateProductRow(index, 'buyPrice', e.target.value)} />
                     <div>
  <Input
    type="number"
    placeholder={t(language, 'Selling price *', 'Bei ya kuuza *')}
    value={row.sellPrice}
    onChange={(e) => updateProductRow(index, 'sellPrice', e.target.value)}
  />
  {Number(row.sellPrice || 0) > 0 &&
  Number(row.buyPrice || 0) > 0 &&
  Number(row.sellPrice || 0) <= Number(row.buyPrice || 0) ? (
    <div className="mt-1 text-xs text-red-600">
      {t(
        language,
        'Selling price must be greater than buying price.',
        'Bei ya kuuza lazima iwe kubwa kuliko bei ya kununua.'
      )}
    </div>
  ) : null}
</div>
                      <Input type="number" placeholder={t(language, 'Opening stock *', 'Stock ya mwanzo *')} value={row.stockQty} onChange={(e) => updateProductRow(index, 'stockQty', e.target.value)} />
                      <Input type="number" placeholder={t(language, 'Minimum stock', 'Kiwango cha chini')} value={row.minStockLevel} onChange={(e) => updateProductRow(index, 'minStockLevel', e.target.value)} />
                      <Input type="date" value={row.expiryDate} onChange={(e) => updateProductRow(index, 'expiryDate', e.target.value)} />
                      <Input placeholder="QR code" value={row.qrCode} onChange={(e) => updateProductRow(index, 'qrCode', e.target.value)} />
                      <div className="md:col-span-2">
                        <Input
                          placeholder={t(language, 'Sub units e.g 0.75,0.5,0.25', 'Vipimo vidogo mf. 0.75,0.5,0.25')}
                          value={row.subUnits}
                          onChange={(e) => updateProductRow(index, 'subUnits', e.target.value)}
                          disabled={row.unit === 'pc'}
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
                      {t(language, 'Profit per unit', 'Faida kwa kipimo')}: TZS {currency(unitProfit)}
                    </div>
                  </div>
                );
              })}

              {productFormError ? <p className="text-sm text-red-600">{productFormError}</p> : null}

              <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                <div className="mb-2 text-sm font-medium">{t(language, 'Bulk upload from Excel', 'Pakia nyingi kwa Excel')}</div>
                <input type="file" accept=".xlsx,.xls" onChange={importProductsFromExcel} className="block w-full text-sm" />
              </div>

              <div className="flex flex-wrap gap-2">
                {!isEditingProduct ? (
                  <Button type="button" variant="outline" onClick={addProductRow}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t(language, 'Add Another Item', 'Ongeza Bidhaa')}
                  </Button>
                ) : null}

                <Button type="button" onClick={saveProductRows}>
                  {isEditingProduct ? t(language, 'Update Product', 'Sasisha Bidhaa') : t(language, 'Save Items', 'Hifadhi Bidhaa')}
                </Button>

                {isEditingProduct ? (
                  <Button type="button" variant="outline" onClick={resetProductForm}>
                    {t(language, 'Cancel Edit', 'Ghairi Kuhariri')}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
           <CardHeader>
  <CardTitle>{t(language, 'Product List', 'Orodha ya Bidhaa')}</CardTitle>
</CardHeader>

<CardContent className="space-y-3 text-sm">
  <div className="text-slate-500">
    {t(
      language,
      'Saved products appear in reports and sales, not here.',
      'Bidhaa zilizohifadhiwa zinaonekana kwenye taarifa na mauzo, si hapa.'
    )}
  </div>
</CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="purchases" activeValue={activeTab}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Record Purchases / Restock', 'Sajili Manunuzi / Ongeza Stock')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchaseRows.map((row, index) => {
                const selectedProduct = products.find((p) => p.id === row.productId);
                return (
                  <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-2">
                    <Input
  placeholder={t(language, 'Search product...', 'Tafuta bidhaa...')}
  value={row.productSearch || ''}
  onChange={(e) => {
    const search = e.target.value;
    updatePurchaseRow(index, 'productSearch', search);

    const match = products.find((p) =>
  String(p.name || '').toLowerCase().includes(search.toLowerCase())
);

    if (match) {
      updatePurchaseRow(index, 'productId', match.id);
    }
  }}
/>

{row.productSearch && (
  <div className="rounded-2xl border border-slate-200 bg-white max-h-40 overflow-y-auto text-sm">
    {products
      .filter((p) =>
        String(p.name || '').toLowerCase().includes(
          String(row.productSearch || '').toLowerCase()
        )
      )
      .slice(0, 6)
      .map((p) => (
        <div
          key={p.id}
          className="cursor-pointer px-3 py-2 hover:bg-slate-100"
          onClick={() => {
            setPurchaseRows((prev) =>
              prev.map((purchaseRow, i) =>
                i === index
                  ? {
                      ...purchaseRow,
                      productId: p.id,
                      productSearch: p.name,
                    }
                  : purchaseRow
              )
            );
          }}
        >
          {p.name}
        </div>
      ))}
  </div>
)}

                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {selectedProduct
                        ? `${t(language, 'Current buy price', 'Bei ya sasa ya kununua')}: TZS ${currency(selectedProduct.buyPrice)}`
                        : t(language, 'Select item to see purchase price', 'Chagua bidhaa kuona bei ya kununua')}
                    </div>

                    <Input type="number" placeholder={t(language, 'Quantity', 'Idadi')} value={row.quantity} onChange={(e) => updatePurchaseRow(index, 'quantity', e.target.value)} />
                    <Input type="number" placeholder={t(language, 'Unit cost', 'Bei ya kununua')} value={row.unitCost} onChange={(e) => updatePurchaseRow(index, 'unitCost', e.target.value)} />
                    <Input type="date" value={row.date} onChange={(e) => updatePurchaseRow(index, 'date', e.target.value)} />
                    <div className="md:col-span-2">
                      <Input placeholder={t(language, 'Notes', 'Maelezo')} value={row.notes} onChange={(e) => updatePurchaseRow(index, 'notes', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="button" variant="outline" onClick={() => removePurchaseRow(index)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t(language, 'Delete', 'Futa')}
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addPurchaseRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t(language, 'Add Another Purchase', 'Ongeza Manunuzi')}
                </Button>
                <Button type="button" onClick={savePurchaseRows}>
                  {t(language, 'Save Purchases', 'Hifadhi Manunuzi')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Recent Purchases', 'Manunuzi ya Karibuni')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
<div className="mb-3">
  <Button
    type="button"
    onClick={async () => {
      const purchasesToConfirm = data.purchases.filter(
  (purchase) => String(purchase.shop_id) === String(shop.id) && !purchase.confirmed
);

      if (!purchasesToConfirm.length) {
        alert('No unconfirmed purchases found.');
        return;
      }

      const nextProducts = [...data.products];

      const nextPurchases = data.purchases.map((purchase) => {
        if (String(purchase.shop_id) !== String(shop.id) || purchase.confirmed) return purchase;

        const pIdx = nextProducts.findIndex((p) => p.id === purchase.productId);

        if (pIdx >= 0) {
          nextProducts[pIdx] = {
            ...nextProducts[pIdx],
            stockBaseQty:
              Number(nextProducts[pIdx].stockBaseQty || 0) +
              Number(purchase.quantity || 0),
            buyPrice:
              Number(purchase.unitCost || nextProducts[pIdx].buyPrice || 0),
          };
        }

        return { ...purchase, confirmed: true };
      });

      saveData({
        ...data,
        products: nextProducts,
        purchases: nextPurchases,
      });

     const productRows = nextProducts
  .filter((p) => String(p.shop_id) === String(shop.id))
  .map((p) => ({
    id: p.id,
    name: p.name,
    buyingprice: Number(p.buyPrice || 0),
    sellingprice: Number(p.sellPrice || 0),
    stock: Number(p.stockBaseQty || 0),
    shop_id: p.shop_id,
  }));

      const { error: productError } = await supabase
        .from('products')
        .upsert(productRows, { onConflict: 'id' });

      if (productError) {
        alert(`Products sync failed: ${productError.message}`);
        return;
      }

     const purchaseRows = purchasesToConfirm.map((purchase) => ({
  ...purchase,
  shop_id: purchase.shop_id,
  confirmed: true,
  created_at: purchase.created_at || new Date().toISOString(),
}));

      const { error: purchaseError } = await supabase
        .from('purchases')
        .upsert(purchaseRows, { onConflict: 'id' });

      if (purchaseError) {
        alert(`Purchases sync failed: ${purchaseError.message}`);
        return;
      }

      alert('Purchases confirmed successfully.');
    }}
  >
    {t(language, 'Confirm Purchases', 'Thibitisha Manunuzi')}
  </Button>
</div>
              {todayPurchases.length === 0 ? (
                <div className="text-slate-500">{t(language, 'No purchases recorded yet.', 'Hakuna manunuzi yaliyorekodiwa bado.')}</div>
              ) : (
                todayPurchases
  .slice()
                  .reverse()
                  .map((p) => {
                    const product = data.products.find((x) => x.id === p.productId);
                    return (
                      <div key={p.id} className="rounded-2xl bg-slate-50 p-3">
  <div className="flex items-start justify-between gap-2">
    <div>
      <div className="font-medium">{product?.name || '-'}</div>
      <div className="mt-1 text-slate-500">
        {formatQty(p.quantity)} - TZS {currency(p.unitCost)} - {p.date}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setPurchaseRows([
            {
              id: p.id,
              productId: p.productId,
              productSearch: product?.name || '',
              quantity: String(p.quantity || ''),
              unitCost: String(p.unitCost || ''),
              date: p.date || todayISO(),
              notes: p.notes || '',
            },
          ]);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
  const nextPurchases = data.purchases.filter((x) => x.id !== p.id);
  const nextProducts = data.products.map((item) =>
    item.id === p.productId
      ? {
          ...item,
          stockBaseQty: Math.max(
            0,
            Number(item.stockBaseQty || 0) - Number(p.quantity || 0)
          ),
        }
      : item
  );

  saveData({
    ...data,
    purchases: nextPurchases,
    products: nextProducts,
  });
}}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="pos" activeValue={activeTab}>
  <div className="flex gap-4 items-start">
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>{t(language, 'Search Product', 'Tafuta Bidhaa')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
  <Input
    className="flex-[2]"
    placeholder={t(language, 'Type product name...', 'Andika jina la bidhaa...')}
    value={quickSearch}
    onChange={(e) => setQuickSearch(e.target.value)}
  />
  <Input
    className="flex-1"
    placeholder={t(language, 'Scan QR code', 'Skeni QR code')}
    value={scanCode}
    onChange={(e) => setScanCode(e.target.value)}
  />
  <Button type="button" variant="outline" onClick={handleScanAdd}>
    <QrCode className="mr-2 h-4 w-4" />
    {t(language, 'Scan', 'Skeni')}
  </Button>
</div>

              {saleError ? <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{saleError}</div> : null}

              {quickSearch.trim() === '' ? (
                <div className="text-sm text-slate-500">{t(language, 'Start typing product name.', 'Anza kuandika jina la bidhaa.')}</div>
              ) : quickProducts.length === 0 ? (
                <div className="text-sm text-red-600">{t(language, 'No product found.', 'Hakuna bidhaa iliyopatikana.')}</div>
              ) : (
                <div className="space-y-3">

                {quickProducts.map((p) => (
  <div key={p.id} className="rounded-2xl border border-slate-200 p-3">
    {p.baseUnit === 'pc' ? (
      <div className="flex items-center gap-2 text-sm">
        <div className="min-w-0 flex-1 truncate font-medium">{p.name}</div>

        <div className="shrink-0 text-slate-500">
          {formatQty(p.stockBaseQty)} {p.baseUnit}
        </div>

        <div className="shrink-0 text-sm font-medium text-green-600">
          TZS {currency(p.sellPrice)}
        </div>
 <Input
  className="!h-8 !w-16 shrink-0"
  type="number"
  min="1"
  step="1"
  value={p._draftQty || ''}
  onChange={(e) => {
    const value = e.target.value;
    p._draftQty = value;
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      const rawQty = String(p._draftQty || '').trim();
      const qty = rawQty === '' ? 1 : Number(rawQty);

      quickAddMeasured(p, qty);
      p._draftQty = '';
      setQuickSearch('');
    }
  }}
/>

<Button
  type="button"
  size="sm"
  onClick={(e) => {
    const row = e.currentTarget.closest('.rounded-2xl');
    const qtyInput = row?.querySelector('input');
    const rawQty = qtyInput?.value?.trim() || '';
    const qty = rawQty === '' ? 1 : Number(rawQty);

    quickAddMeasured(p, qty);

    if (qtyInput) {
      qtyInput.value = '';
    }

    setQuickSearch('');
  }}
  disabled={Number(p.stockBaseQty || 0) < 1}
>
  {t(language, 'Add', 'Ongeza')}
</Button>
      </div>
    ) : (
      <>
        <div className="flex items-center gap-2 text-sm">
          <div className="min-w-0 flex-1 truncate font-medium">{p.name}</div>

          <div className="shrink-0 text-slate-500">
            {formatQty(p.stockBaseQty)} {p.baseUnit}
          </div>

          <div className="shrink-0 text-sm font-medium text-green-600">
            TZS {currency(p.sellPrice)}
          </div>

          <Input
            className="!h-8 !w-16 shrink-0"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                quickAddMeasured(p, e.currentTarget.value);
                e.currentTarget.value = '1';
              }
            }}
          />

          <Button
            type="button"
            size="sm"
            onClick={() => {
  setQuickSearch('');
}}
            disabled={Number(p.stockBaseQty || 0) < 0.01}
          >
            {t(language, 'Add', 'Ongeza')}
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {[0.06, 0.12, 0.25, 0.5, 0.75, 1, 2, 3].map((qty) => (
            <Button
              key={`${p.id}-${qty}`}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickAddMeasured(p, qty)}
              disabled={Number(p.stockBaseQty || 0) < qty}
            >
              {formatQty(qty)} {p.baseUnit}
            </Button>
          ))}
        </div>
      </>
    )}
  </div>
))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>{t(language, 'Current Sale', 'Mauzo ya Sasa')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm">{t(language, 'No items selected.', 'Hakuna bidhaa zilizochaguliwa.')}</div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-sm">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-slate-500">
                        {formatQty(item.quantity)} {item.unit} x TZS {currency(item.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>TZS {currency(item.total)}</div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeCartItem(item.productId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-4 font-semibold">
                <span>{t(language, 'Total', 'Jumla')}</span>
                <span>TZS {currency(cart.reduce((a, c) => a + c.total, 0))}</span>
              </div>

              <div className="flex gap-2">
                <Button type="button" className="flex-1" onClick={commitSale}>
                  {t(language, 'Confirm Cash Sale', 'Kamilisha Mauzo ya Fedha')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setCart([])}>
                  {t(language, 'Clear', 'Futa')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="expenses" activeValue={activeTab}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Record Expenses', 'Sajili Matumizi')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseRows.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-2">
                  <Input placeholder={t(language, 'Title', 'Kichwa')} value={row.title} onChange={(e) => updateExpenseRow(index, 'title', e.target.value)} />
                  <Input type="number" placeholder={t(language, 'Amount', 'Kiasi')} value={row.amount} onChange={(e) => updateExpenseRow(index, 'amount', e.target.value)} />
                  <Input placeholder={t(language, 'Category', 'Aina')} value={row.category} onChange={(e) => updateExpenseRow(index, 'category', e.target.value)} />
                  <Input type="date" value={row.date} onChange={(e) => updateExpenseRow(index, 'date', e.target.value)} />
                  <div className="md:col-span-2">
                    <Input placeholder={t(language, 'Notes', 'Maelezo')} value={row.notes} onChange={(e) => updateExpenseRow(index, 'notes', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => removeExpenseRow(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t(language, 'Delete', 'Futa')}
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addExpenseRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t(language, 'Add Expense', 'Ongeza Matumizi')}
                </Button>
                <Button type="button" onClick={saveExpenseRows}>
                  {t(language, 'Save Expenses', 'Hifadhi Matumizi')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Saved Expenses', 'Matumizi Yaliyohifadhiwa')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {expenses.length === 0 ? (
                <div className="text-slate-500">{t(language, 'No expenses saved yet.', 'Hakuna matumizi yaliyohifadhiwa bado.')}</div>
              ) : (
                expenseEntries.slice().reverse().map((e) => (
  <div key={e.id} className="rounded-2xl bg-slate-50 p-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="font-medium">{e.title}</div>
        <div className="mt-1 text-slate-500">
          TZS {currency(e.amount)} - {e.date}
        </div>
        {e.category ? (
          <div className="mt-1 text-slate-500">
            {t(language, 'Category', 'Aina')}: {e.category}
          </div>
        ) : null}
      </div>

     <div className="flex items-center gap-2">
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => {
      setExpenseRows([
        {
          id: e.id,
          title: e.title || '',
          amount: String(e.amount || ''),
          category: e.category || '',
          date: e.date || todayISO(),
          notes: e.notes || '',
        },
      ]);
    }}
  >
    <Pencil className="h-4 w-4" />
  </Button>

  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={async () => {
      const nextExpenses = data.expenses.filter((x) => x.id !== e.id);

      saveData({
        ...data,
        expenses: nextExpenses,
      });

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', e.id);

      if (error) {
        alert(`Expense delete failed: ${error.message}`);
      }
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
    </div>
  </div>
))
                 
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="credit" activeValue={activeTab}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Record Credit Sale', 'Sajili Deni')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {creditRows.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-2">
                  <Input placeholder={t(language, 'Customer name', 'Jina la mteja')} value={row.customerName} onChange={(e) => updateCreditRow(index, 'customerName', e.target.value)} />
                  <Input type="number" placeholder={t(language, 'Amount', 'Kiasi')} value={row.amount} onChange={(e) => updateCreditRow(index, 'amount', e.target.value)} />
                  <Input placeholder={t(language, 'Phone', 'Simu')} value={row.phone} onChange={(e) => updateCreditRow(index, 'phone', e.target.value)} />
                  <div className="md:col-span-2">
                    <Input placeholder={t(language, 'Notes', 'Maelezo')} value={row.notes} onChange={(e) => updateCreditRow(index, 'notes', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => removeCreditRow(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t(language, 'Delete', 'Futa')}
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addCreditRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t(language, 'Add Credit', 'Ongeza Deni')}
                </Button>
                <Button type="button" onClick={saveCreditRows}>
                  {t(language, 'Save Credit', 'Hifadhi Deni')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Credit List', 'Orodha ya Madeni')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {creditSales.length === 0 ? (
                <div className="text-slate-500">{t(language, 'No credit records yet.', 'Hakuna madeni yaliyorekodiwa bado.')}</div>
              ) : (
                creditSales
                  .slice()
                  .reverse()
                  .map((c) => (
<div key={c.id} className="rounded-2xl bg-slate-50 p-3">
                    <div className="font-medium">{c.customerName}</div>
<div className="mt-1 text-slate-500">{t(language, 'Date', 'Tarehe')}: {c.date || '-'}</div>
<div className="mt-1 text-slate-500">{t(language, 'Phone', 'Simu')}: {c.phone || '-'}</div>
<div className="mt-1 text-slate-500">{t(language, 'Notes', 'Maelezo')}: {c.notes || '-'}</div>
<div className="mt-1 text-slate-500">
  {t(language, 'Balance', 'Salio')}: TZS {currency(c.balance)}
</div>
                      <div className="mt-3 flex gap-2">
                        <Input
                          className="max-w-[140px]"
                          placeholder={t(language, 'Reduce amount', 'Punguza kiasi')}
                          value={creditReduceMap[c.id] || ''}
                          onChange={(e) => setCreditReduceMap((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        />
                        <Button type="button" onClick={() => reduceCredit(c.id)}>
                          {t(language, 'Reduce', 'Punguza')}
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="change" activeValue={activeTab}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Record Customer Change', 'Sajili Chenji ya Mteja')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {changeRows.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-2">
                  <Input placeholder={t(language, 'Customer name', 'Jina la mteja')} value={row.customerName} onChange={(e) => updateChangeRow(index, 'customerName', e.target.value)} />
                  <Input type="number" placeholder={t(language, 'Amount owed', 'Kiasi cha chenji')} value={row.amountOwed} onChange={(e) => updateChangeRow(index, 'amountOwed', e.target.value)} />
                  <div className="md:col-span-2">
                    <Input placeholder={t(language, 'Notes', 'Maelezo')} value={row.notes} onChange={(e) => updateChangeRow(index, 'notes', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => removeChangeRow(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t(language, 'Delete', 'Futa')}
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addChangeRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t(language, 'Add Change Record', 'Ongeza Rekodi ya Chenji')}
                </Button>
                <Button type="button" onClick={saveChangeRows}>
                  {t(language, 'Save Change', 'Hifadhi Chenji')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Saved Change Records', 'Rekodi za Chenji')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {changeLedger.length === 0 ? (
                <div className="text-slate-500">{t(language, 'No change records yet.', 'Hakuna rekodi za chenji bado.')}</div>
              ) : (
                changeLedger
  .filter((c) => Number(c.amountOwed || 0) > 0)
  .slice()
  .reverse()
  .map((c) => (
                    <div key={c.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="font-medium">{c.customerName}</div>
<div className="mt-1 text-slate-500">{t(language, 'Date', 'Tarehe')}: {c.date || '-'}</div>
<div className="mt-1 text-slate-500">{t(language, 'Phone', 'Simu')}: {c.phone || '-'}</div>
<div className="mt-1 text-slate-500">{t(language, 'Notes', 'Maelezo')}: {c.notes || '-'}</div>
                      <div className="mt-1 text-slate-500">
                        {t(language, 'Balance', 'Salio')}: TZS {currency(c.amountOwed)}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Input
                          className="max-w-[140px]"
                          placeholder={t(language, 'Reduce amount', 'Punguza kiasi')}
                          value={changeReduceMap[c.id] || ''}
                          onChange={(e) => setChangeReduceMap((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        />
                        <Button type="button" onClick={() => reduceChange(c.id)}>
                          {t(language, 'Reduce', 'Punguza')}
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

<TabsContent value="gas" activeValue={activeTab}>
  <GasBusinessSection
    Card={Card}
    CardHeader={CardHeader}
    CardTitle={CardTitle}
    CardContent={CardContent}
    Button={Button}
    Input={Input}
    language={language}
    t={t}
    currency={currency}
    formatQty={formatQty}
    todayISO={todayISO}
gasTypes={GAS_TYPES}
gasCylinderSizes={GAS_CYLINDER_SIZES}
    gasForm={gasForm}
    setGasForm={setGasForm}
showGasStatus={showGasStatus}
setShowGasStatus={setShowGasStatus}
showGasSales={showGasSales}
setShowGasSales={setShowGasSales}
showGasPrices={showGasPrices}
setShowGasPrices={setShowGasPrices}
    gasEntries={gasEntries}
    todayGasEntries={gasEntries.filter((g) => g.date === todayISO())}
    isOwnerUser={data.currentUser?.role === 'owner'}
    onSaveGas={saveGas}
onEditGas={editGas}
onDeleteGas={deleteGas}
  />
</TabsContent>
      <TabsContent value="reports" activeValue={activeTab}>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{t(language, 'Reports', 'Ripoti')}</CardTitle>
<Button type="button" variant="outline" onClick={exportCurrentReportToExcel}>
  {t(language, 'Export Excel', 'Pakua Excel')}
</Button>
              <div className="flex flex-wrap gap-2">
                <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="stockValue">{t(language, 'Stock Value Report', 'Ripoti ya Thamani ya Stock')}</option>
<option value="expiryAlert">{t(language, 'Lock Stock Alert', 'Tahadhari ya Bidhaa Zinazoisha Muda')}</option>
                  <option value="salesReport">{t(language, 'Sales Report', 'Ripoti ya Mauzo')}</option>
<option value="profitLoss">{t(language, 'Profit & Loss Report', 'Ripoti ya Faida na Hasara')}</option>
                  <option value="wakala">{t(language, 'Wakala Summary', 'Muhtasari wa Wakala')}</option>
<option value="mobileMoneyDetailed">
  {t(language, 'Mobile Money Detailed', 'Ripoti ya Wakala Kamilifu')}
</option>
<option value="mobileMoneyAllShops">
  {t(language, 'Mobile Money All Shops', 'Ripoti ya Wakala Maduka Yote')}
</option>
                  <option value="gas">{t(language, 'Gas Business Report', 'Ripoti ya Biashara ya Gesi')}</option>
<option value="fastMoving">{t(language, 'Fast Moving Items', 'Bidhaa Zinazotembea Haraka')}</option>
                  <option value="slowMoving">{t(language, 'Slow Moving Items', 'Bidhaa Zinazotembea Polepole')}</option>
                  <option value="profitCompare">{t(language, 'Purchases vs Sales vs Profit', 'Manunuzi dhidi ya Mauzo na Faida')}</option>
                </select>

                <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={reportPreset} onChange={(e) => setReportPreset(e.target.value)}>
                  <option value="today">{t(language, 'Today', 'Leo')}</option>
                  <option value="yesterday">{t(language, 'Yesterday', 'Jana')}</option>
                  <option value="date">{t(language, 'Specific date', 'Tarehe maalum')}</option>
                  <option value="week">{t(language, 'Week', 'Wiki')}</option>
                  <option value="month">{t(language, 'Month', 'Mwezi')}</option>
                  <option value="3months">{t(language, '3 Months', 'Miezi 3')}</option>
                  <option value="6months">{t(language, '6 Months', 'Miezi 6')}</option>
                  <option value="year">{t(language, 'Year', 'Mwaka')}</option>
                </select>

        {reportPreset === 'date' ? (
  <div className="flex gap-2">
    <Input
      type="date"
      value={reportStartDate}
      onChange={(e) => setReportStartDate(e.target.value)}
      className="w-40"
    />
    <Input
      type="date"
      value={reportEndDate}
      onChange={(e) => setReportEndDate(e.target.value)}
      className="w-40"
    />
  </div>
) : null}
              </div>
            </div>
          </CardHeader>
<Input
  placeholder={t(language, 'Search product...', 'Tafuta bidhaa...')}
  value={stockSearch}
  onChange={(e) => setStockSearch(e.target.value)}
  className="mb-3 max-w-sm"
/>
          <CardContent>
            {reportType === 'stockValue' ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="py-2 pr-3">{t(language, 'Product Name', 'Jina la Bidhaa')}</th>
<th className="py-2 pr-3">{t(language, 'Date Recorded', 'Tarehe ya Kusajili')}</th>
                      <th className="py-2 pr-3">{t(language, 'Unit', 'Kipimo')}</th>
                      <th className="py-2 pr-3">{t(language, 'Balance', 'Salio')}</th>
                      <th className="py-2 pr-3">{t(language, 'Buy Price', 'Bei ya kununua')}</th>
                      <th className="py-2 pr-3">{t(language, 'Sell Price', 'Bei ya kuuza')}</th>
                      <th className="py-2 pr-3">{t(language, 'Stock Value', 'Thamani ya Stock')}</th>
                      <th className="py-2 pr-3">{t(language, 'Profit per Product', 'Faida kwa Bidhaa')}</th>
<th className="py-2 pr-3">{t(language, 'Actions', 'Vitendo')}</th>
                    </tr>
                  </thead>
                  <tbody>
  {stockValueRows.map((row) => (
  <tr key={row.id} className="border-b border-slate-100">
    <td className="py-3 pr-3">{row.name}</td>
    <td className="py-3 pr-3">{row.createdAt || '-'}</td>
    <td className="py-3 pr-3">{row.baseUnit}</td>
    <td className="py-3 pr-3">{formatQty(row.stockBaseQty)}</td>
    <td className="py-3 pr-3">TZS {currency(row.buyPrice)}</td>
    <td className="py-3 pr-3">TZS {currency(row.sellPrice)}</td>
    <td className="py-3 pr-3">TZS {currency(row.stockValue)}</td>
    <td className="py-3 pr-3">TZS {currency(row.totalProfitIfSold)}</td>
    <td className="py-3 pr-3">
  <div className="flex items-center gap-2">
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => startEditProduct(row)}
    >
      <Pencil className="h-4 w-4" />
    </Button>

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => deleteProduct(row.id)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
  if (!confirm("Archive this product?")) return;

  const nextProducts = data.products.map((p) =>
    p.id === row.id ? { ...p, archived: true } : p
  );

        saveData({
          ...data,
          products: nextProducts,
        });

        const { error } = await supabase
          .from('products')
          .update({ archived: true })
          .eq('id', row.id);

        if (error) {
          alert(`Product archive failed: ${error.message}`);
        }
      }}
    >
      Archive
    </Button>
  </div>
</td>
  </tr>
))}

  <tr className="bg-slate-50 font-semibold">
    <td className="py-3 pr-3">{t(language, 'TOTAL', 'JUMLA')}</td>
    <td className="py-3 pr-3">-</td>
    <td className="py-3 pr-3">-</td>
    <td className="py-3 pr-3">{formatQty(stockValueRows.reduce((a,r)=>a+Number(r.stockBaseQty||0),0))}</td>
    <td className="py-3 pr-3">-</td>
    <td className="py-3 pr-3">-</td>
    <td className="py-3 pr-3">TZS {currency(stockValueRows.reduce((a,r)=>a+Number(r.stockValue||0),0))}</td>
    <td className="py-3 pr-3">TZS {currency(stockValueRows.reduce((a,r)=>a+Number(r.totalProfitIfSold||0),0))}</td>
<td className="py-3 pr-3">-</td>
  </tr>
</tbody>
    </table>
  </div>

) : reportType === 'mobileMoneyDetailed' ? (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1200px] text-sm">
      <thead>
        <tr className="border-b text-left text-slate-500">
  <th className="py-2 pr-3">{t(language, 'Date', 'Tarehe')}</th>
  <th className="py-2 pr-3">{t(language, 'Mobile Capital', 'Mtaji wa Simu')}</th>
  <th className="py-2 pr-3">{t(language, 'Bank Capital', 'Mtaji wa Benki')}</th>
  <th className="py-2 pr-3">{t(language, 'Mobile Cash', 'Cash ya Simu')}</th>
  <th className="py-2 pr-3">{t(language, 'Bank Cash', 'Cash ya Benki')}</th>

  <th className="py-2 pr-3">{t(language, 'M-Pesa Float', 'Float ya M-Pesa')}</th>
  <th className="py-2 pr-3">{t(language, 'Mixx Float', 'Float ya Mixx')}</th>
  <th className="py-2 pr-3">{t(language, 'Airtel Float', 'Float ya Airtel')}</th>
  <th className="py-2 pr-3">{t(language, 'HaloPesa Float', 'Float ya HaloPesa')}</th>

  <th className="py-2 pr-3">{t(language, 'CRDB Float', 'Float ya CRDB')}</th>
  <th className="py-2 pr-3">{t(language, 'NMB Float', 'Float ya NMB')}</th>
  <th className="py-2 pr-3">{t(language, 'NBC Float', 'Float ya NBC')}</th>
  
</tr>
      </thead>

      <tbody>
        {mobileMoneyReportRows.map((r, i) => (
          <tr key={i} className="border-b">
            <td className="py-2 pr-3">{r.date || '-'}</td>

            <td className="py-2 pr-3">TZS {currency(r.mobileCapital)}</td>
            <td className="py-2 pr-3">TZS {currency(r.bankCapital)}</td>
            <td className="py-2 pr-3">TZS {currency(r.mobileCashTotal)}</td>
            <td className="py-2 pr-3">TZS {currency(r.bankCashTotal)}</td>

            <td className="py-2 pr-3">{currency(r.mpesaFloat)}</td>
            <td className="py-2 pr-3">{currency(r.mixxFloat)}</td>
            <td className="py-2 pr-3">{currency(r.airtelFloat)}</td>
            <td className="py-2 pr-3">{currency(r.halopesaFloat)}</td>

            <td className="py-2 pr-3">{currency(r.crdbFloat)}</td>
            <td className="py-2 pr-3">{currency(r.nmbFloat)}</td>
            <td className="py-2 pr-3">{currency(r.nbcFloat)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : reportType === 'mobileMoneyAllShops' ? (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1300px] text-sm">
      <thead>
        <tr className="border-b text-left text-slate-500">
          <th className="py-2 pr-3">{t(language, 'Shop', 'Duka')}</th>
          <th className="py-2 pr-3">{t(language, 'Date', 'Tarehe')}</th>
          <th className="py-2 pr-3">{t(language, 'Mobile Capital', 'Mtaji wa Simu')}</th>
          <th className="py-2 pr-3">{t(language, 'Bank Capital', 'Mtaji wa Benki')}</th>
          <th className="py-2 pr-3">{t(language, 'Mobile Cash', 'Cash ya Simu')}</th>
          <th className="py-2 pr-3">{t(language, 'Bank Cash', 'Cash ya Benki')}</th>

          <th className="py-2 pr-3">{t(language, 'M-Pesa Float', 'Float ya M-Pesa')}</th>
          <th className="py-2 pr-3">{t(language, 'Mixx Float', 'Float ya Mixx')}</th>
          <th className="py-2 pr-3">{t(language, 'Airtel Float', 'Float ya Airtel')}</th>
          <th className="py-2 pr-3">{t(language, 'HaloPesa Float', 'Float ya HaloPesa')}</th>

          <th className="py-2 pr-3">{t(language, 'CRDB Float', 'Float ya CRDB')}</th>
<th className="py-2 pr-3">{t(language, 'NMB Float', 'Float ya NMB')}</th>
<th className="py-2 pr-3">{t(language, 'NBC Float', 'Float ya NBC')}</th>
<th className="py-2 pr-3">{t(language, 'Notes', 'Maelezo')}</th>
        </tr>
      </thead>

      <tbody>
        {mobileMoneyAllShopsRows.map((r, i) => (
          <tr key={i} className="border-b">
            <td className="py-2 pr-3">{r.shopName}</td>
            <td className="py-2 pr-3">{r.date || '-'}</td>
            <td className="py-2 pr-3">TZS {currency(r.mobileCapital)}</td>
            <td className="py-2 pr-3">TZS {currency(r.bankCapital)}</td>
            <td className="py-2 pr-3">TZS {currency(r.mobileCashTotal)}</td>
            <td className="py-2 pr-3">TZS {currency(r.bankCashTotal)}</td>

            <td className="py-2 pr-3">{currency(r.mpesaFloat)}</td>
            <td className="py-2 pr-3">{currency(r.mixxFloat)}</td>
            <td className="py-2 pr-3">{currency(r.airtelFloat)}</td>
            <td className="py-2 pr-3">{currency(r.halopesaFloat)}</td>

            <td className="py-2 pr-3">{currency(r.crdbFloat)}</td>
<td className="py-2 pr-3">{currency(r.nmbFloat)}</td>
<td className="py-2 pr-3">{currency(r.nbcFloat)}</td>
<td className="py-2 pr-3">{r.notes || '-'}</td>
          </tr>
        ))}

        <tr className="bg-slate-50 font-semibold">
          <td className="py-2 pr-3">{t(language, 'TOTAL ALL SHOPS', 'JUMLA MADUKA YOTE')}</td>
          <td className="py-2 pr-3">-</td>
          <td className="py-2 pr-3">TZS {currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.mobileCapital || 0), 0))}</td>
          <td className="py-2 pr-3">TZS {currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.bankCapital || 0), 0))}</td>
          <td className="py-2 pr-3">TZS {currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.mobileCashTotal || 0), 0))}</td>
          <td className="py-2 pr-3">TZS {currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.bankCashTotal || 0), 0))}</td>

          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.mpesaFloat || 0), 0))}</td>
          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.mixxFloat || 0), 0))}</td>
          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.airtelFloat || 0), 0))}</td>
          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.halopesaFloat || 0), 0))}</td>

          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.crdbFloat || 0), 0))}</td>
          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.nmbFloat || 0), 0))}</td>
          <td className="py-2 pr-3">{currency(mobileMoneyAllShopsRows.reduce((a, r) => a + Number(r.nbcFloat || 0), 0))}</td>
          
        </tr>
      </tbody>
    </table>
  </div>
) : reportType === 'expiryAlert' ? (
  <div className="space-y-3 text-sm">
    {expiringProducts.length === 0 ? (
      <div className="text-slate-500">
        {t(language, 'No products nearing expiry.', 'Hakuna bidhaa zinazoisha muda karibuni.')}
      </div>
    ) : (
      expiringProducts.map((p) => (
        <div
          key={p.id}
          className={`rounded-2xl p-3 ${
            p.daysLeft <= 0
              ? 'bg-red-50 text-red-700'
              : p.daysLeft <= 7
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-50'
          }`}
        >
          <div className="font-medium">{p.name}</div>

          <div className="mt-1">
            {t(language, 'Expiry Date', 'Tarehe ya Mwisho')}: {p.expiryDate || '-'}
          </div>

          <div>
            {t(language, 'Days Remaining', 'Siku Zilizobaki')}: {p.daysLeft}
          </div>

          <div>
            {t(language, 'Stock', 'Stock')}: {formatQty(p.stockBaseQty)} {p.baseUnit}
          </div>
        </div>
      ))
    )}
  </div>
) : reportType === 'salesReport' ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="py-2 pr-3">{t(language, 'Product Name', 'Jina la Bidhaa')}</th>
                      <th className="py-2 pr-3">{t(language, 'Sales Date', 'Tarehe ya Mauzo')}</th>
                      <th className="py-2 pr-3">{t(language, 'Unit', 'Kipimo')}</th>
                      <th className="py-2 pr-3">{t(language, 'Total Sold', 'Jumla Iliyouzwa')}</th>
                      <th className="py-2 pr-3">{t(language, 'Balance', 'Salio')}</th>
                      <th className="py-2 pr-3">{t(language, 'Buy Price', 'Bei ya kununua')}</th>
                      <th className="py-2 pr-3">{t(language, 'Sell Price', 'Bei ya kuuza')}</th>
                      <th className="py-2 pr-3">{t(language, 'Stock Value', 'Thamani ya Stock')}</th>
                      <th className="py-2 pr-3">{t(language, 'Profit per Product', 'Faida kwa Bidhaa')}</th>
<td className="py-3 pr-3">-</td>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReportRows.rows.map((row) => (
                      <tr key={row.productId} className="border-b border-slate-100">
                        <td className="py-3 pr-3">{row.name}</td>
                        <td className="py-3 pr-3">{row.date || '-'}</td>
                        <td className="py-3 pr-3">{row.unit}</td>
                        <td className="py-3 pr-3">{formatQty(row.soldQty)}</td>
                        <td className="py-3 pr-3">{formatQty(row.balance)}</td>
                        <td className="py-3 pr-3">TZS {currency(row.buyPrice)}</td>
                        <td className="py-3 pr-3">TZS {currency(row.sellPrice)}</td>
                        <td className="py-3 pr-3">TZS {currency(Number(row.balance || 0) * Number(row.buyPrice || 0))}</td>
                        <td className="py-3 pr-3">TZS {currency(row.profit)}</td>
                      </tr>
                    ))}

                    <tr className="bg-slate-50 font-semibold">
                      <td className="py-3 pr-3">{t(language, 'TOTAL', 'JUMLA')}</td>
                      <td className="py-3 pr-3">-</td>
                      <td className="py-3 pr-3">-</td>
                      <td className="py-3 pr-3">{formatQty(salesReportRows.totalSold)}</td>
                      <td className="py-3 pr-3">-</td>
                      <td className="py-3 pr-3">-</td>
                      <td className="py-3 pr-3">-</td>
                      <td className="py-3 pr-3">TZS {currency(salesReportRows.totalSalesAmount)}</td>
                      <td className="py-3 pr-3">TZS {currency(salesReportRows.totalProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
) : reportType === 'profitLoss' ? (
  <div className="space-y-4 text-sm">

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="text-slate-500">{t(language,'Total Sales','Jumla ya Mauzo')}</div>
        <div className="mt-2 text-lg font-semibold">
          TZS {currency(profitLossReport.totalSales)}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="text-slate-500">{t(language,'Total COGS','Gharama ya Bidhaa Zilizouzwa')}</div>
        <div className="mt-2 text-lg font-semibold">
          TZS {currency(profitLossReport.totalCOGS)}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="text-slate-500">{t(language,'Gross Profit','Faida Ghafi')}</div>
        <div className="mt-2 text-lg font-semibold">
          TZS {currency(profitLossReport.grossProfit)}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="text-slate-500">{t(language,'Total Expenses','Jumla ya Matumizi')}</div>
        <div className="mt-2 text-lg font-semibold">
          TZS {currency(profitLossReport.totalExpenses)}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-100 p-4">
        <div className="text-slate-500">{t(language,'Net Profit','Faida Halisi')}</div>
        <div className="mt-2 text-lg font-semibold">
          TZS {currency(profitLossReport.netProfit)}
        </div>
      </div>

    </div>

    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="font-medium">
        {t(language,'Items Sold','Vipimo Vilivyouzwa')}:
        {formatQty(profitLossReport.itemsSold)}
      </div>
    </div>

  </div>
            ) : reportType === 'wakala' ? (
  <div className="space-y-3 text-sm">
    {filteredMobileMoney.length === 0 ? (
      <div>{t(language, 'No wakala records in this period.', 'Hakuna rekodi za wakala katika kipindi hiki.')}</div>
    ) : (
      filteredMobileMoney
        .slice()
        .reverse()
        .map((entry) => (
          <div key={entry.id} className="rounded-2xl bg-slate-50 p-3">
            <div className="font-medium">{entry.date}</div>

            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div>{t(language, 'Mobile cash total', 'Jumla ya cash ya simu')}: TZS {currency(entry.mobileCashTotal)}</div>
                <div>{t(language, 'Mobile capital', 'Mtaji wa simu')}: TZS {currency(entry.mobileCapital)}</div>
                <div>{t(language, 'Total Mobile Float', 'Jumla ya Float ya Simu')}: TZS {currency(getMobileFloatTotal(entry))}</div>
                <div>{t(language, 'Total Mobile Commission', 'Jumla ya Kamisheni ya Simu')}: TZS {currency(getMobileCommissionTotal(entry))}</div>
                <div className="mt-2 font-medium">
                  {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.mobileCapital, getMobileFloatTotal(entry), getMobileCommissionTotal(entry), language)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div>{t(language, 'Bank cash total', 'Jumla ya cash ya benki')}: TZS {currency(entry.bankCashTotal)}</div>
                <div>{t(language, 'Bank capital', 'Mtaji wa benki')}: TZS {currency(entry.bankCapital)}</div>
                <div>{t(language, 'Total Bank Float', 'Jumla ya Float ya Benki')}: TZS {currency(getBankFloatTotal(entry))}</div>
                <div>{t(language, 'Total Bank Commission', 'Jumla ya Kamisheni ya Benki')}: TZS {currency(getBankCommissionTotal(entry))}</div>
                <div className="mt-2 font-medium">
                  {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.bankCapital, getBankFloatTotal(entry), getBankCommissionTotal(entry), language)}
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-2 font-semibold">{t(language, 'Mobile Money', 'Mobile Money')}</div>
                <div className="space-y-1">
                  {(entry.networks || []).length === 0 ? (
                    <div className="text-slate-500">{t(language, 'No mobile network details.', 'Hakuna taarifa za mitandao ya simu.')}</div>
                  ) : (
                    (entry.networks || []).map((n) => (
                      <div key={`${entry.id}-${n.provider}`}>
                        {n.provider}: {t(language, 'Float', 'Float')} TZS {currency(n.float)} | {t(language, 'Commission', 'Kamisheni')} TZS {currency(n.commission)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-2 font-semibold">{t(language, 'Banks', 'Benki')}</div>
                <div className="space-y-1">
                  {(entry.banks || []).length === 0 ? (
                    <div className="text-slate-500">{t(language, 'No bank details.', 'Hakuna taarifa za benki.')}</div>
                  ) : (
                    (entry.banks || []).map((b) => (
                      <div key={`${entry.id}-${b.bankName}`}>
                        {b.bankName}: {t(language, 'Float', 'Float')} TZS {currency(b.float)} | {t(language, 'Commission', 'Kamisheni')} TZS {currency(b.commission)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
    )}
  </div>
) : reportType === 'gas' ? (
  <GasReportBlock
    filteredGas={gasEntries}
    language={language}
    t={t}
    currency={currency}
    formatQty={formatQty}
  />
) : reportType === 'fastMoving' ? (
              <div className="space-y-2 text-sm">
                {movementRows
                  .slice()
                  .sort((a, b) => b.soldQty - a.soldQty)
                  .slice(0, 10)
                  .map((row) => (
                    <div key={row.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="font-medium">{row.name}</div>
                      <div>{t(language, 'Sold Qty', 'Idadi Iliyotoka')}: {formatQty(row.soldQty)} {row.baseUnit}</div>
                      <div>{t(language, 'Balance', 'Salio')}: {formatQty(row.stockBaseQty)} {row.baseUnit}</div>
                    </div>
                  ))}
              </div>
            ) : reportType === 'slowMoving' ? (
              <div className="space-y-2 text-sm">
                {movementRows
                  .slice()
                  .sort((a, b) => a.soldQty - b.soldQty)
                  .slice(0, 10)
                  .map((row) => (
                    <div key={row.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="font-medium">{row.name}</div>
                      <div>{t(language, 'Sold Qty', 'Idadi Iliyotoka')}: {formatQty(row.soldQty)} {row.baseUnit}</div>
                      <div>{t(language, 'Balance', 'Salio')}: {formatQty(row.stockBaseQty)} {row.baseUnit}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>{t(language, 'Purchases in selected period', 'Manunuzi katika kipindi')}: <span className="font-semibold">TZS {currency(purchasesTotal)}</span></div>
                <div>{t(language, 'Sales in selected period', 'Mauzo katika kipindi')}: <span className="font-semibold">TZS {currency(totalSales)}</span></div>
                <div>{t(language, 'Estimated profit', 'Makadirio ya faida')}: <span className="font-semibold">TZS {currency(totalSales - purchasesTotal)}</span></div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mobilemoney" activeValue={activeTab}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Mobile Money / Wakala', 'Wakala / Mitandao ya Simu na Benki')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
  <Input
    type="date"
    value={mobileMoneyForm.date}
    onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, date: e.target.value }))}
  />
  <div />
  <Input
    type="number"
    placeholder={t(language, 'Mobile Capital', 'Mtaji wa Simu')}
    value={mobileMoneyForm.mobileCapital}
    onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, mobileCapital: e.target.value }))}
  />
  <Input
    type="number"
    placeholder={t(language, 'Bank Capital', 'Mtaji wa Benki')}
    value={mobileMoneyForm.bankCapital}
    onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, bankCapital: e.target.value }))}
  />
</div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-lg font-semibold">{t(language, 'Mobile Networks', 'Mitandao ya Simu')}</div>
                <Input
                  type="number"
                  placeholder={t(language, 'Total cash for all mobile networks', 'Jumla ya cash kwa mitandao yote ya simu')}
                  value={mobileMoneyForm.mobileCashTotal}
                  onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, mobileCashTotal: e.target.value }))}
                />
                <div className="mt-3 space-y-3">
                  {mobileMoneyForm.networks.map((row, index) => (
                    <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-3">
                      <select className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={row.provider} onChange={(e) => updateNetworkRow(index, 'provider', e.target.value)}>
                        {MOBILE_PROVIDERS.map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                      <Input type="number" placeholder={t(language, 'Float', 'Float')} value={row.float} onChange={(e) => updateNetworkRow(index, 'float', e.target.value)} />
                      <div className="flex gap-2">
                        <Input type="number" placeholder={t(language, 'Commission', 'Kamisheni')} value={row.commission} onChange={(e) => updateNetworkRow(index, 'commission', e.target.value)} />
                        <Button type="button" variant="outline" onClick={() => removeNetworkRow(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="mt-3" onClick={addNetworkRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t(language, 'Add Another Network', 'Ongeza Mtandao')}
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-lg font-semibold">{t(language, 'Banks', 'Benki')}</div>
                <Input
                  type="number"
                  placeholder={t(language, 'Total cash for all banks', 'Jumla ya cash kwa benki zote')}
                  value={mobileMoneyForm.bankCashTotal}
                  onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, bankCashTotal: e.target.value }))}
                />
                <div className="mt-3 space-y-3">
                  {mobileMoneyForm.banks.map((row, index) => (
                    <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-3">
                      <select className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm" value={row.bankName} onChange={(e) => updateBankRow(index, 'bankName', e.target.value)}>
                        {BANKS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                      <Input type="number" placeholder={t(language, 'Float', 'Float')} value={row.float} onChange={(e) => updateBankRow(index, 'float', e.target.value)} />
                      <div className="flex gap-2">
                        <Input type="number" placeholder={t(language, 'Commission', 'Kamisheni')} value={row.commission} onChange={(e) => updateBankRow(index, 'commission', e.target.value)} />
                        <Button type="button" variant="outline" onClick={() => removeBankRow(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="mt-3" onClick={addBankRow}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t(language, 'Add Another Bank', 'Ongeza Benki')}
                </Button>
              </div>

              <Input placeholder={t(language, 'Notes', 'Maelezo')} value={mobileMoneyForm.notes} onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, notes: e.target.value }))} />
              <Button type="button" onClick={saveMobileMoney}>
                {t(language, 'Save Wakala', 'Hifadhi Wakala')}
              </Button>
            </CardContent>
          </Card>

          <Card>
   <CardHeader>
  <CardTitle>{t(language, 'Saved Wakala Records', 'Rekodi za Wakala')}</CardTitle>
</CardHeader>

<CardContent className="space-y-3 text-sm">
{todayMobileMoneyEntries.length === 0 ? (
    <div className="text-slate-500">
      {t(language, 'No mobile money records yet.', 'Hakuna rekodi za wakala bado.')}
    </div>
  ) : (
    todayMobileMoneyEntries.slice().reverse().map((entry) => (
      <div key={entry.id} className="rounded-2xl bg-slate-50 p-3">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div className="flex-1">
      <div className="font-medium">{entry.date}</div>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div>{t(language, 'Mobile cash total', 'Jumla ya cash ya simu')}: TZS {currency(entry.mobileCashTotal)}</div>
          <div>{t(language, 'Mobile Capital', 'Mtaji wa Simu')}: TZS {currency(entry.mobileCapital)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div>{t(language, 'Bank cash total', 'Jumla ya cash ya benki')}: TZS {currency(entry.bankCashTotal)}</div>
          <div>{t(language, 'Bank Capital', 'Mtaji wa Benki')}: TZS {currency(entry.bankCapital)}</div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-2 font-semibold">{t(language, 'Mobile Money', 'Mobile Money')}</div>

          <div className="space-y-1 text-sm">
            {(entry.networks || []).length === 0 ? (
              <div className="text-slate-500">{t(language, 'No mobile network details.', 'Hakuna taarifa za mitandao ya simu.')}</div>
            ) : (
              (entry.networks || []).map((n) => (
                <div key={`${entry.id}-${n.provider}`}>
                  {n.provider}: {t(language, 'Float', 'Float')} TZS {currency(n.float)} | {t(language, 'Commission', 'Kamisheni')} TZS {currency(n.commission)}
                </div>
              ))
            )}
          </div>

          <div className="mt-3 space-y-1 text-sm">
            <div>{t(language, 'Total Mobile Float', 'Jumla ya Float ya Simu')}: TZS {currency(getMobileFloatTotal(entry))}</div>
            <div>{t(language, 'Total Mobile Commission', 'Jumla ya Kamisheni ya Simu')}: TZS {currency(getMobileCommissionTotal(entry))}</div>
            <div className="font-medium">
              {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.mobileCapital, getMobileFloatTotal(entry), getMobileCommissionTotal(entry), language)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-2 font-semibold">{t(language, 'Banks', 'Benki')}</div>

          <div className="space-y-1 text-sm">
            {(entry.banks || []).length === 0 ? (
              <div className="text-slate-500">{t(language, 'No bank details.', 'Hakuna taarifa za benki.')}</div>
            ) : (
              (entry.banks || []).map((b) => (
                <div key={`${entry.id}-${b.bankName}`}>
                  {b.bankName}: {t(language, 'Float', 'Float')} TZS {currency(b.float)} | {t(language, 'Commission', 'Kamisheni')} TZS {currency(b.commission)}
                </div>
              ))
            )}
          </div>

          <div className="mt-3 space-y-1 text-sm">
            <div>{t(language, 'Total Bank Float', 'Jumla ya Float ya Benki')}: TZS {currency(getBankFloatTotal(entry))}</div>
            <div>{t(language, 'Total Bank Commission', 'Jumla ya Kamisheni ya Benki')}: TZS {currency(getBankCommissionTotal(entry))}</div>
            <div className="font-medium">
              {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.bankCapital, getBankFloatTotal(entry), getBankCommissionTotal(entry), language)}
            </div>
          </div>
        </div>
      </div>
    </div>

    {canBack ? (
  <div className="flex items-center gap-2 lg:ml-3">
    <Button type="button" variant="outline" size="sm" onClick={() => editMobileMoney(entry)}>
      <Pencil className="h-4 w-4" />
    </Button>

    <Button type="button" variant="outline" size="sm" onClick={() => deleteMobileMoney(entry.id)}>
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
) : null}
  </div>
</div>

))
)}
</CardContent>
</Card>
</div>
</TabsContent>
</AppShell>
);
}


export default function MultiShopPOSFinal() {
  const [data, setData] = useState(seedData);
  const [activeShopId, setActiveShopId] = useState(null);
  const [ownerPeriod, setOwnerPeriod] = useState('today');
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [syncMessage, setSyncMessage] = useState('');
const [isHydrating, setIsHydrating] = useState(true);
const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

 useEffect(() => {
  (async () => {
    try {
      const { data: authSession } = await supabase.auth.getSession();
      const authUser = authSession?.session?.user || null;

      let restoredCurrentUser = null;

      if (authUser) {
        const matchedUser = (seedData.users || []).find(
          (u) =>
            String(u.email || '').toLowerCase() ===
            String(authUser.email || '').toLowerCase()
        );

        if (matchedUser) {
          restoredCurrentUser = {
            ...matchedUser,
            auth_user_id: authUser.id,
          };

          writeStorage(STORAGE_SESSION_KEY, restoredCurrentUser);
        }
      } else {
        writeStorage(STORAGE_SESSION_KEY, null);
      }

      const initial = await readData();

      const nextData = {
        ...initial,
        currentUser: restoredCurrentUser,
      };

      setData(nextData);

      if (restoredCurrentUser?.role === 'shop') {
        setActiveShopId(
          restoredCurrentUser.shop_id ||
            restoredCurrentUser.shopId ||
            null
        );
      } else {
        setActiveShopId(null);
      }
    } catch (error) {
      console.error('readData init failed:', error);
    } finally {
      setHasLoadedInitialData(true);
      setIsHydrating(false);
    }
  })();
}, []);
useEffect(() => {
processSyncQueue();
  const goOnline = async () => {
    setIsOnline(true);
    setSyncMessage('Back online - syncing...');

    await processSyncQueue();

    writeStorage(STORAGE_LAST_SYNC_KEY, Date.now());
    setSyncMessage('Sync complete');
  };

  const goOffline = () => {
    setIsOnline(false);
    setSyncMessage('You are offline');
  };

  window.addEventListener('online', goOnline);
  window.addEventListener('offline', goOffline);

  return () => {
    window.removeEventListener('online', goOnline);
    window.removeEventListener('offline', goOffline);
  };
}, []);
useEffect(() => {
  const initOnlineStatus = async () => {
    const online = navigator.onLine;
    setIsOnline(online);

    if (online) {
      setSyncMessage('Checking sync...');
      await processSyncQueue();
      writeStorage(STORAGE_LAST_SYNC_KEY, Date.now());
      setSyncMessage('Sync complete');
    }
  };

  initOnlineStatus();
}, []);

useEffect(() => {
  if (!activeShopId) return;

  const loadProductsForShop = async () => {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', activeShopId);

    setData((prev) => ({
      ...prev,
      products: (products || []).map((p) => ({
        id: p.id,
        name: p.name,
        buyPrice: Number(p.buyingprice || 0),
        sellPrice: Number(p.sellingprice || 0),
        stockBaseQty: Number(p.stock || 0),
        stockQty: Number(p.stock || 0),
        shop_id: p.shop_id || p.shopid || '',
        baseUnit: p.baseunit || 'pc',
        minStockLevel: 5,
        expiryDate: '',
        qrCode: '',
        subUnitsRaw: '',
        createdAt: p.createdAt || (p.created_at ? String(p.created_at).slice(0, 10) : ''),
        confirmed: true,
      })),
    }));
  };

  loadProductsForShop();

  const productsChannel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `shop_id=eq.${activeShopId}`,
      },
      async () => {
        await loadProductsForShop();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(productsChannel);
  };
}, [activeShopId]);
 useEffect(() => {
  if (!activeShopId) return;

  const salesChannel = supabase
    .channel('sales-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sales',
        filter: `shop_id=eq.${activeShopId}`,
      },
      async () => {
        const { data: sales } = await supabase
          .from('sales')
          .select('*')
          .eq('shop_id', activeShopId);

        setData((prev) => ({
          ...prev,
          sales: (sales || []).map((s) => ({
            ...s,
            shop_id: s.shop_id || s.shopid || '',
            date: s.date || (s.created_at ? String(s.created_at).slice(0, 10) : todayISO()),
          })),
        }));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(salesChannel);
  };
}, [activeShopId]);
useEffect(() => {
  if (!activeShopId) return;

  const loadExpensesForShop = async () => {
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('shop_id', activeShopId);

  const mappedExpenses = (expenses || []).map((e) => ({
    id: e.id,
    shop_id: e.shop_id || e.shopid || '',
    title: e.title || e.description || '',
    description: e.description || e.title || '',
    amount: Number(e.amount || 0),
    category: e.category || '',
    date: e.date || (e.created_at ? String(e.created_at).slice(0, 10) : todayISO()),
    notes: e.notes || '',
    created_at: e.created_at || '',
  }));

  setData((prev) => {
    const existingShopExpenses = (prev.expenses || []).filter(
      (e) => String(e.shop_id || '') === String(activeShopId)
    );

    if ((mappedExpenses.length === 0) && existingShopExpenses.length > 0) {
      return prev;
    }

    const otherShopExpenses = (prev.expenses || []).filter(
      (e) => String(e.shop_id || '') !== String(activeShopId)
    );

    return {
      ...prev,
      expenses: [...otherShopExpenses, ...mappedExpenses],
    };
  });
};

  loadExpensesForShop();

  const expensesChannel = supabase
    .channel('expenses-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `shop_id=eq.${activeShopId}`,
      },
      async () => {
        await loadExpensesForShop();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(expensesChannel);
  };
}, [activeShopId]);

  const saveData = (next) => {
  const normalized = normalizeData(next);

  try {
    // rotate old backups
    for (let i = BACKUP_KEYS.length - 1; i > 0; i--) {
  const prev = readStorage(BACKUP_KEYS[i - 1], null);
  if (prev) {
    writeStorage(BACKUP_KEYS[i], prev);
  }
}

    // save current data as newest backup
    const current = readStorage(STORAGE_KEY, null);
if (current) {
  writeStorage(BACKUP_KEYS[0], current);
}
  } catch (err) {
    console.warn('Backup rotation failed', err);
  }

  setData(normalized);
writeStorage(STORAGE_KEY, normalized);
writeStorage(STORAGE_PRODUCTS_KEY, normalized.products || []);
writeStorage(STORAGE_SALES_KEY, normalized.sales || []);
writeStorage(STORAGE_PURCHASES_KEY, normalized.purchases || []);
writeStorage(STORAGE_EXPENSES_KEY, normalized.expenses || []);
writeStorage(STORAGE_CREDIT_KEY, normalized.creditSales || []);
writeStorage(STORAGE_CHANGE_KEY, normalized.changeLedger || []);
writeStorage(STORAGE_MOBILE_MONEY_KEY, normalized.mobileMoneyEntries || []);
writeStorage(STORAGE_GAS_KEY, normalized.gasEntries || []);
writeStorage(STORAGE_META_KEY, { lastSavedAt: Date.now(), version: "v1" });
writeToDB(DB_DATA_KEY, normalized).catch((err) => {
  console.error('IndexedDB save failed:', err);
});
};
const exportBackup = () => {

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
if (!raw) {
  alert('No backup data found.');
  return;
}

const parsed = raw;
const backupPayload = {
  app: 'rafikiai-multi-shop-pos',
  version: APP_BACKUP_VERSION,
  createdAt: new Date().toISOString(),
  data: parsed,
};

const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POS_Backup_${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Export backup failed.');
  }
};
const importBackup = () => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
  try {
    const rawText = e.target?.result;
    const parsed = JSON.parse(rawText);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      alert('Invalid backup file.');
      return;
    }

    const backupData =
      parsed.app === 'rafikiai-multi-shop-pos' && parsed.data && typeof parsed.data === 'object'
        ? parsed.data
        : parsed;

    const normalized = normalizeData(backupData);

    writeStorage(STORAGE_KEY, normalized);
    setData(normalized);

    alert('Backup restored successfully. Reloading POS.');
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('Backup restore failed.');
  }
};

      reader.onerror = () => {
        alert('Could not read the backup file.');
      };

      reader.readAsText(file);
    };

    input.click();
  } catch (err) {
    console.error(err);
    alert('Import backup failed.');
  }
};
  const resetDemo = () => {
    writeStorage(STORAGE_KEY, null);
    setData(normalizeData(seedData));
    setActiveShopId(null);
  };
const handleLogin = async (user) => {
  const { data: authData } = await supabase.auth.getUser();
  const authUserId = authData?.user?.id || null;

  const sessionUser = {
    ...user,
    auth_user_id: authUserId,
  };

  writeStorage(STORAGE_SESSION_KEY, sessionUser);

  const shopId =
    user.role === 'shop'
      ? user.shop_id || user.shopId || null
      : null;

  // Clear previous shop data first
  setData((prev) => ({
    ...seedData,
    users: prev.users,
    currentUser: sessionUser,
  }));

  setActiveShopId(shopId);

  const loaded = await readData();

  let products = loaded.products || [];

  if (shopId) {
    const { data: freshProducts } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId);

    products = (freshProducts || []).map((p) => ({
      id: p.id,
      name: p.name,
      buyPrice: Number(p.buyingprice || 0),
      sellPrice: Number(p.sellingprice || 0),
      stockBaseQty: Number(p.stock || 0),
      stockQty: Number(p.stock || 0),
      shop_id: p.shop_id || p.shopid || '',
      baseUnit: p.baseunit || 'pc',
      minStockLevel: 5,
      expiryDate: '',
      qrCode: '',
      subUnitsRaw: '',
      createdAt: p.createdAt || (p.created_at ? String(p.created_at).slice(0, 10) : ''),
      confirmed: true,
    }));
  }

  setData((prev) => ({
  ...loaded,
  users: loaded.users?.length ? loaded.users : seedData.users,
  products: (products || []).map((p) => {
    const existing = prev.products.find((x) => x.id === p.id);
    return existing?.archived ? { ...p, archived: true } : p;
  }),
  expenses: loaded.expenses || prev.expenses || [],
  currentUser: sessionUser,
}));
};
const openShopDashboard = async (shopId) => {
  setActiveShopId(shopId);

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId);

  setData((prev) => ({
    ...prev,
    products: (products || []).map((p) => ({
      id: p.id,
      name: p.name,
      buyPrice: Number(p.buyingprice || 0),
      sellPrice: Number(p.sellingprice || 0),
      stockBaseQty: Number(p.stock || 0),
      stockQty: Number(p.stock || 0),
      shop_id: p.shop_id || p.shopid || '',
      baseUnit: p.baseunit || 'pc',
      minStockLevel: 5,
      expiryDate: '',
      qrCode: '',
      subUnitsRaw: '',
      createdAt: p.createdAt || (p.created_at ? String(p.created_at).slice(0, 10) : ''),
      confirmed: true,
    })),
  }));
};
const logout = async () => {
  await supabase.auth.signOut();

  writeStorage(STORAGE_SESSION_KEY, null);

  setData((prev) => ({
    ...prev,
    currentUser: null,
  }));

  setActiveShopId(null);
};
if (!hasLoadedInitialData) {
  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
      Loading POS...
    </div>
  );
}
if (isHydrating) {
  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
      Loading POS...
    </div>
  );
}
  if (!data.currentUser) {
    return <Login onLogin={handleLogin} users={data.users} language={language} setLanguage={setLanguage} />;
  }

  const selectedShopId =
  data.currentUser.role === 'shop'
    ? (data.currentUser.shop_id || data.currentUser.shopId || null)
    : activeShopId;
  if (!selectedShopId) {
    return (
  <>
    <div
      className={`mx-4 mt-4 rounded-2xl px-4 py-2 text-sm font-medium ${
        isOnline ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {isOnline ? 'Online' : 'Offline'} {syncMessage ? `- ${syncMessage}` : ''}
    </div>

    <OwnerDashboard
  data={data}
  setAppData={setData}
  openShop={openShopDashboard}
  logout={logout}
  exportBackup={exportBackup}
  importBackup={importBackup}
  ownerPeriod={ownerPeriod}
  setOwnerPeriod={setOwnerPeriod}
  language={language}
  setLanguage={setLanguage}
/>
  </>
);
  }

  const shop = data.shops.find((s) => s.id === selectedShopId) || data.shops[0];
return (
  <>
    <div
      className={`mx-4 mt-4 rounded-2xl px-4 py-2 text-sm font-medium ${
        isOnline ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {isOnline ? 'Online' : 'Offline'} {syncMessage ? `- ${syncMessage}` : ''}
    </div>

    <ShopDashboard
      shop={shop}
      data={data}
      saveData={saveData}
      logout={logout}
      canBack={data.currentUser.role === 'owner'}
      backToOwner={() => setActiveShopId(null)}
      language={language}
      setLanguage={setLanguage}
      exportBackup={exportBackup}
    />
  </>
);
}
