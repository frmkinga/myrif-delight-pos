import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import { GasBusinessSection, GasDashboardCard, GasReportBlock, buildGasRecord, getGasDashboardSummary } from './GasBusinessSection';
import RentalPropertySection from './RentalPropertySection';
import CEODecisionCentre from './CEODecisionCentre';
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
const BANKS = ['CRDB', 'NMB', 'NBC'];
const GAS_TYPES = ['Taifa Gas', 'Oryx Gas', 'Mihan / Taifa Gas', 'O Gas', 'Other'];
const GAS_CYLINDER_SIZES = ['Small Cylinder', 'Big Cylinder'];
const GAS_PRICE_BOOK = {
  'Taifa Gas': {
    smallBuy: 20500,
    smallSell: 25000,
    bigBuy: 49000,
    bigSell: 55000,
  },
  'Mihan / Taifa Gas': {
    smallBuy: 20500,
    smallSell: 25000,
    bigBuy: 49000,
    bigSell: 55000,
  },
  'Oryx Gas': {
    smallBuy: 24500,
    smallSell: 27000,
    bigBuy: 56000,
    bigSell: 60000,
  },
  'O Gas': {
    smallBuy: 21000,
    smallSell: 25000,
    bigBuy: 49000,
    bigSell: 55000,
  },
};

function getWeeklyLoginTheme() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekIndex = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));

  const themes = [
    {
      page: 'bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(240,253,250,0.92),rgba(248,250,252,0.96))]',
      overlay: 'bg-[linear-gradient(135deg,rgba(6,78,59,0.58),rgba(20,184,166,0.30),rgba(255,255,255,0.20))]',
      panel: 'bg-[linear-gradient(135deg,rgba(16,185,129,0.72),rgba(20,184,166,0.48),rgba(240,253,250,0.34))]',
      badge: 'bg-emerald-600',
      button: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700',
      focusUser: 'focus:border-emerald-400',
      focusPassword: 'focus:border-teal-400',
    },
    {
      page: 'bg-[linear-gradient(135deg,rgba(240,253,244,0.95),rgba(236,253,245,0.90),rgba(255,255,255,0.96))]',
      overlay: 'bg-[linear-gradient(135deg,rgba(22,101,52,0.54),rgba(132,204,22,0.24),rgba(255,255,255,0.18))]',
      panel: 'bg-[linear-gradient(135deg,rgba(34,197,94,0.68),rgba(132,204,22,0.38),rgba(236,253,245,0.30))]',
      badge: 'bg-green-600',
      button: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700',
      focusUser: 'focus:border-green-400',
      focusPassword: 'focus:border-emerald-400',
    },
    {
      page: 'bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(240,253,250,0.92),rgba(236,253,245,0.95))]',
      overlay: 'bg-[linear-gradient(135deg,rgba(15,118,110,0.50),rgba(45,212,191,0.26),rgba(255,255,255,0.20))]',
      panel: 'bg-[linear-gradient(135deg,rgba(13,148,136,0.68),rgba(45,212,191,0.36),rgba(240,253,250,0.30))]',
      badge: 'bg-teal-600',
      button: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-lime-600 hover:from-teal-700 hover:via-emerald-700 hover:to-lime-700',
      focusUser: 'focus:border-teal-400',
      focusPassword: 'focus:border-emerald-400',
    },
  ];

  return themes[weekIndex % themes.length];
}

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

function debugSyncQueue() {
  const queue = readSyncQueue();
  console.log('SYNC QUEUE SNAPSHOT', {
    count: Array.isArray(queue) ? queue.length : 0,
    items: queue,
  });
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

  if (!queue.length) return false;

  const updatedQueue = [...queue];
let syncedSomething = false;

  for (let i = 0; i < updatedQueue.length; i += 1) {
    const item = updatedQueue[i];

    if (item.synced) continue;

    try {
      if (item.actionType === 'sale_created') {
        const { error: saleQueueError } = await supabase.from('sales').upsert(
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

if (saleQueueError) {
  throw saleQueueError;
}
if (Array.isArray(item.payload.products)) {
  const safeProductRows = item.payload.products
    .filter((p) => p.id && p.shop_id && p.name)
    .map((p) => ({
  id: p.id,
  name: String(p.name || '').trim(),
  standard_product_code: String(p.standard_product_code || p.standardProductCode || '').trim(),
  buyingprice: Number(p.buyPrice || 0),
  sellingprice: Number(p.sellPrice || 0),
  stock: Number(p.stockBaseQty || 0),
  shop_id: p.shop_id,
  baseunit: p.baseUnit || 'pc',
  created_at: p.created_at || new Date().toISOString(),
}));

    if (safeProductRows.length) {
    const { error: saleProductQueueError } = await supabase
      .from('products')
      .upsert(safeProductRows, { onConflict: 'id' });

    if (saleProductQueueError) {
      throw saleProductQueueError;
    }
  }
}
           } else if (item.actionType === 'purchase_created') {
        const purchasePayload = {
          id: item.payload.id,
          shop_id: item.payload.shop_id,
          productId: item.payload.productId,
          quantity: item.payload.quantity,
          unitCost: item.payload.unitCost,
          notes: item.payload.notes || '',
          date: item.payload.date,
          confirmed: item.payload.confirmed ?? true,
        };

        await supabase.from('purchases').upsert([purchasePayload], { onConflict: 'id' });

        if (Array.isArray(item.payload.products) && item.payload.products.length) {
  const safeProductRows = item.payload.products
    .filter((p) => p.id && p.shop_id && p.name)
    .map((p) => ({
  id: p.id,
  name: String(p.name || '').trim(),
  standard_product_code: String(p.standard_product_code || p.standardProductCode || '').trim(),
  buyingprice: Number(p.buyingprice ?? p.buyPrice ?? 0),
  sellingprice: Number(p.sellingprice ?? p.sellPrice ?? 0),
  stock: Number(p.stock ?? p.stockBaseQty ?? 0),
  shop_id: p.shop_id,
  baseunit: p.baseunit || p.baseUnit || 'pc',
  expirydate: p.expirydate || p.expiryDate || null,
  created_at: p.created_at || new Date().toISOString(),
}));

  if (safeProductRows.length) {
    await supabase
      .from('products')
      .upsert(safeProductRows, { onConflict: 'id' });
  }
}
      } else if (item.actionType === 'product_saved') {
        const productPayload = item.payload || {};

        const productRow = {
  id: productPayload.id,
  name: String(productPayload.name || '').trim(),
  standard_product_code: String(productPayload.standard_product_code || productPayload.standardProductCode || '').trim(),
  buyingprice: Number(productPayload.buyingprice ?? productPayload.buyPrice ?? 0),
  sellingprice: Number(productPayload.sellingprice ?? productPayload.sellPrice ?? 0),
  stock: Number(productPayload.stock ?? productPayload.stockBaseQty ?? 0),
  shop_id: productPayload.shop_id,
  baseunit: productPayload.baseunit || productPayload.baseUnit || 'pc',
  minstocklevel: Number(productPayload.minstocklevel ?? productPayload.minStockLevel ?? 5),
  expirydate: productPayload.expirydate || productPayload.expiryDate || null,
  qrcode: productPayload.qrcode || productPayload.qrCode || '',
  subunitsraw: productPayload.subunitsraw || productPayload.subUnitsRaw || '',
  archived: Boolean(productPayload.archived),
  created_at: productPayload.created_at || new Date().toISOString(),
};

        if (!productRow.id || !productRow.shop_id || !productRow.name) {
          throw new Error('Product sync skipped because id, shop_id, or name is missing.');
        }

        const { error: productQueueError } = await supabase
          .from('products')
          .upsert([productRow], { onConflict: 'id' });

        if (productQueueError) {
          throw productQueueError;
        }

      } else if (item.actionType === 'expense_created') {
        const payload = item.payload || {};

        const expenseRow = {
          id: payload.id,
          shop_id: payload.shop_id,
          title: payload.title || payload.description || '',
          description: payload.description || payload.title || '',
          amount: Number(payload.amount || 0),
          category: payload.category || '',
          date: payload.date || todayISO(),
          notes: payload.notes || '',
          created_at: payload.created_at || new Date().toISOString(),
          auto_recurring: Boolean(payload.auto_recurring || payload.autoRecurring),
          recurring_key: payload.recurring_key || '',
          sync_source: payload.sync_source || (payload.autoRecurring ? 'auto_recurring' : 'manual'),
        };

        if (!expenseRow.id || !expenseRow.shop_id || !expenseRow.title || !expenseRow.date) {
          throw new Error('Expense sync skipped because id, shop_id, title, or date is missing.');
        }

        const { error: expenseQueueError } = await supabase
          .from('expenses')
          .upsert([expenseRow], { onConflict: 'id' });

        if (expenseQueueError) {
          throw expenseQueueError;
        }
              } else if (item.actionType === 'credit_created') {
  await supabase.from('creditSales').upsert([item.payload], { onConflict: 'id' });
} else if (item.actionType === 'mobile_money_created') {

        await supabase.from('mobileMoneyEntries').upsert([item.payload], { onConflict: 'id' });

      } else if (item.actionType === 'monthly_wakala_commission_saved') {
        const payload = item.payload || {};

        const row = {
          id: payload.id,
          shop_id: payload.shop_id,
          shopName: payload.shopName || '',
          commissionMonth: payload.commissionMonth || '',
          mobileCommissions: payload.mobileCommissions || [],
          bankCommissions: payload.bankCommissions || [],
          mobileTotal: Number(payload.mobileTotal || 0),
          bankTotal: Number(payload.bankTotal || 0),
          grandTotal: Number(payload.grandTotal || 0),
          notes: payload.notes || '',
          created_at: payload.created_at || new Date().toISOString(),
          updated_at: payload.updated_at || new Date().toISOString(),
        };

        await supabase
          .from('monthlyWakalaCommissions')
          .upsert([row], { onConflict: 'id' });

      } else if (item.actionType === 'gas_created') {
        await supabase.from('gasEntries').upsert([item.payload], { onConflict: 'id' });
      }

            updatedQueue[i] = {
        ...item,
        synced: true,
        syncedAt: Date.now(),
      };
      syncedSomething = true;
    } catch (error) {
      console.error('Sync failed for queue item:', item, error);

      updatedQueue[i] = {
        ...item,
        synced: false,
        status: 'failed',
        attempts: Number(item.attempts || 0) + 1,
        lastAttemptAt: Date.now(),
        lastError: error?.message || String(error || 'Unknown sync error'),
      };
    }
  }
  writeSyncQueue(updatedQueue);
  clearSyncedQueueItems();
  return syncedSomething;
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

const parseMoneyInput = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  return Number(String(value).replace(/,/g, '').trim() || 0);
};

const currency = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parseMoneyInput(value));

const formatMoneyInput = (value) => {
  const raw = String(value ?? '').replace(/,/g, '').replace(/[^\d.]/g, '');

  if (!raw) return '';

  const [whole, decimal] = raw.split('.');
  const formattedWhole = new Intl.NumberFormat('en-US').format(Number(whole || 0));

  return decimal !== undefined ? `${formattedWhole}.${decimal.slice(0, 2)}` : formattedWhole;
};

const formatQty = (value) => {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
};

const buildStandardProductCode = (name, unit = '') => {
  const cleaned = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F]+/gi, '-')
    .replace(/^-+|-+$/g, '');

  const cleanUnit = String(unit || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');

  return cleanUnit && !cleaned.includes(cleanUnit)
    ? `${cleaned}-${cleanUnit}`.replace(/-+/g, '-')
    : cleaned.replace(/-+/g, '-');
};

