import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import { GasBusinessSection, GasDashboardCard, GasReportBlock, buildGasRecord, getGasDashboardSummary } from './GasBusinessSection';
import RentalPropertySection from './RentalPropertySection';
import CEODecisionCentre from './CEODecisionCentre';
import HomeExpensesCentre from './homeExpenses/HomeExpensesCentre';
import DailyRemittanceCentre, {
  calculateShop,
  getLiveRemittanceShopPosition,
  AUTOMATIC_EXPENSE_PILOT_START_DATE,
} from './remittance/DailyRemittanceCentre';
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
const STORAGE_CART_DRAFTS_KEY = 'rafikiai_cart_drafts_v1';
const STORAGE_LAST_ACTIVITY_KEY = 'rafikiai_last_activity_v1';
const STORAGE_LOCK_ON_RETURN_KEY = 'rafikiai_lock_on_return_v1';
const POS_DATA_CHANNEL_NAME =
  'rafikiai_pos_data_changes_v1';

const POS_TAB_INSTANCE_ID =
  `pos-tab-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const POS_AUTO_LOCK_MINUTES = 15;

function notifyOtherPosTabs() {
  if (
    typeof BroadcastChannel ===
    'undefined'
  ) {
    return;
  }

  const channel =
    new BroadcastChannel(
      POS_DATA_CHANNEL_NAME
    );

  channel.postMessage({
    type: 'app_data_updated',
    sourceTabId:
      POS_TAB_INSTANCE_ID,
    at: Date.now(),
  });

  channel.close();
}
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
const GAS_TYPES = ['Taifa / Mihan Gas', 'Oryx Gas', 'O Gas', 'Other'];
const GAS_CYLINDER_SIZES = ['Small Cylinder', 'Big Cylinder'];
const GAS_PRICE_BOOK = {
  'Taifa / Mihan Gas': {
    smallBuy: 23500,
    smallSell: 26000,
    bigBuy: 55000,
    bigSell: 60000,
  },
  'Oryx Gas': {
    smallBuy: 24500,
    smallSell: 27000,
    bigBuy: 56000,
    bigSell: 62000,
  },
  'O Gas': {
    smallBuy: 24500,
    smallSell: 27000,
    bigBuy: 56000,
    bigSell: 62000,
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
const salesTargetAnimationStyle = `
@keyframes salesTargetMove {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
`;
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

function readCartDrafts() {
  return readStorage(STORAGE_CART_DRAFTS_KEY, {});
}

function getCartDraft(shopId) {
  const drafts = readCartDrafts();
  return drafts[String(shopId || '')] || null;
}

function saveCartDraft(shopId, cart) {
  const selectedShopId = String(shopId || '').trim();
  if (!selectedShopId) return;

  const drafts = readCartDrafts();
  const safeCart = Array.isArray(cart) ? cart : [];

  if (!safeCart.length) {
    delete drafts[selectedShopId];
  } else {
    drafts[selectedShopId] = {
      shopId: selectedShopId,
      cart: safeCart,
      savedAt: new Date().toISOString(),
    };
  }

  writeStorage(STORAGE_CART_DRAFTS_KEY, drafts);
}

function clearCartDraft(shopId) {
  const selectedShopId = String(shopId || '').trim();
  if (!selectedShopId) return;

  const drafts = readCartDrafts();
  delete drafts[selectedShopId];
  writeStorage(STORAGE_CART_DRAFTS_KEY, drafts);
}

function updateLastActivityTime() {
  writeStorage(STORAGE_LAST_ACTIVITY_KEY, Date.now());
}

function getLastActivityTime() {
  return Number(readStorage(STORAGE_LAST_ACTIVITY_KEY, Date.now()) || Date.now());
}

function shouldAutoLockPos() {
  const lastActivity = getLastActivityTime();
  const now = Date.now();
  const lockAfterMs = POS_AUTO_LOCK_MINUTES * 60 * 1000;

  return now - lastActivity > lockAfterMs;
}

function markLockOnReturn() {
  writeStorage(STORAGE_LOCK_ON_RETURN_KEY, true);
}

function clearLockOnReturn() {
  writeStorage(STORAGE_LOCK_ON_RETURN_KEY, false);
}

function shouldLockOnReturn() {
  return Boolean(readStorage(STORAGE_LOCK_ON_RETURN_KEY, false));
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

  const payloadId = String(
    payload?.id || ''
  ).trim();

  const payloadShopId = String(
    payload?.shop_id || ''
  ).trim();

  const alreadyExists = queue.some(
    (item) => {
      const itemPayloadId = String(
        item?.payload?.id || ''
      ).trim();

      const itemShopId = String(
        item?.payload?.shop_id || ''
      ).trim();

      return (
        item?.actionType === actionType &&
        itemPayloadId === payloadId &&
        itemShopId === payloadShopId &&
        item?.synced === false
      );
    }
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

function mergeProcessedSyncQueueResults(
  originalQueue,
  processedQueue
) {
  const safeOriginalQueue =
    Array.isArray(originalQueue)
      ? originalQueue
      : [];

  const safeProcessedQueue =
    Array.isArray(processedQueue)
      ? processedQueue
      : [];

  const latestQueue = readSyncQueue();

  const originalById = new Map(
    safeOriginalQueue
      .filter((item) =>
        String(item?.id || '').trim()
      )
      .map((item) => [
        String(item.id).trim(),
        item,
      ])
  );

  const processedById = new Map(
    safeProcessedQueue
      .filter((item) =>
        String(item?.id || '').trim()
      )
      .map((item) => [
        String(item.id).trim(),
        item,
      ])
  );

  const changedFieldsById = new Map();

  processedById.forEach(
    (processedItem, queueId) => {
      const originalItem =
        originalById.get(queueId);

      if (!originalItem) {
        return;
      }

      const changedFields = {};

      const allKeys = new Set([
        ...Object.keys(originalItem),
        ...Object.keys(processedItem),
      ]);

      allKeys.forEach((key) => {
        if (
          JSON.stringify(
            originalItem?.[key]
          ) !==
          JSON.stringify(
            processedItem?.[key]
          )
        ) {
          changedFields[key] =
            processedItem?.[key];
        }
      });

      if (
        Object.keys(changedFields)
          .length > 0
      ) {
        changedFieldsById.set(
          queueId,
          changedFields
        );
      }
    }
  );

  const latestQueueIds = new Set(
    latestQueue
      .map((item) =>
        String(item?.id || '').trim()
      )
      .filter(Boolean)
  );

  const mergedQueue = latestQueue.map(
    (latestItem) => {
      const queueId = String(
        latestItem?.id || ''
      ).trim();

      const changedFields =
        changedFieldsById.get(queueId);

      if (!changedFields) {
        return latestItem;
      }

      return {
        ...latestItem,
        ...changedFields,
      };
    }
  );

  changedFieldsById.forEach(
    (_changedFields, queueId) => {
      if (latestQueueIds.has(queueId)) {
        return;
      }

      const processedItem =
        processedById.get(queueId);

      if (
        processedItem &&
        processedItem.synced === false
      ) {
        mergedQueue.push(processedItem);
      }
    }
  );

  writeSyncQueue(mergedQueue);

  return mergedQueue;
}

function wakeFailedSaleRetriesForProducts(
  productIds = [],
  shopId = ''
) {
  const cleanShopId = String(
    shopId || ''
  ).trim();

  const targetProductIds = new Set(
    (Array.isArray(productIds)
      ? productIds
      : []
    )
      .map((productId) =>
        String(productId || '').trim()
      )
      .filter(Boolean)
  );

  if (
    !cleanShopId ||
    targetProductIds.size === 0
  ) {
    return false;
  }

  const queue = readSyncQueue();

  let changed = false;

  const nextQueue = queue.map((item) => {
    if (
      item?.actionType !== 'sale_created' ||
      item?.synced !== false ||
      item?.status !== 'failed' ||
      String(
        item?.payload?.shop_id || ''
      ).trim() !== cleanShopId
    ) {
      return item;
    }

    const saleItems = Array.isArray(
      item?.payload?.items
    )
      ? item.payload.items
      : [];

    const containsCorrectedProduct =
      saleItems.some((saleItem) =>
        targetProductIds.has(
          String(
            saleItem?.productId || ''
          ).trim()
        )
      );

    if (!containsCorrectedProduct) {
      return item;
    }

    changed = true;

    return {
      ...item,
      lastAttemptAt: 0,
    };
  });

  if (changed) {
    writeSyncQueue(nextQueue);
  }

  return changed;
}

async function repairSaleQueueFromJournal(
  journalRecord
) {
  const saleId = String(
    journalRecord?.id || ''
  ).trim();

  const shopId = String(
    journalRecord?.shop_id || ''
  ).trim();

  if (!saleId || !shopId) {
    return false;
  }

  if (activeSyncQueuePromise) {
    try {
      await activeSyncQueuePromise;
    } catch {
      // Continue with repair after the
      // previous sync attempt has finished.
    }
  }

  const exactJournalPayload = {
    id: saleId,
    shop_id: shopId,
    items: Array.isArray(
      journalRecord?.items
    )
      ? journalRecord.items
      : [],
    total: Number(
      journalRecord?.total || 0
    ),
    type:
      journalRecord?.type || 'cash',
    date:
      journalRecord?.date ||
      todayISO(),
    created_at:
      journalRecord?.created_at ||
      new Date().toISOString(),
  };

  const currentQueue = readSyncQueue();

  let foundSaleQueueItem = false;

  const repairedQueue =
    currentQueue.map((item) => {
      const isTargetSale =
        item?.actionType ===
          'sale_created' &&
        item?.synced === false &&
        String(
          item?.payload?.id || ''
        ).trim() === saleId &&
        String(
          item?.payload?.shop_id || ''
        ).trim() === shopId;

      if (!isTargetSale) {
        return item;
      }

      foundSaleQueueItem = true;

      return {
        ...item,
        payload: exactJournalPayload,
        synced: false,
        status: 'pending',
        attempts: 0,
        lastAttemptAt: 0,
        lastError: '',
        repairedFromJournalAt:
          Date.now(),
      };
    });

  if (!foundSaleQueueItem) {
    repairedQueue.push({
      id: `sync-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      actionType: 'sale_created',
      payload: exactJournalPayload,
      createdAt: Date.now(),
      synced: false,
      status: 'pending',
      attempts: 0,
      lastAttemptAt: 0,
      lastError: '',
      repairedFromJournalAt:
        Date.now(),
    });
  }

  writeSyncQueue(repairedQueue);

  return true;
}

let activeSyncQueuePromise = null;

async function processSyncQueue() {
  if (activeSyncQueuePromise) {
    return activeSyncQueuePromise;
  }

  activeSyncQueuePromise =
    runSyncQueue();

  try {
    return await activeSyncQueuePromise;
  } finally {
    activeSyncQueuePromise = null;
  }
}

async function runSyncQueue() {
  const queue = readSyncQueue();

  if (!queue.length) return false;

  const updatedQueue = [
  ...queue.filter(
    (item) =>
      item?.actionType === 'purchase_created'
  ),
  ...queue.filter(
    (item) =>
      item?.actionType === 'sale_created'
  ),
  ...queue.filter(
    (item) =>
      item?.actionType !== 'purchase_created' &&
      item?.actionType !== 'sale_created'
  ),
];

let syncedSomething = false;

  for (let i = 0; i < updatedQueue.length; i += 1) {
    const item = updatedQueue[i];

    if (item.synced) continue;

const attemptCount = Number(
  item.attempts || 0
);

const lastAttemptAt = Number(
  item.lastAttemptAt || 0
);

const retryDelayMs = Math.min(
  5 * 60 * 1000,
  15 *
    1000 *
    2 **
      Math.min(
        Math.max(
          attemptCount - 1,
          0
        ),
        5
      )
);

if (
  attemptCount > 0 &&
  lastAttemptAt > 0 &&
  Date.now() - lastAttemptAt <
    retryDelayMs
) {
  continue;
}

try {

      if (item.actionType === 'sale_created') {
        const salePayload = item.payload || {};

        const {
          data: saleResult,
          error: saleQueueError,
        } = await supabase.rpc('record_pos_sale', {
          p_sale_id: String(
            salePayload.id || ''
          ),
          p_shop_id: String(
            salePayload.shop_id || ''
          ),
          p_items: Array.isArray(
            salePayload.items
          )
            ? salePayload.items
            : [],
          p_total: Number(
            salePayload.total || 0
          ),
          p_type:
            salePayload.type || 'cash',
          p_sale_date:
            salePayload.date || todayISO(),
          p_created_at:
            salePayload.created_at ||
            new Date().toISOString(),
        });

        if (saleQueueError) {
          throw saleQueueError;
        }

        if (
          !saleResult ||
          String(saleResult.saleId || '') !==
            String(salePayload.id || '')
        ) {
          throw new Error(
            'Supabase did not confirm the correct sale ID.'
          );
        }

        const expectedSaleId = String(
          salePayload.id || ''
        ).trim();

        const expectedShopId = String(
          salePayload.shop_id || ''
        ).trim();

        const {
          data: savedSupabaseSale,
          error: savedSaleVerificationError,
        } = await supabase
          .from('sales')
          .select(
            'id, shop_id, items, total, type, date, created_at, status, stock_status, stock_issues, confirmed_at'
          )
          .eq('id', expectedSaleId)
          .eq('shop_id', expectedShopId)
          .maybeSingle();

        if (savedSaleVerificationError) {
          throw savedSaleVerificationError;
        }

        if (!savedSupabaseSale) {
          throw new Error(
            'Supabase responded, but the exact sale was not found inside the correct shop.'
          );
        }

        const canonicalizeSaleValue = (value) => {
          if (Array.isArray(value)) {
            return value.map(
              canonicalizeSaleValue
            );
          }

          if (
            value &&
            typeof value === 'object'
          ) {
            return Object.keys(value)
              .sort()
              .reduce((result, key) => {
                result[key] =
                  canonicalizeSaleValue(
                    value[key]
                  );

                return result;
              }, {});
          }

          return value;
        };

        const expectedSaleCopy = {
          id: expectedSaleId,
          shop_id: expectedShopId,
          items: canonicalizeSaleValue(
            Array.isArray(salePayload.items)
              ? salePayload.items
              : []
          ),
          total: Number(
            salePayload.total || 0
          ),
          type:
            salePayload.type || 'cash',
          date:
            salePayload.date || todayISO(),
          created_at: new Date(
            salePayload.created_at
          ).getTime(),
        };

        const savedSaleCopy = {
          id: String(
            savedSupabaseSale.id || ''
          ).trim(),
          shop_id: String(
            savedSupabaseSale.shop_id || ''
          ).trim(),
          items: canonicalizeSaleValue(
            Array.isArray(
              savedSupabaseSale.items
            )
              ? savedSupabaseSale.items
              : []
          ),
          total: Number(
            savedSupabaseSale.total || 0
          ),
          type:
            savedSupabaseSale.type ||
            'cash',
          date:
            savedSupabaseSale.date || '',
          created_at: new Date(
            savedSupabaseSale.created_at
          ).getTime(),
        };

        if (
          JSON.stringify(expectedSaleCopy) !==
          JSON.stringify(savedSaleCopy)
        ) {
          throw new Error(
            'The Supabase sale does not exactly match the cashier Journal. The Journal copy remains protected and synchronization will retry.'
          );
        }

        try {
          const journalRecord =
            await readSalesJournalRecord(
              salePayload.id
            );

          if (journalRecord) {
            const supabaseSaleStatus =
              String(
                savedSupabaseSale?.status ||
                  saleResult?.status ||
                  'confirmed'
              )
                .trim()
                .toLowerCase();

            const supabaseStockStatus =
              String(
                savedSupabaseSale?.stock_status ||
                  saleResult?.stock_status ||
                  saleResult?.stockStatus ||
                  'applied'
              )
                .trim()
                .toLowerCase();

            const stockIssues =
              savedSupabaseSale?.stock_issues ??
              saleResult?.stock_issues ??
              saleResult?.stockIssues ??
              [];

            const saleWasAccepted =
              supabaseSaleStatus ===
                'confirmed' &&
              (
                supabaseStockStatus ===
                  'applied' ||
                supabaseStockStatus ===
                  'review'
              );

            if (!saleWasAccepted) {
              throw new Error(
                `Supabase saved the transaction but has not confirmed it yet. Sale status: ${supabaseSaleStatus}; stock status: ${supabaseStockStatus}.`
              );
            }

            const confirmedAt =
              savedSupabaseSale?.confirmed_at ||
              saleResult?.confirmed_at ||
              saleResult?.confirmedAt ||
              new Date().toISOString();

            await writeSalesJournalRecord({
              ...journalRecord,
              status: 'confirmed',
              integrityStatus: 'ok',
              supabaseStatus:
                supabaseSaleStatus,
              stockStatus:
                supabaseStockStatus,
              stockIssues,
              confirmedAt,
              updatedAt: confirmedAt,
            });

            window.dispatchEvent(
              new CustomEvent(
                'sales-journal-updated',
                {
                  detail: {
                    saleId: String(
                      salePayload.id || ''
                    ),
                    shopId: String(
                      salePayload.shop_id || ''
                    ),
                  },
                }
              )
            );
          }
        } catch (journalUpdateError) {
          console.error(
            'Supabase confirmed sale but Journal status update failed:',
            journalUpdateError
          );
        }

} else if (item.actionType === 'purchase_created') {
  const queuedPurchase = item.payload || {};

  const targetProduct = Array.isArray(
    queuedPurchase.products
  )
    ? queuedPurchase.products.find(
        (product) =>
          String(product.id) ===
          String(queuedPurchase.productId)
      )
    : null;

  const { error: queuedPurchaseError } =
    await supabase.rpc('record_existing_purchases', {
      p_shop_id: String(queuedPurchase.shop_id || ''),
      p_rows: [
        {
          purchaseId: queuedPurchase.id,
          productId: queuedPurchase.productId,
          quantity: Number(queuedPurchase.quantity || 0),
          unitCost: Number(queuedPurchase.unitCost || 0),
          sellingPrice: Number(
            targetProduct?.sellingprice ??
              targetProduct?.sellPrice ??
              0
          ),
          date:
            queuedPurchase.date ||
            todayISO(),
          expiryDate:
            queuedPurchase.expiryDate ||
            queuedPurchase.expirydate ||
            '',
          notes: queuedPurchase.notes || '',
        },
      ],
    });

  if (queuedPurchaseError) {
    throw queuedPurchaseError;
  }

} else if (item.actionType === 'product_saved') {
  const isLegacySaleProduct =
    String(item?.id || '').startsWith(
      'sync-product-'
    );

  const currentProductShopId =
    String(
      item?.payload?.shop_id || ''
    ).trim();

  const productQueueItems =
    isLegacySaleProduct
      ? updatedQueue.filter(
          (queueItem) =>
            queueItem?.actionType ===
              'product_saved' &&
            queueItem?.synced === false &&
            String(
              queueItem?.id || ''
            ).startsWith(
              'sync-product-'
            ) &&
            String(
              queueItem?.payload
                ?.shop_id || ''
            ).trim() ===
              currentProductShopId
        )
      : [item];

  const productRowsById = new Map();

  productQueueItems.forEach(
    (queueItem) => {
      const productPayload =
        queueItem?.payload || {};

      const productRow = {
        id: productPayload.id,
        name: String(
          productPayload.name || ''
        ).trim(),
        standard_product_code:
          String(
            productPayload
              .standard_product_code ||
              productPayload
                .standardProductCode ||
              ''
          ).trim(),
        buyingprice: Number(
          productPayload.buyingprice ??
            productPayload.buyPrice ??
            0
        ),
        sellingprice: Number(
          productPayload.sellingprice ??
            productPayload.sellPrice ??
            0
        ),
        stock: Number(
          productPayload.stock ??
            productPayload
              .stockBaseQty ??
            0
        ),
        shop_id:
          productPayload.shop_id,
        baseunit:
          productPayload.baseunit ||
          productPayload.baseUnit ||
          'pc',
        minstocklevel: Number(
          productPayload.minstocklevel ??
            productPayload
              .minStockLevel ??
            5
        ),
        expirydate:
          productPayload.expirydate ||
          productPayload.expiryDate ||
          null,
        qrcode:
          productPayload.qrcode ||
          productPayload.qrCode ||
          '',
        subunitsraw:
          productPayload.subunitsraw ||
          productPayload
            .subUnitsRaw ||
          '',
        archived: Boolean(
          productPayload.archived
        ),
        created_at:
          productPayload.created_at ||
          new Date().toISOString(),
      };

      if (
        !productRow.id ||
        !productRow.shop_id ||
        !productRow.name
      ) {
        throw new Error(
          'Product sync skipped because id, shop_id, or name is missing.'
        );
      }

      productRowsById.set(
        String(productRow.id),
        productRow
      );
    }
  );

  const productRows = Array.from(
    productRowsById.values()
  );

  const { error: productQueueError } =
    await supabase
      .from('products')
      .upsert(productRows, {
        onConflict: 'id',
      });

 if (productQueueError) {
  if (isLegacySaleProduct) {
    const failedAt = Date.now();

    const failedQueueIds = new Set(
      productQueueItems.map(
        (queueItem) => queueItem.id
      )
    );

    for (
      let failedIndex = 0;
      failedIndex <
      updatedQueue.length;
      failedIndex += 1
    ) {
      const failedQueueItem =
        updatedQueue[failedIndex];

      if (
        failedQueueIds.has(
          failedQueueItem?.id
        )
      ) {
        updatedQueue[failedIndex] = {
          ...failedQueueItem,
          synced: false,
          status: 'failed',
          attempts:
            Number(
              failedQueueItem
                ?.attempts || 0
            ) + 1,
          lastAttemptAt: failedAt,
          lastError:
            productQueueError
              ?.message ||
            String(
              productQueueError
            ),
        };
      }
    }

    continue;
  }

  throw productQueueError;
}

  if (isLegacySaleProduct) {
    const completedQueueIds = new Set(
      productQueueItems.map(
        (queueItem) => queueItem.id
      )
    );

    for (
      let productIndex = 0;
      productIndex <
      updatedQueue.length;
      productIndex += 1
    ) {
      if (
        completedQueueIds.has(
          updatedQueue[productIndex]?.id
        )
      ) {
        updatedQueue[productIndex] = {
          ...updatedQueue[productIndex],
          synced: true,
          syncedAt: Date.now(),
        };
      }
    }
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

      } else if (item.actionType === 'central_fund_transaction_created') {
        const payload = item.payload || {};

        const row = {
          id: payload.id,
          transaction_type:
            payload.transactionType ||
            payload.transaction_type ||
            '',
          transaction_date:
            payload.transactionDate ||
            payload.transaction_date ||
            todayISO(),

          shop_id: String(payload.shop_id || '').trim(),
          shop_name: payload.shopName || payload.shop_name || '',

          expense_key:
            payload.expenseKey ||
            payload.expense_key ||
            '',
          expense_name:
            payload.expenseName ||
            payload.expense_name ||
            '',

          source_fund_type:
            payload.sourceFundType ||
            payload.source_fund_type ||
            '',
          source_fund_key:
            payload.sourceFundKey ||
            payload.source_fund_key ||
            '',
          source_fund_name:
            payload.sourceFundName ||
            payload.source_fund_name ||
            '',

          destination_fund_type:
            payload.destinationFundType ||
            payload.destination_fund_type ||
            '',
          destination_fund_key:
            payload.destinationFundKey ||
            payload.destination_fund_key ||
            '',
          destination_fund_name:
            payload.destinationFundName ||
            payload.destination_fund_name ||
            '',

          amount: Number(payload.amount || 0),

          payee: payload.payee || '',
          purpose: payload.purpose || '',
          payment_method:
            payload.paymentMethod ||
            payload.payment_method ||
            '',
          payment_reference:
            payload.paymentReference ||
            payload.payment_reference ||
            '',
          notes: payload.notes || '',
          status: payload.status || 'confirmed',

          recorded_by_user_id:
            payload.recordedByUserId ||
            payload.recorded_by_user_id ||
            '',
          recorded_by_name:
            payload.recordedByName ||
            payload.recorded_by_name ||
            '',
          recorded_by_role:
            payload.recordedByRole ||
            payload.recorded_by_role ||
            '',

          created_at:
            payload.created_at || new Date().toISOString(),
          updated_at:
            payload.updated_at || new Date().toISOString(),
        };

        await supabase
          .from('centralFundTransactions')
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
  mergeProcessedSyncQueueResults(
    queue,
    updatedQueue
  );

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
async function writeToDBUnlocked(
  key,
  value
) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      DB_STORE,
      'readwrite'
    );

    const store =
      transaction.objectStore(DB_STORE);

    const request = store.put(
      value,
      key
    );

    request.onsuccess = () =>
      resolve(true);

    request.onerror = () =>
      reject(request.error);
  });
}

async function writeToDB(key, value) {
  if (key !== DB_DATA_KEY) {
    return writeToDBUnlocked(
      key,
      value
    );
  }

  const writeProtectedAppData =
    async () => {
      let protectedValue = value;

      try {
        const latestStoredData =
          await readFromDB(
            DB_DATA_KEY
          );

        const storedPendingSales =
          Array.isArray(
            latestStoredData?.sales
          )
            ? latestStoredData.sales.filter(
                (sale) =>
                  sale?.confirmed === false
              )
            : [];

        const incomingSales =
          Array.isArray(value?.sales)
            ? value.sales
            : [];

        protectedValue = {
          ...value,
          sales: mergeRowsById(
            storedPendingSales,
            incomingSales
          ),
        };
      } catch (mergeError) {
        console.error(
          'Cross-tab sales protection read failed:',
          mergeError
        );
      }

      const writeResult =
        await writeToDBUnlocked(
          key,
          protectedValue
        );

      notifyOtherPosTabs();

      return writeResult;
    };

  if (
    navigator?.locks?.request
  ) {
    return navigator.locks.request(
      'rafikiai-pos-app-data-write',
      writeProtectedAppData
    );
  }

  return writeProtectedAppData();
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
const SALES_JOURNAL_DB_NAME =
  'rafikiai_sales_journal_db';
const SALES_JOURNAL_DB_VERSION = 1;
const SALES_JOURNAL_STORE = 'sales_journal';

function openSalesJournalDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      SALES_JOURNAL_DB_NAME,
      SALES_JOURNAL_DB_VERSION
    );

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (
        !db.objectStoreNames.contains(
          SALES_JOURNAL_STORE
        )
      ) {
        db.createObjectStore(
          SALES_JOURNAL_STORE,
          {
            keyPath: 'id',
          }
        );
      }
    };

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });
}

async function writeSalesJournalRecord(record) {
  const saleId = String(
    record?.id || ''
  ).trim();

  if (!saleId) {
    throw new Error(
      'Sales journal record requires a sale ID.'
    );
  }

  const db =
    await openSalesJournalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SALES_JOURNAL_STORE,
      'readwrite'
    );

    const store = transaction.objectStore(
      SALES_JOURNAL_STORE
    );

    store.put({
      ...record,
      id: saleId,
    });

    transaction.oncomplete = () => {
      db.close();
      resolve(true);
    };

    transaction.onerror = () => {
      const error =
        transaction.error ||
        new Error(
          'Sales journal write failed.'
        );

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ||
        new Error(
          'Sales journal write was aborted.'
        );

      db.close();
      reject(error);
    };
  });
}

async function readSalesJournalRecords() {
  const db =
    await openSalesJournalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SALES_JOURNAL_STORE,
      'readonly'
    );

    const store = transaction.objectStore(
      SALES_JOURNAL_STORE
    );

    const request = store.getAll();

    request.onsuccess = () => {
      const records = Array.isArray(
        request.result
      )
        ? request.result
        : [];

      db.close();
      resolve(records);
    };

    request.onerror = () => {
      const error =
        request.error ||
        new Error(
          'Sales journal read failed.'
        );

      db.close();
      reject(error);
    };
  });
}

async function readSalesJournalRecord(
  saleId
) {
  const cleanSaleId = String(
    saleId || ''
  ).trim();

  if (!cleanSaleId) {
    return null;
  }

  const db =
    await openSalesJournalDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SALES_JOURNAL_STORE,
      'readonly'
    );

    const store = transaction.objectStore(
      SALES_JOURNAL_STORE
    );

    const request = store.get(cleanSaleId);

    request.onsuccess = () => {
      const record =
        request.result || null;

      db.close();
      resolve(record);
    };

    request.onerror = () => {
      const error =
        request.error ||
        new Error(
          'Sales journal record read failed.'
        );

      db.close();
      reject(error);
    };
  });
}

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

const roundStockQty = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
};

const formatQty = (value) => {
  const num = roundStockQty(value, 2);
  return Number.isInteger(num) ? String(num) : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
};

const roundToCashStep = (value, step = 50) => {
  const amount = Number(value || 0);
  if (!amount || amount <= 0) return 0;
  return Math.ceil(amount / step) * step;
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
    sellPrice: roundToCashStep(Number(sellPrice || 0) * qty),
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
function getDailyElectricityExpenseAmount(inputDate = new Date()) {
  const d = new Date(inputDate);
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  return Math.round(15000 / daysInMonth);
}

const dailyElectricityExpense = String(getDailyElectricityExpenseAmount());

const RECURRING_EXPENSES_BY_SHOP = {
  'shop-1': [
    { title: 'Home Expenses', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1500', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1500', category: 'Recurring', notes: '' },
    { title: 'Electricity', amount: dailyElectricityExpense, category: 'Recurring', notes: 'Monthly electricity TZS 15,000 divided by days of the month' },
  ],
  'shop-2': [
    { title: 'Home Expenses', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1500', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1500', category: 'Recurring', notes: '' },
    { title: 'Electricity', amount: dailyElectricityExpense, category: 'Recurring', notes: 'Monthly electricity TZS 15,000 divided by days of the month' },
    { title: 'Fare', amount: '3000', category: 'Recurring', notes: 'Daily fare to and from work' },
  ],
  'shop-3': [
    { title: 'Home Expenses', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'Electricity', amount: dailyElectricityExpense, category: 'Recurring', notes: 'Monthly electricity TZS 15,000 divided by days of the month' },
    { title: 'Fare', amount: '3000', category: 'Recurring', notes: 'Daily fare to and from work' },
  ],
  'shop-4': [
    { title: 'Home Expenses', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'Electricity', amount: dailyElectricityExpense, category: 'Recurring', notes: 'Monthly electricity TZS 15,000 divided by days of the month' },
    { title: 'Fare', amount: '3000', category: 'Recurring', notes: 'Daily fare to and from work' },
  ],
  'shop-5': [
    { title: 'Home Expenses', amount: '10000', category: 'Recurring', notes: '' },
    { title: 'Salaries', amount: '5000', category: 'Recurring', notes: '' },
    { title: 'Medical', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'TRA', amount: '1000', category: 'Recurring', notes: '' },
    { title: 'Electricity', amount: dailyElectricityExpense, category: 'Recurring', notes: 'Monthly electricity TZS 15,000 divided by days of the month' },
    { title: 'Fare', amount: '3000', category: 'Recurring', notes: 'Daily fare to and from work' },
  ],
};
const emptyGasForm = {
  id: '',
  date: todayISO(),
  gasType: 'Taifa / Mihan Gas',
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

  completeSmallCylinderSoldToday: '',
  completeBigCylinderSoldToday: '',
  completeSmallCylinderBuyPrice: '',
  completeSmallCylinderSellPrice: '',
  completeBigCylinderBuyPrice: '',
  completeBigCylinderSellPrice: '',

  gasBurnerSoldToday: '',
  gasBurnerBuyPrice: '',
  gasBurnerSellPrice: '',

  mafigaSoldToday: '',
  mafigaBuyPrice: '',
  mafigaSellPrice: '',
};
const emptyGasSaleRow = {
  id: '',
  gasType: 'Taifa / Mihan Gas',
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
  monthlySalesTargets: [],
  gasEntries: [],
  houses: [],
  meters: [],
waterMeters: [],
waterBills: [],
waterPayments: [],
waterPaymentAllocations: [],
waterSupplierBills: [],
waterFundExpenses: [],
serviceCharges: [],
rentPayments: [],
rentalTenants: [],
propertyOccupancies: [],
rentalTenancies: [],
rentInvoices: [],
rentalPayments: [],
rentPaymentAllocations: [],
rentalExpenses: [],
rentRecordCorrections: [],
rentSmsReminders: [],
rentSmsAttempts: [],
  centralFundTransactions: [],
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
    monthlySalesTargets: Array.isArray(parsed.monthlySalesTargets)
  ? parsed.monthlySalesTargets
  : [],
dailyRemittances: Array.isArray(parsed.dailyRemittances)
  ? parsed.dailyRemittances
  : [],
remittanceExpenseFunds: Array.isArray(parsed.remittanceExpenseFunds)
  ? parsed.remittanceExpenseFunds
  : [],
remittanceFundAllocations: Array.isArray(parsed.remittanceFundAllocations)
  ? parsed.remittanceFundAllocations
  : [],
gasEntries: Array.isArray(parsed.gasEntries) ? parsed.gasEntries : [],
    houses: Array.isArray(parsed.houses) ? parsed.houses : [],
   meters: Array.isArray(parsed.meters) ? parsed.meters : [],
waterMeters: Array.isArray(parsed.waterMeters)
  ? parsed.waterMeters
  : [],
waterBills: Array.isArray(parsed.waterBills)
  ? parsed.waterBills
  : [],
waterPayments: Array.isArray(parsed.waterPayments)
  ? parsed.waterPayments
  : [],
waterPaymentAllocations: Array.isArray(parsed.waterPaymentAllocations)
  ? parsed.waterPaymentAllocations
  : [],
waterSupplierBills: Array.isArray(parsed.waterSupplierBills)
  ? parsed.waterSupplierBills
  : [],
waterFundExpenses: Array.isArray(parsed.waterFundExpenses)
  ? parsed.waterFundExpenses
  : [],
serviceCharges: Array.isArray(parsed.serviceCharges)
  ? parsed.serviceCharges
  : [],
rentPayments: Array.isArray(parsed.rentPayments)
  ? parsed.rentPayments
  : [],
rentalTenants: Array.isArray(parsed.rentalTenants)
  ? parsed.rentalTenants
  : [],
propertyOccupancies: Array.isArray(parsed.propertyOccupancies)
  ? parsed.propertyOccupancies
  : [],
rentalTenancies: Array.isArray(parsed.rentalTenancies)
  ? parsed.rentalTenancies
  : [],
rentInvoices: Array.isArray(parsed.rentInvoices)
  ? parsed.rentInvoices
  : [],
rentalPayments: Array.isArray(parsed.rentalPayments)
  ? parsed.rentalPayments
  : [],
rentPaymentAllocations: Array.isArray(parsed.rentPaymentAllocations)
  ? parsed.rentPaymentAllocations
  : [],
rentalExpenses: Array.isArray(parsed.rentalExpenses)
  ? parsed.rentalExpenses
  : [],
rentRecordCorrections: Array.isArray(parsed.rentRecordCorrections)
  ? parsed.rentRecordCorrections
  : [],
rentSmsReminders: Array.isArray(parsed.rentSmsReminders)
  ? parsed.rentSmsReminders
  : [],
rentSmsAttempts: Array.isArray(parsed.rentSmsAttempts)
  ? parsed.rentSmsAttempts
  : [],

    centralFundTransactions: Array.isArray(
      parsed.centralFundTransactions
    )
      ? parsed.centralFundTransactions
      : [],
  };
}

