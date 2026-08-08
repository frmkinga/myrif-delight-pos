import React, { useMemo, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  getLiveRemittanceShopPosition,
  HOME_EXPENSES_PERFORMANCE_START_DATE,
} from '../remittance/DailyRemittanceCentre';

const HOME_EXPENSES_START_DATE = '2026-08-01';
/*
 * Read Home Expenses funding from one consistent set of fields.
 * Historical dates retain the old funding calculation.
 * From 8 August, both reports and live cards read the pooled allocation.
 */
const getHomeExpensesFundingFromPosition = (
  position,
  dateKey
) => {
  if (
    dateKey >= HOME_EXPENSES_PERFORMANCE_START_DATE
  ) {
    return {
      shopContribution: Math.max(
        0,
        Number(
          position?.shopHomeExpensesContribution || 0
        )
      ),

      gasContribution: Math.max(
        0,
        Number(
          position?.pooledGasHomeExpensesContribution || 0
        )
      ),
    };
  }

  const historicalFundingBreakdown = Array.isArray(
    position?.centralExpenseFundingBreakdown
  )
    ? position.centralExpenseFundingBreakdown
    : [];

  const historicalHomeExpenseFunding =
    historicalFundingBreakdown.find(
      (expense) =>
        String(expense?.key || '') === 'homeExpenses'
    );

  return {
    shopContribution: Math.max(
      0,
      Number(
        historicalHomeExpenseFunding?.amountFunded || 0
      )
    ),

    gasContribution: Math.max(
      0,
      Number(
        position?.gasHomeExpensesContribution || 0
      )
    ),
  };
};
const HOME_EXPENSES_MONTHLY_BUDGET = {
  target: 2012000,
  items: [
    { name: 'Unga', amount: 70000 },
    { name: 'Maharage', amount: 90000 },
    { name: 'Mafuta', amount: 90000 },
    { name: 'Nazi', amount: 90000 },
    { name: 'Nyama', amount: 200000 },
    { name: 'Samaki', amount: 100000 },
    { name: 'Sukari', amount: 50000 },
    { name: 'Dagaa', amount: 72000 },
    { name: 'Viungo', amount: 200000 },
    { name: 'Akiba', amount: 150000 },
    { name: 'Vitafunwa', amount: 150000 },
    { name: 'Maziwa', amount: 156000 },
    { name: 'Mayai', amount: 72000 },
    { name: 'Viazi', amount: 92000 },
    { name: 'Sabuni', amount: 100000 },
    { name: 'Ndizi', amount: 60000 },
    { name: 'Mchele', amount: 270000 },
  ],
};
const normalizeHomeExpenseText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const HOME_EXPENSES_CATEGORY_MATCHERS = [
  {
    category: 'Viungo',
    keywords: [
      'viungo',
      'kiungo',
      'soy source',
      'soy sauce',
      'tomato source',
      'tomato sauce',
      'tomato paste',
      'vitunguu',
      'kitunguu',
      'vitunguu maji',
      'vitunguu saumu',
      'karafuu',
      'limao',
      'ndimu',
      'vinegar',
      'pilau mix',
      'pilipili',
      'pilipili manga',
      'hamira',
      'chapa mandashi',
      'magadi',
      'chumvi',
      'nazi',
      'azam nazi',
      'gsm nazi',
      'coconut',
    ],
  },
  {
    category: 'Sabuni',
    keywords: ['sabuni', 'soap', 'detergent', 'omo', 'sunlight'],
  },
  {
    category: 'Mafuta',
    keywords: ['mafuta', 'oil', 'kupikia', 'oki'],
  },
  {
    category: 'Maharage',
    keywords: ['maharage', 'harage'],
  },
  {
    category: 'Mchele',
    keywords: ['mchele', 'rice'],
  },
  {
    category: 'Unga',
    keywords: ['unga', 'sembe', 'dona', 'ngano', 'flour'],
  },
  {
    category: 'Nyama',
    keywords: ['nyama', 'beef', 'kuku', 'mbuzi', 'chicken'],
  },
  {
    category: 'Samaki',
    keywords: ['samaki', 'fish'],
  },
  {
    category: 'Sukari',
    keywords: ['sukari', 'sugar'],
  },
  {
    category: 'Dagaa',
    keywords: ['dagaa'],
  },
  {
    category: 'Vitafunwa',
    keywords: ['vitafunwa', 'biskuti', 'biscuit', 'chapati', 'mandazi', 'mkate'],
  },
  {
    category: 'Maziwa',
    keywords: ['maziwa', 'milk'],
  },
  {
    category: 'Mayai',
    keywords: ['mayai', 'yai', 'egg', 'eggs'],
  },
  {
    category: 'Viazi',
    keywords: ['viazi', 'potato', 'potatoes'],
  },
  {
    category: 'Ndizi',
    keywords: ['ndizi', 'banana', 'bananas'],
  },
  {
    category: 'Akiba',
    keywords: ['akiba'],
  },
];

const getHomeExpenseBudgetCategoryFromProduct = (productName) => {
  const productText = ` ${normalizeHomeExpenseText(productName)} `;

  if (!productText.trim()) return '';

  const matchedRule = HOME_EXPENSES_CATEGORY_MATCHERS.find((rule) =>
    rule.keywords.some((keyword) =>
      productText.includes(` ${normalizeHomeExpenseText(keyword)} `)
    )
  );

  return matchedRule?.category || '';
};
const STORAGE_SYNC_QUEUE_KEY = 'rafikiai_sync_queue';

const t = (language, en, sw) =>
  language === 'sw' ? sw : en;

const roundHomeCashDisplay = (value, step = 50) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount === 0) return 0;

  const sign = amount < 0 ? -1 : 1;
  const absoluteAmount = Math.abs(amount);

  return sign * Math.round(absoluteAmount / step) * step;
};

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(roundHomeCashDisplay(value));

const todayISO = (input = new Date()) => {
  const d = new Date(input);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfDay = (date) => {
  if (
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
};

const startOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const pad2 = (value) => String(value).padStart(2, '0');

const getPreviousMonthKey = (monthKey) => {
  const [yearText, monthText] = String(monthKey || '').split('-');
  const year = Number(yearText || 0);
  const month = Number(monthText || 0);

  if (!year || !month) return '';

  const previousMonthDate = new Date(year, month - 2, 1);

  return `${previousMonthDate.getFullYear()}-${pad2(
    previousMonthDate.getMonth() + 1
  )}`;
};

const getCommissionRecordMonthKey = (record) => {
  const explicitMonth = String(record?.commissionMonth || '').slice(0, 7);
  if (explicitMonth) return explicitMonth;

  const createdMonth = String(
    record?.created_at ||
      record?.updated_at ||
      ''
  ).slice(0, 7);

  return createdMonth;
};

const getCommissionRecordTotal = (record) => {
  const commissionRows = [
    ...(Array.isArray(record?.mobileCommissions)
      ? record.mobileCommissions
      : []),
    ...(Array.isArray(record?.bankCommissions)
      ? record.bankCommissions
      : []),
  ];

  if (commissionRows.length) {
    return commissionRows.reduce((sum, row) => {
      if (row?.notReceived === true) return sum;

      return (
        sum +
        Math.max(
          0,
          Number(
            row?.amount ||
              row?.commission ||
              row?.total ||
              0
          )
        )
      );
    }, 0);
  }

  const mobileTotal = Number(record?.mobileTotal || 0);
  const bankTotal = Number(record?.bankTotal || 0);
  const grandTotal = Number(record?.grandTotal || 0);

  if (grandTotal > 0) return grandTotal;

  return mobileTotal + bankTotal;
};
const roundStockQty = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return (
    Math.round(
      (Number(value || 0) + Number.EPSILON) * factor
    ) / factor
  );
};

const formatQty = (value) => {
  const num = roundStockQty(value, 2);
  return Number.isInteger(num)
    ? String(num)
    : new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
      }).format(num);
};

const parseAmount = (value) =>
  Number(String(value || '').replace(/,/g, '').trim() || 0);

const formatMoneyInput = (value) => {
  const raw = String(value || '')
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '');

  if (!raw) return '';

  const [whole, decimal] = raw.split('.');
  const formattedWhole = new Intl.NumberFormat('en-US').format(
    Number(whole || 0)
  );

  return decimal !== undefined
    ? `${formattedWhole}.${decimal.slice(0, 2)}`
    : formattedWhole;
};

const readSyncQueue = () => {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_SYNC_QUEUE_KEY) || '[]'
    );
  } catch {
    return [];
  }
};

const writeSyncQueue = (queue) => {
  localStorage.setItem(
    STORAGE_SYNC_QUEUE_KEY,
    JSON.stringify(Array.isArray(queue) ? queue : [])
  );
};