const todayISO = (input = new Date()) => {
  const d = new Date(input);
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

const daysAgoISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - Number(days || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

  const getItemDateValue = (item) => {
    if (item?.date) return String(item.date).slice(0, 10);
    if (item?.createdAt) return String(item.createdAt).slice(0, 10);
    if (item?.created_at) return String(item.created_at).slice(0, 10);
    return todayISO();
  };

  const getStartOfWeek = (date) => {
    const d = startOfDay(date);
    const day = d.getDay(); // Sunday = 0, Monday = 1
    const diff = day === 0 ? -6 : 1 - day;
    return addDays(d, diff);
  };

  const startOfThisWeek = getStartOfWeek(now);
  const startOfLastWeek = addDays(startOfThisWeek, -7);
  const endOfLastWeek = addDays(startOfThisWeek, -1);

  const startOfThisMonth = startOfMonth(now);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = addDays(startOfThisMonth, -1);

  const startOfThisYear = new Date(now.getFullYear(), 0, 1);

  return items.filter((item) => {
    const value = getItemDateValue(item);
    const d = startOfDay(value);

    if (preset === 'today') return value === todayISO();
    if (preset === 'yesterday') return value === todayISO(addDays(now, -1));

    if (preset === 'date') {
      if (typeof customDate === 'object' && customDate?.start && customDate?.end) {
        return value >= customDate.start && value <= customDate.end;
      }
      return value === customDate;
    }

    // This week to date: Monday up to today
    if (preset === 'week') return d >= startOfThisWeek && d <= now;

    // Last completed week: Monday to Sunday
    if (preset === 'lastweek') return d >= startOfLastWeek && d <= endOfLastWeek;

    // This month to date: 1st day of this month up to today
    if (preset === 'month') return d >= startOfThisMonth && d <= now;

    // Last completed month: 1st day to last day of previous month
    if (preset === 'lastmonth') return d >= startOfLastMonth && d <= endOfLastMonth;

    if (preset === '3months') return d >= addDays(now, -89) && d <= now;
    if (preset === '6months') return d >= addDays(now, -179) && d <= now;

    // This year to date: 1 January up to today
    if (preset === 'year') return d >= startOfThisYear && d <= now;

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
  standardProductCode: '',
  standard_product_code: '',
};
const emptyPurchaseRow = {
  id: '',
  productId: '',
  productSearch: '',
  quantity: '',
  unitCost: '',
  date: todayISO(),
  expiryDate: '',
  notes: '',
};
const emptyExpenseRow = { id: '', title: '', amount: '', category: '', date: todayISO(), notes: '' };
const emptyCreditRow = { id: '', customerName: '', amount: '', phone: '', notes: '' };
const emptyChangeRow = { id: '', customerName: '', amountOwed: '', notes: '' };
const emptyNetworkRow = { provider: 'M-Pesa', float: '' };
const emptyBankRow = { bankName: 'CRDB', float: '' };
const RECURRING_EXPENSES_BY_SHOP = {
  'shop-1': [
    { title: 'Home Expenses', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1500', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1500', category: 'Recurring', notes: '' },
  ],
  'shop-2': [
    { title: 'Home Expenses', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1500', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1500', category: 'Recurring', notes: '' },
  ],
  'shop-3': [
    { title: 'Home Expenses', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1000', category: 'Recurring', notes: '' },
  ],
  'shop-4': [
    { title: 'Home Expenses', amount: '0', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1000', category: 'Recurring', notes: '' },
  ],
  'shop-5': [
    { title: 'Home Expenses', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1000', category: 'Recurring', notes: '' },
  ],
};
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
const emptyGasSaleRow = {
  id: '',
  gasType: 'Taifa Gas',
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
  { id: 'u-1', username: 'shop1', email: 'nyumbani@shop1.com', password: '2026', role: 'shop', shop_id: 'shop-1', shopId: 'shop-1', name: 'Nyumbani User' },
  { id: 'u-2', username: 'shop2', email: 'mkwajuni@shop2.com', password: '2026', role: 'shop', shop_id: 'shop-2', shopId: 'shop-2', name: 'Mkwajuni User' },
  { id: 'u-3', username: 'shop3', email: 'kwamaganga@shop3.com', password: '2026', role: 'shop', shop_id: 'shop-3', shopId: 'shop-3', name: 'Kwa Maganga User' },
  { id: 'u-4', username: 'shop4', email: 'shangwe@shop4.com', password: '2026', role: 'shop', shop_id: 'shop-4', shopId: 'shop-4', name: 'Shangwe User' },
  { id: 'u-5', username: 'shop5', email: 'mungumwema@shop5.com', password: '2026', role: 'shop', shop_id: 'shop-5', shopId: 'shop-5', name: 'Mungu Mwema User' },
],
    products: [],
  sales: [],
  creditSales: [],
  changeLedger: [],
  expenses: [],
  purchases: [],
    mobileMoneyEntries: [],
  monthlyWakalaCommissions: [],
  gasEntries: [],
  houses: [],
  meters: [],
  serviceCharges: [],
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
  const normalizedShopId = String(rest.shop_id || shopId || shopid || '').trim();
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
  standardProductCode: String(rest.standardProductCode || rest.standard_product_code || '').trim(),
  standard_product_code: String(rest.standard_product_code || rest.standardProductCode || '').trim(),
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
    monthlyWakalaCommissions: Array.isArray(parsed.monthlyWakalaCommissions) ? parsed.monthlyWakalaCommissions : [],
    gasEntries: Array.isArray(parsed.gasEntries) ? parsed.gasEntries : [],
    houses: Array.isArray(parsed.houses) ? parsed.houses : [],
    meters: Array.isArray(parsed.meters) ? parsed.meters : [],
    serviceCharges: Array.isArray(parsed.serviceCharges) ? parsed.serviceCharges : [],
  };
}

async function readData({ preferFresh = true } = {}) {
  try {
    const dbData = await readFromDB(DB_DATA_KEY);

    if (!preferFresh && dbData) {
      return normalizeData(dbData);
    }

    if (navigator.onLine) {
      try {
   const savedSessionUser = readStorage(STORAGE_SESSION_KEY, null);
const {
  data: { session },
} = await supabase.auth.getSession();

const isOwnerUser = String(savedSessionUser?.role || '') === 'owner';
let sessionShopId = isOwnerUser
  ? null
  : String(savedSessionUser?.shop_id || '').trim() || null;

if (session?.user?.id && !isOwnerUser) {
  const { data: shopUserRow } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('id', session.user.id)
    .maybeSingle();

  if (shopUserRow?.shop_id) {
    sessionShopId = String(shopUserRow.shop_id).trim();
  }
}

        let productsQuery = supabase.from('products').select('*');
let salesQuery = supabase
  .from('sales')
  .select('*')
  .gte('date', daysAgoISO(30))
  .order('created_at', { ascending: false });
let purchasesQuery = supabase.from('purchases').select('*');
let expensesQuery = supabase.from('expenses').select('*');
let creditQuery = supabase.from('creditSales').select('*');
let changeQuery = supabase.from('changeLedger').select('*');
let mobileMoneyQuery = supabase.from('mobileMoneyEntries').select('*');
let monthlyWakalaCommissionsQuery = supabase.from('monthlyWakalaCommissions').select('*');
let gasQuery = supabase.from('gasEntries').select('*');
let housesQuery = supabase.from('houses').select('*');
let metersQuery = supabase.from('meters').select('*');
let serviceChargesQuery = supabase.from('servicecharges').select('*');

        if (sessionShopId) {
  productsQuery = productsQuery.eq('shop_id', sessionShopId);
  salesQuery = salesQuery.eq('shop_id', sessionShopId);
  purchasesQuery = purchasesQuery.eq('shop_id', sessionShopId);
  expensesQuery = expensesQuery.eq('shop_id', sessionShopId);
  creditQuery = creditQuery.eq('shop_id', sessionShopId);
  changeQuery = changeQuery.eq('shop_id', sessionShopId);
  mobileMoneyQuery = mobileMoneyQuery.eq('shop_id', sessionShopId);
  monthlyWakalaCommissionsQuery = monthlyWakalaCommissionsQuery.eq('shop_id', sessionShopId);
  gasQuery = gasQuery.eq('shop_id', sessionShopId);
  housesQuery = housesQuery.eq('shop_id', sessionShopId);
  metersQuery = metersQuery.eq('shop_id', sessionShopId);
  serviceChargesQuery = serviceChargesQuery.eq('shop_id', sessionShopId);
}

        const [
  { data: cloudProducts },
  { data: cloudSales },
  { data: cloudPurchases },
  { data: cloudExpenses },
  { data: cloudCreditSales },
  { data: cloudChangeLedger },
  { data: cloudMobileMoneyEntries },
  { data: cloudMonthlyWakalaCommissions },
  { data: cloudGasEntries },
  { data: cloudHouses },
  { data: cloudMeters },
  { data: cloudServiceCharges },
] = await Promise.all([
  productsQuery,
  salesQuery,
  purchasesQuery,
  expensesQuery,
  creditQuery,
  changeQuery,
  mobileMoneyQuery,
  monthlyWakalaCommissionsQuery,
  gasQuery,
  housesQuery,
  metersQuery,
  serviceChargesQuery,
]);

const normalized = normalizeData({
  ...seedData,
  houses: (cloudHouses || []).map((h) => ({
    id: h?.id || '',
    shop_id: String(h?.shop_id || '').trim(),
    houseNumber: h?.houseNumber || '',
    tenantName: h?.tenantName || '',
    rentPaidDate: h?.rentPaidDate || '',
    rentStartDate: h?.rentStartDate || '',
    rentEndDate: h?.rentEndDate || '',
    monthlyRentAmount: Number(h?.monthlyRentAmount || 0),
    amountPaid: Number(h?.amountPaid || 0),
    rentDurationMonths: Number(h?.rentDurationMonths || 1),
    paymentType: h?.paymentType || 'Full',
    houseStatus: h?.houseStatus || 'Occupied',
    itemsIssued: h?.itemsIssued || '',
    nextPaymentDate: h?.nextPaymentDate || '',
    balance: Number(h?.balance || 0),
    created_at: h?.created_at || '',
  })),
  meters: (cloudMeters || []).map((m) => ({
    id: m?.id || '',
    shop_id: String(m?.shop_id || '').trim(),
    houseNumber: m?.houseNumber || '',
    meterType: m?.meterType || 'Water',
    meterNumber: m?.meterNumber || '',
    readingDate: m?.readingDate || '',
    previousUnits: Number(m?.previousUnits || 0),
    currentUnits: Number(m?.currentUnits || 0),
    unitsUsed: Number(m?.unitsUsed || 0),
    costPerUnit: Number(m?.costPerUnit || 0),
    discount: Number(m?.discount || 0),
    totalAmount: Number(m?.totalAmount || 0),
    nextReadingDate: m?.nextReadingDate || '',
    notes: m?.notes || '',
    created_at: m?.created_at || '',
  })),
  serviceCharges: (cloudServiceCharges || []).map((s) => ({
    id: s?.id || '',
    shop_id: String(s?.shop_id || '').trim(),
    houseNumber: s?.houseNumber || '',
    tenantName: s?.tenantName || '',
    serviceChargeAmount: Number(s?.serviceChargeAmount || 0),
    datePaid: s?.datePaid || '',
    nextPaymentDate: s?.nextPaymentDate || '',
    paymentStatus: s?.paymentStatus || 'Paid',
    notes: s?.notes || '',
    created_at: s?.created_at || '',
  })),
  currentUser: savedSessionUser,

  products: (cloudProducts || []).map((p) => ({
  id: p?.id || '',
  name: String(p?.name || '').trim(),
  standardProductCode: String(p?.standard_product_code || p?.standardProductCode || '').trim(),
  standard_product_code: String(p?.standard_product_code || p?.standardProductCode || '').trim(),
  buyPrice: Number(p?.buyingprice || p?.buyPrice || 0),
  sellPrice: Number(p?.sellingprice || p?.sellPrice || 0),
  stockBaseQty: Number(p?.stock || p?.stockBaseQty || p?.stockQty || 0),
  stockQty: Number(p?.stock || p?.stockBaseQty || p?.stockQty || 0),
  shop_id: String(p?.shop_id || '').trim(),
  baseUnit: p?.baseunit || p?.baseUnit || 'pc',
  minStockLevel: Number(p?.minstocklevel || p?.minStockLevel || 5),
  expiryDate: p?.expirydate || p?.expiryDate || '',
  qrCode: p?.qrcode || p?.qrCode || '',
  subUnitsRaw: p?.subunitsraw || p?.subUnitsRaw || '',
  archived: Boolean(p?.archived),
  createdAt: p?.createdAt || (p?.created_at ? String(p.created_at).slice(0, 10) : ''),
  confirmed: true,
})),
      sales: (cloudSales || []).map((s) => ({
  ...s,
  shop_id: String(s?.shop_id || '').trim(),
  date: s?.date || (s?.created_at ? String(s.created_at).slice(0, 10) : todayISO()),
  confirmed: true,
})),
      purchases: (cloudPurchases || []).map((p) => ({
        ...p,
        shop_id: String(p?.shop_id || '').trim(),
        date: p?.date || (p?.created_at ? String(p.created_at).slice(0, 10) : todayISO()),
      })),
      expenses: (cloudExpenses || []).map((e) => ({
        id: e?.id || '',
        shop_id: String(e?.shop_id || '').trim(),
        title: e?.title || e?.description || '',
        description: e?.description || e?.title || '',
        amount: Number(e?.amount || 0),
        category: e?.category || '',
        date: e?.date || (e?.created_at ? String(e.created_at).slice(0, 10) : todayISO()),
        notes: e?.notes || '',
        created_at: e?.created_at || '',
      })),
           creditSales: (cloudCreditSales || []).map((c) => ({
        ...c,
        shop_id: String(c?.shop_id || '').trim(),
        customerName: c?.customerName || c?.customer_name || '',
        phone: c?.phone || '',
        notes: c?.notes || '',
        amount: Number(c?.amount || 0),
        paid: Number(c?.paid || 0),
        balance:
          c?.balance !== undefined && c?.balance !== null
            ? Number(c.balance)
            : Math.max(0, Number(c?.amount || 0) - Number(c?.paid || 0)),
        date: c?.date || (c?.created_at ? String(c.created_at).slice(0, 10) : todayISO()),
      })),

      changeLedger: (cloudChangeLedger || []).map((c) => ({
        id: c?.id || '',
        shop_id: String(c?.shop_id || '').trim(),
        customerName: c?.customerName || '',
        amountOwed: Number(c?.amountOwed || 0),
        notes: c?.notes || '',
        date: c?.date || (c?.created_at ? String(c.created_at).slice(0, 10) : todayISO()),
        created_at: c?.created_at || '',
      })),
      mobileMoneyEntries: cloudMobileMoneyEntries || [],
      monthlyWakalaCommissions: cloudMonthlyWakalaCommissions || [],
      gasEntries: cloudGasEntries || [],
    });

        await writeToDB(DB_DATA_KEY, normalized);
    return normalized;
  } catch (error) {
    if (!preferFresh) {
      console.error('Cloud read failed during background refresh:', error);
      return dbData ? normalizeData(dbData) : normalizeData(seedData);
    }
    console.error('Cloud read failed, falling back to local:', error);
  }
}

    console.log('Reading data from localStorage first...');

    const raw = null;

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
  monthlyWakalaCommissions: raw.monthlyWakalaCommissions || [],
  gasEntries: separateGas || raw.gasEntries,
});

      await writeToDB(DB_DATA_KEY, normalized);
      return normalized;
    }

    console.log('No localStorage data found, checking IndexedDB...');
const fallbackDbData = await readFromDB(DB_DATA_KEY);

if (fallbackDbData) {
  return normalizeData(fallbackDbData);
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
  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-[28px] border border-slate-200 bg-white/90 p-2 shadow-md backdrop-blur-sm sticky top-0 z-[999]">
      {children}
    </div>
  );
}
function TabsTrigger({ value, activeValue, onClick, children }) {
  const active = value === activeValue;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm',
        active
          ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-md'
          : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900'
      )}
    >
      {children}
    </button>
  );
}
function TabsContent({ value, activeValue, children }) {
  return value === activeValue ? <div>{children}</div> : null;
}

        function StatCard({ title, value, subtitle = '', icon: Icon, color = 'bg-orange-300' }) {
  return (
    <div className={`rounded-2xl ${color} px-5 py-4 shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800">
            {title}
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-700">
              TZS
            </span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {String(value).replace('TZS', '').trim()}
            </span>
          </div>

          {subtitle ? (
            <div className="mt-1 text-xs text-slate-700">
              {subtitle}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
          <Icon className="h-5 w-5 text-slate-800" />
        </div>
      </div>
    </div>
  );
}
function Login({ onLogin, users, language, setLanguage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginTheme = getWeeklyLoginTheme();

 const submit = async (e) => {
  e.preventDefault();

  const typedUsername = String(username || '').trim();
  const typedPassword = String(password || '');

  const found = users.find(
    (u) => String(u.username || '').trim().toLowerCase() === typedUsername.toLowerCase()
  );

  if (!found || !found.email) {
    return setError(
      t(language, 'Wrong username or password.', 'Jina la mtumiaji au nenosiri si sahihi.')
    );
  }

  try {
    const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
      email: found.email,
      password: typedPassword,
    });

    if (authError) {
      return setError(
        t(language, 'Wrong username or password.', 'Jina la mtumiaji au nenosiri si sahihi.')
      );
    }

    setError('');

    onLogin({
      ...found,
      auth_user_id: signInData?.user?.id || null,
    });
  } catch (error) {
    console.error('Supabase login crashed:', error);

    return setError(
      t(language, 'Login failed. Please try again.', 'Kuingia kumeshindikana. Tafadhali jaribu tena.')
    );
  }
};

  return (
    <AppShell>
      <div className={`min-h-screen bg-[url('/login-bg.png')] bg-cover bg-center ${loginTheme.page}`}>
        <div className={`min-h-screen ${loginTheme.overlay} px-4 py-6 md:px-8`}>
          <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
            <div className="grid w-full overflow-hidden rounded-[36px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
              <div className={`relative hidden min-h-[620px] flex-col justify-between overflow-hidden ${loginTheme.panel} p-8 text-white lg:flex`}>
                <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                    Myrif Delight
                  </div>

                  <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
                    {t(language, 'Welcome back.', 'Karibu tena, Huduma bora, fahari yetu')}
                  </h1>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/85">
                    {t(
                      language,
                      'Manage kiosk, wakala, reports, stock and shop performance in one modern workspace.',
                      'Simamia kioski, wakala, ripoti, stock na utendaji wa duka katika eneo moja la kisasa.'
                    )}
                  </p>
                </div>

                <div className="relative z-10 grid gap-4">
                  <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                    <div className="text-sm font-medium text-white/90">
                    
                    </div>
                    <div className="mt-2 text-xs leading-6 text-white/75">
                      {t(
  language,
  'Built for gas, transactions and shop operations.',
  'Biashara ya gesi, miamala na maduka.'
)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                      <div className="text-2xl font-semibold">5</div>
                      <div className="mt-1 text-xs text-white/75">
                        {t(language, 'Connected shops', 'Maduka yaliyounganishwa')}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                      <div className="text-2xl font-semibold">
  {t(language, 'Quality-service', 'Huduma Bora')}
</div>
<div className="mt-1 text-xs text-white/75">
  {t(language, 'Gas, transactions and shop operations', 'Biashara ya gesi, miamala na maduka')}
</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center bg-white/70 p-4 backdrop-blur-xl sm:p-6 md:p-8 lg:p-10">
                <div className="mx-auto w-full max-w-md">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className={`inline-flex rounded-full ${loginTheme.badge} px-3 py-1 text-xs font-semibold text-white shadow-lg`}>
                        {t(language, 'Secure Access', 'Kuingia kwa Usalama')}
                      </div>

                      <h2 className="mt-4 text-3xl font-semibold text-slate-900">
                        {t(language, 'Please login to continue', 'Tafadhali ingia kuendelea')}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {t(
                          language,
                          'Use your shop credentials to open your workspace.',
                          'Tumia jina na nenosiri kufungua duka lako.'
                        )}
                      </p>
                    </div>

                    <select
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="sw">Kiswahili</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-xl">
                    <form onSubmit={submit} className="space-y-5">
                      <div>
                        <Label className="mb-2 text-sm font-medium text-slate-700">
                          {t(language, 'Username', 'Jina la mtumiaji')}
                        </Label>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={t(language, 'Enter username', 'Weka jina la mtumiaji')}
                          className={`h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm ${loginTheme.focusUser}`}
                        />
                      </div>

                      <div>
  <Label className="mb-2 text-sm font-medium text-slate-700">
    {t(language, 'Password', 'Nenosiri')}
  </Label>
  <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder={t(language, 'Enter password', 'Weka nenosiri')}
    className={`h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-sm shadow-sm ${loginTheme.focusPassword}`}
  />
</div>

{error ? (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    {error}
  </div>
) : null}

<div className="space-y-3 pt-1">
  <Button
    type="submit"
    className={`h-12 w-full rounded-2xl ${loginTheme.button} text-sm font-semibold text-white shadow-lg`}
  >
    {t(language, 'Login', 'Ingia')}
  </Button>
</div>
</form>
</div>

<div className="mt-5 text-center text-xs text-slate-500">
  {t(
    language,
    'Owner and shop users use the same secure sign-in area.',
    'Mmiliki na watumiaji wa duka hutumia eneo hili hili salama la kuingia.'
  )}
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

function getFloatStatus(capital, cashTotal, floatTotal, commissionTotal, language) {
  const availableBalance = Number(cashTotal || 0) + Number(floatTotal || 0);
  const diff = Number(availableBalance || 0) - Number(capital || 0);

  if (diff === 0) {
    return t(language, 'Balanced', 'Imesawazika');
  }

 if (diff > 0) {
    return `${t(language, 'Balance is above capital by TZS', 'Salio limezidi mtaji kwa TZS')} ${currency(diff)}`;
  }

  const gap = Math.abs(diff);

  if (commissionTotal > 0 && gap === Number(commissionTotal || 0)) {
    return `${t(language, 'Below capital, explained by commission: TZS', 'Upungufu umeelezwa na kamisheni: TZS')} ${currency(commissionTotal)}`;
  }

  return `${t(language, 'Balance is below capital by TZS', 'Mtaji umepungua kwa TZS')} ${currency(gap)}`;
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
const [ownerSalesSource, setOwnerSalesSource] = useState([]);
const [ownerSalesLoading, setOwnerSalesLoading] = useState(false);
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
    const shouldLoadOldOwnerSalesFromSupabase =
    ownerPeriod === 'lastweek' ||
    ownerPeriod === 'lastmonth' ||
    ownerPeriod === '3months' ||
    ownerPeriod === '6months' ||
    ownerPeriod === 'year';

  useEffect(() => {
    if (!shouldLoadOldOwnerSalesFromSupabase) {
      setOwnerSalesSource([]);
      setOwnerSalesLoading(false);
      return;
    }

    const loadOldOwnerSales = async () => {
      try {
        setOwnerSalesLoading(true);

        let startDate = daysAgoISO(89);
        let endDate = todayISO();

        const now = startOfDay(new Date());

        const getStartOfWeekForOwner = (date) => {
          const d = startOfDay(date);
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          return addDays(d, diff);
        };

        const startOfThisWeek = getStartOfWeekForOwner(now);
        const startOfLastWeek = addDays(startOfThisWeek, -7);
        const endOfLastWeek = addDays(startOfThisWeek, -1);

        const startOfThisMonthForOwner = startOfMonth(now);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = addDays(startOfThisMonthForOwner, -1);

        if (ownerPeriod === 'lastweek') {
          startDate = todayISO(startOfLastWeek);
          endDate = todayISO(endOfLastWeek);
        } else if (ownerPeriod === 'lastmonth') {
          startDate = todayISO(startOfLastMonth);
          endDate = todayISO(endOfLastMonth);
        } else if (ownerPeriod === '3months') {
          startDate = daysAgoISO(89);
        } else if (ownerPeriod === '6months') {
          startDate = daysAgoISO(179);
        } else if (ownerPeriod === 'year') {
          startDate = daysAgoISO(364);
        }

        const { data: oldSales, error } = await supabase
          .from('sales')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOwnerSalesSource(oldSales || []);
      } catch (error) {
        console.error('Failed to load old owner sales:', error);
        setOwnerSalesSource([]);
      } finally {
        setOwnerSalesLoading(false);
      }
    };

    loadOldOwnerSales();
  }, [ownerPeriod, shouldLoadOldOwnerSalesFromSupabase]);

  const ownerSalesBase = shouldLoadOldOwnerSalesFromSupabase ? ownerSalesSource : data.sales;

  const salesPeriod = filterByPreset(ownerSalesBase, ownerPeriod, todayISO());
console.log('OWNER STATE CHECK', {
  ownerPeriod,
  totalSalesInState: Array.isArray(ownerSalesBase) ? ownerSalesBase.length : 0,
  filteredSalesCount: Array.isArray(salesPeriod) ? salesPeriod.length : 0,
  firstThreeSales: Array.isArray(ownerSalesBase) ? ownerSalesBase.slice(0, 3) : [],
});
 const expensesPeriod = filterByPreset(data.expenses, ownerPeriod, todayISO());
  const totalSales = salesPeriod.reduce((a, s) => a + Number(s.total || 0), 0);
console.log('TOTAL CHECK', {
  totalSales,
  count: salesPeriod.length
});
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

const commissionMonthMatchesOwnerPeriod = (record) => {
  if (!record?.commissionMonth) return false;

  const [year, month] = String(record.commissionMonth).split('-').map(Number);
  if (!year || !month) return false;

  const now = startOfDay(new Date());
  const commissionMonthStart = new Date(year, month - 1, 1);

  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  if (ownerPeriod === 'month') {
    return (
      commissionMonthStart.getFullYear() === thisMonthStart.getFullYear() &&
      commissionMonthStart.getMonth() === thisMonthStart.getMonth()
    );
  }

  if (ownerPeriod === 'lastmonth') {
    return (
      commissionMonthStart.getFullYear() === lastMonthStart.getFullYear() &&
      commissionMonthStart.getMonth() === lastMonthStart.getMonth()
    );
  }

  if (ownerPeriod === '3months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return commissionMonthStart >= start && commissionMonthStart <= thisMonthStart;
  }

  if (ownerPeriod === '6months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    return commissionMonthStart >= start && commissionMonthStart <= thisMonthStart;
  }

  if (ownerPeriod === 'year') {
    return commissionMonthStart >= thisYearStart && commissionMonthStart <= thisMonthStart;
  }

  return false;
};

const monthlyCommissionRecordsForOwnerPeriod = (data.monthlyWakalaCommissions || [])
  .filter(commissionMonthMatchesOwnerPeriod);

const totalMobileWakalaCommission = monthlyCommissionRecordsForOwnerPeriod.reduce(
  (sum, record) => sum + Number(record.mobileTotal || 0),
  0
);

const totalBankWakalaCommission = monthlyCommissionRecordsForOwnerPeriod.reduce(
  (sum, record) => sum + Number(record.bankTotal || 0),
  0
);

const totalWakalaCommission = totalMobileWakalaCommission + totalBankWakalaCommission;

const totalBusinessProfit = totalProfit + totalGasProfit + totalWakalaCommission;
  const latestPerShop = data.shops.map((shop) => getLatestEntryForShop(data.mobileMoneyEntries, shop.id)).filter(Boolean);
  const totalMobileCapital = latestPerShop.reduce((a, entry) => a + getMobileCapital(entry), 0);
  const totalBankCapital = latestPerShop.reduce((a, entry) => a + getBankCapital(entry), 0);

  const ownerPeriodLabel = {
    today: t(language, 'Today', 'Leo'),
    yesterday: t(language, 'Yesterday', 'Jana'),
    week: t(language, 'This week to date', 'Wiki hii hadi leo'),
    lastweek: t(language, 'Last week', 'Wiki iliyopita'),
    month: t(language, 'This month to date', 'Mwezi huu hadi leo'),
    lastmonth: t(language, 'Last month', 'Mwezi uliopita'),
    '3months': t(language, 'Last 3 months', 'Miezi 3 iliyopita'),
    '6months': t(language, 'Last 6 months', 'Miezi 6 iliyopita'),
    year: t(language, 'This year', 'Mwaka huu'),
  }[ownerPeriod] || t(language, 'Selected period', 'Kipindi ulichochagua');

 return (
  <AppShell>
    <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(236,72,153,0.18),rgba(99,102,241,0.18),rgba(59,130,246,0.18))] p-4 shadow-xl">
      <div className="rounded-[28px] border border-white/40 bg-white/55 p-4 backdrop-blur-md">
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
  <option value="week">{t(language, 'This week to date', 'Wiki hii hadi leo')}</option>
  <option value="lastweek">{t(language, 'Last week', 'Wiki iliyopita')}</option>
  <option value="month">{t(language, 'This month to date', 'Mwezi huu hadi leo')}</option>
  <option value="lastmonth">{t(language, 'Last month', 'Mwezi uliopita')}</option>
  <option value="3months">{t(language, 'Last 3 months', 'Miezi 3 iliyopita')}</option>
  <option value="6months">{t(language, 'Last 6 months', 'Miezi 6 iliyopita')}</option>
  <option value="year">{t(language, 'This year', 'Mwaka huu')}</option>
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

      {ownerSalesLoading ? (
        <div className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          {t(language, 'Loading older owner sales from Supabase...', 'Inapakia mauzo ya zamani ya mmiliki kutoka Supabase...')}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
  <StatCard
    title={`${t(language, 'Total Sales', 'Jumla ya Mauzo')} ${ownerPeriodLabel}`}
    value={`TZS ${currency(totalSales)}`}
    icon={ShoppingCart}
    color="from-fuchsia-500 to-purple-600"
  />

  <StatCard
    title={`${t(language, 'Total Expenses', 'Jumla ya Matumizi')} ${ownerPeriodLabel}`}
    value={`TZS ${currency(totalExpenses)}`}
    icon={AlertTriangle}
    color="from-orange-400 to-pink-500"
  />

  <StatCard
    title={`${t(language, 'Profit', 'Faida ya')} ${ownerPeriodLabel}`}
    value={`TZS ${currency(totalProfit)}`}
    icon={Wallet}
    color="from-violet-500 to-indigo-700"
  />

  <StatCard
    title={t(language, 'Current Mobile Money Capital', 'Mtaji wa Sasa wa Simu')}
    value={`TZS ${currency(totalMobileCapital)}`}
    subtitle={t(language, 'Based on latest entry per shop', 'Kutokana na rekodi ya mwisho ya kila duka')}
    icon={HandCoins}
    color="from-blue-500 to-cyan-600"
  />

  <StatCard
    title={t(language, 'Current Bank Capital', 'Mtaji wa Sasa wa Benki')}
    value={`TZS ${currency(totalBankCapital)}`}
    subtitle={t(language, 'Based on latest entry per shop', 'Kutokana na rekodi ya mwisho ya kila duka')}
    icon={Building2}
    color="from-indigo-500 to-blue-700"
  />
</div>
<Card className="mt-6 border-white/40 bg-white/70 shadow-lg backdrop-blur-md">
  <CardHeader>
    <CardTitle>{t(language, 'Business Profit Breakdown', 'Muhtasari wa Faida za Biashara')}</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6 text-sm">
      <div className="rounded-2xl bg-gradient-to-r from-fuchsia-500/15 to-purple-600/15 p-3 font-medium">
        {t(language, 'Retail Profit after Expenses', 'Faida ya Duka baada ya Matumizi')}: TZS {currency(totalProfit)}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-orange-400/15 to-pink-500/15 p-3 font-medium">
        {t(language, 'Gas Profit', 'Faida ya Gesi')}: TZS {currency(totalGasProfit)}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-cyan-500/15 to-sky-600/15 p-3 font-medium">
        {t(language, 'Mobile Money Commission', 'Kamisheni za Simu')}: TZS {currency(totalMobileWakalaCommission)}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-blue-500/15 to-indigo-600/15 p-3 font-medium">
        {t(language, 'Bank Commission', 'Kamisheni za Benki')}: TZS {currency(totalBankWakalaCommission)}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-600/15 p-3 font-medium">
        {t(language, 'Total Wakala Commission', 'Jumla ya Kamisheni ya Wakala')}: TZS {currency(totalWakalaCommission)}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-700/20 p-3 font-semibold">
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

          const shopRetailProfit = filterByPreset(
            data.sales.filter((s) => String(s.shop_id) === String(shop.id)),
            ownerPeriod,
            todayISO()
          ).reduce((sum, sale) => {
            return sum + (sale.items || []).reduce((itemSum, item) => {
              const qty = Number(item.quantity || 0);
              const sellPrice = Number(item.sellPrice ?? item.price ?? 0);
              const buyPrice = Number(item.buyPrice ?? 0);
              return itemSum + qty * (sellPrice - buyPrice);
            }, 0);
          }, 0);

          const shopProfit = shopRetailProfit - shopExpenses;

          const shopCommissionRecords = (data.monthlyWakalaCommissions || []).filter(
            (record) =>
              String(record.shop_id || '') === String(shop.id) &&
              commissionMonthMatchesOwnerPeriod(record)
          );

          const shopMobileWakalaCommission = shopCommissionRecords.reduce(
            (sum, record) => sum + Number(record.mobileTotal || 0),
            0
          );

          const shopBankWakalaCommission = shopCommissionRecords.reduce(
            (sum, record) => sum + Number(record.bankTotal || 0),
            0
          );

          const shopWakalaCommission = shopMobileWakalaCommission + shopBankWakalaCommission;

          const latest = getLatestEntryForShop(data.mobileMoneyEntries, shop.id);
          const mobileCapital = latest ? getMobileCapital(latest) : 0;
          const bankCapital = latest ? getBankCapital(latest) : 0;

          return (
  <div
    key={shop.id}
    className="rounded-3xl bg-gradient-to-br from-white/70 via-fuchsia-50/80 to-indigo-100/80 p-[1px] shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="rounded-3xl border border-white/40 bg-white/65 p-0 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-slate-900">{shop.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          {t(language, 'Sales', 'Mauzo')}: TZS {currency(shopSales)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          {t(language, 'Expenses', 'Matumizi')}: TZS {currency(shopExpenses)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 font-medium shadow-sm">
          {t(language, 'Profit', 'Faida')}: TZS {currency(shopProfit)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          {t(language, 'Mobile Money Commission', 'Kamisheni za Simu')}: TZS {currency(shopMobileWakalaCommission)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          {t(language, 'Bank Commission', 'Kamisheni za Benki')}: TZS {currency(shopBankWakalaCommission)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 font-medium shadow-sm">
          {t(language, 'Total Wakala Commission', 'Jumla ya Kamisheni ya Wakala')}: TZS {currency(shopWakalaCommission)}
        </div>

        <div className="rounded-2xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-800 shadow-sm">
          {t(language, 'Total Shop Profit including Wakala', 'Jumla ya Faida ya Duka pamoja na Wakala')}: TZS {currency(shopProfit + shopWakalaCommission)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          {t(language, 'Mobile Money Capital', 'Mtaji wa Simu')}: TZS {currency(mobileCapital)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
          {t(language, 'Bank Capital', 'Mtaji wa Benki')}: TZS {currency(bankCapital)}
        </div>

        <Button
          type="button"
          className="mt-2 w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:to-fuchsia-700"
          onClick={() => openShop(shop.id)}
        >
          {t(language, 'Open Shop', 'Fungua Duka')}
        </Button>
      </CardContent>
    </div>
  </div>
);
        })}
      </div>
      </div>
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
  const recurringExpenseDefaults = RECURRING_EXPENSES_BY_SHOP[shop.id] || [];
  const recurringAutoSaveRef = useRef('');
  const [expenseRows, setExpenseRows] = useState([{ ...emptyExpenseRow }]);

const isRecurringExpenseSavedForDate = (item, idx, dateValue) => {
  return (data.expenses || []).some(
    (expense) =>
      String(expense.shop_id || expense.shopId || '') === String(shop.id) &&
      String(expense.date || '') === String(dateValue) &&
      (
        String(expense.id || '') === `recurring-${shop.id}-${dateValue}-${idx}` ||
        String(expense.id || '') === `recurring-${shop.id}-${idx}` ||
        (
          String(expense.title || expense.description || '').trim().toLowerCase() ===
            String(item.title || '').trim().toLowerCase() &&
          String(expense.category || '').trim().toLowerCase() ===
            String(item.category || '').trim().toLowerCase()
        )
      )
  );
};

const autoSaveRecurringExpensesForToday = async () => {
  const today = todayISO();
  const autoSaveKey = `${shop.id}-${today}`;

  if (recurringAutoSaveRef.current === autoSaveKey) return;
  recurringAutoSaveRef.current = autoSaveKey;

  const rowsToAutoSave = recurringExpenseDefaults
    .map((item, idx) => ({
      id: `recurring-${shop.id}-${today}-${idx}`,
      shop_id: shop.id,
      title: item.title,
      description: item.title,
      amount: Number(item.amount || 0),
      category: item.category || 'Recurring',
      date: today,
      notes: item.notes || 'Auto-saved fixed daily expense',
      created_at: new Date().toISOString(),
      autoRecurring: true,
      auto_recurring: true,
      recurring_key: `recurring-${shop.id}-${today}-${idx}`,
      sync_source: 'auto_recurring',
    }))
    .filter((item, idx) => Number(item.amount || 0) > 0 && !isRecurringExpenseSavedForDate(item, idx, today));

  if (!rowsToAutoSave.length) {
    setExpenseRows([{ ...emptyExpenseRow }]);
    return;
  }

  const cleanExpenseRows = rowsToAutoSave.map((expense) => ({
    id: expense.id,
    shop_id: expense.shop_id,
    title: expense.title || expense.description || '',
    description: expense.description || expense.title || '',
    amount: Number(expense.amount || 0),
    category: expense.category || 'Recurring',
    date: expense.date || today,
    notes: expense.notes || 'Auto-saved fixed daily expense',
    created_at: expense.created_at || new Date().toISOString(),
    auto_recurring: true,
    recurring_key: expense.recurring_key || expense.id,
    sync_source: 'auto_recurring',
  }));

  if (navigator.onLine) {
    const { error: autoExpenseError } = await supabase
      .from('expenses')
      .upsert(cleanExpenseRows, { onConflict: 'id' });

    if (autoExpenseError) {
      console.error('Auto recurring expenses direct Supabase save failed:', autoExpenseError);

      rowsToAutoSave.forEach((expense) => {
        addToSyncQueue('expense_created', expense);
      });
    }
  } else {
    rowsToAutoSave.forEach((expense) => {
      addToSyncQueue('expense_created', expense);
    });
  }

  const nextExpenses = [...(data.expenses || []), ...rowsToAutoSave];

  await saveData({
    ...data,
    expenses: nextExpenses,
  });

  setExpenseRows([{ ...emptyExpenseRow }]);

  if (navigator.onLine) {
    processSyncQueue().catch((syncError) => {
      console.error('Auto recurring expenses sync error:', syncError);
    });
  }
};

useEffect(() => {
  autoSaveRecurringExpensesForToday();
}, [shop.id]);
  const [creditRows, setCreditRows] = useState([{ ...emptyCreditRow }]);
  const [changeRows, setChangeRows] = useState([{ ...emptyChangeRow }]);
  const [reportPreset, setReportPreset] = useState('today');
const [reportDate, setReportDate] = useState(todayISO());
const [reportStartDate, setReportStartDate] = useState(todayISO());
const [reportEndDate, setReportEndDate] = useState(todayISO());
const [reportType, setReportType] = useState('stockValue');
const [reportSalesSource, setReportSalesSource] = useState([]);
const [reportSalesLoading, setReportSalesLoading] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [saleError, setSaleError] = useState('');
const [saleSaving, setSaleSaving] = useState(false);
const saleLock = useRef(false);
  const [creditReduceMap, setCreditReduceMap] = useState({});
  const [changeReduceMap, setChangeReduceMap] = useState({});
const [gasForm, setGasForm] = useState({
  ...emptyGasForm,
  gasType: 'Taifa Gas',
  cylinderSize: 'Small Cylinder',
  smallGasBuyPrice: '',
  smallGasSellPrice: '',
  bigGasBuyPrice: '',
  bigGasSellPrice: '',
});

const [gasSalesRows, setGasSalesRows] = useState([
  {
    ...emptyGasSaleRow,
    id: `gas-sale-${Date.now()}`,
    gasType: 'Taifa Gas',
    smallGasBuyPrice: '20500',
    smallGasSellPrice: '25000',
    bigGasBuyPrice: '49000',
    bigGasSellPrice: '55000',
  },
]);
const [showGasStatus, setShowGasStatus] = useState(false);
const [showGasSales, setShowGasSales] = useState(false);
const [showGasPrices, setShowGasPrices] = useState(false);

const saveGas = async (formOverride = null, options = {}) => {
  const sourceGasForm = formOverride || gasForm;
  const selectedDate = sourceGasForm.date || todayISO();

  const existingTodayGasEntry = (data.gasEntries || []).find(
    (entry) =>
      String(entry.shop_id) === String(shop.id) &&
      String(entry.date) === String(selectedDate)
  );

  const targetExistingEntry = sourceGasForm.id
    ? (data.gasEntries || []).find((entry) => String(entry.id) === String(sourceGasForm.id))
    : existingTodayGasEntry;

  const formForSave = {
    ...sourceGasForm,
    id: sourceGasForm.id || targetExistingEntry?.id || '',
    date: selectedDate,
  };

  const record = {
    ...buildGasRecord(formForSave),
    shop_id: shop.id,
  };

  const nextGasEntries = [...(data.gasEntries || [])];
  const existingIndex = nextGasEntries.findIndex((x) => String(x.id) === String(record.id));

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
    return false;
  }

  if (options.keepGasForm) {
    setGasForm({
      ...formForSave,
      id: record.id,
    });
    return true;
  }

  setGasForm({
    ...emptyGasForm,
    date: todayISO(),
    gasType: 'Taifa Gas',
    cylinderSize: 'Small Cylinder',
    smallGasBuyPrice: String(GAS_PRICE_BOOK['Taifa Gas'].smallBuy),
    smallGasSellPrice: String(GAS_PRICE_BOOK['Taifa Gas'].smallSell),
    bigGasBuyPrice: String(GAS_PRICE_BOOK['Taifa Gas'].bigBuy),
    bigGasSellPrice: String(GAS_PRICE_BOOK['Taifa Gas'].bigSell),
  });

  return true;
};
const editGas = (entry) => {
  console.log('EDIT CLICKED', entry);

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

  // 👇 ADD THIS (very important for visibility)
  setShowGasStatus(true);
  setShowGasSales(true);
  setShowGasPrices(true);
};
const deleteGas = async (id) => {
  const nextGasEntries = (data.gasEntries || []).filter((entry) => entry.id !== id);

  saveData({
    ...data,
    gasEntries: nextGasEntries,
  });

     const { error } = await supabase
    .from('gasEntries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Gas delete error:', error);
    alert(`Gas delete failed: ${error.message}`);
  }
};

const isSmallCylinder = gasForm.cylinderSize === 'Small Cylinder';
const isBigCylinder = gasForm.cylinderSize === 'Big Cylinder';
const addGasSalesRow = () => {
  setGasSalesRows((prev) => [
    ...prev,
   {
  ...emptyGasSaleRow,
  id: `gas-sale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  gasType: 'Taifa Gas',
  smallGasBuyPrice: '20500',
  smallGasSellPrice: '25000',
  bigGasBuyPrice: '49000',
  bigGasSellPrice: '55000',
},
  ]);
};