function buildShopOnlyData(data, shopId) {
  const selectedShopId = String(shopId || '').trim();

  if (!selectedShopId) {
    return normalizeData(data || seedData);
  }

  const sameShop = (item) =>
    String(item?.shop_id || item?.shopId || item?.shopid || '') === selectedShopId;

  return normalizeData({
    ...data,
    shops: (data.shops || []).filter((shop) => String(shop.id) === selectedShopId),
    products: (data.products || []).filter(sameShop),
    sales: (data.sales || []).filter(sameShop),
    expenses: (data.expenses || []).filter(sameShop),
    purchases: (data.purchases || []).filter(sameShop),
    creditSales: (data.creditSales || []).filter(sameShop),
    changeLedger: (data.changeLedger || []).filter(sameShop),
    mobileMoneyEntries: (data.mobileMoneyEntries || []).filter(sameShop),
    monthlyWakalaCommissions: (data.monthlyWakalaCommissions || []).filter(sameShop),
    monthlySalesTargets: (data.monthlySalesTargets || []).filter(sameShop),
    dailyRemittances: (data.dailyRemittances || []).filter(sameShop),
    remittanceExpenseFunds: (data.remittanceExpenseFunds || []).filter(sameShop),
    remittanceFundAllocations: (data.remittanceFundAllocations || []).filter(sameShop),
    gasEntries: (data.gasEntries || []).filter(sameShop),
    houses: (data.houses || []).filter(sameShop),
    meters: (data.meters || []).filter(sameShop),
waterMeters: (data.waterMeters || []).filter(sameShop),
waterBills: (data.waterBills || []).filter(sameShop),
waterPayments: (data.waterPayments || []).filter(sameShop),
waterPaymentAllocations: (
  data.waterPaymentAllocations || []
).filter(sameShop),
waterSupplierBills: (
  data.waterSupplierBills || []
).filter(sameShop),
waterFundExpenses: (
  data.waterFundExpenses || []
).filter(sameShop),
serviceCharges: (data.serviceCharges || []).filter(sameShop),
rentPayments: (data.rentPayments || []).filter(sameShop),
rentalTenants: (data.rentalTenants || []).filter(sameShop),
propertyOccupancies: (data.propertyOccupancies || []).filter(sameShop),
rentalTenancies: (data.rentalTenancies || []).filter(sameShop),
rentInvoices: (data.rentInvoices || []).filter(sameShop),
rentalPayments: (data.rentalPayments || []).filter(sameShop),
rentPaymentAllocations: (data.rentPaymentAllocations || []).filter(sameShop),
rentalExpenses: (data.rentalExpenses || []).filter(sameShop),
rentRecordCorrections: (data.rentRecordCorrections || []).filter(sameShop),
rentSmsReminders: (data.rentSmsReminders || []).filter(sameShop),
rentSmsAttempts: (data.rentSmsAttempts || []).filter(sameShop),
  });
}