const addToSyncQueue = (actionType, payload) => {
  const queue = readSyncQueue();

  const payloadId = String(payload?.id || '');

  const existingIndex = queue.findIndex(
    (item) =>
      item.actionType === actionType &&
      String(item?.payload?.id || '') === payloadId &&
      item.synced === false
  );

  if (existingIndex >= 0) {
    queue[existingIndex] = {
      ...queue[existingIndex],
      payload,
      updatedAt: Date.now(),
      synced: false,
    };

    writeSyncQueue(queue);
    return;
  }

  queue.push({
    id: `sync-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    actionType,
    payload,
    createdAt: Date.now(),
    synced: false,
  });

  writeSyncQueue(queue);
};

const normalizeProduct = (product = {}) => ({
  ...product,
  id: product.id || '',
  name: String(product.name || '').trim(),
  shop_id: String(
    product.shop_id ||
      product.shopId ||
      product.shopid ||
      ''
  ).trim(),
  buyPrice: Number(
    product.buyPrice ||
      product.buyingprice ||
      product.buyingPrice ||
      0
  ),
  sellPrice: Number(
    product.sellPrice ||
      product.sellingprice ||
      product.sellingPrice ||
      product.price ||
      0
  ),
  stockBaseQty: Number(
    product.stockBaseQty ||
      product.stockQty ||
      product.stock ||
      0
  ),
  baseUnit:
    product.baseUnit || product.baseunit || product.unit || 'pc',
  archived: Boolean(product.archived),
  createdAt: product.createdAt || '',
  created_at: product.created_at || '',
});

const getReportDateRange = ({
  preset,
  customStartDate,
  customEndDate,
}) => {
  const now = startOfDay(new Date());

  const getWeekStart = (date) => {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return addDays(d, diff);
  };

  if (preset === 'all') {
    return {
      startKey: HOME_EXPENSES_START_DATE,
      endKey: todayISO(now),
    };
  }

  if (preset === 'today') {
    return {
      startKey: todayISO(now),
      endKey: todayISO(now),
    };
  }

  if (preset === 'yesterday') {
    const yesterday = addDays(now, -1);
    return {
      startKey: todayISO(yesterday),
      endKey: todayISO(yesterday),
    };
  }

  if (preset === 'week') {
    return {
      startKey: todayISO(getWeekStart(now)),
      endKey: todayISO(now),
    };
  }

  if (preset === 'lastweek') {
    const thisWeekStart = getWeekStart(now);
    const lastWeekStart = addDays(thisWeekStart, -7);
    const lastWeekEnd = addDays(thisWeekStart, -1);

    return {
      startKey: todayISO(lastWeekStart),
      endKey: todayISO(lastWeekEnd),
    };
  }

  if (preset === 'month') {
    return {
      startKey: todayISO(startOfMonth(now)),
      endKey: todayISO(now),
    };
  }

  if (preset === 'lastmonth') {
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastMonthEnd = addDays(startOfMonth(now), -1);

    return {
      startKey: todayISO(lastMonthStart),
      endKey: todayISO(lastMonthEnd),
    };
  }

  if (preset === 'date' && customStartDate && customEndDate) {
    return {
      startKey: customStartDate,
      endKey: customEndDate,
    };
  }

  return {
    startKey: todayISO(startOfMonth(now)),
    endKey: todayISO(now),
  };
};

const getDateKeys = (startKey, endKey) => {
  if (!startKey || !endKey || endKey < startKey) return [];

  const keys = [];
  let cursor = startOfDay(startKey);
  const finalDate = startOfDay(endKey);

  while (cursor <= finalDate) {
    keys.push(todayISO(cursor));
    cursor = addDays(cursor, 1);
  }

  return keys;
};

const saleHasHomeExpenseItems = (sale) =>
  (sale?.items || []).some(
    (item) => item?.homeExpense === true
  );

const getHomeExpenseItemRows = (sales = []) => {
  const rows = [];

  sales.forEach((sale) => {
    const saleDate = String(
      sale.date || sale.created_at || ''
    ).slice(0, 10);

    (sale.items || []).forEach((item) => {
      if (item?.homeExpense !== true) return;

      const quantity = Number(item.quantity || 0);
      const sellPrice = Number(
        item.sellPrice ?? item.price ?? 0
      );
      const buyPrice = Number(item.buyPrice || 0);
      const total = Number(item.total || quantity * sellPrice);

      rows.push({
        id: `${sale.id}-${item.productId}-${rows.length}`,
        saleId: sale.id,
        date: item.homeExpenseDate || saleDate,
        productId: item.productId || '',
        productName: item.name || '',
        quantity,
        unit: item.unit || '',
        sellPrice,
        buyPrice,
        total,
        profit: quantity * (sellPrice - buyPrice),
        takenBy: item.takenBy || '',
        purpose: item.purpose || '',
        notes: item.notes || '',
        created_at: sale.created_at || '',
      });
    });
  });

  return rows;
};

const isHomeCashTransaction = (transaction) => {
  const transactionType = String(
    transaction?.transactionType ||
      transaction?.transaction_type ||
      ''
  );

  return transactionType === 'home_expense_cash_taken';
};

function SummaryCard({ label, value, tone = 'slate', valueText = '' }) {
  const toneClass = {
    slate: 'border-slate-200 bg-slate-50 text-slate-950',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    orange: 'border-orange-200 bg-orange-50 text-orange-800',
    red: 'border-red-200 bg-red-50 text-red-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">
        {valueText || `TZS ${money(value)}`}
      </div>
    </div>
  );
}

export default function HomeExpensesCentre({
  data,
  saveData,
  shop,
  language = 'sw',
  currentUser,
}) {
  const [activeTab, setActiveTab] = useState('sale');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [saleDate, setSaleDate] = useState(todayISO());
  const [takenBy, setTakenBy] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeManuallyEdited, setPurposeManuallyEdited] = useState(false);
  const [notes, setNotes] = useState('');
  const [saleError, setSaleError] = useState('');
  const [saleSaving, setSaleSaving] = useState(false);

  const [cashDate, setCashDate] = useState(todayISO());
  const [cashAmount, setCashAmount] = useState('');
  const [cashTakenBy, setCashTakenBy] = useState('');
  const [cashPurpose, setCashPurpose] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [cashSaving, setCashSaving] = useState(false);

  const [commissionAmount, setCommissionAmount] = useState('');
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [showCommissionSupport, setShowCommissionSupport] = useState(false);

  const [reportPreset, setReportPreset] = useState('all');
  const [reportView, setReportView] = useState('products');
  const [customStartDate, setCustomStartDate] = useState(todayISO());
  const [customEndDate, setCustomEndDate] = useState(todayISO());

  const saleLock = useRef(false);
  const cashLock = useRef(false);

  const shopId = String(shop?.id || '').trim();

  const isShopOne = shopId === 'shop-1';

  const products = useMemo(
    () =>
      (data?.products || [])
        .map(normalizeProduct)
        .filter(
          (product) =>
            String(product.shop_id) === 'shop-1' &&
            product.id &&
            product.name &&
            !product.archived
        ),
    [data?.products]
  );

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) return [];

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(search)
      )
      .slice(0, 20);
  }, [products, productSearch]);

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      ),
    [cart]
  );

  const currentMonthRange = useMemo(() => {
    const now = new Date();
    const startKey = todayISO(startOfMonth(now));
    const endKey = todayISO(now);
    const monthKey = `${now.getFullYear()}-${pad2(
      now.getMonth() + 1
    )}`;

    return {
      startKey:
        startKey < HOME_EXPENSES_START_DATE
          ? HOME_EXPENSES_START_DATE
          : startKey,
      endKey,
      monthKey,
    };
  }, []);

  const currentMonthDateKeys = useMemo(
    () =>
      getDateKeys(
        currentMonthRange.startKey,
        currentMonthRange.endKey
      ),
    [currentMonthRange]
  );
const previousMonthKey = useMemo(
    () => getPreviousMonthKey(currentMonthRange.monthKey),
    [currentMonthRange.monthKey]
  );

  const previousMonthCommissionTotal = useMemo(
    () =>
      (data?.monthlyWakalaCommissions || [])
        .filter(
          (record) =>
            getCommissionRecordMonthKey(record) === previousMonthKey
        )
        .reduce(
          (sum, record) =>
            sum + Math.max(0, getCommissionRecordTotal(record)),
          0
        ),
    [data?.monthlyWakalaCommissions, previousMonthKey]
  );
  const reportRange = useMemo(
    () =>
      getReportDateRange({
        preset: reportPreset,
        customStartDate,
        customEndDate,
      }),
    [reportPreset, customStartDate, customEndDate]
  );

  const homeExpenseItemRows = useMemo(
    () =>
      getHomeExpenseItemRows(data?.sales || []).filter(
        (row) =>
          row.date >= reportRange.startKey &&
          row.date <= reportRange.endKey
      ),
    [data?.sales, reportRange]
  );

  const currentMonthHomeExpenseItems = useMemo(
    () =>
      getHomeExpenseItemRows(data?.sales || []).filter(
        (row) =>
          row.date >= currentMonthRange.startKey &&
          row.date <= currentMonthRange.endKey
      ),
    [data?.sales, currentMonthRange]
  );

  const cashTransactions = useMemo(
    () =>
      (data?.centralFundTransactions || [])
        .filter(isHomeCashTransaction)
        .map((transaction) => ({
          id: transaction.id || '',
          date: String(
            transaction.transactionDate ||
              transaction.transaction_date ||
              transaction.date ||
              transaction.created_at ||
              ''
          ).slice(0, 10),
          amount: Number(transaction.amount || 0),
          takenBy:
            transaction.payee ||
            transaction.takenBy ||
            transaction.taken_by ||
            '',
          purpose: transaction.purpose || '',
          notes: transaction.notes || '',
          created_at: transaction.created_at || '',
        })),
    [data?.centralFundTransactions]
  );

  const reportCashTransactions = useMemo(
    () =>
      cashTransactions.filter(
        (row) =>
          row.date >= reportRange.startKey &&
          row.date <= reportRange.endKey
      ),
    [cashTransactions, reportRange]
  );

  const currentMonthCashTransactions = useMemo(
    () =>
      cashTransactions.filter(
        (row) =>
          row.date >= currentMonthRange.startKey &&
          row.date <= currentMonthRange.endKey
      ),
    [cashTransactions, currentMonthRange]
  );

  const fundingSummary = useMemo(() => {
    let shopContributions = 0;
    let gasContributions = 0;
    let commissionContributions = 0;

    (data?.shops || []).forEach((fundingShop) => {
      const fundingShopId = String(fundingShop?.id || '').trim();

      if (!fundingShopId) return;

      currentMonthDateKeys.forEach((dateKey) => {
        const dayPosition = getLiveRemittanceShopPosition({
          data,
          shopId: fundingShopId,
          calculationDateKey: dateKey,
        });

        const dailyHomeFunding =
          getHomeExpensesFundingFromPosition(
            dayPosition,
            dateKey
          );

        shopContributions +=
          dailyHomeFunding.shopContribution;

        gasContributions +=
          dailyHomeFunding.gasContribution;
      });
    });
        /*
     * Home Expenses uses physical cash figures.
     * Round the two pooled sources once before calculating totals,
     * balances and debt so every displayed figure reconciles.
     */
    shopContributions =
      roundHomeCashDisplay(shopContributions);

    gasContributions =
      roundHomeCashDisplay(gasContributions);
    const confirmedFundingBreakdown = (
      data?.centralFundTransactions || []
    ).reduce(
      (totals, transaction) => {
        const dateKey = String(
          transaction.transactionDate ||
            transaction.transaction_date ||
            transaction.date ||
            transaction.created_at ||
            ''
        ).slice(0, 10);

        const transactionType = String(
          transaction.transactionType ||
            transaction.transaction_type ||
            ''
        ).toLowerCase();

        const transactionStatus = String(
          transaction.status || 'confirmed'
        ).toLowerCase();

        const destinationKey = String(
          transaction.destinationFundKey ||
            transaction.destination_fund_key ||
            transaction.expenseKey ||
            transaction.expense_key ||
            ''
        );

        if (
          dateKey < currentMonthRange.startKey ||
          dateKey > currentMonthRange.endKey
        ) {
          return totals;
        }

        if (transactionStatus !== 'confirmed') {
          return totals;
        }

        if (transactionType === 'home_expense_cash_taken') {
          return totals;
        }

        if (!destinationKey.includes('homeExpenses')) {
          return totals;
        }

        const amount = Math.max(
          0,
          Number(transaction.amount || 0)
        );

        if (
          transactionType ===
          'home_expense_commission_confirmed'
        ) {
          totals.confirmedCommissionFunding += amount;
        } else {
          totals.otherConfirmedFunding += amount;
        }

        return totals;
      },
      {
        confirmedCommissionFunding: 0,
        otherConfirmedFunding: 0,
      }
    );

    commissionContributions =
      confirmedFundingBreakdown.confirmedCommissionFunding;

    const confirmedHomeFundingTransactions =
      confirmedFundingBreakdown.otherConfirmedFunding;

    const fundedSoFar =
      shopContributions +
      gasContributions +
      commissionContributions +
      confirmedHomeFundingTransactions;

    const itemsTaken = currentMonthHomeExpenseItems.reduce(
      (sum, row) => sum + Number(row.total || 0),
      0
    );

    const cashTaken = currentMonthCashTransactions.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );

    const totalSpent = itemsTaken + cashTaken;
    const balanceRemaining = fundedSoFar - totalSpent;
    const amountOwed =
      balanceRemaining < 0 ? Math.abs(balanceRemaining) : 0;
    const unfundedBudgetBalance = Math.max(
      0,
      Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0) -
        fundedSoFar
    );

    return {
      monthlyBudget: HOME_EXPENSES_MONTHLY_BUDGET.target,
      shopContributions,
      gasContributions,
      commissionContributions,
      otherConfirmedFunding: confirmedHomeFundingTransactions,
      fundedSoFar,
      itemsTaken,
      cashTaken,
      totalSpent,
      balanceRemaining,
      amountOwed,
      unfundedBudgetBalance,
    };
  }, [
    data,
    currentMonthDateKeys,
    currentMonthRange,
    currentMonthHomeExpenseItems,
    currentMonthCashTransactions,
  ]);

  const homeExpensesDailyClosingSummary = useMemo(() => {
    const todayKey = todayISO();

    let shopContributionsToday = 0;
    let gasContributionsToday = 0;

    (data?.shops || []).forEach((fundingShop) => {
      const fundingShopId = String(fundingShop?.id || '').trim();

      if (!fundingShopId) return;

      const dayPosition = getLiveRemittanceShopPosition({
        data,
        shopId: fundingShopId,
        calculationDateKey: todayKey,
      });

      const dailyHomeFunding =
        getHomeExpensesFundingFromPosition(
          dayPosition,
          todayKey
        );

      shopContributionsToday +=
        dailyHomeFunding.shopContribution;

      gasContributionsToday +=
        dailyHomeFunding.gasContribution;
    });
    /*
     * Use the same cash-rounded source amounts for today's
     * collection, handover, savings and debt calculations.
     */
    shopContributionsToday =
      roundHomeCashDisplay(shopContributionsToday);

    gasContributionsToday =
      roundHomeCashDisplay(gasContributionsToday);
    const confirmedFundingToday = (
      data?.centralFundTransactions || []
    ).reduce((sum, transaction) => {
      const dateKey = String(
        transaction.transactionDate ||
          transaction.transaction_date ||
          transaction.date ||
          transaction.created_at ||
          ''
      ).slice(0, 10);

      const transactionType = String(
        transaction.transactionType ||
          transaction.transaction_type ||
          ''
      ).toLowerCase();

      const transactionStatus = String(
        transaction.status || 'confirmed'
      ).toLowerCase();

      const destinationKey = String(
        transaction.destinationFundKey ||
          transaction.destination_fund_key ||
          transaction.expenseKey ||
          transaction.expense_key ||
          ''
      );

      if (dateKey !== todayKey) return sum;
      if (transactionStatus !== 'confirmed') return sum;
      if (transactionType === 'home_expense_cash_taken') return sum;
      if (!destinationKey.includes('homeExpenses')) return sum;

      return sum + Math.max(0, Number(transaction.amount || 0));
    }, 0);

    const collectedToday =
  shopContributionsToday +
  gasContributionsToday +
  confirmedFundingToday;

    const productsUsedToday = currentMonthHomeExpenseItems
      .filter((row) => String(row.date || '').slice(0, 10) === todayKey)
      .reduce((sum, row) => sum + Number(row.total || 0), 0);

    const cashTakenToday = cashTransactions
      .filter((row) => String(row.date || '').slice(0, 10) === todayKey)
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);

    const usedToday = productsUsedToday + cashTakenToday;

    const totalCollectedSoFar = Number(fundingSummary.fundedSoFar || 0);
    const totalUsedSoFar = Number(fundingSummary.totalSpent || 0);

    const remainingOldDebt = Math.max(
      0,
      totalUsedSoFar - totalCollectedSoFar
    );

    const fundSavingToday = Math.max(
  0,
  totalCollectedSoFar - totalUsedSoFar
);

const oldDebtBeforeToday = Math.max(
  0,
  (totalUsedSoFar - usedToday) -
    (totalCollectedSoFar - collectedToday)
);

const debtReducedToday = Math.min(
  oldDebtBeforeToday,
  Math.max(0, collectedToday - usedToday)
);

return {
      collectedToday,
      usedToday,
      amountToHandOverToday: Math.min(collectedToday, usedToday),
      remainingOldDebt,
debtReducedToday,
fundSavingToday,
    };
  }, [data, currentMonthHomeExpenseItems, cashTransactions, fundingSummary]);

  const commissionConfirmationId = `home-expense-commission-${currentMonthRange.monthKey}`;

  const confirmedCommissionTransaction = useMemo(
    () =>
      (data?.centralFundTransactions || []).find(
        (transaction) =>
          String(transaction?.id || '') === commissionConfirmationId
      ),
    [data?.centralFundTransactions, commissionConfirmationId]
  );

  const confirmedCommissionAmount = Number(
    confirmedCommissionTransaction?.amount || 0
  );

  const commissionDeficitBeforeConfirmation = Math.max(
    0,
    Number(fundingSummary.monthlyBudget || 0) -
      Number(fundingSummary.shopContributions || 0) -
      Number(fundingSummary.gasContributions || 0) -
      Number(fundingSummary.otherConfirmedFunding || 0)
  );

  const suggestedCommissionAmount = Math.min(
    Number(previousMonthCommissionTotal || 0),
    commissionDeficitBeforeConfirmation
  );


  const addProductToCart = (product, qty = 1) => {
    const quantity = Number(qty || 0);

    if (quantity <= 0) return;

    if (quantity > Number(product.stockBaseQty || 0)) {
      setSaleError(
        t(
          language,
          'Quantity is greater than available stock.',
          'Kiasi kimezidi stock iliyopo.'
        )
      );
      return;
    }

    setSaleError('');

    const suggestedPurpose =
      getHomeExpenseBudgetCategoryFromProduct(product.name);

    if (suggestedPurpose && !purposeManuallyEdited) {
      setPurpose(suggestedPurpose);
    }

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.productId === product.id
      );

      const nextQty =
        Number(existing?.quantity || 0) + quantity;

      if (nextQty > Number(product.stockBaseQty || 0)) {
        setSaleError(
          t(
            language,
            'Total quantity in cart is greater than available stock.',
            'Jumla ya kiasi kwenye kikapu imezidi stock iliyopo.'
          )
        );

        return previousCart;
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

        return [
          updatedItem,
          ...previousCart.filter(
            (item) => item.productId !== product.id
          ),
        ];
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
        ...previousCart,
      ];
    });
  };

  const addProductToCartAndClearSearch = (
    product,
    qty = 1,
    shouldClearSearch = false
  ) => {
    addProductToCart(product, qty);

    if (shouldClearSearch) {
      setProductSearch('');
    }
  };
  const updateCartQuantity = (productId, value) => {
    const rawValue = String(value ?? '');

    setCart((previousCart) =>
      previousCart
        .map((item) => {
          if (item.productId !== productId) return item;

          if (rawValue.trim() === '') {
            return {
              ...item,
              quantity: '',
              total: 0,
            };
          }

          const quantity = Number(rawValue || 0);

          const product = products.find(
            (p) => p.id === productId
          );

          const availableStock = Number(
            product?.stockBaseQty || 0
          );

          const safeQuantity =
            quantity > availableStock
              ? availableStock
              : quantity;

          return {
            ...item,
            quantity: safeQuantity,
            total: safeQuantity * Number(item.price || 0),
          };
        })
        .filter((item) => {
          const itemQuantityText = String(item.quantity ?? '').trim();

          if (itemQuantityText === '') return true;

          return Number(item.quantity || 0) > 0;
        })
    );
  };

  const removeCartItem = (productId) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.productId !== productId)
    );
  };

  const commitHomeExpenseSale = async () => {
    if (!isShopOne) return;

    if (!cart.length) {
      setSaleError(
        t(
          language,
          'Please add at least one product.',
          'Tafadhali ongeza angalau bidhaa moja.'
        )
      );
      return;
    }

    const homeTakenBy =
      String(takenBy || '').trim() || 'Nyumbani';

    if (!String(purpose || '').trim()) {
      setSaleError(
        t(
          language,
          'Please fill the purpose.',
          'Tafadhali jaza matumizi/purpose.'
        )
      );
      return;
    }

    if (saleLock.current) return;

    saleLock.current = true;
    setSaleSaving(true);
    setSaleError('');

    const nextProducts = [...(data?.products || [])];

    for (const item of cart) {
      const productIndex = nextProducts.findIndex(
        (product) =>
          String(product?.id || '') === String(item.productId)
      );

      if (productIndex >= 0) {
        const currentStock = Number(
          nextProducts[productIndex].stockBaseQty ||
            nextProducts[productIndex].stock ||
            0
        );

        if (Number(item.quantity || 0) > currentStock) {
          setSaleError(
            t(
              language,
              'One item has insufficient stock. Please check the cart.',
              'Bidhaa moja haina stock ya kutosha. Tafadhali kagua kikapu.'
            )
          );

          setSaleSaving(false);
          saleLock.current = false;
          return;
        }
      }
    }

    try {
      cart.forEach((item) => {
        const productIndex = nextProducts.findIndex(
          (product) =>
            String(product?.id || '') === String(item.productId)
        );

        if (productIndex >= 0) {
          const normalized = normalizeProduct(
            nextProducts[productIndex]
          );

          nextProducts[productIndex] = {
            ...nextProducts[productIndex],
            ...normalized,
            stockBaseQty: roundStockQty(
              Math.max(
                0,
                Number(normalized.stockBaseQty || 0) -
                  Number(item.quantity || 0)
              ),
              2
            ),
          };
        }
      });

      const preparedItems = cart.map((item) => ({
        ...item,
        homeExpense: true,
        homeExpenseLabel: 'Matumizi ya Nyumbani',
        homeExpenseSource: 'Shop 1 / Nyumbani Shop',
        homeExpenseDate: saleDate || todayISO(),
        takenBy: homeTakenBy,
        purpose: String(purpose || '').trim(),
        notes: String(notes || '').trim(),
      }));

      const total = preparedItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );

      const saleRecord = {
        id: `sale-home-${Date.now()}`,
        shop_id: 'shop-1',
        items: preparedItems,
        total,
        type: 'cash',
        date: saleDate || todayISO(),
        created_at: new Date().toISOString(),
        confirmed: false,
      };

      const nextSales = [...(data?.sales || []), saleRecord];

      await saveData({
        ...data,
        products: nextProducts,
        sales: nextSales,
      });

      const salePayload = {
        ...saleRecord,
        products: nextProducts
          .filter(
            (product) =>
              String(
                product.shop_id ||
                  product.shopId ||
                  product.shopid ||
                  ''
              ) === 'shop-1'
          )
          .map((product) => {
            const normalized = normalizeProduct(product);

            return {
              id: normalized.id,
              name: normalized.name,
              buyPrice: Number(normalized.buyPrice || 0),
              sellPrice: Number(normalized.sellPrice || 0),
              stockBaseQty: Number(
                normalized.stockBaseQty || 0
              ),
              shop_id: normalized.shop_id || 'shop-1',
              baseUnit: normalized.baseUnit || 'pc',
              created_at:
                normalized.created_at ||
                new Date().toISOString(),
            };
          }),
      };

      addToSyncQueue('sale_created', salePayload);

      if (navigator.onLine) {
        const { error: saleErrorResponse } = await supabase
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
          );

        if (saleErrorResponse) {
          console.error(
            'Home expense sale sync failed:',
            saleErrorResponse
          );
        }

        const productRows = salePayload.products.map((product) => ({
          id: product.id,
          name: String(product.name || '').trim(),
          buyingprice: Number(product.buyPrice || 0),
          sellingprice: Number(product.sellPrice || 0),
          stock: Number(product.stockBaseQty || 0),
          shop_id: product.shop_id,
          baseunit: product.baseUnit || 'pc',
          created_at:
            product.created_at || new Date().toISOString(),
        }));

        const { error: productError } = await supabase
          .from('products')
          .upsert(productRows, { onConflict: 'id' });

        if (productError) {
          console.error(
            'Home expense product sync failed:',
            productError
          );
        }
      }

      setCart([]);
      setProductSearch('');
      setTakenBy('');
      setPurpose('');
      setPurposeManuallyEdited(false);
      setNotes('');
      setSaleDate(todayISO());
    } catch (error) {
      console.error('Home expense sale failed:', error);
      setSaleError(error?.message || String(error));
    } finally {
      setSaleSaving(false);
      saleLock.current = false;
    }
  };

  const saveCashTaken = async () => {
    if (!isShopOne) return;

    const amount = parseAmount(cashAmount);

    if (amount <= 0) {
      alert(
        t(
          language,
          'Please enter cash amount.',
          'Tafadhali weka kiasi cha cash.'
        )
      );
      return;
    }

    if (!String(cashTakenBy || '').trim()) {
      alert(
        t(
          language,
          'Please fill who took the cash.',
          'Tafadhali jaza aliyechukua cash.'
        )
      );
      return;
    }

    if (!String(cashPurpose || '').trim()) {
      alert(
        t(
          language,
          'Please fill the purpose.',
          'Tafadhali jaza matumizi/purpose.'
        )
      );
      return;
    }

    if (cashLock.current) return;

    cashLock.current = true;
    setCashSaving(true);

    const transaction = {
      id: `home-cash-${Date.now()}`,
      transactionType: 'home_expense_cash_taken',
      transactionDate: cashDate || todayISO(),
      shop_id: 'shop-1',
      shopName: 'Nyumbani Shop',
      expenseKey: 'homeExpenses',
      expenseName: 'Home Expenses',
      sourceFundType: 'home_expenses_fund',
      sourceFundKey: 'homeExpenses',
      sourceFundName: 'Home Expenses Fund',
      amount,
      payee: String(cashTakenBy || '').trim(),
      purpose: String(cashPurpose || '').trim(),
      paymentMethod: 'cash',
      paymentReference: '',
      notes: String(cashNotes || '').trim(),
      status: 'confirmed',
      recordedByUserId:
        currentUser?.id || data?.currentUser?.id || '',
      recordedByName:
        currentUser?.name || data?.currentUser?.name || '',
      recordedByRole:
        currentUser?.role || data?.currentUser?.role || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const nextTransactions = [
        ...(data?.centralFundTransactions || []),
        transaction,
      ];

      await saveData({
        ...data,
        centralFundTransactions: nextTransactions,
      });

      addToSyncQueue(
        'central_fund_transaction_created',
        transaction
      );

      if (navigator.onLine) {
        const { error } = await supabase
          .from('centralFundTransactions')
          .upsert(
            [
              {
                id: transaction.id,
                transaction_type: transaction.transactionType,
                transaction_date: transaction.transactionDate,
                shop_id: transaction.shop_id,
                shop_name: transaction.shopName,
                expense_key: transaction.expenseKey,
                expense_name: transaction.expenseName,
                source_fund_type: transaction.sourceFundType,
                source_fund_key: transaction.sourceFundKey,
                source_fund_name: transaction.sourceFundName,
                amount: transaction.amount,
                payee: transaction.payee,
                purpose: transaction.purpose,
                payment_method: transaction.paymentMethod,
                payment_reference:
                  transaction.paymentReference,
                notes: transaction.notes,
                status: transaction.status,
                recorded_by_user_id:
                  transaction.recordedByUserId,
                recorded_by_name: transaction.recordedByName,
                recorded_by_role: transaction.recordedByRole,
                created_at: transaction.created_at,
                updated_at: transaction.updated_at,
              },
            ],
            { onConflict: 'id' }
          );

        if (error) {
          console.error('Home cash sync failed:', error);
          alert(`Home cash sync failed: ${error.message}`);
        }
      }

      setCashDate(todayISO());
      setCashAmount('');
      setCashTakenBy('');
      setCashPurpose('');
      setCashNotes('');
    } catch (error) {
      console.error('Cash taken save failed:', error);
      alert(error?.message || String(error));
    } finally {
      setCashSaving(false);
      cashLock.current = false;
    }
  };
  const saveCommissionConfirmation = async () => {
    if (!isShopOne) return;

    const typedAmount = parseAmount(commissionAmount);
    const amount =
      String(commissionAmount || '').trim() === ''
        ? Number(suggestedCommissionAmount || 0)
        : typedAmount;

    if (amount <= 0) {
      alert(
        t(
          language,
          'Please enter a commission amount greater than zero.',
          'Tafadhali weka kiasi cha kamisheni kilicho zaidi ya sifuri.'
        )
      );
      return;
    }

    setCommissionSaving(true);

    const nowISO = new Date().toISOString();

    const transaction = {
      id: commissionConfirmationId,
      transactionType: 'home_expense_commission_confirmed',
      transactionDate: todayISO(),
      shop_id: 'shop-1',
      shopName: 'Nyumbani Shop',

      expenseKey: 'homeExpenses',
      expenseName: 'Home Expenses',

      sourceFundType: 'commission',
      sourceFundKey: previousMonthKey,
      sourceFundName: `Commission ${previousMonthKey}`,

      destinationFundType: 'home_expenses_fund',
      destinationFundKey: 'homeExpenses',
      destinationFundName: 'Home Expenses Fund',

      amount,

      payee: 'Home Expenses Fund',
      purpose: `Confirmed commission support for ${currentMonthRange.monthKey}`,
      paymentMethod: 'internal_transfer',
      paymentReference: previousMonthKey,
      notes: `Previous month commission total: TZS ${money(
        previousMonthCommissionTotal
      )}. Suggested amount: TZS ${money(
        suggestedCommissionAmount
      )}. Confirmed amount: TZS ${money(amount)}.`,

      status: 'confirmed',

      recordedByUserId:
        currentUser?.id || data?.currentUser?.id || '',
      recordedByName:
        currentUser?.name || data?.currentUser?.name || '',
      recordedByRole:
        currentUser?.role || data?.currentUser?.role || '',

      created_at:
        confirmedCommissionTransaction?.created_at || nowISO,
      updated_at: nowISO,
    };

    try {
      const existingTransactions =
        data?.centralFundTransactions || [];

      const nextTransactions = [
        transaction,
        ...existingTransactions.filter(
          (existingTransaction) =>
            String(existingTransaction?.id || '') !==
            commissionConfirmationId
        ),
      ];

      await saveData({
        ...data,
        centralFundTransactions: nextTransactions,
      });

      addToSyncQueue(
        'central_fund_transaction_created',
        transaction
      );

      if (navigator.onLine) {
        const { error } = await supabase
          .from('centralFundTransactions')
          .upsert(
            [
              {
                id: transaction.id,
                transaction_type: transaction.transactionType,
                transaction_date: transaction.transactionDate,
                shop_id: transaction.shop_id,
                shop_name: transaction.shopName,
                expense_key: transaction.expenseKey,
                expense_name: transaction.expenseName,
                source_fund_type: transaction.sourceFundType,
                source_fund_key: transaction.sourceFundKey,
                source_fund_name: transaction.sourceFundName,
                destination_fund_type:
                  transaction.destinationFundType,
                destination_fund_key:
                  transaction.destinationFundKey,
                destination_fund_name:
                  transaction.destinationFundName,
                amount: transaction.amount,
                payee: transaction.payee,
                purpose: transaction.purpose,
                payment_method: transaction.paymentMethod,
                payment_reference:
                  transaction.paymentReference,
                notes: transaction.notes,
                status: transaction.status,
                recorded_by_user_id:
                  transaction.recordedByUserId,
                recorded_by_name: transaction.recordedByName,
                recorded_by_role: transaction.recordedByRole,
                created_at: transaction.created_at,
                updated_at: transaction.updated_at,
              },
            ],
            { onConflict: 'id' }
          );

        if (error) {
          console.error(
            'Home expense commission sync failed:',
            error
          );
          alert(
            `Home expense commission sync failed: ${error.message}`
          );
        }
      }

      setCommissionAmount(formatMoneyInput(amount));
    } catch (error) {
      console.error(
        'Home expense commission confirmation failed:',
        error
      );
      alert(error?.message || String(error));
    } finally {
      setCommissionSaving(false);
    }
  };

  const productConsumptionRows = useMemo(() => {
    const map = new Map();

    homeExpenseItemRows.forEach((row) => {
      const key = row.productId || row.productName;

      if (!map.has(key)) {
        map.set(key, {
          productId: row.productId,
          productName: row.productName,
          quantity: 0,
          total: 0,
          profit: 0,
          unit: row.unit,
        });
      }

      const existing = map.get(key);

      existing.quantity += Number(row.quantity || 0);
      existing.total += Number(row.total || 0);
      existing.profit += Number(row.profit || 0);
    });

    return Array.from(map.values()).sort(
      (a, b) => Number(b.total || 0) - Number(a.total || 0)
    );
  }, [homeExpenseItemRows]);

  const productReportGroups = useMemo(() => {
    const groupMap = new Map();

    homeExpenseItemRows.forEach((row) => {
      const dateKey = String(row.date || '').slice(0, 10) || '-';

      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, {
          date: dateKey,
          rows: [],
          totalAmount: 0,
        });
      }

      const group = groupMap.get(dateKey);

      group.rows.push(row);
      group.totalAmount += Number(row.total || 0);
    });

    return Array.from(groupMap.values()).sort((a, b) =>
      String(a.date || '').localeCompare(String(b.date || ''))
    );
  }, [homeExpenseItemRows]);

  const productReportGrandTotal = useMemo(
    () =>
      productReportGroups.reduce(
        (sum, group) => sum + Number(group.totalAmount || 0),
        0
      ),
    [productReportGroups]
  );

  const cashReportGroups = useMemo(() => {
    const groupMap = new Map();

    reportCashTransactions.forEach((row) => {
      const dateKey = String(row.date || '').slice(0, 10) || '-';

      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, {
          date: dateKey,
          rows: [],
          totalAmount: 0,
        });
      }

      const group = groupMap.get(dateKey);

      group.rows.push(row);
      group.totalAmount += Number(row.amount || 0);
    });

    return Array.from(groupMap.values()).sort((a, b) =>
      String(a.date || '').localeCompare(String(b.date || ''))
    );
  }, [reportCashTransactions]);

  const cashReportGrandTotal = useMemo(
    () =>
      cashReportGroups.reduce(
        (sum, group) => sum + Number(group.totalAmount || 0),
        0
      ),
    [cashReportGroups]
  );

  const stockUsedReportGroups = useMemo(() => {
    const groupMap = new Map();

    homeExpenseItemRows.forEach((row) => {
      const dateKey = String(row.date || '').slice(0, 10) || '-';

      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, {
          date: dateKey,
          productMap: new Map(),
          totalAmount: 0,
        });
      }

      const group = groupMap.get(dateKey);
      const productKey = row.productId || row.productName || 'unknown';

      if (!group.productMap.has(productKey)) {
        group.productMap.set(productKey, {
          productId: row.productId,
          productName: row.productName,
          quantity: 0,
          unit: row.unit,
          total: 0,
          entriesCount: 0,
        });
      }

      const productRow = group.productMap.get(productKey);

      productRow.quantity += Number(row.quantity || 0);
      productRow.total += Number(row.total || 0);
      productRow.entriesCount += 1;

      group.totalAmount += Number(row.total || 0);
    });

    return Array.from(groupMap.values())
      .map((group) => ({
        date: group.date,
        totalAmount: group.totalAmount,
        rows: Array.from(group.productMap.values()).sort(
          (a, b) =>
            Number(b.total || 0) - Number(a.total || 0) ||
            Number(b.quantity || 0) - Number(a.quantity || 0)
        ),
      }))
      .sort((a, b) =>
        String(a.date || '').localeCompare(String(b.date || ''))
      );
  }, [homeExpenseItemRows]);

  const stockUsedReportGrandTotal = useMemo(
    () =>
      stockUsedReportGroups.reduce(
        (sum, group) => sum + Number(group.totalAmount || 0),
        0
      ),
    [stockUsedReportGroups]
  );

  const ledgerRows = useMemo(() => {
    const fundingRows = [
      {
        id: 'fund-shop',
        date: currentMonthRange.endKey,
        description: t(
          language,
          'Shop contributions to Home Expenses',
          'Michango ya maduka kwenye Matumizi ya Nyumbani'
        ),
        inAmount: fundingSummary.shopContributions,
        outAmount: 0,
      },
      {
        id: 'fund-gas',
        date: currentMonthRange.endKey,
        description: t(
          language,
          'Gas contribution to Home Expenses',
          'Mchango wa gesi kwenye Matumizi ya Nyumbani'
        ),
        inAmount: fundingSummary.gasContributions,
        outAmount: 0,
      },
      {
        id: 'fund-commission',
        date: currentMonthRange.endKey,
        description: t(
          language,
          'Confirmed commission support',
          'Kamisheni iliyothibitishwa kwa matumizi ya nyumbani'
        ),
        inAmount: fundingSummary.commissionContributions,
        outAmount: 0,
      },
      {
        id: 'fund-other',
        date: currentMonthRange.endKey,
        description: t(
          language,
          'Other confirmed funding',
          'Michango mingine iliyothibitishwa'
        ),
        inAmount: fundingSummary.otherConfirmedFunding,
        outAmount: 0,
      },
    ].filter((row) => Number(row.inAmount || 0) > 0);

    const itemRows = currentMonthHomeExpenseItems.map((row) => ({
      id: row.id,
      date: row.date,
      description: `${row.productName} x ${formatQty(
        row.quantity
      )} — ${row.takenBy} — ${row.purpose}`,
      inAmount: 0,
      outAmount: row.total,
    }));

    const cashRows = currentMonthCashTransactions.map((row) => ({
      id: row.id,
      date: row.date,
      description: `${t(
        language,
        'Cash taken',
        'Cash iliyochukuliwa'
      )} — ${row.takenBy} — ${row.purpose}`,
      inAmount: 0,
      outAmount: row.amount,
    }));

    let runningBalance = 0;

    return [...fundingRows, ...itemRows, ...cashRows]
      .sort((a, b) =>
        String(a.date || '').localeCompare(String(b.date || ''))
      )
      .map((row) => {
        runningBalance +=
          Number(row.inAmount || 0) -
          Number(row.outAmount || 0);

        return {
          ...row,
          balance: runningBalance,
        };
      });
  }, [
    currentMonthRange,
    fundingSummary,
    currentMonthHomeExpenseItems,
    currentMonthCashTransactions,
    language,
  ]);
  const collectionBudgetBalance =
    Number(fundingSummary.monthlyBudget || 0) -
    Number(fundingSummary.fundedSoFar || 0);

  const spendingBudgetBalance =
    Number(fundingSummary.monthlyBudget || 0) -
    Number(fundingSummary.totalSpent || 0);
  if (!isShopOne) {
    return null;
  }

  return (
    <div className="mt-6 space-y-5 rounded-[30px] border border-emerald-200 bg-white p-5 shadow-sm">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          {t(language, 'Home Expenses', 'Matumizi ya Nyumbani')}
        </div>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          {t(
            language,
            'Home Expenses Management',
            'Mfumo wa Matumizi ya Nyumbani'
          )}
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          {t(
            language,
            'This area records home-use product sales, cash taken for home needs, live fund position, and reports.',
            'Sehemu hii inarekodi mauzo ya bidhaa za matumizi ya nyumbani, cash inayochukuliwa kwa matumizi ya nyumbani, salio la mfuko kwa wakati halisi, na ripoti.'
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {[
          {
            key: 'sale',
            label: t(
              language,
              'Home Sales',
              'Mauzo ya Matumizi'
            ),
          },
          {
            key: 'fund',
            label: t(language, 'Fund Position', 'Hali ya Mfuko'),
          },
          {
            key: 'reports',
            label: t(language, 'Reports', 'Ripoti'),
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              activeTab === tab.key
                ? 'bg-emerald-700 text-white'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sale' ? (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-black text-slate-950">
              {t(
                language,
                'Sell Products to Home Expenses',
                'Uza Bidhaa kwa Matumizi ya Nyumbani'
              )}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-600">
                {t(language, 'Search product', 'Tafuta bidhaa')}
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={productSearch}
                onChange={(e) => {
                  const searchValue = e.target.value;
                  setProductSearch(searchValue);

                  const suggestedPurpose =
                    getHomeExpenseBudgetCategoryFromProduct(searchValue);

                  if (suggestedPurpose && !purposeManuallyEdited) {
                    setPurpose(suggestedPurpose);
                  }
                }}
                placeholder={t(
                  language,
                  'Type product name from Shop 1',
                  'Andika jina la bidhaa kutoka Shop 1'
                )}
              />
            </div>


            {filteredProducts.length ? (
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const measurementOptions =
                    product.baseUnit === 'pc'
                      ? []
                      : [0.06, 0.12, 0.25, 0.5, 0.75, 1, 2, 3];

                  return (
                    <div
                      key={product.id}
                      data-home-product-row="true"
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="font-black text-slate-900">
                        {product.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {t(language, 'Stock', 'Stock')}:{' '}
                        {formatQty(product.stockBaseQty)}{' '}
                        {product.baseUnit} • TZS{' '}
                        {money(product.sellPrice)}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          data-home-qty-input="true"
                          type="number"
                          min={product.baseUnit === 'pc' ? '1' : '0.01'}
                          step={product.baseUnit === 'pc' ? '1' : '0.01'}
                          defaultValue={product.baseUnit === 'pc' ? '' : '1'}
                          placeholder={product.baseUnit === 'pc' ? '1' : ''}
                          className="h-9 w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-center text-sm font-bold"
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') return;

                            const rawQty =
                              e.currentTarget.value?.trim() || '';
                            const qty =
                              rawQty === '' ? 1 : Number(rawQty);

                            addProductToCartAndClearSearch(
                              product,
                              qty,
                              true
                            );

                            e.currentTarget.value =
                              product.baseUnit === 'pc' ? '' : '1';
                          }}
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            if (
                              String(product.baseUnit || '').toLowerCase() !==
                              'pc'
                            ) {
                              setProductSearch('');
                              return;
                            }

                            const row = e.currentTarget.closest(
                              '[data-home-product-row]'
                            );

                            const qtyInput = row?.querySelector(
                              '[data-home-qty-input]'
                            );

                            const rawQty =
                              qtyInput?.value?.trim() || '';

                            const qty =
                              rawQty === '' ? 1 : Number(rawQty);

                            addProductToCartAndClearSearch(
                              product,
                              qty,
                              true
                            );

                            if (qtyInput) {
                              qtyInput.value = '';
                            }
                          }}
                          disabled={
                            Number(product.stockBaseQty || 0) <
                            (product.baseUnit === 'pc' ? 1 : 0.01)
                          }
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                        >
                          {t(language, 'Add', 'Ongeza')}
                        </button>
                      </div>

                      {measurementOptions.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {measurementOptions.map((qty) => (
                            <button
                              key={qty}
                              type="button"
                              onClick={() =>
                                addProductToCartAndClearSearch(
                                  product,
                                  qty
                                )
                              }
                              disabled={
                                Number(product.stockBaseQty || 0) < qty
                              }
                              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-black text-white disabled:opacity-40"
                            >
                              +{formatQty(qty)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-600">
                  {t(language, 'Date', 'Tarehe')}
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  {t(language, 'Taken by', 'Amechukua nani')}
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={takenBy}
                  onChange={(e) => setTakenBy(e.target.value)}
                  placeholder={t(
                    language,
                    'Optional, defaults to Home',
                    'Si lazima, itahifadhi Nyumbani'
                  )}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  {t(language, 'Purpose', 'Matumizi')}
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value);
                    setPurposeManuallyEdited(
                      Boolean(String(e.target.value || '').trim())
                    );
                  }}
                  placeholder={t(
                    language,
                    'It will fill itself from the selected product',
                    'Itajijaza yenyewe kutokana na bidhaa utakayochagua'
                  )}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">
                  {t(language, 'Notes', 'Maelezo')}
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t(
                    language,
                    'Optional',
                    'Si lazima'
                  )}
                />
              </div>
            </div>

            {saleError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {saleError}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-black text-slate-950">
              {t(language, 'Cart', 'Kikapu')}
            </h3>

            {cart.length ? (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          TZS {money(item.price)} / {item.unit}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeCartItem(item.productId)
                        }
                        className="text-xs font-black text-red-600"
                      >
                        {t(language, 'Remove', 'Ondoa')}
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartQuantity(
                            item.productId,
                            e.target.value
                          )
                        }
                      />

                      <div className="rounded-lg bg-white px-3 py-2 text-right text-sm font-black">
                        TZS {money(item.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                {t(
                  language,
                  'No product selected yet.',
                  'Bado hakuna bidhaa iliyochaguliwa.'
                )}
              </div>
            )}

            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-xs font-black uppercase text-emerald-700">
                {t(language, 'Total', 'Jumla')}
              </div>
              <div className="mt-1 text-2xl font-black text-emerald-800">
                TZS {money(cartTotal)}
              </div>
            </div>

            <button
              type="button"
              disabled={saleSaving || !cart.length}
              onClick={commitHomeExpenseSale}
              className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              {saleSaving
                ? t(language, 'Saving...', 'Inahifadhi...')
                : t(
                    language,
                    'Complete Home Expense Sale',
                    'Kamilisha Mauzo ya Matumizi ya Nyumbani'
                  )}
            </button>
          </div>

          <div className="xl:col-span-2 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="text-lg font-black text-orange-900">
              {t(
                language,
                'Record Cash Taken',
                'Rekodi Cash Iliyochukuliwa'
              )}
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-5">
              <input
                type="date"
                className="rounded-xl border border-orange-200 px-3 py-2 text-sm"
                value={cashDate}
                onChange={(e) => setCashDate(e.target.value)}
              />

              <input
                className="rounded-xl border border-orange-200 px-3 py-2 text-sm"
                value={cashAmount}
                onChange={(e) =>
                  setCashAmount(formatMoneyInput(e.target.value))
                }
                placeholder="Amount"
              />

              <input
                className="rounded-xl border border-orange-200 px-3 py-2 text-sm"
                value={cashTakenBy}
                onChange={(e) => setCashTakenBy(e.target.value)}
                placeholder={t(language, 'Who took the cash?', 'Amechukua nani?')}
              />

              <input
                className="rounded-xl border border-orange-200 px-3 py-2 text-sm"
                value={cashPurpose}
                onChange={(e) => setCashPurpose(e.target.value)}
                placeholder={t(language, 'Purpose', 'Matumizi')}
              />

              <input
                className="rounded-xl border border-orange-200 px-3 py-2 text-sm"
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
                placeholder={t(language, 'Notes', 'Maelezo')}
              />
            </div>

            <button
              type="button"
              disabled={cashSaving}
              onClick={saveCashTaken}
              className="mt-3 rounded-xl bg-orange-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
            >
              {cashSaving
                ? t(language, 'Saving...', 'Inahifadhi...')
                : t(language, 'Save Cash Taken', 'Hifadhi Cash')}
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === 'fund' ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  {t(
                    language,
                    'Home Expenses Fund Position',
                    'Hali ya Mfuko wa Matumizi ya Nyumbani'
                  )}
                </div>

                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {t(
                    language,
                    'Simple Fund Movement Summary',
                    'Muhtasari Rahisi wa Mwenendo wa Mfuko'
                  )}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {t(
                    language,
                    'This shows money received, money used, and the remaining balance.',
                    'Hii inaonyesha fedha zilizoingia, fedha zilizotumika, na salio lililobaki.'
                  )}
                </p>
              </div>

              <div className="w-full max-w-5xl rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-sm shadow-sm lg:min-w-[760px] xl:min-w-[900px]">
                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="rounded-3xl border-2 border-blue-300 bg-white p-4 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-wide text-blue-700">
                      {t(
  language,
  "Today's Summary",
  'Muhtasari wa Leo'
)}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
  language,
  'Money received today',
  'Fedha zilizoingia Leo'
)}
                        </span>
                        <strong className="text-emerald-700">
                          TZS {money(homeExpensesDailyClosingSummary.collectedToday)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
                            language,
                            'Used today',
                            'Iliyotumika Leo'
                          )}
                        </span>
                        <strong className="text-orange-700">
                          TZS {money(homeExpensesDailyClosingSummary.usedToday)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
                            language,
                            'Debt reduced today',
                            'Deni lililopunguzwa Leo'
                          )}
                        </span>
                        <strong className="text-emerald-700">
                          TZS {money(homeExpensesDailyClosingSummary.debtReducedToday)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
                            language,
                            'Remaining old debt',
                            'Salio la Deni la Nyuma'
                          )}
                        </span>
                        <strong
                          className={
                            homeExpensesDailyClosingSummary.remainingOldDebt > 0
                              ? 'text-red-700'
                              : 'text-emerald-700'
                          }
                        >
                          TZS {money(homeExpensesDailyClosingSummary.remainingOldDebt)}
                        </strong>
                      </div>

                      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                        <div className="text-xs font-black uppercase tracking-wide text-blue-700">
                          {t(
                            language,
                            'Amount to hand over today',
                            'Kiasi cha Kukabidhi Leo'
                          )}
                        </div>

                        <div className="mt-1 text-2xl font-black text-blue-900">
                          TZS {money(homeExpensesDailyClosingSummary.amountToHandOverToday)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
                            language,
                            'Fund saving today',
                            'Akiba ya Mfuko Leo'
                          )}
                        </span>
                        <strong className="text-emerald-800">
                          TZS {money(homeExpensesDailyClosingSummary.fundSavingToday)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border-2 border-emerald-300 bg-white p-4 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      {t(
  language,
  'Collections This Month',
  'Makusanyo ya Mwezi Huu'
)}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
  language,
  'Monthly budget',
  'Bajeti ya mwezi'
)}
                        </span>
                        <strong className="text-slate-950">
                          TZS {money(fundingSummary.monthlyBudget)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
  language,
  'Total collected this month',
  'Jumla iliyokusanywa mwezi huu'
)}
                        </span>
                        <strong className="text-emerald-700">
                          TZS {money(fundingSummary.fundedSoFar)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-emerald-200 pt-3">
                        <span className="font-black text-slate-800">
                          {t(
  language,
  'Remaining to collect this month',
  'Bado kukusanywa mwezi huu'
)}
                        </span>
                        <strong
                          className={
                            collectionBudgetBalance < 0
                              ? 'text-red-700'
                              : 'text-emerald-800'
                          }
                        >
                          TZS {money(collectionBudgetBalance)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border-2 border-orange-300 bg-white p-4 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-wide text-orange-700">
                      {t(
  language,
  'Expenses This Month',
  'Matumizi ya Mwezi Huu'
)}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-500">
                          {t(
  language,
  'Total spent this month',
  'Jumla iliyotumika mwezi huu'
)}
                        </span>
                        <strong className="text-orange-700">
                          TZS {money(fundingSummary.totalSpent)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-orange-200 pt-3">
                        <span className="font-black text-slate-800">
                          {t(
  language,
  'Remaining to spend this month',
  'Bado kutumia mwezi huu'
)}
                        </span>
                        <strong
                          className={
                            spendingBudgetBalance < 0
                              ? 'text-red-700'
                              : 'text-orange-800'
                          }
                        >
                          TZS {money(spendingBudgetBalance)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <h4 className="text-sm font-black uppercase tracking-wide text-blue-800">
                  {t(
  language,
  'Money Received This Month',
  'Fedha Zilizoingia Mwezi Huu'
)}
                </h4>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>{t(language, 'From shops', 'Kutoka maduka')}</span>
                    <strong>TZS {money(fundingSummary.shopContributions)}</strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>{t(language, 'From gas', 'Kutoka gesi')}</span>
                    <strong>TZS {money(fundingSummary.gasContributions)}</strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {t(
                        language,
                        'Confirmed commission',
                        'Kamisheni iliyothibitishwa'
                      )}
                    </span>
                    <strong>TZS {money(fundingSummary.commissionContributions)}</strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>{t(language, 'Other funding', 'Michango mingine')}</span>
                    <strong>TZS {money(fundingSummary.otherConfirmedFunding)}</strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-3 text-base font-black text-blue-900">
                    <span>{t(language, 'Total in', 'Jumla iliyoingia')}</span>
                    <span>TZS {money(fundingSummary.fundedSoFar)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <h4 className="text-sm font-black uppercase tracking-wide text-orange-800">
                  {t(
  language,
  'Expenses This Month',
  'Matumizi ya Mwezi Huu'
)}
                </h4>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {t(
                        language,
                        'Products taken',
                        'Bidhaa zilizochukuliwa'
                      )}
                    </span>
                    <strong>TZS {money(fundingSummary.itemsTaken)}</strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>{t(language, 'Cash taken', 'Cash iliyochukuliwa')}</span>
                    <strong>TZS {money(fundingSummary.cashTaken)}</strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-orange-200 pt-3 text-base font-black text-orange-900">
                    <span>{t(language, 'Total spent', 'Jumla iliyotumika')}</span>
                    <span>TZS {money(fundingSummary.totalSpent)}</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${
                fundingSummary.balanceRemaining < 0
                  ? 'border-red-100 bg-red-50'
                  : 'border-emerald-100 bg-emerald-50'
              }`}>
                <h4 className={`text-sm font-black uppercase tracking-wide ${
                  fundingSummary.balanceRemaining < 0
                    ? 'text-red-800'
                    : 'text-emerald-800'
                }`}>
                  {t(
  language,
  'Balance This Month',
  'Salio la Mwezi Huu'
)}
                </h4>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>{t(language, 'Available cash', 'Fedha iliyopo')}</span>
                    <strong>
                      TZS {money(Math.max(0, fundingSummary.balanceRemaining))}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {t(
                        language,
                        'Amount owed',
                        'Kiasi kinachodaiwa'
                      )}
                    </span>
                    <strong className={
                      fundingSummary.amountOwed > 0
                        ? 'text-red-800'
                        : 'text-emerald-800'
                    }>
                      TZS {money(fundingSummary.amountOwed)}
                    </strong>
                  </div>

                  <div className={`mt-3 flex items-center justify-between border-t pt-3 text-base font-black ${
                    fundingSummary.balanceRemaining < 0
                      ? 'border-red-200 text-red-900'
                      : 'border-emerald-200 text-emerald-900'
                  }`}>
                    <span>{t(language, 'Net balance', 'Salio halisi')}</span>
                    <span>TZS {money(fundingSummary.balanceRemaining)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {fundingSummary.balanceRemaining < 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-800">
              {t(
                language,
                'Home Expenses Fund owes',
                'Mfuko wa Matumizi ya Nyumbani unadaiwa'
              )}{' '}
              TZS {money(fundingSummary.amountOwed)}
            </div>
          ) : null}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black uppercase tracking-wide text-emerald-700">
                {t(language, 'Commission support', 'Msaada wa Kamisheni')}
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCommissionSupport((previous) => !previous)
                }
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white"
              >
                {showCommissionSupport
                  ? t(language, 'Close', 'Funga')
                  : t(language, 'Open', 'Fungua')}
              </button>
            </div>

            {showCommissionSupport ? (
              <div className="mt-3 rounded-2xl bg-white p-3">
                <div className="grid gap-3 md:grid-cols-5">
                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {t(language, 'Previous month', 'Mwezi uliopita')}
                    </div>
                    <div className="mt-1 font-black text-slate-950">
                      {previousMonthKey || '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {t(language, 'Commission', 'Kamisheni')}
                    </div>
                    <div className="mt-1 font-black text-slate-950">
                      TZS {money(previousMonthCommissionTotal)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {t(language, 'Deficit', 'Pungufu')}
                    </div>
                    <div className="mt-1 font-black text-orange-700">
                      TZS {money(commissionDeficitBeforeConfirmation)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {t(language, 'Suggested', 'Pendekezo')}
                    </div>
                    <div className="mt-1 font-black text-emerald-700">
                      TZS {money(suggestedCommissionAmount)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {t(language, 'Confirmed', 'Imethibitishwa')}
                    </div>
                    <div className="mt-1 font-black text-emerald-700">
                      TZS {money(confirmedCommissionAmount)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_auto_auto]">
                  <input
                    className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm"
                    value={commissionAmount}
                    onChange={(e) =>
                      setCommissionAmount(formatMoneyInput(e.target.value))
                    }
                    placeholder={`TZS ${money(suggestedCommissionAmount)}`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setCommissionAmount(
                        formatMoneyInput(suggestedCommissionAmount)
                      )
                    }
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white"
                  >
                    {t(language, 'Use suggested', 'Tumia pendekezo')}
                  </button>

                  <button
                    type="button"
                    disabled={commissionSaving}
                    onClick={saveCommissionConfirmation}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
                  >
                    {commissionSaving
                      ? t(language, 'Saving...', 'Inahifadhi...')
                      : t(language, 'Confirm', 'Thibitisha')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-black text-slate-950">
              {t(
                language,
                'Home Expenses Monthly Budget Items',
                'Vipengele vya Bajeti ya Matumizi ya Nyumbani'
              )}
            </h3>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {HOME_EXPENSES_MONTHLY_BUDGET.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-bold">{item.name}</span> — TZS{' '}
                  {money(item.amount)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-black text-slate-950">
              {t(
                language,
                'Full Home Expenses Ledger',
                'Ledger Kamili ya Matumizi ya Nyumbani'
              )}
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-3 py-2">{t(language, 'Date', 'Tarehe')}</th>
                    <th className="px-3 py-2">{t(language, 'Description', 'Maelezo')}</th>
                    <th className="px-3 py-2 text-right">{t(language, 'In', 'Inaingia')}</th>
                    <th className="px-3 py-2 text-right">{t(language, 'Out', 'Inatoka')}</th>
                    <th className="px-3 py-2 text-right">{t(language, 'Balance', 'Salio')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerRows.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="px-3 py-2">{row.date}</td>
                      <td className="px-3 py-2">{row.description}</td>
                      <td className="px-3 py-2 text-right">TZS {money(row.inAmount)}</td>
                      <td className="px-3 py-2 text-right">TZS {money(row.outAmount)}</td>
                      <td className={`px-3 py-2 text-right font-black ${row.balance < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        TZS {money(row.balance)}
                      </td>
                    </tr>
                  ))}

                  {!ledgerRows.length ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-5 text-center text-slate-500">
                        {t(language, 'No ledger movement yet.', 'Bado hakuna miamala kwenye ledger.')}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'reports' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
              {t(language, 'Choose report type', 'Chagua aina ya ripoti')}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {[
                [
                  'products',
                  t(
                    language,
                    'Home-Use Product Activity Report',
                    'Ripoti ya Bidhaa Zilizochukuliwa kwa Matumizi ya Nyumbani'
                  ),
                ],
                [
                  'cash',
                  t(
                    language,
                    'Home Cash Taken Report',
                    'Ripoti ya Pesa Taslimu Iliyotolewa kwa Matumizi ya Nyumbani'
                  ),
                ],
                [
                  'stock',
                  t(
                    language,
                    'Home Stock Consumption Summary',
                    'Muhtasari wa Stock Iliyotumika Nyumbani'
                  ),
                ],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReportView(key)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-black shadow-sm ${
                    reportView === key
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-800 ring-1 ring-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2">
              {[
                [
                  'all',
                  t(
                    language,
                    'All since 01/08/2026',
                    'Zote Tangu 01/08/2026'
                  ),
                ],
                ['today', t(language, 'Today', 'Leo')],
                ['yesterday', t(language, 'Yesterday', 'Jana')],
                ['week', t(language, 'This week', 'Wiki hii')],
                ['lastweek', t(language, 'Last week', 'Wiki iliyopita')],
                ['month', t(language, 'This month', 'Mwezi huu')],
                ['lastmonth', t(language, 'Last month', 'Mwezi uliopita')],
                ['date', t(language, 'Custom', 'Chagua tarehe')],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReportPreset(key)}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${
                    reportPreset === key
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}

              {reportPreset === 'date' ? (
                <>
                  <input
                    type="date"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label={t(language, 'Product items', 'Bidhaa zilizochukuliwa')}
              value={homeExpenseItemRows.reduce((s, r) => s + Number(r.total || 0), 0)}
              tone="orange"
            />
            <SummaryCard
              label={t(language, 'Cash taken', 'Cash iliyochukuliwa')}
              value={reportCashTransactions.reduce((s, r) => s + Number(r.amount || 0), 0)}
              tone="orange"
            />
            <SummaryCard
              label={t(language, 'Total report spending', 'Jumla ya matumizi')}
              value={
                homeExpenseItemRows.reduce((s, r) => s + Number(r.total || 0), 0) +
                reportCashTransactions.reduce((s, r) => s + Number(r.amount || 0), 0)
              }
              tone="red"
            />
            <SummaryCard
              label={t(language, 'Products count', 'Idadi ya bidhaa')}
              value={homeExpenseItemRows.reduce((s, r) => s + Number(r.quantity || 0), 0)}
              valueText={formatQty(homeExpenseItemRows.reduce((s, r) => s + Number(r.quantity || 0), 0))}
              tone="blue"
            />
          </div>

          {reportView === 'products' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-black text-slate-950">
                {t(
                  language,
                  'Home-Use Product Activity Report',
                  'Ripoti ya Bidhaa Zilizochukuliwa kwa Matumizi ya Nyumbani'
                )}
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-3 py-2">{t(language, 'Date', 'Tarehe')}</th>
                    <th className="px-3 py-2">{t(language, 'Product', 'Bidhaa')}</th>
                    <th className="px-3 py-2 text-right">{t(language, 'Qty', 'Kiasi')}</th>
                    <th className="px-3 py-2 text-right">{t(language, 'Amount', 'Thamani')}</th>
                    <th className="px-3 py-2">{t(language, 'Taken by', 'Amechukua')}</th>
                    <th className="px-3 py-2">{t(language, 'Purpose', 'Matumizi')}</th>
                    <th className="px-3 py-2">{t(language, 'Notes', 'Maelezo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {productReportGroups.map((group) => (
                    <React.Fragment key={group.date}>
                      <tr className="bg-slate-900 text-white">
                        <td
                          colSpan="7"
                          className="px-3 py-2 text-xs font-black uppercase tracking-wide"
                        >
                          {t(language, 'Date', 'Tarehe')}: {group.date}
                        </td>
                      </tr>

                      {group.rows.map((row) => (
                        <tr key={row.id} className="border-b">
                          <td className="px-3 py-2">{row.date}</td>
                          <td className="px-3 py-2">{row.productName}</td>
                          <td className="px-3 py-2 text-right">
                            {formatQty(row.quantity)} {row.unit}
                          </td>
                          <td className="px-3 py-2 text-right">
                            TZS {money(row.total)}
                          </td>
                          <td className="px-3 py-2">{row.takenBy}</td>
                          <td className="px-3 py-2">{row.purpose}</td>
                          <td className="px-3 py-2">{row.notes}</td>
                        </tr>
                      ))}

                      <tr className="border-b-2 border-emerald-300 bg-emerald-50">
                        <td
                          colSpan="3"
                          className="px-3 py-3 text-right text-sm font-black text-emerald-950"
                        >
                          {t(language, 'Daily total', 'Jumla ya siku')}{' '}
                          {group.date}
                        </td>

                        <td className="px-3 py-3 text-right text-sm font-black text-emerald-950">
                          TZS {money(group.totalAmount)}
                        </td>

                        <td colSpan="3" />
                      </tr>
                    </React.Fragment>
                  ))}

                  {productReportGroups.length ? (
                    <tr className="bg-emerald-900 text-white">
                      <td
                        colSpan="3"
                        className="px-3 py-4 text-right text-base font-black uppercase tracking-wide"
                      >
                        {t(language, 'Grand total', 'Jumla kuu')}
                      </td>

                      <td className="px-3 py-4 text-right text-base font-black">
                        TZS {money(productReportGrandTotal)}
                      </td>

                      <td colSpan="3" />
                    </tr>
                  ) : null}

                  {!homeExpenseItemRows.length ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-5 text-center text-slate-500">
                        {t(language, 'No product consumption found.', 'Hakuna bidhaa zilizotumika kwenye kipindi hiki.')}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
          ) : null}

          {reportView === 'cash' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-black text-slate-950">
                {t(
                  language,
                  'Home Cash Taken Report',
                  'Ripoti ya Pesa Taslimu Iliyotolewa kwa Matumizi ya Nyumbani'
                )}
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-3 py-2">{t(language, 'Date', 'Tarehe')}</th>
                    <th className="px-3 py-2 text-right">{t(language, 'Amount', 'Kiasi')}</th>
                    <th className="px-3 py-2">{t(language, 'Taken by', 'Amechukua')}</th>
                    <th className="px-3 py-2">{t(language, 'Purpose', 'Matumizi')}</th>
                    <th className="px-3 py-2">{t(language, 'Notes', 'Maelezo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {cashReportGroups.map((group) => (
                    <React.Fragment key={group.date}>
                      <tr className="bg-slate-900 text-white">
                        <td
                          colSpan="5"
                          className="px-3 py-2 text-xs font-black uppercase tracking-wide"
                        >
                          {t(language, 'Date', 'Tarehe')}: {group.date}
                        </td>
                      </tr>

                      {group.rows.map((row) => (
                        <tr key={row.id} className="border-b">
                          <td className="px-3 py-2">{row.date}</td>
                          <td className="px-3 py-2 text-right">
                            TZS {money(row.amount)}
                          </td>
                          <td className="px-3 py-2">{row.takenBy}</td>
                          <td className="px-3 py-2">{row.purpose}</td>
                          <td className="px-3 py-2">{row.notes}</td>
                        </tr>
                      ))}

                      <tr className="border-b-2 border-emerald-300 bg-emerald-50">
                        <td
                          className="px-3 py-3 text-right text-sm font-black text-emerald-950"
                        >
                          {t(language, 'Daily total', 'Jumla ya siku')}{' '}
                          {group.date}
                        </td>

                        <td className="px-3 py-3 text-right text-sm font-black text-emerald-950">
                          TZS {money(group.totalAmount)}
                        </td>

                        <td colSpan="3" />
                      </tr>
                    </React.Fragment>
                  ))}

                  {cashReportGroups.length ? (
                    <tr className="bg-emerald-900 text-white">
                      <td className="px-3 py-4 text-right text-base font-black uppercase tracking-wide">
                        {t(language, 'Grand total', 'Jumla kuu')}
                      </td>

                      <td className="px-3 py-4 text-right text-base font-black">
                        TZS {money(cashReportGrandTotal)}
                      </td>

                      <td colSpan="3" />
                    </tr>
                  ) : null}

                  {!reportCashTransactions.length ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-5 text-center text-slate-500">
                        {t(language, 'No cash taken in this period.', 'Hakuna cash iliyochukuliwa kwenye kipindi hiki.')}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
          ) : null}

          {reportView === 'stock' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-black text-slate-950">
                {t(
                  language,
                  'Home Stock Consumption Summary',
                  'Muhtasari wa Stock Iliyotumika Nyumbani'
                )}
            </h3>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {t(
                language,
                'Products are grouped by date. Inside each date, the highest used products appear first.',
                'Bidhaa zimepangwa kwa tarehe. Ndani ya kila tarehe, bidhaa zilizotumika zaidi zinaonekana juu.'
              )}
            </p>

            <div className="mt-4 space-y-4">
              {stockUsedReportGroups.map((group) => (
                <div
                  key={group.date}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
                    <div className="text-sm font-black uppercase tracking-wide">
                      {t(language, 'Date', 'Tarehe')}: {group.date}
                    </div>

                    <div className="text-sm font-black">
                      {t(language, 'Daily total', 'Jumla ya siku')}:{' '}
                      TZS {money(group.totalAmount)}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {group.rows.map((row, index) => (
                      <div
                        key={`${group.date}-${row.productId || row.productName}`}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-black text-slate-900">
                            {row.productName}
                          </div>

                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800 ring-1 ring-emerald-200">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-1 text-slate-600">
                          <div>
                            {t(language, 'Quantity', 'Kiasi')}:{' '}
                            <strong className="text-slate-950">
                              {formatQty(row.quantity)} {row.unit}
                            </strong>
                          </div>

                          <div>
                            {t(language, 'Value', 'Thamani')}:{' '}
                            <strong className="text-slate-950">
                              TZS {money(row.total)}
                            </strong>
                          </div>

                          <div>
                            {t(language, 'Records', 'Mara')}:{' '}
                            <strong className="text-slate-950">
                              {row.entriesCount}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {stockUsedReportGroups.length ? (
                <div className="rounded-2xl bg-emerald-900 px-4 py-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-base font-black uppercase tracking-wide">
                      {t(language, 'Grand total', 'Jumla kuu')}
                    </div>

                    <div className="text-xl font-black">
                      TZS {money(stockUsedReportGrandTotal)}
                    </div>
                  </div>
                </div>
              ) : null}

              {!stockUsedReportGroups.length ? (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  {t(
                    language,
                    'No stock used in this period.',
                    'Hakuna stock iliyotumika kwenye kipindi hiki.'
                  )}
                </div>
              ) : null}
            </div>
          </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}