const updateGasSalesRow = (rowId, field, value) => {
  setGasSalesRows((prev) =>
    prev.map((row) => {
      if (row.id !== rowId) return row;

      if (field === 'gasType') {
        if (value === 'Oryx Gas') {
  return {
    ...row,
    gasType: value,
    smallGasBuyPrice: '24500',
    smallGasSellPrice: '27000',
    bigGasBuyPrice: '56000',
    bigGasSellPrice: '60000',
  };
}

if (value === 'Taifa Gas' || value === 'Mihan / Taifa Gas') {
  return {
    ...row,
    gasType: value,
    smallGasBuyPrice: '20500',
    smallGasSellPrice: '25000',
    bigGasBuyPrice: '49000',
    bigGasSellPrice: '55000',
  };
}

if (value === 'O Gas') {
  return {
    ...row,
    gasType: value,
    smallGasBuyPrice: '21000',
    smallGasSellPrice: '25000',
    bigGasBuyPrice: '49000',
    bigGasSellPrice: '55000',
  };
}
      }

      return {
        ...row,
        [field]: value,
      };
    })
  );
};

const removeGasSalesRow = (rowId) => {
  setGasSalesRows((prev) =>
    prev.length === 1 ? prev : prev.filter((row) => row.id !== rowId)
  );
};

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

const getPreviousMonthValue = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const [monthlyCommissionForm, setMonthlyCommissionForm] = useState({
  id: '',
  commissionMonth: getPreviousMonthValue(),
  mobileCommissions: MOBILE_PROVIDERS.map((provider) => ({
    provider,
    amount: '',
    receivedDate: todayISO(),
    notReceived: false,
    note: '',
  })),
  bankCommissions: BANKS.map((bankName) => ({
    bankName,
    amount: '',
    receivedDate: todayISO(),
    notReceived: false,
    note: '',
  })),
  notes: '',
});

    const products = data.products
    .filter((p) => String(p?.shop_id || '') === String(shop.id))
    .map(normalizeProduct)
    .filter((p) => p.id && String(p.name || '').trim());

const sales = data.sales.filter(
  (s) => String(s.shop_id) === String(shop.id)
);

const confirmedSales = sales.filter((s) => s.confirmed !== false);

console.log('SHOP SALES SNAPSHOT', {
  shopId: shop.id,
  totalSalesRowsInData: Array.isArray(data.sales) ? data.sales.length : 0,
  shopSalesRows: Array.isArray(sales) ? sales.length : 0,
  latestFiveShopSales: Array.isArray(sales) ? sales.slice(-5) : [],
});

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
const isOwnerUser = String(data.currentUser?.role || '') === 'owner';
const isEditingMobileMoney = Boolean(mobileMoneyForm.id);
const shouldShowMobileMoneyWarning = !isOwnerUser && todayMobileMoneyEntries.length > 0;
const shouldDisableMobileMoneySave = !isOwnerUser && todayMobileMoneyEntries.length > 0 && !isEditingMobileMoney;

const gasEntries = (data.gasEntries || []).filter(
  (g) => String(g.shop_id) === String(shop.id)
);

const todayGasEntries = gasEntries.filter((g) => g.date === todayISO());

const reportDateValue =
  reportPreset === 'date'
    ? { start: reportStartDate, end: reportEndDate }
    : reportDate;

const shouldLoadOldSalesFromSupabase =
  reportType === 'salesReport' &&
  (
    reportPreset === 'lastweek' ||
    reportPreset === 'lastmonth' ||
    reportPreset === '3months' ||
    reportPreset === '6months' ||
    reportPreset === 'year' ||
    (reportPreset === 'date' && reportStartDate < daysAgoISO(30))
  );