async function readData({ preferFresh = true, salesMode = 'today' } = {}) {
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
  .order('created_at', { ascending: false });

if (salesMode === 'year') {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  salesQuery = salesQuery.gte('date', todayISO(yearStart));
} else if (salesMode === 'sixMonths') {
  salesQuery = salesQuery.gte('date', daysAgoISO(180));
} else if (salesMode === 'month') {
  salesQuery = salesQuery.gte('date', daysAgoISO(30));
} else {
  salesQuery = salesQuery.eq('date', todayISO());
}
let purchasesQuery = supabase.from('purchases').select('*');
let expensesQuery = supabase.from('expenses').select('*');
let creditQuery = supabase.from('creditSales').select('*');
let changeQuery = supabase.from('changeLedger').select('*');
let mobileMoneyQuery = supabase.from('mobileMoneyEntries').select('*');
let monthlyWakalaCommissionsQuery = supabase.from('monthlyWakalaCommissions').select('*');
let monthlySalesTargetsQuery = supabase.from('monthly_sales_targets').select('*');
let gasQuery = supabase.from('gasEntries').select('*');
let housesQuery = supabase.from('houses').select('*');
let metersQuery = supabase.from('meters').select('*');
let waterMetersQuery = supabase.from('waterMeters').select('*');
let waterBillsQuery = supabase.from('waterBills').select('*');
let waterPaymentsQuery = supabase.from('waterPayments').select('*');
let waterPaymentAllocationsQuery = supabase
  .from('waterPaymentAllocations')
  .select('*');

let waterSupplierBillsQuery = supabase
  .from('waterSupplierBills')
  .select('*');

let waterFundExpensesQuery = supabase
  .from('waterFundExpenses')
  .select('*');

let serviceChargesQuery = supabase.from('servicecharges').select('*');
let rentPaymentsQuery = supabase.from('rentPayments').select('*');
let rentalTenantsQuery = supabase.from('rentalTenants').select('*');
let propertyOccupanciesQuery = supabase.from('propertyOccupancies').select('*');
let rentalTenanciesQuery = supabase.from('rentalTenancies').select('*');
let rentInvoicesQuery = supabase.from('rentInvoices').select('*');
let rentalPaymentsQuery = supabase.from('rentalPayments').select('*');
let rentPaymentAllocationsQuery = supabase.from('rentPaymentAllocations').select('*');
let rentalExpensesQuery = supabase.from('rentalExpenses').select('*');
let rentRecordCorrectionsQuery = supabase.from('rentRecordCorrections').select('*');
let rentSmsRemindersQuery = supabase.from('rentSmsReminders').select('*');
let rentSmsAttemptsQuery = supabase.from('rentSmsAttempts').select('*');

let centralFundTransactionsQuery = supabase
  .from('centralFundTransactions')
  .select('*')
  .order('created_at', { ascending: false });

        if (sessionShopId) {
  productsQuery = productsQuery.eq('shop_id', sessionShopId);
  salesQuery = salesQuery.eq('shop_id', sessionShopId);
  purchasesQuery = purchasesQuery.eq('shop_id', sessionShopId);
  expensesQuery = expensesQuery.eq('shop_id', sessionShopId);
  creditQuery = creditQuery.eq('shop_id', sessionShopId);
  changeQuery = changeQuery.eq('shop_id', sessionShopId);
  mobileMoneyQuery = mobileMoneyQuery.eq('shop_id', sessionShopId);
  monthlyWakalaCommissionsQuery = monthlyWakalaCommissionsQuery.eq('shop_id', sessionShopId);
  monthlySalesTargetsQuery = monthlySalesTargetsQuery.eq('shop_id', sessionShopId);
  gasQuery = gasQuery.eq('shop_id', sessionShopId);
  housesQuery = housesQuery.eq('shop_id', sessionShopId);
  metersQuery = metersQuery.eq('shop_id', sessionShopId);
waterMetersQuery = waterMetersQuery.eq('shop_id', sessionShopId);
waterBillsQuery = waterBillsQuery.eq('shop_id', sessionShopId);
waterPaymentsQuery = waterPaymentsQuery.eq('shop_id', sessionShopId);
waterPaymentAllocationsQuery = waterPaymentAllocationsQuery.eq(
  'shop_id',
  sessionShopId
);

waterSupplierBillsQuery = waterSupplierBillsQuery.eq(
  'shop_id',
  sessionShopId
);

waterFundExpensesQuery = waterFundExpensesQuery.eq(
  'shop_id',
  sessionShopId
);

serviceChargesQuery = serviceChargesQuery.eq('shop_id', sessionShopId);
rentPaymentsQuery = rentPaymentsQuery.eq('shop_id', sessionShopId);
rentalTenantsQuery = rentalTenantsQuery.eq('shop_id', sessionShopId);
propertyOccupanciesQuery = propertyOccupanciesQuery.eq('shop_id', sessionShopId);
rentalTenanciesQuery = rentalTenanciesQuery.eq('shop_id', sessionShopId);
rentInvoicesQuery = rentInvoicesQuery.eq('shop_id', sessionShopId);
rentalPaymentsQuery = rentalPaymentsQuery.eq('shop_id', sessionShopId);
rentPaymentAllocationsQuery = rentPaymentAllocationsQuery.eq('shop_id', sessionShopId);
rentalExpensesQuery = rentalExpensesQuery.eq('shop_id', sessionShopId);
rentRecordCorrectionsQuery = rentRecordCorrectionsQuery.eq('shop_id', sessionShopId);
rentSmsRemindersQuery = rentSmsRemindersQuery.eq('shop_id', sessionShopId);
rentSmsAttemptsQuery = rentSmsAttemptsQuery.eq('shop_id', sessionShopId);
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
  { data: cloudMonthlySalesTargets },
  { data: cloudGasEntries },
  { data: cloudHouses },
  { data: cloudMeters },
{ data: cloudWaterMeters },
{ data: cloudWaterBills },
{ data: cloudWaterPayments },
{ data: cloudWaterPaymentAllocations },
{ data: cloudWaterSupplierBills },
{ data: cloudWaterFundExpenses },
{ data: cloudServiceCharges },
{ data: cloudRentPayments },
{ data: cloudRentalTenants },
{ data: cloudPropertyOccupancies },
{ data: cloudRentalTenancies },
{ data: cloudRentInvoices },
{ data: cloudRentalPayments },
{ data: cloudRentPaymentAllocations },
{ data: cloudRentalExpenses },
{ data: cloudRentRecordCorrections },
{ data: cloudRentSmsReminders },
{ data: cloudRentSmsAttempts },
{ data: cloudCentralFundTransactions },
] = await Promise.all([
  productsQuery,
  salesQuery,
  purchasesQuery,
  expensesQuery,
  creditQuery,
  changeQuery,
  mobileMoneyQuery,
  monthlyWakalaCommissionsQuery,
  monthlySalesTargetsQuery,
  gasQuery,
  housesQuery,
  metersQuery,
  waterMetersQuery,
  waterBillsQuery,
  waterPaymentsQuery,
  waterPaymentAllocationsQuery,
  waterSupplierBillsQuery,
  waterFundExpensesQuery,
  serviceChargesQuery,
  rentPaymentsQuery,
  rentalTenantsQuery,
  propertyOccupanciesQuery,
  rentalTenanciesQuery,
  rentInvoicesQuery,
  rentalPaymentsQuery,
  rentPaymentAllocationsQuery,
  rentalExpensesQuery,
  rentRecordCorrectionsQuery,
  rentSmsRemindersQuery,
  rentSmsAttemptsQuery,
  centralFundTransactionsQuery,
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
archived: h?.archived === true,
archived_at: h?.archived_at || '',
archived_by: h?.archived_by || '',
created_at: h?.created_at || '',
  })),
  meters: (cloudMeters || []).map((m) => ({
    id: m?.id || '',
    shop_id: String(m?.shop_id || '').trim(),
    houseNumber: m?.houseNumber || '',
tenantName: m?.tenantName || '',
houseStatus: m?.houseStatus || '',
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
waterMeters: (cloudWaterMeters || []).map((meter) => ({
  id: meter?.id || '',
  shop_id: String(meter?.shop_id || '').trim(),
  houseNumber: meter?.houseNumber || '',
  meterNumber: meter?.meterNumber || '',
  meterType: meter?.meterType || 'Water',
  costPerUnit: Number(meter?.costPerUnit || 4000),
  openingReading: Number(meter?.openingReading || 0),
  lastReading: Number(meter?.lastReading || 0),
  lastReadingDate: meter?.lastReadingDate || '',
  nextReadingDate: meter?.nextReadingDate || '',
  active: meter?.active !== false,
baselineConfirmed: meter?.baselineConfirmed === true,
notes: meter?.notes || '',
  created_at: meter?.created_at || '',
  updated_at: meter?.updated_at || '',
})),
waterBills: (cloudWaterBills || []).map((bill) => ({
  id: bill?.id || '',
  shop_id: String(bill?.shop_id || '').trim(),
  meterId: bill?.meterId || '',
  houseNumber: bill?.houseNumber || '',
  tenantName: bill?.tenantName || '',
  houseStatus: bill?.houseStatus || '',
  meterNumber: bill?.meterNumber || '',
  billingPeriodStart: bill?.billingPeriodStart || '',
  billingPeriodEnd: bill?.billingPeriodEnd || '',
  readingDate: bill?.readingDate || '',
  previousUnits: Number(bill?.previousUnits || 0),
  currentUnits: Number(bill?.currentUnits || 0),
  unitsUsed: Number(bill?.unitsUsed || 0),
  costPerUnit: Number(bill?.costPerUnit || 4000),
  discount: Number(bill?.discount || 0),
  currentBillAmount: Number(bill?.currentBillAmount || 0),
  previousBalance: Number(bill?.previousBalance || 0),
  totalPayable: Number(bill?.totalPayable || 0),
  amountPaid: Number(bill?.amountPaid || 0),
  balance: Number(bill?.balance || 0),
  status: bill?.status || 'Unpaid',
  dueDate: bill?.dueDate || '',
  nextReadingDate: bill?.nextReadingDate || '',
  notes: bill?.notes || '',
  created_at: bill?.created_at || '',
  updated_at: bill?.updated_at || '',
})),
waterPayments: (cloudWaterPayments || []).map((payment) => ({
  id: payment?.id || '',
  shop_id: String(payment?.shop_id || '').trim(),
meterId: payment?.meterId || '',
houseNumber: payment?.houseNumber || '',
  tenantName: payment?.tenantName || '',
  meterNumber: payment?.meterNumber || '',
  amountReceived: Number(payment?.amountReceived || 0),
unappliedAmount: Number(payment?.unappliedAmount || 0),
paymentDate: payment?.paymentDate || '',
  paidAt: payment?.paidAt || '',
  notes: payment?.notes || '',
 created_at: payment?.created_at || '',
})),
waterPaymentAllocations: (
  cloudWaterPaymentAllocations || []
).map((allocation) => ({
  id: allocation?.id || '',
  shop_id: String(allocation?.shop_id || '').trim(),
  paymentId: allocation?.paymentId || '',
  billId: allocation?.billId || '',
  allocatedAmount: Number(allocation?.allocatedAmount || 0),
  billBalanceBefore: Number(allocation?.billBalanceBefore || 0),
  billBalanceAfter: Number(allocation?.billBalanceAfter || 0),
  allocationOrder: Number(allocation?.allocationOrder || 1),
  created_at: allocation?.created_at || '',
})),

waterSupplierBills: (
  cloudWaterSupplierBills || []
).map((bill) => ({
  id: bill?.id || '',
  shop_id: String(bill?.shop_id || '').trim(),
  supplierName: bill?.supplierName || 'DAWASCO',
billNumber: bill?.billNumber || '',
controlNumber:
  bill?.controlNumber || '991040283845',
billDate: bill?.billDate || '',
  dueDate: bill?.dueDate || '',
  billingPeriodStart: bill?.billingPeriodStart || '',
  billingPeriodEnd: bill?.billingPeriodEnd || '',
  billAmount: Number(bill?.billAmount || 0),
  status: bill?.status || 'Active',
  notes: bill?.notes || '',
  created_at: bill?.created_at || '',
  updated_at: bill?.updated_at || '',
})),

waterFundExpenses: (
  cloudWaterFundExpenses || []
).map((expense) => ({
  id: expense?.id || '',
  shop_id: String(expense?.shop_id || '').trim(),
  supplierBillId: expense?.supplierBillId || '',
  expenseType: expense?.expenseType || 'Other',
  expenseDate: expense?.expenseDate || '',
  amount: Number(expense?.amount || 0),
  payee: expense?.payee || '',
 referenceNumber: expense?.referenceNumber || '',
status: expense?.status || 'Active',
correctedFromId: expense?.correctedFromId || '',
notes: expense?.notes || '',
  created_at: expense?.created_at || '',
  updated_at: expense?.updated_at || '',
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
  rentPayments: (cloudRentPayments || []).map((p) => ({
    id: p?.id || '',
    shop_id: String(p?.shop_id || '').trim(),
    houseId: p?.houseId || '',
    houseNumber: p?.houseNumber || '',
    tenantName: p?.tenantName || '',
    rentPaidDate: p?.rentPaidDate || '',
    rentStartDate: p?.rentStartDate || '',
    rentEndDate: p?.rentEndDate || '',
    monthlyRentAmount: Number(p?.monthlyRentAmount || 0),
    amountPaid: Number(p?.amountPaid || 0),
    rentDurationMonths: Number(p?.rentDurationMonths || 0),
    paymentType: p?.paymentType || 'Full',
    nextPaymentDate: p?.nextPaymentDate || '',
    balance: Number(p?.balance || 0),
    source: p?.source || '',
    created_at: p?.created_at || '',
  })),

  rentalTenants: (cloudRentalTenants || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    fullName: row?.fullName || '',
    phoneNumber: row?.phoneNumber || '',
    smsConsent: row?.smsConsent !== false,
    active: row?.active !== false,
  })),

  propertyOccupancies: (cloudPropertyOccupancies || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    houseId: row?.houseId || '',
    tenantId: row?.tenantId || '',
    occupantName: row?.occupantName || '',
    occupancyType: row?.occupancyType || 'Vacant',
    startDate: row?.startDate || '',
    endDate: row?.endDate || '',
    active: row?.active !== false,
  })),

  rentalTenancies: (cloudRentalTenancies || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    houseId: row?.houseId || '',
    tenantId: row?.tenantId || '',
    occupancyId: row?.occupancyId || '',
    startDate: row?.startDate || '',
    endDate: row?.endDate || '',
    monthlyRentAmount: Number(row?.monthlyRentAmount || 0),
    paidThroughDate: row?.paidThroughDate || '',
    nextPaymentDate: row?.nextPaymentDate || '',
    status: row?.status || 'Active',
    smsRemindersEnabled: row?.smsRemindersEnabled !== false,
  })),

  rentInvoices: (cloudRentInvoices || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    tenancyId: row?.tenancyId || '',
    houseId: row?.houseId || '',
    tenantId: row?.tenantId || '',
    periodStart: row?.periodStart || '',
    periodEnd: row?.periodEnd || '',
    issueDate: row?.issueDate || '',
    dueDate: row?.dueDate || '',
    monthsCovered: Number(row?.monthsCovered || 0),
    invoiceAmount: Number(row?.invoiceAmount || 0),
    amountPaid: Number(row?.amountPaid || 0),
    balance: Number(row?.balance || 0),
    status: row?.status || 'Unpaid',
    invoiceNumber: row?.invoiceNumber || '',
  })),

  rentalPayments: (cloudRentalPayments || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    tenancyId: row?.tenancyId || '',
    houseId: row?.houseId || '',
    tenantId: row?.tenantId || '',
    paymentDate: row?.paymentDate || '',
    amountReceived: Number(row?.amountReceived || 0),
    allocatedAmount: Number(row?.allocatedAmount || 0),
    creditAmount: Number(row?.creditAmount || 0),
    receiptNumber: row?.receiptNumber || '',
    paymentMethod: row?.paymentMethod || 'Cash',
    status: row?.status || 'Active',
  })),

  rentPaymentAllocations: (cloudRentPaymentAllocations || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    paymentId: row?.paymentId || '',
    invoiceId: row?.invoiceId || '',
    amount: Number(row?.amount || 0),
    status: row?.status || 'Active',
  })),

  rentalExpenses: (cloudRentalExpenses || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    houseId: row?.houseId || '',
    expenseDate: row?.expenseDate || '',
    expenseType: row?.expenseType || '',
    amount: Number(row?.amount || 0),
    status: row?.status || 'Active',
  })),

  rentRecordCorrections: (cloudRentRecordCorrections || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    recordType: row?.recordType || '',
    recordId: row?.recordId || '',
    actionType: row?.actionType || '',
  })),

  rentSmsReminders: (cloudRentSmsReminders || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    tenancyId: row?.tenancyId || '',
    tenantId: row?.tenantId || '',
    houseId: row?.houseId || '',
    phoneNumber: row?.phoneNumber || '',
    dueDate: row?.dueDate || '',
    reminderStage: row?.reminderStage || '',
    scheduledDate: row?.scheduledDate || '',
    message: row?.message || '',
    status: row?.status || 'Pending',
    preferredChannel: row?.preferredChannel || 'SMSGate',
  })),

  rentSmsAttempts: (cloudRentSmsAttempts || []).map((row) => ({
    ...row,
    shop_id: String(row?.shop_id || '').trim(),
    reminderId: row?.reminderId || '',
    channel: row?.channel || 'SMSGate',
    status: row?.status || 'Processing',
  })),

  centralFundTransactions: (
    cloudCentralFundTransactions || []
  ).map((row) => ({
    id: row?.id || '',
    transactionType: row?.transaction_type || '',
    transactionDate: row?.transaction_date || '',

    shop_id: String(row?.shop_id || '').trim(),
    shopName: row?.shop_name || '',

    expenseKey: row?.expense_key || '',
    expenseName: row?.expense_name || '',

    sourceFundType: row?.source_fund_type || '',
    sourceFundKey: row?.source_fund_key || '',
    sourceFundName: row?.source_fund_name || '',
    sourceShopId: String(row?.source_shop_id || '').trim(),
    sourceShopName: row?.source_shop_name || '',

    destinationFundType:
      row?.destination_fund_type || '',
    destinationFundKey:
      row?.destination_fund_key || '',
    destinationFundName:
      row?.destination_fund_name || '',
    destinationShopId: String(
      row?.destination_shop_id || ''
    ).trim(),
    destinationShopName:
      row?.destination_shop_name || '',

    amount: Number(row?.amount || 0),

    payee: row?.payee || '',
    purpose: row?.purpose || '',
    paymentMethod: row?.payment_method || '',
    paymentReference:
      row?.payment_reference || '',
    notes: row?.notes || '',

    status: row?.status || 'confirmed',

    borrowingDueDate:
      row?.borrowing_due_date || '',
    borrowingStatus:
      row?.borrowing_status || '',
    borrowedAmount: Number(
      row?.borrowed_amount || 0
    ),
    repaidAmount: Number(
      row?.repaid_amount || 0
    ),

    relatedTransactionId:
      row?.related_transaction_id || '',
    reversalOfTransactionId:
      row?.reversal_of_transaction_id || '',

    recordedByUserId:
      row?.recorded_by_user_id || '',
    recordedByName:
      row?.recorded_by_name || '',
    recordedByRole:
      row?.recorded_by_role || '',

    created_at: row?.created_at || '',
    updated_at: row?.updated_at || '',
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
      monthlySalesTargets: (cloudMonthlySalesTargets || []).map(normalizeMonthlySalesTarget),
      gasEntries: cloudGasEntries || [],
    });

        if (isOwnerUser) {
          await writeToDB(
            DB_DATA_KEY,
            normalized
          );
        }

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
  rentPayments: raw.rentPayments || [],
  rentalTenants: raw.rentalTenants || [],
  propertyOccupancies: raw.propertyOccupancies || [],
  rentalTenancies: raw.rentalTenancies || [],
  rentInvoices: raw.rentInvoices || [],
  rentalPayments: raw.rentalPayments || [],
  rentPaymentAllocations: raw.rentPaymentAllocations || [],
  rentalExpenses: raw.rentalExpenses || [],
  rentRecordCorrections: raw.rentRecordCorrections || [],
  rentSmsReminders: raw.rentSmsReminders || [],
  rentSmsAttempts: raw.rentSmsAttempts || [],
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
function TabsContent({
  value,
  activeValue,
  children,
  keepAlive = false,
}) {
  const isActive = value === activeValue;

  const [hasBeenOpened, setHasBeenOpened] = useState(
    isActive || keepAlive
  );

  useEffect(() => {
    if (isActive && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  }, [isActive, hasBeenOpened]);

  if (!isActive && (!keepAlive || !hasBeenOpened)) {
    return null;
  }

  return (
    <div
      className={isActive ? 'block' : 'hidden'}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
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
const loginWelcomeMessage = '';
const loginRequestInProgress = useRef(false);

const submit = async (e) => {
  e.preventDefault();

  if (loginRequestInProgress.current) return;

  const typedUsername = String(username || '').trim();
  const typedPassword = String(password || '');

  const found = users.find(
    (u) =>
      String(u.username || '').trim().toLowerCase() ===
      typedUsername.toLowerCase()
  );

  if (!found || !found.email) {
    return setError(
      t(
        language,
        'Wrong username or password.',
        'Jina la mtumiaji au nenosiri si sahihi.'
      )
    );
  }

  loginRequestInProgress.current = true;
  setError('');

  try {
    const { data: signInData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: found.email,
        password: typedPassword,
      });

    if (authError) {
  console.error('SUPABASE LOGIN EXACT ERROR:', {
    message: authError.message,
    code: authError.code,
    status: authError.status,
    name: authError.name,
  });

  setError(
    `Supabase: ${authError.message || 'Unknown login error'}${
      authError.code ? ` (${authError.code})` : ''
    }`
  );

  return;
}

    onLogin({
  ...found,
  auth_user_id: signInData?.user?.id || null,
});
  } catch (error) {
    console.error('Supabase login crashed:', error);

    setError(
      t(
        language,
        'Login failed. Please try again.',
        'Kuingia kumeshindikana. Tafadhali jaribu tena.'
      )
    );
  } finally {
    loginRequestInProgress.current = false;
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
                      {loginWelcomeMessage ? (
  <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
    {loginWelcomeMessage}
  </div>
) : null}
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

function getGasEntryProfitTotal(entry) {
  const smallRefillProfit =
    (Number(entry.smallGasSellPrice || 0) - Number(entry.smallGasBuyPrice || 0)) *
    Number(entry.smallGasSoldToday || 0);

  const bigRefillProfit =
    (Number(entry.bigGasSellPrice || 0) - Number(entry.bigGasBuyPrice || 0)) *
    Number(entry.bigGasSoldToday || 0);

  const completeSmallCylinderProfit =
    (Number(entry.completeSmallCylinderSellPrice || 0) - Number(entry.completeSmallCylinderBuyPrice || 0)) *
    Number(entry.completeSmallCylinderSoldToday || 0);

  const completeBigCylinderProfit =
    (Number(entry.completeBigCylinderSellPrice || 0) - Number(entry.completeBigCylinderBuyPrice || 0)) *
    Number(entry.completeBigCylinderSoldToday || 0);

  const gasBurnerProfit =
    (Number(entry.gasBurnerSellPrice || 0) - Number(entry.gasBurnerBuyPrice || 0)) *
    Number(entry.gasBurnerSoldToday || 0);

  const mafigaProfit =
    (Number(entry.mafigaSellPrice || 0) - Number(entry.mafigaBuyPrice || 0)) *
    Number(entry.mafigaSoldToday || 0);

  return (
    smallRefillProfit +
    bigRefillProfit +
    completeSmallCylinderProfit +
    completeBigCylinderProfit +
    gasBurnerProfit +
    mafigaProfit
  );
}
function buildShopDailySalesGoal(data, shopId) {
  const today = startOfDay(new Date());
  const todayIso = todayISO(today);
  const todayDay = today.getDay();

  const shopSales = (data.sales || []).filter(
    (sale) => String(sale.shop_id || sale.shopId || '') === String(shopId)
  );

  const yesterdayIso = todayISO(addDays(today, -1));

const todaySales = shopSales
  .filter((sale) => String(sale.date || sale.created_at || '').slice(0, 10) === todayIso)
  .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

const yesterdaySales = shopSales
  .filter((sale) => String(sale.date || sale.created_at || '').slice(0, 10) === yesterdayIso)
  .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const salesByDate = shopSales.reduce((acc, sale) => {
    const dateValue = String(sale.date || sale.created_at || '').slice(0, 10);
    if (!dateValue || dateValue === todayIso) return acc;

    acc[dateValue] = (acc[dateValue] || 0) + Number(sale.total || 0);
    return acc;
  }, {});

  const sameWeekdayValues = Object.entries(salesByDate)
    .filter(([dateValue]) => {
      const d = startOfDay(dateValue);
      return !Number.isNaN(d.getTime()) && d.getDay() === todayDay;
    })
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([, value]) => value)
    .filter((value) => value > 0)
    .slice(-4);

  const recentActiveValues = Object.entries(salesByDate)
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([, value]) => value)
    .filter((value) => value > 0)
    .slice(-7);

  const salesDateEntries = Object.entries(salesByDate)
    .filter(([, value]) => Number(value || 0) > 0)
    .sort(([a], [b]) => String(a).localeCompare(String(b)));

  const averageOf = (values) => {
    const safeValues = values.filter((value) => Number(value || 0) > 0);
    if (!safeValues.length) return 0;
    return safeValues.reduce((sum, value) => sum + Number(value || 0), 0) / safeValues.length;
  };

  const valuesFromLastDays = (days) => {
    const startDate = todayISO(addDays(today, -Number(days || 0) + 1));

    return salesDateEntries
      .filter(([dateValue]) => String(dateValue) >= startDate && String(dateValue) < todayIso)
      .map(([, value]) => Number(value || 0))
      .filter((value) => value > 0);
  };

  const sameWeekdayAverage = averageOf(sameWeekdayValues);
  const recentActiveAverage = averageOf(recentActiveValues);
  const last30Average = averageOf(valuesFromLastDays(30));
  const last90Average = averageOf(valuesFromLastDays(90));
  const last180Average = averageOf(valuesFromLastDays(180));

  const targetSources = [
    { value: sameWeekdayAverage, weight: 40 },
    { value: recentActiveAverage, weight: 25 },
    { value: last30Average, weight: 20 },
    { value: last90Average || last180Average, weight: 15 },
  ].filter((item) => item.value > 0);

  if (!targetSources.length) {
    return {
  hasGoal: false,
  goal: 0,
  actual: todaySales,
  yesterdaySales,
  progress: 0,
  remainingAmount: 0,
  remainingPercent: 100,
};
  }

  const weightedTotal = targetSources.reduce((sum, item) => sum + item.value * item.weight, 0);
  const weightTotal = targetSources.reduce((sum, item) => sum + item.weight, 0);
  const baseTarget = weightTotal > 0 ? weightedTotal / weightTotal : 0;
  const goal = Math.round(baseTarget * 1.05);
  const progress = goal > 0 ? (todaySales / goal) * 100 : 0;
  const cappedProgress = Math.min(100, progress);
  const exceededAmount = Math.max(0, todaySales - goal);
  const exceededPercent = Math.max(0, progress - 100);

  return {
  hasGoal: true,
  goal,
  actual: todaySales,
  yesterdaySales,
  progress,
  cappedProgress,
  exceededAmount,
  exceededPercent,
  remainingAmount: Math.max(0, goal - todaySales),
  remainingPercent: Math.max(0, 100 - progress),
};
}

function buildShopMonthlySalesTarget(data, shopId, ownerPeriod = 'month') {
  const today = startOfDay(new Date());
  const targetMonth = getOwnerTargetMonth(ownerPeriod);
  const [targetYear, targetMonthNumber] = targetMonth.split('-').map(Number);

  const year = targetYear || today.getFullYear();
  const month = targetMonthNumber ? targetMonthNumber - 1 : today.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthStartIso = todayISO(monthStart);
  const calculationEndDate = targetMonth === getCurrentTargetMonth() ? today : monthEnd;
  const todayIso = todayISO(calculationEndDate);

  const daysInMonth = monthEnd.getDate();

  const shopSales = (data.sales || []).filter(
    (sale) => String(sale.shop_id || sale.shopId || '') === String(shopId)
  );

  const monthToDateSales = shopSales
    .filter((sale) => {
      const dateValue = String(sale.date || sale.created_at || '').slice(0, 10);
      return dateValue >= monthStartIso && dateValue <= todayIso;
    })
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const salesByDate = shopSales.reduce((acc, sale) => {
    const dateValue = String(sale.date || sale.created_at || '').slice(0, 10);
    if (!dateValue || dateValue >= monthStartIso) return acc;

    acc[dateValue] = (acc[dateValue] || 0) + Number(sale.total || 0);
    return acc;
  }, {});

  const salesDateEntries = Object.entries(salesByDate)
    .filter(([, value]) => Number(value || 0) > 0)
    .sort(([a], [b]) => String(a).localeCompare(String(b)));

  const averageOf = (values) => {
    const safeValues = values.filter((value) => Number(value || 0) > 0);
    if (!safeValues.length) return 0;
    return safeValues.reduce((sum, value) => sum + Number(value || 0), 0) / safeValues.length;
  };

  const valuesFromLastDaysBeforeMonth = (days) => {
    const startDate = todayISO(addDays(monthStart, -Number(days || 0)));

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
      .slice(-6);

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

  const monthlyGoal = monthDailyTargets.reduce((sum, value) => sum + Number(value || 0), 0);

  if (!monthlyGoal) {
    return {
      hasGoal: false,
      goal: 0,
      actual: monthToDateSales,
      progress: 0,
      remainingAmount: 0,
      exceededAmount: 0,
      rewardAmount: 0,
      monthStart: monthStartIso,
      monthEnd: todayISO(monthEnd),
      daysInMonth,
    };
  }

  const progress = (monthToDateSales / monthlyGoal) * 100;
  const remainingAmount = Math.max(0, monthlyGoal - monthToDateSales);
  const exceededAmount = Math.max(0, monthToDateSales - monthlyGoal);

  const rewardAmount = progress >= 100
    ? Math.round(10000 * (progress / 100))
    : 0;

  return {
    hasGoal: true,
    goal: monthlyGoal,
    actual: monthToDateSales,
    progress,
    cappedProgress: Math.min(100, progress),
    remainingAmount,
    remainingPercent: Math.max(0, 100 - progress),
    exceededAmount,
    exceededPercent: Math.max(0, progress - 100),
    rewardAmount,
    monthStart: monthStartIso,
    monthEnd: todayISO(monthEnd),
    daysInMonth,
  };
}

function getCurrentTargetMonth() {
  const today = startOfDay(new Date());
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}
function getOwnerTargetMonth(ownerPeriod = 'month') {
  const today = startOfDay(new Date());

  if (ownerPeriod === 'lastmonth') {
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  }

  return getCurrentTargetMonth();
}

function normalizeMonthlySalesTarget(row = {}) {
  return {
    id: row.id || `${row.target_month || getCurrentTargetMonth()}-${row.shop_id || ''}`,
    shop_id: String(row.shop_id || row.shopId || '').trim(),
    shopName: row.shop_name || row.shopName || '',
    shop_name: row.shop_name || row.shopName || '',
    targetMonth: row.target_month || row.targetMonth || getCurrentTargetMonth(),
    target_month: row.target_month || row.targetMonth || getCurrentTargetMonth(),
    goal: Number(row.goal || 0),
    actualAtCreation: Number(row.actual_at_creation || row.actualAtCreation || 0),
    actual_at_creation: Number(row.actual_at_creation || row.actualAtCreation || 0),
    growthPercent: Number(row.growth_percent || row.growthPercent || 5),
    growth_percent: Number(row.growth_percent || row.growthPercent || 5),
    source: row.source || 'previous_six_months_plus_5_percent',
    created_by: row.created_by || '',
    created_by_name: row.created_by_name || '',
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
  };
}

function getSavedMonthlySalesTarget(data, shopId, ownerPeriod = 'month') {
  const targetMonth = getOwnerTargetMonth(ownerPeriod);

  return (data.monthlySalesTargets || [])
    .map(normalizeMonthlySalesTarget)
    .find(
      (target) =>
        String(target.shop_id) === String(shopId) &&
        String(target.target_month) === String(targetMonth)
    );
}

function applyFixedMonthlyGoal(dynamicTarget, savedTarget) {
  const goal = Number(savedTarget?.goal || dynamicTarget?.goal || 0);
  const actual = Number(dynamicTarget?.actual || 0);
  const progress = goal > 0 ? (actual / goal) * 100 : 0;

  return {
    ...dynamicTarget,
    hasGoal: goal > 0,
    goal,
    actual,
    progress,
    cappedProgress: Math.min(100, progress),
    remainingAmount: Math.max(0, goal - actual),
    remainingPercent: Math.max(0, 100 - progress),
    exceededAmount: Math.max(0, actual - goal),
    exceededPercent: Math.max(0, progress - 100),
    rewardAmount: progress >= 100 ? Math.round(10000 * (progress / 100)) : 0,
    targetMonth: savedTarget?.target_month || getCurrentTargetMonth(),
    targetSource: savedTarget ? 'fixed_supabase_target' : 'dynamic_fallback',
  };
}

function getFixedShopMonthlySalesTarget(data, shopId, ownerPeriod = 'month') {
  const dynamicTarget = buildShopMonthlySalesTarget(data, shopId, ownerPeriod);
  const savedTarget = getSavedMonthlySalesTarget(data, shopId, ownerPeriod);

  return applyFixedMonthlyGoal(dynamicTarget, savedTarget);
}

function mergeRowsById(existingRows = [], incomingRows = []) {
  const merged = new Map();

  (Array.isArray(existingRows) ? existingRows : []).forEach((row) => {
    const key = String(row?.id || '').trim();
    if (key) merged.set(key, row);
  });

  (Array.isArray(incomingRows) ? incomingRows : []).forEach((row) => {
    const key = String(row?.id || '').trim();
    if (key) {
      merged.set(key, {
        ...(merged.get(key) || {}),
        ...row,
      });
    }
  });

  return Array.from(merged.values());
}

async function fetchShopSalesForTarget(shopId) {
  const targetMonth = getCurrentTargetMonth();
  const monthStart = startOfDay(`${targetMonth}-01`);
  const historyStart = todayISO(addDays(monthStart, -180));
  const today = todayISO();

  const pageSize = 1000;
  let from = 0;
  let allRows = [];
  let keepLoading = true;

  while (keepLoading) {
    const { data: pageRows, error } = await supabase
      .from('sales')
      .select('*')
      .eq('shop_id', shopId)
      .gte('date', historyStart)
      .lte('date', today)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const rows = Array.isArray(pageRows) ? pageRows : [];
    allRows = [...allRows, ...rows];

    keepLoading = rows.length === pageSize;
    from += pageSize;
  }

  return allRows.map((sale) => ({
    ...sale,
    shop_id: String(sale?.shop_id || '').trim(),
    date: sale?.date || (sale?.created_at ? String(sale.created_at).slice(0, 10) : todayISO()),
    confirmed: true,
  }));
}
function OwnerDashboard({
  data,
  setAppData,
  openShop,
  logout,
  exportBackup,
  importBackup,
  ownerPeriod,
  setOwnerPeriod,
  ownerCustomStartDate,
  setOwnerCustomStartDate,
  ownerCustomEndDate,
  setOwnerCustomEndDate,
  language,
  setLanguage,
  dashboardDataReady,
}) {
const ownerDashboardLoadingText = 'Inapakia taarifa...';
const [currentPasswordInput, setCurrentPasswordInput] = useState('');
const [newPasswordInput, setNewPasswordInput] = useState('');
const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
const [passwordMessage, setPasswordMessage] = useState('');
const [ownerSalesSource, setOwnerSalesSource] = useState([]);
const [ownerSalesLoading, setOwnerSalesLoading] = useState(true);

/*
 * Every Owner Dashboard calculation must use only sales
 * that have reached Supabase. Pending local shop sales remain
 * visible inside the individual shop and are identified by
 * the red synchronization warning.
 */
const ownerConfirmedCalculationData = useMemo(
  () => ({
    ...data,
    sales: (Array.isArray(data?.sales) ? data.sales : []).filter(
      (sale) => sale?.confirmed !== false
    ),
  }),
  [data]
);

const ownerConfirmedPeriodReady = true;

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
    const shouldLoadOldOwnerSalesFromSupabase = false;

  useEffect(() => {
    if (!shouldLoadOldOwnerSalesFromSupabase) {
      setOwnerSalesSource([]);
      setOwnerSalesLoading(false);
      return;
    }

    const loadOldOwnerSales = async () => {
      try {
        setOwnerSalesLoading(true);

        let startDate =
  todayISO() >= '2026-08-01'
    ? '2026-08-01'
    : AUTOMATIC_EXPENSE_PILOT_START_DATE;
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

        const pageSize = 1000;
        let from = 0;
        let oldSales = [];
        let keepLoading = true;

        while (keepLoading) {
          const { data: pageRows, error } = await supabase
            .from('sales')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) throw error;

          const rows = Array.isArray(pageRows) ? pageRows : [];
          oldSales = [...oldSales, ...rows];

          keepLoading = rows.length === pageSize;
          from += pageSize;
        }

        const confirmedOwnerSales = (oldSales || []).map((sale) => ({
          ...sale,
          shop_id: String(sale?.shop_id || '').trim(),
          date: sale?.date || (sale?.created_at ? String(sale.created_at).slice(0, 10) : todayISO()),
          confirmed: true,
        }));

        setOwnerSalesSource(confirmedOwnerSales);

        setAppData((prev) => ({
          ...prev,
          sales: mergeRowsById(prev.sales || [], confirmedOwnerSales),
        }));
      } catch (error) {
        console.error('Failed to load old owner sales:', error);
        setOwnerSalesSource([]);
      } finally {
        setOwnerSalesLoading(false);
      }
    };

    loadOldOwnerSales();
  }, [ownerPeriod, shouldLoadOldOwnerSalesFromSupabase]);

  const ownerSalesBase = (data.sales || [])
  .filter((sale) => sale.confirmed !== false)
  .map((sale) => ({
    ...sale,
    date: sale.created_at
      ? todayISO(new Date(sale.created_at))
      : sale.date,
  }));

  const ownerDateValue =
    ownerPeriod === 'date'
      ? { start: ownerCustomStartDate, end: ownerCustomEndDate }
      : todayISO();

  const salesPeriod = filterByPreset(ownerSalesBase, ownerPeriod, ownerDateValue);
console.log('OWNER STATE CHECK', {
  ownerPeriod,
  totalSalesInState: Array.isArray(ownerSalesBase) ? ownerSalesBase.length : 0,
  filteredSalesCount: Array.isArray(salesPeriod) ? salesPeriod.length : 0,
  firstThreeSales: Array.isArray(ownerSalesBase) ? ownerSalesBase.slice(0, 3) : [],
});
  const totalSales = salesPeriod.reduce((a, s) => a + Number(s.total || 0), 0);
console.log('TOTAL CHECK', {
  totalSales,
  count: salesPeriod.length
});
  
  const getOwnerRemittancePeriod = () => {
  const now = startOfDay(new Date());

  let periodStart = now;
  let periodEnd = now;

  if (ownerPeriod === 'yesterday') {
    periodStart = addDays(now, -1);
    periodEnd = addDays(now, -1);
  } else if (ownerPeriod === 'week') {
    const dayOfWeek = now.getDay();
    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    periodStart = addDays(now, -daysFromMonday);
  } else if (ownerPeriod === 'lastweek') {
    const dayOfWeek = now.getDay();
    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const currentWeekStart = addDays(
      now,
      -daysFromMonday
    );

    periodStart = addDays(currentWeekStart, -7);
    periodEnd = addDays(currentWeekStart, -1);
  } else if (ownerPeriod === 'month') {
    periodStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  } else if (ownerPeriod === 'lastmonth') {
    periodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    periodEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );
  } else if (ownerPeriod === '3months') {
    periodStart = addDays(now, -89);
  } else if (ownerPeriod === '6months') {
    periodStart = addDays(now, -179);
  } else if (ownerPeriod === 'year') {
    periodStart = new Date(
      now.getFullYear(),
      0,
      1
    );
  } else if (
    ownerPeriod === 'date' &&
    ownerCustomStartDate &&
    ownerCustomEndDate
  ) {
    periodStart = startOfDay(
      ownerCustomStartDate
    );

    periodEnd = startOfDay(
      ownerCustomEndDate
    );
  }

  return {
    startKey: todayISO(periodStart),
    endKey: todayISO(periodEnd),
  };
};

const ownerRemittancePeriod =
  getOwnerRemittancePeriod();

const ownerRemittanceStartKey =
  ownerRemittancePeriod.startKey <
  AUTOMATIC_EXPENSE_PILOT_START_DATE
    ? AUTOMATIC_EXPENSE_PILOT_START_DATE
    : ownerRemittancePeriod.startKey;

const ownerRemittanceDateKeys = [];

if (
  ownerRemittancePeriod.endKey >=
  ownerRemittanceStartKey
) {
  let currentDate = startOfDay(
    ownerRemittanceStartKey
  );

  const finalDate = startOfDay(
    ownerRemittancePeriod.endKey
  );

  while (currentDate <= finalDate) {
    ownerRemittanceDateKeys.push(
      todayISO(currentDate)
    );

    currentDate = addDays(currentDate, 1);
  }
}

const ownerTotalMatumiziYaLeo =
  ownerRemittanceDateKeys.reduce(
    (periodTotal, dateKey) => {
      const dateTotal = (
        Array.isArray(data?.shops)
          ? data.shops
          : []
      ).reduce((shopTotal, shop) => {
        const shopId = String(
          shop?.id || ''
        ).trim();

        if (!shopId) return shopTotal;

        const shopRemittancePosition =
          getLiveRemittanceShopPosition({
            data: ownerConfirmedCalculationData,
            shopId,
            calculationDateKey: dateKey,
          });

        return (
          shopTotal +
          Math.max(
            0,
           Number(
  shopRemittancePosition
    ?.cashAmountRequiredToSubmit || 0
)
          )
        );
      }, 0);

      return periodTotal + dateTotal;
    },
    0
  );
const displayedOwnerProfit =
  ownerRemittanceDateKeys.reduce(
    (periodTotal, dateKey) => {
      const dateOwnerProfit = (
        Array.isArray(data?.shops)
          ? data.shops
          : []
      ).reduce((shopTotal, shop) => {
        const position =
          getLiveRemittanceShopPosition({
            data: ownerConfirmedCalculationData,
            shopId: shop.id,
            calculationDateKey: dateKey,
          });

        return (
          shopTotal +
          Math.max(
            0,
            Number(position?.ownerProfit || 0)
          )
        );
      }, 0);

      return periodTotal + dateOwnerProfit;
    },
    0
  );

  const displayedRetailNetProfit =
  ownerRemittanceDateKeys.reduce(
    (periodTotal, dateKey) => {
      const dateRetailNetProfit = (
        Array.isArray(data?.shops)
          ? data.shops
          : []
      ).reduce((shopTotal, shop) => {
        const position =
          getLiveRemittanceShopPosition({
            data: ownerConfirmedCalculationData,
            shopId: shop.id,
            calculationDateKey: dateKey,
          });

        return (
          shopTotal +
          Math.max(
            0,
            Number(position?.netProfit || 0)
          )
        );
      }, 0);

      return (
        periodTotal +
        dateRetailNetProfit
      );
    },
    0
  );
const totalGasProfit = (data.gasEntries || [])
  .filter(
    (entry) =>
      filterByPreset(
        [entry],
        ownerPeriod,
        ownerDateValue
      ).length > 0
  )
  .reduce(
    (sum, entry) =>
      sum + getGasEntryProfitTotal(entry),
    0
  );


const commissionMonthMatchesOwnerPeriod = (record) => {
  if (!record?.commissionMonth) return false;

  if (
    ![
      'month',
      'lastmonth',
      '3months',
      '6months',
      'year',
    ].includes(ownerPeriod)
  ) {
    return false;
  }

  const [year, month] = String(
    record.commissionMonth
  )
    .split('-')
    .map(Number);

  if (!year || !month) return false;

  const now = startOfDay(new Date());

  const commissionMonthStart = new Date(
    year,
    month - 1,
    1
  );

  const thisMonthStart = startOfMonth(now);

  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const thisYearStart = new Date(
    now.getFullYear(),
    0,
    1
  );

  if (ownerPeriod === 'month') {
    return (
      commissionMonthStart.getFullYear() ===
        thisMonthStart.getFullYear() &&
      commissionMonthStart.getMonth() ===
        thisMonthStart.getMonth()
    );
  }

  if (ownerPeriod === 'lastmonth') {
    return (
      commissionMonthStart.getFullYear() ===
        lastMonthStart.getFullYear() &&
      commissionMonthStart.getMonth() ===
        lastMonthStart.getMonth()
    );
  }

  if (ownerPeriod === '3months') {
    const periodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    return (
      commissionMonthStart >= periodStart &&
      commissionMonthStart <= thisMonthStart
    );
  }

  if (ownerPeriod === '6months') {
    const periodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    return (
      commissionMonthStart >= periodStart &&
      commissionMonthStart <= thisMonthStart
    );
  }

  if (ownerPeriod === 'year') {
    return (
      commissionMonthStart >= thisYearStart &&
      commissionMonthStart <= thisMonthStart
    );
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

const totalBusinessProfit =
  displayedRetailNetProfit +
  totalGasProfit +
  totalWakalaCommission;

const ownerMonthlyTargets = data.shops.map((shop) => ({
  shop,
  target: getFixedShopMonthlySalesTarget(data, shop.id, ownerPeriod),
}));

const ownerBaseMonthlyGoal = ownerMonthlyTargets.reduce(
  (sum, row) => sum + Number(row.target.goal || 0),
  0
);

const ownerTargetMonthCount = {
  today: 1,
  yesterday: 1,
  week: 1,
  lastweek: 1,
  month: 1,
  lastmonth: 1,
  '3months': 3,
  '6months': 6,
  year: 12,
}[ownerPeriod] || 1;

const ownerMonthlyGoal = ownerBaseMonthlyGoal * ownerTargetMonthCount;

const ownerMonthlyActual = ownerMonthlyTargets.reduce(
  (sum, row) => sum + Number(row.target.actual || 0),
  0
);

const ownerMonthlyProgress = ownerMonthlyGoal > 0
  ? (ownerMonthlyActual / ownerMonthlyGoal) * 100
  : 0;

const ownerMonthlyRemainingAmount = Math.max(0, ownerMonthlyGoal - ownerMonthlyActual);
const ownerMonthlyExceededAmount = Math.max(0, ownerMonthlyActual - ownerMonthlyGoal);

const ownerMonthlyRewardAmount = ownerMonthlyTargets.reduce(
  (sum, row) => sum + Number(row.target.rewardAmount || 0),
  0
);

const latestPerShop = data.shops
  .map((shop) =>
    getLatestEntryForShop(
      data.mobileMoneyEntries,
      shop.id
    )
  )
  .filter(Boolean);

const totalMobileCapital =
  latestPerShop.reduce(
    (sum, entry) =>
      sum + Number(entry.mobileCapital || 0),
    0
  );

const totalBankCapital =
  latestPerShop.reduce(
    (sum, entry) =>
      sum + Number(entry.bankCapital || 0),
    0
  );

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
    const ownerTargetText = {
    today: {
      title: t(language, 'All Shops Monthly Target', 'Lengo la Mwezi la Maduka Yote'),
      sales: t(language, 'Sales today', 'Mauzo ya leo'),
      target: t(language, 'Monthly target', 'Lengo la mwezi'),
    },
    yesterday: {
      title: t(language, 'All Shops Monthly Target', 'Lengo la Mwezi la Maduka Yote'),
      sales: t(language, 'Sales yesterday', 'Mauzo ya jana'),
      target: t(language, 'Monthly target', 'Lengo la mwezi'),
    },
    week: {
      title: t(language, 'All Shops Monthly Target', 'Lengo la Mwezi la Maduka Yote'),
      sales: t(language, 'Sales this week', 'Mauzo ya wiki hii'),
      target: t(language, 'Monthly target', 'Lengo la mwezi'),
    },
    lastweek: {
      title: t(language, 'All Shops Monthly Target', 'Lengo la Mwezi la Maduka Yote'),
      sales: t(language, 'Sales last week', 'Mauzo ya wiki iliyopita'),
      target: t(language, 'Monthly target', 'Lengo la mwezi'),
    },
    month: {
      title: t(language, 'All Shops Monthly Target', 'Lengo la Mwezi la Maduka Yote'),
      sales: t(language, 'Sales this month', 'Mauzo ya mwezi huu'),
      target: t(language, 'This month target', 'Lengo la mwezi huu'),
    },
    lastmonth: {
      title: t(language, 'All Shops Last Month Target', 'Lengo la Mwezi Uliopita la Maduka Yote'),
      sales: t(language, 'Last month sales', 'Mauzo ya mwezi uliopita'),
      target: t(language, 'Last month target', 'Lengo la mwezi uliopita'),
    },
    '3months': {
      title: t(language, 'All Shops 3-Month Target', 'Lengo la Miezi 3 la Maduka Yote'),
      sales: t(language, 'Sales for last 3 months', 'Mauzo ya miezi 3 iliyopita'),
      target: t(language, 'Target for last 3 months', 'Lengo la miezi 3 iliyopita'),
    },
    '6months': {
      title: t(language, 'All Shops 6-Month Target', 'Lengo la Miezi 6 la Maduka Yote'),
      sales: t(language, 'Sales for last 6 months', 'Mauzo ya miezi 6 iliyopita'),
      target: t(language, 'Target for last 6 months', 'Lengo la miezi 6 iliyopita'),
    },
    year: {
      title: t(language, 'All Shops Year Target', 'Lengo la Mwaka la Maduka Yote'),
      sales: t(language, 'Sales this year', 'Mauzo ya mwaka huu'),
      target: t(language, 'Target this year', 'Lengo la mwaka huu'),
    },
  }[ownerPeriod] || {
    title: t(language, 'All Shops Target', 'Lengo la Maduka Yote'),
    sales: t(language, 'Sales for selected period', 'Mauzo ya kipindi ulichochagua'),
    target: t(language, 'Target for selected period', 'Lengo la kipindi ulichochagua'),
  };

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
         <div className="flex flex-wrap items-center gap-2">
  <select
    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
    value={ownerPeriod}
    onChange={(e) => setOwnerPeriod(e.target.value)}
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
    <option value="date">{t(language, 'Custom Date Range', 'Chagua tarehe')}</option>
  </select>

  {ownerPeriod === 'date' ? (
    <>
      <input
        type="date"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        value={ownerCustomStartDate}
        onChange={(e) => setOwnerCustomStartDate(e.target.value)}
      />

      <input
        type="date"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        value={ownerCustomEndDate}
        onChange={(e) => setOwnerCustomEndDate(e.target.value)}
      />
    </>
  ) : null}
</div>
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

      <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
  <StatCard
  title={`${t(language, 'Total Sales', 'Jumla ya Mauzo')} ${ownerPeriodLabel}`}
  value={`TZS ${currency(totalSales)}`}
  icon={ShoppingCart}
  color="from-fuchsia-500 to-purple-600"
/>

  <StatCard
  title={`${t(
    language,
    'Amount to Submit',
'Kiasi cha Kutoa'
  )} ${ownerPeriodLabel}`}
  value={`TZS ${currency(
    ownerTotalMatumiziYaLeo
  )}`}
  icon={AlertTriangle}
  color="from-orange-400 to-pink-500"
/>

  <StatCard
  title={`${t(language, 'Profit', 'Faida ya')} ${ownerPeriodLabel}`}
  value={`TZS ${currency(displayedOwnerProfit)}`}
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
  {t(
    language,
    'Retail Profit',
    'Faida ya Duka'
  )}: TZS {currency(displayedRetailNetProfit)}
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
            
{ownerMonthlyGoal > 0 ? (
  <div className="mt-6 rounded-[30px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-5 shadow-lg">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
          {t(language, 'All Shops Monthly Target', 'Lengo la Mwezi la Maduka Yote')}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-white px-4 py-3 shadow-sm ring-1 ring-emerald-100">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              {ownerPeriod === 'lastmonth' ? t(language, 'Last month sales', 'Mauzo ya mwezi uliopita') : t(language, 'Sales so far', 'Mauzo hadi sasa')}
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
  {`TZS ${currency(ownerMonthlyActual)}`}
</div>
          </div>

          <div className="rounded-3xl bg-white px-4 py-3 shadow-sm ring-1 ring-emerald-100">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              {t(language, 'Monthly target', 'Lengo la mwezi')}
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
  {`TZS ${currency(ownerMonthlyGoal)}`}
</div>
          </div>
        </div>

       <div className="mt-3 text-sm font-bold text-slate-700">
  {`${t(language, 'Reached', 'Umefikia')}: ${ownerMonthlyProgress.toFixed(0)}%`}
</div>

<div className="mt-1 text-sm font-bold text-slate-700">
  {ownerMonthlyExceededAmount > 0
    ? `${t(language, 'Exceeded target by', 'Umezidi lengo kwa')}: TZS ${currency(ownerMonthlyExceededAmount)}`
    : `${t(language, 'Remaining to target', 'Bado kufikia lengo')}: TZS ${currency(ownerMonthlyRemainingAmount)}`}
</div>
      </div>

      <div className="rounded-3xl bg-white px-5 py-4 text-right shadow-sm ring-1 ring-emerald-100">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
          {t(language, 'Total Current Reward', 'Jumla ya Zawadi ya Sasa')}
        </div>

        <div className="mt-2 text-2xl font-black text-emerald-700">
  {`TZS ${currency(ownerMonthlyRewardAmount)}`}
</div>

        <div className="mt-1 max-w-[260px] text-xs font-semibold leading-5 text-slate-600">
          {t(
            language,
            'This is the total reward from shops that have reached their monthly targets.',
            'Hii ni jumla ya zawadi kutoka maduka yaliyofikisha malengo ya mwezi.'
          )}
        </div>
      </div>
    </div>

    <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-100">
  <div
    className="h-full rounded-full bg-emerald-600 transition-all"
    style={{
  width: `${Math.min(100, ownerMonthlyProgress)}%`,
}}
  />
</div>
  </div>
) : null}



<div className="mt-6 grid gap-4 lg:grid-cols-3 text-base">
        {data.shops.map((shop) => {
          const shopSales = filterByPreset(
  ownerSalesBase.filter(
    (sale) =>
      String(sale.shop_id || sale.shopId || '') ===
      String(shop.id)
  ),
  ownerPeriod,
  ownerDateValue
).reduce(
  (sum, sale) => sum + Number(sale.total || 0),
  0
);


          const shopAutomaticMatumizi =
  ownerRemittanceDateKeys.reduce(
    (total, dateKey) => {
      const shopRemittancePosition =
        getLiveRemittanceShopPosition({
          data: ownerConfirmedCalculationData,
          shopId: shop.id,
          calculationDateKey: dateKey,
        });

      return (
        total +
        Math.max(
          0,
          Number(
  shopRemittancePosition
    ?.cashAmountRequiredToSubmit || 0
)
        )
      );
    },
    0
  );

          const shopRetailProfit =
  ownerRemittanceDateKeys.reduce(
    (periodTotal, dateKey) => {
      const position =
        getLiveRemittanceShopPosition({
         data: ownerConfirmedCalculationData,
          shopId: shop.id,
          calculationDateKey: dateKey,
        });

      return (
        periodTotal +
        Math.max(
          0,
          Number(position?.netProfit || 0)
        )
      );
    },
    0
  );
const shopGasProfit = filterByPreset(
  (data.gasEntries || []).filter(
    (entry) =>
      String(entry.shop_id || entry.shopId || '') ===
      String(shop.id)
  ),
  ownerPeriod,
  ownerDateValue
).reduce(
  (sum, entry) =>
    sum + getGasEntryProfitTotal(entry),
  0
);
          const shopProfit =
  ownerRemittanceDateKeys.reduce(
    (periodTotal, dateKey) => {
      const position =
        getLiveRemittanceShopPosition({
          data: ownerConfirmedCalculationData,
          shopId: shop.id,
          calculationDateKey: dateKey,
        });

      return (
        periodTotal +
        Math.max(
          0,
          Number(position?.ownerProfit || 0)
        )
      );
    },
    0
  );

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

const latest = getLatestEntryForShop(
  data.mobileMoneyEntries,
  shop.id
);

const mobileCapital = latest
  ? Number(latest.mobileCapital || 0)
  : 0;

const bankCapital = latest
  ? Number(latest.bankCapital || 0)
  : 0;

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
          {t(language, 'Amount to Submit', 'Kiasi cha Kutoa')}: TZS {currency(shopAutomaticMatumizi)}
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
  {t(
    language,
    'Retail Profit',
    'Faida ya Duka'
  )}: TZS {currency(shopRetailProfit)}
</div>

<div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
  {t(
    language,
    'Owner Profit',
    'Faida ya Mmiliki'
  )}: TZS {currency(shopProfit)}
</div>

<div className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
  {t(
    language,
    'Gas Profit',
    'Faida ya Gesi'
  )}: TZS {currency(shopGasProfit)}
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
  {t(
    language,
    'Total Business Profit',
    'Jumla ya Faida za Biashara'
  )}: TZS{' '}
  {currency(
    shopRetailProfit +
      shopGasProfit +
      shopWakalaCommission
  )}
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

      <div className="mt-6">
  {dashboardDataReady && !ownerSalesLoading ? (
    <CEODecisionCentre
  data={ownerConfirmedCalculationData}
  language={language}
  ownerPeriod={ownerPeriod}
  selectedPeriod={ownerPeriod}
/>
  ) : (
    <Card>
      <CardContent className="pt-6 text-sm font-medium text-slate-600">
        {ownerDashboardLoadingText}
      </CardContent>
    </Card>
  )}
</div>

      </div>
    </div>
  </AppShell>
);
}
   
function ShopDashboard({
  shop,
  data,
  saveData,
  backToOwner,
  logout,
  canBack,
  language,
  setLanguage,
  exportBackup,
  dashboardDataReady,
  setSyncMessage,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickSearch, setQuickSearch] = useState('');
  const dashboardLoadingText = 'Inapakia taarifa...';
  const shopWorkspaceLabel = t(language, 'Shop Workspace', 'Eneo la Kazi la Duka');
  const monthlySalesGoal = getFixedShopMonthlySalesTarget(data, shop.id);

  const today = startOfDay(new Date());
  const todayIso = todayISO(today);
  const yesterdayIso = todayISO(addDays(today, -1));

  const shopSalesForGoal = (data.sales || []).filter(
    (sale) => String(sale.shop_id || sale.shopId || '') === String(shop.id)
  );

  const todaySalesForGoal = shopSalesForGoal
    .filter((sale) => String(sale.date || sale.created_at || '').slice(0, 10) === todayIso)
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const yesterdaySalesForGoal = shopSalesForGoal
    .filter((sale) => String(sale.date || sale.created_at || '').slice(0, 10) === yesterdayIso)
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const dailyGoalFromMonthly = monthlySalesGoal.hasGoal && monthlySalesGoal.daysInMonth
    ? Math.round(Number(monthlySalesGoal.goal || 0) / Number(monthlySalesGoal.daysInMonth || 1))
    : 0;

  const dailyProgressFromMonthly = dailyGoalFromMonthly > 0
    ? (todaySalesForGoal / dailyGoalFromMonthly) * 100
    : 0;

  const dailySalesGoal = {
    hasGoal: dailyGoalFromMonthly > 0,
    goal: dailyGoalFromMonthly,
    actual: todaySalesForGoal,
    yesterdaySales: yesterdaySalesForGoal,
    progress: dailyProgressFromMonthly,
    cappedProgress: Math.min(100, dailyProgressFromMonthly),
    exceededAmount: Math.max(0, todaySalesForGoal - dailyGoalFromMonthly),
    exceededPercent: Math.max(0, dailyProgressFromMonthly - 100),
    remainingAmount: Math.max(0, dailyGoalFromMonthly - todaySalesForGoal),
    remainingPercent: Math.max(0, 100 - dailyProgressFromMonthly),
  };

const [stockSearch, setStockSearch] = useState('');
  const [scanCode, setScanCode] = useState('');
  const [cart, setCart] = useState([]);
  const [pendingCartDraft, setPendingCartDraft] = useState(null);
  const [cartDraftDecisionRequired, setCartDraftDecisionRequired] = useState(false);
  const [confirmDeleteCartDraft, setConfirmDeleteCartDraft] = useState(false);
  const [cartDraftChecked, setCartDraftChecked] = useState(false);

  const [salesJournalRecords, setSalesJournalRecords] = useState([]);
  const [salesJournalLoading, setSalesJournalLoading] = useState(true);
  const [salesJournalError, setSalesJournalError] = useState('');
  const [salesJournalOpen, setSalesJournalOpen] = useState(false);
  const [salesJournalSection, setSalesJournalSection] = useState('summary');

  const [
    salesJournalViewRecords,
    setSalesJournalViewRecords,
  ] = useState([]);

  const [
    salesJournalViewLoading,
    setSalesJournalViewLoading,
  ] = useState(false);

  const [
    salesJournalViewError,
    setSalesJournalViewError,
  ] = useState('');

  const [
    salesJournalViewRange,
    setSalesJournalViewRange,
  ] = useState({
    start: todayIso,
    end: todayIso,
  });


  const [salesIntegrityRows, setSalesIntegrityRows] = useState([]);
  const [salesIntegrityLoading, setSalesIntegrityLoading] = useState(false);
  const [salesIntegrityError, setSalesIntegrityError] = useState('');
  const [salesRetryingSaleId, setSalesRetryingSaleId] = useState('');

  useEffect(() => {
    const handleSalesJournalUpdated =
      async (event) => {
        const saleId = String(
          event?.detail?.saleId || ''
        ).trim();

        const eventShopId = String(
          event?.detail?.shopId || ''
        ).trim();

        if (
          !saleId ||
          eventShopId !==
            String(shop.id || '').trim()
        ) {
          return;
        }

        try {
          const updatedRecord =
            await readSalesJournalRecord(
              saleId
            );

          if (!updatedRecord) {
            return;
          }

          setSalesJournalRecords((prev) => {
            const existingIndex =
              prev.findIndex(
                (record) =>
                  String(
                    record?.id || ''
                  ) === saleId
              );

            if (existingIndex < 0) {
              return [
                ...prev,
                updatedRecord,
              ].sort(
                (a, b) =>
                  new Date(
                    a?.created_at || 0
                  ) -
                  new Date(
                    b?.created_at || 0
                  )
              );
            }

            return prev.map((record) =>
              String(record?.id || '') ===
              saleId
                ? updatedRecord
                : record
            );
          });
        } catch (error) {
          console.error(
            'Failed to refresh Sales Journal after confirmation:',
            error
          );
        }
      };

    window.addEventListener(
      'sales-journal-updated',
      handleSalesJournalUpdated
    );

    return () => {
      window.removeEventListener(
        'sales-journal-updated',
        handleSalesJournalUpdated
      );
    };
  }, [shop.id]);

  useEffect(() => {
    if (!salesJournalOpen) return;

    let cancelled = false;

    const runSalesIntegrityCheck = async () => {
      setSalesIntegrityLoading(true);
      setSalesIntegrityError('');

      try {
        const currentShopId = String(
          shop.id || ''
        ).trim();

        const startDate = String(
          salesJournalViewRange.start ||
            todayIso
        ).trim();

        const endDate = String(
          salesJournalViewRange.end ||
            startDate
        ).trim();

        const currentQueue = readSyncQueue();

        const pendingSaleQueueById = new Map(
          currentQueue
            .filter(
              (item) =>
                item?.actionType ===
                  'sale_created' &&
                item?.synced === false &&
                String(
                  item?.payload?.shop_id ||
                    ''
                ).trim() ===
                  currentShopId
            )
            .map((item) => [
              String(
                item?.payload?.id || ''
              ).trim(),
              item,
            ])
        );

        const {
          data: confirmedSales,
          error: confirmedSalesError,
        } = await supabase
          .from('sales')
          .select('*')
          .eq(
            'shop_id',
            currentShopId
          )
          .gte(
            'date',
            startDate
          )
          .lte(
            'date',
            endDate
          );

        if (confirmedSalesError) {
          throw confirmedSalesError;
        }

        const confirmedSalesById = new Map(
          (
            Array.isArray(confirmedSales)
              ? confirmedSales
              : []
          ).map((sale) => [
            String(
              sale?.id || ''
            ).trim(),
            sale,
          ])
        );

        const normalizeIntegrityItems = (
          items = []
        ) =>
          (Array.isArray(items)
            ? items
            : []
          )
            .map((item) => ({
              productId: String(
                item?.productId || ''
              ),
              name: String(
                item?.name || ''
              ),
              unit: String(
                item?.unit || ''
              ),
              quantity: Number(
                item?.quantity || 0
              ),
              price: Number(
                item?.price ??
                  item?.sellPrice ??
                  0
              ),
              buyPrice: Number(
                item?.buyPrice || 0
              ),
              sellPrice: Number(
                item?.sellPrice ??
                  item?.price ??
                  0
              ),
              total: Number(
                item?.total || 0
              ),
            }))
            .sort((a, b) =>
              `${a.productId}-${a.name}`.localeCompare(
                `${b.productId}-${b.name}`
              )
            );

        const normalizeIntegritySale = (
          sale
        ) => ({
          id: String(
            sale?.id || ''
          ).trim(),
          shop_id: String(
            sale?.shop_id ||
              sale?.shopId ||
              ''
          ).trim(),
          date: String(
            sale?.date || ''
          ),
          type:
            sale?.type || 'cash',
          total: Number(
            sale?.total || 0
          ),
          items:
            normalizeIntegrityItems(
              sale?.items
            ),
        });

        const integrityRows = [];

        const selectedJournalRecords =
          salesJournalViewRecords.filter(
            (record) => {
              const recordDate = String(
                record?.date || ''
              ).slice(0, 10);

              return (
                recordDate >= startDate &&
                recordDate <= endDate
              );
            }
          );

        for (const journalRecord of selectedJournalRecords) {
          const saleId = String(
            journalRecord?.id || ''
          ).trim();

          if (!saleId) continue;

          const queueItem =
            pendingSaleQueueById.get(
              saleId
            );

          const supabaseSale =
            confirmedSalesById.get(
              saleId
            );

          const journalComparable =
            normalizeIntegritySale(
              journalRecord
            );

          const queueComparable =
            queueItem
              ? normalizeIntegritySale(
                  queueItem?.payload ||
                    {}
                )
              : null;

          const supabaseComparable =
            supabaseSale
              ? normalizeIntegritySale(
                  supabaseSale
                )
              : null;

          const queueMatchesJournal =
            queueComparable
              ? JSON.stringify(
                  queueComparable
                ) ===
                JSON.stringify(
                  journalComparable
                )
              : false;

          const supabaseMatchesJournal =
            supabaseComparable
              ? JSON.stringify(
                  supabaseComparable
                ) ===
                JSON.stringify(
                  journalComparable
                )
              : false;

          let integrityResult =
            'needs_recovery';

          if (
            supabaseSale &&
            supabaseMatchesJournal
          ) {
            integrityResult =
              'confirmed';
          } else if (
            supabaseSale &&
            !supabaseMatchesJournal
          ) {
            integrityResult =
              'supabase_mismatch';
          } else if (
            queueItem &&
            !queueMatchesJournal
          ) {
            integrityResult =
              'queue_mismatch';
          } else if (
            queueItem &&
            queueMatchesJournal &&
            queueItem?.status === 'failed'
          ) {
            integrityResult =
              'failed';
          } else if (
            queueItem &&
            queueMatchesJournal
          ) {
            integrityResult =
              'waiting';
          }
          if (
            !supabaseSale &&
            (
              integrityResult ===
                'queue_mismatch' ||
              integrityResult ===
                'needs_recovery'
            )
          ) {
            try {
              const repaired =
                await repairSaleQueueFromJournal(
                  journalRecord
                );

              if (repaired) {
                if (navigator.onLine) {
                  await processSyncQueue();
                }

                if (!cancelled) {
                  setSalesJournalRecords(
                    (currentRecords) => [
                      ...currentRecords,
                    ]
                  );
                }

                continue;
              }
            } catch (repairError) {
              console.error(
                'Automatic Journal queue repair failed:',
                repairError
              );
            }
          }

          
          const journalItems =
            Array.isArray(
              journalRecord?.items
            )
              ? journalRecord.items
              : [];

          if (
            journalItems.length === 0
          ) {
            integrityRows.push({
              saleId,
              productId: '',
              productName:
                'Unknown product',
              journalStatus:
                'present',
              queueStatus:
                queueItem
                  ? queueMatchesJournal
                    ? 'present'
                    : 'mismatch'
                  : 'missing',
              supabaseStatus:
                supabaseSale
                  ? supabaseMatchesJournal
                    ? 'present'
                    : 'mismatch'
                  : 'missing',
              result:
                integrityResult,
              retryAttempts: Number(
                queueItem?.attempts || 0
              ),
              lastSyncError:
                queueItem?.lastError || '',
            });

            continue;
          }

          const lastSyncError = String(
            queueItem?.lastError || ''
          ).trim();

          const normalizedSyncError =
            lastSyncError.toLowerCase();

          const failedProductIndex =
            integrityResult === 'failed'
              ? journalItems.findIndex(
                  (item) => {
                    const productName =
                      String(
                        item?.name || ''
                      )
                        .trim()
                        .toLowerCase();

                    return (
                      productName &&
                      normalizedSyncError.includes(
                        productName
                      )
                    );
                  }
                )
              : -1;

          const blockingProductName =
            failedProductIndex >= 0
              ? String(
                  journalItems[
                    failedProductIndex
                  ]?.name || ''
                ).trim()
              : '';

          journalItems.forEach(
            (item, itemIndex) => {
              let rowResult =
                integrityResult;

              if (
                integrityResult ===
                  'failed' &&
                failedProductIndex >= 0
              ) {
                rowResult =
                  itemIndex ===
                  failedProductIndex
                    ? 'failed'
                    : 'blocked_by_other_product';
              }

              integrityRows.push({
                saleId,
                productId: String(
                  item?.productId ||
                    ''
                ),
                productName:
                  item?.name ||
                  item?.productId ||
                  `Product ${
                    itemIndex + 1
                  }`,
                quantity: Number(
                  item?.quantity || 0
                ),
                unit:
                  item?.unit || '',
                total: Number(
                  item?.total || 0
                ),
                journalStatus:
                  'present',
                queueStatus:
                  queueItem
                    ? queueMatchesJournal
                      ? 'present'
                      : 'mismatch'
                    : 'missing',
                supabaseStatus:
                  supabaseSale
                    ? supabaseMatchesJournal
                      ? 'present'
                      : 'mismatch'
                    : 'missing',
                result:
                  rowResult,
                transactionResult:
                  integrityResult,
                blockingProductName,
                retryAttempts: Number(
                  queueItem?.attempts || 0
                ),
                lastSyncError,
              });
            }
          );
        }

        if (cancelled) return;

        setSalesIntegrityRows(
          integrityRows
        );
      } catch (error) {
        console.error(
          'Sales integrity check failed:',
          error
        );

        if (!cancelled) {
          setSalesIntegrityError(
            error?.message ||
              'Sales integrity check failed.'
          );
        }
      } finally {
        if (!cancelled) {
          setSalesIntegrityLoading(
            false
          );
        }
      }
    };

    runSalesIntegrityCheck();

    return () => {
      cancelled = true;
    };
  }, [
    salesJournalOpen,
    shop.id,
    salesJournalViewRange.start,
    salesJournalViewRange.end,
    salesJournalViewRecords,
  ]);

  const retryJournalSale = async (saleId) => {
    const cleanSaleId = String(
      saleId || ''
    ).trim();

    if (
      !cleanSaleId ||
      salesRetryingSaleId
    ) {
      return;
    }

    if (!navigator.onLine) {
      setSyncMessage(
        'Hakuna internet. Mauzo bado yako salama kwenye Journal.'
      );
      return;
    }

    setSalesRetryingSaleId(cleanSaleId);

    try {
      const journalRecord =
        await readSalesJournalRecord(
          cleanSaleId
        );

      if (!journalRecord) {
        throw new Error(
          'Sales Journal record was not found.'
        );
      }

      if (
        String(
          journalRecord?.shop_id || ''
        ).trim() !==
        String(shop.id || '').trim()
      ) {
        throw new Error(
          'Sales Journal record belongs to a different shop.'
        );
      }

      const {
        data: retryResult,
        error: retryError,
      } = await supabase.rpc(
        'record_pos_sale',
        {
          p_sale_id: cleanSaleId,
          p_shop_id: String(
            journalRecord.shop_id || ''
          ),
          p_items: Array.isArray(
            journalRecord.items
          )
            ? journalRecord.items
            : [],
          p_total: Number(
            journalRecord.total || 0
          ),
          p_type:
            journalRecord.type || 'cash',
          p_sale_date:
            journalRecord.date ||
            todayISO(),
          p_created_at:
            journalRecord.created_at ||
            new Date().toISOString(),
        }
      );

      if (retryError) {
        throw retryError;
      }

      if (
        !retryResult ||
        String(
          retryResult.saleId || ''
        ) !== cleanSaleId
      ) {
        throw new Error(
          'Supabase did not confirm the correct sale ID.'
        );
      }

      const confirmedAt =
        new Date().toISOString();

      const confirmedJournalRecord = {
        ...journalRecord,
        status: 'confirmed',
        integrityStatus: 'ok',
        confirmedAt,
        updatedAt: confirmedAt,
      };

      await writeSalesJournalRecord(
        confirmedJournalRecord
      );

      setSalesJournalRecords((prev) =>
        prev.map((record) =>
          String(record?.id || '') ===
          cleanSaleId
            ? confirmedJournalRecord
            : record
        )
      );

      setSyncMessage(
        'Mauzo yamethibitishwa Supabase.'
      );
    } catch (error) {
      console.error(
        'Manual Journal sale retry failed:',
        error
      );

      setSyncMessage(
        `Jaribio la kuthibitisha mauzo limeshindikana: ${
          error?.message ||
          'Sababu haijajulikana.'
        }`
      );
    } finally {
      setSalesRetryingSaleId('');
    }
  };

  const repairJournalSaleMismatch = async (
    saleId
  ) => {
    const cleanSaleId = String(
      saleId || ''
    ).trim();

    if (
      !cleanSaleId ||
      salesRetryingSaleId
    ) {
      return;
    }

    if (!navigator.onLine) {
      setSyncMessage(
        'Hakuna internet. Mauzo bado yako salama kwenye Journal.'
      );
      return;
    }

    setSalesRetryingSaleId(cleanSaleId);

    try {
      if (activeSyncQueuePromise) {
        try {
          await activeSyncQueuePromise;
        } catch {
          // Continue after the previous
          // synchronization attempt finishes.
        }
      }

      const journalRecord =
        await readSalesJournalRecord(
          cleanSaleId
        );

      if (!journalRecord) {
        throw new Error(
          'Muamala haujapatikana kwenye Journal.'
        );
      }

      if (
        String(
          journalRecord.shop_id || ''
        ) !== String(shop.id || '')
      ) {
        throw new Error(
          'Muamala huu ni wa duka tofauti.'
        );
      }

      if (
        journalRecord.source !== 'live_sale'
      ) {
        throw new Error(
          'Muamala huu haukuanzishwa kama mauzo mapya ndani ya Journal. Mfumo hautabadilisha stock yake kiotomatiki.'
        );
      }

      const {
        data: currentSupabaseSale,
        error: currentSaleError,
      } = await supabase
        .from('sales')
        .select(
          'id, shop_id, items, total, type, date'
        )
        .eq('id', cleanSaleId)
        .maybeSingle();

      if (currentSaleError) {
        throw currentSaleError;
      }

      if (!currentSupabaseSale) {
        throw new Error(
          'Muamala haupo tena Supabase. Mfumo utatumia njia ya kawaida ya kurejesha mauzo.'
        );
      }

      const {
        data: repairResult,
        error: repairError,
      } = await supabase.rpc(
        'repair_pos_sale_from_journal',
        {
          p_sale_id: cleanSaleId,
          p_shop_id: String(
            journalRecord.shop_id || ''
          ),
          p_expected_items:
            Array.isArray(
              currentSupabaseSale.items
            )
              ? currentSupabaseSale.items
              : [],
          p_expected_total: Number(
            currentSupabaseSale.total || 0
          ),
          p_expected_type:
            currentSupabaseSale.type ||
            'cash',
          p_expected_sale_date:
            currentSupabaseSale.date || '',
          p_journal_items:
            Array.isArray(
              journalRecord.items
            )
              ? journalRecord.items
              : [],
          p_journal_total: Number(
            journalRecord.total || 0
          ),
          p_journal_type:
            journalRecord.type || 'cash',
          p_journal_sale_date:
            journalRecord.date ||
            todayISO(),
        }
      );

      if (repairError) {
        throw repairError;
      }

      if (
        !repairResult ||
        String(
          repairResult.saleId || ''
        ) !== cleanSaleId
      ) {
        throw new Error(
          'Supabase haijathibitisha muamala uliorekebishwa.'
        );
      }

      const repairedAt =
        new Date().toISOString();

      const repairedJournalRecord = {
        ...journalRecord,
        status: 'confirmed',
        integrityStatus: 'ok',
        confirmedAt: repairedAt,
        updatedAt: repairedAt,
        repairedAt,
      };

      await writeSalesJournalRecord(
        repairedJournalRecord
      );

      const currentQueue =
        readSyncQueue();

      writeSyncQueue(
        currentQueue.filter(
          (item) =>
            !(
              item?.actionType ===
                'sale_created' &&
              String(
                item?.payload?.id || ''
              ).trim() === cleanSaleId
            )
        )
      );

      setSalesJournalRecords((prev) =>
        prev.map((record) =>
          String(record?.id || '') ===
          cleanSaleId
            ? repairedJournalRecord
            : record
        )
      );

      setSyncMessage(
        'Muamala umesawazishwa salama na Supabase.'
      );
    } catch (error) {
      console.error(
        'Journal/Supabase sale repair failed:',
        error
      );

      setSyncMessage(
        `Muamala haujaweza kusawazishwa: ${
          error?.message ||
          'Sababu haijajulikana.'
        }`
      );
    } finally {
      setSalesRetryingSaleId('');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapTodaySalesJournal = async () => {
      setSalesJournalLoading(true);
      setSalesJournalError('');

      try {
        const currentShopId = String(shop.id || '').trim();
        const currentDate = todayIso;

        const existingJournalRecords =
          await readSalesJournalRecords();

        const existingJournalById = new Map(
          existingJournalRecords.map((record) => [
            String(record?.id || '').trim(),
            record,
          ])
        );

        const candidateSalesById = new Map();

        const addCandidateSale = (sale) => {
          const saleId = String(
            sale?.id || ''
          ).trim();

          if (!saleId) return;

          const saleShopId = String(
            sale?.shop_id ||
              sale?.shopId ||
              ''
          ).trim();

          const saleDate = String(
            sale?.date ||
              (sale?.created_at
                ? String(
                    sale.created_at
                  ).slice(0, 10)
                : '')
          ).trim();

          if (
            saleShopId !== currentShopId ||
            saleDate !== currentDate
          ) {
            return;
          }

          candidateSalesById.set(
            saleId,
            {
              ...(candidateSalesById.get(
                saleId
              ) || {}),
              ...sale,
              id: saleId,
              shop_id: currentShopId,
            }
          );
        };

        (Array.isArray(data.sales)
          ? data.sales
          : []
        ).forEach(addCandidateSale);

        readSyncQueue()
          .filter(
            (item) =>
              item?.actionType ===
                'sale_created' &&
              item?.synced === false
          )
          .forEach((item) => {
            addCandidateSale(
              item?.payload || {}
            );
          });

        const {
          data: confirmedTodaySales,
          error: confirmedTodaySalesError,
        } = await supabase
          .from('sales')
          .select('*')
          .eq('shop_id', currentShopId)
          .eq('date', currentDate)
          .order('created_at', {
            ascending: true,
          });

        if (confirmedTodaySalesError) {
          throw confirmedTodaySalesError;
        }

        const confirmedSaleIds = new Set();

        (
          Array.isArray(confirmedTodaySales)
            ? confirmedTodaySales
            : []
        ).forEach((sale) => {
          const saleId = String(
            sale?.id || ''
          ).trim();

          if (saleId) {
            confirmedSaleIds.add(saleId);
          }

          addCandidateSale({
            ...sale,
            confirmed: true,
          });
        });

        const normalizeJournalItems = (
          items = []
        ) =>
          (Array.isArray(items)
            ? items
            : []
          ).map((item) => ({
            productId: String(
              item?.productId || ''
            ),
            name: String(
              item?.name || ''
            ),
            unit: String(
              item?.unit || ''
            ),
            quantity: Number(
              item?.quantity || 0
            ),
            price: Number(
              item?.price ??
                item?.sellPrice ??
                0
            ),
            buyPrice: Number(
              item?.buyPrice || 0
            ),
            sellPrice: Number(
              item?.sellPrice ??
                item?.price ??
                0
            ),
            total: Number(
              item?.total || 0
            ),
          }));

        const immutableSaleCopy = (
          sale
        ) => ({
          id: String(
            sale?.id || ''
          ).trim(),
          shop_id: String(
            sale?.shop_id ||
              sale?.shopId ||
              ''
          ).trim(),
          items: normalizeJournalItems(
            sale?.items
          ),
          total: Number(
            sale?.total || 0
          ),
          type:
            sale?.type || 'cash',
          date: String(
            sale?.date || ''
          ),
          created_at:
            sale?.created_at || '',
        });

        for (const sale of candidateSalesById.values()) {
          const saleId = String(
            sale?.id || ''
          ).trim();

          if (!saleId) continue;

          const confirmed =
            confirmedSaleIds.has(
              saleId
            ) ||
            sale?.confirmed === true;

          const existingJournalRecord =
            existingJournalById.get(
              saleId
            );

          if (!existingJournalRecord) {
            await writeSalesJournalRecord({
              ...immutableSaleCopy(sale),
              status: confirmed
                ? 'confirmed'
                : 'pending',
              integrityStatus: 'ok',
              source: 'today_bootstrap',
              journalCreatedAt:
                new Date().toISOString(),
              supabaseConfirmedAt:
                confirmed
                  ? new Date().toISOString()
                  : null,
              lastSyncAttempt: null,
              lastSyncError: '',
            });

            continue;
          }

          const existingImmutable =
            immutableSaleCopy(
              existingJournalRecord
            );

          const incomingImmutable =
            immutableSaleCopy(sale);

          if (
            JSON.stringify(
              existingImmutable
            ) !==
            JSON.stringify(
              incomingImmutable
            )
          ) {
            await writeSalesJournalRecord({
              ...existingJournalRecord,
              integrityStatus:
                'mismatch',
              lastIntegrityError:
                'Journal sale does not exactly match another copy with the same Sale ID.',
            });

            continue;
          }

          if (
            confirmed &&
            (
              existingJournalRecord.status !==
                'confirmed' ||
              existingJournalRecord.integrityStatus !==
                'ok'
            )
          ) {
            await writeSalesJournalRecord({
              ...existingJournalRecord,
              status: 'confirmed',
              integrityStatus: 'ok',
              supabaseConfirmedAt:
                existingJournalRecord
                  .supabaseConfirmedAt ||
                new Date().toISOString(),
            });
          }
        }

        const refreshedJournalRecords =
          await readSalesJournalRecords();

        if (cancelled) return;

        setSalesJournalRecords(
          refreshedJournalRecords
            .filter(
              (record) =>
                String(
                  record?.shop_id ||
                    ''
                ).trim() ===
                  currentShopId &&
                String(
                  record?.date || ''
                ) === currentDate
            )
            .sort(
              (a, b) =>
                new Date(
                  a?.created_at || 0
                ).getTime() -
                new Date(
                  b?.created_at || 0
                ).getTime()
            )
        );
      } catch (error) {
        console.error(
          'Today sales journal bootstrap failed:',
          error
        );

        if (!cancelled) {
          setSalesJournalError(
            error?.message ||
              'Sales journal could not be prepared.'
          );
        }
      } finally {
        if (!cancelled) {
          setSalesJournalLoading(false);
        }
      }
    };

    bootstrapTodaySalesJournal();

    return () => {
      cancelled = true;
    };
  }, [shop.id, todayIso]);

  useEffect(() => {
    setCartDraftChecked(false);

    const draft = getCartDraft(shop.id);

    if (draft?.cart?.length) {
      setPendingCartDraft(draft);
      setCartDraftDecisionRequired(true);
      setConfirmDeleteCartDraft(false);
      setCart([]);
    } else {
      setPendingCartDraft(null);
      setCartDraftDecisionRequired(false);
      setConfirmDeleteCartDraft(false);
    }

    setCartDraftChecked(true);
  }, [shop.id]);

  useEffect(() => {
    if (!cartDraftChecked) return;
    if (cartDraftDecisionRequired) return;
    saveCartDraft(shop.id, cart);
  }, [shop.id, cart, cartDraftChecked, cartDraftDecisionRequired]);

  const continueCartDraft = () => {
    const draftCart = Array.isArray(pendingCartDraft?.cart) ? pendingCartDraft.cart : [];

    setCart(draftCart);
    setPendingCartDraft(null);
    setCartDraftDecisionRequired(false);
    setConfirmDeleteCartDraft(false);
  };

  const requestDeleteCartDraft = () => {
    setConfirmDeleteCartDraft(true);
  };

  const cancelDeleteCartDraft = () => {
    setConfirmDeleteCartDraft(false);
  };

  const confirmDeleteCartDraftNow = () => {
    clearCartDraft(shop.id);
    setCart([]);
    setPendingCartDraft(null);
    setCartDraftDecisionRequired(false);
    setConfirmDeleteCartDraft(false);
  };

  const [newProductRows, setNewProductRows] = useState([{ ...emptyProductRow }]);
  const [purchaseRows, setPurchaseRows] = useState([{ ...emptyPurchaseRow }]);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const purchaseLock = useRef(false);
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

  if (today >= AUTOMATIC_EXPENSE_PILOT_START_DATE) {
    return;
  }

  const autoSaveKey = `${shop.id}-${today}`;

  if (recurringAutoSaveRef.current === autoSaveKey) return;
  recurringAutoSaveRef.current = autoSaveKey;

  const rowsToAutoSave = recurringExpenseDefaults
    .map((item, idx) => {
      const preparedId = `recurring-${shop.id}-${today}-${idx}`;

      const existingExpense = (data.expenses || []).find(
        (expense) =>
          String(expense.shop_id || expense.shopId || '') === String(shop.id) &&
          String(expense.date || '') === String(today) &&
          String(expense.title || expense.description || '').trim().toLowerCase() ===
            String(item.title || '').trim().toLowerCase() &&
          String(expense.category || '').trim().toLowerCase() ===
            String(item.category || 'Recurring').trim().toLowerCase()
      );

      return {
        id: existingExpense?.id || preparedId,
        shop_id: shop.id,
        title: item.title,
        description: item.title,
        amount: Number(item.amount || 0),
        category: item.category || 'Recurring',
        date: today,
        notes: item.notes || 'Auto-saved fixed daily expense',
        created_at: existingExpense?.created_at || new Date().toISOString(),
        autoRecurring: true,
        auto_recurring: true,
        recurring_key: existingExpense?.recurring_key || preparedId,
        sync_source: 'auto_recurring',
      };
    })
    .filter((item) => Number(item.amount || 0) > 0);

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

  const existingExpensesWithoutUpdatedRecurring = (data.expenses || []).filter((expense) => {
    return !rowsToAutoSave.some((row) => {
      const sameId = String(expense.id || '') === String(row.id || '');

      const sameRecurringExpense =
        String(expense.shop_id || expense.shopId || '') === String(row.shop_id || '') &&
        String(expense.date || '') === String(row.date || '') &&
        String(expense.title || expense.description || '').trim().toLowerCase() ===
          String(row.title || row.description || '').trim().toLowerCase() &&
        String(expense.category || '').trim().toLowerCase() ===
          String(row.category || 'Recurring').trim().toLowerCase();

      return sameId || sameRecurringExpense;
    });
  });

  const nextExpenses = [
    ...existingExpensesWithoutUpdatedRecurring,
    ...rowsToAutoSave,
  ];

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

useEffect(() => {
  const now = startOfDay(new Date());

  const getWeekStart = (date) => {
    const d = startOfDay(date);
    const day = d.getDay();

    return addDays(
      d,
      day === 0 ? -6 : 1 - day
    );
  };

  let start = todayISO(now);
  let end = todayISO(now);

  if (reportPreset === 'yesterday') {
    start = todayISO(addDays(now, -1));
    end = start;
  } else if (reportPreset === 'week') {
    start = todayISO(
      getWeekStart(now)
    );
  } else if (
    reportPreset === 'lastweek'
  ) {
    const thisWeekStart =
      getWeekStart(now);

    start = todayISO(
      addDays(thisWeekStart, -7)
    );

    end = todayISO(
      addDays(thisWeekStart, -1)
    );
  } else if (
    reportPreset === 'month'
  ) {
    start = todayISO(
      startOfMonth(now)
    );
  } else if (
    reportPreset === 'lastmonth'
  ) {
    const thisMonthStart =
      startOfMonth(now);

    const lastMonthStart =
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

    start = todayISO(
      lastMonthStart
    );

    end = todayISO(
      addDays(
        thisMonthStart,
        -1
      )
    );
  } else if (
    reportPreset === '3months'
  ) {
    start = todayISO(
      addDays(now, -89)
    );
  } else if (
    reportPreset === '6months'
  ) {
    start = todayISO(
      addDays(now, -179)
    );
  } else if (
    reportPreset === 'year'
  ) {
    start = todayISO(
      new Date(
        now.getFullYear(),
        0,
        1
      )
    );
  } else if (
    reportPreset === 'date'
  ) {
    start =
      reportStartDate ||
      todayISO(now);

    end =
      reportEndDate ||
      start;
  }

  setSalesJournalViewRange({
    start,
    end,
  });
}, [
  reportPreset,
  reportStartDate,
  reportEndDate,
]);

useEffect(() => {
  if (!salesJournalOpen) {
    return;
  }

  let cancelled = false;

  const loadSalesJournalView =
    async () => {
      const currentShopId = String(
        shop.id || ''
      ).trim();

      const startDate = String(
        salesJournalViewRange.start || ''
      ).trim();

      const endDate = String(
        salesJournalViewRange.end || ''
      ).trim();

      if (
        !currentShopId ||
        !startDate ||
        !endDate ||
        startDate > endDate
      ) {
        setSalesJournalViewRecords([]);
        return;
      }

      setSalesJournalViewLoading(true);
      setSalesJournalViewError('');

      try {
        const existingJournalRecords =
          await readSalesJournalRecords();

        const {
          data: confirmedPeriodSales,
          error: confirmedPeriodSalesError,
        } = await supabase
          .from('sales')
          .select('*')
          .eq(
            'shop_id',
            currentShopId
          )
          .gte(
            'date',
            startDate
          )
          .lte(
            'date',
            endDate
          )
          .order('created_at', {
            ascending: true,
          });

        if (confirmedPeriodSalesError) {
          throw confirmedPeriodSalesError;
        }

        const viewRecordsById =
          new Map();

        (
          Array.isArray(
            existingJournalRecords
          )
            ? existingJournalRecords
            : []
        )
          .filter((record) => {
            const recordShopId =
              String(
                record?.shop_id || ''
              ).trim();

            const recordDate =
              String(
                record?.date || ''
              ).slice(0, 10);

            return (
              recordShopId ===
                currentShopId &&
              recordDate >=
                startDate &&
              recordDate <=
                endDate
            );
          })
          .forEach((record) => {
            const saleId =
              String(
                record?.id || ''
              ).trim();

            if (!saleId) return;

            viewRecordsById.set(
              saleId,
              record
            );
          });

        (
          Array.isArray(
            confirmedPeriodSales
          )
            ? confirmedPeriodSales
            : []
        ).forEach((sale) => {
          const saleId = String(
            sale?.id || ''
          ).trim();

          if (!saleId) return;

          const existingRecord =
            viewRecordsById.get(
              saleId
            );

          viewRecordsById.set(
            saleId,
            {
              ...(existingRecord || {}),
              ...sale,
              id: saleId,
              shop_id:
                currentShopId,
              date:
                sale?.date ||
                (
                  sale?.created_at
                    ? String(
                        sale.created_at
                      ).slice(0, 10)
                    : startDate
                ),
              status: 'confirmed',
              integrityStatus:
                existingRecord
                  ?.integrityStatus ||
                'ok',
              confirmed: true,
              source:
                existingRecord
                  ?.source ||
                'supabase_view',
            }
          );
        });

        if (cancelled) {
          return;
        }

        setSalesJournalViewRecords(
          Array.from(
            viewRecordsById.values()
          ).sort(
            (a, b) =>
              new Date(
                a?.created_at || 0
              ).getTime() -
              new Date(
                b?.created_at || 0
              ).getTime()
          )
        );
      } catch (error) {
        console.error(
          'Selected Sales Journal period load failed:',
          error
        );

        if (!cancelled) {
          setSalesJournalViewRecords(
            []
          );

          setSalesJournalViewError(
            error?.message ||
              'Selected Sales Journal period could not be loaded.'
          );
        }
      } finally {
        if (!cancelled) {
          setSalesJournalViewLoading(
            false
          );
        }
      }
    };

  loadSalesJournalView();

  return () => {
    cancelled = true;
  };
}, [
  salesJournalOpen,
  shop.id,
  salesJournalViewRange.start,
  salesJournalViewRange.end,
  salesJournalRecords,
]);

const [reportType, setReportType] = useState('stockValue');

const [commissionReportMonth, setCommissionReportMonth] = useState(() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

const [expenseReportMonth, setExpenseReportMonth] = useState(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

const [reportSalesSource, setReportSalesSource] =
  useState([]);

const [reportSalesLoading, setReportSalesLoading] =
  useState(false);

const reportSalesCacheRef = useRef(new Map());
  const [productFormError, setProductFormError] = useState('');
  const [saleError, setSaleError] = useState('');
const [saleSaving, setSaleSaving] = useState(false);
const saleLock = useRef(false);
const saleCrossTabWaitLock =
  useRef(false);
  const [creditReduceMap, setCreditReduceMap] = useState({});
  const [changeReduceMap, setChangeReduceMap] = useState({});
const [gasForm, setGasForm] = useState({
  ...emptyGasForm,
  gasType: 'Taifa / Mihan Gas',
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
    gasType: 'Taifa / Mihan Gas',
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
  return record;
}

  const resetGasType = record.gasType || 'Taifa / Mihan Gas';
  const resetDefaultPrices =
    GAS_PRICE_BOOK[resetGasType] || GAS_PRICE_BOOK['Taifa / Mihan Gas'] || {};

  setGasForm({
    ...emptyGasForm,
    date: todayISO(),
    gasType: resetGasType,
    cylinderSize: 'Small Cylinder',
    smallGasBuyPrice: String(record.smallGasBuyPrice || resetDefaultPrices.smallBuy || ''),
    smallGasSellPrice: String(record.smallGasSellPrice || resetDefaultPrices.smallSell || ''),
    bigGasBuyPrice: String(record.bigGasBuyPrice || resetDefaultPrices.bigBuy || ''),
    bigGasSellPrice: String(record.bigGasSellPrice || resetDefaultPrices.bigSell || ''),
  });

  return true;
};
const editGas = (entry) => {
  console.log('EDIT CLICKED', entry);

  setGasForm({
    id: entry.id,
    date: entry.date,
    gasType: entry.gasType || 'Taifa / Mihan Gas',
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

    completeSmallCylinderSoldToday: String(entry.completeSmallCylinderSoldToday || ''),
    completeBigCylinderSoldToday: String(entry.completeBigCylinderSoldToday || ''),
    completeSmallCylinderBuyPrice: String(entry.completeSmallCylinderBuyPrice || ''),
    completeSmallCylinderSellPrice: String(entry.completeSmallCylinderSellPrice || ''),
    completeBigCylinderBuyPrice: String(entry.completeBigCylinderBuyPrice || ''),
    completeBigCylinderSellPrice: String(entry.completeBigCylinderSellPrice || ''),

    gasBurnerSoldToday: String(entry.gasBurnerSoldToday || ''),
    gasBurnerBuyPrice: String(entry.gasBurnerBuyPrice || ''),
    gasBurnerSellPrice: String(entry.gasBurnerSellPrice || ''),

    mafigaSoldToday: String(entry.mafigaSoldToday || ''),
    mafigaBuyPrice: String(entry.mafigaBuyPrice || ''),
    mafigaSellPrice: String(entry.mafigaSellPrice || ''),
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
  gasType: 'Taifa / Mihan Gas',
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

if (value === 'Taifa / Mihan Gas' || value === 'Mihan / Taifa Gas') {
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

const products = useMemo(
  () =>
    (data.products || [])
      .filter((product) =>
        String(product?.shop_id || '') === String(shop.id)
      )
      .map(normalizeProduct)
      .filter(
        (product) =>
          product.id &&
          String(product.name || '').trim()
      ),
  [data.products, shop.id]
);

const activePurchaseProducts = useMemo(
  () =>
    products.filter(
      (product) => product.archived !== true
    ),
  [products]
);

const sales = useMemo(
  () =>
    (data.sales || []).filter(
      (sale) =>
        String(sale.shop_id || sale.shopId || '') ===
        String(shop.id)
    ),
  [data.sales, shop.id]
);

const confirmedSales = useMemo(
  () =>
    sales.filter(
      (sale) => sale.confirmed !== false
    ),
  [sales]
);

const shopCalculationData = useMemo(() => {
  const currentShopId = String(
    shop.id || ''
  ).trim();

  const baseSales =
    String(
      data.currentUser?.role || ''
    ) === 'owner'
      ? (data.sales || []).filter(
          (sale) =>
            sale?.confirmed !== false
        )
      : Array.isArray(data.sales)
        ? data.sales
        : [];

  if (
    salesJournalLoading ||
    salesJournalError
  ) {
    return {
      ...data,
      sales: baseSales,
    };
  }

  const salesOutsideTodayForThisShop =
    baseSales.filter((sale) => {
      const saleShopId = String(
        sale?.shop_id ||
          sale?.shopId ||
          ''
      ).trim();

      const saleDate = String(
        sale?.date ||
          sale?.created_at ||
          ''
      ).slice(0, 10);

      return (
        saleShopId !== currentShopId ||
        saleDate !== todayIso
      );
    });

  const journalTodaySales =
    salesJournalRecords
      .filter(
        (record) =>
          String(
            record?.shop_id || ''
          ).trim() === currentShopId &&
          String(
            record?.date || ''
          ).slice(0, 10) === todayIso
      )
      .map((record) => ({
        ...record,
        shop_id: currentShopId,
        date: todayIso,

        // Journal is authoritative for
        // today's shop calculation.
        confirmed: true,
        journalBacked: true,
      }));

  return {
    ...data,
    sales: [
      ...salesOutsideTodayForThisShop,
      ...journalTodaySales,
    ],
  };
}, [
  data,
  shop.id,
  todayIso,
  salesJournalRecords,
  salesJournalLoading,
  salesJournalError,
]);

const pendingSupabaseSales = useMemo(
  () =>
    sales.filter(
      (sale) => sale.confirmed === false
    ),
  [sales]
);

const pendingSaleQueueItems = readSyncQueue().filter(
  (item) =>
    item?.actionType === 'sale_created' &&
    item?.synced === false &&
    String(item?.payload?.shop_id || '') === String(shop.id)
);

const pendingQueueBySaleId = new Map(
  pendingSaleQueueItems.map((item) => [
    String(item?.payload?.id || '').trim(),
    item,
  ])
);

const failedSupabaseSales =
  salesJournalRecords.filter((sale) => {
    const saleId = String(
      sale?.id || ''
    ).trim();

    const queueItem =
      pendingQueueBySaleId.get(saleId);

    return (
      queueItem?.status === 'failed' &&
      String(
        sale?.shop_id || ''
      ) === String(shop.id) &&
      String(
        sale?.date || ''
      ).slice(0, 10) === todayIso
    );
  });

const sendingSupabaseSales = pendingSupabaseSales.filter((sale) => {
  const queueItem = pendingQueueBySaleId.get(
    String(sale?.id || '').trim()
  );

  return queueItem && queueItem?.status !== 'failed';
});

const pendingSupabaseSalesCount = pendingSupabaseSales.length;

const pendingSupabaseSalesAmount = pendingSupabaseSales.reduce(
  (total, sale) =>
    total + Math.max(0, Number(sale?.total || 0)),
  0
);

const failedSupabaseSalesCount = failedSupabaseSales.length;

const failedSupabaseSalesAmount = failedSupabaseSales.reduce(
  (total, sale) =>
    total + Math.max(0, Number(sale?.total || 0)),
  0
);

const firstFailedSale =
  failedSupabaseSales[0] || null;

const firstFailedQueueItem =
  firstFailedSale
    ? pendingQueueBySaleId.get(
        String(
          firstFailedSale?.id || ''
        ).trim()
      )
    : null;

const firstFailedSaleError = String(
  firstFailedQueueItem?.lastError || ''
).trim();

const insufficientStockMatch =
  firstFailedSaleError.match(
    /Insufficient stock for (.+?)\. Available ([\d.]+), requested ([\d.]+)\./i
  );

const failedSaleInstruction =
  insufficientStockMatch
    ? `Tatizo: stock ya ${insufficientStockMatch[1]} kwenye Supabase ni ${insufficientStockMatch[2]}, lakini mauzo yanahitaji ${insufficientStockMatch[3]}. Rekebisha stock kwa kuingiza manunuzi/stoki sahihi, kisha mfumo utajaribu tena. Usirudie mauzo haya.`
    : firstFailedSaleError
      ? `Sababu ya Supabase: ${firstFailedSaleError} Fungua Hali ya Mauzo → Kagua Miamala kwa maelezo na Jaribu Tena baada ya kurekebisha tatizo. Usirudie mauzo haya.`
      : 'Fungua Hali ya Mauzo → Kagua Miamala kuona tatizo la muamala huu. Usirudie mauzo haya.';

const sendingSupabaseSalesCount = sendingSupabaseSales.length;

const sendingSupabaseSalesAmount = sendingSupabaseSales.reduce(
  (total, sale) =>
    total + Math.max(0, Number(sale?.total || 0)),
  0
);

const creditSales = useMemo(
  () =>
    (data.creditSales || []).filter(
      (sale) => String(sale.shop_id) === String(shop.id)
    ),
  [data.creditSales, shop.id]
);

const changeLedger = useMemo(
  () =>
    (data.changeLedger || []).filter(
      (entry) => String(entry.shop_id) === String(shop.id)
    ),
  [data.changeLedger, shop.id]
);

const expenses = useMemo(
  () =>
    (data.expenses || []).filter(
      (expense) => String(expense.shop_id) === String(shop.id)
    ),
  [data.expenses, shop.id]
);

const expenseEntries = useMemo(
  () =>
    (data.expenses || [])
      .map((expense, originalIndex) => ({
        ...expense,
        originalIndex,
      }))
      .filter(
        (expense) =>
          String(expense.shop_id) === String(shop.id)
      ),
  [data.expenses, shop.id]
);

const purchases = useMemo(
  () =>
    (data.purchases || []).filter(
      (purchase) =>
        String(purchase.shop_id) === String(shop.id)
    ),
  [data.purchases, shop.id]
);

const todayPurchases = useMemo(
  () =>
    purchases.filter(
      (purchase) => purchase.date === todayIso
    ),
  [purchases, todayIso]
);

const todayProducts = useMemo(
  () =>
    (data.products || [])
      .filter(
        (product) =>
          String(product.shop_id) === String(shop.id) &&
          product.confirmed !== true
      )
      .map(normalizeProduct),
  [data.products, shop.id]
);

const mobileMoneyEntries = useMemo(
  () =>
    (data.mobileMoneyEntries || []).filter(
      (entry) =>
        String(entry.shop_id) === String(shop.id)
    ),
  [data.mobileMoneyEntries, shop.id]
);

const todayMobileMoneyEntries = useMemo(
  () =>
    mobileMoneyEntries.filter(
      (entry) => entry.date === todayIso
    ),
  [mobileMoneyEntries, todayIso]
);
const isOwnerUser = String(data.currentUser?.role || '') === 'owner';
const isEditingMobileMoney = Boolean(mobileMoneyForm.id);
const shouldShowMobileMoneyWarning = !isOwnerUser && todayMobileMoneyEntries.length > 0;
const shouldDisableMobileMoneySave = !isOwnerUser && todayMobileMoneyEntries.length > 0 && !isEditingMobileMoney;

const commissionRecordsForSelectedMonth = (data.monthlyWakalaCommissions || []).filter(
  (record) => String(record.commissionMonth || '') === String(commissionReportMonth)
);

const getCommissionAmountFromRows = (rows = [], nameKey, selectedName) =>
  (Array.isArray(rows) ? rows : [])
    .filter((row) => String(row?.[nameKey] || '').trim() === String(selectedName).trim())
    .reduce((sum, row) => sum + Number(row.amount || row.commission || 0), 0);

const commissionShopRows = (data.shops || []).map((reportShop) => {
  const shopRecords = commissionRecordsForSelectedMonth.filter(
    (record) => String(record.shop_id || '') === String(reportShop.id)
  );

  const mobileTotal = shopRecords.reduce(
    (sum, record) => sum + Number(record.mobileTotal || 0),
    0
  );

  const bankTotal = shopRecords.reduce(
    (sum, record) => sum + Number(record.bankTotal || 0),
    0
  );

  const mobileBreakdown = Object.fromEntries(
    MOBILE_PROVIDERS.map((provider) => [
      provider,
      shopRecords.reduce(
        (sum, record) =>
          sum + getCommissionAmountFromRows(record.mobileCommissions || [], 'provider', provider),
        0
      ),
    ])
  );

  const bankBreakdown = Object.fromEntries(
    BANKS.map((bankName) => [
      bankName,
      shopRecords.reduce(
        (sum, record) =>
          sum + getCommissionAmountFromRows(record.bankCommissions || [], 'bankName', bankName),
        0
      ),
    ])
  );

  const recorded = shopRecords.length > 0;

  return {
    shopId: reportShop.id,
    shopName: reportShop.name,
    mobileTotal,
    bankTotal,
    grandTotal: mobileTotal + bankTotal,
    recorded,
    status: recorded ? t(language, 'Recorded', 'Imejazwa') : t(language, 'Missing', 'Haijajazwa'),
    mobileBreakdown,
    bankBreakdown,
  };
});

const commissionSummaryTotals = {
  mobileTotal: commissionShopRows.reduce((sum, row) => sum + Number(row.mobileTotal || 0), 0),
  bankTotal: commissionShopRows.reduce((sum, row) => sum + Number(row.bankTotal || 0), 0),
  grandTotal: commissionShopRows.reduce((sum, row) => sum + Number(row.grandTotal || 0), 0),
  recordedShopCount: commissionShopRows.filter((row) => row.recorded).length,
  totalShopCount: (data.shops || []).length,
  missingShopNames: commissionShopRows
    .filter((row) => !row.recorded)
    .map((row) => row.shopName),
};

const commissionNetworkBankRows = commissionShopRows.map((row) => ({
  shopId: row.shopId,
  shopName: row.shopName,
  recorded: row.recorded,
  mobileBreakdown: row.mobileBreakdown,
  bankBreakdown: row.bankBreakdown,
}));

const monthlyExpenseCategories = [
  'Home Expenses',
  'Salaries',
  'Medical',
  'TRA',
  'Electricity',
  'Fare',
];

const monthlyExpensesForSelectedMonth = (data.expenses || []).filter((expense) =>
  String(expense.date || '').slice(0, 7) === String(expenseReportMonth)
);

const getExpenseAmountByTitle = (rows = [], title) =>
  (Array.isArray(rows) ? rows : [])
    .filter(
      (row) =>
        String(row.title || row.description || '').trim().toLowerCase() ===
        String(title || '').trim().toLowerCase()
    )
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

const monthlyExpenseShopRows = (data.shops || []).map((reportShop) => {
  const shopExpensesForMonth = monthlyExpensesForSelectedMonth.filter(
    (expense) => String(expense.shop_id || '') === String(reportShop.id)
  );

  const categoryBreakdown = Object.fromEntries(
    monthlyExpenseCategories.map((categoryName) => [
      categoryName,
      getExpenseAmountByTitle(shopExpensesForMonth, categoryName),
    ])
  );

  const knownCategoryNames = monthlyExpenseCategories.map((name) => name.toLowerCase());

  const otherExpenses = shopExpensesForMonth
    .filter(
      (expense) =>
        !knownCategoryNames.includes(
          String(expense.title || expense.description || '').trim().toLowerCase()
        )
    )
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const total = Object.values(categoryBreakdown).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  ) + otherExpenses;

  return {
    shopId: reportShop.id,
    shopName: reportShop.name,
    ...categoryBreakdown,
    Other: otherExpenses,
    total,
    recorded: shopExpensesForMonth.length > 0,
    status:
      shopExpensesForMonth.length > 0
        ? t(language, 'Recorded', 'Imejazwa')
        : t(language, 'Missing', 'Haijajazwa'),
  };
});

const monthlyExpenseSummaryTotals = {
  homeExpenses: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row['Home Expenses'] || 0), 0),
  salaries: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.Salaries || 0), 0),
  medical: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.Medical || 0), 0),
  tra: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.TRA || 0), 0),
  electricity: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.Electricity || 0), 0),
  fare: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.Fare || 0), 0),
  other: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.Other || 0), 0),
  grandTotal: monthlyExpenseShopRows.reduce((sum, row) => sum + Number(row.total || 0), 0),
  recordedShopCount: monthlyExpenseShopRows.filter((row) => row.recorded).length,
  totalShopCount: (data.shops || []).length,
};
const gasEntries = (data.gasEntries || []).filter(
  (g) => String(g.shop_id) === String(shop.id)
);

