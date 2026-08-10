import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getGasDashboardSummary } from '../GasBusinessSection';

const translations = {
  en: {
    previewLabel: 'Final standalone preview',
    mainTitle: 'Business Remittance & Expense Funds',
    mainSub:
  'This section shows daily remittances, expense funds and the amount required to be sent.',
      
    previewAs: 'Preview as',
    ownerRole: 'Owner / Admin',
    shopRole: 'Individual Shop User',
    shop: 'Shop',
    language: 'Language',
    previewMode: 'Preview mode:',
    previewNote: 'nothing is saved and nothing affects the live POS.',
    tabDaily: 'Daily Remittances',
    tabAllocation: 'Daily Expense Allocation',
    tabFunds: 'Monthly Expense Funds',
    tabOutstanding: 'Outstanding Shops',
    tabLocal: 'Local Shop Funds',
    tabSetup: 'Add / Edit Expense',
    tabReports: 'Reports',
    tabAccountability: 'Central Funds & Accountability',
    addExpense: 'Add a flexible expense',
    expenseName: 'Expense name',
    amount: 'Amount',
    frequency: 'Frequency',
    dueDate: 'Due date',
    location: 'Where money stays',
    addPreview: 'Add to preview',
    includedRules: 'Rules included in this preview',
    rule1: 'Rent can use a six-month cycle and due date.',
    rule2: 'Fare and electricity remain at the shop.',
    rule3: 'Urgency changes as the due date approaches.',
    rule4: 'New expenses can be added without editing code later.',
    shopClosing: 'Close Today & Confirm Remittance',
    amountSent: 'Amount actually sent',
    paymentMethod: 'Payment method',
    reference: 'Transaction/reference number',
    shortReason: 'Reason where amount is lower',
    otherReason: 'Explain other reason',
    selectReason: '-- Select reason --',
    reasonLowSales: 'Sales were low',
    reasonRestock: 'Money was used to add essential products',
    reasonMpesa: 'M-Pesa did not have enough float/cash',
    reasonOther: 'Other reason',
    localConfirm:
      'I confirm that fare and electricity money has been separated and retained inside this shop.',
    previewSubmission: 'Confirm Remittance',
    sales: 'Sales',
    productCapital: 'Product capital protected',
    grossProfit: 'Gross profit',
    expectedHome: 'Expected home',
    submitted: 'Submitted',
    outstanding: 'Outstanding',
    replaceProducts: 'Replace products',
    centralExpenses: 'Central expenses',
    localKept: 'Fare & electricity kept',
    netProfit: 'Net profit',
    owner70: 'Owner 70%',
    shop30: 'Shop 30%',
    previousBalance: 'Previous balance',
    status: 'Status',
    complied: 'Complied',
    partial: 'Partial',
    requiresAction: 'Requires action',
    expense: 'Expense',
    target: 'Target',
    fundedBefore: 'Funded before',
    addedToday: 'Added today',
    fundedAfter: 'Funded after',
    remaining: 'Remaining',
    urgency: 'Urgency',
    fullyFunded: 'Fully funded',
    urgent: 'Urgent',
    upcoming: 'Upcoming',
    onTrack: 'On track',
    monthlyTarget: 'Monthly / cycle target',
    requiredToday: 'Required today',
    confirmedLocal: 'Confirmed retained',
    notConfirmed: 'Not confirmed',
    retainedAtShop: 'Retained at shop',
    todaySales: 'Today’s sales',
    moneyReplace: 'Money required to replace products',
    grossBefore: 'Gross profit before expenses',
    centralContribution: 'Central expense contribution',
    localRemain: 'Fare and electricity retained in shop',
    previousShortfall: 'Previous expense shortfall',
    netAfter: 'Net profit after all expenses',
    ownerProfit: 'Owner’s 70% profit',
    shopReserve: 'Shop’s 30% reserve',
    totalSend: 'Total amount to send home',
    report1: 'Daily Remittance Report',
    report2: 'Monthly Expense Funding Report',
    report3: 'Shop Compliance Report',
    report4: 'Expense Payment Report',
    report5: 'Local Fare & Electricity Report',
    report6: 'Profit Allocation Report',
    cash: 'Cash',
    mpesa: 'M-Pesa',
  },
  sw: {
    previewLabel: 'Mfumo wa Makusanyo ya Biashara',
    mainTitle: 'Mfumo wa Makusanyo na Fedha za Matumizi',
    mainSub:
  'Sehemu hii inaonyesha makusanyo ya kila siku, fedha za matumizi na kiasi kinachotakiwa kutumwa.',
    previewAs: 'Tazama kama',
    ownerRole: 'Mmiliki / Msimamizi',
    shopRole: 'Mtumiaji wa Duka Moja',
    shop: 'Duka',
    language: 'Lugha',
    previewMode: 'Taarifa:',
previewNote:
  'Taarifa za makusanyo, matumizi na kiasi cha kutuma zinaonyeshwa hapa.',
tabDaily: 'Makusanyo ya Leo',
    tabAllocation: 'Mgawanyo wa Matumizi ya Leo',
    tabFunds: 'Fedha za Matumizi ya Mwezi',
    tabOutstanding: 'Maduka Yenye Upungufu',
    tabLocal: 'Fedha Zinazobaki Dukani',
    tabSetup: 'Ongeza / Badili Matumizi',
    tabReports: 'Ripoti',
    tabAccountability: 'Fedha Kuu na Uwajibikaji',
    addExpense: 'Ongeza matumizi mapya',
    expenseName: 'Jina la matumizi',
    amount: 'Kiasi',
    frequency: 'Mzunguko wa malipo',
    dueDate: 'Tarehe ya mwisho ya malipo',
    location: 'Fedha ibaki wapi',
    addPreview: 'Ongeza kwenye majaribio',
    includedRules: 'Kanuni zilizowekwa kwenye muonekano huu',
    rule1: 'Kodi inaweza kuwekwa kwa mzunguko wa miezi sita na tarehe ya mwisho.',
    rule2: 'Nauli na umeme vinabaki dukani.',
    rule3: 'Uharaka hubadilika kadiri tarehe ya malipo inavyokaribia.',
    rule4: 'Matumizi mapya yanaweza kuongezwa bila kubadili code baadaye.',
    shopClosing: 'Funga Siku na Thibitisha Fedha Uliyotuma',
    amountSent: 'Kiasi halisi kilichotumwa',
    paymentMethod: 'Njia ya kutuma',
    reference: 'Namba ya muamala / kumbukumbu',
    shortReason: 'Sababu kama kiasi ni kidogo',
    otherReason: 'Eleza sababu nyingine',
    selectReason: '-- Chagua sababu --',
    reasonLowSales: 'Mauzo yalikuwa kidogo',
    reasonRestock: 'Fedha ilitumika kuongeza bidhaa muhimu',
    reasonMpesa: 'M-Pesa haikuwa na floti/cash ya kutosha',
    reasonOther: 'Sababu nyingine',
    localConfirm:
      'Ninathibitisha kuwa fedha ya nauli na umeme imetengwa na kubaki ndani ya duka hili.',
    previewSubmission: 'Thibitisha Fedha Uliyotuma',
    sales: 'Mauzo',
    productCapital: 'Fedha ya bidhaa imelindwa',
    grossProfit: 'Faida kabla ya matumizi',
    expectedHome: 'Fedha inayotarajiwa nyumbani',
    submitted: 'Iliyotumwa',
    outstanding: 'Bado haijatumwa',
    replaceProducts: 'Fedha ya kununua bidhaa zilizouzwa',
    centralExpenses: 'Fedha ya matumizi inayotumwa',
    localKept: 'Nauli na umeme vinavyobaki',
    netProfit: 'Faida baada ya matumizi',
    owner70: 'Asilimia 70 ya mmiliki',
    shop30: 'Asilimia 30 ya duka',
    previousBalance: 'Salio la nyuma',
    status: 'Hali',
    complied: 'Imekamilika',
    partial: 'Imetumwa sehemu',
    requiresAction: 'Inahitaji hatua',
    expense: 'Aina ya matumizi',
    target: 'Kiasi kinachotakiwa',
    fundedBefore: 'Kilichokusanywa kabla',
    addedToday: 'Kilichoongezwa leo',
    fundedAfter: 'Jumla baada ya leo',
    remaining: 'Bado kinahitajika',
    urgency: 'Uharaka',
    fullyFunded: 'Fedha imekamilika',
    urgent: 'Haraka',
    upcoming: 'Inakaribia',
    onTrack: 'Inaendelea vizuri',
    monthlyTarget: 'Kiasi cha mwezi / mzunguko',
    requiredToday: 'Kinachotakiwa leo',
    confirmedLocal: 'Imethibitishwa kubaki',
    notConfirmed: 'Haijathibitishwa',
    retainedAtShop: 'Inabaki dukani',
    todaySales: 'Mauzo ya leo',
    moneyReplace: 'Fedha ya kununua bidhaa zilizouzwa',
    grossBefore: 'Faida kabla ya matumizi',
    centralContribution: 'Fedha ya matumizi inayotumwa kwa mmiliki',
    localRemain: 'Nauli na umeme unaobaki dukani',
    previousShortfall: 'Upungufu wa matumizi uliopita',
    netAfter: 'Faida baada ya matumizi yote',
    ownerProfit: 'Asilimia 70 ya faida ya mmiliki',
    shopReserve: 'Asilimia 30 inayobaki dukani',
    totalSend: 'Jumla ya fedha ya kutuma nyumbani',
    report1: 'Ripoti ya Makusanyo ya Kila Siku',
    report2: 'Ripoti ya Fedha za Matumizi ya Mwezi',
    report3: 'Ripoti ya Utekelezaji wa Maduka',
    report4: 'Ripoti ya Malipo ya Matumizi',
    report5: 'Ripoti ya Nauli na Umeme Dukani',
    report6: 'Ripoti ya Mgawanyo wa Faida',
    cash: 'Cash',
    mpesa: 'M-Pesa',
  },
};

const MASTER_EXPENSE_SETUP = {
  'shop-1': {
    shopName: 'Nyumbani Shop',
    expenses: {
      salary: {
        name: 'Salary',
        amount: 300000,
        frequency: 'monthly',
        location: 'owner',
      },
      rent: {
        name: 'Rent',
        amount: 240000,
        frequency: 'six_months',
        location: 'owner',
      },
      homeExpenses: {
        name: 'Home Expenses',
        amount: 10000,
        frequency: 'daily',
        location: 'owner',
      },
      medical: {
        name: 'Medical',
        amount: 1500,
        frequency: 'daily',
        location: 'owner',
      },
      tra: {
        name: 'TRA',
        amount: 1500,
        frequency: 'daily',
        location: 'owner',
      },
      dataBundle: {
        name: 'Data Bundle',
        amount: 27500,
        frequency: 'monthly',
        location: 'owner',
      },
      electricity: {
        name: 'Electricity',
        amount: 15000,
        frequency: 'monthly',
        location: 'shop',
      },
      fare: {
        name: 'Fare',
        amount: 0,
        frequency: 'daily',
        location: 'shop',
      },
    },
  },

  'shop-2': {
    shopName: 'Mkwajuni Shop',
    expenses: {
      salary: {
        name: 'Salary',
        amount: 600000,
        frequency: 'monthly',
        location: 'owner',
      },
      rent: {
        name: 'Rent',
        amount: 720000,
        frequency: 'six_months',
        location: 'owner',
      },
      homeExpenses: {
        name: 'Home Expenses',
        amount: 10000,
        frequency: 'daily',
        location: 'owner',
      },
      medical: {
        name: 'Medical',
        amount: 1500,
        frequency: 'daily',
        location: 'owner',
      },
      tra: {
        name: 'TRA',
        amount: 1500,
        frequency: 'daily',
        location: 'owner',
      },
      dataBundle: {
        name: 'Data Bundle',
        amount: 27500,
        frequency: 'monthly',
        location: 'owner',
      },
      electricity: {
        name: 'Electricity',
        amount: 15000,
        frequency: 'monthly',
        location: 'shop',
      },
      fare: {
        name: 'Fare',
        amount: 3000,
        frequency: 'daily',
        location: 'shop',
      },
    },
  },

  'shop-3': {
    shopName: 'Kwa Maganga Shop',
    expenses: {
      salary: {
        name: 'Salary',
        amount: 200000,
        frequency: 'monthly',
        location: 'owner',
      },
      rent: {
        name: 'Rent',
        amount: 240000,
        frequency: 'six_months',
        location: 'owner',
      },
      homeExpenses: {
        name: 'Home Expenses',
        amount: 5000,
        frequency: 'daily',
        location: 'owner',
      },
      medical: {
        name: 'Medical',
        amount: 1000,
        frequency: 'daily',
        location: 'owner',
      },
      tra: {
        name: 'TRA',
        amount: 1000,
        frequency: 'daily',
        location: 'owner',
      },
      dataBundle: {
        name: 'Data Bundle',
        amount: 27500,
        frequency: 'monthly',
        location: 'owner',
      },
      electricity: {
        name: 'Electricity',
        amount: 15000,
        frequency: 'monthly',
        location: 'shop',
      },
      fare: {
        name: 'Fare',
        amount: 3000,
        frequency: 'daily',
        location: 'shop',
      },
    },
  },

  'shop-4': {
    shopName: 'Shangwe Shop',
    expenses: {
      salary: {
        name: 'Salary',
        amount: 150000,
        frequency: 'monthly',
        location: 'owner',
      },
      rent: {
        name: 'Rent',
        amount: 210000,
        frequency: 'six_months',
        location: 'owner',
      },
      homeExpenses: {
        name: 'Home Expenses',
        amount: 5000,
        frequency: 'daily',
        location: 'owner',
      },
      medical: {
        name: 'Medical',
        amount: 1000,
        frequency: 'daily',
        location: 'owner',
      },
      tra: {
        name: 'TRA',
        amount: 1000,
        frequency: 'daily',
        location: 'owner',
      },
      dataBundle: {
        name: 'Data Bundle',
        amount: 13750,
        frequency: 'monthly',
        location: 'owner',
      },
      electricity: {
        name: 'Electricity',
        amount: 15000,
        frequency: 'monthly',
        location: 'shop',
      },
      fare: {
        name: 'Fare',
        amount: 3000,
        frequency: 'daily',
        location: 'shop',
      },
    },
  },

  'shop-5': {
    shopName: 'Mungu Mwema Shop',
    expenses: {
      salary: {
        name: 'Salary',
        amount: 200000,
        frequency: 'monthly',
        location: 'owner',
      },
      rent: {
        name: 'Rent',
        amount: 360000,
        frequency: 'six_months',
        location: 'owner',
      },
      homeExpenses: {
        name: 'Home Expenses',
        amount: 10000,
        frequency: 'daily',
        location: 'owner',
      },
      medical: {
        name: 'Medical',
        amount: 1000,
        frequency: 'daily',
        location: 'owner',
      },
      tra: {
        name: 'TRA',
        amount: 1000,
        frequency: 'daily',
        location: 'owner',
      },
      dataBundle: {
        name: 'Data Bundle',
        amount: 13750,
        frequency: 'monthly',
        location: 'owner',
      },
      electricity: {
        name: 'Electricity',
        amount: 15000,
        frequency: 'monthly',
        location: 'shop',
      },
      fare: {
        name: 'Fare',
        amount: 3000,
        frequency: 'daily',
        location: 'shop',
      },
    },
  },
};

export const AUTOMATIC_EXPENSE_PILOT_START_DATE = '2026-07-25';
const AUTOMATIC_EXPENSE_OFFICIAL_START_DATE = '2026-08-01';

const AUTOMATIC_EXPENSE_ACTIVATION_DATE =
  AUTOMATIC_EXPENSE_OFFICIAL_START_DATE;

/*
 * Performance-based Home Expenses funding begins on 8 August 2026.
 * Calculations before this date must continue using the previous rules.
 */
export const HOME_EXPENSES_PERFORMANCE_START_DATE = '2026-08-08';

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
/*
 * Akiba is not a compulsory daily spending requirement.
 * It must not force shops to contribute beyond essential Home Expenses.
 */
const HOME_EXPENSES_SAVINGS_COMPONENT =
  HOME_EXPENSES_MONTHLY_BUDGET.items.find(
    (item) =>
      String(item?.name || '').trim().toLowerCase() ===
      'akiba'
  );

const HOME_EXPENSES_ESSENTIAL_MONTHLY_TARGET = Math.max(
  0,
  Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0) -
    Number(HOME_EXPENSES_SAVINGS_COMPONENT?.amount || 0)
);

export const getDailyEssentialHomeExpensesTarget = (dateKey) => {
  if (
    !dateKey ||
    dateKey < HOME_EXPENSES_PERFORMANCE_START_DATE
  ) {
    return 0;
  }

  const [year, month] = String(dateKey)
    .split('-')
    .map(Number);

  const daysInMonth =
    year && month
      ? new Date(year, month, 0).getDate()
      : 0;

  return daysInMonth > 0
    ? HOME_EXPENSES_ESSENTIAL_MONTHLY_TARGET /
        daysInMonth
    : 0;
};
const roundToCashStep = (value, step = 50) => {
  const amount = Number(value || 0);

  if (!amount || amount <= 0) {
    return 0;
  }

  return Math.ceil(amount / step) * step;
};

const money = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    roundToCashStep(value)
  );

const signedMoney = (value) => {
  const amount = Number(value || 0);
  const sign = amount < 0 ? '-' : '';

  return `${sign}${money(Math.abs(amount))}`;
};

const getExpenseRequiredAmountForDate = (
  expense,
  calculationDateKey
) => {
  if (
    !expense ||
    !calculationDateKey ||
    calculationDateKey < AUTOMATIC_EXPENSE_ACTIVATION_DATE
  ) {
    return 0;
  }

  const [year, month] = calculationDateKey
    .split('-')
    .map(Number);

  const daysInMonth = new Date(
    year,
    month,
    0
  ).getDate();

  const amount = Number(expense.amount || 0);

  if (expense.frequency === 'daily') {
    return amount;
  }

  if (expense.frequency === 'monthly') {
    return amount / daysInMonth;
  }

  if (expense.frequency === 'six_months') {
    return amount / (daysInMonth * 6);
  }

  return 0;
};
  const getShopDailyExpenseRequirement = (
  shopId,
  calculationDateKey
) => {
  if (
    !calculationDateKey ||
    calculationDateKey < AUTOMATIC_EXPENSE_ACTIVATION_DATE
  ) {
    return {
      localRequired: 0,
      centralRequired: 0,
      totalRequired: 0,
    };
  }

  const expenseSetup =
    MASTER_EXPENSE_SETUP[String(shopId)]?.expenses || {};

  const [year, month] = calculationDateKey
    .split('-')
    .map(Number);

  const daysInMonth = new Date(
    year,
    month,
    0
  ).getDate();

  const getRequiredAmount = (expense) => {
    const amount = Number(expense?.amount || 0);

    if (expense?.frequency === 'daily') {
      return amount;
    }

    if (expense?.frequency === 'monthly') {
      return amount / daysInMonth;
    }

    if (expense?.frequency === 'six_months') {
      return amount / (daysInMonth * 6);
    }

    return 0;
  };

  const localRequired = Object.values(expenseSetup)
    .filter((expense) => expense.location === 'shop')
    .reduce(
      (sum, expense) =>
        sum + getRequiredAmount(expense),
      0
    );

  /*
   * Keep identifying the old fixed Home Expenses requirement
   * separately. For now it remains inside centralRequired so this
   * mapping change alone cannot alter any existing POS figure.
   */
  const homeExpensesRequired = Object.entries(expenseSetup)
    .filter(
      ([key, expense]) =>
        key === 'homeExpenses' ||
        String(expense?.name || '')
          .trim()
          .toLowerCase() === 'home expenses'
    )
    .reduce(
      (sum, [, expense]) =>
        sum + getRequiredAmount(expense),
      0
    );

  const centralRequired = Object.values(expenseSetup)
    .filter((expense) => expense.location === 'owner')
    .reduce(
      (sum, expense) =>
        sum + getRequiredAmount(expense),
      0
    );

  const nonHomeCentralRequired = Math.max(
    0,
    centralRequired - homeExpensesRequired
  );

  return {
    localRequired,

    // Existing combined figure retained for historical calculations.
    centralRequired,

    // Separate mapped figures for the new arrangement.
    homeExpensesRequired,
    nonHomeCentralRequired,

    totalRequired:
      localRequired + centralRequired,
  };
};

const getExpenseDateKeys = (startDateKey, endDateKey) => {
  if (!startDateKey || !endDateKey || endDateKey < startDateKey) {
    return [];
  }

  const [startYear, startMonth, startDay] =
    startDateKey.split('-').map(Number);

  const [endYear, endMonth, endDay] =
    endDateKey.split('-').map(Number);

  const currentDate = new Date(
    startYear,
    startMonth - 1,
    startDay
  );

  const finalDate = new Date(
    endYear,
    endMonth - 1,
    endDay
  );

  const dateKeys = [];

  while (currentDate <= finalDate) {
    dateKeys.push(
      `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, '0')}-${String(
        currentDate.getDate()
      ).padStart(2, '0')}`
    );

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateKeys;
};
 const getMonthToDateKeys = (calculationDateKey) => {
  if (!calculationDateKey) {
    return [];
  }

  const [year, month] = calculationDateKey
    .split('-')
    .map(Number);

  const monthStartKey = `${year}-${String(month).padStart(
    2,
    '0'
  )}-01`;

  const effectiveStartKey =
    monthStartKey < AUTOMATIC_EXPENSE_ACTIVATION_DATE
      ? AUTOMATIC_EXPENSE_ACTIVATION_DATE
      : monthStartKey;

  if (calculationDateKey < effectiveStartKey) {
    return [];
  }

  return getExpenseDateKeys(
    effectiveStartKey,
    calculationDateKey
  );
}; 
export const calculateShop = (shop) => {
  const expenseSetup =
    MASTER_EXPENSE_SETUP[String(shop.id)]?.expenses || {};

 const today = shop.calculationDate
  ? new Date(`${shop.calculationDate}T00:00:00`)
  : new Date();

const calculationDateKey = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const automaticExpensesAreActive =
  calculationDateKey >= AUTOMATIC_EXPENSE_ACTIVATION_DATE;

/*
 * This single switch controls the entire new arrangement:
 * non-home expenses, 25% reserve and performance-based Home Expenses.
 */
const performanceHomeExpensesAreActive =
  calculationDateKey >= HOME_EXPENSES_PERFORMANCE_START_DATE;

const daysInMonth = new Date(
  today.getFullYear(),
  today.getMonth() + 1,
  0
).getDate();

const getDailyExpenseAmount = (expense) => {
  const amount = Number(expense?.amount || 0);

  if (!automaticExpensesAreActive) {
    return 0;
  }

  if (expense?.frequency === 'daily') {
    return amount;
  }

  if (expense?.frequency === 'monthly') {
    return amount / daysInMonth;
  }

  if (expense?.frequency === 'six_months') {
    return amount / (daysInMonth * 6);
  }

  if (expense?.frequency === 'one_time') {
    return amount;
  }

  return 0;
};

const fixedExpenseEntries = Object.entries(expenseSetup).map(
  ([key, expense]) => ({
    key,
    name: expense.name,
    location: expense.location,
    requiredToday: getDailyExpenseAmount(expense),
    isManual: false,

    /*
     * This identifies only the old fixed shop contribution
     * to Home Expenses. Other central expenses remain untouched.
     */
    isHomeExpenses:
      key === 'homeExpenses' ||
      String(expense?.name || '').trim().toLowerCase() ===
        'home expenses',
  })
);

const manualExpenseEntries = (
  Array.isArray(shop.manualExpenseFunds)
    ? shop.manualExpenseFunds
    : []
)
  .filter((fund) => {
    const remainingAmount = Math.max(
      0,
      Number(fund?.target || 0) -
        Number(fund?.funded || 0)
    );

    const createdDateKey = String(
      fund?.created_at || fund?.createdAt || ''
    ).slice(0, 10);

    return (
      String(fund?.shop_id || fund?.shopId || '') ===
        String(shop.id || '') &&
      remainingAmount > 0 &&
      (!createdDateKey ||
        createdDateKey <= calculationDateKey)
    );
  })
  .map((fund) => ({
    key: `manual-${fund.id}`,
    fundId: fund.id,
    name: fund.expense || 'Manual Expense',
    location:
      fund.location === 'shop' ? 'shop' : 'owner',
    requiredToday: getDailyExpenseAmount({
      amount: Math.max(
        0,
        Number(fund.target || 0) -
          Number(fund.funded || 0)
      ),
      frequency: 'one_time',
    }),
    due: fund.due || '',
    isManual: true,
  }));

const allExpenseEntries = [
  ...fixedExpenseEntries,
  ...manualExpenseEntries,
];

const localExpenseBreakdown = allExpenseEntries.filter(
  (expense) => expense.location === 'shop'
);

/*
 * Map central expenses into two separate groups.
 * centralExpenseBreakdown remains unchanged for now so this step
 * cannot disturb the current remittance calculation.
 */
const centralExpenseBreakdown = allExpenseEntries.filter(
  (expense) => expense.location === 'owner'
);

const fixedHomeExpenseBreakdown =
  centralExpenseBreakdown.filter(
    (expense) => expense.isHomeExpenses === true
  );

const nonHomeCentralExpenseBreakdown =
  centralExpenseBreakdown.filter(
    (expense) => expense.isHomeExpenses !== true
  );

/*
 * Before 8 August: retain the complete historical central-expense rules.
 * From 8 August: use only genuine non-home central expenses here.
 * The new Home Expenses contribution will be calculated separately.
 */
const applicableCentralExpenseBreakdown =
  performanceHomeExpensesAreActive
    ? nonHomeCentralExpenseBreakdown
    : centralExpenseBreakdown;

  const localRequired = localExpenseBreakdown.reduce(
    (sum, expense) => sum + Number(expense.requiredToday || 0),
    0
  );

  const centralRequired =
    applicableCentralExpenseBreakdown.reduce(
    (sum, expense) => sum + Number(expense.requiredToday || 0),
    0
  );

const gross = Math.max(
  0,
  Number(shop.sales || 0) - Number(shop.replacement || 0)
);

const previousUnpaidLocalExpenses = Math.max(
  0,
  Number(shop.previousUnpaidLocalExpenses || 0)
);

const previousUnpaidCentralExpenses = Math.max(
  0,
  Number(shop.previousUnpaidCentralExpenses || 0)
);

const previousUnpaidExpenses =
  previousUnpaidLocalExpenses +
  previousUnpaidCentralExpenses;

const previousLocalExpensesPaid = Math.min(
  gross,
  previousUnpaidLocalExpenses
);

const grossAfterPreviousLocal = Math.max(
  0,
  gross - previousLocalExpensesPaid
);

const todayLocalExpensesPaid = Math.min(
  grossAfterPreviousLocal,
  localRequired
);

const localFunded =
  previousLocalExpensesPaid +
  todayLocalExpensesPaid;

  let remainingTodayLocalFunding =
  todayLocalExpensesPaid;

const localExpenseFundingBreakdown =
  localExpenseBreakdown.map((expense) => {
    const amountFunded = Math.min(
      Number(expense.requiredToday || 0),
      remainingTodayLocalFunding
    );

    remainingTodayLocalFunding = Math.max(
      0,
      remainingTodayLocalFunding - amountFunded
    );

    return {
      ...expense,
      amountFunded,
      amountOutstanding: Math.max(
        0,
        Number(expense.requiredToday || 0) -
          amountFunded
      ),
    };
  });

const afterLocal = Math.max(
  0,
  grossAfterPreviousLocal - todayLocalExpensesPaid
);

const localExpensesStillOutstanding = Math.max(
  0,
  previousUnpaidLocalExpenses +
    localRequired -
    localFunded
);

const previousCentralExpensesPaid = Math.min(
  afterLocal,
  previousUnpaidCentralExpenses
);

const grossAfterPreviousCentral = Math.max(
  0,
  afterLocal - previousCentralExpensesPaid
);

const todayCentralExpensesPaid = Math.min(
  grossAfterPreviousCentral,
  centralRequired
);

let remainingTodayCentralFunding =
  todayCentralExpensesPaid;

const centralExpenseFundingBreakdown =
  applicableCentralExpenseBreakdown.map((expense) => {
    const amountFunded = Math.min(
      Number(expense.requiredToday || 0),
      remainingTodayCentralFunding
    );

    remainingTodayCentralFunding = Math.max(
      0,
      remainingTodayCentralFunding - amountFunded
    );

    return {
      ...expense,
      amountFunded,
      amountOutstanding: Math.max(
        0,
        Number(expense.requiredToday || 0) -
          amountFunded
      ),
    };
  });
const centralExpense =
  previousCentralExpensesPaid +
  todayCentralExpensesPaid;

const afterCentral = Math.max(
  0,
  grossAfterPreviousCentral -
    todayCentralExpensesPaid
);

const centralExpensesStillOutstanding = Math.max(
  0,
  previousUnpaidCentralExpenses +
    centralRequired -
    centralExpense
);

const netProfit = afterCentral;


/*
 * Historical dates retain the existing 70%/30% arrangement.
 * From 8 August 2026, at least 25% remains protected at the shop
 * and no more than 75% becomes available for remittance.
 */
const ownerSideRate =
  performanceHomeExpensesAreActive ? 0.75 : 0.7;

const exactOwnerProfit =
  netProfit * ownerSideRate;

const ownerProfit =
  Math.floor(exactOwnerProfit / 50) * 50;

const shopReserve = Math.max(
  0,
  netProfit - ownerProfit
);
/*
 * From 8 August, this is the maximum amount available on the
 * owner side before it is divided between Home Expenses and
 * the owner's remaining profit.
 */
const ownerProfitBeforeHomeExpenses = ownerProfit;

const homeExpensesContributionCapacity =
  performanceHomeExpensesAreActive
    ? ownerProfitBeforeHomeExpenses
    : 0;
const todayFixedExpenses =
  localRequired + centralRequired;

const totalExpenseObligation =
  previousUnpaidExpenses + todayFixedExpenses;

const expensesFundedAutomatically =
  localFunded + centralExpense;

const expensesStillOutstanding = Math.max(
  0,
  totalExpenseObligation - expensesFundedAutomatically
);

const amountRequiredToSubmit =
  centralExpense + ownerProfit;
  const cashAmountRequiredToSubmit = roundToCashStep(
  amountRequiredToSubmit
);

const cashRoundingAdjustment = Math.max(
  0,
  cashAmountRequiredToSubmit - amountRequiredToSubmit
);

const expectedHome =
    centralExpense +
    ownerProfit +
    Number(shop.previous || 0);

  const outstanding = Math.max(
    0,
    expectedHome - Number(shop.submitted || 0)
  );

  return {
    ...shop,
    gross,
    localRequired,
    localFunded,
    centralRequired,
   centralExpense,
centralExpenseBreakdown:
  applicableCentralExpenseBreakdown,
centralExpenseFundingBreakdown,
localExpenseBreakdown,
localExpenseFundingBreakdown,
netProfit,
    ownerProfit,
    ownerProfitBeforeHomeExpenses,
    homeExpensesContributionCapacity,
    shopReserve,
previousUnpaidLocalExpenses,
previousUnpaidCentralExpenses,
previousUnpaidExpenses,
previousLocalExpensesPaid,
todayLocalExpensesPaid,
previousCentralExpensesPaid,
todayCentralExpensesPaid,
localExpensesStillOutstanding,
centralExpensesStillOutstanding,
todayFixedExpenses,
totalExpenseObligation,
expensesFundedAutomatically,
expensesStillOutstanding,
amountRequiredToSubmit,
cashAmountRequiredToSubmit,
cashRoundingAdjustment,
expectedHome,
outstanding,
  };
};
export const getLiveRemittanceShopPosition = ({
  data,
  shopId,
  calculationDateKey,
  skipHomeExpensesPool = false,
}) => {
  const safeData = data || {};
  const selectedShopId = String(shopId || '').trim();

  if (!selectedShopId) {
    return calculateShop({
      id: '',
      sales: 0,
      replacement: 0,
      calculationDate: calculationDateKey,
    });
  }

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  const addLocalDays = (date, numberOfDays) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + numberOfDays);
    return copy;
  };

  const todayKey =
    calculationDateKey || formatDateKey(new Date());

  const shops = Array.isArray(safeData.shops)
    ? safeData.shops
    : [];

  const sales = Array.isArray(safeData.sales)
    ? safeData.sales
    : [];

  const products = Array.isArray(safeData.products)
    ? safeData.products
    : [];

  const remittanceRecords = Array.isArray(
    safeData.dailyRemittances
  )
    ? safeData.dailyRemittances
    : [];

  const selectedShop =
    shops.find(
      (shop) =>
        String(shop?.id || '') === selectedShopId
    ) || {
      id: selectedShopId,
      name: selectedShopId,
    };

  const productById = new Map(
    products.map((product) => [
      String(product?.id || ''),
      product,
    ])
  );

  const getSalesPositionForDate = (dateKey) => {
    const dateSales = sales.filter((sale) => {
      const saleShopId = String(
        sale?.shop_id ||
          sale?.shopId ||
          sale?.shopid ||
          ''
      );

      const saleDateKey = String(
        sale?.date || sale?.created_at || ''
      ).slice(0, 10);

      return (
        saleShopId === selectedShopId &&
        saleDateKey === dateKey
      );
    });

    const salesAmount = dateSales.reduce(
      (sum, sale) =>
        sum + Number(sale?.total || 0),
      0
    );

    const replacementAmount = dateSales.reduce(
      (saleTotal, sale) => {
        const items = Array.isArray(sale?.items)
          ? sale.items
          : [];

        return (
          saleTotal +
          items.reduce((itemTotal, item) => {
            const product = productById.get(
              String(item?.productId || '')
            );

            const quantity = Number(
              item?.quantity || 0
            );

            const buyingPrice = Number(
              item?.buyPrice ||
                product?.buyPrice ||
                product?.buyingprice ||
                0
            );

            return (
              itemTotal +
              quantity * buyingPrice
            );
          }, 0)
        );
      },
      0
    );

    return {
      sales: salesAmount,
      replacement: replacementAmount,
      grossProfit: Math.max(
        0,
        salesAmount - replacementAmount
      ),
    };
  };

  const currentDate = new Date(
    `${todayKey}T00:00:00`
  );

  const previousDayKey = formatDateKey(
    addLocalDays(currentDate, -1)
  );

  const previousExpenseReplayStartKey =
    todayKey >= AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
      ? AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
      : AUTOMATIC_EXPENSE_PILOT_START_DATE;

  const previousExpenseDateKeys =
    getExpenseDateKeys(
      previousExpenseReplayStartKey,
      previousDayKey
    );

  const previousUnpaidExpensePosition =
    previousExpenseDateKeys.reduce(
      (position, expenseDateKey) => {
        const dailyRequirement =
          getShopDailyExpenseRequirement(
            selectedShopId,
            expenseDateKey
          );

        const dailyGrossProfit =
          getSalesPositionForDate(
            expenseDateKey
          ).grossProfit;

        const previousLocalPaid = Math.min(
          dailyGrossProfit,
          Number(position.localUnpaid || 0)
        );

        const grossAfterPreviousLocal =
          Math.max(
            0,
            dailyGrossProfit -
              previousLocalPaid
          );

        const todayLocalPaid = Math.min(
          grossAfterPreviousLocal,
          Number(
            dailyRequirement.localRequired || 0
          )
        );

        const localUnpaid = Math.max(
          0,
          Number(position.localUnpaid || 0) +
            Number(
              dailyRequirement.localRequired || 0
            ) -
            previousLocalPaid -
            todayLocalPaid
        );

        const grossAfterLocal = Math.max(
          0,
          grossAfterPreviousLocal -
            todayLocalPaid
        );

        const previousCentralPaid = Math.min(
          grossAfterLocal,
          Number(position.centralUnpaid || 0)
        );

        const grossAfterPreviousCentral =
          Math.max(
            0,
            grossAfterLocal -
              previousCentralPaid
          );

        /*
         * From 8 August 2026, historical Home Expenses obligations
         * must not become shop arrears. They will be handled separately
         * through the Home Expenses fund and manual commission support.
         *
         * All other genuine central expenses continue carrying forward.
         */
        const replayedCentralRequired =
          todayKey >= HOME_EXPENSES_PERFORMANCE_START_DATE
            ? Number(
                dailyRequirement.nonHomeCentralRequired || 0
              )
            : Number(
                dailyRequirement.centralRequired || 0
              );

        const todayCentralPaid = Math.min(
          grossAfterPreviousCentral,
          replayedCentralRequired
        );

        const centralUnpaid = Math.max(
          0,
          Number(position.centralUnpaid || 0) +
            replayedCentralRequired -
            previousCentralPaid -
            todayCentralPaid
        );

        return {
          localUnpaid,
          centralUnpaid,
        };
      },
      {
        localUnpaid: 0,
        centralUnpaid: 0,
      }
    );
  const previousUnpaidLocalExpenses =
    Number(
      previousUnpaidExpensePosition.localUnpaid ||
        0
    );

  const previousUnpaidCentralExpenses =
    Number(
      previousUnpaidExpensePosition.centralUnpaid ||
        0
    );

  const previousUnpaidExpenses =
    previousUnpaidLocalExpenses +
    previousUnpaidCentralExpenses;

  const todaySalesPosition =
    getSalesPositionForDate(todayKey);

  const previousBalance = remittanceRecords
    .filter(
      (record) => {
        const recordDate = String(
          record?.date || ''
        ).slice(0, 10);

        return (
          String(
            record?.shop_id ||
              record?.shopId ||
              ''
          ) === selectedShopId &&
          recordDate >= AUTOMATIC_EXPENSE_ACTIVATION_DATE &&
          recordDate < todayKey
        );
      }
    )
    .sort((a, b) =>
      String(a?.date || '').localeCompare(
        String(b?.date || '')
      )
    )
    .reduce((balance, record) => {
      const expected = Number(
        record?.expectedAmount || 0
      );

      const submitted = Number(
        record?.amountSent || 0
      );

      return Math.max(
        0,
        expected - submitted
      );
    }, 0);

  const todayRemittance =
    remittanceRecords.find(
      (record) =>
        String(
          record?.shop_id ||
            record?.shopId ||
            ''
        ) === selectedShopId &&
        String(record?.date || '') === todayKey
    );

  const basePosition = calculateShop({
  id: selectedShopId,
  name:
    selectedShop?.name || selectedShopId,
  sales: todaySalesPosition.sales,
  replacement:
    todaySalesPosition.replacement,
  calculationDate: todayKey,
  manualExpenseFunds: Array.isArray(
    safeData.remittanceExpenseFunds
  )
    ? safeData.remittanceExpenseFunds
    : [],
  previousUnpaidExpenses,
  previousUnpaidLocalExpenses,
  previousUnpaidCentralExpenses,
  submitted: Number(
    todayRemittance?.amountSent || 0
  ),
  previous: previousBalance,
  localConfirmed: Boolean(
    todayRemittance?.localConfirmed
  ),
});

const todayShopGasEntries = (
  Array.isArray(safeData.gasEntries)
    ? safeData.gasEntries
    : []
).filter((entry) => {
  const entryShopId = String(
    entry?.shop_id ||
      entry?.shopId ||
      ''
  );

  const entryDateKey = String(
    entry?.date ||
      entry?.created_at ||
      ''
  ).slice(0, 10);

  return (
    entryShopId === selectedShopId &&
    entryDateKey === todayKey &&
    entry?.confirmed !== false
  );
});

const todayGasSummary = getGasDashboardSummary(
  todayShopGasEntries
);

const gasProfitToday = Math.max(
  0,
  Number(todayGasSummary?.totalProfit || 0)
);

const gasReserveAmount = gasProfitToday * 0.2;
const gasDistributableAmount = gasProfitToday * 0.8;

const gasUsedForArrears = Math.min(
  gasDistributableAmount,
  Number(basePosition.expensesStillOutstanding || 0)
);

const gasBalanceAfterArrears = Math.max(
  0,
  gasDistributableAmount - gasUsedForArrears
);

const gasOwnerProfit =
  gasBalanceAfterArrears * 0.5;

const gasHomeExpensesContribution =
  gasBalanceAfterArrears * 0.5;

const normalAmountRequiredToSubmit = Number(
  basePosition.amountRequiredToSubmit || 0
);

const amountRequiredToSubmit =
  normalAmountRequiredToSubmit +
  gasDistributableAmount;

const cashAmountRequiredToSubmit =
  roundToCashStep(amountRequiredToSubmit);

const cashRoundingAdjustment = Math.max(
  0,
  cashAmountRequiredToSubmit -
    amountRequiredToSubmit
);

const expensesStillOutstanding = Math.max(
  0,
  Number(basePosition.expensesStillOutstanding || 0) -
    gasUsedForArrears
);

const expectedHome =
  Number(basePosition.expectedHome || 0) +
  gasDistributableAmount;

const outstanding = Math.max(
  0,
  expectedHome -
    Number(basePosition.submitted || 0)
);

/*
 * Calculate one live Home Expenses pool across all shops.
 * Recursive raw-position calls skip this pool to prevent a loop.
 */
let shopHomeExpensesContribution = 0;
let pooledGasHomeExpensesContribution =
  gasHomeExpensesContribution;

let ownerProfitAfterHomeExpenses =
  Number(basePosition.ownerProfit || 0);

let gasOwnerProfitAfterHomeExpenses =
  gasOwnerProfit;

if (
  todayKey >= HOME_EXPENSES_PERFORMANCE_START_DATE &&
  !skipHomeExpensesPool
) {
  const rawShopPositions = shops
    .map((poolShop) => {
      const poolShopId = String(
        poolShop?.id || ''
      ).trim();

      if (!poolShopId) return null;

      return getLiveRemittanceShopPosition({
        data: safeData,
        shopId: poolShopId,
        calculationDateKey: todayKey,
        skipHomeExpensesPool: true,
      });
    })
    .filter(Boolean);

  /*
   * Calculate the cumulative essential target from the beginning
   * of the new arrangement—or from the beginning of the current
   * month for later months.
   *
   * Only confirmed performance-based Home Expenses contributions
   * from previous days reduce this target. Therefore, a strong day
   * can recover a shortage left by a weak day.
   */
  const currentMonthStartKey =
    `${todayKey.slice(0, 7)}-01`;

  const catchUpStartKey =
    currentMonthStartKey <
    HOME_EXPENSES_PERFORMANCE_START_DATE
      ? HOME_EXPENSES_PERFORMANCE_START_DATE
      : currentMonthStartKey;

  const catchUpDateKeys = getExpenseDateKeys(
    catchUpStartKey,
    todayKey
  );

  const cumulativeHomeExpensesTarget =
    catchUpDateKeys.reduce(
      (sum, dateKey) =>
        sum +
        getDailyEssentialHomeExpensesTarget(dateKey),
      0
    );

  const confirmedHomeExpensesBeforeToday =
    remittanceRecords
      .filter((record) => {
        const recordDateKey = String(
          record?.date || ''
        ).slice(0, 10);

        return (
          recordDateKey >= catchUpStartKey &&
          recordDateKey < todayKey
        );
      })
      .reduce((total, record) => {
        const expenseBreakdown = Array.isArray(
          record?.expenseBreakdown
        )
          ? record.expenseBreakdown
          : [];

        const confirmedPerformanceFunding =
          expenseBreakdown
            .filter(
              (expense) =>
                String(expense?.key || '') ===
                  'performanceHomeExpenses'
            )
            .reduce(
              (sum, expense) =>
                sum +
                Math.max(
                  0,
                  Number(expense?.funded || 0)
                ),
              0
            );

        return total + confirmedPerformanceFunding;
      }, 0);

  /*
   * This is today's requirement including any shortage accumulated
   * under the new arrangement. It excludes every debt before
   * 8 August 2026.
   */
  const dailyHomeExpensesTarget = Math.max(
    0,
    cumulativeHomeExpensesTarget -
      confirmedHomeExpensesBeforeToday
  );

  const totalGasCapacity = rawShopPositions.reduce(
    (sum, position) =>
      sum +
      Math.max(
        0,
        Number(
          position?.gasHomeExpensesContribution || 0
        )
      ),
    0
  );

  const totalGasContribution = Math.min(
    dailyHomeExpensesTarget,
    totalGasCapacity
  );

  const gasContributionRate =
    totalGasCapacity > 0
      ? totalGasContribution / totalGasCapacity
      : 0;

  pooledGasHomeExpensesContribution =
    gasHomeExpensesContribution *
    gasContributionRate;

  gasOwnerProfitAfterHomeExpenses =
    gasOwnerProfit +
    Math.max(
      0,
      gasHomeExpensesContribution -
        pooledGasHomeExpensesContribution
    );

  const remainingTargetAfterGas = Math.max(
    0,
    dailyHomeExpensesTarget -
      totalGasContribution
  );

  const totalShopCapacity = rawShopPositions.reduce(
    (sum, position) =>
      sum +
      Math.max(
        0,
        Number(
          position?.homeExpensesContributionCapacity || 0
        )
      ),
    0
  );

  const totalShopContribution = Math.min(
    remainingTargetAfterGas,
    totalShopCapacity
  );

  const shopContributionRate =
    totalShopCapacity > 0
      ? totalShopContribution / totalShopCapacity
      : 0;

  shopHomeExpensesContribution =
    Math.max(
      0,
      Number(
        basePosition.homeExpensesContributionCapacity || 0
      )
    ) * shopContributionRate;

  ownerProfitAfterHomeExpenses = Math.max(
    0,
    Number(basePosition.ownerProfit || 0) -
      shopHomeExpensesContribution
  );
}

return {
  ...basePosition,

  /*
   * Raw recursive positions retain the full owner-side capacity.
   * Normal live positions show owner profit after Home Expenses.
   */
  ownerProfit: skipHomeExpensesPool
    ? Number(basePosition.ownerProfit || 0)
    : ownerProfitAfterHomeExpenses,

  gasProfitToday,
  gasReserveAmount,
  gasDistributableAmount,
  gasUsedForArrears,
  gasBalanceAfterArrears,
  gasOwnerProfit: skipHomeExpensesPool
    ? gasOwnerProfit
    : gasOwnerProfitAfterHomeExpenses,
  gasHomeExpensesContribution,
  shopHomeExpensesContribution,
  pooledGasHomeExpensesContribution,
    totalPooledHomeExpensesContribution:
    shopHomeExpensesContribution +
    pooledGasHomeExpensesContribution,
  ownerProfitAfterHomeExpenses,
  gasOwnerProfitAfterHomeExpenses,
  normalAmountRequiredToSubmit,
  amountRequiredToSubmit,
  cashAmountRequiredToSubmit,
  cashRoundingAdjustment,

  expensesStillOutstanding,
  expectedHome,
  outstanding,
};
};
function Badge({ children, tone = 'blue' }) {
  const classes = {
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes[tone]}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-black text-slate-950">TZS {money(value)}</div>
    </div>
  );
}

export default function DailyRemittanceCentre({
  data,
  saveData,
  currentUser,
  language: appLanguage = 'sw',
  lockedShopId = '',
  reportPreset = 'today',
  reportDate = '',
  reportStartDate = '',
  reportEndDate = '',
}) {
  const resolvedRole =
    String(currentUser?.role || '').toLowerCase() === 'owner'
      ? 'owner'
      : 'shop';

  const resolvedShopId =
    String(
      lockedShopId ||
        currentUser?.shop_id ||
        currentUser?.shopId ||
        ''
    ).trim();

  const language = appLanguage;
  const rolePreview = resolvedRole;
 const [activeTab, setActiveTab] = useState('simple-summary');

const [
  activeAccountabilitySection,
  setActiveAccountabilitySection,
] = useState('summary');

const [
  ledgerShopFilter,
  setLedgerShopFilter,
] = useState('all');

const [
  showOwnerDrawingForm,
  setShowOwnerDrawingForm,
] = useState(false);

const [
  showEmergencyBorrowingForm,
  setShowEmergencyBorrowingForm,
] = useState(false);
const [activeReport, setActiveReport] = useState('daily-remittance');
const homeFundingSnapshotSaveRef = useRef(new Map());
  
  const [selectedShopId, setSelectedShopId] = useState(
    resolvedShopId || 'shop-1'
  );

 
  const [funds, setFunds] = useState(() =>
  Array.isArray(data?.remittanceExpenseFunds)
    ? data.remittanceExpenseFunds
    : []
);

useEffect(() => {
  setFunds(
    Array.isArray(data?.remittanceExpenseFunds)
      ? data.remittanceExpenseFunds
      : []
  );
}, [data?.remittanceExpenseFunds]);
  const [amountSent, setAmountSent] = useState('');
const [paymentMethod, setPaymentMethod] = useState('cash');
const [paymentReference, setPaymentReference] = useState('');
const [ownerDrawingAmount, setOwnerDrawingAmount] =
  useState('');

const [ownerDrawingPurpose, setOwnerDrawingPurpose] =
  useState('');

const [
  ownerDrawingPaymentMethod,
  setOwnerDrawingPaymentMethod,
] = useState('cash');

const [
  ownerDrawingPaymentReference,
  setOwnerDrawingPaymentReference,
] = useState('');

const [ownerDrawingSaving, setOwnerDrawingSaving] =
  useState(false);
  const [
  emergencySourceFundKey,
  setEmergencySourceFundKey,
] = useState('');

const [
  emergencyDestinationFundKey,
  setEmergencyDestinationFundKey,
] = useState('');

const [emergencyBorrowingAmount, setEmergencyBorrowingAmount] =
  useState('');

const [emergencyBorrowingDueDate, setEmergencyBorrowingDueDate] =
  useState('');

const [emergencyBorrowingPurpose, setEmergencyBorrowingPurpose] =
  useState('');

const [
  emergencyBorrowingReference,
  setEmergencyBorrowingReference,
] = useState('');

const [
  emergencyBorrowingSaving,
  setEmergencyBorrowingSaving,
] = useState(false);
const [
  expensePaymentFundKey,
  setExpensePaymentFundKey,
] = useState('');

const [
  expensePaymentAmount,
  setExpensePaymentAmount,
] = useState('');

const [
  expensePaymentDate,
  setExpensePaymentDate,
] = useState(
  new Date().toISOString().slice(0, 10)
);

const [
  expensePaymentPayee,
  setExpensePaymentPayee,
] = useState('');

const [
  expensePaymentBeneficiaryShopId,
  setExpensePaymentBeneficiaryShopId,
] = useState('');

const [
  expensePaymentPurpose,
  setExpensePaymentPurpose,
] = useState('');

const [
  expensePaymentMethod,
  setExpensePaymentMethod,
] = useState('cash');

const [
  expensePaymentReference,
  setExpensePaymentReference,
] = useState('');

const [
  expensePaymentSaving,
  setExpensePaymentSaving,
] = useState(false);
const [shortReason, setShortReason] = useState('');
const [otherReason, setOtherReason] = useState('');
  const [localConfirmed, setLocalConfirmed] = useState(false);
const [localMonthlyDrafts, setLocalMonthlyDrafts] = useState({});
const [remittanceCloudLoaded, setRemittanceCloudLoaded] = useState(false);
const [expenseFundsCloudLoaded, setExpenseFundsCloudLoaded] = useState(false);
const [fundAllocationsCloudLoaded, setFundAllocationsCloudLoaded] =
  useState(false);
 const [shopSettingsCloudLoaded, setShopSettingsCloudLoaded] =
  useState(false);

const [
  previousMonthSales,
  setPreviousMonthSales,
] = useState([]);

const [
  previousMonthSalesCloudLoaded,
  setPreviousMonthSalesCloudLoaded,
] = useState(false);

const [
  homeFundingAllocations,
  setHomeFundingAllocations,
] = useState([]);

const [
  homeFundingAllocationsCloudLoaded,
  setHomeFundingAllocationsCloudLoaded,
] = useState(false);
const remittanceRecords = Array.isArray(data?.dailyRemittances)
  ? data.dailyRemittances
  : [];

  const fundAllocationRecords = Array.isArray(
  data?.remittanceFundAllocations
)
  ? data.remittanceFundAllocations
  : [];

  const centralFundSummary = useMemo(() => {
  const remittances = Array.isArray(data?.dailyRemittances)
    ? data.dailyRemittances
    : [];

  const transactions = Array.isArray(
    data?.centralFundTransactions
  )
    ? data.centralFundTransactions
    : [];

  const formatSummaryDateKey = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  const startOfSummaryDay = (value) => {
    const date =
      value instanceof Date
        ? new Date(value)
        : new Date(value);

    date.setHours(0, 0, 0, 0);
    return date;
  };

  const addSummaryDays = (date, numberOfDays) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + numberOfDays);
    return copy;
  };

  const now = startOfSummaryDay(new Date());

  let summaryPeriodStart = now;
  let summaryPeriodEnd = now;

  if (reportPreset === 'yesterday') {
    summaryPeriodStart = addSummaryDays(now, -1);
    summaryPeriodEnd = addSummaryDays(now, -1);
  } else if (reportPreset === 'week') {
    const dayOfWeek = now.getDay();
    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    summaryPeriodStart = addSummaryDays(
      now,
      -daysFromMonday
    );
  } else if (reportPreset === 'lastweek') {
    const dayOfWeek = now.getDay();
    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const currentWeekStart = addSummaryDays(
      now,
      -daysFromMonday
    );

    summaryPeriodStart = addSummaryDays(
      currentWeekStart,
      -7
    );

    summaryPeriodEnd = addSummaryDays(
      currentWeekStart,
      -1
    );
  } else if (reportPreset === 'month') {
    summaryPeriodStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  } else if (reportPreset === 'lastmonth') {
    summaryPeriodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    summaryPeriodEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );
  } else if (reportPreset === '3months') {
    summaryPeriodStart = addSummaryDays(now, -89);
  } else if (reportPreset === '6months') {
    summaryPeriodStart = addSummaryDays(now, -179);
  } else if (reportPreset === 'year') {
    summaryPeriodStart = new Date(
      now.getFullYear(),
      0,
      1
    );
  } else if (
    reportPreset === 'date' &&
    reportStartDate &&
    reportEndDate
  ) {
    summaryPeriodStart = startOfSummaryDay(
      `${reportStartDate}T00:00:00`
    );

    summaryPeriodEnd = startOfSummaryDay(
      `${reportEndDate}T00:00:00`
    );
  }

  const summaryStartKey =
    formatSummaryDateKey(summaryPeriodStart);

  const summaryEndKey =
    formatSummaryDateKey(summaryPeriodEnd);

  const todayKey = formatSummaryDateKey(now);

  const cumulativeDateKeys =
    getExpenseDateKeys(
      AUTOMATIC_EXPENSE_ACTIVATION_DATE,
      summaryEndKey
    );

  const calculateCentralCollectionForDates = (
    dateKeys
  ) =>
    dateKeys.reduce((periodTotal, dateKey) => {
      const dateTotal = (
        Array.isArray(data?.shops)
          ? data.shops
          : []
      ).reduce((shopTotal, shop) => {
        const shopId = String(
          shop?.id || ''
        ).trim();

        if (!shopId) return shopTotal;

        const livePosition =
          getLiveRemittanceShopPosition({
            data,
            shopId,
            calculationDateKey: dateKey,
          });

        return (
          shopTotal +
          Math.max(
            0,
            Number(
  livePosition
    ?.cashAmountRequiredToSubmit || 0
)
          )
        );
      }, 0);

      return periodTotal + dateTotal;
    }, 0);

  const selectedPeriodDateKeys =
    getExpenseDateKeys(
      summaryStartKey <
        AUTOMATIC_EXPENSE_ACTIVATION_DATE
        ? AUTOMATIC_EXPENSE_ACTIVATION_DATE
        : summaryStartKey,
      summaryEndKey
    );

  const selectedPeriodReceived =
    calculateCentralCollectionForDates(
      selectedPeriodDateKeys
    );

  const cumulativeReceivedThroughPeriodEnd =
    calculateCentralCollectionForDates(
      cumulativeDateKeys
    );

  const confirmedTransactions = transactions.filter(
    (transaction) => {
      const transactionStatus = String(
        transaction?.status || ''
      ).toLowerCase();

      const transactionDate = String(
        transaction?.transactionDate ||
          transaction?.transaction_date ||
          ''
      ).slice(0, 10);

      return (
        transactionStatus === 'confirmed' &&
        transactionDate &&
        transactionDate >=
          AUTOMATIC_EXPENSE_ACTIVATION_DATE &&
        transactionDate <= summaryEndKey
      );
    }
  );
    const selectedPeriodTransactions =
    confirmedTransactions.filter(
      (transaction) => {
        const transactionDate = String(
          transaction?.transactionDate ||
            transaction?.transaction_date ||
            ''
        ).slice(0, 10);

        return (
          transactionDate >= summaryStartKey &&
          transactionDate <= summaryEndKey
        );
      }
    );

  const withdrawalTypes = new Set([
    'expense_payment',
    'owner_drawing',
    'refund',
  ]);

  const cumulativeWithdrawals =
    confirmedTransactions.reduce((sum, transaction) => {
      const transactionType = String(
        transaction?.transactionType ||
          transaction?.transaction_type ||
          ''
      ).toLowerCase();

      const amount = Math.max(
        0,
        Number(transaction?.amount || 0)
      );

      if (withdrawalTypes.has(transactionType)) {
        return sum + amount;
      }

      if (transactionType === 'reversal') {
        return sum - amount;
      }

      return sum;
    }, 0);
      const selectedPeriodWithdrawals =
    selectedPeriodTransactions.reduce(
      (sum, transaction) => {
        const transactionType = String(
          transaction?.transactionType ||
            transaction?.transaction_type ||
            ''
        ).toLowerCase();

        const amount = Math.max(
          0,
          Number(transaction?.amount || 0)
        );

        if (withdrawalTypes.has(transactionType)) {
          return sum + amount;
        }

        if (transactionType === 'reversal') {
          return sum - amount;
        }

        return sum;
      },
      0
    );
  const ownerProfitBreakdownTotals =
  cumulativeDateKeys.reduce(
    (periodTotal, dateKey) => {
      const dateTotals = (
        Array.isArray(data?.shops)
          ? data.shops
          : []
      ).reduce(
        (shopTotal, shop) => {
          const shopId = String(
            shop?.id || ''
          ).trim();

          if (!shopId) return shopTotal;

          const livePosition =
            getLiveRemittanceShopPosition({
              data,
              shopId,
              calculationDateKey: dateKey,
            });

          const grossProfitGenerated = Math.max(
            0,
            Number(livePosition?.gross || 0)
          );

          const expensesFunded = Math.max(
            0,
            Number(
              livePosition?.expensesFundedAutomatically || 0
            )
          );

          const netProfitAfterExpenses = Math.max(
            0,
            Number(livePosition?.netProfit || 0)
          );

          const owner70Profit = Math.max(
            0,
            Number(livePosition?.ownerProfit || 0)
          );

          const gasOwnerProfit = Math.max(
            0,
            Number(livePosition?.gasOwnerProfit || 0)
          );

          const cashRoundingAdjustment = Math.max(
            0,
            Number(
              livePosition?.cashRoundingAdjustment || 0
            )
          );

          return {
            grossProfitGenerated:
              shopTotal.grossProfitGenerated +
              grossProfitGenerated,

            expensesFunded:
              shopTotal.expensesFunded +
              expensesFunded,

            netProfitAfterExpenses:
              shopTotal.netProfitAfterExpenses +
              netProfitAfterExpenses,

            owner70Profit:
              shopTotal.owner70Profit +
              owner70Profit,

            gasOwnerProfit:
              shopTotal.gasOwnerProfit +
              gasOwnerProfit,

            cashRoundingAdjustment:
              shopTotal.cashRoundingAdjustment +
              cashRoundingAdjustment,
          };
        },
        {
          grossProfitGenerated: 0,
          expensesFunded: 0,
          netProfitAfterExpenses: 0,
          owner70Profit: 0,
          gasOwnerProfit: 0,
          cashRoundingAdjustment: 0,
        }
      );

      return {
        grossProfitGenerated:
          periodTotal.grossProfitGenerated +
          dateTotals.grossProfitGenerated,

        expensesFunded:
          periodTotal.expensesFunded +
          dateTotals.expensesFunded,

        netProfitAfterExpenses:
          periodTotal.netProfitAfterExpenses +
          dateTotals.netProfitAfterExpenses,

        owner70Profit:
          periodTotal.owner70Profit +
          dateTotals.owner70Profit,

        gasOwnerProfit:
          periodTotal.gasOwnerProfit +
          dateTotals.gasOwnerProfit,

        cashRoundingAdjustment:
          periodTotal.cashRoundingAdjustment +
          dateTotals.cashRoundingAdjustment,
      };
    },
    {
      grossProfitGenerated: 0,
      expensesFunded: 0,
      netProfitAfterExpenses: 0,
      owner70Profit: 0,
      gasOwnerProfit: 0,
      cashRoundingAdjustment: 0,
    }
  );

const ownerProfitAccumulated =
  Number(ownerProfitBreakdownTotals.owner70Profit || 0) +
  Number(ownerProfitBreakdownTotals.gasOwnerProfit || 0) +
  Number(
    ownerProfitBreakdownTotals.cashRoundingAdjustment || 0
  );

  const ownerDrawingsTaken =
    confirmedTransactions.reduce((sum, transaction) => {
      const transactionType = String(
        transaction?.transactionType ||
          transaction?.transaction_type ||
          ''
      ).toLowerCase();

      if (transactionType !== 'owner_drawing') {
        return sum;
      }

      return (
        sum + Math.max(0, Number(transaction?.amount || 0))
      );
    }, 0);

  const ownerProfitAvailable = Math.max(
    0,
    ownerProfitAccumulated - ownerDrawingsTaken
  );

  const totalEmergencyBorrowed =
    confirmedTransactions.reduce((sum, transaction) => {
      const transactionType = String(
        transaction?.transactionType ||
          transaction?.transaction_type ||
          ''
      ).toLowerCase();

      if (transactionType !== 'emergency_borrowing') {
        return sum;
      }

      return (
        sum +
        Math.max(
          0,
          Number(
            transaction?.borrowedAmount ||
              transaction?.borrowed_amount ||
              transaction?.amount ||
              0
          )
        )
      );
    }, 0);

  const totalEmergencyRepaid =
    confirmedTransactions.reduce((sum, transaction) => {
      const transactionType = String(
        transaction?.transactionType ||
          transaction?.transaction_type ||
          ''
      ).toLowerCase();

      if (transactionType !== 'emergency_repayment') {
        return sum;
      }

      return (
        sum + Math.max(0, Number(transaction?.amount || 0))
      );
    }, 0);

  const centralFundsHeld = Math.max(
    0,
    cumulativeReceivedThroughPeriodEnd -
      cumulativeWithdrawals
  );

  const outstandingEmergencyBorrowing = Math.max(
    0,
    totalEmergencyBorrowed - totalEmergencyRepaid
  );

  return {
    selectedPeriodReceived,

    selectedPeriodWithdrawals: Math.max(
      0,
      selectedPeriodWithdrawals
    ),

    cumulativeReceivedThroughPeriodEnd,
    cumulativeWithdrawals: Math.max(
      0,
      cumulativeWithdrawals
    ),

    centralFundsHeld,

ownerProfitGrossProfitGenerated:
  ownerProfitBreakdownTotals.grossProfitGenerated,

ownerProfitExpensesFunded:
  ownerProfitBreakdownTotals.expensesFunded,

ownerProfitNetProfitAfterExpenses:
  ownerProfitBreakdownTotals.netProfitAfterExpenses,

ownerProfitOwner70:
  ownerProfitBreakdownTotals.owner70Profit,

ownerProfitGasOwnerProfit:
  ownerProfitBreakdownTotals.gasOwnerProfit,

ownerProfitCashRoundingAdjustment:
  ownerProfitBreakdownTotals.cashRoundingAdjustment,

ownerProfitAccumulated,
ownerDrawingsTaken,
ownerProfitAvailable,

outstandingEmergencyBorrowing,
  };
}, [
  data,
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
  data?.dailyRemittances,
  data?.centralFundTransactions,
  reportPreset,
  reportStartDate,
  reportEndDate,
]);
const automaticHistoricalExpenseFunding = useMemo(() => {
  const shops = Array.isArray(data?.shops)
    ? data.shops
    : [];

  const sales = Array.isArray(data?.sales)
    ? data.sales
    : [];

  const products = Array.isArray(data?.products)
    ? data.products
    : [];

  const productById = new Map(
    products.map((product) => [
      String(product?.id || ''),
      product,
    ])
  );

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const finalHistoryDateKey =
    formatDateKey(yesterday);

  if (
    finalHistoryDateKey <
    AUTOMATIC_EXPENSE_ACTIVATION_DATE
  ) {
    return new Map();
  }

  const historyDateKeys = getExpenseDateKeys(
    AUTOMATIC_EXPENSE_ACTIVATION_DATE,
    finalHistoryDateKey
  );

  const fundingByFundKey = new Map();

  const getGrossProfitForDate = (
    shopId,
    dateKey
  ) => {
    const dateSales = sales.filter((sale) => {
      const saleShopId = String(
        sale?.shop_id ||
          sale?.shopId ||
          sale?.shopid ||
          ''
      ).trim();

      const saleDateKey = String(
        sale?.date ||
          sale?.created_at ||
          ''
      ).slice(0, 10);

      return (
        saleShopId === String(shopId) &&
        saleDateKey === dateKey
      );
    });

    const salesAmount = dateSales.reduce(
      (sum, sale) =>
        sum + Number(sale?.total || 0),
      0
    );

    const replacementAmount =
      dateSales.reduce((saleTotal, sale) => {
        const items = Array.isArray(sale?.items)
          ? sale.items
          : [];

        return (
          saleTotal +
          items.reduce((itemTotal, item) => {
            const product = productById.get(
              String(item?.productId || '')
            );

            const quantity = Number(
              item?.quantity || 0
            );

            const buyingPrice = Number(
              item?.buyPrice ||
                product?.buyPrice ||
                product?.buyingprice ||
                0
            );

            return (
              itemTotal +
              quantity * buyingPrice
            );
          }, 0)
        );
      }, 0);

    return Math.max(
      0,
      salesAmount - replacementAmount
    );
  };

  shops.forEach((shop) => {
    const shopId = String(
      shop?.id || ''
    ).trim();

    if (!shopId) return;

    const expenseEntries = Object.entries(
      MASTER_EXPENSE_SETUP[shopId]
        ?.expenses || {}
    );

    const localExpenseEntries =
      expenseEntries.filter(
        ([, expense]) =>
          expense?.location === 'shop'
      );

    const centralExpenseEntries =
      expenseEntries.filter(
        ([, expense]) =>
          expense?.location === 'owner'
      );

    const localArrears = new Map(
      localExpenseEntries.map(
        ([expenseKey]) => [expenseKey, 0]
      )
    );

    const centralArrears = new Map(
      centralExpenseEntries.map(
        ([expenseKey]) => [expenseKey, 0]
      )
    );

    historyDateKeys.forEach((dateKey) => {
      let availableGross =
        getGrossProfitForDate(
          shopId,
          dateKey
        );

      const payArrears = (
        expenseEntriesToPay,
        arrearsMap,
        recordCentralFunding
      ) => {
        expenseEntriesToPay.forEach(
          ([expenseKey]) => {
            if (availableGross <= 0) return;

            const outstandingAmount =
              Math.max(
                0,
                Number(
                  arrearsMap.get(
                    expenseKey
                  ) || 0
                )
              );

            const amountPaid = Math.min(
              availableGross,
              outstandingAmount
            );

            if (amountPaid <= 0) return;

            availableGross -= amountPaid;

            arrearsMap.set(
              expenseKey,
              outstandingAmount -
                amountPaid
            );

            if (recordCentralFunding) {
              const fundKey =
                `${shopId}-${expenseKey}`;

              fundingByFundKey.set(
                fundKey,
                Number(
                  fundingByFundKey.get(
                    fundKey
                  ) || 0
                ) + amountPaid
              );
            }
          }
        );
      };

      const addTodayObligations = (
        expenseEntriesToAdd,
        arrearsMap
      ) => {
        expenseEntriesToAdd.forEach(
          ([expenseKey, expense]) => {
            const requiredToday =
              getExpenseRequiredAmountForDate(
                expense,
                dateKey
              );

            arrearsMap.set(
              expenseKey,
              Number(
                arrearsMap.get(
                  expenseKey
                ) || 0
              ) +
                Math.max(
                  0,
                  Number(
                    requiredToday || 0
                  )
                )
            );
          }
        );
      };

      /*
       * Funding order already agreed:
       * 1. Previous local arrears
       * 2. Today's local obligations
       * 3. Previous central arrears
       * 4. Today's central obligations
       */

      payArrears(
        localExpenseEntries,
        localArrears,
        false
      );

      addTodayObligations(
        localExpenseEntries,
        localArrears
      );

      payArrears(
        localExpenseEntries,
        localArrears,
        false
      );

      payArrears(
        centralExpenseEntries,
        centralArrears,
        true
      );

      addTodayObligations(
        centralExpenseEntries,
        centralArrears
      );

      payArrears(
        centralExpenseEntries,
        centralArrears,
        true
      );
    });
  });

  return fundingByFundKey;
}, [
  data?.shops,
  data?.sales,
  data?.products,
]);
const automaticGasExpenseFunding = useMemo(() => {
  const shops = Array.isArray(data?.shops)
    ? data.shops
    : [];

  const sales = Array.isArray(data?.sales)
    ? data.sales
    : [];

  const products = Array.isArray(data?.products)
    ? data.products
    : [];

  const gasEntries = Array.isArray(data?.gasEntries)
    ? data.gasEntries
    : [];

  const productById = new Map(
    products.map((product) => [
      String(product?.id || ''),
      product,
    ])
  );

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const finalDateKey = formatDateKey(today);

  if (
    finalDateKey <
    AUTOMATIC_EXPENSE_ACTIVATION_DATE
  ) {
    return new Map();
  }

  const replayDateKeys = getExpenseDateKeys(
    AUTOMATIC_EXPENSE_ACTIVATION_DATE,
    finalDateKey
  );

  const gasFundingByFundKey = new Map();

  const getGrossProfitForDate = (
    shopId,
    dateKey
  ) => {
    const dateSales = sales.filter((sale) => {
      const saleShopId = String(
        sale?.shop_id ||
          sale?.shopId ||
          sale?.shopid ||
          ''
      ).trim();

      const saleDateKey = String(
        sale?.date ||
          sale?.created_at ||
          ''
      ).slice(0, 10);

      return (
        saleShopId === String(shopId) &&
        saleDateKey === dateKey
      );
    });

    const salesAmount = dateSales.reduce(
      (sum, sale) =>
        sum + Number(sale?.total || 0),
      0
    );

    const replacementAmount =
      dateSales.reduce((saleTotal, sale) => {
        const items = Array.isArray(sale?.items)
          ? sale.items
          : [];

        return (
          saleTotal +
          items.reduce((itemTotal, item) => {
            const product = productById.get(
              String(item?.productId || '')
            );

            const quantity = Number(
              item?.quantity || 0
            );

            const buyingPrice = Number(
              item?.buyPrice ||
                product?.buyPrice ||
                product?.buyingprice ||
                0
            );

            return (
              itemTotal +
              quantity * buyingPrice
            );
          }, 0)
        );
      }, 0);

    return Math.max(
      0,
      salesAmount - replacementAmount
    );
  };

  const getGasDistributableForDate = (
    shopId,
    dateKey
  ) => {
    const matchingGasEntries = gasEntries.filter(
      (entry) => {
        const entryShopId = String(
          entry?.shop_id ||
            entry?.shopId ||
            ''
        ).trim();

        const entryDateKey = String(
          entry?.date ||
            entry?.created_at ||
            ''
        ).slice(0, 10);

        return (
          entryShopId === String(shopId) &&
          entryDateKey === dateKey &&
          entry?.confirmed !== false
        );
      }
    );

    const gasSummary = getGasDashboardSummary(
      matchingGasEntries
    );

    const gasProfit = Math.max(
      0,
      Number(gasSummary?.totalProfit || 0)
    );

    return gasProfit * 0.8;
  };

  shops.forEach((shop) => {
    const shopId = String(
      shop?.id || ''
    ).trim();

    if (!shopId) return;

    const expenseEntries = Object.entries(
      MASTER_EXPENSE_SETUP[shopId]
        ?.expenses || {}
    );

    const localExpenseEntries =
      expenseEntries.filter(
        ([, expense]) =>
          expense?.location === 'shop'
      );

    const centralExpenseEntries =
      expenseEntries.filter(
        ([, expense]) =>
          expense?.location === 'owner'
      );

    const localArrears = new Map(
      localExpenseEntries.map(
        ([expenseKey]) => [expenseKey, 0]
      )
    );

    const centralArrears = new Map(
      centralExpenseEntries.map(
        ([expenseKey]) => [expenseKey, 0]
      )
    );

    replayDateKeys.forEach((dateKey) => {
      let ordinaryGross =
        getGrossProfitForDate(
          shopId,
          dateKey
        );

      const addObligations = (
        entries,
        arrearsMap
      ) => {
        entries.forEach(
          ([expenseKey, expense]) => {
            const requiredAmount =
              getExpenseRequiredAmountForDate(
                expense,
                dateKey
              );

            arrearsMap.set(
              expenseKey,
              Number(
                arrearsMap.get(expenseKey) ||
                  0
              ) +
                Math.max(
                  0,
                  Number(requiredAmount || 0)
                )
            );
          }
        );
      };

      const payUsingOrdinaryGross = (
        entries,
        arrearsMap
      ) => {
        entries.forEach(([expenseKey]) => {
          if (ordinaryGross <= 0) return;

          const outstandingAmount =
            Math.max(
              0,
              Number(
                arrearsMap.get(expenseKey) ||
                  0
              )
            );

          const amountPaid = Math.min(
            ordinaryGross,
            outstandingAmount
          );

          if (amountPaid <= 0) return;

          ordinaryGross -= amountPaid;

          arrearsMap.set(
            expenseKey,
            outstandingAmount - amountPaid
          );
        });
      };

      /*
       * Ordinary shop sales continue using
       * the existing agreed funding order.
       */

      payUsingOrdinaryGross(
        localExpenseEntries,
        localArrears
      );

      addObligations(
        localExpenseEntries,
        localArrears
      );

      payUsingOrdinaryGross(
        localExpenseEntries,
        localArrears
      );

      payUsingOrdinaryGross(
        centralExpenseEntries,
        centralArrears
      );

      addObligations(
        centralExpenseEntries,
        centralArrears
      );

      payUsingOrdinaryGross(
        centralExpenseEntries,
        centralArrears
      );

      let gasAvailable =
        getGasDistributableForDate(
          shopId,
          dateKey
        );

      /*
       * Gas clears local outstanding expenses
       * before central outstanding expenses,
       * following the same existing rule.
       */

      localExpenseEntries.forEach(
        ([expenseKey]) => {
          if (gasAvailable <= 0) return;

          const outstandingAmount =
            Math.max(
              0,
              Number(
                localArrears.get(
                  expenseKey
                ) || 0
              )
            );

          const amountPaid = Math.min(
            gasAvailable,
            outstandingAmount
          );

          if (amountPaid <= 0) return;

          gasAvailable -= amountPaid;

          localArrears.set(
            expenseKey,
            outstandingAmount - amountPaid
          );
        }
      );

      centralExpenseEntries.forEach(
        ([expenseKey]) => {
          if (gasAvailable <= 0) return;

          const outstandingAmount =
            Math.max(
              0,
              Number(
                centralArrears.get(
                  expenseKey
                ) || 0
              )
            );

          const amountPaid = Math.min(
            gasAvailable,
            outstandingAmount
          );

          if (amountPaid <= 0) return;

          gasAvailable -= amountPaid;

          centralArrears.set(
            expenseKey,
            outstandingAmount - amountPaid
          );

          const fundKey =
            `${shopId}-${expenseKey}`;

          gasFundingByFundKey.set(
            fundKey,
            Number(
              gasFundingByFundKey.get(
                fundKey
              ) || 0
            ) + amountPaid
          );
        }
      );

      /*
       * After all outstanding expenses are
       * cleared, half of the remaining gas
       * amount enters Home Expenses.
       */

      const homeExpensesContribution =
        Math.max(0, gasAvailable) * 0.5;

      const ownerGasProfit =
        Math.max(0, gasAvailable) * 0.5;

      if (ownerGasProfit > 0) {
        gasFundingByFundKey.set(
          'owner-profit',
          Number(
            gasFundingByFundKey.get(
              'owner-profit'
            ) || 0
          ) + ownerGasProfit
        );
      }

      if (homeExpensesContribution > 0) {
        const homeExpensesFundKey =
          `${shopId}-homeExpenses`;

        gasFundingByFundKey.set(
          homeExpensesFundKey,
          Number(
            gasFundingByFundKey.get(
              homeExpensesFundKey
            ) || 0
          ) + homeExpensesContribution
        );
      }
    });
  });

  return gasFundingByFundKey;
}, [
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
]);
const centralFundAccounts = useMemo(() => {
  const expenseFunds = Array.isArray(
    data?.remittanceExpenseFunds
  )
    ? data.remittanceExpenseFunds
    : [];

  const remittances = Array.isArray(
    data?.dailyRemittances
  )
    ? data.dailyRemittances
    : [];

  const transactions = Array.isArray(
    data?.centralFundTransactions
  )
    ? data.centralFundTransactions
    : [];

  const accountsMap = new Map();

  const today = new Date();

  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const liveShopExpenseFunding = new Map();

  (Array.isArray(data?.shops) ? data.shops : []).forEach(
    (shop) => {
      const shopId = String(shop?.id || '').trim();

      if (!shopId) return;

      const livePosition = getLiveRemittanceShopPosition({
        data,
        shopId,
        calculationDateKey: todayKey,
      });

      const fundingBreakdown = Array.isArray(
        livePosition?.centralExpenseFundingBreakdown
      )
        ? livePosition.centralExpenseFundingBreakdown
        : [];

      fundingBreakdown.forEach((expense) => {
        const fundKey = `${shopId}-${expense.key}`;

        liveShopExpenseFunding.set(
          fundKey,
          Math.max(
            0,
            Number(expense?.amountFunded || 0)
          )
        );
      });
    }
  );

  Object.entries(MASTER_EXPENSE_SETUP).forEach(
    ([shopId, shopSetup]) => {
      Object.entries(
        shopSetup?.expenses || {}
      )
        .filter(
          ([, expense]) =>
            expense?.location === 'owner'
        )
        .forEach(([expenseKey, expense]) => {
          const fundKey = `${shopId}-${expenseKey}`;

          const historicalAllocations =
            fundAllocationRecords.filter(
              (allocation) => {
                const allocationFundKey = String(
                  allocation?.fund_id ||
                    allocation?.fundId ||
                    ''
                ).trim();

                const allocationDate = String(
                  allocation?.allocationDate ||
                    allocation?.allocation_date ||
                    ''
                ).slice(0, 10);

                return (
                  allocationFundKey === fundKey &&
                  allocationDate &&
                  allocationDate < todayKey
                );
              }
            );

          const historicalFundingTotal =
            historicalAllocations.reduce(
              (sum, allocation) =>
                sum +
                Math.max(
                  0,
                  Number(allocation?.amount || 0)
                ),
              0
            );

          const liveFundingToday = Math.max(
            0,
            Number(
              liveShopExpenseFunding.get(fundKey) || 0
            )
          );

          const savedFund = expenseFunds.find(
            (fund) =>
              String(fund?.id || '').trim() ===
                fundKey ||
              (
                String(fund?.shop_id || '') ===
                  String(shopId) &&
                String(fund?.expense || '') ===
                  String(expense?.name || '')
              )
          );

          const savedHistoricalBalance = Math.max(
            0,
            Number(savedFund?.funded || 0)
          );

          const automaticallyFundedBeforeToday =
            Math.max(
              0,
              Number(
                automaticHistoricalExpenseFunding.get(
                  fundKey
                ) || 0
              )
            );

          const accumulatedBeforeToday =
            automaticallyFundedBeforeToday > 0
              ? automaticallyFundedBeforeToday
              : historicalAllocations.length > 0
                ? historicalFundingTotal
                : savedHistoricalBalance;

          const automaticGasFunding =
  Math.max(
    0,
    Number(
      automaticGasExpenseFunding.get(
        fundKey
      ) || 0
    )
  );

const accumulatedAmount =
  accumulatedBeforeToday +
  liveFundingToday +
  automaticGasFunding;

          accountsMap.set(fundKey, {
            key: fundKey,
            type: 'expense_fund',
            name:
              expense?.name || 'Expense Fund',
            shopId,
            shopName:
              shopSetup?.shopName || shopId,
            baseAmount: accumulatedAmount,
            moneyOut: 0,
            moneyIn: 0,
          });
        });
    }
  );

  expenseFunds
    .filter(
      (fund) =>
        String(fund?.location || 'owner') ===
          'owner' &&
        !accountsMap.has(
          String(fund?.id || '').trim()
        )
    )
    .forEach((fund) => {
      const fundKey = String(fund?.id || '').trim();

      if (!fundKey) return;

      const matchingAllocations =
        fundAllocationRecords.filter(
          (allocation) =>
            String(
              allocation?.fund_id ||
                allocation?.fundId ||
                ''
            ).trim() === fundKey
        );

      const allocationHistoryTotal =
        matchingAllocations.reduce(
          (sum, allocation) =>
            sum +
            Math.max(
              0,
              Number(allocation?.amount || 0)
            ),
          0
        );

      accountsMap.set(fundKey, {
        key: fundKey,
        type: 'expense_fund',
        name:
          fund?.expense || 'Expense Fund',
        shopId: String(
          fund?.shop_id || ''
        ).trim(),
        shopName: fund?.shop || '',
        baseAmount:
          matchingAllocations.length > 0
            ? allocationHistoryTotal
            : Math.max(
                0,
                Number(fund?.funded || 0)
              ),
        moneyOut: 0,
        moneyIn: 0,
      });
    });

const ownerProfitAccumulated = Math.max(
  0,
  Number(
    centralFundSummary.ownerProfitAccumulated || 0
  )
);

  accountsMap.set('owner-profit', {
    key: 'owner-profit',
    type: 'owner_profit',
    name:
      language === 'sw'
        ? 'Faida ya Mmiliki'
        : 'Owner Profit',
    shopId: '',
    shopName:
      language === 'sw'
        ? 'Mmiliki'
        : 'Owner',
    baseAmount: ownerProfitAccumulated,
    moneyOut: 0,
    moneyIn: 0,
  });

  const ensureAccount = ({
    key,
    type,
    name,
    shopId,
    shopName,
  }) => {
    const cleanKey = String(key || '').trim();

    if (!cleanKey) return null;

    if (!accountsMap.has(cleanKey)) {
      accountsMap.set(cleanKey, {
        key: cleanKey,
        type: type || 'expense_fund',
        name: name || cleanKey,
        shopId: String(shopId || '').trim(),
        shopName: shopName || '',
        baseAmount: 0,
        moneyOut: 0,
        moneyIn: 0,
      });
    }

    return accountsMap.get(cleanKey);
  };

  transactions
    .filter(
      (transaction) =>
        String(transaction?.status || '').toLowerCase() ===
        'confirmed'
    )
    .forEach((transaction) => {
      const transactionType = String(
        transaction?.transactionType ||
          transaction?.transaction_type ||
          ''
      ).toLowerCase();

      const amount = Math.max(
        0,
        Number(transaction?.amount || 0)
      );

      if (!amount) return;

      const sourceFundKey = String(
        transaction?.sourceFundKey ||
          transaction?.source_fund_key ||
          ''
      ).trim();

      const destinationFundKey = String(
        transaction?.destinationFundKey ||
          transaction?.destination_fund_key ||
          ''
      ).trim();

      if (
        [
          'expense_payment',
          'owner_drawing',
          'emergency_borrowing',
          'emergency_repayment',
          'fund_transfer',
          'refund',
        ].includes(transactionType)
      ) {
        const sourceAccount = ensureAccount({
          key:
            sourceFundKey ||
            (transactionType === 'owner_drawing'
              ? 'owner-profit'
              : ''),
          type:
            transaction?.sourceFundType ||
            transaction?.source_fund_type ||
            '',
          name:
            transaction?.sourceFundName ||
            transaction?.source_fund_name ||
            '',
          shopId:
            transaction?.sourceShopId ||
            transaction?.source_shop_id ||
            '',
          shopName:
            transaction?.sourceShopName ||
            transaction?.source_shop_name ||
            '',
        });

        if (sourceAccount) {
          sourceAccount.moneyOut += amount;
        }
      }

      if (
        [
          'emergency_borrowing',
          'emergency_repayment',
          'fund_transfer',
        ].includes(transactionType)
      ) {
        const destinationAccount = ensureAccount({
          key: destinationFundKey,
          type:
            transaction?.destinationFundType ||
            transaction?.destination_fund_type ||
            '',
          name:
            transaction?.destinationFundName ||
            transaction?.destination_fund_name ||
            '',
          shopId:
            transaction?.destinationShopId ||
            transaction?.destination_shop_id ||
            '',
          shopName:
            transaction?.destinationShopName ||
            transaction?.destination_shop_name ||
            '',
        });

        if (destinationAccount) {
          destinationAccount.moneyIn += amount;
        }
      }
    });

  return Array.from(accountsMap.values())
    .map((account) => ({
      ...account,

      availableBalance:
        Number(account.baseAmount || 0) +
        Number(account.moneyIn || 0) -
        Number(account.moneyOut || 0),
    }))
    .sort((a, b) => {
      if (a.type === 'owner_profit') return -1;
      if (b.type === 'owner_profit') return 1;

      return `${a.shopName}-${a.name}`.localeCompare(
        `${b.shopName}-${b.name}`
      );
    });
}, [
  data,
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
  data?.remittanceExpenseFunds,
  data?.remittanceFundAllocations,
  data?.dailyRemittances,
  data?.centralFundTransactions,
  automaticHistoricalExpenseFunding,
automaticGasExpenseFunding,
centralFundSummary.ownerProfitAccumulated,
language,
]);

const emergencyBorrowingRecords = useMemo(() => {
  const transactions = Array.isArray(
    data?.centralFundTransactions
  )
    ? data.centralFundTransactions
    : [];

  const confirmedTransactions = transactions.filter(
    (transaction) =>
      String(transaction?.status || '').toLowerCase() ===
      'confirmed'
  );

  const borrowingTransactions =
    confirmedTransactions.filter(
      (transaction) =>
        String(
          transaction?.transactionType ||
            transaction?.transaction_type ||
            ''
        ).toLowerCase() === 'emergency_borrowing'
    );

  const repaymentTransactions =
    confirmedTransactions.filter(
      (transaction) =>
        String(
          transaction?.transactionType ||
            transaction?.transaction_type ||
            ''
        ).toLowerCase() === 'emergency_repayment'
    );

  const todayKey = new Date().toISOString().slice(0, 10);

  return borrowingTransactions
    .map((borrowing) => {
      const borrowingId = String(borrowing?.id || '');

      const borrowedAmount = Math.max(
        0,
        Number(
          borrowing?.borrowedAmount ||
            borrowing?.borrowed_amount ||
            borrowing?.amount ||
            0
        )
      );

      const repaymentTransactionsTotal =
        repaymentTransactions
          .filter(
            (repayment) =>
              String(
                repayment?.relatedTransactionId ||
                  repayment?.related_transaction_id ||
                  ''
              ) === borrowingId
          )
          .reduce(
            (sum, repayment) =>
              sum +
              Math.max(
                0,
                Number(repayment?.amount || 0)
              ),
            0
          );

      const savedRepaidAmount = Math.max(
        0,
        Number(
          borrowing?.repaidAmount ||
            borrowing?.repaid_amount ||
            0
        )
      );

      const repaidAmount =
        repaymentTransactionsTotal > 0
          ? repaymentTransactionsTotal
          : savedRepaidAmount;

      const remainingAmount = Math.max(
        0,
        borrowedAmount - repaidAmount
      );

      const dueDate = String(
        borrowing?.borrowingDueDate ||
          borrowing?.borrowing_due_date ||
          ''
      ).slice(0, 10);

      let reminderStatus = 'outstanding';
      let daysRemaining = null;

      if (remainingAmount <= 0) {
        reminderStatus = 'fully_repaid';
      } else if (dueDate) {
        const todayDate = new Date(`${todayKey}T00:00:00`);
        const dueDateValue = new Date(
          `${dueDate}T00:00:00`
        );

        daysRemaining = Math.ceil(
          (dueDateValue.getTime() -
            todayDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysRemaining < 0) {
          reminderStatus = 'overdue';
        } else if (daysRemaining === 0) {
          reminderStatus = 'due_today';
        } else if (daysRemaining <= 7) {
          reminderStatus = 'due_soon';
        }
      }

      return {
        id: borrowingId,

        sourceFundName:
          borrowing?.sourceFundName ||
          borrowing?.source_fund_name ||
          '',

        sourceShopName:
          borrowing?.sourceShopName ||
          borrowing?.source_shop_name ||
          '',

        destinationFundName:
          borrowing?.destinationFundName ||
          borrowing?.destination_fund_name ||
          '',

        destinationShopName:
          borrowing?.destinationShopName ||
          borrowing?.destination_shop_name ||
          '',

        borrowedAmount,
        repaidAmount,
        remainingAmount,
        dueDate,
        daysRemaining,
        reminderStatus,

        purpose: borrowing?.purpose || '',

        transactionDate: String(
          borrowing?.transactionDate ||
            borrowing?.transaction_date ||
            ''
        ).slice(0, 10),
      };
    })
    .sort((a, b) => {
      if (
        a.reminderStatus === 'overdue' &&
        b.reminderStatus !== 'overdue'
      ) {
        return -1;
      }

      if (
        b.reminderStatus === 'overdue' &&
        a.reminderStatus !== 'overdue'
      ) {
        return 1;
      }

      return String(a.dueDate || '9999-12-31').localeCompare(
        String(b.dueDate || '9999-12-31')
      );
    });
}, [data?.centralFundTransactions]);

useEffect(() => {
  if (
    homeFundingAllocationsCloudLoaded ||
    !currentUser
  ) {
    return;
  }

  let cancelled = false;

  const loadHomeFundingAllocations = async () => {
    const { data: cloudRows, error } = await supabase
      .from('remittance_home_funding_allocations')
      .select('*')
      .order('created_at', { ascending: true });

    if (cancelled) return;

    if (error) {
      console.error(
        'Home funding allocations load failed:',
        error
      );

      setHomeFundingAllocationsCloudLoaded(true);
      return;
    }

    const normalizedRows = (cloudRows || []).map(
      (row) => ({
        id: row.id,
        fundingMonth: row.funding_month,
        sourceType: row.source_type,
        availableAmount: Number(
          row.available_amount || 0
        ),
        proposedAmount: Number(
          row.proposed_amount || 0
        ),
        confirmedAmount: Number(
          row.confirmed_amount || 0
        ),
        status: row.status || 'pending',
        confirmedBy: row.confirmed_by || '',
        confirmedAt: row.confirmed_at || '',
        createdAt: row.created_at || '',
        updatedAt: row.updated_at || '',
      })
    );

    setHomeFundingAllocations(normalizedRows);
    setHomeFundingAllocationsCloudLoaded(true);
  };

  loadHomeFundingAllocations();

  return () => {
    cancelled = true;
  };
}, [
  currentUser,
  homeFundingAllocationsCloudLoaded,
]);
  useEffect(() => {
  if (shopSettingsCloudLoaded || !currentUser) return;

  let cancelled = false;

  const loadShopSettingsFromSupabase = async () => {
    const { data: cloudSettings, error } = await supabase
      .from('remittanceShopSettings')
      .select('*');

    if (cancelled) return;

    if (error) {
      console.error('Remittance shop settings load failed:', error);
      setShopSettingsCloudLoaded(true);
      return;
    }

    const settingsByShopId = new Map(
      (cloudSettings || []).map((setting) => [
        String(setting.shop_id || ''),
        Number(setting.local_monthly || 0),
      ])
    );

    const updatedShops = (data?.shops || []).map((shop) => ({
      ...shop,
      remittanceLocalMonthly: settingsByShopId.has(String(shop.id))
        ? settingsByShopId.get(String(shop.id))
        : Number(
            shop.remittanceLocalMonthly ||
              shop.localMonthly ||
              shop.fareElectricityMonthly ||
              0
          ),
    }));

    setShopSettingsCloudLoaded(true);

    await saveData({
      ...data,
      shops: updatedShops,
    });
  };

  loadShopSettingsFromSupabase();

  return () => {
    cancelled = true;
  };
}, [
  currentUser,
  data,
  saveData,
  shopSettingsCloudLoaded,
]);

useEffect(() => {
  if (
    previousMonthSalesCloudLoaded ||
    !currentUser
  ) {
    return;
  }

  let cancelled = false;

  const loadPreviousMonthSales = async () => {
    const now = new Date();

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    const formatDateKey = (date) =>
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;

    const previousMonthStartKey =
      formatDateKey(previousMonthStart);

    const previousMonthEndKey =
      formatDateKey(previousMonthEnd);

  const { data: cloudSales, error } = await supabase
  .from('sales')
  .select('*')
  .gte('date', AUTOMATIC_EXPENSE_ACTIVATION_DATE)
  .lte('date', previousMonthEndKey)
  .order('created_at', { ascending: true });

    if (cancelled) return;

    if (error) {
      console.error(
        'Previous month sales load failed:',
        error
      );

      setPreviousMonthSales([]);
      setPreviousMonthSalesCloudLoaded(true);
      return;
    }

    const normalizedSales = (cloudSales || []).map(
      (sale) => ({
        ...sale,
        shop_id: String(
          sale?.shop_id ||
            sale?.shopId ||
            sale?.shopid ||
            ''
        ),
        date: String(
          sale?.date ||
            sale?.created_at ||
            ''
        ).slice(0, 10),
        confirmed: true,
      })
    );

    setPreviousMonthSales(normalizedSales);
    setPreviousMonthSalesCloudLoaded(true);
  };

  loadPreviousMonthSales();

  return () => {
    cancelled = true;
  };
}, [
  currentUser,
  previousMonthSalesCloudLoaded,
]);

  useEffect(() => {
  if (fundAllocationsCloudLoaded || !currentUser) return;

  let cancelled = false;

  const loadFundAllocationsFromSupabase = async () => {
    const { data: cloudRows, error } = await supabase
      .from('remittanceFundAllocations')
      .select('*')
      .order('created_at', { ascending: true });

    if (cancelled) return;

    if (error) {
      console.error('Remittance fund allocations load failed:', error);
      setFundAllocationsCloudLoaded(true);
      return;
    }

    const normalizedAllocations = (cloudRows || []).map((row) => ({
      id: row.id,
      shop_id: row.shop_id,
      fund_id: row.fund_id,
      allocationDate: row.allocation_date,
      amount: Number(row.amount || 0),
      created_at: row.created_at,
    }));

    setFundAllocationsCloudLoaded(true);

    await saveData({
      ...data,
      remittanceFundAllocations: normalizedAllocations,
    });
  };

  loadFundAllocationsFromSupabase();

  return () => {
    cancelled = true;
  };
}, [
  currentUser,
  data,
  saveData,
  fundAllocationsCloudLoaded,
]);

  useEffect(() => {
  if (expenseFundsCloudLoaded || !currentUser) return;

  let cancelled = false;

  const loadExpenseFundsFromSupabase = async () => {
    const { data: cloudRows, error } = await supabase
      .from('remittanceExpenseFunds')
      .select('*')
      .order('created_at', { ascending: true });

    if (cancelled) return;

    if (error) {
      console.error('Remittance expense funds load failed:', error);
      setExpenseFundsCloudLoaded(true);
      return;
    }

    const normalizedFunds = (cloudRows || []).map((row) => ({
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

    setExpenseFundsCloudLoaded(true);

    await saveData({
      ...data,
      remittanceExpenseFunds: normalizedFunds,
    });
  };

  loadExpenseFundsFromSupabase();

  return () => {
    cancelled = true;
  };
}, [
  currentUser,
  data,
  saveData,
  expenseFundsCloudLoaded,
]);

  useEffect(() => {
  if (remittanceCloudLoaded || !currentUser) return;

  let cancelled = false;

  const loadRemittancesFromSupabase = async () => {
    const { data: cloudRows, error } = await supabase
      .from('dailyRemittances')
      .select('*')
      .order('created_at', { ascending: true });

    if (cancelled) return;

    if (error) {
      console.error('Daily remittances load failed:', error);
      setRemittanceCloudLoaded(true);
      return;
    }

    const normalizedRows = (cloudRows || []).map((row) => ({
        paymentReference: row.payment_reference || '',
      id: row.id,
      shop_id: row.shop_id,
      shopName: row.shop_name || '',
      date: row.date,
      amountSent: Number(row.amount_sent || 0),
      paymentMethod: row.payment_method || 'cash',
      shortReason: row.short_reason || '',
      otherReason: row.other_reason || '',
      expectedAmount: Number(row.expected_amount || 0),

expenseBreakdown: Array.isArray(row.expense_breakdown)
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
centralExpense: Number(row.central_expense || 0),
localRetained: Number(row.local_retained || 0),
ownerProfit: Number(row.owner_profit || 0),
shopReserve: Number(row.shop_reserve || 0),
localConfirmed: Boolean(row.local_confirmed),
      created_at: row.created_at,
    }));

    setRemittanceCloudLoaded(true);

await saveData({
  ...data,
  dailyRemittances: normalizedRows,
});
  };

  loadRemittancesFromSupabase();

  return () => {
    cancelled = true;
  };
}, [
  currentUser,
  data,
  saveData,
  remittanceCloudLoaded,
]);
  const t = (key) => translations[language][key] || key;
  const currentMonthGasSummary = useMemo(() => {
  const now = new Date();

  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;

  const gasEntries = Array.isArray(data?.gasEntries)
    ? data.gasEntries
    : [];

  const confirmedCurrentMonthGasEntries = gasEntries.filter((entry) => {
    const entryDate = String(entry?.date || '');

    return (
      entryDate.startsWith(currentMonthKey) &&
      entry?.confirmed !== false
    );
  });

  return getGasDashboardSummary(
    confirmedCurrentMonthGasEntries
  );
}, [data?.gasEntries]);
























const previousMonthCommissionSummary = useMemo(() => {
  const now = new Date();

  const previousMonthDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(
  previousMonthDate.getMonth() + 1
).padStart(2, '0')}`;

const previousMonthLastDay = new Date(
  now.getFullYear(),
  now.getMonth(),
  0
).getDate();

const previousMonthEndKey = `${previousMonthKey}-${String(
  previousMonthLastDay
).padStart(2, '0')}`;

const commissionRecords = Array.isArray(
    data?.monthlyWakalaCommissions
  )
    ? data.monthlyWakalaCommissions
    : [];

  const previousMonthRecords = commissionRecords.filter(
    (record) =>
      String(record?.commissionMonth || '') ===
      previousMonthKey
  );

  const totalCommission = previousMonthRecords.reduce(
    (total, record) => {
      const savedGrandTotal = Number(
        record?.grandTotal || 0
      );

      if (savedGrandTotal > 0) {
        return total + savedGrandTotal;
      }

      const mobileTotal = Number(
        record?.mobileTotal || 0
      );

      const bankTotal = Number(
        record?.bankTotal || 0
      );

      return total + mobileTotal + bankTotal;
    },
    0
  );

 return {
  commissionMonth: previousMonthKey,
  previousMonthEndKey,
  totalCommission,
};
}, [data?.monthlyWakalaCommissions]);
const eligibleCurrentMonthCommissionSummary =
  useMemo(() => {
    const now = new Date();

    const currentMonthKey =
      `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}`;

    const todayKey =
      `${currentMonthKey}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

    const currentMonthStartKey =
      `${currentMonthKey}-01`;

    if (
      currentMonthStartKey <
      AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
    ) {
      return {
        commissionMonth: currentMonthKey,
        totalCommission: 0,
        isEligible: false,
      };
    }

    const commissionRecords = Array.isArray(
      data?.monthlyWakalaCommissions
    )
      ? data.monthlyWakalaCommissions
      : [];

    const totalCommission =
      commissionRecords.reduce(
        (recordTotal, record) => {
          const mobileRows = Array.isArray(
            record?.mobileCommissions
          )
            ? record.mobileCommissions
            : [];

          const bankRows = Array.isArray(
            record?.bankCommissions
          )
            ? record.bankCommissions
            : [];

          const receivedRows = [
            ...mobileRows,
            ...bankRows,
          ];

          const receivedThisMonth =
            receivedRows.reduce(
              (rowTotal, row) => {
                const receivedDate = String(
                  row?.receivedDate || ''
                ).slice(0, 10);

                const wasActuallyReceived =
                  row?.notReceived !== true &&
                  Number(row?.amount || 0) > 0 &&
                  receivedDate &&
                  receivedDate >=
                    AUTOMATIC_EXPENSE_OFFICIAL_START_DATE &&
                  receivedDate.startsWith(
                    currentMonthKey
                  ) &&
                  receivedDate <= todayKey;

                if (!wasActuallyReceived) {
                  return rowTotal;
                }

                return (
                  rowTotal +
                  Math.max(
                    0,
                    Number(row?.amount || 0)
                  )
                );
              },
              0
            );

          return (
            recordTotal + receivedThisMonth
          );
        },
        0
      );

    return {
      commissionMonth: currentMonthKey,
      totalCommission: Math.max(
        0,
        totalCommission
      ),
      isEligible: totalCommission > 0,
    };
  }, [data?.monthlyWakalaCommissions]);

const eligibleCurrentMonthExpenseShortages =
  useMemo(() => {
    const commissionMonth = String(
      eligibleCurrentMonthCommissionSummary
        ?.commissionMonth || ''
    );

    const commissionIsEligible =
      eligibleCurrentMonthCommissionSummary
        ?.isEligible === true;

    if (!commissionMonth || !commissionIsEligible) {
      return {
        commissionMonth,
        rows: [],
        totalShortage: 0,
      };
    }

    const today = new Date();

    const todayKey =
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`;

    const monthStartKey =
      `${commissionMonth}-01`;

    const effectiveStartKey =
      monthStartKey <
      AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
        ? AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
        : monthStartKey;

    const monthDateKeys = getExpenseDateKeys(
      effectiveStartKey,
      todayKey
    );

    const shops = Array.isArray(data?.shops)
      ? data.shops
      : [];

    const shortageRows = [];

    shops.forEach((shop) => {
      const shopId = String(
        shop?.id || ''
      ).trim();

      if (!shopId) return;

      const expenseEntries = Object.entries(
        MASTER_EXPENSE_SETUP[shopId]
          ?.expenses || {}
      ).filter(
        ([, expense]) =>
          expense?.location === 'owner'
      );

      const requiredByExpense = new Map(
        expenseEntries.map(([expenseKey]) => [
          expenseKey,
          0,
        ])
      );

      const fundedByExpense = new Map(
        expenseEntries.map(([expenseKey]) => [
          expenseKey,
          0,
        ])
      );

      monthDateKeys.forEach((dateKey) => {
        expenseEntries.forEach(
          ([expenseKey, expense]) => {
            const requiredAmount =
              getExpenseRequiredAmountForDate(
                expense,
                dateKey
              );

            requiredByExpense.set(
              expenseKey,
              Number(
                requiredByExpense.get(
                  expenseKey
                ) || 0
              ) +
                Math.max(
                  0,
                  Number(requiredAmount || 0)
                )
            );
          }
        );

        const livePosition =
          getLiveRemittanceShopPosition({
            data,
            shopId,
            calculationDateKey: dateKey,
          });

        const fundingBreakdown =
          Array.isArray(
            livePosition
              ?.centralExpenseFundingBreakdown
          )
            ? livePosition
                .centralExpenseFundingBreakdown
            : [];

        fundingBreakdown.forEach((expense) => {
          const expenseKey = String(
            expense?.key || ''
          );

          if (!fundedByExpense.has(expenseKey)) {
            return;
          }

          fundedByExpense.set(
            expenseKey,
            Number(
              fundedByExpense.get(
                expenseKey
              ) || 0
            ) +
              Math.max(
                0,
                Number(
                  expense?.amountFunded || 0
                )
              )
          );
        });
      });

      expenseEntries.forEach(
        ([expenseKey, expense]) => {
          const requiredAmount = Math.max(
            0,
            Number(
              requiredByExpense.get(
                expenseKey
              ) || 0
            )
          );

          const fundedAmount = Math.min(
            requiredAmount,
            Math.max(
              0,
              Number(
                fundedByExpense.get(
                  expenseKey
                ) || 0
              )
            )
          );

          const shortageAmount = Math.max(
            0,
            requiredAmount - fundedAmount
          );

          shortageRows.push({
            fundKey:
              `${shopId}-${expenseKey}`,
            shopId,
            shopName:
              shop?.name ||
              MASTER_EXPENSE_SETUP[shopId]
                ?.shopName ||
              shopId,
            expenseKey,
            expenseName:
              expense?.name || expenseKey,
            requiredAmount,
            fundedAmount,
            shortageAmount,
          });
        }
      );
    });

    return {
      commissionMonth,
      rows: shortageRows,
      totalShortage:
        shortageRows.reduce(
          (total, row) =>
            total +
            Math.max(
              0,
              Number(
                row?.shortageAmount || 0
              )
            ),
          0
        ),
    };
  }, [
    eligibleCurrentMonthCommissionSummary,
    data,
    data?.shops,
    data?.sales,
    data?.products,
    data?.gasEntries,
    data?.dailyRemittances,
  ]);
  const eligibleCurrentMonthCommissionAllocation=
  useMemo(() => {
    let commissionRemaining = Math.max(
      0,
      Number(
        eligibleCurrentMonthCommissionSummary
          ?.totalCommission || 0
      )
    );

    const shortageRows = Array.isArray(
      eligibleCurrentMonthExpenseShortages
        ?.rows
    )
      ? eligibleCurrentMonthExpenseShortages
          .rows
      : [];

    const allocationByFundKey = new Map();

    const allocationRows = shortageRows.map(
      (shortageRow) => {
        const shortageAmount = Math.max(
          0,
          Number(
            shortageRow?.shortageAmount || 0
          )
        );

        const commissionAllocated = Math.min(
          commissionRemaining,
          shortageAmount
        );

        commissionRemaining = Math.max(
          0,
          commissionRemaining -
            commissionAllocated
        );

        if (commissionAllocated > 0) {
          allocationByFundKey.set(
            shortageRow.fundKey,
            commissionAllocated
          );
        }

        return {
          ...shortageRow,
          commissionAllocated,
          shortageAfterCommission: Math.max(
            0,
            shortageAmount -
              commissionAllocated
          ),
        };
      }
    );

    const totalCommission = Math.max(
      0,
      Number(
        eligibleCurrentMonthCommissionSummary
          ?.totalCommission || 0
      )
    );

    const commissionUsedForExpenses =
      allocationRows.reduce(
        (total, row) =>
          total +
          Math.max(
            0,
            Number(
              row?.commissionAllocated || 0
            )
          ),
        0
      );

    const ownerProfitFromCommission =
      Math.max(
        0,
        totalCommission -
          commissionUsedForExpenses
      );

    return {
      receiptMonth: String(
        eligibleCurrentMonthCommissionSummary
          ?.commissionMonth || ''
      ),
      totalCommission,
      commissionUsedForExpenses,
      ownerProfitFromCommission,
      allocationByFundKey,
      rows: allocationRows,
      totalShortageBeforeCommission:
        Math.max(
          0,
          Number(
            eligibleCurrentMonthExpenseShortages
              ?.totalShortage || 0
          )
        ),
      totalShortageAfterCommission:
        allocationRows.reduce(
          (total, row) =>
            total +
            Math.max(
              0,
              Number(
                row
                  ?.shortageAfterCommission || 0
              )
            ),
          0
        ),
    };
  }, [
    eligibleCurrentMonthCommissionSummary,
    eligibleCurrentMonthExpenseShortages,
  ]);
const previousMonthGasSummary = useMemo(() => {
  const previousMonthKey = String(
    previousMonthCommissionSummary?.commissionMonth || ''
  );

  if (!previousMonthKey) {
    return {
      totalProfit: 0,
    };
  }

  const gasEntries = Array.isArray(data?.gasEntries)
    ? data.gasEntries
    : [];

  const confirmedPreviousMonthGasEntries =
    gasEntries.filter((entry) => {
      const entryDate = String(
        entry?.date ||
          entry?.created_at ||
          ''
      ).slice(0, 10);

      return (
        entryDate.startsWith(previousMonthKey) &&
        entry?.confirmed !== false
      );
    });

  return getGasDashboardSummary(
    confirmedPreviousMonthGasEntries
  );
}, [
  data?.gasEntries,
  previousMonthCommissionSummary,
]);

const previousMonthGasContribution = Math.max(
  0,
  Number(previousMonthGasSummary?.totalProfit || 0) *
    0.7
);








const previousMonthAutomaticShopContribution = useMemo(() => {
  if (!previousMonthSalesCloudLoaded) {
    return 0;
  }

  const previousMonthKey = String(
    previousMonthCommissionSummary?.commissionMonth || ''
  );

  const previousMonthEndKey = String(
    previousMonthCommissionSummary?.previousMonthEndKey || ''
  );

  if (!previousMonthKey || !previousMonthEndKey) {
    return 0;
  }

  const shops = Array.isArray(data?.shops)
    ? data.shops
    : [];

  const products = Array.isArray(data?.products)
    ? data.products
    : [];

  const productById = new Map(
    products.map((product) => [
      String(product?.id || ''),
      product,
    ])
  );

  const getHistoricalGrossProfit = (
    shopId,
    calculationDateKey
  ) => {
    const dateSales = previousMonthSales.filter(
      (sale) => {
        const saleShopId = String(
          sale?.shop_id ||
            sale?.shopId ||
            sale?.shopid ||
            ''
        );

        return (
          saleShopId === String(shopId) &&
          String(sale?.date || '').slice(0, 10) ===
            calculationDateKey
        );
      }
    );

    const salesAmount = dateSales.reduce(
      (total, sale) =>
        total + Number(sale?.total || 0),
      0
    );

    const replacementAmount = dateSales.reduce(
      (saleTotal, sale) => {
        const items = Array.isArray(sale?.items)
          ? sale.items
          : [];

        return (
          saleTotal +
          items.reduce((itemTotal, item) => {
            const product = productById.get(
              String(item?.productId || '')
            );

            const quantity = Number(
              item?.quantity || 0
            );

            const buyingPrice = Number(
              item?.buyPrice ||
                product?.buyPrice ||
                product?.buyingprice ||
                0
            );

            return (
              itemTotal +
              quantity * buyingPrice
            );
          }, 0)
        );
      },
      0
    );

    return Math.max(
      0,
      salesAmount - replacementAmount
    );
  };

  return shops.reduce((networkTotal, shop) => {
    const shopId = String(shop?.id || '');

    const centralExpenseEntries = Object.entries(
      MASTER_EXPENSE_SETUP[shopId]?.expenses || {}
    ).filter(
      ([, expense]) =>
        expense.location === 'owner'
    );

    const replayDateKeys = getExpenseDateKeys(
      AUTOMATIC_EXPENSE_ACTIVATION_DATE,
      previousMonthEndKey
    );

    const finalPosition = replayDateKeys.reduce(
      (position, expenseDateKey) => {
        const dailyGrossProfit =
          getHistoricalGrossProfit(
            shopId,
            expenseDateKey
          );

        const dailyRequirement =
          getShopDailyExpenseRequirement(
            shopId,
            expenseDateKey
          );

        const totalLocalObligation =
          Number(position.localOutstanding || 0) +
          Number(
            dailyRequirement.localRequired || 0
          );

        const localAmountPaid = Math.min(
          dailyGrossProfit,
          totalLocalObligation
        );

        let remainingCentralFunding = Math.max(
          0,
          dailyGrossProfit - localAmountPaid
        );

        const nextCentralOutstanding = {
          ...position.centralOutstanding,
        };

        centralExpenseEntries.forEach(
          ([expenseKey, expense]) => {
            const requiredForDate =
              getExpenseRequiredAmountForDate(
                expense,
                expenseDateKey
              );

            nextCentralOutstanding[expenseKey] =
              Number(
                nextCentralOutstanding[expenseKey] ||
                  0
              ) + requiredForDate;
          }
        );

        let homeExpensesFundedThisMonth =
          Number(
            position.homeExpensesFundedThisMonth ||
              0
          );

        centralExpenseEntries.forEach(
          ([expenseKey]) => {
            const expenseOutstanding = Number(
              nextCentralOutstanding[expenseKey] ||
                0
            );

            const amountPaid = Math.min(
              remainingCentralFunding,
              expenseOutstanding
            );

            nextCentralOutstanding[expenseKey] =
              Math.max(
                0,
                expenseOutstanding - amountPaid
              );

            remainingCentralFunding = Math.max(
              0,
              remainingCentralFunding - amountPaid
            );

            if (
              expenseKey === 'homeExpenses' &&
              expenseDateKey.startsWith(
                previousMonthKey
              )
            ) {
              homeExpensesFundedThisMonth +=
                amountPaid;
            }
          }
        );

        return {
          localOutstanding: Math.max(
            0,
            totalLocalObligation -
              localAmountPaid
          ),
          centralOutstanding:
            nextCentralOutstanding,
          homeExpensesFundedThisMonth,
        };
      },
      {
        localOutstanding: 0,
        centralOutstanding: {},
        homeExpensesFundedThisMonth: 0,
      }
    );

    return (
      networkTotal +
      Number(
        finalPosition.homeExpensesFundedThisMonth ||
          0
      )
    );
  }, 0);
}, [
  previousMonthSales,
  previousMonthSalesCloudLoaded,
  previousMonthCommissionSummary,
  data?.shops,
  data?.products,
]);

const previousMonthAllExpenseShortages = useMemo(() => {
  const commissionMonth = String(
    previousMonthCommissionSummary?.commissionMonth || ''
  );

  if (!commissionMonth) {
    return {
      commissionMonth: '',
      rows: [],
      totalShortage: 0,
    };
  }

  const [year, month] = commissionMonth
    .split('-')
    .map(Number);

  if (!year || !month) {
    return {
      commissionMonth,
      rows: [],
      totalShortage: 0,
    };
  }

  const monthStartKey =
    `${year}-${String(month).padStart(2, '0')}-01`;

  const monthEndKey =
    `${year}-${String(month).padStart(2, '0')}-${String(
      new Date(year, month, 0).getDate()
    ).padStart(2, '0')}`;

  const monthDateKeys = getExpenseDateKeys(
    monthStartKey <
      AUTOMATIC_EXPENSE_ACTIVATION_DATE
      ? AUTOMATIC_EXPENSE_ACTIVATION_DATE
      : monthStartKey,
    monthEndKey
  );

  const shops = Array.isArray(data?.shops)
    ? data.shops
    : [];

  const shortageRows = [];

  shops.forEach((shop) => {
    const shopId = String(shop?.id || '').trim();

    if (!shopId) return;

    const expenseEntries = Object.entries(
      MASTER_EXPENSE_SETUP[shopId]?.expenses || {}
    ).filter(
      ([, expense]) =>
        expense?.location === 'owner'
    );

    const requiredByExpense = new Map(
      expenseEntries.map(([expenseKey]) => [
        expenseKey,
        0,
      ])
    );

    const fundedByExpense = new Map(
      expenseEntries.map(([expenseKey]) => [
        expenseKey,
        0,
      ])
    );

    monthDateKeys.forEach((dateKey) => {
      expenseEntries.forEach(
        ([expenseKey, expense]) => {
          const requiredAmount =
            getExpenseRequiredAmountForDate(
              expense,
              dateKey
            );

          requiredByExpense.set(
            expenseKey,
            Number(
              requiredByExpense.get(expenseKey) || 0
            ) +
              Math.max(
                0,
                Number(requiredAmount || 0)
              )
          );
        }
      );

      const livePosition =
        getLiveRemittanceShopPosition({
          data,
          shopId,
          calculationDateKey: dateKey,
        });

      const normalFundingBreakdown =
        Array.isArray(
          livePosition
            ?.centralExpenseFundingBreakdown
        )
          ? livePosition
              .centralExpenseFundingBreakdown
          : [];

      normalFundingBreakdown.forEach(
        (expense) => {
          const expenseKey = String(
            expense?.key || ''
          );

          if (!requiredByExpense.has(expenseKey)) {
            return;
          }

          fundedByExpense.set(
            expenseKey,
            Number(
              fundedByExpense.get(expenseKey) || 0
            ) +
              Math.max(
                0,
                Number(expense?.amountFunded || 0)
              )
          );
        }
      );
    });

    expenseEntries.forEach(
      ([expenseKey, expense]) => {
        const requiredAmount = Math.max(
          0,
          Number(
            requiredByExpense.get(expenseKey) || 0
          )
        );

        const fundedAmount = Math.min(
          requiredAmount,
          Math.max(
            0,
            Number(
              fundedByExpense.get(expenseKey) || 0
            )
          )
        );

        const shortageAmount = Math.max(
          0,
          requiredAmount - fundedAmount
        );

        shortageRows.push({
          fundKey: `${shopId}-${expenseKey}`,
          shopId,
          shopName:
            shop?.name ||
            MASTER_EXPENSE_SETUP[shopId]
              ?.shopName ||
            shopId,
          expenseKey,
          expenseName:
            expense?.name || expenseKey,
          requiredAmount,
          fundedAmount,
          shortageAmount,
        });
      }
    );
  });

  return {
    commissionMonth,
    rows: shortageRows,
    totalShortage: shortageRows.reduce(
      (sum, row) =>
        sum +
        Math.max(
          0,
          Number(row?.shortageAmount || 0)
        ),
      0
    ),
  };
}, [
  previousMonthCommissionSummary,
  data,
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
  data?.dailyRemittances,
]);
const previousMonthHomeExpensesShortage = useMemo(() => {
  const monthlyTarget = Math.max(
    0,
    Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0)
  );

  const shopContribution = Math.max(
    0,
    Number(previousMonthAutomaticShopContribution || 0)
  );

  const gasContributionUsed = Math.min(
    Math.max(0, monthlyTarget - shopContribution),
    Math.max(
      0,
      Number(previousMonthGasContribution || 0)
    )
  );

  const totalFundingBeforeCommission = Math.min(
    monthlyTarget,
    shopContribution + gasContributionUsed
  );

  const shortageBeforeCommission = Math.max(
    0,
    monthlyTarget - totalFundingBeforeCommission
  );

  return {
    fundingMonth: String(
      previousMonthCommissionSummary?.commissionMonth || ''
    ),
    monthlyTarget,
    shopContribution,
    availableGasContribution: Math.max(
      0,
      Number(previousMonthGasContribution || 0)
    ),
    gasContributionUsed,
    totalFundingBeforeCommission,
    shortageBeforeCommission,
  };
}, [
  previousMonthAutomaticShopContribution,
  previousMonthGasContribution,
  previousMonthCommissionSummary,
]);

const automaticPreviousMonthCommissionAllocation =
  useMemo(() => {
    let commissionRemaining = Math.max(
      0,
      Number(
        previousMonthCommissionSummary
          ?.totalCommission || 0
      )
    );

    const shortageRows = Array.isArray(
      previousMonthAllExpenseShortages?.rows
    )
      ? previousMonthAllExpenseShortages.rows
      : [];

    const allocationByFundKey = new Map();

    const allocationRows = shortageRows.map(
      (shortageRow) => {
        const shortageAmount = Math.max(
          0,
          Number(
            shortageRow?.shortageAmount || 0
          )
        );

        const commissionAllocated = Math.min(
          commissionRemaining,
          shortageAmount
        );

        commissionRemaining = Math.max(
          0,
          commissionRemaining -
            commissionAllocated
        );

        if (commissionAllocated > 0) {
          allocationByFundKey.set(
            shortageRow.fundKey,
            commissionAllocated
          );
        }

        return {
          ...shortageRow,
          commissionAllocated,
          shortageAfterCommission: Math.max(
            0,
            shortageAmount -
              commissionAllocated
          ),
        };
      }
    );

    const totalCommission = Math.max(
      0,
      Number(
        previousMonthCommissionSummary
          ?.totalCommission || 0
      )
    );

    const commissionUsedForExpenses =
      allocationRows.reduce(
        (sum, row) =>
          sum +
          Math.max(
            0,
            Number(
              row?.commissionAllocated || 0
            )
          ),
        0
      );

    const ownerProfitFromCommission =
      Math.max(
        0,
        totalCommission -
          commissionUsedForExpenses
      );

    return {
      commissionMonth: String(
        previousMonthAllExpenseShortages
          ?.commissionMonth || ''
      ),

      totalCommission,

      commissionUsedForExpenses,

      ownerProfitFromCommission,

      allocationByFundKey,

      rows: allocationRows,

      totalShortageBeforeCommission:
        Math.max(
          0,
          Number(
            previousMonthAllExpenseShortages
              ?.totalShortage || 0
          )
        ),

      totalShortageAfterCommission:
        allocationRows.reduce(
          (sum, row) =>
            sum +
            Math.max(
              0,
              Number(
                row
                  ?.shortageAfterCommission ||
                  0
              )
            ),
          0
        ),
    };

    
  }, [
    previousMonthCommissionSummary,
    previousMonthAllExpenseShortages,
  ]);

  const commissionAdjustedCentralFundAccounts =
  useMemo(() => {
    const commissionAllocationByFundKey =
      eligibleCurrentMonthCommissionAllocation
        ?.allocationByFundKey instanceof Map
        ? eligibleCurrentMonthCommissionAllocation
            .allocationByFundKey
        : new Map();

    const commissionOwnerProfit = Math.max(
      0,
      Number(
        eligibleCurrentMonthCommissionAllocation
          ?.ownerProfitFromCommission || 0
      )
    );

    return centralFundAccounts.map((account) => {
      const accountKey = String(
        account?.key || ''
      ).trim();

      const commissionForExpense = Math.max(
        0,
        Number(
          commissionAllocationByFundKey.get(
            accountKey
          ) || 0
        )
      );

      const commissionForOwnerProfit =
        accountKey === 'owner-profit'
          ? commissionOwnerProfit
          : 0;

      const automaticCommissionAmount =
        commissionForExpense +
        commissionForOwnerProfit;

      return {
        ...account,
        automaticCommissionAmount,
        availableBalance:
          Number(account?.availableBalance || 0) +
          automaticCommissionAmount,
      };
    });
  }, [
    centralFundAccounts,
    eligibleCurrentMonthCommissionAllocation,
  ]);
const previousMonthCommissionProposal = useMemo(() => {
  const availableCommission = Math.max(
    0,
    Number(
      previousMonthCommissionSummary?.totalCommission || 0
    )
  );

  const shortageBeforeCommission = Math.max(
    0,
    Number(
      previousMonthHomeExpensesShortage
        ?.shortageBeforeCommission || 0
    )
  );

  const proposedCommissionContribution = Math.min(
    availableCommission,
    shortageBeforeCommission
  );

  const remainingShortageAfterCommission = Math.max(
    0,
    shortageBeforeCommission -
      proposedCommissionContribution
  );

  const unusedCommission = Math.max(
    0,
    availableCommission -
      proposedCommissionContribution
  );

  return {
    fundingMonth: String(
      previousMonthCommissionSummary?.commissionMonth || ''
    ),
    availableCommission,
    shortageBeforeCommission,
    proposedCommissionContribution,
    remainingShortageAfterCommission,
    unusedCommission,
  };
}, [
  previousMonthCommissionSummary,
  previousMonthHomeExpensesShortage,
]);

const confirmPreviousMonthCommissionContribution = async () => {
  if (!homeFundingAllocationsCloudLoaded) {
    alert(
      language === 'sw'
        ? 'Tafadhali subiri, taarifa za uthibitisho bado zinapakiwa.'
        : 'Please wait. Confirmation records are still loading.'
    );
    return;
  }

  const fundingMonth = String(
    previousMonthCommissionProposal?.fundingMonth || ''
  );

  if (!fundingMonth) {
    alert(
      language === 'sw'
        ? 'Mwezi unaohusika na kamisheni haujapatikana.'
        : 'The commission funding month could not be determined.'
    );
    return;
  }

  const existingAllocation =
    homeFundingAllocations.find(
      (allocation) =>
        String(allocation?.fundingMonth || '') ===
          fundingMonth &&
        String(allocation?.sourceType || '') ===
          'combined_commission'
    ) || null;

  if (existingAllocation?.status === 'confirmed') {
    alert(
      language === 'sw'
        ? 'Mchango wa kamisheni wa mwezi huu tayari umethibitishwa.'
        : 'This month’s commission contribution has already been confirmed.'
    );
    return;
  }

  const proposedAmount = Math.max(
    0,
    Number(
      previousMonthCommissionProposal
        ?.proposedCommissionContribution || 0
    )
  );

  if (proposedAmount <= 0) {
    alert(
      language === 'sw'
        ? 'Hakuna kiasi cha kamisheni kinachopendekezwa kwa upungufu wa mwezi uliopita.'
        : 'There is no commission amount proposed for the previous month’s shortage.'
    );
    return;
  }

  const availableCommission = Math.max(
    0,
    Number(
      previousMonthCommissionProposal
        ?.availableCommission || 0
    )
  );

  const confirmedAt = new Date().toISOString();

  const allocationId =
    existingAllocation?.id ||
    `home-funding-combined-commission-${fundingMonth}`;

  const recordForSupabase = {
    id: allocationId,
    funding_month: fundingMonth,
    source_type: 'combined_commission',
    available_amount: availableCommission,
    proposed_amount: proposedAmount,
    confirmed_amount: proposedAmount,
    status: 'confirmed',
    confirmed_by: String(
      currentUser?.id ||
        currentUser?.email ||
        currentUser?.name ||
        'owner'
    ),
    confirmed_at: confirmedAt,
    updated_at: confirmedAt,
  };

  const { data: savedRows, error } = await supabase
    .from('remittance_home_funding_allocations')
    .upsert(recordForSupabase, {
      onConflict: 'funding_month,source_type',
    })
    .select();

  if (error) {
    alert(
      language === 'sw'
        ? `Mchango wa kamisheni haujahifadhiwa: ${error.message}`
        : `The commission contribution was not saved: ${error.message}`
    );
    return;
  }

  const savedRow = savedRows?.[0];

  const normalizedRecord = {
    id: savedRow?.id || allocationId,
    fundingMonth:
      savedRow?.funding_month || fundingMonth,
    sourceType:
      savedRow?.source_type || 'combined_commission',
    availableAmount: Number(
      savedRow?.available_amount ??
        availableCommission
    ),
    proposedAmount: Number(
      savedRow?.proposed_amount ??
        proposedAmount
    ),
    confirmedAmount: Number(
      savedRow?.confirmed_amount ??
        proposedAmount
    ),
    status: savedRow?.status || 'confirmed',
    confirmedBy:
      savedRow?.confirmed_by ||
      recordForSupabase.confirmed_by,
    confirmedAt:
      savedRow?.confirmed_at || confirmedAt,
    createdAt:
      savedRow?.created_at || confirmedAt,
    updatedAt:
      savedRow?.updated_at || confirmedAt,
  };

  setHomeFundingAllocations((previous) => {
    const existingIndex = previous.findIndex(
      (allocation) =>
        String(allocation?.fundingMonth || '') ===
          fundingMonth &&
        String(allocation?.sourceType || '') ===
          'combined_commission'
    );

    if (existingIndex === -1) {
      return [...previous, normalizedRecord];
    }

    return previous.map((allocation, index) =>
      index === existingIndex
        ? normalizedRecord
        : allocation
    );
  });

  alert(
    language === 'sw'
      ? 'Mchango wa kamisheni kwa upungufu wa matumizi ya nyumbani wa mwezi uliopita umethibitishwa na kuhifadhiwa.'
      : 'The commission contribution for the previous month’s Home Expenses shortage has been confirmed and saved.'
  );
};


const homeExpensesFundingSummary = useMemo(() => {
  const now = new Date();

  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;

  const confirmedShopHomeContribution = remittanceRecords
    .filter((record) =>
      String(record?.date || '').startsWith(currentMonthKey)
    )
    .reduce((total, record) => {
      const shopId = String(
        record?.shop_id || record?.shopId || ''
      );

      const expenseSetup =
        MASTER_EXPENSE_SETUP[shopId]?.expenses || {};

      const recordDate = new Date(
        `${String(record?.date || '')}T00:00:00`
      );

      const daysInRecordMonth = new Date(
        recordDate.getFullYear(),
        recordDate.getMonth() + 1,
        0
      ).getDate();

      const getDailyAmount = (expense) => {
        const amount = Number(expense?.amount || 0);

        if (expense?.frequency === 'daily') {
          return amount;
        }

        if (expense?.frequency === 'monthly') {
          return amount / daysInRecordMonth;
        }

        if (expense?.frequency === 'six_months') {
          return amount / (daysInRecordMonth * 6);
        }

        return 0;
      };

      const centralExpenses = Object.values(expenseSetup).filter(
        (expense) => expense.location === 'owner'
      );

      const centralRequired = centralExpenses.reduce(
        (sum, expense) => sum + getDailyAmount(expense),
        0
      );

      const homeRequired = getDailyAmount(
        expenseSetup.homeExpenses
      );

      const centralAmountActuallySent = Math.min(
        Number(record?.amountSent || 0),
        Number(record?.centralExpense || 0)
      );

      const homeAmountActuallyFunded =
        centralRequired > 0
          ? centralAmountActuallySent *
            (homeRequired / centralRequired)
          : 0;

      return total + homeAmountActuallyFunded;
    }, 0);

  const remainingHomeExpenses = Math.max(
    0,
    Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0) -
      confirmedShopHomeContribution
  );

  const confirmedGasProfit = Math.max(
    0,
    Number(currentMonthGasSummary?.totalProfit || 0)
  );

  const proposedGasContribution = Math.min(
    confirmedGasProfit,
    remainingHomeExpenses
  );

  return {
    monthlyTarget: Number(
      HOME_EXPENSES_MONTHLY_BUDGET.target || 0
    ),
    confirmedShopHomeContribution,
    remainingHomeExpenses,
    confirmedGasProfit,
    proposedGasContribution,
  };
}, [
  remittanceRecords,
  currentMonthGasSummary,
]);


const previousMonthCombinedCommissionAllocation =
  useMemo(() => {
    const previousMonthKey = String(
      previousMonthCommissionProposal?.fundingMonth || ''
    );

    if (!previousMonthKey) {
      return null;
    }

    return (
      homeFundingAllocations.find(
        (allocation) =>
          String(allocation?.fundingMonth || '') ===
            previousMonthKey &&
          String(allocation?.sourceType || '') ===
            'combined_commission'
      ) || null
    );
  }, [
    homeFundingAllocations,
    previousMonthCommissionProposal,
  ]);

  const rows = useMemo(() => {
  const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const startOfLocalDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addLocalDays = (date, numberOfDays) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + numberOfDays);
  return copy;
};

const now = startOfLocalDay(new Date());

let periodStart = now;
let periodEnd = now;

if (reportPreset === 'yesterday') {
  periodStart = addLocalDays(now, -1);
  periodEnd = addLocalDays(now, -1);
} else if (reportPreset === 'week') {
  const dayOfWeek = now.getDay();
  const daysFromMonday =
    dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  periodStart = addLocalDays(now, -daysFromMonday);
} else if (reportPreset === 'lastweek') {
  const dayOfWeek = now.getDay();
  const daysFromMonday =
    dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const thisWeekStart = addLocalDays(
    now,
    -daysFromMonday
  );

  periodStart = addLocalDays(thisWeekStart, -7);
  periodEnd = addLocalDays(thisWeekStart, -1);
} else if (reportPreset === 'month') {
  periodStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );
} else if (reportPreset === 'lastmonth') {
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
} else if (reportPreset === '3months') {
  periodStart = addLocalDays(now, -89);
} else if (reportPreset === '6months') {
  periodStart = addLocalDays(now, -179);
} else if (reportPreset === 'year') {
  periodStart = new Date(now.getFullYear(), 0, 1);
} else if (
  reportPreset === 'date' &&
  reportStartDate &&
  reportEndDate
) {
  periodStart = startOfLocalDay(
    `${reportStartDate}T00:00:00`
  );

  periodEnd = startOfLocalDay(
    `${reportEndDate}T00:00:00`
  );
}

const periodStartKey = formatDateKey(periodStart);
const periodEndKey = formatDateKey(periodEnd);
const todayKey = periodEndKey;

const selectedPeriodDays = Math.max(
  1,
  Math.floor(
    (periodEnd.getTime() - periodStart.getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1
);

const selectedPeriodDateKeys = getExpenseDateKeys(
  periodStartKey,
  periodEndKey
);
  const shops = Array.isArray(data?.shops) ? data.shops : [];
  const sales = Array.isArray(data?.sales) ? data.sales : [];
  const products = Array.isArray(data?.products) ? data.products : [];

  const productById = new Map(
    products.map((product) => [String(product?.id || ''), product])
  );

  const getShopGrossProfitForDate = (
  shopId,
  calculationDateKey,
  sourceSales = sales
) => {
  const safeSourceSales = Array.isArray(sourceSales)
    ? sourceSales
    : [];

  const dateSales = safeSourceSales.filter((sale) => {
    const saleShopId = String(
      sale?.shop_id ||
        sale?.shopId ||
        sale?.shopid ||
        ''
    );

    return (
      saleShopId === String(shopId) &&
      String(sale?.date || '').slice(0, 10) ===
        calculationDateKey
    );
  });

  const salesAmount = dateSales.reduce(
    (sum, sale) => sum + Number(sale?.total || 0),
    0
  );

  const replacementAmount = dateSales.reduce(
    (saleSum, sale) => {
      const items = Array.isArray(sale?.items)
        ? sale.items
        : [];

      return (
        saleSum +
        items.reduce((itemSum, item) => {
          const product = productById.get(
            String(item?.productId || '')
          );

          const quantity = Number(
            item?.quantity || 0
          );

          const buyPrice = Number(
            item?.buyPrice ||
              product?.buyPrice ||
              product?.buyingprice ||
              0
          );

          return itemSum + quantity * buyPrice;
        }, 0)
      );
    },
    0
  );

  return Math.max(
    0,
    salesAmount - replacementAmount
  );
};

const getShopSalesPositionForDate = (
  shopId,
  calculationDateKey
) => {
  const dateSales = sales.filter((sale) => {
    const saleShopId = String(
      sale?.shop_id ||
        sale?.shopId ||
        sale?.shopid ||
        ''
    );

    return (
      saleShopId === String(shopId) &&
      String(sale?.date || '').slice(0, 10) ===
        calculationDateKey
    );
  });

  const salesAmount = dateSales.reduce(
    (sum, sale) => sum + Number(sale?.total || 0),
    0
  );

  const replacementAmount = dateSales.reduce(
    (saleSum, sale) => {
      const items = Array.isArray(sale?.items)
        ? sale.items
        : [];

      return (
        saleSum +
        items.reduce((itemSum, item) => {
          const product = productById.get(
            String(item?.productId || '')
          );

          const quantity = Number(
            item?.quantity || 0
          );

          const buyPrice = Number(
            item?.buyPrice ||
              product?.buyPrice ||
              product?.buyingprice ||
              0
          );

          return itemSum + quantity * buyPrice;
        }, 0)
      );
    },
    0
  );

  return {
    sales: salesAmount,
    replacement: replacementAmount,
    grossProfit: Math.max(
      0,
      salesAmount - replacementAmount
    ),
  };
};

  return shops.map((shop) => {
    const shopId = String(shop?.id || '');

    const selectedPeriodStartDate = new Date(
  `${periodStartKey}T00:00:00`
);

const previousDayKey = formatDateKey(
  addLocalDays(selectedPeriodStartDate, -1)
);

const previousExpenseReplayStartKey =
  periodStartKey >= AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
    ? AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
    : AUTOMATIC_EXPENSE_PILOT_START_DATE;

const previousExpenseDateKeys = getExpenseDateKeys(
  previousExpenseReplayStartKey,
  previousDayKey
);

const previousUnpaidExpensePosition =
  previousExpenseDateKeys.reduce(
    (position, expenseDateKey) => {
      const dailyRequirement =
        getShopDailyExpenseRequirement(
          shopId,
          expenseDateKey
        );

      const dailyGrossProfit =
        getShopGrossProfitForDate(
          shopId,
          expenseDateKey
        );
const previousLocalPaid = Math.min(
  Number(dailyGrossProfit || 0),
  Number(position.localUnpaid || 0)
);

const grossAfterPreviousLocal = Math.max(
  0,
  Number(dailyGrossProfit || 0) -
    previousLocalPaid
);

const todayLocalPaid = Math.min(
  grossAfterPreviousLocal,
  Number(dailyRequirement.localRequired || 0)
);

const totalLocalFunded =
  previousLocalPaid + todayLocalPaid;

const localUnpaid = Math.max(
  0,
  Number(position.localUnpaid || 0) +
    Number(dailyRequirement.localRequired || 0) -
    totalLocalFunded
);

const grossAfterLocal = Math.max(
  0,
  grossAfterPreviousLocal - todayLocalPaid
);

const previousCentralPaid = Math.min(
  grossAfterLocal,
  Number(position.centralUnpaid || 0)
);

const grossAfterPreviousCentral = Math.max(
  0,
  grossAfterLocal - previousCentralPaid
);

const todayCentralPaid = Math.min(
  grossAfterPreviousCentral,
  Number(dailyRequirement.centralRequired || 0)
);

const totalCentralFunded =
  previousCentralPaid + todayCentralPaid;

const centralUnpaid = Math.max(
  0,
  Number(position.centralUnpaid || 0) +
    Number(dailyRequirement.centralRequired || 0) -
    totalCentralFunded
);

      return {
        localUnpaid,
        centralUnpaid,
      };
    },
    {
      localUnpaid: 0,
      centralUnpaid: 0,
    }
  );

const previousUnpaidLocalExpenses = Number(
  previousUnpaidExpensePosition.localUnpaid || 0
);

const previousUnpaidCentralExpenses = Number(
  previousUnpaidExpensePosition.centralUnpaid || 0
);

const previousUnpaidExpenses =
  previousUnpaidLocalExpenses +
  previousUnpaidCentralExpenses;
  const selectedPeriodExpensePosition =
  selectedPeriodDateKeys.reduce(
    (position, expenseDateKey) => {
      const dailyRequirement =
        getShopDailyExpenseRequirement(
          shopId,
          expenseDateKey
        );

      const dailyGrossProfit =
        getShopGrossProfitForDate(
          shopId,
          expenseDateKey
        );

      const previousLocalPaid = Math.min(
        dailyGrossProfit,
        position.localOutstanding
      );

      const grossAfterPreviousLocal = Math.max(
        0,
        dailyGrossProfit - previousLocalPaid
      );

      const todayLocalPaid = Math.min(
        grossAfterPreviousLocal,
        dailyRequirement.localRequired
      );

      const grossAfterLocal = Math.max(
        0,
        grossAfterPreviousLocal - todayLocalPaid
      );

      const previousCentralPaid = Math.min(
        grossAfterLocal,
        position.centralOutstanding
      );

      const grossAfterPreviousCentral = Math.max(
        0,
        grossAfterLocal - previousCentralPaid
      );

      const todayCentralPaid = Math.min(
        grossAfterPreviousCentral,
        dailyRequirement.centralRequired
      );

      return {
        localRequired:
          position.localRequired +
          dailyRequirement.localRequired,

        centralRequired:
          position.centralRequired +
          dailyRequirement.centralRequired,

        localFunded:
          position.localFunded +
          previousLocalPaid +
          todayLocalPaid,

        centralFunded:
          position.centralFunded +
          previousCentralPaid +
          todayCentralPaid,

        localOutstanding: Math.max(
          0,
          position.localOutstanding +
            dailyRequirement.localRequired -
            previousLocalPaid -
            todayLocalPaid
        ),

        centralOutstanding: Math.max(
          0,
          position.centralOutstanding +
            dailyRequirement.centralRequired -
            previousCentralPaid -
            todayCentralPaid
        ),
      };
    },
    {
      localRequired: 0,
      centralRequired: 0,
      localFunded: 0,
      centralFunded: 0,
      localOutstanding:
        previousUnpaidLocalExpenses,
      centralOutstanding:
        previousUnpaidCentralExpenses,
    }
  );
    const selectedPeriodShopSales = sales.filter((sale) => {
  const saleShopId = String(
    sale?.shop_id || sale?.shopId || sale?.shopid || ''
  );

  const saleDateKey = String(
    sale?.date || sale?.created_at || ''
  ).slice(0, 10);

  return (
    saleShopId === shopId &&
    selectedPeriodDateKeys.includes(saleDateKey)
  );
});

    const salesTotal = selectedPeriodShopSales.reduce(
      (sum, sale) => sum + Number(sale?.total || 0),
      0
    );

    const replacementTotal = selectedPeriodShopSales.reduce((saleSum, sale) => {
      const items = Array.isArray(sale?.items) ? sale.items : [];

      return (
        saleSum +
        items.reduce((itemSum, item) => {
          const product = productById.get(String(item?.productId || ''));

          const quantity = Number(item?.quantity || 0);
          const buyPrice = Number(
            item?.buyPrice ||
              product?.buyPrice ||
              product?.buyingprice ||
              0
          );

          return itemSum + quantity * buyPrice;
        }, 0)
      );
    }, 0);

    const localMonthly = Number(
  shop?.remittanceLocalMonthly ||
    shop?.localMonthly ||
    shop?.fareElectricityMonthly ||
    0
);

    const shopPreviousRecords = remittanceRecords
  .filter((record) => {
    const recordDate = String(
      record?.date || ''
    ).slice(0, 10);

    return (
      String(record?.shop_id || record?.shopId || '') ===
        shopId &&
      recordDate >= AUTOMATIC_EXPENSE_ACTIVATION_DATE &&
      recordDate < todayKey
    );
  })
  .sort((a, b) =>
    String(a?.date || '').localeCompare(String(b?.date || ''))
  );

const previousBalance = shopPreviousRecords.reduce(
  (balance, record) => {
    const expected = Number(record?.expectedAmount || 0);
    const submitted = Number(record?.amountSent || 0);

    return Math.max(0, expected - submitted);
  },
  0
);

const todayRemittance = remittanceRecords.find(
  (record) =>
    String(record?.shop_id || record?.shopId || '') === shopId &&
    String(record?.date || '') === todayKey
);

const selectedMonthStartKey =
  `${todayKey.slice(0, 7)}-01`;

const effectiveMonthStartKey =
  selectedMonthStartKey <
  AUTOMATIC_EXPENSE_ACTIVATION_DATE
    ? AUTOMATIC_EXPENSE_ACTIVATION_DATE
    : selectedMonthStartKey;

const centralExpenseSetupEntries = Object.entries(
  MASTER_EXPENSE_SETUP[shopId]?.expenses || {}
).filter(([, expense]) => expense.location === 'owner');

const monthReplayDateKeys = getExpenseDateKeys(
  effectiveMonthStartKey,
  todayKey
);

const monthToDateExpensePosition =
  monthReplayDateKeys.reduce(
    (position, expenseDateKey) => {
      const dailyGrossProfit =
        getShopGrossProfitForDate(
          shopId,
          expenseDateKey
        );

      const dailyRequirement =
        getShopDailyExpenseRequirement(
          shopId,
          expenseDateKey
        );

      const totalLocalObligation =
        Number(position.localOutstanding || 0) +
        Number(dailyRequirement.localRequired || 0);

      const localAmountPaid = Math.min(
        dailyGrossProfit,
        totalLocalObligation
      );

      const grossAfterLocal = Math.max(
        0,
        dailyGrossProfit - localAmountPaid
      );

      const nextCentralOutstanding = {
        ...position.centralOutstanding,
      };

      centralExpenseSetupEntries.forEach(
        ([expenseKey, expense]) => {
          const requiredForDate =
            getExpenseRequiredAmountForDate(
              expense,
              expenseDateKey
            );

          nextCentralOutstanding[expenseKey] =
            Number(
              nextCentralOutstanding[expenseKey] || 0
            ) + requiredForDate;
        }
      );

      const nextFundedThisMonth = {
        ...position.fundedThisMonth,
      };

      let remainingCentralFunding =
        grossAfterLocal;

      centralExpenseSetupEntries.forEach(
        ([expenseKey]) => {
          const expenseOutstanding = Number(
            nextCentralOutstanding[expenseKey] || 0
          );

          const amountPaid = Math.min(
            remainingCentralFunding,
            expenseOutstanding
          );

          nextCentralOutstanding[expenseKey] =
            Math.max(
              0,
              expenseOutstanding - amountPaid
            );

          remainingCentralFunding = Math.max(
            0,
            remainingCentralFunding - amountPaid
          );

          if (
            expenseDateKey >= effectiveMonthStartKey
          ) {
            nextFundedThisMonth[expenseKey] =
              Number(
                nextFundedThisMonth[expenseKey] || 0
              ) + amountPaid;
          }
        }
      );

      return {
        localOutstanding: Math.max(
          0,
          totalLocalObligation - localAmountPaid
        ),
        centralOutstanding:
          nextCentralOutstanding,
        fundedThisMonth:
          nextFundedThisMonth,
      };
    },
    {
      localOutstanding: 0,
      centralOutstanding: {},
      fundedThisMonth: {},
    }
  );

const monthToDateCentralExpenseFunding =
  centralExpenseSetupEntries.map(
    ([expenseKey, expense]) => ({
      key: expenseKey,
      name: expense.name,
      frequency: expense.frequency,
      target: Number(expense.amount || 0),
      fundedThisMonth: Number(
        monthToDateExpensePosition
          .fundedThisMonth?.[expenseKey] || 0
      ),
      outstanding: Number(
        monthToDateExpensePosition
          .centralOutstanding?.[expenseKey] || 0
      ),
    })
  );

const calculatedPeriodShop = calculateShop({
  id: shopId,
  name: shop?.name || shopId,
  localMonthly,
  sales: salesTotal,
  replacement: replacementTotal,
  calculationDate: todayKey,
  manualExpenseFunds: Array.isArray(
    data?.remittanceExpenseFunds
  )
    ? data.remittanceExpenseFunds
    : [],
  monthToDateCentralExpenseFunding,
  previousUnpaidExpenses,
  previousUnpaidLocalExpenses,
  previousUnpaidCentralExpenses,
  submitted: Number(todayRemittance?.amountSent || 0),
  previous: previousBalance,
  localConfirmed: Boolean(todayRemittance?.localConfirmed),
});

const periodGrossProfit = Math.max(
  0,
  salesTotal - replacementTotal
);

const periodNetProfit = Math.max(
  0,
  periodGrossProfit -
    Number(selectedPeriodExpensePosition.localFunded || 0) -
    Number(selectedPeriodExpensePosition.centralFunded || 0)
);

/*
 * Build period totals from the authoritative daily calculation.
 * This preserves 70%/30% before 8 August and applies 75%/25%
 * only from 8 August onward, even where a report crosses the date.
 */
const periodProfitAllocation =
  selectedPeriodDateKeys.reduce(
    (total, dateKey) => {
      const dailyPosition =
        getLiveRemittanceShopPosition({
          data,
          shopId,
          calculationDateKey: dateKey,
        });

      return {
        ownerProfit:
          total.ownerProfit +
          Number(
            dailyPosition?.ownerProfitBeforeHomeExpenses ||
              dailyPosition?.ownerProfit ||
              0
          ),

        shopReserve:
          total.shopReserve +
          Number(dailyPosition?.shopReserve || 0),

        homeExpensesContributionCapacity:
          total.homeExpensesContributionCapacity +
          Number(
            dailyPosition?.homeExpensesContributionCapacity ||
              0
          ),
      };
    },
    {
      ownerProfit: 0,
      shopReserve: 0,
      homeExpensesContributionCapacity: 0,
    }
  );

const periodOwnerProfit =
  periodProfitAllocation.ownerProfit;

const periodShopReserve =
  periodProfitAllocation.shopReserve;

const periodHomeExpensesContributionCapacity =
  periodProfitAllocation.homeExpensesContributionCapacity;

const selectedPeriodShopGasEntries = (
  Array.isArray(data?.gasEntries)
    ? data.gasEntries
    : []
).filter((entry) => {
  const entryShopId = String(
    entry?.shop_id ||
      entry?.shopId ||
      ''
  );

  const entryDateKey = String(
    entry?.date ||
      entry?.created_at ||
      ''
  ).slice(0, 10);

  return (
    entryShopId === shopId &&
    selectedPeriodDateKeys.includes(entryDateKey) &&
    entry?.confirmed !== false
  );
});

const selectedPeriodGasSummary =
  getGasDashboardSummary(
    selectedPeriodShopGasEntries
  );

const gasProfit = Math.max(
  0,
  Number(selectedPeriodGasSummary?.totalProfit || 0)
);

const gasReserveAmount = gasProfit * 0.2;

const gasDistributableAmount = gasProfit * 0.8;

const normalOutstandingExpenses =
  Number(
    selectedPeriodExpensePosition.localOutstanding || 0
  ) +
  Number(
    selectedPeriodExpensePosition.centralOutstanding || 0
  );

const gasUsedForArrears = Math.min(
  gasDistributableAmount,
  normalOutstandingExpenses
);

const gasBalanceAfterArrears = Math.max(
  0,
  gasDistributableAmount - gasUsedForArrears
);

const gasOwnerProfit =
  gasBalanceAfterArrears * 0.5;

const gasHomeExpensesContribution =
  gasBalanceAfterArrears * 0.5;

return {
  ...calculatedPeriodShop,

  sales: salesTotal,
  replacement: replacementTotal,
  gross: periodGrossProfit,

  localRequired: Number(
    selectedPeriodExpensePosition.localRequired || 0
  ),

  centralRequired: Number(
    selectedPeriodExpensePosition.centralRequired || 0
  ),

  localFunded: Number(
    selectedPeriodExpensePosition.localFunded || 0
  ),

  centralExpense: Number(
    selectedPeriodExpensePosition.centralFunded || 0
  ),

  localExpensesStillOutstanding: Number(
    selectedPeriodExpensePosition.localOutstanding || 0
  ),

  centralExpensesStillOutstanding: Number(
    selectedPeriodExpensePosition.centralOutstanding || 0
  ),

  todayFixedExpenses:
    Number(selectedPeriodExpensePosition.localRequired || 0) +
    Number(selectedPeriodExpensePosition.centralRequired || 0),

  expensesFundedAutomatically:
    Number(selectedPeriodExpensePosition.localFunded || 0) +
    Number(selectedPeriodExpensePosition.centralFunded || 0),

  expensesStillOutstanding: Math.max(
  0,
  Number(selectedPeriodExpensePosition.localOutstanding || 0) +
    Number(selectedPeriodExpensePosition.centralOutstanding || 0) -
    gasUsedForArrears
),

netProfit: periodNetProfit,
ownerProfit: periodOwnerProfit,
ownerProfitBeforeHomeExpenses: periodOwnerProfit,
homeExpensesContributionCapacity:
  periodHomeExpensesContributionCapacity,
shopReserve: periodShopReserve,

gasProfit,
gasReserveAmount,
gasDistributableAmount,
gasUsedForArrears,
gasBalanceAfterArrears,
gasOwnerProfit,
gasHomeExpensesContribution,

normalAmountRequiredToSubmit:
  Number(selectedPeriodExpensePosition.centralFunded || 0) +
  periodOwnerProfit,

amountRequiredToSubmit:
  Number(selectedPeriodExpensePosition.centralFunded || 0) +
  periodOwnerProfit +
  gasDistributableAmount,

cashAmountRequiredToSubmit: roundToCashStep(
  Number(selectedPeriodExpensePosition.centralFunded || 0) +
    periodOwnerProfit +
    gasDistributableAmount
),

cashRoundingAdjustment: Math.max(
  0,
  roundToCashStep(
    Number(selectedPeriodExpensePosition.centralFunded || 0) +
      periodOwnerProfit +
      gasDistributableAmount
  ) -
    (
      Number(selectedPeriodExpensePosition.centralFunded || 0) +
      periodOwnerProfit +
      gasDistributableAmount
    )
),

expectedHome:
  Number(selectedPeriodExpensePosition.centralFunded || 0) +
  periodOwnerProfit +
  gasDistributableAmount +
  Number(previousBalance || 0),

outstanding: Math.max(
  0,
  Number(selectedPeriodExpensePosition.centralFunded || 0) +
    periodOwnerProfit +
    gasDistributableAmount +
    Number(previousBalance || 0) -
    Number(todayRemittance?.amountSent || 0)
),
};
  });
}, [
  data?.shops,
  data?.sales,
data?.products,
data?.gasEntries,
data?.dailyRemittances,
reportPreset,
  reportDate,
  reportStartDate,
  reportEndDate,
]);
useEffect(() => {
  if (resolvedShopId) {
    setSelectedShopId(resolvedShopId);
    return;
  }

  if (!selectedShopId && rows.length > 0) {
    setSelectedShopId(rows[0].id);
  }
}, [resolvedShopId, rows, selectedShopId]);
  const selectedShop =
  rows.find((row) => row.id === selectedShopId) ||
  rows[0] || {
    id: '',
    name: '',
    sales: 0,
    replacement: 0,
    gross: 0,
    localRequired: 0,
    localFunded: 0,
    centralExpense: 0,
    netProfit: 0,
    ownerProfit: 0,
    shopReserve: 0,
    expectedHome: 0,
    submitted: 0,
    previous: 0,
    outstanding: 0,
    localConfirmed: false,
  };

  const totals = useMemo(
  () =>
    rows.reduce(
      (acc, row) => ({
        sales:
          acc.sales + Number(row.sales || 0),

        replacement:
          acc.replacement + Number(row.replacement || 0),

        gross:
          acc.gross + Number(row.gross || 0),

        previousUnpaidExpenses:
          acc.previousUnpaidExpenses +
          Number(row.previousUnpaidExpenses || 0),

        todayFixedExpenses:
          acc.todayFixedExpenses +
          Number(row.todayFixedExpenses || 0),

        expensesFundedAutomatically:
          acc.expensesFundedAutomatically +
          Number(row.expensesFundedAutomatically || 0),

        expensesStillOutstanding:
          acc.expensesStillOutstanding +
          Number(row.expensesStillOutstanding || 0),

        amountRequiredToSubmit:
          acc.amountRequiredToSubmit +
          Number(row.amountRequiredToSubmit || 0),
          cashAmountRequiredToSubmit:
  acc.cashAmountRequiredToSubmit +
  Number(
    row.cashAmountRequiredToSubmit ||
      row.amountRequiredToSubmit ||
      0
  ),

cashRoundingAdjustment:
  acc.cashRoundingAdjustment +
  Number(row.cashRoundingAdjustment || 0),
      }),
      {
        sales: 0,
        replacement: 0,
        gross: 0,
        previousUnpaidExpenses: 0,
        todayFixedExpenses: 0,
        expensesFundedAutomatically: 0,
        expensesStillOutstanding: 0,
        amountRequiredToSubmit: 0,
        cashAmountRequiredToSubmit: 0,
cashRoundingAdjustment: 0,
      }
    ),
  [rows]
);

const monthlyExpenseRows = useMemo(() => {
  return rows.flatMap((shopRow) => {
    const monthFundingBreakdown = Array.isArray(
      shopRow.monthToDateCentralExpenseFunding
    )
      ? shopRow.monthToDateCentralExpenseFunding
      : [];

    let remainingGasSupplementForCentralExpenses =
      Math.max(
        0,
        Number(shopRow.gasUsedForArrears || 0) -
          Number(
            shopRow.localExpensesStillOutstanding || 0
          )
      );

    return monthFundingBreakdown.map((expense) => {
      const targetAmount = Number(expense.target || 0);

      const calculationDateKey = String(
        shopRow.calculationDate || ''
      );

      const [selectedYear, selectedMonth, selectedDay] =
        calculationDateKey.split('-').map(Number);

      const daysInSelectedMonth =
        selectedYear && selectedMonth
          ? new Date(
              selectedYear,
              selectedMonth,
              0
            ).getDate()
          : 0;

      const selectedMonthStartKey = calculationDateKey
        ? `${calculationDateKey.slice(0, 7)}-01`
        : '';

      const firstActiveDay =
        selectedMonthStartKey <
          AUTOMATIC_EXPENSE_ACTIVATION_DATE &&
        calculationDateKey.startsWith(
          AUTOMATIC_EXPENSE_ACTIVATION_DATE.slice(
            0,
            7
          )
        )
          ? Number(
              AUTOMATIC_EXPENSE_ACTIVATION_DATE.slice(
                8,
                10
              )
            )
          : 1;

      const activeDaysUpToSelectedDate =
        selectedDay >= firstActiveDay
          ? selectedDay - firstActiveDay + 1
          : 0;

      const requiredThisMonthToDate =
        expense.frequency === 'daily'
          ? targetAmount * activeDaysUpToSelectedDate
          : expense.frequency === 'monthly'
            ? daysInSelectedMonth > 0
              ? (targetAmount / daysInSelectedMonth) *
                activeDaysUpToSelectedDate
              : 0
            : expense.frequency === 'six_months'
              ? daysInSelectedMonth > 0
                ? (targetAmount /
                    (daysInSelectedMonth * 6)) *
                  activeDaysUpToSelectedDate
                : 0
              : 0;

      const fundedThisMonthRaw = Number(
        expense.fundedThisMonth || 0
      );

      const ordinaryFundedRaw = Math.min(
        Math.max(0, requiredThisMonthToDate),
        Math.max(0, fundedThisMonthRaw)
      );

      const ordinaryOutstandingRaw = Math.max(
        0,
        requiredThisMonthToDate - ordinaryFundedRaw
      );

      const gasSupplementRaw = Math.min(
        ordinaryOutstandingRaw,
        remainingGasSupplementForCentralExpenses
      );

      remainingGasSupplementForCentralExpenses =
        Math.max(
          0,
          remainingGasSupplementForCentralExpenses -
            gasSupplementRaw
        );

      const totalFundedRaw =
        ordinaryFundedRaw + gasSupplementRaw;

      const requiredRounded = roundToCashStep(
        requiredThisMonthToDate
      );

      const fundedRounded = Math.min(
        requiredRounded,
        roundToCashStep(totalFundedRaw)
      );

      const outstandingRounded = Math.max(
        0,
        requiredRounded - fundedRounded
      );

      return {
        id: `${shopRow.id}-${expense.key}-monthly`,
        shop_id: shopRow.id,
        shop: shopRow.name,
        expenseKey: expense.key,
        expense: expense.name,
        frequency: expense.frequency,
        target: targetAmount,
        requiredThisMonthToDate: requiredRounded,
        ordinaryFundedThisMonth:
          roundToCashStep(ordinaryFundedRaw),
        gasSupplement: roundToCashStep(gasSupplementRaw),
        fundedThisMonth: fundedRounded,
        outstanding: outstandingRounded,
      };
    });
  });
}, [rows]);
const monthlyExpenseTotals = useMemo(() => {
  return monthlyExpenseRows.reduce(
    (acc, row) => ({
      configured:
        acc.configured + Number(row.target || 0),

      required:
        acc.required +
        Number(row.requiredThisMonthToDate || 0),

      funded:
        acc.funded + Number(row.fundedThisMonth || 0),

      outstanding:
        acc.outstanding + Number(row.outstanding || 0),
    }),
    {
      configured: 0,
      required: 0,
      funded: 0,
      outstanding: 0,
    }
  );
}, [monthlyExpenseRows]);
const monthlyExpenseSummaryByShop = useMemo(() => {
  const shopMap = new Map();

  monthlyExpenseRows.forEach((row) => {
    const shopId = String(row.shop_id || '').trim();

    if (!shopId) return;

    const existing = shopMap.get(shopId) || {
      shop_id: shopId,
      shop: row.shop || shopId,
      required: 0,
      funded: 0,
      outstanding: 0,
    };

    existing.required += Number(row.requiredThisMonthToDate || 0);
    existing.funded += Number(row.fundedThisMonth || 0);
    existing.outstanding += Number(row.outstanding || 0);

    shopMap.set(shopId, existing);
  });

  return new Map(
    Array.from(shopMap.entries()).map(([shopId, row]) => [
      shopId,
      {
        ...row,
        required: roundToCashStep(row.required),
        funded: roundToCashStep(row.funded),
        outstanding: roundToCashStep(row.outstanding),
      },
    ])
  );
}, [monthlyExpenseRows]);
const monthlyExpenseShortageByShop = useMemo(() => {
  const shopMap = new Map();

  monthlyExpenseRows.forEach((row) => {
    const shopId = String(row.shop_id || '').trim();

    if (!shopId) return;

    const existing = shopMap.get(shopId) || {
      shop_id: shopId,
      shop: row.shop || shopId,
      required: 0,
      funded: 0,
      outstanding: 0,
    };

    existing.required += Number(row.requiredThisMonthToDate || 0);
    existing.funded += Number(row.fundedThisMonth || 0);
    existing.outstanding += Number(row.outstanding || 0);

    shopMap.set(shopId, existing);
  });

  return Array.from(shopMap.values())
    .map((row) => ({
      ...row,
      required: roundToCashStep(row.required),
      funded: roundToCashStep(row.funded),
      outstanding: roundToCashStep(row.outstanding),
    }))
    .filter((row) => Number(row.outstanding || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.outstanding || 0) -
        Number(a.outstanding || 0)
    );
}, [monthlyExpenseRows]);
const alignedLedgerFundAccounts = useMemo(() => {
  const monthlyExpenseFundingMap = new Map();

  monthlyExpenseRows.forEach((row) => {
    const fundKey = `${row.shop_id}-${row.expenseKey}`;

    monthlyExpenseFundingMap.set(fundKey, {
      funded: roundToCashStep(row.fundedThisMonth),
      outstanding: roundToCashStep(row.outstanding),
      required: roundToCashStep(row.requiredThisMonthToDate),
    });
  });

  return commissionAdjustedCentralFundAccounts.map((account) => {
    const accountKey = String(account?.key || '').trim();

    const monthlyExpenseFunding =
      monthlyExpenseFundingMap.get(accountKey);

    if (
      String(account?.type || '') !== 'expense_fund' ||
      !monthlyExpenseFunding
    ) {
      return account;
    }

    const alignedBaseAmount = Math.max(
      0,
      Number(monthlyExpenseFunding.funded || 0)
    );

    const moneyIn = Math.max(
      0,
      Number(account?.moneyIn || 0)
    );

    const moneyOut = Math.max(
      0,
      Number(account?.moneyOut || 0)
    );

    const automaticCommissionAmount = Math.max(
      0,
      Number(account?.automaticCommissionAmount || 0)
    );

    return {
      ...account,
      baseAmount: alignedBaseAmount,
      moneyIn,
      moneyOut,
      automaticCommissionAmount,
      availableBalance: Math.max(
        0,
        alignedBaseAmount +
          moneyIn +
          automaticCommissionAmount -
          moneyOut
      ),
    };
  });
}, [
  commissionAdjustedCentralFundAccounts,
  monthlyExpenseRows,
]);

const consolidatedExpenseFundOptions = useMemo(() => {
  const categoryMap = new Map();

  alignedLedgerFundAccounts
    .filter(
      (account) =>
        account?.type === 'expense_fund' &&
        Number(account?.availableBalance || 0) > 0
    )
    .forEach((account) => {
      const categoryName = String(
        account?.name || 'Expense Fund'
      ).trim();

      const existingCategory =
        categoryMap.get(categoryName) || {
          key: `consolidated:${categoryName}`,
          name: categoryName,
          type: 'consolidated_expense_fund',
          availableBalance: 0,
          accounts: [],
        };

      existingCategory.availableBalance += Math.max(
        0,
        Number(account?.availableBalance || 0)
      );

      existingCategory.accounts.push(account);

      categoryMap.set(categoryName, existingCategory);
    });

  return Array.from(categoryMap.values()).sort(
    (firstCategory, secondCategory) =>
      firstCategory.name.localeCompare(
        secondCategory.name
      )
  );
}, [alignedLedgerFundAccounts]);

const ownerProfitAccount = useMemo(() => {
  return (
    alignedLedgerFundAccounts.find(
      (account) =>
        String(account?.key || '') === 'owner-profit'
    ) || {
      key: 'owner-profit',
      type: 'owner_profit',
      name:
        language === 'sw'
          ? 'Faida ya Mmiliki'
          : 'Owner Profit',
      baseAmount: 0,
      moneyIn: 0,
      moneyOut: 0,
      automaticCommissionAmount: 0,
      availableBalance: 0,
    }
  );
}, [alignedLedgerFundAccounts, language]);
/*
 * One authoritative Home Expenses funding source:
 * - Before 8 August: preserve the original confirmed calculation.
 * - From 8 August: read the live pooled shop and gas allocations.
 */
const automaticPooledHomeExpensesFunding = useMemo(() => {
  const now = new Date();

  const todayKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const monthStartKey = `${todayKey.slice(0, 7)}-01`;

  const startKey =
    monthStartKey < AUTOMATIC_EXPENSE_ACTIVATION_DATE
      ? AUTOMATIC_EXPENSE_ACTIVATION_DATE
      : monthStartKey;

  const fundingDateKeys = getExpenseDateKeys(
    startKey,
    todayKey
  );

  const poolShops = Array.isArray(data?.shops)
    ? data.shops
    : [];

  return fundingDateKeys.reduce(
    (periodTotal, dateKey) => {
      return poolShops.reduce(
        (dayTotal, shop) => {
          const shopId = String(
            shop?.id || ''
          ).trim();

          if (!shopId) return dayTotal;

          const position =
            getLiveRemittanceShopPosition({
              data,
              shopId,
              calculationDateKey: dateKey,
            });

          if (
            dateKey <
            HOME_EXPENSES_PERFORMANCE_START_DATE
          ) {
            const legacyHomeFunding = (
              Array.isArray(
                position?.centralExpenseFundingBreakdown
              )
                ? position.centralExpenseFundingBreakdown
                : []
            )
              .filter(
                (expense) =>
                  expense?.isHomeExpenses === true ||
                  String(expense?.key || '') ===
                    'homeExpenses'
              )
              .reduce(
                (sum, expense) =>
                  sum +
                  Math.max(
                    0,
                    Number(expense?.amountFunded || 0)
                  ),
                0
              );

            return {
              shopContribution:
                dayTotal.shopContribution +
                legacyHomeFunding,

              gasContribution:
                dayTotal.gasContribution +
                Math.max(
                  0,
                  Number(
                    position?.gasHomeExpensesContribution ||
                      0
                  )
                ),
            };
          }

          return {
            shopContribution:
              dayTotal.shopContribution +
              Math.max(
                0,
                Number(
                  position?.shopHomeExpensesContribution ||
                    0
                )
              ),

            gasContribution:
              dayTotal.gasContribution +
              Math.max(
                0,
                Number(
                  position
                    ?.pooledGasHomeExpensesContribution ||
                    0
                )
              ),
          };
        },
        periodTotal
      );
    },
    {
      shopContribution: 0,
      gasContribution: 0,
    }
  );
}, [
  data,
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
  data?.dailyRemittances,
]);

/*
 * Save today's live Home Expenses contribution as an authoritative snapshot.
 * Today's snapshot may update as performance changes. Previous dates remain fixed.
 */
useEffect(() => {
  const todayKey = new Date().toISOString().slice(0, 10);

  const snapshotShops =
    resolvedRole === 'owner'
      ? Array.isArray(data?.shops)
        ? data.shops
        : []
      : (Array.isArray(data?.shops) ? data.shops : []).filter(
          (shop) =>
            String(shop?.id || '').trim() ===
            String(resolvedShopId || '').trim()
        );

  const snapshotRows = snapshotShops.flatMap((shop) => {
    const shopId = String(shop?.id || '').trim();

    if (!shopId) return [];

    const position = getLiveRemittanceShopPosition({
      data,
      shopId,
      calculationDateKey: todayKey,
    });

    const shopContribution = Math.max(
      0,
      Number(position?.shopHomeExpensesContribution || 0)
    );

    const gasContribution = Math.max(
      0,
      Number(position?.pooledGasHomeExpensesContribution || 0)
    );

    const now = new Date().toISOString();
    const shopName = String(shop?.name || shopId);

    return [
      {
        id: `home-funding-shop-${todayKey}-${shopId}`,
        transaction_type: 'home_expense_shop_snapshot',
        transaction_date: todayKey,
        source_fund_type: 'shop_profit',
        source_fund_key: `shop-profit-${shopId}`,
        source_fund_name: `${shopName} Profit`,
        source_shop_id: shopId,
        source_shop_name: shopName,
        destination_fund_type: 'home_expenses_fund',
        destination_fund_key: 'homeExpenses',
        destination_fund_name: 'Home Expenses Fund',
        expense_key: 'homeExpenses',
        expense_name: 'Home Expenses',
        amount: shopContribution,
        purpose: 'Live daily shop contribution snapshot',
        status: 'snapshot',
        updated_at: now,
      },
      {
        id: `home-funding-gas-${todayKey}-${shopId}`,
        transaction_type: 'home_expense_gas_snapshot',
        transaction_date: todayKey,
        source_fund_type: 'gas_profit',
        source_fund_key: `gas-profit-${shopId}`,
        source_fund_name: `${shopName} Gas Profit`,
        source_shop_id: shopId,
        source_shop_name: shopName,
        destination_fund_type: 'home_expenses_fund',
        destination_fund_key: 'homeExpenses',
        destination_fund_name: 'Home Expenses Fund',
        expense_key: 'homeExpenses',
        expense_name: 'Home Expenses',
        amount: gasContribution,
        purpose: 'Live daily gas contribution snapshot',
        status: 'snapshot',
        updated_at: now,
      },
    ];
  });

  if (snapshotRows.length === 0) return;

  const snapshotSignature = snapshotRows
    .map((row) => `${row.id}:${Number(row.amount || 0).toFixed(2)}`)
    .join('|');

  if (
    homeFundingSnapshotSaveRef.current.get(todayKey) ===
    snapshotSignature
  ) {
    return;
  }

  homeFundingSnapshotSaveRef.current.set(
    todayKey,
    snapshotSignature
  );

  let cancelled = false;

  const saveSnapshots = async () => {
    const { data: savedRows, error } = await supabase
      .from('centralFundTransactions')
      .upsert(snapshotRows, { onConflict: 'id' })
      .select();

    if (cancelled) return;

    if (error) {
      homeFundingSnapshotSaveRef.current.delete(todayKey);
      console.error(
        'Home Expenses contribution snapshot failed:',
        error
      );
      return;
    }

    const savedIds = new Set(
      snapshotRows.map((row) => String(row.id))
    );

    const existingTransactions = Array.isArray(
      data?.centralFundTransactions
    )
      ? data.centralFundTransactions
      : [];

    const nextTransactions = [
      ...(Array.isArray(savedRows) ? savedRows : snapshotRows),
      ...existingTransactions.filter(
        (transaction) =>
          !savedIds.has(String(transaction?.id || ''))
      ),
    ];

    await saveData({
      ...data,
      centralFundTransactions: nextTransactions,
    });
  };

  saveSnapshots();

  return () => {
    cancelled = true;
  };
}, [
  data,
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
  data?.dailyRemittances,
  resolvedRole,
  resolvedShopId,
  saveData,
]);
const automaticShopHomeExpensesContribution =
  automaticPooledHomeExpensesFunding.shopContribution;

const combinedHomeExpensesFundingSummary = useMemo(() => {
  const shopContribution = Math.max(
    0,
    Number(
      automaticShopHomeExpensesContribution || 0
    )
  );

  const remainingAfterShopContribution = Math.max(
    0,
    Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0) -
      shopContribution
  );

const calculatedGasHomeExpensesContribution =
  Math.max(
    0,
    Number(
      automaticPooledHomeExpensesFunding.gasContribution ||
        0
    )
  );

  const gasContribution = Math.min(
    remainingAfterShopContribution,
    Math.max(
      0,
      calculatedGasHomeExpensesContribution
    )
  );

  const combinedCommissionContribution =
  (
    eligibleCurrentMonthCommissionAllocation
      ?.rows || []
  )
    .filter(
      (row) =>
        String(row?.expenseKey || '') ===
        'homeExpenses'
    )
    .reduce(
      (total, row) =>
        total +
        Math.max(
          0,
          Number(
            row?.commissionAllocated || 0
          )
        ),
      0
    );

  const totalConfirmedFunding = Math.min(
    Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0),
    shopContribution +
      gasContribution +
      combinedCommissionContribution
  );

  const remainingBalance = Math.max(
    0,
    Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0) -
      totalConfirmedFunding
  );

  return {
    monthlyTarget: Number(
      HOME_EXPENSES_MONTHLY_BUDGET.target || 0
    ),
    shopContribution,
    gasContribution,
    combinedCommissionContribution,
    totalConfirmedFunding,
    remainingBalance,
    fundingPercentage:
      Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0) > 0
        ? Math.min(
            100,
            (totalConfirmedFunding /
              Number(
                HOME_EXPENSES_MONTHLY_BUDGET.target || 0
              )) *
              100
          )
        : 0,
  };
}, [
  automaticShopHomeExpensesContribution,
  automaticPooledHomeExpensesFunding,
  rows,
  previousMonthCombinedCommissionAllocation,
]);
const homeExpensesFullyFunded =
  Number(
    combinedHomeExpensesFundingSummary?.remainingBalance || 0
  ) <= 0;

const localExpenseRows = useMemo(() => {
  return rows.flatMap((shopRow) => {
    const fundingBreakdown = Array.isArray(
      shopRow.localExpenseFundingBreakdown
    )
      ? shopRow.localExpenseFundingBreakdown
      : [];

    return fundingBreakdown.map((expense) => ({
      id: `${shopRow.id}-${expense.key}-local`,
      shop_id: shopRow.id,
      shop: shopRow.name,
      expenseKey: expense.key,
      expense: expense.name,
      requiredToday: Number(
        expense.requiredToday || 0
      ),
      fundedToday: Number(
        expense.amountFunded || 0
      ),
      outstandingToday: Number(
        expense.amountOutstanding || 0
      ),
    }));
  });
}, [rows]);

const simpleIncomeExpenseSummary = useMemo(() => {
  const now = new Date();

  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;

  const currentMonthStartKey = `${currentMonthKey}-01`;

  const summaryStartKey =
    currentMonthStartKey < AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
      ? AUTOMATIC_EXPENSE_OFFICIAL_START_DATE
      : currentMonthStartKey;

  const todayKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(now.getDate()).padStart(
    2,
    '0'
  )}`;

  const dateKeys = getExpenseDateKeys(
    summaryStartKey,
    todayKey
  );

  const [summaryYear, summaryMonth] = currentMonthKey
    .split('-')
    .map(Number);

  const daysInMonth =
    summaryYear && summaryMonth
      ? new Date(summaryYear, summaryMonth, 0).getDate()
      : 0;

  const shops = Array.isArray(data?.shops)
    ? data.shops
    : [];

  const sales = Array.isArray(data?.sales)
    ? data.sales
    : [];

  const products = Array.isArray(data?.products)
    ? data.products
    : [];

  const gasEntries = Array.isArray(data?.gasEntries)
    ? data.gasEntries
    : [];

  const transactions = Array.isArray(
    data?.centralFundTransactions
  )
    ? data.centralFundTransactions
    : [];

  const productById = new Map(
    products.map((product) => [
      String(product?.id || ''),
      product,
    ])
  );

  const expenseOrder = [
    'salary',
    'rent',
    'homeExpenses',
    'medical',
    'tra',
    'dataBundle',
  ];

  const expenseTotalsMap = new Map();

  const getExpenseDisplayName = (
    expenseKey,
    fallbackName
  ) => {
    if (language !== 'sw') {
      return fallbackName || expenseKey;
    }

    const swLabels = {
      salary: 'Mishahara',
      rent: 'Kodi',
      homeExpenses: 'Matumizi ya Nyumbani',
      medical: 'Matibabu',
      tra: 'TRA',
      dataBundle: 'Bando la Intaneti',
    };

    return swLabels[expenseKey] || fallbackName || expenseKey;
  };

  const ensureExpenseRow = (expenseKey, expense = {}) => {
    const cleanExpenseKey = String(expenseKey || '').trim();

    if (!cleanExpenseKey) return null;

    if (!expenseTotalsMap.has(cleanExpenseKey)) {
      expenseTotalsMap.set(cleanExpenseKey, {
        key: cleanExpenseKey,
        name: expense?.name || cleanExpenseKey,
        monthlyTarget: 0,
        fromShops: 0,
        fromGas: 0,
        fromCommission: 0,
        used: 0,
      });
    }

    return expenseTotalsMap.get(cleanExpenseKey);
  };

  const getMonthlyTargetAmount = (expense) => {
    const amount = Math.max(
      0,
      Number(expense?.amount || 0)
    );

    if (expense?.frequency === 'daily') {
      return amount * daysInMonth;
    }

    if (expense?.frequency === 'monthly') {
      return amount;
    }

    if (expense?.frequency === 'six_months') {
      return amount / 6;
    }

    return amount;
  };

  Object.entries(MASTER_EXPENSE_SETUP).forEach(
    ([, shopSetup]) => {
      Object.entries(shopSetup?.expenses || {})
        .filter(
          ([, expense]) =>
            expense?.location === 'owner'
        )
        .forEach(([expenseKey, expense]) => {
          const row = ensureExpenseRow(expenseKey, expense);

          if (!row) return;

          if (expenseKey === 'homeExpenses') {
            return;
          }

          row.monthlyTarget += getMonthlyTargetAmount(expense);
        });
    }
  );

  const homeExpensesRow = ensureExpenseRow('homeExpenses', {
    name: 'Home Expenses',
  });

  if (homeExpensesRow) {
    homeExpensesRow.monthlyTarget = Math.max(
      0,
      Number(HOME_EXPENSES_MONTHLY_BUDGET.target || 0)
    );
  }

  const getShopSalesPositionForDate = (
    shopId,
    dateKey
  ) => {
    const dateSales = sales.filter((sale) => {
      const saleShopId = String(
        sale?.shop_id ||
          sale?.shopId ||
          sale?.shopid ||
          ''
      ).trim();

      const saleDateKey = String(
        sale?.date ||
          sale?.created_at ||
          ''
      ).slice(0, 10);

      return (
        saleShopId === String(shopId) &&
        saleDateKey === dateKey
      );
    });

    const salesAmount = dateSales.reduce(
      (sum, sale) => sum + Number(sale?.total || 0),
      0
    );

    const replacementAmount = dateSales.reduce(
      (saleTotal, sale) => {
        const items = Array.isArray(sale?.items)
          ? sale.items
          : [];

        return (
          saleTotal +
          items.reduce((itemTotal, item) => {
            const product = productById.get(
              String(item?.productId || '')
            );

            const quantity = Number(item?.quantity || 0);

            const buyPrice = Number(
              item?.buyPrice ||
                product?.buyPrice ||
                product?.buyingprice ||
                0
            );

            return itemTotal + quantity * buyPrice;
          }, 0)
        );
      },
      0
    );

    return {
      salesAmount,
      replacementAmount,
      grossProfit: Math.max(
        0,
        salesAmount - replacementAmount
      ),
    };
  };

  const getGasDistributableForDate = (
    shopId,
    dateKey
  ) => {
    const matchingGasEntries = gasEntries.filter((entry) => {
      const entryShopId = String(
        entry?.shop_id ||
          entry?.shopId ||
          ''
      ).trim();

      const entryDateKey = String(
        entry?.date ||
          entry?.created_at ||
          ''
      ).slice(0, 10);

      return (
        entryShopId === String(shopId) &&
        entryDateKey === dateKey &&
        entry?.confirmed !== false
      );
    });

    const gasSummary = getGasDashboardSummary(
      matchingGasEntries
    );

    const gasProfit = Math.max(
      0,
      Number(gasSummary?.totalProfit || 0)
    );

    return gasProfit * 0.8;
  };

  let totalSales = 0;
  let productReplacement = 0;
  let grossProfit = 0;
  let ownerProfitAccumulated = 0;

  const shopSummaryRows = [];

  shops.forEach((shop) => {
    const shopId = String(shop?.id || '').trim();

    if (!shopId) return;

    const shopSummary = {
      id: shopId,
      name:
        shop?.name ||
        MASTER_EXPENSE_SETUP[shopId]?.shopName ||
        shopId,
      totalSales: 0,
      productReplacement: 0,
      grossProfit: 0,
      fromShops: 0,
      fromGas: 0,
      ownerProfit: 0,
    };

    const expenseEntries = Object.entries(
      MASTER_EXPENSE_SETUP[shopId]?.expenses || {}
    );

    const localExpenseEntries = expenseEntries.filter(
      ([, expense]) => expense?.location === 'shop'
    );

    const centralExpenseEntries = expenseEntries.filter(
      ([, expense]) => expense?.location === 'owner'
    );

    const localArrears = new Map(
      localExpenseEntries.map(([expenseKey]) => [
        expenseKey,
        0,
      ])
    );

    const centralArrears = new Map(
      centralExpenseEntries.map(([expenseKey]) => [
        expenseKey,
        0,
      ])
    );

    dateKeys.forEach((dateKey) => {
            /*
       * Historical dates retain fixed Home Expenses.
       * From 8 August, this summary must use only non-home
       * central expenses; pooled Home funding is added separately.
       */
      const applicableCentralExpenseEntriesForDate =
        dateKey >= HOME_EXPENSES_PERFORMANCE_START_DATE
          ? centralExpenseEntries.filter(
              ([expenseKey]) =>
                expenseKey !== 'homeExpenses'
            )
          : centralExpenseEntries;
          
      const daySalesPosition =
        getShopSalesPositionForDate(shopId, dateKey);

      totalSales += Number(
        daySalesPosition.salesAmount || 0
      );

      productReplacement += Number(
        daySalesPosition.replacementAmount || 0
      );

      grossProfit += Number(
        daySalesPosition.grossProfit || 0
      );

      shopSummary.totalSales += Number(
        daySalesPosition.salesAmount || 0
      );

      shopSummary.productReplacement += Number(
        daySalesPosition.replacementAmount || 0
      );

      shopSummary.grossProfit += Number(
        daySalesPosition.grossProfit || 0
      );

      let availableGross = Number(
        daySalesPosition.grossProfit || 0
      );

      const payUsingShopGross = (
        entriesToPay,
        arrearsMap,
        recordCentralFunding
      ) => {
        entriesToPay.forEach(([expenseKey, expense]) => {
          if (availableGross <= 0) return;

          const outstandingAmount = Math.max(
            0,
            Number(arrearsMap.get(expenseKey) || 0)
          );

          const amountPaid = Math.min(
            availableGross,
            outstandingAmount
          );

          if (amountPaid <= 0) return;

          availableGross = Math.max(
            0,
            availableGross - amountPaid
          );

          arrearsMap.set(
            expenseKey,
            Math.max(0, outstandingAmount - amountPaid)
          );

          if (recordCentralFunding) {
            const row = ensureExpenseRow(
              expenseKey,
              expense
            );

            if (row) {
              row.fromShops += amountPaid;
              shopSummary.fromShops += amountPaid;
            }
          }
        });
      };

      const addTodayObligations = (
        entriesToAdd,
        arrearsMap
      ) => {
        entriesToAdd.forEach(([expenseKey, expense]) => {
          const requiredAmount = Math.max(
            0,
            Number(
              getExpenseRequiredAmountForDate(
                expense,
                dateKey
              ) || 0
            )
          );

          arrearsMap.set(
            expenseKey,
            Number(arrearsMap.get(expenseKey) || 0) +
              requiredAmount
          );
        });
      };

      payUsingShopGross(
        localExpenseEntries,
        localArrears,
        false
      );

      addTodayObligations(
        localExpenseEntries,
        localArrears
      );

      payUsingShopGross(
        localExpenseEntries,
        localArrears,
        false
      );

      payUsingShopGross(
        applicableCentralExpenseEntriesForDate,
        centralArrears,
        true
      );

      addTodayObligations(
        applicableCentralExpenseEntriesForDate,
        centralArrears
      );

      payUsingShopGross(
        applicableCentralExpenseEntriesForDate,
        centralArrears,
        true
      );

      /*
       * Read owner profit from the authoritative daily position.
       * This preserves historical 70%/30% and applies the new
       * 75%/25% plus pooled Home Expenses rules from 8 August.
       */
      const authoritativeDayPosition =
        getLiveRemittanceShopPosition({
          data,
          shopId,
          calculationDateKey: dateKey,
        });

      const ownerProfitFromShopSales = Math.max(
        0,
        Number(
          authoritativeDayPosition?.ownerProfit || 0
        )
      );

      ownerProfitAccumulated +=
        ownerProfitFromShopSales;

      shopSummary.ownerProfit +=
        ownerProfitFromShopSales;

      let gasAvailable = getGasDistributableForDate(
        shopId,
        dateKey
      );

      localExpenseEntries.forEach(([expenseKey]) => {
        if (gasAvailable <= 0) return;

        const outstandingAmount = Math.max(
          0,
          Number(localArrears.get(expenseKey) || 0)
        );

        const gasUsed = Math.min(
          gasAvailable,
          outstandingAmount
        );

        if (gasUsed <= 0) return;

        gasAvailable = Math.max(0, gasAvailable - gasUsed);

        localArrears.set(
          expenseKey,
          Math.max(0, outstandingAmount - gasUsed)
        );
      });

      applicableCentralExpenseEntriesForDate.forEach(
        ([expenseKey, expense]) => {
          if (gasAvailable <= 0) return;

          const outstandingAmount = Math.max(
            0,
            Number(centralArrears.get(expenseKey) || 0)
          );

          const gasUsed = Math.min(
            gasAvailable,
            outstandingAmount
          );

          if (gasUsed <= 0) return;

          gasAvailable = Math.max(0, gasAvailable - gasUsed);

          centralArrears.set(
            expenseKey,
            Math.max(0, outstandingAmount - gasUsed)
          );

          const row = ensureExpenseRow(
            expenseKey,
            expense
          );

          if (row) {
            row.fromGas += gasUsed;
            shopSummary.fromGas += gasUsed;
          }
        }
      );

      /*
       * Use the same authoritative pooled allocations already used
       * by the dashboards and Home Expenses section.
       */
      const gasOwnerProfit = Math.max(
        0,
        Number(
          authoritativeDayPosition?.gasOwnerProfit || 0
        )
      );

      const shopHomeExpensesContribution =
        dateKey >= HOME_EXPENSES_PERFORMANCE_START_DATE
          ? Math.max(
              0,
              Number(
                authoritativeDayPosition
                  ?.shopHomeExpensesContribution || 0
              )
            )
          : 0;

      const gasHomeExpensesContribution =
        dateKey >= HOME_EXPENSES_PERFORMANCE_START_DATE
          ? Math.max(
              0,
              Number(
                authoritativeDayPosition
                  ?.pooledGasHomeExpensesContribution || 0
              )
            )
          : Math.max(
              0,
              Number(
                authoritativeDayPosition
                  ?.gasHomeExpensesContribution || 0
              )
            );

      ownerProfitAccumulated += gasOwnerProfit;
      shopSummary.ownerProfit += gasOwnerProfit;

      if (shopHomeExpensesContribution > 0) {
        const row = ensureExpenseRow('homeExpenses', {
          name: 'Home Expenses',
        });

        if (row) {
          row.fromShops +=
            shopHomeExpensesContribution;

          shopSummary.fromShops +=
            shopHomeExpensesContribution;
        }
      }

      if (gasHomeExpensesContribution > 0) {
        const row = ensureExpenseRow('homeExpenses', {
          name: 'Home Expenses',
        });

        if (row) {
          row.fromGas +=
            gasHomeExpensesContribution;

          shopSummary.fromGas +=
            gasHomeExpensesContribution;
        }
      }
    });

    shopSummaryRows.push(shopSummary);
  });

  const commissionRows = Array.isArray(
    eligibleCurrentMonthCommissionAllocation?.rows
  )
    ? eligibleCurrentMonthCommissionAllocation.rows
    : [];

  commissionRows.forEach((commissionRow) => {
    const expenseKey = String(
      commissionRow?.expenseKey || ''
    ).trim();

    const commissionAllocated = Math.max(
      0,
      Number(commissionRow?.commissionAllocated || 0)
    );

    if (!expenseKey || commissionAllocated <= 0) return;

    const row = ensureExpenseRow(expenseKey, {
      name: commissionRow?.expenseName || expenseKey,
    });

    if (row) {
      row.fromCommission += commissionAllocated;
    }
  });

  const ownerProfitFromCommission = Math.max(
    0,
    Number(
      eligibleCurrentMonthCommissionAllocation
        ?.ownerProfitFromCommission || 0
    )
  );

  ownerProfitAccumulated += ownerProfitFromCommission;

  const findExpenseKeyFromTransaction = (transaction) => {
    const fundKey = String(
      transaction?.sourceFundKey ||
        transaction?.source_fund_key ||
        transaction?.expenseKey ||
        transaction?.expense_key ||
        ''
    ).trim();

    const matchingShop = shops.find((shop) => {
      const shopId = String(shop?.id || '').trim();

      return shopId && fundKey.startsWith(`${shopId}-`);
    });

    if (matchingShop) {
      const matchingShopId = String(
        matchingShop?.id || ''
      ).trim();

      return fundKey.slice(`${matchingShopId}-`.length);
    }

    const expenseName = String(
      transaction?.expenseName ||
        transaction?.expense_name ||
        ''
    )
      .trim()
      .toLowerCase();

    const matchedExpenseKey = expenseOrder.find(
      (expenseKey) =>
        expenseName ===
        String(
          MASTER_EXPENSE_SETUP['shop-1']?.expenses?.[
            expenseKey
          ]?.name || expenseKey
        )
          .trim()
          .toLowerCase()
    );

    return matchedExpenseKey || fundKey;
  };

  const currentMonthTransactions = transactions.filter(
    (transaction) => {
      const status = String(
        transaction?.status || 'confirmed'
      ).toLowerCase();

      const transactionDate = String(
        transaction?.transactionDate ||
          transaction?.transaction_date ||
          transaction?.date ||
          transaction?.created_at ||
          ''
      ).slice(0, 10);

      return (
        status === 'confirmed' &&
        transactionDate >= summaryStartKey &&
        transactionDate <= todayKey
      );
    }
  );

  let ownerDrawingsTaken = 0;

  currentMonthTransactions.forEach((transaction) => {
    const transactionType = String(
      transaction?.transactionType ||
        transaction?.transaction_type ||
        ''
    ).toLowerCase();

    const amount = Math.max(
      0,
      Number(transaction?.amount || 0)
    );

    if (!amount) return;

    if (transactionType === 'expense_payment') {
      const expenseKey =
        findExpenseKeyFromTransaction(transaction);

      const row = ensureExpenseRow(expenseKey, {
        name:
          transaction?.expenseName ||
          transaction?.expense_name ||
          expenseKey,
      });

      if (row) {
        row.used += amount;
      }
    }

    if (transactionType === 'home_expense_cash_taken') {
      const row = ensureExpenseRow('homeExpenses', {
        name: 'Home Expenses',
      });

      if (row) {
        row.used += amount;
      }
    }

    if (transactionType === 'owner_drawing') {
      ownerDrawingsTaken += amount;
    }
  });

  const homeExpenseProductUsage = sales
    .filter((sale) => {
      const saleDateKey = String(
        sale?.date ||
          sale?.created_at ||
          ''
      ).slice(0, 10);

      return (
        saleDateKey >= summaryStartKey &&
        saleDateKey <= todayKey
      );
    })
    .reduce((saleTotal, sale) => {
      const items = Array.isArray(sale?.items)
        ? sale.items
        : [];

      return (
        saleTotal +
        items.reduce((itemTotal, item) => {
          const isHomeExpenseItem =
            item?.homeExpense === true ||
            item?.home_expense === true ||
            item?.metadata?.homeExpense === true ||
            item?.meta?.homeExpense === true;

          if (!isHomeExpenseItem) return itemTotal;

          const quantity = Number(item?.quantity || 0);

          const itemAmount = Number(
            item?.total ||
              item?.lineTotal ||
              item?.amount ||
              item?.sellTotal ||
              0
          );

          if (itemAmount > 0) {
            return itemTotal + itemAmount;
          }

          const sellPrice = Number(
            item?.sellPrice ||
              item?.price ||
              0
          );

          return itemTotal + quantity * sellPrice;
        }, 0)
      );
    }, 0);

  if (homeExpenseProductUsage > 0) {
    const row = ensureExpenseRow('homeExpenses', {
      name: 'Home Expenses',
    });

    if (row) {
      row.used += homeExpenseProductUsage;
    }
  }

  const getSortIndex = (expenseKey) => {
    const index = expenseOrder.indexOf(expenseKey);
    return index === -1 ? 999 : index;
  };

  const expenseRows = Array.from(expenseTotalsMap.values())
    .map((row) => {
      const monthlyTarget = Math.max(
        0,
        Number(row.monthlyTarget || 0)
      );

      const fromShops = Math.max(
        0,
        Number(row.fromShops || 0)
      );

      const fromGas = Math.max(
        0,
        Number(row.fromGas || 0)
      );

      const fromCommission = Math.max(
        0,
        Number(row.fromCommission || 0)
      );

      const used = Math.max(
        0,
        Number(row.used || 0)
      );

      const totalFunded =
        fromShops + fromGas + fromCommission;

      return {
        ...row,
        displayName: getExpenseDisplayName(row.key, row.name),
        monthlyTarget,
        fromShops,
        fromGas,
        fromCommission,
        totalFunded,
        used,
        availableAfterUsage: Math.max(0, totalFunded - used),
        claimedAmount: Math.max(0, monthlyTarget - totalFunded),

        required: monthlyTarget,
        funded: totalFunded,
        paid: used,
        availableNow: Math.max(0, totalFunded - used),
        outstanding: Math.max(0, monthlyTarget - totalFunded),
      };
    })
    .sort(
      (a, b) =>
        getSortIndex(a.key) - getSortIndex(b.key)
    );

  const totalMonthlyExpenses = expenseRows.reduce(
    (sum, row) => sum + Number(row.monthlyTarget || 0),
    0
  );

  const totalFromShops = expenseRows.reduce(
    (sum, row) => sum + Number(row.fromShops || 0),
    0
  );

  const totalFromGas = expenseRows.reduce(
    (sum, row) => sum + Number(row.fromGas || 0),
    0
  );

  const totalFromCommission = expenseRows.reduce(
    (sum, row) => sum + Number(row.fromCommission || 0),
    0
  );

  const totalFunding =
    totalFromShops + totalFromGas + totalFromCommission;

  const totalUsed = expenseRows.reduce(
    (sum, row) => sum + Number(row.used || 0),
    0
  );

  const totalAvailableAfterUsage =
    totalFunding - totalUsed;

  const totalClaimedAmount = Math.max(
    0,
    totalMonthlyExpenses - totalFunding
  );

  const ownerProfitAvailable = Math.max(
    0,
    ownerProfitAccumulated - ownerDrawingsTaken
  );

  const centralCashHeld =
    totalAvailableAfterUsage + ownerProfitAvailable;

  return {
    startKey: summaryStartKey,
    endKey: todayKey,

    totalSales,
    productReplacement,
    grossProfit,

    totalMonthlyExpenses,
    totalFromShops,
    totalFromGas,
    totalFromCommission,
    totalFunding,
    totalUsed,
    totalAvailableAfterUsage,
    totalClaimedAmount,

    ownerProfitAccumulated,
    ownerDrawingsTaken,
    ownerProfitAvailable,
    centralCashHeld,

    totalExpensesRequired: totalMonthlyExpenses,
    totalExpensesFunded: totalFunding,
    totalExpensesPaid: totalUsed,
    totalExpensesOutstanding: totalClaimedAmount,

    expenseRows,
    shopRows: shopSummaryRows,
  };
}, [
  data?.shops,
  data?.sales,
  data?.products,
  data?.gasEntries,
  data?.centralFundTransactions,
  eligibleCurrentMonthCommissionAllocation,
  language,
]);

const allocationRows = useMemo(() => {
  return rows.flatMap((shopRow) => {
    const centralFundingBreakdown = Array.isArray(
      shopRow.centralExpenseFundingBreakdown
    )
      ? shopRow.centralExpenseFundingBreakdown
      : [];

    const manualLocalFundingBreakdown = Array.isArray(
      shopRow.localExpenseFundingBreakdown
    )
      ? shopRow.localExpenseFundingBreakdown.filter(
          (expense) => expense.isManual
        )
      : [];

    const fundingBreakdown = [
      ...centralFundingBreakdown,
      ...manualLocalFundingBreakdown,
    ];

    return fundingBreakdown.map((expense) => ({
      id: `${shopRow.id}-${expense.key}`,
      fundId: expense.fundId || '',
      shop_id: shopRow.id,
      shop: shopRow.name,
      expense: expense.name,
      due: expense.due || '',
      isManual: Boolean(expense.isManual),
      requiredToday: Number(
        expense.requiredToday || 0
      ),
      addedToday: Number(
        expense.amountFunded || 0
      ),
      remainingAfter: Number(
        expense.amountOutstanding || 0
      ),
    }));
  });
}, [rows]);

const saveOwnerDrawing = async () => {
  const drawingAmount = Number(
    String(ownerDrawingAmount || '').replace(/,/g, '')
  );

  const availableOwnerProfit = Number(
    ownerProfitAccount.availableBalance || 0
  );

  const centralCashAvailable = Number(
    centralFundSummary.centralFundsHeld || 0
  );

  if (!drawingAmount || drawingAmount <= 0) {
    alert(
      language === 'sw'
        ? 'Weka kiasi halali ambacho mmiliki anachukua.'
        : 'Enter a valid owner-drawing amount.'
    );
    return;
  }

  if (!String(ownerDrawingPurpose || '').trim()) {
    alert(
      language === 'sw'
        ? 'Eleza sababu au matumizi ya fedha ambayo mmiliki anachukua.'
        : 'Enter the purpose of the owner drawing.'
    );
    return;
  }

  if (drawingAmount > availableOwnerProfit) {
    alert(
      language === 'sw'
        ? `Kiasi hiki kinazidi faida ya mmiliki iliyopo. Faida inayopatikana ni TZS ${money(
            availableOwnerProfit
          )}.`
        : `This amount exceeds the available owner profit. Available owner profit is TZS ${money(
            availableOwnerProfit
          )}.`
    );
    return;
  }

  if (drawingAmount > centralCashAvailable) {
    alert(
      language === 'sw'
        ? `Kiasi hiki kinazidi fedha halisi zilizopo kwa msimamizi. Fedha zilizopo ni TZS ${money(
            centralCashAvailable
          )}.`
        : `This amount exceeds the central funds currently held. Available central funds are TZS ${money(
            centralCashAvailable
          )}.`
    );
    return;
  }

  const confirmedAt = new Date().toISOString();

  const transactionId = `owner-drawing-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const transactionRow = {
    id: transactionId,
    transaction_type: 'owner_drawing',
    transaction_date: confirmedAt.slice(0, 10),

    source_fund_type: 'owner_profit',
    source_fund_key: 'owner-profit',
    source_fund_name: 'Owner Profit',

    amount: drawingAmount,

    payee:
      currentUser?.name ||
      currentUser?.username ||
      'Owner',

    purpose: String(ownerDrawingPurpose).trim(),

    payment_method:
      ownerDrawingPaymentMethod || 'cash',

    payment_reference:
      String(
        ownerDrawingPaymentReference || ''
      ).trim() || null,

    status: 'confirmed',

    recorded_by_user_id:
      String(currentUser?.id || ''),

    recorded_by_name:
      currentUser?.name ||
      currentUser?.username ||
      'Owner',

    recorded_by_role:
      currentUser?.role || 'owner',

    created_at: confirmedAt,
    updated_at: confirmedAt,
  };

  setOwnerDrawingSaving(true);

  const { data: savedRows, error } = await supabase
    .from('centralFundTransactions')
    .insert([transactionRow])
    .select();

  if (error) {
    setOwnerDrawingSaving(false);

    alert(
      language === 'sw'
        ? `Fedha ya mmiliki haijahifadhiwa: ${error.message}`
        : `The owner drawing was not saved: ${error.message}`
    );

    return;
  }

  const savedRow = savedRows?.[0] || transactionRow;

  const normalizedTransaction = {
    id: savedRow.id || transactionId,
    transactionType:
      savedRow.transaction_type || 'owner_drawing',

    transactionDate:
      savedRow.transaction_date ||
      confirmedAt.slice(0, 10),

    sourceFundType:
      savedRow.source_fund_type || 'owner_profit',

    sourceFundKey:
      savedRow.source_fund_key || 'owner-profit',

    sourceFundName:
      savedRow.source_fund_name || 'Owner Profit',

    amount: Number(savedRow.amount || drawingAmount),

    payee:
      savedRow.payee ||
      currentUser?.name ||
      'Owner',

    purpose:
      savedRow.purpose ||
      String(ownerDrawingPurpose).trim(),

    paymentMethod:
      savedRow.payment_method ||
      ownerDrawingPaymentMethod,

    paymentReference:
      savedRow.payment_reference || '',

    status: savedRow.status || 'confirmed',

    recordedByUserId:
      savedRow.recorded_by_user_id || '',

    recordedByName:
      savedRow.recorded_by_name || '',

    recordedByRole:
      savedRow.recorded_by_role || 'owner',

    created_at:
      savedRow.created_at || confirmedAt,

    updated_at:
      savedRow.updated_at || confirmedAt,
  };

  await saveData({
    ...data,

    centralFundTransactions: [
      normalizedTransaction,
      ...(Array.isArray(
        data?.centralFundTransactions
      )
        ? data.centralFundTransactions
        : []),
    ],
  });

  setOwnerDrawingAmount('');
  setOwnerDrawingPurpose('');
  setOwnerDrawingPaymentMethod('cash');
  setOwnerDrawingPaymentReference('');
  setOwnerDrawingSaving(false);

  alert(
    language === 'sw'
      ? 'Fedha ambayo mmiliki amechukua imehifadhiwa vizuri.'
      : 'The owner drawing was recorded successfully.'
  );
};
const saveEmergencyBorrowing = async () => {
  const sourceAccount = alignedLedgerFundAccounts.find(
  (account) =>
    String(account?.key || '') ===
    String(emergencySourceFundKey || '')
);

const destinationAccount = alignedLedgerFundAccounts.find(
  (account) =>
    String(account?.key || '') ===
    String(emergencyDestinationFundKey || '')
);

  const borrowingAmount = Number(
    String(emergencyBorrowingAmount || '').replace(/,/g, '')
  );

  if (!sourceAccount) {
    alert(
      language === 'sw'
        ? 'Chagua fungu linalotoa fedha.'
        : 'Select the fund lending the money.'
    );
    return;
  }

  if (!destinationAccount) {
    alert(
      language === 'sw'
        ? 'Chagua fungu linalopokea fedha.'
        : 'Select the fund receiving the money.'
    );
    return;
  }

  if (sourceAccount.key === destinationAccount.key) {
    alert(
      language === 'sw'
        ? 'Fungu linalotoa na linalopokea fedha haliwezi kuwa fungu moja.'
        : 'The source and destination funds cannot be the same.'
    );
    return;
  }

  if (!borrowingAmount || borrowingAmount <= 0) {
    alert(
      language === 'sw'
        ? 'Weka kiasi halali cha mkopo wa dharura.'
        : 'Enter a valid emergency-borrowing amount.'
    );
    return;
  }

  if (
    borrowingAmount >
    Number(sourceAccount.availableBalance || 0)
  ) {
    alert(
      language === 'sw'
        ? `Kiasi hiki kinazidi salio la fungu linalotoa fedha. Salio linalopatikana ni TZS ${money(
            sourceAccount.availableBalance
          )}.`
        : `This amount exceeds the source fund balance. The available balance is TZS ${money(
            sourceAccount.availableBalance
          )}.`
    );
    return;
  }

  if (!emergencyBorrowingDueDate) {
    alert(
      language === 'sw'
        ? 'Weka tarehe ambayo fedha zinapaswa kurejeshwa.'
        : 'Enter the repayment due date.'
    );
    return;
  }

  if (
    emergencyBorrowingDueDate <
    new Date().toISOString().slice(0, 10)
  ) {
    alert(
      language === 'sw'
        ? 'Tarehe ya kurejesha haiwezi kuwa tarehe iliyopita.'
        : 'The repayment date cannot be in the past.'
    );
    return;
  }

  if (!String(emergencyBorrowingPurpose || '').trim()) {
    alert(
      language === 'sw'
        ? 'Eleza sababu ya mkopo wa dharura.'
        : 'Enter the reason for the emergency borrowing.'
    );
    return;
  }

  const confirmedAt = new Date().toISOString();

  const transactionId = `emergency-borrowing-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const transactionRow = {
    id: transactionId,

    transaction_type: 'emergency_borrowing',
    transaction_date: confirmedAt.slice(0, 10),

    source_fund_type: sourceAccount.type,
    source_fund_key: sourceAccount.key,
    source_fund_name: sourceAccount.name,
    source_shop_id: sourceAccount.shopId || null,
    source_shop_name: sourceAccount.shopName || null,

    destination_fund_type: destinationAccount.type,
    destination_fund_key: destinationAccount.key,
    destination_fund_name: destinationAccount.name,
    destination_shop_id:
      destinationAccount.shopId || null,
    destination_shop_name:
      destinationAccount.shopName || null,

    amount: borrowingAmount,

    purpose: String(
      emergencyBorrowingPurpose
    ).trim(),

    payment_reference:
      String(
        emergencyBorrowingReference || ''
      ).trim() || null,

    status: 'confirmed',

    borrowing_due_date:
      emergencyBorrowingDueDate,

    borrowing_status: 'outstanding',

    borrowed_amount: borrowingAmount,
    repaid_amount: 0,

    recorded_by_user_id:
      String(currentUser?.id || ''),

    recorded_by_name:
      currentUser?.name ||
      currentUser?.username ||
      'Owner',

    recorded_by_role:
      currentUser?.role || 'owner',

    created_at: confirmedAt,
    updated_at: confirmedAt,
  };

  setEmergencyBorrowingSaving(true);

  const { data: savedRows, error } = await supabase
    .from('centralFundTransactions')
    .insert([transactionRow])
    .select();

  if (error) {
    setEmergencyBorrowingSaving(false);

    alert(
      language === 'sw'
        ? `Mkopo wa dharura haujahifadhiwa: ${error.message}`
        : `Emergency borrowing was not saved: ${error.message}`
    );

    return;
  }

  const savedRow = savedRows?.[0] || transactionRow;

  const normalizedTransaction = {
    id: savedRow.id || transactionId,

    transactionType:
      savedRow.transaction_type ||
      'emergency_borrowing',

    transactionDate:
      savedRow.transaction_date ||
      confirmedAt.slice(0, 10),

    sourceFundType:
      savedRow.source_fund_type ||
      sourceAccount.type,

    sourceFundKey:
      savedRow.source_fund_key ||
      sourceAccount.key,

    sourceFundName:
      savedRow.source_fund_name ||
      sourceAccount.name,

    sourceShopId:
      savedRow.source_shop_id ||
      sourceAccount.shopId ||
      '',

    sourceShopName:
      savedRow.source_shop_name ||
      sourceAccount.shopName ||
      '',

    destinationFundType:
      savedRow.destination_fund_type ||
      destinationAccount.type,

    destinationFundKey:
      savedRow.destination_fund_key ||
      destinationAccount.key,

    destinationFundName:
      savedRow.destination_fund_name ||
      destinationAccount.name,

    destinationShopId:
      savedRow.destination_shop_id ||
      destinationAccount.shopId ||
      '',

    destinationShopName:
      savedRow.destination_shop_name ||
      destinationAccount.shopName ||
      '',

    amount: Number(
      savedRow.amount || borrowingAmount
    ),

    purpose:
      savedRow.purpose ||
      String(emergencyBorrowingPurpose).trim(),

    paymentReference:
      savedRow.payment_reference || '',

    status:
      savedRow.status || 'confirmed',

    borrowingDueDate:
      savedRow.borrowing_due_date ||
      emergencyBorrowingDueDate,

    borrowingStatus:
      savedRow.borrowing_status ||
      'outstanding',

    borrowedAmount: Number(
      savedRow.borrowed_amount ||
      borrowingAmount
    ),

    repaidAmount: Number(
      savedRow.repaid_amount || 0
    ),

    recordedByUserId:
      savedRow.recorded_by_user_id || '',

    recordedByName:
      savedRow.recorded_by_name || '',

    recordedByRole:
      savedRow.recorded_by_role || 'owner',

    created_at:
      savedRow.created_at || confirmedAt,

    updated_at:
      savedRow.updated_at || confirmedAt,
  };

  await saveData({
    ...data,

    centralFundTransactions: [
      normalizedTransaction,

      ...(Array.isArray(
        data?.centralFundTransactions
      )
        ? data.centralFundTransactions
        : []),
    ],
  });

  setEmergencySourceFundKey('');
  setEmergencyDestinationFundKey('');
  setEmergencyBorrowingAmount('');
  setEmergencyBorrowingDueDate('');
  setEmergencyBorrowingPurpose('');
  setEmergencyBorrowingReference('');
  setEmergencyBorrowingSaving(false);

  alert(
    language === 'sw'
      ? 'Mkopo wa dharura umehifadhiwa. Mfumo utaendelea kuonyesha kuwa fedha zinapaswa kurejeshwa.'
      : 'Emergency borrowing was recorded. The system will continue showing that the money must be repaid.'
  );
};

const saveExpensePayment = async () => {
  const selectedConsolidatedFund =
  consolidatedExpenseFundOptions.find(
    (category) =>
      String(category?.key || '') ===
      String(expensePaymentFundKey || '')
  );

const selectedFund =
  selectedConsolidatedFund ||
  alignedLedgerFundAccounts.find(
    (account) =>
      String(account?.key || '') ===
      String(expensePaymentFundKey || '')
  );
const beneficiaryShop = (
  Array.isArray(data?.shops) ? data.shops : []
).find(
  (shopItem) =>
    String(shopItem?.id || '') ===
    String(expensePaymentBeneficiaryShopId || '')
);
  const paymentAmount = Number(
    String(expensePaymentAmount || '').replace(
      /,/g,
      ''
    )
  );

  if (!selectedFund) {
    alert(
      language === 'sw'
        ? 'Chagua fungu la matumizi linalolipia fedha.'
        : 'Select the expense fund making the payment.'
    );
    return;
  }

  if (
  ![
    'expense_fund',
    'consolidated_expense_fund',
  ].includes(selectedFund.type)
) {
  alert(
    language === 'sw'
      ? 'Malipo ya matumizi hayawezi kutolewa kwenye akaunti ya faida ya mmiliki.'
      : 'A business expense cannot be paid from the owner-profit account.'
  );
  return;
}

  if (!paymentAmount || paymentAmount <= 0) {
    alert(
      language === 'sw'
        ? 'Weka kiasi halali kilicholipwa.'
        : 'Enter a valid payment amount.'
    );
    return;
  }

  if (
    paymentAmount >
    Number(selectedFund.availableBalance || 0)
  ) {
    alert(
      language === 'sw'
        ? `Kiasi hiki kinazidi salio la fungu hili. Salio linalopatikana ni TZS ${money(
            selectedFund.availableBalance
          )}.`
        : `This payment exceeds the selected fund balance. The available balance is TZS ${money(
            selectedFund.availableBalance
          )}.`
    );
    return;
  }

  if (
    paymentAmount >
    Number(centralFundSummary.centralFundsHeld || 0)
  ) {
    alert(
      language === 'sw'
        ? `Kiasi hiki kinazidi fedha halisi zilizopo kwa msimamizi. Fedha zilizopo ni TZS ${money(
            centralFundSummary.centralFundsHeld
          )}.`
        : `This payment exceeds the physical central funds held. Available central funds are TZS ${money(
            centralFundSummary.centralFundsHeld
          )}.`
    );
    return;
  }

  if (!expensePaymentDate) {
    alert(
      language === 'sw'
        ? 'Weka tarehe ya malipo.'
        : 'Enter the payment date.'
    );
    return;
  }

  if (!String(expensePaymentPayee || '').trim()) {
    alert(
      language === 'sw'
        ? 'Weka jina la mtu au taasisi iliyolipwa.'
        : 'Enter the person or institution paid.'
    );
    return;
  }

  if (!String(expensePaymentPurpose || '').trim()) {
    alert(
      language === 'sw'
        ? 'Eleza sababu ya malipo.'
        : 'Enter the purpose of the payment.'
    );
    return;
  }
const allocationAccounts =
  selectedConsolidatedFund
    ? selectedConsolidatedFund.accounts.filter(
        (account) =>
          Number(account?.availableBalance || 0) > 0
      )
    : [selectedFund];

let remainingPayment = paymentAmount;

let remainingAvailableBalance =
  allocationAccounts.reduce(
    (sum, account) =>
      sum +
      Math.max(
        0,
        Number(account?.availableBalance || 0)
      ),
    0
  );

const paymentAllocations = allocationAccounts
  .map((account, accountIndex) => {
    const accountAvailableBalance = Math.max(
      0,
      Number(account?.availableBalance || 0)
    );

    const isLastAccount =
      accountIndex === allocationAccounts.length - 1;

    const allocatedAmount = isLastAccount
      ? Math.min(
          accountAvailableBalance,
          remainingPayment
        )
      : Math.min(
          accountAvailableBalance,
          Math.round(
            (remainingPayment *
              accountAvailableBalance) /
              Math.max(1, remainingAvailableBalance)
          )
        );

    remainingPayment = Math.max(
      0,
      remainingPayment - allocatedAmount
    );

    remainingAvailableBalance = Math.max(
      0,
      remainingAvailableBalance -
        accountAvailableBalance
    );

    return {
      account,
      amount: allocatedAmount,
    };
  })
  .filter(
    (allocation) =>
      Number(allocation.amount || 0) > 0
  );
  
  const confirmedAt = new Date().toISOString();

const paymentGroupId = `expense-payment-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2, 8)}`;

const transactionRows = paymentAllocations.map(
  (allocation, allocationIndex) => {
    const sourceAccount = allocation.account;

    return {
      id: `${paymentGroupId}-${allocationIndex + 1}`,

      transaction_type: 'expense_payment',
      transaction_date: expensePaymentDate,

      shop_id: sourceAccount.shopId || null,
      shop_name: sourceAccount.shopName || null,

      expense_key: sourceAccount.key,
      expense_name: sourceAccount.name,

      source_fund_type: 'expense_fund',
      source_fund_key: sourceAccount.key,
      source_fund_name: sourceAccount.name,

      source_shop_id:
        sourceAccount.shopId || null,

      source_shop_name:
        sourceAccount.shopName || null,

      destination_shop_id:
        beneficiaryShop?.id || null,

      destination_shop_name:
        beneficiaryShop?.name || null,

      amount: Number(allocation.amount || 0),

      payee:
        String(expensePaymentPayee).trim(),

      purpose:
        String(expensePaymentPurpose).trim(),

      payment_method:
        expensePaymentMethod || 'cash',

      payment_reference:
        String(
          expensePaymentReference || ''
        ).trim() || null,

      notes: selectedConsolidatedFund
        ? `Consolidated payment: ${selectedConsolidatedFund.name}`
        : null,

      status: 'confirmed',

      recorded_by_user_id:
        String(currentUser?.id || ''),

      recorded_by_name:
        currentUser?.name ||
        currentUser?.username ||
        'Owner',

      recorded_by_role:
        currentUser?.role || 'owner',

      created_at: confirmedAt,
      updated_at: confirmedAt,
    };
  }
);

const transactionRow = transactionRows[0];
const transactionId =
  transactionRow?.id || paymentGroupId;

  setExpensePaymentSaving(true);

 const { data: savedRows, error } = await supabase
  .from('centralFundTransactions')
  .insert(transactionRows)
  .select();

  if (error) {
    setExpensePaymentSaving(false);

    alert(
      language === 'sw'
        ? `Malipo hayajahifadhiwa: ${error.message}`
        : `The expense payment was not saved: ${error.message}`
    );

    return;
  }

const normalizedTransactions = (
  Array.isArray(savedRows) && savedRows.length > 0
    ? savedRows
    : transactionRows
).map((savedPaymentRow, paymentIndex) => {
  const fallbackRow =
    transactionRows[paymentIndex] ||
    transactionRows[0];

  return {
    id:
      savedPaymentRow.id ||
      fallbackRow.id,

    transactionType:
      savedPaymentRow.transaction_type ||
      fallbackRow.transaction_type,

    transactionDate:
      savedPaymentRow.transaction_date ||
      fallbackRow.transaction_date,

    shop_id:
      savedPaymentRow.shop_id ||
      fallbackRow.shop_id ||
      '',

    shopName:
      savedPaymentRow.shop_name ||
      fallbackRow.shop_name ||
      '',

    expenseKey:
      savedPaymentRow.expense_key ||
      fallbackRow.expense_key,

    expenseName:
      savedPaymentRow.expense_name ||
      fallbackRow.expense_name,

    sourceFundType:
      savedPaymentRow.source_fund_type ||
      fallbackRow.source_fund_type,

    sourceFundKey:
      savedPaymentRow.source_fund_key ||
      fallbackRow.source_fund_key,

    sourceFundName:
      savedPaymentRow.source_fund_name ||
      fallbackRow.source_fund_name,

    sourceShopId:
      savedPaymentRow.source_shop_id ||
      fallbackRow.source_shop_id ||
      '',

    sourceShopName:
      savedPaymentRow.source_shop_name ||
      fallbackRow.source_shop_name ||
      '',

    destinationShopId:
      savedPaymentRow.destination_shop_id ||
      fallbackRow.destination_shop_id ||
      '',

    destinationShopName:
      savedPaymentRow.destination_shop_name ||
      fallbackRow.destination_shop_name ||
      '',

    amount: Number(
      savedPaymentRow.amount ||
      fallbackRow.amount ||
      0
    ),

    payee:
      savedPaymentRow.payee ||
      fallbackRow.payee ||
      '',

    purpose:
      savedPaymentRow.purpose ||
      fallbackRow.purpose ||
      '',

    paymentMethod:
      savedPaymentRow.payment_method ||
      fallbackRow.payment_method ||
      'cash',

    paymentReference:
      savedPaymentRow.payment_reference ||
      fallbackRow.payment_reference ||
      '',

    notes:
      savedPaymentRow.notes ||
      fallbackRow.notes ||
      '',

    status:
      savedPaymentRow.status ||
      fallbackRow.status ||
      'confirmed',

    recordedByUserId:
      savedPaymentRow.recorded_by_user_id ||
      fallbackRow.recorded_by_user_id ||
      '',

    recordedByName:
      savedPaymentRow.recorded_by_name ||
      fallbackRow.recorded_by_name ||
      '',

    recordedByRole:
      savedPaymentRow.recorded_by_role ||
      fallbackRow.recorded_by_role ||
      'owner',

    created_at:
      savedPaymentRow.created_at ||
      fallbackRow.created_at ||
      confirmedAt,

    updated_at:
      savedPaymentRow.updated_at ||
      fallbackRow.updated_at ||
      confirmedAt,
  };
});

await saveData({
  ...data,

  centralFundTransactions: [
    ...normalizedTransactions,

    ...(Array.isArray(
      data?.centralFundTransactions
    )
      ? data.centralFundTransactions
      : []),
  ],
});

  setExpensePaymentFundKey('');
  setExpensePaymentAmount('');
  setExpensePaymentDate(
    new Date().toISOString().slice(0, 10)
  );
  setExpensePaymentPayee('');
setExpensePaymentBeneficiaryShopId('');
setExpensePaymentPurpose('');
  setExpensePaymentMethod('cash');
  setExpensePaymentReference('');
  setExpensePaymentSaving(false);

  alert(
    language === 'sw'
      ? 'Malipo yamehifadhiwa na salio la fungu limepunguzwa.'
      : 'The payment was recorded and the fund balance was reduced.'
  );
};

  const saveShopMonthlySettingToSupabase = async (
  shopId,
  localMonthlyAmount
) => {
  const { error } = await supabase
    .from('remittanceShopSettings')
    .upsert(
      {
        shop_id: String(shopId),
        local_monthly: Number(localMonthlyAmount || 0),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'shop_id',
      }
    );

  if (error) {
    throw error;
  }
};

  const applyTodayExpenseAllocation = async () => {
    if (!remittanceCloudLoaded) {
  alert(
    language === 'sw'
      ? 'Tafadhali subiri, taarifa za makusanyo ya leo bado zinapakiwa.'
      : 'Please wait. Today’s remittance records are still loading.'
  );
  return;
}
  const today = shop.calculationDate
  ? new Date(`${shop.calculationDate}T00:00:00`)
  : new Date();
  const allocationDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const alreadyAllocatedToday = fundAllocationRecords.some(
    (record) => String(record?.allocationDate || '') === allocationDate
  );

  if (alreadyAllocatedToday) {
    alert(
      language === 'sw'
        ? 'Mgawanyo wa fedha za matumizi wa leo tayari umefanyika.'
        : 'Today’s expense-fund allocation has already been completed.'
    );
    return;
  }

  const allocationsToSave = allocationRows
    .filter((fund) => Number(fund.addedToday || 0) > 0)
    .map((fund) => {
      const matchingFund =
        funds.find(
          (item) =>
            Boolean(fund?.fundId) &&
            String(item?.id || '') ===
              String(fund.fundId)
        ) ||
        funds.find(
          (item) =>
            String(item?.shop_id || '') ===
              String(fund?.shop_id || '') &&
            String(item?.expense || '') ===
              String(fund?.expense || '') &&
            String(item?.due || '') ===
              String(fund?.due || '')
        );

      return {
        id: `fund-allocation-${Date.now()}-${matchingFund?.id || Math.random()}`,
        shop_id: matchingFund?.shop_id || fund?.shop_id || '',
        fund_id: matchingFund?.id || fund?.id || '',
        allocationDate,
        amount: Number(fund.addedToday || 0),
        created_at: new Date().toISOString(),
      };
    })
    .filter((record) => record.shop_id && record.fund_id);

  if (allocationsToSave.length === 0) {
    alert(
      language === 'sw'
        ? 'Hakuna fedha ya kugawa kwenye matumizi leo.'
        : 'There is no amount available for expense allocation today.'
    );
    return;
  }

  const allocationRowsForSupabase = allocationsToSave.map((record) => ({
    id: record.id,
    shop_id: record.shop_id,
    fund_id: record.fund_id,
    allocation_date: record.allocationDate,
    amount: record.amount,
    created_at: record.created_at,
  }));

const updatedFunds = funds.map((fund) => {
  const allocation = allocationsToSave.find(
    (record) => String(record.fund_id) === String(fund.id)
  );

  if (!allocation) return fund;

  return {
    ...fund,
    funded: Math.min(
      Number(fund.target || 0),
      Number(fund.funded || 0) + Number(allocation.amount || 0)
    ),
  };
});

const expenseFundRowsForSupabase = updatedFunds.map((fund) => ({
  id: fund.id,
  shop_id: fund.shop_id,
  target: Number(fund.target || 0),
  funded: Number(fund.funded || 0),
  due: fund.due || '',
  location: fund.location || 'owner',
}));

const { error: allocationTransactionError } = await supabase.rpc(
  'apply_remittance_expense_allocation',
  {
    p_allocations: allocationRowsForSupabase,
    p_funds: expenseFundRowsForSupabase,
  }
);

if (allocationTransactionError) {
  const isDuplicate =
    allocationTransactionError.code === '23505' ||
    String(allocationTransactionError.message || '')
      .toLowerCase()
      .includes('duplicate');

  alert(
    isDuplicate
      ? language === 'sw'
        ? 'Mgawanyo wa fedha za matumizi wa leo tayari umefanyika.'
        : 'Today’s expense-fund allocation has already been completed.'
      : language === 'sw'
        ? `Mgawanyo haujahifadhiwa: ${allocationTransactionError.message}`
        : `Allocation was not saved: ${allocationTransactionError.message}`
  );

  return;
}

  const nextAllocationRecords = [
    ...fundAllocationRecords,
    ...allocationsToSave,
  ];

  setFunds(updatedFunds);

  await saveData({
    ...data,
    remittanceExpenseFunds: updatedFunds,
    remittanceFundAllocations: nextAllocationRecords,
  });

  alert(
    language === 'sw'
      ? 'Fedha za matumizi za leo zimegawanywa na kuhifadhiwa.'
      : 'Today’s expense funds have been allocated and saved.'
  );
};

  const getUrgency = (fund) => {
    if (fund.target <= fund.funded) return [t('fullyFunded'), 'green'];

    const days = Math.ceil(
      (new Date(fund.due) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (days <= 7) return [t('urgent'), 'red'];
    if (days <= 30) return [t('upcoming'), 'amber'];
    return [t('onTrack'), 'blue'];
  };

  const today = new Date();
const todayKey = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const currentShopTodayRemittance = remittanceRecords.find(
  (record) =>
    String(record?.shop_id || record?.shopId || '') ===
      String(selectedShop.id) &&
    String(record?.date || '') === todayKey
);
  const showShortReason =
    Number(amountSent || 0) > 0 &&
    Number(amountSent || 0) < Number(selectedShop.expectedHome || 0);

  const handlePreviewSubmission = async () => {
    const sent = Number(amountSent || 0);

    if (sent <= 0) {
      alert(
        language === 'sw'
          ? 'Jaza kiasi halisi kilichotumwa.'
          : 'Enter the amount actually sent.'
      );
      return;
    }

    if (showShortReason && !shortReason) {
      alert(
        language === 'sw'
          ? 'Chagua sababu kwa nini kiasi kilichotumwa ni kidogo.'
          : 'Select why the amount sent is lower.'
      );
      return;
    }

    if (showShortReason && shortReason === 'other' && !otherReason.trim()) {
      alert(language === 'sw' ? 'Eleza sababu nyingine.' : 'Explain the other reason.');
      return;
    }

    if (!localConfirmed) {
      alert(
        language === 'sw'
          ? 'Thibitisha kwanza kuwa fedha ya nauli na umeme imetengwa.'
          : 'Confirm that fare and electricity money has been separated.'
      );
      return;
    }

   const today = new Date();
const todayKey = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const existingTodayRecord = remittanceRecords.find(
  (record) =>
    String(record?.shop_id || record?.shopId || '') ===
      String(selectedShop.id) &&
    String(record?.date || '') === todayKey
);

if (existingTodayRecord) {
  alert(
    language === 'sw'
      ? 'Duka hili tayari limethibitisha makusanyo ya leo.'
      : 'This shop has already confirmed today’s remittance.'
  );
  return;
}
/*
 * Preserve today's pooled Home Expenses funding inside the confirmed
 * remittance. Future strong days will read these confirmed amounts
 * when calculating how much weak days still need.
 */
const proposedHomeExpensesContribution =
  todayKey >= HOME_EXPENSES_PERFORMANCE_START_DATE
    ? Math.max(
        0,
        Number(
          selectedShop
            .totalPooledHomeExpensesContribution || 0
        )
      )
    : 0;

/*
 * Central expenses are paid first. Only money actually covered by
 * the confirmed remittance is recorded as funded for Home Expenses.
 */
const amountAvailableForHomeExpenses = Math.max(
  0,
  sent - Number(selectedShop.centralExpense || 0)
);

const confirmedHomeExpensesContribution = Math.min(
  proposedHomeExpensesContribution,
  amountAvailableForHomeExpenses
);
const newRecord = {
  id: `remittance-${Date.now()}`,
  shop_id: selectedShop.id,
  shopName: selectedShop.name,
  date: todayKey,
  amountSent: sent,
paymentMethod,
paymentReference: paymentReference.trim(),
shortReason: showShortReason ? shortReason : '',
  otherReason:
    showShortReason && shortReason === 'other'
      ? otherReason.trim()
      : '',
  expectedAmount: Number(selectedShop.expectedHome || 0),
  expenseBreakdown: [
  ...(selectedShop.localExpenseFundingBreakdown || []).map((expense) => ({
    name: expense.name,
    location: 'shop',
    required: Number(expense.requiredToday || 0),
    funded: Number(expense.amountFunded || 0),
    outstanding: Number(expense.amountOutstanding || 0),
  })),
  ...(selectedShop.centralExpenseFundingBreakdown || []).map((expense) => ({
    name: expense.name,
    location: 'owner',
    required: Number(expense.requiredToday || 0),
    funded: Number(expense.amountFunded || 0),
    outstanding: Number(expense.amountOutstanding || 0),
  })),

  ...(
    proposedHomeExpensesContribution > 0
      ? [
          {
            key: 'performanceHomeExpenses',
            name: 'Performance Home Expenses',
            location: 'owner',
            required: proposedHomeExpensesContribution,
            funded: confirmedHomeExpensesContribution,
            outstanding: Math.max(
              0,
              proposedHomeExpensesContribution -
                confirmedHomeExpensesContribution
            ),
            activationDate:
              HOME_EXPENSES_PERFORMANCE_START_DATE,
          },
        ]
      : []
  ),
],
expensesOutstanding: Number(
  selectedShop.expensesStillOutstanding || 0
),

exactAmountRequired: Number(
  selectedShop.amountRequiredToSubmit || 0
),
cashAmountRequired: Number(
  selectedShop.cashAmountRequiredToSubmit || 0
),
cashRoundingAdjustment: Number(
  selectedShop.cashRoundingAdjustment || 0
),
  sales: Number(selectedShop.sales || 0),
  replacement: Number(selectedShop.replacement || 0),
  grossProfit: Number(selectedShop.gross || 0),
  centralExpense: Number(selectedShop.centralExpense || 0),
  localRetained: Number(selectedShop.localFunded || 0),
  ownerProfit: Number(selectedShop.ownerProfit || 0),
  shopReserve: Number(selectedShop.shopReserve || 0),
  localConfirmed: true,
  created_at: new Date().toISOString(),
};

const { error: remittanceSaveError } = await supabase
  .from('dailyRemittances')
  .insert([
    {
  id: newRecord.id,
  shop_id: newRecord.shop_id,
  shop_name: newRecord.shopName,
  date: newRecord.date,
  amount_sent: newRecord.amountSent,
  payment_method: newRecord.paymentMethod,
  payment_reference: newRecord.paymentReference || null,
  short_reason: newRecord.shortReason || null,
  other_reason: newRecord.otherReason || null,
  expected_amount: newRecord.expectedAmount,
  sales: newRecord.sales,
  replacement: newRecord.replacement,
  gross_profit: newRecord.grossProfit,
  central_expense: newRecord.centralExpense,
  local_retained: newRecord.localRetained,
  owner_profit: newRecord.ownerProfit,
  shop_reserve: newRecord.shopReserve,

  expense_breakdown: newRecord.expenseBreakdown || [],
  expenses_outstanding: Number(newRecord.expensesOutstanding || 0),
  exact_amount_required: Number(newRecord.exactAmountRequired || 0),
  cash_amount_required: Number(newRecord.cashAmountRequired || 0),
  cash_rounding_adjustment: Number(
    newRecord.cashRoundingAdjustment || 0
  ),

  local_confirmed: newRecord.localConfirmed,
  created_at: newRecord.created_at,
},
  ]);

if (remittanceSaveError) {
  const isDuplicate =
    remittanceSaveError.code === '23505' ||
    String(remittanceSaveError.message || '')
      .toLowerCase()
      .includes('duplicate');

  alert(
    isDuplicate
      ? language === 'sw'
        ? 'Makusanyo ya leo tayari yamethibitishwa.'
        : 'Today’s remittance has already been confirmed.'
      : language === 'sw'
        ? `Makusanyo hayajahifadhiwa: ${remittanceSaveError.message}`
        : `Remittance was not saved: ${remittanceSaveError.message}`
  );

  return;
}

await saveData({
  ...data,
  dailyRemittances: [...remittanceRecords, newRecord],
});

setAmountSent('');
setPaymentReference('');
setShortReason('');
setOtherReason('');
setLocalConfirmed(false);

alert(
  language === 'sw'
    ? 'Fedha uliyotuma imehifadhiwa na kuthibitishwa.'
    : 'The remittance has been saved and confirmed.'
);
  };

  const expenseLabel = (expense) => {
  const map = {
    Salary:
      language === 'sw'
        ? 'Mishahara'
        : 'Salary',

    Rent:
      language === 'sw'
        ? 'Kodi'
        : 'Rent',

    'Home Expenses':
      language === 'sw'
        ? 'Matumizi ya Nyumbani'
        : 'Home Expenses',

    Medical:
      language === 'sw'
        ? 'Matibabu'
        : 'Medical',

    TRA: 'TRA',

    'Data Bundle':
      language === 'sw'
        ? 'Bando la Intaneti'
        : 'Data Bundle',

    Electricity:
      language === 'sw'
        ? 'Umeme'
        : 'Electricity',

    Fare:
      language === 'sw'
        ? 'Nauli'
        : 'Fare',
  };

  return map[expense] || expense;
};

  const tabs = [
    [
      'simple-summary',
      language === 'sw'
        ? 'Muhtasari wa Mapato na Matumizi'
        : 'Income and Expenses Summary',
    ],
    ['daily', t('tabDaily')],
    ['allocation', t('tabAllocation')],
    ['funds', t('tabFunds')],
    ['outstanding', t('tabOutstanding')],
    ['local', t('tabLocal')],
    ['accountability', t('tabAccountability')],
    ['setup', t('tabSetup')],
    ['reports', t('tabReports')],
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1650px] space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-sm font-bold text-blue-700">{t('previewLabel')}</div>
              <h1 className="mt-1 text-3xl font-black text-slate-950">{t('mainTitle')}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">{t('mainSub')}</p>
            </div>
<div />
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>{t('previewMode')}</strong> {t('previewNote')}
        </div>

        {rolePreview === 'owner' ? (
          <>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              {tabs.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${
                    activeTab === value
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {activeTab === 'simple-summary' ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-black uppercase tracking-wide text-emerald-700">
                    {language === 'sw'
                      ? 'Kuanzia tarehe 01/08/2026'
                      : 'From 01/08/2026 onward'}
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {language === 'sw'
                      ? 'Muhtasari wa Mapato na Matumizi'
                      : 'Income and Expenses Summary'}
                  </h2>

                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                    {language === 'sw'
                      ? 'Muhtasari huu unaonyesha mapato, fedha ya kununulia bidhaa, faida ghafi, matumizi yaliyotengwa, matumizi yaliyolipwa, salio la matumizi, na faida ya mmiliki kwa hesabu ya moja kwa moja.'
                      : 'This summary shows sales, product replacement money, gross profit, funded expenses, paid expenses, expense balances, and owner profit in one live view.'}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                    {[
                      {
                        label:
                          language === 'sw'
                            ? 'Jumla ya Mauzo'
                            : 'Total Sales',
                        value: simpleIncomeExpenseSummary.totalSales,
                        className:
                          'border-emerald-100 bg-emerald-50 text-emerald-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Fedha ya Kununulia Bidhaa'
                            : 'Product Replacement Money',
                        value:
                          simpleIncomeExpenseSummary.productReplacement,
                        className:
                          'border-blue-100 bg-blue-50 text-blue-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Faida Ghafi'
                            : 'Gross Profit',
                        value: simpleIncomeExpenseSummary.grossProfit,
                        className:
                          'border-slate-200 bg-slate-50 text-slate-950',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Jumla Yote ya Mwezi'
                            : 'Full Monthly Expenses',
                        value:
                          simpleIncomeExpenseSummary
                            .totalMonthlyExpenses,
                        className:
                          'border-orange-100 bg-orange-50 text-orange-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Kutoka Maduka'
                            : 'From Shops',
                        value:
                          simpleIncomeExpenseSummary.totalFromShops,
                        className:
                          'border-cyan-100 bg-cyan-50 text-cyan-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Kutoka Gesi'
                            : 'From Gas',
                        value:
                          simpleIncomeExpenseSummary.totalFromGas,
                        className:
                          'border-lime-100 bg-lime-50 text-lime-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Kutoka Kamisheni'
                            : 'From Commission',
                        value:
                          simpleIncomeExpenseSummary.totalFromCommission,
                        className:
                          'border-amber-100 bg-amber-50 text-amber-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Iliyotumika'
                            : 'Used',
                        value:
                          simpleIncomeExpenseSummary.totalUsed,
                        className:
                          'border-red-100 bg-red-50 text-red-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Iliyosalia Baada ya Matumizi'
                            : 'Remaining After Usage',
                        value:
                          simpleIncomeExpenseSummary
                            .totalAvailableAfterUsage,
                        className:
                          'border-teal-100 bg-teal-50 text-teal-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Kinachodaiwa'
                            : 'Still Required',
                        value:
                          simpleIncomeExpenseSummary
                            .totalClaimedAmount,
                        className:
                          'border-rose-100 bg-rose-50 text-rose-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Faida ya Mmiliki Iliyopo'
                            : 'Available Owner Profit',
                        value:
                          simpleIncomeExpenseSummary
                            .ownerProfitAvailable,
                        className:
                          'border-violet-100 bg-violet-50 text-violet-900',
                      },
                      {
                        label:
                          language === 'sw'
                            ? 'Fedha Halisi Iliyopo kwa Msimamizi'
                            : 'Cash Held by Manager',
                        value:
                          simpleIncomeExpenseSummary.centralCashHeld,
                        className:
                          'border-emerald-200 bg-emerald-900 text-white',
                      },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className={`rounded-xl border p-3 shadow-sm ${card.className}`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wide opacity-70">
                          {card.label}
                        </div>

                        <div className="mt-1.5 text-xl font-black">
                          TZS {money(card.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {language === 'sw'
                        ? 'Mgawanyo wa Matumizi ya Mwezi'
                        : 'Monthly Expense Breakdown'}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {language === 'sw'
                        ? 'Kila matumizi yanaonyeshwa kwenye kadi yake ili kuona jumla ya mwezi, fedha zilizoingia, matumizi yaliyofanyika, salio lililopo, na kiasi kinachodaiwa.'
                        : 'Each expense is shown in its own card, showing the monthly target, money received, usage, available balance, and amount still required.'}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    {simpleIncomeExpenseSummary.expenseRows.map((row) => {
                      const monthlyTarget = Math.max(
                        0,
                        Number(row.monthlyTarget || 0)
                      );

                      const fromShops = Math.max(
                        0,
                        Number(row.fromShops || 0)
                      );

                      const fromGas = Math.max(
                        0,
                        Number(row.fromGas || 0)
                      );

                      const fromCommission = Math.max(
                        0,
                        Number(row.fromCommission || 0)
                      );

                      const used = Math.max(
                        0,
                        Number(row.used || 0)
                      );

                      const totalReceived =
                        fromShops + fromGas + fromCommission;

                      const availableAfterUsage =
                        totalReceived - used;

                      const amountOwedNow = Math.max(
                        0,
                        used - totalReceived
                      );

                      const remainingToMonthlyTarget = Math.max(
                        0,
                        monthlyTarget - totalReceived
                      );

                      const fundedPercent =
                        monthlyTarget > 0
                          ? Math.min(
                              100,
                              (totalReceived / monthlyTarget) * 100
                            )
                          : 0;

                      const hasCurrentDebt = amountOwedNow > 0;

                      return (
                        <div
                          key={row.key}
                          className="rounded-3xl border-2 border-emerald-100 bg-white p-4 shadow-md ring-4 ring-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black text-slate-950">
                                {row.displayName}
                              </h4>

                              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                {language === 'sw'
                                  ? 'Nafasi ya fungu mwezi huu'
                                  : 'Monthly fund position'}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                hasCurrentDebt
                                  ? 'bg-red-100 text-red-800'
                                  : remainingToMonthlyTarget > 0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {hasCurrentDebt
                                ? language === 'sw'
                                  ? 'Lina deni'
                                  : 'In debt'
                                : remainingToMonthlyTarget > 0
                                  ? language === 'sw'
                                    ? 'Bado'
                                    : 'Pending'
                                  : language === 'sw'
                                    ? 'Limekamilika'
                                    : 'Complete'}
                            </span>
                          </div>

                          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[11px] font-bold text-slate-500">
                                {language === 'sw'
                                  ? 'Jumla yote ya mwezi'
                                  : 'Full monthly total'}
                              </span>

                              <span className="text-sm font-black text-slate-950">
                                TZS {money(monthlyTarget)}
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-emerald-600"
                                style={{
                                  width: `${fundedPercent}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 md:grid-cols-3">
                            <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
                              <div className="text-[10px] font-black uppercase tracking-wide text-blue-900">
                                {language === 'sw'
                                  ? 'Fedha zilizoingia'
                                  : 'Money received'}
                              </div>

                              <div className="mt-2 space-y-1.5 text-[11px]">
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-600">
                                    {language === 'sw'
                                      ? 'Maduka'
                                      : 'Shops'}
                                  </span>
                                  <strong>
                                    TZS {money(fromShops)}
                                  </strong>
                                </div>

                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-600">
                                    {language === 'sw'
                                      ? 'Gesi'
                                      : 'Gas'}
                                  </span>
                                  <strong>
                                    TZS {money(fromGas)}
                                  </strong>
                                </div>

                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-600">
                                    {language === 'sw'
                                      ? 'Kamisheni'
                                      : 'Commission'}
                                  </span>
                                  <strong>
                                    TZS {money(fromCommission)}
                                  </strong>
                                </div>

                                <div className="mt-2 border-t border-blue-200 pt-2">
                                  <div className="flex justify-between gap-2 text-xs font-black text-blue-950">
                                    <span>
                                      {language === 'sw'
                                        ? 'Jumla'
                                        : 'Total'}
                                    </span>
                                    <span>
                                      TZS {money(totalReceived)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-3 ring-1 ring-orange-100">
                              <div className="text-[10px] font-black uppercase tracking-wide text-orange-900">
                                {language === 'sw'
                                  ? 'Matumizi'
                                  : 'Usage'}
                              </div>

                              <div className="mt-2 flex justify-between gap-2 text-[11px]">
                                <span className="text-slate-600">
                                  {language === 'sw'
                                    ? 'Iliyotumika'
                                    : 'Used'}
                                </span>

                                <strong className="text-red-800">
                                  TZS {money(used)}
                                </strong>
                              </div>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
                              <div className="text-[10px] font-black uppercase tracking-wide text-red-900">
                                {language === 'sw'
                                  ? 'Salio'
                                  : 'Balance'}
                              </div>

                              <div className="mt-2 space-y-1.5 text-[11px]">
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-600">
                                    {language === 'sw'
                                      ? 'Iliyopo'
                                      : 'Available'}
                                  </span>
                                  <strong
                                    className={
                                      availableAfterUsage < 0
                                        ? 'text-red-800'
                                        : 'text-emerald-800'
                                    }
                                  >
                                    TZS {signedMoney(availableAfterUsage)}
                                  </strong>
                                </div>

                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-600">
                                    {language === 'sw'
                                      ? 'Deni sasa'
                                      : 'Current debt'}
                                  </span>
                                  <strong className="text-red-800">
                                    TZS {money(amountOwedNow)}
                                  </strong>
                                </div>

                                <div className="mt-2 border-t border-red-200 pt-2">
                                  <div className="flex justify-between gap-2 text-xs font-black text-red-900">
                                    <span>
                                      {language === 'sw'
                                        ? 'Bado mwezi'
                                        : 'Month gap'}
                                    </span>
                                    <span>
                                      TZS {money(remainingToMonthlyTarget)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-emerald-950">
                        {language === 'sw'
                          ? 'Jumla Kuu'
                          : 'Grand Total'}
                      </h3>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-emerald-200">
                        {language === 'sw'
                          ? 'Msimamo wa mwisho'
                          : 'Final position'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
                        <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                          {language === 'sw'
                            ? 'Iliyokusanywa'
                            : 'Collected'}
                        </div>

                        <div className="mt-2 text-xl font-black text-emerald-900">
                          TZS {money(simpleIncomeExpenseSummary.totalFunding)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-orange-100">
                        <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                          {language === 'sw'
                            ? 'Iliyotumika'
                            : 'Used'}
                        </div>

                        <div className="mt-2 text-xl font-black text-orange-900">
                          TZS {money(simpleIncomeExpenseSummary.totalUsed)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-red-100">
                        <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                          {language === 'sw'
                            ? 'Jumla Deni'
                            : 'Total Debt'}
                        </div>

                        <div className="mt-2 text-xl font-black text-red-900">
                          TZS {money(
                            simpleIncomeExpenseSummary.expenseRows.reduce(
                              (sum, row) => {
                                const collected =
                                  Number(row.fromShops || 0) +
                                  Number(row.fromGas || 0) +
                                  Number(row.fromCommission || 0);

                                return (
                                  sum +
                                  Math.max(
                                    0,
                                    Number(row.used || 0) - collected
                                  )
                                );
                              },
                              0
                            )
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-emerald-900 p-4 text-white shadow-sm">
                        <div className="text-xs font-black uppercase tracking-wide opacity-80">
                          {language === 'sw'
                            ? 'Salio Halisi kwa Msimamizi'
                            : 'Net Balance with Manager'}
                        </div>

                        <div className="mt-2 text-xl font-black">
                          TZS {signedMoney(
                            simpleIncomeExpenseSummary.centralCashHeld
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                            {language === 'sw'
                              ? 'Salio Baada ya Matumizi'
                              : 'Balance After Usage'}
                          </div>

                          <div
                            className={`mt-1 text-lg font-black ${
                              simpleIncomeExpenseSummary
                                .totalAvailableAfterUsage < 0
                                ? 'text-red-800'
                                : 'text-emerald-800'
                            }`}
                          >
                            TZS {signedMoney(
                              simpleIncomeExpenseSummary
                                .totalAvailableAfterUsage
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                            {language === 'sw'
                              ? 'Faida Halisi ya Mmiliki'
                              : 'Net Owner Profit'}
                          </div>

                          <div className="mt-1 text-lg font-black text-violet-800">
                            TZS {money(
                              simpleIncomeExpenseSummary
                                .ownerProfitAvailable
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                            {language === 'sw'
                              ? 'Salio Halisi kwa Msimamizi'
                              : 'Net Balance with Manager'}
                          </div>

                          <div
                            className={`mt-1 text-lg font-black ${
                              simpleIncomeExpenseSummary.centralCashHeld < 0
                                ? 'text-red-800'
                                : 'text-emerald-900'
                            }`}
                          >
                            TZS {signedMoney(
                              simpleIncomeExpenseSummary.centralCashHeld
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-xs font-bold text-slate-500">
                        {language === 'sw'
                          ? 'Salio Halisi kwa Msimamizi = Salio Baada ya Matumizi + Faida Halisi ya Mmiliki.'
                          : 'Net Balance with Manager = Balance After Usage + Net Owner Profit.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'daily' ? (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <StatCard
    label={language === 'sw' ? 'Mauzo ya sasa' : 'Current sales'}
    value={totals.sales}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Fedha ya kununulia bidhaa'
        : 'Protected product capital'
    }
    value={totals.replacement}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Faida ghafi iliyopatikana'
        : 'Gross profit generated'
    }
    value={totals.gross}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Matumizi ya nyuma ambayo bado hayajalipiwa'
        : 'Previous unpaid expenses'
    }
    value={totals.previousUnpaidExpenses}
  />

  <StatCard
  label={
    language === 'sw'
      ? 'Matumizi yanayotakiwa hadi tarehe hii'
      : 'Expenses required up to this date'
  }
  value={monthlyExpenseTotals.required}
/>

<StatCard
  label={
    language === 'sw'
      ? 'Fedha iliyotengwa kwa matumizi'
      : 'Expenses funded'
  }
  value={monthlyExpenseTotals.funded}
/>

<StatCard
  label={
    language === 'sw'
      ? 'Matumizi ambayo bado hayajalipiwa'
      : 'Expenses still outstanding'
  }
  value={monthlyExpenseTotals.outstanding}
/>

  <StatCard
  label={
    language === 'sw'
      ? 'Kiasi cha fedha taslimu unachotakiwa kutoa'
      : 'Practical cash amount required to submit'
  }
  value={totals.cashAmountRequiredToSubmit}
/>
</div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
  <div className="font-black text-emerald-900">
    {language === 'sw'
      ? 'Matumizi yanahesabiwa moja kwa moja'
      : 'Expenses are calculated automatically'}
  </div>

  <div className="mt-1 text-sm text-emerald-800">
    {language === 'sw'
      ? 'Kila mauzo mapya hubadilisha kiasi cha matumizi na kiasi unachotakiwa kutoa.'
      : 'Every new sale automatically updates the expenses and the total amount required to submit.'}
  </div>
</div>
<div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
  <div className="grid gap-4 xl:grid-cols-[1fr_1.6fr] xl:items-start">
    <div>
      <div className="text-sm font-black uppercase tracking-wide text-orange-800">
        {language === 'sw'
          ? 'Pendekezo la Faida ya Gesi kwa Matumizi ya Nyumbani'
          : 'Gas Profit Proposal for Home Expenses'}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            {language === 'sw'
              ? 'Lengo la mwezi'
              : 'Monthly target'}
          </div>
          <div className="mt-1 font-black">
            TZS {money(
              homeExpensesFundingSummary.monthlyTarget
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            {language === 'sw'
              ? 'Mchango wa maduka'
              : 'Shop contributions'}
          </div>
          <div className="mt-1 font-black">
            TZS {money(
  combinedHomeExpensesFundingSummary
    .shopContribution
)}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            {language === 'sw'
              ? 'Bado inahitajika'
              : 'Remaining balance'}
          </div>
          <div className="mt-1 font-black text-red-700">
            TZS {money(
  combinedHomeExpensesFundingSummary
    .remainingBalance
)}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            {language === 'sw'
              ? 'Faida ya gesi'
              : 'Confirmed gas profit'}
          </div>
          <div className="mt-1 font-black">
            TZS {money(
              homeExpensesFundingSummary.confirmedGasProfit
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            {language === 'sw'
  ? 'Asilimia 70 ya faida'
  : '70% of actual profit'}
          </div>
          <div className="mt-1 font-black text-orange-800">
            TZS {money(
  combinedHomeExpensesFundingSummary
    .gasContribution
)}
          </div>
        </div>
      </div>
    </div>

<div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
  <div className="text-sm font-black uppercase tracking-wide text-cyan-800">
    {language === 'sw'
      ? 'Pendekezo la Kamisheni kwa Matumizi ya Nyumbani'
      : 'Commission Proposal for Home Expenses'}
  </div>

  <div className="mt-4 grid gap-4 xl:grid-cols-2">
    
       <div className="rounded-2xl border border-cyan-100 bg-white p-4">
  <div className="text-sm font-black text-slate-900">
    {language === 'sw'
      ? 'Kamisheni ya Pamoja ya Mwezi Uliopita'
      : 'Previous Month Combined Commission'}
  </div>

  <div className="mt-1 text-xs font-bold text-slate-500">
    {language === 'sw'
      ? `Mwezi unaohusika: ${
          previousMonthCommissionProposal?.fundingMonth ||
          '-'
        }`
      : `Funding month: ${
          previousMonthCommissionProposal?.fundingMonth ||
          '-'
        }`}
  </div>

  <div className="mt-3 grid gap-3 sm:grid-cols-2">
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Jumla ya kamisheni iliyopatikana'
          : 'Total available commission'}
      </div>

      <div className="mt-1 font-black">
        TZS {money(
          previousMonthCommissionProposal
            ?.availableCommission || 0
        )}
      </div>
    </div>

    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Upungufu kabla ya kamisheni'
          : 'Shortage before commission'}
      </div>

      <div className="mt-1 font-black text-red-700">
        TZS {money(
          previousMonthCommissionProposal
            ?.shortageBeforeCommission || 0
        )}
      </div>
    </div>

    <div className="rounded-xl bg-cyan-50 p-3">
      <div className="text-xs font-bold text-cyan-700">
        {language === 'sw'
          ? 'Pendekezo la kamisheni'
          : 'Proposed commission contribution'}
      </div>

      <div className="mt-1 font-black text-cyan-800">
        TZS {money(
          previousMonthCommissionProposal
            ?.proposedCommissionContribution || 0
        )}
      </div>
    </div>

    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Kamisheni itakayobaki bila kutumika'
          : 'Unused commission'}
      </div>

      <div className="mt-1 font-black">
        TZS {money(
          previousMonthCommissionProposal
            ?.unusedCommission || 0
        )}
      </div>
    </div>
  </div>

  <div className="mt-4">
   <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
  {language === 'sw'
    ? `Imetengwa moja kwa moja: TZS ${money(
        eligibleCurrentMonthCommissionAllocation
          ?.totalCommission || 0
      )}`
    : `Automatically allocated: TZS ${money(
        eligibleCurrentMonthCommissionAllocation
          ?.totalCommission || 0
      )}`}
</div>
  </div>
</div>
<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <div className="text-sm font-black uppercase tracking-wide text-emerald-800">
        {language === 'sw'
          ? 'Muhtasari wa Fedha za Matumizi ya Nyumbani'
          : 'Home Expenses Funding Summary'}
      </div>

      <div className="mt-2 text-sm text-emerald-900">
        {language === 'sw'
          ? 'Muhtasari huu unahesabu fedha zilizothibitishwa pekee.'
          : 'This summary counts confirmed funding only.'}
      </div>
    </div>

    <div className="rounded-xl bg-white px-4 py-3 text-right">
      <div className="text-xs font-bold uppercase text-slate-500">
        {language === 'sw'
          ? 'Asilimia iliyokamilika'
          : 'Funding completed'}
      </div>

      <div className="mt-1 text-2xl font-black text-emerald-800">
        {Number(
          combinedHomeExpensesFundingSummary.fundingPercentage || 0
        ).toFixed(1)}
        %
      </div>
    </div>
  </div>

  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <div className="rounded-xl bg-white p-4">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Mchango wa maduka'
          : 'Shop contributions'}
      </div>

      <div className="mt-1 text-lg font-black">
        TZS {money(
          combinedHomeExpensesFundingSummary.shopContribution
        )}
      </div>
    </div>

    <div className="rounded-xl bg-white p-4">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Mchango wa faida ya gesi'
          : 'Gas-profit contribution'}
      </div>

      <div className="mt-1 text-lg font-black">
        TZS {money(
          combinedHomeExpensesFundingSummary.gasContribution
        )}
      </div>
    </div>

  
   <div className="rounded-xl bg-white p-4">
  <div className="text-xs font-bold text-slate-500">
    {language === 'sw'
      ? 'Mchango wa kamisheni ya pamoja'
      : 'Combined commission contribution'}
  </div>

  <div className="mt-1 text-lg font-black">
    TZS {money(
      combinedHomeExpensesFundingSummary
        .combinedCommissionContribution
    )}
  </div>
</div> 
    
  </div>

  <div className="mt-4 h-4 overflow-hidden rounded-full bg-emerald-100">
    <div
      className="h-full rounded-full bg-emerald-600 transition-all"
      style={{
        width: `${combinedHomeExpensesFundingSummary.fundingPercentage}%`,
      }}
    />
  </div>

  <div className="mt-4 grid gap-3 sm:grid-cols-3">
    <div className="rounded-xl bg-white p-4">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Lengo la mwezi'
          : 'Monthly target'}
      </div>

      <div className="mt-1 text-lg font-black">
        TZS {money(
          combinedHomeExpensesFundingSummary.monthlyTarget
        )}
      </div>
    </div>

    <div className="rounded-xl bg-emerald-900 p-4 text-white">
      <div className="text-xs font-bold text-emerald-100">
        {language === 'sw'
          ? 'Jumla iliyothibitishwa'
          : 'Total confirmed funding'}
      </div>

      <div className="mt-1 text-lg font-black">
        TZS {money(
          combinedHomeExpensesFundingSummary.totalConfirmedFunding
        )}
      </div>
    </div>

    <div className="rounded-xl bg-white p-4">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Bado inahitajika'
          : 'Remaining balance'}
      </div>

      <div className="mt-1 text-lg font-black text-red-700">
        TZS {money(
          combinedHomeExpensesFundingSummary.remainingBalance
        )}
      </div>
    </div>
  </div>
</div>
  </div>  

  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
    <span className="text-sm font-bold">
      {language === 'sw'
        ? 'Bado itabaki baada ya mapendekezo'
        : 'Remaining after proposed contributions'}
    </span>

    <strong>
  TZS {money(
    previousMonthCommissionProposal
      ?.remainingShortageAfterCommission || 0
  )}
</strong>
  </div>
</div>
  </div>
</div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-[1500px] w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                      <tr>
                        {[
  t('shop'),

  language === 'sw'
    ? 'Mauzo ya sasa'
    : 'Current sales',

  language === 'sw'
    ? 'Fedha ya kununulia bidhaa'
    : 'Protected product capital',

  language === 'sw'
    ? 'Faida ghafi iliyopatikana'
    : 'Gross profit generated',

  language === 'sw'
    ? 'Matumizi ya nyuma ambayo bado hayajalipiwa'
    : 'Previous unpaid expenses',

  language === 'sw'
    ? 'Matumizi ya leo'
    : 'Today’s fixed expenses',

  language === 'sw'
    ? 'Fedha iliyotengwa kwa matumizi'
    : 'Money allocated to expenses',

  language === 'sw'
    ? 'Matumizi ambayo bado hayajalipiwa'
    : 'Expenses still outstanding',

  language === 'sw'
  ? 'Kiasi unachotakiwa kutoa'
  : 'Total amount required to submit',

language === 'sw'
  ? 'Hali ya matumizi'
  : 'Expense funding status',
].map((heading) => (
                          
                          <th key={heading} className="px-4 py-3">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  <tbody>
  {rows.map((row) => (
    <tr key={row.id} className="border-t border-slate-100">
      <td className="px-4 py-3 font-bold">
        {row.name}
      </td>

      <td className="px-4 py-3">
        TZS {money(row.sales)}
      </td>

      <td className="px-4 py-3">
        TZS {money(row.replacement)}
      </td>

      <td className="px-4 py-3">
        TZS {money(row.gross)}
      </td>

      <td className="px-4 py-3">
        TZS {money(row.previousUnpaidExpenses)}
      </td>

     <td className="px-4 py-3">
  TZS {money(
    monthlyExpenseSummaryByShop.get(String(row.id))?.required ??
      row.todayFixedExpenses
  )}
</td>

<td className="px-4 py-3">
  TZS {money(
    monthlyExpenseSummaryByShop.get(String(row.id))?.funded ??
      row.expensesFundedAutomatically
  )}
</td>

<td className="px-4 py-3 font-black text-red-700">
  TZS {money(
    monthlyExpenseSummaryByShop.get(String(row.id))?.outstanding ??
      row.expensesStillOutstanding
  )}
</td>
      <td className="px-4 py-3 font-black">
        TZS {money(row.cashAmountRequiredToSubmit)}
      </td>
      <td className="px-4 py-3">
  {(() => {
    const monthlyShopExpenseSummary =
  monthlyExpenseSummaryByShop.get(String(row.id));

const fundedAmount = Number(
  monthlyShopExpenseSummary?.funded ??
    row.expensesFundedAutomatically ??
    0
);

const outstandingAmount = Number(
  monthlyShopExpenseSummary?.outstanding ??
    row.expensesStillOutstanding ??
    0
);

    if (outstandingAmount <= 0) {
      return (
        <Badge tone="green">
          {language === 'sw'
            ? 'Yamelipiwa yote'
            : 'Fully funded'}
        </Badge>
      );
    }

    if (fundedAmount > 0) {
      return (
        <Badge tone="amber">
          {language === 'sw'
            ? 'Yamelipiwa sehemu'
            : 'Partly funded'}
        </Badge>
      );
    }

    return (
      <Badge tone="red">
        {language === 'sw'
          ? 'Hayajalipiwa'
          : 'Not funded'}
      </Badge>
    );
  })()}
</td>
    </tr>
  ))}

  {rows.length > 0 ? (
    <tr className="border-t-2 border-slate-500 bg-slate-100 font-black">
      <td className="px-4 py-4">
        {language === 'sw' ? 'JUMLA' : 'TOTAL'}
      </td>

      <td className="px-4 py-4">
        TZS {money(totals.sales)}
      </td>

      <td className="px-4 py-4">
        TZS {money(totals.replacement)}
      </td>

      <td className="px-4 py-4">
        TZS {money(totals.gross)}
      </td>

      <td className="px-4 py-4">
        TZS {money(totals.previousUnpaidExpenses)}
      </td>

      <td className="px-4 py-4">
  TZS {money(monthlyExpenseTotals.required)}
</td>

<td className="px-4 py-4 text-emerald-700">
  TZS {money(monthlyExpenseTotals.funded)}
</td>

<td className="px-4 py-4 text-red-700">
  TZS {money(monthlyExpenseTotals.outstanding)}
</td>

      <td className="px-4 py-4">
        TZS {money(totals.cashAmountRequiredToSubmit)}
      </td>

      <td className="px-4 py-4">—</td>
    </tr>
  ) : null}
</tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white shadow-sm">
                  <div className="border-b border-orange-200 bg-orange-50 px-5 py-4">
                    <h3 className="text-lg font-black text-orange-950">
                      {language === 'sw'
                        ? 'Mgawanyo wa Faida ya Gesi'
                        : 'Gas Profit Breakdown'}
                    </h3>

                    <p className="mt-1 text-sm text-orange-900">
                      {language === 'sw'
                        ? 'Jedwali hili linaonyesha jinsi faida ya gesi ya kila duka ilivyogawanywa.'
                        : 'This table shows how each shop’s gas profit has been allocated.'}
                    </p>
                  </div>

                  <table className="min-w-[1400px] w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                      <tr>
                        {[
                          language === 'sw' ? 'Duka' : 'Shop',
                          language === 'sw'
                            ? 'Faida halisi ya gesi'
                            : 'Actual gas profit',
                          language === 'sw'
                            ? '20% inayobaki kwenye gesi'
                            : '20% gas reserve',
                          language === 'sw'
                            ? '80% ya kupelekwa nyumbani'
                            : '80% distributable',
                          language === 'sw'
                            ? 'Iliyotumika kulipa matumizi ya nyuma'
                            : 'Used to clear arrears',
                          language === 'sw'
                            ? 'Salio baada ya matumizi ya nyuma'
                            : 'Balance after arrears',
                          language === 'sw'
                            ? 'Faida ya gesi ya mmiliki'
                            : 'Owner gas profit',
                          language === 'sw'
                            ? 'Mchango wa ziada wa Matumizi ya Nyumbani'
                            : 'Additional Home Expenses contribution',
                        ].map((heading) => (
                          <th key={heading} className="px-4 py-3">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={`${row.id}-gas-breakdown`}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-3 font-bold">
                            {row.name}
                          </td>

                          <td className="px-4 py-3">
                            TZS {money(row.gasProfit)}
                          </td>

                          <td className="px-4 py-3">
                            TZS {money(row.gasReserveAmount)}
                          </td>

                          <td className="px-4 py-3 font-black text-orange-700">
                            TZS {money(row.gasDistributableAmount)}
                          </td>

                          <td className="px-4 py-3 font-bold text-red-700">
                            TZS {money(row.gasUsedForArrears)}
                          </td>

                          <td className="px-4 py-3">
                            TZS {money(row.gasBalanceAfterArrears)}
                          </td>

                          <td className="px-4 py-3 font-bold text-blue-700">
                            TZS {money(row.gasOwnerProfit)}
                          </td>

                          <td className="px-4 py-3 font-bold text-emerald-700">
                            TZS {money(row.gasHomeExpensesContribution)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

           {activeTab === 'allocation' ? (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-[950px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          {[
            t('shop'),
            language === 'sw'
              ? 'Aina ya matumizi'
              : 'Expense',
            language === 'sw'
              ? 'Kiasi kinachotakiwa leo'
              : 'Required today',
            language === 'sw'
              ? 'Kiasi kilichotengwa leo'
              : 'Funded today',
            language === 'sw'
              ? 'Kiasi ambacho bado hakijalipiwa'
              : 'Still outstanding',
            t('status'),
          ].map((heading) => (
            <th key={heading} className="px-4 py-3">
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.flatMap((shopRow) => {
          const shopAllocationRows =
            allocationRows.filter(
              (row) =>
                String(row.shop_id) ===
                String(shopRow.id)
            );

          if (shopAllocationRows.length === 0) {
            return [];
          }

          const shopRequiredTotal =
            shopAllocationRows.reduce(
              (sum, row) =>
                sum +
                Number(row.requiredToday || 0),
              0
            );

          const shopFundedTotal =
            shopAllocationRows.reduce(
              (sum, row) =>
                sum +
                Number(row.addedToday || 0),
              0
            );

          const shopOutstandingTotal =
            shopAllocationRows.reduce(
              (sum, row) =>
                sum +
                Number(row.remainingAfter || 0),
              0
            );

          const expenseRows =
            shopAllocationRows.map((row) => {
              const requiredToday = Number(
                row.requiredToday || 0
              );

              const fundedToday = Number(
                row.addedToday || 0
              );

              const outstandingToday = Number(
                row.remainingAfter || 0
              );

              const fullyFunded =
                requiredToday > 0 &&
                outstandingToday <= 0;

              const partlyFunded =
                fundedToday > 0 &&
                outstandingToday > 0;

              return (
                <tr
                  key={row.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-bold">
                    {row.shop}
                  </td>

                  <td className="px-4 py-3">
                    {expenseLabel(row.expense)}
                  </td>

                  <td className="px-4 py-3">
                    TZS {money(requiredToday)}
                  </td>

                  <td className="px-4 py-3 font-bold text-emerald-700">
                    TZS {money(fundedToday)}
                  </td>

                  <td className="px-4 py-3 font-black text-red-700">
                    TZS {money(outstandingToday)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        fullyFunded
                          ? 'green'
                          : partlyFunded
                            ? 'amber'
                            : 'red'
                      }
                    >
                      {fullyFunded
                        ? language === 'sw'
                          ? 'Yamelipiwa yote'
                          : 'Fully funded'
                        : partlyFunded
                          ? language === 'sw'
                            ? 'Yamelipiwa sehemu'
                            : 'Partly funded'
                          : language === 'sw'
                            ? 'Hayajalipiwa'
                            : 'Not funded'}
                    </Badge>
                  </td>
                </tr>
              );
            });

          const shopTotalRow = (
            <tr
              key={`${shopRow.id}-allocation-total`}
              className="border-y-2 border-emerald-300 bg-emerald-50 font-black"
            >
              <td className="px-4 py-4 text-emerald-950">
                {language === 'sw'
                  ? `JUMLA — ${
                      shopRow.name || shopRow.id
                    }`
                  : `TOTAL — ${
                      shopRow.name || shopRow.id
                    }`}
              </td>

              <td className="px-4 py-4">—</td>

              <td className="px-4 py-4">
                TZS {money(shopRequiredTotal)}
              </td>

              <td className="px-4 py-4 text-emerald-700">
                TZS {money(shopFundedTotal)}
              </td>

              <td className="px-4 py-4 text-red-700">
                TZS {money(shopOutstandingTotal)}
              </td>

              <td className="px-4 py-4">—</td>
            </tr>
          );

          return [
            ...expenseRows,
            shopTotalRow,
          ];
        })}

{allocationRows.length > 0 ? (
  <tr className="border-t-2 border-slate-500 bg-slate-100 font-black">
    <td className="px-4 py-4">
      {language === 'sw' ? 'JUMLA' : 'TOTAL'}
    </td>

    <td className="px-4 py-4">—</td>

    <td className="px-4 py-4">
      TZS{' '}
      {money(
        allocationRows.reduce(
          (sum, row) =>
            sum + Number(row.requiredToday || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4 text-emerald-700">
      TZS{' '}
      {money(
        allocationRows.reduce(
          (sum, row) =>
            sum + Number(row.addedToday || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4 text-red-700">
      TZS{' '}
      {money(
        allocationRows.reduce(
          (sum, row) =>
            sum + Number(row.remainingAfter || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4">—</td>
  </tr>
) : null}

        {allocationRows.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-10 text-center text-sm text-slate-500"
            >
              {language === 'sw'
                ? 'Hakuna mgawanyo wa matumizi unaopatikana kwa tarehe hii.'
                : 'No expense allocation is available for this date.'}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
) : null}
{activeTab === 'funds' ? (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-[1050px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          {[
            t('shop'),
            language === 'sw'
              ? 'Aina ya matumizi'
              : 'Expense',
            language === 'sw'
              ? 'Mzunguko'
              : 'Frequency',
            language === 'sw'
  ? 'Kiasi kilichowekwa'
  : 'Configured amount',

language === 'sw'
  ? 'Kilichotakiwa hadi tarehe hii'
  : 'Required up to this date',

language === 'sw'
  ? 'Kilichotengwa mwezi huu'
  : 'Funded this month',
            language === 'sw'
              ? 'Bado hakijalipiwa hadi tarehe hii'
              : 'Outstanding up to this date',
            t('status'),
          ].map((heading) => (
            <th key={heading} className="px-4 py-3">
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>

        {rows.flatMap((shopRow) => {
          const shopMonthlyRows =
            monthlyExpenseRows.filter(
              (row) =>
                String(row.shop_id) ===
                String(shopRow.id)
            );

          if (shopMonthlyRows.length === 0) {
            return [];
          }

          const shopConfiguredTotal =
            shopMonthlyRows.reduce(
              (sum, row) =>
                sum + Number(row.target || 0),
              0
            );

          const shopRequiredTotal =
            shopMonthlyRows.reduce(
              (sum, row) =>
                sum +
                Number(
                  row.requiredThisMonthToDate ||
                    0
                ),
              0
            );

          const shopFundedTotal =
            shopMonthlyRows.reduce(
              (sum, row) =>
                sum +
                Number(row.fundedThisMonth || 0),
              0
            );

          const shopOutstandingTotal =
            shopMonthlyRows.reduce(
              (sum, row) =>
                sum +
                Number(row.outstanding || 0),
              0
            );

          const expenseRows =
            shopMonthlyRows.map((row) => {
              const requiredThisMonthToDate =
                Number(
                  row.requiredThisMonthToDate ||
                    0
                );

              const fundedThisMonth = Number(
                row.fundedThisMonth || 0
              );

              const outstandingAmount = Number(
                row.outstanding || 0
              );

              const monthlyFundingShortfall =
                Math.max(
                  0,
                  requiredThisMonthToDate -
                    fundedThisMonth
                );

              const fullyFunded =
                monthlyFundingShortfall <= 0;

              const partlyFunded =
                fundedThisMonth > 0 &&
                monthlyFundingShortfall > 0;

              const frequencyLabel =
                row.frequency === 'daily'
                  ? language === 'sw'
                    ? 'Kila siku'
                    : 'Daily'
                  : row.frequency === 'monthly'
                    ? language === 'sw'
                      ? 'Kila mwezi'
                      : 'Monthly'
                    : row.frequency ===
                        'six_months'
                      ? language === 'sw'
                        ? 'Kila miezi sita'
                        : 'Every six months'
                      : '-';

              return (
                <tr
                  key={row.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-bold">
                    {row.shop}
                  </td>

                  <td className="px-4 py-3">
                    {expenseLabel(row.expense)}
                  </td>

                  <td className="px-4 py-3">
                    {frequencyLabel}
                  </td>

                  <td className="px-4 py-3">
                    TZS {money(row.target)}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    TZS{' '}
                    {money(
                      row.requiredThisMonthToDate
                    )}
                  </td>

                  <td className="px-4 py-3 font-bold text-emerald-700">
                    TZS {money(fundedThisMonth)}
                  </td>

                  <td className="px-4 py-3 font-black text-red-700">
                    TZS {money(outstandingAmount)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        fullyFunded &&
                        outstandingAmount <= 0
                          ? 'green'
                          : fullyFunded &&
                              outstandingAmount > 0
                            ? 'amber'
                            : partlyFunded
                              ? 'amber'
                              : 'red'
                      }
                    >
                      {fullyFunded &&
                      outstandingAmount <= 0
                        ? language === 'sw'
                          ? 'Yamekamilika'
                          : 'Fully funded'
                        : fullyFunded &&
                            outstandingAmount > 0
                          ? language === 'sw'
                            ? 'Mwezi huu umekamilika, deni la nyuma lipo'
                            : 'Current month funded, previous balance remains'
                          : partlyFunded
                            ? language === 'sw'
                              ? 'Yamelipiwa sehemu'
                              : 'Partly funded'
                            : language === 'sw'
                              ? 'Hayajalipiwa'
                              : 'Not funded'}
                    </Badge>
                  </td>
                </tr>
              );
            });

          const shopTotalRow = (
            <tr
              key={`${shopRow.id}-monthly-total`}
              className="border-y-2 border-emerald-300 bg-emerald-50 font-black"
            >
              <td className="px-4 py-4 text-emerald-950">
                {language === 'sw'
                  ? `JUMLA — ${
                      shopRow.name || shopRow.id
                    }`
                  : `TOTAL — ${
                      shopRow.name || shopRow.id
                    }`}
              </td>

              <td className="px-4 py-4">—</td>

              <td className="px-4 py-4">—</td>

              <td className="px-4 py-4">
                TZS {money(shopConfiguredTotal)}
              </td>

              <td className="px-4 py-4">
                TZS {money(shopRequiredTotal)}
              </td>

              <td className="px-4 py-4 text-emerald-700">
                TZS {money(shopFundedTotal)}
              </td>

              <td className="px-4 py-4 text-red-700">
                TZS {money(shopOutstandingTotal)}
              </td>

              <td className="px-4 py-4">—</td>
            </tr>
          );

          return [
            ...expenseRows,
            shopTotalRow,
          ];
        })}

{monthlyExpenseRows.length > 0 ? (
  <tr className="border-t-2 border-slate-500 bg-slate-100 font-black">
    <td className="px-4 py-4">
      {language === 'sw' ? 'JUMLA' : 'TOTAL'}
    </td>

    <td className="px-4 py-4">—</td>

    <td className="px-4 py-4">—</td>

    <td className="px-4 py-4">
      TZS{' '}
      {money(
        monthlyExpenseRows.reduce(
          (sum, row) => sum + Number(row.target || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4">
      TZS{' '}
      {money(
        monthlyExpenseRows.reduce(
          (sum, row) =>
            sum + Number(row.requiredThisMonthToDate || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4 text-emerald-700">
      TZS{' '}
      {money(
        monthlyExpenseRows.reduce(
          (sum, row) =>
            sum + Number(row.fundedThisMonth || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4 text-red-700">
      TZS{' '}
      {money(
        monthlyExpenseRows.reduce(
          (sum, row) => sum + Number(row.outstanding || 0),
          0
        )
      )}
    </td>

    <td className="px-4 py-4">—</td>
  </tr>
) : null}
        {monthlyExpenseRows.length === 0 ? (
          <tr>
            <td
              colSpan={8}
              className="px-4 py-10 text-center text-sm text-slate-500"
            >
              {language === 'sw'
                ? 'Hakuna taarifa za fedha za matumizi kwa kipindi hiki.'
                : 'No expense-funding information is available for this period.'}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
) : null}


{activeTab === 'outstanding' ? (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-[1050px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          {[
            t('shop'),
            language === 'sw'
              ? 'Matumizi yanayotakiwa'
              : 'Required expenses',
            language === 'sw'
              ? 'Fedha iliyotengwa / iliyokusanywa'
              : 'Funded / collected',
            language === 'sw'
              ? 'Bado hakijalipiwa'
              : 'Outstanding',
            t('status'),
          ].map((heading) => (
            <th key={heading} className="px-4 py-3">
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {monthlyExpenseShortageByShop.length ? (
          monthlyExpenseShortageByShop.map((row) => (
            <tr key={row.shop_id}>
              <td className="px-4 py-3 font-bold">
                {row.shop}
              </td>

              <td className="px-4 py-3 font-bold">
                TZS {money(row.required)}
              </td>

              <td className="px-4 py-3 font-bold text-emerald-700">
                TZS {money(row.funded)}
              </td>

              <td className="px-4 py-3 font-black text-red-700">
                TZS {money(row.outstanding)}
              </td>

              <td className="px-4 py-3">
                <Badge tone="amber">
                  {language === 'sw'
                    ? 'Bado kuna upungufu'
                    : 'Shortage exists'}
                </Badge>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={5}
              className="px-4 py-6 text-center text-sm font-bold text-emerald-700"
            >
              {language === 'sw'
                ? 'Hakuna upungufu wa matumizi kwa kipindi hiki.'
                : 'No expense shortage for this period.'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
) : null}
{activeTab === 'local' ? (
  
  <div className="space-y-4">
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
    {localExpenseSummaryRows.map((row) => {
      const fullyFunded =
        Number(row.outstandingToday || 0) <= 0;

      const partlyFunded =
        Number(row.fundedToday || 0) > 0 &&
        Number(row.outstandingToday || 0) > 0;

      return (
        <div
          key={row.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="font-black text-slate-950">
            {row.shop}
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-600">
                {language === 'sw'
                  ? 'Jumla inayotakiwa leo'
                  : 'Total required today'}
              </span>
              <strong>
                TZS {money(row.requiredToday)}
              </strong>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-600">
                {language === 'sw'
                  ? 'Jumla iliyotengwa leo'
                  : 'Total funded today'}
              </span>
              <strong className="text-emerald-700">
                TZS {money(row.fundedToday)}
              </strong>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-600">
                {language === 'sw'
                  ? 'Jumla ambayo bado haijalipiwa'
                  : 'Total still outstanding'}
              </span>
              <strong className="text-red-700">
                TZS {money(row.outstandingToday)}
              </strong>
            </div>
          </div>

          <div className="mt-3">
            <Badge
              tone={
                fullyFunded
                  ? 'green'
                  : partlyFunded
                    ? 'amber'
                    : 'red'
              }
            >
              {fullyFunded
                ? language === 'sw'
                  ? 'Yamelipiwa yote'
                  : 'Fully funded'
                : partlyFunded
                  ? language === 'sw'
                    ? 'Yamelipiwa sehemu'
                    : 'Partly funded'
                  : language === 'sw'
                    ? 'Hayajalipiwa'
                    : 'Not funded'}
            </Badge>
          </div>
        </div>
      );
    })}
  </div>

  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"></div>
    <table className="min-w-[1000px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          {[
            t('shop'),
            language === 'sw'
              ? 'Aina ya matumizi'
              : 'Expense',
            language === 'sw'
              ? 'Kinachotakiwa leo'
              : 'Required today',
            language === 'sw'
              ? 'Kilichotengwa leo'
              : 'Funded today',
            language === 'sw'
              ? 'Bado hakijalipiwa'
              : 'Still outstanding',
            t('status'),
          ].map((heading) => (
            <th key={heading} className="px-4 py-3">
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {localExpenseRows.map((row, index) => {
          const requiredToday = Number(
            row.requiredToday || 0
          );

          const fundedToday = Number(
            row.fundedToday || 0
          );

          const outstandingToday = Number(
            row.outstandingToday || 0
          );

          const fullyFunded =
            requiredToday > 0 &&
            outstandingToday <= 0;

          const partlyFunded =
            fundedToday > 0 &&
            outstandingToday > 0;

          return (
            <tr
  key={row.id}
  className={
  index < localExpenseRows.length - 1 &&
  String(localExpenseRows[index + 1]?.shop_id || '') !==
    String(row.shop_id || '')
    ? 'border-t border-b-[3px] border-t-slate-100 border-b-slate-600'
    : 'border-t border-slate-100'
}
>
              <td className="px-4 py-3 font-bold">
                {row.shop}
              </td>

              <td className="px-4 py-3">
                {expenseLabel(row.expense)}
              </td>

              <td className="px-4 py-3">
                TZS {money(requiredToday)}
              </td>

              <td className="px-4 py-3 font-bold text-emerald-700">
                TZS {money(fundedToday)}
              </td>

              <td className="px-4 py-3 font-black text-red-700">
                TZS {money(outstandingToday)}
              </td>

              <td className="px-4 py-3">
                <Badge
                  tone={
                    fullyFunded
                      ? 'green'
                      : partlyFunded
                        ? 'amber'
                        : 'red'
                  }
                >
                  {fullyFunded
                    ? language === 'sw'
                      ? 'Yamelipiwa yote'
                      : 'Fully funded'
                    : partlyFunded
                      ? language === 'sw'
                        ? 'Yamelipiwa sehemu'
                        : 'Partly funded'
                      : language === 'sw'
                        ? 'Hayajalipiwa'
                        : 'Not funded'}
                </Badge>
              </td>
            </tr>
          );
        })}

        {localExpenseRows.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-10 text-center text-sm text-slate-500"
            >
              {language === 'sw'
                ? 'Hakuna taarifa za matumizi yanayobaki dukani kwa tarehe hii.'
                : 'No local shop-expense information is available for this date.'}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
) : null}
            {activeTab === 'setup' ? (
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm xl:col-span-2">
  <h2 className="text-2xl font-black text-slate-950">
    {language === 'sw'
      ? 'Nauli na Umeme wa Kila Duka'
      : 'Monthly Fare and Electricity by Shop'}
  </h2>

  <p className="mt-2 text-sm text-slate-600">
    {language === 'sw'
      ? 'Weka jumla ya fedha ya nauli na umeme inayotakiwa kubaki dukani kila mwezi.'
      : 'Enter the total monthly fare and electricity amount that should remain at each shop.'}
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {(data?.shops || []).map((shop) => (
      <label
        key={shop.id}
        className="rounded-2xl border border-blue-200 bg-white p-4"
      >
        <span className="mb-2 block text-sm font-bold text-slate-800">
          {shop.name}
        </span>

        <input
          type="number"
          min="0"
         value={localMonthlyDrafts[shop.id] ?? ''}
          onChange={(event) =>
            setLocalMonthlyDrafts((current) => ({
              ...current,
              [shop.id]: event.target.value,
            }))
          }
          placeholder={
            language === 'sw'
              ? 'Kiasi kwa mwezi'
              : 'Monthly amount'
          }
          className="h-11 w-full rounded-xl border border-slate-300 px-3"
        />
        <div className="mt-2 text-xs font-semibold text-slate-600">
  {language === 'sw' ? 'Kiasi kilichohifadhiwa:' : 'Saved amount:'}{' '}
  TZS{' '}
  {money(
    shop.remittanceLocalMonthly ??
      shop.localMonthly ??
      shop.fareElectricityMonthly ??
      0
  )}
</div>
      </label>
    ))}
  </div>

  <button
    type="button"
    onClick={async () => {
        const changedShopIds = Object.keys(localMonthlyDrafts).filter((shopId) => {
  const shop = (data?.shops || []).find(
    (item) => String(item?.id) === String(shopId)
  );

  const savedAmount = Number(
    shop?.remittanceLocalMonthly ??
      shop?.localMonthly ??
      shop?.fareElectricityMonthly ??
      0
  );

  const newAmount = Number(localMonthlyDrafts[shopId] || 0);

  return newAmount !== savedAmount;
});

if (changedShopIds.length === 0) {
  alert(
    language === 'sw'
      ? 'Hakuna kiasi kipya kilichobadilishwa.'
      : 'No new amount has been changed.'
  );
  return;
}
try {
  await Promise.all(
    changedShopIds.map((shopId) =>
      saveShopMonthlySettingToSupabase(
        shopId,
        Number(localMonthlyDrafts[shopId] || 0)
      )
    )
  );
} catch (error) {
  alert(
    language === 'sw'
      ? `Kiasi hakijahifadhiwa Supabase: ${error.message}`
      : `The amount was not saved to Supabase: ${error.message}`
  );
  return;
}
      const nextShops = (data?.shops || []).map((shop) => ({
        ...shop,
        remittanceLocalMonthly: Number(
          localMonthlyDrafts[shop.id] ??
            shop.remittanceLocalMonthly ??
            shop.localMonthly ??
            shop.fareElectricityMonthly ??
            0
        ),
      }));

      await saveData({
  ...data,
  shops: nextShops,
});

setLocalMonthlyDrafts((current) => {
  const nextDrafts = { ...current };

  changedShopIds.forEach((shopId) => {
    delete nextDrafts[shopId];
  });

  return nextDrafts;
});

alert(
  language === 'sw'
    ? 'Kiasi cha nauli na umeme kimehifadhiwa kwa mafanikio.'
    : 'The fare and electricity amount was saved successfully.'
);
setLocalMonthlyDrafts({});

alert(
        language === 'sw'
          ? 'Kiasi cha nauli na umeme cha kila duka kimehifadhiwa.'
          : 'Monthly fare and electricity amounts have been saved.'
      );
    }}
    className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
  >
    {language === 'sw'
      ? 'Hifadhi Nauli na Umeme'
      : 'Save Fare and Electricity'}
  </button>
</div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black">{t('addExpense')}</h2>

                  <form
                    className="mt-5 grid gap-4 md:grid-cols-2"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      const expenseName = String(form.get('expenseName') || '').trim();
                      const shop = String(form.get('shop') || '');
                      const amount = Number(form.get('amount') || 0);
                      const due = String(form.get('due') || '');
                      const location = String(form.get('location') || 'owner');

                      if (!expenseName || !shop || amount <= 0 || !due) return;

                      const selectedShop = (data?.shops || []).find(
  (item) => String(item?.name || '') === String(shop)
);

const newExpenseFund = {
  id: `expense-fund-${Date.now()}`,
  shop_id: selectedShop?.id || '',
  shop: selectedShop?.name || shop,
  expense: expenseName,
  target: amount,
  funded: 0,
  due,
  location,
  created_at: new Date().toISOString(),
};

const { error: expenseFundSaveError } = await supabase
  .from('remittanceExpenseFunds')
  .insert([
    {
      id: newExpenseFund.id,
      shop_id: newExpenseFund.shop_id,
      shop_name: newExpenseFund.shop,
      expense: newExpenseFund.expense,
      target: newExpenseFund.target,
      funded: newExpenseFund.funded,
      due: newExpenseFund.due,
      location: newExpenseFund.location,
      created_at: newExpenseFund.created_at,
    },
  ]);

if (expenseFundSaveError) {
  alert(
    language === 'sw'
      ? `Matumizi hayajahifadhiwa: ${expenseFundSaveError.message}`
      : `Expense fund was not saved: ${expenseFundSaveError.message}`
  );
  return;
}

const nextFunds = [...funds, newExpenseFund];

setFunds(nextFunds);

await saveData({
  ...data,
  remittanceExpenseFunds: nextFunds,
});

event.currentTarget.reset();

alert(
  language === 'sw'
    ? 'Matumizi yamehifadhiwa.'
    : 'Expense fund has been saved.'
);
                    }}
                  >
                    <label>
                      <span className="mb-1 block text-sm font-bold">{t('expenseName')}</span>
                      <input
                        name="expenseName"
                        className="h-11 w-full rounded-xl border border-slate-300 px-3"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-bold">{t('shop')}</span>
                      <select
                        name="shop"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                      >
                        {rows.map((shop) => (
                          <option key={shop.id} value={shop.name}>
                            {shop.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-bold">{t('amount')}</span>
                      <input
                        name="amount"
                        type="number"
                        className="h-11 w-full rounded-xl border border-slate-300 px-3"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-bold">{t('dueDate')}</span>
                      <input
                        name="due"
                        type="date"
                        className="h-11 w-full rounded-xl border border-slate-300 px-3"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-sm font-bold">{t('location')}</span>
                      <select
                        name="location"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                      >
                        <option value="owner">{t('ownerRole')}</option>
                        <option value="shop">{t('shopRole')}</option>
                      </select>
                    </label>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="h-11 rounded-xl bg-blue-700 px-5 font-bold text-white"
                      >
                        {t('addPreview')}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black">{t('includedRules')}</h2>
                  <div className="mt-5 space-y-3">
                    {[t('rule1'), t('rule2'), t('rule3'), t('rule4')].map((rule) => (
                      <div
                        key={rule}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span>{rule}</span>
                        <strong>✓</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

{activeTab === 'accountability' ? (
  <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:[&>*:first-child]:col-span-2 lg:[&>*:nth-child(2)]:sticky lg:[&>*:nth-child(2)]:top-4 lg:[&>*:nth-child(2)]:flex-col lg:[&>*:nth-child(2)>button]:w-full lg:[&>*:nth-child(2)>button]:text-left lg:[&>*:nth-child(n+3)]:col-start-2">
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-black uppercase tracking-wide text-emerald-700">
            {language === 'sw'
              ? 'Mfumo wa Udhibiti wa Fedha'
              : 'Central Funds Control'}
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {language === 'sw'
              ? 'Fedha Kuu na Uwajibikaji'
              : 'Central Funds & Accountability'}
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
            {language === 'sw'
              ? 'Sehemu hii itasimamia fedha zinazokusanywa kutoka madukani, malipo ya matumizi, fedha ya mmiliki, mikopo ya dharura kati ya mafungu na marejesho yake.'
              : 'This section will control funds collected from shops, expense payments, owner funds, emergency borrowing between funds and repayments.'}
          </p>
        </div>

        <Badge tone="green">
          {language === 'sw'
            ? 'Mmiliki pekee'
            : 'Owner only'}
        </Badge>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      {[
        [
          'summary',
          language === 'sw'
            ? 'Muhtasari'
            : 'Summary',
        ],
       [
  'funds',
  language === 'sw'
    ? 'Mafungu kwa Kila Duka'
    : 'Funds by Shop',
],
[
  'ledger',
  language === 'sw'
    ? 'Rejesta ya Fedha Zote'
    : 'All Funds Register',
],
[
  'owner',
  language === 'sw'
    ? 'Faida ya Mmiliki'
    : 'Owner Profit',
],
[
  'emergency',
  language === 'sw'
    ? 'Mikopo ya Dharura'
    : 'Emergency Borrowing',
],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() =>
            setActiveAccountabilitySection(value)
          }
          className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
            activeAccountabilitySection === value
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>

    <div
      className={`${
        activeAccountabilitySection === 'summary'
          ? 'grid'
          : 'hidden'
      } gap-4 sm:grid-cols-2 xl:grid-cols-4`}
    >
      <StatCard
        label={
          language === 'sw'
            ? 'Jumla ya fedha zilizopokelewa'
            : 'Total central funds received'
        }
        value={centralFundSummary.selectedPeriodReceived}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Fedha zilizotumika'
            : 'Confirmed withdrawals'
        }
        value={centralFundSummary.selectedPeriodWithdrawals}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Fedha zilizopo kwa msimamizi'
            : 'Central funds currently held'
        }
        value={centralFundSummary.centralFundsHeld}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Mikopo ya dharura ambayo haijarejeshwa'
            : 'Outstanding emergency borrowing'
        }
        value={
          centralFundSummary.outstandingEmergencyBorrowing
        }
      />
    </div>

    <div
  style={{
    display:
      activeAccountabilitySection === 'funds'
        ? 'block'
        : 'none',
  }}
  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
>
  <div>
  <h3 className="text-xl font-black text-slate-950">
    {language === 'sw'
      ? 'Fedha za Matumizi kwa Kila Duka'
      : 'Expense Funds by Shop'}
  </h3>
    <p className="mt-1 text-sm leading-6 text-slate-600">
      {language === 'sw'
        ? 'Jedwali hili linaonyesha fedha iliyokusanywa katika kila fungu, fedha iliyotumika au kuhamishwa na salio linalopatikana.'
        : 'This table shows the amount accumulated in each fund, money used or transferred and the remaining available balance.'}
    </p>
  </div>

<div className="mt-5 space-y-6">
  {Object.values(
    alignedLedgerFundAccounts
      .filter(
        (account) => account.type === 'expense_fund'
      )
      .reduce((groupedShops, account) => {
        const shopKey = String(
          account.shopId ||
            account.shopName ||
            'owner'
        );

        if (!groupedShops[shopKey]) {
          groupedShops[shopKey] = {
            shopKey,
            shopName:
              account.shopName ||
              (language === 'sw'
                ? 'Mmiliki'
                : 'Owner'),
            accounts: [],
          };
        }

        groupedShops[shopKey].accounts.push(account);

        return groupedShops;
      }, {})
  ).map((shopGroup) => {
    const totalReceived =
      shopGroup.accounts.reduce(
        (total, account) =>
          total +
          Number(account.baseAmount || 0) +
          Number(account.moneyIn || 0) +
          Number(
            account.automaticCommissionAmount || 0
          ),
        0
      );

    const totalPaidOut =
      shopGroup.accounts.reduce(
        (total, account) =>
          total + Number(account.moneyOut || 0),
        0
      );

    const totalAvailable =
      shopGroup.accounts.reduce(
        (total, account) =>
          total +
          Number(account.availableBalance || 0),
        0
      );

    const fundedAccounts =
      shopGroup.accounts.filter(
        (account) =>
          Number(account.availableBalance || 0) > 0
      ).length;

    return (
      <div
        key={`shop-fund-group-${shopGroup.shopKey}`}
        className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm"
      >
        <div className="border-b border-emerald-200 bg-emerald-50 p-5">
          <h4 className="text-xl font-black uppercase text-slate-950">
            {shopGroup.shopName}
          </h4>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-4">
              <div className="text-xs font-bold uppercase text-slate-500">
                {language === 'sw'
                  ? 'Jumla iliyoingia'
                  : 'Total received'}
              </div>

              <div className="mt-1 text-lg font-black text-slate-950">
                TZS {money(totalReceived)}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="text-xs font-bold uppercase text-slate-500">
                {language === 'sw'
                  ? 'Jumla iliyotoka'
                  : 'Total paid out'}
              </div>

              <div className="mt-1 text-lg font-black text-rose-700">
                TZS {money(totalPaidOut)}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="text-xs font-bold uppercase text-slate-500">
                {language === 'sw'
                  ? 'Salio linalopatikana'
                  : 'Available balance'}
              </div>

              <div className="mt-1 text-lg font-black text-emerald-700">
                TZS {money(totalAvailable)}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="text-xs font-bold uppercase text-slate-500">
                {language === 'sw'
                  ? 'Mafungu yenye fedha'
                  : 'Funded accounts'}
              </div>

              <div className="mt-1 text-lg font-black text-slate-950">
                {fundedAccounts} /{' '}
                {shopGroup.accounts.length}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[750px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-5 py-3">
                  {language === 'sw'
                    ? 'Aina ya matumizi'
                    : 'Expense'}
                </th>

                <th className="px-5 py-3 text-right">
                  {language === 'sw'
                    ? 'Jumla iliyoingia'
                    : 'Total received'}
                </th>

                <th className="px-5 py-3 text-right">
                  {language === 'sw'
                    ? 'Iliyotoka'
                    : 'Paid out'}
                </th>

                <th className="px-5 py-3 text-right">
                  {language === 'sw'
                    ? 'Salio'
                    : 'Balance'}
                </th>

                <th className="px-5 py-3 text-center">
                  {language === 'sw'
                    ? 'Hali'
                    : 'Status'}
                </th>
              </tr>
            </thead>

            <tbody>
              {shopGroup.accounts.map((account) => {
                const balance = Number(
                  account.availableBalance || 0
                );

                const received =
                  Number(account.baseAmount || 0) +
                  Number(account.moneyIn || 0) +
                  Number(
                    account.automaticCommissionAmount || 0
                  );

                return (
                  <tr
                    key={`grouped-fund-${account.key}`}
                    className="border-t border-slate-200"
                  >
                    <td className="px-5 py-4 font-black text-slate-950">
                      {account.name}
                    </td>

                    <td className="px-5 py-4 text-right font-bold text-slate-900">
                      TZS {money(received)}
                    </td>

                    <td className="px-5 py-4 text-right font-bold text-rose-700">
                      TZS {money(account.moneyOut)}
                    </td>

                    <td className="px-5 py-4 text-right font-black text-emerald-700">
                      TZS {money(balance)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          balance < 0
                            ? 'bg-rose-100 text-rose-800'
                            : balance > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {balance < 0
                          ? language === 'sw'
                            ? 'Upungufu'
                            : 'Shortfall'
                          : balance > 0
                            ? language === 'sw'
                              ? 'Inapatikana'
                              : 'Available'
                            : language === 'sw'
                              ? 'Hakuna salio'
                              : 'No balance'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  })}
</div>
</div>

<div
  style={{
    display:
      activeAccountabilitySection === 'ledger'
        ? 'block'
        : 'none',
  }}
  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
>
  <div>
   <h3 className="text-xl font-black text-slate-950">
  {language === 'sw'
    ? 'Rejesta ya Fedha Zote'
    : 'All Funds Register'}
</h3>

    <p className="mt-1 text-sm leading-6 text-slate-600">
  {language === 'sw'
    ? 'Rejesta hii inaonyesha fedha zote za matumizi za kila duka pamoja na faida ya mmiliki, fedha iliyokusanywa, iliyohamishwa, iliyotumika na salio lililobaki.'
    : 'This register shows every shop’s expense funds together with owner profit, money collected, transferred, used and the remaining balance.'}
</p>

<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {Object.values(
    alignedLedgerFundAccounts.reduce(
      (totals, account) => {
        const categoryName = String(
          account?.name ||
            (language === 'sw'
              ? 'Fedha nyingine'
              : 'Other funds')
        ).trim();

        const categoryKey = categoryName.toLowerCase();

        if (!totals[categoryKey]) {
          totals[categoryKey] = {
            name: categoryName,
            balance: 0,
          };
        }

        totals[categoryKey].balance += Number(
          account?.availableBalance || 0
        );

        return totals;
      },
      {}
    )
  ).map((category) => (
    <div
      key={`fund-category-total-${category.name}`}
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
    >
      <div className="text-xs font-black uppercase text-slate-600">
        {category.name}
      </div>

      <div className="mt-2 text-xl font-black text-emerald-800">
        TZS {money(category.balance)}
      </div>

      <div className="mt-1 text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Jumla inayopatikana'
          : 'Total available'}
      </div>
    </div>
    ))}
</div>

<div className="mt-5 flex flex-col gap-2 sm:max-w-sm">
  <label className="text-sm font-black text-slate-700">
    {language === 'sw'
      ? 'Chagua duka unalotaka kuona'
      : 'Select the shop to view'}
  </label>

  <select
    value={ledgerShopFilter}
    onChange={(event) =>
      setLedgerShopFilter(event.target.value)
    }
    className="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
  >
    <option value="all">
      {language === 'sw'
        ? 'Maduka yote na Mmiliki'
        : 'All shops and Owner'}
    </option>

    <option value="owner">
      {language === 'sw'
        ? 'Mmiliki pekee'
        : 'Owner only'}
    </option>

    {(Array.isArray(data?.shops) ? data.shops : []).map(
      (shop) => (
        <option
          key={`ledger-shop-option-${shop.id}`}
          value={String(shop.id)}
        >
          {shop.name}
        </option>
      )
    )}
  </select>
</div>
</div>
<div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
    <table className="min-w-[900px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          <th className="px-4 py-3">
            {language === 'sw'
  ? 'Aina ya Fedha'
  : 'Type of Funds'}
          </th>

          <th className="px-4 py-3">
            {language === 'sw'
              ? 'Duka / Mmiliki'
              : 'Shop / Owner'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Iliyokusanywa'
              : 'Accumulated'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Iliyoingia kutoka fungu jingine'
              : 'Transferred in'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Iliyotumika / kuhamishwa'
              : 'Used / transferred out'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Salio linalopatikana'
              : 'Available balance'}
          </th>
        </tr>
      </thead>

      <tbody>
        {alignedLedgerFundAccounts
  .filter((account) => {
    if (ledgerShopFilter === 'all') {
      return true;
    }

    if (ledgerShopFilter === 'owner') {
      return account.type === 'owner_profit';
    }

    return (
      String(account?.shopId || '') ===
      String(ledgerShopFilter)
    );
  })
  .map((account) => (
          <tr
            key={account.key}
            className="border-t border-slate-200"
          >
            <td className="px-4 py-3 font-bold text-slate-950">
              {account.name}
            </td>

            <td className="px-4 py-3 text-slate-700">
              {account.shopName || '—'}
            </td>

            <td className="px-4 py-3 text-right">
              TZS {money(account.baseAmount)}
            </td>

            <td className="px-4 py-3 text-right text-emerald-700">
              TZS {money(account.moneyIn)}
            </td>

            <td className="px-4 py-3 text-right text-rose-700">
              TZS {money(account.moneyOut)}
            </td>

            <td
              className={`px-4 py-3 text-right font-black ${
                Number(account.availableBalance || 0) < 0
                  ? 'text-rose-700'
                  : 'text-emerald-700'
              }`}
            >
              TZS {money(account.availableBalance)}
            </td>
          </tr>
        ))}

        {alignedLedgerFundAccounts.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-8 text-center text-slate-500"
            >
              {language === 'sw'
                ? 'Hakuna akaunti ya fedha inayopatikana.'
                : 'No fund account is available.'}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
</div>

<div
  className={`${
    activeAccountabilitySection === 'summary'
      ? 'block'
      : 'hidden'
  } rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm`}
>
  <div>
    <h3 className="text-xl font-black text-slate-950">
      {language === 'sw'
        ? 'Sajili Malipo ya Matumizi'
        : 'Record Expense Payment'}
    </h3>

    <p className="mt-1 text-sm leading-6 text-slate-600">
      {language === 'sw'
        ? 'Chagua fungu halisi lililotumika. Malipo yatapunguza salio la fungu hilo pekee na fedha zilizopo kwa msimamizi.'
        : 'Select the exact fund used. The payment will reduce only that fund and the physical central funds held.'}
    </p>
  </div>

  <div className="mt-5 grid gap-4 md:grid-cols-2">
    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Fungu la matumizi'
          : 'Expense fund'}
      </span>

      <select
        value={expensePaymentFundKey}
        onChange={(event) =>
          setExpensePaymentFundKey(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
      >
        <option value="">
          {language === 'sw'
            ? '-- Chagua fungu --'
            : '-- Select fund --'}
        </option>
<optgroup
  label={
    language === 'sw'
      ? 'JUMLA ZA MADUKA YOTE'
      : 'CONSOLIDATED TOTALS'
  }
>
  {consolidatedExpenseFundOptions.map(
    (category) => (
      <option
        key={category.key}
        value={category.key}
      >
        {category.name} — Jumla TZS{' '}
        {money(category.availableBalance)}
      </option>
    )
  )}
</optgroup>

<optgroup
  label={
    language === 'sw'
      ? 'MAFUNGU YA DUKA MOJA MOJA'
      : 'INDIVIDUAL SHOP FUNDS'
  }
>
  {alignedLedgerFundAccounts
    .filter(
      (account) =>
        account.type === 'expense_fund' &&
        Number(account.availableBalance || 0) > 0
    )
    .map((account) => (
      <option
        key={account.key}
        value={account.key}
      >
        {account.shopName
          ? `${account.shopName} — `
          : ''}
        {account.name} — TZS{' '}
        {money(account.availableBalance)}
      </option>
    ))}
</optgroup>
      </select>
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Kiasi kilicholipwa'
          : 'Amount paid'}
      </span>

      <input
        type="text"
        inputMode="decimal"
        value={expensePaymentAmount}
        onChange={(event) =>
          setExpensePaymentAmount(
            event.target.value.replace(
              /[^\d,]/g,
              ''
            )
          )
        }
        placeholder="0"
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Tarehe ya malipo'
          : 'Payment date'}
      </span>

      <input
        type="date"
        value={expensePaymentDate}
        onChange={(event) =>
          setExpensePaymentDate(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Aliyelipwa'
          : 'Payee'}
      </span>

      <input
        type="text"
        value={expensePaymentPayee}
        onChange={(event) =>
          setExpensePaymentPayee(
            event.target.value
          )
        }
        placeholder={
          language === 'sw'
            ? 'Mfano: TRA'
            : 'Example: TRA'
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
      />
    </label>
<label className="space-y-2">
  <span className="text-sm font-bold text-slate-700">
    {language === 'sw'
      ? 'Duka ambalo matumizi yameelekezwa — si lazima'
      : 'Beneficiary shop — optional'}
  </span>

  <select
    value={expensePaymentBeneficiaryShopId}
    onChange={(event) =>
      setExpensePaymentBeneficiaryShopId(
        event.target.value
      )
    }
    className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
  >
    <option value="">
      {language === 'sw'
        ? 'Matumizi ya jumla / maduka yote'
        : 'General expense / all shops'}
    </option>

    {(Array.isArray(data?.shops) ? data.shops : []).map(
      (shopItem) => (
        <option
          key={shopItem.id}
          value={shopItem.id}
        >
          {shopItem.name}
        </option>
      )
    )}
  </select>
</label>
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Njia ya malipo'
          : 'Payment method'}
      </span>

      <select
        value={expensePaymentMethod}
        onChange={(event) =>
          setExpensePaymentMethod(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
      >
        <option value="cash">Cash</option>
        <option value="mpesa">M-Pesa</option>
        <option value="bank">
          {language === 'sw'
            ? 'Benki'
            : 'Bank'}
        </option>
      </select>
    </label>

    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Sababu ya malipo'
          : 'Payment purpose'}
      </span>

      <textarea
        value={expensePaymentPurpose}
        onChange={(event) =>
          setExpensePaymentPurpose(
            event.target.value
          )
        }
        rows={3}
        placeholder={
          language === 'sw'
            ? 'Mfano: Malipo ya kodi ya TRA'
            : 'Example: TRA tax payment'
        }
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
    </label>

    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Namba ya muamala au kumbukumbu — si lazima'
          : 'Transaction or reference number — optional'}
      </span>

      <input
        type="text"
        value={expensePaymentReference}
        onChange={(event) =>
          setExpensePaymentReference(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500"
      />
    </label>
  </div>

  <div className="mt-5 flex justify-end">
    <button
      type="button"
      onClick={saveExpensePayment}
      disabled={expensePaymentSaving}
      className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {expensePaymentSaving
        ? language === 'sw'
          ? 'Inahifadhi...'
          : 'Saving...'
        : language === 'sw'
          ? 'Thibitisha Malipo'
          : 'Confirm Expense Payment'}
    </button>
  </div>
</div>
    <div
  className={`${
    activeAccountabilitySection === 'owner'
      ? 'block'
      : 'hidden'
  } rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm`}
>
  <div className="mb-4">
    <h3 className="text-xl font-black text-slate-950">
      {language === 'sw'
        ? 'Akaunti ya Faida ya Mmiliki'
        : 'Owner Profit Account'}
    </h3>

        <p className="mt-1 text-sm text-slate-600">
          {language === 'sw'
            ? 'Fedha ya mmiliki inaonyeshwa tofauti na matumizi ya biashara.'
            : 'Owner funds are shown separately from business expenses.'}
        </p>
      </div>

<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
  <StatCard
    label={
      language === 'sw'
        ? 'Faida ya mmiliki iliyokusanywa'
        : 'Owner profit accumulated'
    }
    value={
      Number(ownerProfitAccount.baseAmount || 0) +
      Number(ownerProfitAccount.moneyIn || 0) +
      Number(ownerProfitAccount.automaticCommissionAmount || 0)
    }
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Fedha ambazo mmiliki amechukua'
        : 'Owner drawings taken'
    }
    value={ownerProfitAccount.moneyOut}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Faida ya mmiliki iliyobaki'
        : 'Owner profit available'
    }
    value={ownerProfitAccount.availableBalance}
  />
</div>

<div className="mt-5 rounded-2xl border border-violet-200 bg-white p-4">
  <div className="mb-3 text-sm font-black uppercase tracking-wide text-violet-800">
    {language === 'sw'
      ? 'Mchanganuo wa Faida ya Mmiliki'
      : 'Owner Profit Breakdown'}
  </div>

  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Faida ghafi iliyopatikana'
          : 'Gross profit generated'}
      </div>
      <div className="mt-1 font-black">
        TZS {money(
          centralFundSummary.ownerProfitGrossProfitGenerated
        )}
      </div>
    </div>

    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Fedha iliyotumika kulipia matumizi'
          : 'Less expenses funded'}
      </div>
      <div className="mt-1 font-black text-red-700">
        TZS {money(
          centralFundSummary.ownerProfitExpensesFunded
        )}
      </div>
    </div>

    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs font-bold text-slate-500">
        {language === 'sw'
          ? 'Faida baada ya matumizi'
          : 'Net profit after expenses'}
      </div>
      <div className="mt-1 font-black">
        TZS {money(
          centralFundSummary.ownerProfitNetProfitAfterExpenses
        )}
      </div>
    </div>

    <div className="rounded-xl bg-violet-50 p-3">
      <div className="text-xs font-bold text-violet-700">
        {language === 'sw'
          ? 'Asilimia 70 ya mmiliki'
          : 'Owner 70%'}
      </div>
      <div className="mt-1 font-black text-violet-800">
        TZS {money(
          centralFundSummary.ownerProfitOwner70
        )}
      </div>
    </div>

    <div className="rounded-xl bg-orange-50 p-3">
      <div className="text-xs font-bold text-orange-700">
        {language === 'sw'
          ? 'Faida ya gesi kwa mmiliki'
          : 'Gas owner profit'}
      </div>
      <div className="mt-1 font-black text-orange-800">
        TZS {money(
          centralFundSummary.ownerProfitGasOwnerProfit
        )}
      </div>
    </div>

    <div className="rounded-xl bg-cyan-50 p-3">
      <div className="text-xs font-bold text-cyan-700">
        {language === 'sw'
          ? 'Faida ya kamisheni kwa mmiliki'
          : 'Commission owner profit'}
      </div>
      <div className="mt-1 font-black text-cyan-800">
        TZS {money(
          ownerProfitAccount.automaticCommissionAmount
        )}
      </div>
    </div>

    <div className="rounded-xl bg-red-50 p-3">
      <div className="text-xs font-bold text-red-700">
        {language === 'sw'
          ? 'Fedha ambazo mmiliki amechukua'
          : 'Owner drawings taken'}
      </div>
      <div className="mt-1 font-black text-red-800">
        TZS {money(ownerProfitAccount.moneyOut)}
      </div>
    </div>

    <div className="rounded-xl bg-emerald-50 p-3">
      <div className="text-xs font-bold text-emerald-700">
        {language === 'sw'
          ? 'Faida ya mmiliki iliyobaki'
          : 'Owner profit available'}
      </div>
      <div className="mt-1 font-black text-emerald-800">
        TZS {money(ownerProfitAccount.availableBalance)}
      </div>
    </div>
  </div>
</div>
    </div>
{activeAccountabilitySection === 'owner' ? (
  <div className="flex justify-end">
    <button
      type="button"
      onClick={() =>
        setShowOwnerDrawingForm(
          (currentValue) => !currentValue
        )
      }
      className="rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-violet-800"
    >
      {showOwnerDrawingForm
        ? language === 'sw'
          ? 'Funga Fomu'
          : 'Close Form'
        : language === 'sw'
          ? 'Sajili Fedha Mpya'
          : 'Record New Drawing'}
    </button>
  </div>
) : null}

<div
  className={`${
    activeAccountabilitySection === 'owner' &&
    showOwnerDrawingForm
      ? 'block'
      : 'hidden'
  } rounded-3xl border border-violet-200 bg-white p-6 shadow-sm`}
>
  <div>
    <h3 className="text-xl font-black text-slate-950">
      {language === 'sw'
        ? 'Sajili Fedha Anayochukua Mmiliki'
        : 'Record Owner Drawing'}
    </h3>

    <p className="mt-1 text-sm leading-6 text-slate-600">
      {language === 'sw'
        ? 'Fedha hii itapunguzwa kwenye faida ya mmiliki na fedha zilizopo kwa msimamizi. Haitahesabiwa kama matumizi ya biashara.'
        : 'This amount will reduce owner profit and central funds held. It will not be recorded as a business expense.'}
    </p>
  </div>

  <div className="mt-5 grid gap-4 md:grid-cols-2">
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Kiasi anachochukua'
          : 'Drawing amount'}
      </span>

      <input
        type="text"
        inputMode="decimal"
        value={ownerDrawingAmount}
        onChange={(event) =>
          setOwnerDrawingAmount(
            event.target.value.replace(/[^\d,]/g, '')
          )
        }
        placeholder="0"
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Njia ya kuchukua fedha'
          : 'Payment method'}
      </span>

      <select
        value={ownerDrawingPaymentMethod}
        onChange={(event) =>
          setOwnerDrawingPaymentMethod(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
      >
        <option value="cash">Cash</option>
        <option value="mpesa">M-Pesa</option>
        <option value="bank">
          {language === 'sw'
            ? 'Benki'
            : 'Bank'}
        </option>
      </select>
    </label>

    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Sababu au matumizi ya fedha'
          : 'Purpose'}
      </span>

      <textarea
        value={ownerDrawingPurpose}
        onChange={(event) =>
          setOwnerDrawingPurpose(event.target.value)
        }
        rows={3}
        placeholder={
          language === 'sw'
            ? 'Mfano: Matumizi binafsi'
            : 'Example: Personal use'
        }
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
      />
    </label>

    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Namba ya muamala au kumbukumbu — si lazima'
          : 'Transaction or reference number — optional'}
      </span>

      <input
        type="text"
        value={ownerDrawingPaymentReference}
        onChange={(event) =>
          setOwnerDrawingPaymentReference(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
      />
    </label>
  </div>

  <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-sm text-violet-900">
      <div>
        {language === 'sw'
          ? 'Faida ya mmiliki inayopatikana:'
          : 'Available owner profit:'}{' '}
        <strong>
          TZS{' '}
          {money(
            centralFundSummary.ownerProfitAvailable
          )}
        </strong>
      </div>

      <div className="mt-1">
        {language === 'sw'
          ? 'Fedha zilizopo kwa msimamizi:'
          : 'Central funds held:'}{' '}
        <strong>
          TZS{' '}
          {money(
            centralFundSummary.centralFundsHeld
          )}
        </strong>
      </div>
    </div>

    <button
      type="button"
      onClick={saveOwnerDrawing}
      disabled={ownerDrawingSaving}
      className="rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {ownerDrawingSaving
        ? language === 'sw'
          ? 'Inahifadhi...'
          : 'Saving...'
        : language === 'sw'
          ? 'Thibitisha Fedha ya Mmiliki'
          : 'Confirm Owner Drawing'}
    </button>
  </div>
</div>
<div
  className={`${
    activeAccountabilitySection === 'emergency'
      ? 'block'
      : 'hidden'
  } rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm`}
>
  <div>
    <h3 className="text-xl font-black text-slate-950">
      {language === 'sw'
        ? 'Mikopo ya Dharura na Vikumbusho'
        : 'Emergency Borrowing and Reminders'}
    </h3>

    <p className="mt-1 text-sm leading-6 text-slate-600">
      {language === 'sw'
        ? 'Mfumo utaendelea kuonyesha fedha zilizokopwa mpaka zitakaporejeshwa kikamilifu.'
        : 'The system will continue showing borrowed funds until they are fully restored.'}
    </p>
  </div>

  <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
    <table className="min-w-[1150px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          <th className="px-4 py-3">
            {language === 'sw'
              ? 'Fungu lililotoa'
              : 'Source fund'}
          </th>

          <th className="px-4 py-3">
            {language === 'sw'
              ? 'Fungu lililopokea'
              : 'Destination fund'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Kiasi kilichokopwa'
              : 'Borrowed'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Kilichorejeshwa'
              : 'Repaid'}
          </th>

          <th className="px-4 py-3 text-right">
            {language === 'sw'
              ? 'Bado kurejeshwa'
              : 'Remaining'}
          </th>

          <th className="px-4 py-3">
            {language === 'sw'
              ? 'Tarehe ya kurejesha'
              : 'Due date'}
          </th>

          <th className="px-4 py-3">
            {language === 'sw'
              ? 'Kumbusho'
              : 'Reminder'}
          </th>

          <th className="px-4 py-3">
            {language === 'sw'
              ? 'Sababu'
              : 'Purpose'}
          </th>
        </tr>
      </thead>

      <tbody>
        {emergencyBorrowingRecords.map((record) => {
          const statusText = {
            fully_repaid:
              language === 'sw'
                ? 'Imerejeshwa kikamilifu'
                : 'Fully repaid',

            overdue:
              language === 'sw'
                ? `Imechelewa siku ${Math.abs(
                    Number(record.daysRemaining || 0)
                  )}`
                : `Overdue by ${Math.abs(
                    Number(record.daysRemaining || 0)
                  )} days`,

            due_today:
              language === 'sw'
                ? 'Inatakiwa kurejeshwa leo'
                : 'Due today',

            due_soon:
              language === 'sw'
                ? `Imebaki siku ${record.daysRemaining}`
                : `${record.daysRemaining} days remaining`,

            outstanding:
              language === 'sw'
                ? 'Bado haijarejeshwa'
                : 'Still outstanding',
          }[record.reminderStatus];

          const statusClass = {
            fully_repaid:
              'bg-emerald-100 text-emerald-800',

            overdue:
              'bg-rose-100 text-rose-800',

            due_today:
              'bg-red-100 text-red-800',

            due_soon:
              'bg-amber-100 text-amber-800',

            outstanding:
              'bg-blue-100 text-blue-800',
          }[record.reminderStatus];

          return (
            <tr
              key={record.id}
              className={`border-t border-slate-200 ${
                record.reminderStatus === 'overdue'
                  ? 'bg-rose-50'
                  : ''
              }`}
            >
              <td className="px-4 py-3">
                <div className="font-bold text-slate-950">
                  {record.sourceFundName || '—'}
                </div>

                <div className="text-xs text-slate-500">
                  {record.sourceShopName || ''}
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="font-bold text-slate-950">
                  {record.destinationFundName || '—'}
                </div>

                <div className="text-xs text-slate-500">
                  {record.destinationShopName || ''}
                </div>
              </td>

              <td className="px-4 py-3 text-right">
                TZS {money(record.borrowedAmount)}
              </td>

              <td className="px-4 py-3 text-right text-emerald-700">
                TZS {money(record.repaidAmount)}
              </td>

              <td className="px-4 py-3 text-right font-black text-rose-700">
                TZS {money(record.remainingAmount)}
              </td>

              <td className="px-4 py-3">
                {record.dueDate || '—'}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClass}`}
                >
                  {statusText}
                </span>
              </td>

              <td className="px-4 py-3 text-slate-700">
                {record.purpose || '—'}
              </td>
            </tr>
          );
        })}

        {emergencyBorrowingRecords.length === 0 ? (
          <tr>
            <td
              colSpan={8}
              className="px-4 py-8 text-center text-slate-500"
            >
              {language === 'sw'
                ? 'Hakuna mkopo wa dharura uliosajiliwa.'
                : 'No emergency borrowing has been recorded.'}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
</div>

{activeAccountabilitySection === 'emergency' ? (
  <div className="flex justify-end">
    <button
      type="button"
      onClick={() =>
        setShowEmergencyBorrowingForm(
          (currentValue) => !currentValue
        )
      }
      className="rounded-2xl bg-rose-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-rose-800"
    >
      {showEmergencyBorrowingForm
        ? language === 'sw'
          ? 'Funga Fomu'
          : 'Close Form'
        : language === 'sw'
          ? 'Sajili Mkopo Mpya'
          : 'Record New Emergency Loan'}
    </button>
  </div>
) : null}

<div
  className={`${
    activeAccountabilitySection === 'emergency' &&
    showEmergencyBorrowingForm
      ? 'block'
      : 'hidden'
  } rounded-3xl border border-rose-200 bg-white p-6 shadow-sm`}
>
  <div>
    <h3 className="text-xl font-black text-slate-950">
  {language === 'sw'
    ? 'Sajili Mkopo wa Dharura'
    : 'Record Emergency Borrowing'}
</h3>

    <p className="mt-1 text-sm leading-6 text-slate-600">
      {language === 'sw'
        ? 'Fedha itatolewa kutoka fungu moja na kuongezwa kwenye fungu jingine. Jumla ya fedha zilizopo kwa msimamizi haitabadilika mpaka fedha itakapotumika kulipa matumizi.'
        : 'Money will move from one fund to another. Total central cash will not change until the money is actually spent.'}
    </p>
  </div>

  <div className="mt-5 grid gap-4 md:grid-cols-2">
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Fungu linalotoa fedha'
          : 'Source fund'}
      </span>

      <select
        value={emergencySourceFundKey}
        onChange={(event) =>
          setEmergencySourceFundKey(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500"
      >
        <option value="">
          {language === 'sw'
            ? '-- Chagua fungu --'
            : '-- Select fund --'}
        </option>

        {alignedLedgerFundAccounts
          .filter(
            (account) =>
              Number(account.availableBalance || 0) > 0
          )
          .map((account) => (
            <option
              key={account.key}
              value={account.key}
            >
              {account.shopName
                ? `${account.shopName} — `
                : ''}
              {account.name} — TZS{' '}
              {money(account.availableBalance)}
            </option>
          ))}
      </select>
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Fungu linalopokea fedha'
          : 'Destination fund'}
      </span>

      <select
        value={emergencyDestinationFundKey}
        onChange={(event) =>
          setEmergencyDestinationFundKey(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500"
      >
        <option value="">
          {language === 'sw'
            ? '-- Chagua fungu --'
            : '-- Select fund --'}
        </option>

        {alignedLedgerFundAccounts
          .filter(
            (account) =>
              account.key !== emergencySourceFundKey
          )
          .map((account) => (
            <option
              key={account.key}
              value={account.key}
            >
              {account.shopName
                ? `${account.shopName} — `
                : ''}
              {account.name}
            </option>
          ))}
      </select>
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Kiasi kinachokopwa'
          : 'Amount borrowed'}
      </span>

      <input
        type="text"
        inputMode="decimal"
        value={emergencyBorrowingAmount}
        onChange={(event) =>
          setEmergencyBorrowingAmount(
            event.target.value.replace(/[^\d,]/g, '')
          )
        }
        placeholder="0"
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500"
      />
    </label>

    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Tarehe ya kurejesha'
          : 'Repayment due date'}
      </span>

      <input
        type="date"
        value={emergencyBorrowingDueDate}
        onChange={(event) =>
          setEmergencyBorrowingDueDate(
            event.target.value
          )
        }
        min={new Date().toISOString().slice(0, 10)}
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500"
      />
    </label>

    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Sababu ya kukopa fedha'
          : 'Reason for borrowing'}
      </span>

      <textarea
        value={emergencyBorrowingPurpose}
        onChange={(event) =>
          setEmergencyBorrowingPurpose(
            event.target.value
          )
        }
        rows={3}
        placeholder={
          language === 'sw'
            ? 'Mfano: Dharura ya matibabu'
            : 'Example: Medical emergency'
        }
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-500"
      />
    </label>

    <label className="space-y-2 md:col-span-2">
      <span className="text-sm font-bold text-slate-700">
        {language === 'sw'
          ? 'Kumbukumbu — si lazima'
          : 'Reference — optional'}
      </span>

      <input
        type="text"
        value={emergencyBorrowingReference}
        onChange={(event) =>
          setEmergencyBorrowingReference(
            event.target.value
          )
        }
        className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500"
      />
    </label>
  </div>

  <div className="mt-5 flex justify-end">
    <button
      type="button"
      onClick={saveEmergencyBorrowing}
      disabled={emergencyBorrowingSaving}
      className="rounded-2xl bg-rose-700 px-5 py-3 text-sm font-black text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {emergencyBorrowingSaving
        ? language === 'sw'
          ? 'Inahifadhi...'
          : 'Saving...'
        : language === 'sw'
          ? 'Thibitisha Mkopo wa Dharura'
          : 'Confirm Emergency Borrowing'}
    </button>
  </div>
</div>
    <div className="hidden rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900 shadow-sm">
      <strong>
        {language === 'sw'
          ? 'Hatua inayofuata:'
          : 'Next step:'}
      </strong>{' '}

      {language === 'sw'
  ? 'Hatua inayofuata ni kusajili mikopo ya dharura kati ya mafungu, kuweka tarehe ya kurejesha na kutoa kumbusho hadi fedha itakaporejeshwa.'
  : 'The next step is to record emergency borrowing between funds, set repayment dates and issue reminders until the money is restored.'}
    </div>
  </div>
) : null}

 <div
  style={{
    display: activeTab === 'reports' ? 'block' : 'none',
  }}
  className="space-y-5"
>
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {[
        ['daily-remittance', t('report1')],
        ['monthly-funding', t('report2')],
        ['shop-compliance', t('report3')],
        ['expense-allocation', t('report4')],
        ['local-funds', t('report5')],
        ['profit-allocation', t('report6')],
        [
          'home-expenses',
          language === 'sw'
            ? 'Ripoti ya Matumizi ya Nyumbani'
            : 'Home Expenses Report',
        ],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setActiveReport(value)}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            activeReport === value
              ? 'bg-blue-700 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>

{activeReport === 'daily-remittance' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h2 className="text-xl font-black text-blue-950">
        {t('report1')}
      </h2>

      <p className="mt-2 text-sm text-blue-900">
        {language === 'sw'
          ? 'Ripoti hii inaonyesha hali ya mauzo, matumizi, faida na kiasi kinachotakiwa kutolewa na kila duka kwa kipindi kilichochaguliwa.'
          : 'This report shows each shop’s sales, expenses, profit and amount required to submit for the selected period.'}
      </p>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1700px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            {[
              language === 'sw' ? 'Kipindi' : 'Period',
              t('shop'),
              t('sales'),
              t('replaceProducts'),
              t('grossProfit'),
              language === 'sw'
                ? 'Matumizi yaliyobaki dukani'
                : 'Local expenses funded',
              language === 'sw'
                ? 'Matumizi ya kituo kikuu'
                : 'Central expenses funded',
              t('owner70'),
              t('shop30'),
              language === 'sw'
                ? 'Kiasi kinachotakiwa kutolewa'
                : 'Amount required to submit',
              language === 'sw'
                ? 'Matumizi ambayo bado hayajalipiwa'
                : 'Outstanding expenses',
              t('status'),
            ].map((heading) => (
              <th key={heading} className="px-4 py-3">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((shop) => {
            const outstandingExpenses = Math.max(
              0,
              Number(shop.expensesStillOutstanding || 0)
            );

            const expensesFunded = Math.max(
              0,
              Number(shop.expensesFundedAutomatically || 0)
            );

            const totalExpenseObligation = Math.max(
              0,
              Number(shop.totalExpenseObligation || 0)
            );

            const periodLabel =
              reportPreset === 'yesterday'
                ? language === 'sw'
                  ? 'Jana'
                  : 'Yesterday'
                : reportPreset === 'week'
                  ? language === 'sw'
                    ? 'Wiki hii'
                    : 'This week'
                  : reportPreset === 'lastweek'
                    ? language === 'sw'
                      ? 'Wiki iliyopita'
                      : 'Last week'
                    : reportPreset === 'month'
                      ? language === 'sw'
                        ? 'Mwezi huu'
                        : 'This month'
                      : reportPreset === 'lastmonth'
                        ? language === 'sw'
                          ? 'Mwezi uliopita'
                          : 'Last month'
                        : reportPreset === '3months'
                          ? language === 'sw'
                            ? 'Miezi mitatu'
                            : 'Three months'
                          : reportPreset === '6months'
                            ? language === 'sw'
                              ? 'Miezi sita'
                              : 'Six months'
                            : reportPreset === 'year'
                              ? language === 'sw'
                                ? 'Mwaka huu'
                                : 'This year'
                              : reportPreset === 'date' &&
                                  reportStartDate &&
                                  reportEndDate
                                ? `${reportStartDate} — ${reportEndDate}`
                                : language === 'sw'
                                  ? 'Leo'
                                  : 'Today';

            const status =
              outstandingExpenses <= 0
                ? 'fully-funded'
                : expensesFunded > 0
                  ? 'partly-funded'
                  : 'not-funded';

            return (
              <tr
                key={shop.id}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3">
                  {periodLabel}
                </td>

                <td className="px-4 py-3 font-bold">
                  {shop.name || shop.id}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.sales)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.replacement)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.gross)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.localFunded)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.centralExpense)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.ownerProfit)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.shopReserve)}
                </td>

                <td className="px-4 py-3 font-bold text-blue-700">
                  TZS {money(shop.amountRequiredToSubmit)}
                </td>

                <td className="px-4 py-3 font-black text-red-700">
                  TZS {money(outstandingExpenses)}
                </td>

                <td className="px-4 py-3">
                  <Badge
                    tone={
                      status === 'fully-funded'
                        ? 'green'
                        : status === 'partly-funded'
                          ? 'amber'
                          : 'red'
                    }
                  >
                    {status === 'fully-funded'
                      ? language === 'sw'
                        ? 'Matumizi yamekamilika'
                        : 'Expenses fully funded'
                      : status === 'partly-funded'
                        ? language === 'sw'
                          ? 'Yamepata sehemu'
                          : 'Partly funded'
                        : totalExpenseObligation <= 0
                          ? language === 'sw'
                            ? 'Hakuna matumizi'
                            : 'No expenses'
                          : language === 'sw'
                            ? 'Hayajapata fedha'
                            : 'Not funded'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {rows.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {language === 'sw'
          ? 'Hakuna taarifa za maduka kwa kipindi kilichochaguliwa.'
          : 'There is no shop information for the selected period.'}
      </div>
    ) : null}
  </div>
) : (
      activeReport === 'monthly-funding' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <h2 className="text-xl font-black text-violet-950">
        {t('report2')}
      </h2>

      <p className="mt-2 text-sm text-violet-900">
        {language === 'sw'
          ? 'Ripoti hii inaonyesha lengo la Matumizi ya Nyumbani, fedha zilizothibitishwa na kiasi ambacho bado kinahitajika.'
          : 'This report shows the Home Expenses target, confirmed funding and the amount still required.'}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={
          language === 'sw'
            ? 'Lengo la mwezi'
            : 'Monthly target'
        }
        value={
          combinedHomeExpensesFundingSummary.monthlyTarget
        }
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Mchango wa maduka'
            : 'Shop contributions'
        }
        value={
          combinedHomeExpensesFundingSummary.shopContribution
        }
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Jumla iliyothibitishwa'
            : 'Total confirmed'
        }
        value={
          combinedHomeExpensesFundingSummary.totalConfirmedFunding
        }
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Bado inahitajika'
            : 'Remaining balance'
        }
        value={
          combinedHomeExpensesFundingSummary.remainingBalance
        }
      />
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Chanzo cha fedha'
                : 'Funding source'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi kilichothibitishwa'
                : 'Confirmed amount'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Sehemu ya lengo'
                : 'Share of target'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw' ? 'Hali' : 'Status'}
            </th>
          </tr>
        </thead>

        <tbody>
          {[
            {
              name:
                language === 'sw'
                  ? 'Michango ya maduka'
                  : 'Shop contributions',
              amount:
                combinedHomeExpensesFundingSummary.shopContribution,
            },
            {
              name:
                language === 'sw'
                  ? 'Faida ya gesi'
                  : 'Gas profit',
              amount:
                combinedHomeExpensesFundingSummary.gasContribution,
            },
            
            {
  name:
    language === 'sw'
      ? 'Kamisheni ya pamoja'
      : 'Combined commission',
  amount:
    combinedHomeExpensesFundingSummary
      .combinedCommissionContribution,
},
          ].map((source) => {
            const sourceAmount = Number(source.amount || 0);

            const sourcePercentage =
              Number(
                combinedHomeExpensesFundingSummary.monthlyTarget ||
                  0
              ) > 0
                ? (
                    (sourceAmount /
                      Number(
                        combinedHomeExpensesFundingSummary
                          .monthlyTarget || 0
                      )) *
                    100
                  ).toFixed(1)
                : '0.0';

            return (
              <tr
                key={source.name}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3 font-bold">
                  {source.name}
                </td>

                <td className="px-4 py-3 font-black">
                  TZS {money(sourceAmount)}
                </td>

                <td className="px-4 py-3">
                  {sourcePercentage}%
                </td>

                <td className="px-4 py-3">
                  <Badge
                    tone={
                      sourceAmount > 0 ? 'green' : 'amber'
                    }
                  >
                    {sourceAmount > 0
                      ? language === 'sw'
                        ? 'Imepokelewa'
                        : 'Received'
                      : language === 'sw'
                        ? 'Haijapokelewa'
                        : 'Not received'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black">
          <tr>
            <td className="px-4 py-4">
              {language === 'sw'
                ? 'Jumla iliyothibitishwa'
                : 'Total confirmed funding'}
            </td>

            <td className="px-4 py-4 text-emerald-700">
              TZS{' '}
              {money(
                combinedHomeExpensesFundingSummary
                  .totalConfirmedFunding
              )}
            </td>

            <td className="px-4 py-4">
              {Number(
                combinedHomeExpensesFundingSummary
                  .fundingPercentage || 0
              ).toFixed(1)}
              %
            </td>

            <td className="px-4 py-4">
              <Badge
                tone={
                  homeExpensesFullyFunded
                    ? 'green'
                    : 'amber'
                }
              >
                {homeExpensesFullyFunded
                  ? language === 'sw'
                    ? 'Lengo limekamilika'
                    : 'Target completed'
                  : language === 'sw'
                    ? 'Bado linaendelea'
                    : 'Still in progress'}
              </Badge>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="font-black text-slate-900">
          {language === 'sw'
            ? 'Maendeleo ya lengo la mwezi'
            : 'Monthly target progress'}
        </div>

        <div className="font-black text-violet-800">
          {Number(
            combinedHomeExpensesFundingSummary
              .fundingPercentage || 0
          ).toFixed(1)}
          %
        </div>
      </div>

      <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-violet-700 transition-all"
          style={{
            width: `${combinedHomeExpensesFundingSummary.fundingPercentage}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
        <span className="font-bold">
          {language === 'sw'
            ? 'Bado inahitajika'
            : 'Remaining balance'}
        </span>

        <strong>
          TZS{' '}
          {money(
            combinedHomeExpensesFundingSummary
              .remainingBalance
          )}
        </strong>
      </div>
    </div>
  </div>
) : (
 activeReport === 'shop-compliance' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-xl font-black text-amber-950">
        {t('report3')}
      </h2>

      <p className="mt-2 text-sm text-amber-900">
  {language === 'sw'
    ? 'Ripoti hii inaonyesha hali ya kila duka katika kugharamia matumizi yake kwa kipindi kilichochaguliwa, ikiwemo matumizi yaliyolipiwa, yaliyobaki na yaliyoletwa kutoka kipindi cha nyuma.'
    : 'This report shows each shop’s expense-funding position for the selected period, including funded, outstanding and carried-forward expenses.'}
</p>
    </div>

<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <StatCard
    label={
      language === 'sw'
        ? 'Matumizi yamekamilika'
        : 'Expenses fully funded'
    }
    value={
      rows.filter(
        (shop) =>
          Number(shop.expensesStillOutstanding || 0) <= 0
      ).length
    }
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Yamepata sehemu'
        : 'Partly funded'
    }
    value={
      rows.filter((shop) => {
        const funded = Number(
          shop.expensesFundedAutomatically || 0
        );

        const outstanding = Number(
          shop.expensesStillOutstanding || 0
        );

        return funded > 0 && outstanding > 0;
      }).length
    }
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Hayajapata fedha'
        : 'Not funded'
    }
    value={
      rows.filter((shop) => {
        const obligation = Number(
          shop.totalExpenseObligation || 0
        );

        const funded = Number(
          shop.expensesFundedAutomatically || 0
        );

        return obligation > 0 && funded <= 0;
      }).length
    }
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Yana matumizi ya nyuma'
        : 'Carried-forward expenses'
    }
    value={
      rows.filter(
        (shop) =>
          Number(shop.previousUnpaidExpenses || 0) > 0
      ).length
    }
  />
</div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      
      
      <table className="min-w-[1200px] w-full text-left text-sm">
        
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
  <tr>
    <th className="px-4 py-3">
      {language === 'sw' ? 'Duka' : 'Shop'}
    </th>

    <th className="px-4 py-3">
      {language === 'sw'
        ? 'Mauzo ya kipindi'
        : 'Period sales'}
    </th>

    <th className="px-4 py-3">
      {language === 'sw'
        ? 'Jumla ya matumizi'
        : 'Total expense obligation'}
    </th>

    <th className="px-4 py-3">
      {language === 'sw'
        ? 'Matumizi yaliyopata fedha'
        : 'Expenses funded'}
    </th>

    <th className="px-4 py-3">
      {language === 'sw'
        ? 'Matumizi ya nyuma'
        : 'Carried-forward expenses'}
    </th>

    <th className="px-4 py-3">
      {language === 'sw'
        ? 'Matumizi ambayo hayajalipiwa'
        : 'Outstanding expenses'}
    </th>

    <th className="px-4 py-3">
      {language === 'sw' ? 'Hali' : 'Status'}
    </th>
  </tr>
</thead>

        <tbody>
          {rows.map((shop) => {
            const expectedAmount = Number(
              shop.expectedHome || 0
            );

            const submittedAmount = Number(
              shop.submitted || 0
            );

            const previousBalance = Number(
              shop.previous || 0
            );

            const todayShortfall = Math.max(
              0,
              expectedAmount - submittedAmount
            );

            let status = 'unconfirmed';
            let statusTone = 'red';

            if (previousBalance > 0) {
              status = 'overdue';
              statusTone = 'red';
            } else if (
              expectedAmount > 0 &&
              submittedAmount >= expectedAmount
            ) {
              status = 'full';
              statusTone = 'green';
            } else if (
              submittedAmount > 0 &&
              submittedAmount < expectedAmount
            ) {
              status = 'partial';
              statusTone = 'amber';
            }

            const statusLabel =
              status === 'full'
                ? language === 'sw'
                  ? 'Ametuma kamili'
                  : 'Fully complied'
                : status === 'partial'
                  ? language === 'sw'
                    ? 'Ametuma sehemu'
                    : 'Partially complied'
                  : status === 'overdue'
                    ? language === 'sw'
                      ? 'Ana deni la nyuma'
                      : 'Overdue'
                    : language === 'sw'
                      ? 'Bado hajathibitisha'
                      : 'Unconfirmed';

            return (
              <tr
                key={shop.id}
                className={`border-t border-slate-100 ${
                  status === 'overdue'
                    ? 'bg-red-50'
                    : ''
                }`}
              >
                <td className="px-4 py-3 font-black">
                  {shop.name || shop.id}
                </td>

                <td className="px-4 py-3">
                  TZS {money(shop.sales)}
                </td>

                <td className="px-4 py-3 font-bold">
                  TZS {money(expectedAmount)}
                </td>

                <td className="px-4 py-3 font-bold text-emerald-700">
                  TZS {money(submittedAmount)}
                </td>

                <td className="px-4 py-3 font-black text-red-700">
                  TZS {money(previousBalance)}
                </td>

                <td className="px-4 py-3 font-black text-amber-700">
                  TZS {money(todayShortfall)}
                </td>

                <td className="px-4 py-3">
                  <Badge tone={statusTone}>
                    {statusLabel}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {rows.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {language === 'sw'
          ? 'Hakuna maduka yaliyopatikana.'
          : 'No shops were found.'}
      </div>
    ) : null}
  </div>
) : (
activeReport === 'expense-allocation' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <h2 className="text-xl font-black text-indigo-950">
        {t('report4')}
      </h2>

      <p className="mt-2 text-sm text-indigo-900">
        {language === 'sw'
          ? 'Ripoti hii inaonyesha matumizi ya kila duka, kiasi kinachotakiwa leo na kiasi kilichopatikana kutoka kwenye faida ya duka.'
          : 'This report shows each shop expense, the amount required today and the amount funded from shop profit.'}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={
          language === 'sw'
            ? 'Matumizi yanayohifadhiwa dukani'
            : 'Local expenses required'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.localRequired || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Matumizi ya kituo kikuu'
            : 'Central expenses required'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.centralRequired || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Fedha iliyobaki madukani'
            : 'Local expenses funded'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.localFunded || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Fedha ya matumizi iliyotumwa'
            : 'Central expenses funded'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.centralExpense || 0),
          0
        )}
      />
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1200px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">
              {language === 'sw' ? 'Duka' : 'Shop'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Aina ya matumizi'
                : 'Expense type'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Mahali pa fedha'
                : 'Funding location'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi kinachotakiwa leo'
                : 'Required today'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi kilichopatikana'
                : 'Amount funded'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi ambacho hakijapatikana'
                : 'Unfunded amount'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw' ? 'Hali' : 'Status'}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.flatMap((shop) => {


            const localRows = Array.isArray(
  shop.localExpenseFundingBreakdown
)
  ? shop.localExpenseFundingBreakdown.map((expense) => ({
      ...expense,
      location: 'local',
    }))
  : [];

const centralRows = Array.isArray(
  shop.centralExpenseFundingBreakdown
)
  ? shop.centralExpenseFundingBreakdown.map((expense) => ({
      ...expense,
      location: 'central',
    }))
  : [];

            return [...localRows, ...centralRows].map(
              (expense, index) => {
                const requiredToday = Number(
                  expense.requiredToday || 0
                );

                const allocatedToday = Number(
  expense.amountFunded || 0
);

const unfundedAmount = Number(
  expense.amountOutstanding || 0
);
                return (
                  <tr
                    key={`${shop.id}-${expense.name}-${index}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-black">
                      {shop.name || shop.id}
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {expense.name || '-'}
                    </td>

                    <td className="px-4 py-3">
                      {expense.location === 'local'
                        ? language === 'sw'
                          ? 'Inabaki dukani'
                          : 'Retained at shop'
                        : language === 'sw'
                          ? 'Inatumwa kituo kikuu'
                          : 'Sent to central account'}
                    </td>

                    <td className="px-4 py-3 font-bold">
                      TZS {money(requiredToday)}
                    </td>

                    <td className="px-4 py-3 font-bold text-emerald-700">
                      TZS {money(allocatedToday)}
                    </td>

                    <td className="px-4 py-3 font-black text-red-700">
                      TZS {money(unfundedAmount)}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          requiredToday <= 0 ||
                          allocatedToday >= requiredToday
                            ? 'green'
                            : allocatedToday > 0
                              ? 'amber'
                              : 'red'
                        }
                      >
                        {requiredToday <= 0 ||
                        allocatedToday >= requiredToday
                          ? language === 'sw'
                            ? 'Imekamilika'
                            : 'Fully funded'
                          : allocatedToday > 0
                            ? language === 'sw'
                              ? 'Imepata sehemu'
                              : 'Partially funded'
                            : language === 'sw'
                              ? 'Haijapata fedha'
                              : 'Not funded'}
                      </Badge>
                    </td>
                  </tr>
                );
              }
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
) : (
  activeReport === 'local-funds' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-xl font-black text-emerald-950">
        {t('report5')}
      </h2>

      <p className="mt-2 text-sm text-emerald-900">
        {language === 'sw'
          ? 'Ripoti hii inaonyesha fedha za matumizi ambazo zinapaswa kubaki katika kila duka, kiasi kilichopatikana na upungufu uliopo.'
          : 'This report shows expense funds that should remain at each shop, the amount funded and any remaining shortfall.'}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label={
          language === 'sw'
            ? 'Jumla inayotakiwa kubaki madukani'
            : 'Total local funds required'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.localRequired || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Jumla iliyopatikana madukani'
            : 'Total local funds available'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.localFunded || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Jumla ambayo haijapatikana'
            : 'Total local shortfall'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum +
            Math.max(
              0,
              Number(shop.localRequired || 0) -
                Number(shop.localFunded || 0)
            ),
          0
        )}
      />
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1100px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">
              {language === 'sw' ? 'Duka' : 'Shop'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Matumizi ya dukani'
                : 'Local expense'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi kinachotakiwa leo'
                : 'Required today'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi kilichopatikana'
                : 'Amount funded'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Kiasi ambacho hakijapatikana'
                : 'Shortfall'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw' ? 'Hali' : 'Status'}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.flatMap((shop) => {
            const localExpenses = Array.isArray(
  shop.localExpenseFundingBreakdown
)
  ? shop.localExpenseFundingBreakdown
  : [];

            return localExpenses.map((expense, index) => {
              const requiredToday = Number(
                expense.requiredToday || 0
              );

              const allocatedToday = Number(
  expense.amountFunded || 0
);

const shortfall = Number(
  expense.amountOutstanding || 0
);

              return (
                <tr
                  key={`${shop.id}-${expense.name}-${index}`}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-black">
                    {shop.name || shop.id}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {expense.name || '-'}
                  </td>

                  <td className="px-4 py-3">
                    TZS {money(requiredToday)}
                  </td>

                  <td className="px-4 py-3 font-bold text-emerald-700">
                    TZS {money(allocatedToday)}
                  </td>

                  <td className="px-4 py-3 font-black text-red-700">
                    TZS {money(shortfall)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        requiredToday <= 0 ||
                        allocatedToday >= requiredToday
                          ? 'green'
                          : allocatedToday > 0
                            ? 'amber'
                            : 'red'
                      }
                    >
                      {requiredToday <= 0 ||
                      allocatedToday >= requiredToday
                        ? language === 'sw'
                          ? 'Imekamilika'
                          : 'Fully funded'
                        : allocatedToday > 0
                          ? language === 'sw'
                            ? 'Imepata sehemu'
                            : 'Partially funded'
                          : language === 'sw'
                            ? 'Haijapata fedha'
                            : 'Not funded'}
                    </Badge>
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  </div>
) : (
  activeReport === 'profit-allocation' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h2 className="text-xl font-black text-blue-950">
        {t('report6')}
      </h2>

      <p className="mt-2 text-sm text-blue-900">
        {language === 'sw'
          ? 'Ripoti hii inaonyesha jinsi faida halisi ya kila duka inavyogawanywa kati ya mmiliki na akiba ya duka.'
          : 'This report shows how each shop’s net profit is divided between the owner and the shop reserve.'}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={
          language === 'sw'
            ? 'Jumla ya faida ghafi'
            : 'Total gross profit'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.gross || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Jumla ya faida halisi'
            : 'Total net profit'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.netProfit || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Sehemu ya mmiliki 70%'
            : 'Owner share 70%'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.ownerProfit || 0),
          0
        )}
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Akiba ya duka 30%'
            : 'Shop reserve 30%'
        }
        value={rows.reduce(
          (sum, shop) =>
            sum + Number(shop.shopReserve || 0),
          0
        )}
      />
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1200px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">
              {language === 'sw' ? 'Duka' : 'Shop'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Faida ghafi'
                : 'Gross profit'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Matumizi ya dukani'
                : 'Local expenses'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Matumizi ya kituo kikuu'
                : 'Central expenses'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Faida halisi'
                : 'Net profit'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Mmiliki 70%'
                : 'Owner 70%'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Akiba ya duka 30%'
                : 'Shop reserve 30%'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw' ? 'Hali' : 'Status'}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((shop) => {
            const grossProfit = Number(shop.gross || 0);
            const localFunded = Number(
              shop.localFunded || 0
            );
            const centralExpense = Number(
              shop.centralExpense || 0
            );
            const netProfit = Number(
              shop.netProfit || 0
            );
            const ownerProfit = Number(
              shop.ownerProfit || 0
            );
            const shopReserve = Number(
              shop.shopReserve || 0
            );

            return (
              <tr
                key={shop.id}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3 font-black">
                  {shop.name || shop.id}
                </td>

                <td className="px-4 py-3">
                  TZS {money(grossProfit)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(localFunded)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(centralExpense)}
                </td>

                <td className="px-4 py-3 font-black">
                  TZS {money(netProfit)}
                </td>

                <td className="px-4 py-3 font-black text-blue-700">
                  TZS {money(ownerProfit)}
                </td>

                <td className="px-4 py-3 font-black text-emerald-700">
                  TZS {money(shopReserve)}
                </td>

                <td className="px-4 py-3">
                  <Badge
                    tone={
                      netProfit > 0
                        ? 'green'
                        : grossProfit > 0
                          ? 'amber'
                          : 'red'
                    }
                  >
                    {netProfit > 0
                      ? language === 'sw'
                        ? 'Faida imegawanywa'
                        : 'Profit allocated'
                      : grossProfit > 0
                        ? language === 'sw'
                          ? 'Faida imetumika kwenye matumizi'
                          : 'Profit absorbed by expenses'
                        : language === 'sw'
                          ? 'Hakuna faida'
                          : 'No profit'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black">
          <tr>
            <td className="px-4 py-4">
              {language === 'sw' ? 'Jumla' : 'Total'}
            </td>

            <td className="px-4 py-4">
              TZS{' '}
              {money(
                rows.reduce(
                  (sum, shop) =>
                    sum + Number(shop.gross || 0),
                  0
                )
              )}
            </td>

            <td className="px-4 py-4">
              TZS{' '}
              {money(
                rows.reduce(
                  (sum, shop) =>
                    sum +
                    Number(shop.localFunded || 0),
                  0
                )
              )}
            </td>

            <td className="px-4 py-4">
              TZS{' '}
              {money(
                rows.reduce(
                  (sum, shop) =>
                    sum +
                    Number(shop.centralExpense || 0),
                  0
                )
              )}
            </td>

            <td className="px-4 py-4">
              TZS{' '}
              {money(
                rows.reduce(
                  (sum, shop) =>
                    sum +
                    Number(shop.netProfit || 0),
                  0
                )
              )}
            </td>

            <td className="px-4 py-4 text-blue-700">
              TZS{' '}
              {money(
                rows.reduce(
                  (sum, shop) =>
                    sum +
                    Number(shop.ownerProfit || 0),
                  0
                )
              )}
            </td>

            <td className="px-4 py-4 text-emerald-700">
              TZS{' '}
              {money(
                rows.reduce(
                  (sum, shop) =>
                    sum +
                    Number(shop.shopReserve || 0),
                  0
                )
              )}
            </td>

            <td className="px-4 py-4">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
) : (
 activeReport === 'home-expenses' ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <h2 className="text-xl font-black text-rose-950">
        {language === 'sw'
          ? 'Ripoti ya Matumizi ya Nyumbani'
          : 'Home Expenses Report'}
      </h2>

      <p className="mt-2 text-sm text-rose-900">
        {language === 'sw'
          ? 'Ripoti hii inaonyesha bajeti kamili ya Matumizi ya Nyumbani ya mwezi na hali ya ufadhili wake.'
          : 'This report shows the complete monthly Home Expenses budget and its funding status.'}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={
          language === 'sw'
            ? 'Lengo la mwezi'
            : 'Monthly target'
        }
        value={
          combinedHomeExpensesFundingSummary.monthlyTarget
        }
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Jumla iliyothibitishwa'
            : 'Total confirmed'
        }
        value={
          combinedHomeExpensesFundingSummary.totalConfirmedFunding
        }
      />

      <StatCard
        label={
          language === 'sw'
            ? 'Bado inahitajika'
            : 'Remaining balance'
        }
        value={
          combinedHomeExpensesFundingSummary.remainingBalance
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
    {language === 'sw'
      ? 'Asilimia iliyokamilika'
      : 'Funding completed'}
  </div>

  <div className="mt-2 text-xl font-black text-slate-950">
    {Number(
      combinedHomeExpensesFundingSummary
        .fundingPercentage || 0
    ).toFixed(1)}
    %
  </div>
</div>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Na.'
                : 'No.'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Aina ya matumizi'
                : 'Expense item'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Bajeti ya mwezi'
                : 'Monthly budget'}
            </th>

            <th className="px-4 py-3">
              {language === 'sw'
                ? 'Sehemu ya bajeti yote'
                : 'Share of total budget'}
            </th>
          </tr>
        </thead>

        <tbody>
          {HOME_EXPENSES_MONTHLY_BUDGET.items.map(
            (item, index) => {
              const itemAmount = Number(item.amount || 0);

              const itemPercentage =
                Number(
                  HOME_EXPENSES_MONTHLY_BUDGET.target || 0
                ) > 0
                  ? (
                      (itemAmount /
                        Number(
                          HOME_EXPENSES_MONTHLY_BUDGET
                            .target || 0
                        )) *
                      100
                    ).toFixed(1)
                  : '0.0';

              return (
                <tr
                  key={item.name}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {item.name}
                  </td>

                  <td className="px-4 py-3 font-black">
                    TZS {money(itemAmount)}
                  </td>

                  <td className="px-4 py-3">
                    {itemPercentage}%
                  </td>
                </tr>
              );
            }
          )}
        </tbody>

        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black">
          <tr>
            <td className="px-4 py-4">—</td>

            <td className="px-4 py-4">
              {language === 'sw'
                ? 'Jumla ya bajeti'
                : 'Total budget'}
            </td>

            <td className="px-4 py-4 text-rose-700">
              TZS{' '}
              {money(
                HOME_EXPENSES_MONTHLY_BUDGET.target
              )}
            </td>

            <td className="px-4 py-4">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">
          {language === 'sw'
            ? 'Vyanzo vya fedha'
            : 'Funding sources'}
        </h3>

        <div className="mt-4 space-y-3">
          {[
            {
              label:
                language === 'sw'
                  ? 'Michango ya maduka'
                  : 'Shop contributions',
              amount:
                combinedHomeExpensesFundingSummary
                  .shopContribution,
            },
            {
              label:
                language === 'sw'
                  ? 'Faida ya gesi'
                  : 'Gas profit',
              amount:
                combinedHomeExpensesFundingSummary
                  .gasContribution,
            },
           {
  label:
    language === 'sw'
      ? 'Kamisheni ya pamoja'
      : 'Combined commission',
  amount:
    combinedHomeExpensesFundingSummary
      .combinedCommissionContribution,
},
          ].map((source) => (
            <div
              key={source.label}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
            >
              <span className="font-bold text-slate-700">
                {source.label}
              </span>

              <strong className="text-slate-950">
                TZS {money(source.amount)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900">
            {language === 'sw'
              ? 'Hali ya lengo'
              : 'Target status'}
          </h3>

          <Badge
            tone={
              homeExpensesFullyFunded
                ? 'green'
                : 'amber'
            }
          >
            {homeExpensesFullyFunded
              ? language === 'sw'
                ? 'Limekamilika'
                : 'Completed'
              : language === 'sw'
                ? 'Bado linaendelea'
                : 'In progress'}
          </Badge>
        </div>

        <div className="mt-5 h-5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-rose-600 transition-all"
            style={{
              width: `${combinedHomeExpensesFundingSummary.fundingPercentage}%`,
            }}
          />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
            <span className="font-bold text-emerald-900">
              {language === 'sw'
                ? 'Fedha zilizothibitishwa'
                : 'Confirmed funding'}
            </span>

            <strong className="text-emerald-900">
              TZS{' '}
              {money(
                combinedHomeExpensesFundingSummary
                  .totalConfirmedFunding
              )}
            </strong>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
            <span className="font-bold text-red-900">
              {language === 'sw'
                ? 'Bado inahitajika'
                : 'Remaining balance'}
            </span>

            <strong className="text-red-900">
              TZS{' '}
              {money(
                combinedHomeExpensesFundingSummary
                  .remainingBalance
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  </div>
) : null
)
)
)
)
)
    )}
  </div>
          </>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <StatCard
    label={language === 'sw' ? 'Mauzo ya sasa' : 'Current sales'}
    value={selectedShop.sales}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Fedha ya kununulia bidhaa'
        : 'Protected product capital'
    }
    value={selectedShop.replacement}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Faida ghafi iliyopatikana'
        : 'Gross profit generated'
    }
    value={selectedShop.gross}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Matumizi ya nyuma ambayo bado hayajalipiwa'
        : 'Previous unpaid expenses'
    }
    value={selectedShop.previousUnpaidExpenses}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Matumizi ya leo'
        : 'Today’s fixed expenses'
    }
    value={selectedShop.todayFixedExpenses}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Fedha iliyotengwa kwa matumizi'
        : 'Expenses funded automatically'
    }
    value={selectedShop.expensesFundedAutomatically}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Matumizi ambayo bado hayajalipiwa'
        : 'Expenses still outstanding'
    }
    value={selectedShop.expensesStillOutstanding}
  />

  <StatCard
  label={
    language === 'sw'
      ? 'Kiasi cha fedha taslimu unachotakiwa kutoa'
      : 'Practical cash amount required to submit'
  }
  value={selectedShop.cashAmountRequiredToSubmit}
/>
</div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">
  {language === 'sw'
    ? 'Hali ya Makusanyo na Matumizi kwa Sasa'
    : 'Current Remittance and Expense Position'}
</h2>
              {currentShopTodayRemittance ? (
  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
    <div className="text-lg font-black text-emerald-900">
      {language === 'sw'
        ? 'Makusanyo ya leo tayari yamethibitishwa'
        : 'Today’s remittance has already been confirmed'}
    </div>

    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div className="rounded-xl bg-white px-4 py-3">
        <div className="text-xs font-bold uppercase text-slate-500">
          {language === 'sw' ? 'Kiasi kilichotumwa' : 'Amount sent'}
        </div>
        <div className="mt-1 text-lg font-black">
          TZS {money(currentShopTodayRemittance.amountSent)}
        </div>
      </div>

      <div className="rounded-xl bg-white px-4 py-3">
        <div className="text-xs font-bold uppercase text-slate-500">
          {language === 'sw' ? 'Njia ya kutuma' : 'Payment method'}
        </div>
        <div className="mt-1 text-lg font-black">
          {currentShopTodayRemittance.paymentMethod === 'mpesa'
            ? 'M-Pesa'
            : 'Cash'}
        </div>
      </div>
    </div>
  </div>
) : null}


{!currentShopTodayRemittance ? (
  <div className="mt-5 space-y-4">
    <div className="grid gap-3 md:grid-cols-2">
      {[
        [t('todaySales'), selectedShop.sales],
        [t('moneyReplace'), selectedShop.replacement],
        [t('grossBefore'), selectedShop.gross],
        [t('localRemain'), selectedShop.localFunded],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
        >
          <span className="text-sm text-slate-600">{label}</span>
          <strong>TZS {money(value)}</strong>
        </div>
      ))}
    </div>

   <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
  <div className="text-sm font-black text-blue-950">
    {language === 'sw'
      ? 'Mgawanyo wa matumizi ya leo'
      : 'Today’s expense breakdown'}
  </div>

  <div className="mt-3 space-y-2">
    {(selectedShop.centralExpenseFundingBreakdown || []).map(
      (expense) => (
        <div
          key={expense.key}
          className="rounded-xl bg-white px-4 py-3"
        >
          <div className="text-sm font-bold text-slate-800">
            {expenseLabel(expense.name)}
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">
                {language === 'sw'
                  ? 'Kinachotakiwa leo'
                  : 'Required today'}
              </div>

              <strong className="text-sm text-slate-900">
                TZS {money(expense.requiredToday)}
              </strong>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                {language === 'sw'
                  ? 'Kilichopatikana leo'
                  : 'Funded today'}
              </div>

              <strong className="text-sm text-emerald-700">
                TZS {money(expense.amountFunded)}
              </strong>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                {language === 'sw'
                  ? 'Bado hakijapatikana'
                  : 'Still outstanding'}
              </div>

              <strong
                className={`text-sm ${
                  Number(expense.amountOutstanding || 0) > 0
                    ? 'text-red-700'
                    : 'text-slate-900'
                }`}
              >
                TZS {money(expense.amountOutstanding)}
              </strong>
            </div>
          </div>
        </div>
      )
    )}
  </div>

  <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-900 px-4 py-3 text-white">
    <span className="text-sm font-bold">
      {t('centralContribution')}
    </span>

    <strong>
      TZS {money(selectedShop.centralExpense)}
    </strong>
  </div>
</div>

<div className="grid gap-3 md:grid-cols-2">
  {[
    [t('previousShortfall'), selectedShop.previous],
    [t('netAfter'), selectedShop.netProfit],
[
  language === 'sw'
    ? 'Faida ya Mmiliki kabla ya mchango wa Matumizi ya Nyumbani'
    : 'Owner profit before Home Expenses contribution',
  selectedShop.ownerProfitBeforeHomeExpenses,
],
[
  language === 'sw'
    ? 'Mchango wa Matumizi ya Nyumbani hadi sasa'
    : 'Home Expenses contribution so far',
  selectedShop.shopHomeExpensesContribution,
],
[
  language === 'sw'
    ? 'Faida ya Mmiliki iliyobaki'
    : 'Remaining owner profit',
  selectedShop.ownerProfit,
],
    [
  language === 'sw'
    ? 'Akiba ya duka inayolindwa (25%)'
    : 'Protected shop reserve (25%)',
  selectedShop.shopReserve,
],
    [
      language === 'sw'
        ? 'Kiasi cha fedha taslimu unachotakiwa kutoa'
        : 'Practical cash amount required to submit',
      selectedShop.cashAmountRequiredToSubmit,
    ],
  ].map(([label, value]) => (
    <div
      key={label}
      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
    >
      <span className="text-sm text-slate-600">{label}</span>
      <strong>TZS {money(value)}</strong>
    </div>
  ))}
</div>
  </div>
) : null}
              {false ? (
  <>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1 block text-sm font-bold">{t('amountSent')}</span>
                  <input
                    type="number"
                    value={amountSent}
                    onChange={(event) => {
                      setAmountSent(event.target.value);
                      setShortReason('');
                      setOtherReason('');
                    }}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-sm font-bold">{t('paymentMethod')}</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                  >
                    <option value="cash">{t('cash')}</option>
                    <option value="mpesa">{t('mpesa')}</option>
                  </select>
                </label>

<label>
  <span className="mb-1 block text-sm font-bold">
    {t('reference')}
  </span>

  <input
    value={paymentReference}
    onChange={(event) =>
      setPaymentReference(event.target.value)
    }
    placeholder={
      language === 'sw'
        ? 'Mfano: namba ya muamala'
        : 'Example: transaction number'
    }
    className="h-11 w-full rounded-xl border border-slate-300 px-3"
  />
</label>
                {showShortReason ? (
                  <label>
                    <span className="mb-1 block text-sm font-bold">{t('shortReason')}</span>
                    <select
                      value={shortReason}
                      onChange={(event) => {
                        setShortReason(event.target.value);
                        if (event.target.value !== 'other') setOtherReason('');
                      }}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                    >
                      <option value="">{t('selectReason')}</option>
                      <option value="low-sales">{t('reasonLowSales')}</option>
                      <option value="restock">{t('reasonRestock')}</option>
                      <option value="mpesa-float">{t('reasonMpesa')}</option>
                      <option value="other">{t('reasonOther')}</option>
                    </select>
                  </label>
                ) : null}

                {showShortReason && shortReason === 'other' ? (
                  <label>
                    <span className="mb-1 block text-sm font-bold">{t('otherReason')}</span>
                    <input
                      value={otherReason}
                      onChange={(event) => setOtherReason(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3"
                    />
                  </label>
                ) : null}
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <input
                  type="checkbox"
                  checked={localConfirmed}
                  onChange={(event) => setLocalConfirmed(event.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-blue-950">{t('localConfirm')}</span>
              </label>

              <button
  type="button"
  onClick={handlePreviewSubmission}
  className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
>
  {t('previewSubmission')}
</button>
  </>
) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