useEffect(() => {
  if (!shouldLoadOldSalesFromSupabase) {
    setReportSalesSource([]);
    setReportSalesLoading(false);
    return;
  }

  const loadOldSalesForReport = async () => {
    try {
      setReportSalesLoading(true);

      let startDate = daysAgoISO(30);
      let endDate = todayISO();

      const now = startOfDay(new Date());

      const getStartOfWeekForReport = (date) => {
        const d = startOfDay(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        return addDays(d, diff);
      };

      const startOfThisWeek = getStartOfWeekForReport(now);
      const startOfLastWeek = addDays(startOfThisWeek, -7);
      const endOfLastWeek = addDays(startOfThisWeek, -1);

      const startOfThisMonthForReport = startOfMonth(now);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = addDays(startOfThisMonthForReport, -1);

      if (reportPreset === 'lastweek') {
        startDate = todayISO(startOfLastWeek);
        endDate = todayISO(endOfLastWeek);
      } else if (reportPreset === 'lastmonth') {
        startDate = todayISO(startOfLastMonth);
        endDate = todayISO(endOfLastMonth);
      } else if (reportPreset === '3months') {
        startDate = daysAgoISO(89);
      } else if (reportPreset === '6months') {
        startDate = daysAgoISO(179);
      } else if (reportPreset === 'year') {
        startDate = daysAgoISO(364);
      } else if (reportPreset === 'date') {
        startDate = reportStartDate;
        endDate = reportEndDate;
      }

      const { data: oldSales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('shop_id', shop.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReportSalesSource(oldSales || []);
    } catch (error) {
      console.error('Failed to load old sales for sales report:', error);
      setReportSalesSource([]);
    } finally {
      setReportSalesLoading(false);
    }
  };

  loadOldSalesForReport();
}, [shop.id, reportPreset, reportStartDate, reportEndDate, shouldLoadOldSalesFromSupabase]);

const salesSourceForFiltering = shouldLoadOldSalesFromSupabase ? reportSalesSource : confirmedSales;

const filteredSales = filterByPreset(
  salesSourceForFiltering.map((s) => ({
    ...s,
    date: s.created_at ? todayISO(new Date(s.created_at)) : s.date,
  })),
  reportPreset,
  reportDateValue
);
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
const dashboardDateValue =
  reportPreset === 'date'
    ? { start: reportStartDate, end: reportEndDate }
    : reportDate;

const dashboardSales = confirmedSales.map((s) => {
  const computedDate = s.created_at ? todayISO(new Date(s.created_at)) : s.date;

  return {
    ...s,
    date: computedDate,
  };
});

const dashboardFilteredSales = filterByPreset(dashboardSales, reportPreset, dashboardDateValue);

if (String(shop.id) === 'shop-2' && reportPreset === 'today') {
  console.log('LIVE SHOP2 TODAY CHECK', {
    shopId: shop.id,
    reportPreset,
    reportDateValue: dashboardDateValue,
    dashboardSalesCount: dashboardSales.length,
    filteredSalesCount: dashboardFilteredSales.length,
    filteredSalesTotal: dashboardFilteredSales.reduce(
      (a, s) => a + Number(s.total || 0),
      0
    ),
    filteredSalesRows: dashboardFilteredSales.map((s) => ({
      id: s.id,
      total: Number(s.total || 0),
      saved_date: s.date,
      created_at: s.created_at,
      items_count: Array.isArray(s.items) ? s.items.length : 0,
    })),
  });
}

const todaySales = dashboardFilteredSales.reduce(
  (a, s) => a + Number(s.total || 0),
  0
);
const todayExpenses = filterByPreset(expenses, reportPreset, dashboardDateValue).reduce((a, e) => a + Number(e.amount || 0), 0);

const todayGasProfit = (data.gasEntries || [])
  .filter((x) => String(x.shop_id || '') === String(shop.id))
  .filter((x) => filterByPreset([x], reportPreset, dashboardDateValue).length > 0)
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

const shopCommissionMonthMatchesReportPreset = (record) => {
  if (!record?.commissionMonth) return false;

  const [year, month] = String(record.commissionMonth).split('-').map(Number);
  if (!year || !month) return false;

  const baseDate = startOfDay(dashboardDateValue || new Date());
  const commissionMonthStart = new Date(year, month - 1, 1);

  const thisMonthStart = startOfMonth(baseDate);
  const lastMonthStart = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
  const thisYearStart = new Date(baseDate.getFullYear(), 0, 1);

  if (reportPreset === 'month') {
    return (
      commissionMonthStart.getFullYear() === thisMonthStart.getFullYear() &&
      commissionMonthStart.getMonth() === thisMonthStart.getMonth()
    );
  }

  if (reportPreset === 'lastmonth') {
    return (
      commissionMonthStart.getFullYear() === lastMonthStart.getFullYear() &&
      commissionMonthStart.getMonth() === lastMonthStart.getMonth()
    );
  }

  if (reportPreset === '3months') {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 2, 1);
    return commissionMonthStart >= start && commissionMonthStart <= thisMonthStart;
  }

  if (reportPreset === '6months') {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 5, 1);
    return commissionMonthStart >= start && commissionMonthStart <= thisMonthStart;
  }

  if (reportPreset === 'year') {
    return commissionMonthStart >= thisYearStart && commissionMonthStart <= thisMonthStart;
  }

  return false;
};

const todayWakalaCommission = (data.monthlyWakalaCommissions || [])
  .filter((record) => String(record.shop_id || '') === String(shop.id))
  .filter(shopCommissionMonthMatchesReportPreset)
  .reduce((sum, record) => sum + Number(record.grandTotal || 0), 0);

  const latestMobileEntry = getLatestEntryForShop(data.mobileMoneyEntries, shop.id);

const mobileCapital = latestMobileEntry ? Number(latestMobileEntry.mobileCapital || 0) : 0;
const bankCapital = latestMobileEntry ? Number(latestMobileEntry.bankCapital || 0) : 0;

useEffect(() => {
  if (!shop?.id) return;

  setMobileMoneyForm((prev) => {
    // Do not disturb an existing record being edited
    if (prev.id) return prev;

    const currentMobileCapital = String(prev.mobileCapital || '').trim();
    const currentBankCapital = String(prev.bankCapital || '').trim();

    return {
      ...prev,
      mobileCapital:
        currentMobileCapital !== ''
          ? prev.mobileCapital
          : mobileCapital
            ? String(mobileCapital)
            : '',
      bankCapital:
        currentBankCapital !== ''
          ? prev.bankCapital
          : bankCapital
            ? String(bankCapital)
            : '',
    };
  });
}, [shop?.id, mobileCapital, bankCapital]);

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
const expiryStockValueRows = useMemo(
  () =>
    products
      .filter((p) => !p.archived)
      .filter((p) => String(p.expiryDate || '').trim())
      .filter((p) =>
        String(p.name || '').toLowerCase().includes(stockSearch.toLowerCase())
      )
      .map((p) => ({
        ...p,
        stockValue: Number(p.stockBaseQty || 0) * Number(p.buyPrice || 0),
        totalProfitIfSold:
          Number(p.stockBaseQty || 0) *
          (Number(p.sellPrice || 0) - Number(p.buyPrice || 0)),
        expiryDate: p.expiryDate || '',
      }))
      .sort((a, b) => {
        const dateA = new Date(a.expiryDate || '9999-12-31').getTime();
        const dateB = new Date(b.expiryDate || '9999-12-31').getTime();
        return dateA - dateB;
      }),
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
  created_at: sale.created_at || '',
};
      }

      map[item.productId].soldQty += Number(item.quantity || 0);
      map[item.productId].profit +=
        Number(item.quantity || 0) *
        (map[item.productId].sellPrice - map[item.productId].buyPrice);
    });
  });

  const allRows = Object.values(map);

  const rows = allRows
    .filter((row) =>
      String(row.name || '').toLowerCase().includes(stockSearch.toLowerCase())
    )
    .sort((a, b) => b.soldQty - a.soldQty);

  const totalSold = rows.reduce((a, r) => a + Number(r.soldQty || 0), 0);
  const totalProfit = rows.reduce((a, r) => a + Number(r.profit || 0), 0);
  const totalSalesAmount = filteredSales.reduce(
  (a, s) => a + Number(s.total || 0),
  0
);

return {
  rows,
  totalSold,
  totalProfit,
  totalSalesAmount,
};
}, [filteredSales, products, stockSearch]);
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
const expiringSoonCount = expiringProducts.filter((p) => p.daysLeft >= 0 && p.daysLeft <= 30).length;
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
const expensesReportRows = useMemo(() => {
  return filteredExpenses
    .slice()
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .map((expense, index) => ({
      sn: index + 1,
      date: expense.date || '',
      title: expense.title || expense.description || '',
      amount: Number(expense.amount || 0),
    }));
}, [filteredExpenses]);

const changeLedgerReportRows = useMemo(() => {
  return changeLedger
    .slice()
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .map((entry, index) => ({
      sn: index + 1,
      date: entry.date || '',
      customerName: entry.customerName || '',
      amountOwed: Number(entry.amountOwed || 0),
      status: Number(entry.amountOwed || 0) > 0 ? 'Outstanding' : 'Cleared',
      notes: entry.notes || '',
    }));
}, [changeLedger]);

const creditSalesReportRows = useMemo(() => {
  return creditSales
    .slice()
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .map((entry, index) => ({
      sn: index + 1,
      date: entry.date || '',
      customerName: entry.customerName || '',
      phone: entry.phone || '',
      amount: Number(entry.amount || 0),
      balance: Number(entry.balance || 0),
      status: Number(entry.balance || 0) > 0 ? 'Outstanding' : 'Cleared',
      notes: entry.notes || '',
    }));
}, [creditSales]);
const mostProfitableProductsRows = useMemo(() => {
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const itemMap = {};

  filteredSales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const productId = item.productId || '';
      const fallbackProduct = productMap[productId] || {};

      const qty = Number(item.quantity || 0);
      const sellPrice = Number(item.sellPrice ?? item.price ?? fallbackProduct.sellPrice ?? 0);
      const buyPrice = Number(item.buyPrice ?? fallbackProduct.buyPrice ?? 0);

      const salesAmount = qty * sellPrice;
      const profitAmount = qty * (sellPrice - buyPrice);
      const marginPercent = salesAmount > 0 ? (profitAmount / salesAmount) * 100 : 0;

      if (!itemMap[productId]) {
        itemMap[productId] = {
          productId,
          name: item.name || fallbackProduct.name || 'Unknown Product',
          soldQty: 0,
          totalSales: 0,
          totalProfit: 0,
          marginPercent: 0,
          currentStock: Number(fallbackProduct.stockBaseQty || 0),
        };
      }

      itemMap[productId].soldQty += qty;
      itemMap[productId].totalSales += salesAmount;
      itemMap[productId].totalProfit += profitAmount;
    });
  });

  return Object.values(itemMap)
    .map((row) => ({
      ...row,
      marginPercent:
        row.totalSales > 0 ? (row.totalProfit / row.totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);
}, [filteredSales, products]);
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
  date: (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })(),
  created_at: new Date().toISOString(),
  confirmed: false,
};

console.log('SALE DATE TEST', {
  date: saleRecord.date,
  created_at: saleRecord.created_at,
  isoDateFromCreatedAt: String(saleRecord.created_at).slice(0, 10),
  localReadable: new Date(saleRecord.created_at).toLocaleString(),
  localDateFromCreatedAt: todayISO(new Date(saleRecord.created_at)),
});

  saveData({
    ...data,
    products: nextProducts,
    sales: [...data.sales, saleRecord],
  });

  const salePayload = {
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
  };

  addToSyncQueue('sale_created', salePayload);

  if (navigator.onLine) {
  supabase
    .from('sales')
    .upsert(
      [
        {
          id: saleRecord.id,
          shop_id: saleRecord.shop_id,
          items: saleRecord.items,
          total: saleRecord.total,
          type: saleRecord.type,
          date: saleRecord.date,
          created_at: saleRecord.created_at,
        },
      ],
      { onConflict: 'id' }
    )
    .then(async ({ error: saleSyncError }) => {
      if (saleSyncError) {
        console.error('Immediate sale sync error:', saleSyncError);
        return;
      }

      try {
        await processSyncQueue();

        const stillHasPendingSync = readSyncQueue().some((item) => item?.synced === false);

        if (stillHasPendingSync) {
          setSyncMessage('Sync pending - dashboard not refreshed yet');
          return;
        }

        const { data: confirmedShopSales, error: confirmedSalesError } = await supabase
          .from('sales')
          .select('*')
          .eq('shop_id', shop.id)
          .gte('date', daysAgoISO(30))
          .order('created_at', { ascending: false });

        if (confirmedSalesError) throw confirmedSalesError;

        if (!Array.isArray(confirmedShopSales)) {
          throw new Error('Supabase confirmed sales response was not a valid list.');
        }

        const previousSales = Array.isArray(data.sales) ? data.sales : [];

        const nextData = {
          ...data,
          products: nextProducts,
          sales: [
            ...previousSales.filter(
              (sale) =>
                String(sale.shop_id || sale.shopId || sale.shopid || '') !== String(shop.id)
            ),
            ...confirmedShopSales.map((sale) => ({
              ...sale,
              shop_id: String(sale.shop_id || sale.shopId || sale.shopid || shop.id).trim(),
              date: sale.date || (sale.created_at ? String(sale.created_at).slice(0, 10) : todayISO()),
              confirmed: true,
            })),
          ],
        };

        await saveData(nextData);

        writeStorage(STORAGE_LAST_SYNC_KEY, Date.now());
        setSyncMessage('Sync complete');
      } catch (syncError) {
        console.error('Queued sales sync error:', syncError);
      }
    })
    .catch((syncError) => {
      console.error('Immediate sale sync exception:', syncError);
    });
}

  console.log('Sending sale to Supabase:', saleRecord);

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

    const standardProductCode =
  String(normalizedRow['standard product code'] || normalizedRow['product code'] || '').trim() ||
  buildStandardProductCode(productName, unit);

return normalizeProduct({
  id: `import-${Date.now()}-${index}`,
  shop_id: shop.id,
  name: productName,
  standardProductCode,
  standard_product_code: standardProductCode,
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
  standard_product_code:
    String(p.standard_product_code || p.standardProductCode || '').trim() ||
    buildStandardProductCode(p.name, p.baseUnit || 'pc'),
  buyingprice: Number(p.buyPrice || 0),
  sellingprice: Number(p.sellPrice || 0),
  stock: Number(p.stockBaseQty || 0),
  shop_id: p.shop_id,
  baseunit: p.baseUnit || 'pc',
  created_at: p.created_at || new Date().toISOString(),
}));

const { data: authCheck, error: authCheckError } = await supabase.auth.getUser();

console.log('PRODUCT SAVE DEBUG', {
  authUserId: authCheck?.user?.id || null,
  authEmail: authCheck?.user?.email || null,
  authError: authCheckError?.message || null,
  localUser: data.currentUser,
  shopIdFromScreen: shop.id,
  rowsToSync,
});

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
standardProductCode: product.standardProductCode || product.standard_product_code || '',
standard_product_code: product.standard_product_code || product.standardProductCode || '',
    },
  ]);
};

const deleteProduct = async (productId) => {
  const usedInSales = data.sales.some((sale) =>
    (sale.items || []).some((item) => item.productId === productId)
  );

  const usedInPurchases = data.purchases.some(
    (purchase) => purchase.productId === productId
  );

  if (usedInSales || usedInPurchases) {
    alert(
      t(
        language,
        'This product is already used in sales or purchases, so it cannot be deleted. Please archive it instead.',
        'Bidhaa hii tayari imetumika kwenye mauzo au manunuzi, hivyo haiwezi kufutwa. Tafadhali ihifadhi kwenye archive badala yake.'
      )
    );
    return;
  }

  const nextProducts = data.products.filter((x) => x.id !== productId);

  await saveData({ ...data, products: nextProducts });

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('shop_id', shop.id);

  if (error) {
    alert(`Product delete failed: ${error.message}`);
    return;
  }

  if (newProductRows.some((row) => row.id === productId)) {
    resetProductForm();
  }
};

const archiveProduct = async (productId) => {
  const product = data.products.find((p) => String(p.id) === String(productId));

  if (!product) {
    alert(t(language, 'Product not found.', 'Bidhaa haijapatikana.'));
    return;
  }

  const confirmed = window.confirm(
    t(
      language,
      'Archive this product? It will be hidden from active products but kept in records.',
      'Unataka ku-archive bidhaa hii? Haitaonekana kwenye bidhaa hai lakini itabaki kwenye kumbukumbu.'
    )
  );

  if (!confirmed) return;

  const updatedProduct = normalizeProduct({
    ...product,
    archived: true,
  });

  const nextProducts = data.products.map((p) =>
    String(p.id) === String(productId) ? updatedProduct : p
  );

  await saveData({ ...data, products: nextProducts });

  const { error } = await supabase
    .from('products')
    .update({ archived: true })
    .eq('id', productId)
    .eq('shop_id', shop.id);

  if (error) {
    alert(`Product archive failed: ${error.message}`);
    return;
  }

  if (newProductRows.some((row) => String(row.id) === String(productId))) {
    resetProductForm();
  }
};

const saveProductRows = async () => {
  const rows = newProductRows.filter(
    (r) => r.name || r.buyPrice || r.sellPrice || r.stockQty
  );

  if (!rows.length) {
    return setProductFormError(
      t(
        language,
        'Please fill at least one product row.',
        'Jaza angalau mstari mmoja wa bidhaa.'
      )
    );
  }

  const invalidRow = rows.find(
    (row) =>
      !String(row.name || '').trim() ||
      !String(row.unit || '').trim() ||
      row.buyPrice === '' ||
      row.sellPrice === '' ||
      row.stockQty === ''
  );

  if (invalidRow) {
    setProductFormError(
      t(
        language,
        'Please fill all required fields: product name, unit, buying price, selling price, and opening stock.',
        'Tafadhali jaza sehemu zote za lazima: jina la bidhaa, kipimo, bei ya kununua, bei ya kuuza, na stock ya mwanzo.'
      )
    );
    return;
  }

  const nextProducts = [...data.products];
  const rowsToQueue = [];

  for (let idx = 0; idx < rows.length; idx += 1) {
    const row = rows[idx];

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

    const existingProduct = nextProducts.find((p) => String(p.id) === String(row.id));

const productName = String(row.name || '').trim();
const productUnit = row.unit || 'pc';

const standardProductCode = String(
  row.standardProductCode ||
    row.standard_product_code ||
    existingProduct?.standardProductCode ||
    existingProduct?.standard_product_code ||
    buildStandardProductCode(productName, productUnit)
).trim();

const prepared = normalizeProduct({
  ...(existingProduct || {}),
  id: row.id || `p-${Date.now()}-${idx}`,
  shop_id: shop.id,
  name: productName,
  standardProductCode,
  standard_product_code: standardProductCode,
  buyPrice,
  sellPrice,
  stock: Number(row.stockQty || 0),
  stockBaseQty: Number(row.stockQty || 0),
  baseUnit: productUnit,
  minStockLevel: Number(row.minStockLevel || 5),
  expiryDate: row.expiryDate || '',
  qrCode: row.qrCode || '',
  subUnitsRaw: productUnit === 'pc' ? '' : row.subUnits || '',
  archived: Boolean(existingProduct?.archived),
  created_at: existingProduct?.created_at || new Date().toISOString(),
  createdAt: existingProduct?.createdAt || todayISO(),

  // Local-first meaning:
  // the product is available immediately, but Supabase sync may still be pending.
  confirmed: Boolean(existingProduct?.confirmed) && existingProduct?.syncStatus !== 'pending',
  syncStatus: 'pending',
});

    const existingIndex = nextProducts.findIndex(
      (p) => String(p.id) === String(prepared.id)
    );

    if (existingIndex >= 0) {
      nextProducts[existingIndex] = prepared;
    } else {
      nextProducts.push(prepared);
    }

    rowsToQueue.push({
  id: prepared.id,
  name: prepared.name,
  standard_product_code:
    String(prepared.standard_product_code || prepared.standardProductCode || '').trim() ||
    buildStandardProductCode(prepared.name, prepared.baseUnit || 'pc'),
  buyingprice: Number(prepared.buyPrice || 0),
  sellingprice: Number(prepared.sellPrice || 0),
  stock: Number(prepared.stockBaseQty || 0),
  shop_id: prepared.shop_id,
  baseunit: prepared.baseUnit || 'pc',
  minstocklevel: Number(prepared.minStockLevel || 5),
  expirydate: prepared.expiryDate || null,
  qrcode: prepared.qrCode || '',
  subunitsraw: prepared.subUnitsRaw || '',
  archived: Boolean(prepared.archived),
  created_at: prepared.created_at || new Date().toISOString(),
});
  }

  await saveData({ ...data, products: nextProducts });

  setNewProductRows([{ ...emptyProductRow }]);
  setProductFormError('');

  if (navigator.onLine) {
    try {
      const { error: directProductSaveError } = await supabase
        .from('products')
        .upsert(rowsToQueue, { onConflict: 'id' });

      if (directProductSaveError) {
        throw directProductSaveError;
      }

      const savedProductIds = new Set(rowsToQueue.map((row) => String(row.id || '')));

      const confirmedProducts = nextProducts.map((product) => {
        const productId = String(product.id || '');

        if (savedProductIds.has(productId)) {
          return {
            ...product,
            confirmed: true,
            syncStatus: 'confirmed',
          };
        }

        return product;
      });

      await saveData({
        ...data,
        products: confirmedProducts,
      });

      setSyncMessage('Product saved and confirmed in Supabase');
    } catch (directSaveError) {
      console.error('Direct product save failed. Product will remain queued:', directSaveError);

      rowsToQueue.forEach((productRow) => {
        addToSyncQueue('product_saved', productRow);
      });

      setSyncMessage('Product saved locally - sync pending');
    }
  } else {
    rowsToQueue.forEach((productRow) => {
      addToSyncQueue('product_saved', productRow);
    });

    setSyncMessage('Product saved locally - sync pending');
  }
};

  const addPurchaseRow = () => setPurchaseRows((prev) => [...prev, { ...emptyPurchaseRow }]);
  const updatePurchaseRow = (index, field, value) =>
    setPurchaseRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removePurchaseRow = (index) => setPurchaseRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

 const savePurchaseRows = () => {
  // VALIDATION BEFORE ANYTHING
for (const row of purchaseRows) {
  if (!row.productId) {
    alert(t(language, 'Please select a product', 'Tafadhali chagua bidhaa'));
    return;
  }

  if (!row.quantity) {
    alert(t(language, 'Please enter quantity', 'Tafadhali weka idadi'));
    return;
  }

  if (!row.unitCost) {
    alert(t(language, 'Please enter unit cost', 'Tafadhali weka bei ya kununua'));
    return;
  }
}

const rows = purchaseRows;

  const roundUpToNearest50 = (value) => Math.ceil(Number(value || 0) / 50) * 50;

  const nextPurchases = [...data.purchases];
  const nextProducts = [...data.products];
  const newlyPreparedPurchases = [];

  for (const [idx, row] of rows.entries()) {
    if (!row.productId || !row.quantity || !row.unitCost) continue;

    const quantity = Number(row.quantity || 0);
    const unitCost = Number(row.unitCost || 0);

    const preparedPurchase = {
  id: row.id || `purchase-${Date.now()}-${idx}`,
  shop_id: shop.id,
  productId: row.productId,
  quantity,
  unitCost,
  expiryDate: row.expiryDate || '',
  notes: row.notes || '',
  date: row.date || todayISO(),
  confirmed: true,
};

    newlyPreparedPurchases.push(preparedPurchase);

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
      const currentProduct = nextProducts[productIndex];
      const oldBuyPrice = Number(currentProduct.buyPrice || 0);
      const oldSellPrice = Number(currentProduct.sellPrice || 0);
      const newBuyPrice = Number(preparedPurchase.unitCost || oldBuyPrice || 0);

      let nextSellPrice = oldSellPrice;

      if (newBuyPrice !== oldBuyPrice) {
        const oldProfitAmount = oldSellPrice - oldBuyPrice;
        const suggestedBase =
          oldProfitAmount > 0 ? newBuyPrice + oldProfitAmount : newBuyPrice + 50;
        const suggestedSellPrice = roundUpToNearest50(suggestedBase);

        const enteredPrice = window.prompt(
  t(
    language,
    `Buy price changed from TZS ${oldBuyPrice} to TZS ${newBuyPrice}.
Suggested new sell price is TZS ${suggestedSellPrice}.
Enter new sell price or leave the suggested amount.`,
    `Bei ya kununua imebadilika kutoka TZS ${oldBuyPrice} hadi TZS ${newBuyPrice}.
Bei mpya ya kuuza inayopendekezwa ni TZS ${suggestedSellPrice}.
Weka bei mpya ya kuuza au acha iliyopendekezwa.`
  ),
  String(suggestedSellPrice)
);

        if (enteredPrice === null) {
          alert('Purchase save cancelled. No changes were saved.');
          return;
        }

        const parsedSellPrice = Number(enteredPrice);

        if (!Number.isFinite(parsedSellPrice) || parsedSellPrice <= newBuyPrice) {
          alert('Selling price must be greater than the new buying price.');
          return;
        }

        if (parsedSellPrice % 50 !== 0) {
          alert('Selling price must follow TZS 50 steps, for example 50, 100, 150, 200.');
          return;
        }

        nextSellPrice = parsedSellPrice;

        alert(
  t(
    language,
    `Selling price for ${currentProduct.name} has been updated from TZS ${oldSellPrice} to TZS ${nextSellPrice}.`,
    `Bei ya kuuza ya ${currentProduct.name} imebadilishwa kutoka TZS ${oldSellPrice} hadi TZS ${nextSellPrice}.`
  )
);
      }

     nextProducts[productIndex] = {
  ...nextProducts[productIndex],
  stockBaseQty:
    Number(nextProducts[productIndex].stockBaseQty || 0) +
    Number(preparedPurchase.quantity || 0),
  buyPrice: newBuyPrice,
  sellPrice: nextSellPrice,
  expiryDate: preparedPurchase.expiryDate || nextProducts[productIndex].expiryDate || '',
};
    }
  }

  saveData({ ...data, purchases: nextPurchases, products: nextProducts });

 const productRowsForSync = nextProducts
  .filter((p) => String(p.shop_id) === String(shop.id))
  .map((p) => ({
    id: p.id,
    name: p.name,
    buyingprice: Number(p.buyPrice || 0),
    sellingprice: Number(p.sellPrice || 0),
    stock: Number(p.stockBaseQty || 0),
    shop_id: p.shop_id,
    baseunit: p.baseUnit || 'pc',
    expirydate: p.expiryDate ? p.expiryDate : null,
    created_at: p.created_at || (p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()),
  }));

  newlyPreparedPurchases.forEach((purchase) =>
    addToSyncQueue('purchase_created', {
      ...purchase,
      products: productRowsForSync,
    })
  );

  setPurchaseRows([{ ...emptyPurchaseRow, productSearch: '' }]);

  if (navigator.onLine) {
    processSyncQueue().catch((syncError) => {
      console.error('Queued purchases sync error:', syncError);
    });
  }
};