const todayGasEntries = gasEntries.filter((g) => g.date === todayISO());

const reportDateValue =
  reportPreset === 'date'
    ? { start: reportStartDate, end: reportEndDate }
    : reportDate;

const historicalSalesPresets = new Set([
  'lastmonth',
  '3months',
  '6months',
  'year',
  'date',
]);

const shouldLoadOldSalesFromSupabase =
  historicalSalesPresets.has(reportPreset);

useEffect(() => {
  if (!shouldLoadOldSalesFromSupabase) {
    setReportSalesSource([]);
    setReportSalesLoading(false);
    return;
  }

  let cancelled = false;

  const loadHistoricalSalesForReport = async () => {
    const now = startOfDay(new Date());

    const startOfThisMonthForReport =
      startOfMonth(now);

    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const endOfLastMonth = addDays(
      startOfThisMonthForReport,
      -1
    );

    let startDate = todayISO();
    let endDate = todayISO();

    if (reportPreset === 'lastmonth') {
      startDate = todayISO(startOfLastMonth);
      endDate = todayISO(endOfLastMonth);
    } else if (reportPreset === '3months') {
      startDate = daysAgoISO(89);
    } else if (reportPreset === '6months') {
      startDate = daysAgoISO(179);
    } else if (reportPreset === 'year') {
      startDate = todayISO(
        new Date(now.getFullYear(), 0, 1)
      );
    } else if (reportPreset === 'date') {
      startDate = reportStartDate;
      endDate = reportEndDate;
    }

    if (!startDate || !endDate) {
      setReportSalesSource([]);
      setReportSalesLoading(false);
      return;
    }

    if (startDate > endDate) {
      setReportSalesSource([]);
      setReportSalesLoading(false);

      console.error(
        'Historical sales start date cannot be after the end date.'
      );
      return;
    }

    const cacheKey = [
      String(shop.id),
      String(reportPreset),
      String(startDate),
      String(endDate),
    ].join('|');

    const cachedSales =
      reportSalesCacheRef.current.get(cacheKey);

    if (Array.isArray(cachedSales)) {
      setReportSalesSource(cachedSales);
      setReportSalesLoading(false);
      return;
    }

    try {
      setReportSalesLoading(true);

      const { data: historicalSales, error } =
        await supabase
          .from('sales')
          .select(
            'id, shop_id, items, total, type, date, created_at'
          )
          .eq('shop_id', String(shop.id))
          .gte('date', startDate)
          .lte('date', endDate)
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      if (cancelled) return;

      const confirmedHistoricalSales = (
        Array.isArray(historicalSales)
          ? historicalSales
          : []
      ).map((sale) => ({
        ...sale,
        shop_id: String(
          sale?.shop_id || shop.id
        ).trim(),
        date:
          sale?.date ||
          (sale?.created_at
            ? String(sale.created_at).slice(0, 10)
            : todayISO()),
        confirmed: true,
      }));

      reportSalesCacheRef.current.set(
        cacheKey,
        confirmedHistoricalSales
      );

      setReportSalesSource(
        confirmedHistoricalSales
      );
    } catch (historicalSalesError) {
      if (cancelled) return;

      console.error(
        'Failed to load the selected historical sales period:',
        historicalSalesError
      );

      setReportSalesSource([]);

      alert(
        t(
          language,
          'The selected historical sales period could not be loaded. Current operational information remains available.',
          'Mauzo ya kipindi ulichochagua hayakuweza kupakiwa. Taarifa za sasa zinaendelea kupatikana.'
        )
      );
    } finally {
      if (!cancelled) {
        setReportSalesLoading(false);
      }
    }
  };

  loadHistoricalSalesForReport();

  return () => {
    cancelled = true;
  };
}, [
  shop.id,
  reportPreset,
  reportStartDate,
  reportEndDate,
  shouldLoadOldSalesFromSupabase,
  language,
]);

