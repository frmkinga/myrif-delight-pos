import React, { useEffect, useMemo, useState } from 'react';
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
  AUTOMATIC_EXPENSE_PILOT_START_DATE;
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

const money = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(Number(value || 0))
  );
const roundToCashStep = (value, step = 50) => {
  const amount = Number(value || 0);

  if (!amount || amount <= 0) {
    return 0;
  }

  return Math.ceil(amount / step) * step;
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

  const centralRequired = Object.values(expenseSetup)
    .filter((expense) => expense.location === 'owner')
    .reduce(
      (sum, expense) =>
        sum + getRequiredAmount(expense),
      0
    );

  return {
    localRequired,
    centralRequired,
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

    return 0;
  };

  const localExpenseBreakdown = Object.entries(expenseSetup)
    .filter(([, expense]) => expense.location === 'shop')
    .map(([key, expense]) => ({
      key,
      name: expense.name,
      requiredToday: getDailyExpenseAmount(expense),
    }));

  const centralExpenseBreakdown = Object.entries(expenseSetup)
    .filter(([, expense]) => expense.location === 'owner')
    .map(([key, expense]) => ({
      key,
      name: expense.name,
      requiredToday: getDailyExpenseAmount(expense),
    }));

  const localRequired = localExpenseBreakdown.reduce(
    (sum, expense) => sum + Number(expense.requiredToday || 0),
    0
  );

  const centralRequired = centralExpenseBreakdown.reduce(
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
  centralExpenseBreakdown.map((expense) => {
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


const ownerProfit = netProfit * 0.7;
const shopReserve = netProfit * 0.3;

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
centralExpenseBreakdown,
centralExpenseFundingBreakdown,
localExpenseBreakdown,
localExpenseFundingBreakdown,
netProfit,
    ownerProfit,
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

        const todayCentralPaid = Math.min(
          grossAfterPreviousCentral,
          Number(
            dailyRequirement.centralRequired || 0
          )
        );

        const centralUnpaid = Math.max(
          0,
          Number(position.centralUnpaid || 0) +
            Number(
              dailyRequirement.centralRequired || 0
            ) -
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
      (record) =>
        String(
          record?.shop_id ||
            record?.shopId ||
            ''
        ) === selectedShopId &&
        String(record?.date || '') < todayKey
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
        balance + expected - submitted
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

  return calculateShop({
    id: selectedShopId,
    name:
      selectedShop?.name || selectedShopId,
    sales: todaySalesPosition.sales,
    replacement:
      todaySalesPosition.replacement,
    calculationDate: todayKey,
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
  const [activeTab, setActiveTab] = useState('daily');
  const [activeReport, setActiveReport] = useState('daily-remittance');
  
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
  .filter(
    (record) =>
      String(record?.shop_id || record?.shopId || '') === shopId &&
      String(record?.date || '') < todayKey
  )
  .sort((a, b) =>
    String(a?.date || '').localeCompare(String(b?.date || ''))
  );

const previousBalance = shopPreviousRecords.reduce(
  (balance, record) => {
    const expected = Number(record?.expectedAmount || 0);
    const submitted = Number(record?.amountSent || 0);

    return Math.max(0, balance + expected - submitted);
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

const periodOwnerProfit = periodNetProfit * 0.7;
const periodShopReserve = periodNetProfit * 0.3;

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

  expensesStillOutstanding:
    Number(selectedPeriodExpensePosition.localOutstanding || 0) +
    Number(selectedPeriodExpensePosition.centralOutstanding || 0),

  netProfit: periodNetProfit,
  ownerProfit: periodOwnerProfit,
  shopReserve: periodShopReserve,

  amountRequiredToSubmit:
    Number(selectedPeriodExpensePosition.centralFunded || 0) +
    periodOwnerProfit,
};
  });
}, [
  data?.shops,
  data?.sales,
  data?.products,
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

    return monthFundingBreakdown.map((expense) => {
     const targetAmount = Number(
  expense.target || 0
);

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

const selectedMonthStartKey =
  calculationDateKey
    ? `${calculationDateKey.slice(0, 7)}-01`
    : '';

const firstActiveDay =
  selectedMonthStartKey <
  AUTOMATIC_EXPENSE_ACTIVATION_DATE &&
  calculationDateKey.startsWith(
    AUTOMATIC_EXPENSE_ACTIVATION_DATE.slice(0, 7)
  )
    ? Number(
        AUTOMATIC_EXPENSE_ACTIVATION_DATE.slice(8, 10)
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
          ? (
              targetAmount /
              (daysInSelectedMonth * 6)
            ) * activeDaysUpToSelectedDate
          : 0
        : 0;

const fundedThisMonth = Number(
  expense.fundedThisMonth || 0
);

      const outstandingAmount = Number(
        expense.outstanding || 0
      );

      return {
        id: `${shopRow.id}-${expense.key}-monthly`,
        shop_id: shopRow.id,
        shop: shopRow.name,
        expenseKey: expense.key,
        expense: expense.name,
        frequency: expense.frequency,
        target: targetAmount,
requiredThisMonthToDate,
fundedThisMonth,
        outstanding: outstandingAmount,
      };
    });
  });
}, [rows]);

const automaticShopHomeExpensesContribution = useMemo(() => {
  return monthlyExpenseRows
    .filter(
      (row) =>
        String(row.expenseKey || '') ===
        'homeExpenses'
    )
    .reduce(
      (total, row) =>
        total +
        Number(row.fundedThisMonth || 0),
      0
    );
}, [monthlyExpenseRows]);


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

const gasContribution = Math.min(
  remainingAfterShopContribution,
  Math.max(
    0,
    Number(currentMonthGasSummary?.totalProfit || 0) * 0.7
  )
);

  const combinedCommissionContribution = 0;

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
  currentMonthGasSummary,
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

const localExpenseSummaryRows = useMemo(() => {
  return rows.map((shopRow) => {
    const shopLocalRows = localExpenseRows.filter(
      (row) =>
        String(row.shop_id) === String(shopRow.id)
    );

    return {
      id: `${shopRow.id}-local-summary`,
      shop_id: shopRow.id,
      shop: shopRow.name,
      requiredToday: shopLocalRows.reduce(
        (sum, row) =>
          sum + Number(row.requiredToday || 0),
        0
      ),
      fundedToday: shopLocalRows.reduce(
        (sum, row) =>
          sum + Number(row.fundedToday || 0),
        0
      ),
      outstandingToday: shopLocalRows.reduce(
        (sum, row) =>
          sum + Number(row.outstandingToday || 0),
        0
      ),
    };
  });
}, [localExpenseRows, rows]);



const allocationRows = useMemo(() => {
  return rows.flatMap((shopRow) => {
    const fundingBreakdown = Array.isArray(
      shopRow.centralExpenseFundingBreakdown
    )
      ? shopRow.centralExpenseFundingBreakdown
      : [];

    return fundingBreakdown.map((expense) => ({
      id: `${shopRow.id}-${expense.key}`,
      shop_id: shopRow.id,
      shop: shopRow.name,
      expense: expense.name,
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
      const matchingFund = funds.find(
        (item) =>
          String(item?.shop_id || '') === String(fund?.shop_id || '') &&
          String(item?.expense || '') === String(fund?.expense || '') &&
          String(item?.due || '') === String(fund?.due || '')
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
    ['daily', t('tabDaily')],
    ['allocation', t('tabAllocation')],
    ['funds', t('tabFunds')],
    ['outstanding', t('tabOutstanding')],
    ['local', t('tabLocal')],
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
        ? 'Matumizi ya leo yaliyowekwa'
        : 'Today’s fixed expenses'
    }
    value={totals.todayFixedExpenses}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Fedha iliyotengwa kwa matumizi'
        : 'Expenses funded automatically'
    }
    value={totals.expensesFundedAutomatically}
  />

  <StatCard
    label={
      language === 'sw'
        ? 'Matumizi ambayo bado hayajalipiwa'
        : 'Expenses still outstanding'
    }
    value={totals.expensesStillOutstanding}
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
    {previousMonthCombinedCommissionAllocation
      ?.status === 'confirmed' ? (
      <div className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-800">
        {language === 'sw'
          ? `Imethibitishwa: TZS ${money(
              previousMonthCombinedCommissionAllocation
                ?.confirmedAmount || 0
            )}`
          : `Confirmed: TZS ${money(
              previousMonthCombinedCommissionAllocation
                ?.confirmedAmount || 0
            )}`}
      </div>
    ) : (
      <button
        type="button"
        onClick={
          confirmPreviousMonthCommissionContribution
        }
        disabled={
          !homeFundingAllocationsCloudLoaded ||
          !previousMonthSalesCloudLoaded ||
          Number(
            previousMonthCommissionProposal
              ?.proposedCommissionContribution || 0
          ) <= 0
        }
        className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {language === 'sw'
          ? 'Thibitisha Kamisheni ya Mwezi Uliopita'
          : 'Confirm Previous Month Commission'}
      </button>
    )}
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
        TZS {money(row.todayFixedExpenses)}
      </td>

      <td className="px-4 py-3">
        TZS {money(row.expensesFundedAutomatically)}
      </td>

      <td className="px-4 py-3 font-black text-red-700">
        TZS {money(row.expensesStillOutstanding)}
      </td>

      <td className="px-4 py-3 font-black">
        TZS {money(row.cashAmountRequiredToSubmit)}
      </td>
      <td className="px-4 py-3">
  {(() => {
    const fundedAmount = Number(
      row.expensesFundedAutomatically || 0
    );

    const outstandingAmount = Number(
      row.expensesStillOutstanding || 0
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
        {allocationRows.map((row, index) => {
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
        {monthlyExpenseRows.map((row) => {
          const requiredThisMonthToDate = Number(
  row.requiredThisMonthToDate || 0
);

const fundedThisMonth = Number(
  row.fundedThisMonth || 0
);

const outstandingAmount = Number(
  row.outstanding || 0
);

const monthlyFundingShortfall = Math.max(
  0,
  requiredThisMonthToDate - fundedThisMonth
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
                : row.frequency === 'six_months'
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
  TZS {money(row.requiredThisMonthToDate)}
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
    fullyFunded && outstandingAmount <= 0
      ? 'green'
      : fullyFunded && outstandingAmount > 0
        ? 'amber'
        : partlyFunded
          ? 'amber'
          : 'red'
  }
>
  {fullyFunded && outstandingAmount <= 0
    ? language === 'sw'
      ? 'Yamekamilika'
      : 'Fully funded'
    : fullyFunded && outstandingAmount > 0
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
              ? 'Jumla ya matumizi yaliyotakiwa'
              : 'Total expense obligation',
            language === 'sw'
              ? 'Fedha iliyotengwa kwa matumizi'
              : 'Expenses funded',
            language === 'sw'
              ? 'Matumizi ambayo bado hayajalipiwa'
              : 'Expenses still outstanding',
            language === 'sw'
              ? 'Upungufu wa matumizi ya dukani'
              : 'Local expense shortfall',
            language === 'sw'
              ? 'Upungufu wa matumizi ya mmiliki'
              : 'Central expense shortfall',
            t('status'),
          ].map((heading) => (
            <th key={heading} className="px-4 py-3">
              {heading}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows
          .filter(
            (row) =>
              Number(row.expensesStillOutstanding || 0) > 0
          )
          .map((row) => {
            const fundedAmount = Number(
              row.expensesFundedAutomatically || 0
            );

            const outstandingAmount = Number(
              row.expensesStillOutstanding || 0
            );

            const isPartlyFunded =
              fundedAmount > 0 && outstandingAmount > 0;

            return (
              <tr
                key={row.id}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3 font-bold">
                  {row.name}
                </td>

                <td className="px-4 py-3">
                  TZS {money(row.totalExpenseObligation)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(row.expensesFundedAutomatically)}
                </td>

                <td className="px-4 py-3 font-black text-red-700">
                  TZS {money(row.expensesStillOutstanding)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(row.localExpensesStillOutstanding)}
                </td>

                <td className="px-4 py-3">
                  TZS {money(row.centralExpensesStillOutstanding)}
                </td>

                <td className="px-4 py-3">
                  <Badge tone={isPartlyFunded ? 'amber' : 'red'}>
                    {isPartlyFunded
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

        {rows.filter(
          (row) =>
            Number(row.expensesStillOutstanding || 0) > 0
        ).length === 0 ? (
          <tr>
            <td
              colSpan={7}
              className="px-4 py-10 text-center text-sm text-slate-500"
            >
              {language === 'sw'
                ? 'Hakuna duka lenye matumizi ambayo bado hayajalipiwa.'
                : 'No shop has outstanding expense obligations.'}
            </td>
          </tr>
        ) : null}
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

{activeTab === 'reports' ? (
  <div className="space-y-5">
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
) : null}
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
    [t('ownerProfit'), selectedShop.ownerProfit],
    [t('shopReserve'), selectedShop.shopReserve],
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