const addExpenseRow = () => setExpenseRows((prev) => [...prev, { ...emptyExpenseRow }]);
const updateExpenseRow = (index, field, value) =>
  setExpenseRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
const removeExpenseRow = (index) => setExpenseRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

const saveExpenseRows = () => {
  const rows = expenseRows.filter((r) => r.title && Number(r.amount || 0) > 0);
  if (!rows.length) return;

  const fixedExpenseTitles = recurringExpenseDefaults.map((item) =>
    String(item.title || '').trim().toLowerCase()
  );

  const fixedExpenseAttempt = rows.find((row) =>
    fixedExpenseTitles.includes(String(row.title || '').trim().toLowerCase())
  );

  if (fixedExpenseAttempt) {
    alert(
      t(
        language,
        'This is a fixed daily expense and is saved automatically. Please enter only additional expenses here.',
        'Hili ni matumizi ya kudumu ya kila siku na linahifadhiwa moja kwa moja. Tafadhali ingiza matumizi ya ziada tu hapa.'
      )
    );
    setExpenseRows([{ ...emptyExpenseRow }]);
    return;
  }

  const nextExpenses = [...(data.expenses || [])];

  for (const [idx, row] of rows.entries()) {
    const preparedExpense = {
      ...row,
      id: row.id || `expense-${Date.now()}-${idx}`,
      shop_id: shop.id,
      title: row.title || '',
      description: row.title || '',
      amount: Number(row.amount || 0),
      category: row.category || 'Additional',
      date: row.date || todayISO(),
      notes: row.notes || '',
      created_at: row.created_at || new Date().toISOString(),
      autoRecurring: false,
    };

    const existingIndex = nextExpenses.findIndex((x) => String(x.id) === String(preparedExpense.id));

    if (existingIndex >= 0) {
      nextExpenses[existingIndex] = preparedExpense;
    } else {
      nextExpenses.push(preparedExpense);
    }

    addToSyncQueue('expense_created', preparedExpense);
  }

  saveData({
    ...data,
    expenses: nextExpenses,
  });

  setExpenseRows([{ ...emptyExpenseRow }]);

  if (navigator.onLine) {
    processSyncQueue().catch((syncError) => {
      console.error('Queued expenses sync error:', syncError);
    });
  }
};
    

  const addCreditRow = () => setCreditRows((prev) => [...prev, { ...emptyCreditRow }]);
  const updateCreditRow = (index, field, value) =>
    setCreditRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removeCreditRow = (index) => setCreditRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