const salesSourceForFiltering =
  shouldLoadOldSalesFromSupabase
    ? mergeRowsById(
        reportSalesSource,
        confirmedSales
      )
    : confirmedSales;

const filteredSales = useMemo(
  () =>
    filterByPreset(
      salesSourceForFiltering.map((sale) => ({
        ...sale,
        date: sale.created_at
          ? todayISO(new Date(sale.created_at))
          : sale.date,
      })),
      reportPreset,
      reportPreset === 'date'
        ? {
            start: reportStartDate,
            end: reportEndDate,
          }
        : reportDate
    ),
  [
    salesSourceForFiltering,
    reportPreset,
    reportDate,
    reportStartDate,
    reportEndDate,
  ]
);

const filteredPurchases = useMemo(
  () =>
    filterByPreset(
      purchases,
      reportPreset,
      reportPreset === 'date'
        ? {
            start: reportStartDate,
            end: reportEndDate,
          }
        : reportDate
    ),
  [
    purchases,
    reportPreset,
    reportDate,
    reportStartDate,
    reportEndDate,
  ]
);

const filteredExpenses = useMemo(
  () =>
    filterByPreset(
      expenses,
      reportPreset,
      reportPreset === 'date'
        ? {
            start: reportStartDate,
            end: reportEndDate,
          }
        : reportDate
    ),
  [
    expenses,
    reportPreset,
    reportDate,
    reportStartDate,
    reportEndDate,
  ]
);

const filteredMobileMoney = useMemo(
  () =>
    filterByPreset(
      mobileMoneyEntries,
      reportPreset,
      reportPreset === 'date'
        ? {
            start: reportStartDate,
            end: reportEndDate,
          }
        : reportDate
    ),
  [
    mobileMoneyEntries,
    reportPreset,
    reportDate,
    reportStartDate,
    reportEndDate,
  ]
);

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

const dashboardSales = useMemo(
  () =>
    (shopCalculationData.sales || [])
      .filter(
        (sale) =>
          String(
            sale?.shop_id ||
              sale?.shopId ||
              ''
          ) === String(shop.id)
      )
      .map((sale) => {
        const computedDate =
          String(
            sale.date || ''
          ).slice(0, 10) ||
          (sale.created_at
            ? todayISO(
                new Date(
                  sale.created_at
                )
              )
            : '');

        return {
          ...sale,
          date: computedDate,
        };
      }),
  [
    shopCalculationData.sales,
    shop.id,
  ]
);

const dashboardFilteredSales = useMemo(
  () =>
    filterByPreset(
      dashboardSales,
      reportPreset,
      dashboardDateValue
    ),
  [dashboardSales, reportPreset, dashboardDateValue]
);

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

const liveRemittancePosition =
  getLiveRemittanceShopPosition({
    data: shopCalculationData,
    shopId: shop.id,
    calculationDateKey: todayISO(),
  });
const allShopRemittanceDateRows = [];

let shopRemittanceDateCursor = startOfDay(
  AUTOMATIC_EXPENSE_PILOT_START_DATE
);

const shopRemittanceFinalDate =
  startOfDay(new Date());

while (
  shopRemittanceDateCursor <=
  shopRemittanceFinalDate
) {
  allShopRemittanceDateRows.push({
    date: todayISO(shopRemittanceDateCursor),
  });

  shopRemittanceDateCursor = addDays(
    shopRemittanceDateCursor,
    1
  );
}

const selectedShopRemittanceDateKeys =
  filterByPreset(
    allShopRemittanceDateRows,
    reportPreset,
    dashboardDateValue
  ).map((row) => row.date);

const selectedShopRemittanceSummary =
  selectedShopRemittanceDateKeys.reduce(
    (summary, dateKey) => {
      const position =
        getLiveRemittanceShopPosition({
          data: shopCalculationData,
          shopId: shop.id,
          calculationDateKey: dateKey,
        });

      return {
        ownerProfit:
          summary.ownerProfit +
          Math.max(
            0,
            Number(position?.ownerProfit || 0)
          ),


        netProfit:
          summary.netProfit +
          Math.max(
            0,
            Number(position?.netProfit || 0)
          ),

        normalAmount:
          summary.normalAmount +
          Math.max(
            0,
            Number(
              position?.normalAmountRequiredToSubmit ||
                position?.amountRequiredToSubmit ||
                0
            )
          ),

        gasAmount:
          summary.gasAmount +
          Math.max(
            0,
            Number(
              position?.gasDistributableAmount || 0
            )
          ),

        cashAmount:
          summary.cashAmount +
          Math.max(
            0,
            Number(
              position?.cashAmountRequiredToSubmit ||
                0
            )
          ),
      };
    },
    {
      ownerProfit: 0,
      netProfit: 0,
      normalAmount: 0,
      gasAmount: 0,
      cashAmount: 0,
    }
  );
const remittanceNormalAmount = Number(
  liveRemittancePosition?.normalAmountRequiredToSubmit ||
    liveRemittancePosition?.amountRequiredToSubmit ||
    0
);

const remittanceGasAmount = Number(
  liveRemittancePosition?.gasDistributableAmount || 0
);

const todayExpenses = filterByPreset(
  expenses,
  reportPreset,
  dashboardDateValue
).reduce(
  (a, e) => a + Number(e.amount || 0),
  0
);

const todayGasProfit = filterByPreset(gasEntries, reportPreset, dashboardDateValue)
  .reduce((a, x) => a + getGasEntryProfitTotal(x), 0);

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

      const itemQty = Number(item.quantity || 0);
const itemBuyPrice = Number(item.buyPrice ?? map[item.productId].buyPrice ?? 0);
const itemSellPrice = Number(item.sellPrice ?? item.price ?? map[item.productId].sellPrice ?? 0);

map[item.productId].soldQty += itemQty;
map[item.productId].profit += itemQty * (itemSellPrice - itemBuyPrice);
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
const shopPeriodLabel = {
  today: t(language, 'Today', 'Leo'),
  yesterday: t(language, 'Yesterday', 'Jana'),
  week: t(language, 'This week to date', 'Wiki hii hadi leo'),
  lastweek: t(language, 'Last week', 'Wiki iliyopita'),
  month: t(language, 'This month to date', 'Mwezi huu hadi leo'),
  lastmonth: t(language, 'Last month', 'Mwezi uliopita'),
  '3months': t(language, 'Last 3 months', 'Miezi 3 iliyopita'),
  '6months': t(language, 'Last 6 months', 'Miezi 6 iliyopita'),
  year: t(language, 'This year', 'Mwaka huu'),
  date: t(language, 'Selected dates', 'Tarehe ulizochagua'),
}[reportPreset] || t(language, 'Selected period', 'Kipindi ulichochagua');

const remittanceControlledOwnerProfit = Number(
  liveRemittancePosition?.ownerProfit || 0
);

const remittanceControlledRetailNetProfit = Number(
  liveRemittancePosition?.netProfit || 0
);

const legacyRetailProfit =
  salesReportRows.totalProfit - todayExpenses;

const todayProfit =
  selectedShopRemittanceSummary.ownerProfit;

const todayRetailProfit =
  selectedShopRemittanceSummary.netProfit;

const totalBusinessProfit =
  todayRetailProfit +
  todayGasProfit +
  todayWakalaCommission;
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

  const commitSale = async (
    saleBaseData = data
  ) => {
    if (!cart.length) return;

if (saleLock.current) return;
saleLock.current = true;

setSaleSaving(true);

    const safeSaleBaseData =
      normalizeData(
        saleBaseData || data
      );

    const nextProducts = [
      ...safeSaleBaseData.products,
    ];
    for (const item of cart) {
      const idx = nextProducts.findIndex((p) => p.id === item.productId);
      if (idx >= 0) {
        const currentStock = Number(nextProducts[idx].stockBaseQty || 0);
        if (Number(item.quantity || 0) > currentStock) {
  setSaleError(
  t(
    language,
    `Insufficient stock for ${item.name || nextProducts[idx].name || 'this product'}. Available: ${formatQty(currentStock)}; requested: ${formatQty(Number(item.quantity || 0))}.`,
    `Stock haitoshi kwa ${item.name || nextProducts[idx].name || 'bidhaa hii'}. Iliyopo: ${formatQty(currentStock)}; iliyoombwa: ${formatQty(Number(item.quantity || 0))}.`
  )
);
  setSaleSaving(false);
saleLock.current = false;
  return;
}
      }
    }

    let saleProtectedLocally = false;

    try {
  cart.forEach((item) => {
    const idx = nextProducts.findIndex((p) => p.id === item.productId);
    if (idx >= 0) {
      nextProducts[idx] = {
        ...normalizeProduct(nextProducts[idx]),
        stockBaseQty: roundStockQty(
          Math.max(
            0,
            Number(nextProducts[idx].stockBaseQty || 0) - Number(item.quantity || 0)
          ),
          2
        ),
      };
    }
  });

  const total = cart.reduce((a, c) => a + c.total, 0);

  const saleCreatedAt = new Date();

  const saleDateInTanzania = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Africa/Dar_es_Salaam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).format(saleCreatedAt);

  const saleRecord = {
    id: `sale-${saleCreatedAt.getTime()}`,
    shop_id: shop.id,
    items: cart,
    total,
    type: 'cash',
    date: saleDateInTanzania,
    created_at: saleCreatedAt.toISOString(),
    confirmed: false,
  };

  const journalCreatedAt =
    new Date().toISOString();

  const liveJournalRecord = {
    id: saleRecord.id,
    shop_id: saleRecord.shop_id,
    items: (Array.isArray(
      saleRecord.items
    )
      ? saleRecord.items
      : []
    ).map((item) => ({
      ...item,
    })),
    total: Number(
      saleRecord.total || 0
    ),
    type:
      saleRecord.type || 'cash',
    date: saleRecord.date,
    created_at:
      saleRecord.created_at,
    status: 'pending',
    integrityStatus: 'ok',
    source: 'live_sale',
    createdAt: journalCreatedAt,
    updatedAt: journalCreatedAt,
  };

  await writeSalesJournalRecord(
    liveJournalRecord
  );

  setSalesJournalRecords((prev) =>
    [
      ...prev.filter(
        (record) =>
          String(record?.id || '') !==
          String(
            liveJournalRecord.id
          )
      ),
      liveJournalRecord,
    ].sort(
      (a, b) =>
        new Date(
          a?.created_at || 0
        ) -
        new Date(
          b?.created_at || 0
        )
    )
  );

  clearCartDraft(shop.id);
  setCart([]);
  setSaleError('');

console.log('SALE DATE TEST', {
  date: saleRecord.date,
  created_at: saleRecord.created_at,
  isoDateFromCreatedAt: String(saleRecord.created_at).slice(0, 10),
  localReadable: new Date(saleRecord.created_at).toLocaleString(),
  localDateFromCreatedAt: todayISO(new Date(saleRecord.created_at)),
});

  const salePayload = {
    id: saleRecord.id,
    shop_id: saleRecord.shop_id,
    items: saleRecord.items,
    total: saleRecord.total,
    type: saleRecord.type,
    date: saleRecord.date,
    created_at: saleRecord.created_at,
  };

  addToSyncQueue(
    'sale_created',
    salePayload
  );

  saleProtectedLocally = true;

  await saveData({
    ...safeSaleBaseData,
    products: nextProducts,
    sales: [
      ...safeSaleBaseData.sales,
      saleRecord,
    ],
  });


if (navigator.onLine) {
  Promise.resolve()
    .then(async () => {
      await processSyncQueue();

      const currentSaleStillPending =
        readSyncQueue().some(
          (item) =>
            item?.actionType ===
              'sale_created' &&
            item?.synced === false &&
            String(
              item?.payload?.id || ''
            ) === String(saleRecord.id)
        );

      if (currentSaleStillPending) {
        setSyncMessage(
          'Mauzo yamehifadhiwa kwenye kompyuta na yanasubiri kuthibitishwa Supabase.'
        );
        return;
      }

      const {
        data: confirmedShopSales,
        error: confirmedSalesError,
      } = await supabase
        .from('sales')
        .select('*')
        .eq('shop_id', shop.id)
        .gte('date', daysAgoISO(30))
        .order('created_at', {
          ascending: false,
        });

      if (confirmedSalesError) {
        throw confirmedSalesError;
      }

      if (
        !Array.isArray(
          confirmedShopSales
        )
      ) {
        throw new Error(
          'Supabase confirmed sales response was not a valid list.'
        );
      }

      const mappedConfirmedShopSales =
        confirmedShopSales.map(
          (sale) => ({
            ...sale,
            shop_id: String(
              sale.shop_id ||
                sale.shopId ||
                sale.shopid ||
                shop.id
            ).trim(),
            date:
              sale.date ||
              (sale.created_at
                ? String(
                    sale.created_at
                  ).slice(0, 10)
                : todayISO()),
            confirmed: true,
          })
        );

      setData((prev) => {
        const nextData = normalizeData({
          ...prev,
          sales: mergeRowsById(
            Array.isArray(prev.sales)
              ? prev.sales
              : [],
            mappedConfirmedShopSales
          ),
        });

        writeToDB(
          DB_DATA_KEY,
          nextData
        ).catch((dbError) => {
          console.error(
            'Failed to preserve merged confirmed sales:',
            dbError
          );
        });

        return nextData;
      });

      writeStorage(
        STORAGE_LAST_SYNC_KEY,
        Date.now()
      );

      setSyncMessage('Sync complete');
    })
    .catch((syncError) => {
      console.error(
        'Atomic sale sync failed:',
        syncError
      );

      const saleStillPending = readSyncQueue().some(
        (item) =>
          item?.actionType === 'sale_created' &&
          item?.synced === false &&
          String(item?.payload?.id || '') ===
            String(saleRecord.id)
      );

      setSyncMessage(
        saleStillPending
          ? 'Mauzo yamehifadhiwa kwenye kompyuta na yanasubiri kuthibitishwa Supabase.'
          : 'Mauzo yamethibitishwa Supabase.'
      );
    });
}

  console.log('Sending sale to Supabase:', saleRecord);

} catch (err) {
  console.error('Unexpected commitSale error:', err);

  if (saleProtectedLocally) {
    setSyncMessage(
      'Mauzo yamehifadhiwa salama kwenye Journal na yanasubiri kukamilisha sync.'
    );
  } else {
    alert(
      `Unexpected sale error: ${
        err?.message || err
      }`
    );
  }
} finally {
  setSaleSaving(false);
  saleLock.current = false;
}
};

const commitSaleWithCrossTabProtection =
  async () => {
    if (!cart.length) return;

    if (
      saleCrossTabWaitLock.current ||
      saleLock.current
    ) {
      return;
    }

    saleCrossTabWaitLock.current = true;

    try {
      const runProtectedSale =
        async () => {
          let latestStoredData = null;

          try {
            latestStoredData =
              await readFromDB(
                DB_DATA_KEY
              );
          } catch (latestReadError) {
            console.error(
              'Could not read latest POS data before sale:',
              latestReadError
            );
          }

          const saleBaseData =
            normalizeData({
              ...(
                latestStoredData ||
                data
              ),
              currentUser:
                data.currentUser,
            });

          await commitSale(
            saleBaseData
          );
        };

      if (
        typeof navigator !==
          'undefined' &&
        navigator.locks?.request
      ) {
        await navigator.locks.request(
          `rafikiai-pos-sale-commit-${shop.id}`,
          runProtectedSale
        );
      } else {
        await runProtectedSale();
      }
    } finally {
      saleCrossTabWaitLock.current =
        false;
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

      const awakenedFailedSales =
        wakeFailedSaleRetriesForProducts(
          rowsToQueue.map(
            (productRow) =>
              productRow.id
          ),
          shop.id
        );

      if (awakenedFailedSales) {
        processSyncQueue().catch(
          (syncError) => {
            console.error(
              'Automatic failed-sale retry after product correction failed:',
              syncError
            );
          }
        );
      }
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

const savePurchaseRows = async () => {
  const roundUpToNearest50 = (value) =>
    Math.ceil(Number(value || 0) / 50) * 50;

  const preparedRows = [];
  const selectedProductIds = new Set();

  for (const [index, row] of purchaseRows.entries()) {
    const selectedProduct = activePurchaseProducts.find(
      (product) => String(product.id) === String(row.productId)
    );

    if (!selectedProduct) {
      alert(
        t(
          language,
          `Please select an active product on row ${index + 1}.`,
          `Tafadhali chagua bidhaa halali kwenye mstari wa ${index + 1}.`
        )
      );
      return;
    }

    if (selectedProductIds.has(String(selectedProduct.id))) {
      alert(
        t(
          language,
          `The product "${selectedProduct.name}" appears more than once. Combine its quantity into one row.`,
          `Bidhaa "${selectedProduct.name}" imechaguliwa zaidi ya mara moja. Unganisha idadi yake kwenye mstari mmoja.`
        )
      );
      return;
    }

    selectedProductIds.add(String(selectedProduct.id));

    const quantity = Number(row.quantity);
    const unitCost = Number(row.unitCost);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert(
        t(
          language,
          `Enter a valid quantity for ${selectedProduct.name}.`,
          `Weka idadi sahihi ya ${selectedProduct.name}.`
        )
      );
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost <= 0) {
      alert(
        t(
          language,
          `Enter a valid purchase price for ${selectedProduct.name}.`,
          `Weka bei sahihi ya kununua ${selectedProduct.name}.`
        )
      );
      return;
    }

    if (!row.date) {
      alert(
        t(
          language,
          `Enter the purchase date for ${selectedProduct.name}.`,
          `Weka tarehe ya manunuzi ya ${selectedProduct.name}.`
        )
      );
      return;
    }

    const oldBuyPrice = Number(selectedProduct.buyPrice || 0);
    const oldSellPrice = Number(selectedProduct.sellPrice || 0);
    let nextSellPrice = oldSellPrice;

    if (unitCost !== oldBuyPrice) {
      const oldProfitAmount = oldSellPrice - oldBuyPrice;
      const suggestedBase =
        oldProfitAmount > 0
          ? unitCost + oldProfitAmount
          : unitCost + 50;

      const suggestedSellPrice =
        roundUpToNearest50(suggestedBase);

      const enteredPrice = window.prompt(
        t(
          language,
          `Buy price for ${selectedProduct.name} changed from TZS ${oldBuyPrice} to TZS ${unitCost}.
Suggested selling price: TZS ${suggestedSellPrice}.
Confirm or enter another selling price.`,
          `Bei ya kununua ${selectedProduct.name} imebadilika kutoka TZS ${oldBuyPrice} hadi TZS ${unitCost}.
Bei ya kuuza inayopendekezwa: TZS ${suggestedSellPrice}.
Thibitisha au weka bei nyingine ya kuuza.`
        ),
        String(suggestedSellPrice)
      );

      if (enteredPrice === null) {
        alert(
          t(
            language,
            'Purchase recording was cancelled. Nothing was saved.',
            'Uhifadhi wa manunuzi umeghairiwa. Hakuna kilichohifadhiwa.'
          )
        );
        return;
      }

      const parsedSellPrice = Number(enteredPrice);

      if (
        !Number.isFinite(parsedSellPrice) ||
        parsedSellPrice <= unitCost
      ) {
        alert(
          t(
            language,
            'The selling price must be greater than the purchase price.',
            'Bei ya kuuza lazima iwe kubwa kuliko bei ya kununua.'
          )
        );
        return;
      }

      if (parsedSellPrice % 50 !== 0) {
        alert(
          t(
            language,
            'The selling price must follow TZS 50 steps.',
            'Bei ya kuuza lazima ifuate hatua za TZS 50.'
          )
        );
        return;
      }

      nextSellPrice = parsedSellPrice;
    }

    preparedRows.push({
      purchaseId:
        row.id ||
        `purchase-${crypto.randomUUID()}`,
      productId: selectedProduct.id,
      quantity,
      unitCost,
      sellingPrice: nextSellPrice,
      date: row.date || todayISO(),
      expiryDate: row.expiryDate || '',
      notes: row.notes || '',
    });
  }

  if (!preparedRows.length) {
    alert(
      t(
        language,
        'Add at least one purchase.',
        'Weka angalau manunuzi moja.'
      )
    );
    return;
  }

  if (purchaseLock.current) return;

  purchaseLock.current = true;
  setPurchaseSaving(true);

  const purchaseByProductId = new Map(
    preparedRows.map((row) => [
      String(row.productId),
      row,
    ])
  );

  const localProductsAfterPurchase = (
    data.products || []
  ).map((product) => {
    const purchaseRow = purchaseByProductId.get(
      String(product.id)
    );

    if (!purchaseRow) {
      return product;
    }

    const currentStock = Number(
      product.stockBaseQty ??
        product.stockQty ??
        product.stock ??
        0
    );

    const newStock =
      currentStock +
      Number(purchaseRow.quantity || 0);

    return normalizeProduct({
      ...product,
      buyPrice: Number(purchaseRow.unitCost || 0),
      sellPrice: Number(
        purchaseRow.sellingPrice ||
          product.sellPrice ||
          0
      ),
      stockBaseQty: newStock,
      stockQty: newStock,
      expiryDate:
        purchaseRow.expiryDate ||
        product.expiryDate ||
        '',
    });
  });

  const localPurchaseIds = new Set(
    preparedRows.map((row) =>
      String(row.purchaseId)
    )
  );

  const localPurchaseRows = preparedRows.map(
    (row) => ({
      id: row.purchaseId,
      shop_id: String(shop.id),
      productId: row.productId,
      quantity: Number(row.quantity || 0),
      price:
        Number(row.quantity || 0) *
        Number(row.unitCost || 0),
      unitCost: Number(row.unitCost || 0),
      date: row.date || todayISO(),
      expiryDate: row.expiryDate || '',
      expirydate: row.expiryDate || '',
      notes: row.notes || '',
      confirmed: false,
      syncStatus: 'pending',
      created_at: new Date().toISOString(),
    })
  );

  preparedRows.forEach((row) => {
    addToSyncQueue('purchase_created', {
      id: row.purchaseId,
      shop_id: String(shop.id),
      productId: row.productId,
      quantity: Number(row.quantity || 0),
      unitCost: Number(row.unitCost || 0),
      sellingPrice: Number(
        row.sellingPrice || 0
      ),
      date: row.date || todayISO(),
      expiryDate: row.expiryDate || '',
      notes: row.notes || '',
      products: [
        {
          id: row.productId,
          sellingprice: Number(
            row.sellingPrice || 0
          ),
          sellPrice: Number(
            row.sellingPrice || 0
          ),
        },
      ],
    });
  });

  await saveData({
    ...data,
    products: localProductsAfterPurchase,
    purchases: [
      ...(data.purchases || []).filter(
        (purchase) =>
          !localPurchaseIds.has(
            String(purchase.id)
          )
      ),
      ...localPurchaseRows,
    ],
  });

  setPurchaseRows([
    {
      ...emptyPurchaseRow,
      productSearch: '',
    },
  ]);

  const purchasePendingMessage = t(
    language,
    'Purchases saved locally. Supabase sync is pending. You can continue selling.',
    'Manunuzi yamehifadhiwa. Yanasubiri kuingia Supabase. Unaweza kuendelea na mauzo.'
  );

  setSyncMessage(purchasePendingMessage);

  window.setTimeout(() => {
    setSyncMessage((currentMessage) =>
      currentMessage === purchasePendingMessage
        ? ''
        : currentMessage
    );
  }, 10000);

  purchaseLock.current = false;
  setPurchaseSaving(false);

  if (navigator.onLine) {
    wakeFailedSaleRetriesForProducts(
      preparedRows.map(
        (row) => row.productId
      ),
      shop.id
    );

    processSyncQueue().catch((syncError) => {
      console.error(
        'Queued purchase sync error:',
        syncError
      );
    });
  }

  return;

  try {
    setSyncMessage(
      t(
        language,
        'Saving purchases securely...',
        'Inahifadhi manunuzi kwa usalama...'
      )
    );

    const { data: savedResult, error: saveError } =
      await supabase.rpc('record_existing_purchases', {
        p_shop_id: String(shop.id),
        p_rows: preparedRows,
      });

    if (saveError) {
      throw saveError;
    }

    if (
      !Array.isArray(savedResult) ||
      savedResult.length !== preparedRows.length
    ) {
      throw new Error(
        'Supabase did not confirm every purchase row.'
      );
    }

    const affectedProductIds = [
      ...new Set(
        preparedRows.map((row) => String(row.productId))
      ),
    ];

    const savedPurchaseIds = preparedRows.map(
      (row) => String(row.purchaseId)
    );

    const [
      { data: freshProductRows, error: productRefreshError },
      { data: freshPurchaseRows, error: purchaseRefreshError },
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('shop_id', String(shop.id))
        .in('id', affectedProductIds),

      supabase
        .from('purchases')
        .select('*')
        .eq('shop_id', String(shop.id))
        .in('id', savedPurchaseIds),
    ]);

    if (productRefreshError) {
      throw productRefreshError;
    }

    if (purchaseRefreshError) {
      throw purchaseRefreshError;
    }

    if (
      !Array.isArray(freshProductRows) ||
      freshProductRows.length !== affectedProductIds.length
    ) {
      throw new Error(
        'The updated product stock could not be fully verified.'
      );
    }

    if (
      !Array.isArray(freshPurchaseRows) ||
      freshPurchaseRows.length !== savedPurchaseIds.length
    ) {
      throw new Error(
        'The saved purchases could not be fully verified.'
      );
    }

    const refreshedProducts = freshProductRows.map(
      (product) =>
        normalizeProduct({
          ...product,
          buyPrice: Number(product.buyingprice || 0),
          sellPrice: Number(product.sellingprice || 0),
          stockBaseQty: Number(product.stock || 0),
          stockQty: Number(product.stock || 0),
          baseUnit: product.baseunit || 'pc',
          expiryDate: product.expirydate || '',
          minStockLevel: Number(
            product.minstocklevel || 5
          ),
          standardProductCode:
            product.standard_product_code || '',
          archived: Boolean(product.archived),
          confirmed: true,
        })
    );

    const affectedProductIdSet = new Set(
      affectedProductIds
    );

    const savedPurchaseIdSet = new Set(
      savedPurchaseIds
    );

    const nextProducts = [
      ...data.products.filter(
        (product) =>
          !affectedProductIdSet.has(String(product.id))
      ),
      ...refreshedProducts,
    ];

    const nextPurchases = [
      ...data.purchases.filter(
        (purchase) =>
          !savedPurchaseIdSet.has(String(purchase.id))
      ),
      ...freshPurchaseRows.map((purchase) => ({
        ...purchase,
        shop_id: String(purchase.shop_id || '').trim(),
        date:
          purchase.date ||
          String(purchase.created_at || '').slice(0, 10) ||
          todayISO(),
        confirmed: true,
      })),
    ];

    await saveData({
      ...data,
      products: nextProducts,
      purchases: nextPurchases,
    });

    setPurchaseRows([
      {
        ...emptyPurchaseRow,
        productSearch: '',
      },
    ]);

    setSyncMessage(
      t(
        language,
        'Purchases saved and stock confirmed in Supabase',
        'Manunuzi yamehifadhiwa na stock imethibitishwa Supabase'
      )
    );

    alert(
      t(
        language,
        'Purchases and product stock were saved successfully.',
        'Manunuzi na stock ya bidhaa vimehifadhiwa kikamilifu.'
      )
    );
  } catch (purchaseError) {
    console.error(
      'Secure purchase recording failed:',
      purchaseError
    );

    setSyncMessage(
      t(
        language,
        'Purchase saving failed',
        'Uhifadhi wa manunuzi umeshindikana'
      )
    );

    alert(
      t(
        language,
        `Purchases were not completed: ${
          purchaseError?.message || 'Unknown error'
        }. The form has not been cleared.`,
        `Manunuzi hayajakamilika: ${
          purchaseError?.message || 'Hitilafu isiyojulikana'
        }. Fomu haijafutwa.`
      )
    );
  } finally {
    purchaseLock.current = false;
    setPurchaseSaving(false);
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
        'This fixed expense is now controlled by the Remittance section. Please enter only additional expenses here.',
        'Hili ni matumizi ya kudumu yanayosimamiwa sasa na sehemu ya Remittance. Tafadhali ingiza matumizi ya ziada tu hapa.'
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
    SmallCylindersWithGas: Number(row.smallCylindersWithGas || 0),
    BigCylindersWithGas: Number(row.bigCylindersWithGas || 0),
    SmallEmptyCylinders: Number(row.smallEmptyCylinders || 0),
    BigEmptyCylinders: Number(row.bigEmptyCylinders || 0),

    SmallRefillSold: Number(row.smallGasSoldToday || 0),
    BigRefillSold: Number(row.bigGasSoldToday || 0),
    SmallRefillBuyPrice: Number(row.smallGasBuyPrice || 0),
    SmallRefillSellPrice: Number(row.smallGasSellPrice || 0),
    BigRefillBuyPrice: Number(row.bigGasBuyPrice || 0),
    BigRefillSellPrice: Number(row.bigGasSellPrice || 0),

    CompleteSmallCylindersSold: Number(row.completeSmallCylinderSoldToday || 0),
    CompleteBigCylindersSold: Number(row.completeBigCylinderSoldToday || 0),
    CompleteSmallCylinderBuyPrice: Number(row.completeSmallCylinderBuyPrice || 0),
    CompleteSmallCylinderSellPrice: Number(row.completeSmallCylinderSellPrice || 0),
    CompleteBigCylinderBuyPrice: Number(row.completeBigCylinderBuyPrice || 0),
    CompleteBigCylinderSellPrice: Number(row.completeBigCylinderSellPrice || 0),

    GasBurnersSold: Number(row.gasBurnerSoldToday || 0),
    GasBurnerBuyPrice: Number(row.gasBurnerBuyPrice || 0),
    GasBurnerSellPrice: Number(row.gasBurnerSellPrice || 0),

    MafigaSold: Number(row.mafigaSoldToday || 0),
    MafigaBuyPrice: Number(row.mafigaBuyPrice || 0),
    MafigaSellPrice: Number(row.mafigaSellPrice || 0),

    TotalGasBusinessProfit: Number(getGasEntryProfitTotal(row) || 0),
  }));
    } else if (reportType === 'monthlyExpensesReport') {
      rows = monthlyExpenseShopRows.map((row) => ({
        ShopName: row.shopName,
        ExpenseMonth: expenseReportMonth,
        HomeExpenses: Number(row['Home Expenses'] || 0),
        Salaries: Number(row.Salaries || 0),
        Medical: Number(row.Medical || 0),
        TRA: Number(row.TRA || 0),
        Electricity: Number(row.Electricity || 0),
        Fare: Number(row.Fare || 0),
        OtherExpenses: Number(row.Other || 0),
        Total: Number(row.total || 0),
        Status: row.status,
      }));

      rows.push({
        ShopName: 'TOTAL',
        ExpenseMonth: expenseReportMonth,
        HomeExpenses: Number(monthlyExpenseSummaryTotals.homeExpenses || 0),
        Salaries: Number(monthlyExpenseSummaryTotals.salaries || 0),
        Medical: Number(monthlyExpenseSummaryTotals.medical || 0),
        TRA: Number(monthlyExpenseSummaryTotals.tra || 0),
        Electricity: Number(monthlyExpenseSummaryTotals.electricity || 0),
        Fare: Number(monthlyExpenseSummaryTotals.fare || 0),
        OtherExpenses: Number(monthlyExpenseSummaryTotals.other || 0),
        Total: Number(monthlyExpenseSummaryTotals.grandTotal || 0),
        Status: `${monthlyExpenseSummaryTotals.recordedShopCount}/${monthlyExpenseSummaryTotals.totalShopCount}`,
      });
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
                {shopWorkspaceLabel}
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

            <div className="flex flex-wrap items-center justify-end gap-2">
  {dailySalesGoal.hasGoal ? (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-right shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
        {t(language, 'Sales Goal', 'Lengo la Mauzo')}
      </div>
      <div className="mt-1 text-sm font-black text-slate-900">
        TZS {currency(dailySalesGoal.goal)}
      </div>
      <div className="mt-1 text-[11px] font-bold text-slate-600">
        {t(language, 'Actual', 'Mauzo Halisi')}: TZS {currency(dailySalesGoal.actual)} · {t(language, 'Reached', 'Umefikia')}: {dailySalesGoal.progress.toFixed(0)}% ·{' '}
        {dailySalesGoal.exceededAmount > 0
          ? `${t(language, 'Exceeded target by', 'Umezidi lengo kwa')}: TZS ${currency(dailySalesGoal.exceededAmount)}`
          : `${t(language, 'Remaining', 'Bado')}: ${dailySalesGoal.remainingPercent.toFixed(0)}%`}
      </div>

      <div className="mt-2 max-w-[320px] overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 shadow-sm">
        <style>
          {`
            @keyframes salesTargetMove {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
          `}
        </style>

        <div
          className="whitespace-nowrap text-[11px] font-bold text-emerald-800"
          style={{
            display: 'inline-block',
            minWidth: '100%',
            animation: 'salesTargetMove 14s linear infinite',
          }}
        >
          {dashboardDataReady
  ? t(
      language,
      `Yesterday you sold TZS ${currency(dailySalesGoal.yesterdaySales)}. Today's sales target is TZS ${currency(dailySalesGoal.goal)}.`,
      `Jana uliuza TZS ${currency(dailySalesGoal.yesterdaySales)}. Mauzo yako ya leo yanatakiwa kuwa TZS ${currency(dailySalesGoal.goal)}.`
    )
  : dashboardLoadingText}
        </div>
      </div>
    </div>
  ) : (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {t(language, 'Sales Goal', 'Lengo la Mauzo')}
      </div>
      <div className="mt-1 text-[11px] font-bold text-slate-600">
        {t(language, 'Not enough history yet.', 'Bado hakuna historia ya kutosha.')}
      </div>
    </div>
  )}
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
  <option value="date">{t(language, 'Custom Date Range', 'Chagua tarehe')}</option>
  <option value="yesterday">{t(language, 'Yesterday', 'Jana')}</option>
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

      {cartDraftDecisionRequired ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white p-6 shadow-2xl">
            <div className="rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <div className="text-lg font-black text-slate-900">
                {t(language, 'Unfinished sale found', 'Kuna mauzo hayajakamilika')}
              </div>

              <div className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                {t(
                  language,
                  'This shop has an unfinished cart. You must choose whether to continue or delete it before using the system.',
                  'Duka hili lina mauzo ambayo hayajakamilika. Lazima uchague kuendelea nayo au kuyafuta kabla ya kutumia mfumo.'
                )}
              </div>

              <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                {t(language, 'Products in cart', 'Bidhaa kwenye cart')}: {pendingCartDraft?.cart?.length || 0}
              </div>
            </div>

            {confirmDeleteCartDraft ? (
              <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4">
                <div className="text-sm font-black text-red-700">
                  {t(language, 'Confirm delete', 'Thibitisha kufuta')}
                </div>

                <div className="mt-2 text-sm font-semibold leading-6 text-red-700">
                  {t(
                    language,
                    'Are you sure you want to delete this unfinished sale? This cannot be recovered.',
                    'Una uhakika unataka kufuta mauzo haya ambayo hayajakamilika? Hayataweza kurudishwa.'
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={confirmDeleteCartDraftNow}
                  >
                    {t(language, 'Yes, delete', 'Ndiyo, futa')}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelDeleteCartDraft}
                  >
                    {t(language, 'Cancel', 'Ghairi')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={continueCartDraft}
                >
                  {t(language, 'Continue', 'Endelea')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  onClick={requestDeleteCartDraft}
                >
                  {t(language, 'Delete', 'Futa')}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,255,0.94),rgba(255,244,250,0.94))] p-2 shadow-lg ring-1 ring-slate-200/70">
  <TabsList>
    {[
      ['dashboard', t(language, 'Dashboard', 'Dashibodi')],
      ['products', t(language, 'Record Products', 'Sajili Bidhaa')],
      ['purchases', t(language, 'Record Purchases', 'Sajili Manunuzi')],
      ['pos', t(language, 'Sales', 'Mauzo')],
['expenses', t(language, 'Expenses', 'Matumizi')],
['remittance', t(language, 'Remittance & Expense Funds', 'Makusanyo na Fedha za Matumizi')],
...(
  String(shop.id || '') === 'shop-1'
    ? [['homeExpenses', t(language, 'Home Expenses', 'Matumizi ya Nyumbani')]]
    : []
),
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
     {String(data.currentUser?.role || '') !== 'owner' &&
failedSupabaseSalesCount > 0 ? (
  <div className="mb-4 rounded-2xl border-2 border-red-400 bg-red-50 px-5 py-4 text-red-900 shadow-sm">
    <div className="font-black">
      Imeshindikana kuthibitisha mauzo {failedSupabaseSalesCount} yenye jumla
      ya TZS {currency(failedSupabaseSalesAmount)} kwenye Supabase.
    </div>

    <div className="mt-1 text-sm font-bold">
      Sale ID:{' '}
      {failedSupabaseSales
        .map((sale) =>
          String(sale?.id || '').trim()
        )
        .filter(Boolean)
        .join(', ')}
    </div>

    <div className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold">
      {failedSaleInstruction}
    </div>
  </div>
) : null}

{String(data.currentUser?.role || '') !== 'owner' &&
sendingSupabaseSalesCount > 0 ? (
  <div className="mb-4 rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-4 text-amber-900 shadow-sm">
    <div className="font-black">
      Mauzo {sendingSupabaseSalesCount} yenye jumla ya TZS{' '}
      {currency(sendingSupabaseSalesAmount)} yanasubiri kutumwa Supabase.
    </div>

    <div className="mt-1 text-sm font-semibold">
      Mauzo haya yamehifadhiwa salama kwenye duka hili. Mfumo unaendelea
      kuyatuma na kuyathibitisha. Usiyarudie mauzo haya.
    </div>
  </div>
) : null}
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
    <StatCard
  title={`${t(language, 'Sales', 'Mauzo')} - ${shopPeriodLabel}`}
  value={`TZS ${currency(todaySales)}`}
  icon={ShoppingCart}
  color="bg-orange-300"
/>

<StatCard
  title={`${t(
    language,
    'Amount to Submit',
    'Kiasi cha Kutoa'
  )} - ${shopPeriodLabel}`}
  value={`TZS ${currency(
    selectedShopRemittanceSummary.cashAmount
  )}`}
  icon={AlertTriangle}
  color="bg-red-300"
/>

<StatCard
  title={`${t(language, 'Profit', 'Faida')} - ${shopPeriodLabel}`}
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


{monthlySalesGoal.hasGoal ? (
  <div className="mt-4 rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-5 shadow-md">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
          {t(language, 'Monthly Target', 'Lengo la Mwezi')}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-white px-4 py-3 shadow-sm ring-1 ring-emerald-100">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              {t(language, 'Sales this month', 'Mauzo ya mwezi huu')}
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
  {`TZS ${currency(monthlySalesGoal.actual)}`}
</div>
          </div>

          <div className="rounded-3xl bg-white px-4 py-3 shadow-sm ring-1 ring-emerald-100">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              {t(language, 'Monthly target', 'Lengo la mwezi')}
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
  {`TZS ${currency(monthlySalesGoal.goal)}`}
</div>
          </div>
        </div>

        <div className="mt-3 text-sm font-bold text-slate-700">
  {`${t(language, 'Reached', 'Umefikia')}: ${monthlySalesGoal.progress.toFixed(0)}%`}
</div>

<div className="mt-1 text-sm font-bold text-slate-700">
  {monthlySalesGoal.exceededAmount > 0
  ? `${t(language, 'Exceeded target by', 'Umezidi lengo kwa')}: TZS ${currency(monthlySalesGoal.exceededAmount)}`
  : `${t(language, 'Remaining to target', 'Bado kufikia lengo')}: TZS ${currency(monthlySalesGoal.remainingAmount)}`}
</div>

        <div className="mt-1 text-xs font-semibold text-slate-500">
          {monthlySalesGoal.monthStart} - {monthlySalesGoal.monthEnd}
        </div>
      </div>

      <div className="rounded-3xl bg-white px-5 py-4 text-right shadow-sm ring-1 ring-emerald-100">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
          {t(language, 'Current Reward', 'Zawadi ya Sasa')}
        </div>

        <div className="mt-2 text-2xl font-black text-emerald-700">
  {`TZS ${currency(monthlySalesGoal.rewardAmount)}`}
</div>

        <div className="mt-1 max-w-[240px] text-xs font-semibold leading-5 text-slate-600">
          {monthlySalesGoal.rewardAmount > 0
            ? t(
                language,
                'Reward grows as monthly performance increases.',
                'Zawadi inaongezeka kadri mauzo ya mwezi yanavyoongezeka.'
              )
            : t(
                language,
                'Reach 100% of monthly target to start earning reward.',
                'Fikisha 100% ya lengo la mwezi ili kuanza kupata zawadi.'
              )}
        </div>
      </div>
    </div>

    <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-100">
  <div
    className="h-full rounded-full bg-emerald-600 transition-all"
    style={{
  width: `${monthlySalesGoal.cappedProgress}%`,
}}
  />
</div>
  </div>
) : null}

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

  <div className="mt-6">
    <CEODecisionCentre
  data={buildShopOnlyData(
    shopCalculationData,
    shop.id
  )}
  language={language}
  scope="shop"
  lockedShopId={shop.id}
  selectedPeriod={reportPreset === 'date' ? 'custom' : reportPreset}
  customStartDate={reportStartDate}
  customEndDate={reportEndDate}
  titleOverride={t(language, 'Important Shop Information', 'Taarifa Muhimu za Duka Lako')}
/>
  </div>
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
                const selectedProduct = activePurchaseProducts.find(
  (product) =>
    String(product.id) === String(row.productId)
);
                return (
                  <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-2">


<Input
  placeholder={t(
    language,
    'Search existing product...',
    'Tafuta bidhaa iliyopo...'
  )}
  value={row.productSearch || ''}
  onChange={(event) => {
    updatePurchaseRow(
      index,
      'productSearch',
      event.target.value
    );

    updatePurchaseRow(index, 'productId', '');
  }}
/>

{row.productSearch && !row.productId ? (
  <div className="max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white text-sm">
    {activePurchaseProducts
      .filter((product) =>
        String(product.name || '')
          .toLowerCase()
          .includes(
            String(row.productSearch || '')
              .trim()
              .toLowerCase()
          )
      )
      .slice(0, 8)
      .map((product) => (
        <button
          key={product.id}
          type="button"
          className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-emerald-50"
          onClick={() => {
            setPurchaseRows((previousRows) =>
              previousRows.map(
                (purchaseRow, rowIndex) =>
                  rowIndex === index
                    ? {
                        ...purchaseRow,
                        productId: product.id,
                        productSearch: product.name,
                        unitCost: String(
                          product.buyPrice || ''
                        ),
                      }
                    : purchaseRow
              )
            );
          }}
        >
          <span className="font-semibold">
            {product.name}
          </span>

          <span className="ml-2 text-xs text-slate-500">
            {formatQty(product.stockBaseQty)}{' '}
            {product.baseUnit}
          </span>
        </button>
      ))}

    {activePurchaseProducts.filter((product) =>
      String(product.name || '')
        .toLowerCase()
        .includes(
          String(row.productSearch || '')
            .trim()
            .toLowerCase()
        )
    ).length === 0 ? (
      <div className="px-3 py-3 text-slate-500">
        {t(
          language,
          'No active existing product was found. Register a new product through Record Products.',
          'Hakuna bidhaa iliyopo iliyopatikana. Sajili bidhaa mpya kupitia Sajili Bidhaa.'
        )}
      </div>
    ) : null}
  </div>
) : null}

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
                <Button
                  type="button"
                  onClick={savePurchaseRows}
                  disabled={purchaseSaving}
                >
                  {purchaseSaving
                    ? t(language, 'Saving...', 'Inahifadhi...')
                    : t(language, 'Save Purchases', 'Hifadhi Manunuzi')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(language, 'Recent Purchases', 'Manunuzi ya Karibuni')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">

           {todayPurchases.length === 0 ? (
                <div className="text-slate-500">{t(language, 'No purchases recorded yet.', 'Hakuna manunuzi yaliyorekodiwa bado.')}</div>
              ) : (
                todayPurchases
  .slice()
                  .reverse()
                  .map((p) => {
                    const product = data.products.find((x) => x.id === p.productId);

                    const purchaseSyncItem = (readSyncQueue() || []).find(
                      (item) =>
                        item?.actionType === 'purchase_created' &&
                        item?.synced === false &&
                        String(item?.payload?.id || '') === String(p.id)
                    );

                    return (

<div key={p.id} className="rounded-2xl bg-slate-50 p-3">
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="font-medium">
        {product?.name || '-'}
      </div>

      <div className="mt-1 text-slate-500">
        {formatQty(p.quantity)} - TZS{' '}
        {currency(p.unitCost)} - {p.date}
      </div>
    </div>

    {purchaseSyncItem ? (
      purchaseSyncItem?.status === 'failed' ? (
        <div className="max-w-sm rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {String(purchaseSyncItem?.lastError || '')
            .toLowerCase()
            .includes('archived')
            ? t(
                language,
                `${product?.name || 'This product'} - ${formatQty(p.quantity)}: not yet saved in Supabase. Ask the supervisor to make this product Active in this shop. Do not record the purchase again; the system will retry automatically.`,
                `${product?.name || 'Bidhaa hii'} - ${formatQty(p.quantity)}: bado haijaingia Supabase. Mwambie msimamizi ahakikishe bidhaa hii iko Active kwenye duka hili. Usisajili manunuzi tena; mfumo utajaribu kuituma wenyewe.`
              )
            : t(
                language,
                `${product?.name || 'This product'} - ${formatQty(p.quantity)}: still waiting for Supabase. Check the internet connection. Do not record the purchase again; the system will retry automatically.`,
                `${product?.name || 'Bidhaa hii'} - ${formatQty(p.quantity)}: bado inasubiri kuingia Supabase. Hakikisha intaneti ipo. Usisajili manunuzi tena; mfumo utaendelea kujaribu wenyewe.`
              )}
        </div>
      ) : (
        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          {t(
            language,
            'Waiting for Supabase - sales can continue',
            'Inasubiri Supabase - mauzo yanaweza kuendelea'
          )}
        </div>
      )
    ) : (
      <div className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        {t(
          language,
          'Saved in Supabase',
          'Imehifadhiwa Supabase'
        )}
      </div>
    )}
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
        <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                salesJournalError
                  ? 'bg-red-500'
                  : salesJournalLoading
                    ? 'bg-amber-400'
                    : salesJournalRecords.some(
                          (record) =>
                            record?.status !== 'confirmed' ||
                            record?.integrityStatus === 'mismatch'
                        )
                      ? 'bg-amber-500'
                      : 'bg-green-500'
              }`}
            />
            <span>
              {t(
                language,
                'Sales Status',
                'Hali ya Mauzo'
              )}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSalesJournalOpen(true)
            }
          >
            {t(language, 'Open', 'Fungua')}
          </Button>
        </div>

        {salesJournalOpen ? (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {t(
                      language,
                      'Sales Status',
                      'Hali ya Mauzo'
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {shop.name}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSalesJournalOpen(false)
                  }
                >
                  {t(
                    language,
                    'Close',
                    'Funga'
                  )}
                </Button>
              </div>

              <div className="overflow-y-auto p-5">
                <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                  <Button
                    type="button"
                    variant={
                      salesJournalSection === 'summary'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setSalesJournalSection('summary')
                    }
                  >
                    {t(
                      language,
                      'Summary',
                      'Muhtasari'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant={
                      salesJournalSection === 'records'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setSalesJournalSection('records')
                    }
                  >
                    {t(
                      language,
                      'Sales Records',
                      'Rekodi za Mauzo'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant={
                      salesJournalSection === 'integrity'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setSalesJournalSection('integrity')
                    }
                  >
                    {t(
                      language,
                      'Check Transactions',
                      'Kagua Miamala'
                    )}
                  </Button>
                </div>

                <div className="space-y-6">
                  <section
                    className={
                      salesJournalSection === 'summary'
                        ? ''
                        : 'hidden'
                    }
                  >
                    <h3 className="mb-3 font-semibold text-slate-900">
                      {t(
                        language,
                        'Sales Summary',
                        'Muhtasari wa Mauzo'
                      )}
                    </h3>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs text-slate-500">
                          {t(
                            language,
                            'Selected Period Sales',
                            'Mauzo ya Kipindi Kilichochaguliwa'
                          )}
                        </div>

                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          TZS{' '}
                          {currency(
                            salesJournalViewRecords.reduce(
                              (sum, record) =>
                                sum +
                                Number(
                                  record?.total || 0
                                ),
                              0
                            )
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs text-slate-500">
                          {t(
                            language,
                            'Confirmed by Supabase',
                            'Yamethibitishwa Supabase'
                          )}
                        </div>

                        <div className="mt-1 text-lg font-semibold text-green-700">
                          TZS{' '}
                          {currency(
                            salesJournalViewRecords
                              .filter(
                                (record) =>
                                  record?.status ===
                                  'confirmed'
                              )
                              .reduce(
                                (sum, record) =>
                                  sum +
                                  Number(
                                    record?.total || 0
                                  ),
                                0
                              )
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs text-slate-500">
                          {t(
                            language,
                            'Waiting for Supabase',
                            'Yanasubiri Supabase'
                          )}
                        </div>

                        <div className="mt-1 text-lg font-semibold text-amber-700">
                          TZS{' '}
                          {currency(
                            salesJournalViewRecords
                              .filter(
                                (record) =>
                                  record?.status !==
                                  'confirmed'
                              )
                              .reduce(
                                (sum, record) =>
                                  sum +
                                  Number(
                                    record?.total || 0
                                  ),
                                0
                              )
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {salesJournalViewRecords.filter(
                            (record) =>
                              record?.status !==
                              'confirmed'
                          ).length}{' '}
                          {t(
                            language,
                            'sale(s)',
                            'mauzo'
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                        salesJournalViewError ||
                        salesJournalViewRecords.some(
                          (record) =>
                            record?.integrityStatus ===
                            'mismatch'
                        )
                          ? 'bg-red-50 text-red-700'
                          : salesJournalViewLoading
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {salesJournalViewError
                        ? salesJournalViewError
                        : salesJournalViewLoading
                          ? t(
                              language,
                              'Checking selected sales period...',
                              'Inakagua kipindi cha mauzo kilichochaguliwa...'
                            )
                          : salesJournalViewRecords.some(
                                (record) =>
                                  record?.integrityStatus ===
                                  'mismatch'
                              )
                            ? t(
                                language,
                                'A sales record needs checking.',
                                'Kuna rekodi ya mauzo inayohitaji kukaguliwa.'
                              )
                            : t(
                                language,
                                'Selected-period sales records are intact.',
                                'Kumbukumbu za mauzo za kipindi kilichochaguliwa ziko salama.'
                              )}
                    </div>
                  </section>

                  <section
                    className={
                      salesJournalSection === 'records'
                        ? ''
                        : 'hidden'
                    }
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {t(
                          language,
                          'Complete Sales Record',
                          'Rekodi Kamili ya Mauzo'
                        )}
                      </h3>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                        <div className="text-xs text-slate-500">
                          {t(
                            language,
                            'Grand Total',
                            'Jumla Kuu ya Mauzo'
                          )}
                        </div>

                        <div className="text-lg font-bold text-slate-900">
                          TZS{' '}
                          {currency(
                            salesJournalViewRecords.reduce(
                              (sum, record) =>
                                sum +
                                Number(
                                  record?.total || 0
                                ),
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {salesJournalViewLoading ? (
                      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                        {t(
                          language,
                          'Loading sales records...',
                          'Inapakia rekodi za mauzo...'
                        )}
                      </div>
                    ) : salesJournalViewRecords.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                        {t(
                          language,
                          'No sales recorded for the selected period.',
                          'Hakuna mauzo yaliyorekodiwa katika kipindi kilichochaguliwa.'
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[...salesJournalViewRecords]
                          .sort(
                            (a, b) =>
                              new Date(
                                b?.created_at || 0
                              ).getTime() -
                              new Date(
                                a?.created_at || 0
                              ).getTime()
                          )
                          .map((record, transactionIndex) => {
                            const isConfirmed =
                              record?.status ===
                              'confirmed';

                            const hasIntegrityProblem =
                              record?.integrityStatus ===
                              'mismatch';

                            const statusText =
                              hasIntegrityProblem
                                ? t(
                                    language,
                                    'Needs Attention',
                                    'Inahitaji Ukaguzi'
                                  )
                                : isConfirmed
                                  ? t(
                                      language,
                                      'Confirmed Supabase',
                                      'Imethibitishwa Supabase'
                                    )
                                  : t(
                                      language,
                                      'Waiting for Supabase',
                                      'Inasubiri Supabase'
                                    );

                            const statusClass =
                              hasIntegrityProblem
                                ? 'bg-red-50 text-red-700'
                                : isConfirmed
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-amber-50 text-amber-700';

                            return (
                              <div
                                key={record.id}
                                className="overflow-hidden rounded-2xl border border-slate-200"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                  <div>
                                    <div className="font-semibold text-slate-900">
                                      {t(
                                        language,
                                        'Transaction',
                                        'Muamala'
                                      )}{' '}
                                      {salesJournalViewRecords.length -
                                        transactionIndex}
                                    </div>

                                    <div className="mt-1 text-xs text-slate-500">
                                      {record?.created_at
                                        ? new Date(
                                            record.created_at
                                          ).toLocaleTimeString(
                                            'en-US',
                                            {
                                              timeZone:
                                                'Africa/Dar_es_Salaam',
                                              hour:
                                                'numeric',
                                              minute:
                                                '2-digit',
                                              second:
                                                '2-digit',
                                              hour12: true,
                                            }
                                          )
                                        : record?.date ||
                                          ''}
                                      {' • '}
                                      {Array.isArray(
                                        record?.items
                                      )
                                        ? record.items.length
                                        : 0}{' '}
                                      {t(
                                        language,
                                        'product(s)',
                                        'bidhaa'
                                      )}
                                    </div>
                                  </div>

                                  <div
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                                  >
                                    {statusText}
                                  </div>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full min-w-[720px] text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                                        <th className="px-4 py-3">
                                          {t(
                                            language,
                                            'Product',
                                            'Bidhaa'
                                          )}
                                        </th>

                                        <th className="px-4 py-3">
                                          {t(
                                            language,
                                            'Quantity',
                                            'Kiasi'
                                          )}
                                        </th>

                                        <th className="px-4 py-3">
                                          {t(
                                            language,
                                            'Unit',
                                            'Kipimo'
                                          )}
                                        </th>

                                        <th className="px-4 py-3">
                                          {t(
                                            language,
                                            'Unit Price',
                                            'Bei'
                                          )}
                                        </th>

                                        <th className="px-4 py-3">
                                          {t(
                                            language,
                                            'Total',
                                            'Jumla'
                                          )}
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {(Array.isArray(
                                        record?.items
                                      )
                                        ? record.items
                                        : []
                                      ).map(
                                        (
                                          item,
                                          itemIndex
                                        ) => (
                                          <tr
                                            key={`${record.id}-${item?.productId || itemIndex}-${itemIndex}`}
                                            className="border-b border-slate-100 last:border-0"
                                          >
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                              {item?.name ||
                                                item
                                                  ?.productId ||
                                                '-'}
                                            </td>

                                            <td className="px-4 py-3">
                                              {formatQty(
                                                item?.quantity ||
                                                  0
                                              )}
                                            </td>

                                            <td className="px-4 py-3">
                                              {item?.unit ||
                                                '-'}
                                            </td>

                                            <td className="px-4 py-3">
                                              TZS{' '}
                                              {currency(
                                                item?.price ??
                                                  item?.sellPrice ??
                                                  0
                                              )}
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                              TZS{' '}
                                              {currency(
                                                item?.total ||
                                                  0
                                              )}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                                  <div>
                                    Sale ID:{' '}
                                    <span className="font-mono">
                                      {record.id}
                                    </span>
                                  </div>

                                  <div className="font-semibold text-slate-900">
                                    {t(
                                      language,
                                      'Sale Total',
                                      'Jumla ya Mauzo'
                                    )}:{' '}
                                    TZS{' '}
                                    {currency(
                                      record?.total || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </section>

                  <section
                    className={
                      salesJournalSection === 'integrity'
                        ? ''
                        : 'hidden'
                    }
                  >
                    <h3 className="mb-3 font-semibold text-slate-900">
                      {t(
                        language,
                        'Check Transactions',
                        'Kagua Miamala'
                      )}
                    </h3>

                    {salesIntegrityLoading ? (
                      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                        {t(
                          language,
                          'Checking Journal, queue and Supabase...',
                          'Inakagua Journal, foleni na Supabase...'
                        )}
                      </div>
                    ) : salesIntegrityError ? (
                      <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
                        {salesIntegrityError}
                      </div>
                    ) : salesIntegrityRows.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                        {t(
                          language,
                          'No sales available for checking in the selected period.',
                          'Hakuna mauzo ya kukaguliwa katika kipindi kilichochaguliwa.'
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                            salesIntegrityRows.some(
                              (row) =>
                                row?.result ===
                                  'mismatch' ||
                                row?.result ===
                                  'needs_recovery'
                            )
                              ? 'bg-red-50 text-red-700'
                              : salesIntegrityRows.some(
                                    (row) =>
                                      row?.result ===
                                      'waiting'
                                  )
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {salesIntegrityRows.some(
                            (row) =>
                              row?.result ===
                                'mismatch' ||
                              row?.result ===
                                'needs_recovery'
                          )
                            ? t(
                                language,
                                'Some sales require attention. The original Journal records remain preserved.',
                                'Baadhi ya mauzo yanahitaji hatua. Rekodi zake za asili kwenye Journal bado zimehifadhiwa salama.'
                              )
                            : salesIntegrityRows.some(
                                  (row) =>
                                    row?.result ===
                                    'waiting'
                                )
                              ? t(
                                  language,
                                  'Some sales are safely stored and still waiting for Supabase.',
                                  'Baadhi ya mauzo yamehifadhiwa salama na bado yanasubiri Supabase.'
                                )
                              : t(
                                  language,
                                  'Check passed. Sales in the selected period are confirmed in Supabase.',
                                  'Ukaguzi umepita vizuri. Mauzo ya kipindi kilichochaguliwa yamethibitishwa Supabase.'
                                )}
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full min-w-[900px] text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                                <th className="px-4 py-3">
                                  {t(
                                    language,
                                    'Product',
                                    'Bidhaa'
                                  )}
                                </th>

                                <th className="px-4 py-3">
                                  {t(
                                    language,
                                    'Quantity',
                                    'Kiasi'
                                  )}
                                </th>

                                <th className="px-4 py-3">
                                  Journal
                                </th>

                                <th className="px-4 py-3">
                                  {t(
                                    language,
                                    'Queue',
                                    'Foleni'
                                  )}
                                </th>

                                <th className="px-4 py-3">
                                  Supabase
                                </th>

                                <th className="px-4 py-3">
                                  {t(
                                    language,
                                    'Result',
                                    'Matokeo'
                                  )}
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {salesIntegrityRows.map(
                                (row, index) => {
                                  const isConfirmed =
                                    row?.result ===
                                    'confirmed';

                                  const isWaiting =
                                    row?.result ===
                                    'waiting';

                                  const isFailed =
                                    row?.result ===
                                    'failed';

                                  const isBlockedByOtherProduct =
                                    row?.result ===
                                    'blocked_by_other_product';

                                  const needsRecovery =
                                    row?.result ===
                                    'needs_recovery';

                                  const isSupabaseMismatch =
                                    row?.result ===
                                      'supabase_mismatch' ||
                                    row?.transactionResult ===
                                      'supabase_mismatch';

                                  const isMismatch =
                                    row?.result ===
                                      'mismatch';

                                  const isFirstRowForSale =
                                    salesIntegrityRows.findIndex(
                                      (candidate) =>
                                        String(
                                          candidate?.saleId ||
                                            ''
                                        ) ===
                                        String(
                                          row?.saleId || ''
                                        )
                                    ) === index;

                                  const queueText =
                                    row?.queueStatus ===
                                    'present'
                                      ? t(
                                          language,
                                          'Present',
                                          'Ipo'
                                        )
                                      : row?.queueStatus ===
                                          'mismatch'
                                        ? t(
                                            language,
                                            'Mismatch',
                                            'Hailingani'
                                          )
                                        : isConfirmed
                                          ? t(
                                              language,
                                              'Cleared',
                                              'Imeondolewa'
                                            )
                                          : t(
                                              language,
                                              'Missing',
                                              'Haipo'
                                            );

                                  const supabaseText =
                                    row?.supabaseStatus ===
                                    'present'
                                      ? t(
                                          language,
                                          'Present',
                                          'Ipo'
                                        )
                                      : row?.supabaseStatus ===
                                          'mismatch'
                                        ? t(
                                            language,
                                            'Mismatch',
                                            'Hailingani'
                                          )
                                        : t(
                                            language,
                                            'Missing',
                                            'Haipo'
                                          );
                                  const stockProblemMatch =
                                    String(
                                      row?.lastSyncError ||
                                        ''
                                    ).match(
                                      /Insufficient stock for (.+?)\. Available ([\d.]+), requested ([\d.]+)\./i
                                    );

                                  const problemInstruction =
                                    isFailed &&
                                    stockProblemMatch
                                      ? t(
                                          language,
                                          `Cause: insufficient stock for ${stockProblemMatch[1]}. Supabase has ${stockProblemMatch[2]}, but this sale requires ${stockProblemMatch[3]}. Correct or add stock for this product, then press Retry. Do not sell this transaction again.`,
                                          `Sababu: stock ya ${stockProblemMatch[1]} haitoshi. Supabase ina ${stockProblemMatch[2]}, lakini muamala huu unahitaji ${stockProblemMatch[3]}. Ingiza au rekebisha stock ya bidhaa hii, kisha bonyeza Jaribu Tena. Usirudie kuuza muamala huu.`
                                        )
                                      : isFailed &&
                                          row?.lastSyncError
                                        ? t(
                                            language,
                                            `Cause: ${row.lastSyncError} Correct the stated problem, then press Retry. Do not sell this transaction again.`,
                                            `Sababu: ${row.lastSyncError} Rekebisha tatizo lililoelezwa, kisha bonyeza Jaribu Tena. Usirudie kuuza muamala huu.`
                                          )
                                        : isSupabaseMismatch
                                          ? t(
                                              language,
                                              'This transaction needs system correction. Do not sell it again. Press Repair Transaction below and the system will safely reconcile the Journal and Supabase copies.',
                                              'Muamala huu unahitaji kurekebishwa na mfumo. Usirudie kuuza. Bonyeza Rekebisha Muamala hapa chini na mfumo utasawazisha kwa usalama Journal na Supabase.'
                                            )
                                          : isMismatch
                                            ? t(
                                                language,
                                                'This transaction has a synchronization inconsistency. Do not sell it again.',
                                                'Muamala huu una tofauti kwenye usawazishaji. Usirudie kuuza.'
                                              )
                                            : needsRecovery
                                            ? t(
                                                language,
                                                'This sale is safe in the Journal but is missing from the synchronization path. Do not resell it. Use Retry to recover the original transaction.',
                                                'Mauzo haya yako salama kwenye Journal lakini hayapo kwenye njia ya kusawazisha. Usirudie kuuza. Tumia Jaribu Tena kurejesha muamala huu wa asili.'
                                              )
                                            : '';
                                  const resultText =
                                    isConfirmed
                                      ? t(
                                          language,
                                          'Confirmed',
                                          'Imethibitishwa'
                                        )
                                      : isFailed
                                        ? t(
                                            language,
                                            'Failed',
                                            'Imeshindikana'
                                          )
                                        : isBlockedByOtherProduct
                                          ? t(
                                              language,
                                              'Waiting for another product issue to be fixed',
                                              'Inasubiri tatizo la bidhaa nyingine lirekebishwe'
                                            )
                                          : isWaiting
                                            ? t(
                                                language,
                                                'Waiting',
                                                'Inasubiri'
                                              )
                                            : needsRecovery
                                              ? t(
                                                  language,
                                                  'Needs Recovery',
                                                  'Inahitaji Kurejeshwa'
                                                )
                                              : isSupabaseMismatch
                                                ? t(
                                                    language,
                                                    'Repair Required',
                                                    'Inahitaji Kurekebishwa'
                                                  )
                                                : isMismatch
                                                  ? t(
                                                      language,
                                                      'Synchronization Issue',
                                                      'Tatizo la Usawazishaji'
                                                    )
                                                  : t(
                                                      language,
                                                      'Needs Attention',
                                                      'Inahitaji Hatua'
                                                    );

                                  const resultClass =
                                    isConfirmed
                                      ? 'bg-green-50 text-green-700'
                                      : isWaiting ||
                                          isBlockedByOtherProduct
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-red-50 text-red-700';

                                  return (
                                    <tr
                                      key={`${row?.saleId}-${row?.productId}-${index}`}
                                      className="border-b border-slate-100 last:border-0"
                                    >
                                      <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">
                                          {row?.productName ||
                                            '-'}
                                        </div>

                                        <div className="mt-1 text-[11px] text-slate-400">
                                          {row?.saleId}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        {formatQty(
                                          row?.quantity || 0
                                        )}{' '}
                                        {row?.unit || ''}
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="font-medium text-green-700">
                                          {t(
                                            language,
                                            'Present',
                                            'Ipo'
                                          )}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span
                                          className={
                                            row?.queueStatus ===
                                              'mismatch' ||
                                            (
                                              row?.queueStatus ===
                                                'missing' &&
                                              !isConfirmed
                                            )
                                              ? 'font-medium text-red-700'
                                              : row?.queueStatus ===
                                                  'present'
                                                ? 'font-medium text-amber-700'
                                                : 'font-medium text-slate-500'
                                          }
                                        >
                                          {queueText}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span
                                          className={
                                            row?.supabaseStatus ===
                                            'present'
                                              ? 'font-medium text-green-700'
                                              : 'font-medium text-red-700'
                                          }
                                        >
                                          {supabaseText}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-medium ${resultClass}`}
                                        >
                                          {resultText}
                                        </span>

                                        {problemInstruction ? (
                                          <div className="mt-2 max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-relaxed text-red-800">
                                            {problemInstruction}
                                          </div>
                                        ) : null}

                                        {isFailed ? (
                                          <div className="mt-2 max-w-sm text-xs text-red-700">
                                            <div>
                                              {t(
                                                language,
                                                'Attempts',
                                                'Majaribio'
                                              )}
                                              :{' '}
                                              {Number(
                                                row?.retryAttempts ||
                                                  0
                                              )}
                                            </div>

                                            {row?.lastSyncError ? (
                                              <div className="mt-1 break-words text-red-600">
                                                {
                                                  row.lastSyncError
                                                }
                                              </div>
                                            ) : null}
                                          </div>
                                        ) : null}
                                                                                {isSupabaseMismatch &&
                                        isFirstRowForSale ? (
                                          <Button
                                            type="button"
                                            size="sm"
                                            className="mt-3"
                                            disabled={
                                              salesRetryingSaleId ===
                                              String(
                                                row?.saleId ||
                                                  ''
                                              )
                                            }
                                            onClick={() =>
                                              repairJournalSaleMismatch(
                                                row?.saleId
                                              )
                                            }
                                          >
                                            {salesRetryingSaleId ===
                                            String(
                                              row?.saleId || ''
                                            )
                                              ? t(
                                                  language,
                                                  'Repairing...',
                                                  'Inarekebisha...'
                                                )
                                              : t(
                                                  language,
                                                  'Repair Transaction',
                                                  'Rekebisha Muamala'
                                                )}
                                          </Button>
                                        ) : null}

                                        {(
                                          row?.transactionResult ===
                                            'failed' ||
                                          row?.transactionResult ===
                                            'needs_recovery' ||
                                          isFailed ||
                                          needsRecovery
                                        ) &&
                                        isFirstRowForSale ? (
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="mt-3"
                                            disabled={
                                              salesRetryingSaleId ===
                                              String(
                                                row?.saleId ||
                                                  ''
                                              )
                                            }
                                            onClick={() =>
                                              retryJournalSale(
                                                row?.saleId
                                              )
                                            }
                                          >
                                            {salesRetryingSaleId ===
                                            String(
                                              row?.saleId || ''
                                            )
                                              ? t(
                                                  language,
                                                  'Retrying...',
                                                  'Inajaribu tena...'
                                                )
                                              : t(
                                                  language,
                                                  'Retry',
                                                  'Jaribu Tena'
                                                )}
                                          </Button>
                                        ) : null}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
                <Button type="button" className="flex-1" onClick={commitSaleWithCrossTabProtection}>
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

      <TabsContent
  value="remittance"
  activeValue={activeTab}
  keepAlive
>
      <DailyRemittanceCentre
  data={shopCalculationData}
  saveData={saveData}
  currentUser={data.currentUser}
  language={language}
  lockedShopId={shop.id}
  reportPreset={reportPreset}
  reportDate={reportDate}
  reportStartDate={reportStartDate}
  reportEndDate={reportEndDate}
/>
      </TabsContent>

      <TabsContent
  value="homeExpenses"
  activeValue={activeTab}
  keepAlive
>
        <HomeExpensesCentre
  data={shopCalculationData}
          saveData={saveData}
          shop={shop}
          language={language}
          currentUser={data.currentUser}
          writeJournalSale={writeSalesJournalRecord}
          syncPendingSales={processSyncQueue}
          readLatestPosData={() =>
            readFromDB(DB_DATA_KEY)
          }
        />
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
shopId={shop.id}
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

{isOwnerUser ? (
  <>
    <option value="monthlyCommissionsReport">
      {t(language, 'Monthly Commissions Report', 'Ripoti ya Kamisheni za Mwezi')}
    </option>

    <option value="monthlyExpensesReport">
      {t(language, 'Monthly Expenses Report', 'Ripoti ya Matumizi ya Mwezi')}
    </option>
  </>
) : null}

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
) : reportType === 'monthlyCommissionsReport' ? (
  <div className="space-y-6">
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            {t(language, 'Monthly Commissions Report', 'Ripoti ya Kamisheni za Mwezi')}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {t(
              language,
              'This report shows saved Wakala commissions for all shops.',
              'Ripoti hii inaonyesha kamisheni za Wakala zilizohifadhiwa kwa maduka yote.'
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="mb-0">
            {t(language, 'Commission Month', 'Mwezi wa Kamisheni')}
          </Label>
          <Input
            type="month"
            value={commissionReportMonth}
            onChange={(e) => setCommissionReportMonth(e.target.value)}
            className="w-44"
          />
        </div>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Mobile Money Commission Total', 'Jumla ya Kamisheni za Simu')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          TZS {currency(commissionSummaryTotals.mobileTotal)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Bank Commission Total', 'Jumla ya Kamisheni za Benki')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          TZS {currency(commissionSummaryTotals.bankTotal)}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {t(language, 'Grand Total Commission', 'Jumla Kuu ya Kamisheni')}
        </div>
        <div className="mt-2 text-xl font-bold text-emerald-800">
          TZS {currency(commissionSummaryTotals.grandTotal)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Number of Shops Recorded', 'Maduka Yaliyojaza')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          {commissionSummaryTotals.recordedShopCount} / {commissionSummaryTotals.totalShopCount}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          {t(language, 'Missing Shops', 'Maduka Ambayo Hayajajaza')}
        </div>
        <div className="mt-2 text-sm font-semibold text-amber-800">
          {commissionSummaryTotals.missingShopNames.length
            ? commissionSummaryTotals.missingShopNames.join(', ')
            : t(language, 'None', 'Hakuna')}
        </div>
      </div>
    </div>

    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-base font-semibold text-slate-900">
        {t(language, 'Shop-by-Shop Breakdown', 'Mchanganuo kwa Kila Duka')}
      </div>

      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">{t(language, 'Shop Name', 'Jina la Duka')}</th>
            <th className="py-2 pr-3">{t(language, 'Mobile Commission', 'Kamisheni za Simu')}</th>
            <th className="py-2 pr-3">{t(language, 'Bank Commission', 'Kamisheni za Benki')}</th>
            <th className="py-2 pr-3">{t(language, 'Grand Total', 'Jumla Kuu')}</th>
            <th className="py-2 pr-3">{t(language, 'Status', 'Hali')}</th>
          </tr>
        </thead>

        <tbody>
          {commissionShopRows.map((row) => (
            <tr key={row.shopId} className="border-b border-slate-100">
              <td className="py-3 pr-3 font-medium text-slate-900">{row.shopName}</td>
              <td className="py-3 pr-3">TZS {currency(row.mobileTotal)}</td>
              <td className="py-3 pr-3">TZS {currency(row.bankTotal)}</td>
              <td className="py-3 pr-3 font-semibold">TZS {currency(row.grandTotal)}</td>
              <td className="py-3 pr-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    row.recorded
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-base font-semibold text-slate-900">
        {t(language, 'Network / Bank Breakdown', 'Mchanganuo wa Mitandao na Benki')}
      </div>

      <table className="w-full min-w-[1100px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">{t(language, 'Shop Name', 'Jina la Duka')}</th>
            {MOBILE_PROVIDERS.map((provider) => (
              <th key={provider} className="py-2 pr-3">
                {provider}
              </th>
            ))}
            {BANKS.map((bankName) => (
              <th key={bankName} className="py-2 pr-3">
                {bankName}
              </th>
            ))}
            <th className="py-2 pr-3">{t(language, 'Status', 'Hali')}</th>
          </tr>
        </thead>

        <tbody>
          {commissionNetworkBankRows.map((row) => (
            <tr key={row.shopId} className="border-b border-slate-100">
              <td className="py-3 pr-3 font-medium text-slate-900">
                {row.shopName}
              </td>

              {MOBILE_PROVIDERS.map((provider) => (
                <td key={provider} className="py-3 pr-3">
                  TZS {currency(row.mobileBreakdown?.[provider] || 0)}
                </td>
              ))}

              {BANKS.map((bankName) => (
                <td key={bankName} className="py-3 pr-3">
                  TZS {currency(row.bankBreakdown?.[bankName] || 0)}
                </td>
              ))}

              <td className="py-3 pr-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    row.recorded
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {row.recorded
                    ? t(language, 'Recorded', 'Imejazwa')
                    : t(language, 'Missing', 'Haijajazwa')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : reportType === 'monthlyExpensesReport' ? (
  <div className="space-y-6">
    <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            {t(language, 'Monthly Expenses Report', 'Ripoti ya Matumizi ya Mwezi')}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {t(
              language,
              'This report shows monthly expenses for all shops.',
              'Ripoti hii inaonyesha matumizi ya mwezi kwa maduka yote.'
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="mb-0">
            {t(language, 'Expense Month', 'Mwezi wa Matumizi')}
          </Label>
          <Input
            type="month"
            value={expenseReportMonth}
            onChange={(e) => setExpenseReportMonth(e.target.value)}
            className="w-44"
          />
        </div>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Total Expenses', 'Jumla ya Matumizi')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          TZS {currency(monthlyExpenseSummaryTotals.grandTotal)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Home Expenses', 'Matumizi ya Nyumbani')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          TZS {currency(monthlyExpenseSummaryTotals.homeExpenses)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Electricity', 'Umeme')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          TZS {currency(monthlyExpenseSummaryTotals.electricity)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t(language, 'Fare', 'Nauli')}
        </div>
        <div className="mt-2 text-xl font-bold text-slate-900">
          TZS {currency(monthlyExpenseSummaryTotals.fare)}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          {t(language, 'Shops Recorded', 'Maduka Yenye Rekodi')}
        </div>
        <div className="mt-2 text-xl font-bold text-amber-800">
          {monthlyExpenseSummaryTotals.recordedShopCount} / {monthlyExpenseSummaryTotals.totalShopCount}
        </div>
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">
        {t(language, 'Expenses by Shop', 'Matumizi kwa Kila Duka')}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2 pr-3">{t(language, 'Shop', 'Duka')}</th>
              <th className="py-2 pr-3">{t(language, 'Home', 'Nyumbani')}</th>
              <th className="py-2 pr-3">{t(language, 'Salaries', 'Mishahara')}</th>
              <th className="py-2 pr-3">{t(language, 'Medical', 'Matibabu')}</th>
              <th className="py-2 pr-3">{t(language, 'TRA', 'TRA')}</th>
              <th className="py-2 pr-3">{t(language, 'Electricity', 'Umeme')}</th>
              <th className="py-2 pr-3">{t(language, 'Fare', 'Nauli')}</th>
              <th className="py-2 pr-3">{t(language, 'Other', 'Mengine')}</th>
              <th className="py-2 pr-3">{t(language, 'Total', 'Jumla')}</th>
              <th className="py-2 pr-3">{t(language, 'Status', 'Hali')}</th>
            </tr>
          </thead>

          <tbody>
            {monthlyExpenseShopRows.map((row) => (
              <tr key={row.shopId} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-900">
                  {row.shopName}
                </td>
                <td className="py-3 pr-3">TZS {currency(row['Home Expenses'] || 0)}</td>
                <td className="py-3 pr-3">TZS {currency(row.Salaries || 0)}</td>
                <td className="py-3 pr-3">TZS {currency(row.Medical || 0)}</td>
                <td className="py-3 pr-3">TZS {currency(row.TRA || 0)}</td>
                <td className="py-3 pr-3">TZS {currency(row.Electricity || 0)}</td>
                <td className="py-3 pr-3">TZS {currency(row.Fare || 0)}</td>
                <td className="py-3 pr-3">TZS {currency(row.Other || 0)}</td>
                <td className="py-3 pr-3 font-semibold text-slate-900">
                  TZS {currency(row.total || 0)}
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.recorded
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">
        {t(language, 'Expenses by Category', 'Matumizi kwa Aina')}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'Home Expenses', 'Matumizi ya Nyumbani')}: TZS {currency(monthlyExpenseSummaryTotals.homeExpenses)}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'Salaries', 'Mishahara')}: TZS {currency(monthlyExpenseSummaryTotals.salaries)}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'Medical', 'Matibabu')}: TZS {currency(monthlyExpenseSummaryTotals.medical)}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'TRA', 'TRA')}: TZS {currency(monthlyExpenseSummaryTotals.tra)}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'Electricity', 'Umeme')}: TZS {currency(monthlyExpenseSummaryTotals.electricity)}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'Fare', 'Nauli')}: TZS {currency(monthlyExpenseSummaryTotals.fare)}
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          {t(language, 'Other Expenses', 'Matumizi Mengine')}: TZS {currency(monthlyExpenseSummaryTotals.other)}
        </div>
        <div className="rounded-2xl bg-orange-50 p-3 font-semibold text-orange-800">
          {t(language, 'Grand Total', 'Jumla Kuu')}: TZS {currency(monthlyExpenseSummaryTotals.grandTotal)}
        </div>
      </div>
    </div>
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
    {monthlyCommissionForm.id ? (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
        {t(
          language,
          'You are editing a saved monthly commission. After changing the figures, press Update Monthly Commission.',
          'Unahariri kamisheni ya mwezi iliyohifadhiwa. Baada ya kubadilisha taarifa, bonyeza Sasisha Kamisheni ya Mwezi.'
        )}
      </div>
    ) : null}

    <div id="monthly-commission-edit-form">
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
                setTimeout(() => {
          document
            .getElementById('monthly-commission-edit-form')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
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
  const latestDataRef = useRef(data);
  latestDataRef.current = data;

  const [activeShopId, setActiveShopId] = useState(null);
  const [ownerPeriod, setOwnerPeriod] = useState('today');
const [ownerCustomStartDate, setOwnerCustomStartDate] = useState(todayISO());
const [ownerCustomEndDate, setOwnerCustomEndDate] = useState(todayISO());
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [syncMessage, setSyncMessage] = useState('');
const [decisionCentreSales, setDecisionCentreSales] = useState([]);
const [decisionCentreSalesLoaded, setDecisionCentreSalesLoaded] = useState(false);
const [isHydrating, setIsHydrating] = useState(true);
const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
const [dashboardDataReady, setDashboardDataReady] = useState(false);
const monthlyTargetSyncRef = useRef(new Set());
const lastAutomaticProductRefreshRef = useRef(0);

useEffect(() => {
  if (!hasLoadedInitialData) {
    return;
  }

  if (
    typeof BroadcastChannel ===
    'undefined'
  ) {
    return;
  }

  const channel =
    new BroadcastChannel(
      POS_DATA_CHANNEL_NAME
    );

  let cancelled = false;

  channel.onmessage = async (event) => {
    const message = event?.data || {};

    if (
      message?.type !==
        'app_data_updated' ||
      message?.sourceTabId ===
        POS_TAB_INSTANCE_ID
    ) {
      return;
    }

    try {
      const latestStoredData =
        await readFromDB(
          DB_DATA_KEY
        );

      if (
        cancelled ||
        !latestStoredData
      ) {
        return;
      }

      const storedPendingSales =
        Array.isArray(
          latestStoredData.sales
        )
          ? latestStoredData.sales.filter(
              (sale) =>
                sale?.confirmed === false
            )
          : [];

      if (!storedPendingSales.length) {
        return;
      }

      setData((previousData) => {
        const previousSales =
          Array.isArray(
            previousData.sales
          )
            ? previousData.sales
            : [];

        const mergedSales =
          mergeRowsById(
            previousSales,
            storedPendingSales
          );

        if (
          JSON.stringify(
            previousSales
          ) ===
          JSON.stringify(
            mergedSales
          )
        ) {
          return previousData;
        }

        return {
          ...previousData,
          sales: mergedSales,
        };
      });
    } catch (crossTabReadError) {
      console.error(
        'Cross-tab POS data refresh failed:',
        crossTabReadError
      );
    }
  };

  return () => {
    cancelled = true;
    channel.close();
  };
}, [hasLoadedInitialData]);

useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      // Security rule:
      // On fresh app opening/refresh, do not restore a previously logged-in user.
      // Business data remains saved, but the user must login again.
      writeStorage(STORAGE_SESSION_KEY, null);
      clearLockOnReturn();

      let localData = null;

      try {
        localData = await readFromDB(DB_DATA_KEY);
      } catch (dbError) {
        console.error('IndexedDB startup read failed:', dbError);
      }

      const initial = normalizeData(localData || seedData);

      const nextData = {
        ...initial,
        currentUser: null,
      };

      if (cancelled) return;

      setData(nextData);
      setActiveShopId(null);
      setIsOnline(navigator.onLine);

      setSyncMessage(
        navigator.onLine
          ? 'POS locked. Please login to continue.'
          : 'You are offline. Please login to continue with saved local data.'
      );
    } catch (error) {
      console.error('Local POS startup failed:', error);

      if (!cancelled) {
        setData({
          ...normalizeData(seedData),
          currentUser: null,
        });

        setActiveShopId(null);
        writeStorage(STORAGE_SESSION_KEY, null);
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
  if (!data?.currentUser) return;

  const lockPosLocally = () => {
    writeStorage(STORAGE_SESSION_KEY, null);
    clearLockOnReturn();

    setActiveShopId(null);
    setSyncMessage(
      t(
        language,
        'Session locked. Please login again.',
        'Mfumo umejifunga. Tafadhali ingia tena.'
      )
    );

    setData((prev) => ({
      ...prev,
      currentUser: null,
    }));
  };

  const lockIfExpired = () => {
    if (shouldAutoLockPos()) {
      lockPosLocally();
      return true;
    }

    return false;
  };

  // When a fresh valid login happens, start counting inactivity from now.
  updateLastActivityTime();
  clearLockOnReturn();

  const markActivity = () => {
    if (lockIfExpired()) return;
    updateLastActivityTime();
  };

  const activityEvents = ['click', 'keydown', 'touchstart', 'mousemove'];

  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, markActivity, { passive: true });
  });

  const visibilityHandler = () => {
    if (document.visibilityState === 'hidden') {
      markLockOnReturn();
      return;
    }

    if (document.visibilityState === 'visible') {
      if (shouldLockOnReturn()) {
        clearLockOnReturn();
        lockIfExpired();
      }
    }
  };

  const focusHandler = () => {
    if (shouldLockOnReturn()) {
      clearLockOnReturn();
      lockIfExpired();
    }
  };

  window.addEventListener('focus', focusHandler);
  document.addEventListener('visibilitychange', visibilityHandler);

  const lockTimer = window.setInterval(lockIfExpired, 30000);

  return () => {
    activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, markActivity);
    });

    window.removeEventListener('focus', focusHandler);
    document.removeEventListener('visibilitychange', visibilityHandler);
    window.clearInterval(lockTimer);
  };
}, [data?.currentUser, language]);

useEffect(() => {
  if (!data?.currentUser) return;

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

    const salesMode = 'today';

    let salesQuery = supabase
  .from('sales')
  .select('*')
  .order('created_at', { ascending: false });

if (salesMode === 'year') {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  salesQuery = salesQuery.gte('date', todayISO(yearStart));
} else if (salesMode === 'sixMonths') {
  salesQuery = salesQuery.gte('date', daysAgoISO(180));
} else if (salesMode === 'month') {
  salesQuery = salesQuery.gte('date', daysAgoISO(30));
} else {
  salesQuery = salesQuery.eq('date', todayISO());
}

    if (!isOwnerUser) {
      salesQuery = salesQuery.eq('shop_id', shopId);
    }

    const { data: cloudSales, error: salesError } = await salesQuery;

    if (salesError) throw salesError;

    if (!Array.isArray(cloudSales)) {
      throw new Error('Supabase sales response was not a valid list.');
    }

    let centralFundTransactionsQuery = supabase
      .from('centralFundTransactions')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (!isOwnerUser) {
      centralFundTransactionsQuery =
        centralFundTransactionsQuery.eq(
          'shop_id',
          shopId
        );
    }

    const {
      data: cloudCentralFundTransactions,
      error: centralFundTransactionsError,
    } = await centralFundTransactionsQuery;

    if (centralFundTransactionsError) {
      throw centralFundTransactionsError;
    }

    if (
      !Array.isArray(cloudCentralFundTransactions)
    ) {
      throw new Error(
        'Supabase central fund transactions response was not a valid list.'
      );
    }

    const productRefreshIntervalMs =
      20 * 60 * 1000;

    const hasPendingStockMovement = readSyncQueue().some(
      (item) =>
        item?.synced === false &&
        ['sale_created', 'purchase_created'].includes(
          item?.actionType
        ) &&
        (
          isOwnerUser ||
          String(item?.payload?.shop_id || '').trim() ===
            String(shopId || '').trim()
        )
    );

    const shouldRefreshProducts =
      !hasPendingStockMovement &&
      Date.now() -
        lastAutomaticProductRefreshRef.current >=
        productRefreshIntervalMs;

    let cloudProducts = [];

    if (shouldRefreshProducts) {
      let productsQuery = supabase
        .from('products')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (!isOwnerUser) {
        productsQuery = productsQuery.eq(
          'shop_id',
          shopId
        );
      }

      const {
        data: refreshedProducts,
        error: productsError,
      } = await productsQuery;

      if (productsError) {
        throw productsError;
      }

      if (!Array.isArray(refreshedProducts)) {
        throw new Error(
          'Supabase products response was not a valid list.'
        );
      }

      cloudProducts = refreshedProducts;

      lastAutomaticProductRefreshRef.current =
        Date.now();
    }

    return {
      shopId,
      isOwnerUser,
      productsWereRefreshed:
        shouldRefreshProducts,

      sales: cloudSales.map((sale) => ({
        ...sale,
        confirmed: true,
      })),

      centralFundTransactions:
        cloudCentralFundTransactions.map((row) => ({
          id: row?.id || '',
          transactionType:
            row?.transaction_type || '',
          transactionDate:
            row?.transaction_date || '',

          shop_id: String(
            row?.shop_id || ''
          ).trim(),
          shopName: row?.shop_name || '',

          expenseKey: row?.expense_key || '',
          expenseName:
            row?.expense_name || '',

          sourceFundType:
            row?.source_fund_type || '',
          sourceFundKey:
            row?.source_fund_key || '',
          sourceFundName:
            row?.source_fund_name || '',
          sourceShopId: String(
            row?.source_shop_id || ''
          ).trim(),
          sourceShopName:
            row?.source_shop_name || '',

          destinationFundType:
            row?.destination_fund_type || '',
          destinationFundKey:
            row?.destination_fund_key || '',
          destinationFundName:
            row?.destination_fund_name || '',
          destinationShopId: String(
            row?.destination_shop_id || ''
          ).trim(),
          destinationShopName:
            row?.destination_shop_name || '',

          amount: Number(row?.amount || 0),

          payee: row?.payee || '',
          purpose: row?.purpose || '',
          paymentMethod:
            row?.payment_method || '',
          paymentReference:
            row?.payment_reference || '',
          notes: row?.notes || '',

          status: row?.status || 'confirmed',

          borrowingDueDate:
            row?.borrowing_due_date || '',
          borrowingStatus:
            row?.borrowing_status || '',
          borrowedAmount: Number(
            row?.borrowed_amount || 0
          ),
          repaidAmount: Number(
            row?.repaid_amount || 0
          ),

          relatedTransactionId:
            row?.related_transaction_id || '',
          reversalOfTransactionId:
            row?.reversal_of_transaction_id || '',

          recordedByUserId:
            row?.recorded_by_user_id || '',
          recordedByName:
            row?.recorded_by_name || '',
          recordedByRole:
            row?.recorded_by_role || '',

          created_at: row?.created_at || '',
          updated_at: row?.updated_at || '',
        })),

      products: cloudProducts.map((p) =>
        normalizeProduct({
          id: p.id,
          name: p.name,
          buyPrice: Number(
            p.buyingprice ||
              p.buyPrice ||
              0
          ),
          sellPrice: Number(
            p.sellingprice ||
              p.sellPrice ||
              0
          ),
          stockBaseQty: Number(
            p.stock ||
              p.stockBaseQty ||
              p.stockQty ||
              0
          ),
          stockQty: Number(
            p.stock ||
              p.stockBaseQty ||
              p.stockQty ||
              0
          ),
          shop_id: String(
            p.shop_id ||
              p.shopid ||
              shopId ||
              ''
          ).trim(),
          baseUnit:
            p.baseunit ||
            p.baseUnit ||
            'pc',
          minStockLevel: Number(
            p.minstocklevel ||
              p.minStockLevel ||
              5
          ),
          expiryDate:
            p.expirydate ||
            p.expiryDate ||
            '',
          qrCode:
            p.qrcode ||
            p.qrCode ||
            '',
          subUnitsRaw:
            p.subunitsraw ||
            p.subUnitsRaw ||
            '',
          archived: Boolean(p.archived),
          createdAt:
            p.createdAt ||
            p.created_at ||
            new Date().toISOString(),
          updatedAt:
            p.updatedAt ||
            p.updated_at ||
            new Date().toISOString(),
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
      if (message) {
        setSyncMessage(message);
      }
const latestData =
  latestDataRef.current || data;

const currentShopId = String(
  activeShopId ||
    latestData.currentUser?.shop_id ||
    latestData.currentUser?.shopId ||
    ''
).trim();

if (
  currentShopId &&
  String(
    latestData.currentUser?.role || ''
  ) !== 'owner'
) {
  const currentQueue = readSyncQueue();

  const queuedSaleIds = new Set(
    currentQueue
      .filter(
        (item) =>
          item?.actionType === 'sale_created' &&
          item?.synced === false
      )
      .map((item) =>
        String(item?.payload?.id || '').trim()
      )
      .filter(Boolean)
  );

  const orphanedLocalSales = (
    Array.isArray(latestData.sales)
      ? latestData.sales
      : []
  ).filter(
    (sale) =>
      String(
        sale?.shop_id ||
        sale?.shopId ||
        ''
      ).trim() === currentShopId &&
      sale?.confirmed === false &&
      String(sale?.id || '').trim() &&
      !queuedSaleIds.has(
        String(sale?.id || '').trim()
      )
  );

  if (orphanedLocalSales.length > 0) {
    const orphanedSaleIds = orphanedLocalSales.map(
      (sale) => String(sale.id).trim()
    );

    const {
      data: existingSupabaseSales,
      error: orphanCheckError,
    } = await supabase
      .from('sales')
      .select(
        'id, shop_id, items, total, type, date, created_at'
      )
      .in('id', orphanedSaleIds);

    if (orphanCheckError) {
      throw orphanCheckError;
    }

    const existingSupabaseSalesById = new Map(
      (Array.isArray(existingSupabaseSales)
        ? existingSupabaseSales
        : []
      ).map((sale) => [
        String(sale?.id || '').trim(),
        sale,
      ])
    );

    const normalizeRecoveryItems = (items = []) =>
      (Array.isArray(items) ? items : []).map(
        (saleItem) => ({
          productId: String(
            saleItem?.productId || ''
          ),
          name: String(saleItem?.name || ''),
          unit: String(saleItem?.unit || ''),
          quantity: Number(
            saleItem?.quantity || 0
          ),
          price: Number(
            saleItem?.price ??
            saleItem?.sellPrice ??
            0
          ),
          buyPrice: Number(
            saleItem?.buyPrice || 0
          ),
          sellPrice: Number(
            saleItem?.sellPrice ??
            saleItem?.price ??
            0
          ),
          total: Number(
            saleItem?.total || 0
          ),
        })
      );

    for (const localSale of orphanedLocalSales) {
      const saleId = String(
        localSale?.id || ''
      ).trim();

      const existingSupabaseSale =
        existingSupabaseSalesById.get(saleId);

      if (existingSupabaseSale) {
        const localVerificationCopy = {
          id: saleId,
          shop_id: String(
            localSale?.shop_id || ''
          ),
          date: String(
            localSale?.date || ''
          ),
          type: String(
            localSale?.type || ''
          ),
          total: Number(
            localSale?.total || 0
          ),
          items: normalizeRecoveryItems(
            localSale?.items
          ),
        };

        const supabaseVerificationCopy = {
          id: String(
            existingSupabaseSale?.id || ''
          ),
          shop_id: String(
            existingSupabaseSale?.shop_id || ''
          ),
          date: String(
            existingSupabaseSale?.date || ''
          ),
          type: String(
            existingSupabaseSale?.type || ''
          ),
          total: Number(
            existingSupabaseSale?.total || 0
          ),
          items: normalizeRecoveryItems(
            existingSupabaseSale?.items
          ),
        };

        if (
          JSON.stringify(localVerificationCopy) !==
          JSON.stringify(supabaseVerificationCopy)
        ) {
          throw new Error(
            `Orphan sale ${saleId} exists in Supabase but does not exactly match the local sale. Nothing was overwritten.`
          );
        }

        continue;
      }

      addToSyncQueue('sale_created', {
        id: saleId,
        shop_id: currentShopId,
        items: Array.isArray(localSale?.items)
          ? localSale.items
          : [],
        total: Number(localSale?.total || 0),
        type: localSale?.type || 'cash',
        date: localSale?.date || todayISO(),
        created_at:
          localSale?.created_at ||
          new Date().toISOString(),
      });
    }
  }
}
/*
 * Permanent sale-delivery rule:
 * Every completed Journal sale belonging to this exact shop
 * must remain in the synchronization queue until Supabase
 * confirms it.
 */
if (currentShopId) {
  const journalSales =
    await readSalesJournalRecords();

  const pendingJournalSales = (
    Array.isArray(journalSales)
      ? journalSales
      : []
  ).filter((journalSale) => {
    const journalShopId = String(
      journalSale?.shop_id ||
        journalSale?.shopId ||
        ''
    ).trim();

    const journalStatus = String(
      journalSale?.status || 'pending'
    )
      .trim()
      .toLowerCase();

    return (
      journalShopId === currentShopId &&
      journalStatus !== 'confirmed' &&
      String(journalSale?.id || '').trim()
    );
  });

  if (pendingJournalSales.length > 0) {
    const currentQueue = readSyncQueue();

    const pendingJournalByKey = new Map(
      pendingJournalSales.map(
        (journalSale) => [
          `${currentShopId}:${String(
            journalSale.id
          ).trim()}`,
          journalSale,
        ]
      )
    );

    const recoveredSaleKeys = new Set();

    const recoveredQueue = currentQueue.map(
      (queueItem) => {
        if (
          queueItem?.actionType !==
            'sale_created' ||
          queueItem?.synced === true
        ) {
          return queueItem;
        }

        const queueShopId = String(
          queueItem?.payload?.shop_id || ''
        ).trim();

        const queueSaleId = String(
          queueItem?.payload?.id || ''
        ).trim();

        const queueSaleKey =
          `${queueShopId}:${queueSaleId}`;

        const journalSale =
          pendingJournalByKey.get(
            queueSaleKey
          );

        if (!journalSale) {
          return queueItem;
        }

        recoveredSaleKeys.add(
          queueSaleKey
        );

        return {
          ...queueItem,
          payload: {
            id: String(
              journalSale.id
            ).trim(),
            shop_id: currentShopId,
            items: Array.isArray(
              journalSale.items
            )
              ? journalSale.items
              : [],
            total: Number(
              journalSale.total || 0
            ),
            type:
              journalSale.type || 'cash',
            date:
              journalSale.date ||
              todayISO(),
            created_at:
              journalSale.created_at ||
              new Date().toISOString(),
          },
          synced: false,
          status: 'pending',
          attempts: 0,
          lastAttemptAt: 0,
          lastError: '',
          recoveredFromJournalAt:
            Date.now(),
        };
      }
    );

    pendingJournalByKey.forEach(
      (journalSale, journalSaleKey) => {
        if (
          recoveredSaleKeys.has(
            journalSaleKey
          )
        ) {
          return;
        }

        recoveredQueue.push({
          id: `sync-sale-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          actionType: 'sale_created',
          payload: {
            id: String(
              journalSale.id
            ).trim(),
            shop_id: currentShopId,
            items: Array.isArray(
              journalSale.items
            )
              ? journalSale.items
              : [],
            total: Number(
              journalSale.total || 0
            ),
            type:
              journalSale.type || 'cash',
            date:
              journalSale.date ||
              todayISO(),
            created_at:
              journalSale.created_at ||
              new Date().toISOString(),
          },
          createdAt: Date.now(),
          synced: false,
          status: 'pending',
          attempts: 0,
          lastAttemptAt: 0,
          lastError: '',
          recoveredFromJournalAt:
            Date.now(),
        });
      }
    );

    writeSyncQueue(
      recoveredQueue
    );
  }
}
await processSyncQueue();

const pendingQueueItems = readSyncQueue().filter(
  (item) => item?.synced === false
);
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
      }

      const confirmedResult =
        await loadConfirmedDashboardDataFromSupabase();

      const journalProtectionDate =
        todayISO();

      let journalProtectionAvailable =
        false;

      let protectedJournalSaleIds =
        new Set();

      try {
        const journalRecords =
          await readSalesJournalRecords();

        protectedJournalSaleIds =
          new Set(
            (
              Array.isArray(journalRecords)
                ? journalRecords
                : []
            )
              .filter((record) => {
                const journalStatus =
                  String(
                    record?.status ||
                      'pending'
                  )
                    .trim()
                    .toLowerCase();

                if (
                  journalStatus ===
                  'confirmed'
                ) {
                  return false;
                }

                const journalDate =
                  String(
                    record?.date ||
                      (
                        record?.created_at
                          ? String(
                              record.created_at
                            ).slice(0, 10)
                          : ''
                      )
                  ).trim();

                if (
                  journalDate !==
                  journalProtectionDate
                ) {
                  return false;
                }

                if (
                  confirmedResult.isOwnerUser
                ) {
                  return true;
                }

                const journalShopId =
                  String(
                    record?.shop_id ||
                      record?.shopId ||
                      ''
                  ).trim();

                return (
                  journalShopId ===
                  String(
                    confirmedResult.shopId ||
                      ''
                  ).trim()
                );
              })
              .map((record) =>
                String(
                  record?.id || ''
                ).trim()
              )
              .filter(Boolean)
          );

        journalProtectionAvailable =
          true;
      } catch (journalProtectionError) {
        console.error(
          'Could not read Sales Journal before confirmed-sales refresh:',
          journalProtectionError
        );
      }

      setData((prev) => {
        const previousSales = Array.isArray(prev.sales)
          ? prev.sales
          : [];

        const confirmedSales = Array.isArray(
          confirmedResult.sales
        )
          ? confirmedResult.sales
          : [];

        const authoritativeSalesDate = todayISO();

        const pendingSaleIds = new Set(
          readSyncQueue()
            .filter(
              (item) =>
                item?.actionType === 'sale_created' &&
                item?.synced === false
            )
            .map((item) =>
              String(item?.payload?.id || '').trim()
            )
            .filter(Boolean)
        );

        const isInsideAuthoritativeSalesScope = (sale) => {
          const saleDate = String(
            sale?.date ||
              (sale?.created_at
                ? String(sale.created_at).slice(0, 10)
                : '')
          ).trim();

          if (saleDate !== authoritativeSalesDate) {
            return false;
          }

          if (confirmedResult.isOwnerUser) {
            return true;
          }

          const saleShopId = String(
            sale?.shop_id ||
              sale?.shopId ||
              sale?.shopid ||
              ''
          ).trim();

          return (
            saleShopId ===
            String(confirmedResult.shopId || '').trim()
          );
        };

        const preservedPreviousSales =
          previousSales.filter((sale) => {
            if (!isInsideAuthoritativeSalesScope(sale)) {
              return true;
            }

            const saleId = String(
              sale?.id || ''
            ).trim();

            if (
              sale?.confirmed !== false
            ) {
              return false;
            }

            if (
              pendingSaleIds.has(saleId)
            ) {
              return true;
            }

            if (
              protectedJournalSaleIds.has(
                saleId
              )
            ) {
              return true;
            }

            if (
              !journalProtectionAvailable
            ) {
              return true;
            }

            return false;
          });

        const nextSales = mergeRowsById(
          preservedPreviousSales,
          confirmedSales
        );

        const confirmedSalesChanged =
          JSON.stringify(previousSales) !==
          JSON.stringify(nextSales);

        const previousCentralFundTransactions =
          Array.isArray(
            prev.centralFundTransactions
          )
            ? prev.centralFundTransactions
            : [];

        const confirmedCentralFundTransactions =
          Array.isArray(
            confirmedResult.centralFundTransactions
          )
            ? confirmedResult.centralFundTransactions
            : [];

        const centralFundTransactionsChanged =
          JSON.stringify(
            previousCentralFundTransactions
          ) !==
          JSON.stringify(
            confirmedCentralFundTransactions
          );

        if (
          !confirmedSalesChanged &&
          !centralFundTransactionsChanged &&
          confirmedResult.productsWereRefreshed ===
            false
        ) {
          return prev;
        }

        const previousProducts = Array.isArray(
          prev.products
        )
          ? prev.products
          : [];
        const confirmedProducts = Array.isArray(confirmedResult.products)
          ? confirmedResult.products
          : [];

        const productsWereRefreshed =
          confirmedResult.productsWereRefreshed !== false;

        const currentShopId = String(confirmedResult.shopId || '').trim();

        const previousShopProducts = previousProducts.filter(
          (product) =>
            String(product.shop_id || product.shopId || product.shopid || '') ===
            String(currentShopId)
        );

        let nextProducts = previousProducts;

        if (!productsWereRefreshed) {
          nextProducts = previousProducts;
        } else if (confirmedResult.isOwnerUser) {
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

          centralFundTransactions:
            confirmedCentralFundTransactions,
        };

        if (confirmedResult.isOwnerUser) {
          writeToDB(
            DB_DATA_KEY,
            nextData
          ).catch((dbError) => {
            console.error(
              'Failed to save confirmed dashboard data to IndexedDB:',
              dbError
            );
          });
        }

        return nextData;
      });

      writeStorage(STORAGE_LAST_SYNC_KEY, Date.now());
      if (pendingQueueItems.length > 0) {
  if (failedQueueItems.length > 0) {
    setSyncMessage(
      `Sync failed: ${failedQueueItems.length} record(s) have not been fully synchronized. The system will keep retrying.`
    );
  } else {
    setSyncMessage(
      `Sync pending: ${pendingQueueItems.length} record(s) are still being synchronized.`
    );
  }
} else {
  setSyncMessage('Sync complete');
}
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

  refreshTimer = window.setInterval(async () => {
    if (!navigator.onLine) return;

    try {
      await processSyncQueue();

      const latestData =
        latestDataRef.current || data;

      const currentUser =
        latestData?.currentUser || {};

      const isOwnerUser =
        String(
          currentUser?.role || ''
        ) === 'owner';

      const currentShopId = String(
        activeShopId ||
          currentUser?.shop_id ||
          currentUser?.shopId ||
          ''
      ).trim();

      if (
        !isOwnerUser &&
        !currentShopId
      ) {
        return;
      }

      let latestSalesQuery = supabase
        .from('sales')
        .select('*')
        .eq('date', todayISO())
        .order('created_at', {
          ascending: false,
        });

      if (!isOwnerUser) {
        latestSalesQuery =
          latestSalesQuery.eq(
            'shop_id',
            currentShopId
          );
      }

      const {
        data: latestSales,
        error: latestSalesError,
      } = await latestSalesQuery;

      if (latestSalesError) {
        throw latestSalesError;
      }

      const mappedLatestSales = (
        Array.isArray(latestSales)
          ? latestSales
          : []
      ).map((sale) => ({
        ...sale,
        shop_id: String(
          sale?.shop_id ||
            sale?.shopId ||
            sale?.shopid ||
            ''
        ).trim(),
        date:
          sale?.date ||
          (
            sale?.created_at
              ? String(
                  sale.created_at
                ).slice(0, 10)
              : todayISO()
          ),
        confirmed: true,
      }));

      setData((previousData) => {
        const previousSales =
          Array.isArray(
            previousData.sales
          )
            ? previousData.sales
            : [];

        const mergedSales =
          mergeRowsById(
            previousSales,
            mappedLatestSales
          );

        if (
          JSON.stringify(previousSales) ===
          JSON.stringify(mergedSales)
        ) {
          return previousData;
        }

        const nextData = {
          ...previousData,
          sales: mergedSales,
        };

        writeToDB(
          DB_DATA_KEY,
          nextData
        ).catch((databaseError) => {
          console.error(
            'Automatic sales refresh persistence failed:',
            databaseError
          );
        });

        return nextData;
      });
    } catch (refreshError) {
      console.error(
        'Automatic Supabase sales refresh failed:',
        refreshError
      );
    }
  }, 5000);

  return () => {
    window.removeEventListener('online', goOnline);
    window.removeEventListener('offline', goOffline);

    if (refreshTimer) {
      window.clearInterval(refreshTimer);
    }
  };
}, [data?.currentUser?.id]);

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
              Array.isArray(item?.payload?.items)
                ? item.payload.items
                : Array.isArray(item?.payload?.products)
                  ? item.payload.products
                  : []
            )
            .map((p) =>
              String(p?.productId || p?.id || '')
            )
            .filter(Boolean)
        );

        const pendingPurchaseProductIds = new Set(
          (readSyncQueue() || [])
            .filter(
              (item) =>
                item?.actionType === 'purchase_created' &&
                item?.synced === false &&
                String(item?.payload?.shop_id || '') === String(activeShopId)
            )
            .map((item) =>
              String(item?.payload?.productId || '')
            )
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

          if (
            pendingPurchaseProductIds.has(String(cloudProduct.id)) &&
            localProduct
          ) {
            return normalizeProduct({
              ...localProduct,
              confirmed: false,
            });
          }

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

  const channelShopId = String(activeShopId).trim();
  let cancelled = false;

  const preserveRealtimeData = (nextData) => {
    const persist = () => {
      writeToDB(DB_DATA_KEY, nextData).catch(
        (databaseError) => {
          console.error(
            'Failed to preserve incremental sales update:',
            databaseError
          );
        }
      );
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(persist, {
        timeout: 2000,
      });
    } else {
      window.setTimeout(persist, 0);
    }
  };

  const salesChannel = supabase
    .channel(`sales-changes-${channelShopId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sales',
        filter: `shop_id=eq.${channelShopId}`,
      },
      (payload) => {
        if (cancelled) return;

        const eventType = String(
          payload?.eventType || ''
        ).toUpperCase();

        const changedRow =
          eventType === 'DELETE'
            ? payload?.old
            : payload?.new;

        const changedSaleId = String(
          changedRow?.id || ''
        ).trim();

        if (!changedSaleId) {
          console.warn(
            'Realtime sales event had no sale ID:',
            payload
          );
          return;
        }

        setData((previousData) => {
          const previousSales = Array.isArray(
            previousData.sales
          )
            ? previousData.sales
            : [];

          let nextSales;

          if (eventType === 'DELETE') {
            nextSales = previousSales.filter(
              (sale) => {
                const saleId = String(
                  sale?.id || ''
                ).trim();

                if (
                  saleId !== changedSaleId
                ) {
                  return true;
                }

                return (
                  sale?.confirmed === false
                );
              }
            );
          } else {
            const confirmedSale = {
              ...changedRow,
              id: changedSaleId,
              shop_id: String(
                changedRow?.shop_id ||
                  changedRow?.shopId ||
                  changedRow?.shopid ||
                  channelShopId
              ).trim(),
              date:
                changedRow?.date ||
                (changedRow?.created_at
                  ? String(
                      changedRow.created_at
                    ).slice(0, 10)
                  : todayISO()),
              confirmed: true,
            };

            const existingSaleIndex =
              previousSales.findIndex(
                (sale) =>
                  String(sale?.id || '').trim() ===
                  changedSaleId
              );

            if (existingSaleIndex >= 0) {
              const existingSale =
                previousSales[existingSaleIndex];

              const saleIsUnchanged =
                existingSale?.confirmed === true &&
                Number(existingSale?.total || 0) ===
                  Number(confirmedSale.total || 0) &&
                String(existingSale?.date || '') ===
                  String(confirmedSale.date || '') &&
                String(existingSale?.type || '') ===
                  String(confirmedSale.type || '');

              if (saleIsUnchanged) {
                return previousData;
              }

              nextSales = [...previousSales];
              nextSales[existingSaleIndex] =
                confirmedSale;
            } else {
              nextSales = [
                ...previousSales,
                confirmedSale,
              ];
            }
          }

          const nextData = {
            ...previousData,
            sales: nextSales,
          };

          preserveRealtimeData(nextData);

          return nextData;
        });

        if (eventType !== 'DELETE') {
          setSyncMessage(
            'Mauzo yamethibitishwa Supabase.'
          );
        }
      }
    )
    .subscribe();

  return () => {
    cancelled = true;
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
useEffect(() => {
  const currentUser = data?.currentUser;

  if (!currentUser) return;

  let cancelled = false;

  const loadRemittanceDataForDashboards = async () => {
    const isOwner =
      String(currentUser?.role || '') === 'owner';

    const currentShopId = String(
      currentUser?.shop_id ||
        currentUser?.shopId ||
        ''
    ).trim();

    let remittancesQuery = supabase
      .from('dailyRemittances')
      .select('*')
      .order('created_at', { ascending: true });

    let expenseFundsQuery = supabase
      .from('remittanceExpenseFunds')
      .select('*')
      .order('created_at', { ascending: true });

    let fundAllocationsQuery = supabase
      .from('remittanceFundAllocations')
      .select('*')
      .order('created_at', { ascending: true });

    if (!isOwner && currentShopId) {
      remittancesQuery = remittancesQuery.eq(
        'shop_id',
        currentShopId
      );

      expenseFundsQuery = expenseFundsQuery.eq(
        'shop_id',
        currentShopId
      );

      fundAllocationsQuery = fundAllocationsQuery.eq(
        'shop_id',
        currentShopId
      );
    }

    const [
      remittancesResult,
      expenseFundsResult,
      fundAllocationsResult,
    ] = await Promise.all([
      remittancesQuery,
      expenseFundsQuery,
      fundAllocationsQuery,
    ]);

    if (cancelled) return;

    const loadingError =
      remittancesResult.error ||
      expenseFundsResult.error ||
      fundAllocationsResult.error;

    if (loadingError) {
      console.error(
        'Dashboard remittance data load failed:',
        loadingError
      );
      return;
    }

    const normalizedRemittances = (
      remittancesResult.data || []
    ).map((row) => ({
      id: row.id,
      shop_id: row.shop_id,
      shopName: row.shop_name || '',
      date: row.date,
      amountSent: Number(row.amount_sent || 0),
      paymentMethod: row.payment_method || 'cash',
      paymentReference: row.payment_reference || '',
      shortReason: row.short_reason || '',
      otherReason: row.other_reason || '',
      expectedAmount: Number(row.expected_amount || 0),
      expenseBreakdown: Array.isArray(
        row.expense_breakdown
      )
        ? row.expense_breakdown
        : [],
      expensesOutstanding: Number(
        row.expenses_outstanding || 0
      ),
      exactAmountRequired: Number(
        row.exact_amount_required || 0
      ),
      cashAmountRequired: Number(
        row.cash_amount_required || 0
      ),
      cashRoundingAdjustment: Number(
        row.cash_rounding_adjustment || 0
      ),
      sales: Number(row.sales || 0),
      replacement: Number(row.replacement || 0),
      grossProfit: Number(row.gross_profit || 0),
      centralExpense: Number(
        row.central_expense || 0
      ),
      localRetained: Number(
        row.local_retained || 0
      ),
      ownerProfit: Number(row.owner_profit || 0),
      shopReserve: Number(row.shop_reserve || 0),
      localConfirmed: Boolean(row.local_confirmed),
      created_at: row.created_at,
    }));

    const normalizedExpenseFunds = (
      expenseFundsResult.data || []
    ).map((row) => ({
      id: row.id,
      shop_id: row.shop_id,
      shop: row.shop_name || '',
      expense: row.expense || '',
      target: Number(row.target || 0),
      funded: Number(row.funded || 0),
      due: row.due || '',
      location: row.location || 'owner',
      created_at: row.created_at,
    }));

    const normalizedFundAllocations = (
      fundAllocationsResult.data || []
    ).map((row) => ({
      id: row.id,
      shop_id: row.shop_id,
      fund_id: row.fund_id,
      allocationDate: row.allocation_date,
      amount: Number(row.amount || 0),
      created_at: row.created_at,
    }));

    setData((previousData) => {
      const nextData = {
        ...previousData,
        dailyRemittances: normalizedRemittances,
        remittanceExpenseFunds:
          normalizedExpenseFunds,
        remittanceFundAllocations:
          normalizedFundAllocations,
      };

      writeToDB(DB_DATA_KEY, nextData).catch(
        (error) => {
          console.error(
            'Remittance dashboard cache save failed:',
            error
          );
        }
      );

      return nextData;
    });
  };

  loadRemittanceDataForDashboards();

  return () => {
    cancelled = true;
  };
}, [
  data?.currentUser?.id,
  data?.currentUser?.role,
  data?.currentUser?.shop_id,
  data?.currentUser?.shopId,
]);

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
  const ensureCurrentMonthSalesTargets = async (specificShopId = null) => {
  if (!navigator.onLine) return;

  const targetMonth = getCurrentTargetMonth();
  const syncKey = `${targetMonth}-${specificShopId || 'all'}`;

  if (monthlyTargetSyncRef.current.has(syncKey)) return;
  monthlyTargetSyncRef.current.add(syncKey);

  try {
    const targetShops = (data.shops || []).filter((shop) => {
      if (!specificShopId) return true;
      return String(shop.id) === String(specificShopId);
    });

    if (!targetShops.length) return;

    const shopIds = targetShops.map((shop) => String(shop.id));

    const { data: existingRows, error: existingError } = await supabase
      .from('monthly_sales_targets')
      .select('*')
      .eq('target_month', targetMonth)
      .in('shop_id', shopIds);

    if (existingError) throw existingError;

    const existingTargets = (existingRows || []).map(normalizeMonthlySalesTarget);

    const missingShops = targetShops.filter(
      (shop) =>
        !existingTargets.some(
          (target) =>
            String(target.shop_id) === String(shop.id) &&
            String(target.target_month) === String(targetMonth)
        )
    );

    const createdTargets = [];

    for (const shop of missingShops) {
      const shopSales = await fetchShopSalesForTarget(shop.id);

      const temporaryData = normalizeData({
        ...data,
        sales: mergeRowsById(data.sales || [], shopSales),
      });

      const calculated = buildShopMonthlySalesTarget(temporaryData, shop.id);
      const goal = Math.round(Number(calculated.goal || 0));

      if (goal <= 0) continue;

      createdTargets.push({
        id: `${targetMonth}-${shop.id}`,
        shop_id: shop.id,
        shop_name: shop.name || '',
        target_month: targetMonth,
        goal,
        actual_at_creation: Number(calculated.actual || 0),
        growth_percent: 5,
        source: 'previous_six_months_plus_5_percent',
        created_by: data.currentUser?.id || data.currentUser?.auth_user_id || '',
        created_by_name: data.currentUser?.name || data.currentUser?.username || '',
      });
    }

    let savedCreatedTargets = [];

    if (createdTargets.length) {
      const { data: savedRows, error: saveError } = await supabase
        .from('monthly_sales_targets')
        .upsert(createdTargets, { onConflict: 'shop_id,target_month' })
        .select('*');

      if (saveError) throw saveError;

      savedCreatedTargets = (savedRows || []).map(normalizeMonthlySalesTarget);
    }

    const allTargets = [...existingTargets, ...savedCreatedTargets];

    if (allTargets.length) {
      setData((prev) => ({
        ...prev,
        monthlySalesTargets: mergeRowsById(
          prev.monthlySalesTargets || [],
          allTargets.map(normalizeMonthlySalesTarget)
        ),
      }));
    }
  } catch (error) {
    console.error('Monthly sales target sync failed:', error);
    monthlyTargetSyncRef.current.delete(syncKey);
  }
};
const handleLogin = async (user) => {
  const sessionUser = {
    ...user,
    auth_user_id: user.auth_user_id || null,
  };

  writeStorage(STORAGE_SESSION_KEY, sessionUser);

setDashboardDataReady(false);

const shopId =
  user.role === 'shop'
    ? user.shop_id || user.shopId || user.shopid || null
    : null;

  setActiveShopId(shopId);
setData((prev) => ({
  ...prev,
  currentUser: sessionUser,
}));
  let loaded;

  try {
    loaded = await readData({ preferFresh: false });
  } catch (error) {
    console.error('Login data loading failed. Falling back to local saved data:', error);
    loaded = await readData({ preferFresh: false });
  }

  let products = Array.isArray(loaded.products) ? loaded.products : [];

  if (false && shopId && navigator.onLine) {
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

  if (navigator.onLine) {
    const mergeRowsById = (existingRows = [], incomingRows = []) => {
      const merged = new Map();

      (Array.isArray(existingRows) ? existingRows : []).forEach((row) => {
        const key = String(row?.id || '').trim();

        if (key) {
          merged.set(key, row);
        }
      });

      (Array.isArray(incomingRows) ? incomingRows : []).forEach((row) => {
        const key = String(row?.id || '').trim();

        if (key) {
          merged.set(key, {
            ...(merged.get(key) || {}),
            ...row,
          });
        }
      });

      return Array.from(merged.values());
    };

  const applyBackgroundData = (loadedData) => {
  setData((prev) => {
    const activeUserId = String(
      prev.currentUser?.auth_user_id ||
        prev.currentUser?.id ||
        ''
    ).trim();

    const backgroundUserId = String(
      sessionUser?.auth_user_id ||
        sessionUser?.id ||
        ''
    ).trim();

    if (
      !activeUserId ||
      activeUserId !== backgroundUserId
    ) {
      return prev;
    }

    const mergedSales = mergeRowsById(prev.sales || [], loadedData.sales || []);
        const mergedPurchases = mergeRowsById(prev.purchases || [], loadedData.purchases || []);
        const mergedExpenses = mergeRowsById(prev.expenses || [], loadedData.expenses || []);
        const mergedCreditSales = mergeRowsById(prev.creditSales || [], loadedData.creditSales || []);
        const mergedChangeLedger = mergeRowsById(prev.changeLedger || [], loadedData.changeLedger || []);
        const mergedMobileMoneyEntries = mergeRowsById(prev.mobileMoneyEntries || [], loadedData.mobileMoneyEntries || []);
        const mergedMonthlyWakalaCommissions = mergeRowsById(prev.monthlyWakalaCommissions || [], loadedData.monthlyWakalaCommissions || []);
        const mergedGasEntries = mergeRowsById(prev.gasEntries || [], loadedData.gasEntries || []);
        const mergedHouses = mergeRowsById(
  prev.houses || [],
  loadedData.houses || []
);

const mergedMeters = mergeRowsById(
  prev.meters || [],
  loadedData.meters || []
);

const mergedWaterMeters = mergeRowsById(
  prev.waterMeters || [],
  loadedData.waterMeters || []
);

const mergedWaterBills = mergeRowsById(
  prev.waterBills || [],
  loadedData.waterBills || []
);

const mergedWaterPayments = mergeRowsById(
  prev.waterPayments || [],
  loadedData.waterPayments || []
);

const mergedWaterPaymentAllocations = mergeRowsById(
  prev.waterPaymentAllocations || [],
  loadedData.waterPaymentAllocations || []
);

const mergedWaterSupplierBills = mergeRowsById(
  prev.waterSupplierBills || [],
  loadedData.waterSupplierBills || []
);

const mergedWaterFundExpenses = mergeRowsById(
  prev.waterFundExpenses || [],
  loadedData.waterFundExpenses || []
);

const mergedServiceCharges = mergeRowsById(
  prev.serviceCharges || [],
  loadedData.serviceCharges || []
);

const mergedRentalTenants = mergeRowsById(
  prev.rentalTenants || [],
  loadedData.rentalTenants || []
);

const mergedPropertyOccupancies = mergeRowsById(
  prev.propertyOccupancies || [],
  loadedData.propertyOccupancies || []
);

const mergedRentalTenancies = mergeRowsById(
  prev.rentalTenancies || [],
  loadedData.rentalTenancies || []
);

const mergedRentInvoices = mergeRowsById(
  prev.rentInvoices || [],
  loadedData.rentInvoices || []
);

const mergedRentalPayments = mergeRowsById(
  prev.rentalPayments || [],
  loadedData.rentalPayments || []
);

const mergedRentPaymentAllocations = mergeRowsById(
  prev.rentPaymentAllocations || [],
  loadedData.rentPaymentAllocations || []
);

const mergedRentalExpenses = mergeRowsById(
  prev.rentalExpenses || [],
  loadedData.rentalExpenses || []
);

const mergedRentRecordCorrections = mergeRowsById(
  prev.rentRecordCorrections || [],
  loadedData.rentRecordCorrections || []
);

const mergedRentSmsReminders = mergeRowsById(
  prev.rentSmsReminders || [],
  loadedData.rentSmsReminders || []
);

const mergedRentSmsAttempts = mergeRowsById(
  prev.rentSmsAttempts || [],
  loadedData.rentSmsAttempts || []
);

        return {
          ...prev,
          ...loadedData,
          currentUser: sessionUser,
          users: loadedData.users?.length ? loadedData.users : prev.users,
          products: (
            (readSyncQueue() || []).some(
              (item) =>
                item?.synced === false &&
                (item?.actionType === 'purchase_created' ||
                  item?.actionType === 'sale_created')
            )
              ? prev.products || []
              : loadedData.products?.length
                ? loadedData.products
                : prev.products || []
          ).map((p) => {
            const existing = (prev.products || []).find((x) => String(x.id) === String(p.id));

            return existing?.archived
              ? { ...normalizeProduct(p), archived: true }
              : normalizeProduct(p);
          }),
          sales: mergedSales,
          purchases: mergedPurchases,
          expenses: mergedExpenses,
          creditSales: mergedCreditSales,
          changeLedger: mergedChangeLedger,
          mobileMoneyEntries: mergedMobileMoneyEntries,
          monthlyWakalaCommissions: mergedMonthlyWakalaCommissions,
          gasEntries: mergedGasEntries,
          houses: mergedHouses,
meters: Array.isArray(loadedData.meters)
  ? loadedData.meters
  : prev.meters,
waterMeters: Array.isArray(loadedData.waterMeters)
  ? loadedData.waterMeters
  : prev.waterMeters,
waterBills: Array.isArray(loadedData.waterBills)
  ? loadedData.waterBills
  : prev.waterBills,
waterPayments: Array.isArray(loadedData.waterPayments)
  ? loadedData.waterPayments
  : prev.waterPayments,
waterPaymentAllocations: Array.isArray(
  loadedData.waterPaymentAllocations
)
  ? loadedData.waterPaymentAllocations
  : prev.waterPaymentAllocations,
waterSupplierBills: mergedWaterSupplierBills,
waterFundExpenses: mergedWaterFundExpenses,
serviceCharges: mergedServiceCharges,
rentalTenants: mergedRentalTenants,
propertyOccupancies: mergedPropertyOccupancies,
rentalTenancies: mergedRentalTenancies,
rentInvoices: mergedRentInvoices,
rentalPayments: mergedRentalPayments,
rentPaymentAllocations: mergedRentPaymentAllocations,
rentalExpenses: mergedRentalExpenses,
rentRecordCorrections: mergedRentRecordCorrections,
rentSmsReminders: mergedRentSmsReminders,
rentSmsAttempts: mergedRentSmsAttempts,
        };
      });
    };

const loadCurrentOperationalData = async () => {
  try {
    setSyncMessage(
      t(
        language,
        'Loading current shop information...',
        'Inapakia taarifa za sasa za duka...'
      )
    );

    const operationalData = await readData({
      preferFresh: true,
      salesMode: 'month',
    });

    applyBackgroundData(operationalData);

    setDashboardDataReady(true);

    setSyncMessage(
      t(
        language,
        'Current information is ready.',
        'Taarifa za sasa zimekamilika.'
      )
    );
  } catch (error) {
    console.error(
      'Current operational data loading failed:',
      error
    );

    setDashboardDataReady(true);

    setSyncMessage(
      t(
        language,
        'Using the last confirmed saved information.',
        'Mfumo unatumia taarifa za mwisho zilizothibitishwa.'
      )
    );
  }
};

loadCurrentOperationalData();
  }
};

const openShopDashboard = async (shopId) => {
  const selectedShopId = String(shopId || '').trim();

  if (!selectedShopId) {
    setSyncMessage(
      t(
        language,
        'Shop could not be opened because shop ID is missing.',
        'Duka halijafunguka kwa sababu taarifa ya duka haipo.'
      )
    );
    return;
  }

  if (!dashboardDataReady) {
    setSyncMessage(
      t(
        language,
        'Confirmed Supabase data is still being prepared. Please wait until loading is complete.',
        'Taarifa zilizothibitishwa kutoka Supabase bado zinaandaliwa. Tafadhali subiri mpaka upakiaji ukamilike.'
      )
    );
    return;
  }

  setActiveShopId(selectedShopId);

ensureCurrentMonthSalesTargets(selectedShopId).catch((error) => {
  console.error('Monthly sales target background check failed:', error);
});
};
const logout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error(
      'Supabase logout failed, but local session will still be cleared:',
      error
    );
  } finally {
    writeStorage(STORAGE_SESSION_KEY, null);
    setActiveShopId(null);
    setDashboardDataReady(false);

    setData((prev) => ({
      ...prev,
      currentUser: null,
    }));
  }
};

useEffect(() => {
  const currentUser = data?.currentUser;
  const userShopId = String(currentUser?.shop_id || currentUser?.shopId || '').trim();

  if (String(currentUser?.role || '') !== 'shop') return;
  if (!userShopId) return;
  if (decisionCentreSalesLoaded) return;
  if (!navigator.onLine) return;

  const loadDecisionCentreSales = async () => {
    try {
      const { data: longSales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('shop_id', userShopId)
        .gte('date', daysAgoISO(180))
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDecisionCentreSales((longSales || []).map((sale) => ({
        ...sale,
        shop_id: String(sale?.shop_id || '').trim(),
        date: sale?.date || (sale?.created_at ? String(sale.created_at).slice(0, 10) : todayISO()),
        confirmed: true,
      })));

      setDecisionCentreSalesLoaded(true);
    } catch (error) {
      console.error('Failed to load Decision Centre long sales history:', error);
      setDecisionCentreSalesLoaded(true);
    }
  };

  loadDecisionCentreSales();
}, [data?.currentUser, decisionCentreSalesLoaded]);
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
    !isOnline
      ? 'bg-amber-50 text-amber-700'
      : String(syncMessage || '').toLowerCase().includes('failed')
        ? 'bg-red-50 text-red-700'
        : String(syncMessage || '').toLowerCase().includes('pending')
          ? 'bg-amber-50 text-amber-700'
          : 'bg-green-50 text-green-700'
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
  ownerCustomStartDate={ownerCustomStartDate}
  setOwnerCustomStartDate={setOwnerCustomStartDate}
  ownerCustomEndDate={ownerCustomEndDate}
  setOwnerCustomEndDate={setOwnerCustomEndDate}
  language={language}
  setLanguage={setLanguage}
  dashboardDataReady={dashboardDataReady}
/>
  </>
);
  }

  const shop =
  data.shops.find((s) => s.id === selectedShopId) ||
  data.shops[0];

return (
  <>
    <div
  className={`mx-4 mt-4 rounded-2xl px-4 py-2 text-sm font-medium ${
    !isOnline
      ? 'bg-amber-50 text-amber-700'
      : String(syncMessage || '').toLowerCase().includes('failed')
        ? 'bg-red-50 text-red-700'
        : String(syncMessage || '').toLowerCase().includes('pending')
          ? 'bg-amber-50 text-amber-700'
          : 'bg-green-50 text-green-700'
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
  dashboardDataReady={dashboardDataReady}
  setSyncMessage={setSyncMessage}
/>


  </>
);
}