const saveCreditRows = async () => {
for (const row of creditRows) {
  if (!row.customerName || !row.phone || !row.amount || !row.notes) {
    alert('Tafadhali jaza sehemu zote muhimu (Jina la mteja, Namba ya simu, Kiasi, Maelezo)');
    return;
  }
}

const rows = creditRows.filter(
  (r) => r.customerName && r.phone && r.amount && r.notes
);
if (!rows.length) return;
  const preparedCredits = rows
    .filter((r) => r.customerName && r.amount)
    .map((row, idx) => ({
      ...row,
      id: row.id || `credit-${Date.now()}-${idx}`,
      shop_id: shop.id,
      customerName: row.customerName || '',
      amount: Number(row.amount || 0),
      balance: Number(row.amount || 0),
      phone: row.phone || '',
      notes: row.notes || '',
      date: row.date || todayISO(),
      created_at: row.created_at || new Date().toISOString(),
    }));

  saveData({
    ...data,
    creditSales: [
      ...data.creditSales,
      ...preparedCredits,
    ],
  });

  for (const creditRecord of preparedCredits) {
    addToSyncQueue('credit_created', creditRecord);
    console.log('Sending credit to Supabase:', creditRecord);

    const { error } = await supabase
      .from('creditSales')
      .upsert([creditRecord], { onConflict: 'id' });

    if (error) {
      console.log('Credit sync error:', error);
      alert(`Credit sync failed: ${error.message}`);
    }
  }

  setCreditRows([{ ...emptyCreditRow }]);
};
   
 const reduceCredit = async (creditId) => {
  const amount = Number(creditReduceMap[creditId] || 0);
  if (amount <= 0) return;

  const target = data.creditSales.find((c) => c.id === creditId);
  if (!target) return;

  const nextBalance = Math.max(0, Number(target.balance || 0) - amount);

  saveData({
    ...data,
    creditSales: data.creditSales
      .map((c) =>
        c.id === creditId
          ? { ...c, balance: nextBalance }
          : c
      )
      .filter((c) => Number(c.balance || 0) > 0),
  });

  try {
    if (nextBalance > 0) {
      const { error } = await supabase
        .from('creditSales')
        .update({ balance: nextBalance })
        .eq('id', creditId);

      if (error) {
        alert(`Credit update failed: ${error.message}`);
      }
    } else {
      const { error } = await supabase
        .from('creditSales')
        .delete()
        .eq('id', creditId);

      if (error) {
        alert(`Credit delete failed: ${error.message}`);
      }
    }
  } catch (error) {
    alert(`Credit sync failed: ${error.message}`);
  }

  setCreditReduceMap((prev) => ({ ...prev, [creditId]: '' }));
};
  

  
  const addChangeRow = () => setChangeRows((prev) => [...prev, { ...emptyChangeRow }]);
  const updateChangeRow = (index, field, value) =>
    setChangeRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removeChangeRow = (index) => setChangeRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const saveChangeRows = async () => {
 const rows = changeRows.filter((r) => r.customerName && r.amountOwed);
if (!rows.length) return;

  const nextChangeLedger = [...data.changeLedger];

  for (const [idx, row] of rows.entries()) {
    const preparedChange = {
      ...row,
      id: row.id || `change-${Date.now()}-${idx}`,
      shop_id: shop.id,
      customerName: row.customerName || '',
      amountOwed: Number(row.amountOwed || 0),
      date: row.date || todayISO(),
      notes: row.notes || '',
      created_at: row.created_at || new Date().toISOString(),
    };

    const existingIndex = nextChangeLedger.findIndex((x) => x.id === preparedChange.id);
    if (existingIndex >= 0) {
      nextChangeLedger[existingIndex] = preparedChange;
    } else {
      nextChangeLedger.push(preparedChange);
    }

    console.log('Sending change ledger to Supabase:', preparedChange);

    const { error } = await supabase
  .from('changeLedger')
  .insert([preparedChange]);
    if (error) {
      console.log('Change ledger sync error:', error);
      alert(`Change ledger sync failed: ${error.message}`);
    }
  }

  saveData({
    ...data,
    changeLedger: nextChangeLedger,
  });

  setChangeRows([{ ...emptyChangeRow }]);
};

 const reduceChange = async (changeId) => {
  const amount = Number(changeReduceMap[changeId] || 0);
  if (amount <= 0) return;

  const target = data.changeLedger.find((c) => c.id === changeId);
  if (!target) return;

 const nextAmountOwed = Math.max(0, Number(target.amountOwed || 0) - amount);

console.log('CHANGE LEDGER REDUCE TEST - BEFORE CLOUD', {
  changeId,
  originalAmountOwed: Number(target.amountOwed || 0),
  reduceBy: amount,
  nextAmountOwed,
  target,
});

  saveData({
    ...data,
    changeLedger: data.changeLedger
      .map((c) =>
        c.id === changeId
          ? { ...c, amountOwed: nextAmountOwed }
          : c
      )
      .filter((c) => Number(c.amountOwed || 0) > 0),
  });

  try {
           if (nextAmountOwed > 0) {
  const { data: updatedRows, error } = await supabase
    .from('changeLedger')
    .update({ amountOwed: nextAmountOwed })
    .eq('id', target.id)
    .select();

  console.log('CHANGE LEDGER REDUCE TEST - AFTER UPDATE', {
    changeId,
    targetId: target.id,
    nextAmountOwed,
    updatedRows,
    updatedCount: Array.isArray(updatedRows) ? updatedRows.length : null,
    error: error ? error.message : null,
  });

  if (error) {
    alert(`Change ledger update failed: ${error.message}`);
  }
} else {
      const { data: deletedRows, error } = await supabase
  .from('changeLedger')
  .delete()
  .eq('id', target.id)
  .select();

      console.log('CHANGE LEDGER REDUCE TEST - AFTER DELETE', {
        changeId,
        deletedRows,
        deletedCount: Array.isArray(deletedRows) ? deletedRows.length : null,
        error: error ? error.message : null,
      });

      if (error) {
        alert(`Change ledger delete failed: ${error.message}`);
      }
    }
  } catch (error) {
    alert(`Change ledger sync failed: ${error.message}`);
  }

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

  const updateMonthlyMobileCommission = (index, field, value) =>
    setMonthlyCommissionForm((prev) => ({
      ...prev,
      mobileCommissions: prev.mobileCommissions.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));

        const updateMonthlyBankCommission = (index, field, value) =>
    setMonthlyCommissionForm((prev) => ({
      ...prev,
      bankCommissions: prev.bankCommissions.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));

  const monthlyMobileCommissionTotal = monthlyCommissionForm.mobileCommissions.reduce(
    (sum, row) => sum + parseMoneyInput(row.amount),
    0
  );

  const monthlyBankCommissionTotal = monthlyCommissionForm.bankCommissions.reduce(
    (sum, row) => sum + parseMoneyInput(row.amount),
    0
  );

  const monthlyCommissionGrandTotal = monthlyMobileCommissionTotal + monthlyBankCommissionTotal;

  const missingMonthlyMobileCommissions = monthlyCommissionForm.mobileCommissions.filter(
    (row) => !parseMoneyInput(row.amount)
  );

  const missingMonthlyBankCommissions = monthlyCommissionForm.bankCommissions.filter(
    (row) => !parseMoneyInput(row.amount)
  );

  const commissionReminderDay = new Date().getDate();
  const shouldShowMonthlyCommissionReminder = commissionReminderDay >= 3 && commissionReminderDay <= 6;
  const isCommissionForceDay = commissionReminderDay >= 6;

  const previousCommissionMonth = getPreviousMonthValue();

  const currentShopMonthlyCommissionRecord = (data.monthlyWakalaCommissions || []).find(
    (record) =>
      String(record.shop_id || '') === String(shop.id) &&
      String(record.commissionMonth || '') === String(previousCommissionMonth)
  );

  const shopsWithBankAgency = ['shop-1', 'shop-2'];
  const currentShopHasBankAgency = shopsWithBankAgency.includes(String(shop.id));

  const recordedMobileCommissionsForPreviousMonth =
    currentShopMonthlyCommissionRecord?.mobileCommissions || [];

  const recordedBankCommissionsForPreviousMonth =
    currentShopMonthlyCommissionRecord?.bankCommissions || [];

  const missingMobileCommissionNames = MOBILE_PROVIDERS.filter((provider) => {
    const savedRow = recordedMobileCommissionsForPreviousMonth.find(
      (row) => String(row.provider || '') === String(provider)
    );

    return !savedRow || Number(savedRow.amount || 0) <= 0;
  });

  const missingBankCommissionNames = currentShopHasBankAgency
    ? BANKS.filter((bankName) => {
        const savedRow = recordedBankCommissionsForPreviousMonth.find(
          (row) => String(row.bankName || '') === String(bankName)
        );

        return !savedRow || Number(savedRow.amount || 0) <= 0;
      })
    : [];

  const confirmedNotReceivedMobileNames = MOBILE_PROVIDERS.filter((provider) => {
    const savedRow = recordedMobileCommissionsForPreviousMonth.find(
      (row) => String(row.provider || '') === String(provider)
    );

    return savedRow && Number(savedRow.amount || 0) <= 0 && savedRow.notReceived === true;
  });

  const confirmedNotReceivedBankNames = currentShopHasBankAgency
    ? BANKS.filter((bankName) => {
        const savedRow = recordedBankCommissionsForPreviousMonth.find(
          (row) => String(row.bankName || '') === String(bankName)
        );

        return savedRow && Number(savedRow.amount || 0) <= 0 && savedRow.notReceived === true;
      })
    : [];

  const confirmedNotReceivedCommissionNames = [
    ...confirmedNotReceivedMobileNames,
    ...confirmedNotReceivedBankNames,
  ];

  const missingMonthlyCommissionNames = [
    ...missingMobileCommissionNames,
    ...missingBankCommissionNames,
  ];

  const shouldWarnAboutMonthlyCommission =
    shouldShowMonthlyCommissionReminder &&
    missingMonthlyCommissionNames.length > 0;

  const resetMonthlyCommissionForm = () => {
    setMonthlyCommissionForm({
      id: '',
      commissionMonth: getPreviousMonthValue(),
      mobileCommissions: MOBILE_PROVIDERS.map((provider) => ({
        provider,
        amount: '',
        receivedDate: todayISO(),
        notReceived: false,
        note: '',
      })),
      bankCommissions: BANKS.map((bankName) => ({
        bankName,
        amount: '',
        receivedDate: todayISO(),
        notReceived: false,
        note: '',
      })),
      notes: '',
    });
  };

  const saveMonthlyCommission = async () => {
    if (!monthlyCommissionForm.commissionMonth) {
      alert(t(language, 'Please select commission month.', 'Tafadhali chagua mwezi wa kamisheni.'));
      return;
    }

    const mobileRows = Array.isArray(monthlyCommissionForm.mobileCommissions)
      ? monthlyCommissionForm.mobileCommissions
      : [];

    const bankRows = Array.isArray(monthlyCommissionForm.bankCommissions)
      ? monthlyCommissionForm.bankCommissions
      : [];

    const hasAnyAmount =
      mobileRows.some((row) => parseMoneyInput(row.amount) > 0) ||
      bankRows.some((row) => parseMoneyInput(row.amount) > 0);

    const hasAnyNotReceivedConfirmation =
      mobileRows.some((row) => row.notReceived === true) ||
      bankRows.some((row) => row.notReceived === true);

    if (!hasAnyAmount && !hasAnyNotReceivedConfirmation) {
      alert(
        t(
          language,
          'Enter at least one commission amount or tick Not received yet for at least one network or bank.',
          'Weka angalau kiasi cha kamisheni moja au weka alama Haijapokelewa bado kwa angalau mtandao au benki moja.'
        )
      );
      return;
    }

    if (
      isCommissionForceDay &&
      String(monthlyCommissionForm.commissionMonth || '') === String(previousCommissionMonth)
    ) {
      const unresolvedMobileNames = mobileRows
        .filter((row) => parseMoneyInput(row.amount) <= 0 && row.notReceived !== true)
        .map((row) => row.provider);

      const unresolvedBankNames = currentShopHasBankAgency
        ? bankRows
            .filter((row) => parseMoneyInput(row.amount) <= 0 && row.notReceived !== true)
            .map((row) => row.bankName)
        : [];

      const unresolvedNames = [...unresolvedMobileNames, ...unresolvedBankNames];

      if (unresolvedNames.length > 0) {
        alert(
          `${t(
            language,
            'From the 6th day, you must record commission or tick Not received yet for:',
            'Kuanzia tarehe 6, lazima urekodi kamisheni au uweke alama Haijapokelewa bado kwa:'
          )} ${unresolvedNames.join(', ')}`
        );
        return;
      }
    }

    const existingRecord = (data.monthlyWakalaCommissions || []).find(
      (record) =>
        String(record.shop_id || '') === String(shop.id) &&
        String(record.commissionMonth || '') === String(monthlyCommissionForm.commissionMonth) &&
        String(record.id || '') !== String(monthlyCommissionForm.id || '')
    );

    if (existingRecord) {
      alert(
        t(
          language,
          'This commission month has already been recorded for this shop. Edit the existing record instead of recording twice.',
          'Kamisheni ya mwezi huu tayari imerekodiwa kwa duka hili. Hariri rekodi iliyopo badala ya kurekodi mara mbili.'
        )
      );
      return;
    }

    const cleanMobileCommissions = monthlyCommissionForm.mobileCommissions.map((row) => ({
      provider: row.provider,
      amount: parseMoneyInput(row.amount),
      receivedDate: row.notReceived ? '' : (row.receivedDate || todayISO()),
      notReceived: Boolean(row.notReceived),
      note: row.note || '',
    }));

    const cleanBankCommissions = monthlyCommissionForm.bankCommissions.map((row) => ({
      bankName: row.bankName,
      amount: parseMoneyInput(row.amount),
      receivedDate: row.notReceived ? '' : (row.receivedDate || todayISO()),
      notReceived: Boolean(row.notReceived),
      note: row.note || '',
    }));

    const mobileTotal = cleanMobileCommissions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const bankTotal = cleanBankCommissions.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    const record = {
      id: monthlyCommissionForm.id || `wakala-commission-${Date.now()}`,
      shop_id: shop.id,
      shopName: shop.name,
      commissionMonth: monthlyCommissionForm.commissionMonth,
      mobileCommissions: cleanMobileCommissions,
      bankCommissions: cleanBankCommissions,
      mobileTotal,
      bankTotal,
      grandTotal: mobileTotal + bankTotal,
      notes: monthlyCommissionForm.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const nextMonthlyCommissions = monthlyCommissionForm.id
      ? (data.monthlyWakalaCommissions || []).map((item) =>
          String(item.id) === String(monthlyCommissionForm.id) ? record : item
        )
      : [...(data.monthlyWakalaCommissions || []), record];

    await saveData({
      ...data,
      monthlyWakalaCommissions: nextMonthlyCommissions,
    });

    if (navigator.onLine) {
      try {
        const row = {
          id: record.id,
          shop_id: record.shop_id,
          shopName: record.shopName || '',
          commissionMonth: record.commissionMonth || '',
          mobileCommissions: record.mobileCommissions || [],
          bankCommissions: record.bankCommissions || [],
          mobileTotal: Number(record.mobileTotal || 0),
          bankTotal: Number(record.bankTotal || 0),
          grandTotal: Number(record.grandTotal || 0),
          notes: record.notes || '',
          created_at: record.created_at || new Date().toISOString(),
          updated_at: record.updated_at || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('monthlyWakalaCommissions')
          .upsert([row], { onConflict: 'id' });

        if (error) throw error;
      } catch (error) {
        console.error('Monthly wakala commission Supabase save failed:', error);
        addToSyncQueue('monthly_wakala_commission_saved', record);
      }
    } else {
      addToSyncQueue('monthly_wakala_commission_saved', record);
    }

    resetMonthlyCommissionForm();

    alert(t(language, 'Monthly commission saved successfully.', 'Kamisheni ya mwezi imehifadhiwa kikamilifu.'));
  };

const saveMobileMoney = async () => {
  const toMoneyNumber = (value) =>
    Number(String(value || '0').replace(/,/g, '').trim() || 0);

  const formatMoneyInput = (value) => {
    const numberValue = toMoneyNumber(value);
    return numberValue ? numberValue.toLocaleString('en-US') : '';
  };

  const existingEntries = Array.isArray(data.mobileMoneyEntries)
    ? data.mobileMoneyEntries
    : [];

  const shopEntries = existingEntries
    .filter((entry) => String(entry.shop_id) === String(shop.id))
    .sort((a, b) => {
      const aDate = String(a.date || '');
      const bDate = String(b.date || '');

      if (aDate !== bDate) {
        return bDate.localeCompare(aDate);
      }

      return String(b.id || '').localeCompare(String(a.id || ''));
    });

  const latestShopEntry = shopEntries[0] || null;

  // OWNER / ADMIN RULE:
  // Admin may create the first baseline capital record if no Wakala record exists.
  // If a record already exists, admin only updates the latest record's capital fields.
  if (isOwnerUser) {
    const mobileCapitalValue = toMoneyNumber(mobileMoneyForm.mobileCapital);
    const bankCapitalValue = toMoneyNumber(mobileMoneyForm.bankCapital);

    if (!String(mobileMoneyForm.mobileCapital || '').trim() && !String(mobileMoneyForm.bankCapital || '').trim()) {
      alert('Tafadhali jaza angalau Mtaji wa Simu au Mtaji wa Benki.');
      return;
    }

    const baseRecord = latestShopEntry || {
      id: `mm-${Date.now()}`,
      shop_id: shop.id,
      date: mobileMoneyForm.date || todayISO(),
      mobileCashTotal: 0,
      bankCashTotal: 0,
      mobileCapital: 0,
      bankCapital: 0,
      networks: [],
      banks: [],
      notes: '',
    };

    const record = {
      ...baseRecord,
      id: mobileMoneyForm.id || baseRecord.id || `mm-${Date.now()}`,
      shop_id: shop.id,
      date: baseRecord.date || mobileMoneyForm.date || todayISO(),
      mobileCapital: mobileCapitalValue,
      bankCapital: bankCapitalValue,
    };

    const next = [...existingEntries];
    const existingIndex = next.findIndex((x) => String(x.id) === String(record.id));

    if (existingIndex >= 0) {
      next[existingIndex] = record;
    } else {
      next.push(record);
    }

    saveData({ ...data, mobileMoneyEntries: next });
    addToSyncQueue('mobile_money_created', record);

    const { error } = await supabase
      .from('mobileMoneyEntries')
      .upsert([record], { onConflict: 'id' });

    if (error) {
      alert(`Mobile money sync failed: ${error.message}`);
      return;
    }

    if (navigator.onLine) {
      processSyncQueue().catch((syncError) => {
        console.error('Queued mobile money sync error:', syncError);
      });
    }

    setMobileMoneyForm((prev) => ({
      ...prev,
      id: record.id,
      date: record.date || todayISO(),
      mobileCapital: formatMoneyInput(record.mobileCapital),
      bankCapital: formatMoneyInput(record.bankCapital),
    }));

    alert('Mtaji wa wakala umehifadhiwa.');
    return;
  }

  // 🔴 VALIDATION START

  // Mobile capital lazima
  if (!String(mobileMoneyForm.mobileCapital || '').trim()) {
    alert('Tafadhali jaza sehemu ya mtaji.');
    return;
  }

  // Mobile cash lazima
  if (!String(mobileMoneyForm.mobileCashTotal || '').trim()) {
    alert('Tafadhali jaza pesa taslimu.');
    return;
  }

  // ALL 4 networks lazima
  const requiredProviders = ['M-Pesa', 'Mixx by Yas', 'Airtel Money', 'HaloPesa'];

  for (const provider of requiredProviders) {
    const row = (mobileMoneyForm.networks || []).find((n) => n.provider === provider);

    if (!row) {
      alert(`Tafadhali ongeza ${provider}.`);
      return;
    }

    if (!String(row.float || '').trim()) {
      alert(`Tafadhali jaza float ya ${provider}.`);
      return;
    }
  }

  // 👉 Angalia kama user ameanza kutumia bank
  const hasBankData =
  String(mobileMoneyForm.bankCashTotal || '').trim() ||
  (mobileMoneyForm.banks || []).some((b) =>
    String(b.float || '').trim()
  );

  // 👉 Kama hajatumia bank, usimlazimishe
  if (hasBankData) {
    if (!String(mobileMoneyForm.bankCashTotal || '').trim()) {
      alert('Tafadhali jaza pesa taslimu ya benki.');
      return;
    }

    const requiredBanks = ['CRDB', 'NMB', 'NBC'];

    for (let i = 0; i < requiredBanks.length; i += 1) {
      const bankName = requiredBanks[i];
      const row = (mobileMoneyForm.banks || [])[i];

      if (!row) {
        alert(`Tafadhali ongeza ${bankName}.`);
        return;
      }

      if (String(row.bankName || '').trim() !== bankName) {
        alert(`Tafadhali ongeza ${bankName}.`);
        return;
      }

      if (!String(row.float || '').trim()) {
        alert(`Tafadhali jaza float ya ${bankName}.`);
        return;
      }

      
    }
  }

  // 🔴 VALIDATION END

  const existingTodayEntry = existingEntries.find(
    (entry) =>
      String(entry.shop_id) === String(shop.id) &&
      String(entry.date) === String(mobileMoneyForm.date || todayISO()) &&
      String(entry.id) !== String(mobileMoneyForm.id || '')
  );

  if (existingTodayEntry) {
    alert('Tayari umejaza taarifa za wakala kwa tarehe ya leo. Tafadhali wasiliana na admini kwa msaada zaidi.');
    return;
  }

  const record = {
    id: mobileMoneyForm.id || `mm-${Date.now()}`,
    shop_id: shop.id,
    date: mobileMoneyForm.date || todayISO(),
    mobileCashTotal: toMoneyNumber(mobileMoneyForm.mobileCashTotal),
    bankCashTotal: toMoneyNumber(mobileMoneyForm.bankCashTotal),
    mobileCapital: toMoneyNumber(mobileMoneyForm.mobileCapital),
    bankCapital: toMoneyNumber(mobileMoneyForm.bankCapital),
   networks: mobileMoneyForm.networks.map((n) => ({
  provider: n.provider,
  float: toMoneyNumber(n.float),
})),
banks: mobileMoneyForm.banks.map((b) => ({
  bankName: b.bankName,
  float: toMoneyNumber(b.float),
})),
    notes: mobileMoneyForm.notes || '',
  };

  const next = [...existingEntries];
  const existingIndex = next.findIndex((x) => String(x.id) === String(record.id));

  if (existingIndex >= 0) {
    next[existingIndex] = record;
  } else {
    next.push(record);
  }

  saveData({ ...data, mobileMoneyEntries: next });
  addToSyncQueue('mobile_money_created', record);

  const { error } = await supabase
    .from('mobileMoneyEntries')
    .upsert([record], { onConflict: 'id' });

  if (error) {
    alert(`Mobile money sync failed: ${error.message}`);
    return;
  }

  if (navigator.onLine) {
    processSyncQueue().catch((syncError) => {
      console.error('Queued mobile money sync error:', syncError);
    });
  }

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

  const deleteMobileMoney = async (id) => {
  saveData({
    ...data,
    mobileMoneyEntries: data.mobileMoneyEntries.filter((m) => m.id !== id),
  });

  const { error } = await supabase
    .from('mobileMoneyEntries')
    .delete()
    .eq('id', id);

  if (error) {
    alert(`Mobile money delete failed: ${error.message}`);
  }
};
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
} else if (reportType === 'expiryStockValue') {
  rows = expiryStockValueRows.map((row) => ({
    ProductName: row.name,
    DateRecorded: row.createdAt || '',
    Unit: row.baseUnit,
    Balance: Number(row.stockBaseQty || 0),
    BuyPrice: Number(row.buyPrice || 0),
    SellPrice: Number(row.sellPrice || 0),
    StockValue: Number(row.stockValue || 0),
    ProfitPerProduct: Number(row.totalProfitIfSold || 0),
    ExpiryDate: row.expiryDate || '',
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
     <div className="mb-6 rounded-2xl bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(236,72,153,0.10),rgba(255,255,255,0.95))] p-5 shadow-lg ring-1 ring-slate-200/70">
        <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-5 backdrop-blur-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {canBack ? (
                  <button
                    type="button"
                    onClick={backToOwner}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t(language, 'Back to owner', 'Rudi kwa mmiliki')}
                  </button>
                ) : null}
              </div>

              <div className="mt-3 inline-flex rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {t(language, 'Shop Workspace', 'Eneo la Kazi la Duka')}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {shop.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t(
                  language,
                  'Sales, stock, credit, gas, mobile money and reports in one elegant workspace.',
                  'Mauzo, stock, madeni, gesi, wakala na ripoti katika eneo moja lenye mwonekano wa kifahari.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="sw">Kiswahili</option>
                <option value="en">English</option>
              </select>

               <select
  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
  value={reportPreset}
  onChange={(e) => setReportPreset(e.target.value)}
>
  <option value="today">{t(language, 'Today', 'Leo')}</option>
  <option value="yesterday">{t(language, 'Yesterday', 'Jana')}</option>
  <option value="week">{t(language, 'This week to date', 'Wiki hii hadi leo')}</option>
  <option value="lastweek">{t(language, 'Last week', 'Wiki iliyopita')}</option>
  <option value="month">{t(language, 'This month to date', 'Mwezi huu hadi leo')}</option>
  <option value="lastmonth">{t(language, 'Last month', 'Mwezi uliopita')}</option>
  <option value="3months">{t(language, 'Last 3 months', 'Miezi 3 iliyopita')}</option>
  <option value="6months">{t(language, 'Last 6 months', 'Miezi 6 iliyopita')}</option>
  <option value="year">{t(language, 'This year', 'Mwaka huu')}</option>
</select>

              <Button variant="outline" className="bg-white shadow-sm" onClick={() => exportBackup()}>
                {t(language, 'Export Backup', 'Pakua Backup')}
              </Button>

              <Button variant="outline" className="bg-white shadow-sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t(language, 'Logout', 'Toka')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,255,0.94),rgba(255,244,250,0.94))] p-2 shadow-lg ring-1 ring-slate-200/70">
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
      ...(
        data.currentUser?.role === 'owner' ||
        String(data.currentUser?.shop_id || data.currentUser?.shopId || '') === 'shop-1'
          ? [['rental', 'Rental Property']]
          : []
      ),
      ['reports', t(language, 'Reports', 'Ripoti')],
    ].map(([value, label]) => (
      <TabsTrigger key={value} value={value} activeValue={activeTab} onClick={() => setActiveTab(value)}>
        {label}
      </TabsTrigger>
    ))}
  </TabsList>
</div>

     <TabsContent value="dashboard" activeValue={activeTab}>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
    <StatCard
  title={t(language, 'Today Sales', 'Mauzo ya Leo')}
  value={`TZS ${currency(todaySales)}`}
  icon={ShoppingCart}
  color="bg-orange-300"
/>

<StatCard
  title={t(language, 'Today Expenses', 'Matumizi ya Leo')}
  value={`TZS ${currency(todayExpenses)}`}
  icon={AlertTriangle}
  color="bg-red-300"
/>

<StatCard
  title={t(language, 'Today Profit', 'Faida ya Leo')}
  value={`TZS ${currency(todayProfit)}`}
  icon={Wallet}
  color="bg-green-300"
/>

<StatCard
  title={t(language, 'Expiry Alerts', 'Bidhaa zinazokaribia ku-expire')}
  value={`${expiringSoonCount}`}
  icon={AlertTriangle}
  color="bg-rose-300"
/>

<StatCard
  title={t(language, 'Low Stock Alerts', 'Bidhaa zinazohitaji kuongezwa')}
  value={`${lowStockCount}`}
  icon={AlertTriangle}
  color="bg-amber-300"
/>

<StatCard
  title={t(language, 'Mobile Money Capital', 'Mtaji wa Simu')}
  value={`TZS ${currency(mobileCapital)}`}
  subtitle={
  latestMobileEntry
    ? getFloatStatus(
        mobileCapital,
        latestMobileEntry.mobileCashTotal,
        mobileFloat,
        mobileCommission,
        language
      )
    : ''
}
  icon={HandCoins}
  color="bg-cyan-300"
/>

<StatCard
  title={t(language, 'Bank Capital', 'Mtaji wa Benki')}
  value={`TZS ${currency(bankCapital)}`}
  subtitle={
  latestMobileEntry
    ? getFloatStatus(
        bankCapital,
        latestMobileEntry.bankCashTotal,
        bankFloat,
        bankCommission,
        language
      )
    : ''
}
  icon={Building2}
  color="bg-blue-300"
/>
</div>
  <Card className="mt-6 border-white/50 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,255,0.96),rgba(255,244,250,0.96))] shadow-lg backdrop-blur-md">
    <CardHeader>
      <CardTitle>{t(language, 'Business Profit Breakdown', 'Muhtasari wa Faida za Biashara')}</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="grid gap-3 md:grid-cols-4 text-sm">
        <div className="rounded-2xl bg-gradient-to-r from-fuchsia-100 to-pink-100 p-3 font-medium text-slate-800">
          {t(language, 'Retail Profit', 'Faida ya Duka')}: TZS {currency(todayRetailProfit)}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-orange-100 to-rose-100 p-3 font-medium text-slate-800">
          {t(language, 'Gas Profit', 'Faida ya Gesi')}: TZS {currency(todayGasProfit)}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-cyan-100 to-sky-100 p-3 font-medium text-slate-800">
          {t(language, 'Wakala Commission', 'Kamisheni ya Wakala')}: TZS {currency(todayWakalaCommission)}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 p-3 font-semibold text-slate-900">
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
                      <div>
  <label className="mb-1 block text-xs font-semibold text-slate-600">
    {t(language, 'Expiry date', 'Tarehe ya mwisho wa matumizi')}
  </label>
  <Input
    type="date"
    value={row.expiryDate}
    onChange={(e) => updateProductRow(index, 'expiryDate', e.target.value)}
  />
</div>
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

<div>
  <label className="mb-1 block text-xs font-semibold text-slate-600">
    {t(language, 'Purchase date', 'Tarehe ya manunuzi')}
  </label>
  <Input
    type="date"
    value={row.date}
    onChange={(e) => updatePurchaseRow(index, 'date', e.target.value)}
  />
</div>

<div>
  <label className="mb-1 block text-xs font-semibold text-slate-600">
    {t(language, 'Expiry date', 'Tarehe ya mwisho wa matumizi')}
  </label>
  <Input
    type="date"
    value={row.expiryDate || ''}
    onChange={(e) => updatePurchaseRow(index, 'expiryDate', e.target.value)}
  />
</div>

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
    standard_product_code:
      String(p.standard_product_code || p.standardProductCode || '').trim() ||
      buildStandardProductCode(p.name, p.baseUnit || 'pc'),
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
  className="!h-9 w-20 sm:w-16 shrink-0 text-center"
  type="number"
  min="1"
  step="1"
  defaultValue=""
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      const rawQty = e.currentTarget.value?.trim() || '';
      const qty = rawQty === '' ? 1 : Number(rawQty);

      quickAddMeasured(p, qty);
      e.currentTarget.value = '';
      setQuickSearch('');
    }
  }}
/>

<Button
  type="button"
  size="sm"
  onClick={(e) => {
    const row = e.currentTarget.parentElement;
    const qtyInput = e.currentTarget.previousElementSibling;
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
            className="!h-9 w-20 sm:w-16 shrink-0 text-center"
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
                  <Input
  placeholder={t(language, 'Phone number', 'Namba ya simu')}
  value={row.phone || ''}
  onChange={(e) => updateChangeRow(index, 'phone', e.target.value)}
/>
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
gasSalesRows={gasSalesRows}
addGasSalesRow={addGasSalesRow}
updateGasSalesRow={updateGasSalesRow}
removeGasSalesRow={removeGasSalesRow}
    todayGasEntries={gasEntries.filter((g) => g.date === todayISO())}
    isOwnerUser={data.currentUser?.role === 'owner'}
    onSaveGas={saveGas}
onEditGas={editGas}
onDeleteGas={deleteGas}
  />

</TabsContent>
<TabsContent value="rental" activeValue={activeTab}>
  <RentalPropertySection
    language={language}
    data={data}
    saveData={saveData}
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
                  <option value="stockValue">
  {t(language, 'Stock Value Report', 'Ripoti ya Thamani ya Stock')}
</option>

<option value="expiryStockValue">
  {t(language, 'Detailed Expiry Stock Report', 'Ripoti ya Stock zenye Expiry Date')}
</option>

<option value="expiryAlert">
  {t(language, 'Expiry Alert Report', 'Tahadhari ya Bidhaa Zinazoisha Muda')}
</option>
                  <option value="salesReport">{t(language, 'Sales Report', 'Ripoti ya Mauzo')}</option>
<option value="profitLoss">{t(language, 'Profit & Loss Report', 'Ripoti ya Faida na Hasara')}</option>
<option value="mostProfitableProducts">
  {t(language, 'Most Profitable Products', 'Bidhaa Zenye Faida Kubwa')}
</option>
<option value="expensesReport">{t(language, 'Expenses Report', 'Ripoti ya Matumizi')}</option>
<option value="changeLedgerReport">{t(language, 'Change Ledger Report', 'Ripoti ya Chenji ya Mteja')}</option>
<option value="creditSalesReport">{t(language, 'Credit Sales Report', 'Ripoti ya Madeni')}</option>
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
  <option value="date">{t(language, 'Custom range', 'Chagua tarehe')}</option>
  <option value="week">{t(language, 'This week to date', 'Wiki hii hadi leo')}</option>
  <option value="lastweek">{t(language, 'Last week', 'Wiki iliyopita')}</option>
  <option value="month">{t(language, 'This month to date', 'Mwezi huu hadi leo')}</option>
  <option value="lastmonth">{t(language, 'Last month', 'Mwezi uliopita')}</option>
  <option value="3months">{t(language, 'Last 3 months', 'Miezi 3 iliyopita')}</option>
  <option value="6months">{t(language, 'Last 6 months', 'Miezi 6 iliyopita')}</option>
  <option value="year">{t(language, 'This year', 'Mwaka huu')}</option>
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
) : reportType === 'expiryStockValue' ? (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2">Product Name</th>
          <th className="py-2">Date Recorded</th>
          <th className="py-2">Unit</th>
          <th className="py-2">Balance</th>
          <th className="py-2">Buy Price</th>
          <th className="py-2">Sell Price</th>
          <th className="py-2">Stock Value</th>
          <th className="py-2">Profit per Product</th>
          <th className="py-2">Expiry Date</th>
          <th className="py-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        {expiryStockValueRows.length ? (
          expiryStockValueRows.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="py-2">{row.name}</td>
              <td className="py-2">{row.createdAt || '-'}</td>
              <td className="py-2">{row.baseUnit}</td>
              <td className="py-2">{Number(row.stockBaseQty || 0)}</td>
              <td className="py-2">{currency(row.buyPrice)}</td>
<td className="py-2">{currency(row.sellPrice)}</td>
<td className="py-2">{currency(row.stockValue)}</td>
<td className="py-2">{currency(row.totalProfitIfSold)}</td>
              <td className="py-2">{row.expiryDate || '-'}</td>
              <td className="py-2">
  <div className="flex gap-2">
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
        if (!confirm('Archive this expired/expiry product?')) return;

        const nextProducts = data.products.map((p) =>
          String(p.id) === String(row.id)
            ? { ...p, archived: true }
            : p
        );

        await saveData({
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
          ))
        ) : (
          <tr>
            <td colSpan={10} className="py-4 text-slate-500">
              No products with expiry date recorded.
            </td>
          </tr>
        )}
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
) : reportType === 'mostProfitableProducts' ? (
  <div className="overflow-x-auto">
    {mostProfitableProductsRows.length === 0 ? (
      <div className="text-sm text-slate-500">
        {t(language, 'No profitable product data in this period.', 'Hakuna taarifa ya bidhaa zenye faida katika kipindi hiki.')}
      </div>
    ) : (
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">{t(language, 'Product Name', 'Jina la Bidhaa')}</th>
            <th className="py-2 pr-3">{t(language, 'Sold Qty', 'Jumla Iliyouzwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Total Sales', 'Jumla ya Mauzo')}</th>
            <th className="py-2 pr-3">{t(language, 'Total Profit', 'Jumla ya Faida')}</th>
            <th className="py-2 pr-3">{t(language, 'Margin %', 'Asilimia ya Faida')}</th>
            <th className="py-2 pr-3">{t(language, 'Current Stock', 'Stock Iliyobaki')}</th>
          </tr>
        </thead>
        <tbody>
          {mostProfitableProductsRows.map((row) => (
            <tr key={row.productId || row.name} className="border-b border-slate-100">
              <td className="py-3 pr-3">{row.name}</td>
              <td className="py-3 pr-3">{formatQty(row.soldQty)}</td>
              <td className="py-3 pr-3">TZS {currency(row.totalSales)}</td>
              <td className="py-3 pr-3">TZS {currency(row.totalProfit)}</td>
              <td className="py-3 pr-3">{Number(row.marginPercent || 0).toFixed(1)}%</td>
              <td className="py-3 pr-3">{formatQty(row.currentStock)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
) : reportType === 'salesReport' ? (
              <div className="overflow-x-auto">
                {reportSalesLoading ? (
                  <div className="mb-3 text-sm text-slate-500">
                    {t(language, 'Loading older sales from Supabase...', 'Inapakia mauzo ya zamani kutoka Supabase...')}
                  </div>
                ) : null}
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
                        <td className="py-3 pr-3">
  {row.created_at
    ? new Date(row.created_at).toLocaleString()
    : row.date || '-'}
</td>
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

) : reportType === 'expensesReport' ? (
  <div className="overflow-x-auto">
    {expensesReportRows.length === 0 ? (
      <div className="text-sm text-slate-500">
        {t(language, 'No expenses in this period.', 'Hakuna matumizi katika kipindi hiki.')}
      </div>
    ) : (
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">S/N</th>
            <th className="py-2 pr-3">{t(language, 'Date', 'Tarehe')}</th>
            <th className="py-2 pr-3">{t(language, 'Expense Name', 'Jina la Matumizi')}</th>
            <th className="py-2 pr-3">{t(language, 'Amount', 'Kiasi')}</th>
          </tr>
        </thead>
        <tbody>
          {expensesReportRows.map((row) => (
            <tr key={`${row.sn}-${row.date}-${row.title}`} className="border-b border-slate-100">
              <td className="py-3 pr-3">{row.sn}</td>
              <td className="py-3 pr-3">{row.date}</td>
              <td className="py-3 pr-3">{row.title}</td>
              <td className="py-3 pr-3">TZS {currency(row.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
) : reportType === 'changeLedgerReport' ? (
  <div className="overflow-x-auto">
    {changeLedgerReportRows.length === 0 ? (
      <div className="text-sm text-slate-500">
        {t(language, 'No customer change records in this period.', 'Hakuna rekodi za chenji ya mteja katika kipindi hiki.')}
      </div>
    ) : (
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">S/N</th>
            <th className="py-2 pr-3">{t(language, 'Date', 'Tarehe')}</th>
            <th className="py-2 pr-3">{t(language, 'Customer Name', 'Jina la Mteja')}</th>
            <th className="py-2 pr-3">{t(language, 'Amount Owed', 'Kiasi Anachodaiwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Payment Status', 'Hali ya Malipo')}</th>
            <th className="py-2 pr-3">{t(language, 'Notes', 'Maelezo')}</th>
          </tr>
        </thead>
        <tbody>
          {changeLedgerReportRows.map((row) => (
            <tr key={`${row.sn}-${row.date}-${row.customerName}`} className="border-b border-slate-100">
              <td className="py-3 pr-3">{row.sn}</td>
              <td className="py-3 pr-3">{row.date}</td>
              <td className="py-3 pr-3">{row.customerName}</td>
              <td className="py-3 pr-3">TZS {currency(row.amountOwed)}</td>
              <td className="py-3 pr-3">{row.status}</td>
              <td className="py-3 pr-3">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
) : reportType === 'creditSalesReport' ? (
  <div className="overflow-x-auto">
    {creditSalesReportRows.length === 0 ? (
      <div className="text-sm text-slate-500">
        {t(language, 'No credit sales in this period.', 'Hakuna madeni katika kipindi hiki.')}
      </div>
    ) : (
      <table className="w-full min-w-[1100px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">S/N</th>
            <th className="py-2 pr-3">{t(language, 'Date', 'Tarehe')}</th>
            <th className="py-2 pr-3">{t(language, 'Customer Name', 'Jina la Mteja')}</th>
            <th className="py-2 pr-3">{t(language, 'Phone', 'Simu')}</th>
            <th className="py-2 pr-3">{t(language, 'Credit Amount', 'Kiasi cha Deni')}</th>
            <th className="py-2 pr-3">{t(language, 'Balance', 'Salio')}</th>
            <th className="py-2 pr-3">{t(language, 'Payment Status', 'Hali ya Malipo')}</th>
            <th className="py-2 pr-3">{t(language, 'Notes', 'Maelezo')}</th>
          </tr>
        </thead>
        <tbody>
          {creditSalesReportRows.map((row) => (
            <tr key={`${row.sn}-${row.date}-${row.customerName}`} className="border-b border-slate-100">
              <td className="py-3 pr-3">{row.sn}</td>
              <td className="py-3 pr-3">{row.date}</td>
              <td className="py-3 pr-3">{row.customerName}</td>
              <td className="py-3 pr-3">{row.phone}</td>
              <td className="py-3 pr-3">TZS {currency(row.amount)}</td>
              <td className="py-3 pr-3">TZS {currency(row.balance)}</td>
              <td className="py-3 pr-3">{row.status}</td>
              <td className="py-3 pr-3">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
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
                  {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.mobileCapital, entry.mobileCashTotal, getMobileFloatTotal(entry), getMobileCommissionTotal(entry), language)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div>{t(language, 'Bank cash total', 'Jumla ya cash ya benki')}: TZS {currency(entry.bankCashTotal)}</div>
                <div>{t(language, 'Bank capital', 'Mtaji wa benki')}: TZS {currency(entry.bankCapital)}</div>
                <div>{t(language, 'Total Bank Float', 'Jumla ya Float ya Benki')}: TZS {currency(getBankFloatTotal(entry))}</div>
                <div>{t(language, 'Total Bank Commission', 'Jumla ya Kamisheni ya Benki')}: TZS {currency(getBankCommissionTotal(entry))}</div>
                <div className="mt-2 font-medium">
                  {getFloatStatus(entry.bankCapital, entry.bankCashTotal, getBankFloatTotal(entry), getBankCommissionTotal(entry), language)} 
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
  {shouldShowMobileMoneyWarning ? (
  <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    Tayari umejaza taarifa za wakala kwa tarehe ya leo. Tafadhali wasiliana na admini kama ungependa kufanya marekebisho.
  </div>
) : null}
              <div className="grid gap-3 md:grid-cols-2">
  <Input
    type="date"
    value={mobileMoneyForm.date}
    onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, date: e.target.value }))}
  />
 <Input
  type="text"
  inputMode="decimal"
  placeholder={t(language, 'Mobile Capital', 'Mtaji wa Simu')}
  value={formatMoneyInput(mobileMoneyForm.mobileCapital)}
  onChange={(e) =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      mobileCapital: formatMoneyInput(e.target.value),
    }))
  }
/>
<Input
  type="text"
  inputMode="decimal"
  placeholder={t(language, 'Bank Capital', 'Mtaji wa Benki')}
  value={formatMoneyInput(mobileMoneyForm.bankCapital)}
  onChange={(e) =>
    setMobileMoneyForm((prev) => ({
      ...prev,
      bankCapital: formatMoneyInput(e.target.value),
    }))
  }
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
        <select
          className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          value={row.bankName}
          onChange={(e) => updateBankRow(index, 'bankName', e.target.value)}
        >
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>

        <Input
          type="number"
          placeholder={t(language, 'Float', 'Float')}
          value={row.float}
          onChange={(e) => updateBankRow(index, 'float', e.target.value)}
        />

        <div className="flex gap-2">
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

<Input
  placeholder={t(language, 'Notes', 'Maelezo')}
  value={mobileMoneyForm.notes}
  onChange={(e) => setMobileMoneyForm((prev) => ({ ...prev, notes: e.target.value }))}
/>

<Button
  type="button"
  onClick={saveMobileMoney}
  disabled={
    shouldDisableMobileMoneySave ||
    (
      isOwnerUser &&
      !mobileMoneyForm.id &&
      !String(mobileMoneyForm.mobileCapital || '').trim() &&
      !String(mobileMoneyForm.bankCapital || '').trim()
    )
  }
>
  {shouldDisableMobileMoneySave
    ? 'Taarifa za leo tayari zipo'
    : isOwnerUser
      ? mobileMoneyForm.id
        ? 'Hifadhi Mtaji wa Wakala'
        : 'Hifadhi Mtaji wa Mwanzo'
      : t(language, 'Save Wakala', 'Hifadhi Wakala')}
</Button>

<Card className="mt-6 border-emerald-100 bg-emerald-50/60">
  <CardHeader>
    <CardTitle>
      {t(language, 'Monthly Wakala Commission', 'Kamisheni ya Wakala ya Mwezi')}
    </CardTitle>

    {shouldWarnAboutMonthlyCommission ? (
      <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${
        isCommissionForceDay
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'
      }`}>
        <div>
          {missingMonthlyCommissionNames.length === MOBILE_PROVIDERS.length + (currentShopHasBankAgency ? BANKS.length : 0)
            ? t(
                language,
                'Please record last month wakala commission if already received.',
                'Tafadhali rekodi kamisheni ya wakala ya mwezi uliopita kama tayari imepokelewa.'
              )
            : `${t(
                language,
                'Please record last month commission for',
                'Tafadhali rekodi kamisheni ya'
              )} ${missingMonthlyCommissionNames.join(', ')} ${t(
                language,
                'if already received.',
                'ya mwezi uliopita kama tayari imepokelewa.'
              )}`}
        </div>

        {confirmedNotReceivedCommissionNames.length > 0 ? (
          <div className="mt-2 text-xs">
            {t(
              language,
              'Already confirmed not received yet:',
              'Tayari umethibitisha haijapokelewa bado:'
            )} {confirmedNotReceivedCommissionNames.join(', ')}
          </div>
        ) : null}
      </div>
    ) : null}
    <p className="text-sm text-slate-600">
      {t(
        language,
        'Record commission by network. Each network can have its own received date. The system will calculate totals automatically.',
        'Rekodi kamisheni kwa kila mtandao. Kila mtandao unaweza kuwa na tarehe yake ya kupokea. Mfumo utajumlisha wenyewe.'
      )}
    </p>
  </CardHeader>

  <CardContent className="space-y-5">
    <div>
      <Label>{t(language, 'Commission Month', 'Mwezi wa Kamisheni')}</Label>
      <Input
        type="month"
        value={monthlyCommissionForm.commissionMonth}
        onChange={(e) =>
          setMonthlyCommissionForm((prev) => ({
            ...prev,
            commissionMonth: e.target.value,
          }))
        }
      />
      <p className="mt-1 text-xs text-slate-500">
        {t(
          language,
          'This is the business month the commission belongs to.',
          'Huu ndio mwezi wa biashara ambao kamisheni inahusika nao.'
        )}
      </p>
    </div>

    <details className="rounded-2xl border border-emerald-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">
        {t(language, 'Mobile Money Commission', 'Kamisheni za Mitandao ya Simu')} — TZS {currency(monthlyMobileCommissionTotal)}
      </summary>

      <div className="mt-4 space-y-3">
        {monthlyCommissionForm.mobileCommissions.map((row, index) => (
          <div key={row.provider} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-5">
            <div className="flex items-center text-sm font-semibold text-slate-700">
              {row.provider}
            </div>

            <Input
              type="number"
              placeholder={t(language, 'Commission amount', 'Kiasi cha kamisheni')}
              value={row.amount}
              disabled={row.notReceived}
              onChange={(e) => updateMonthlyMobileCommission(index, 'amount', e.target.value)}
            />

            <Input
  type="date"
  value={row.receivedDate || todayISO()}
  disabled={row.notReceived}
  onChange={(e) => updateMonthlyMobileCommission(index, 'receivedDate', e.target.value)}
/>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(row.notReceived)}
                onChange={(e) => {
                  updateMonthlyMobileCommission(index, 'notReceived', e.target.checked);
                  if (e.target.checked) {
                    updateMonthlyMobileCommission(index, 'amount', '');
                  }
                }}
              />
              {t(language, 'Not received yet', 'Haijapokelewa bado')}
            </label>

            <Input
              placeholder={t(language, 'Note', 'Maelezo')}
              value={row.note}
              onChange={(e) => updateMonthlyMobileCommission(index, 'note', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
        {t(language, 'Mobile money commission total', 'Jumla ya kamisheni za mitandao ya simu')}: TZS {currency(monthlyMobileCommissionTotal)}
      </div>
    </details>

    <details className="rounded-2xl border border-blue-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">
        {t(language, 'Bank Commission', 'Kamisheni za Benki')} — TZS {currency(monthlyBankCommissionTotal)}
      </summary>

      <p className="mt-3 mb-3 text-xs text-slate-500">
        {t(
          language,
          'Fill this part only for shops with bank agency services.',
          'Jaza sehemu hii kwa maduka yenye huduma za uwakala wa benki tu.'
        )}
      </p>

      <div className="space-y-3">
        {monthlyCommissionForm.bankCommissions.map((row, index) => (
          <div key={row.bankName} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-5">
            <div className="flex items-center text-sm font-semibold text-slate-700">
              {row.bankName}
            </div>

            <Input
              type="number"
              placeholder={t(language, 'Commission amount', 'Kiasi cha kamisheni')}
              value={row.amount}
              disabled={row.notReceived}
              onChange={(e) => updateMonthlyBankCommission(index, 'amount', e.target.value)}
            />

            <Input
  type="date"
  value={row.receivedDate || todayISO()}
  disabled={row.notReceived}
  onChange={(e) => updateMonthlyBankCommission(index, 'receivedDate', e.target.value)}
/>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(row.notReceived)}
                onChange={(e) => {
                  updateMonthlyBankCommission(index, 'notReceived', e.target.checked);
                  if (e.target.checked) {
                    updateMonthlyBankCommission(index, 'amount', '');
                  }
                }}
              />
              {t(language, 'Not received yet', 'Haijapokelewa bado')}
            </label>

            <Input
              placeholder={t(language, 'Note', 'Maelezo')}
              value={row.note}
              onChange={(e) => updateMonthlyBankCommission(index, 'note', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-800">
        {t(language, 'Bank commission total', 'Jumla ya kamisheni za benki')}: TZS {currency(monthlyBankCommissionTotal)}
      </div>
    </details>

    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800">
        {t(language, 'Mobile total', 'Jumla ya simu')}: TZS {currency(monthlyMobileCommissionTotal)}
      </div>

      <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-800">
        {t(language, 'Bank total', 'Jumla ya benki')}: TZS {currency(monthlyBankCommissionTotal)}
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
        {t(language, 'Grand total commission', 'Jumla kuu ya kamisheni')}: TZS {currency(monthlyCommissionGrandTotal)}
      </div>
    </div>

    <div>
      <Label>{t(language, 'Notes', 'Maelezo')}</Label>
     <Input
  value={monthlyCommissionForm.notes}
  onChange={(e) =>
    setMonthlyCommissionForm((prev) => ({
      ...prev,
      notes: e.target.value,
    }))
  }
/>
    </div>

    <div className="flex flex-wrap gap-2">
  <Button type="button" onClick={saveMonthlyCommission}>
    {monthlyCommissionForm.id
      ? t(language, 'Update Monthly Commission', 'Sasisha Kamisheni ya Mwezi')
      : t(language, 'Save Monthly Commission', 'Hifadhi Kamisheni ya Mwezi')}
  </Button>

  {monthlyCommissionForm.id ? (
    <Button type="button" variant="outline" onClick={resetMonthlyCommissionForm}>
      {t(language, 'Cancel Edit', 'Acha Kuhariri')}
    </Button>
  ) : null}
</div>

    <div className="text-xs text-slate-500">
      {t(
        language,
        'Record each network separately. The system will calculate mobile total, bank total and grand total automatically.',
        'Rekodi kila mtandao tofauti. Mfumo utajumlisha kamisheni za simu, kamisheni za benki na jumla kuu wenyewe.'
      )}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-800">
        {t(language, 'Saved Monthly Commission Records', 'Rekodi za Kamisheni za Mwezi Zilizohifadhiwa')}
      </div>

      {(data.monthlyWakalaCommissions || []).filter((record) => String(record.shop_id) === String(shop.id)).length === 0 ? (
        <div className="text-sm text-slate-500">
          {t(language, 'No monthly commission records saved yet.', 'Hakuna rekodi ya kamisheni ya mwezi iliyohifadhiwa bado.')}
        </div>
      ) : (
        <div className="space-y-3">
          {(data.monthlyWakalaCommissions || [])
            .filter((record) => String(record.shop_id) === String(shop.id))
            .slice()
            .sort((a, b) => String(b.commissionMonth || '').localeCompare(String(a.commissionMonth || '')))
            .map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
  <div className="font-semibold text-slate-800">
    {t(language, 'Commission Month', 'Mwezi wa Kamisheni')}: {record.commissionMonth}
  </div>

  <div className="flex items-center gap-2">
    {(() => {
      const mobileRows = record.mobileCommissions || [];
      const bankRows = currentShopHasBankAgency ? (record.bankCommissions || []) : [];
      const expectedRows = [...mobileRows, ...bankRows];

      const expectedCount = MOBILE_PROVIDERS.length + (currentShopHasBankAgency ? BANKS.length : 0);
      const amountCount = expectedRows.filter((row) => Number(row.amount || 0) > 0).length;
      const notReceivedCount = expectedRows.filter((row) => row.notReceived === true).length;

      if (amountCount >= expectedCount) {
        return (
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {t(language, 'Complete', 'Imekamilika')}
          </div>
        );
      }

      if (amountCount === 0 && notReceivedCount > 0) {
        return (
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {t(language, 'Not received confirmed', 'Imethibitishwa haijapokelewa')}
          </div>
        );
      }

      if (amountCount > 0 && amountCount < expectedCount) {
        return (
          <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            {t(language, 'Partially recorded', 'Imerekodiwa kwa sehemu')}
          </div>
        );
      }

      return (
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {t(language, 'Saved', 'Imehifadhiwa')}
        </div>
      );
    })()}

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        setMonthlyCommissionForm({
          id: record.id,
          commissionMonth: record.commissionMonth || getPreviousMonthValue(),
          mobileCommissions: MOBILE_PROVIDERS.map((provider) => {
            const savedRow = (record.mobileCommissions || []).find(
              (row) => String(row.provider || '') === String(provider)
            );

            return {
              provider,
              amount: savedRow?.amount ? String(savedRow.amount) : '',
              receivedDate: savedRow?.receivedDate || todayISO(),
              notReceived: Boolean(savedRow?.notReceived),
              note: savedRow?.note || '',
            };
          }),
          bankCommissions: BANKS.map((bankName) => {
            const savedRow = (record.bankCommissions || []).find(
              (row) => String(row.bankName || '') === String(bankName)
            );

            return {
              bankName,
              amount: savedRow?.amount ? String(savedRow.amount) : '',
              receivedDate: savedRow?.receivedDate || todayISO(),
              notReceived: Boolean(savedRow?.notReceived),
              note: savedRow?.note || '',
            };
          }),
          notes: record.notes || '',
        });
      }}
    >
      {t(language, 'Edit', 'Hariri')}
    </Button>
  </div>
</div>

                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <div className="rounded-xl bg-white px-3 py-2">
                    {t(language, 'Mobile total', 'Jumla ya simu')}: TZS {currency(record.mobileTotal)}
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2">
                    {t(language, 'Bank total', 'Jumla ya benki')}: TZS {currency(record.bankTotal)}
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 font-semibold">
                    {t(language, 'Grand total', 'Jumla kuu')}: TZS {currency(record.grandTotal)}
                  </div>
                </div>

                <details className="mt-3 rounded-2xl border border-emerald-100 bg-white p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-700">
                    {t(language, 'Mobile money breakdown', 'Mchanganuo wa kamisheni za simu')}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {(record.mobileCommissions || []).map((row) => (
                      <div key={row.provider} className="grid gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs md:grid-cols-4">
                        <div className="font-semibold text-slate-700">{row.provider}</div>

                        <div>
                          {t(language, 'Amount', 'Kiasi')}: TZS {currency(row.amount)}
                        </div>

                        <div>
                          {row.notReceived
                            ? t(language, 'Not received yet', 'Haijapokelewa bado')
                            : `${t(language, 'Received date', 'Tarehe ya kupokea')}: ${row.receivedDate || '-'}`}
                        </div>

                        <div>
                          {row.note ? `${t(language, 'Note', 'Maelezo')}: ${row.note}` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <details className="mt-3 rounded-2xl border border-blue-100 bg-white p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-700">
                    {t(language, 'Bank commission breakdown', 'Mchanganuo wa kamisheni za benki')}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {(record.bankCommissions || []).map((row) => (
                      <div key={row.bankName} className="grid gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs md:grid-cols-4">
                        <div className="font-semibold text-slate-700">{row.bankName}</div>

                        <div>
                          {t(language, 'Amount', 'Kiasi')}: TZS {currency(row.amount)}
                        </div>

                        <div>
                          {row.notReceived
                            ? t(language, 'Not received yet', 'Haijapokelewa bado')
                            : `${t(language, 'Received date', 'Tarehe ya kupokea')}: ${row.receivedDate || '-'}`}
                        </div>

                        <div>
                          {row.note ? `${t(language, 'Note', 'Maelezo')}: ${row.note}` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                {record.notes ? (
                  <div className="mt-2 text-xs text-slate-500">
                    {t(language, 'Notes', 'Maelezo')}: {record.notes}
                  </div>
                ) : null}
              </div>
            ))}
        </div>
      )}
    </div>
  </CardContent>
</Card>

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
              {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.mobileCapital, entry.mobileCashTotal, getMobileFloatTotal(entry), getMobileCommissionTotal(entry), language)}
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
              {t(language, 'Status', 'Hali')}: {getFloatStatus(entry.bankCapital, entry.bankCashTotal, getBankFloatTotal(entry), getBankCommissionTotal(entry), language)}
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
  let cancelled = false;

  (async () => {
    try {
      const savedSessionUser = readStorage(STORAGE_SESSION_KEY, null);

      let localData = null;

      try {
        localData = await readFromDB(DB_DATA_KEY);
      } catch (dbError) {
        console.error('IndexedDB startup read failed:', dbError);
      }

      const initial = normalizeData(localData || seedData);

      const restoredCurrentUser =
        savedSessionUser || initial.currentUser || null;

      const nextData = {
        ...initial,
        currentUser: restoredCurrentUser,
      };

      if (cancelled) return;

      setData(nextData);

      if (restoredCurrentUser?.role === 'shop') {
        setActiveShopId(
          restoredCurrentUser.shop_id ||
            restoredCurrentUser.shopId ||
            restoredCurrentUser.shopid ||
            null
        );
      } else {
        setActiveShopId(null);
      }

      setIsOnline(navigator.onLine);

      if (navigator.onLine) {
        setSyncMessage('POS opened from saved local data');
      } else {
        setSyncMessage('You are offline - using saved local data');
      }
    } catch (error) {
      console.error('Local POS startup failed:', error);

      const savedSessionUser = readStorage(STORAGE_SESSION_KEY, null);

      if (!cancelled) {
        setData({
          ...normalizeData(seedData),
          currentUser: savedSessionUser || null,
        });

        if (savedSessionUser?.role === 'shop') {
          setActiveShopId(
            savedSessionUser.shop_id ||
              savedSessionUser.shopId ||
              savedSessionUser.shopid ||
              null
          );
        } else {
          setActiveShopId(null);
        }
      }
    } finally {
      if (!cancelled) {
        setHasLoadedInitialData(true);
        setIsHydrating(false);
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  debugSyncQueue();

  let refreshTimer = null;
  let isRefreshingConfirmedSales = false;

  const loadConfirmedDashboardDataFromSupabase = async () => {
    const savedSessionUser = readStorage(STORAGE_SESSION_KEY, null);

    const isOwnerUser = String(savedSessionUser?.role || '') === 'owner';

    const shopId = isOwnerUser
      ? ''
      : String(
          activeShopId ||
            savedSessionUser?.shop_id ||
            savedSessionUser?.shopId ||
            savedSessionUser?.shopid ||
            ''
        ).trim();

    if (!isOwnerUser && !shopId) {
      throw new Error('Cannot refresh confirmed sales because shop id is missing.');
    }

    let salesQuery = supabase
      .from('sales')
      .select('*')
      .gte('date', daysAgoISO(30))
      .order('created_at', { ascending: false });

    if (!isOwnerUser) {
      salesQuery = salesQuery.eq('shop_id', shopId);
    }

    const { data: cloudSales, error: salesError } = await salesQuery;

    if (salesError) throw salesError;

    if (!Array.isArray(cloudSales)) {
      throw new Error('Supabase sales response was not a valid list.');
    }

    let productsQuery = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isOwnerUser) {
      productsQuery = productsQuery.eq('shop_id', shopId);
    }

    const { data: cloudProducts, error: productsError } = await productsQuery;

    if (productsError) throw productsError;

    if (!Array.isArray(cloudProducts)) {
      throw new Error('Supabase products response was not a valid list.');
    }

    return {
      shopId,
      isOwnerUser,
      sales: cloudSales.map((sale) => ({
        ...sale,
        confirmed: true,
      })),
      products: cloudProducts.map((p) =>
        normalizeProduct({
          id: p.id,
          name: p.name,
          buyPrice: Number(p.buyingprice || p.buyPrice || 0),
          sellPrice: Number(p.sellingprice || p.sellPrice || 0),
          stockBaseQty: Number(p.stock || p.stockBaseQty || p.stockQty || 0),
          stockQty: Number(p.stock || p.stockBaseQty || p.stockQty || 0),
          shop_id: String(p.shop_id || p.shopid || shopId || '').trim(),
          baseUnit: p.baseunit || p.baseUnit || 'pc',
          minStockLevel: Number(p.minstocklevel || p.minStockLevel || 5),
          expiryDate: p.expirydate || p.expiryDate || '',
          qrCode: p.qrcode || p.qrCode || '',
          subUnitsRaw: p.subunitsraw || p.subUnitsRaw || '',
          archived: Boolean(p.archived),
          createdAt: p.createdAt || p.created_at || new Date().toISOString(),
          updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
        })
      ),
    };
  };

  const syncAndReloadConfirmedSales = async (message = 'Checking sync...') => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setSyncMessage('You are offline');
      return;
    }

    if (isRefreshingConfirmedSales) return;

    isRefreshingConfirmedSales = true;

    try {
      setIsOnline(true);
      setSyncMessage(message);

      await processSyncQueue();

      const pendingQueueItems = readSyncQueue().filter((item) => item?.synced === false);
      const failedQueueItems = pendingQueueItems.filter((item) => item?.status === 'failed');

      if (pendingQueueItems.length) {
        const failedExpenses = failedQueueItems.filter((item) => item?.actionType === 'expense_created').length;
        const pendingExpenses = pendingQueueItems.filter((item) => item?.actionType === 'expense_created').length;

        if (failedExpenses > 0) {
          setSyncMessage(
            `Sync pending: ${failedExpenses} expense record(s) failed to reach Supabase. The system will keep retrying.`
          );
        } else if (pendingExpenses > 0) {
          setSyncMessage(
            `Sync pending: ${pendingExpenses} expense record(s) not yet confirmed in Supabase.`
          );
        } else {
          setSyncMessage(
            `Sync pending: ${pendingQueueItems.length} record(s) not yet confirmed in Supabase.`
          );
        }

        return;
      }

      const confirmedResult = await loadConfirmedDashboardDataFromSupabase();

      setData((prev) => {
        const previousSales = Array.isArray(prev.sales) ? prev.sales : [];

        const nextSales = confirmedResult.isOwnerUser
          ? confirmedResult.sales
          : [
              ...previousSales.filter(
                (sale) =>
                  String(sale.shop_id || sale.shopId || sale.shopid || '') !==
                  String(confirmedResult.shopId)
              ),
              ...confirmedResult.sales,
            ];

        const previousProducts = Array.isArray(prev.products) ? prev.products : [];
        const confirmedProducts = Array.isArray(confirmedResult.products)
          ? confirmedResult.products
          : [];

        const currentShopId = String(confirmedResult.shopId || '').trim();

        const previousShopProducts = previousProducts.filter(
          (product) =>
            String(product.shop_id || product.shopId || product.shopid || '') ===
            String(currentShopId)
        );

        let nextProducts = previousProducts;

        if (confirmedResult.isOwnerUser) {
          if (confirmedProducts.length > 0) {
            nextProducts = confirmedProducts;
          } else if (previousProducts.length > 0) {
            console.warn(
              'Supabase returned zero owner products. Keeping existing local products to avoid product disappearance.'
            );
            setSyncMessage(
              'Products refresh returned empty list - keeping saved local products.'
            );
            nextProducts = previousProducts;
          }
        } else if (confirmedProducts.length > 0) {
          nextProducts = [
            ...previousProducts.filter(
              (product) =>
                String(product.shop_id || product.shopId || product.shopid || '') !==
                String(currentShopId)
            ),
            ...confirmedProducts,
          ];
        } else if (previousShopProducts.length > 0) {
          console.warn(
            'Supabase returned zero products for this shop. Keeping existing local products.',
            currentShopId
          );
          setSyncMessage(
            'Products refresh returned empty list - keeping saved local products.'
          );
          nextProducts = previousProducts;
        } else {
          console.warn(
            'No products found locally or from Supabase for this shop.',
            currentShopId
          );
          nextProducts = previousProducts;
        }

        const nextData = {
          ...prev,
          sales: nextSales,
          products: nextProducts,
        };

        writeToDB(DB_DATA_KEY, nextData).catch((dbError) => {
          console.error('Failed to save confirmed dashboard data to IndexedDB:', dbError);
        });

        return nextData;
      });

      writeStorage(STORAGE_LAST_SYNC_KEY, Date.now());
      setSyncMessage('Sync complete');
    } catch (error) {
      console.error('Confirmed sales refresh failed:', error);
      setSyncMessage('Confirmed sales refresh failed - keeping current dashboard');
    } finally {
      isRefreshingConfirmedSales = false;
    }
  };

  const goOnline = async () => {
    await syncAndReloadConfirmedSales('Back online - syncing.');
  };

  const goOffline = () => {
    setIsOnline(false);
    setSyncMessage('You are offline');
  };

  window.addEventListener('online', goOnline);
  window.addEventListener('offline', goOffline);

  setIsOnline(navigator.onLine);

  if (navigator.onLine) {
    syncAndReloadConfirmedSales('Checking sync...');
  }

  refreshTimer = window.setInterval(() => {
    if (navigator.onLine) {
      syncAndReloadConfirmedSales('Refreshing confirmed sales...');
    }
  }, 15000);

  return () => {
    window.removeEventListener('online', goOnline);
    window.removeEventListener('offline', goOffline);

    if (refreshTimer) {
      window.clearInterval(refreshTimer);
    }
  };
}, [activeShopId]);

useEffect(() => {
  if (!activeShopId) return;

  const loadProductsForShop = async () => {
    if (!navigator.onLine) {
      return;
    }

        try {
      console.log('PRODUCT LOAD CHECK', {
        activeShopId,
        savedSessionUser: readStorage(STORAGE_SESSION_KEY, null),
      });

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', activeShopId);

      if (error) throw error;

      setData((prev) => {
        const existingProducts = Array.isArray(prev.products) ? prev.products : [];

        if (!Array.isArray(products) || products.length === 0) {
          const alreadyHadShopProducts = existingProducts.some(
            (item) =>
              String(item?.shop_id || item?.shopId || item?.shopid || '') ===
              String(activeShopId)
          );

          if (alreadyHadShopProducts) {
            console.warn(
              'No products returned from Supabase. Keeping existing local products for shop:',
              activeShopId
            );

            const protectedData = {
              ...prev,
              products: existingProducts,
            };

            writeToDB(DB_DATA_KEY, protectedData).catch((dbError) => {
              console.error('Failed to preserve local products in IndexedDB:', dbError);
            });

            setSyncMessage(
              'Products refresh returned empty list - keeping saved local products.'
            );

            return protectedData;
          }

          console.warn('No products returned from Supabase for shop:', activeShopId);

          const protectedData = {
            ...prev,
            products: existingProducts,
          };

          writeToDB(DB_DATA_KEY, protectedData).catch((dbError) => {
            console.error('Failed to preserve empty-product fallback in IndexedDB:', dbError);
          });

          return protectedData;
        }

        const pendingSaleProductIds = new Set(
          (readSyncQueue() || [])
            .filter(
              (item) =>
                item?.actionType === 'sale_created' &&
                item?.synced === false &&
                String(item?.payload?.shop_id || '') === String(activeShopId)
            )
            .flatMap((item) =>
              Array.isArray(item?.payload?.products) ? item.payload.products : []
            )
            .map((p) => String(p?.id || ''))
            .filter(Boolean)
        );

        const existingProductById = new Map(
          existingProducts.map((p) => [String(p?.id || ''), normalizeProduct(p)])
        );

        const nextProducts = products.map((p) => {
          const cloudProduct = normalizeProduct({
            id: p.id,
            name: p.name,
            buyPrice: Number(p.buyingprice || p.buyPrice || 0),
            sellPrice: Number(p.sellingprice || p.sellPrice || 0),
            stockBaseQty: Number(p.stock || p.stockBaseQty || p.stockQty || 0),
            stockQty: Number(p.stock || p.stockBaseQty || p.stockQty || 0),
            shop_id: p.shop_id || p.shopid || '',
            baseUnit: p.baseunit || p.baseUnit || 'pc',
            minStockLevel: Number(p.minstocklevel || p.minStockLevel || 5),
            expiryDate: p.expirydate || p.expiryDate || '',
            qrCode: p.qrcode || p.qrCode || '',
            subUnitsRaw: p.subunitsraw || p.subUnitsRaw || '',
            archived: Boolean(p.archived),
            createdAt: p.createdAt || (p.created_at ? String(p.created_at).slice(0, 10) : ''),
            confirmed: true,
          });

          const localProduct = existingProductById.get(String(cloudProduct.id));

          if (pendingSaleProductIds.has(String(cloudProduct.id)) && localProduct) {
            return normalizeProduct({
              ...cloudProduct,
              stockBaseQty: Number(localProduct.stockBaseQty || 0),
              stockQty: Number(localProduct.stockBaseQty || 0),
              confirmed: false,
            });
          }

          return cloudProduct;
        });

        const keepOtherShops = (items = []) =>
          items.filter(
            (item) =>
              String(item?.shop_id || item?.shopId || item?.shopid || '') !==
              String(activeShopId)
          );

        const nextData = {
          ...prev,
          products: [...keepOtherShops(existingProducts), ...nextProducts],
        };

        saveData(nextData);

        return nextData;
      });
    } catch (error) {
      console.error('Product refresh failed; keeping local products:', error);
    }
  };

  loadProductsForShop();

  const productsChannel = supabase
    .channel(`products-changes-${activeShopId}`)
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

        setData((prev) => {
          const nextSales = (sales || []).map((s) => ({
            ...s,
            shop_id: s.shop_id || s.shopid || '',
            date: s.created_at ? todayISO(new Date(s.created_at)) : (s.date || todayISO()),
          }));

          const keepOtherShops = (items = []) =>
            items.filter(
              (item) =>
                String(item?.shop_id || item?.shopId || item?.shopid || '') !== String(activeShopId)
            );

          return {
            ...prev,
            sales: [...keepOtherShops(prev.sales), ...nextSales],
          };
        });
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

  
  const saveData = async (next) => {
  const normalized = normalizeData(next);

  try {
    // rotate old backups
    for (let i = BACKUP_KEYS.length - 1; i > 0; i--) {
      const prev = readStorage(BACKUP_KEYS[i - 1], null);
      if (prev) {
        writeStorage(BACKUP_KEYS[i], prev);
      }
    }

    // save current metadata snapshot as newest backup
    const currentMeta = readStorage(STORAGE_META_KEY, null);
    if (currentMeta) {
      writeStorage(BACKUP_KEYS[0], currentMeta);
    }
  } catch (err) {
    console.warn('Backup rotation failed', err);
  }

  setData(normalized);

  // keep only metadata in localStorage
  writeStorage(STORAGE_META_KEY, {
    lastSavedAt: Date.now(),
    version: "v2",
  });

  // IMPORTANT: wait for IndexedDB write to finish
  try {
    await writeToDB(DB_DATA_KEY, normalized);
  } catch (err) {
    console.error('IndexedDB save failed:', err);
  }
};
const exportBackup = async () => {
  try {
    const dbData = await readFromDB(DB_DATA_KEY);

    if (!dbData) {
      alert('No backup data found.');
      return;
    }

    const payload = {
      version: APP_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: normalizeData(dbData),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafikiai-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export backup failed:', error);
    alert('Backup export failed.');
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
  const sessionUser = {
    ...user,
    auth_user_id: user.auth_user_id || null,
  };

  writeStorage(STORAGE_SESSION_KEY, sessionUser);

  const shopId =
    user.role === 'shop'
      ? user.shop_id || user.shopId || user.shopid || null
      : null;

  setActiveShopId(shopId);

  let loaded;

  try {
    loaded = await readData({ preferFresh: navigator.onLine });
  } catch (error) {
    console.error('Login data loading failed. Falling back to local saved data:', error);
    loaded = await readData({ preferFresh: false });
  }

  let products = Array.isArray(loaded.products) ? loaded.products : [];

  if (shopId && navigator.onLine) {
    try {
      const { data: freshProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId);

      if (error) {
        console.error('Fresh product loading failed during login:', error);
      } else if (Array.isArray(freshProducts) && freshProducts.length > 0) {
        products = freshProducts.map((p) =>
          normalizeProduct({
            id: p.id,
            name: p.name,
            buyPrice: Number(p.buyingprice || p.buyPrice || 0),
            sellPrice: Number(p.sellingprice || p.sellPrice || 0),
            stockBaseQty: Number(p.stock || p.stockBaseQty || p.stockQty || 0),
            stockQty: Number(p.stock || p.stockBaseQty || p.stockQty || 0),
            shop_id: String(p.shop_id || p.shopid || shopId || '').trim(),
            baseUnit: p.baseunit || p.baseUnit || 'pc',
            minStockLevel: Number(p.minstocklevel || p.minStockLevel || 5),
            expiryDate: p.expirydate || p.expiryDate || '',
            qrCode: p.qrcode || p.qrCode || '',
            subUnitsRaw: p.subunitsraw || p.subUnitsRaw || '',
            archived: Boolean(p.archived),
            createdAt: p.createdAt || (p.created_at ? String(p.created_at).slice(0, 10) : ''),
            confirmed: true,
          })
        );
      } else {
        console.warn('No fresh products returned during login. Keeping loaded/local products.');
      }
    } catch (error) {
      console.error('Fresh product loading crashed during login:', error);
    }
  }

  const strictProducts = shopId
    ? products.filter(
        (p) =>
          String(p?.shop_id || p?.shopId || p?.shopid || '').trim() === String(shopId).trim()
      )
    : products;

  setData((prev) => ({
    ...loaded,
    users: loaded.users?.length ? loaded.users : seedData.users,
    products: strictProducts.map((p) => {
      const existing = (prev.products || []).find((x) => String(x.id) === String(p.id));

      return existing?.archived
        ? { ...normalizeProduct(p), archived: true }
        : normalizeProduct(p);
    }),
    expenses: loaded.expenses || prev.expenses || [],
    currentUser: sessionUser,
  }));
};

const openShopDashboard = async (shopId) => {
  setActiveShopId(shopId);

  const [
    { data: products },
    { data: sales },
    { data: expenses },
    { data: purchases },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('shop_id', shopId),
    supabase.from('sales').select('*').eq('shop_id', shopId),
    supabase.from('expenses').select('*').eq('shop_id', shopId),
    supabase.from('purchases').select('*').eq('shop_id', shopId),
  ]);

  setData((prev) => {
  const nextProducts = (products || []).map((p) => ({
    id: p.id,
    name: p.name,
    buyPrice: Number(p.buyingprice || 0),
    sellPrice: Number(p.sellingprice || 0),
    stockBaseQty: Number(p.stock || 0),
    stockQty: Number(p.stock || 0),
    shop_id: String(p.shop_id || p.shopid || '').trim(),
    baseUnit: p.baseunit || 'pc',
    minStockLevel: Number(p.minStockLevel || 5),
    expiryDate: p.expiryDate || p.expirydate || '',
    qrCode: p.qrCode || '',
    subUnitsRaw: p.subUnitsRaw || '',
    archived: Boolean(p.archived),
    createdAt: p.createdAt || (p.created_at ? String(p.created_at).slice(0, 10) : ''),
    confirmed: true,
  }));

  const nextSales = (sales || []).map((s) => ({
    ...s,
    shop_id: String(s.shop_id || '').trim(),
    date: s.created_at ? todayISO(new Date(s.created_at)) : (s.date || todayISO()),
  }));

  const nextExpenses = (expenses || []).map((e) => ({
    id: e.id || '',
    shop_id: String(e.shop_id || '').trim(),
    title: e.title || e.description || '',
    description: e.description || e.title || '',
    amount: Number(e.amount || 0),
    category: e.category || '',
    date: e.date || (e.created_at ? String(e.created_at).slice(0, 10) : todayISO()),
    notes: e.notes || '',
    created_at: e.created_at || '',
  }));

  const nextPurchases = (purchases || []).map((p) => ({
    ...p,
    shop_id: String(p.shop_id || '').trim(),
    date: p.date || (p.created_at ? String(p.created_at).slice(0, 10) : todayISO()),
  }));

  const keepOtherShops = (items = []) =>
  items.filter(
    (item) =>
      String(item?.shop_id || item?.shopId || item?.shopid || '') !== String(shopId)
  );

return {
  ...prev,
  products: [...keepOtherShops(prev.products), ...nextProducts],
  sales: [...keepOtherShops(prev.sales), ...nextSales],
  expenses: [...keepOtherShops(prev.expenses), ...nextExpenses],
  purchases: [...keepOtherShops(prev.purchases), ...nextPurchases],
};
});
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

<div className="mx-4">
  <CEODecisionCentre data={data} language={language} />
</div>
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
