import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const currency = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));

const formatPersonName = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(
      /(^|[\s'-])\p{L}/gu,
      (letter) => letter.toUpperCase()
    );
const cleanAmountInput = (value) =>
  String(value || '').replace(/[^\d]/g, '');

const formatAmountInput = (value) => {
  const cleanValue = cleanAmountInput(value);

  return cleanValue
    ? Number(cleanValue).toLocaleString('en-US')
    : '';
};
const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDawascoBillDefaults = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const formatLocalDate = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  return {
    controlNumber: '991040283845',
    billDate: formatLocalDate(
      new Date(currentYear, currentMonth, 15)
    ),
    dueDate: formatLocalDate(
      new Date(currentYear, currentMonth, 23)
    ),
    billingPeriodStart: formatLocalDate(
      new Date(currentYear, currentMonth - 1, 15)
    ),
    billingPeriodEnd: formatLocalDate(
      new Date(currentYear, currentMonth, 25)
    ),
  };
};

const addDaysISO = (dateStr, days) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addMonthsISO = (dateStr, months) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setMonth(dt.getMonth() + Number(months || 0));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const daysBetween = (fromStr, toStr) => {
  if (!fromStr || !toStr) return null;
  const from = new Date(fromStr);
  const to = new Date(toStr);
  const diff = to.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const WATER_UNIT_PRICE = 4000;
const DEFAULT_SERVICE_CHARGE = 5000;
const t = (language, en, sw) => (language === 'sw' ? sw : en);

const emptyHouseForm = {
  id: '',
  houseNumber: '',
  tenantName: '',
  rentPaidDate: todayISO(),
  rentStartDate: '',
  rentEndDate: '',
  monthlyRentAmount: '',
  amountPaid: '',
  rentDurationMonths: '1',
  paymentType: 'Full',
  houseStatus: 'Occupied',
  itemsIssued: '',
};

const emptyRentalRegistrationForm = {
  houseId: '',
  occupancyType: 'Rent Paying Tenant',
  tenantName: '',
  phoneNumber: '',
  occupation: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  paymentDate: todayISO(),
  startDate: addDaysISO(todayISO(), 1),
  monthlyRentAmount: '',
  amountReceived: '',
  paidThroughDate: '',
  smsRemindersEnabled: true,
  notes: '',
};
const emptyRentalTenantEditForm = {
  houseId: '',
  tenantId: '',
  occupancyType: '',
  fullName: '',
  phoneNumber: '',
  occupation: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  smsConsent: true,
  notes: '',
};
const emptyRentalPaymentForm = {
  tenancyId: '',
  amountReceived: '',
  paymentDate: todayISO(),
  paymentMethod: 'Cash',
  notes: '',
};
const emptyRentalPaymentCorrectionForm = {
  paymentId: '',
  correctedAmount: '',
  correctedPaymentDate: todayISO(),
  reason: '',
};
const emptyRentalCorrectionForm = {
  tenancyId: '',
  tenantName: '',
  phoneNumber: '',
  startDate: '',
  monthlyRentAmount: '',
  paidThroughDate: '',
  smsRemindersEnabled: true,
  reason: '',
};

const emptyRentalExpenseForm = {
  houseId: '',
  expenseDate: todayISO(),
  expenseType: 'Repair',
  description: '',
  amount: '',
  payee: '',
  referenceNumber: '',
};

const emptyMeterForm = {
  id: '',
  houseNumber: '',
  meterType: 'Water',
  meterNumber: '',
  readingDate: todayISO(),
  paymentReceived: 'No',
  paymentDate: '',
  amountReceived: '',
  previousReadingDate: '',
previousUnits: '',
currentUnits: '',
  costPerUnit: String(WATER_UNIT_PRICE),
  discount: '',
  nextReadingDate: '',
  notes: '',
};

const emptyServiceChargeForm = {
  id: '',
  houseNumber: '',
  tenantName: '',
  serviceChargeAmount: String(DEFAULT_SERVICE_CHARGE),
  datePaid: todayISO(),
  nextPaymentDate: '',
  paymentStatus: 'Paid',
  notes: '',
};

const emptyServiceChargePaymentForm = {
  houseId: '',
  amountReceived: '',
  paymentDate: todayISO(),
  paymentMethod: 'Cash',
  referenceNumber: '',
  notes: '',
};

const emptyServiceChargeExpenseForm = {
  expenseDate: todayISO(),
  expenseType: 'Cleaning',
  description: '',
  amount: '',
  payee: '',
  referenceNumber: '',
  notes: '',
};

const emptyServiceChargeCorrectionForm = {
  recordType: 'Invoice',
  recordId: '',
  actionType: 'Update',
  correctedAmount: '',
  correctedDate: todayISO(),
  correctedDueDate: '',
  paymentMethod: 'Cash',
  referenceNumber: '',
  expenseType: 'Cleaning',
  description: '',
  payee: '',
  notes: '',
  reason: '',
};

const getCurrentServiceChargeMonth = () =>
  todayISO().slice(0, 7);

const emptyServiceChargeHouseSettingForm = {
  houseId: '',
  enabled: true,
  monthlyAmount: formatAmountInput(
    String(DEFAULT_SERVICE_CHARGE)
  ),
  reason: '',
};


const emptyServiceChargeInvoicePreparationForm = {
  chargeMonth: getCurrentServiceChargeMonth(),
};
const emptyWaterPaymentForm = {
  houseNumber: '',
  tenantName: '',
  meterId: '',
  meterNumber: '',
  amountReceived: '',
  paymentDate: todayISO(),
  notes: '',
};

const emptyWaterSupplierBillForm = {
  id: '',
  billNumber: '',
  ...getDawascoBillDefaults(),
  billAmount: '',
  notes: '',
};

const emptyWaterFundExpenseForm = {
  id: '',
  supplierBillId: '',
  expenseType: 'DAWASCO Payment',
  expenseDate: todayISO(),
  amount: '',
  payee: '',
  referenceNumber: '',
  notes: '',
};

function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label ? <label className="block text-sm font-medium text-slate-700">{label}</label> : null}
      <input className={`w-full rounded-xl border px-3 py-2 text-sm ${className}`} {...props} />
    </div>
  );
}

function Select({ label, className = '', children, ...props }) {
  return (
    <div className="space-y-1">
      {label ? <label className="block text-sm font-medium text-slate-700">{label}</label> : null}
      <select className={`w-full rounded-xl border px-3 py-2 text-sm ${className}`} {...props}>{children}</select>
    </div>
  );
}

function Textarea({ label, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label ? <label className="block text-sm font-medium text-slate-700">{label}</label> : null}
      <textarea className={`w-full rounded-xl border px-3 py-2 text-sm ${className}`} {...props} />
    </div>
  );
}

function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-md transition hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return <div className="p-4 pb-2">{children}</div>;
}

function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

function CardContent({ children, className = '' }) {
  return <div className={`p-4 pt-2 ${className}`}>{children}</div>;
}

function Button({ children, className = '', ...props }) {
  return <button className={`rounded-xl bg-slate-900 px-4 py-2 text-sm text-white ${className}`} {...props}>{children}</button>;
}

function PreviewValue({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default function RentalPropertySectionPreview({ language = 'sw', setLanguage, data, saveData }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRentSection, setActiveRentSection] = useState('summary');
  const [activeRentReport, setActiveRentReport] = useState('');
  const [activeWaterSection, setActiveWaterSection] = useState('summary');
  const [
    activeServiceChargeSection,
    setActiveServiceChargeSection,
  ] = useState('summary');
  const [activeServiceChargeReport, setActiveServiceChargeReport] =
    useState('');
  const [showWaterOptionalFields, setShowWaterOptionalFields] =
    useState(false);

  const allHouses = Array.isArray(data?.houses)
  ? data.houses
  : [];

const houses = allHouses.filter(
  (house) => house.archived !== true
);
  const meters = Array.isArray(data?.meters) ? data.meters : [];

const waterMeters = Array.isArray(data?.waterMeters)
  ? data.waterMeters
  : [];

const waterBills = Array.isArray(data?.waterBills)
  ? data.waterBills
  : [];

const waterPayments = Array.isArray(data?.waterPayments)
  ? data.waterPayments
  : [];
const waterSupplierBills = Array.isArray(data?.waterSupplierBills)
  ? data.waterSupplierBills
  : [];

const waterFundExpenses = Array.isArray(data?.waterFundExpenses)
  ? data.waterFundExpenses
  : [];
const waterPaymentAllocations = Array.isArray(
  data?.waterPaymentAllocations
)
  ? data.waterPaymentAllocations
  : [];

const serviceCharges = Array.isArray(data?.serviceCharges)
  ? data.serviceCharges
  : [];

const [
  serviceChargePayments,
  setServiceChargePayments,
] = useState([]);

const [
  serviceChargePaymentAllocations,
  setServiceChargePaymentAllocations,
] = useState([]);

const [
  serviceChargeExpenses,
  setServiceChargeExpenses,
] = useState([]);

const [
  serviceChargeCorrections,
  setServiceChargeCorrections,
] = useState([]);

const [
  isLoadingServiceChargeRecords,
  setIsLoadingServiceChargeRecords,
] = useState(false);

useEffect(() => {
  let isServiceChargeLoadActive = true;

  const loadPermanentServiceChargeRecords = async () => {
    const currentServiceChargeShopId =
      data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1';

    setIsLoadingServiceChargeRecords(true);

    try {
      const [
        paymentsResult,
        allocationsResult,
        expensesResult,
        correctionsResult,
      ] = await Promise.all([
        supabase
          .from('serviceChargePayments')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('paymentDate', {
            ascending: false,
          })
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('serviceChargePaymentAllocations')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('serviceChargeExpenses')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('expenseDate', {
            ascending: false,
          })
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('serviceChargeCorrections')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('created_at', {
            ascending: false,
          }),
      ]);

      const firstLoadError =
        paymentsResult.error ||
        allocationsResult.error ||
        expensesResult.error ||
        correctionsResult.error;

      if (firstLoadError) {
        throw firstLoadError;
      }

      if (!isServiceChargeLoadActive) {
        return;
      }

      setServiceChargePayments(
        paymentsResult.data || []
      );

      setServiceChargePaymentAllocations(
        allocationsResult.data || []
      );

      setServiceChargeExpenses(
        expensesResult.data || []
      );

      setServiceChargeCorrections(
        correctionsResult.data || []
      );
    } catch (serviceChargeLoadError) {
      console.error(
        'Permanent Service Charge records failed to load:',
        serviceChargeLoadError
      );
    } finally {
      if (isServiceChargeLoadActive) {
        setIsLoadingServiceChargeRecords(false);
      }
    }
  };

  loadPermanentServiceChargeRecords();

  return () => {
    isServiceChargeLoadActive = false;
  };
}, [data?.currentUser?.id]);

const refreshServiceChargeBills = async () => {
  const currentServiceChargeShopId =
    data?.currentUser?.shop_id ||
    data?.currentUser?.shopId ||
    'shop-1';

  const {
    data: freshServiceChargeBills,
    error: serviceChargeBillsRefreshError,
  } = await supabase
    .from('servicecharges')
    .select('*')
    .eq('shop_id', currentServiceChargeShopId)
    .order('chargeMonth', {
      ascending: false,
    })
    .order('created_at', {
      ascending: false,
    });

  if (serviceChargeBillsRefreshError) {
    console.error(
      'Service Charge invoices failed to refresh:',
      serviceChargeBillsRefreshError
    );

    throw serviceChargeBillsRefreshError;
  }

  saveData({
    ...data,
    serviceCharges: freshServiceChargeBills || [],
  });

  return freshServiceChargeBills || [];
};

const refreshPermanentServiceChargeRecords =
  async () => {
    const currentServiceChargeShopId =
      data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1';

    setIsLoadingServiceChargeRecords(true);

    try {
      const [
        paymentsResult,
        allocationsResult,
        expensesResult,
        correctionsResult,
      ] = await Promise.all([
        supabase
          .from('serviceChargePayments')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('paymentDate', {
            ascending: false,
          })
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('serviceChargePaymentAllocations')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('serviceChargeExpenses')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('expenseDate', {
            ascending: false,
          })
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('serviceChargeCorrections')
          .select('*')
          .eq('shop_id', currentServiceChargeShopId)
          .order('created_at', {
            ascending: false,
          }),
      ]);

      const refreshError =
        paymentsResult.error ||
        allocationsResult.error ||
        expensesResult.error ||
        correctionsResult.error;

      if (refreshError) {
        throw refreshError;
      }

      setServiceChargePayments(
        paymentsResult.data || []
      );

      setServiceChargePaymentAllocations(
        allocationsResult.data || []
      );

      setServiceChargeExpenses(
        expensesResult.data || []
      );

      setServiceChargeCorrections(
        correctionsResult.data || []
      );
    } catch (serviceChargeRefreshError) {
      console.error(
        'Permanent Service Charge records failed to refresh:',
        serviceChargeRefreshError
      );

      throw serviceChargeRefreshError;
    } finally {
      setIsLoadingServiceChargeRecords(false);
    }
  };

const rentPayments = Array.isArray(data?.rentPayments)
  ? data.rentPayments
  : [];

const rentalTenants = Array.isArray(data?.rentalTenants)
  ? data.rentalTenants
  : [];

const propertyOccupancies = Array.isArray(data?.propertyOccupancies)
  ? data.propertyOccupancies
  : [];

const rentalTenancies = Array.isArray(data?.rentalTenancies)
  ? data.rentalTenancies
  : [];

const rentInvoices = Array.isArray(data?.rentInvoices)
  ? data.rentInvoices
  : [];

const rentalPayments = Array.isArray(data?.rentalPayments)
  ? data.rentalPayments
  : [];

const rentPaymentAllocations = Array.isArray(data?.rentPaymentAllocations)
  ? data.rentPaymentAllocations
  : [];

const rentalExpenses = Array.isArray(data?.rentalExpenses)
  ? data.rentalExpenses
  : [];

const rentRecordCorrections = Array.isArray(data?.rentRecordCorrections)
  ? data.rentRecordCorrections
  : [];

const rentSmsReminders = Array.isArray(data?.rentSmsReminders)
  ? data.rentSmsReminders
  : [];

const rentSmsAttempts = Array.isArray(data?.rentSmsAttempts)
  ? data.rentSmsAttempts
  : [];

  const utilitySmsReminders = Array.isArray(
  data?.utilitySmsReminders
)
  ? data.utilitySmsReminders
  : [];

useEffect(() => {
  let isUtilityReminderLoadActive = true;

  const loadUtilitySmsReminders = async () => {
    const currentUtilityShopId =
      data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1';

    const {
      data: freshUtilityReminders,
      error: utilityReminderLoadError,
    } = await supabase
      .from('utilitySmsReminders')
      .select('*')
      .eq('shop_id', currentUtilityShopId)
      .order('scheduledDate', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      });

    if (utilityReminderLoadError) {
      console.error(
        'Utility SMS reminders failed to load:',
        utilityReminderLoadError
      );
      return;
    }

    if (!isUtilityReminderLoadActive) {
      return;
    }

    saveData({
      ...data,
      utilitySmsReminders:
        freshUtilityReminders || [],
    });
  };

  loadUtilitySmsReminders();

  return () => {
    isUtilityReminderLoadActive = false;
  };
}, [data?.currentUser?.id]);


  const [
    rentalRegistrationForm,
    setRentalRegistrationForm,
  ] = useState({
    ...emptyRentalRegistrationForm,
  });

  const [
    rentalTenantEditForm,
    setRentalTenantEditForm,
  ] = useState({
    ...emptyRentalTenantEditForm,
  });

  const [rentalPaymentForm, setRentalPaymentForm] = useState({
    ...emptyRentalPaymentForm,
  });
  const [
    rentalPaymentCorrectionForm,
    setRentalPaymentCorrectionForm,
  ] = useState({
    ...emptyRentalPaymentCorrectionForm,
  });
  const [rentalExpenseForm, setRentalExpenseForm] = useState({
    ...emptyRentalExpenseForm,
  });

  const [rentalCorrectionForm, setRentalCorrectionForm] = useState({
    ...emptyRentalCorrectionForm,
  });

  const [isRentalRegistrationOpen, setIsRentalRegistrationOpen] =
    useState(false);

  const [isRentalTenantEditOpen, setIsRentalTenantEditOpen] =
    useState(false);

  const [isRentalPaymentOpen, setIsRentalPaymentOpen] =
    useState(false);
  const [
    isRentalPaymentCorrectionOpen,
    setIsRentalPaymentCorrectionOpen,
  ] = useState(false);
  const [isRentalExpenseOpen, setIsRentalExpenseOpen] =
    useState(false);

  const [isRentalCorrectionOpen, setIsRentalCorrectionOpen] =
    useState(false);

  const [rentSmsTestPhone, setRentSmsTestPhone] =
    useState('');

  const [isSendingRentSmsTest, setIsSendingRentSmsTest] =
    useState(false);

  const [isSavingRentalRegistration, setIsSavingRentalRegistration] =
    useState(false);

      const [isSavingRentalTenantEdit, setIsSavingRentalTenantEdit] =
    useState(false);

      const [
    isSavingRentalPaymentCorrection,
    setIsSavingRentalPaymentCorrection,
  ] = useState(false);
  const [isSavingRentalPayment, setIsSavingRentalPayment] =
    useState(false);

  const [isSavingRentalExpense, setIsSavingRentalExpense] =
    useState(false);

  const [isSavingRentalCorrection, setIsSavingRentalCorrection] =
    useState(false);

  const [houseForm, setHouseForm] = useState({ ...emptyHouseForm });
  const [meterForm, setMeterForm] = useState({ ...emptyMeterForm });
  const [isSavingMeter, setIsSavingMeter] = useState(false);
  const [waterPaymentForm, setWaterPaymentForm] = useState({
  ...emptyWaterPaymentForm,
});

const [isWaterPaymentOpen, setIsWaterPaymentOpen] = useState(false);
const [isSavingWaterPayment, setIsSavingWaterPayment] = useState(false);

const [waterSupplierBillForm, setWaterSupplierBillForm] = useState({
  ...emptyWaterSupplierBillForm,
});

const [waterFundExpenseForm, setWaterFundExpenseForm] = useState({
  ...emptyWaterFundExpenseForm,
});

const [isWaterSupplierBillFormOpen, setIsWaterSupplierBillFormOpen] =
  useState(false);

  const [showDawascoBillDetails, setShowDawascoBillDetails] =
  useState(false);

const [isWaterFundExpenseFormOpen, setIsWaterFundExpenseFormOpen] =
  useState(false);

const [isSavingWaterSupplierBill, setIsSavingWaterSupplierBill] =
  useState(false);

const [isSavingWaterFundExpense, setIsSavingWaterFundExpense] =
  useState(false);

const [serviceChargeForm, setServiceChargeForm] = useState({
  ...emptyServiceChargeForm,
});

const [
  serviceChargePaymentForm,
  setServiceChargePaymentForm,
] = useState({
  ...emptyServiceChargePaymentForm,
});

const [
  serviceChargeExpenseForm,
  setServiceChargeExpenseForm,
] = useState({
  ...emptyServiceChargeExpenseForm,
});

const [
  serviceChargeCorrectionForm,
  setServiceChargeCorrectionForm,
] = useState({
  ...emptyServiceChargeCorrectionForm,
});

const [
  serviceChargeHouseSettingForm,
  setServiceChargeHouseSettingForm,
] = useState({
  ...emptyServiceChargeHouseSettingForm,
});


const [
  serviceChargeInvoicePreparationForm,
  setServiceChargeInvoicePreparationForm,
] = useState({
  ...emptyServiceChargeInvoicePreparationForm,
});

const [
  isSavingServiceChargePayment,
  setIsSavingServiceChargePayment,
] = useState(false);

const [
  isSavingServiceChargeExpense,
  setIsSavingServiceChargeExpense,
] = useState(false);

const [
  isSavingServiceChargeCorrection,
  setIsSavingServiceChargeCorrection,
] = useState(false);
const [
  isSavingServiceChargeHouseSetting,
  setIsSavingServiceChargeHouseSetting,
] = useState(false);

const [
  isPreparingServiceChargeInvoices,
  setIsPreparingServiceChargeInvoices,
] = useState(false);
  const [isRentPaymentEntry, setIsRentPaymentEntry] = useState(false);
    useEffect(() => {
    const existingHistory = Array.isArray(data?.rentPayments) ? data.rentPayments : [];

    const makePaymentKey = (row) =>
      [
        String(row?.houseId || row?.id || ''),
        String(row?.rentPaidDate || ''),
        String(row?.rentStartDate || ''),
        String(row?.amountPaid || 0),
      ].join('|');

    const existingKeys = new Set(existingHistory.map(makePaymentKey));

    const migratedRentPayments = houses
      .filter((house) => Number(house?.amountPaid || 0) > 0)
      .map((house) => {
        const row = {
          id: `rent-payment-existing-${house.id || house.houseNumber}`,
          houseId: house.id || '',
          shop_id: house.shop_id || data?.currentUser?.shop_id || data?.currentUser?.shopId || 'shop-1',
          houseNumber: house.houseNumber || '',
          tenantName: house.tenantName || '',
          rentPaidDate: house.rentPaidDate || '',
          rentStartDate: house.rentStartDate || '',
          rentEndDate: house.rentEndDate || '',
          monthlyRentAmount: Number(house.monthlyRentAmount || 0),
          amountPaid: Number(house.amountPaid || 0),
          rentDurationMonths: Number(house.rentDurationMonths || 0),
          paymentType: house.paymentType || 'Full',
          nextPaymentDate: house.nextPaymentDate || '',
          balance: Number(house.balance || 0),
          created_at: house.created_at || new Date().toISOString(),
          source: 'existing_rent_report',
        };

        return row;
      })
      .filter((row) => !existingKeys.has(makePaymentKey(row)));

    if (!migratedRentPayments.length) return;

    saveData({
      ...data,
      rentPayments: [...existingHistory, ...migratedRentPayments],
    });

    supabase
      .from('rentPayments')
      .upsert(
        migratedRentPayments.map((row) => ({
          id: row.id,
          shop_id: row.shop_id,
          houseId: row.houseId,
          houseNumber: row.houseNumber || '',
          tenantName: row.tenantName || '',
          rentPaidDate: row.rentPaidDate || null,
          rentStartDate: row.rentStartDate || null,
          rentEndDate: row.rentEndDate || null,
          monthlyRentAmount: Number(row.monthlyRentAmount || 0),
          amountPaid: Number(row.amountPaid || 0),
          rentDurationMonths: Number(row.rentDurationMonths || 0),
          paymentType: row.paymentType || 'Full',
          nextPaymentDate: row.nextPaymentDate || null,
          balance: Number(row.balance || 0),
          source: row.source || 'existing_rent_report',
          created_at: row.created_at || new Date().toISOString(),
        })),
        { onConflict: 'id' }
      )
      .then(({ error }) => {
        if (error) {
          console.error('Existing rent payment history sync failed:', error);
        }
      });
  }, [houses, rentPayments.length]);
  const activeRentalTenancies = rentalTenancies.filter(
  (tenancy) => tenancy.status === 'Active'
);

const getRentalHouse = (houseId) =>
  houses.find(
    (house) => String(house.id) === String(houseId)
  );

const getRentalTenant = (tenantId) =>
  rentalTenants.find(
    (tenant) => String(tenant.id) === String(tenantId)
  );

const activeRentAccounts = activeRentalTenancies.map((tenancy) => ({
  ...tenancy,
  house: getRentalHouse(tenancy.houseId),
  tenant: getRentalTenant(tenancy.tenantId),
}));

const selectedRentPaymentAccount =
  activeRentAccounts.find(
    (account) =>
      String(account.id) ===
      String(rentalPaymentForm.tenancyId)
  );

const selectedRentPaymentMeter =
  selectedRentPaymentAccount
    ? waterMeters.find(
        (meter) =>
          String(meter.houseNumber || '') ===
            String(
              selectedRentPaymentAccount.house
                ?.houseNumber || ''
            ) &&
          meter.active !== false
      )
    : null;

    const rentalHouseAccounts = houses
  .filter((house) => house.archived !== true)
  .map((house) => {
    const occupancy = propertyOccupancies.find(
      (record) =>
        String(record.houseId) === String(house.id) &&
        record.active === true
    );

    const tenancy = activeRentalTenancies.find(
      (record) =>
        String(record.houseId) === String(house.id)
    );

    const tenantId =
      occupancy?.tenantId ||
      tenancy?.tenantId ||
      '';

    const tenant = rentalTenants.find(
      (record) =>
        String(record.id) === String(tenantId)
    );

    const meter = waterMeters.find(
      (record) =>
        String(record.houseNumber || '') ===
          String(house.houseNumber || '') &&
        record.active !== false
    );

    const occupancyType =
      occupancy?.occupancyType ||
      (String(house.houseStatus || '').toLowerCase() ===
      'vacant'
        ? 'Vacant'
        : tenancy
          ? 'Rent Paying Tenant'
          : 'Owner or Family');

    const statusLabel =
      occupancyType === 'Rent Paying Tenant'
        ? 'Mpangaji Anayelipa Kodi'
        : occupancyType === 'Owner or Family'
          ? 'Mmiliki au Familia'
          : occupancyType === 'Vacant'
            ? 'Tupu'
            : occupancyType;

    return {
      id: house.id,
      house,
      occupancy,
      tenancy,
      tenant,
      tenantId,
      meter,
      occupancyType,
      statusLabel,
    };
  })
  .sort((a, b) =>
    String(a.house?.houseNumber || '').localeCompare(
      String(b.house?.houseNumber || '')
    )
  );

const selectedRentalTenantEditAccount =
  rentalHouseAccounts.find(
    (account) =>
      String(account.house?.id) ===
      String(rentalTenantEditForm.houseId)
  );

const selectedRentalTenantEditMeter =
  selectedRentalTenantEditAccount?.meter || null;

    const selectedRentalPaymentCorrection =
  rentalPayments.find(
    (payment) =>
      String(payment.id) ===
        String(
          rentalPaymentCorrectionForm.paymentId
        ) &&
      payment.status === 'Active'
  );

const selectedRentalPaymentCorrectionAccount =
  selectedRentalPaymentCorrection
    ? activeRentAccounts.find(
        (account) =>
          String(account.id) ===
          String(
            selectedRentalPaymentCorrection.tenancyId
          )
      )
    : null;
const newTenantMonthlyRent = Number(
  rentalRegistrationForm.monthlyRentAmount || 0
);

const newTenantAmountReceived = Number(
  rentalRegistrationForm.amountReceived || 0
);

const newTenantFullMonths =
  newTenantMonthlyRent > 0
    ? Math.floor(
        newTenantAmountReceived /
          newTenantMonthlyRent
      )
    : 0;

const newTenantPaidThroughDate =
  rentalRegistrationForm.startDate &&
  newTenantFullMonths > 0
    ? addDaysISO(
        addMonthsISO(
          rentalRegistrationForm.startDate,
          newTenantFullMonths
        ),
        -1
      )
    : '';

const newTenantNextPaymentDate =
  newTenantPaidThroughDate
    ? addDaysISO(
        newTenantPaidThroughDate,
        1
      )
    : '';

const newTenantRemainingCredit =
  newTenantMonthlyRent > 0
    ? Math.max(
        0,
        newTenantAmountReceived -
          newTenantFullMonths *
            newTenantMonthlyRent
      )
    : 0;
const activeRentInvoices = rentInvoices.filter(
  (invoice) => invoice.status !== 'Reversed'
);

const activeRentalPayments = rentalPayments.filter(
  (payment) => payment.status === 'Active'
);

const activeRentalExpenses = rentalExpenses.filter(
  (expense) => expense.status === 'Active'
);

const totalRentInvoiced = activeRentInvoices.reduce(
  (total, invoice) =>
    total + Number(invoice.invoiceAmount || 0),
  0
);

const totalRentCollected = activeRentalPayments.reduce(
  (total, payment) =>
    total + Number(payment.amountReceived || 0),
  0
);

const totalRentOutstanding = activeRentInvoices.reduce(
  (total, invoice) =>
    total + Number(invoice.balance || 0),
  0
);

const totalRentCredit = activeRentalPayments.reduce(
  (total, payment) =>
    total + Number(payment.creditAmount || 0),
  0
);

const totalRentalExpensesPaid = activeRentalExpenses.reduce(
  (total, expense) =>
    total + Number(expense.amount || 0),
  0
);

const netRentFundBalance =
  totalRentCollected - totalRentalExpensesPaid;

const ownerOccupiedHouses = propertyOccupancies.filter(
  (occupancy) =>
    occupancy.active === true &&
    occupancy.occupancyType === 'Owner or Family'
);

const vacantRentalHouses = propertyOccupancies.filter(
  (occupancy) =>
    occupancy.active === true &&
    occupancy.occupancyType === 'Vacant'
);

const rentDueSoonAccounts = activeRentAccounts.filter((account) => {
  const days = daysBetween(todayISO(), account.nextPaymentDate);

  return (
    account.nextPaymentDate &&
    days !== null &&
    days >= 0 &&
    days <= 30
  );
});

const rentOverdueAccounts = activeRentAccounts.filter((account) => {
  const days = daysBetween(todayISO(), account.nextPaymentDate);

  return (
    account.nextPaymentDate &&
    days !== null &&
    days < 0
  );
});


const meterPreviewUnitsUsed = Math.max(
  0,
  Number(meterForm.currentUnits || 0) -
    Number(meterForm.previousUnits || 0)
);

const meterPreviewTotal = Math.max(
  0,
  meterPreviewUnitsUsed *
    Number(meterForm.costPerUnit || 0) -
    Number(meterForm.discount || 0)
);

const meterPreviewNextReading = meterForm.readingDate
  ? addMonthsISO(meterForm.readingDate, 1)
  : '';

const selectedPermanentMeter = waterMeters.find(
  (meter) =>
    String(meter.houseNumber || '') ===
      String(meterForm.houseNumber || '') &&
    String(meter.meterNumber || '') ===
      String(meterForm.meterNumber || '') &&
    meter.active !== false
);

const hasExistingMeter = Boolean(
  selectedPermanentMeter ||
    meters.some(
      (meter) =>
        String(meter.houseNumber || '') ===
          String(meterForm.houseNumber || '') &&
        String(meter.meterNumber || '') ===
          String(meterForm.meterNumber || '')
    )
);
const canManuallySetPreviousReading =
  selectedPermanentMeter?.baselineConfirmed !== true;
const selectedMeterOutstandingBalance =
  canManuallySetPreviousReading
    ? 0
    : waterBills
  .filter(
    (bill) =>
      (
        selectedPermanentMeter?.id
          ? String(bill.meterId || '') ===
            String(selectedPermanentMeter.id)
          : (
              String(bill.houseNumber || '') ===
                String(meterForm.houseNumber || '') &&
              String(bill.meterNumber || '') ===
                String(meterForm.meterNumber || '')
            )
      ) &&
      Number(bill.balance || 0) > 0
  )
  .reduce(
    (total, bill) => total + Number(bill.balance || 0),
    0
  );

const selectedMeterTotalPayable =
  selectedMeterOutstandingBalance +
  Number(meterPreviewTotal || 0);

const sendDueUtilitySmsReminders = async () => {
  try {
    const {
      data: sendResult,
      error: sendError,
    } = await supabase.functions.invoke(
      'send-utility-sms-reminders',
      {
        body: {
          requestedAt: new Date().toISOString(),
        },
      }
    );

    if (sendError) {
      throw sendError;
    }

    const {
      data: freshUtilityReminders,
      error: utilityRemindersError,
    } = await supabase
      .from('utilitySmsReminders')
      .select('*')
      .eq('shop_id', 'shop-1')
      .order('scheduledDate', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      });

    if (utilityRemindersError) {
      throw utilityRemindersError;
    }

    saveData({
      ...data,
      utilitySmsReminders:
        freshUtilityReminders || [],
    });

    const processed = Number(
      sendResult?.processed || 0
    );

    const sentCount = Array.isArray(
      sendResult?.results
    )
      ? sendResult.results.filter(
          (result) => result.status === 'Sent'
        ).length
      : 0;

    const failedCount = Array.isArray(
      sendResult?.results
    )
      ? sendResult.results.filter(
          (result) => result.status === 'Failed'
        ).length
      : 0;

    alert(
      processed === 0
        ? 'Hakuna kikumbusho cha maji au Service Charge kinachotakiwa kutumwa leo.'
        : `Vikumbusho vimechakatwa: ${processed}. Vimetumwa: ${sentCount}. Vilivyoshindikana: ${failedCount}.`
    );
  } catch (error) {
    alert(
      `Kutuma vikumbusho vya maji na Service Charge kumeshindikana: ${
        error?.message ||
        'Hitilafu isiyojulikana'
      }`
    );
  }
};

const refreshUtilitySmsRecords = async () => {
  const {
    data: freshUtilityReminders,
    error: utilityRemindersError,
  } = await supabase
    .from('utilitySmsReminders')
    .select('*')
    .eq('shop_id', 'shop-1')
    .order('scheduledDate', {
      ascending: false,
    })
    .order('created_at', {
      ascending: false,
    });

  if (utilityRemindersError) {
    throw utilityRemindersError;
  }

  saveData({
    ...data,
    utilitySmsReminders:
      freshUtilityReminders || [],
  });
};

const sendSingleUtilitySmsReminder = async (
  reminder
) => {
  if (!reminder?.id) {
    return;
  }

  const isFutureReminder =
    reminder.scheduledDate &&
    reminder.scheduledDate > todayISO();

  const confirmed = window.confirm(
    isFutureReminder
      ? `Kikumbusho hiki kimepangwa tarehe ${reminder.scheduledDate}. Ukitume mapema sasa?`
      : 'Utume kikumbusho hiki pekee sasa?'
  );

  if (!confirmed) {
    return;
  }

  try {
    const {
      data: sendResult,
      error: sendError,
    } = await supabase.functions.invoke(
      'send-utility-sms-reminders',
      {
        body: {
          reminderId: reminder.id,
          requestedAt: new Date().toISOString(),
        },
      }
    );

    if (sendError) {
      throw sendError;
    }

    const result = sendResult?.results?.[0];

    if (!result || result.status !== 'Sent') {
      throw new Error(
        result?.error ||
          'Mfumo wa SMS haujathibitisha kutumwa kwa ujumbe.'
      );
    }

    await refreshUtilitySmsRecords();

    alert(
      'Kikumbusho hiki cha maji na Service Charge kimetumwa vizuri.'
    );
  } catch (error) {
    alert(
      `Kutuma kikumbusho hiki kumeshindikana: ${
        error?.message ||
        'Hitilafu isiyojulikana'
      }`
    );
  }
};

const copyUtilitySmsReminderMessage = async (
  reminder
) => {
  const message = String(
    reminder?.message || ''
  ).trim();

  if (!message) {
    return;
  }

  try {
    await navigator.clipboard.writeText(message);

    alert('Ujumbe ulioandaliwa umenakiliwa.');
  } catch {
    window.prompt(
      'Nakili ujumbe huu:',
      message
    );
  }
};

const markUtilitySmsReminderManuallySent = async (
  reminder
) => {
  if (!reminder?.id) {
    return;
  }

  const confirmed = window.confirm(
    'Thibitisha kuwa tayari umetuma ujumbe huu mwenyewe. Mfumo hautautuma tena moja kwa moja.'
  );

  if (!confirmed) {
    return;
  }

  try {
    const {
      data: manualResult,
      error: manualError,
    } = await supabase.rpc(
      'mark_utility_sms_reminder_manually_sent',
      {
        p_reminder_id: reminder.id,
      }
    );

    if (manualError) {
      throw manualError;
    }

    if (manualResult?.success !== true) {
      throw new Error(
        'Kikumbusho hakikubadilishwa.'
      );
    }

    await refreshUtilitySmsRecords();

    alert(
      'Kikumbusho kimerekodiwa kuwa kimetumwa mwenyewe.'
    );
  } catch (error) {
    alert(
      `Kurekodi SMS iliyotumwa mwenyewe kumeshindikana: ${
        error?.message ||
        'Hitilafu isiyojulikana'
      }`
    );
  }
};

const sendRentSmsTest = async () => {
  const phoneNumber = String(
    rentSmsTestPhone || ''
  ).trim();

  if (!phoneNumber) {
    alert(
      t(
        language,
        'Enter the phone number that should receive the test message.',
        'Weka namba ya simu itakayopokea ujumbe wa majaribio.'
      )
    );
    return;
  }

  const confirmed = window.confirm(
    t(
      language,
      `Send a test SMS to ${phoneNumber} using SIM 2?`,
      `Utume SMS ya majaribio kwenda ${phoneNumber} kupitia SIM 2?`
    )
  );

  if (!confirmed) {
    return;
  }

  setIsSendingRentSmsTest(true);

  try {
    const { data: testResult, error: testError } =
      await supabase.functions.invoke(
        'send-rent-sms-reminders',
        {
          body: {
            mode: 'test',
            phoneNumber,
          },
        }
      );

    if (testError) {
      throw testError;
    }

    if (testResult?.sent !== true) {
      throw new Error(
        testResult?.error ||
          'The SMS provider did not confirm the test message.'
      );
    }

    alert(
      t(
        language,
        `The test SMS was submitted successfully to ${testResult.phoneNumber} through SIM 2.`,
        `SMS ya majaribio imetumwa kwenda ${testResult.phoneNumber} kupitia SIM 2.`
      )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Test SMS failed: ${
          error?.message || 'Unknown error'
        }`,
        `SMS ya majaribio imeshindikana: ${
          error?.message || 'Hitilafu isiyojulikana'
        }`
      )
    );
  } finally {
    setIsSendingRentSmsTest(false);
  }
};

  const sendDueRentSmsReminders = async () => {
  try {
    const { data: sendResult, error: sendError } =
      await supabase.functions.invoke(
        'send-rent-sms-reminders',
        {
          body: {
            requestedAt: new Date().toISOString(),
          },
        }
      );

    if (sendError) {
      throw sendError;
    }

    const [
      { data: freshReminders, error: remindersError },
      { data: freshAttempts, error: attemptsError },
    ] = await Promise.all([
      supabase
        .from('rentSmsReminders')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentSmsAttempts')
        .select('*')
        .eq('shop_id', 'shop-1'),
    ]);

    const refreshError =
      remindersError || attemptsError;

    if (!refreshError) {
      saveData({
        ...data,
        rentSmsReminders:
          freshReminders || rentSmsReminders,
        rentSmsAttempts:
          freshAttempts || rentSmsAttempts,
      });
    }

    const processed = Number(
      sendResult?.processed || 0
    );

    alert(
      processed > 0
        ? t(
            language,
            `${processed} rent reminder(s) were processed.`,
            `Vikumbusho ${processed} vya kodi vimefanyiwa kazi.`
          )
        : t(
            language,
            'The SMSGate connection worked. There is no rent reminder due for sending today.',
            'Muunganisho wa SMSGate umefanya kazi. Hakuna kikumbusho cha kodi kinachotakiwa kutumwa leo.'
          )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Sending rent reminders failed: ${
          error?.message || 'Unknown error'
        }`,
        `Kutuma vikumbusho vya kodi kumeshindikana: ${
          error?.message || 'Hitilafu isiyojulikana'
        }`
      )
    );
  }
};

  const refreshRentSmsRecords = async () => {
    const [
      { data: freshReminders, error: remindersError },
      { data: freshAttempts, error: attemptsError },
    ] = await Promise.all([
      supabase
        .from('rentSmsReminders')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentSmsAttempts')
        .select('*')
        .eq('shop_id', 'shop-1'),
    ]);

    const refreshError =
      remindersError || attemptsError;

    if (refreshError) {
      throw refreshError;
    }

    saveData({
      ...data,
      rentSmsReminders:
        freshReminders || rentSmsReminders,
      rentSmsAttempts:
        freshAttempts || rentSmsAttempts,
    });
  };

  const sendSingleRentSmsReminder = async (
    reminder
  ) => {
    if (!reminder?.id) {
      return;
    }

    const isFutureReminder =
      reminder.scheduledDate &&
      reminder.scheduledDate > todayISO();

    const confirmed = window.confirm(
      isFutureReminder
        ? t(
            language,
            `This reminder is scheduled for ${reminder.scheduledDate}. Send it early now?`,
            `Kikumbusho hiki kimepangwa tarehe ${reminder.scheduledDate}. Ukitume mapema sasa?`
          )
        : t(
            language,
            'Send only this reminder now?',
            'Utume kikumbusho hiki pekee sasa?'
          )
    );

    if (!confirmed) {
      return;
    }

    try {
      const { data: sendResult, error: sendError } =
        await supabase.functions.invoke(
          'send-rent-sms-reminders',
          {
            body: {
              reminderId: reminder.id,
              requestedAt: new Date().toISOString(),
            },
          }
        );

      if (sendError) {
        throw sendError;
      }

      const result = sendResult?.results?.[0];

      if (
        !result ||
        result.status !== 'Sent'
      ) {
        throw new Error(
          result?.error ||
            'The SMS provider did not confirm the message.'
        );
      }

      await refreshRentSmsRecords();

      alert(
        t(
          language,
          'This reminder has been sent successfully.',
          'Kikumbusho hiki kimetumwa vizuri.'
        )
      );
    } catch (error) {
      alert(
        t(
          language,
          `Sending this reminder failed: ${
            error?.message || 'Unknown error'
          }`,
          `Kutuma kikumbusho hiki kumeshindikana: ${
            error?.message ||
            'Hitilafu isiyojulikana'
          }`
        )
      );
    }
  };

  const copyRentSmsReminderMessage = async (
    reminder
  ) => {
    const message = String(
      reminder?.message || ''
    ).trim();

    if (!message) {
      return;
    }

    try {
      await navigator.clipboard.writeText(message);

      alert(
        t(
          language,
          'The prepared message has been copied.',
          'Ujumbe ulioandaliwa umenakiliwa.'
        )
      );
    } catch {
      window.prompt(
        t(
          language,
          'Copy the message below:',
          'Nakili ujumbe huu:'
        ),
        message
      );
    }
  };

  const markRentSmsReminderManuallySent = async (
    reminder
  ) => {
    if (!reminder?.id) {
      return;
    }

    const confirmed = window.confirm(
      t(
        language,
        'Confirm that you have already sent this exact message manually. The automatic system will not send it again.',
        'Thibitisha kuwa tayari umetuma ujumbe huu mwenyewe. Mfumo hautautuma tena moja kwa moja.'
      )
    );

    if (!confirmed) {
      return;
    }

    try {
      const {
        data: manualResult,
        error: manualError,
      } = await supabase.rpc(
        'mark_rent_sms_reminder_manually_sent',
        {
          p_reminder_id: reminder.id,
        }
      );

      if (manualError) {
        throw manualError;
      }

      if (manualResult?.success !== true) {
        throw new Error(
          'The reminder was not updated.'
        );
      }

      await refreshRentSmsRecords();

      alert(
        t(
          language,
          'The reminder has been recorded as sent manually.',
          'Kikumbusho kimerekodiwa kuwa kimetumwa mwenyewe.'
        )
      );
    } catch (error) {
      alert(
        t(
          language,
          `Recording the manual SMS failed: ${
            error?.message || 'Unknown error'
          }`,
          `Kurekodi SMS iliyotumwa mwenyewe kumeshindikana: ${
            error?.message ||
            'Hitilafu isiyojulikana'
          }`
        )
      );
    }
  };

  const saveRentalExpense = async () => {
  const expenseAmount = Number(
    rentalExpenseForm.amount || 0
  );

  if (
    !rentalExpenseForm.expenseDate ||
    !rentalExpenseForm.expenseType ||
    expenseAmount <= 0
  ) {
    alert(
      t(
        language,
        'Please enter the expense date, type and amount.',
        'Tafadhali weka tarehe, aina na kiasi cha matumizi.'
      )
    );
    return;
  }

  setIsSavingRentalExpense(true);

  try {
    const expenseRecord = {
      id: `rental-expense-${Date.now()}`,
      shop_id: 'shop-1',
      houseId: rentalExpenseForm.houseId || null,
      expenseDate:
        rentalExpenseForm.expenseDate || todayISO(),
      expenseType: rentalExpenseForm.expenseType,
      description:
        rentalExpenseForm.description?.trim() || '',
      amount: expenseAmount,
      payee: rentalExpenseForm.payee?.trim() || '',
      referenceNumber:
        rentalExpenseForm.referenceNumber?.trim() || '',
      status: 'Active',
    };

    const { data: savedExpense, error: expenseError } =
      await supabase
        .from('rentalExpenses')
        .insert([expenseRecord])
        .select('*')
        .single();

    if (expenseError) {
      throw expenseError;
    }

    saveData({
      ...data,
      rentalExpenses: [
        savedExpense || expenseRecord,
        ...rentalExpenses,
      ],
    });

    setRentalExpenseForm({
      ...emptyRentalExpenseForm,
      expenseDate: todayISO(),
    });
    setIsRentalExpenseOpen(false);

    alert(
      t(
        language,
        'The rental expense has been saved permanently.',
        'Matumizi ya kodi yamehifadhiwa kwa kudumu.'
      )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Saving the rental expense failed: ${
          error?.message || 'Unknown error'
        }`,
        `Kuhifadhi matumizi ya kodi kumeshindikana: ${
          error?.message || 'Hitilafu isiyojulikana'
        }`
      )
    );
  } finally {
    setIsSavingRentalExpense(false);
  }
};
  const openRentalPaymentCorrectionForm = (
    payment = null
  ) => {
    setRentalPaymentCorrectionForm({
      ...emptyRentalPaymentCorrectionForm,
      paymentId: payment?.id || '',
      correctedAmount:
        payment?.amountReceived || '',
      correctedPaymentDate:
        payment?.paymentDate || todayISO(),
      reason: '',
    });

    setIsRentalPaymentCorrectionOpen(true);
  };

  const handleRentalPaymentCorrectionSelection = (
    paymentId
  ) => {
    const selectedPayment = rentalPayments.find(
      (payment) =>
        String(payment.id) === String(paymentId) &&
        payment.status === 'Active'
    );

    if (!selectedPayment) {
      setRentalPaymentCorrectionForm({
        ...emptyRentalPaymentCorrectionForm,
      });
      return;
    }

    setRentalPaymentCorrectionForm({
      paymentId: selectedPayment.id,
      correctedAmount:
        selectedPayment.amountReceived || '',
      correctedPaymentDate:
        selectedPayment.paymentDate || todayISO(),
      reason: '',
    });
  };

  const openRentalPaymentForm = (
    tenancyId = ''
  ) => {
    setRentalPaymentForm({
      ...emptyRentalPaymentForm,
      tenancyId: tenancyId || '',
      amountReceived: '',
      paymentDate: todayISO(),
      paymentMethod: 'Cash',
      notes: '',
    });

    setIsRentalPaymentOpen(true);
  };
  const saveRentalPaymentCorrection = async () => {
    const correctedAmount = Number(
      rentalPaymentCorrectionForm.correctedAmount || 0
    );

    if (
      !rentalPaymentCorrectionForm.paymentId ||
      correctedAmount <= 0 ||
      !rentalPaymentCorrectionForm.correctedPaymentDate ||
      !rentalPaymentCorrectionForm.reason.trim()
    ) {
      alert(
        t(
          language,
          'Select the payment, enter the corrected amount and date, and explain the reason for the correction.',
          'Chagua malipo, weka kiasi na tarehe sahihi, kisha eleza sababu ya marekebisho.'
        )
      );
      return;
    }

    const originalPayment = rentalPayments.find(
      (payment) =>
        String(payment.id) ===
        String(rentalPaymentCorrectionForm.paymentId)
    );

    const paymentAccount = activeRentAccounts.find(
      (account) =>
        String(account.id) ===
        String(originalPayment?.tenancyId)
    );

    const confirmed = window.confirm(
      t(
        language,
        `Confirm payment correction:\n\nHouse: ${
          paymentAccount?.house?.houseNumber || '-'
        }\nTenant: ${
          paymentAccount?.tenant?.fullName ||
          paymentAccount?.house?.tenantName ||
          '-'
        }\nOld receipt: ${
          originalPayment?.receiptNumber || '-'
        }\nOld amount: TZS ${Number(
          originalPayment?.amountReceived || 0
        ).toLocaleString()}\nOld payment date: ${
          originalPayment?.paymentDate || '-'
        }\n\nCorrected amount: TZS ${correctedAmount.toLocaleString()}\nCorrected payment date: ${
          rentalPaymentCorrectionForm.correctedPaymentDate
        }\nReason: ${
          rentalPaymentCorrectionForm.reason
        }\n\nThe original payment will remain in history as corrected. Continue?`,
        `Thibitisha marekebisho ya malipo:\n\nNyumba: ${
          paymentAccount?.house?.houseNumber || '-'
        }\nMpangaji: ${
          paymentAccount?.tenant?.fullName ||
          paymentAccount?.house?.tenantName ||
          '-'
        }\nRisiti ya zamani: ${
          originalPayment?.receiptNumber || '-'
        }\nKiasi cha zamani: TZS ${Number(
          originalPayment?.amountReceived || 0
        ).toLocaleString()}\nTarehe ya zamani: ${
          originalPayment?.paymentDate || '-'
        }\n\nKiasi sahihi: TZS ${correctedAmount.toLocaleString()}\nTarehe sahihi ya malipo: ${
          rentalPaymentCorrectionForm.correctedPaymentDate
        }\nSababu: ${
          rentalPaymentCorrectionForm.reason
        }\n\nMalipo ya zamani yatabaki kwenye historia kama yaliyosahihishwa. Endelea?`
      )
    );

    if (!confirmed) {
      return;
    }

    setIsSavingRentalPaymentCorrection(true);

    try {
      const {
        data: correctionResult,
        error: correctionError,
      } = await supabase.rpc(
        'correct_rental_payment',
        {
          p_payment_id:
            rentalPaymentCorrectionForm.paymentId,
          p_corrected_amount: correctedAmount,
          p_corrected_payment_date:
            rentalPaymentCorrectionForm
              .correctedPaymentDate,
          p_reason:
            rentalPaymentCorrectionForm.reason.trim(),
        }
      );

      if (correctionError) {
        throw correctionError;
      }

      const [
        { data: freshHouses, error: housesError },
        { data: freshTenancies, error: tenanciesError },
        { data: freshInvoices, error: invoicesError },
        { data: freshPayments, error: paymentsError },
        { data: freshAllocations, error: allocationsError },
        { data: freshReminders, error: remindersError },
        { data: freshCorrections, error: correctionsError },
      ] = await Promise.all([
        supabase
          .from('houses')
          .select('*')
          .eq('shop_id', 'shop-1'),
        supabase
          .from('rentalTenancies')
          .select('*')
          .eq('shop_id', 'shop-1'),
        supabase
          .from('rentInvoices')
          .select('*')
          .eq('shop_id', 'shop-1'),
        supabase
          .from('rentalPayments')
          .select('*')
          .eq('shop_id', 'shop-1'),
        supabase
          .from('rentPaymentAllocations')
          .select('*')
          .eq('shop_id', 'shop-1'),
        supabase
          .from('rentSmsReminders')
          .select('*')
          .eq('shop_id', 'shop-1'),
        supabase
          .from('rentRecordCorrections')
          .select('*')
          .eq('shop_id', 'shop-1'),
      ]);

      const refreshError =
        housesError ||
        tenanciesError ||
        invoicesError ||
        paymentsError ||
        allocationsError ||
        remindersError ||
        correctionsError;

      if (refreshError) {
        throw refreshError;
      }

      saveData({
        ...data,
        houses: freshHouses || houses,
        rentalTenancies:
          freshTenancies || rentalTenancies,
        rentInvoices:
          freshInvoices || rentInvoices,
        rentalPayments:
          freshPayments || rentalPayments,
        rentPaymentAllocations:
          freshAllocations || rentPaymentAllocations,
        rentSmsReminders:
          freshReminders || rentSmsReminders,
        rentRecordCorrections:
          freshCorrections || rentRecordCorrections,
      });

      setRentalPaymentCorrectionForm({
        ...emptyRentalPaymentCorrectionForm,
      });
      setIsRentalPaymentCorrectionOpen(false);

      alert(
        t(
          language,
          `Payment corrected permanently.\n\nNew receipt: ${
            correctionResult?.receiptNumber || '-'
          }\nCorrected amount: TZS ${correctedAmount.toLocaleString()}\nRent paid through: ${
            correctionResult?.paidThroughDate || '-'
          }\nNext payment date: ${
            correctionResult?.nextPaymentDate || '-'
          }\nCredit balance: TZS ${Number(
            correctionResult?.creditBalance || 0
          ).toLocaleString()}`,
          `Malipo yamesahihishwa kwa kudumu.\n\nRisiti mpya: ${
            correctionResult?.receiptNumber || '-'
          }\nKiasi sahihi: TZS ${correctedAmount.toLocaleString()}\nKodi imelipwa hadi: ${
            correctionResult?.paidThroughDate || '-'
          }\nTarehe inayofuata ya malipo: ${
            correctionResult?.nextPaymentDate || '-'
          }\nSalio la mpangaji: TZS ${Number(
            correctionResult?.creditBalance || 0
          ).toLocaleString()}`
        )
      );
    } catch (error) {
      alert(
        t(
          language,
          `Payment correction failed: ${
            error?.message || 'Unknown error'
          }`,
          `Marekebisho ya malipo yameshindikana: ${
            error?.message ||
            'Hitilafu isiyojulikana'
          }`
        )
      );
    } finally {
      setIsSavingRentalPaymentCorrection(false);
    }
  };

  const saveRentalPayment = async () => {
  const amountReceived = Number(
    rentalPaymentForm.amountReceived || 0
  );

  if (!rentalPaymentForm.tenancyId || amountReceived <= 0) {
    alert(
      t(
        language,
        'Please select the tenant and enter the amount received.',
        'Tafadhali chagua mpangaji na uweke kiasi kilichopokelewa.'
      )
    );
    return;
  }

  const paymentTenantName =
    selectedRentPaymentAccount?.tenant?.fullName ||
    selectedRentPaymentAccount?.tenant?.tenantName ||
    selectedRentPaymentAccount?.house?.tenantName ||
    '-';

  const paymentHouseNumber =
    selectedRentPaymentAccount?.house?.houseNumber ||
    '-';

  const confirmed = window.confirm(
    t(
      language,
      `Confirm receipt of TZS ${currency(
        amountReceived
      )} from ${paymentTenantName} for house ${paymentHouseNumber}? This payment will be saved permanently.`,
      `Thibitisha kupokea TZS ${currency(
        amountReceived
      )} kutoka kwa ${paymentTenantName} wa nyumba ${paymentHouseNumber}. Malipo haya yatahifadhiwa moja kwa moja.`
    )
  );

  if (!confirmed) {
    return;
  }

  setIsSavingRentalPayment(true);

  try {
    const {
      data: paymentResult,
      error: paymentError,
    } = await supabase.rpc(
      'record_rental_payment',
      {
        p_tenancy_id: rentalPaymentForm.tenancyId,
        p_amount_received: amountReceived,
        p_payment_date:
          rentalPaymentForm.paymentDate || todayISO(),
        p_payment_method:
          rentalPaymentForm.paymentMethod || 'Cash',
        p_notes: rentalPaymentForm.notes || '',
      }
    );

    if (paymentError) {
      throw paymentError;
    }

    const { error: smsQueueError } = await supabase.rpc(
      'prepare_rent_sms_reminders'
    );

    if (smsQueueError) {
      console.error(
        'Updating rent SMS reminders failed:',
        smsQueueError
      );
    }

    const [
      { data: freshHouses, error: housesError },
      { data: freshTenancies, error: tenanciesError },
      { data: freshInvoices, error: invoicesError },
      { data: freshPayments, error: paymentsError },
      { data: freshAllocations, error: allocationsError },
      { data: freshReminders, error: remindersError },
    ] = await Promise.all([
      supabase
        .from('houses')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalTenancies')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentInvoices')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalPayments')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentPaymentAllocations')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentSmsReminders')
        .select('*')
        .eq('shop_id', 'shop-1'),
    ]);

    const refreshError =
      housesError ||
      tenanciesError ||
      invoicesError ||
      paymentsError ||
      allocationsError ||
      remindersError;

    if (!refreshError) {
      saveData({
        ...data,
        houses: freshHouses || houses,
        rentalTenancies:
          freshTenancies || rentalTenancies,
        rentInvoices: freshInvoices || rentInvoices,
        rentalPayments:
          freshPayments || rentalPayments,
        rentPaymentAllocations:
          freshAllocations || rentPaymentAllocations,
        rentSmsReminders:
          freshReminders || rentSmsReminders,
      });
    }

    setRentalPaymentForm({
      ...emptyRentalPaymentForm,
      paymentDate: todayISO(),
    });
    setIsRentalPaymentOpen(false);

    alert(
      t(
        language,
        `Payment saved permanently.

Tenant: ${paymentTenantName}
House: ${paymentHouseNumber}
Amount received: TZS ${currency(amountReceived)}
Complete months covered: ${
          paymentResult?.monthsCovered || 0
        }
Paid through: ${
          paymentResult?.paidThroughDate || '-'
        }
Next payment date: ${
          paymentResult?.nextPaymentDate || '-'
        }
Remaining credit: TZS ${currency(
          paymentResult?.creditBalance || 0
        )}${
          refreshError
            ? '\n\nRefresh the page to display the updated records.'
            : ''
        }`,
        `Malipo yamehifadhiwa kwa kudumu.

Mpangaji: ${paymentTenantName}
Nyumba: ${paymentHouseNumber}
Kiasi kilichopokelewa: TZS ${currency(
          amountReceived
        )}
Miezi kamili iliyolipiwa: ${
          paymentResult?.monthsCovered || 0
        }
Imelipwa hadi: ${
          paymentResult?.paidThroughDate || '-'
        }
Tarehe ya malipo yanayofuata: ${
          paymentResult?.nextPaymentDate || '-'
        }
Salio lililobaki: TZS ${currency(
          paymentResult?.creditBalance || 0
        )}${
          refreshError
            ? '\n\nRefresh ukurasa ili kuona rekodi zilizosasishwa.'
            : ''
        }`
      )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Rent payment failed: ${
          error?.message || 'Unknown error'
        }`,
        `Malipo ya kodi yameshindikana: ${
          error?.message || 'Hitilafu isiyojulikana'
        }`
      )
    );
  } finally {
    setIsSavingRentalPayment(false);
  }
};
const openRentalCorrectionForm = (account) => {
  if (!account) return;

  setRentalCorrectionForm({
    tenancyId: account.id || '',
    tenantName:
      account.tenant?.fullName ||
      account.tenant?.tenantName ||
      account.house?.tenantName ||
      '',
    phoneNumber:
      account.tenant?.phoneNumber || '',
    startDate:
      account.startDate || '',
    monthlyRentAmount:
      account.monthlyRentAmount || '',
    paidThroughDate:
      account.paidThroughDate || '',
    smsRemindersEnabled:
      account.smsRemindersEnabled !== false,
    reason: '',
  });

  setIsRentalCorrectionOpen(true);
};

const saveRentalCorrection = async () => {
  if (
    !rentalCorrectionForm.tenancyId ||
    !rentalCorrectionForm.tenantName.trim() ||
    !rentalCorrectionForm.startDate ||
    Number(
      rentalCorrectionForm.monthlyRentAmount || 0
    ) <= 0 ||
    !rentalCorrectionForm.reason.trim()
  ) {
    alert(
      t(
        language,
        'Enter the tenant name, start date, monthly rent and reason for correction.',
        'Weka jina la mpangaji, tarehe ya kuanza, kodi kwa mwezi na sababu ya marekebisho.'
      )
    );
    return;
  }

  setIsSavingRentalCorrection(true);

  try {
    const { error: correctionError } =
      await supabase.rpc(
        'correct_initial_rental_setup',
        {
          p_tenancy_id:
            rentalCorrectionForm.tenancyId,
          p_tenant_name:
            rentalCorrectionForm.tenantName.trim(),
          p_phone_number:
            rentalCorrectionForm.phoneNumber.trim(),
          p_start_date:
            rentalCorrectionForm.startDate,
          p_monthly_rent: Number(
            rentalCorrectionForm.monthlyRentAmount
          ),
          p_paid_through_date:
            rentalCorrectionForm.paidThroughDate ||
            null,
          p_sms_enabled:
            rentalCorrectionForm.smsRemindersEnabled ===
            true,
          p_reason:
            rentalCorrectionForm.reason.trim(),
        }
      );

    if (correctionError) {
      throw correctionError;
    }

    const { error: reminderError } =
      await supabase.rpc(
        'prepare_rent_sms_reminders'
      );

    if (reminderError) {
      console.error(
        'Rent reminder refresh failed:',
        reminderError
      );
    }

    const [
      { data: freshHouses, error: housesError },
      { data: freshTenants, error: tenantsError },
      {
        data: freshOccupancies,
        error: occupanciesError,
      },
      {
        data: freshTenancies,
        error: tenanciesError,
      },
      {
        data: freshReminders,
        error: remindersError,
      },
      {
        data: freshCorrections,
        error: correctionsError,
      },
    ] = await Promise.all([
      supabase
        .from('houses')
        .select('*')
        .eq('shop_id', 'shop-1'),

      supabase
        .from('rentalTenants')
        .select('*')
        .eq('shop_id', 'shop-1'),

      supabase
        .from('propertyOccupancies')
        .select('*')
        .eq('shop_id', 'shop-1'),

      supabase
        .from('rentalTenancies')
        .select('*')
        .eq('shop_id', 'shop-1'),

      supabase
        .from('rentSmsReminders')
        .select('*')
        .eq('shop_id', 'shop-1'),

      supabase
        .from('rentRecordCorrections')
        .select('*')
        .eq('shop_id', 'shop-1'),
    ]);

    const refreshError =
      housesError ||
      tenantsError ||
      occupanciesError ||
      tenanciesError ||
      remindersError ||
      correctionsError;

    if (refreshError) {
      throw refreshError;
    }

    saveData({
      ...data,
      houses: freshHouses || houses,
      rentalTenants:
        freshTenants || rentalTenants,
      propertyOccupancies:
        freshOccupancies || propertyOccupancies,
      rentalTenancies:
        freshTenancies || rentalTenancies,
      rentSmsReminders:
        freshReminders || rentSmsReminders,
      rentRecordCorrections:
        freshCorrections || rentRecordCorrections,
    });

    setRentalCorrectionForm({
      ...emptyRentalCorrectionForm,
    });

    setIsRentalCorrectionOpen(false);

    alert(
      t(
        language,
        'The initial rental details were corrected and the previous values were preserved in history.',
        'Taarifa za mwanzo za kodi zimerekebishwa na taarifa za awali zimehifadhiwa kwenye historia.'
      )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Rental correction failed: ${
          error?.message || 'Unknown error'
        }`,
        `Marekebisho ya kodi yameshindikana: ${
          error?.message ||
          'Hitilafu isiyojulikana'
        }`
      )
    );
  } finally {
    setIsSavingRentalCorrection(false);
  }
};
const openRentalTenantEditForm = () => {
  setRentalTenantEditForm({
    ...emptyRentalTenantEditForm,
  });
  setIsRentalTenantEditOpen(true);
};
const handleRentalTenantEditSelection = (houseId) => {
  const selectedAccount = rentalHouseAccounts.find(
    (account) =>
      String(account.house?.id) === String(houseId)
  );

  if (!selectedAccount) {
    setRentalTenantEditForm({
      ...emptyRentalTenantEditForm,
    });
    return;
  }

  const selectedTenant = selectedAccount.tenant;
  const selectedOccupancy = selectedAccount.occupancy;
  const selectedHouse = selectedAccount.house;

  setRentalTenantEditForm({
    houseId: selectedHouse?.id || '',
    tenantId: selectedTenant?.id || '',
    occupancyType:
      selectedAccount.occupancyType || '',
    fullName:
      selectedTenant?.fullName ||
      selectedTenant?.tenantName ||
      selectedOccupancy?.occupantName ||
      selectedHouse?.tenantName ||
      '',
    phoneNumber:
      selectedTenant?.phoneNumber || '',
    occupation:
      selectedTenant?.occupation || '',
    emergencyContactName:
      selectedTenant?.emergencyContactName || '',
    emergencyContactPhone:
      selectedTenant?.emergencyContactPhone || '',
    smsConsent:
      selectedTenant
        ? selectedTenant.smsConsent !== false
        : true,
    notes:
      selectedTenant?.notes ||
      selectedOccupancy?.notes ||
      '',
  });
};

const saveRentalTenantDetails = async () => {


  if (
    !rentalTenantEditForm.houseId ||
    !rentalTenantEditForm.fullName.trim()
  ) {
    alert(
      t(
        language,
        'Select a house and enter the occupant name.',
        'Chagua nyumba na uweke jina la mkazi.'
      )
    );
    return;
  }

  const selectedAccount =
    rentalHouseAccounts.find(
      (account) =>
        String(account.house?.id) ===
        String(rentalTenantEditForm.houseId)
    );

  if (!selectedAccount) {
    alert(
      t(
        language,
        'The selected house was not found.',
        'Nyumba iliyochaguliwa haikupatikana.'
      )
    );
    return;
  }

  if (
    selectedAccount.occupancyType === 'Vacant'
  ) {
    alert(
      t(
        language,
        'This house is vacant. Use the New Tenant form to register its new occupant.',
        'Nyumba hii ni tupu. Tumia fomu ya Mpangaji Mpya kumsajili mkazi mpya.'
      )
    );
    return;
  }

  const selectedMeter =
    selectedAccount.meter || null;

  const confirmed = window.confirm(
    t(
      language,
      `Confirm tenant details:\n\nHouse: ${
        selectedAccount?.house?.houseNumber || '-'
      }\nPermanent meter: ${
        selectedMeter?.meterNumber || '-'
      }\nTenant name: ${
        rentalTenantEditForm.fullName
      }\nPhone number: ${
        rentalTenantEditForm.phoneNumber || '-'
      }\nOccupation: ${
        rentalTenantEditForm.occupation || '-'
      }\nEmergency contact: ${
        rentalTenantEditForm.emergencyContactName || '-'
      }\nEmergency phone: ${
        rentalTenantEditForm.emergencyContactPhone || '-'
      }\n\nThe house and meter will not change. Save these details?`,
      `Thibitisha taarifa za mpangaji:\n\nNyumba: ${
        selectedAccount?.house?.houseNumber || '-'
      }\nMita ya kudumu: ${
        selectedMeter?.meterNumber || '-'
      }\nJina la mpangaji: ${
        rentalTenantEditForm.fullName
      }\nNamba ya simu: ${
        rentalTenantEditForm.phoneNumber || '-'
      }\nKazi: ${
        rentalTenantEditForm.occupation || '-'
      }\nMtu wa dharura: ${
        rentalTenantEditForm.emergencyContactName || '-'
      }\nSimu ya dharura: ${
        rentalTenantEditForm.emergencyContactPhone || '-'
      }\n\nNyumba na mita hazitabadilika. Uhifadhi taarifa hizi?`
    )
  );

  if (!confirmed) {
    return;
  }

  setIsSavingRentalTenantEdit(true);

  try {
    const {
      data: occupantUpdateResult,
      error: occupantUpdateError,
    } = await supabase.rpc(
      'update_property_occupant_details',
      {
        p_house_id:
          rentalTenantEditForm.houseId,
        p_full_name:
          rentalTenantEditForm.fullName,
        p_phone_number:
          rentalTenantEditForm.phoneNumber || '',
        p_occupation:
          rentalTenantEditForm.occupation || '',
        p_emergency_contact_name:
          rentalTenantEditForm.emergencyContactName || '',
        p_emergency_contact_phone:
          rentalTenantEditForm.emergencyContactPhone || '',
        p_sms_consent:
          rentalTenantEditForm.smsConsent === true,
        p_notes:
          rentalTenantEditForm.notes || '',
      }
    );

    if (occupantUpdateError) {
      throw occupantUpdateError;
    }

    const {
      error: utilityReminderPreparationError,
    } = await supabase.rpc(
      'prepare_house_utility_sms_reminders',
      {
        p_house_id:
          rentalTenantEditForm.houseId,
      }
    );

    if (utilityReminderPreparationError) {
      console.error(
        'Utility SMS reminder preparation failed:',
        utilityReminderPreparationError
      );
    }

    console.log(
      'Occupant details updated:',
      occupantUpdateResult
    );

    const [
      { data: freshHouses, error: housesError },
      { data: freshTenants, error: tenantsError },
      { data: freshOccupancies, error: occupanciesError },
      { data: freshTenancies, error: tenanciesError },
      { data: freshReminders, error: remindersError },
      { data: freshCorrections, error: correctionsError },
    ] = await Promise.all([
      supabase
        .from('houses')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalTenants')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('propertyOccupancies')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalTenancies')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentSmsReminders')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentRecordCorrections')
        .select('*')
        .eq('shop_id', 'shop-1'),
    ]);

    const refreshError =
      housesError ||
      tenantsError ||
      occupanciesError ||
      tenanciesError ||
      remindersError ||
      correctionsError;

    if (refreshError) {
      throw refreshError;
    }

    saveData({
      ...data,
      houses: freshHouses || houses,
      rentalTenants:
        freshTenants || rentalTenants,
      propertyOccupancies:
        freshOccupancies || propertyOccupancies,
      rentalTenancies:
        freshTenancies || rentalTenancies,
      rentSmsReminders:
        freshReminders || rentSmsReminders,
      rentRecordCorrections:
        freshCorrections || rentRecordCorrections,
    });

    setRentalTenantEditForm({
      ...emptyRentalTenantEditForm,
    });
    setIsRentalTenantEditOpen(false);

    alert(
      t(
        language,
        'The tenant details were updated permanently. The house and permanent meter were not changed.',
        'Taarifa za mpangaji zimesasishwa kwa kudumu. Nyumba na mita ya kudumu hazijabadilishwa.'
      )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Tenant update failed: ${
          error?.message || 'Unknown error'
        }`,
        `Kusasisha taarifa za mpangaji kumeshindikana: ${
          error?.message ||
          'Hitilafu isiyojulikana'
        }`
      )
    );
  } finally {
    setIsSavingRentalTenantEdit(false);
  }
};

const saveRentalRegistration = async () => {
  if (
    !rentalRegistrationForm.houseId ||
    !rentalRegistrationForm.occupancyType ||
    !rentalRegistrationForm.startDate
  ) {
    alert(
      t(
        language,
        'Please select the house, occupancy type and commencement date.',
        'Tafadhali chagua nyumba, aina ya matumizi na tarehe ya kuanza.'
      )
    );
    return;
  }

  if (
    rentalRegistrationForm.occupancyType ===
      'Rent Paying Tenant' &&
    (
      !rentalRegistrationForm.tenantName.trim() ||
      !rentalRegistrationForm.phoneNumber.trim() ||
      !rentalRegistrationForm.occupation.trim() ||
      !rentalRegistrationForm.emergencyContactName.trim() ||
      !rentalRegistrationForm.emergencyContactPhone.trim() ||
      !rentalRegistrationForm.paymentDate ||
      Number(
        rentalRegistrationForm.monthlyRentAmount || 0
      ) <= 0 ||
      Number(
        rentalRegistrationForm.amountReceived || 0
      ) <= 0
    )
  ) {
    alert(
      t(
        language,
        'Enter the tenant name, phone number, occupation, emergency contact, payment date, monthly rent and amount received.',
        'Weka jina la mpangaji, namba ya simu, kazi, mtu wa dharura, tarehe ya malipo, kodi kwa mwezi na kiasi kilichopokelewa.'
      )
    );
    return;
  }
  const registrationHouse = houses.find(
    (house) =>
      String(house.id) ===
      String(rentalRegistrationForm.houseId)
  );

  const registrationMeter = waterMeters.find(
    (meter) =>
      String(meter.houseNumber || '') ===
        String(registrationHouse?.houseNumber || '') &&
      meter.active !== false
  );

  const registrationConfirmed = window.confirm(
    t(
      language,
      `Please confirm:\n\nHouse: ${
        registrationHouse?.houseNumber || '-'
      }\nPermanent meter: ${
        registrationMeter?.meterNumber || '-'
      }\nNew tenant: ${
        rentalRegistrationForm.tenantName || '-'
      }\nMonthly rent: TZS ${Number(
        rentalRegistrationForm.monthlyRentAmount || 0
      ).toLocaleString()}\nAmount received: TZS ${Number(
        rentalRegistrationForm.amountReceived || 0
      ).toLocaleString()}\nPayment date: ${
        rentalRegistrationForm.paymentDate || '-'
      }\nHouse commencement date: ${
        rentalRegistrationForm.startDate || '-'
      }\n\nSave these details permanently?`,
      `Tafadhali thibitisha:\n\nNyumba: ${
        registrationHouse?.houseNumber || '-'
      }\nMita ya kudumu: ${
        registrationMeter?.meterNumber || '-'
      }\nMpangaji mpya: ${
        rentalRegistrationForm.tenantName || '-'
      }\nKodi kwa mwezi: TZS ${Number(
        rentalRegistrationForm.monthlyRentAmount || 0
      ).toLocaleString()}\nKiasi kilichopokelewa: TZS ${Number(
        rentalRegistrationForm.amountReceived || 0
      ).toLocaleString()}\nTarehe ya malipo: ${
        rentalRegistrationForm.paymentDate || '-'
      }\nTarehe ya kuanza kutumia nyumba: ${
        rentalRegistrationForm.startDate || '-'
      }\n\nUhifadhi taarifa hizi kwa kudumu?`
    )
  );

  if (!registrationConfirmed) {
    return;
  }

  setIsSavingRentalRegistration(true);

  try {
    const {
      data: registrationResult,
      error: registrationError,
    } = await supabase.rpc(
      'register_rental_occupancy_with_payment',
      {
        p_house_id: rentalRegistrationForm.houseId,
        p_occupancy_type:
          rentalRegistrationForm.occupancyType,
        p_occupant_name:
          rentalRegistrationForm.tenantName || '',
        p_phone_number:
          rentalRegistrationForm.phoneNumber || '',
        p_occupation:
          rentalRegistrationForm.occupation || '',
        p_emergency_contact_name:
          rentalRegistrationForm.emergencyContactName || '',
        p_emergency_contact_phone:
          rentalRegistrationForm.emergencyContactPhone || '',
        p_payment_date:
          rentalRegistrationForm.occupancyType ===
          'Rent Paying Tenant'
            ? rentalRegistrationForm.paymentDate || todayISO()
            : null,
        p_start_date:
          rentalRegistrationForm.startDate,
        p_monthly_rent:
          rentalRegistrationForm.occupancyType ===
          'Rent Paying Tenant'
            ? Number(
                rentalRegistrationForm.monthlyRentAmount || 0
              )
            : null,
        p_amount_received:
          rentalRegistrationForm.occupancyType ===
          'Rent Paying Tenant'
            ? Number(
                rentalRegistrationForm.amountReceived || 0
              )
            : 0,
        p_sms_enabled:
          rentalRegistrationForm.smsRemindersEnabled === true,
        p_notes:
          rentalRegistrationForm.notes || '',
      }
    );

    if (registrationError) {
      throw registrationError;
    }
    const { error: smsQueueError } = await supabase.rpc(
      'prepare_rent_sms_reminders'
    );

    if (smsQueueError) {
      console.error(
        'Rent SMS reminder preparation failed:',
        smsQueueError
      );
    }

    const [
      { data: freshHouses, error: housesError },
      { data: freshTenants, error: tenantsError },
      { data: freshOccupancies, error: occupanciesError },
      { data: freshTenancies, error: tenanciesError },
      { data: freshInvoices, error: invoicesError },
      { data: freshPayments, error: paymentsError },
      { data: freshAllocations, error: allocationsError },
      { data: freshReminders, error: remindersError },
    ] = await Promise.all([
      supabase
        .from('houses')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalTenants')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('propertyOccupancies')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalTenancies')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentInvoices')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentalPayments')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentPaymentAllocations')
        .select('*')
        .eq('shop_id', 'shop-1'),
      supabase
        .from('rentSmsReminders')
        .select('*')
        .eq('shop_id', 'shop-1'),
    ]);

    const refreshError =
      housesError ||
      tenantsError ||
      occupanciesError ||
      tenanciesError ||
      invoicesError ||
      paymentsError ||
      allocationsError ||
      remindersError;

    if (refreshError) {
      throw refreshError;
    }

    saveData({
      ...data,
      houses: freshHouses || houses,
      rentalTenants: freshTenants || rentalTenants,
      propertyOccupancies:
        freshOccupancies || propertyOccupancies,
      rentalTenancies:
        freshTenancies || rentalTenancies,
      rentInvoices:
        freshInvoices || rentInvoices,
      rentalPayments:
        freshPayments || rentalPayments,
      rentPaymentAllocations:
        freshAllocations || rentPaymentAllocations,
      rentSmsReminders:
        freshReminders || rentSmsReminders,
    });

    setRentalRegistrationForm({
      ...emptyRentalRegistrationForm,
    });
    setIsRentalRegistrationOpen(false);

    alert(
      t(
        language,
        rentalRegistrationForm.occupancyType ===
        'Rent Paying Tenant'
          ? `Saved permanently.\n\nHouse: ${
              registrationHouse?.houseNumber || '-'
            }\nPermanent meter: ${
              registrationMeter?.meterNumber || '-'
            }\nTenant: ${
              rentalRegistrationForm.tenantName || '-'
            }\nAmount received: TZS ${Number(
              rentalRegistrationForm.amountReceived || 0
            ).toLocaleString()}\nFull months covered: ${
              newTenantFullMonths
            }\nRent paid through: ${
              newTenantPaidThroughDate || '-'
            }\nNext payment date: ${
              newTenantNextPaymentDate || '-'
            }\nRemaining credit: TZS ${Number(
              newTenantRemainingCredit || 0
            ).toLocaleString()}`
          : `The ${rentalRegistrationForm.occupancyType} occupancy for house ${
              registrationHouse?.houseNumber || '-'
            } has been saved permanently.`,
        rentalRegistrationForm.occupancyType ===
        'Rent Paying Tenant'
          ? `Imehifadhiwa kwa kudumu.\n\nNyumba: ${
              registrationHouse?.houseNumber || '-'
            }\nMita ya kudumu: ${
              registrationMeter?.meterNumber || '-'
            }\nMpangaji: ${
              rentalRegistrationForm.tenantName || '-'
            }\nKiasi kilichopokelewa: TZS ${Number(
              rentalRegistrationForm.amountReceived || 0
            ).toLocaleString()}\nMiezi kamili iliyolipwa: ${
              newTenantFullMonths
            }\nKodi imelipwa hadi: ${
              newTenantPaidThroughDate || '-'
            }\nTarehe inayofuata ya malipo: ${
              newTenantNextPaymentDate || '-'
            }\nSalio la mpangaji: TZS ${Number(
              newTenantRemainingCredit || 0
            ).toLocaleString()}`
          : `Matumizi ya ${
              rentalRegistrationForm.occupancyType
            } katika nyumba ${
              registrationHouse?.houseNumber || '-'
            } yamehifadhiwa kwa kudumu.`
      )
    );
  } catch (error) {
    alert(
      t(
        language,
        `Occupancy registration failed: ${
          error?.message || 'Unknown error'
        }`,
        `Usajili wa matumizi ya nyumba umeshindikana: ${
          error?.message || 'Hitilafu isiyojulikana'
        }`
      )
    );
  } finally {
    setIsSavingRentalRegistration(false);
  }
};

  const housePreview = useMemo(() => {
  const monthlyRent = Number(houseForm.monthlyRentAmount || 0);
  const paid = Number(houseForm.amountPaid || 0);
  const rentStartDate = houseForm.rentStartDate || '';

  let rentEndDate = '';
  let nextPaymentDate = '';
  let calculatedMonths = 0;
  let fullMonths = 0;
  let extraAmount = 0;
  let balance = 0;
  let paymentStatus = 'Unpaid';

  if (monthlyRent > 0 && paid > 0) {
    calculatedMonths = paid / monthlyRent;
    fullMonths = Math.floor(calculatedMonths);
    extraAmount = paid - (fullMonths * monthlyRent);

    if (fullMonths < 1) {
      balance = monthlyRent - paid;
      paymentStatus = 'Partial';
    } else if (extraAmount === 0) {
      balance = 0;
      paymentStatus = 'Full';
    } else {
      balance = monthlyRent - extraAmount;
      paymentStatus = 'Partial';
    }
  }

  if (rentStartDate && monthlyRent > 0 && paid > 0) {
    if (fullMonths >= 1) {
      rentEndDate = addDaysISO(addMonthsISO(rentStartDate, fullMonths), -1);
      nextPaymentDate = addDaysISO(rentEndDate, 1);
    } else {
      rentEndDate = '';
      nextPaymentDate = rentStartDate;
    }
  }

  return {
    rentEndDate,
    nextPaymentDate,
    balance,
    calculatedMonths,
    fullMonths,
    extraAmount,
    paymentStatus,
  };
}, [houseForm]);

const saveHouse = async () => {
  if (!houseForm.houseNumber || !houseForm.monthlyRentAmount || !houseForm.rentStartDate) return;

  const shopId = String(
    data?.currentUser?.shop_id ||
    data?.currentUser?.shopId ||
    'shop-1'
  ).trim();

  const monthlyRent = Number(houseForm.monthlyRentAmount || 0);
  const paid = Number(houseForm.amountPaid || 0);
  const durationMonths = Number(housePreview.fullMonths || 0);
  const paymentType = housePreview.paymentStatus || 'Unpaid';

  const record = {
    id: houseForm.id || `house-${Date.now()}`,
    shop_id: shopId,
    houseNumber: houseForm.houseNumber,
    tenantName: houseForm.tenantName,
    rentPaidDate: houseForm.rentPaidDate,
    rentStartDate: houseForm.rentStartDate,
    rentEndDate: housePreview.rentEndDate,
    monthlyRentAmount: monthlyRent,
    amountPaid: paid,
    rentDurationMonths: durationMonths,
    paymentType,
    houseStatus: houseForm.houseStatus,
    itemsIssued: houseForm.itemsIssued,
    nextPaymentDate: housePreview.nextPaymentDate,
    balance: Number(housePreview.balance || 0),
  };

  const currentHouses = Array.isArray(data?.houses) ? data.houses : [];

  const updatedHouses = (() => {
    const idx = currentHouses.findIndex((x) => x.id === record.id);
    if (idx >= 0) {
      const next = [...currentHouses];
      next[idx] = record;
      return next;
    }
    return [record, ...currentHouses];
  })();

  const rentPaymentRecord = (isRentPaymentEntry || !houseForm.id) && paid > 0
    ? {
        id: `rent-payment-${Date.now()}`,
        houseId: record.id,
        shop_id: record.shop_id,
        houseNumber: record.houseNumber,
        tenantName: record.tenantName,
        rentPaidDate: record.rentPaidDate,
        rentStartDate: record.rentStartDate,
        rentEndDate: record.rentEndDate,
        monthlyRentAmount: record.monthlyRentAmount,
        amountPaid: record.amountPaid,
        rentDurationMonths: record.rentDurationMonths,
        paymentType: record.paymentType,
        nextPaymentDate: record.nextPaymentDate,
        balance: record.balance,
        created_at: new Date().toISOString(),
      }
    : null;

  // This is the missing part: update local app state immediately
  saveData({
    ...data,
    houses: updatedHouses,
    rentPayments: rentPaymentRecord ? [rentPaymentRecord, ...rentPayments] : rentPayments,
  });

  const { error } = await supabase
    .from('houses')
    .upsert(
      [
        {
          id: record.id,
          shop_id: record.shop_id,
          houseNumber: record.houseNumber,
          tenantName: record.tenantName || '',
          rentPaidDate: record.rentPaidDate || null,
          rentStartDate: record.rentStartDate || null,
          rentEndDate: record.rentEndDate || null,
          monthlyRentAmount: Number(record.monthlyRentAmount || 0),
          amountPaid: Number(record.amountPaid || 0),
          rentDurationMonths: Number(record.rentDurationMonths || 0),
          paymentType: record.paymentType || 'Unpaid',
          houseStatus: record.houseStatus || 'Occupied',
          itemsIssued: record.itemsIssued || '',
          nextPaymentDate: record.nextPaymentDate || null,
          balance: Number(record.balance || 0),
        },
      ],
      { onConflict: 'id' }
    );

  if (error) {
    alert(`House sync failed: ${error.message}`);
    return;
  }

  if (rentPaymentRecord) {
    const { error: rentPaymentError } = await supabase
      .from('rentPayments')
      .upsert(
        [
          {
            id: rentPaymentRecord.id,
            shop_id: rentPaymentRecord.shop_id,
            houseId: rentPaymentRecord.houseId,
            houseNumber: rentPaymentRecord.houseNumber || '',
            tenantName: rentPaymentRecord.tenantName || '',
            rentPaidDate: rentPaymentRecord.rentPaidDate || null,
            rentStartDate: rentPaymentRecord.rentStartDate || null,
            rentEndDate: rentPaymentRecord.rentEndDate || null,
            monthlyRentAmount: Number(rentPaymentRecord.monthlyRentAmount || 0),
            amountPaid: Number(rentPaymentRecord.amountPaid || 0),
            rentDurationMonths: Number(rentPaymentRecord.rentDurationMonths || 0),
            paymentType: rentPaymentRecord.paymentType || 'Unpaid',
            nextPaymentDate: rentPaymentRecord.nextPaymentDate || null,
            balance: Number(rentPaymentRecord.balance || 0),
            source: rentPaymentRecord.source || 'new_payment',
            created_at: rentPaymentRecord.created_at || new Date().toISOString(),
          },
        ],
        { onConflict: 'id' }
      );

    if (rentPaymentError) {
      alert(`Rent payment history sync failed: ${rentPaymentError.message}`);
      return;
    }
  }

  alert('Taarifa za nyumba zimehifadhiwa kikamilifu.');

  setHouseForm({ ...emptyHouseForm });
  setIsRentPaymentEntry(false);
};
const startEditingWaterSupplierBill = (bill) => {
  setWaterSupplierBillForm({
    id: bill.id || '',
    billNumber: bill.billNumber || '',
    controlNumber:
      bill.controlNumber || '991040283845',
    billDate: bill.billDate || '',
    dueDate: bill.dueDate || '',
    billingPeriodStart:
      bill.billingPeriodStart || '',
    billingPeriodEnd:
      bill.billingPeriodEnd || '',
    billAmount: String(bill.billAmount || ''),
    notes: bill.notes || '',
  });

  setShowDawascoBillDetails(false);
  setIsWaterFundExpenseFormOpen(false);
  setIsWaterSupplierBillFormOpen(true);
  setActiveTab('meters');
  setActiveWaterSection('waterFund');
};
const saveWaterSupplierBill = async () => {
  const billAmount = Number(
    waterSupplierBillForm.billAmount || 0
  );

  if (!waterSupplierBillForm.billDate || billAmount <= 0) {
    alert(
      t(
        language,
        'Enter the bill date and a valid bill amount.',
        'Weka tarehe ya ankara na kiasi sahihi cha ankara.'
      )
    );
    return;
  }
const existingBillBeingEdited = waterSupplierBills.find(
  (bill) =>
    String(bill.id || '') ===
    String(waterSupplierBillForm.id || '')
);

const amountAlreadyPaidOnBill = existingBillBeingEdited
  ? activeWaterFundExpenses
      .filter(
        (expense) =>
          String(expense.supplierBillId || '') ===
            String(existingBillBeingEdited.id || '') &&
          String(expense.expenseType || '') ===
            'DAWASCO Payment'
      )
      .reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0
      )
  : 0;

if (billAmount < amountAlreadyPaidOnBill) {
  alert(
    t(
      language,
      `The bill cannot be lower than the TZS ${currency(
        amountAlreadyPaidOnBill
      )} already paid.`,
      `Ankara haiwezi kuwa chini ya TZS ${currency(
        amountAlreadyPaidOnBill
      )} ambayo tayari imelipwa.`
    )
  );
  return;
}
  if (
    waterSupplierBillForm.billingPeriodStart &&
    waterSupplierBillForm.billingPeriodEnd &&
    waterSupplierBillForm.billingPeriodEnd <
      waterSupplierBillForm.billingPeriodStart
  ) {
    alert(
      t(
        language,
        'The billing period end date cannot be earlier than its start date.',
        'Tarehe ya mwisho ya kipindi cha ankara haiwezi kuwa kabla ya tarehe ya kuanza.'
      )
    );
    return;
  }

  const shopId = String(
    data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1'
  ).trim();

  const record = {
    id:
  waterSupplierBillForm.id ||
  `water-supplier-bill-${Date.now()}`,
    shop_id: shopId,
    supplierName: 'DAWASCO',
billNumber: String(
  waterSupplierBillForm.billNumber || ''
).trim(),
controlNumber: String(
  waterSupplierBillForm.controlNumber ||
    '991040283845'
).trim(),
billDate: waterSupplierBillForm.billDate,
    dueDate: waterSupplierBillForm.dueDate || null,
    billingPeriodStart:
      waterSupplierBillForm.billingPeriodStart || null,
    billingPeriodEnd:
      waterSupplierBillForm.billingPeriodEnd || null,
    billAmount,
    status: 'Active',
    notes: String(waterSupplierBillForm.notes || '').trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  setIsSavingWaterSupplierBill(true);

  const { error } = await supabase
  .from('waterSupplierBills')
  .upsert(
    [record],
    { onConflict: 'id' }
  );

  setIsSavingWaterSupplierBill(false);

  if (error) {
    alert(
      t(
        language,
        `DAWASCO bill could not be saved: ${error.message}`,
        `Ankara ya DAWASCO haijahifadhiwa: ${error.message}`
      )
    );
    return;
  }

  saveData({
  ...data,
  waterSupplierBills: waterSupplierBillForm.id
    ? waterSupplierBills.map((bill) =>
        String(bill.id || '') ===
        String(waterSupplierBillForm.id || '')
          ? record
          : bill
      )
    : [record, ...waterSupplierBills],
});

  setWaterSupplierBillForm({
    ...emptyWaterSupplierBillForm,
  });

  setIsWaterSupplierBillFormOpen(false);

  alert(
    t(
      language,
      'The DAWASCO bill has been saved permanently.',
      'Ankara ya DAWASCO imehifadhiwa kwa kudumu.'
    )
  );
};

const startEditingWaterFundExpense = (expense) => {
  setWaterFundExpenseForm({
    id: expense.id || '',
    supplierBillId: expense.supplierBillId || '',
    expenseType: expense.expenseType || 'Other',
    expenseDate: expense.expenseDate || todayISO(),
    amount: String(expense.amount || ''),
    payee: expense.payee || '',
    referenceNumber: expense.referenceNumber || '',
    notes: expense.notes || '',
  });

  setIsWaterSupplierBillFormOpen(false);
  setIsWaterFundExpenseFormOpen(true);
  setActiveTab('meters');
  setActiveWaterSection('waterFund');
};
const saveWaterFundExpense = async () => {
  const expenseAmount = Number(
    waterFundExpenseForm.amount || 0
  );

  if (
    !waterFundExpenseForm.expenseDate ||
    expenseAmount <= 0
  ) {
    alert(
      t(
        language,
        'Enter the expense date and a valid amount.',
        'Weka tarehe ya matumizi na kiasi sahihi.'
      )
    );
    return;
  }

  const isDawascoPayment =
    waterFundExpenseForm.expenseType ===
    'DAWASCO Payment';

  if (
    isDawascoPayment &&
    !waterFundExpenseForm.supplierBillId
  ) {
    alert(
      t(
        language,
        'Select the DAWASCO bill being paid.',
        'Chagua ankara ya DAWASCO inayolipwa.'
      )
    );
    return;
  }

  if (isDawascoPayment) {
    const selectedBill = activeWaterSupplierBills.find(
      (bill) =>
        String(bill.id || '') ===
        String(
          waterFundExpenseForm.supplierBillId || ''
        )
    );

    if (!selectedBill) {
      alert(
        t(
          language,
          'The selected DAWASCO bill was not found.',
          'Ankara ya DAWASCO iliyochaguliwa haijapatikana.'
        )
      );
      return;
    }

    const amountAlreadyPaid = activeWaterFundExpenses
      .filter(
        (expense) =>
          String(expense.supplierBillId || '') ===
            String(selectedBill.id || '') &&
          String(expense.expenseType || '') ===
            'DAWASCO Payment'
      )
      .reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0
      );

    const remainingBillBalance = Math.max(
      0,
      Number(selectedBill.billAmount || 0) -
        amountAlreadyPaid
    );

    if (expenseAmount > remainingBillBalance) {
      alert(
        t(
          language,
          `The payment exceeds the remaining DAWASCO balance of TZS ${currency(
            remainingBillBalance
          )}.`,
          `Malipo yanazidi salio la DAWASCO la TZS ${currency(
            remainingBillBalance
          )}.`
        )
      );
      return;
    }
  }

  const shopId = String(
    data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1'
  ).trim();

  const record = {
    id: `water-fund-expense-${Date.now()}`,
    shop_id: shopId,
    supplierBillId: isDawascoPayment
      ? waterFundExpenseForm.supplierBillId
      : null,
    expenseType: waterFundExpenseForm.expenseType,
    expenseDate: waterFundExpenseForm.expenseDate,
    amount: expenseAmount,
    payee: String(
      waterFundExpenseForm.payee ||
        (isDawascoPayment ? 'DAWASCO' : '')
    ).trim(),
    referenceNumber: String(
      waterFundExpenseForm.referenceNumber || ''
    ).trim(),
    status: 'Active',
correctedFromId:
  waterFundExpenseForm.id || null,
notes: String(
  waterFundExpenseForm.notes || ''
).trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

setIsSavingWaterFundExpense(true);

let error = null;

if (waterFundExpenseForm.id) {
  const { error: amendmentError } = await supabase.rpc(
    'amend_water_fund_expense',
    {
      p_original_id: waterFundExpenseForm.id,
      p_new_id: record.id,
      p_shop_id: record.shop_id,
      p_supplier_bill_id:
        record.supplierBillId || null,
      p_expense_type: record.expenseType,
      p_expense_date: record.expenseDate,
      p_amount: record.amount,
      p_payee: record.payee,
      p_reference_number: record.referenceNumber,
      p_notes: record.notes,
    }
  );

  error = amendmentError;
} else {
  const { error: insertError } = await supabase
    .from('waterFundExpenses')
    .insert([record]);

  error = insertError;
}

setIsSavingWaterFundExpense(false);

  if (error) {
    alert(
      t(
        language,
        `The water expense could not be saved: ${error.message}`,
        `Matumizi ya maji hayajahifadhiwa: ${error.message}`
      )
    );
    return;
  }

  saveData({
  ...data,
  waterFundExpenses: waterFundExpenseForm.id
    ? [
        record,
        ...waterFundExpenses.map((expense) =>
          String(expense.id || '') ===
          String(waterFundExpenseForm.id || '')
            ? {
                ...expense,
                status: 'Reversed',
                updated_at: new Date().toISOString(),
              }
            : expense
        ),
      ]
    : [record, ...waterFundExpenses],
});

  setWaterFundExpenseForm({
    ...emptyWaterFundExpenseForm,
  });

  setIsWaterFundExpenseFormOpen(false);

  alert(
    t(
      language,
      'The water expense has been saved permanently.',
      'Matumizi ya maji yamehifadhiwa kwa kudumu.'
    )
  );
};

const reverseWaterFundExpense = async (expense) => {
  const confirmed = window.confirm(
    t(
      language,
      'Reverse this water payment or expense? The original record will remain permanently visible in the report.',
      'Unataka kurejesha nyuma malipo au matumizi haya? Rekodi yake ya awali itaendelea kuonekana kwenye ripoti ya kudumu.'
    )
  );

  if (!confirmed) return;

  const shopId = String(
    expense?.shop_id ||
      data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1'
  ).trim();

  const reversedAt = new Date().toISOString();

  const { data: updatedExpense, error } = await supabase
    .from('waterFundExpenses')
    .update({
      status: 'Reversed',
      updated_at: reversedAt,
    })
    .eq('id', expense.id)
    .eq('shop_id', shopId)
    .select('*')
    .single();

  if (error || !updatedExpense) {
    alert(
      t(
        language,
        `The transaction could not be reversed: ${
          error?.message || 'Record not found'
        }`,
        `Muamala haujaweza kurejeshwa nyuma: ${
          error?.message || 'Rekodi haijapatikana'
        }`
      )
    );
    return;
  }

  saveData({
    ...data,
    waterFundExpenses: waterFundExpenses.map((item) =>
      String(item.id || '') === String(expense.id || '')
        ? {
            ...item,
            status: 'Reversed',
            updated_at: reversedAt,
          }
        : item
    ),
  });

  alert(
    t(
      language,
      'The transaction has been reversed and its history preserved.',
      'Muamala umerejeshwa nyuma na historia yake imehifadhiwa.'
    )
  );
};

const cancelWaterSupplierBill = async (bill) => {
  const linkedActivePayments = activeWaterFundExpenses.filter(
    (expense) =>
      String(expense.supplierBillId || '') ===
        String(bill.id || '') &&
      String(expense.expenseType || '') ===
        'DAWASCO Payment'
  );

  if (linkedActivePayments.length > 0) {
    alert(
      t(
        language,
        'This bill has active payments. Reverse those payments before cancelling the bill.',
        'Ankara hii ina malipo yanayotumika. Rejesha nyuma malipo hayo kabla ya kufuta ankara.'
      )
    );
    return;
  }

  const confirmed = window.confirm(
    t(
      language,
      'Cancel this DAWASCO bill? Its original record will remain permanently visible in the report.',
      'Unataka kubatilisha ankara hii ya DAWASCO? Rekodi yake ya awali itaendelea kuonekana kwenye ripoti ya kudumu.'
    )
  );

  if (!confirmed) return;

  const shopId = String(
    bill?.shop_id ||
      data?.currentUser?.shop_id ||
      data?.currentUser?.shopId ||
      'shop-1'
  ).trim();

  const cancelledAt = new Date().toISOString();

  const { data: updatedBill, error } = await supabase
    .from('waterSupplierBills')
    .update({
      status: 'Cancelled',
      updated_at: cancelledAt,
    })
    .eq('id', bill.id)
    .eq('shop_id', shopId)
    .select('*')
    .single();

  if (error || !updatedBill) {
    alert(
      t(
        language,
        `The DAWASCO bill could not be cancelled: ${
          error?.message || 'Record not found'
        }`,
        `Ankara ya DAWASCO haijaweza kubatilishwa: ${
          error?.message || 'Rekodi haijapatikana'
        }`
      )
    );
    return;
  }

  saveData({
    ...data,
    waterSupplierBills: waterSupplierBills.map((item) =>
      String(item.id || '') === String(bill.id || '')
        ? {
            ...item,
            status: 'Cancelled',
            updated_at: cancelledAt,
          }
        : item
    ),
  });

  alert(
    t(
      language,
      'The bill has been cancelled and its history preserved.',
      'Ankara imebatilishwa na historia yake imehifadhiwa.'
    )
  );
};

  const saveMeter = async () => {
  if (
    !meterForm.houseNumber ||
    !meterForm.meterNumber ||
!meterForm.previousReadingDate ||
!meterForm.readingDate ||
meterForm.previousUnits === '' ||
meterForm.currentUnits === ''
  ) {
    alert(
      t(
        language,
        hasExistingMeter
          ? 'Please select a house and enter the current meter reading.'
          : 'Please select a house and enter the meter number, previous reading and current reading.',
        hasExistingMeter
          ? 'Tafadhali chagua nyumba na uweke usomaji wa sasa wa mita.'
          : 'Tafadhali chagua nyumba, weka namba ya mita, usomaji uliopita na usomaji wa sasa.'
      )
    );
    return;
  }

  
if (
  meterForm.previousReadingDate &&
  meterForm.readingDate &&
  meterForm.previousReadingDate > meterForm.readingDate
) {
  alert(
    t(
      language,
      'Previous reading date cannot be later than the current reading date.',
      'Tarehe ya usomaji uliopita haiwezi kuwa baada ya tarehe ya usomaji wa sasa.'
    )
  );
  return;
}

  if (
  Number(meterForm.currentUnits) <
    Number(meterForm.previousUnits)
) {
    alert(
      t(
        language,
        'Current reading cannot be lower than the previous reading.',
        'Usomaji wa sasa hauwezi kuwa mdogo kuliko usomaji uliopita.'
      )
    );
    return;
  }
  if (
    hasExistingMeter &&
    meterForm.paymentReceived === 'Yes' &&
    (
      !meterForm.paymentDate ||
      Number(meterForm.amountReceived || 0) <= 0
    )
  ) {
    alert(
      t(
        language,
        'Please enter a valid payment date and amount received.',
        'Tafadhali weka tarehe sahihi ya malipo na kiasi kilichopokelewa.'
      )
    );
    return;
  }

  if (
    hasExistingMeter &&
    meterForm.paymentReceived === 'Yes' &&
    meterForm.readingDate &&
    meterForm.paymentDate < meterForm.readingDate
  ) {
    alert(
      t(
        language,
        'Payment date cannot be earlier than the meter reading date.',
        'Tarehe ya malipo haiwezi kuwa kabla ya tarehe ya usomaji wa mita.'
      )
    );
    return;
  }
const selectedHouse = houses.find(
  (house) =>
    String(house.houseNumber || '') ===
    String(meterForm.houseNumber || '')
);

const shopId =
  data?.currentUser?.shop_id ||
  data?.currentUser?.shopId ||
  'shop-1';

const localRegisteredMeter = waterMeters.find(
  (meter) =>
    String(meter.meterNumber || '').trim().toLowerCase() ===
    String(meterForm.meterNumber || '').trim().toLowerCase()
);

const {
  data: cloudRegisteredMeter,
  error: registeredMeterLookupError,
} = await supabase
  .from('waterMeters')
  .select('*')
  .eq('shop_id', shopId)
  .eq('meterNumber', String(meterForm.meterNumber || '').trim())
  .maybeSingle();

if (registeredMeterLookupError) {
  alert(
    `Existing water meter lookup failed: ${registeredMeterLookupError.message}`
  );
  return;
}

const registeredMeter =
  cloudRegisteredMeter || localRegisteredMeter;


if (
  registeredMeter &&
  String(registeredMeter.houseNumber || '').trim().toLowerCase() !==
    String(meterForm.houseNumber || '').trim().toLowerCase()
) {
  alert(
    t(
      language,
      `Meter ${meterForm.meterNumber} is already registered to house ${registeredMeter.houseNumber}. It cannot be used for house ${meterForm.houseNumber}.`,
      `Mita ${meterForm.meterNumber} tayari imesajiliwa katika nyumba ${registeredMeter.houseNumber}. Haiwezi kutumika katika nyumba ${meterForm.houseNumber}.`
    )
  );
  return;
}

const meterRegistryId =
  registeredMeter?.id || `water-meter-${Date.now()}`;

const permanentMeterRecord = {
  id: meterRegistryId,
  shop_id: shopId,
  houseNumber: meterForm.houseNumber,
  meterNumber: meterForm.meterNumber,
  meterType: meterForm.meterType || 'Water',
  costPerUnit: Number(meterForm.costPerUnit || WATER_UNIT_PRICE),
openingReading: registeredMeter?.lastReadingDate
  ? Number(registeredMeter.openingReading || 0)
  : Number(meterForm.previousUnits || 0),
  lastReading: Number(meterForm.currentUnits || 0),
  lastReadingDate: meterForm.readingDate || null,
  nextReadingDate: meterPreviewNextReading || null,
 active: true,
baselineConfirmed: true,
notes: meterForm.notes || '',
  created_at:
    registeredMeter?.created_at || new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const latestExistingReading = meters
  .filter(
    (meter) =>
      String(meter.houseNumber || '') ===
        String(meterForm.houseNumber || '') &&
      String(meter.meterNumber || '') ===
        String(meterForm.meterNumber || '')
  )
  .sort(
    (a, b) =>
      new Date(b.readingDate || b.created_at || 0).getTime() -
      new Date(a.readingDate || a.created_at || 0).getTime()
  )[0];


const currentBillAmount = Number(meterPreviewTotal || 0);

const {
  data: existingSameDayWaterBill,
  error: existingSameDayWaterBillError,
} = await supabase
  .from('waterBills')
  .select('*')
  .eq('shop_id', shopId)
  .eq('meterId', meterRegistryId)
  .eq('readingDate', meterForm.readingDate)
  .maybeSingle();

if (existingSameDayWaterBillError) {
  alert(
    `Water bill check failed: ${existingSameDayWaterBillError.message}`
  );
  return;
}

const existingAmountPaid = Number(
  existingSameDayWaterBill?.amountPaid || 0
);

const correctedBillBalance = Math.max(
  0,
  currentBillAmount - existingAmountPaid
);

const correctedBillStatus =
  existingAmountPaid > currentBillAmount
    ? 'Credit'
    : correctedBillBalance <= 0
      ? 'Paid'
      : existingAmountPaid > 0
        ? 'Partially Paid'
        : 'Unpaid';

const waterBillRecord = {
  id:
    existingSameDayWaterBill?.id ||
    `water-bill-${Date.now()}`,
  shop_id: shopId,
  meterId: meterRegistryId,
  houseNumber: meterForm.houseNumber,
  tenantName: selectedHouse?.tenantName || '',
  houseStatus: selectedHouse?.houseStatus || '',
  meterNumber: meterForm.meterNumber,
  billingPeriodStart:
    meterForm.previousReadingDate || null,
  billingPeriodEnd: meterForm.readingDate
    ? addDaysISO(meterForm.readingDate, -1)
    : null,
  readingDate: meterForm.readingDate || null,
  previousUnits: Number(meterForm.previousUnits || 0),
  currentUnits: Number(meterForm.currentUnits || 0),
  unitsUsed: Number(meterPreviewUnitsUsed || 0),
  costPerUnit: Number(
    meterForm.costPerUnit || WATER_UNIT_PRICE
  ),
  discount: Number(meterForm.discount || 0),
  currentBillAmount,
  previousBalance: 0,
  totalPayable: currentBillAmount,
  amountPaid: existingAmountPaid,
  balance: correctedBillBalance,
  status: correctedBillStatus,
  dueDate: meterForm.readingDate
    ? addDaysISO(meterForm.readingDate, 3)
    : null,
  nextReadingDate: meterPreviewNextReading || null,
  notes: meterForm.notes || '',
  created_at:
    existingSameDayWaterBill?.created_at ||
    new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
const record = {
  id: meterForm.id || `meter-${Date.now()}`,
  houseNumber: meterForm.houseNumber,
  tenantName: selectedHouse?.tenantName || '',
  houseStatus: selectedHouse?.houseStatus || '',
  meterType: meterForm.meterType,
  meterNumber: meterForm.meterNumber,
    readingDate: meterForm.readingDate,
    previousUnits: Number(meterForm.previousUnits || 0),
   currentUnits: Number(meterForm.currentUnits || 0),
    unitsUsed: meterPreviewUnitsUsed,
    costPerUnit: Number(meterForm.costPerUnit || 0),
    discount: Number(meterForm.discount || 0),
    totalAmount: meterPreviewTotal,
    nextReadingDate: meterPreviewNextReading,
    notes: meterForm.notes,
  };

  const updatedMeters = (() => {
    const idx = meters.findIndex((x) => x.id === record.id);
    if (idx >= 0) {
      const next = [...meters];
      next[idx] = record;
      return next;
    }
    return [record, ...meters];
  })();

  const updatedWaterMeters = registeredMeter
  ? waterMeters.map((meter) =>
      String(meter.id) === String(meterRegistryId)
        ? permanentMeterRecord
        : meter
    )
  : [permanentMeterRecord, ...waterMeters];

const updatedWaterBills = existingSameDayWaterBill
  ? waterBills.map((bill) =>
      String(bill.id || '') ===
      String(existingSameDayWaterBill.id || '')
        ? waterBillRecord
        : bill
    )
  : [waterBillRecord, ...waterBills];

saveData({
  ...data,
  meters: updatedMeters,
  waterMeters: updatedWaterMeters,
  waterBills: updatedWaterBills,
});

  const { error } = await supabase
    .from('meters')
    .upsert(
      [
        {
          id: record.id,
          shop_id: data?.currentUser?.shop_id || data?.currentUser?.shopId || 'shop-1',
          houseNumber: record.houseNumber,
tenantName: record.tenantName || '',
houseStatus: record.houseStatus || '',
meterType: record.meterType || 'Water',
meterNumber: record.meterNumber,
          readingDate: record.readingDate || null,
          previousUnits: Number(record.previousUnits || 0),
          currentUnits: Number(record.currentUnits || 0),
          unitsUsed: Number(record.unitsUsed || 0),
          costPerUnit: Number(record.costPerUnit || 0),
          discount: Number(record.discount || 0),
          totalAmount: Number(record.totalAmount || 0),
          nextReadingDate: record.nextReadingDate || null,
          notes: record.notes || '',
        },
      ],
      { onConflict: 'id' }
    );

if (error) {
  alert(`Meter sync failed: ${error.message}`);
  return;
}

const { error: waterMeterError } = await supabase
  .from('waterMeters')
  .upsert(
    [permanentMeterRecord],
    { onConflict: 'id' }
  );

if (waterMeterError) {
  alert(
    `Permanent water meter sync failed: ${waterMeterError.message}`
  );
  return;
}

const { error: waterBillError } = await supabase
  .from('waterBills')
  .upsert(
    [waterBillRecord],
    { onConflict: 'id' }
  );

if (waterBillError) {
  alert(
    `Monthly water bill sync failed: ${waterBillError.message}`
  );
  return;
}

/*
 * Create one monthly Service Charge only for an active
 * rent-paying tenant. Owner/family and vacant houses are excluded.
 */
const activeServiceChargeAccount =
  activeRentAccounts.find(
    (account) =>
      String(account.house?.houseNumber || '') ===
      String(meterForm.houseNumber || '')
  );

if (
  activeServiceChargeAccount &&
  meterForm.readingDate
) {
  const serviceChargeMonth =
    meterForm.readingDate.slice(0, 7);

  const serviceChargeDueDate =
    addDaysISO(meterForm.readingDate, 3);

  const {
    data: existingMonthlyServiceCharge,
    error: serviceChargeCheckError,
  } = await supabase
    .from('servicecharges')
    .select('*')
    .eq('shop_id', shopId)
    .eq('houseNumber', meterForm.houseNumber)
    .eq('chargeMonth', serviceChargeMonth)
    .maybeSingle();

  if (serviceChargeCheckError) {
    alert(
      `Water bill was saved, but the monthly Service Charge could not be checked: ${serviceChargeCheckError.message}`
    );
    return;
  }

  const serviceChargeTenantName =
    activeServiceChargeAccount.tenant?.fullName ||
    activeServiceChargeAccount.house?.tenantName ||
    selectedHouse?.tenantName ||
    '';

  const serviceChargePhoneNumber =
    activeServiceChargeAccount.tenant?.phoneNumber ||
    '';

  if (existingMonthlyServiceCharge) {
    const {
      error: serviceChargeUpdateError,
    } = await supabase
      .from('servicecharges')
      .update({
        tenantName: serviceChargeTenantName,
        tenantId:
          activeServiceChargeAccount.tenantId || null,
        houseId:
          activeServiceChargeAccount.houseId || null,
        phoneNumber: serviceChargePhoneNumber,
        waterBillId: waterBillRecord.id,
        dueDate: serviceChargeDueDate,
        nextPaymentDate: serviceChargeDueDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingMonthlyServiceCharge.id)
      .eq('shop_id', shopId);

    if (serviceChargeUpdateError) {
      alert(
        `Water bill was saved, but the existing Service Charge could not be updated: ${serviceChargeUpdateError.message}`
      );
      return;
    }
  } else {
    const {
      error: serviceChargeInsertError,
    } = await supabase
      .from('servicecharges')
      .insert([
        {
          id: `service-charge-${shopId}-${meterForm.houseNumber}-${serviceChargeMonth}`,
          shop_id: shopId,
          houseNumber: meterForm.houseNumber,
          houseId:
            activeServiceChargeAccount.houseId || null,
          tenantId:
            activeServiceChargeAccount.tenantId || null,
          tenantName: serviceChargeTenantName,
          phoneNumber: serviceChargePhoneNumber,
          waterBillId: waterBillRecord.id,
          chargeMonth: serviceChargeMonth,
          serviceChargeAmount:
            DEFAULT_SERVICE_CHARGE,
          amountPaid: 0,
          balance: DEFAULT_SERVICE_CHARGE,
          paymentStatus: 'Unpaid',
          dueDate: serviceChargeDueDate,
          nextPaymentDate: serviceChargeDueDate,
          notes:
            'Monthly Service Charge created automatically with the water bill.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (serviceChargeInsertError) {
      alert(
        `Water bill was saved, but the monthly Service Charge could not be created: ${serviceChargeInsertError.message}`
      );
      return;
    }
  }
}

const { data: creditResult, error: creditError } =
  await supabase.rpc('apply_water_credit_to_bill', {
    p_bill_id: waterBillRecord.id,
    p_shop_id: shopId,
    p_meter_id: meterRegistryId,
  });

if (creditError) {
  alert(
    `Monthly bill was saved, but available water credit could not be applied: ${creditError.message}`
  );
  return;
}
if (
  meterForm.paymentReceived === 'Yes' &&
  Number(meterForm.amountReceived || 0) > 0
) {
  const paymentId = `water-payment-${Date.now()}`;

  const { error: readingPaymentError } =
    await supabase.rpc('record_water_cash_payment', {
      p_payment_id: paymentId,
      p_shop_id: shopId,
      p_meter_id: meterRegistryId,
      p_house_number: meterForm.houseNumber,
      p_tenant_name: selectedHouse?.tenantName || '',
      p_meter_number: meterForm.meterNumber,
      p_amount: Number(meterForm.amountReceived || 0),
      p_payment_date:
        meterForm.paymentDate || meterForm.readingDate || todayISO(),
      p_notes:
        meterForm.notes ||
        'Payment recorded together with meter reading',
    });

  if (readingPaymentError) {
    alert(
      `The water bill was saved, but the payment could not be recorded: ${readingPaymentError.message}`
    );
    return;
  }
}

if (activeServiceChargeAccount) {
  const {
    data: utilityReminderResult,
    error: utilityReminderError,
  } = await supabase.rpc(
    'prepare_utility_sms_reminders',
    {
      p_water_bill_id: waterBillRecord.id,
    }
  );

  if (utilityReminderError) {
    alert(
      `Ankara ya maji na Service Charge zimehifadhiwa, lakini kuandaa vikumbusho vya SMS kumeshindikana: ${utilityReminderError.message}`
    );
    return;
  }

  if (
    Number(utilityReminderResult?.prepared || 0) === 0
  ) {
    console.info(
      'Utility SMS reminder was not prepared:',
      utilityReminderResult?.reason ||
        'No eligible telephone number was found.'
    );
  }
}

const [
  { data: refreshedBills, error: refreshedBillsError },
  { data: refreshedPayments, error: refreshedPaymentsError },
  { data: refreshedAllocations, error: refreshedAllocationsError },
] = await Promise.all([
  supabase
    .from('waterBills')
    .select('*')
    .eq('shop_id', shopId),

  supabase
    .from('waterPayments')
    .select('*')
    .eq('shop_id', shopId),

  supabase
    .from('waterPaymentAllocations')
    .select('*')
    .eq('shop_id', shopId),
]);

if (
  refreshedBillsError ||
  refreshedPaymentsError ||
  refreshedAllocationsError
) {
  alert(
    t(
      language,
      'The bill was saved, but refreshed credit balances could not be displayed immediately. Refresh the page.',
      'Ankara imehifadhiwa, lakini salio jipya halikuweza kuonekana mara moja. Refresh ukurasa.'
    )
  );
  return;
}

const refreshedWaterBills = (refreshedBills || []).map(
  (bill) => ({
    ...bill,
    previousUnits: Number(bill.previousUnits || 0),
    currentUnits: Number(bill.currentUnits || 0),
    unitsUsed: Number(bill.unitsUsed || 0),
    costPerUnit: Number(bill.costPerUnit || 0),
    discount: Number(bill.discount || 0),
    currentBillAmount: Number(
      bill.currentBillAmount || 0
    ),
    previousBalance: Number(bill.previousBalance || 0),
    totalPayable: Number(bill.totalPayable || 0),
    amountPaid: Number(bill.amountPaid || 0),
    balance: Number(bill.balance || 0),
  })
);

const refreshedWaterPayments = (
  refreshedPayments || []
).map((payment) => ({
  ...payment,
  amountReceived: Number(payment.amountReceived || 0),
  unappliedAmount: Number(
    payment.unappliedAmount || 0
  ),
}));

const refreshedWaterAllocations = (
  refreshedAllocations || []
).map((allocation) => ({
  ...allocation,
  allocatedAmount: Number(
    allocation.allocatedAmount || 0
  ),
  billBalanceBefore: Number(
    allocation.billBalanceBefore || 0
  ),
  billBalanceAfter: Number(
    allocation.billBalanceAfter || 0
  ),
  allocationOrder: Number(
    allocation.allocationOrder || 1
  ),
}));

saveData({
  ...data,
  meters: updatedMeters,
  waterMeters: updatedWaterMeters,
  waterBills: refreshedWaterBills,
  waterPayments: refreshedWaterPayments,
  waterPaymentAllocations: refreshedWaterAllocations,
});

const appliedCredit = Number(
  creditResult?.creditApplied || 0
);

alert(
  meterForm.paymentReceived === 'Yes'
    ? t(
        language,
        `Water reading, monthly bill and payment of TZS ${currency(
          meterForm.amountReceived
        )} were saved successfully.`,
        `Usomaji wa maji, ankara ya mwezi na malipo ya TZS ${currency(
          meterForm.amountReceived
        )} vimehifadhiwa kikamilifu.`
      )
    : appliedCredit > 0
      ? t(
          language,
          `Water bill saved. TZS ${currency(
            appliedCredit
          )} tenant credit was applied automatically.`,
          `Ankara ya maji imehifadhiwa. Salio la mpangaji la TZS ${currency(
            appliedCredit
          )} limetumika moja kwa moja.`
        )
      : t(
          language,
          'Water reading and monthly bill were saved as unpaid.',
          'Usomaji wa maji na ankara ya mwezi vimehifadhiwa kama havijalipwa.'
        )
);

setMeterForm({ ...emptyMeterForm });
};
 const saveWaterPayment = async () => {
  const amountReceived = Number(
    waterPaymentForm.amountReceived || 0
  );

  if (
    !waterPaymentForm.houseNumber ||
    !waterPaymentForm.meterId ||
    !waterPaymentForm.meterNumber ||
    amountReceived <= 0
  ) {
    alert(
      t(
        language,
        'Please enter a valid cash amount.',
        'Tafadhali weka kiasi sahihi cha fedha kilichopokelewa.'
      )
    );
    return;
  }

  const shopId =
    data?.currentUser?.shop_id ||
    data?.currentUser?.shopId ||
    'shop-1';

  const paymentId = `water-payment-${Date.now()}`;

  const { data: paymentResult, error: paymentError } =
    await supabase.rpc('record_water_cash_payment', {
      p_payment_id: paymentId,
      p_shop_id: shopId,
      p_meter_id: waterPaymentForm.meterId,
      p_house_number: waterPaymentForm.houseNumber,
      p_tenant_name: waterPaymentForm.tenantName || '',
      p_meter_number: waterPaymentForm.meterNumber,
      p_amount: amountReceived,
      p_payment_date:
        waterPaymentForm.paymentDate || todayISO(),
      p_notes: waterPaymentForm.notes || '',
    });

  if (paymentError) {
    alert(
      `Water payment failed: ${paymentError.message}`
    );
    return;
  }

  const [
    { data: refreshedBills, error: billsRefreshError },
    { data: refreshedPayments, error: paymentsRefreshError },
    { data: refreshedAllocations, error: allocationsRefreshError },
  ] = await Promise.all([
    supabase
      .from('waterBills')
      .select('*')
      .eq('shop_id', shopId),

    supabase
      .from('waterPayments')
      .select('*')
      .eq('shop_id', shopId),

    supabase
      .from('waterPaymentAllocations')
      .select('*')
      .eq('shop_id', shopId),
  ]);

  if (
    billsRefreshError ||
    paymentsRefreshError ||
    allocationsRefreshError
  ) {
    alert(
      t(
        language,
        'Payment was saved, but the latest balances could not be refreshed immediately. Refresh the page.',
        'Malipo yamehifadhiwa, lakini salio jipya halikuweza kuonekana mara moja. Refresh ukurasa.'
      )
    );
    return;
  }

  const normalizedBills = (refreshedBills || []).map(
    (bill) => ({
      ...bill,
      previousUnits: Number(bill.previousUnits || 0),
      currentUnits: Number(bill.currentUnits || 0),
      unitsUsed: Number(bill.unitsUsed || 0),
      costPerUnit: Number(bill.costPerUnit || 0),
      discount: Number(bill.discount || 0),
      currentBillAmount: Number(
        bill.currentBillAmount || 0
      ),
      previousBalance: Number(bill.previousBalance || 0),
      totalPayable: Number(bill.totalPayable || 0),
      amountPaid: Number(bill.amountPaid || 0),
      balance: Number(bill.balance || 0),
    })
  );

  const normalizedPayments = (refreshedPayments || []).map(
    (payment) => ({
      ...payment,
      amountReceived: Number(payment.amountReceived || 0),
      unappliedAmount: Number(
        payment.unappliedAmount || 0
      ),
    })
  );

  const normalizedAllocations = (
    refreshedAllocations || []
  ).map((allocation) => ({
    ...allocation,
    allocatedAmount: Number(
      allocation.allocatedAmount || 0
    ),
    billBalanceBefore: Number(
      allocation.billBalanceBefore || 0
    ),
    billBalanceAfter: Number(
      allocation.billBalanceAfter || 0
    ),
    allocationOrder: Number(
      allocation.allocationOrder || 1
    ),
  }));

  saveData({
    ...data,
    waterBills: normalizedBills,
    waterPayments: normalizedPayments,
    waterPaymentAllocations: normalizedAllocations,
  });

  const unappliedCredit = Number(
    paymentResult?.unappliedAmount || 0
  );

  alert(
    unappliedCredit > 0
      ? t(
          language,
          `Payment saved. TZS ${currency(
            unappliedCredit
          )} remains as tenant credit.`,
          `Malipo yamehifadhiwa. TZS ${currency(
            unappliedCredit
          )} imebaki kama salio la mpangaji.`
        )
      : t(
          language,
          'Cash payment saved and allocated to the oldest unpaid bills.',
          'Malipo ya fedha yamehifadhiwa na kugawiwa kwenye madeni ya zamani kwanza.'
        )
  );

  setWaterPaymentForm({ ...emptyWaterPaymentForm });
  setIsWaterPaymentOpen(false);
};
const startWaterPayment = (bill) => {
  setWaterPaymentForm({
    houseNumber: bill.houseNumber || '',
    tenantName: bill.tenantName || '',
    meterId: bill.meterId || '',
    meterNumber: bill.meterNumber || '',
    amountReceived: '',
    paymentDate: todayISO(),
    notes: '',
  });

  setIsWaterPaymentOpen(true);
};
  const saveServiceChargeHouseSetting =
    async () => {
      const selectedHouse = houses.find(
        (house) =>
          String(house.id) ===
          String(
            serviceChargeHouseSettingForm.houseId
          )
      );

      const monthlyAmount = Number(
        cleanAmountInput(
          serviceChargeHouseSettingForm.monthlyAmount
        ) || 0
      );

      const settingReason = String(
        serviceChargeHouseSettingForm.reason ||
          ''
      ).trim();

      if (!selectedHouse) {
        alert(
          'Tafadhali chagua nyumba unayotaka kubadilisha mipangilio yake.'
        );
        return;
      }

      if (
        serviceChargeHouseSettingForm.enabled &&
        monthlyAmount <= 0
      ) {
        alert(
          'Tafadhali weka kiasi halisi cha Service Charge kwa mwezi.'
        );
        return;
      }

      if (!settingReason) {
        alert(
          'Tafadhali eleza sababu ya kubadilisha mipangilio hii.'
        );
        return;
      }

      const userConfirmed = window.confirm(
        `Unathibitisha mipangilio hii?\n\nNyumba: ${
          selectedHouse.houseNumber || '-'
        } — ${
          selectedHouse.tenantName || 'Mkazi'
        }\nService Charge: ${
          serviceChargeHouseSettingForm.enabled
            ? 'IMEWASHWA'
            : 'IMEZIMWA'
        }\nKiasi kwa mwezi: TZS ${currency(
          monthlyAmount
        )}\n\nBadiliko hili litahifadhiwa kwenye historia.`
      );

      if (!userConfirmed) {
        return;
      }

      setIsSavingServiceChargeHouseSetting(true);

      try {
        const {
          error: settingError,
        } = await supabase.rpc(
          'update_service_charge_house_setting',
          {
            p_house_id: selectedHouse.id,
            p_enabled:
              serviceChargeHouseSettingForm.enabled,
            p_monthly_amount:
              monthlyAmount ||
              Number(
                selectedHouse.monthlyServiceChargeAmount ||
                  DEFAULT_SERVICE_CHARGE
              ),
            p_reason: settingReason,
          }
        );

        if (settingError) {
          throw settingError;
        }

        const currentShopId =
          data?.currentUser?.shop_id ||
          data?.currentUser?.shopId ||
          'shop-1';

        const {
          data: freshHouses,
          error: housesRefreshError,
        } = await supabase
          .from('houses')
          .select('*')
          .eq('shop_id', currentShopId)
          .order('houseNumber', {
            ascending: true,
          });

        if (housesRefreshError) {
          throw housesRefreshError;
        }

        saveData({
          ...data,
          houses: freshHouses || houses,
        });

        await refreshPermanentServiceChargeRecords();

        setServiceChargeHouseSettingForm({
          ...emptyServiceChargeHouseSettingForm,
        });

        alert(
          'Mipangilio ya Service Charge ya nyumba imehifadhiwa kwa kudumu.'
        );
      } catch (serviceChargeSettingError) {
        console.error(
          'Service Charge house setting failed:',
          serviceChargeSettingError
        );

        alert(
          `Kuhifadhi mipangilio ya Service Charge kumeshindikana: ${
            serviceChargeSettingError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsSavingServiceChargeHouseSetting(false);
      }
    };

  const prepareMonthlyServiceChargeInvoices =
    async () => {
      const selectedChargeMonth =
        serviceChargeInvoicePreparationForm.chargeMonth;

      if (!selectedChargeMonth) {
        alert(
          'Tafadhali chagua mwezi wa Service Charge.'
        );
        return;
      }

      const userConfirmed = window.confirm(
        `Unataka kuandaa ankara za Service Charge za mwezi ${selectedChargeMonth}? Nyumba tupu na nyumba zilizozimwa Service Charge hazitatozwa.`
      );

      if (!userConfirmed) {
        return;
      }

      setIsPreparingServiceChargeInvoices(true);

      try {
        const {
          data: preparationResult,
          error: preparationError,
        } = await supabase.rpc(
          'prepare_monthly_service_charge_invoices',
          {
            p_charge_month: selectedChargeMonth,
          }
        );

        if (preparationError) {
          throw preparationError;
        }

        await refreshServiceChargeBills();
        await refreshPermanentServiceChargeRecords();

        const createdInvoices = Number(
          preparationResult?.created || 0
        );

        const existingInvoices = Number(
          preparationResult?.alreadyExisted || 0
        );

        alert(
          `Ankara za Service Charge zimeandaliwa vizuri.\n\nAnkara mpya: ${createdInvoices}\nZilizokuwepo na kuhifadhiwa bila kurudiwa: ${existingInvoices}`
        );
      } catch (serviceChargePreparationError) {
        console.error(
          'Monthly Service Charge invoice preparation failed:',
          serviceChargePreparationError
        );

        alert(
          `Kuandaa ankara za Service Charge kumeshindikana: ${
            serviceChargePreparationError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsPreparingServiceChargeInvoices(false);
      }
    };

      const correctPermanentServiceChargeInvoice =
    async () => {
      const selectedInvoice =
        activeServiceCharges.find(
          (service) =>
            String(service.id) ===
            String(
              serviceChargeCorrectionForm.recordId
            )
        );

      const correctedAmount = Number(
        cleanAmountInput(
          serviceChargeCorrectionForm.correctedAmount
        ) || 0
      );

      const correctionReason = String(
        serviceChargeCorrectionForm.reason || ''
      ).trim();

      if (!selectedInvoice) {
        alert(
          'Tafadhali chagua ankara ya Service Charge unayotaka kusahihisha.'
        );
        return;
      }

      if (correctedAmount <= 0) {
        alert(
          'Tafadhali weka kiasi sahihi cha ankara.'
        );
        return;
      }

      if (!serviceChargeCorrectionForm.correctedDate) {
        alert(
          'Tafadhali weka tarehe sahihi ya ankara.'
        );
        return;
      }

      if (
        !serviceChargeCorrectionForm.correctedDueDate
      ) {
        alert(
          'Tafadhali weka tarehe sahihi ya mwisho wa malipo.'
        );
        return;
      }

      if (!correctionReason) {
        alert(
          'Tafadhali eleza sababu ya kufanya marekebisho.'
        );
        return;
      }

      const userConfirmed = window.confirm(
        `Unathibitisha kusahihisha ankara ya ${
          selectedInvoice.houseNumber || '-'
        } — ${
          selectedInvoice.tenantName || 'Mkazi'
        }?\n\nKiasi kipya: TZS ${currency(
          correctedAmount
        )}\nTarehe ya ankara: ${
          serviceChargeCorrectionForm.correctedDate
        }\nMwisho wa malipo: ${
          serviceChargeCorrectionForm
            .correctedDueDate
        }\n\nRekodi ya zamani haitafutwa.`
      );

      if (!userConfirmed) {
        return;
      }

      setIsSavingServiceChargeCorrection(true);

      try {
        const {
          error: correctionError,
        } = await supabase.rpc(
          'correct_service_charge_invoice',
          {
            p_service_charge_id:
              selectedInvoice.id,
            p_service_charge_amount:
              correctedAmount,
            p_invoice_date:
              serviceChargeCorrectionForm
                .correctedDate,
            p_due_date:
              serviceChargeCorrectionForm
                .correctedDueDate,
            p_reason: correctionReason,
          }
        );

        if (correctionError) {
          throw correctionError;
        }

        await refreshServiceChargeBills();
        await refreshPermanentServiceChargeRecords();

        setServiceChargeCorrectionForm({
          ...emptyServiceChargeCorrectionForm,
        });

        alert(
          'Ankara ya Service Charge imesahihishwa salama. Historia ya zamani imehifadhiwa.'
        );
      } catch (serviceChargeCorrectionError) {
        console.error(
          'Service Charge invoice correction failed:',
          serviceChargeCorrectionError
        );

        alert(
          `Kusahihisha ankara ya Service Charge kumeshindikana: ${
            serviceChargeCorrectionError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsSavingServiceChargeCorrection(false);
      }
    };

  const recordPermanentServiceChargePayment =
    async () => {
      const selectedHouse =
        serviceChargeEligibleHouses.find(
          (house) =>
            String(house.id) ===
            String(serviceChargePaymentForm.houseId)
        );

      const amountReceived = Number(
        cleanAmountInput(
          serviceChargePaymentForm.amountReceived
        ) || 0
      );

      if (!selectedHouse) {
        alert(
          'Tafadhali chagua nyumba iliyolipa Service Charge.'
        );
        return;
      }

      if (amountReceived <= 0) {
        alert(
          'Tafadhali weka kiasi halisi kilichopokelewa.'
        );
        return;
      }

      const userConfirmed = window.confirm(
        `Unathibitisha kupokea TZS ${currency(
          amountReceived
        )} kutoka ${selectedHouse.houseNumber} — ${
          selectedHouse.tenantName ||
          'Mkazi wa nyumba'
        }?`
      );

      if (!userConfirmed) {
        return;
      }

      setIsSavingServiceChargePayment(true);

      try {
        const {
          data: paymentResult,
          error: paymentError,
        } = await supabase.rpc(
          'record_service_charge_payment',
          {
            p_house_id: selectedHouse.id,
            p_amount_received: amountReceived,
            p_payment_date:
              serviceChargePaymentForm.paymentDate ||
              todayISO(),
            p_payment_method:
              serviceChargePaymentForm.paymentMethod ||
              'Cash',
            p_reference_number:
              serviceChargePaymentForm.referenceNumber ||
              null,
            p_notes:
              serviceChargePaymentForm.notes || null,
          }
        );

        if (paymentError) {
          throw paymentError;
        }

        await refreshServiceChargeBills();
        await refreshPermanentServiceChargeRecords();

        setServiceChargePaymentForm({
          ...emptyServiceChargePaymentForm,
        });

        const allocatedAmount = Number(
          paymentResult?.allocatedAmount || 0
        );

        const unappliedCredit = Number(
          paymentResult?.unappliedCredit || 0
        );

        alert(
          `Malipo ya Service Charge yamehifadhiwa kwa kudumu.\n\nKiasi kilichogawiwa kwenye ankara: TZS ${currency(
            allocatedAmount
          )}\nSalio la mbele: TZS ${currency(
            unappliedCredit
          )}`
        );
      } catch (serviceChargePaymentError) {
        console.error(
          'Permanent Service Charge payment failed:',
          serviceChargePaymentError
        );

        alert(
          `Kuhifadhi malipo ya Service Charge kumeshindikana: ${
            serviceChargePaymentError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsSavingServiceChargePayment(false);
      }
    };
  const correctPermanentServiceChargePayment =
    async () => {
      const selectedPayment =
        serviceChargePayments.find(
          (payment) =>
            String(payment.id) ===
            String(
              serviceChargeCorrectionForm.recordId
            )
        );

      const isReversal =
        serviceChargeCorrectionForm.actionType ===
        'Reverse';

      const correctedAmount = Number(
        cleanAmountInput(
          serviceChargeCorrectionForm.correctedAmount
        ) || 0
      );

      const correctionReason = String(
        serviceChargeCorrectionForm.reason || ''
      ).trim();

      if (!selectedPayment) {
        alert(
          'Tafadhali chagua malipo ya Service Charge unayotaka kusahihisha.'
        );
        return;
      }

      if (selectedPayment.status === 'Reversed') {
        alert(
          'Malipo haya tayari yamerudishwa na hayawezi kusahihishwa tena.'
        );
        return;
      }

      if (!correctionReason) {
        alert(
          'Tafadhali eleza sababu ya kufanya marekebisho.'
        );
        return;
      }

      if (!isReversal && correctedAmount <= 0) {
        alert(
          'Tafadhali weka kiasi sahihi kilichopokelewa.'
        );
        return;
      }

      if (
        !isReversal &&
        !serviceChargeCorrectionForm.correctedDate
      ) {
        alert(
          'Tafadhali weka tarehe sahihi ya malipo.'
        );
        return;
      }

      const confirmationMessage = isReversal
        ? `Unathibitisha kurudisha malipo ya TZS ${currency(
            selectedPayment.amountReceived || 0
          )} ya ${
            selectedPayment.houseNumber || '-'
          } — ${
            selectedPayment.tenantName || 'Mkazi'
          }?\n\nMfumo utaondoa mgawanyo wa malipo haya na kuhesabu upya salio. Rekodi haitafutwa.`
        : `Unathibitisha kusahihisha malipo ya ${
            selectedPayment.houseNumber || '-'
          } — ${
            selectedPayment.tenantName || 'Mkazi'
          }?\n\nKiasi kipya: TZS ${currency(
            correctedAmount
          )}\nTarehe mpya: ${
            serviceChargeCorrectionForm.correctedDate
          }\n\nMfumo utagawa upya fedha kwenye ankara za zamani.`;

      const userConfirmed =
        window.confirm(confirmationMessage);

      if (!userConfirmed) {
        return;
      }

      setIsSavingServiceChargeCorrection(true);

      try {
        const {
          error: correctionError,
        } = await supabase.rpc(
          'correct_service_charge_payment',
          {
            p_payment_id: selectedPayment.id,
            p_amount_received: isReversal
              ? Number(
                  selectedPayment.amountReceived || 0
                )
              : correctedAmount,
            p_payment_date:
              serviceChargeCorrectionForm.correctedDate ||
              selectedPayment.paymentDate ||
              todayISO(),
            p_payment_method:
              serviceChargeCorrectionForm.paymentMethod ||
              selectedPayment.paymentMethod ||
              'Cash',
            p_reference_number:
              serviceChargeCorrectionForm.referenceNumber ||
              null,
            p_notes:
              serviceChargeCorrectionForm.notes ||
              null,
            p_reason: correctionReason,
            p_reverse: isReversal,
          }
        );

        if (correctionError) {
          throw correctionError;
        }

        await refreshServiceChargeBills();
        await refreshPermanentServiceChargeRecords();

        setServiceChargeCorrectionForm({
          ...emptyServiceChargeCorrectionForm,
        });

        alert(
          isReversal
            ? 'Malipo yamerudishwa salama. Ankara na salio zimehesabiwa upya, na historia imehifadhiwa.'
            : 'Malipo yamesahihishwa salama. Ankara na salio zimehesabiwa upya, na historia imehifadhiwa.'
        );
      } catch (serviceChargeCorrectionError) {
        console.error(
          'Service Charge payment correction failed:',
          serviceChargeCorrectionError
        );

        alert(
          `Marekebisho ya malipo ya Service Charge yameshindikana: ${
            serviceChargeCorrectionError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsSavingServiceChargeCorrection(false);
      }
    };

      const recordPermanentServiceChargeExpense =
    async () => {
      const expenseAmount = Number(
        cleanAmountInput(
          serviceChargeExpenseForm.amount
        ) || 0
      );

      if (!serviceChargeExpenseForm.expenseDate) {
        alert(
          'Tafadhali weka tarehe ya matumizi.'
        );
        return;
      }

      if (!serviceChargeExpenseForm.expenseType) {
        alert(
          'Tafadhali chagua aina ya matumizi.'
        );
        return;
      }

      if (
        !String(
          serviceChargeExpenseForm.description || ''
        ).trim()
      ) {
        alert(
          'Tafadhali eleza fedha zimetumika kwa kazi gani.'
        );
        return;
      }

      if (expenseAmount <= 0) {
        alert(
          'Tafadhali weka kiasi halisi kilichotumika.'
        );
        return;
      }

      const userConfirmed = window.confirm(
        `Unathibitisha matumizi ya TZS ${currency(
          expenseAmount
        )} kwa ajili ya ${
          serviceChargeExpenseForm.description
        }?`
      );

      if (!userConfirmed) {
        return;
      }

      setIsSavingServiceChargeExpense(true);

      try {
        const {
          error: expenseError,
        } = await supabase.rpc(
          'record_service_charge_expense',
          {
            p_expense_date:
              serviceChargeExpenseForm.expenseDate,
            p_expense_type:
              serviceChargeExpenseForm.expenseType,
            p_description:
              serviceChargeExpenseForm.description.trim(),
            p_amount: expenseAmount,
            p_payee:
              serviceChargeExpenseForm.payee ||
              null,
            p_reference_number:
              serviceChargeExpenseForm.referenceNumber ||
              null,
            p_notes:
              serviceChargeExpenseForm.notes ||
              null,
          }
        );

        if (expenseError) {
          throw expenseError;
        }

        await refreshPermanentServiceChargeRecords();

        setServiceChargeExpenseForm({
          ...emptyServiceChargeExpenseForm,
        });

        alert(
          'Matumizi ya Service Charge yamehifadhiwa kwa kudumu.'
        );
      } catch (serviceChargeExpenseError) {
        console.error(
          'Permanent Service Charge expense failed:',
          serviceChargeExpenseError
        );

        alert(
          `Kuhifadhi matumizi ya Service Charge kumeshindikana: ${
            serviceChargeExpenseError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsSavingServiceChargeExpense(false);
      }
    };
  const correctPermanentServiceChargeExpense =
    async () => {
      const selectedExpense =
        serviceChargeExpenses.find(
          (expense) =>
            String(expense.id) ===
            String(
              serviceChargeCorrectionForm.recordId
            )
        );

      const isReversal =
        serviceChargeCorrectionForm.actionType ===
        'Reverse';

      const correctedAmount = Number(
        cleanAmountInput(
          serviceChargeCorrectionForm.correctedAmount
        ) || 0
      );

      const correctionReason = String(
        serviceChargeCorrectionForm.reason || ''
      ).trim();

      if (!selectedExpense) {
        alert(
          'Tafadhali chagua matumizi ya Service Charge unayotaka kusahihisha.'
        );
        return;
      }

      if (selectedExpense.status === 'Reversed') {
        alert(
          'Matumizi haya tayari yamerudishwa na hayawezi kusahihishwa tena.'
        );
        return;
      }

      if (!correctionReason) {
        alert(
          'Tafadhali eleza sababu ya kufanya marekebisho.'
        );
        return;
      }

      if (!isReversal && correctedAmount <= 0) {
        alert(
          'Tafadhali weka kiasi sahihi kilichotumika.'
        );
        return;
      }

      if (
        !isReversal &&
        !serviceChargeCorrectionForm.correctedDate
      ) {
        alert(
          'Tafadhali weka tarehe sahihi ya matumizi.'
        );
        return;
      }

      if (
        !isReversal &&
        !String(
          serviceChargeCorrectionForm.description ||
            ''
        ).trim()
      ) {
        alert(
          'Tafadhali eleza fedha zilitumika kwa kazi gani.'
        );
        return;
      }

      const confirmationMessage = isReversal
        ? `Unathibitisha kurudisha matumizi ya TZS ${currency(
            selectedExpense.amount || 0
          )} — ${
            selectedExpense.description ||
            selectedExpense.expenseType ||
            'Matumizi'
          }?\n\nRekodi haitafutwa na salio la mfuko litahesabiwa upya.`
        : `Unathibitisha kusahihisha matumizi haya?\n\nMaelezo: ${
            serviceChargeCorrectionForm.description
          }\nKiasi kipya: TZS ${currency(
            correctedAmount
          )}\nTarehe mpya: ${
            serviceChargeCorrectionForm.correctedDate
          }`;

      const userConfirmed =
        window.confirm(confirmationMessage);

      if (!userConfirmed) {
        return;
      }

      setIsSavingServiceChargeCorrection(true);

      try {
        const {
          error: correctionError,
        } = await supabase.rpc(
          'correct_service_charge_expense',
          {
            p_expense_id: selectedExpense.id,
            p_expense_date:
              serviceChargeCorrectionForm.correctedDate ||
              selectedExpense.expenseDate ||
              todayISO(),
            p_expense_type:
              serviceChargeCorrectionForm.expenseType ||
              selectedExpense.expenseType ||
              'Other',
            p_description:
              serviceChargeCorrectionForm.description ||
              selectedExpense.description ||
              '',
            p_amount: isReversal
              ? Number(selectedExpense.amount || 0)
              : correctedAmount,
            p_payee:
              serviceChargeCorrectionForm.payee ||
              null,
            p_reference_number:
              serviceChargeCorrectionForm.referenceNumber ||
              null,
            p_notes:
              serviceChargeCorrectionForm.notes ||
              null,
            p_reason: correctionReason,
            p_reverse: isReversal,
          }
        );

        if (correctionError) {
          throw correctionError;
        }

        await refreshPermanentServiceChargeRecords();

        setServiceChargeCorrectionForm({
          ...emptyServiceChargeCorrectionForm,
        });

        alert(
          isReversal
            ? 'Matumizi yamerudishwa salama. Salio la mfuko limehesabiwa upya na historia imehifadhiwa.'
            : 'Matumizi yamesahihishwa salama. Salio la mfuko limehesabiwa upya na historia imehifadhiwa.'
        );
      } catch (serviceChargeCorrectionError) {
        console.error(
          'Service Charge expense correction failed:',
          serviceChargeCorrectionError
        );

        alert(
          `Marekebisho ya matumizi ya Service Charge yameshindikana: ${
            serviceChargeCorrectionError?.message ||
            'Hitilafu isiyojulikana'
          }`
        );
      } finally {
        setIsSavingServiceChargeCorrection(false);
      }
    };

  const saveServiceCharge = async () => {
  if (!serviceChargeForm.houseNumber || !serviceChargeForm.serviceChargeAmount) return;

  const record = {
    id: serviceChargeForm.id || `service-charge-${Date.now()}`,
    houseNumber: serviceChargeForm.houseNumber,
    tenantName: serviceChargeForm.tenantName,
    serviceChargeAmount: Number(serviceChargeForm.serviceChargeAmount || 0),
    datePaid: serviceChargeForm.datePaid,
    nextPaymentDate:
      serviceChargeForm.nextPaymentDate ||
      (serviceChargeForm.datePaid ? addMonthsISO(serviceChargeForm.datePaid, 1) : ''),
    paymentStatus: serviceChargeForm.paymentStatus,
    notes: serviceChargeForm.notes,
  };

  const updatedServiceCharges = (() => {
    const idx = serviceCharges.findIndex((x) => x.id === record.id);
    if (idx >= 0) {
      const next = [...serviceCharges];
      next[idx] = record;
      return next;
    }
    return [record, ...serviceCharges];
  })();

  saveData({
    ...data,
    serviceCharges: updatedServiceCharges,
  });

  const { error } = await supabase
    .from('servicecharges')
    .upsert(
      [
        {
          id: record.id,
          shop_id: data?.currentUser?.shop_id || data?.currentUser?.shopId || 'shop-1',
          houseNumber: record.houseNumber,
          tenantName: record.tenantName || '',
          serviceChargeAmount: Number(record.serviceChargeAmount || 0),
          datePaid: record.datePaid || null,
          nextPaymentDate: record.nextPaymentDate || null,
          paymentStatus: record.paymentStatus || 'Paid',
          notes: record.notes || '',
        },
      ],
      { onConflict: 'id' }
    );

  if (error) {
    alert(`Service charge sync failed: ${error.message}`);
    return;
  }

  setServiceChargeForm({ ...emptyServiceChargeForm });
};
const editHouse = (row) => {
  setIsRentPaymentEntry(false);

  setHouseForm({
    id: row.id || '',
    houseNumber: row.houseNumber || '',
    tenantName: row.tenantName || '',
    rentPaidDate: row.rentPaidDate || todayISO(),
    rentStartDate: row.rentStartDate || '',
    rentEndDate: row.rentEndDate || '',
    monthlyRentAmount: String(row.monthlyRentAmount || ''),
    amountPaid: String(row.amountPaid || ''),
    rentDurationMonths: String(row.rentDurationMonths || '1'),
    paymentType: row.paymentType || 'Full',
    houseStatus: row.houseStatus || 'Occupied',
    itemsIssued: row.itemsIssued || '',
  });

  setActiveTab('houses');
};

const vacateTenant = async (row) => {
  if (!row?.id) {
    alert(
      t(
        language,
        'The house record could not be identified.',
        'Taarifa ya nyumba haikuweza kutambuliwa.'
      )
    );
    return;
  }

  const confirmed = window.confirm(
    t(
      language,
      `Confirm that ${row.tenantName || 'this tenant'} has relocated from house ${row.houseNumber || ''}? The house and payment history will remain preserved.`,
      `Thibitisha kwamba ${row.tenantName || 'mpangaji huyu'} amehama nyumba ${row.houseNumber || ''}? Nyumba na historia ya malipo vitaendelea kuhifadhiwa.`
    )
  );

  if (!confirmed) return;

  const shopId =
    row.shop_id ||
    data?.currentUser?.shop_id ||
    data?.currentUser?.shopId ||
    'shop-1';

  const { data: updatedHouse, error } = await supabase
    .from('houses')
    .update({
      tenantName: '',
      rentPaidDate: null,
      rentStartDate: null,
      rentEndDate: null,
      amountPaid: 0,
      rentDurationMonths: 1,
      paymentType: 'Unpaid',
      houseStatus: 'Vacant',
      nextPaymentDate: null,
      balance: 0,
      itemsIssued: '',
    })
    .eq('id', row.id)
    .eq('shop_id', shopId)
    .select('id')
    .single();

  if (error || !updatedHouse) {
    alert(
      t(
        language,
        `Tenant relocation could not be saved: ${error?.message || 'House was not updated.'}`,
        `Kuhama kwa mpangaji hakukuweza kuhifadhiwa: ${error?.message || 'Nyumba haikusasishwa.'}`
      )
    );
    return;
  }

  const vacatedHouse = {
    ...row,
    tenantName: '',
    rentPaidDate: '',
    rentStartDate: '',
    rentEndDate: '',
    amountPaid: 0,
    rentDurationMonths: 1,
    paymentType: 'Unpaid',
    houseStatus: 'Vacant',
    nextPaymentDate: '',
    balance: 0,
    itemsIssued: '',
  };

  saveData({
    ...data,
    houses: allHouses.map((house) =>
  String(house.id) === String(row.id)
    ? vacatedHouse
    : house
),
  });

  alert(
    t(
      language,
      'Tenant relocation saved successfully. The house is now vacant and all previous history has been preserved.',
      'Kuhama kwa mpangaji kumehifadhiwa. Nyumba sasa iko tupu na historia yote ya zamani imeendelea kuhifadhiwa.'
    )
  );
};
const archiveHouse = async (row) => {
  if (!row?.id) {
    alert(
      t(
        language,
        'The house record could not be identified.',
        'Taarifa ya nyumba haikuweza kutambuliwa.'
      )
    );
    return;
  }

  const confirmed = window.confirm(
    t(
      language,
      `Archive house ${row.houseNumber || ''}? Use this only for a duplicate or mistakenly registered house. The record and all historical information will remain preserved.`,
      `Weka nyumba ${row.houseNumber || ''} kwenye kumbukumbu? Tumia hii kwa nyumba iliyorudiwa au iliyosajiliwa kimakosa tu. Rekodi na historia yote vitaendelea kuhifadhiwa.`
    )
  );

  if (!confirmed) return;

  const finalConfirmation = window.confirm(
    t(
      language,
      'This house will disappear from all active rental screens on every device. Continue?',
      'Nyumba hii itaondoka kwenye maeneo yote ya nyumba zinazotumika katika vifaa vyote. Endelea?'
    )
  );

  if (!finalConfirmation) return;

  const shopId =
    row.shop_id ||
    data?.currentUser?.shop_id ||
    data?.currentUser?.shopId ||
    'shop-1';

  const archivedAt = new Date().toISOString();

  const archivedBy =
    data?.currentUser?.name ||
    data?.currentUser?.username ||
    data?.currentUser?.id ||
    '';

  const { data: archivedHouse, error } = await supabase
    .from('houses')
    .update({
      archived: true,
      archived_at: archivedAt,
      archived_by: String(archivedBy || ''),
    })
    .eq('id', row.id)
    .eq('shop_id', shopId)
    .select('id')
    .single();

  if (error || !archivedHouse) {
    alert(
      t(
        language,
        `The house could not be archived: ${error?.message || 'Supabase did not confirm the update.'}`,
        `Nyumba haikuweza kuwekwa kwenye kumbukumbu: ${error?.message || 'Supabase haikuthibitisha mabadiliko.'}`
      )
    );
    return;
  }

  const archivedLocalHouse = {
    ...row,
    archived: true,
    archived_at: archivedAt,
    archived_by: String(archivedBy || ''),
  };

  saveData({
    ...data,
    houses: allHouses.map((house) =>
      String(house.id) === String(row.id)
        ? archivedLocalHouse
        : house
    ),
  });

  alert(
    t(
      language,
      'House archived successfully. It will no longer appear in active rental records, but its history remains preserved.',
      'Nyumba imewekwa kwenye kumbukumbu. Haitaonekana tena kwenye nyumba zinazotumika, lakini historia yake imeendelea kuhifadhiwa.'
    )
  );
};
const startNewRentPayment = (row) => {
  setIsRentPaymentEntry(true);

  setHouseForm({
    id: row.id || '',
    houseNumber: row.houseNumber || '',
    tenantName: row.tenantName || '',
    rentPaidDate: todayISO(),
    rentStartDate: row.nextPaymentDate || todayISO(),
    rentEndDate: '',
    monthlyRentAmount: String(row.monthlyRentAmount || ''),
    amountPaid: '',
    rentDurationMonths: '1',
    paymentType: 'Full',
    houseStatus: row.houseStatus || 'Occupied',
    itemsIssued: row.itemsIssued || '',
  });

  setActiveTab('houses');
};

const startNewMeterReading = (row) => {
  setMeterForm({
    id: '',
    houseNumber: row.houseNumber || '',
    meterType: row.meterType || 'Water',
    meterNumber: row.meterNumber || '',
    readingDate: todayISO(),
    paymentReceived: 'No',
    paymentDate: '',
    amountReceived: '',
previousReadingDate:
  row.lastReadingDate || row.readingDate || '',
previousUnits: String(row.lastReading ?? row.currentUnits ?? ''),
    currentUnits: '',
    costPerUnit: String(row.costPerUnit ?? WATER_UNIT_PRICE),
    discount: '',
    nextReadingDate: '',
    notes: '',
  });

  setActiveTab('meters');
};
  const today = todayISO();

  const dueSoon = rentDueSoonAccounts.map((account) => ({
    ...account,
    houseNumber: account.house?.houseNumber || '',
    tenantName:
      account.tenant?.tenantName ||
      account.tenant?.name ||
      account.house?.tenantName ||
      '',
    nextPaymentDate: account.nextPaymentDate || '',
    monthlyRentAmount: Number(
      account.monthlyRentAmount || 0
    ),
  }));

  const overdue = rentOverdueAccounts.map((account) => ({
    ...account,
    houseNumber: account.house?.houseNumber || '',
    tenantName:
      account.tenant?.tenantName ||
      account.tenant?.name ||
      account.house?.tenantName ||
      '',
    nextPaymentDate: account.nextPaymentDate || '',
    monthlyRentAmount: Number(
      account.monthlyRentAmount || 0
    ),
  }));
 const meterReminderSource = waterMeters.filter(
  (meter) =>
    meter.active !== false &&
    meter.baselineConfirmed === true
);

const housesWithoutMeters = houses.filter(
  (house) =>
    house.houseStatus === 'Occupied' &&
    !waterMeters.some(
      (meter) =>
        meter.active !== false &&
        String(meter.houseNumber || '').trim().toLowerCase() ===
          String(house.houseNumber || '').trim().toLowerCase()
    )
);

const metersWithoutReadings = meterReminderSource.filter(
  (meter) => !meter.lastReadingDate
);

const readingSoon = meterReminderSource.filter((meter) => {
  const days = daysBetween(today, meter.nextReadingDate);

  return (
    meter.nextReadingDate &&
    days !== null &&
    days >= 0 &&
    days <= 7
  );
});

const readingOverdue = meterReminderSource.filter((meter) => {
  const days = daysBetween(today, meter.nextReadingDate);

  return (
    meter.nextReadingDate &&
    days !== null &&
    days < 0
  );
});

const metersNeedingAttention = [
  ...readingOverdue.map((meter) => ({
    ...meter,
    attentionType: 'overdue',
  })),
  ...readingSoon.map((meter) => ({
    ...meter,
    attentionType: 'dueSoon',
  })),
];

const housesWithoutWaterBills = houses.filter(
  (house) =>
    house.houseStatus === 'Occupied' &&
    !waterBills.some(
      (bill) =>
        String(bill.houseNumber || '').trim().toLowerCase() ===
          String(house.houseNumber || '').trim().toLowerCase() &&
        String(bill.tenantName || '').trim().toLowerCase() ===
          String(house.tenantName || '').trim().toLowerCase()
    )
);

const housesWithBillsButNoPayments = houses.filter(
  (house) => {
    if (house.houseStatus !== 'Occupied') return false;

    const houseHasOutstandingBill = waterBills.some(
      (bill) =>
        String(bill.houseNumber || '').trim().toLowerCase() ===
          String(house.houseNumber || '').trim().toLowerCase() &&
        String(bill.tenantName || '').trim().toLowerCase() ===
          String(house.tenantName || '').trim().toLowerCase() &&
        Number(bill.balance || 0) > 0
    );

    const tenantHasPayment = waterPayments.some(
      (payment) =>
        String(payment.houseNumber || '').trim().toLowerCase() ===
          String(house.houseNumber || '').trim().toLowerCase() &&
        String(payment.tenantName || '').trim().toLowerCase() ===
          String(house.tenantName || '').trim().toLowerCase()
    );

    return houseHasOutstandingBill && !tenantHasPayment;
  }
);

const serviceChargeSoon = serviceCharges.filter(
  (service) =>
    service.nextPaymentDate &&
    daysBetween(today, service.nextPaymentDate) !== null &&
    daysBetween(today, service.nextPaymentDate) >= 0 &&
    daysBetween(today, service.nextPaymentDate) <= 7
);

const totalRent = houses.reduce(
  (total, house) =>
    total + Number(house.monthlyRentAmount || 0),
  0
);

const totalPaid = houses.reduce(
  (total, house) =>
    total + Number(house.amountPaid || 0),
  0
);

const totalOutstanding = houses.reduce(
  (total, house) =>
    total + Number(house.balance || 0),
  0
);

const totalUnitsUsed = waterBills.reduce(
  (total, bill) =>
    total + Number(bill.unitsUsed || 0),
  0
);

const totalWaterAmount = waterBills.reduce(
  (total, bill) =>
    total + Number(bill.currentBillAmount || 0),
  0
);

const totalWaterCollected = waterPayments.reduce(
  (total, payment) =>
    total + Number(payment.amountReceived || 0),
  0
);

const totalWaterOutstanding = waterBills.reduce(
  (total, bill) =>
    total + Number(bill.balance || 0),
  0
);

const totalWaterCredit = waterPayments.reduce(
  (total, payment) =>
    total + Number(payment.unappliedAmount || 0),
  0
);
const activeWaterSupplierBills = waterSupplierBills.filter(
  (bill) => String(bill.status || 'Active') === 'Active'
);

const activeWaterFundExpenses = waterFundExpenses.filter(
  (expense) => String(expense.status || 'Active') === 'Active'
);

const totalDawascoBills = activeWaterSupplierBills.reduce(
  (total, bill) => total + Number(bill.billAmount || 0),
  0
);

const totalWaterExpensesPaid = activeWaterFundExpenses.reduce(
  (total, expense) => total + Number(expense.amount || 0),
  0
);

const totalDawascoPayments = activeWaterFundExpenses
  .filter(
    (expense) =>
      String(expense.expenseType || '') === 'DAWASCO Payment'
  )
  .reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

const unpaidDawascoBalance = Math.max(
  0,
  totalDawascoBills - totalDawascoPayments
);

const availableWaterCash =
  totalWaterCollected - totalWaterExpensesPaid;

const realWaterFundBalance =
  availableWaterCash - unpaidDawascoBalance;
  const currentWaterMonth = todayISO().slice(0, 7);

const waterPaymentsThisMonth = waterPayments.filter(
  (payment) =>
    String(payment.paymentDate || '').slice(0, 7) ===
    currentWaterMonth
);

const supplierBillsThisMonth = activeWaterSupplierBills.filter(
  (bill) =>
    String(bill.billDate || '').slice(0, 7) ===
    currentWaterMonth
);

const waterExpensesThisMonth = activeWaterFundExpenses.filter(
  (expense) =>
    String(expense.expenseDate || '').slice(0, 7) ===
    currentWaterMonth
);

const waterCollectedThisMonth = waterPaymentsThisMonth.reduce(
  (total, payment) =>
    total + Number(payment.amountReceived || 0),
  0
);

const dawascoBillsThisMonth = supplierBillsThisMonth.reduce(
  (total, bill) =>
    total + Number(bill.billAmount || 0),
  0
);

const waterExpensesPaidThisMonth = waterExpensesThisMonth.reduce(
  (total, expense) =>
    total + Number(expense.amount || 0),
  0
);
const totalDiscount = waterBills.reduce(
  (total, bill) =>
    total + Number(bill.discount || 0),
  0
);

const activeServiceCharges = serviceCharges.filter(
  (service) =>
    String(service.paymentStatus || '') !== 'Cancelled'
);

const totalServiceCharge = activeServiceCharges.reduce(
  (total, service) =>
    total + Number(service.serviceChargeAmount || 0),
  0
);

const activeServiceChargePaymentRecords =
  serviceChargePayments.filter(
    (payment) =>
      String(payment.status || 'Active') ===
      'Active'
  );

const permanentServiceChargeCashCollected =
  activeServiceChargePaymentRecords.reduce(
    (total, payment) =>
      total + Number(payment.amountReceived || 0),
    0
  );

const serviceChargeBillsWithPermanentAllocations =
  new Set(
    serviceChargePaymentAllocations.map(
      (allocation) =>
        String(allocation.serviceChargeId || '')
    )
  );

const legacyServiceChargeCashCollected =
  activeServiceCharges.reduce(
    (total, service) => {
      if (
        serviceChargeBillsWithPermanentAllocations.has(
          String(service.id || '')
        )
      ) {
        return total;
      }

      return (
        total + Number(service.amountPaid || 0)
      );
    },
    0
  );

const totalServiceChargeCollected =
  permanentServiceChargeCashCollected +
  legacyServiceChargeCashCollected;

const activeServiceChargeExpenses =
  serviceChargeExpenses.filter(
    (expense) =>
      String(expense.status || 'Active') ===
      'Active'
  );

const totalServiceChargeExpenses =
  activeServiceChargeExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

const serviceChargeFundBalance =
  totalServiceChargeCollected -
  totalServiceChargeExpenses;

const totalServiceChargeOutstanding =
  activeServiceCharges.reduce(
    (total, service) =>
      total + Number(
        service.balance ??
          Math.max(
            0,
            Number(service.serviceChargeAmount || 0) -
              Number(service.amountPaid || 0)
          )
      ),
    0
  );

const serviceChargeEligibleHouses = houses.filter(
  (house) =>
    house.archived !== true &&
    house.houseStatus !== 'Vacant' &&
    house.serviceChargeEnabled !== false
);

const overdueServiceCharges =
  activeServiceCharges.filter((service) => {
    const balance = Number(
      service.balance ??
        Math.max(
          0,
          Number(service.serviceChargeAmount || 0) -
            Number(service.amountPaid || 0)
        )
    );

    return (
      balance > 0 &&
      service.dueDate &&
      daysBetween(todayISO(), service.dueDate) < 0
    );
  });

const serviceChargesDueSoon =
  activeServiceCharges.filter((service) => {
    const balance = Number(
      service.balance ??
        Math.max(
          0,
          Number(service.serviceChargeAmount || 0) -
            Number(service.amountPaid || 0)
        )
    );

    const remainingDays = service.dueDate
      ? daysBetween(todayISO(), service.dueDate)
      : null;

    return (
      balance > 0 &&
      remainingDays !== null &&
      remainingDays >= 0 &&
      remainingDays <= 7
    );
  });

const currentServiceChargeMonth =
  getCurrentServiceChargeMonth();

const serviceChargeHousesMissingCurrentInvoice =
  serviceChargeEligibleHouses.filter((house) => {
    return !activeServiceCharges.some((service) => {
      const sameHouse =
        String(service.houseId || '') ===
          String(house.id || '') ||
        String(service.houseNumber || '')
          .trim()
          .toUpperCase() ===
          String(house.houseNumber || '')
            .trim()
            .toUpperCase();

      return (
        sameHouse &&
        String(service.chargeMonth || '') ===
          currentServiceChargeMonth
      );
    });
  });

const serviceChargeDisabledHouses = houses.filter(
  (house) =>
    house.archived !== true &&
    String(house.houseStatus || '')
      .trim()
      .toLowerCase() !== 'vacant' &&
    house.serviceChargeEnabled === false
);

const serviceChargeAccountsMissingContact =
  activeServiceCharges.filter((service) => {
    const balance = Number(
      service.balance ??
        Math.max(
          0,
          Number(service.serviceChargeAmount || 0) -
            Number(service.amountPaid || 0)
        )
    );

    if (balance <= 0) {
      return false;
    }

    const connectedHouse = houses.find(
      (house) =>
        String(house.id || '') ===
          String(service.houseId || '') ||
        String(house.houseNumber || '')
          .trim()
          .toUpperCase() ===
          String(service.houseNumber || '')
            .trim()
            .toUpperCase()
    );

    const occupantName = String(
      service.tenantName ||
        connectedHouse?.tenantName ||
        ''
    ).trim();

    const phoneNumber = String(
      service.phoneNumber ||
        service.tenantPhone ||
        connectedHouse?.phoneNumber ||
        ''
    ).trim();

    return !occupantName || !phoneNumber;
  });

  const tabs = [
    ['dashboard', t(language, 'Dashboard', 'Dashibodi')],
    ['houses', t(language, 'Rent Information', 'Taarifa za Kodi')],
    ['meters', t(language, 'Water Information', 'Taarifa za Maji')],
    ['servicecharge', t(language, 'Service Charge', 'Service Charge')],
    ['reports', t(language, 'Reports', 'Ripoti')],
  ];

    const rentSections = [
    ['summary', t(language, 'Summary', 'Muhtasari')],
    [
      'registration',
      t(
        language,
        'Register House / Tenant',
        'Sajili Nyumba / Mpangaji'
      ),
    ],
    [
      'attention',
      t(
        language,
        'Rent Requiring Action',
        'Kodi Zinazohitaji Hatua'
      ),
    ],
    ['invoices', t(language, 'Rent Invoices', 'Ankara za Kodi')],
    [
      'payments',
      t(language, 'Invoices and Payments', 'Ankara na Malipo'),
    ],
    ['rentFund', t(language, 'Rent Fund', 'Mfuko wa Kodi')],
    [
      'alerts',
      t(language, 'Account Alerts', 'Tahadhari za Akaunti'),
    ],
    [
      'smsReminders',
      t(language, 'SMS Reminders', 'Vikumbusho vya SMS'),
    ],
    ['rentReports', t(language, 'Rent Reports', 'Ripoti za Kodi')],
  ];

  const waterSections = [
  ['summary', t(language, 'Summary', 'Muhtasari')],
  [
    'attention',
    t(
      language,
      'Meters Requiring Action',
      'Mita Zinazohitaji Hatua'
    ),
  ],
  ['readings', t(language, 'Meter Readings', 'Usomaji wa Mita')],
  ['billing', t(language, 'Bills and Payments', 'Ankara na Malipo')],
[
  'waterFund',
  t(language, 'Expense Fund', 'Mfuko wa Matumizi'),
],
[
  'alerts',
  t(
    language,
    'Account Alerts',
    'Tahadhari za Akaunti'
  ),
],
[
  'utilitySms',
  t(
    language,
    'Water and Service Charge SMS',
    'Vikumbusho vya Maji na Service Charge'
  ),
],
[
  'utilityReports',
  t(
    language,
    'Utility Reports',
    'Ripoti za Huduma'
  ),
],
];
const serviceChargeSections = [
  [
    'summary',
    t(language, 'Summary', 'Muhtasari'),
  ],
  [
    'attention',
    t(
      language,
      'Service Charges Requiring Action',
      'Service Charge Zinazohitaji Hatua'
    ),
  ],
  [
    'invoices',
    t(
      language,
      'Service Charge Invoices',
      'Ankara za Service Charge'
    ),
  ],
  [
    'payments',
    t(
      language,
      'Invoices and Payments',
      'Ankara na Malipo'
    ),
  ],
  [
    'fund',
    t(
      language,
      'Service Charge Fund',
      'Mfuko wa Service Charge'
    ),
  ],
  [
    'alerts',
    t(
      language,
      'Account Alerts',
      'Tahadhari za Akaunti'
    ),
  ],
  [
    'reports',
    t(
      language,
      'Service Charge Reports',
      'Ripoti za Service Charge'
    ),
  ],
];
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_30%),linear-gradient(to_bottom_right,#f8fafc,#eff6ff,#e0e7ff)] p-4">

  <div className="pointer-events-none absolute left-0 top-0 h-full w-40 opacity-5 bg-[url('/circuit-pattern.png')] bg-cover bg-left"></div>

  <div className="pointer-events-none absolute right-0 top-0 h-full w-40 opacity-5 bg-[url('/circuit-pattern.png')] bg-cover bg-right"></div>
  {/* Left side pattern */}
  <div className="pointer-events-none absolute left-0 top-0 h-full w-32 opacity-10 bg-[url('/circuit-pattern.png')] bg-cover bg-left"></div>

  {/* Right side pattern */}
  <div className="pointer-events-none absolute right-0 top-0 h-full w-32 opacity-10 bg-[url('/circuit-pattern.png')] bg-cover bg-right"></div>
      <div className="mx-auto max-w-7xl space-y-4 rounded-3xl border border-white/40 bg-white/30 p-3 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-2 shadow-sm">
  <div className="flex flex-wrap gap-2">
    {tabs.map(([value, label]) => (
      <button
        key={value}
        type="button"
        onClick={() => setActiveTab(value)}
        className={`rounded-xl px-4 py-2 text-sm transition-all ${
  activeTab === value
    ? 'bg-blue-600 text-white shadow-md'
    : 'bg-white text-slate-700 border hover:bg-blue-50'
}`}
      >
        {label}
      </button>
    ))}
  </div>

  <select
    className="rounded-xl border px-3 py-2 text-sm"
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
  >
    <option value="sw">Kiswahili</option>
    <option value="en">English</option>
  </select>
</div>

{activeTab === 'dashboard' && (
          <div className="space-y-4">
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
    <CardContent>
      <div className="text-sm opacity-90">{t(language, 'Occupied Houses', 'Nyumba Zenye Wapangaji')}</div>
      <div className="mt-2 text-3xl font-bold">{houses.filter((h) => h.houseStatus === 'Occupied').length}</div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
    <CardContent>
      <div className="text-sm opacity-90">{t(language, 'Vacant Houses', 'Nyumba Tupu')}</div>
      <div className="mt-2 text-3xl font-bold">{houses.filter((h) => h.houseStatus === 'Vacant').length}</div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
    <CardContent>
      <div className="text-sm opacity-90">{t(language, 'Rent Due Soon', 'Kodi Inakaribia')}</div>
      <div className="mt-2 text-3xl font-bold">{dueSoon.length}</div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white border-0">
    <CardContent>
      <div className="text-sm opacity-90">{t(language, 'Overdue Rent', 'Kodi Iliyochelewa')}</div>
      <div className="mt-2 text-3xl font-bold">{overdue.length}</div>
    </CardContent>
  </Card>

<Card
  onClick={() => {
  setActiveTab('meters');
  setActiveWaterSection('attention');
}}
  className="cursor-pointer border-0 bg-gradient-to-br from-cyan-600 to-blue-700 text-white transition hover:-translate-y-0.5 hover:shadow-lg"
>
  <CardContent>
    <div className="text-sm opacity-90">
      {t(
        language,
        'Meters Requiring Action',
        'Mita Zinazohitaji Hatua'
      )}
    </div>

    <div className="mt-2 text-3xl font-bold">
      {metersNeedingAttention.length}
    </div>
  </CardContent>
</Card>

  <Card className="bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white border-0">
    <CardContent>
      <div className="text-sm opacity-90">{t(language, 'Service Charge Due Soon', 'Service Charge Inakaribia')}</div>
      <div className="mt-2 text-3xl font-bold">{serviceChargeSoon.length}</div>
    </CardContent>
  </Card>
</div>

            <div className="grid gap-4 lg:grid-cols-3">


            
  <Card className="border-blue-200 bg-blue-50">
    <CardHeader>
      <CardTitle className="text-blue-700">Upcoming Rent Reminder</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-slate-100 text-left">
                          <th className="py-2 pr-3">House</th>
                          <th className="py-2 pr-3">Tenant</th>
                          <th className="py-2 pr-3">Next Payment</th>
                          <th className="py-2 pr-3">Rent Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dueSoon.length === 0 ? (
                          <tr><td className="py-3 text-slate-500" colSpan={4}>No upcoming rent reminder.</td></tr>
                        ) : dueSoon.map((row) => (
                          <tr key={row.id} className="border-b hover:bg-slate-50 transition">
                            <td className="py-2 pr-3">{row.houseNumber}</td>
                            <td className="py-2 pr-3">{row.tenantName || '-'}</td>
                            <td className="py-2 pr-3">{row.nextPaymentDate}</td>
                            <td className="py-2 pr-3">TZS {currency(row.monthlyRentAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>


<Card className="border-amber-200 bg-amber-50">
  <CardHeader>
    <CardTitle className="text-amber-700">
      {t(language, 'Bill Reminder', 'Kumbusho la Ankara')}
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto">

<table className="min-w-full overflow-hidden rounded-xl text-sm">
  <thead>
    <tr className="bg-slate-100 text-left">
      <th className="py-2 pr-3">
        {t(language, 'House / Meter', 'Nyumba / Mita')}
      </th>

      <th className="py-2 pr-3">
        {t(language, 'Tenant', 'Mpangaji')}
      </th>

      <th className="py-2 pr-3">
        {t(language, 'Reading Date', 'Tarehe ya Kusoma')}
      </th>

      <th className="py-2 pr-3">
        {t(language, 'Status', 'Hali')}
      </th>
    </tr>
  </thead>

  <tbody>
    {[...readingOverdue, ...readingSoon].length === 0 ? (
      <tr>
        <td className="py-3 text-slate-500" colSpan={4}>
          {t(
            language,
            'No upcoming bill reminder.',
            'Hakuna kumbusho la ankara.'
          )}
        </td>
      </tr>
    ) : (
      [...readingOverdue, ...readingSoon].map((meter) => {
        const isOverdue = readingOverdue.some(
          (row) => String(row.id) === String(meter.id)
        );

        const connectedHouse = houses.find(
          (house) =>
            String(house.houseNumber || '')
              .trim()
              .toLowerCase() ===
            String(meter.houseNumber || '')
              .trim()
              .toLowerCase()
        );

        const tenantName =
          connectedHouse?.tenantName ||
          meter.tenantName ||
          '-';

        return (
          <tr
            key={`bill-reminder-${meter.id}`}
            className="border-b transition hover:bg-white"
          >
            <td className="py-2 pr-3">
              <p className="font-semibold text-slate-900">
                {meter.houseNumber || '-'}
              </p>

              <p className="text-xs text-slate-500">
                {t(language, 'Meter', 'Mita')}:{' '}
                {meter.meterNumber || '-'}
              </p>
            </td>

            <td className="py-2 pr-3 font-semibold text-slate-800">
              {tenantName}
            </td>

            <td className="py-2 pr-3">
              {meter.nextReadingDate || '-'}
            </td>

            <td className="py-2 pr-3">
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${
                  isOverdue
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isOverdue
                  ? t(language, 'Overdue', 'Imechelewa')
                  : t(language, 'Due soon', 'Inakaribia')}
              </span>
            </td>
          </tr>
        );
      })
    )}
  </tbody>
</table>
    </div>
  </CardContent>
</Card>
              <Card className="border-fuchsia-200 bg-fuchsia-50">
  <CardHeader>
    <CardTitle className="text-fuchsia-700">Upcoming Service Charge Reminder</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-slate-100 text-left">
                          <th className="py-2 pr-3">House</th>
                          <th className="py-2 pr-3">Tenant</th>
                          <th className="py-2 pr-3">Next Payment</th>
                          <th className="py-2 pr-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceChargeSoon.length === 0 ? (
                          <tr><td className="py-3 text-slate-500" colSpan={4}>No upcoming service charge reminder.</td></tr>
                        ) : serviceChargeSoon.map((row) => (
                          <tr key={row.id} className="border-b hover:bg-slate-50 transition">
                            <td className="py-2 pr-3">{row.houseNumber}</td>
                            <td className="py-2 pr-3">{row.tenantName || '-'}</td>
                            <td className="py-2 pr-3">{row.nextPaymentDate}</td>
                            <td className="py-2 pr-3">{row.paymentStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
{isWaterPaymentOpen ? (() => {
  const unpaidMeterBills = waterBills
    .filter(
      (bill) =>
        String(bill.meterId || '') ===
          String(waterPaymentForm.meterId || '') &&
        Number(bill.balance || 0) > 0
    )
    .sort(
      (a, b) =>
        new Date(a.readingDate || a.created_at || 0).getTime() -
        new Date(b.readingDate || b.created_at || 0).getTime()
    );

  const totalOutstanding = unpaidMeterBills.reduce(
    (total, bill) => total + Number(bill.balance || 0),
    0
  );

  const enteredAmount = Number(
    waterPaymentForm.amountReceived || 0
  );

  const expectedCredit = Math.max(
    0,
    enteredAmount - totalOutstanding
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-cyan-700 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                {t(
                  language,
                  'Cash Water Payment',
                  'Malipo ya Maji kwa Fedha'
                )}
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {t(
                  language,
                  'Record Water Payment',
                  'Rekodi Malipo ya Maji'
                )}
              </h3>

              <p className="mt-1 text-sm text-emerald-100">
                {t(
                  language,
                  'Payment will automatically clear the oldest bills first.',
                  'Malipo yatapunguza madeni ya zamani kwanza moja kwa moja.'
                )}
              </p>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white hover:bg-white/25"
              onClick={() => {
                setIsWaterPaymentOpen(false);
                setWaterPaymentForm({
                  ...emptyWaterPaymentForm,
                });
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                {t(language, 'House', 'Nyumba')}
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {waterPaymentForm.houseNumber || '-'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                {t(language, 'Tenant', 'Mpangaji')}
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {waterPaymentForm.tenantName || '-'}
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-xs text-cyan-700">
                {t(language, 'Meter Number', 'Namba ya Mita')}
              </p>
              <p className="mt-1 font-bold text-cyan-900">
                {waterPaymentForm.meterNumber || '-'}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-amber-200">
            <div className="bg-amber-50 px-5 py-4">
              <p className="text-sm text-amber-700">
                {t(
                  language,
                  'Total Outstanding Water Debt',
                  'Jumla ya Deni la Maji'
                )}
              </p>
              <p className="mt-1 text-3xl font-bold text-amber-800">
                TZS {currency(totalOutstanding)}
              </p>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {unpaidMeterBills.map((bill, index) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {index + 1}.{' '}
                      {bill.billingPeriodStart || '-'} —{' '}
                      {bill.billingPeriodEnd || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {index === 0
                        ? t(
                            language,
                            'This oldest bill will be cleared first.',
                            'Deni hili la zamani litapunguzwa kwanza.'
                          )
                        : t(
                            language,
                            'Paid after older bills.',
                            'Litapunguzwa baada ya madeni ya zamani.'
                          )}
                    </p>
                  </div>

                  <p className="font-bold text-slate-900">
                    TZS {currency(bill.balance)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t(
                language,
                'Cash Amount Received',
                'Kiasi cha Fedha Kilichopokelewa'
              )}
              type="number"
              min="1"
              placeholder="0"
              value={waterPaymentForm.amountReceived}
              className="border-emerald-300 bg-emerald-50 text-xl font-bold text-emerald-900"
              onChange={(e) =>
                setWaterPaymentForm((previous) => ({
                  ...previous,
                  amountReceived: e.target.value,
                }))
              }
            />

            <Input
              label={t(
                language,
                'Payment Date',
                'Tarehe ya Malipo'
              )}
              type="date"
              value={waterPaymentForm.paymentDate}
              onChange={(e) =>
                setWaterPaymentForm((previous) => ({
                  ...previous,
                  paymentDate: e.target.value,
                }))
              }
            />
          </div>

          {expectedCredit > 0 ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
              <p className="text-sm text-blue-700">
                {t(
                  language,
                  'Amount exceeding the current debt',
                  'Kiasi kinachozidi deni la sasa'
                )}
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-800">
                TZS {currency(expectedCredit)}
              </p>

              <p className="mt-1 text-xs text-blue-700">
                {t(
                  language,
                  'This amount will remain as tenant water credit.',
                  'Kiasi hiki kitabaki kama salio la maji la mpangaji.'
                )}
              </p>
            </div>
          ) : null}

          <Textarea
            label={t(
              language,
              'Notes (Optional)',
              'Maelezo (Si Lazima)'
            )}
            rows={3}
            value={waterPaymentForm.notes}
            onChange={(e) =>
              setWaterPaymentForm((previous) => ({
                ...previous,
                notes: e.target.value,
              }))
            }
          />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsWaterPaymentOpen(false);
                setWaterPaymentForm({
                  ...emptyWaterPaymentForm,
                });
              }}
            >
              {t(language, 'Cancel', 'Ghairi')}
            </Button>

            <Button
  type="button"
  className="min-w-[220px] bg-emerald-700 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
  disabled={
    enteredAmount <= 0 ||
    isSavingWaterPayment
  }
  onClick={async () => {
    if (isSavingWaterPayment) return;

    setIsSavingWaterPayment(true);

    try {
      await saveWaterPayment();
    } finally {
      setIsSavingWaterPayment(false);
    }
  }}
>
  {isSavingWaterPayment
    ? t(
        language,
        'Saving Payment...',
        'Inahifadhi Malipo...'
      )
    : t(
        language,
        'Save Cash Payment',
        'Hifadhi Malipo ya Fedha'
      )}
</Button>
          </div>
        </div>
      </div>
    </div>
  );
})() : null}


        {activeTab === 'houses' && (
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  {t(
                    language,
                    'Complete Rent Management System',
                    'Mfumo Kamili wa Usimamizi wa Kodi'
                  )}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {t(language, 'Rent Information', 'Taarifa za Kodi')}
                </h2>

                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                  {t(
                    language,
                    'Manage occupancies, tenancies, rent periods, payments, expenses, reminders and permanent reports.',
                    'Simamia matumizi ya nyumba, upangishaji, vipindi vya kodi, malipo, matumizi, vikumbusho na ripoti za kudumu.'
                  )}
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                {t(language, 'Owner only', 'Mmiliki pekee')}
              </span>
            </div>
          </div>
        )}


        {activeTab === 'houses' && (
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="space-y-2">
                {rentSections.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveRentSection(value)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      activeRentSection === value
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              {activeRentSection === 'summary' && (
                <div className="space-y-4">

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-sm font-bold uppercase text-blue-700">
                        {t(
                          language,
                          'Active Rent Accounts',
                          'Akaunti za Kodi Zinazotumika'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-black text-blue-950">
                        {activeRentAccounts.length}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-sm font-bold uppercase text-emerald-700">
                        {t(
                          language,
                          'Rent Collected',
                          'Kodi Iliyokusanywa'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-black text-emerald-950">
                        TZS {currency(totalRentCollected)}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                      <p className="text-sm font-bold uppercase text-amber-700">
                        {t(
                          language,
                          'Outstanding Rent',
                          'Kodi Inayodaiwa'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-black text-amber-950">
                        TZS {currency(totalRentOutstanding)}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
                      <p className="text-sm font-bold uppercase text-violet-700">
                        {t(
                          language,
                          'Rent Fund Balance',
                          'Salio la Mfuko wa Kodi'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-black text-violet-950">
                        TZS {currency(netRentFundBalance)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="min-h-36 rounded-3xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-sm font-bold uppercase leading-6 text-blue-700">
                        {t(
                          language,
                          'Rent Due Within 30 Days',
                          'Kodi Inayokaribia Ndani ya Siku 30'
                        )}
                      </p>

                      <p className="mt-3 text-3xl font-black text-blue-950">
                        {rentDueSoonAccounts.length}
                      </p>

                      <p className="mt-2 text-xs text-blue-600">
                        {t(
                          language,
                          'Accounts requiring early reminder',
                          'Akaunti zinazohitaji kukumbushwa mapema'
                        )}
                      </p>
                    </div>

                    <div className="min-h-36 rounded-3xl border border-red-200 bg-red-50 p-5">
                      <p className="text-sm font-bold uppercase leading-6 text-red-700">
                        {t(
                          language,
                          'Overdue Rent Accounts',
                          'Akaunti za Kodi Zilizochelewa'
                        )}
                      </p>

                      <p className="mt-3 text-3xl font-black text-red-950">
                        {rentOverdueAccounts.length}
                      </p>

                      <p className="mt-2 text-xs text-red-600">
                        {t(
                          language,
                          'Accounts requiring immediate action',
                          'Akaunti zinazohitaji hatua ya haraka'
                        )}
                      </p>
                    </div>

                    <div className="min-h-36 rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
                      <p className="text-sm font-bold uppercase leading-6 text-cyan-700">
                        {t(
                          language,
                          'Owner or Family Occupied',
                          'Nyumba za Mmiliki au Familia'
                        )}
                      </p>

                      <p className="mt-3 text-3xl font-black text-cyan-950">
                        {ownerOccupiedHouses.length}
                      </p>

                      <p className="mt-2 text-xs text-cyan-600">
                        {t(
                          language,
                          'No rent is currently expected',
                          'Kwa sasa hazitarajiwi kulipa kodi'
                        )}
                      </p>
                    </div>

                    <div className="min-h-36 rounded-3xl border border-slate-300 bg-slate-100 p-5">
                      <p className="text-sm font-bold uppercase leading-6 text-slate-700">
                        {t(
                          language,
                          'Vacant Houses',
                          'Nyumba Tupu'
                        )}
                      </p>

                      <p className="mt-3 text-3xl font-black text-slate-950">
                        {vacantRentalHouses.length}
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {t(
                          language,
                          'Available for a new tenant',
                          'Ziko tayari kwa mpangaji mpya'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeRentSection === 'registration' && (
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                    <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                      <h3 className="text-xl font-bold text-blue-950">
                        {t(
                          language,
                          'Register House Occupancy or Tenant',
                          'Sajili Matumizi ya Nyumba au Mpangaji'
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-blue-700">
                        {t(
                          language,
                          'Use this section when registering a paying tenant, an owner or family occupant, or a vacant house.',
                          'Tumia sehemu hii kusajili mpangaji anayelipa kodi, nyumba inayotumiwa na mmiliki au familia, au nyumba tupu.'
                        )}
                      </p>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-2">
                      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                        <h4 className="text-lg font-bold text-emerald-950">
                          {t(
                            language,
                            'Record Existing Tenant Payment',
                            'Sajili Malipo ya Kodi'
                          )}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-emerald-700">
                          {t(
                            language,
                            'Select an existing tenant and enter only the amount received. All rent dates and periods will be calculated automatically.',
                            'Chagua mpangaji aliyepo na uweke kiasi kilichopokelewa tu. Tarehe na vipindi vyote vya kodi vitahesabiwa moja kwa moja.'
                          )}
                        </p>

                        <Button
                          type="button"
                          className="mt-5 bg-emerald-700 px-6 py-3"
                          onClick={openRentalPaymentForm}
                        >
                          {t(
                            language,
                            'Record Rent Payment',
                            'Sajili Malipo ya Kodi'
                          )}
                        </Button>
                      </div>

                      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
                        <h4 className="text-lg font-bold text-blue-950">
                          {t(
                            language,
                            'Register New Tenant',
                            'Sajili Mpangaji Mpya'
                          )}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-blue-700">
                          {t(
                            language,
                            'Replace the previous occupant with a new tenant while preserving the permanent house and meter identity.',
                            'Badilisha mpangaji wa zamani kwa mpangaji mpya bila kubadilisha utambulisho wa kudumu wa nyumba na mita.'
                          )}
                        </p>

                        <Button
                          type="button"
                          className="mt-5 bg-blue-700 px-6 py-3"
                          onClick={() =>
                            setIsRentalRegistrationOpen(true)
                          }
                        >
                          {t(
                            language,
                            'Open New Tenant Form',
                            'Fungua Fomu ya Mpangaji Mpya'
                          )}
                        </Button>
                      </div>

                      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
                        <h4 className="text-lg font-bold text-violet-950">
                          {t(
                            language,
                            'Edit Existing Tenant Details',
                            'Hariri Taarifa za Mpangaji'
                          )}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-violet-700">
                          {t(
                            language,
                            'Edit the tenant name, phone, occupation and emergency contact without changing the house, permanent meter or rent history.',
                            'Hariri jina, simu, kazi na mtu wa dharura bila kubadilisha nyumba, mita ya kudumu au historia ya kodi.'
                          )}
                        </p>

                        <Button
                          type="button"
                          className="mt-5 bg-violet-700 px-6 py-3"
                          onClick={openRentalTenantEditForm}
                        >
                          {t(
                            language,
                            'Open Tenant Details',
                            'Fungua Taarifa za Mpangaji'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeRentSection === 'attention' && (
                <div className="space-y-5">
                  <div className="rounded-3xl border border-red-200 bg-white shadow-sm">
                    <div className="border-b border-red-100 bg-red-50 px-6 py-5">
                      <h3 className="text-xl font-bold text-red-900">
                        {t(
                          language,
                          'Overdue Rent',
                          'Kodi Iliyochelewa'
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-red-700">
                        {t(
                          language,
                          `${rentOverdueAccounts.length} account(s) require immediate follow-up.`,
                          `Akaunti ${rentOverdueAccounts.length} zinahitaji kufuatiliwa mara moja.`
                        )}
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {rentOverdueAccounts.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">
                          {t(
                            language,
                            'There is currently no overdue rent.',
                            'Kwa sasa hakuna kodi iliyochelewa.'
                          )}
                        </p>
                      ) : (
                        rentOverdueAccounts.map((account) => {
                          const overdueDays = Math.abs(
                            daysBetween(
                              todayISO(),
                              account.nextPaymentDate
                            ) || 0
                          );

                          return (
                            <div
                              key={account.id}
                              className="grid gap-4 p-5 md:grid-cols-[1.3fr_1fr_1fr_auto]"
                            >
                              <div>
                                <p className="font-bold text-slate-900">
                                  {account.house?.houseNumber || '-'}
                                  {' — '}
                                  {account.tenant?.tenantName ||
                                    account.tenant?.name ||
                                    account.house?.tenantName ||
                                    '-'}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Monthly rent',
                                    'Kodi kwa mwezi'
                                  )}
                                  : TZS{' '}
                                  {currency(
                                    account.monthlyRentAmount || 0
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Paid through',
                                    'Imelipwa hadi'
                                  )}
                                </p>
                                <p className="font-semibold">
                                  {account.paidThroughDate || '-'}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Payment was due',
                                    'Malipo yalitakiwa'
                                  )}
                                </p>
                                <p className="font-semibold">
                                  {account.nextPaymentDate || '-'}
                                </p>
                              </div>

                              <div className="self-center rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                                {t(
                                  language,
                                  `${overdueDays} days overdue`,
                                  `Imechelewa siku ${overdueDays}`
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-white shadow-sm">
                    <div className="border-b border-amber-100 bg-amber-50 px-6 py-5">
                      <h3 className="text-xl font-bold text-amber-900">
                        {t(
                          language,
                          'Rent Due Within 30 Days',
                          'Kodi Inayofika Ndani ya Siku 30'
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-amber-700">
                        {t(
                          language,
                          `${rentDueSoonAccounts.length} account(s) are approaching their payment date.`,
                          `Akaunti ${rentDueSoonAccounts.length} zinakaribia tarehe ya malipo.`
                        )}
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {rentDueSoonAccounts.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">
                          {t(
                            language,
                            'No rent is due within the next 30 days.',
                            'Hakuna kodi inayofika ndani ya siku 30 zijazo.'
                          )}
                        </p>
                      ) : (
                        rentDueSoonAccounts.map((account) => {
                          const remainingDays =
                            daysBetween(
                              todayISO(),
                              account.nextPaymentDate
                            ) || 0;

                          return (
                            <div
                              key={account.id}
                              className="grid gap-4 p-5 md:grid-cols-[1.3fr_1fr_1fr_auto]"
                            >
                              <div>
                                <p className="font-bold text-slate-900">
                                  {account.house?.houseNumber || '-'}
                                  {' — '}
                                  {account.tenant?.tenantName ||
                                    account.tenant?.name ||
                                    account.house?.tenantName ||
                                    '-'}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Monthly rent',
                                    'Kodi kwa mwezi'
                                  )}
                                  : TZS{' '}
                                  {currency(
                                    account.monthlyRentAmount || 0
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Paid through',
                                    'Imelipwa hadi'
                                  )}
                                </p>
                                <p className="font-semibold">
                                  {account.paidThroughDate || '-'}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Next payment',
                                    'Malipo yanayofuata'
                                  )}
                                </p>
                                <p className="font-semibold">
                                  {account.nextPaymentDate || '-'}
                                </p>
                              </div>

                              <div className="self-center rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
                                {remainingDays === 0
                                  ? t(
                                      language,
                                      'Due today',
                                      'Inafika leo'
                                    )
                                  : t(
                                      language,
                                      `${remainingDays} days remaining`,
                                      `Zimebaki siku ${remainingDays}`
                                    )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeRentSection === 'invoices' && (
                <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                  <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                    <h3 className="text-xl font-bold text-blue-950">
                      {t(
                        language,
                        'Permanent Rent Invoices',
                        'Ankara za Kudumu za Kodi'
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-blue-700">
                      {t(
                        language,
                        'Invoices are created automatically from confirmed rent periods and payments.',
                        'Ankara zinatengenezwa moja kwa moja kutokana na vipindi na malipo ya kodi yaliyothibitishwa.'
                      )}
                    </p>
                  </div>

                  <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-3">
                    <PreviewValue
                      label={t(
                        language,
                        'Total Invoiced',
                        'Jumla ya Ankara'
                      )}
                      value={`TZS ${currency(
                        totalRentInvoiced
                      )}`}
                    />

                    <PreviewValue
                      label={t(
                        language,
                        'Amount Paid',
                        'Kiasi Kilicholipwa'
                      )}
                      value={`TZS ${currency(
                        activeRentInvoices.reduce(
                          (total, invoice) =>
                            total +
                            Number(invoice.amountPaid || 0),
                          0
                        )
                      )}`}
                    />

                    <PreviewValue
                      label={t(
                        language,
                        'Outstanding Balance',
                        'Salio Linalodaiwa'
                      )}
                      value={`TZS ${currency(
                        totalRentOutstanding
                      )}`}
                    />
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activeRentInvoices.length === 0 ? (
                      <p className="p-6 text-sm text-slate-500">
                        {t(
                          language,
                          'No permanent rent invoice has been recorded yet.',
                          'Bado hakuna ankara ya kudumu ya kodi iliyorekodiwa.'
                        )}
                      </p>
                    ) : (
                      [...activeRentInvoices]
                        .sort(
                          (first, second) =>
                            new Date(
                              second.created_at ||
                                second.issueDate ||
                                0
                            ) -
                            new Date(
                              first.created_at ||
                                first.issueDate ||
                                0
                            )
                        )
                        .map((invoice) => {
                          const invoiceHouse =
                            getRentalHouse(invoice.houseId);
                          const invoiceTenant =
                            getRentalTenant(invoice.tenantId);
                          const invoiceBalance = Number(
                            invoice.balance || 0
                          );
                          const invoiceStatus =
                            invoice.status ||
                            (invoiceBalance <= 0
                              ? 'Paid'
                              : Number(invoice.amountPaid || 0) > 0
                                ? 'Partially Paid'
                                : 'Unpaid');

                          return (
                            <div
                              key={invoice.id}
                              className="space-y-4 p-5"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="text-lg font-bold text-slate-900">
                                    {invoiceHouse?.houseNumber ||
                                      '-'}
                                    {' — '}
                                    {invoiceTenant?.tenantName ||
                                      invoiceTenant?.name ||
                                      invoiceHouse?.tenantName ||
                                      '-'}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {t(
                                      language,
                                      'Invoice number',
                                      'Namba ya ankara'
                                    )}
                                    :{' '}
                                    {invoice.invoiceNumber ||
                                      invoice.id}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                                    invoiceBalance <= 0
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : Number(
                                            invoice.amountPaid || 0
                                          ) > 0
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {invoiceStatus}
                                </span>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                                <PreviewValue
                                  label={t(
                                    language,
                                    'Period Start',
                                    'Mwanzo wa Kipindi'
                                  )}
                                  value={
                                    invoice.periodStart || '-'
                                  }
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Period End',
                                    'Mwisho wa Kipindi'
                                  )}
                                  value={invoice.periodEnd || '-'}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Due Date',
                                    'Tarehe ya Malipo'
                                  )}
                                  value={invoice.dueDate || '-'}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Invoice Amount',
                                    'Kiasi cha Ankara'
                                  )}
                                  value={`TZS ${currency(
                                    invoice.invoiceAmount || 0
                                  )}`}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Amount Paid',
                                    'Kilicholipwa'
                                  )}
                                  value={`TZS ${currency(
                                    invoice.amountPaid || 0
                                  )}`}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Balance',
                                    'Salio'
                                  )}
                                  value={`TZS ${currency(
                                    invoice.balance || 0
                                  )}`}
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {activeRentSection === 'payments' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-950">
                        {t(
                          language,
                          'Rent Invoices and Payments',
                          'Ankara na Malipo ya Kodi'
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-emerald-700">
                        {t(
                          language,
                          'Record rent received and review the permanent payment history.',
                          'Sajili kodi iliyopokelewa na uangalie historia ya kudumu ya malipo.'
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        className="bg-emerald-700 px-6 py-3"
                        onClick={openRentalPaymentForm}
                      >
                        {t(
                          language,
                          'Record Rent Payment',
                          'Sajili Malipo ya Kodi'
                        )}
                      </Button>

                      <Button
                        type="button"
                        className="bg-amber-600 px-6 py-3"
                        onClick={() =>
                          openRentalPaymentCorrectionForm()
                        }
                      >
                        {t(
                          language,
                          'Correct Rent Payment',
                          'Sahihisha Malipo ya Kodi'
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <PreviewValue
                      label={t(
                        language,
                        'Total Rent Received',
                        'Jumla ya Kodi Iliyopokelewa'
                      )}
                      value={`TZS ${currency(
                        totalRentCollected
                      )}`}
                    />

                    <PreviewValue
                      label={t(
                        language,
                        'Allocated to Invoices',
                        'Iliyogawiwa Kwenye Ankara'
                      )}
                      value={`TZS ${currency(
                        activeRentalPayments.reduce(
                          (total, payment) =>
                            total +
                            Number(
                              payment.allocatedAmount || 0
                            ),
                          0
                        )
                      )}`}
                    />

                    <PreviewValue
                      label={t(
                        language,
                        'Remaining Rent Credit',
                        'Salio la Kodi Lililobaki'
                      )}
                      value={`TZS ${currency(
                        totalRentCredit
                      )}`}
                    />
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
                    <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
                      <h3 className="text-xl font-bold text-emerald-950">
                        {t(
                          language,
                          'Permanent Rent Payment Receipts',
                          'Risiti za Kudumu za Malipo ya Kodi'
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-emerald-700">
                        {t(
                          language,
                          'Every confirmed payment remains in this history together with its invoice allocation.',
                          'Kila malipo yaliyothibitishwa yanabaki katika historia hii pamoja na mgawanyo wake kwenye ankara.'
                        )}
                      </p>
                    </div>

                    <div className="space-y-4 p-5">
                      {activeRentalPayments.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          {t(
                            language,
                            'No permanent rent payment has been recorded yet.',
                            'Bado hakuna malipo ya kudumu ya kodi yaliyorekodiwa.'
                          )}
                        </p>
                      ) : (
                        [...activeRentalPayments]
                          .sort(
                            (first, second) =>
                              new Date(
                                second.created_at ||
                                  second.paymentDate ||
                                  0
                              ) -
                              new Date(
                                first.created_at ||
                                  first.paymentDate ||
                                  0
                              )
                          )
                          .map((payment) => {
                            const paymentHouse =
                              getRentalHouse(payment.houseId);
                            const paymentTenant =
                              getRentalTenant(
                                payment.tenantId
                              );

                            const paymentAllocations =
                              rentPaymentAllocations.filter(
                                (allocation) =>
                                  allocation.status ===
                                    'Active' &&
                                  String(
                                    allocation.paymentId
                                  ) === String(payment.id)
                              );

                            return (
                              <div
                                key={payment.id}
                                className="overflow-hidden rounded-2xl border border-slate-200"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-4 bg-slate-900 px-5 py-4 text-white">
                                  <div>
                                    <p className="text-xs font-semibold uppercase text-slate-300">
                                      {t(
                                        language,
                                        'Rent Payment Receipt',
                                        'Risiti ya Malipo ya Kodi'
                                      )}
                                    </p>

                                    <p className="mt-1 text-lg font-bold">
                                      {paymentHouse?.houseNumber ||
                                        '-'}
                                      {' — '}
                                      {paymentTenant?.tenantName ||
                                        paymentTenant?.name ||
                                        paymentHouse?.tenantName ||
                                        '-'}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-300">
                                      {payment.receiptNumber ||
                                        payment.id}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-xs text-slate-300">
                                      {t(
                                        language,
                                        'Amount Received',
                                        'Fedha Iliyopokelewa'
                                      )}
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-300">
                                      TZS{' '}
                                      {currency(
                                        payment.amountReceived ||
                                          0
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Payment Date',
                                      'Tarehe ya Malipo'
                                    )}
                                    value={
                                      payment.paymentDate || '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Recorded At',
                                      'Muda wa Kurekodi'
                                    )}
                                    value={
                                      payment.created_at
                                        ? new Date(
                                            payment.created_at
                                          ).toLocaleString()
                                        : '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Payment Method',
                                      'Njia ya Malipo'
                                    )}
                                    value={
                                      payment.paymentMethod ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Allocated',
                                      'Iliyogawiwa'
                                    )}
                                    value={`TZS ${currency(
                                      payment.allocatedAmount ||
                                        0
                                    )}`}
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Credit Remaining',
                                      'Salio Lililobaki'
                                    )}
                                    value={`TZS ${currency(
                                      payment.creditAmount || 0
                                    )}`}
                                  />
                                </div>

                                {paymentAllocations.length > 0 && (
                                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                                    <p className="mb-3 text-xs font-bold uppercase text-slate-500">
                                      {t(
                                        language,
                                        'Invoices Paid by This Receipt',
                                        'Ankara Zilizolipwa na Risiti Hii'
                                      )}
                                    </p>

                                    <div className="space-y-2">
                                      {paymentAllocations.map(
                                        (allocation) => {
                                          const linkedInvoice =
                                            rentInvoices.find(
                                              (invoice) =>
                                                String(
                                                  invoice.id
                                                ) ===
                                                String(
                                                  allocation.invoiceId
                                                )
                                            );

                                          return (
                                            <div
                                              key={allocation.id}
                                              className="flex flex-wrap justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                                            >
                                              <span className="font-semibold text-slate-700">
                                                {linkedInvoice?.invoiceNumber ||
                                                  allocation.invoiceId}
                                              </span>

                                              <span className="font-bold text-emerald-700">
                                                TZS{' '}
                                                {currency(
                                                  allocation.amount ||
                                                    0
                                                )}
                                              </span>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeRentSection === 'rentFund' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-orange-200 bg-orange-50 p-5">
                    <div>
                      <h3 className="text-xl font-bold text-orange-950">
                        {t(
                          language,
                          'Rent Fund and Property Expenses',
                          'Mfuko wa Kodi na Matumizi ya Nyumba'
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-orange-700">
                        {t(
                          language,
                          'Record repairs and other property expenses paid from rent collections.',
                          'Sajili matengenezo na matumizi mengine ya nyumba yaliyolipwa kutoka kwenye makusanyo ya kodi.'
                        )}
                      </p>
                    </div>

                    <Button
                      type="button"
                      className="bg-orange-600 px-6 py-3"
                      onClick={() =>
                        setIsRentalExpenseOpen(true)
                      }
                    >
                      {t(
                        language,
                        'Record Rent Expense',
                        'Sajili Matumizi ya Kodi'
                      )}
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                      <p className="text-sm font-bold uppercase text-blue-700">
                        {t(
                          language,
                          'Rent Collected',
                          'Kodi Iliyokusanywa'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-blue-950">
                        TZS {currency(totalRentCollected)}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6">
                      <p className="text-sm font-bold uppercase text-orange-700">
                        {t(
                          language,
                          'Rental Expenses Paid',
                          'Matumizi ya Kodi Yaliyolipwa'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-orange-950">
                        TZS {currency(totalRentalExpensesPaid)}
                      </p>
                    </div>

                    <div
                      className={`rounded-3xl border p-6 ${
                        netRentFundBalance >= 0
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <p
                        className={`text-sm font-bold uppercase ${
                          netRentFundBalance >= 0
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        }`}
                      >
                        {t(
                          language,
                          'Current Rent Fund Balance',
                          'Salio la Sasa la Mfuko wa Kodi'
                        )}
                      </p>
                      <p
                        className={`mt-3 text-3xl font-bold ${
                          netRentFundBalance >= 0
                            ? 'text-emerald-950'
                            : 'text-red-950'
                        }`}
                      >
                        TZS {currency(netRentFundBalance)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                      <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-blue-950">
                          {t(
                            language,
                            'Money Received from Tenants',
                            'Fedha Zilizokusanywa Kutoka kwa Wapangaji'
                          )}
                        </h3>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {activeRentalPayments.length === 0 ? (
                          <p className="p-6 text-sm text-slate-500">
                            {t(
                              language,
                              'No rent collection has been recorded yet.',
                              'Bado hakuna makusanyo ya kodi yaliyorekodiwa.'
                            )}
                          </p>
                        ) : (
                          [...activeRentalPayments]
                            .sort(
                              (first, second) =>
                                new Date(
                                  second.created_at ||
                                    second.paymentDate ||
                                    0
                                ) -
                                new Date(
                                  first.created_at ||
                                    first.paymentDate ||
                                    0
                                )
                            )
                            .map((payment) => {
                              const paymentHouse =
                                getRentalHouse(
                                  payment.houseId
                                );
                              const paymentTenant =
                                getRentalTenant(
                                  payment.tenantId
                                );

                              return (
                                <div
                                  key={payment.id}
                                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                                >
                                  <div>
                                    <p className="font-bold text-slate-900">
                                      {paymentTenant?.tenantName ||
                                        paymentTenant?.name ||
                                        paymentHouse?.tenantName ||
                                        '-'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {paymentHouse?.houseNumber ||
                                        '-'}
                                      {' • '}
                                      {payment.paymentDate || '-'}
                                    </p>
                                  </div>

                                  <p className="font-bold text-blue-800">
                                    TZS{' '}
                                    {currency(
                                      payment.amountReceived ||
                                        0
                                    )}
                                  </p>
                                </div>
                              );
                            })
                        )}

                        <div className="flex justify-between bg-blue-50 p-5 text-lg font-bold text-blue-950">
                          <span>
                            {t(
                              language,
                              'Total Received',
                              'Jumla Iliyopokelewa'
                            )}
                          </span>
                          <span>
                            TZS {currency(totalRentCollected)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm">
                      <div className="border-b border-orange-100 bg-orange-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-orange-950">
                          {t(
                            language,
                            'Rental Expenses',
                            'Matumizi ya Kodi'
                          )}
                        </h3>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {activeRentalExpenses.length === 0 ? (
                          <p className="p-6 text-sm text-slate-500">
                            {t(
                              language,
                              'No rental expense has been recorded yet.',
                              'Bado hakuna matumizi ya kodi yaliyorekodiwa.'
                            )}
                          </p>
                        ) : (
                          [...activeRentalExpenses]
                            .sort(
                              (first, second) =>
                                new Date(
                                  second.created_at ||
                                    second.expenseDate ||
                                    0
                                ) -
                                new Date(
                                  first.created_at ||
                                    first.expenseDate ||
                                    0
                                )
                            )
                            .map((expense) => {
                              const expenseHouse =
                                getRentalHouse(
                                  expense.houseId
                                );

                              return (
                                <div
                                  key={expense.id}
                                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                                >
                                  <div>
                                    <p className="font-bold text-slate-900">
                                      {expense.expenseType}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {expenseHouse?.houseNumber ||
                                        t(
                                          language,
                                          'General expense',
                                          'Matumizi ya jumla'
                                        )}
                                      {' • '}
                                      {expense.expenseDate || '-'}
                                    </p>

                                    {expense.description && (
                                      <p className="mt-2 text-sm text-slate-600">
                                        {expense.description}
                                      </p>
                                    )}
                                  </div>

                                  <p className="font-bold text-orange-800">
                                    TZS{' '}
                                    {currency(
                                      expense.amount || 0
                                    )}
                                  </p>
                                </div>
                              );
                            })
                        )}

                        <div className="flex justify-between bg-orange-50 p-5 text-lg font-bold text-orange-950">
                          <span>
                            {t(
                              language,
                              'Total Expenses',
                              'Jumla ya Matumizi'
                            )}
                          </span>
                          <span>
                            TZS{' '}
                            {currency(
                              totalRentalExpensesPaid
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border p-6 ${
                      netRentFundBalance >= 0
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {t(
                            language,
                            'Balance Carried Forward',
                            'Salio Linalohamishwa Mbele'
                          )}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {t(
                            language,
                            'This balance remains available for future rental expenses and is not reset at the end of the month.',
                            'Salio hili linabaki kwa matumizi ya baadaye ya nyumba na halifutwi mwisho wa mwezi.'
                          )}
                        </p>
                      </div>

                      <p
                        className={`text-3xl font-bold ${
                          netRentFundBalance >= 0
                            ? 'text-emerald-800'
                            : 'text-red-800'
                        }`}
                      >
                        TZS {currency(netRentFundBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeRentSection === 'alerts' && (() => {
                const missingPaymentDateAccounts =
                  activeRentAccounts.filter(
                    (account) =>
                      !account.paidThroughDate ||
                      !account.nextPaymentDate
                  );

                const missingPhoneAccounts =
                  activeRentAccounts.filter(
                    (account) =>
                      account.smsRemindersEnabled === true &&
                      !String(
                        account.tenant?.phoneNumber || ''
                      ).trim()
                  );

                const smsDisabledAccounts =
                  activeRentAccounts.filter(
                    (account) =>
                      account.smsRemindersEnabled !== true
                  );

                const totalAccountWarnings =
                  rentOverdueAccounts.length +
                  missingPaymentDateAccounts.length +
                  missingPhoneAccounts.length +
                  smsDisabledAccounts.length;

                const accountName = (account) =>
                  account.tenant?.fullName ||
                  account.tenant?.tenantName ||
                  account.tenant?.name ||
                  account.house?.tenantName ||
                  '-';

                return (
                  <div className="space-y-5">
                    <div
                      className={`rounded-3xl border p-6 ${
                        totalAccountWarnings === 0
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <p
                        className={`text-sm font-bold uppercase ${
                          totalAccountWarnings === 0
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {t(
                          language,
                          'Rental Account Warnings',
                          'Tahadhari za Akaunti za Kodi'
                        )}
                      </p>

                      <p
                        className={`mt-3 text-4xl font-bold ${
                          totalAccountWarnings === 0
                            ? 'text-emerald-950'
                            : 'text-amber-950'
                        }`}
                      >
                        {totalAccountWarnings}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {totalAccountWarnings === 0
                          ? t(
                              language,
                              'All active rental accounts have complete information and require no action.',
                              'Akaunti zote za kodi zina taarifa kamili na hazihitaji hatua.'
                            )
                          : t(
                              language,
                              'Review the genuine account issues listed below.',
                              'Pitia matatizo halisi ya akaunti yaliyoorodheshwa hapa chini.'
                            )}
                      </p>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <div className="overflow-hidden rounded-3xl border border-red-200 bg-white">
                        <div className="border-b border-red-100 bg-red-50 px-5 py-4">
                          <h3 className="font-bold text-red-900">
                            {t(
                              language,
                              'Overdue Rent',
                              'Kodi Iliyochelewa'
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-red-700">
                            {rentOverdueAccounts.length}{' '}
                            {t(
                              language,
                              'account(s)',
                              'akaunti'
                            )}
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {rentOverdueAccounts.length === 0 ? (
                            <p className="p-5 text-sm text-slate-500">
                              {t(
                                language,
                                'No overdue account.',
                                'Hakuna akaunti iliyochelewa.'
                              )}
                            </p>
                          ) : (
                            rentOverdueAccounts.map((account) => (
                              <div
                                key={account.id}
                                className="flex justify-between gap-4 p-5"
                              >
                                <div>
                                  <p className="font-bold">
                                    {account.house?.houseNumber ||
                                      '-'}
                                    {' — '}
                                    {accountName(account)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {t(
                                      language,
                                      'Due date',
                                      'Tarehe ya malipo'
                                    )}
                                    :{' '}
                                    {account.nextPaymentDate ||
                                      '-'}
                                  </p>
                                </div>

                                <span className="h-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                  {t(
                                    language,
                                    'Follow up',
                                    'Fuatilia'
                                  )}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white">
                        <div className="border-b border-orange-100 bg-orange-50 px-5 py-4">
                          <h3 className="font-bold text-orange-900">
                            {t(
                              language,
                              'Missing Rent Dates',
                              'Tarehe za Kodi Hazijakamilika'
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-orange-700">
                            {missingPaymentDateAccounts.length}{' '}
                            {t(
                              language,
                              'account(s)',
                              'akaunti'
                            )}
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {missingPaymentDateAccounts.length ===
                          0 ? (
                            <p className="p-5 text-sm text-slate-500">
                              {t(
                                language,
                                'All active accounts have complete rent dates.',
                                'Akaunti zote zina tarehe kamili za kodi.'
                              )}
                            </p>
                          ) : (
                            missingPaymentDateAccounts.map(
                              (account) => (
                                <div
                                  key={account.id}
                                  className="p-5"
                                >
                                  <p className="font-bold">
                                    {account.house?.houseNumber ||
                                      '-'}
                                    {' — '}
                                    {accountName(account)}
                                  </p>
                                  <p className="mt-1 text-xs text-orange-700">
                                    {t(
                                      language,
                                      'Confirm the paid-through date and next payment date.',
                                      'Thibitisha tarehe iliyolipwa hadi na tarehe inayofuata ya malipo.'
                                    )}
                                  </p>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white">
                        <div className="border-b border-purple-100 bg-purple-50 px-5 py-4">
                          <h3 className="font-bold text-purple-900">
                            {t(
                              language,
                              'SMS Enabled but Telephone Missing',
                              'SMS Imeruhusiwa Lakini Namba ya Simu Haipo'
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-purple-700">
                            {missingPhoneAccounts.length}{' '}
                            {t(
                              language,
                              'account(s)',
                              'akaunti'
                            )}
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {missingPhoneAccounts.length === 0 ? (
                            <p className="p-5 text-sm text-slate-500">
                              {t(
                                language,
                                'No telephone number is missing.',
                                'Hakuna namba ya simu inayokosekana.'
                              )}
                            </p>
                          ) : (
                            missingPhoneAccounts.map((account) => (
                              <div
                                key={account.id}
                                className="p-5"
                              >
                                <p className="font-bold">
                                  {account.house?.houseNumber ||
                                    '-'}
                                  {' — '}
                                  {accountName(account)}
                                </p>
                                <p className="mt-1 text-xs text-purple-700">
                                  {t(
                                    language,
                                    'Add the tenant telephone number before activating automatic SMS.',
                                    'Weka namba ya simu ya mpangaji kabla ya kutumia SMS za moja kwa moja.'
                                  )}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-slate-300 bg-white">
                        <div className="border-b border-slate-200 bg-slate-100 px-5 py-4">
                          <h3 className="font-bold text-slate-900">
                            {t(
                              language,
                              'SMS Reminders Disabled',
                              'Vikumbusho vya SMS Vimezimwa'
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {smsDisabledAccounts.length}{' '}
                            {t(
                              language,
                              'account(s)',
                              'akaunti'
                            )}
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {smsDisabledAccounts.length === 0 ? (
                            <p className="p-5 text-sm text-slate-500">
                              {t(
                                language,
                                'SMS reminders are enabled for all active tenants.',
                                'Vikumbusho vya SMS vimeruhusiwa kwa wapangaji wote.'
                              )}
                            </p>
                          ) : (
                            smsDisabledAccounts.map((account) => (
                              <div
                                key={account.id}
                                className="p-5"
                              >
                                <p className="font-bold">
                                  {account.house?.houseNumber ||
                                    '-'}
                                  {' — '}
                                  {accountName(account)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {t(
                                    language,
                                    'Enable reminders only after confirming the telephone number and consent.',
                                    'Washa vikumbusho baada ya kuthibitisha namba ya simu na ridhaa.'
                                  )}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeRentSection ===
                'smsReminders' && (() => {
                const pendingReminders =
                  rentSmsReminders.filter(
                    (reminder) =>
                      reminder.status === 'Pending'
                  );

                const remindersReadyToday =
                  pendingReminders.filter(
                    (reminder) =>
                      reminder.scheduledDate &&
                      reminder.scheduledDate <= todayISO()
                  );

                const futureReminders =
                  pendingReminders.filter(
                    (reminder) =>
                      reminder.scheduledDate &&
                      reminder.scheduledDate > todayISO()
                  );

                const sentReminders =
                  rentSmsReminders.filter((reminder) =>
                    ['Sent', 'Delivered'].includes(
                      reminder.status
                    )
                  );

                const failedReminders =
                  rentSmsReminders.filter(
                    (reminder) =>
                      reminder.status === 'Failed'
                  );

                const visibleReminders = [
                  ...rentSmsReminders,
                ].sort(
                  (first, second) =>
                    new Date(
                      first.scheduledDate ||
                        first.created_at ||
                        0
                    ) -
                    new Date(
                      second.scheduledDate ||
                        second.created_at ||
                        0
                    )
                );

                const reminderStatusClass = (reminder) => {
                  if (
                    ['Sent', 'Delivered'].includes(
                      reminder.status
                    )
                  ) {
                    return 'bg-emerald-100 text-emerald-700';
                  }

                  if (reminder.status === 'Failed') {
                    return 'bg-red-100 text-red-700';
                  }

                  if (reminder.status === 'Cancelled') {
                    return 'bg-slate-200 text-slate-600';
                  }

                  if (
                    reminder.scheduledDate &&
                    reminder.scheduledDate <= todayISO()
                  ) {
                    return 'bg-amber-100 text-amber-700';
                  }

                  return 'bg-blue-100 text-blue-700';
                };

                const reminderStatusLabel = (reminder) => {
                  if (reminder.status === 'Delivered') {
                    return t(
                      language,
                      'Delivered',
                      'Imefika'
                    );
                  }

                  if (reminder.status === 'Sent') {
                    return t(
                      language,
                      'Sent',
                      'Imetumwa'
                    );
                  }

                  if (reminder.status === 'Failed') {
                    return t(
                      language,
                      'Failed',
                      'Imeshindikana'
                    );
                  }

                  if (reminder.status === 'Cancelled') {
                    return t(
                      language,
                      'Cancelled',
                      'Imefutwa'
                    );
                  }

                  if (
                    reminder.scheduledDate &&
                    reminder.scheduledDate <= todayISO()
                  ) {
                    return t(
                      language,
                      'Ready to Send',
                      'Iko Tayari Kutumwa'
                    );
                  }

                  return t(
                    language,
                    'Scheduled',
                    'Imepangwa'
                  );
                };

                return (
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                      <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-blue-950">
                          Ujumbe Utakaotumwa
                        </h3>

                        <p className="mt-1 text-sm text-blue-700">
                          Hii ndiyo mifano ya ujumbe ambao mfumo
                          utaandaa kwa kutumia jina, nyumba na tarehe
                          halisi za kila mpangaji.
                        </p>
                      </div>

                      <div className="grid gap-4 p-5 md:grid-cols-2">
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                          <p className="font-bold text-blue-900">
                            Mwezi mmoja kabla
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            Mpendwa [Jina], tunakukumbusha kuwa kodi
                            ya nyumba [Nyumba] itaisha tarehe
                            [Tarehe]. Tafadhali jiandae kulipa mapema
                            ili kuepuka usumbufu. Asante.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <p className="font-bold text-amber-900">
                            Wiki mbili kabla
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            Mpendwa [Jina], zimebaki siku 14 kodi ya
                            nyumba [Nyumba] kuisha. Kodi ililipwa
                            tarehe [Tarehe ya Malipo] kwa miezi
                            [Idadi ya Miezi] na itaisha tarehe
                            [Tarehe]. Asante.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                          <p className="font-bold text-orange-900">
                            Wiki moja kabla
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            Mpendwa [Jina], zimebaki siku 7 kodi ya
                            nyumba [Nyumba] kuisha. Kodi ililipwa
                            tarehe [Tarehe ya Malipo] kwa miezi
                            [Idadi ya Miezi] na itaisha tarehe
                            [Tarehe]. Asante.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                          <p className="font-bold text-red-900">
                            Siku moja kabla
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            Mpendwa [Jina], tunakukumbusha kuwa kodi
                            ya nyumba [Nyumba] itaisha kesho, tarehe
                            [Tarehe]. Tafadhali hakikisha malipo
                            yanayofuata yanafanyika kwa wakati.
                            Asante.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <PreviewValue
                        label={t(
                          language,
                          'Ready Today',
                          'Tayari Kutumwa Leo'
                        )}
                        value={remindersReadyToday.length}
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Scheduled Ahead',
                          'Zilizopangwa Mbele'
                        )}
                        value={futureReminders.length}
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Sent or Delivered',
                          'Zilizotumwa au Kufika'
                        )}
                        value={sentReminders.length}
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Failed',
                          'Zilizoshindikana'
                        )}
                        value={failedReminders.length}
                      />
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 bg-purple-50 px-6 py-5">
                        <div>
                          <h3 className="text-xl font-bold text-purple-950">
                            {t(
                              language,
                              'Rent SMS Reminder Queue',
                              'Foleni ya Vikumbusho vya Kodi kwa SMS'
                            )}
                          </h3>

                          <p className="mt-1 text-sm text-purple-700">
                            {t(
                              language,
                              'Each rent date has four protected reminder stages. Old reminders are cancelled automatically when a new payment changes the due date.',
                              'Kila tarehe ya kodi ina hatua nne za vikumbusho zilizolindwa. Vikumbusho vya zamani vinafutwa moja kwa moja malipo mapya yanapobadilisha tarehe.'
                            )}
                          </p>
                        </div>

                        <Button
                          type="button"
                          className="bg-purple-700"
                          onClick={sendDueRentSmsReminders}
                        >
                          {t(
                            language,
                            'Send Reminders Due Today',
                            'Tuma Vikumbusho vya Leo'
                          )}
                        </Button>
                      </div>

                      <div className="space-y-4 p-5">
                        {visibleReminders.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            {t(
                              language,
                              'No SMS reminder has been prepared yet. Reminders will appear after registering an eligible tenant with a telephone number and rent expiry date.',
                              'Bado hakuna kikumbusho cha SMS kilichoandaliwa. Vikumbusho vitaonekana baada ya kusajili mpangaji mwenye namba ya simu na tarehe ya kodi kuisha.'
                            )}
                          </p>
                        ) : (
                          visibleReminders.map((reminder) => {
                            const reminderHouse =
                              getRentalHouse(
                                reminder.houseId
                              );
                            const reminderTenant =
                              getRentalTenant(
                                reminder.tenantId
                              );

                            return (
                              <div
                                key={reminder.id}
                                className="rounded-2xl border border-slate-200 p-5"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div>
                                    <p className="font-bold text-slate-900">
                                      {reminderHouse?.houseNumber ||
                                        '-'}
                                      {' — '}
                                      {reminderTenant?.fullName ||
                                        reminderTenant?.tenantName ||
                                        reminderHouse?.tenantName ||
                                        '-'}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600">
                                      {reminder.phoneNumber}
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full px-4 py-2 text-xs font-bold ${reminderStatusClass(
                                      reminder
                                    )}`}
                                  >
                                    {reminderStatusLabel(
                                      reminder
                                    )}
                                  </span>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Reminder Stage',
                                      'Hatua ya Kikumbusho'
                                    )}
                                    value={
                                      reminder.reminderStage ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Scheduled Date',
                                      'Tarehe Iliyopangwa'
                                    )}
                                    value={
                                      reminder.scheduledDate ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Rent Due Date',
                                      'Tarehe ya Kodi Kuisha'
                                    )}
                                    value={
                                      reminder.dueDate || '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Delivery Channel',
                                      'Njia ya Kutuma'
                                    )}
                                    value={
                                      reminder.preferredChannel ||
                                      'SMSGate'
                                    }
                                  />
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <p className="text-xs font-bold uppercase text-slate-500">
                                    {t(
                                      language,
                                      'Prepared Message',
                                      'Ujumbe Ulioandaliwa'
                                    )}
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-slate-800">
                                    {reminder.message}
                                  </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                  {[
                                    'Pending',
                                    'Failed',
                                  ].includes(
                                    reminder.status
                                  ) && (
                                    <>
                                      <Button
                                        type="button"
                                        className="bg-purple-700"
                                        onClick={() =>
                                          sendSingleRentSmsReminder(
                                            reminder
                                          )
                                        }
                                      >
                                        {reminder.scheduledDate &&
                                        reminder.scheduledDate >
                                          todayISO()
                                          ? t(
                                              language,
                                              'Send Early',
                                              'Tuma Mapema'
                                            )
                                          : t(
                                              language,
                                              'Send This Only',
                                              'Tuma Hiki Pekee'
                                            )}
                                      </Button>

                                      <Button
                                        type="button"
                                        className="bg-emerald-700"
                                        onClick={() =>
                                          markRentSmsReminderManuallySent(
                                            reminder
                                          )
                                        }
                                      >
                                        {t(
                                          language,
                                          'I Sent It Manually',
                                          'Nimetuma Mwenyewe'
                                        )}
                                      </Button>
                                    </>
                                  )}

                                  <Button
                                    type="button"
                                    className="bg-slate-700"
                                    onClick={() =>
                                      copyRentSmsReminderMessage(
                                        reminder
                                      )
                                    }
                                  >
                                    {t(
                                      language,
                                      'Copy Message',
                                      'Nakili Ujumbe'
                                    )}
                                  </Button>
                                </div>

                                {reminder.failureReason && (
                                  <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {reminder.failureReason}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeRentSection === 'rentReports' && (
                <div className="space-y-5">
                  <div className="rounded-3xl border border-indigo-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xl font-bold text-indigo-950">
                      {t(
                        language,
                        'Rental Reports',
                        'Ripoti za Kodi'
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-indigo-700">
                      {t(
                        language,
                        'Select one report below to display its details.',
                        'Chagua ripoti moja hapa chini ili kuona maelezo yake.'
                      )}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        [
                          'rentRegister',
                          t(
                            language,
                            'Rent Register',
                            'Rejesta ya Kodi'
                          ),
                        ],
                        [
                          'rentInvoices',
                          t(
                            language,
                            'Rent Invoices',
                            'Ankara za Kodi'
                          ),
                        ],
                        [
                          'rentPayments',
                          t(
                            language,
                            'Payment History',
                            'Historia ya Malipo'
                          ),
                        ],
                        [
                          'rentExpenses',
                          t(
                            language,
                            'Rental Expenses',
                            'Matumizi ya Kodi'
                          ),
                        ],
                        [
                          'rentFund',
                          t(
                            language,
                            'Rent Fund Report',
                            'Ripoti ya Mfuko wa Kodi'
                          ),
                        ],
                        [
                          'occupancyHistory',
                          t(
                            language,
                            'Occupancy History',
                            'Historia ya Matumizi ya Nyumba'
                          ),
                        ],
                        [
                          'smsHistory',
                          t(
                            language,
                            'SMS History',
                            'Historia ya SMS'
                          ),
                        ],
                      ].map(([reportValue, reportLabel]) => (
                        <button
                          key={reportValue}
                          type="button"
                          onClick={() =>
                            setActiveRentReport(reportValue)
                          }
                          className={`rounded-2xl border px-4 py-4 text-left font-bold transition ${
                            activeRentReport === reportValue
                              ? 'border-indigo-700 bg-indigo-700 text-white shadow-md'
                              : 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                          }`}
                        >
                          {reportLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!activeRentReport && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <p className="text-sm text-slate-500">
                        {t(
                          language,
                          'No report is open. Select one of the report choices above.',
                          'Hakuna ripoti iliyofunguliwa. Chagua moja ya ripoti zilizo hapo juu.'
                        )}
                      </p>
                    </div>
                  )}

                  {activeRentReport === 'rentRegister' && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
                        <h3 className="text-xl font-bold">
                          {t(
                            language,
                            'Permanent Rent Register',
                            'Rejesta ya Kudumu ya Kodi'
                          )}
                        </h3>

                        <p className="mt-1 text-sm text-slate-300">
                          {t(
                            language,
                            `${activeRentAccounts.length} active rent-paying account(s).`,
                            `Akaunti ${activeRentAccounts.length} za wapangaji wanaolipa kodi.`
                          )}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'House',
                                  'Nyumba'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Tenant',
                                  'Mpangaji'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Telephone',
                                  'Namba ya Simu'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Start Date',
                                  'Tarehe ya Kuanza'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Monthly Rent',
                                  'Kodi kwa Mwezi'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Paid Through',
                                  'Imelipwa Hadi'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Next Payment',
                                  'Malipo Yanayofuata'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Credit',
                                  'Salio'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'SMS',
                                  'SMS'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Action',
                                  'Hatua'
                                )}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {activeRentAccounts.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={10}
                                  className="px-5 py-8 text-center text-slate-500"
                                >
                                  {t(
                                    language,
                                    'No active rent-paying account has been registered yet.',
                                    'Bado hakuna akaunti ya mpangaji anayelipa kodi iliyosajiliwa.'
                                  )}
                                </td>
                              </tr>
                            ) : (
                              activeRentAccounts.map(
                                (account) => (
                                  <tr key={account.id}>
                                    <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                                      {account.house
                                        ?.houseNumber || '-'}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                      {account.tenant?.fullName ||
                                        account.tenant
                                          ?.tenantName ||
                                        account.house
                                          ?.tenantName ||
                                        '-'}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                      {account.tenant
                                        ?.phoneNumber || '-'}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                      {account.startDate || '-'}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 font-bold">
                                      TZS{' '}
                                      {currency(
                                        account.monthlyRentAmount ||
                                          0
                                      )}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                      {account.paidThroughDate ||
                                        '-'}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                      {account.nextPaymentDate ||
                                        '-'}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 font-bold text-blue-700">
                                      TZS{' '}
                                      {currency(
                                        account.creditBalance ||
                                          0
                                      )}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                      <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                                          account.smsRemindersEnabled
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {account.smsRemindersEnabled
                                          ? t(
                                              language,
                                              'Enabled',
                                              'Imewashwa'
                                            )
                                          : t(
                                              language,
                                              'Disabled',
                                              'Imezimwa'
                                            )}
                                      </span>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                      {activeRentalPayments.some(
                                        (payment) =>
                                          String(
                                            payment.tenancyId
                                          ) ===
                                          String(account.id)
                                      ) ||
                                      activeRentInvoices.some(
                                        (invoice) =>
                                          String(
                                            invoice.tenancyId
                                          ) ===
                                          String(account.id)
                                      ) ? (
                                        <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                                          {t(
                                            language,
                                            'Financial records locked',
                                            'Rekodi za fedha zimefungwa'
                                          )}
                                        </span>
                                      ) : (
                                        <Button
                                          type="button"
                                          className="bg-amber-600"
                                          onClick={() =>
                                            openRentalCorrectionForm(
                                              account
                                            )
                                          }
                                        >
                                          {t(
                                            language,
                                            'Edit Initial Details',
                                            'Hariri Taarifa za Mwanzo'
                                          )}
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                )
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeRentReport === 'rentInvoices' && (
                    <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                      <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-blue-950">
                          {t(
                            language,
                            'Rent Invoice Report',
                            'Ripoti ya Ankara za Kodi'
                          )}
                        </h3>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <PreviewValue
                            label={t(
                              language,
                              'Total Invoiced',
                              'Jumla ya Ankara'
                            )}
                            value={`TZS ${currency(
                              totalRentInvoiced
                            )}`}
                          />

                          <PreviewValue
                            label={t(
                              language,
                              'Total Paid',
                              'Jumla Iliyolipwa'
                            )}
                            value={`TZS ${currency(
                              activeRentInvoices.reduce(
                                (total, invoice) =>
                                  total +
                                  Number(
                                    invoice.amountPaid || 0
                                  ),
                                0
                              )
                            )}`}
                          />

                          <PreviewValue
                            label={t(
                              language,
                              'Outstanding Balance',
                              'Salio Linalodaiwa'
                            )}
                            value={`TZS ${currency(
                              totalRentOutstanding
                            )}`}
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Invoice',
                                  'Ankara'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'House / Tenant',
                                  'Nyumba / Mpangaji'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Billing Period',
                                  'Kipindi cha Ankara'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Issue Date',
                                  'Tarehe ya Ankara'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Due Date',
                                  'Tarehe ya Malipo'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Amount',
                                  'Kiasi'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Paid',
                                  'Imelipwa'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Balance',
                                  'Salio'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Status',
                                  'Hali'
                                )}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {activeRentInvoices.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={9}
                                  className="px-5 py-8 text-center text-slate-500"
                                >
                                  {t(
                                    language,
                                    'No permanent rent invoice has been recorded yet.',
                                    'Bado hakuna ankara ya kudumu ya kodi iliyorekodiwa.'
                                  )}
                                </td>
                              </tr>
                            ) : (
                              [...activeRentInvoices]
                                .sort(
                                  (first, second) =>
                                    new Date(
                                      second.issueDate ||
                                        second.created_at ||
                                        0
                                    ) -
                                    new Date(
                                      first.issueDate ||
                                        first.created_at ||
                                        0
                                    )
                                )
                                .map((invoice) => {
                                  const invoiceHouse =
                                    getRentalHouse(
                                      invoice.houseId
                                    );
                                  const invoiceTenant =
                                    getRentalTenant(
                                      invoice.tenantId
                                    );
                                  const invoiceBalance =
                                    Number(
                                      invoice.balance || 0
                                    );

                                  return (
                                    <tr key={invoice.id}>
                                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                        {invoice.invoiceNumber ||
                                          invoice.id}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        <p className="font-bold">
                                          {invoiceHouse
                                            ?.houseNumber || '-'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {invoiceTenant
                                            ?.fullName ||
                                            invoiceTenant
                                              ?.tenantName ||
                                            invoiceHouse
                                              ?.tenantName ||
                                            '-'}
                                        </p>
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {invoice.periodStart ||
                                          '-'}
                                        {' — '}
                                        {invoice.periodEnd || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {invoice.issueDate || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {invoice.dueDate || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold">
                                        TZS{' '}
                                        {currency(
                                          invoice.invoiceAmount ||
                                            0
                                        )}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-700">
                                        TZS{' '}
                                        {currency(
                                          invoice.amountPaid || 0
                                        )}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-red-700">
                                        TZS{' '}
                                        {currency(
                                          invoice.balance || 0
                                        )}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            invoiceBalance <= 0
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : Number(
                                                    invoice.amountPaid ||
                                                      0
                                                  ) > 0
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-700'
                                          }`}
                                        >
                                          {invoice.status ||
                                            (invoiceBalance <= 0
                                              ? 'Paid'
                                              : 'Unpaid')}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeRentReport === 'rentPayments' && (
                    <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
                      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-emerald-950">
                          {t(
                            language,
                            'Permanent Rent Payment History',
                            'Historia ya Kudumu ya Malipo ya Kodi'
                          )}
                        </h3>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <PreviewValue
                            label={t(
                              language,
                              'Total Received',
                              'Jumla Iliyopokelewa'
                            )}
                            value={`TZS ${currency(
                              totalRentCollected
                            )}`}
                          />

                          <PreviewValue
                            label={t(
                              language,
                              'Allocated to Invoices',
                              'Iliyogawiwa Kwenye Ankara'
                            )}
                            value={`TZS ${currency(
                              activeRentalPayments.reduce(
                                (total, payment) =>
                                  total +
                                  Number(
                                    payment.allocatedAmount ||
                                      0
                                  ),
                                0
                              )
                            )}`}
                          />

                          <PreviewValue
                            label={t(
                              language,
                              'Remaining Credit',
                              'Salio Lililobaki'
                            )}
                            value={`TZS ${currency(
                              totalRentCredit
                            )}`}
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Receipt',
                                  'Risiti'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'House / Tenant',
                                  'Nyumba / Mpangaji'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Payment Date',
                                  'Tarehe ya Malipo'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Exact Recording Time',
                                  'Muda Kamili wa Kurekodi'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Method',
                                  'Njia'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Received',
                                  'Iliyopokelewa'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Allocated',
                                  'Iliyogawiwa'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Credit',
                                  'Salio'
                                )}
                              </th>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Status',
                                  'Hali'
                                )}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {rentalPayments.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={9}
                                  className="px-5 py-8 text-center text-slate-500"
                                >
                                  {t(
                                    language,
                                    'No permanent rent payment has been recorded yet.',
                                    'Bado hakuna malipo ya kudumu ya kodi yaliyorekodiwa.'
                                  )}
                                </td>
                              </tr>
                            ) : (
                              [...rentalPayments]
                                .sort(
                                  (first, second) =>
                                    new Date(
                                      second.created_at ||
                                        second.paymentDate ||
                                        0
                                    ) -
                                    new Date(
                                      first.created_at ||
                                        first.paymentDate ||
                                        0
                                    )
                                )
                                .map((payment) => {
                                  const paymentHouse =
                                    getRentalHouse(
                                      payment.houseId
                                    );
                                  const paymentTenant =
                                    getRentalTenant(
                                      payment.tenantId
                                    );

                                  return (
                                    <tr key={payment.id}>
                                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                        {payment.receiptNumber ||
                                          payment.id}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        <p className="font-bold">
                                          {paymentHouse
                                            ?.houseNumber || '-'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {paymentTenant
                                            ?.fullName ||
                                            paymentTenant
                                              ?.tenantName ||
                                            paymentHouse
                                              ?.tenantName ||
                                            '-'}
                                        </p>
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {payment.paymentDate ||
                                          '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {payment.created_at
                                          ? new Date(
                                              payment.created_at
                                            ).toLocaleString()
                                          : '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {payment.paymentMethod ||
                                          '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-800">
                                        TZS{' '}
                                        {currency(
                                          payment.amountReceived ||
                                            0
                                        )}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-blue-800">
                                        TZS{' '}
                                        {currency(
                                          payment.allocatedAmount ||
                                            0
                                        )}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-purple-800">
                                        TZS{' '}
                                        {currency(
                                          payment.creditAmount ||
                                            0
                                        )}
                                      </td>

                                      <td className="px-5 py-4">
                                        <span
                                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                            payment.status ===
                                            'Active'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}
                                        >
                                          {payment.status ===
                                          'Active'
                                            ? t(
                                                language,
                                                'Active',
                                                'Halali'
                                              )
                                            : t(
                                                language,
                                                'Corrected',
                                                'Yamesahihishwa'
                                              )}
                                        </span>

                                        {payment.reversalReason && (
                                          <p className="mt-2 max-w-56 whitespace-normal text-xs text-slate-500">
                                            {
                                              payment.reversalReason
                                            }
                                          </p>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeRentReport === 'rentExpenses' && (
                    <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm">
                      <div className="border-b border-orange-100 bg-orange-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-orange-950">
                          {t(
                            language,
                            'Permanent Rental Expense Report',
                            'Ripoti ya Kudumu ya Matumizi ya Kodi'
                          )}
                        </h3>

                        <div className="mt-4">
                          <PreviewValue
                            label={t(
                              language,
                              'Total Rental Expenses Paid',
                              'Jumla ya Matumizi ya Kodi Yaliyolipwa'
                            )}
                            value={`TZS ${currency(
                              totalRentalExpensesPaid
                            )}`}
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Expense Date',
                                  'Tarehe ya Matumizi'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Expense Type',
                                  'Aina ya Matumizi'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'House',
                                  'Nyumba'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Description',
                                  'Maelezo'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Paid To',
                                  'Aliyelipwa'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Reference',
                                  'Kumbukumbu'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Status',
                                  'Hali'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Amount',
                                  'Kiasi'
                                )}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {activeRentalExpenses.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="px-5 py-8 text-center text-slate-500"
                                >
                                  {t(
                                    language,
                                    'No permanent rental expense has been recorded yet.',
                                    'Bado hakuna matumizi ya kudumu ya kodi yaliyorekodiwa.'
                                  )}
                                </td>
                              </tr>
                            ) : (
                              [...activeRentalExpenses]
                                .sort(
                                  (first, second) =>
                                    new Date(
                                      second.created_at ||
                                        second.expenseDate ||
                                        0
                                    ) -
                                    new Date(
                                      first.created_at ||
                                        first.expenseDate ||
                                        0
                                    )
                                )
                                .map((expense) => {
                                  const expenseHouse =
                                    getRentalHouse(
                                      expense.houseId
                                    );

                                  return (
                                    <tr key={expense.id}>
                                      <td className="whitespace-nowrap px-5 py-4">
                                        {expense.expenseDate || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                        {expense.expenseType || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold">
                                        {expenseHouse?.houseNumber ||
                                          t(
                                            language,
                                            'General expense',
                                            'Matumizi ya jumla'
                                          )}
                                      </td>

                                      <td className="min-w-[220px] px-5 py-4">
                                        {expense.description || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {expense.payee || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {expense.referenceNumber ||
                                          '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            expense.status ===
                                            'Reversed'
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-emerald-100 text-emerald-700'
                                          }`}
                                        >
                                          {expense.status ||
                                            t(
                                              language,
                                              'Paid',
                                              'Imelipwa'
                                            )}
                                        </span>
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-orange-800">
                                        TZS{' '}
                                        {currency(
                                          expense.amount || 0
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeRentReport === 'rentFund' && (() => {
                    const rentFundTransactions = [
                      ...activeRentalPayments.map((payment) => {
                        const paymentHouse =
                          getRentalHouse(payment.houseId);
                        const paymentTenant =
                          getRentalTenant(payment.tenantId);

                        return {
                          id: `payment-${payment.id}`,
                          transactionDate:
                            payment.paymentDate ||
                            payment.created_at,
                          createdAt:
                            payment.created_at ||
                            payment.paymentDate,
                          transactionType: 'income',
                          reference:
                            payment.receiptNumber ||
                            payment.id,
                          description: `${
                            paymentHouse?.houseNumber || '-'
                          } — ${
                            paymentTenant?.fullName ||
                            paymentTenant?.tenantName ||
                            paymentHouse?.tenantName ||
                            '-'
                          }`,
                          amount: Number(
                            payment.amountReceived || 0
                          ),
                        };
                      }),

                      ...activeRentalExpenses.map((expense) => {
                        const expenseHouse =
                          getRentalHouse(expense.houseId);

                        return {
                          id: `expense-${expense.id}`,
                          transactionDate:
                            expense.expenseDate ||
                            expense.created_at,
                          createdAt:
                            expense.created_at ||
                            expense.expenseDate,
                          transactionType: 'expense',
                          reference:
                            expense.referenceNumber ||
                            expense.id,
                          description: `${
                            expense.expenseType || '-'
                          } — ${
                            expenseHouse?.houseNumber ||
                            t(
                              language,
                              'General expense',
                              'Matumizi ya jumla'
                            )
                          }`,
                          amount: Number(
                            expense.amount || 0
                          ),
                        };
                      }),
                    ]
                      .sort(
                        (first, second) =>
                          new Date(first.createdAt || 0) -
                          new Date(second.createdAt || 0)
                      )
                      .reduce(
                        (transactions, transaction) => {
                          const previousBalance =
                            transactions.length > 0
                              ? transactions[
                                  transactions.length - 1
                                ].runningBalance
                              : 0;

                          const runningBalance =
                            transaction.transactionType ===
                            'income'
                              ? previousBalance +
                                transaction.amount
                              : previousBalance -
                                transaction.amount;

                          return [
                            ...transactions,
                            {
                              ...transaction,
                              runningBalance,
                            },
                          ];
                        },
                        []
                      );

                    return (
                      <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                        <div className="border-b border-purple-100 bg-purple-50 px-6 py-5">
                          <h3 className="text-xl font-bold text-purple-950">
                            {t(
                              language,
                              'Permanent Rent Fund Report',
                              'Ripoti ya Kudumu ya Mfuko wa Kodi'
                            )}
                          </h3>

                          <p className="mt-1 text-sm text-purple-700">
                            {t(
                              language,
                              'All rent received, rental expenses and the balance carried forward.',
                              'Kodi yote iliyopokelewa, matumizi ya nyumba na salio linalohamishwa mbele.'
                            )}
                          </p>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <PreviewValue
                              label={t(
                                language,
                                'Total Rent Received',
                                'Jumla ya Kodi Iliyopokelewa'
                              )}
                              value={`TZS ${currency(
                                totalRentCollected
                              )}`}
                            />

                            <PreviewValue
                              label={t(
                                language,
                                'Total Expenses Paid',
                                'Jumla ya Matumizi Yaliyolipwa'
                              )}
                              value={`TZS ${currency(
                                totalRentalExpensesPaid
                              )}`}
                            />

                            <PreviewValue
                              label={t(
                                language,
                                'Balance Carried Forward',
                                'Salio Linalohamishwa Mbele'
                              )}
                              value={`TZS ${currency(
                                netRentFundBalance
                              )}`}
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-700">
                              <tr>
                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Date',
                                    'Tarehe'
                                  )}
                                </th>

                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Transaction',
                                    'Muamala'
                                  )}
                                </th>

                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Description',
                                    'Maelezo'
                                  )}
                                </th>

                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Reference',
                                    'Kumbukumbu'
                                  )}
                                </th>

                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Money In',
                                    'Fedha Iliyoingia'
                                  )}
                                </th>

                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Money Out',
                                    'Fedha Iliyotoka'
                                  )}
                                </th>

                                <th className="px-5 py-4">
                                  {t(
                                    language,
                                    'Running Balance',
                                    'Salio Baada ya Muamala'
                                  )}
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                              {rentFundTransactions.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-5 py-8 text-center text-slate-500"
                                  >
                                    {t(
                                      language,
                                      'No rent fund transaction has been recorded yet.',
                                      'Bado hakuna muamala wa mfuko wa kodi uliorekodiwa.'
                                    )}
                                  </td>
                                </tr>
                              ) : (
                                rentFundTransactions.map(
                                  (transaction) => (
                                    <tr key={transaction.id}>
                                      <td className="whitespace-nowrap px-5 py-4">
                                        {transaction.transactionDate ||
                                          '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            transaction.transactionType ===
                                            'income'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-orange-100 text-orange-700'
                                          }`}
                                        >
                                          {transaction.transactionType ===
                                          'income'
                                            ? t(
                                                language,
                                                'Rent Received',
                                                'Kodi Iliyopokelewa'
                                              )
                                            : t(
                                                language,
                                                'Expense Paid',
                                                'Matumizi Yaliyolipwa'
                                              )}
                                        </span>
                                      </td>

                                      <td className="min-w-[220px] px-5 py-4 font-semibold">
                                        {transaction.description}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {transaction.reference}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-700">
                                        {transaction.transactionType ===
                                        'income'
                                          ? `TZS ${currency(
                                              transaction.amount
                                            )}`
                                          : '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-orange-700">
                                        {transaction.transactionType ===
                                        'expense'
                                          ? `TZS ${currency(
                                              transaction.amount
                                            )}`
                                          : '-'}
                                      </td>

                                      <td
                                        className={`whitespace-nowrap px-5 py-4 font-bold ${
                                          transaction.runningBalance >=
                                          0
                                            ? 'text-blue-800'
                                            : 'text-red-700'
                                        }`}
                                      >
                                        TZS{' '}
                                        {currency(
                                          transaction.runningBalance
                                        )}
                                      </td>
                                    </tr>
                                  )
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {activeRentReport ===
                    'occupancyHistory' && (
                    <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm">
                      <div className="border-b border-cyan-100 bg-cyan-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-cyan-950">
                          {t(
                            language,
                            'Permanent House Occupancy History',
                            'Historia ya Kudumu ya Matumizi ya Nyumba'
                          )}
                        </h3>

                        <p className="mt-1 text-sm text-cyan-700">
                          {t(
                            language,
                            `${propertyOccupancies.length} occupancy record(s), including current and previous occupants.`,
                            `Rekodi ${propertyOccupancies.length} za matumizi ya nyumba, zikijumuisha matumizi ya sasa na yaliyopita.`
                          )}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'House',
                                  'Nyumba'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Occupant',
                                  'Mtumiaji wa Nyumba'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Occupancy Type',
                                  'Aina ya Matumizi'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Start Date',
                                  'Tarehe ya Kuanza'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'End Date',
                                  'Tarehe ya Kumaliza'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Status',
                                  'Hali'
                                )}
                              </th>

                              <th className="px-5 py-4">
                                {t(
                                  language,
                                  'Notes',
                                  'Maelezo'
                                )}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {propertyOccupancies.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="px-5 py-8 text-center text-slate-500"
                                >
                                  {t(
                                    language,
                                    'No permanent house occupancy record has been created yet.',
                                    'Bado hakuna rekodi ya kudumu ya matumizi ya nyumba iliyotengenezwa.'
                                  )}
                                </td>
                              </tr>
                            ) : (
                              [...propertyOccupancies]
                                .sort(
                                  (first, second) =>
                                    new Date(
                                      second.startDate ||
                                        second.created_at ||
                                        0
                                    ) -
                                    new Date(
                                      first.startDate ||
                                        first.created_at ||
                                        0
                                    )
                                )
                                .map((occupancy) => {
                                  const occupancyHouse =
                                    getRentalHouse(
                                      occupancy.houseId
                                    );

                                  const occupancyTenant =
                                    getRentalTenant(
                                      occupancy.tenantId
                                    );

                                  const occupantName =
                                    occupancy.occupantName ||
                                    occupancyTenant?.fullName ||
                                    occupancyTenant
                                      ?.tenantName ||
                                    occupancyHouse
                                      ?.tenantName ||
                                    (occupancy.occupancyType ===
                                    'Vacant'
                                      ? t(
                                          language,
                                          'No occupant',
                                          'Hakuna mpangaji'
                                        )
                                      : '-');

                                  return (
                                    <tr key={occupancy.id}>
                                      <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                                        {occupancyHouse
                                          ?.houseNumber || '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                        {occupantName}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {occupancy.occupancyType ||
                                          '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {occupancy.startDate ||
                                          '-'}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        {occupancy.endDate ||
                                          (occupancy.active === true
                                            ? t(
                                                language,
                                                'Still active',
                                                'Bado inatumika'
                                              )
                                            : '-')}
                                      </td>

                                      <td className="whitespace-nowrap px-5 py-4">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            occupancy.active === true
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-slate-200 text-slate-600'
                                          }`}
                                        >
                                          {occupancy.active === true
                                            ? t(
                                                language,
                                                'Current',
                                                'Ya Sasa'
                                              )
                                            : t(
                                                language,
                                                'Previous',
                                                'Iliyopita'
                                              )}
                                        </span>
                                      </td>

                                      <td className="min-w-[220px] px-5 py-4">
                                        {occupancy.notes || '-'}
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeRentReport === 'smsHistory' && (() => {
                    const sentSmsCount =
                      rentSmsReminders.filter(
                        (reminder) =>
                          reminder.status === 'Sent' ||
                          reminder.status === 'Delivered'
                      ).length;

                    const failedSmsCount =
                      rentSmsReminders.filter(
                        (reminder) =>
                          reminder.status === 'Failed'
                      ).length;

                    const pendingSmsCount =
                      rentSmsReminders.filter(
                        (reminder) =>
                          reminder.status === 'Pending' ||
                          reminder.status === 'Processing'
                      ).length;

                    return (
                      <div className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm">
                        <div className="border-b border-violet-100 bg-violet-50 px-6 py-5">
                          <h3 className="text-xl font-bold text-violet-950">
                            {t(
                              language,
                              'Permanent Rent SMS History',
                              'Historia ya Kudumu ya SMS za Kodi'
                            )}
                          </h3>

                          <p className="mt-1 text-sm text-violet-700">
                            {t(
                              language,
                              'Prepared reminders and every recorded delivery attempt are preserved here.',
                              'Vikumbusho vilivyoandaliwa na kila jaribio la kutuma vinahifadhiwa hapa.'
                            )}
                          </p>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <PreviewValue
                              label={t(
                                language,
                                'All Reminders',
                                'Vikumbusho Vyote'
                              )}
                              value={rentSmsReminders.length}
                            />

                            <PreviewValue
                              label={t(
                                language,
                                'Sent or Delivered',
                                'Zilizotumwa au Kufika'
                              )}
                              value={sentSmsCount}
                            />

                            <PreviewValue
                              label={t(
                                language,
                                'Pending',
                                'Zinazosubiri'
                              )}
                              value={pendingSmsCount}
                            />

                            <PreviewValue
                              label={t(
                                language,
                                'Failed',
                                'Zilizoshindikana'
                              )}
                              value={failedSmsCount}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-5">
                          {rentSmsReminders.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-500">
                              {t(
                                language,
                                'No permanent SMS reminder record has been created yet.',
                                'Bado hakuna rekodi ya kudumu ya kikumbusho cha SMS iliyotengenezwa.'
                              )}
                            </p>
                          ) : (
                            [...rentSmsReminders]
                              .sort(
                                (first, second) =>
                                  new Date(
                                    second.sentAt ||
                                      second.attemptedAt ||
                                      second.scheduledDate ||
                                      second.created_at ||
                                      0
                                  ) -
                                  new Date(
                                    first.sentAt ||
                                      first.attemptedAt ||
                                      first.scheduledDate ||
                                      first.created_at ||
                                      0
                                  )
                              )
                              .map((reminder) => {
                                const reminderHouse =
                                  getRentalHouse(
                                    reminder.houseId
                                  );

                                const reminderTenant =
                                  getRentalTenant(
                                    reminder.tenantId
                                  );

                                const reminderAttempts =
                                  rentSmsAttempts
                                    .filter(
                                      (attempt) =>
                                        String(
                                          attempt.reminderId
                                        ) ===
                                        String(reminder.id)
                                    )
                                    .sort(
                                      (first, second) =>
                                        new Date(
                                          second.attemptedAt ||
                                            0
                                        ) -
                                        new Date(
                                          first.attemptedAt ||
                                            0
                                        )
                                    );

                                const latestAttempt =
                                  reminderAttempts[0];

                                const statusClass =
                                  reminder.status ===
                                    'Delivered' ||
                                  reminder.status === 'Sent'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : reminder.status ===
                                        'Failed'
                                      ? 'bg-red-100 text-red-700'
                                      : reminder.status ===
                                          'Cancelled'
                                        ? 'bg-slate-200 text-slate-600'
                                        : 'bg-amber-100 text-amber-700';

                                return (
                                  <div
                                    key={reminder.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-4 bg-slate-50 p-5">
                                      <div>
                                        <p className="font-bold text-slate-900">
                                          {reminderHouse
                                            ?.houseNumber || '-'}
                                          {' — '}
                                          {reminderTenant
                                            ?.fullName ||
                                            reminderTenant
                                              ?.tenantName ||
                                            reminderHouse
                                              ?.tenantName ||
                                            '-'}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                          {reminder.phoneNumber ||
                                            '-'}
                                        </p>
                                      </div>

                                      <span
                                        className={`rounded-full px-4 py-2 text-xs font-bold ${statusClass}`}
                                      >
                                        {reminder.status ||
                                          'Pending'}
                                      </span>
                                    </div>

                                    <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                                      <div className="bg-white p-4">
                                        <p className="text-xs font-bold uppercase text-slate-500">
                                          {t(
                                            language,
                                            'Reminder Stage',
                                            'Hatua ya Kikumbusho'
                                          )}
                                        </p>
                                        <p className="mt-2 font-semibold">
                                          {reminder.reminderStage ||
                                            '-'}
                                        </p>
                                      </div>

                                      <div className="bg-white p-4">
                                        <p className="text-xs font-bold uppercase text-slate-500">
                                          {t(
                                            language,
                                            'Scheduled Date',
                                            'Tarehe Iliyopangwa'
                                          )}
                                        </p>
                                        <p className="mt-2 font-semibold">
                                          {reminder.scheduledDate ||
                                            '-'}
                                        </p>
                                      </div>

                                      <div className="bg-white p-4">
                                        <p className="text-xs font-bold uppercase text-slate-500">
                                          {t(
                                            language,
                                            'Rent Due Date',
                                            'Tarehe ya Kodi Kuisha'
                                          )}
                                        </p>
                                        <p className="mt-2 font-semibold">
                                          {reminder.dueDate || '-'}
                                        </p>
                                      </div>

                                      <div className="bg-white p-4">
                                        <p className="text-xs font-bold uppercase text-slate-500">
                                          {t(
                                            language,
                                            'Sent or Delivered At',
                                            'Ilitumwa au Kufika'
                                          )}
                                        </p>
                                        <p className="mt-2 font-semibold">
                                          {reminder.deliveredAt
                                            ? new Date(
                                                reminder.deliveredAt
                                              ).toLocaleString()
                                            : reminder.sentAt
                                              ? new Date(
                                                  reminder.sentAt
                                                ).toLocaleString()
                                              : '-'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="p-5">
                                      <p className="text-xs font-bold uppercase text-slate-500">
                                        {t(
                                          language,
                                          'Message',
                                          'Ujumbe'
                                        )}
                                      </p>

                                      <p className="mt-2 text-sm leading-6 text-slate-800">
                                        {reminder.message || '-'}
                                      </p>

                                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                          <p className="font-bold text-slate-900">
                                            {t(
                                              language,
                                              'Delivery Attempts',
                                              'Majaribio ya Kutuma'
                                            )}
                                          </p>

                                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                                            {reminderAttempts.length}
                                          </span>
                                        </div>

                                        {latestAttempt ? (
                                          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                                            <div>
                                              <p className="text-xs text-slate-500">
                                                {t(
                                                  language,
                                                  'Latest Attempt',
                                                  'Jaribio la Mwisho'
                                                )}
                                              </p>
                                              <p className="mt-1 font-semibold">
                                                {latestAttempt.attemptedAt
                                                  ? new Date(
                                                      latestAttempt.attemptedAt
                                                    ).toLocaleString()
                                                  : '-'}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-slate-500">
                                                {t(
                                                  language,
                                                  'Channel',
                                                  'Njia'
                                                )}
                                              </p>
                                              <p className="mt-1 font-semibold">
                                                {latestAttempt.channel ||
                                                  reminder.preferredChannel ||
                                                  'SMSGate'}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-slate-500">
                                                {t(
                                                  language,
                                                  'Attempt Status',
                                                  'Hali ya Jaribio'
                                                )}
                                              </p>
                                              <p className="mt-1 font-semibold">
                                                {latestAttempt.status ||
                                                  '-'}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-slate-500">
                                                {t(
                                                  language,
                                                  'Provider Reference',
                                                  'Kumbukumbu ya Mtumaji'
                                                )}
                                              </p>
                                              <p className="mt-1 break-all font-semibold">
                                                {latestAttempt.providerReference ||
                                                  '-'}
                                              </p>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="mt-3 text-sm text-slate-500">
                                            {t(
                                              language,
                                              'No sending attempt has been made yet.',
                                              'Bado hakuna jaribio la kutuma lililofanyika.'
                                            )}
                                          </p>
                                        )}

                                        {(latestAttempt?.errorMessage ||
                                          reminder.failureReason) && (
                                          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {latestAttempt?.errorMessage ||
                                              reminder.failureReason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

                {isRentalCorrectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-amber-100 bg-amber-50 px-6 py-5">
                <h3 className="text-2xl font-bold text-amber-950">
                  {t(
                    language,
                    'Edit Initial Rental Details',
                    'Hariri Taarifa za Mwanzo za Kodi'
                  )}
                </h3>

                <p className="mt-1 text-sm text-amber-700">
                  {t(
                    language,
                    'This correction is allowed only before invoices or payments exist. The previous values will remain permanently recorded.',
                    'Marekebisho haya yanaruhusiwa tu kabla ya kuwepo ankara au malipo. Taarifa za awali zitabaki zimehifadhiwa moja kwa moja.'
                  )}
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t(
                      language,
                      'Tenant Name',
                      'Jina la Mpangaji'
                    )}
                    value={
                      rentalCorrectionForm.tenantName
                    }
                    onChange={(e) =>
                      setRentalCorrectionForm(
                        (previous) => ({
                          ...previous,
                          tenantName: e.target.value,
                        })
                      )
                    }
                  />

                  <Input
                    label={t(
                      language,
                      'Telephone Number',
                      'Namba ya Simu'
                    )}
                    type="tel"
                    placeholder="07XXXXXXXX"
                    value={
                      rentalCorrectionForm.phoneNumber
                    }
                    onChange={(e) =>
                      setRentalCorrectionForm(
                        (previous) => ({
                          ...previous,
                          phoneNumber: e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t(
                      language,
                      'Tenancy Start Date',
                      'Tarehe ya Kuanza Kodi'
                    )}
                    type="date"
                    value={
                      rentalCorrectionForm.startDate
                    }
                    onChange={(e) =>
                      setRentalCorrectionForm(
                        (previous) => ({
                          ...previous,
                          startDate: e.target.value,
                        })
                      )
                    }
                  />

                  <Input
                    label={t(
                      language,
                      'Monthly Rent',
                      'Kodi kwa Mwezi'
                    )}
                    type="number"
                    min="1"
                    value={
                      rentalCorrectionForm.monthlyRentAmount
                    }
                    onChange={(e) =>
                      setRentalCorrectionForm(
                        (previous) => ({
                          ...previous,
                          monthlyRentAmount:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <Input
                  label={t(
                    language,
                    'Rent Already Paid Through',
                    'Kodi Iliyopo Imelipwa Hadi'
                  )}
                  type="date"
                  value={
                    rentalCorrectionForm.paidThroughDate
                  }
                  onChange={(e) =>
                    setRentalCorrectionForm(
                      (previous) => ({
                        ...previous,
                        paidThroughDate: e.target.value,
                      })
                    )
                  }
                />

                <label className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <input
                    type="checkbox"
                    checked={
                      rentalCorrectionForm.smsRemindersEnabled
                    }
                    onChange={(e) =>
                      setRentalCorrectionForm(
                        (previous) => ({
                          ...previous,
                          smsRemindersEnabled:
                            e.target.checked,
                        })
                      )
                    }
                  />

                  <span className="text-sm font-medium text-blue-900">
                    {t(
                      language,
                      'Send automatic rent reminders by SMS',
                      'Tuma vikumbusho vya kodi kwa SMS'
                    )}
                  </span>
                </label>

                <Textarea
                  label={t(
                    language,
                    'Reason for Correction',
                    'Sababu ya Marekebisho'
                  )}
                  rows={3}
                  placeholder={t(
                    language,
                    'Explain what was entered incorrectly.',
                    'Eleza taarifa iliyokuwa imeingizwa kimakosa.'
                  )}
                  value={rentalCorrectionForm.reason}
                  onChange={(e) =>
                    setRentalCorrectionForm(
                      (previous) => ({
                        ...previous,
                        reason: e.target.value,
                      })
                    )
                  }
                />

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {t(
                    language,
                    'After saving, the corrected dates and monthly rent will control all future automatic rental calculations.',
                    'Baada ya kuhifadhi, tarehe na kodi iliyorekebishwa ndiyo itakayotumika kwenye mahesabu yote ya kodi yanayofuata.'
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    className="bg-slate-500"
                    disabled={isSavingRentalCorrection}
                    onClick={() => {
                      setRentalCorrectionForm({
                        ...emptyRentalCorrectionForm,
                      });
                      setIsRentalCorrectionOpen(false);
                    }}
                  >
                    {t(
                      language,
                      'Cancel',
                      'Ghairi'
                    )}
                  </Button>

                  <Button
                    type="button"
                    className="bg-amber-600"
                    disabled={isSavingRentalCorrection}
                    onClick={saveRentalCorrection}
                  >
                    {isSavingRentalCorrection
                      ? t(
                          language,
                          'Saving Correction...',
                          'Inahifadhi Marekebisho...'
                        )
                      : t(
                          language,
                          'Save Correction',
                          'Hifadhi Marekebisho'
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isRentalTenantEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-violet-100 bg-violet-50 px-6 py-5">
                <h3 className="text-2xl font-bold text-violet-950">
                  {t(
                    language,
                    'Edit Existing Tenant Details',
                    'Hariri Taarifa za Mpangaji'
                  )}
                </h3>

                <p className="mt-1 text-sm text-violet-700">
                  {t(
                    language,
                    'Every house appears here with its current status. Occupant contact details can be edited without changing the permanent house or meter.',
'Kila nyumba inaonekana hapa pamoja na hali yake ya sasa. Taarifa za mkazi zinaweza kuhaririwa bila kubadilisha nyumba au mita ya kudumu.'
                  )}
                </p>
              </div>

              <div className="space-y-5 p-6">
                <Select
                  label={t(
                    language,
                    'Select House or Occupant',
                    'Chagua Nyumba au Mkazi'
                  )}
                  value={rentalTenantEditForm.houseId}
                  onChange={(e) =>
                    handleRentalTenantEditSelection(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    {t(
                      language,
                      'Select house',
                      'Chagua nyumba'
                    )}
                  </option>

                  {rentalHouseAccounts.map((account) => (
                    <option
                      key={account.house?.id}
                      value={account.house?.id}
                    >
                      {account.house?.houseNumber || '-'}
                      {' — '}
                      {account.meter?.meterNumber || '-'}
                      {' — '}
                      {account.tenant?.fullName ||
                        account.occupancy?.occupantName ||
                        account.house?.tenantName ||
                        'Hakuna mkazi'}
                      {' — '}
                      {account.statusLabel}
                    </option>
                  ))}
                </Select>

                {rentalTenantEditForm.houseId && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <PreviewValue
                        label={t(
                          language,
                          'Locked House',
                          'Nyumba Iliyofungwa'
                        )}
                        value={
                          selectedRentalTenantEditAccount
                            ?.house?.houseNumber || '-'
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Locked Permanent Meter',
                          'Mita ya Kudumu Iliyofungwa'
                        )}
                        value={
                          selectedRentalTenantEditMeter
                            ?.meterNumber || '-'
                        }
                      />
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      {t(
                        language,
                        'Only the details below will change. The selected house and permanent meter cannot be changed here.',
                        'Taarifa zilizo hapa chini pekee ndizo zitabadilika. Nyumba na mita ya kudumu zilizochaguliwa haziwezi kubadilishwa hapa.'
                      )}
                    </div>

                    <Input
                      label={t(
                        language,
                        'Tenant Name',
                        'Jina la Mpangaji'
                      )}
                      value={rentalTenantEditForm.fullName}
                      onChange={(e) =>
                        setRentalTenantEditForm(
                          (previous) => ({
                            ...previous,
                            fullName: formatPersonName(
                              e.target.value
                            ),
                          })
                        )
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label={t(
                          language,
                          'Phone Number',
                          'Namba ya Simu'
                        )}
                        placeholder="07XXXXXXXX"
                        value={
                          rentalTenantEditForm.phoneNumber
                        }
                        onChange={(e) =>
                          setRentalTenantEditForm(
                            (previous) => ({
                              ...previous,
                              phoneNumber: e.target.value,
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Occupation',
                          'Kazi ya Mpangaji'
                        )}
                        value={
                          rentalTenantEditForm.occupation
                        }
                        onChange={(e) =>
                          setRentalTenantEditForm(
                            (previous) => ({
                              ...previous,
                              occupation: e.target.value,
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Emergency Contact Name',
                          'Jina la Mtu wa Dharura'
                        )}
                        value={
                          rentalTenantEditForm
                            .emergencyContactName
                        }
                        onChange={(e) =>
                          setRentalTenantEditForm(
                            (previous) => ({
                              ...previous,
                              emergencyContactName:
                                formatPersonName(
                                  e.target.value
                                ),
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Emergency Contact Phone',
                          'Namba ya Simu ya Dharura'
                        )}
                        placeholder="07XXXXXXXX"
                        value={
                          rentalTenantEditForm
                            .emergencyContactPhone
                        }
                        onChange={(e) =>
                          setRentalTenantEditForm(
                            (previous) => ({
                              ...previous,
                              emergencyContactPhone:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-violet-900">
                      <input
                        type="checkbox"
                        checked={
                          rentalTenantEditForm.smsConsent
                        }
                        onChange={(e) =>
                          setRentalTenantEditForm(
                            (previous) => ({
                              ...previous,
                              smsConsent: e.target.checked,
                            })
                          )
                        }
                      />

                      {t(
                        language,
                        'Send automatic rent reminders by SMS',
                        'Tuma vikumbusho vya kodi kwa SMS'
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        {t(
                          language,
                          'Notes',
                          'Maelezo'
                        )}
                      </span>

                      <textarea
                        className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                        value={rentalTenantEditForm.notes}
                        onChange={(e) =>
                          setRentalTenantEditForm(
                            (previous) => ({
                              ...previous,
                              notes: e.target.value,
                            })
                          )
                        }
                      />
                    </label>
                  </>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setRentalTenantEditForm({
                        ...emptyRentalTenantEditForm,
                      });
                      setIsRentalTenantEditOpen(false);
                    }}
                  >
                    {t(language, 'Cancel', 'Ghairi')}
                  </Button>

                  <Button
                    type="button"
                    className="bg-violet-700"
                    disabled={
  isSavingRentalTenantEdit ||
  !rentalTenantEditForm.houseId ||
  !rentalTenantEditForm.fullName.trim()
}
                    onClick={saveRentalTenantDetails}
                  >
                    {isSavingRentalTenantEdit
                      ? t(
                          language,
                          'Saving...',
                          'Inahifadhi...'
                        )
                      : t(
                          language,
                          'Save Tenant Details',
                          'Hifadhi Taarifa za Mpangaji'
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isRentalRegistrationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
                <h3 className="text-2xl font-bold text-blue-950">
                  {t(
                    language,
                    'Register House Occupancy',
                    'Sajili Matumizi ya Nyumba'
                  )}
                </h3>

                <p className="mt-1 text-sm text-blue-700">
                  {t(
                    language,
                    'Select whether the house is rented, owner occupied or vacant.',
                    'Chagua kama nyumba ina mpangaji, inatumiwa na mmiliki au iko tupu.'
                  )}
                </p>
              </div>

              <div className="space-y-4 p-6">
                <Select
                  label={t(language, 'House', 'Nyumba')}
                  value={rentalRegistrationForm.houseId}
                  onChange={(e) => {
                    const selectedHouseId =
                      e.target.value;

                    const selectedHouse = houses.find(
                      (house) =>
                        String(house.id) ===
                        String(selectedHouseId)
                    );

                    const currentOccupancy =
                      propertyOccupancies.find(
                        (occupancy) =>
                          String(
                            occupancy.houseId
                          ) ===
                            String(selectedHouseId) &&
                          occupancy.active === true
                      );

                    const suggestedOccupancyType =
                      currentOccupancy?.occupancyType ||
                      (selectedHouse?.houseStatus ===
                      'Vacant'
                        ? 'Vacant'
                        : selectedHouse?.tenantName
                          ? 'Rent Paying Tenant'
                          : 'Vacant');

                    const suggestedMonthlyRent =
                      Number(
                        selectedHouse?.monthlyRentAmount ||
                          0
                      ) > 0
                        ? Number(
                            selectedHouse.monthlyRentAmount
                          )
                        : String(
                              selectedHouse?.houseNumber ||
                                ''
                            ).startsWith('UP-')
                          ? 180000
                          : 200000;

                    setRentalRegistrationForm(
                      (previous) => ({
                        ...previous,
                        houseId: selectedHouseId,
                        occupancyType:
                          suggestedOccupancyType,
                        tenantName:
                          selectedHouse?.tenantName ||
                          '',
                        paymentDate: todayISO(),
                        startDate: addDaysISO(
                          todayISO(),
                          1
                        ),
                        monthlyRentAmount:
                          suggestedOccupancyType ===
                          'Rent Paying Tenant'
                            ? String(
                                suggestedMonthlyRent
                              )
                            : '',
                        amountReceived: '',
                        paidThroughDate: '',
                        smsRemindersEnabled:
                          suggestedOccupancyType ===
                          'Rent Paying Tenant',
                      })
                    );
                  }}
                >
                  <option value="">
                    {t(
                      language,
                      'Select house',
                      'Chagua nyumba'
                    )}
                  </option>

                  {houses.map((house) => {
                    const permanentHouseMeter =
                      waterMeters.find(
                        (meter) =>
                          String(
                            meter.houseNumber || ''
                          ) ===
                            String(
                              house.houseNumber || ''
                            ) &&
                          meter.active !== false
                      );

                    return (
                      <option
                        key={house.id}
                        value={house.id}
                      >
                        {house.houseNumber}
                        {' — '}
                        {permanentHouseMeter?.meterNumber ||
                          t(
                            language,
                            'No meter',
                            'Hakuna mita'
                          )}
                        {' — '}
                        {house.tenantName ||
                          t(
                            language,
                            'No tenant',
                            'Hakuna mpangaji'
                          )}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  label={t(
                    language,
                    'Current Use of the House',
                    'Matumizi ya Sasa ya Nyumba'
                  )}
                  value={
                    rentalRegistrationForm.occupancyType
                  }
                  onChange={(e) =>
                    setRentalRegistrationForm((previous) => ({
                      ...previous,
                      occupancyType: e.target.value,
                      monthlyRentAmount:
                        e.target.value ===
                        'Rent Paying Tenant'
                          ? previous.monthlyRentAmount
                          : '',
                      paidThroughDate:
                        e.target.value ===
                        'Rent Paying Tenant'
                          ? previous.paidThroughDate
                          : '',
                      smsRemindersEnabled:
                        e.target.value ===
                        'Rent Paying Tenant',
                    }))
                  }
                >
                  <option value="Rent Paying Tenant">
                    {t(
                      language,
                      'Rent-paying tenant',
                      'Ina mpangaji anayelipa kodi'
                    )}
                  </option>
                  <option value="Owner or Family">
                    {t(
                      language,
                      'Owner or family occupied',
                      'Inatumiwa na mmiliki au familia'
                    )}
                  </option>
                  <option value="Vacant">
                    {t(language, 'Vacant', 'Tupu')}
                  </option>
                </Select>

                {rentalRegistrationForm.occupancyType !==
                  'Vacant' && (
                  <Input
                    label={
                      rentalRegistrationForm.occupancyType ===
                      'Rent Paying Tenant'
                        ? t(
                            language,
                            'Tenant Name',
                            'Jina la Mpangaji'
                          )
                        : t(
                            language,
                            'Current Occupant',
                            'Jina la Anayeishi'
                          )
                    }
                    value={
                      rentalRegistrationForm.tenantName
                    }
                    onChange={(e) =>
                      setRentalRegistrationForm(
                        (previous) => ({
                          ...previous,
                          tenantName: formatPersonName(
                            e.target.value
                          ),
                        })
                      )
                    }
                  />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {rentalRegistrationForm.occupancyType ===
                    'Rent Paying Tenant' && (
                    <Input
                      label={t(
                        language,
                        'Rent Payment Date',
                        'Tarehe ya Malipo ya Kodi'
                      )}
                      type="date"
                      value={
                        rentalRegistrationForm.paymentDate
                      }
                      onChange={(e) =>
                        setRentalRegistrationForm(
                          (previous) => ({
                            ...previous,
                            paymentDate:
                              e.target.value,
                            startDate: addDaysISO(
                              e.target.value,
                              1
                            ),
                          })
                        )
                      }
                    />
                  )}

                  <Input
                    label={t(
                      language,
                      'Occupancy Start Date',
                      'Tarehe ya Kuanza Kutumia Nyumba'
                    )}
                    type="date"
                    value={
                      rentalRegistrationForm.startDate
                    }
                    onChange={(e) =>
                      setRentalRegistrationForm(
                        (previous) => ({
                          ...previous,
                          startDate: e.target.value,
                        })
                      )
                    }
                  />
                </div>

                {rentalRegistrationForm.occupancyType ===
                  'Rent Paying Tenant' && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Input
                        label={t(
                          language,
                          'Telephone Number',
                          'Namba ya Simu'
                        )}
                        type="tel"
                        placeholder="07XXXXXXXX"
                        value={
                          rentalRegistrationForm.phoneNumber
                        }
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              phoneNumber: e.target.value,
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Monthly Rent',
                          'Kodi kwa Mwezi'
                        )}
                        type="text"
                        inputMode="numeric"
                        value={formatAmountInput(
                          rentalRegistrationForm.monthlyRentAmount
                        )}
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              monthlyRentAmount:
                                cleanAmountInput(
                                  e.target.value
                                ),
                              paidThroughDate: '',
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Amount Received',
                          'Kiasi Kilichopokelewa'
                        )}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={formatAmountInput(
                          rentalRegistrationForm.amountReceived
                        )}
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              amountReceived:
                                cleanAmountInput(
                                  e.target.value
                                ),
                              paidThroughDate: '',
                            })
                          )
                        }
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <PreviewValue
                        label={t(
                          language,
                          'Complete Months Covered',
                          'Miezi Kamili Iliyolipiwa'
                        )}
                        value={newTenantFullMonths}
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Rent Paid Through',
                          'Kodi Imelipwa Hadi'
                        )}
                        value={
                          newTenantPaidThroughDate || '-'
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Next Payment Date',
                          'Tarehe ya Malipo Yanayofuata'
                        )}
                        value={
                          newTenantNextPaymentDate || '-'
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Remaining Credit',
                          'Salio Lililobaki'
                        )}
                        value={`TZS ${currency(
                          newTenantRemainingCredit
                        )}`}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Input
                        label={t(
                          language,
                          'Tenant Occupation',
                          'Kazi ya Mpangaji'
                        )}
                        placeholder={t(
                          language,
                          'Occupation or business',
                          'Kazi au biashara'
                        )}
                        value={
                          rentalRegistrationForm.occupation
                        }
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              occupation: e.target.value,
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Emergency Contact Name',
                          'Jina la Mtu wa Dharura'
                        )}
                        placeholder={t(
                          language,
                          'Immediate contact person',
                          'Mtu wa karibu wa kuwasiliana naye'
                        )}
                        value={
                          rentalRegistrationForm.emergencyContactName
                        }
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              emergencyContactName:
                                formatPersonName(
                                  e.target.value
                                ),
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Emergency Contact Phone',
                          'Namba ya Simu ya Mtu wa Dharura'
                        )}
                        type="tel"
                        placeholder="07XXXXXXXX"
                        value={
                          rentalRegistrationForm.emergencyContactPhone
                        }
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              emergencyContactPhone:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <input
                        type="checkbox"
                        checked={
                          rentalRegistrationForm.smsRemindersEnabled
                        }
                        onChange={(e) =>
                          setRentalRegistrationForm(
                            (previous) => ({
                              ...previous,
                              smsRemindersEnabled:
                                e.target.checked,
                            })
                          )
                        }
                      />

                      <span className="text-sm font-medium text-blue-900">
                        {t(
                          language,
                          'Send automatic rent reminders by SMS',
                          'Tuma vikumbusho vya kodi kwa SMS'
                        )}
                      </span>
                    </label>
                  </>
                )}

                <Textarea
                  label={t(
                    language,
                    'Notes',
                    'Maelezo'
                  )}
                  rows={3}
                  value={rentalRegistrationForm.notes}
                  onChange={(e) =>
                    setRentalRegistrationForm((previous) => ({
                      ...previous,
                      notes: e.target.value,
                    }))
                  }
                />

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    className="bg-slate-500"
                    disabled={isSavingRentalRegistration}
                    onClick={() => {
                      setRentalRegistrationForm({
                        ...emptyRentalRegistrationForm,
                      });
                      setIsRentalRegistrationOpen(false);
                    }}
                  >
                    {t(language, 'Cancel', 'Ghairi')}
                  </Button>

                  <Button
                    type="button"
                    className="bg-blue-700"
                    disabled={isSavingRentalRegistration}
                    onClick={saveRentalRegistration}
                  >
                    {isSavingRentalRegistration
                      ? t(
                          language,
                          'Saving...',
                          'Inahifadhi...'
                        )
                      : t(
                          language,
                          'Save Occupancy',
                          'Hifadhi Matumizi ya Nyumba'
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isRentalPaymentCorrectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-amber-100 bg-amber-50 px-6 py-5">
                <h3 className="text-2xl font-bold text-amber-950">
                  {t(
                    language,
                    'Correct Rent Payment',
                    'Sahihisha Malipo ya Kodi'
                  )}
                </h3>

                <p className="mt-1 text-sm text-amber-700">
                  {t(
                    language,
                    'Correct an amount or payment date without deleting the original record. The account will be recalculated automatically.',
                    'Sahihisha kiasi au tarehe ya malipo bila kufuta rekodi ya zamani. Akaunti itahesabiwa upya moja kwa moja.'
                  )}
                </p>
              </div>

              <div className="space-y-5 p-6">
                <Select
                  label={t(
                    language,
                    'Select Payment to Correct',
                    'Chagua Malipo ya Kusahihisha'
                  )}
                  value={
                    rentalPaymentCorrectionForm.paymentId
                  }
                  onChange={(e) =>
                    handleRentalPaymentCorrectionSelection(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    {t(
                      language,
                      'Select payment',
                      'Chagua malipo'
                    )}
                  </option>

                  {activeRentalPayments
                    .slice()
                    .sort(
                      (a, b) =>
                        String(b.paymentDate || '').localeCompare(
                          String(a.paymentDate || '')
                        ) ||
                        String(b.created_at || '').localeCompare(
                          String(a.created_at || '')
                        )
                    )
                    .map((payment) => {
                      const account =
                        activeRentAccounts.find(
                          (item) =>
                            String(item.id) ===
                            String(payment.tenancyId)
                        );

                      return (
                        <option
                          key={payment.id}
                          value={payment.id}
                        >
                          {payment.paymentDate || '-'}
                          {' — '}
                          {account?.house?.houseNumber || '-'}
                          {' — '}
                          {account?.tenant?.fullName ||
                            account?.house?.tenantName ||
                            '-'}
                          {' — TZS '}
                          {currency(
                            payment.amountReceived || 0
                          )}
                          {' — '}
                          {payment.receiptNumber || '-'}
                        </option>
                      );
                    })}
                </Select>

                {selectedRentalPaymentCorrection && (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h4 className="font-bold text-slate-900">
                        {t(
                          language,
                          'Original Permanent Record',
                          'Rekodi ya Kudumu ya Zamani'
                        )}
                      </h4>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <PreviewValue
                          label={t(
                            language,
                            'House',
                            'Nyumba'
                          )}
                          value={
                            selectedRentalPaymentCorrectionAccount
                              ?.house?.houseNumber || '-'
                          }
                        />

                        <PreviewValue
                          label={t(
                            language,
                            'Tenant',
                            'Mpangaji'
                          )}
                          value={
                            selectedRentalPaymentCorrectionAccount
                              ?.tenant?.fullName ||
                            selectedRentalPaymentCorrectionAccount
                              ?.house?.tenantName ||
                            '-'
                          }
                        />

                        <PreviewValue
                          label={t(
                            language,
                            'Original Date',
                            'Tarehe ya Zamani'
                          )}
                          value={
                            selectedRentalPaymentCorrection
                              .paymentDate || '-'
                          }
                        />

                        <PreviewValue
                          label={t(
                            language,
                            'Original Amount',
                            'Kiasi cha Zamani'
                          )}
                          value={`TZS ${currency(
                            selectedRentalPaymentCorrection
                              .amountReceived || 0
                          )}`}
                        />
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        {t(
                          language,
                          `Receipt: ${
                            selectedRentalPaymentCorrection
                              .receiptNumber || '-'
                          }`,
                          `Risiti: ${
                            selectedRentalPaymentCorrection
                              .receiptNumber || '-'
                          }`
                        )}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label={t(
                          language,
                          'Corrected Amount',
                          'Kiasi Sahihi'
                        )}
                        type="text"
                        inputMode="numeric"
                        value={formatAmountInput(
                          rentalPaymentCorrectionForm
                            .correctedAmount
                        )}
                        onChange={(e) =>
                          setRentalPaymentCorrectionForm(
                            (previous) => ({
                              ...previous,
                              correctedAmount:
                                cleanAmountInput(
                                  e.target.value
                                ),
                            })
                          )
                        }
                      />

                      <Input
                        label={t(
                          language,
                          'Corrected Payment Date',
                          'Tarehe Sahihi ya Malipo'
                        )}
                        type="date"
                        value={
                          rentalPaymentCorrectionForm
                            .correctedPaymentDate
                        }
                        onChange={(e) =>
                          setRentalPaymentCorrectionForm(
                            (previous) => ({
                              ...previous,
                              correctedPaymentDate:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        {t(
                          language,
                          'Reason for Correction',
                          'Sababu ya Marekebisho'
                        )}
                      </span>

                      <textarea
                        className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                        placeholder={t(
                          language,
                          'Explain what was entered incorrectly.',
                          'Eleza kilichoingizwa kimakosa.'
                        )}
                        value={
                          rentalPaymentCorrectionForm.reason
                        }
                        onChange={(e) =>
                          setRentalPaymentCorrectionForm(
                            (previous) => ({
                              ...previous,
                              reason: e.target.value,
                            })
                          )
                        }
                      />
                    </label>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      {t(
                        language,
                        'The original payment will remain permanently visible as corrected. A new receipt will be created and the rent account will be recalculated.',
                        'Malipo ya zamani yataendelea kuonekana kwa kudumu kama yaliyosahihishwa. Risiti mpya itatengenezwa na akaunti ya kodi itahesabiwa upya.'
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setRentalPaymentCorrectionForm({
                        ...emptyRentalPaymentCorrectionForm,
                      });
                      setIsRentalPaymentCorrectionOpen(false);
                    }}
                  >
                    {t(language, 'Cancel', 'Ghairi')}
                  </Button>

                  <Button
                    type="button"
                    className="bg-amber-600"
                    disabled={
                      isSavingRentalPaymentCorrection ||
                      !selectedRentalPaymentCorrection
                    }
                    onClick={
                      saveRentalPaymentCorrection
                    }
                  >
                    {isSavingRentalPaymentCorrection
                      ? t(
                          language,
                          'Correcting...',
                          'Inasahihisha...'
                        )
                      : t(
                          language,
                          'Save Correction',
                          'Hifadhi Marekebisho'
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isRentalPaymentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
                <h3 className="text-2xl font-bold text-emerald-950">
                  {t(
                    language,
                    'Record Rent Payment',
                    'Sajili Malipo ya Kodi'
                  )}
                </h3>

                <p className="mt-1 text-sm text-emerald-700">
                  {t(
                    language,
                    'Select the existing tenant and enter the amount received. The rent period will update automatically.',
                    'Chagua mpangaji aliyepo na uweke kiasi kilichopokelewa. Kipindi cha kodi kitasasishwa moja kwa moja.'
                  )}
                </p>
              </div>

              <div className="space-y-5 p-6">
                <Select
                  label={t(
                    language,
                    'House and Tenant',
                    'Nyumba na Mpangaji'
                  )}
                  value={rentalPaymentForm.tenancyId}
                  onChange={(e) =>
                    setRentalPaymentForm((previous) => ({
                      ...previous,
                      tenancyId: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    {t(
                      language,
                      'Select house and tenant',
                      'Chagua nyumba na mpangaji'
                    )}
                  </option>

                  {activeRentAccounts.map((account) => {
                    const accountMeter = waterMeters.find(
                      (meter) =>
                        String(
                          meter.houseNumber || ''
                        ) ===
                          String(
                            account.house?.houseNumber ||
                              ''
                          ) &&
                        meter.active !== false
                    );

                    return (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.house?.houseNumber || '-'}
                        {' — '}
                        {accountMeter?.meterNumber ||
                          t(
                            language,
                            'No meter',
                            'Hakuna mita'
                          )}
                        {' — '}
                        {account.tenant?.fullName ||
                          account.tenant?.tenantName ||
                          account.tenant?.name ||
                          account.house?.tenantName ||
                          '-'}
                      </option>
                    );
                  })}
                </Select>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t(
                      language,
                      'Amount Received',
                      'Kiasi Kilichopokelewa'
                    )}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatAmountInput(
                      rentalPaymentForm.amountReceived
                    )}
                    onChange={(e) =>
                      setRentalPaymentForm((previous) => ({
                        ...previous,
                        amountReceived: cleanAmountInput(
                          e.target.value
                        ),
                      }))
                    }
                  />

                  <Input
                    label={t(
                      language,
                      'Actual Payment Date',
                      'Tarehe Halisi ya Malipo'
                    )}
                    type="date"
                    value={rentalPaymentForm.paymentDate}
                    onChange={(e) =>
                      setRentalPaymentForm((previous) => ({
                        ...previous,
                        paymentDate: e.target.value,
                      }))
                    }
                  />
                </div>

                {selectedRentPaymentAccount && (
                  <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white">
                    <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="font-bold text-blue-950">
                        {t(
                          language,
                          'Confirm Selected Rent Account',
                          'Thibitisha Akaunti ya Kodi Iliyochaguliwa'
                        )}
                      </p>
                    </div>

                    <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-3">
                      <PreviewValue
                        label={t(
                          language,
                          'House',
                          'Nyumba'
                        )}
                        value={
                          selectedRentPaymentAccount.house
                            ?.houseNumber || '-'
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Meter Number',
                          'Namba ya Mita'
                        )}
                        value={
                          selectedRentPaymentMeter
                            ?.meterNumber ||
                          t(
                            language,
                            'No meter',
                            'Hakuna mita'
                          )
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Tenant',
                          'Mpangaji'
                        )}
                        value={
                          selectedRentPaymentAccount.tenant
                            ?.fullName ||
                          selectedRentPaymentAccount.tenant
                            ?.tenantName ||
                          selectedRentPaymentAccount.house
                            ?.tenantName ||
                          '-'
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Monthly Rent',
                          'Kodi kwa Mwezi'
                        )}
                        value={`TZS ${currency(
                          selectedRentPaymentAccount.monthlyRentAmount ||
                            0
                        )}`}
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Currently Paid Through',
                          'Kwa Sasa Imelipwa Hadi'
                        )}
                        value={
                          selectedRentPaymentAccount.paidThroughDate ||
                          '-'
                        }
                      />

                      <PreviewValue
                        label={t(
                          language,
                          'Current Credit',
                          'Salio la Sasa'
                        )}
                        value={`TZS ${currency(
                          selectedRentPaymentAccount.creditBalance ||
                            0
                        )}`}
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  {t(
                    language,
                    'The system will apply the money to unpaid rent first, calculate the complete months covered, preserve any remaining credit and set the next payment date automatically.',
                    'Mfumo utatumia fedha kulipia kodi ambayo haijalipwa kwanza, utahesabu miezi kamili iliyolipiwa, utahifadhi salio lolote na kuweka tarehe inayofuata ya malipo moja kwa moja.'
                  )}
                </div>


                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    className="bg-slate-500"
                    disabled={isSavingRentalPayment}
                    onClick={() => {
                      setRentalPaymentForm({
                        ...emptyRentalPaymentForm,
                        paymentDate: todayISO(),
                      });
                      setIsRentalPaymentOpen(false);
                    }}
                  >
                    {t(language, 'Cancel', 'Ghairi')}
                  </Button>

                  <Button
                    type="button"
                    className="bg-emerald-700"
                    disabled={isSavingRentalPayment}
                    onClick={saveRentalPayment}
                  >
                    {isSavingRentalPayment
                      ? t(
                          language,
                          'Saving Payment...',
                          'Inahifadhi Malipo...'
                        )
                      : t(
                          language,
                          'Save Rent Payment',
                          'Hifadhi Malipo ya Kodi'
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isRentalExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-orange-100 bg-orange-50 px-6 py-5">
                <h3 className="text-2xl font-bold text-orange-950">
                  {t(
                    language,
                    'Record Rental Expense',
                    'Sajili Matumizi ya Kodi'
                  )}
                </h3>

                <p className="mt-1 text-sm text-orange-700">
                  {t(
                    language,
                    'Record repairs, maintenance and other expenses relating to the rental houses.',
                    'Sajili matengenezo na matumizi mengine yanayohusu nyumba za kupangisha.'
                  )}
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    label={t(
                      language,
                      'Expense Type',
                      'Aina ya Matumizi'
                    )}
                    value={rentalExpenseForm.expenseType}
                    onChange={(e) =>
                      setRentalExpenseForm((previous) => ({
                        ...previous,
                        expenseType: e.target.value,
                      }))
                    }
                  >
                    <option value="Repair">
                      {t(language, 'Repair', 'Matengenezo')}
                    </option>
                    <option value="Maintenance">
                      {t(
                        language,
                        'Routine Maintenance',
                        'Matunzo ya Kawaida'
                      )}
                    </option>
                    <option value="Utility">
                      {t(
                        language,
                        'Utility Expense',
                        'Gharama za Huduma'
                      )}
                    </option>
                    <option value="Tax or Levy">
                      {t(
                        language,
                        'Tax or Levy',
                        'Kodi au Tozo'
                      )}
                    </option>
                    <option value="Security">
                      {t(language, 'Security', 'Ulinzi')}
                    </option>
                    <option value="Other">
                      {t(language, 'Other', 'Mengineyo')}
                    </option>
                  </Select>

                  <Input
                    label={t(
                      language,
                      'Amount Paid',
                      'Kiasi Kilicholipwa'
                    )}
                    type="number"
                    min="1"
                    placeholder="0"
                    value={rentalExpenseForm.amount}
                    onChange={(e) =>
                      setRentalExpenseForm((previous) => ({
                        ...previous,
                        amount: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t(
                      language,
                      'Expense Date',
                      'Tarehe ya Matumizi'
                    )}
                    type="date"
                    value={rentalExpenseForm.expenseDate}
                    onChange={(e) =>
                      setRentalExpenseForm((previous) => ({
                        ...previous,
                        expenseDate: e.target.value,
                      }))
                    }
                  />

                  <Select
                    label={t(
                      language,
                      'Related House (Optional)',
                      'Nyumba Inayohusika (Si Lazima)'
                    )}
                    value={rentalExpenseForm.houseId}
                    onChange={(e) =>
                      setRentalExpenseForm((previous) => ({
                        ...previous,
                        houseId: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      {t(
                        language,
                        'General rental expense',
                        'Matumizi ya jumla'
                      )}
                    </option>

                    {houses.map((house) => (
                      <option key={house.id} value={house.id}>
                        {house.houseNumber}
                        {house.tenantName
                          ? ` — ${house.tenantName}`
                          : ''}
                      </option>
                    ))}
                  </Select>
                </div>

                <Textarea
                  label={t(
                    language,
                    'Expense Description',
                    'Maelezo ya Matumizi'
                  )}
                  rows={3}
                  placeholder={t(
                    language,
                    'Briefly explain what was paid for',
                    'Eleza kwa kifupi fedha imelipia nini'
                  )}
                  value={rentalExpenseForm.description}
                  onChange={(e) =>
                    setRentalExpenseForm((previous) => ({
                      ...previous,
                      description: e.target.value,
                    }))
                  }
                />

                <details className="rounded-2xl border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-4 py-3 font-bold text-slate-700">
                    {t(
                      language,
                      'Optional Expense Information',
                      'Taarifa za Ziada za Matumizi'
                    )}
                  </summary>

                  <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2">
                    <Input
                      label={t(
                        language,
                        'Paid To',
                        'Aliyelipwa'
                      )}
                      value={rentalExpenseForm.payee}
                      onChange={(e) =>
                        setRentalExpenseForm((previous) => ({
                          ...previous,
                          payee: e.target.value,
                        }))
                      }
                    />

                    <Input
                      label={t(
                        language,
                        'Receipt or Reference Number',
                        'Namba ya Risiti au Kumbukumbu'
                      )}
                      value={
                        rentalExpenseForm.referenceNumber
                      }
                      onChange={(e) =>
                        setRentalExpenseForm((previous) => ({
                          ...previous,
                          referenceNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                </details>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    className="bg-slate-500"
                    disabled={isSavingRentalExpense}
                    onClick={() => {
                      setRentalExpenseForm({
                        ...emptyRentalExpenseForm,
                        expenseDate: todayISO(),
                      });
                      setIsRentalExpenseOpen(false);
                    }}
                  >
                    {t(language, 'Cancel', 'Ghairi')}
                  </Button>

                  <Button
                    type="button"
                    className="bg-orange-600"
                    disabled={isSavingRentalExpense}
                    onClick={saveRentalExpense}
                  >
                    {isSavingRentalExpense
                      ? t(
                          language,
                          'Saving Expense...',
                          'Inahifadhi Matumizi...'
                        )
                      : t(
                          language,
                          'Save Expense',
                          'Hifadhi Matumizi'
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meters' && (
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="space-y-2">
                {waterSections.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveWaterSection(value)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      activeWaterSection === value
                        ? 'bg-cyan-700 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              {activeWaterSection === 'attention' && (
  <div className="lg:col-span-2">
    <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
      <div className="border-b border-red-100 bg-red-50 px-6 py-5">
        <h3 className="text-2xl font-bold text-red-900">
          {t(
            language,
            'Meters Requiring Action',
            'Mita Zinazohitaji Hatua'
          )}
        </h3>

        <p className="mt-1 text-sm text-red-700">
          {t(
            language,
            'Each meter is shown together with its problem and the action required.',
            'Kila mita imeonyeshwa pamoja na tatizo lake na hatua inayohitajika.'
          )}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-600">
              <th className="px-4 py-3">
                {t(language, 'House / Meter', 'Nyumba / Mita')}
              </th>

              <th className="px-4 py-3">
                {t(language, 'Tenant', 'Mpangaji')}
              </th>

              <th className="px-4 py-3">
                {t(language, 'Problem', 'Tatizo')}
              </th>

              <th className="px-4 py-3">
                {t(language, 'Required Action', 'Hatua Inayohitajika')}
              </th>

              <th className="px-4 py-3">
                {t(language, 'Action', 'Kitendo')}
              </th>
            </tr>
          </thead>

          <tbody>
            {metersNeedingAttention.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {t(
                    language,
                    'No meter currently requires action.',
                    'Hakuna mita inayohitaji hatua kwa sasa.'
                  )}
                </td>
              </tr>
            ) : (
              metersNeedingAttention.map((meter) => {
                const connectedHouse = houses.find(
                  (house) =>
                    String(house.houseNumber || '')
                      .trim()
                      .toLowerCase() ===
                    String(meter.houseNumber || '')
                      .trim()
                      .toLowerCase()
                );

                const tenantName =
                  connectedHouse?.tenantName ||
                  meter.tenantName ||
                  '-';

                const problem =
                  meter.attentionType === 'overdue'
                    ? t(
                        language,
                        'Reading is overdue',
                        'Usomaji umechelewa'
                      )
                    : meter.attentionType === 'dueSoon'
                      ? t(
                          language,
                          'Reading date is approaching',
                          'Tarehe ya kusoma inakaribia'
                        )
                      : meter.attentionType === 'noReading'
                        ? t(
                            language,
                            'No saved reading',
                            'Hakuna usomaji uliohifadhiwa'
                          )
                        : t(
                            language,
                            'No registered meter',
                            'Hakuna mita iliyosajiliwa'
                          );

                const requiredAction =
                  meter.attentionType === 'missingMeter'
                    ? t(
                        language,
                        'Register the water meter and opening reading',
                        'Sajili mita ya maji na usomaji wa kuanzia'
                      )
                    : t(
                        language,
                        'Record the current meter reading',
                        'Weka usomaji wa sasa wa mita'
                      );

                return (
                  <tr
  key={`meter-attention-${meter.id}`}
  className="border-t-2 border-slate-300 transition hover:bg-slate-50"
>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">
                        {meter.houseNumber || '-'}
                      </p>

                      <p className="text-xs text-slate-500">
                        {t(language, 'Meter', 'Mita')}:{' '}
                        {meter.meterNumber || '-'}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {tenantName}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          meter.attentionType === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : meter.attentionType === 'dueSoon'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {problem}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {requiredAction}
                    </td>

                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        onClick={() => {
                          if (
                            meter.attentionType === 'missingMeter'
                          ) {
                            setMeterForm({
                              ...emptyMeterForm,
                              houseNumber: meter.houseNumber || '',
                              meterType: 'Water',
                              readingDate: todayISO(),
                              costPerUnit: String(WATER_UNIT_PRICE),
                            });
                          } else {
                            startNewMeterReading(meter);
                          }

                          setActiveWaterSection('readings');
                        }}
                      >
                        {meter.attentionType === 'missingMeter'
                          ? t(
                              language,
                              'Register Meter',
                              'Sajili Mita'
                            )
                          : t(
                              language,
                              'Record Reading',
                              'Weka Usomaji'
                            )}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
                            {activeWaterSection === 'summary' && (
                <div className="space-y-6 lg:col-span-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-2xl font-bold text-slate-950">
                      {t(
                        language,
                        'Water Financial Summary',
                        'Muhtasari wa Fedha za Maji'
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {t(
                        language,
                        'Actual bills, cash received, outstanding debt and tenant credit.',
                        'Ankara halisi, fedha zilizopokelewa, madeni na salio la wapangaji.'
                      )}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <p className="text-xs font-bold uppercase text-blue-700">
                          {t(language, 'Amount Billed', 'Ankara Zilizotolewa')}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-blue-950">
                          TZS {currency(totalWaterAmount)}
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                          {t(language, 'Total recorded', 'Jumla iliyorekodiwa')}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <p className="text-xs font-bold uppercase text-emerald-700">
                          {t(language, 'Cash Collected', 'Fedha Zilizopokelewa')}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-950">
                          TZS {currency(totalWaterCollected)}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          {t(language, 'Total received', 'Jumla iliyopokelewa')}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <p className="text-xs font-bold uppercase text-amber-700">
                          {t(language, 'Outstanding Debt', 'Deni Linalodaiwa')}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-amber-950">
                          TZS {currency(totalWaterOutstanding)}
                        </p>
                        <p className="mt-1 text-xs text-amber-700">
                          {t(language, 'Amount still unpaid', 'Kiasi ambacho hakijalipwa')}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                        <p className="text-xs font-bold uppercase text-cyan-700">
                          {t(language, 'Tenant Credit', 'Salio la Wapangaji')}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-cyan-950">
                          TZS {currency(totalWaterCredit)}
                        </p>
                        <p className="mt-1 text-xs text-cyan-700">
                          {t(language, 'Available tenant balance', 'Salio linalopatikana')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setActiveWaterSection('readings')}
                      className="rounded-2xl border border-red-200 bg-red-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-sm font-bold text-red-800">
                        {t(
                          language,
                          'Meter Readings Requiring Action',
                          'Usomaji wa Mita Unaohitaji Hatua'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-red-700">
                        {metersNeedingAttention.length}
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        {t(language, 'View meter readings', 'Angalia usomaji wa mita')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWaterSection('billing')}
                      className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-sm font-bold text-blue-800">
                        {t(
                          language,
                          'Bills Awaiting Payment',
                          'Ankara Zinazosubiri Malipo'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-blue-700">
                        {waterBills.filter((bill) => Number(bill.balance || 0) > 0).length}
                      </p>
                      <p className="mt-1 text-xs text-blue-600">
                        {t(language, 'View bills and payments', 'Angalia ankara na malipo')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWaterSection('alerts')}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-sm font-bold text-amber-800">
                        {t(
                          language,
                          'Water Account Alerts',
                          'Tahadhari za Akaunti za Maji'
                        )}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-amber-700">
                        {housesWithoutWaterBills.length +
                          housesWithBillsButNoPayments.length}
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        {t(language, 'View accounts requiring action', 'Angalia akaunti zinazohitaji hatua')}
                      </p>
                    </button>
                  </div>
                </div>
              )}
{activeWaterSection === 'billing' && (
  <div className="space-y-4 lg:col-span-2">
    <div className="rounded-3xl border border-blue-200 bg-white shadow-sm">
      <div className="border-b border-blue-100 bg-blue-50 px-6 py-5">
        <h3 className="text-2xl font-bold text-blue-900">
          {t(
            language,
            'Water Bills and Payments',
            'Ankara na Malipo ya Maji'
          )}
        </h3>

        <p className="mt-1 text-sm text-blue-700">
          {t(
            language,
            'Review issued water bills, amounts paid and outstanding balances.',
            'Angalia ankara za maji zilizotolewa, kiasi kilicholipwa na salio linalodaiwa.'
          )}
        </p>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase text-blue-700">
            {t(language, 'Total Billed', 'Jumla ya Ankara')}
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-950">
            TZS {currency(totalWaterAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase text-emerald-700">
            {t(language, 'Total Paid', 'Jumla Iliyolipwa')}
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-950">
            TZS {currency(totalWaterCollected)}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase text-amber-700">
            {t(language, 'Outstanding Balance', 'Salio Linalodaiwa')}
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-950">
            TZS {currency(totalWaterOutstanding)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-600">
              <th className="px-4 py-3">
                {t(language, 'House', 'Nyumba')}
              </th>
              <th className="px-4 py-3">
                {t(language, 'Tenant', 'Mpangaji')}
              </th>
              <th className="px-4 py-3">
  {t(language, 'Reading Date', 'Tarehe ya Usomaji')}
</th>

<th className="px-4 py-3">
  {t(language, 'Payment Date', 'Tarehe ya Malipo')}
</th>

<th className="px-4 py-3">
  {t(language, 'Bill Amount', 'Kiasi cha Ankara')}
</th>
              <th className="px-4 py-3">
                {t(language, 'Amount Paid', 'Kiasi Kilicholipwa')}
              </th>
              <th className="px-4 py-3">
                {t(language, 'Balance', 'Salio')}
              </th>
              <th className="px-4 py-3">
                {t(language, 'Status', 'Hali')}
              </th>
            </tr>
          </thead>

          <tbody>
            {waterBills.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {t(
                    language,
                    'No water bills have been recorded.',
                    'Hakuna ankara za maji zilizorekodiwa.'
                  )}
                </td>
              </tr>
            ) : (
              waterBills.map((bill) => {
                const billAmount = Number(
  bill.currentBillAmount ||
    bill.totalAmount ||
    bill.amount ||
    0
);

                const balance = Number(bill.balance || 0);

                const amountPaid = Math.max(
  0,
  Number(
    bill.amountPaid ??
      (billAmount - balance)
  )
);

const paymentIdsForBill = waterPaymentAllocations
  .filter(
    (allocation) =>
      String(allocation.billId || '') ===
      String(bill.id || '')
  )
  .map((allocation) =>
    String(allocation.paymentId || '')
  );

const paymentDatesForBill = waterPayments
  .filter((payment) =>
    paymentIdsForBill.includes(String(payment.id || ''))
  )
  .map(
    (payment) =>
      payment.paymentDate ||
      payment.paidAt?.slice(0, 10) ||
      payment.created_at?.slice(0, 10) ||
      ''
  )
  .filter(Boolean)
  .sort();

const latestPaymentDate =
  paymentDatesForBill.length > 0
    ? paymentDatesForBill[
        paymentDatesForBill.length - 1
      ]
    : '-';

return (
                  <tr
                    key={`water-billing-${bill.id}`}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {bill.houseNumber || '-'}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {bill.tenantName || '-'}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
  {bill.readingDate ||
    bill.billDate ||
    bill.created_at?.slice(0, 10) ||
    '-'}
</td>

<td className="px-4 py-3">
  {latestPaymentDate === '-' ? (
    <span className="font-semibold text-amber-700">
      {t(language, 'Not paid', 'Haijalipwa')}
    </span>
  ) : (
    <span className="font-semibold text-emerald-700">
      {latestPaymentDate}
    </span>
  )}
</td>

<td className="px-4 py-3 text-slate-700">
  TZS {currency(billAmount)}
</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      TZS {currency(amountPaid)}
                    </td>

                    <td className="px-4 py-3 font-semibold text-amber-700">
                      TZS {currency(balance)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          balance <= 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : amountPaid > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {balance <= 0
                          ? t(language, 'Paid', 'Imelipwa')
                          : amountPaid > 0
                            ? t(
                                language,
                                'Partly Paid',
                                'Imelipwa Sehemu'
                              )
                            : t(
                                language,
                                'Unpaid',
                                'Haijalipwa'
                              )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {balance > 0 ? (
                        <Button
                          type="button"
                          className="whitespace-nowrap bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => startWaterPayment(bill)}
                        >
                          {t(
                            language,
                            'Record Payment',
                            'Rekodi Malipo'
                          )}
                        </Button>
                      ) : (
                        <span className="font-semibold text-emerald-700">
                          {t(
                            language,
                            'Fully Paid',
                            'Imelipwa Yote'
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{activeWaterSection === 'waterFund' && (
  <div className="space-y-5 lg:col-span-2">
    <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          {t(
            language,
            'Water Expense Fund',
            'Mfuko wa Matumizi ya Maji'
          )}
        </p>

        <h3 className="mt-1 text-2xl font-bold text-slate-900">
          {t(
            language,
            'Water Fund Movement Summary',
            'Muhtasari wa Mwenendo wa Mfuko'
          )}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {t(
            language,
            'Actual collections, DAWASCO bills, paid expenses and the remaining balance.',
            'Fedha zilizokusanywa kutoka kwa wapangaji, ankara za DAWASCO, matumizi yaliyolipwa na salio lililobaki.'
          )}
        </p>
      </div>


<div className="flex flex-wrap gap-3 border-b border-emerald-100 px-6 py-4">
  <button
    type="button"
    onClick={() => {
      setIsWaterSupplierBillFormOpen((current) => !current);
      setIsWaterFundExpenseFormOpen(false);
    }}
    className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
  >
    {t(
      language,
      'Register DAWASCO Bill',
      'Sajili Ankara ya DAWASCO'
    )}
  </button>

  <button
    type="button"
    onClick={() => {
      setIsWaterFundExpenseFormOpen((current) => !current);
      setIsWaterSupplierBillFormOpen(false);
    }}
    className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
  >
    {t(
      language,
      'Record Payment or Expense',
      'Sajili Malipo au Matumizi'
    )}
  </button>
</div>

{isWaterSupplierBillFormOpen && (
  <div className="border-b border-blue-100 bg-blue-50/50 p-6">
    <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h4 className="text-xl font-bold text-blue-950">
          {t(
            language,
            'Register DAWASCO Bill',
            'Sajili Ankara ya DAWASCO'
          )}
        </h4>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            language,
            'Enter the actual bill exactly as presented by DAWASCO.',
            'Weka taarifa za ankara halisi kama ilivyowasilishwa na DAWASCO.'
          )}
        </p>
      </div>

<div className="max-w-xl">
  <Input
    label={t(
      language,
      'DAWASCO Bill Amount',
      'Kiasi cha Ankara ya DAWASCO'
    )}
    type="number"
    min="0"
    step="0.01"
    value={waterSupplierBillForm.billAmount}
    onChange={(e) =>
      setWaterSupplierBillForm((previous) => ({
        ...previous,
        billAmount: e.target.value,
      }))
    }
    placeholder={t(
      language,
      'Enter the amount shown on the bill',
      'Weka kiasi kilichoandikwa kwenye ankara'
    )}
  />
</div>

<div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
  <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
    <div>
      <p className="text-xs text-slate-500">
        {t(language, 'Control Number', 'Namba ya Malipo')}
      </p>
      <p className="mt-1 font-bold text-slate-900">
        {waterSupplierBillForm.controlNumber}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {t(language, 'Bill Date', 'Tarehe ya Ankara')}
      </p>
      <p className="mt-1 font-bold text-slate-900">
        {waterSupplierBillForm.billDate}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {t(
          language,
          'Payment Deadline',
          'Mwisho wa Malipo'
        )}
      </p>
      <p className="mt-1 font-bold text-slate-900">
        {waterSupplierBillForm.dueDate}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {t(
          language,
          'Period Start',
          'Mwanzo wa Kipindi'
        )}
      </p>
      <p className="mt-1 font-bold text-slate-900">
        {waterSupplierBillForm.billingPeriodStart}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {t(
          language,
          'Period End',
          'Mwisho wa Kipindi'
        )}
      </p>
      <p className="mt-1 font-bold text-slate-900">
        {waterSupplierBillForm.billingPeriodEnd}
      </p>
    </div>
  </div>

  <button
    type="button"
    onClick={() =>
      setShowDawascoBillDetails((current) => !current)
    }
    className="mt-4 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-800"
  >
    {showDawascoBillDetails
      ? t(
          language,
          'Hide Date Details',
          'Funga Taarifa za Tarehe'
        )
      : t(
          language,
          'Edit Dates and Notes',
          'Hariri Tarehe na Maelezo'
        )}
  </button>
</div>

{showDawascoBillDetails && (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Input
        label={t(
          language,
          'Bill Date',
          'Tarehe ya Ankara'
        )}
        type="date"
        value={waterSupplierBillForm.billDate}
        onChange={(e) =>
          setWaterSupplierBillForm((previous) => ({
            ...previous,
            billDate: e.target.value,
          }))
        }
      />

      <Input
        label={t(
          language,
          'Payment Deadline',
          'Tarehe ya Mwisho ya Malipo'
        )}
        type="date"
        value={waterSupplierBillForm.dueDate}
        onChange={(e) =>
          setWaterSupplierBillForm((previous) => ({
            ...previous,
            dueDate: e.target.value,
          }))
        }
      />

      <Input
        label={t(
          language,
          'Billing Period Start',
          'Mwanzo wa Kipindi cha Ankara'
        )}
        type="date"
        value={waterSupplierBillForm.billingPeriodStart}
        onChange={(e) =>
          setWaterSupplierBillForm((previous) => ({
            ...previous,
            billingPeriodStart: e.target.value,
          }))
        }
      />

      <Input
        label={t(
          language,
          'Billing Period End',
          'Mwisho wa Kipindi cha Ankara'
        )}
        type="date"
        value={waterSupplierBillForm.billingPeriodEnd}
        onChange={(e) =>
          setWaterSupplierBillForm((previous) => ({
            ...previous,
            billingPeriodEnd: e.target.value,
          }))
        }
      />
    </div>

    <div className="mt-4">
      <Textarea
        label={t(language, 'Notes', 'Maelezo')}
        rows={3}
        value={waterSupplierBillForm.notes}
        onChange={(e) =>
          setWaterSupplierBillForm((previous) => ({
            ...previous,
            notes: e.target.value,
          }))
        }
        placeholder={t(
          language,
          'Optional bill details',
          'Maelezo ya ziada kama yapo'
        )}
      />
    </div>
  </div>
)}

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setWaterSupplierBillForm({
              ...emptyWaterSupplierBillForm,
            });
            setIsWaterSupplierBillFormOpen(false);
          }}
          disabled={isSavingWaterSupplierBill}
          className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-800 disabled:opacity-50"
        >
          {t(language, 'Cancel', 'Ghairi')}
        </button>

        <button
          type="button"
          onClick={saveWaterSupplierBill}
          disabled={isSavingWaterSupplierBill}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingWaterSupplierBill
            ? t(language, 'Saving...', 'Inahifadhi...')
            : t(
                language,
                'Save DAWASCO Bill',
                'Hifadhi Ankara ya DAWASCO'
              )}
        </button>
      </div>
    </div>
  </div>
)}

{isWaterFundExpenseFormOpen && (
  <div className="border-b border-orange-100 bg-orange-50/50 p-6">
    <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h4 className="text-xl font-bold text-orange-950">
          {t(
            language,
            'Record Water Payment or Expense',
            'Sajili Malipo au Matumizi ya Maji'
          )}
        </h4>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            language,
            'Select the type of expense and record the actual amount paid.',
            'Chagua aina ya matumizi na uweke kiasi halisi kilicholipwa.'
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Select
          label={t(
            language,
            'Expense Type',
            'Aina ya Matumizi'
          )}
          value={waterFundExpenseForm.expenseType}
          onChange={(e) => {
            const expenseType = e.target.value;

            setWaterFundExpenseForm((previous) => ({
              ...previous,
              expenseType,
              supplierBillId: '',
              payee:
                expenseType === 'DAWASCO Payment'
                  ? 'DAWASCO'
                  : '',
            }));
          }}
        >
          <option value="DAWASCO Payment">
            {t(
              language,
              'DAWASCO Payment',
              'Malipo ya DAWASCO'
            )}
          </option>

          <option value="Purchased Water">
            {t(
              language,
              'Purchased Water',
              'Maji Yaliyonunuliwa'
            )}
          </option>

          <option value="Repair">
            {t(language, 'Repair', 'Matengenezo')}
          </option>

          <option value="Other">
            {t(
              language,
              'Other Water Expense',
              'Matumizi Mengine ya Maji'
            )}
          </option>
        </Select>

        {waterFundExpenseForm.expenseType ===
          'DAWASCO Payment' && (
          <Select
            label={t(
              language,
              'DAWASCO Bill Being Paid',
              'Ankara ya DAWASCO Inayolipwa'
            )}
            value={waterFundExpenseForm.supplierBillId}
            onChange={(e) => {
              const selectedBillId = e.target.value;

              const selectedBill =
                activeWaterSupplierBills.find(
                  (bill) =>
                    String(bill.id || '') ===
                    String(selectedBillId)
                );

              const amountAlreadyPaid =
                activeWaterFundExpenses
                  .filter(
                    (expense) =>
                      String(expense.supplierBillId || '') ===
                        String(selectedBillId) &&
                      String(expense.expenseType || '') ===
                        'DAWASCO Payment'
                  )
                  .reduce(
                    (total, expense) =>
                      total + Number(expense.amount || 0),
                    0
                  );

              const remainingBalance = selectedBill
                ? Math.max(
                    0,
                    Number(selectedBill.billAmount || 0) -
                      amountAlreadyPaid
                  )
                : '';

              setWaterFundExpenseForm((previous) => ({
                ...previous,
                supplierBillId: selectedBillId,
                amount:
                  remainingBalance === ''
                    ? ''
                    : String(remainingBalance),
                payee: selectedBillId
                  ? 'DAWASCO'
                  : '',
              }));
            }}
          >
            <option value="">
              {t(
                language,
                'Select an unpaid bill',
                'Chagua ankara ambayo haijamalizika'
              )}
            </option>

            {activeWaterSupplierBills
              .filter((bill) => {
                const amountPaid =
                  activeWaterFundExpenses
                    .filter(
                      (expense) =>
                        String(
                          expense.supplierBillId || ''
                        ) === String(bill.id || '') &&
                        String(
                          expense.expenseType || ''
                        ) === 'DAWASCO Payment'
                    )
                    .reduce(
                      (total, expense) =>
                        total +
                        Number(expense.amount || 0),
                      0
                    );

                return (
                  Number(bill.billAmount || 0) -
                    amountPaid >
                  0
                );
              })
              .map((bill) => {
                const amountPaid =
                  activeWaterFundExpenses
                    .filter(
                      (expense) =>
                        String(
                          expense.supplierBillId || ''
                        ) === String(bill.id || '') &&
                        String(
                          expense.expenseType || ''
                        ) === 'DAWASCO Payment'
                    )
                    .reduce(
                      (total, expense) =>
                        total +
                        Number(expense.amount || 0),
                      0
                    );

                const remainingBalance = Math.max(
                  0,
                  Number(bill.billAmount || 0) -
                    amountPaid
                );

                return (
                  <option key={bill.id} value={bill.id}>
                    {bill.billNumber || bill.billDate} — TZS{' '}
                    {currency(remainingBalance)}
                  </option>
                );
              })}
          </Select>
        )}

        <Input
          label={t(
            language,
            'Payment or Expense Date',
            'Tarehe ya Malipo au Matumizi'
          )}
          type="date"
          value={waterFundExpenseForm.expenseDate}
          onChange={(e) =>
            setWaterFundExpenseForm((previous) => ({
              ...previous,
              expenseDate: e.target.value,
            }))
          }
        />

        <Input
          label={t(language, 'Amount Paid', 'Kiasi Kilicholipwa')}
          type="number"
          min="0"
          step="0.01"
          value={waterFundExpenseForm.amount}
          onChange={(e) =>
            setWaterFundExpenseForm((previous) => ({
              ...previous,
              amount: e.target.value,
            }))
          }
          placeholder="0"
        />

        <Input
          label={t(
            language,
            'Paid To',
            'Aliyelipwa'
          )}
          value={waterFundExpenseForm.payee}
          onChange={(e) =>
            setWaterFundExpenseForm((previous) => ({
              ...previous,
              payee: e.target.value,
            }))
          }
          placeholder={
            waterFundExpenseForm.expenseType ===
            'DAWASCO Payment'
              ? 'DAWASCO'
              : t(
                  language,
                  'Person or supplier paid',
                  'Mtu au muuzaji aliyelipwa'
                )
          }
        />

        <Input
          label={t(
            language,
            'Receipt or Reference Number',
            'Namba ya Risiti au Kumbukumbu'
          )}
          value={waterFundExpenseForm.referenceNumber}
          onChange={(e) =>
            setWaterFundExpenseForm((previous) => ({
              ...previous,
              referenceNumber: e.target.value,
            }))
          }
          placeholder={t(
            language,
            'Optional',
            'Si lazima'
          )}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label={t(language, 'Notes', 'Maelezo')}
          rows={3}
          value={waterFundExpenseForm.notes}
          onChange={(e) =>
            setWaterFundExpenseForm((previous) => ({
              ...previous,
              notes: e.target.value,
            }))
          }
          placeholder={
            waterFundExpenseForm.expenseType ===
            'Purchased Water'
              ? t(
                  language,
                  'For example: water purchased after DAWASCO supply stopped',
                  'Mfano: maji yaliyonunuliwa baada ya huduma ya DAWASCO kukatika'
                )
              : t(
                  language,
                  'Optional expense details',
                  'Maelezo ya ziada kama yapo'
                )
          }
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setWaterFundExpenseForm({
              ...emptyWaterFundExpenseForm,
            });
            setIsWaterFundExpenseFormOpen(false);
          }}
          disabled={isSavingWaterFundExpense}
          className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-800 disabled:opacity-50"
        >
          {t(language, 'Cancel', 'Ghairi')}
        </button>

        <button
          type="button"
          onClick={saveWaterFundExpense}
          disabled={isSavingWaterFundExpense}
          className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingWaterFundExpense
            ? t(language, 'Saving...', 'Inahifadhi...')
            : t(
                language,
                'Save Payment or Expense',
                'Hifadhi Malipo au Matumizi'
              )}
        </button>
      </div>
    </div>
  </div>
)}

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-bold uppercase text-blue-700">
            {t(
              language,
              'Collections This Month',
              'Makusanyo ya Mwezi Huu'
            )}
          </p>
          <p className="mt-3 text-3xl font-bold text-blue-950">
            TZS {currency(waterCollectedThisMonth)}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            {t(
              language,
              'Money actually received from tenants',
              'Fedha zilizopokelewa kutoka kwa wapangaji'
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-bold uppercase text-orange-700">
            {t(
              language,
              'DAWASCO Bills This Month',
              'Ankara za DAWASCO Mwezi Huu'
            )}
          </p>
          <p className="mt-3 text-3xl font-bold text-orange-950">
            TZS {currency(dawascoBillsThisMonth)}
          </p>
          <p className="mt-1 text-xs text-orange-700">
            {t(
              language,
              'Actual bills presented',
              'Ankara halisi zilizowasilishwa'
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-bold uppercase text-red-700">
            {t(
              language,
              'Expenses Paid This Month',
              'Matumizi Yaliyolipwa Mwezi Huu'
            )}
          </p>
          <p className="mt-3 text-3xl font-bold text-red-950">
            TZS {currency(waterExpensesPaidThisMonth)}
          </p>
          <p className="mt-1 text-xs text-red-700">
            {t(
              language,
              'DAWASCO, purchased water, repairs and other costs',
              'DAWASCO, maji yaliyonunuliwa, matengenezo na matumizi mengine'
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-6 pb-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
          <h4 className="font-bold uppercase text-blue-800">
            {t(
              language,
              'Money Received This Month',
              'Fedha Zilizoingia Mwezi Huu'
            )}
          </h4>

          <div className="mt-4 space-y-3">
            {waterPaymentsThisMonth.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t(
                  language,
                  'No tenant payment received this month.',
                  'Hakuna malipo ya mpangaji yaliyopokelewa mwezi huu.'
                )}
              </p>
            ) : (
              waterPaymentsThisMonth.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between gap-3 border-b border-blue-100 pb-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {payment.tenantName || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.houseNumber || '-'} ·{' '}
                      {payment.paymentDate || '-'}
                    </p>
                  </div>

                  <p className="font-bold text-blue-900">
                    TZS {currency(payment.amountReceived)}
                  </p>
                </div>
              ))
            )}

            <div className="flex justify-between border-t border-blue-200 pt-3 font-bold text-blue-950">
              <span>
                {t(language, 'Total Received', 'Jumla Iliyoingia')}
              </span>
              <span>TZS {currency(waterCollectedThisMonth)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
          <h4 className="font-bold uppercase text-orange-800">
            {t(
              language,
              'Bills and Expenses This Month',
              'Ankara na Matumizi ya Mwezi Huu'
            )}
          </h4>

          <div className="mt-4 space-y-4">
            {supplierBillsThisMonth.length === 0 &&
            waterExpensesThisMonth.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t(
                  language,
                  'No bill or expense has been recorded this month.',
                  'Hakuna ankara au matumizi yaliyosajiliwa mwezi huu.'
                )}
              </p>
            ) : (
              <>
                {supplierBillsThisMonth.map((bill) => {
                  const amountPaid = activeWaterFundExpenses
                    .filter(
                      (expense) =>
                        String(expense.supplierBillId || '') ===
                          String(bill.id || '') &&
                        String(expense.expenseType || '') ===
                          'DAWASCO Payment'
                    )
                    .reduce(
                      (total, expense) =>
                        total + Number(expense.amount || 0),
                      0
                    );

                  const billBalance = Math.max(
                    0,
                    Number(bill.billAmount || 0) - amountPaid
                  );

                  return (
                    <div
                      key={bill.id}
                      className="rounded-xl border border-orange-200 bg-white p-3 text-sm"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            DAWASCO
                            {bill.billNumber
                              ? ` — ${bill.billNumber}`
                              : ''}
                          </p>
                          <p className="text-xs text-slate-500">
                            {bill.billDate || '-'}
                          </p>
                        </div>

                        <p className="font-bold text-orange-900">
                          TZS {currency(bill.billAmount)}
                        </p>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <p className="text-emerald-700">
                          {t(language, 'Paid', 'Imelipwa')}:{' '}
                          <strong>TZS {currency(amountPaid)}</strong>
                        </p>
                        <p className="text-red-700">
                          {t(language, 'Balance', 'Salio')}:{' '}
                          <strong>TZS {currency(billBalance)}</strong>
                        </p>
                      </div>
                    </div>
                  );
                })}

                {waterExpensesThisMonth
                  .filter(
                    (expense) =>
                      String(expense.expenseType || '') !==
                      'DAWASCO Payment'
                  )
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-start justify-between gap-3 border-b border-orange-100 pb-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {expense.expenseType === 'Purchased Water'
                            ? t(
                                language,
                                'Purchased Water',
                                'Maji Yaliyonunuliwa'
                              )
                            : expense.expenseType === 'Repair'
                              ? t(
                                  language,
                                  'Repairs',
                                  'Matengenezo'
                                )
                              : t(
                                  language,
                                  'Other Expense',
                                  'Matumizi Mengine'
                                )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {expense.payee || '-'} ·{' '}
                          {expense.expenseDate || '-'}
                        </p>
                      </div>

                      <p className="font-bold text-orange-900">
                        TZS {currency(expense.amount)}
                      </p>
                    </div>
                  ))}
              </>
            )}

            <div className="flex justify-between border-t border-orange-200 pt-3 font-bold text-orange-950">
              <span>
                {t(
                  language,
                  'Total Expenses Paid',
                  'Jumla ya Matumizi Yaliyolipwa'
                )}
              </span>
              <span>TZS {currency(waterExpensesPaidThisMonth)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
          <h4 className="font-bold uppercase text-emerald-800">
            {t(
              language,
              'Water Fund Balance',
              'Salio la Mfuko wa Maji'
            )}
          </h4>

          <div className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-700">
                {t(language, 'Available Cash', 'Fedha Iliyopo')}
              </span>
              <strong
                className={
                  availableWaterCash >= 0
                    ? 'text-emerald-800'
                    : 'text-red-700'
                }
              >
                TZS {currency(availableWaterCash)}
              </strong>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-700">
                {t(
                  language,
                  'Unpaid DAWASCO Bills',
                  'Deni la DAWASCO'
                )}
              </span>
              <strong className="text-red-700">
                TZS {currency(unpaidDawascoBalance)}
              </strong>
            </div>

            <div className="border-t border-emerald-200 pt-4">
              <div className="flex justify-between gap-3 text-lg">
                <span className="font-bold text-emerald-950">
                  {t(language, 'Real Balance', 'Salio Halisi')}
                </span>
                <strong
                  className={
                    realWaterFundBalance >= 0
                      ? 'text-emerald-800'
                      : 'text-red-700'
                  }
                >
                  TZS {currency(realWaterFundBalance)}
                </strong>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {realWaterFundBalance >= 0
                  ? t(
                      language,
                      'This amount remains available for future water expenses.',
                      'Kiasi hiki kinabaki kwa matumizi ya maji yajayo.'
                    )
                  : t(
                      language,
                      'This shortage will be carried forward.',
                      'Upungufu huu utaendelea kuonekana hadi utakapofidiwa.'
                    )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
              {activeWaterSection === 'alerts' && (
  <div className="space-y-4 lg:col-span-2">
    <div className="rounded-3xl border border-amber-200 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-amber-50 px-6 py-5">
        <h3 className="text-2xl font-bold text-amber-900">
          {t(
            language,
            'Water Account Alerts',
            'Tahadhari za Akaunti za Maji'
          )}
        </h3>

        <p className="mt-1 text-sm text-amber-700">
          {t(
            language,
            'Occupied houses requiring attention on water billing or payments.',
            'Nyumba zenye wapangaji zinazohitaji hatua kuhusu ankara au malipo ya maji.'
          )}
        </p>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-red-200">
          <div className="bg-red-50 px-4 py-3">
            <p className="font-bold text-red-800">
              {t(
                language,
                'Occupied Houses Without Water Bills',
                'Nyumba Zenye Wapangaji Bila Ankara za Maji'
              )}
            </p>

            <p className="mt-1 text-sm text-red-600">
              {housesWithoutWaterBills.length}{' '}
              {t(language, 'accounts', 'akaunti')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-600">
                  <th className="px-4 py-3">
                    {t(language, 'House', 'Nyumba')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Tenant', 'Mpangaji')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Required Action', 'Hatua Inayohitajika')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {housesWithoutWaterBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      {t(
                        language,
                        'All occupied houses have water bills.',
                        'Nyumba zote zenye wapangaji zina ankara za maji.'
                      )}
                    </td>
                  </tr>
                ) : (
                  housesWithoutWaterBills.map((house) => (
                    <tr
                      key={`without-water-bill-${house.id}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {house.houseNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {house.tenantName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          {t(language, 'Create bill', 'Tengeneza ankara')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amber-200">
          <div className="bg-amber-50 px-4 py-3">
            <p className="font-bold text-amber-800">
              {t(
                language,
                'Outstanding Bills Without Payments',
                'Ankara Zenye Deni Bila Malipo'
              )}
            </p>

            <p className="mt-1 text-sm text-amber-600">
              {housesWithBillsButNoPayments.length}{' '}
              {t(language, 'accounts', 'akaunti')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-600">
                  <th className="px-4 py-3">
                    {t(language, 'House', 'Nyumba')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Tenant', 'Mpangaji')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Required Action', 'Hatua Inayohitajika')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {housesWithBillsButNoPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      {t(
                        language,
                        'No unpaid water account is without a payment record.',
                        'Hakuna akaunti yenye deni la maji isiyo na rekodi ya malipo.'
                      )}
                    </td>
                  </tr>
                ) : (
                  housesWithBillsButNoPayments.map((house) => (
                    <tr
                      key={`without-water-payment-${house.id}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {house.houseNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {house.tenantName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          {t(language, 'Follow up payment', 'Fuatilia malipo')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

                            )}

{activeWaterSection === 'utilitySms' && (
  <div className="space-y-5 lg:col-span-2">
    <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm">
      <div className="border-b border-cyan-100 bg-cyan-50 px-6 py-5">
        <h3 className="text-2xl font-bold text-cyan-950">
          Vikumbusho vya Maji na Service Charge
        </h3>

        <p className="mt-1 text-sm leading-6 text-cyan-700">
          Mfumo unatayarisha ujumbe mmoja unaounganisha
          ankara ya maji, usomaji wa mita na Service Charge
          ya mwezi.
        </p>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold text-amber-900">
            Kumbukumbu ya Mmiliki
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Tarehe 20 ya kila mwezi: andaa taarifa za
            Service Charge na jiandae kusoma mita.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-bold text-blue-900">
            Ratiba ya Usomaji
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Tarehe 22 ya kila mwezi: ingiza usomaji wa mita.
            Mfumo utaweka siku tatu za malipo na kuandaa SMS.
          </p>
        </div>
      </div>

      <div className="border-t border-cyan-100 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-900">
              Tuma Vikumbusho Vinavyotakiwa Leo
            </p>

            <p className="mt-1 text-sm text-slate-600">
              SMS zitatumwa kupitia SIM 2 kwa vikumbusho
              ambavyo tarehe yake imefika.
            </p>
          </div>

          <Button
            type="button"
            className="bg-cyan-700"
            onClick={sendDueUtilitySmsReminders}
          >
            Tuma Vikumbusho vya Leo
          </Button>
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm">
      <div className="border-b border-violet-100 bg-violet-50 px-6 py-5">
        <h3 className="text-xl font-bold text-violet-950">
          Foleni ya Kudumu ya Vikumbusho
        </h3>

        <p className="mt-1 text-sm leading-6 text-violet-700">
          Ujumbe ulioandaliwa, uliotumwa au ulioshindikana
          utaendelea kuhifadhiwa hapa.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">
              Jumla
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {utilitySmsReminders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">
              Zinasubiri
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-900">
              {
                utilitySmsReminders.filter(
                  (reminder) =>
                    reminder.status === 'Pending' ||
                    reminder.status === 'Processing'
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">
              Zimetumwa
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-900">
              {
                utilitySmsReminders.filter(
                  (reminder) =>
                    reminder.status === 'Sent' ||
                    reminder.status === 'Delivered'
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Zimeshindikana
            </p>

            <p className="mt-2 text-2xl font-bold text-red-900">
              {
                utilitySmsReminders.filter(
                  (reminder) =>
                    reminder.status === 'Failed'
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {utilitySmsReminders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="font-bold text-slate-700">
              Bado hakuna kikumbusho kilichoandaliwa
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Vikumbusho vitaonekana hapa baada ya kuhifadhi
              usomaji mpya wa mita kwa mpangaji mwenye namba
              ya simu.
            </p>
          </div>
        ) : (
          [...utilitySmsReminders]
            .sort(
              (first, second) =>
                new Date(
                  second.scheduledDate ||
                    second.created_at ||
                    0
                ).getTime() -
                new Date(
                  first.scheduledDate ||
                    first.created_at ||
                    0
                ).getTime()
            )
            .map((reminder) => (
              <div
                key={reminder.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="flex flex-col gap-3 bg-slate-900 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                      {reminder.reminderType}
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {reminder.houseNumber || '-'}
                      {' — '}
                      {reminder.tenantName || 'Mteja'}
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {reminder.phoneNumber || 'Hakuna namba ya simu'}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      reminder.status === 'Sent' ||
                      reminder.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : reminder.status === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : reminder.status === 'Cancelled'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reminder.status}
                  </span>
                </div>

                <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Tarehe ya Kutumwa
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {reminder.scheduledDate || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Mwisho wa Malipo
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {reminder.dueDate || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Malipo Yaliyopokelewa
                    </p>

                    <p className="mt-1 font-bold text-emerald-700">
                      TZS{' '}
                      {currency(
                        Number(
                          reminder.amountReceived || 0
                        )
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Salio
                    </p>

                    <p className="mt-1 font-bold text-red-700">
                      TZS{' '}
                      {currency(
                        Number(
                          reminder.totalBalance || 0
                        )
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ujumbe
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {reminder.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {[
                      'Pending',
                      'Failed',
                    ].includes(
                      reminder.status
                    ) && (
                      <>
                        <Button
                          type="button"
                          className="bg-cyan-700"
                          onClick={() =>
                            sendSingleUtilitySmsReminder(
                              reminder
                            )
                          }
                        >
                          {reminder.scheduledDate &&
                          reminder.scheduledDate >
                            todayISO()
                            ? 'Tuma Mapema'
                            : 'Tuma Hiki Pekee'}
                        </Button>

                        <Button
                          type="button"
                          className="bg-emerald-700"
                          onClick={() =>
                            markUtilitySmsReminderManuallySent(
                              reminder
                            )
                          }
                        >
                          Nimetuma Mwenyewe
                        </Button>
                      </>
                    )}

                    <Button
                      type="button"
                      className="bg-slate-700"
                      onClick={() =>
                        copyUtilitySmsReminderMessage(
                          reminder
                        )
                      }
                    >
                      Nakili Ujumbe
                    </Button>
                  </div>

                  {reminder.failureReason && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      Sababu ya kushindikana:{' '}
                      {reminder.failureReason}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  </div>
)}

{activeWaterSection === 'utilityReports' && (
  <div className="lg:col-span-2">
    <ReportsSection
      language={language}
      reportScope="water"
      houses={houses}
      meters={meters}
      waterMeters={waterMeters}
      waterBills={waterBills}
      waterPayments={waterPayments}
      waterPaymentAllocations={waterPaymentAllocations}
      waterSupplierBills={waterSupplierBills}
      waterFundExpenses={waterFundExpenses}
      totalUnitsUsed={totalUnitsUsed}
      totalWaterAmount={totalWaterAmount}
      totalDiscount={totalDiscount}
      onNewMeterReading={startNewMeterReading}
      onStartWaterPayment={startWaterPayment}
      onEditWaterSupplierBill={startEditingWaterSupplierBill}
      onCancelWaterSupplierBill={cancelWaterSupplierBill}
      onEditWaterFundExpense={startEditingWaterFundExpense}
      onReverseWaterFundExpense={reverseWaterFundExpense}
    />
  </div>
)}

{activeWaterSection === 'readings' && (
            <Card className="lg:col-span-2 overflow-hidden">
              <CardHeader className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50">
  <CardTitle>
    {hasExistingMeter
      ? t(
          language,
          'Record Monthly Meter Reading',
          'Weka Usomaji wa Mita wa Mwezi'
        )
      : t(
          language,
          'Register Meter and First Reading',
          'Sajili Mita na Usomaji wa Kwanza'
        )}
  </CardTitle>

  <p className="mt-1 text-sm text-slate-600">
    {hasExistingMeter
      ? t(
          language,
          'The registered meter and previous reading are retrieved automatically.',
          'Mita iliyosajiliwa na usomaji uliopita vinapatikana moja kwa moja.'
        )
      : t(
          language,
          'Select a house, enter its meter number and opening reading once.',
          'Chagua nyumba, weka namba ya mita na usomaji wa kuanzia mara moja tu.'
        )}
  </p>
</CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                <Select
  label={t(language, 'House / Tenant', 'Nyumba / Mpangaji')}
  value={meterForm.houseNumber}
  onChange={(e) => {
  const selectedHouseNumber = e.target.value;

 const permanentMeter = waterMeters.find(
  (meter) =>
    String(meter.houseNumber || '') ===
      String(selectedHouseNumber || '') &&
    meter.active !== false
);

const latestLegacyMeter = meters
  .filter(
    (meter) =>
      String(meter.houseNumber || '') ===
      String(selectedHouseNumber || '')
  )
  .sort(
    (a, b) =>
      new Date(b.readingDate || b.created_at || 0).getTime() -
      new Date(a.readingDate || a.created_at || 0).getTime()
  )[0];

const latestMeter = permanentMeter
  ? {
      ...permanentMeter,
      currentUnits: permanentMeter.lastReading,
      readingDate: permanentMeter.lastReadingDate,
    }
  : latestLegacyMeter;

  setMeterForm((p) => ({
  ...p,
  id: '',
  houseNumber: selectedHouseNumber,
  meterType: latestMeter?.meterType || 'Water',
  meterNumber: latestMeter?.meterNumber || '',
  readingDate: todayISO(),
  paymentReceived: 'No',
  paymentDate: '',
 amountReceived: '',
previousReadingDate: latestMeter?.readingDate || '',
previousUnits:
  latestMeter?.currentUnits !== undefined &&
    latestMeter?.currentUnits !== null
      ? String(latestMeter.currentUnits)
      : '',
    currentUnits: '',
    costPerUnit: String(
      latestMeter?.costPerUnit || WATER_UNIT_PRICE
    ),
    discount: '',
    nextReadingDate: '',
    notes: '',
  }));
}}
>
  <option value="">
    {t(language, 'Select house', 'Chagua nyumba')}
  </option>

  {meterForm.houseNumber &&
  !houses.some(
    (house) =>
      String(house.houseNumber || '') ===
      String(meterForm.houseNumber || '')
  ) ? (
    <option value={meterForm.houseNumber}>
      {meterForm.houseNumber}
    </option>
  ) : null}

  {houses.map((house) => (
    <option key={house.id} value={house.houseNumber}>
      {house.houseNumber} —{' '}
      {house.tenantName ||
        t(language, 'No tenant', 'Hakuna mpangaji')}
    </option>
  ))}
</Select>{meterForm.houseNumber ? (() => {
  const selectedHouse = houses.find(
    (house) =>
      String(house.houseNumber || '') ===
      String(meterForm.houseNumber || '')
  );

return (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm">
    <span className="font-bold text-cyan-900">
      {selectedHouse?.houseNumber || meterForm.houseNumber}
    </span>

    <span className="text-slate-600">
      {selectedHouse?.tenantName ||
        t(
          language,
          'No tenant registered',
          'Hakuna mpangaji aliyesajiliwa'
        )}
    </span>

    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        String(selectedHouse?.houseStatus || '') === 'Occupied'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-200 text-slate-700'
      }`}
    >
      {String(selectedHouse?.houseStatus || '') === 'Occupied'
        ? t(language, 'Occupied', 'Ina mpangaji')
        : t(language, 'Vacant', 'Nyumba tupu')}
    </span>
  </div>
);
})() : null}
</div>

<div className="space-y-2">
  <Input
    label={t(language, 'Meter Number', 'Namba ya Mita')}
    placeholder={t(
      language,
      'Enter meter number for a new meter',
      'Weka namba ya mita mpya'
    )}
    value={meterForm.meterNumber}
    readOnly={hasExistingMeter && !meterForm.id}
    className={
      hasExistingMeter && !meterForm.id
        ? 'cursor-not-allowed bg-slate-100 font-semibold text-slate-700'
        : ''
    }
    onChange={(e) =>
      setMeterForm((p) => ({
        ...p,
        meterNumber: e.target.value.toUpperCase().replace(/\s+/g, ''),
      }))
    }
  />

  {meterForm.houseNumber ? (
    hasExistingMeter ? (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          ✓
        </span>

        <span>
          {t(
            language,
            'Existing meter retrieved automatically. Record the new reading below.',
            'Mita iliyosajiliwa imepatikana moja kwa moja. Weka usomaji mpya hapa chini.'
          )}
        </span>
      </div>
    ) : (
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
        {t(
          language,
          'No meter is registered for this house. Enter its meter number once.',
          'Hakuna mita iliyosajiliwa kwa nyumba hii. Weka namba ya mita mara moja tu.'
        )}
      </div>
    )
  ) : null}
</div>
                {(() => {
 const latestLegacyReading = meters
  .filter(
    (meter) =>
      String(meter.houseNumber || '') ===
        String(meterForm.houseNumber || '') &&
      String(meter.meterNumber || '') ===
        String(meterForm.meterNumber || '') &&
      String(meter.id || '') !== String(meterForm.id || '')
  )
  .sort(
    (a, b) =>
      new Date(b.readingDate || b.created_at || 0).getTime() -
      new Date(a.readingDate || a.created_at || 0).getTime()
  )[0];

const previousMeterReading = selectedPermanentMeter
  ? {
      ...selectedPermanentMeter,
      readingDate: selectedPermanentMeter.lastReadingDate,
      currentUnits: selectedPermanentMeter.lastReading,
    }
  : latestLegacyReading;

  const billingPeriodStart =
  meterForm.previousReadingDate ||
  previousMeterReading?.readingDate ||
  '';

  const billingPeriodEnd = meterForm.readingDate
    ? addDaysISO(meterForm.readingDate, -1)
    : '';

  return (
    <div className="space-y-3">
      <Input
  label={t(language, 'Current Reading Date', 'Tarehe ya Usomaji wa Sasa')}
  type="date"
  value={meterForm.readingDate}
  onChange={(e) =>
    setMeterForm((p) => ({
      ...p,
      readingDate: e.target.value,
      nextReadingDate: e.target.value
        ? addMonthsISO(e.target.value, 1)
        : '',
      paymentDate:
        p.paymentReceived === 'Yes'
          ? e.target.value
          : '',
    }))
  }
/>

{hasExistingMeter && (
  <div
  className={`rounded-2xl border p-4 transition ${
    meterForm.paymentReceived === 'Yes'
      ? 'border-emerald-200 bg-emerald-50'
      : 'border-amber-200 bg-amber-50'
  }`}
>
    <Select
      label={t(
        language,
        'Payment Received Now?',
        'Malipo Yamepokelewa Sasa?'
      )}
      value={meterForm.paymentReceived || 'No'}
      onChange={(e) => {
        const paymentReceived = e.target.value;

        setMeterForm((p) => ({
          ...p,
          paymentReceived,
          paymentDate:
            paymentReceived === 'Yes'
              ? p.paymentDate ||
                p.readingDate ||
                todayISO()
              : '',
          amountReceived:
            paymentReceived === 'Yes'
              ? p.amountReceived
              : '',
        }));
      }}
    >
      <option value="No">
        {t(
          language,
          'No — Save the bill as unpaid',
          'Hapana — Hifadhi ankara kama haijalipwa'
        )}
      </option>

      <option value="Yes">
        {t(
          language,
          'Yes — Record payment with this reading',
          'Ndiyo — Rekodi malipo pamoja na usomaji huu'
        )}
      </option>
    </Select>

    {meterForm.paymentReceived === 'Yes' && (
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label={t(
            language,
            'Payment Date',
            'Tarehe ya Malipo'
          )}
          type="date"
          min={meterForm.readingDate || undefined}
          value={meterForm.paymentDate || ''}
          onChange={(e) =>
            setMeterForm((p) => ({
              ...p,
              paymentDate: e.target.value,
            }))
          }
        />

        <Input
          label={t(
            language,
            'Amount Received',
            'Kiasi Kilichopokelewa'
          )}
          type="number"
          min="0"
          placeholder={t(
            language,
            'Enter the amount received',
            'Weka kiasi kilichopokelewa'
          )}
          value={meterForm.amountReceived || ''}
          onChange={(e) =>
            setMeterForm((p) => ({
              ...p,
              amountReceived: e.target.value,
            }))
          }
        />
      </div>
    )}
  </div>
)}

{hasExistingMeter && (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
    <span className="text-slate-600">
      {t(
        language,
        'Previous reading date',
        'Tarehe ya usomaji uliopita'
      )}:{' '}
      <strong className="text-slate-900">
        {billingPeriodStart || '-'}
      </strong>
    </span>

    <span className="text-slate-600">
      {t(language, 'Billing period', 'Kipindi cha ankara')}:{' '}
      <strong className="text-slate-900">
        {billingPeriodStart && billingPeriodEnd
          ? `${billingPeriodStart} — ${billingPeriodEnd}`
          : '-'}
      </strong>
    </span>

    <span className="text-slate-600">
      {t(language, 'Next reading', 'Usomaji unaofuata')}:{' '}
      <strong className="text-cyan-800">
        {meterPreviewNextReading || '-'}
      </strong>
    </span>
  </div>
)}
    </div>
  );
})()}
                
                <div
  className={`grid gap-4 ${
    hasExistingMeter ? 'md:grid-cols-2' : 'grid-cols-1'
  }`}
>

<div className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <Input
    label={
      canManuallySetPreviousReading
        ? t(
            language,
            'Previous Reading Date (Set Once)',
            'Tarehe ya Usomaji Uliopita (Weka Mara Moja)'
          )
        : t(
            language,
            'Previous Reading Date (Automatic)',
            'Tarehe ya Usomaji Uliopita (Automatic)'
          )
    }
    type="date"
    max={meterForm.readingDate || undefined}
    value={meterForm.previousReadingDate || ''}
    readOnly={!canManuallySetPreviousReading}
    className={
      canManuallySetPreviousReading
        ? 'mb-4 bg-white font-semibold text-slate-800'
        : 'mb-4 cursor-not-allowed bg-slate-200 font-semibold text-slate-800'
    }
    onChange={(e) =>
      setMeterForm((p) => ({
        ...p,
        previousReadingDate: e.target.value,
      }))
    }
  />

  <Input
    label={
  canManuallySetPreviousReading
    ? t(
        language,
        'Previous Reading (Set Once)',
        'Usomaji Uliopita (Weka Mara Moja)'
      )
    : t(
        language,
        'Previous Reading (Automatic)',
        'Usomaji Uliopita (Automatic)'
      )
}
    type="number"
value={meterForm.previousUnits}
readOnly={!canManuallySetPreviousReading}
className={
  canManuallySetPreviousReading
    ? 'bg-white font-semibold text-slate-800'
    : 'cursor-not-allowed bg-slate-200 font-semibold text-slate-800'
}
    placeholder={t(
      language,
      'Enter the first meter reading',
      'Weka usomaji wa kwanza wa mita'
    )}
    onChange={(e) =>
      setMeterForm((p) => ({
        ...p,
        previousUnits: e.target.value,
      }))
    }
  />

  <p className="mt-2 text-xs text-slate-500">
    {canManuallySetPreviousReading
  ? t(
      language,
      'Enter the reading found on the physical meter. This can be set only once.',
      'Weka usomaji uliokutwa kwenye mita halisi. Hii itawekwa mara moja tu.'
    )
  : t(
      language,
      'Retrieved automatically from the latest confirmed reading.',
      'Imechukuliwa moja kwa moja kutoka kwenye usomaji wa mwisho uliothibitishwa.'
    )}
  </p>
</div>

  <div
  className={`self-start rounded-2xl border p-4 ${
    meterForm.currentUnits !== '' &&
    Number(meterForm.currentUnits) < Number(meterForm.previousUnits || 0)
      ? 'border-red-300 bg-red-50'
      : 'border-cyan-300 bg-cyan-50'
  }`}
>
    <Input
      label={t(
        language,
        'Enter Current Reading',
        'Weka Usomaji wa Sasa'
      )}
      type="number"
      min={Number(meterForm.previousUnits || 0)}
      placeholder={t(
        language,
        'Enter current meter reading',
        'Weka usomaji wa mita wa sasa'
      )}
      value={meterForm.currentUnits}
      className="border-cyan-300 bg-white text-lg font-bold"
      onChange={(e) =>
        setMeterForm((p) => ({
          ...p,
          currentUnits: e.target.value,
        }))
      }
    />

    {meterForm.currentUnits !== '' &&
    Number(meterForm.currentUnits) < Number(meterForm.previousUnits || 0) ? (
      <p className="mt-2 text-sm font-semibold text-red-600">
        {t(
          language,
          'Current reading cannot be lower than the previous reading.',
          'Usomaji wa sasa hauwezi kuwa mdogo kuliko usomaji uliopita.'
        )}
      </p>
    ) : (
      <p className="mt-2 text-xs text-cyan-700">
        {t(
          language,
          'This is the only reading you normally need to enter each month.',
          'Huu ndio usomaji pekee unaohitaji kuingiza kila mwezi.'
        )}
      </p>
    )}
  </div>
</div>
                <Input label={t(language, 'Cost Per Unit', 'Bei kwa Unit')} type="number" placeholder="Cost per unit" value={meterForm.costPerUnit} onChange={(e) => setMeterForm((p) => ({ ...p, costPerUnit: e.target.value }))} />
                
                
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
  <button
    type="button"
    onClick={() =>
      setShowWaterOptionalFields((current) => !current)
    }
    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
  >
    <span>
      {t(
        language,
        'Optional Information',
        'Taarifa za Ziada'
      )}
    </span>

    <span className="text-lg text-slate-500">
      {showWaterOptionalFields ? '−' : '+'}
    </span>
  </button>

  {showWaterOptionalFields && (
    <div className="grid gap-4 border-t border-slate-200 bg-white p-4 md:grid-cols-2">
      <Input
        label={t(language, 'Discount', 'Punguzo')}
        type="number"
        placeholder={t(
          language,
          'Enter discount, if any',
          'Weka punguzo kama lipo'
        )}
        value={meterForm.discount}
        onChange={(e) =>
          setMeterForm((p) => ({
            ...p,
            discount: e.target.value,
          }))
        }
      />

      <Textarea
        label={t(language, 'Notes', 'Maelezo')}
        rows={2}
        placeholder={t(
          language,
          'Add notes, if any',
          'Weka maelezo kama yapo'
        )}
        value={meterForm.notes}
        onChange={(e) =>
          setMeterForm((p) => ({
            ...p,
            notes: e.target.value,
          }))
        }
      />
    </div>
  )}
</div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
    <p className="text-sm font-bold uppercase tracking-wide text-slate-900">
      {hasExistingMeter
  ? t(
      language,
      'Confirm Monthly Water Bill',
      'Thibitisha Ankara ya Maji ya Mwezi'
    )
  : t(
      language,
      'Confirm Water Meter Registration',
      'Thibitisha Usajili wa Mita ya Maji'
    )}
    </p>

    <p className="mt-1 text-sm text-slate-600">
      {t(
        language,
        'Review the automatically connected information before saving.',
        'Hakiki taarifa zilizounganishwa moja kwa moja kabla ya kuhifadhi.'
      )}
    </p>
  </div>

{hasExistingMeter ? (
  <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-sm text-slate-500">
      {t(language, 'Tenant', 'Mpangaji')}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-900">
      {houses.find(
        (house) =>
          String(house.houseNumber || '') ===
          String(meterForm.houseNumber || '')
      )?.tenantName ||
        t(language, 'No tenant', 'Hakuna mpangaji')}
    </p>
  </div>

  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
    <p className="text-sm text-cyan-700">
      {t(language, 'Units Used', 'Units Zilizotumika')}
    </p>

    <p className="mt-1 text-lg font-bold text-cyan-900">
      {meterForm.currentUnits === ''
        ? '-'
        : meterPreviewUnitsUsed}
    </p>
  </div>

  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <p className="text-sm text-blue-700">
      {t(language, 'Current Bill', 'Ankara ya Sasa')}
    </p>

    <p className="mt-1 text-lg font-bold text-blue-900">
      TZS {currency(meterPreviewTotal)}
    </p>
  </div>

  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
    <p className="text-sm text-amber-700">
      {t(
        language,
        'Previous Balance',
        'Madeni ya Nyuma'
      )}
    </p>

    <p className="mt-1 text-lg font-bold text-amber-900">
      TZS {currency(selectedMeterOutstandingBalance)}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm text-slate-500">
      {t(
        language,
        'Payment Received',
        'Malipo Yaliyopokelewa'
      )}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-900">
      TZS{' '}
      {currency(
        meterForm.paymentReceived === 'Yes'
          ? meterForm.amountReceived
          : 0
      )}
    </p>
  </div>

  <div
    className={`rounded-xl border p-4 ${
      meterForm.paymentReceived === 'Yes' &&
      Number(meterForm.amountReceived || 0) >=
        Number(selectedMeterTotalPayable || 0)
        ? 'border-emerald-300 bg-emerald-700 text-white'
        : 'border-amber-300 bg-amber-100'
    }`}
  >
    <p
      className={`text-sm ${
        meterForm.paymentReceived === 'Yes' &&
        Number(meterForm.amountReceived || 0) >=
          Number(selectedMeterTotalPayable || 0)
          ? 'text-emerald-100'
          : 'text-amber-700'
      }`}
    >
      {t(
        language,
        'Total Outstanding',
        'Jumla Inayodaiwa'
      )}
    </p>

    <p
      className={`mt-1 text-2xl font-bold ${
        meterForm.paymentReceived === 'Yes' &&
        Number(meterForm.amountReceived || 0) >=
          Number(selectedMeterTotalPayable || 0)
          ? 'text-white'
          : 'text-amber-950'
      }`}
    >
      TZS{' '}
      {currency(
        Math.max(
          0,
          Number(selectedMeterTotalPayable || 0) -
            (meterForm.paymentReceived === 'Yes'
              ? Number(meterForm.amountReceived || 0)
              : 0)
        )
      )}
    </p>

    <p
      className={`mt-2 text-xs font-bold ${
        meterForm.paymentReceived === 'Yes' &&
        Number(meterForm.amountReceived || 0) >=
          Number(selectedMeterTotalPayable || 0)
          ? 'text-emerald-100'
          : meterForm.paymentReceived === 'Yes' &&
              Number(meterForm.amountReceived || 0) > 0
            ? 'text-amber-800'
            : 'text-amber-800'
      }`}
    >
      {meterForm.paymentReceived === 'Yes' &&
      Number(meterForm.amountReceived || 0) >=
        Number(selectedMeterTotalPayable || 0)
        ? t(language, 'Paid', 'Imelipwa')
        : meterForm.paymentReceived === 'Yes' &&
            Number(meterForm.amountReceived || 0) > 0
          ? t(language, 'Partly Paid', 'Imelipwa Sehemu')
          : t(language, 'Unpaid', 'Haijalipwa')}
    </p>
  </div>
</div>
) : (
  <div className="grid gap-3 p-5 sm:grid-cols-3">
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-500">
        {t(language, 'House', 'Nyumba')}
      </p>
      <p className="mt-1 font-semibold text-slate-900">
        {meterForm.houseNumber || '-'}
      </p>
    </div>

    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-500">
        {t(language, 'Meter Number', 'Namba ya Mita')}
      </p>
      <p className="mt-1 font-semibold text-slate-900">
        {meterForm.meterNumber || '-'}
      </p>
    </div>

    <div className="rounded-xl bg-cyan-50 p-3 shadow-sm">
      <p className="text-xs text-cyan-700">
        {t(
          language,
          'Opening Reading',
          'Usomaji wa Kuanzia'
        )}
      </p>
      <p className="mt-1 text-xl font-bold text-cyan-900">
        {meterForm.previousUnits || '-'}
      </p>
    </div>
  </div>
)}

  <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-slate-600">
      {hasExistingMeter
  ? meterForm.currentUnits === ''
    ? t(
        language,
        'Enter the current reading before saving.',
        'Weka usomaji wa sasa kabla ya kuhifadhi.'
      )
    : t(
        language,
        'Saving will update the meter and create a permanent monthly bill.',
        'Kuhifadhi kutasasisha mita na kutengeneza ankara ya kudumu ya mwezi.'
      )
  : t(
      language,
      'The first bill will be created after the next meter reading.',
      'Ankara ya kwanza itatengenezwa baada ya usomaji unaofuata wa mita.'
    )}
    </p>

    <Button
  type="button"
  disabled={
    isSavingMeter ||
    !meterForm.houseNumber ||
    !meterForm.meterNumber ||
    meterForm.previousUnits === '' ||
    (hasExistingMeter &&
      (meterForm.currentUnits === '' ||
        Number(meterForm.currentUnits) <
          Number(meterForm.previousUnits || 0)))
  }
  className="min-w-[260px] bg-cyan-700 px-5 py-3 text-base font-bold hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
  onClick={async () => {
    if (isSavingMeter) return;

    setIsSavingMeter(true);

    try {
      await saveMeter();
    } finally {
      setIsSavingMeter(false);
    }
  }}
>
  {isSavingMeter
  ? t(
      language,
      'Saving Meter Information...',
      'Inahifadhi Taarifa za Mita...'
    )
  : hasExistingMeter
    ? t(
        language,
        'Save Monthly Reading & Create Bill',
        'Hifadhi Usomaji wa Mwezi na Tengeneza Ankara'
      )
    : t(
        language,
        'Register Water Meter',
        'Sajili Mita ya Maji'
      )}
</Button>
  </div>
</div>
              </CardContent>
            </Card>
              )}
          </div>
          </div>
        )}

        {activeTab === 'servicecharge' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm">
              <div className="border-b border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 px-6 py-6">
                <p className="text-sm font-bold uppercase tracking-wide text-violet-700">
                  {t(
                    language,
                    'Complete Service Charge Management System',
                    'Mfumo Kamili wa Usimamizi wa Service Charge'
                  )}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {t(
                    language,
                    'Service Charge Information',
                    'Taarifa za Service Charge'
                  )}
                </h2>

                <p className="mt-2 text-slate-600">
                  {t(
                    language,
                    'Manage monthly invoices, payments, balances, expenses, account alerts and permanent reports.',
                    'Simamia ankara za kila mwezi, malipo, salio, matumizi, tahadhari za akaunti na ripoti za kudumu.'
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="space-y-2">
                  {serviceChargeSections.map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setActiveServiceChargeSection(value)
                        }
                        className={`w-full rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                          activeServiceChargeSection === value
                            ? 'bg-violet-700 text-white shadow-md'
                            : 'bg-slate-50 text-slate-700 hover:bg-violet-50 hover:text-violet-800'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </aside>

              <main className="min-w-0">
                {activeServiceChargeSection ===
                  'summary' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                        <p className="font-bold uppercase text-blue-700">
                          {t(
                            language,
                            'Chargeable Accounts',
                            'Akaunti Zinazotozwa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-blue-950">
                          {serviceChargeEligibleHouses.length}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                        <p className="font-bold uppercase text-emerald-700">
                          {t(
                            language,
                            'Service Charge Collected',
                            'Service Charge Iliyokusanywa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-emerald-950">
                          TZS{' '}
                          {currency(
                            totalServiceChargeCollected
                          )}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                        <p className="font-bold uppercase text-amber-700">
                          {t(
                            language,
                            'Outstanding Service Charge',
                            'Service Charge Inayodaiwa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-amber-950">
                          TZS{' '}
                          {currency(
                            totalServiceChargeOutstanding
                          )}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6">
                        <p className="font-bold uppercase text-violet-700">
                          {t(
                            language,
                            'Invoices Issued',
                            'Ankara Zilizotolewa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-violet-950">
                          {activeServiceCharges.length}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
                        <p className="font-bold uppercase text-yellow-800">
                          {t(
                            language,
                            'Due Within Seven Days',
                            'Zinazofika Ndani ya Siku 7'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-yellow-950">
                          {serviceChargesDueSoon.length}
                        </p>

                        <p className="mt-2 text-sm text-yellow-800">
                          {t(
                            language,
                            'Accounts requiring an early reminder.',
                            'Akaunti zinazohitaji kukumbushwa mapema.'
                          )}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                        <p className="font-bold uppercase text-red-700">
                          {t(
                            language,
                            'Overdue Accounts',
                            'Akaunti Zilizochelewa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-red-950">
                          {overdueServiceCharges.length}
                        </p>

                        <p className="mt-2 text-sm text-red-700">
                          {t(
                            language,
                            'Accounts requiring immediate action.',
                            'Akaunti zinazohitaji hatua ya haraka.'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-950">
                        {t(
                          language,
                          'Monthly Service Charge Rule',
                          'Kanuni ya Service Charge ya Kila Mwezi'
                        )}
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <PreviewValue
                          label={t(
                            language,
                            'Invoice Date',
                            'Tarehe ya Ankara'
                          )}
                          value={t(
                            language,
                            '22nd of every month',
                            'Tarehe 22 ya kila mwezi'
                          )}
                        />

                        <PreviewValue
                          label={t(
                            language,
                            'Payment Deadline',
                            'Mwisho wa Malipo'
                          )}
                          value={t(
                            language,
                            '25th of every month',
                            'Tarehe 25 ya kila mwezi'
                          )}
                        />

                        <PreviewValue
                          label={t(
                            language,
                            'Standard Amount',
                            'Kiasi cha Kawaida'
                          )}
                          value={`TZS ${currency(
                            DEFAULT_SERVICE_CHARGE
                          )}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeServiceChargeSection ===
                  'invoices' && (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm">
                      <div className="border-b border-violet-200 bg-violet-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-violet-950">
                          {t(
                            language,
                            'Prepare Monthly Service Charge Invoices',
                            'Andaa Ankara za Service Charge za Mwezi'
                          )}
                        </h3>

                        <p className="mt-2 text-violet-700">
                          {t(
                            language,
                            'One invoice will be prepared for every eligible occupied house. Existing invoices will not be duplicated.',
                            'Ankara moja itaandaliwa kwa kila nyumba inayostahili kutozwa. Ankara zilizopo hazitarudiwa.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <Input
                          label={t(
                            language,
                            'Service Charge Month',
                            'Mwezi wa Service Charge'
                          )}
                          type="month"
                          value={
                            serviceChargeInvoicePreparationForm.chargeMonth
                          }
                          onChange={(event) =>
                            setServiceChargeInvoicePreparationForm(
                              {
                                chargeMonth:
                                  event.target.value,
                              }
                            )
                          }
                        />

                        <Button
                          type="button"
                          className="bg-violet-700 px-6 py-3"
                          disabled={
                            isPreparingServiceChargeInvoices
                          }
                          onClick={
                            prepareMonthlyServiceChargeInvoices
                          }
                        >
                          {isPreparingServiceChargeInvoices
                            ? t(
                                language,
                                'Preparing Invoices...',
                                'Inaandaa Ankara...'
                              )
                            : t(
                                language,
                                'Prepare Monthly Invoices',
                                'Andaa Ankara za Mwezi'
                              )}
                        </Button>
                      </div>

                      <div className="border-t border-violet-100 bg-slate-50 px-6 py-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <PreviewValue
                            label={t(
                              language,
                              'Invoice Date',
                              'Tarehe ya Ankara'
                            )}
                            value={t(
                              language,
                              '22nd of the selected month',
                              'Tarehe 22 ya mwezi uliochaguliwa'
                            )}
                          />

                          <PreviewValue
                            label={t(
                              language,
                              'Payment Deadline',
                              'Mwisho wa Malipo'
                            )}
                            value={t(
                              language,
                              '25th of the selected month',
                              'Tarehe 25 ya mwezi uliochaguliwa'
                            )}
                          />

                          <PreviewValue
                            label={t(
                              language,
                              'Standard Charge',
                              'Kiasi cha Kawaida'
                            )}
                            value={`TZS ${currency(
                              DEFAULT_SERVICE_CHARGE
                            )}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                      <div className="border-b border-purple-200 bg-purple-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-purple-950">
                          {t(
                            language,
                            'Correct Service Charge Invoice',
                            'Sahihisha Ankara ya Service Charge'
                          )}
                        </h3>

                        <p className="mt-2 text-sm text-purple-700">
                          {t(
                            language,
                            'Correct an amount or date without deleting the original history.',
                            'Sahihisha kiasi au tarehe bila kufuta historia ya awali.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 md:grid-cols-2">
                        <Select
                          label={t(
                            language,
                            'Invoice to Correct',
                            'Ankara ya Kusahihisha'
                          )}
                          value={
                            serviceChargeCorrectionForm.recordId
                          }
                          onChange={(event) => {
                            const selectedInvoice =
                              activeServiceCharges.find(
                                (service) =>
                                  String(service.id) ===
                                  String(event.target.value)
                              );

                            if (!selectedInvoice) {
                              setServiceChargeCorrectionForm({
                                ...emptyServiceChargeCorrectionForm,
                              });
                              return;
                            }

                            setServiceChargeCorrectionForm({
                              ...emptyServiceChargeCorrectionForm,
                              recordType: 'Invoice',
                              recordId:
                                selectedInvoice.id,
                              correctedAmount:
                                formatAmountInput(
                                  String(
                                    selectedInvoice.serviceChargeAmount ||
                                      0
                                  )
                                ),
                              correctedDate:
                                selectedInvoice.invoiceDate ||
                                todayISO(),
                              correctedDueDate:
                                selectedInvoice.dueDate ||
                                selectedInvoice.nextPaymentDate ||
                                '',
                            });
                          }}
                        >
                          <option value="">
                            {t(
                              language,
                              'Select invoice',
                              'Chagua ankara'
                            )}
                          </option>

                          {activeServiceCharges.map(
                            (service) => (
                              <option
                                key={service.id}
                                value={service.id}
                              >
                                {service.houseNumber || '-'} —{' '}
                                {service.tenantName ||
                                  t(
                                    language,
                                    'Occupant',
                                    'Mkazi'
                                  )}{' '}
                                —{' '}
                                {service.chargeMonth || '-'} — TZS{' '}
                                {currency(
                                  service.serviceChargeAmount ||
                                    0
                                )}
                              </option>
                            )
                          )}
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Correct Invoice Amount',
                            'Kiasi Sahihi cha Ankara'
                          )}
                          type="text"
                          inputMode="numeric"
                          placeholder="Mfano: 5,000"
                          value={
                            serviceChargeCorrectionForm.correctedAmount
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedAmount:
                                  formatAmountInput(
                                    event.target.value
                                  ),
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Correct Invoice Date',
                            'Tarehe Sahihi ya Ankara'
                          )}
                          type="date"
                          value={
                            serviceChargeCorrectionForm.correctedDate
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedDate:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Correct Payment Deadline',
                            'Mwisho Sahihi wa Malipo'
                          )}
                          type="date"
                          value={
                            serviceChargeCorrectionForm.correctedDueDate
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedDueDate:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <div className="md:col-span-2">
                          <Textarea
                            label={t(
                              language,
                              'Reason for Correction',
                              'Sababu ya Marekebisho'
                            )}
                            rows={3}
                            placeholder={t(
                              language,
                              'Explain what was entered incorrectly.',
                              'Eleza taarifa gani iliingizwa kimakosa.'
                            )}
                            value={
                              serviceChargeCorrectionForm.reason
                            }
                            onChange={(event) =>
                              setServiceChargeCorrectionForm(
                                (previous) => ({
                                  ...previous,
                                  reason:
                                    event.target.value,
                                })
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-purple-100 bg-purple-50 px-6 py-5">
                        <Button
                          type="button"
                          className="bg-purple-700 px-6 py-3"
                          disabled={
                            isSavingServiceChargeCorrection ||
                            !serviceChargeCorrectionForm.recordId
                          }
                          onClick={
                            correctPermanentServiceChargeInvoice
                          }
                        >
                          {isSavingServiceChargeCorrection
                            ? t(
                                language,
                                'Saving Correction...',
                                'Inahifadhi Marekebisho...'
                              )
                            : t(
                                language,
                                'Save Invoice Correction',
                                'Hifadhi Marekebisho ya Ankara'
                              )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 px-6 py-5">
                        <h3 className="text-xl font-bold text-slate-950">
                          {t(
                            language,
                            'Permanent Service Charge Invoice Register',
                            'Rejesta ya Kudumu ya Ankara za Service Charge'
                          )}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {t(
                            language,
                            'Every monthly invoice and its current payment position are preserved here.',
                            'Kila ankara ya mwezi na hali yake ya malipo vinahifadhiwa hapa.'
                          )}
                        </p>
                      </div>

                      {activeServiceCharges.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'No Service Charge invoice has been prepared yet.',
                            'Bado hakuna ankara ya Service Charge iliyoandaliwa.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {activeServiceCharges.map(
                            (service) => {
                              const invoiceAmount = Number(
                                service.serviceChargeAmount ||
                                  0
                              );

                              const amountPaid = Number(
                                service.amountPaid || 0
                              );

                              const invoiceBalance = Number(
                                service.balance ??
                                  Math.max(
                                    0,
                                    invoiceAmount -
                                      amountPaid
                                  )
                              );

                              return (
                                <div
                                  key={service.id}
                                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-center"
                                >
                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {service.houseNumber ||
                                        '-'}{' '}
                                      —{' '}
                                      {service.tenantName ||
                                        t(
                                          language,
                                          'No occupant name',
                                          'Hakuna jina la mkazi'
                                        )}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {t(
                                        language,
                                        'Charge month',
                                        'Mwezi wa malipo'
                                      )}
                                      :{' '}
                                      {service.chargeMonth ||
                                        '-'}
                                    </p>
                                  </div>

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Invoice Amount',
                                      'Kiasi cha Ankara'
                                    )}
                                    value={`TZS ${currency(
                                      invoiceAmount
                                    )}`}
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Amount Paid',
                                      'Kiasi Kilicholipwa'
                                    )}
                                    value={`TZS ${currency(
                                      amountPaid
                                    )}`}
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Balance',
                                      'Salio'
                                    )}
                                    value={`TZS ${currency(
                                      invoiceBalance
                                    )}`}
                                  />

                                  <div>
                                    <span
                                      className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                        invoiceBalance <= 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : amountPaid > 0
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {invoiceBalance <= 0
                                        ? t(
                                            language,
                                            'Paid',
                                            'Imelipwa'
                                          )
                                        : amountPaid > 0
                                          ? t(
                                              language,
                                              'Partially Paid',
                                              'Imelipwa Sehemu'
                                            )
                                          : t(
                                              language,
                                              'Unpaid',
                                              'Haijalipwa'
                                            )}
                                    </span>

                                    <p className="mt-2 text-xs text-slate-500">
                                      {t(
                                        language,
                                        'Due',
                                        'Mwisho'
                                      )}
                                      :{' '}
                                      {service.dueDate ||
                                        service.nextPaymentDate ||
                                        '-'}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeServiceChargeSection ===
                  'payments' && (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
                      <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-emerald-950">
                          {t(
                            language,
                            'Record Service Charge Payment',
                            'Sajili Malipo ya Service Charge'
                          )}
                        </h3>

                        <p className="mt-2 text-emerald-700">
                          {t(
                            language,
                            'Select the house and enter the amount received. The system will clear the oldest invoice first and preserve any excess as future credit.',
                            'Chagua nyumba na uweke kiasi kilichopokelewa. Mfumo utalipa ankara ya zamani kwanza na kuhifadhi fedha iliyozidi kama salio la mbele.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 md:grid-cols-2">
                        <Select
                          label={t(
                            language,
                            'House / Occupant',
                            'Nyumba / Mkazi'
                          )}
                          value={
                            serviceChargePaymentForm.houseId
                          }
                          onChange={(event) =>
                            setServiceChargePaymentForm(
                              (previous) => ({
                                ...previous,
                                houseId:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="">
                            {t(
                              language,
                              'Select house',
                              'Chagua nyumba'
                            )}
                          </option>

                          {serviceChargeEligibleHouses.map(
                            (house) => (
                              <option
                                key={house.id}
                                value={house.id}
                              >
                                {house.houseNumber} —{' '}
                                {house.tenantName ||
                                  t(
                                    language,
                                    'Occupant',
                                    'Mkazi'
                                  )}
                              </option>
                            )
                          )}
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Amount Received',
                            'Kiasi Kilichopokelewa'
                          )}
                          type="text"
                          inputMode="numeric"
                          placeholder="Mfano: 5,000"
                          value={
                            serviceChargePaymentForm.amountReceived
                          }
                          onChange={(event) =>
                            setServiceChargePaymentForm(
                              (previous) => ({
                                ...previous,
                                amountReceived:
                                  formatAmountInput(
                                    event.target.value
                                  ),
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Payment Date',
                            'Tarehe ya Malipo'
                          )}
                          type="date"
                          value={
                            serviceChargePaymentForm.paymentDate
                          }
                          onChange={(event) =>
                            setServiceChargePaymentForm(
                              (previous) => ({
                                ...previous,
                                paymentDate:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Select
                          label={t(
                            language,
                            'Payment Method',
                            'Njia ya Malipo'
                          )}
                          value={
                            serviceChargePaymentForm.paymentMethod
                          }
                          onChange={(event) =>
                            setServiceChargePaymentForm(
                              (previous) => ({
                                ...previous,
                                paymentMethod:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="Cash">
                            {t(
                              language,
                              'Cash',
                              'Fedha Taslimu'
                            )}
                          </option>

                          <option value="Mobile Money">
                            Mobile Money
                          </option>

                          <option value="Bank">
                            {t(
                              language,
                              'Bank',
                              'Benki'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Receipt or Reference Number',
                            'Namba ya Risiti au Kumbukumbu'
                          )}
                          placeholder={t(
                            language,
                            'Optional',
                            'Si lazima'
                          )}
                          value={
                            serviceChargePaymentForm.referenceNumber
                          }
                          onChange={(event) =>
                            setServiceChargePaymentForm(
                              (previous) => ({
                                ...previous,
                                referenceNumber:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <div className="md:col-span-2">
                          <Textarea
                            label={t(
                              language,
                              'Notes',
                              'Maelezo'
                            )}
                            rows={3}
                            value={
                              serviceChargePaymentForm.notes
                            }
                            onChange={(event) =>
                              setServiceChargePaymentForm(
                                (previous) => ({
                                  ...previous,
                                  notes:
                                    event.target.value,
                                })
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-emerald-100 bg-emerald-50 px-6 py-5">
                        <Button
                          type="button"
                          className="bg-emerald-700 px-6 py-3"
                          disabled={
                            isSavingServiceChargePayment
                          }
                          onClick={
                            recordPermanentServiceChargePayment
                          }
                        >
                          {isSavingServiceChargePayment
                            ? t(
                                language,
                                'Saving Payment...',
                                'Inahifadhi Malipo...'
                              )
                            : t(
                                language,
                                'Save Service Charge Payment',
                                'Hifadhi Malipo ya Service Charge'
                              )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                      <div className="border-b border-purple-200 bg-purple-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-purple-950">
                          {t(
                            language,
                            'Correct or Reverse Service Charge Payment',
                            'Sahihisha au Rudisha Malipo ya Service Charge'
                          )}
                        </h3>

                        <p className="mt-2 text-sm text-purple-700">
                          {t(
                            language,
                            'The system will recalculate invoice allocations and preserve the original history.',
                            'Mfumo utahesabu upya mgawanyo wa ankara na kuhifadhi historia ya awali.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 md:grid-cols-2">
                        <Select
                          label={t(
                            language,
                            'Payment to Correct',
                            'Malipo ya Kusahihisha'
                          )}
                          value={
                            serviceChargeCorrectionForm.recordType ===
                            'Payment'
                              ? serviceChargeCorrectionForm.recordId
                              : ''
                          }
                          onChange={(event) => {
                            const selectedPayment =
                              serviceChargePayments.find(
                                (payment) =>
                                  String(payment.id) ===
                                  String(event.target.value)
                              );

                            if (!selectedPayment) {
                              setServiceChargeCorrectionForm({
                                ...emptyServiceChargeCorrectionForm,
                                recordType: 'Payment',
                              });
                              return;
                            }

                            setServiceChargeCorrectionForm({
                              ...emptyServiceChargeCorrectionForm,
                              recordType: 'Payment',
                              recordId:
                                selectedPayment.id,
                              actionType: 'Update',
                              correctedAmount:
                                formatAmountInput(
                                  String(
                                    selectedPayment.amountReceived ||
                                      0
                                  )
                                ),
                              correctedDate:
                                selectedPayment.paymentDate ||
                                todayISO(),
                              paymentMethod:
                                selectedPayment.paymentMethod ||
                                'Cash',
                              referenceNumber:
                                selectedPayment.referenceNumber ||
                                '',
                              notes:
                                selectedPayment.notes || '',
                            });
                          }}
                        >
                          <option value="">
                            {t(
                              language,
                              'Select payment',
                              'Chagua malipo'
                            )}
                          </option>

                          {serviceChargePayments.map(
                            (payment) => (
                              <option
                                key={payment.id}
                                value={payment.id}
                                disabled={
                                  payment.status ===
                                  'Reversed'
                                }
                              >
                                {payment.houseNumber || '-'} —{' '}
                                {payment.tenantName ||
                                  t(
                                    language,
                                    'Occupant',
                                    'Mkazi'
                                  )}{' '}
                                — {payment.paymentDate || '-'} — TZS{' '}
                                {currency(
                                  payment.amountReceived || 0
                                )}
                                {payment.status === 'Reversed'
                                  ? ` — ${t(
                                      language,
                                      'Reversed',
                                      'Imerudishwa'
                                    )}`
                                  : ''}
                              </option>
                            )
                          )}
                        </Select>

                        <Select
                          label={t(
                            language,
                            'Correction Action',
                            'Aina ya Marekebisho'
                          )}
                          value={
                            serviceChargeCorrectionForm.actionType
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                actionType:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="Update">
                            {t(
                              language,
                              'Correct Payment Details',
                              'Sahihisha Taarifa za Malipo'
                            )}
                          </option>

                          <option value="Reverse">
                            {t(
                              language,
                              'Reverse Incorrect Payment',
                              'Rudisha Malipo Yaliyoingizwa Kimakosa'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Correct Amount Received',
                            'Kiasi Sahihi Kilichopokelewa'
                          )}
                          type="text"
                          inputMode="numeric"
                          placeholder="Mfano: 5,000"
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.correctedAmount
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedAmount:
                                  formatAmountInput(
                                    event.target.value
                                  ),
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Correct Payment Date',
                            'Tarehe Sahihi ya Malipo'
                          )}
                          type="date"
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.correctedDate
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedDate:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Select
                          label={t(
                            language,
                            'Payment Method',
                            'Njia ya Malipo'
                          )}
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.paymentMethod
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                paymentMethod:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="Cash">
                            {t(
                              language,
                              'Cash',
                              'Fedha Taslimu'
                            )}
                          </option>

                          <option value="Mobile Money">
                            Mobile Money
                          </option>

                          <option value="Bank">
                            {t(
                              language,
                              'Bank',
                              'Benki'
                            )}
                          </option>

                          <option value="Other">
                            {t(
                              language,
                              'Other',
                              'Nyingine'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Receipt or Reference Number',
                            'Namba ya Risiti au Kumbukumbu'
                          )}
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.referenceNumber
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                referenceNumber:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <div className="md:col-span-2">
                          <Textarea
                            label={t(
                              language,
                              'Reason for Correction',
                              'Sababu ya Marekebisho'
                            )}
                            rows={3}
                            placeholder={t(
                              language,
                              'Explain what was entered incorrectly.',
                              'Eleza taarifa gani iliingizwa kimakosa.'
                            )}
                            value={
                              serviceChargeCorrectionForm.reason
                            }
                            onChange={(event) =>
                              setServiceChargeCorrectionForm(
                                (previous) => ({
                                  ...previous,
                                  reason:
                                    event.target.value,
                                })
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-purple-100 bg-purple-50 px-6 py-5">
                        <Button
                          type="button"
                          className={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                              ? 'bg-red-700 px-6 py-3'
                              : 'bg-purple-700 px-6 py-3'
                          }
                          disabled={
                            isSavingServiceChargeCorrection ||
                            serviceChargeCorrectionForm.recordType !==
                              'Payment' ||
                            !serviceChargeCorrectionForm.recordId
                          }
                          onClick={
                            correctPermanentServiceChargePayment
                          }
                        >
                          {isSavingServiceChargeCorrection
                            ? t(
                                language,
                                'Saving Correction...',
                                'Inahifadhi Marekebisho...'
                              )
                            : serviceChargeCorrectionForm.actionType ===
                                'Reverse'
                              ? t(
                                  language,
                                  'Reverse Payment Safely',
                                  'Rudisha Malipo kwa Usalama'
                                )
                              : t(
                                  language,
                                  'Save Payment Correction',
                                  'Hifadhi Marekebisho ya Malipo'
                                )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 px-6 py-5">
                        <h3 className="text-xl font-bold text-slate-950">
                          {t(
                            language,
                            'Permanent Payment Receipt Register',
                            'Rejesta ya Kudumu ya Risiti za Malipo'
                          )}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {t(
                            language,
                            'Every payment remains here together with the amount allocated and any future credit.',
                            'Kila malipo yanabaki hapa pamoja na kiasi kilichogawiwa na salio lolote la mbele.'
                          )}
                        </p>
                      </div>

                      {isLoadingServiceChargeRecords ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'Loading payment records...',
                            'Inapakia rekodi za malipo...'
                          )}
                        </div>
                      ) : serviceChargePayments.length ===
                        0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'No permanent Service Charge payment has been recorded yet.',
                            'Bado hakuna malipo ya kudumu ya Service Charge yaliyosajiliwa.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {serviceChargePayments.map(
                            (payment) => (
                              <div
                                key={payment.id}
                                className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-center"
                              >
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {payment.houseNumber ||
                                      '-'}{' '}
                                    —{' '}
                                    {payment.tenantName ||
                                      t(
                                        language,
                                        'Occupant',
                                        'Mkazi'
                                      )}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {payment.paymentDate ||
                                      '-'}{' '}
                                    ·{' '}
                                    {payment.paymentMethod ||
                                      'Cash'}
                                  </p>

                                  {payment.referenceNumber ? (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {t(
                                        language,
                                        'Reference',
                                        'Kumbukumbu'
                                      )}
                                      :{' '}
                                      {
                                        payment.referenceNumber
                                      }
                                    </p>
                                  ) : null}
                                </div>

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Amount Received',
                                    'Kilichopokelewa'
                                  )}
                                  value={`TZS ${currency(
                                    payment.amountReceived
                                  )}`}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Allocated to Invoices',
                                    'Kilichogawiwa Kwenye Ankara'
                                  )}
                                  value={`TZS ${currency(
                                    payment.amountAllocated
                                  )}`}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Future Credit',
                                    'Salio la Mbele'
                                  )}
                                  value={`TZS ${currency(
                                    payment.unappliedCredit
                                  )}`}
                                />

                                <span
                                  className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                    payment.status ===
                                    'Reversed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {payment.status ===
                                  'Reversed'
                                    ? t(
                                        language,
                                        'Reversed',
                                        'Imerudishwa'
                                      )
                                    : t(
                                        language,
                                        'Active',
                                        'Halali'
                                      )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeServiceChargeSection ===
                  'fund' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                        <p className="font-bold uppercase text-emerald-700">
                          {t(
                            language,
                            'Money Collected',
                            'Fedha Zilizokusanywa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-emerald-950">
                          TZS{' '}
                          {currency(
                            totalServiceChargeCollected
                          )}
                        </p>

                        <p className="mt-2 text-sm text-emerald-700">
                          {t(
                            language,
                            'Actual Service Charge receipts.',
                            'Malipo halisi ya Service Charge yaliyopokelewa.'
                          )}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                        <p className="font-bold uppercase text-red-700">
                          {t(
                            language,
                            'Expenses Paid',
                            'Matumizi Yaliyolipwa'
                          )}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-red-950">
                          TZS{' '}
                          {currency(
                            totalServiceChargeExpenses
                          )}
                        </p>

                        <p className="mt-2 text-sm text-red-700">
                          {t(
                            language,
                            'Active fund expenses only.',
                            'Matumizi halali ya mfuko pekee.'
                          )}
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl border p-6 ${
                          serviceChargeFundBalance >= 0
                            ? 'border-violet-200 bg-violet-50'
                            : 'border-orange-200 bg-orange-50'
                        }`}
                      >
                        <p
                          className={`font-bold uppercase ${
                            serviceChargeFundBalance >= 0
                              ? 'text-violet-700'
                              : 'text-orange-700'
                          }`}
                        >
                          {t(
                            language,
                            'Fund Balance',
                            'Salio la Mfuko'
                          )}
                        </p>

                        <p
                          className={`mt-4 text-4xl font-bold ${
                            serviceChargeFundBalance >= 0
                              ? 'text-violet-950'
                              : 'text-orange-950'
                          }`}
                        >
                          TZS{' '}
                          {currency(
                            serviceChargeFundBalance
                          )}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {serviceChargeFundBalance >= 0
                            ? t(
                                language,
                                'Money available for future shared expenses.',
                                'Fedha iliyopo kwa matumizi ya pamoja yajayo.'
                              )
                            : t(
                                language,
                                'Expenses currently exceed collected money.',
                                'Matumizi kwa sasa yamezidi fedha zilizokusanywa.'
                              )}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm">
                      <div className="border-b border-orange-200 bg-orange-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-orange-950">
                          {t(
                            language,
                            'Record Service Charge Expense',
                            'Sajili Matumizi ya Service Charge'
                          )}
                        </h3>

                        <p className="mt-2 text-orange-700">
                          {t(
                            language,
                            'Record genuine shared-property expenses paid from this fund.',
                            'Sajili matumizi halisi ya maeneo ya pamoja yaliyolipwa kutoka kwenye mfuko huu.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 md:grid-cols-2">
                        <Input
                          label={t(
                            language,
                            'Expense Date',
                            'Tarehe ya Matumizi'
                          )}
                          type="date"
                          value={
                            serviceChargeExpenseForm.expenseDate
                          }
                          onChange={(event) =>
                            setServiceChargeExpenseForm(
                              (previous) => ({
                                ...previous,
                                expenseDate:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Select
                          label={t(
                            language,
                            'Expense Type',
                            'Aina ya Matumizi'
                          )}
                          value={
                            serviceChargeExpenseForm.expenseType
                          }
                          onChange={(event) =>
                            setServiceChargeExpenseForm(
                              (previous) => ({
                                ...previous,
                                expenseType:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="Cleaning">
                            {t(
                              language,
                              'Cleaning',
                              'Usafi'
                            )}
                          </option>

                          <option value="Common Area Repair">
                            {t(
                              language,
                              'Common Area Repair',
                              'Matengenezo ya Eneo la Pamoja'
                            )}
                          </option>

                          <option value="Security">
                            {t(
                              language,
                              'Security',
                              'Ulinzi'
                            )}
                          </option>

                          <option value="Caretaker">
                            {t(
                              language,
                              'Caretaker',
                              'Msimamizi wa Nyumba'
                            )}
                          </option>

                          <option value="Waste Collection">
                            {t(
                              language,
                              'Waste Collection',
                              'Uondoaji wa Taka'
                            )}
                          </option>

                          <option value="Shared Electricity">
                            {t(
                              language,
                              'Shared Electricity',
                              'Umeme wa Eneo la Pamoja'
                            )}
                          </option>

                          <option value="Other">
                            {t(
                              language,
                              'Other',
                              'Matumizi Mengine'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Expense Description',
                            'Maelezo ya Matumizi'
                          )}
                          placeholder={t(
                            language,
                            'What was paid for?',
                            'Fedha imelipia kazi gani?'
                          )}
                          value={
                            serviceChargeExpenseForm.description
                          }
                          onChange={(event) =>
                            setServiceChargeExpenseForm(
                              (previous) => ({
                                ...previous,
                                description:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Amount Paid',
                            'Kiasi Kilicholipwa'
                          )}
                          type="text"
                          inputMode="numeric"
                          placeholder="Mfano: 20,000"
                          value={
                            serviceChargeExpenseForm.amount
                          }
                          onChange={(event) =>
                            setServiceChargeExpenseForm(
                              (previous) => ({
                                ...previous,
                                amount:
                                  formatAmountInput(
                                    event.target.value
                                  ),
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Payee',
                            'Aliyelipwa'
                          )}
                          placeholder={t(
                            language,
                            'Person or company paid',
                            'Mtu au kampuni iliyolipwa'
                          )}
                          value={
                            serviceChargeExpenseForm.payee
                          }
                          onChange={(event) =>
                            setServiceChargeExpenseForm(
                              (previous) => ({
                                ...previous,
                                payee:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Receipt or Reference Number',
                            'Namba ya Risiti au Kumbukumbu'
                          )}
                          placeholder={t(
                            language,
                            'Optional',
                            'Si lazima'
                          )}
                          value={
                            serviceChargeExpenseForm.referenceNumber
                          }
                          onChange={(event) =>
                            setServiceChargeExpenseForm(
                              (previous) => ({
                                ...previous,
                                referenceNumber:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <div className="md:col-span-2">
                          <Textarea
                            label={t(
                              language,
                              'Additional Notes',
                              'Maelezo ya Ziada'
                            )}
                            rows={3}
                            value={
                              serviceChargeExpenseForm.notes
                            }
                            onChange={(event) =>
                              setServiceChargeExpenseForm(
                                (previous) => ({
                                  ...previous,
                                  notes:
                                    event.target.value,
                                })
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-orange-100 bg-orange-50 px-6 py-5">
                        <Button
                          type="button"
                          className="bg-orange-600 px-6 py-3"
                          disabled={
                            isSavingServiceChargeExpense
                          }
                          onClick={
                            recordPermanentServiceChargeExpense
                          }
                        >
                          {isSavingServiceChargeExpense
                            ? t(
                                language,
                                'Saving Expense...',
                                'Inahifadhi Matumizi...'
                              )
                            : t(
                                language,
                                'Save Service Charge Expense',
                                'Hifadhi Matumizi ya Service Charge'
                              )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                      <div className="border-b border-purple-200 bg-purple-50 px-6 py-5">
                        <h3 className="text-xl font-bold text-purple-950">
                          {t(
                            language,
                            'Correct or Reverse Service Charge Expense',
                            'Sahihisha au Rudisha Matumizi ya Service Charge'
                          )}
                        </h3>

                        <p className="mt-2 text-sm text-purple-700">
                          {t(
                            language,
                            'The original record will remain preserved and the fund balance will be recalculated.',
                            'Rekodi ya awali itaendelea kuhifadhiwa na salio la mfuko litahesabiwa upya.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 md:grid-cols-2">
                        <Select
                          label={t(
                            language,
                            'Expense to Correct',
                            'Matumizi ya Kusahihisha'
                          )}
                          value={
                            serviceChargeCorrectionForm.recordType ===
                            'Expense'
                              ? serviceChargeCorrectionForm.recordId
                              : ''
                          }
                          onChange={(event) => {
                            const selectedExpense =
                              serviceChargeExpenses.find(
                                (expense) =>
                                  String(expense.id) ===
                                  String(event.target.value)
                              );

                            if (!selectedExpense) {
                              setServiceChargeCorrectionForm({
                                ...emptyServiceChargeCorrectionForm,
                                recordType: 'Expense',
                              });
                              return;
                            }

                            setServiceChargeCorrectionForm({
                              ...emptyServiceChargeCorrectionForm,
                              recordType: 'Expense',
                              recordId:
                                selectedExpense.id,
                              actionType: 'Update',
                              correctedAmount:
                                formatAmountInput(
                                  String(
                                    selectedExpense.amount ||
                                      0
                                  )
                                ),
                              correctedDate:
                                selectedExpense.expenseDate ||
                                todayISO(),
                              expenseType:
                                selectedExpense.expenseType ||
                                'Other',
                              description:
                                selectedExpense.description ||
                                '',
                              payee:
                                selectedExpense.payee || '',
                              referenceNumber:
                                selectedExpense.referenceNumber ||
                                '',
                              notes:
                                selectedExpense.notes || '',
                            });
                          }}
                        >
                          <option value="">
                            {t(
                              language,
                              'Select expense',
                              'Chagua matumizi'
                            )}
                          </option>

                          {serviceChargeExpenses.map(
                            (expense) => (
                              <option
                                key={expense.id}
                                value={expense.id}
                                disabled={
                                  expense.status ===
                                  'Reversed'
                                }
                              >
                                {expense.expenseDate || '-'} —{' '}
                                {expense.description ||
                                  expense.expenseType ||
                                  '-'}{' '}
                                — TZS{' '}
                                {currency(expense.amount || 0)}
                                {expense.status === 'Reversed'
                                  ? ` — ${t(
                                      language,
                                      'Reversed',
                                      'Imerudishwa'
                                    )}`
                                  : ''}
                              </option>
                            )
                          )}
                        </Select>

                        <Select
                          label={t(
                            language,
                            'Correction Action',
                            'Aina ya Marekebisho'
                          )}
                          value={
                            serviceChargeCorrectionForm.actionType
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                actionType:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="Update">
                            {t(
                              language,
                              'Correct Expense Details',
                              'Sahihisha Taarifa za Matumizi'
                            )}
                          </option>

                          <option value="Reverse">
                            {t(
                              language,
                              'Reverse Incorrect Expense',
                              'Rudisha Matumizi Yaliyoingizwa Kimakosa'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Correct Expense Date',
                            'Tarehe Sahihi ya Matumizi'
                          )}
                          type="date"
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.correctedDate
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedDate:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Select
                          label={t(
                            language,
                            'Expense Type',
                            'Aina ya Matumizi'
                          )}
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.expenseType
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                expenseType:
                                  event.target.value,
                              })
                            )
                          }
                        >
                          <option value="Cleaning">
                            {t(
                              language,
                              'Cleaning',
                              'Usafi'
                            )}
                          </option>

                          <option value="Common Area Repair">
                            {t(
                              language,
                              'Common Area Repair',
                              'Matengenezo ya Eneo la Pamoja'
                            )}
                          </option>

                          <option value="Security">
                            {t(
                              language,
                              'Security',
                              'Ulinzi'
                            )}
                          </option>

                          <option value="Caretaker">
                            {t(
                              language,
                              'Caretaker',
                              'Msimamizi wa Nyumba'
                            )}
                          </option>

                          <option value="Waste Collection">
                            {t(
                              language,
                              'Waste Collection',
                              'Uondoaji wa Taka'
                            )}
                          </option>

                          <option value="Shared Electricity">
                            {t(
                              language,
                              'Shared Electricity',
                              'Umeme wa Eneo la Pamoja'
                            )}
                          </option>

                          <option value="Other">
                            {t(
                              language,
                              'Other',
                              'Matumizi Mengine'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Correct Description',
                            'Maelezo Sahihi ya Matumizi'
                          )}
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.description
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                description:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Correct Amount',
                            'Kiasi Sahihi'
                          )}
                          type="text"
                          inputMode="numeric"
                          placeholder="Mfano: 20,000"
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.correctedAmount
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                correctedAmount:
                                  formatAmountInput(
                                    event.target.value
                                  ),
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Paid To',
                            'Aliyelipwa'
                          )}
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.payee
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                payee:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Receipt or Reference Number',
                            'Namba ya Risiti au Kumbukumbu'
                          )}
                          disabled={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                          }
                          value={
                            serviceChargeCorrectionForm.referenceNumber
                          }
                          onChange={(event) =>
                            setServiceChargeCorrectionForm(
                              (previous) => ({
                                ...previous,
                                referenceNumber:
                                  event.target.value,
                              })
                            )
                          }
                        />

                        <div className="md:col-span-2">
                          <Textarea
                            label={t(
                              language,
                              'Reason for Correction',
                              'Sababu ya Marekebisho'
                            )}
                            rows={3}
                            placeholder={t(
                              language,
                              'Explain what was entered incorrectly.',
                              'Eleza taarifa gani iliingizwa kimakosa.'
                            )}
                            value={
                              serviceChargeCorrectionForm.reason
                            }
                            onChange={(event) =>
                              setServiceChargeCorrectionForm(
                                (previous) => ({
                                  ...previous,
                                  reason:
                                    event.target.value,
                                })
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-purple-100 bg-purple-50 px-6 py-5">
                        <Button
                          type="button"
                          className={
                            serviceChargeCorrectionForm.actionType ===
                            'Reverse'
                              ? 'bg-red-700 px-6 py-3'
                              : 'bg-purple-700 px-6 py-3'
                          }
                          disabled={
                            isSavingServiceChargeCorrection ||
                            serviceChargeCorrectionForm.recordType !==
                              'Expense' ||
                            !serviceChargeCorrectionForm.recordId
                          }
                          onClick={
                            correctPermanentServiceChargeExpense
                          }
                        >
                          {isSavingServiceChargeCorrection
                            ? t(
                                language,
                                'Saving Correction...',
                                'Inahifadhi Marekebisho...'
                              )
                            : serviceChargeCorrectionForm.actionType ===
                                'Reverse'
                              ? t(
                                  language,
                                  'Reverse Expense Safely',
                                  'Rudisha Matumizi kwa Usalama'
                                )
                              : t(
                                  language,
                                  'Save Expense Correction',
                                  'Hifadhi Marekebisho ya Matumizi'
                                )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 px-6 py-5">
                        <h3 className="text-xl font-bold text-slate-950">
                          {t(
                            language,
                            'Permanent Expense Register',
                            'Rejesta ya Kudumu ya Matumizi'
                          )}
                        </h3>
                      </div>

                      {isLoadingServiceChargeRecords ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'Loading expense records...',
                            'Inapakia rekodi za matumizi...'
                          )}
                        </div>
                      ) : serviceChargeExpenses.length ===
                        0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'No Service Charge expense has been recorded.',
                            'Bado hakuna matumizi ya Service Charge yaliyosajiliwa.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {serviceChargeExpenses.map(
                            (expense) => (
                              <div
                                key={expense.id}
                                className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center"
                              >
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {expense.description ||
                                      expense.expenseType}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {expense.expenseType} ·{' '}
                                    {expense.expenseDate}
                                  </p>

                                  {expense.payee ? (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {t(
                                        language,
                                        'Paid to',
                                        'Aliyelipwa'
                                      )}
                                      : {expense.payee}
                                    </p>
                                  ) : null}
                                </div>

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Amount',
                                    'Kiasi'
                                  )}
                                  value={`TZS ${currency(
                                    expense.amount
                                  )}`}
                                />

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Reference',
                                    'Kumbukumbu'
                                  )}
                                  value={
                                    expense.referenceNumber ||
                                    '-'
                                  }
                                />

                                <span
                                  className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                    expense.status ===
                                    'Reversed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {expense.status ===
                                  'Reversed'
                                    ? t(
                                        language,
                                        'Reversed',
                                        'Imerudishwa'
                                      )
                                    : t(
                                        language,
                                        'Active',
                                        'Halali'
                                      )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeServiceChargeSection ===
                  'attention' && (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
                      <div className="border-b border-red-200 bg-red-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-red-950">
                          {t(
                            language,
                            'Overdue Service Charge Accounts',
                            'Akaunti za Service Charge Zilizochelewa'
                          )}
                        </h3>

                        <p className="mt-2 text-red-700">
                          {overdueServiceCharges.length}{' '}
                          {t(
                            language,
                            'accounts require immediate action.',
                            'zinahitaji hatua ya haraka.'
                          )}
                        </p>
                      </div>

                      {overdueServiceCharges.length ===
                      0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'There is currently no overdue Service Charge.',
                            'Kwa sasa hakuna Service Charge iliyochelewa.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {overdueServiceCharges.map(
                            (service) => {
                              const outstandingBalance =
                                Number(
                                  service.balance ??
                                    Math.max(
                                      0,
                                      Number(
                                        service.serviceChargeAmount ||
                                          0
                                      ) -
                                        Number(
                                          service.amountPaid ||
                                            0
                                        )
                                    )
                                );

                              return (
                                <div
                                  key={service.id}
                                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center"
                                >
                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {service.houseNumber ||
                                        '-'}{' '}
                                      —{' '}
                                      {service.tenantName ||
                                        t(
                                          language,
                                          'Occupant',
                                          'Mkazi'
                                        )}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {t(
                                        language,
                                        'Charge month',
                                        'Mwezi wa malipo'
                                      )}
                                      :{' '}
                                      {service.chargeMonth ||
                                        '-'}
                                    </p>
                                  </div>

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Payment Deadline',
                                      'Mwisho wa Malipo'
                                    )}
                                    value={
                                      service.dueDate ||
                                      service.nextPaymentDate ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Outstanding Balance',
                                      'Salio Linalodaiwa'
                                    )}
                                    value={`TZS ${currency(
                                      outstandingBalance
                                    )}`}
                                  />

                                  <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-800">
                                    {t(
                                      language,
                                      'Overdue',
                                      'Imechelewa'
                                    )}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-yellow-200 bg-white shadow-sm">
                      <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-yellow-950">
                          {t(
                            language,
                            'Service Charge Due Within Seven Days',
                            'Service Charge Inayofika Ndani ya Siku 7'
                          )}
                        </h3>

                        <p className="mt-2 text-yellow-800">
                          {serviceChargesDueSoon.length}{' '}
                          {t(
                            language,
                            'accounts are approaching the payment deadline.',
                            'zinakaribia mwisho wa malipo.'
                          )}
                        </p>
                      </div>

                      {serviceChargesDueSoon.length ===
                      0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'There is currently no Service Charge due within seven days.',
                            'Kwa sasa hakuna Service Charge inayofika ndani ya siku saba.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {serviceChargesDueSoon.map(
                            (service) => {
                              const outstandingBalance =
                                Number(
                                  service.balance ??
                                    Math.max(
                                      0,
                                      Number(
                                        service.serviceChargeAmount ||
                                          0
                                      ) -
                                        Number(
                                          service.amountPaid ||
                                            0
                                        )
                                    )
                                );

                              return (
                                <div
                                  key={service.id}
                                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center"
                                >
                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {service.houseNumber ||
                                        '-'}{' '}
                                      —{' '}
                                      {service.tenantName ||
                                        t(
                                          language,
                                          'Occupant',
                                          'Mkazi'
                                        )}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {t(
                                        language,
                                        'Charge month',
                                        'Mwezi wa malipo'
                                      )}
                                      :{' '}
                                      {service.chargeMonth ||
                                        '-'}
                                    </p>
                                  </div>

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Payment Deadline',
                                      'Mwisho wa Malipo'
                                    )}
                                    value={
                                      service.dueDate ||
                                      service.nextPaymentDate ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Outstanding Balance',
                                      'Salio Linalodaiwa'
                                    )}
                                    value={`TZS ${currency(
                                      outstandingBalance
                                    )}`}
                                  />

                                  <span className="inline-flex rounded-full bg-yellow-100 px-4 py-2 text-xs font-bold text-yellow-800">
                                    {t(
                                      language,
                                      'Due Soon',
                                      'Inakaribia'
                                    )}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeServiceChargeSection ===
                  'alerts' && (
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm">
                      <div className="border-b border-cyan-200 bg-cyan-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-cyan-950">
                          {t(
                            language,
                            'Service Charge Settings for Each House',
                            'Mipangilio ya Service Charge kwa Kila Nyumba'
                          )}
                        </h3>

                        <p className="mt-2 text-cyan-700">
                          {t(
                            language,
                            'Enable, disable or change the monthly amount without changing the house or occupant.',
                            'Washa, zima au badilisha kiasi cha mwezi bila kubadilisha nyumba au mkazi.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-6 md:grid-cols-2">
                        <Select
                          label={t(
                            language,
                            'House',
                            'Nyumba'
                          )}
                          value={
                            serviceChargeHouseSettingForm.houseId
                          }
                          onChange={(event) => {
                            const selectedHouse =
                              houses.find(
                                (house) =>
                                  String(house.id) ===
                                  String(event.target.value)
                              );

                            if (!selectedHouse) {
                              setServiceChargeHouseSettingForm({
                                ...emptyServiceChargeHouseSettingForm,
                              });
                              return;
                            }

                            setServiceChargeHouseSettingForm({
                              ...emptyServiceChargeHouseSettingForm,
                              houseId: selectedHouse.id,
                              enabled:
                                selectedHouse.serviceChargeEnabled !==
                                false,
                              monthlyAmount:
                                formatAmountInput(
                                  String(
                                    selectedHouse.monthlyServiceChargeAmount ||
                                      DEFAULT_SERVICE_CHARGE
                                  )
                                ),
                            });
                          }}
                        >
                          <option value="">
                            {t(
                              language,
                              'Select house',
                              'Chagua nyumba'
                            )}
                          </option>

                          {houses
                            .filter(
                              (house) =>
                                house.archived !== true
                            )
                            .map((house) => (
                              <option
                                key={house.id}
                                value={house.id}
                              >
                                {house.houseNumber || '-'} —{' '}
                                {house.tenantName ||
                                  t(
                                    language,
                                    'No occupant name',
                                    'Hakuna jina la mkazi'
                                  )}{' '}
                                —{' '}
                                {house.serviceChargeEnabled !==
                                false
                                  ? t(
                                      language,
                                      'Enabled',
                                      'Imewashwa'
                                    )
                                  : t(
                                      language,
                                      'Disabled',
                                      'Imezimwa'
                                    )}
                              </option>
                            ))}
                        </Select>

                        <Select
                          label={t(
                            language,
                            'Service Charge Status',
                            'Hali ya Service Charge'
                          )}
                          value={
                            serviceChargeHouseSettingForm.enabled
                              ? 'Enabled'
                              : 'Disabled'
                          }
                          onChange={(event) =>
                            setServiceChargeHouseSettingForm(
                              (previous) => ({
                                ...previous,
                                enabled:
                                  event.target.value ===
                                  'Enabled',
                              })
                            )
                          }
                        >
                          <option value="Enabled">
                            {t(
                              language,
                              'Enabled — Charge this house',
                              'Imewashwa — Toza nyumba hii'
                            )}
                          </option>

                          <option value="Disabled">
                            {t(
                              language,
                              'Disabled — Do not charge this house',
                              'Imezimwa — Usitoze nyumba hii'
                            )}
                          </option>
                        </Select>

                        <Input
                          label={t(
                            language,
                            'Monthly Service Charge Amount',
                            'Kiasi cha Service Charge kwa Mwezi'
                          )}
                          type="text"
                          inputMode="numeric"
                          placeholder="Mfano: 5,000"
                          disabled={
                            !serviceChargeHouseSettingForm.enabled
                          }
                          value={
                            serviceChargeHouseSettingForm.monthlyAmount
                          }
                          onChange={(event) =>
                            setServiceChargeHouseSettingForm(
                              (previous) => ({
                                ...previous,
                                monthlyAmount:
                                  formatAmountInput(
                                    event.target.value
                                  ),
                              })
                            )
                          }
                        />

                        <Input
                          label={t(
                            language,
                            'Reason for Change',
                            'Sababu ya Badiliko'
                          )}
                          placeholder={t(
                            language,
                            'Explain why this setting is changing.',
                            'Eleza kwa nini mipangilio hii inabadilishwa.'
                          )}
                          value={
                            serviceChargeHouseSettingForm.reason
                          }
                          onChange={(event) =>
                            setServiceChargeHouseSettingForm(
                              (previous) => ({
                                ...previous,
                                reason:
                                  event.target.value,
                              })
                            )
                          }
                        />
                      </div>

                      <div className="flex justify-end border-t border-cyan-100 bg-cyan-50 px-6 py-5">
                        <Button
                          type="button"
                          className="bg-cyan-700 px-6 py-3"
                          disabled={
                            isSavingServiceChargeHouseSetting ||
                            !serviceChargeHouseSettingForm.houseId
                          }
                          onClick={
                            saveServiceChargeHouseSetting
                          }
                        >
                          {isSavingServiceChargeHouseSetting
                            ? t(
                                language,
                                'Saving Settings...',
                                'Inahifadhi Mipangilio...'
                              )
                            : t(
                                language,
                                'Save House Setting',
                                'Hifadhi Mipangilio ya Nyumba'
                              )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
                      <div className="border-b border-red-200 bg-red-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-red-950">
                          {t(
                            language,
                            'Houses Missing This Month’s Invoice',
                            'Nyumba Zisizo na Ankara ya Mwezi Huu'
                          )}
                        </h3>

                        <p className="mt-2 text-red-700">
                          {
                            serviceChargeHousesMissingCurrentInvoice.length
                          }{' '}
                          {t(
                            language,
                            'houses require a Service Charge invoice.',
                            'zinahitaji kuandaliwa ankara ya Service Charge.'
                          )}
                        </p>
                      </div>

                      {serviceChargeHousesMissingCurrentInvoice.length ===
                      0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'Every eligible house has this month’s invoice.',
                            'Nyumba zote zinazohusika zina ankara ya mwezi huu.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {serviceChargeHousesMissingCurrentInvoice.map(
                            (house) => (
                              <div
                                key={house.id}
                                className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_1fr_auto] md:items-center"
                              >
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {house.houseNumber || '-'} —{' '}
                                    {house.tenantName ||
                                      t(
                                        language,
                                        'Occupant',
                                        'Mkazi'
                                      )}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {t(
                                      language,
                                      'Required month',
                                      'Mwezi unaohitajika'
                                    )}
                                    : {currentServiceChargeMonth}
                                  </p>
                                </div>

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Monthly Service Charge',
                                    'Service Charge kwa Mwezi'
                                  )}
                                  value={`TZS ${currency(
                                    Number(
                                      house.monthlyServiceChargeAmount ||
                                        DEFAULT_SERVICE_CHARGE
                                    )
                                  )}`}
                                />

                                <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-800">
                                  {t(
                                    language,
                                    'Invoice Missing',
                                    'Ankara Haipo'
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
                      <div className="border-b border-amber-200 bg-amber-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-amber-950">
                          {t(
                            language,
                            'Houses With Service Charge Disabled',
                            'Nyumba Ambazo Service Charge Imezimwa'
                          )}
                        </h3>

                        <p className="mt-2 text-amber-700">
                          {serviceChargeDisabledHouses.length}{' '}
                          {t(
                            language,
                            'occupied houses are not currently being charged.',
                            'zinatumika lakini kwa sasa hazitozwi Service Charge.'
                          )}
                        </p>
                      </div>

                      {serviceChargeDisabledHouses.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'No occupied house has Service Charge disabled.',
                            'Hakuna nyumba inayotumika ambayo Service Charge imezimwa.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {serviceChargeDisabledHouses.map(
                            (house) => (
                              <div
                                key={house.id}
                                className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_1fr_auto] md:items-center"
                              >
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {house.houseNumber || '-'} —{' '}
                                    {house.tenantName ||
                                      t(
                                        language,
                                        'Occupant',
                                        'Mkazi'
                                      )}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {t(
                                      language,
                                      'House status',
                                      'Hali ya nyumba'
                                    )}
                                    : {house.houseStatus || '-'}
                                  </p>
                                </div>

                                <PreviewValue
                                  label={t(
                                    language,
                                    'Normal Monthly Amount',
                                    'Kiasi cha Kawaida kwa Mwezi'
                                  )}
                                  value={`TZS ${currency(
                                    Number(
                                      house.monthlyServiceChargeAmount ||
                                        DEFAULT_SERVICE_CHARGE
                                    )
                                  )}`}
                                />

                                <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800">
                                  {t(
                                    language,
                                    'Disabled',
                                    'Imezimwa'
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                      <div className="border-b border-purple-200 bg-purple-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-purple-950">
                          {t(
                            language,
                            'Unpaid Accounts Missing Contact Details',
                            'Akaunti Zenye Deni Zisizo na Mawasiliano Kamili'
                          )}
                        </h3>

                        <p className="mt-2 text-purple-700">
                          {
                            serviceChargeAccountsMissingContact.length
                          }{' '}
                          {t(
                            language,
                            'unpaid accounts need an occupant name or phone number.',
                            'zenye deni zinahitaji jina la mkazi au namba ya simu.'
                          )}
                        </p>
                      </div>

                      {serviceChargeAccountsMissingContact.length ===
                      0 ? (
                        <div className="p-8 text-center text-slate-500">
                          {t(
                            language,
                            'Every unpaid account has the required contact details.',
                            'Akaunti zote zenye deni zina taarifa muhimu za mawasiliano.'
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {serviceChargeAccountsMissingContact.map(
                            (service) => {
                              const connectedHouse =
                                houses.find(
                                  (house) =>
                                    String(house.id || '') ===
                                      String(
                                        service.houseId || ''
                                      ) ||
                                    String(
                                      house.houseNumber || ''
                                    )
                                      .trim()
                                      .toUpperCase() ===
                                      String(
                                        service.houseNumber || ''
                                      )
                                        .trim()
                                        .toUpperCase()
                                );

                              const occupantName =
                                service.tenantName ||
                                connectedHouse?.tenantName ||
                                '';

                              const phoneNumber =
                                service.phoneNumber ||
                                service.tenantPhone ||
                                connectedHouse?.phoneNumber ||
                                '';

                              return (
                                <div
                                  key={service.id}
                                  className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
                                >
                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {service.houseNumber ||
                                        connectedHouse?.houseNumber ||
                                        '-'}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {service.chargeMonth || '-'}
                                    </p>
                                  </div>

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Occupant Name',
                                      'Jina la Mkazi'
                                    )}
                                    value={
                                      occupantName ||
                                      t(
                                        language,
                                        'Missing',
                                        'Halipo'
                                      )
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Phone Number',
                                      'Namba ya Simu'
                                    )}
                                    value={
                                      phoneNumber ||
                                      t(
                                        language,
                                        'Missing',
                                        'Haipo'
                                      )
                                    }
                                  />

                                  <span className="inline-flex rounded-full bg-purple-100 px-4 py-2 text-xs font-bold text-purple-800">
                                    {t(
                                      language,
                                      'Complete Details',
                                      'Kamilisha Taarifa'
                                    )}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeServiceChargeSection ===
                  'reports' && (
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm">
                      <div className="border-b border-indigo-200 bg-indigo-50 px-6 py-5">
                        <h3 className="text-2xl font-bold text-indigo-950">
                          {t(
                            language,
                            'Service Charge Reports',
                            'Ripoti za Service Charge'
                          )}
                        </h3>

                        <p className="mt-2 text-indigo-700">
                          {t(
                            language,
                            'Select one report below to view its permanent records.',
                            'Chagua ripoti moja hapa chini ili kuona rekodi zake za kudumu.'
                          )}
                        </p>
                      </div>

                      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
                        {[
                          {
                            value: 'invoices',
                            title: t(
                              language,
                              'Invoice Register',
                              'Rejesta ya Ankara'
                            ),
                            description: t(
                              language,
                              'Every Service Charge invoice.',
                              'Ankara zote za Service Charge.'
                            ),
                            colour:
                              'border-blue-200 bg-blue-50 text-blue-950',
                          },
                          {
                            value: 'payments',
                            title: t(
                              language,
                              'Payment History',
                              'Historia ya Malipo'
                            ),
                            description: t(
                              language,
                              'Every permanent payment receipt.',
                              'Risiti zote za malipo ya kudumu.'
                            ),
                            colour:
                              'border-emerald-200 bg-emerald-50 text-emerald-950',
                          },
                          {
                            value: 'outstanding',
                            title: t(
                              language,
                              'Outstanding Balances',
                              'Salio Linalodaiwa'
                            ),
                            description: t(
                              language,
                              'Unpaid and partially paid invoices.',
                              'Ankara ambazo hazijalipwa au zimelipwa sehemu.'
                            ),
                            colour:
                              'border-amber-200 bg-amber-50 text-amber-950',
                          },
                          {
                            value: 'expenses',
                            title: t(
                              language,
                              'Expenses and Fund',
                              'Matumizi na Mfuko'
                            ),
                            description: t(
                              language,
                              'Collections, expenses and fund balance.',
                              'Makusanyo, matumizi na salio la mfuko.'
                            ),
                            colour:
                              'border-red-200 bg-red-50 text-red-950',
                          },
                          {
                            value: 'corrections',
                            title: t(
                              language,
                              'Correction History',
                              'Historia ya Marekebisho'
                            ),
                            description: t(
                              language,
                              'Permanent audit of all corrections.',
                              'Ukaguzi wa kudumu wa marekebisho yote.'
                            ),
                            colour:
                              'border-purple-200 bg-purple-50 text-purple-950',
                          },
                        ].map((report) => (
                          <button
                            key={report.value}
                            type="button"
                            onClick={() =>
                              setActiveServiceChargeReport(
                                report.value
                              )
                            }
                            className={`rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-md ${
                              report.colour
                            } ${
                              activeServiceChargeReport ===
                              report.value
                                ? 'ring-2 ring-indigo-500 ring-offset-2'
                                : ''
                            }`}
                          >
                            <p className="font-bold">
                              {report.title}
                            </p>

                            <p className="mt-2 text-sm leading-6 opacity-80">
                              {report.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {!activeServiceChargeReport && (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                        <p className="text-lg font-bold text-slate-700">
                          {t(
                            language,
                            'Select a report above.',
                            'Chagua ripoti hapo juu.'
                          )}
                        </p>

                        <p className="mt-2 text-slate-500">
                          {t(
                            language,
                            'Its detailed permanent records will appear here.',
                            'Rekodi zake za kudumu zitaonekana hapa.'
                          )}
                        </p>
                      </div>
                    )}

                    {activeServiceChargeReport ===
                      'invoices' && (
                      <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                        <div className="border-b border-blue-200 bg-blue-50 px-6 py-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-blue-950">
                                {t(
                                  language,
                                  'Permanent Service Charge Invoice Register',
                                  'Rejesta ya Kudumu ya Ankara za Service Charge'
                                )}
                              </h3>

                              <p className="mt-2 text-blue-700">
                                {t(
                                  language,
                                  'Every invoice remains preserved together with its payment position.',
                                  'Kila ankara inaendelea kuhifadhiwa pamoja na hali yake ya malipo.'
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-blue-200 bg-white px-5 py-3 text-center">
                              <p className="text-xs font-bold uppercase text-blue-600">
                                {t(
                                  language,
                                  'Total Invoices',
                                  'Jumla ya Ankara'
                                )}
                              </p>

                              <p className="mt-1 text-2xl font-bold text-blue-950">
                                {activeServiceCharges.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {activeServiceCharges.length === 0 ? (
                          <div className="p-10 text-center text-slate-500">
                            {t(
                              language,
                              'No Service Charge invoice has been recorded.',
                              'Hakuna ankara ya Service Charge iliyorekodiwa.'
                            )}
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {activeServiceCharges.map(
                              (service) => {
                                const invoiceAmount =
                                  Number(
                                    service.serviceChargeAmount ||
                                      0
                                  );

                                const amountPaid = Number(
                                  service.amountPaid || 0
                                );

                                const balance = Number(
                                  service.balance ??
                                    Math.max(
                                      0,
                                      invoiceAmount -
                                        amountPaid
                                    )
                                );

                                return (
                                  <div
                                    key={service.id}
                                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] lg:items-center"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-950">
                                        {service.houseNumber ||
                                          '-'}{' '}
                                        —{' '}
                                        {service.tenantName ||
                                          t(
                                            language,
                                            'Occupant',
                                            'Mkazi'
                                          )}
                                      </p>

                                      <p className="mt-1 text-sm text-slate-500">
                                        {t(
                                          language,
                                          'Charge month',
                                          'Mwezi wa malipo'
                                        )}
                                        :{' '}
                                        {service.chargeMonth ||
                                          '-'}
                                      </p>
                                    </div>

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Invoice Date',
                                        'Tarehe ya Ankara'
                                      )}
                                      value={
                                        service.invoiceDate ||
                                        '-'
                                      }
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Due Date',
                                        'Mwisho wa Malipo'
                                      )}
                                      value={
                                        service.dueDate ||
                                        service.nextPaymentDate ||
                                        '-'
                                      }
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Invoice Amount',
                                        'Kiasi cha Ankara'
                                      )}
                                      value={`TZS ${currency(
                                        invoiceAmount
                                      )}`}
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Balance',
                                        'Salio'
                                      )}
                                      value={`TZS ${currency(
                                        balance
                                      )}`}
                                    />

                                    <span
                                      className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                        balance <= 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : amountPaid > 0
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {balance <= 0
                                        ? t(
                                            language,
                                            'Paid',
                                            'Imelipwa'
                                          )
                                        : amountPaid > 0
                                          ? t(
                                              language,
                                              'Partially Paid',
                                              'Imelipwa Sehemu'
                                            )
                                          : t(
                                              language,
                                              'Unpaid',
                                              'Haijalipwa'
                                            )}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {activeServiceChargeReport ===
                      'payments' && (
                      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
                        <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-emerald-950">
                                {t(
                                  language,
                                  'Permanent Service Charge Payment History',
                                  'Historia ya Kudumu ya Malipo ya Service Charge'
                                )}
                              </h3>

                              <p className="mt-2 text-emerald-700">
                                {t(
                                  language,
                                  'Every receipt remains preserved together with its invoice allocation and future credit.',
                                  'Kila risiti inahifadhiwa pamoja na mgawanyo wake kwenye ankara na salio la mbele.'
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-center">
                              <p className="text-xs font-bold uppercase text-emerald-600">
                                {t(
                                  language,
                                  'Active Money Received',
                                  'Fedha Halali Zilizopokelewa'
                                )}
                              </p>

                              <p className="mt-1 text-2xl font-bold text-emerald-950">
                                TZS{' '}
                                {currency(
                                  permanentServiceChargeCashCollected
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {isLoadingServiceChargeRecords ? (
                          <div className="p-10 text-center text-slate-500">
                            {t(
                              language,
                              'Loading permanent payment records...',
                              'Inapakia rekodi za kudumu za malipo...'
                            )}
                          </div>
                        ) : serviceChargePayments.length ===
                          0 ? (
                          <div className="p-10 text-center text-slate-500">
                            {t(
                              language,
                              'No permanent Service Charge payment has been recorded.',
                              'Hakuna malipo ya kudumu ya Service Charge yaliyorekodiwa.'
                            )}
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {serviceChargePayments.map(
                              (payment) => (
                                <div
                                  key={payment.id}
                                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-center"
                                >
                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {payment.houseNumber ||
                                        '-'}{' '}
                                      —{' '}
                                      {payment.tenantName ||
                                        t(
                                          language,
                                          'Occupant',
                                          'Mkazi'
                                        )}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {payment.paymentDate ||
                                        '-'}{' '}
                                      ·{' '}
                                      {payment.paymentMethod ||
                                        'Cash'}
                                    </p>

                                    {payment.referenceNumber ? (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {t(
                                          language,
                                          'Reference',
                                          'Kumbukumbu'
                                        )}
                                        :{' '}
                                        {
                                          payment.referenceNumber
                                        }
                                      </p>
                                    ) : null}
                                  </div>

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Amount Received',
                                      'Kilichopokelewa'
                                    )}
                                    value={`TZS ${currency(
                                      payment.amountReceived
                                    )}`}
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Allocated to Invoices',
                                      'Kilichogawiwa Kwenye Ankara'
                                    )}
                                    value={`TZS ${currency(
                                      payment.amountAllocated
                                    )}`}
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Future Credit',
                                      'Salio la Mbele'
                                    )}
                                    value={`TZS ${currency(
                                      payment.unappliedCredit
                                    )}`}
                                  />

                                  <span
                                    className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                      payment.status ===
                                      'Reversed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {payment.status ===
                                    'Reversed'
                                      ? t(
                                          language,
                                          'Reversed',
                                          'Imerudishwa'
                                        )
                                      : t(
                                          language,
                                          'Active',
                                          'Halali'
                                        )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {activeServiceChargeReport ===
                      'outstanding' && (
                      <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
                        <div className="border-b border-amber-200 bg-amber-50 px-6 py-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-amber-950">
                                {t(
                                  language,
                                  'Outstanding Service Charge Balances',
                                  'Salio Linalodaiwa la Service Charge'
                                )}
                              </h3>

                              <p className="mt-2 text-amber-700">
                                {t(
                                  language,
                                  'Only unpaid and partially paid invoices appear here.',
                                  'Ankara ambazo hazijalipwa au zimelipwa sehemu pekee ndizo zinaonekana hapa.'
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-amber-200 bg-white px-5 py-3 text-center">
                              <p className="text-xs font-bold uppercase text-amber-700">
                                {t(
                                  language,
                                  'Total Outstanding',
                                  'Jumla Inayodaiwa'
                                )}
                              </p>

                              <p className="mt-1 text-2xl font-bold text-amber-950">
                                TZS{' '}
                                {currency(
                                  totalServiceChargeOutstanding
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {activeServiceCharges.filter(
                          (service) =>
                            Number(
                              service.balance ??
                                Math.max(
                                  0,
                                  Number(
                                    service.serviceChargeAmount ||
                                      0
                                  ) -
                                    Number(
                                      service.amountPaid || 0
                                    )
                                )
                            ) > 0
                        ).length === 0 ? (
                          <div className="p-10 text-center text-slate-500">
                            {t(
                              language,
                              'There is currently no outstanding Service Charge.',
                              'Kwa sasa hakuna Service Charge inayodaiwa.'
                            )}
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {activeServiceCharges
                              .filter(
                                (service) =>
                                  Number(
                                    service.balance ??
                                      Math.max(
                                        0,
                                        Number(
                                          service.serviceChargeAmount ||
                                            0
                                        ) -
                                          Number(
                                            service.amountPaid ||
                                              0
                                          )
                                      )
                                  ) > 0
                              )
                              .map((service) => {
                                const invoiceAmount =
                                  Number(
                                    service.serviceChargeAmount ||
                                      0
                                  );

                                const amountPaid = Number(
                                  service.amountPaid || 0
                                );

                                const balance = Number(
                                  service.balance ??
                                    Math.max(
                                      0,
                                      invoiceAmount -
                                        amountPaid
                                    )
                                );

                                const isOverdue =
                                  service.dueDate &&
                                  daysBetween(
                                    todayISO(),
                                    service.dueDate
                                  ) < 0;

                                return (
                                  <div
                                    key={service.id}
                                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-center"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-950">
                                        {service.houseNumber ||
                                          '-'}{' '}
                                        —{' '}
                                        {service.tenantName ||
                                          t(
                                            language,
                                            'Occupant',
                                            'Mkazi'
                                          )}
                                      </p>

                                      <p className="mt-1 text-sm text-slate-500">
                                        {t(
                                          language,
                                          'Charge month',
                                          'Mwezi wa malipo'
                                        )}
                                        :{' '}
                                        {service.chargeMonth ||
                                          '-'}
                                      </p>
                                    </div>

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Payment Deadline',
                                        'Mwisho wa Malipo'
                                      )}
                                      value={
                                        service.dueDate ||
                                        service.nextPaymentDate ||
                                        '-'
                                      }
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Invoice Amount',
                                        'Kiasi cha Ankara'
                                      )}
                                      value={`TZS ${currency(
                                        invoiceAmount
                                      )}`}
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Outstanding Balance',
                                        'Salio Linalodaiwa'
                                      )}
                                      value={`TZS ${currency(
                                        balance
                                      )}`}
                                    />

                                    <span
                                      className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                        isOverdue
                                          ? 'bg-red-100 text-red-800'
                                          : amountPaid > 0
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {isOverdue
                                        ? t(
                                            language,
                                            'Overdue',
                                            'Imechelewa'
                                          )
                                        : amountPaid > 0
                                          ? t(
                                              language,
                                              'Partially Paid',
                                              'Imelipwa Sehemu'
                                            )
                                          : t(
                                              language,
                                              'Unpaid',
                                              'Haijalipwa'
                                            )}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                    {activeServiceChargeReport ===
                      'expenses' && (
                      <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                            <p className="font-bold uppercase text-emerald-700">
                              {t(
                                language,
                                'Money Collected',
                                'Fedha Zilizokusanywa'
                              )}
                            </p>

                            <p className="mt-4 text-3xl font-bold text-emerald-950">
                              TZS{' '}
                              {currency(
                                totalServiceChargeCollected
                              )}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
                            <p className="font-bold uppercase text-red-700">
                              {t(
                                language,
                                'Expenses Paid',
                                'Matumizi Yaliyolipwa'
                              )}
                            </p>

                            <p className="mt-4 text-3xl font-bold text-red-950">
                              TZS{' '}
                              {currency(
                                totalServiceChargeExpenses
                              )}
                            </p>
                          </div>

                          <div
                            className={`rounded-3xl border p-6 shadow-sm ${
                              serviceChargeFundBalance >= 0
                                ? 'border-violet-200 bg-violet-50'
                                : 'border-orange-200 bg-orange-50'
                            }`}
                          >
                            <p
                              className={`font-bold uppercase ${
                                serviceChargeFundBalance >= 0
                                  ? 'text-violet-700'
                                  : 'text-orange-700'
                              }`}
                            >
                              {t(
                                language,
                                'Fund Balance',
                                'Salio la Mfuko'
                              )}
                            </p>

                            <p
                              className={`mt-4 text-3xl font-bold ${
                                serviceChargeFundBalance >= 0
                                  ? 'text-violet-950'
                                  : 'text-orange-950'
                              }`}
                            >
                              TZS{' '}
                              {currency(
                                serviceChargeFundBalance
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
                          <div className="border-b border-red-200 bg-red-50 px-6 py-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <h3 className="text-2xl font-bold text-red-950">
                                  {t(
                                    language,
                                    'Permanent Service Charge Expense Report',
                                    'Ripoti ya Kudumu ya Matumizi ya Service Charge'
                                  )}
                                </h3>

                                <p className="mt-2 text-red-700">
                                  {t(
                                    language,
                                    'Every expense remains preserved, including reversed records.',
                                    'Kila matumizi yanaendelea kuhifadhiwa, pamoja na rekodi zilizorudishwa.'
                                  )}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-center">
                                <p className="text-xs font-bold uppercase text-red-600">
                                  {t(
                                    language,
                                    'Expense Records',
                                    'Rekodi za Matumizi'
                                  )}
                                </p>

                                <p className="mt-1 text-2xl font-bold text-red-950">
                                  {
                                    serviceChargeExpenses.length
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {isLoadingServiceChargeRecords ? (
                            <div className="p-10 text-center text-slate-500">
                              {t(
                                language,
                                'Loading expense records...',
                                'Inapakia rekodi za matumizi...'
                              )}
                            </div>
                          ) : serviceChargeExpenses.length ===
                            0 ? (
                            <div className="p-10 text-center text-slate-500">
                              {t(
                                language,
                                'No Service Charge expense has been recorded.',
                                'Hakuna matumizi ya Service Charge yaliyorekodiwa.'
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-200">
                              {serviceChargeExpenses.map(
                                (expense) => (
                                  <div
                                    key={expense.id}
                                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto] lg:items-center"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-950">
                                        {expense.description ||
                                          expense.expenseType ||
                                          '-'}
                                      </p>

                                      <p className="mt-1 text-sm text-slate-500">
                                        {expense.expenseType ||
                                          t(
                                            language,
                                            'Other',
                                            'Mengine'
                                          )}
                                      </p>
                                    </div>

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Expense Date',
                                        'Tarehe ya Matumizi'
                                      )}
                                      value={
                                        expense.expenseDate ||
                                        '-'
                                      }
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Paid To',
                                        'Aliyelipwa'
                                      )}
                                      value={
                                        expense.payee || '-'
                                      }
                                    />

                                    <PreviewValue
                                      label={t(
                                        language,
                                        'Amount',
                                        'Kiasi'
                                      )}
                                      value={`TZS ${currency(
                                        expense.amount
                                      )}`}
                                    />

                                    <span
                                      className={`inline-flex rounded-full px-3 py-2 text-xs font-bold ${
                                        expense.status ===
                                        'Reversed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {expense.status ===
                                      'Reversed'
                                        ? t(
                                            language,
                                            'Reversed',
                                            'Imerudishwa'
                                          )
                                        : t(
                                            language,
                                            'Active',
                                            'Halali'
                                          )}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activeServiceChargeReport ===
                      'corrections' && (
                      <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm">
                        <div className="border-b border-purple-200 bg-purple-50 px-6 py-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold text-purple-950">
                                {t(
                                  language,
                                  'Permanent Service Charge Correction History',
                                  'Historia ya Kudumu ya Marekebisho ya Service Charge'
                                )}
                              </h3>

                              <p className="mt-2 text-purple-700">
                                {t(
                                  language,
                                  'Every correction and reversal remains preserved for audit purposes.',
                                  'Kila marekebisho na urejeshaji vinaendelea kuhifadhiwa kwa ajili ya ukaguzi.'
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-purple-200 bg-white px-5 py-3 text-center">
                              <p className="text-xs font-bold uppercase text-purple-600">
                                {t(
                                  language,
                                  'Correction Records',
                                  'Rekodi za Marekebisho'
                                )}
                              </p>

                              <p className="mt-1 text-2xl font-bold text-purple-950">
                                {
                                  serviceChargeCorrections.length
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {isLoadingServiceChargeRecords ? (
                          <div className="p-10 text-center text-slate-500">
                            {t(
                              language,
                              'Loading correction history...',
                              'Inapakia historia ya marekebisho...'
                            )}
                          </div>
                        ) : serviceChargeCorrections.length ===
                          0 ? (
                          <div className="p-10 text-center text-slate-500">
                            {t(
                              language,
                              'No Service Charge correction has been recorded.',
                              'Hakuna marekebisho ya Service Charge yaliyorekodiwa.'
                            )}
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {serviceChargeCorrections.map(
                              (correction) => (
                                <div
                                  key={correction.id}
                                  className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1.5fr_auto] lg:items-center"
                                >
                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {correction.recordType ||
                                        t(
                                          language,
                                          'Service Charge Record',
                                          'Rekodi ya Service Charge'
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      ID:{' '}
                                      {correction.recordId ||
                                        '-'}
                                    </p>
                                  </div>

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Action',
                                      'Kitendo'
                                    )}
                                    value={
                                      correction.actionType ||
                                      correction.correctionType ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Correction Date',
                                      'Tarehe ya Marekebisho'
                                    )}
                                    value={
                                      correction.correctedDate ||
                                      correction.created_at ||
                                      '-'
                                    }
                                  />

                                  <PreviewValue
                                    label={t(
                                      language,
                                      'Reason',
                                      'Sababu'
                                    )}
                                    value={
                                      correction.reason ||
                                      correction.notes ||
                                      '-'
                                    }
                                  />

                                  <span className="inline-flex rounded-full bg-purple-100 px-3 py-2 text-xs font-bold text-purple-800">
                                    {t(
                                      language,
                                      'Preserved',
                                      'Imehifadhiwa'
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
 <ReportsSection
  language={language}
  houses={houses}
  meters={meters}
  waterMeters={waterMeters}
  waterBills={waterBills}
  waterPayments={waterPayments}
waterPaymentAllocations={waterPaymentAllocations}
waterSupplierBills={waterSupplierBills}
waterFundExpenses={waterFundExpenses}
onEditWaterSupplierBill={startEditingWaterSupplierBill}
onCancelWaterSupplierBill={cancelWaterSupplierBill}
onEditWaterFundExpense={startEditingWaterFundExpense}
onReverseWaterFundExpense={reverseWaterFundExpense}
onStartWaterPayment={startWaterPayment}
  serviceCharges={serviceCharges}
  rentPayments={rentPayments}
  totalRent={totalRent}
  totalPaid={totalPaid}
  totalOutstanding={totalOutstanding}
  totalUnitsUsed={totalUnitsUsed}
  totalWaterAmount={totalWaterAmount}
  totalDiscount={totalDiscount}
  totalServiceCharge={totalServiceCharge}
  onEditHouse={(row) => {
    setHouseForm({
      id: row.id || '',
      houseNumber: row.houseNumber || '',
      tenantName: row.tenantName || '',
      rentPaidDate: row.rentPaidDate || todayISO(),
      rentStartDate: row.rentStartDate || '',
      rentEndDate: row.rentEndDate || '',
      monthlyRentAmount: String(row.monthlyRentAmount || ''),
      amountPaid: String(row.amountPaid || ''),
      rentDurationMonths: String(row.rentDurationMonths || '1'),
      paymentType: row.paymentType || 'Full',
      houseStatus: row.houseStatus || 'Occupied',
      itemsIssued: row.itemsIssued || '',
    });
    setActiveTab('houses');
  }}
    onNewRentPayment={startNewRentPayment}
  onDeleteHouse={vacateTenant}
  onArchiveHouse={archiveHouse}
    onEditMeter={(row) => {
    setMeterForm({
      id: row.id || '',
      houseNumber: row.houseNumber || '',
      meterType: row.meterType || 'Water',
      meterNumber: row.meterNumber || '',
      readingDate: row.readingDate || todayISO(),
previousReadingDate:
  row.billingPeriodStart ||
  row.previousReadingDate ||
  row.readingDate ||
  '',
previousUnits: String(row.previousUnits ?? ''),
      currentUnits: String(row.currentUnits ?? ''),
      costPerUnit: String(row.costPerUnit ?? WATER_UNIT_PRICE),
      discount: String(row.discount ?? ''),
      nextReadingDate: row.nextReadingDate || '',
      notes: row.notes || '',
    });
    setActiveTab('meters');
  }}
    onNewMeterReading={startNewMeterReading}
    onDeleteMeter={(row) => {
    const confirmed = window.confirm('Delete this meter record?');
    if (!confirmed) return;

    saveData({
      ...data,
      meters: meters.filter((item) => item.id !== row.id),
    });
  }}
  onEditServiceCharge={(row) => {
    setServiceChargeForm({
      id: row.id || '',
      houseNumber: row.houseNumber || '',
      tenantName: row.tenantName || '',
      serviceChargeAmount: String(row.serviceChargeAmount || DEFAULT_SERVICE_CHARGE),
      datePaid: row.datePaid || todayISO(),
      nextPaymentDate: row.nextPaymentDate || '',
      paymentStatus: row.paymentStatus || 'Paid',
      notes: row.notes || '',
    });
    setActiveTab('servicecharge');
  }}
    onDeleteServiceCharge={async (row) => {
    const confirmed = window.confirm('Delete this service charge record?');
    if (!confirmed) return;

    saveData({
      ...data,
      serviceCharges: serviceCharges.filter((item) => item.id !== row.id),
    });

    const { error } = await supabase
      .from('servicecharges')
      .delete()
      .eq('id', row.id);

    if (error) {
      alert(`Service charge delete failed: ${error.message}`);
    }
  }}
/>
)}

      </div>
    </div>
  );
}

function ReportsSection({
  language,
  reportScope = 'general',
  houses,
  meters,
  waterMeters,
  waterBills,
  waterPayments,
waterPaymentAllocations,
waterSupplierBills,
waterFundExpenses,
onEditWaterSupplierBill,
onCancelWaterSupplierBill,
onEditWaterFundExpense,
onReverseWaterFundExpense,
onStartWaterPayment,
serviceCharges,
  rentPayments,
  totalRent,
  totalPaid,
  totalOutstanding,
  totalUnitsUsed,
  totalWaterAmount,
  totalDiscount,
  totalServiceCharge,
  onEditHouse,
  onNewRentPayment,
onDeleteHouse,
onArchiveHouse,
onEditMeter,
  onNewMeterReading,
  onDeleteMeter,
  onEditServiceCharge,
  onDeleteServiceCharge,
}) {
  const [reportType, setReportType] = useState(
  reportScope === 'water' ? '' : 'rent'
);
  const [waterSearch, setWaterSearch] = useState('');
const [waterStatusFilter, setWaterStatusFilter] = useState('All');
    const getRentStatusInfo = (row) => {
    if (String(row?.houseStatus || '') === 'Vacant') {
      return {
        label: t(language, 'Vacant', 'Nyumba tupu'),
        className: 'bg-slate-100 text-slate-700',
      };
    }

    const daysLeft = daysBetween(todayISO(), row?.nextPaymentDate);

    if (daysLeft === null) {
      return {
        label: t(language, 'No next payment date', 'Hakuna tarehe ya malipo ijayo'),
        className: 'bg-slate-100 text-slate-700',
      };
    }

    if (daysLeft < 0) {
      const delayedDays = Math.abs(daysLeft);

      return {
        label: t(
          language,
          `Overdue by ${delayedDays} day(s)`,
          `Imechelewa siku ${delayedDays}`
        ),
        className: 'bg-red-100 text-red-700',
      };
    }

    if (daysLeft === 0) {
      return {
        label: t(language, 'Due today', 'Inalipwa leo'),
        className: 'bg-amber-100 text-amber-700',
      };
    }

    if (daysLeft <= 7) {
      return {
        label: t(
          language,
          `Due in ${daysLeft} day(s)`,
          `Inakaribia bado siku ${daysLeft}`
        ),
        className: 'bg-orange-100 text-orange-700',
      };
    }

   return {
  label: t(language, 'Okay', 'Iko sawa'),
  className: 'bg-emerald-100 text-emerald-700',
};
};

const normalizedWaterSearch = waterSearch
  .trim()
  .toLowerCase();

const filteredWaterBills = waterBills.filter((bill) => {
  const matchesSearch =
    !normalizedWaterSearch ||
    String(bill.houseNumber || '')
      .toLowerCase()
      .includes(normalizedWaterSearch) ||
    String(bill.tenantName || '')
      .toLowerCase()
      .includes(normalizedWaterSearch) ||
    String(bill.meterNumber || '')
      .toLowerCase()
      .includes(normalizedWaterSearch);

  const balance = Number(bill.balance || 0);
  const amountPaid = Number(bill.amountPaid || 0);

  const isOverdue =
    balance > 0 &&
    Boolean(bill.dueDate) &&
    daysBetween(todayISO(), bill.dueDate) < 0;

  const matchesStatus =
    waterStatusFilter === 'All' ||
    (waterStatusFilter === 'Paid' && balance <= 0) ||
    (waterStatusFilter === 'Partially Paid' &&
      balance > 0 &&
      amountPaid > 0) ||
    (waterStatusFilter === 'Overdue' && isOverdue) ||
    (waterStatusFilter === 'Unpaid' &&
      balance > 0 &&
      amountPaid <= 0 &&
      !isOverdue);

  return matchesSearch && matchesStatus;
});

const filteredWaterPayments = waterPayments.filter(
  (payment) =>
    !normalizedWaterSearch ||
    String(payment.houseNumber || '')
      .toLowerCase()
      .includes(normalizedWaterSearch) ||
    String(payment.tenantName || '')
      .toLowerCase()
      .includes(normalizedWaterSearch) ||
    String(payment.meterNumber || '')
      .toLowerCase()
      .includes(normalizedWaterSearch)
);

return (
  <div className="space-y-4">
     {reportScope === 'water' ? (
  <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h3 className="text-2xl font-bold text-slate-900">
        {t(
          language,
          'Utility Reports',
          'Ripoti za Huduma'
        )}
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        {t(
          language,
          'Select the report you want to open.',
          'Chagua ripoti unayotaka kufungua.'
        )}
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        [
          'waterMeters',
          t(
            language,
            'Water Meter Register',
            'Rejesta ya Mita za Maji'
          ),
        ],
        [
          'waterBills',
          t(
            language,
            'Monthly Water Bills',
            'Ankara za Maji za Mwezi'
          ),
        ],
        [
          'waterPayments',
          t(
            language,
            'Water Payment History',
            'Historia ya Malipo ya Maji'
          ),
        ],
        [
          'waterFund',
          t(
            language,
            'Water Fund Report',
            'Ripoti ya Mfuko wa Matumizi'
          ),
        ],
        [
          'legacyWater',
          t(
            language,
            'Previous Water Records',
            'Historia ya Zamani ya Maji'
          ),
        ],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setReportType(value)}
          className={`min-h-24 rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
            reportType === value
              ? 'border-blue-700 bg-blue-700 text-white shadow-md'
              : 'border-blue-200 bg-blue-50 text-blue-950 hover:bg-blue-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
) : (
  <div className="flex justify-end">
    <select
      className="rounded-xl border px-3 py-2 text-sm"
      value={reportType}
      onChange={(e) => setReportType(e.target.value)}
    >
      <option value="rent">
        {t(language, 'Rent Report', 'Ripoti ya Kodi')}
      </option>

      <option value="service">
        {t(
          language,
          'Service Charge Report',
          'Ripoti ya Service Charge'
        )}
      </option>

      <option value="rentHistory">
        {t(
          language,
          'Rent Payment History',
          'Historia ya Malipo ya Kodi'
        )}
      </option>
    </select>
  </div>
)}

      {reportType === 'rent' && (
        <Card>
          <CardHeader><CardTitle>{t(language, 'Rent Report', 'Ripoti ya Kodi')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">{t(language, 'House Name', 'Jina la Nyumba')}</th>
<th className="py-2 pr-3">{t(language, 'Tenant Name', 'Jina la Mpangaji')}</th>
<th className="py-2 pr-3">{t(language, 'Date Paid', 'Tarehe Ilipolipwa')}</th>
<th className="py-2 pr-3">{t(language, 'Rent Start Date', 'Tarehe Kodi Kuanza')}</th>
<th className="py-2 pr-3">{t(language, 'Rent End Date', 'Tarehe Kodi Kuisha')}</th>
<th className="py-2 pr-3">{t(language, 'Next Date of Payment', 'Tarehe ya Malipo Yanayofuata')}</th>
<th className="py-2 pr-3">{t(language, 'Rent Amount', 'Kiasi cha Kodi')}</th>
<th className="py-2 pr-3">{t(language, 'Amount Paid', 'Kiasi Kilicholipwa')}</th>
<th className="py-2 pr-3">{t(language, 'Balance', 'Salio')}</th>
<th className="py-2 pr-3">{t(language, 'Status', 'Hali')}</th>
<th className="py-2 pr-3">{t(language, 'Items Issued', 'Vitu Vilivyotolewa')}</th>
<th className="py-2 pr-3">{t(language, 'Actions', 'Vitendo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.map((row) => (
                    <tr key={row.id} className={`border-b ${getRentStatusInfo(row).className.includes('red') ? 'text-red-700' : ''}`}>
                      <td className="py-2 pr-3">{row.houseNumber}</td>
                      <td className="py-2 pr-3">{row.tenantName || '-'}</td>
                      <td className="py-2 pr-3">{row.rentPaidDate || '-'}</td>
                      <td className="py-2 pr-3">{row.rentStartDate || '-'}</td>
                      <td className="py-2 pr-3">{row.rentEndDate || '-'}</td>
<td className="py-2 pr-3">{row.nextPaymentDate || '-'}</td>
<td className="py-2 pr-3">TZS {currency(row.monthlyRentAmount)}</td>
                      <td className="py-2 pr-3">TZS {currency(row.amountPaid)}</td>
                      <td className="py-2 pr-3">TZS {currency(row.balance)}</td>
                      <td className="py-2 pr-3">{row.paymentType}</td>
                      <td className="py-2 pr-3">{row.houseStatus}</td>
                      <td className="py-2 pr-3">{row.itemsIssued || '-'}</td>

<td className="py-2 pr-3">

<div className="grid grid-cols-[120px_72px_160px_150px_150px] items-center gap-2">
  <button
    type="button"
    className="h-10 w-[120px] rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"
    onClick={() => onNewRentPayment(row)}
    disabled={
      String(row.houseStatus || '') === 'Vacant' ||
      !String(row.tenantName || '').trim()
    }
  >
    {t(language, 'New Payment', 'Malipo Mapya')}
  </button>

  <button
    type="button"
    className="h-10 w-[72px] rounded-lg bg-amber-500 px-3 text-sm font-medium text-white"
    onClick={() => onEditHouse(row)}
  >
    {t(language, 'Edit', 'Hariri')}
  </button>

  <button
    type="button"
    className="h-10 w-[160px] rounded-lg bg-slate-700 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    onClick={() => onDeleteHouse(row)}
    disabled={
      String(row.houseStatus || '') === 'Vacant' ||
      !String(row.tenantName || '').trim()
    }
  >
    {String(row.houseStatus || '') === 'Vacant' ||
    !String(row.tenantName || '').trim()
      ? t(language, 'House Vacant', 'Nyumba Tupu')
      : t(
          language,
          'Tenant Relocated',
          'Mpangaji Amehama'
        )}
  </button>

  <button
    type="button"
    className="h-10 w-[150px] rounded-lg bg-purple-700 px-3 text-sm font-medium text-white hover:bg-purple-800"
    onClick={() => onArchiveHouse(row)}
  >
    {t(
      language,
      'Archive Record',
      'Weka Kumbukumbu'
    )}
  </button>

  {!getRentStatusInfo(row).className.includes('slate') ? (
    <div
      className={`flex min-h-10 w-[150px] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-semibold shadow-sm ${getRentStatusInfo(row).className}`}
    >
      {getRentStatusInfo(row).label}
    </div>
  ) : (
    <div className="w-[150px]" />
  )}
</div>
</td>
                   
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">Total Rent: TZS {currency(totalRent)}</div>
              <div className="rounded-xl bg-slate-50 p-3">Total Paid: TZS {currency(totalPaid)}</div>
              <div className="rounded-xl bg-slate-50 p-3">Total Outstanding: TZS {currency(totalOutstanding)}</div>
            </div>
          </CardContent>
        </Card>
      )}

{reportType === 'waterMeters' && (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-5 text-white shadow-lg">
        <p className="text-sm text-cyan-100">
          {t(language, 'Registered Meters', 'Mita Zilizosajiliwa')}
        </p>
        <p className="mt-2 text-3xl font-bold">
          {waterMeters.length}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <p className="text-sm text-emerald-700">
          {t(language, 'Active Meters', 'Mita Zinazotumika')}
        </p>
        <p className="mt-2 text-3xl font-bold text-emerald-800">
          {waterMeters.filter((meter) => meter.active !== false).length}
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
        <p className="text-sm text-blue-700">
          {t(
            language,
            'Readings Due Soon',
            'Usomaji Unaokaribia'
          )}
        </p>
        <p className="mt-2 text-3xl font-bold text-blue-800">
          {
            waterMeters.filter((meter) => {
              const days = daysBetween(
                todayISO(),
                meter.nextReadingDate
              );

              return (
  meter.active !== false &&
  meter.baselineConfirmed === true &&
  days !== null &&
  days >= 0 &&
  days <= 7
);
            }).length
          }
        </p>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <p className="text-sm text-red-700">
          {t(
            language,
            'Reading Overdue',
            'Usomaji Umechelewa'
          )}
        </p>
        <p className="mt-2 text-3xl font-bold text-red-800">
          {
            waterMeters.filter((meter) => {
              const days = daysBetween(
                todayISO(),
                meter.nextReadingDate
              );

              return (
  meter.active !== false &&
  meter.baselineConfirmed === true &&
  days !== null &&
  days < 0
);
            }).length
          }
        </p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            language,
            'Permanent Water Meter Register',
            'Rejesta ya Kudumu ya Mita za Maji'
          )}
        </CardTitle>

        <p className="text-sm text-slate-500">
          {t(
            language,
            'Each physical meter appears once and automatically shows its current tenant and latest reading.',
            'Kila mita inaonekana mara moja pamoja na mpangaji wa sasa na usomaji wa mwisho.'
          )}
        </p>
      </CardHeader>

      <CardContent>
        {waterMeters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-6 py-10 text-center">
            <p className="font-semibold text-cyan-800">
              {t(
                language,
                'No permanent water meter has been registered yet.',
                'Bado hakuna mita ya maji iliyosajiliwa kwenye rejesta mpya.'
              )}
            </p>

            <p className="mt-2 text-sm text-cyan-700">
              {t(
                language,
                'Saving the next water reading will register its meter automatically.',
                'Ukihifadhi usomaji unaofuata, mita yake itasajiliwa moja kwa moja.'
              )}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {waterMeters
              .slice()
              .sort((a, b) =>
                String(a.houseNumber || '').localeCompare(
                  String(b.houseNumber || ''),
                  undefined,
                  { numeric: true }
                )
              )
              .map((meter) => {
                const connectedHouse = houses.find(
                  (house) =>
                    String(house.houseNumber || '') ===
                    String(meter.houseNumber || '')
                );

                const readingDays = daysBetween(
  todayISO(),
  meter.nextReadingDate
);

const hasConfirmedBaseline =
  meter.baselineConfirmed === true;

                const readingStatus =
  !hasConfirmedBaseline
    ? {
        label: t(
          language,
          'Waiting for starting reading',
          'Inasubiri usomaji wa kuanzia'
        ),
        className: 'bg-slate-100 text-slate-700',
      }
    : readingDays === null
                    ? {
                        label: t(
                          language,
                          'No reading date',
                          'Hakuna tarehe ya usomaji'
                        ),
                        className:
                          'bg-slate-100 text-slate-700',
                      }
                    : readingDays < 0
                      ? {
                          label: t(
                            language,
                            `Overdue by ${Math.abs(readingDays)} day(s)`,
                            `Umechelewa siku ${Math.abs(readingDays)}`
                          ),
                          className:
                            'bg-red-100 text-red-700',
                        }
                      : readingDays === 0
                        ? {
                            label: t(
                              language,
                              'Reading due today',
                              'Usomaji unahitajika leo'
                            ),
                            className:
                              'bg-amber-100 text-amber-700',
                          }
                        : readingDays <= 7
                          ? {
                              label: t(
                                language,
                                `Due in ${readingDays} day(s)`,
                                `Zimebaki siku ${readingDays}`
                              ),
                              className:
                                'bg-blue-100 text-blue-700',
                            }
                          : {
                              label: t(
                                language,
                                'Up to date',
                                'Iko sawa'
                              ),
                              className:
                                'bg-emerald-100 text-emerald-700',
                            };

                return (
                  <div
                    key={meter.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-4 text-white">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-300">
                          {t(language, 'House', 'Nyumba')}
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                          {meter.houseNumber}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          meter.active !== false
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : 'bg-slate-400/20 text-slate-300'
                        }`}
                      >
                        {meter.active !== false
                          ? t(language, 'Active', 'Inatumika')
                          : t(language, 'Inactive', 'Haitumiki')}
                      </span>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-xs text-slate-500">
                          {t(
                            language,
                            'Current Tenant',
                            'Mpangaji wa Sasa'
                          )}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {connectedHouse?.tenantName ||
                            t(
                              language,
                              'No tenant registered',
                              'Hakuna mpangaji aliyesajiliwa'
                            )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-cyan-50 p-3">
                          <p className="text-xs text-cyan-700">
                            {t(
                              language,
                              'Meter Number',
                              'Namba ya Mita'
                            )}
                          </p>
                          <p className="mt-1 font-bold text-cyan-900">
                            {meter.meterNumber}
                          </p>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3">
                          <p className="text-xs text-blue-700">
                            {t(
                              language,
                              'Latest Reading',
                              'Usomaji wa Mwisho'
                            )}
                          </p>
                          <p className="mt-1 font-bold text-blue-900">
                            {meter.lastReading}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">
                            {t(
                              language,
                              'Last Read',
                              'Ilisomwa Mwisho'
                            )}
                          </p>
                          <p className="font-medium text-slate-800">
                            {meter.lastReadingDate || '-'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            {t(
                              language,
                              'Next Reading',
                              'Usomaji Unaofuata'
                            )}
                          </p>
                         <p className="font-medium text-slate-800">
  {hasConfirmedBaseline
    ? meter.nextReadingDate || '-'
    : '-'}
</p>
                        </div>
                      </div>

                      <div
                        className={`rounded-xl px-3 py-2 text-center text-xs font-semibold ${readingStatus.className}`}
                      >
                        {readingStatus.label}
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-cyan-700 hover:bg-cyan-800"
                        onClick={() =>
                          onNewMeterReading({
                            ...meter,
                            currentUnits: meter.lastReading,
                            readingDate: meter.lastReadingDate,
                          })
                        }
                      >
                        {t(
                          language,
                          'Record New Reading',
                          'Weka Usomaji Mpya'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}

{reportType === 'waterBills' && (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 p-5 text-white shadow-lg">
        <p className="text-sm text-blue-100">
          {t(
            language,
            'Total Amount Billed',
            'Jumla ya Ankara'
          )}
        </p>
        <p className="mt-2 text-2xl font-bold">
          TZS{' '}
          {currency(
            waterBills.reduce(
              (total, bill) =>
                total + Number(bill.currentBillAmount || 0),
              0
            )
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <p className="text-sm text-emerald-700">
          {t(
            language,
            'Total Amount Collected',
            'Jumla Iliyokusanywa'
          )}
        </p>
        <p className="mt-2 text-2xl font-bold text-emerald-800">
          TZS{' '}
          {currency(
            waterBills.reduce(
              (total, bill) =>
                total + Number(bill.amountPaid || 0),
              0
            )
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-sm text-amber-700">
          {t(
            language,
            'Total Outstanding',
            'Jumla Inayodaiwa'
          )}
        </p>
        <p className="mt-2 text-2xl font-bold text-amber-800">
          TZS{' '}
          {currency(
            waterBills.reduce(
              (total, bill) =>
                total + Number(bill.balance || 0),
              0
            )
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <p className="text-sm text-red-700">
          {t(language, 'Overdue Bills', 'Ankara Zilizochelewa')}
        </p>
        <p className="mt-2 text-3xl font-bold text-red-800">
          {
            waterBills.filter(
              (bill) =>
                Number(bill.balance || 0) > 0 &&
                bill.dueDate &&
                daysBetween(todayISO(), bill.dueDate) < 0
            ).length
          }
        </p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            language,
            'Monthly Water Bills',
            'Ankara za Maji za Mwezi'
          )}
        </CardTitle>

        <p className="text-sm text-slate-500">
          {t(
            language,
            'Every meter reading creates a separate permanent monthly bill.',
            'Kila usomaji wa mita unatengeneza ankara tofauti ya kudumu ya mwezi.'
          )}
        </p>
      </CardHeader>

      <CardContent>
  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-end">
    <div className="flex-1">
      <Input
        label={t(
          language,
          'Search Water Bills',
          'Tafuta Ankara za Maji'
        )}
        placeholder={t(
          language,
          'Search by house, tenant or meter number',
          'Tafuta kwa nyumba, mpangaji au namba ya mita'
        )}
        value={waterSearch}
        onChange={(e) => setWaterSearch(e.target.value)}
      />
    </div>

    <div className="w-full lg:w-[230px]">
      <Select
        label={t(
          language,
          'Payment Status',
          'Hali ya Malipo'
        )}
        value={waterStatusFilter}
        onChange={(e) =>
          setWaterStatusFilter(e.target.value)
        }
      >
        <option value="All">
          {t(language, 'All Bills', 'Ankara Zote')}
        </option>

        <option value="Paid">
          {t(language, 'Paid', 'Zilizolipwa')}
        </option>

        <option value="Partially Paid">
          {t(
            language,
            'Partially Paid',
            'Zilizolipwa Sehemu'
          )}
        </option>

        <option value="Unpaid">
          {t(language, 'Unpaid', 'Hazijalipwa')}
        </option>

        <option value="Overdue">
          {t(language, 'Overdue', 'Zilizochelewa')}
        </option>
      </Select>
    </div>

    <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm lg:min-w-[150px]">
      <p className="text-xs text-slate-500">
        {t(language, 'Results', 'Matokeo')}
      </p>
      <p className="text-xl font-bold text-slate-900">
        {filteredWaterBills.length}
      </p>
    </div>

    {(waterSearch || waterStatusFilter !== 'All') ? (
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setWaterSearch('');
          setWaterStatusFilter('All');
        }}
      >
        {t(language, 'Clear Filters', 'Ondoa Vichujio')}
      </Button>
    ) : null}
  </div>

  {waterBills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-6 py-10 text-center">
            <p className="font-semibold text-blue-800">
              {t(
                language,
                'No monthly water bill has been created yet.',
                'Bado hakuna ankara ya maji ya mwezi iliyotengenezwa.'
              )}
            </p>

            <p className="mt-2 text-sm text-blue-700">
              {t(
                language,
                'A bill will appear here automatically after saving the next meter reading.',
                'Ankara itaonekana hapa moja kwa moja baada ya kuhifadhi usomaji unaofuata.'
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1500px] w-full text-sm">
              <thead className="bg-slate-900 text-left text-white">
                <tr>
                  <th className="px-4 py-3">
                    {t(language, 'Billing Period', 'Kipindi')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'House', 'Nyumba')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Tenant', 'Mpangaji')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Meter', 'Mita')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Previous', 'Usomaji wa Nyuma')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Current', 'Usomaji wa Sasa')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Units', 'Units')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Current Bill', 'Ankara ya Sasa')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Previous Debt', 'Deni la Nyuma')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Total Payable', 'Jumla ya Kulipa')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Paid', 'Iliyolipwa')}
                  </th>
                  <th className="px-4 py-3">
                    {t(language, 'Balance', 'Salio')}
                  </th>
                  <th className="px-4 py-3">
  {t(language, 'Status', 'Hali')}
</th>
<th className="px-4 py-3">
  {t(language, 'Action', 'Hatua')}
</th>
<th className="px-4 py-3">
  {t(language, 'Actions', 'Vitendo')}
</th>
                </tr>
             </thead>

<tbody>
  {filteredWaterBills.length === 0 ? (
    <tr>
      <td
        colSpan={14}
        className="px-6 py-12 text-center"
      >
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <p className="font-semibold text-slate-800">
            {t(
              language,
              'No water bill matches the selected search or status.',
              'Hakuna ankara ya maji inayolingana na utafutaji au hali uliyochagua.'
            )}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {t(
              language,
              'Change the search text, select another status or clear the filters.',
              'Badilisha utafutaji, chagua hali nyingine au ondoa vichujio.'
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setWaterSearch('');
              setWaterStatusFilter('All');
            }}
          >
            {t(
              language,
              'Show All Water Bills',
              'Onyesha Ankara Zote'
            )}
          </Button>
        </div>
      </td>
    </tr>
  ) : null}

  {filteredWaterBills
    .slice()
    .sort(
                    (a, b) =>
                      new Date(
                        b.readingDate || b.created_at || 0
                      ).getTime() -
                      new Date(
                        a.readingDate || a.created_at || 0
                      ).getTime()
                  )
                  .map((bill) => {
                    const isOverdue =
                      Number(bill.balance || 0) > 0 &&
                      bill.dueDate &&
                      daysBetween(todayISO(), bill.dueDate) < 0;

                    const statusClass =
                      Number(bill.balance || 0) <= 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : Number(bill.amountPaid || 0) > 0
                          ? 'bg-orange-100 text-orange-700'
                          : isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700';

                    const statusLabel =
                      Number(bill.balance || 0) <= 0
                        ? t(language, 'Paid', 'Imelipwa')
                        : Number(bill.amountPaid || 0) > 0
                          ? t(
                              language,
                              'Partially Paid',
                              'Imelipwa Sehemu'
                            )
                          : isOverdue
                            ? t(language, 'Overdue', 'Imechelewa')
                            : t(language, 'Unpaid', 'Haijalipwa');

                    return (
                      <tr
                        key={bill.id}
                        className={`border-b align-top ${
                          isOverdue
                            ? 'bg-red-50/60'
                            : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">
                            {bill.billingPeriodStart || '-'}
                          </p>
                          <p className="text-xs text-slate-500">
                            hadi {bill.billingPeriodEnd || '-'}
                          </p>
                        </td>

                        <td className="px-4 py-3 font-semibold">
                          {bill.houseNumber}
                        </td>

                        <td className="px-4 py-3">
                          {bill.tenantName || '-'}
                        </td>

                        <td className="px-4 py-3">
                          {bill.meterNumber}
                        </td>

                        <td className="px-4 py-3">
                          {bill.previousUnits}
                        </td>

                        <td className="px-4 py-3">
                          {bill.currentUnits}
                        </td>

                        <td className="px-4 py-3 font-semibold text-cyan-700">
                          {bill.unitsUsed}
                        </td>

                        <td className="px-4 py-3">
                          TZS {currency(bill.currentBillAmount)}
                        </td>

                        <td className="px-4 py-3 text-amber-700">
                          TZS {currency(bill.previousBalance)}
                        </td>

                        <td className="px-4 py-3 font-bold text-blue-700">
                          TZS {currency(bill.totalPayable)}
                        </td>

                        <td className="px-4 py-3 text-emerald-700">
                          TZS {currency(bill.amountPaid)}
                        </td>

                        <td className="px-4 py-3 font-bold">
                          TZS {currency(bill.balance)}
                        </td>

                        <td className="px-4 py-3">
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
  >
    {statusLabel}
  </span>

  <p className="mt-2 text-xs text-slate-500">
    {t(language, 'Due', 'Mwisho')}:{' '}
    {bill.dueDate || '-'}
  </p>
</td>

<td className="px-4 py-3">
  {Number(bill.balance || 0) > 0 ? (
    <Button
      type="button"
      className="whitespace-nowrap bg-emerald-700 hover:bg-emerald-800"
      onClick={() => onStartWaterPayment(bill)}
    >
      {t(
        language,
        'Record Payment',
        'Rekodi Malipo'
      )}
    </Button>
  ) : (
    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
      <span>✓</span>
      {t(
        language,
        'Fully Paid',
        'Imelipwa Yote'
      )}
    </div>
  )}
</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}
{reportType === 'waterPayments' && (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-cyan-700 p-5 text-white shadow-lg">
        <p className="text-sm text-emerald-100">
          {t(
            language,
            'Total Cash Received',
            'Jumla ya Fedha Zilizopokelewa'
          )}
        </p>
        <p className="mt-2 text-2xl font-bold">
          TZS{' '}
          {currency(
            waterPayments.reduce(
              (total, payment) =>
                total + Number(payment.amountReceived || 0),
              0
            )
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
        <p className="text-sm text-blue-700">
          {t(
            language,
            'Allocated to Bills',
            'Iliyogawiwa Kwenye Ankara'
          )}
        </p>
        <p className="mt-2 text-2xl font-bold text-blue-800">
          TZS{' '}
          {currency(
            waterPaymentAllocations.reduce(
              (total, allocation) =>
                total +
                Number(allocation.allocatedAmount || 0),
              0
            )
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
        <p className="text-sm text-cyan-700">
          {t(
            language,
            'Tenant Water Credit',
            'Salio la Maji la Wapangaji'
          )}
        </p>
        <p className="mt-2 text-2xl font-bold text-cyan-800">
          TZS{' '}
          {currency(
            waterPayments.reduce(
              (total, payment) =>
                total +
                Number(payment.unappliedAmount || 0),
              0
            )
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          {t(
            language,
            'Payments Recorded',
            'Malipo Yaliyorekodiwa'
          )}
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {waterPayments.length}
        </p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            language,
            'Water Payment History',
            'Historia ya Malipo ya Maji'
          )}
        </CardTitle>

        <p className="text-sm text-slate-500">
          {t(
            language,
            'Permanent cash-payment records with exact time and automatic oldest-bill allocation.',
            'Kumbukumbu za kudumu za malipo ya fedha, muda kamili na mgawanyo wa madeni ya zamani kwanza.'
          )}
        </p>
      </CardHeader>

      <CardContent>
  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-end">
    <div className="flex-1">
      <Input
        label={t(
          language,
          'Search Water Payments',
          'Tafuta Malipo ya Maji'
        )}
        placeholder={t(
          language,
          'Search by house, tenant or meter number',
          'Tafuta kwa nyumba, mpangaji au namba ya mita'
        )}
        value={waterSearch}
        onChange={(e) => setWaterSearch(e.target.value)}
      />
    </div>

    <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm lg:min-w-[150px]">
      <p className="text-xs text-slate-500">
        {t(language, 'Results', 'Matokeo')}
      </p>

      <p className="text-xl font-bold text-slate-900">
        {filteredWaterPayments.length}
      </p>
    </div>

    {waterSearch ? (
      <Button
        type="button"
        variant="outline"
        onClick={() => setWaterSearch('')}
      >
        {t(
          language,
          'Clear Search',
          'Ondoa Utafutaji'
        )}
      </Button>
    ) : null}
  </div>

  {waterPayments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-6 py-10 text-center">
            <p className="font-semibold text-emerald-800">
              {t(
                language,
                'No water payment has been recorded yet.',
                'Bado hakuna malipo ya maji yaliyorekodiwa.'
              )}
            </p>

            <p className="mt-2 text-sm text-emerald-700">
              {t(
                language,
                'Payments recorded from Monthly Water Bills will appear here automatically.',
                'Malipo yatakayorekodiwa kwenye Ankara za Maji yataonekana hapa moja kwa moja.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
  {filteredWaterPayments.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="font-semibold text-slate-800">
        {t(
          language,
          'No water payment matches your search.',
          'Hakuna malipo ya maji yanayolingana na utafutaji wako.'
        )}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {t(
          language,
          'Change the house, tenant or meter number being searched.',
          'Badilisha nyumba, mpangaji au namba ya mita unayotafuta.'
        )}
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => setWaterSearch('')}
      >
        {t(
          language,
          'Show All Payments',
          'Onyesha Malipo Yote'
        )}
      </Button>
    </div>
  ) : null}

  {filteredWaterPayments
    .slice()
  .sort(
                (a, b) =>
                  new Date(
                    b.paidAt || b.created_at || 0
                  ).getTime() -
                  new Date(
                    a.paidAt || a.created_at || 0
                  ).getTime()
              )
              .map((payment) => {
                const paymentAllocations =
                  waterPaymentAllocations
                    .filter(
                      (allocation) =>
                        String(allocation.paymentId || '') ===
                        String(payment.id || '')
                    )
                    .sort(
                      (a, b) =>
                        Number(a.allocationOrder || 0) -
                        Number(b.allocationOrder || 0)
                    );

                const totalAllocated =
                  paymentAllocations.reduce(
                    (total, allocation) =>
                      total +
                      Number(
                        allocation.allocatedAmount || 0
                      ),
                    0
                  );

                return (
                  <div
                    key={payment.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-4 text-white md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-300">
                          {t(
                            language,
                            'Cash Receipt',
                            'Risiti ya Malipo ya Fedha'
                          )}
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {payment.houseNumber} —{' '}
                          {payment.tenantName || '-'}
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {t(language, 'Meter', 'Mita')}:{' '}
                          {payment.meterNumber}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-300">
                          {t(
                            language,
                            'Cash Received',
                            'Fedha Iliyopokelewa'
                          )}
                        </p>

                        <p className="text-2xl font-bold text-emerald-300">
                          TZS {currency(payment.amountReceived)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-white p-4">
                        <p className="text-xs text-slate-500">
                          {t(
                            language,
                            'Payment Date',
                            'Tarehe ya Malipo'
                          )}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {payment.paymentDate || '-'}
                        </p>
                      </div>

                      <div className="bg-white p-4">
                        <p className="text-xs text-slate-500">
                          {t(
                            language,
                            'Exact Recorded Time',
                            'Muda Kamili wa Kurekodi'
                          )}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {payment.paidAt
                            ? new Date(
                                payment.paidAt
                              ).toLocaleString(
                                language === 'sw'
                                  ? 'sw-TZ'
                                  : 'en-TZ',
                                {
                                  timeZone:
                                    'Africa/Dar_es_Salaam',
                                  dateStyle: 'medium',
                                  timeStyle: 'medium',
                                }
                              )
                            : '-'}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4">
                        <p className="text-xs text-blue-700">
                          {t(
                            language,
                            'Allocated to Bills',
                            'Iliyogawiwa Kwenye Ankara'
                          )}
                        </p>
                        <p className="mt-1 font-bold text-blue-800">
                          TZS {currency(totalAllocated)}
                        </p>
                      </div>

                      <div className="bg-cyan-50 p-4">
                        <p className="text-xs text-cyan-700">
                          {t(
                            language,
                            'Remaining Credit',
                            'Salio Lililobaki'
                          )}
                        </p>
                        <p className="mt-1 font-bold text-cyan-800">
                          TZS{' '}
                          {currency(payment.unappliedAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t(
                          language,
                          'Bills Affected',
                          'Ankara Zilizopunguzwa'
                        )}
                      </p>

                      {paymentAllocations.length === 0 ? (
                        <div className="mt-3 rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                          {t(
                            language,
                            'No unpaid bill existed. The full payment remains as tenant credit.',
                            'Hakukuwa na ankara yenye deni. Malipo yote yamebaki kama salio la mpangaji.'
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {paymentAllocations.map(
                            (allocation) => {
                              const affectedBill =
                                waterBills.find(
                                  (bill) =>
                                    String(bill.id || '') ===
                                    String(
                                      allocation.billId || ''
                                    )
                                );

                              return (
                                <div
                                  key={allocation.id}
                                  className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-[1fr_auto_auto_auto]"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {allocation.allocationOrder}.{' '}
                                      {affectedBill?.billingPeriodStart ||
                                        '-'}{' '}
                                      —{' '}
                                      {affectedBill?.billingPeriodEnd ||
                                        '-'}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      {t(
                                        language,
                                        'Oldest outstanding bill order',
                                        'Mpangilio wa deni la zamani kwanza'
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-slate-500">
                                      {t(
                                        language,
                                        'Before',
                                        'Kabla'
                                      )}
                                    </p>
                                    <p className="font-semibold">
                                      TZS{' '}
                                      {currency(
                                        allocation.billBalanceBefore
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-emerald-700">
                                      {t(
                                        language,
                                        'Paid',
                                        'Imelipwa'
                                      )}
                                    </p>
                                    <p className="font-bold text-emerald-700">
                                      TZS{' '}
                                      {currency(
                                        allocation.allocatedAmount
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-slate-500">
                                      {t(
                                        language,
                                        'After',
                                        'Baada'
                                      )}
                                    </p>
                                    <p className="font-semibold">
                                      TZS{' '}
                                      {currency(
                                        allocation.billBalanceAfter
                                      )}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}

                      {payment.notes ? (
                        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <span className="font-semibold">
                            {t(language, 'Notes', 'Maelezo')}:
                          </span>{' '}
                          {payment.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}

{reportType === 'waterFund' && (() => {
  const activeSupplierBills = waterSupplierBills.filter(
    (bill) => String(bill.status || 'Active') === 'Active'
  );

  const activeFundExpenses = waterFundExpenses.filter(
    (expense) =>
      String(expense.status || 'Active') === 'Active'
  );

  const totalCollected = waterPayments.reduce(
    (total, payment) =>
      total + Number(payment.amountReceived || 0),
    0
  );

  const totalSupplierBills = activeSupplierBills.reduce(
    (total, bill) =>
      total + Number(bill.billAmount || 0),
    0
  );

  const totalExpensesPaid = activeFundExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const totalSupplierPayments = activeFundExpenses
    .filter(
      (expense) =>
        String(expense.expenseType || '') ===
        'DAWASCO Payment'
    )
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  const supplierBalance = Math.max(
    0,
    totalSupplierBills - totalSupplierPayments
  );

  const cashAvailable =
    totalCollected - totalExpensesPaid;

  const realBalance =
    cashAvailable - supplierBalance;

  const sortedWaterPayments = waterPayments
    .slice()
    .sort(
      (a, b) =>
        new Date(
          b.paymentDate || b.paidAt || b.created_at || 0
        ).getTime() -
        new Date(
          a.paymentDate || a.paidAt || a.created_at || 0
        ).getTime()
    );

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-200 bg-white shadow-sm">
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
          <h3 className="text-2xl font-bold text-emerald-950">
            {t(
              language,
              'Water Expense Fund Report',
              'Ripoti ya Mfuko wa Matumizi'
            )}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {t(
              language,
              'Permanent collections, DAWASCO bills, water expenses and carried balance.',
              'Makusanyo ya kudumu, ankara za DAWASCO, matumizi ya maji na salio linaloendelea.'
            )}
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase text-blue-700">
              {t(
                language,
                'Collected from Tenants',
                'Zilizokusanywa kwa Wapangaji'
              )}
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-950">
              TZS {currency(totalCollected)}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs font-bold uppercase text-orange-700">
              {t(
                language,
                'DAWASCO Bills',
                'Ankara za DAWASCO'
              )}
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-950">
              TZS {currency(totalSupplierBills)}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase text-red-700">
              {t(
                language,
                'Expenses Paid',
                'Matumizi Yaliyolipwa'
              )}
            </p>
            <p className="mt-2 text-2xl font-bold text-red-950">
              TZS {currency(totalExpensesPaid)}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase text-amber-700">
              {t(
                language,
                'DAWASCO Balance',
                'Deni la DAWASCO'
              )}
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-950">
              TZS {currency(supplierBalance)}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              realBalance >= 0
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p
              className={`text-xs font-bold uppercase ${
                realBalance >= 0
                  ? 'text-emerald-700'
                  : 'text-red-700'
              }`}
            >
              {t(language, 'Real Balance', 'Salio Halisi')}
            </p>
            <p
              className={`mt-2 text-2xl font-bold ${
                realBalance >= 0
                  ? 'text-emerald-950'
                  : 'text-red-950'
              }`}
            >
              TZS {currency(realBalance)}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              language,
              'Permanent Tenant Collection History',
              'Historia ya Kudumu ya Makusanyo ya Wapangaji'
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-3 py-3">
                    {t(language, 'Date', 'Tarehe')}
                  </th>
                  <th className="px-3 py-3">
                    {t(language, 'House', 'Nyumba')}
                  </th>
                  <th className="px-3 py-3">
                    {t(language, 'Tenant', 'Mpangaji')}
                  </th>
                  <th className="px-3 py-3">
                    {t(language, 'Meter', 'Mita')}
                  </th>
                  <th className="px-3 py-3 text-right">
                    {t(
                      language,
                      'Amount Received',
                      'Kiasi Kilichopokelewa'
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedWaterPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      {t(
                        language,
                        'No tenant water payment has been recorded.',
                        'Hakuna malipo ya maji ya mpangaji yaliyosajiliwa.'
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedWaterPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b"
                    >
                      <td className="px-3 py-3">
                        {payment.paymentDate || '-'}
                      </td>
                      <td className="px-3 py-3 font-semibold">
                        {payment.houseNumber || '-'}
                      </td>
                      <td className="px-3 py-3">
                        {payment.tenantName || '-'}
                      </td>
                      <td className="px-3 py-3">
                        {payment.meterNumber || '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-700">
                        TZS {currency(payment.amountReceived)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              <tfoot>
                <tr className="bg-blue-50 font-bold text-blue-950">
                  <td colSpan={4} className="px-3 py-3">
                    {t(
                      language,
                      'Total Collected',
                      'Jumla Iliyokusanywa'
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    TZS {currency(totalCollected)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>
      {t(
        language,
        'Permanent DAWASCO Bill Register',
        'Rejesta ya Kudumu ya Ankara za DAWASCO'
      )}
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-orange-50 text-left">
            <th className="px-3 py-3">
              {t(language, 'Bill Date', 'Tarehe ya Ankara')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Control Number', 'Namba ya Malipo')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Billing Period', 'Kipindi cha Ankara')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Due Date', 'Mwisho wa Malipo')}
            </th>
            <th className="px-3 py-3 text-right">
              {t(language, 'Bill Amount', 'Kiasi cha Ankara')}
            </th>
            <th className="px-3 py-3 text-right">
              {t(language, 'Amount Paid', 'Kiasi Kilicholipwa')}
            </th>
            <th className="px-3 py-3 text-right">
              {t(language, 'Balance', 'Salio')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Status', 'Hali')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Action', 'Hatua')}
            </th>
          </tr>
        </thead>

        <tbody>
          {waterSupplierBills.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-3 py-6 text-center text-slate-500"
              >
                {t(
                  language,
                  'No DAWASCO bill has been recorded.',
                  'Hakuna ankara ya DAWASCO iliyosajiliwa.'
                )}
              </td>
            </tr>
          ) : (
            waterSupplierBills
              .slice()
              .sort(
                (a, b) =>
                  new Date(
                    b.billDate || b.created_at || 0
                  ).getTime() -
                  new Date(
                    a.billDate || a.created_at || 0
                  ).getTime()
              )
              .map((bill) => {
                const billIsActive =
                  String(bill.status || 'Active') ===
                  'Active';

                const amountPaid = activeFundExpenses
                  .filter(
                    (expense) =>
                      String(
                        expense.supplierBillId || ''
                      ) === String(bill.id || '') &&
                      String(
                        expense.expenseType || ''
                      ) === 'DAWASCO Payment'
                  )
                  .reduce(
                    (total, expense) =>
                      total +
                      Number(expense.amount || 0),
                    0
                  );

                const balance = billIsActive
                  ? Math.max(
                      0,
                      Number(bill.billAmount || 0) -
                        amountPaid
                    )
                  : 0;

                const billStatus = !billIsActive
                  ? t(language, 'Cancelled', 'Imebatilishwa')
                  : balance <= 0
                    ? t(language, 'Paid', 'Imelipwa')
                    : amountPaid > 0
                      ? t(
                          language,
                          'Partially Paid',
                          'Imelipwa Sehemu'
                        )
                      : t(
                          language,
                          'Unpaid',
                          'Haijalipwa'
                        );

                return (
                  <tr
                    key={bill.id}
                    className={`border-b ${
                      !billIsActive
                        ? 'bg-slate-50 text-slate-500'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      {bill.billDate || '-'}
                    </td>

                    <td className="px-3 py-3 font-semibold">
  {bill.controlNumber ||
    bill.billNumber ||
    '991040283845'}
</td>

                    <td className="px-3 py-3">
                      {bill.billingPeriodStart ||
                      bill.billingPeriodEnd
                        ? `${bill.billingPeriodStart || '-'} — ${
                            bill.billingPeriodEnd || '-'
                          }`
                        : '-'}
                    </td>

                    <td className="px-3 py-3">
                      {bill.dueDate || '-'}
                    </td>

                    <td className="px-3 py-3 text-right font-bold">
                      TZS {currency(bill.billAmount)}
                    </td>

                    <td className="px-3 py-3 text-right font-bold text-emerald-700">
                      TZS {currency(amountPaid)}
                    </td>

                    <td className="px-3 py-3 text-right font-bold text-red-700">
                      TZS {currency(balance)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          !billIsActive
                            ? 'bg-slate-200 text-slate-700'
                            : balance <= 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : amountPaid > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {billStatus}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {billIsActive ? (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() =>
        onEditWaterSupplierBill(bill)
      }
      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
    >
      {t(language, 'Edit', 'Hariri')}
    </button>

    <button
      type="button"
      onClick={() =>
        onCancelWaterSupplierBill(bill)
      }
      className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
    >
      {t(
        language,
        'Cancel Bill',
        'Batilisha Ankara'
      )}
    </button>
  </div>
) : (
  <span className="text-xs text-slate-400">
    {t(
      language,
      'History preserved',
      'Historia imehifadhiwa'
    )}
  </span>
)}
                    </td>
                  </tr>
                );
              })
          )}
        </tbody>

        <tfoot>
          <tr className="bg-orange-50 font-bold text-orange-950">
            <td colSpan={4} className="px-3 py-3">
              {t(
                language,
                'Total Active DAWASCO Bills',
                'Jumla ya Ankara za DAWASCO Zinazotumika'
              )}
            </td>
            <td className="px-3 py-3 text-right">
              TZS {currency(totalSupplierBills)}
            </td>
            <td className="px-3 py-3 text-right">
              TZS {currency(totalSupplierPayments)}
            </td>
            <td className="px-3 py-3 text-right">
              TZS {currency(supplierBalance)}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>
      {t(
        language,
        'Permanent Water Expense History',
        'Historia ya Kudumu ya Matumizi ya Maji'
      )}
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-red-50 text-left">
            <th className="px-3 py-3">
              {t(language, 'Date', 'Tarehe')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Expense Type', 'Aina ya Matumizi')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Paid To', 'Aliyelipwa')}
            </th>
            <th className="px-3 py-3">
              {t(
                language,
                'Bill or Reference',
                'Ankara au Kumbukumbu'
              )}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Notes', 'Maelezo')}
            </th>
            <th className="px-3 py-3 text-right">
              {t(language, 'Amount', 'Kiasi')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Status', 'Hali')}
            </th>
            <th className="px-3 py-3">
              {t(language, 'Action', 'Hatua')}
            </th>
          </tr>
        </thead>

        <tbody>
          {waterFundExpenses.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-3 py-6 text-center text-slate-500"
              >
                {t(
                  language,
                  'No water expense has been recorded.',
                  'Hakuna matumizi ya maji yaliyosajiliwa.'
                )}
              </td>
            </tr>
          ) : (
            waterFundExpenses
              .slice()
              .sort(
                (a, b) =>
                  new Date(
                    b.expenseDate || b.created_at || 0
                  ).getTime() -
                  new Date(
                    a.expenseDate || a.created_at || 0
                  ).getTime()
              )
              .map((expense) => {
                const expenseIsActive =
                  String(expense.status || 'Active') ===
                  'Active';

                const linkedBill = waterSupplierBills.find(
                  (bill) =>
                    String(bill.id || '') ===
                    String(expense.supplierBillId || '')
                );

                const expenseLabel =
                  expense.expenseType ===
                  'DAWASCO Payment'
                    ? t(
                        language,
                        'DAWASCO Payment',
                        'Malipo ya DAWASCO'
                      )
                    : expense.expenseType ===
                        'Purchased Water'
                      ? t(
                          language,
                          'Purchased Water',
                          'Maji Yaliyonunuliwa'
                        )
                      : expense.expenseType === 'Repair'
                        ? t(
                            language,
                            'Repair',
                            'Matengenezo'
                          )
                        : t(
                            language,
                            'Other Water Expense',
                            'Matumizi Mengine ya Maji'
                          );

                return (
                  <tr
                    key={expense.id}
                    className={`border-b ${
                      !expenseIsActive
                        ? 'bg-slate-50 text-slate-500'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      {expense.expenseDate || '-'}
                    </td>

                    <td className="px-3 py-3 font-semibold">
                      {expenseLabel}
                    </td>

                    <td className="px-3 py-3">
                      {expense.payee || '-'}
                    </td>

                    <td className="px-3 py-3">
                      {linkedBill
                        ? linkedBill.billNumber ||
                          linkedBill.billDate ||
                          '-'
                        : expense.referenceNumber || '-'}
                    </td>

                    <td className="max-w-xs px-3 py-3">
                      {expense.notes || '-'}
                    </td>

                    <td
                      className={`px-3 py-3 text-right font-bold ${
                        expenseIsActive
                          ? 'text-red-700'
                          : 'text-slate-500 line-through'
                      }`}
                    >
                      TZS {currency(expense.amount)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          expenseIsActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {expenseIsActive
                          ? t(
                              language,
                              'Active',
                              'Inatumika'
                            )
                          : t(
                              language,
                              'Reversed',
                              'Imerejeshwa Nyuma'
                            )}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {expenseIsActive ? (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() =>
        onEditWaterFundExpense(expense)
      }
      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
    >
      {t(language, 'Edit', 'Hariri')}
    </button>

    <button
      type="button"
      onClick={() =>
        onReverseWaterFundExpense(expense)
      }
      className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
    >
      {t(
        language,
        'Reverse',
        'Rejesha Nyuma'
      )}
    </button>
  </div>
) : (
  <span className="text-xs text-slate-400">
    {t(
      language,
      'History preserved',
      'Historia imehifadhiwa'
    )}
  </span>
)}
                    </td>
                  </tr>
                );
              })
          )}
        </tbody>

        <tfoot>
          <tr className="bg-red-50 font-bold text-red-950">
            <td colSpan={5} className="px-3 py-3">
              {t(
                language,
                'Total Active Water Expenses',
                'Jumla ya Matumizi ya Maji Yanayotumika'
              )}
            </td>
            <td className="px-3 py-3 text-right">
              TZS {currency(totalExpensesPaid)}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  </CardContent>
</Card>
    </div>
  );
})()}

{reportType === 'legacyWater' && (() => {
  const sortedLegacyMeters = meters
    .slice()
    .sort(
      (a, b) =>
        new Date(
          b.readingDate || b.created_at || 0
        ).getTime() -
        new Date(
          a.readingDate || a.created_at || 0
        ).getTime()
    );

  const makeLegacyDuplicateKey = (meter) =>
    [
      String(meter.houseNumber || '').trim().toLowerCase(),
      String(meter.meterNumber || '').trim().toLowerCase(),
      String(meter.readingDate || ''),
      Number(meter.previousUnits || 0),
      Number(meter.currentUnits || 0),
      Number(meter.totalAmount || 0),
    ].join('|');

  const legacyKeyCounts = sortedLegacyMeters.reduce(
    (counts, meter) => {
      const key = makeLegacyDuplicateKey(meter);

      counts[key] = Number(counts[key] || 0) + 1;
      return counts;
    },
    {}
  );

  const legacyDuplicateCount = sortedLegacyMeters.filter(
    (meter) =>
      Number(
        legacyKeyCounts[
          makeLegacyDuplicateKey(meter)
        ] || 0
      ) > 1
  ).length;

  const legacyTotalUnits = sortedLegacyMeters.reduce(
    (total, meter) =>
      total + Number(meter.unitsUsed || 0),
    0
  );

  const legacyTotalBilled = sortedLegacyMeters.reduce(
    (total, meter) =>
      total + Number(meter.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 p-5 text-white shadow-lg">
          <p className="text-sm text-slate-200">
            {t(
              language,
              'Previous Records',
              'Kumbukumbu za Zamani'
            )}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {sortedLegacyMeters.length}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
          <p className="text-sm text-cyan-700">
            {t(
              language,
              'Recorded Units',
              'Units Zilizorekodiwa'
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-cyan-900">
            {legacyTotalUnits}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-700">
            {t(
              language,
              'Calculated Bills',
              'Ankara Zilizokokotolewa'
            )}
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-900">
            TZS {currency(legacyTotalBilled)}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">
            {t(
              language,
              'Possible Duplicate Rows',
              'Rekodi Zinazoweza Kujirudia'
            )}
          </p>

          <p className="mt-2 text-3xl font-bold text-red-800">
            {legacyDuplicateCount}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              language,
              'Previous Water Records',
              'Historia ya Zamani ya Maji'
            )}
          </CardTitle>

          <p className="text-sm text-slate-500">
            {t(
              language,
              'These records came from the former meter-reading system and are displayed exactly as originally recorded.',
              'Rekodi hizi zimetoka kwenye mfumo wa zamani wa usomaji wa mita na zinaonyeshwa kama zilivyorekodiwa.'
            )}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">
              {t(
                language,
                'Important historical limitation',
                'Tahadhari kuhusu historia hii'
              )}
            </p>

            <p className="mt-1">
              {t(
                language,
                'The former system calculated water bills but did not record cash payments. Therefore, these amounts do not prove that the tenant still owes money or that payment was received.',
                'Mfumo wa zamani ulikokotoa ankara za maji lakini haukuhifadhi malipo ya fedha. Hivyo, kiasi kinachoonekana hapa hakithibitishi kuwa bado kinadaiwa au kwamba kililipwa.'
              )}
            </p>
          </div>

          {sortedLegacyMeters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="font-semibold text-slate-700">
                {t(
                  language,
                  'No previous water record was found.',
                  'Hakuna kumbukumbu ya zamani ya maji iliyopatikana.'
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[1200px] w-full text-sm">
                <thead className="bg-slate-800 text-left text-white">
                  <tr>
                    <th className="px-4 py-3">
                      {t(language, 'Reading Date', 'Tarehe ya Usomaji')}
                    </th>

                    <th className="px-4 py-3">
                      {t(
                        language,
                        'Original House Label',
                        'Jina la Nyumba Lililorekodiwa'
                      )}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Meter Number', 'Namba ya Mita')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Previous Reading', 'Usomaji wa Nyuma')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Current Reading', 'Usomaji wa Sasa')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Units Used', 'Units Zilizotumika')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Rate', 'Bei kwa Unit')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Calculated Bill', 'Ankara Iliyokokotolewa')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Next Reading', 'Usomaji Uliofuata')}
                    </th>

                    <th className="px-4 py-3">
                      {t(language, 'Review', 'Uhakiki')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedLegacyMeters.map((meter) => {
                    const isPossibleDuplicate =
                      Number(
                        legacyKeyCounts[
                          makeLegacyDuplicateKey(meter)
                        ] || 0
                      ) > 1;

                    return (
                      <tr
                        key={meter.id}
                        className={`border-b ${
                          isPossibleDuplicate
                            ? 'bg-red-50'
                            : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-3">
                          {meter.readingDate || '-'}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {meter.houseNumber || '-'}
                        </td>

                        <td className="px-4 py-3">
                          {meter.meterNumber || '-'}
                        </td>

                        <td className="px-4 py-3">
                          {meter.previousUnits}
                        </td>

                        <td className="px-4 py-3">
                          {meter.currentUnits}
                        </td>

                        <td className="px-4 py-3 font-semibold text-cyan-700">
                          {meter.unitsUsed}
                        </td>

                        <td className="px-4 py-3">
                          TZS {currency(meter.costPerUnit)}
                        </td>

                        <td className="px-4 py-3 font-bold text-blue-700">
                          TZS {currency(meter.totalAmount)}
                        </td>

                        <td className="px-4 py-3">
                          {meter.nextReadingDate || '-'}
                        </td>

                        <td className="px-4 py-3">
                          {isPossibleDuplicate ? (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              {t(
                                language,
                                'Possible duplicate',
                                'Inaweza kuwa imerudiwa'
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {t(
                                language,
                                'Original record',
                                'Rekodi ya awali'
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
})()}
            {reportType === 'service' && (
        <Card>
          <CardHeader><CardTitle>{t(language, 'Service Charge Report', 'Ripoti ya Service Charge')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">{t(language, 'House', 'Nyumba')}</th>
                    <th className="py-2 pr-3">{t(language, 'Tenant', 'Mpangaji')}</th>
                    <th className="py-2 pr-3">{t(language, 'Amount', 'Kiasi')}</th>
                    <th className="py-2 pr-3">{t(language, 'Date Paid', 'Tarehe Ilipolipwa')}</th>
                    <th className="py-2 pr-3">{t(language, 'Next Payment', 'Malipo Yanayofuata')}</th>
                    <th className="py-2 pr-3">{t(language, 'Status', 'Hali')}</th>
                    <th className="py-2 pr-3">{t(language, 'Notes', 'Maelezo')}</th>
                    <th className="py-2 pr-3">{t(language, 'Actions', 'Vitendo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCharges.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 pr-3">{row.houseNumber}</td>
                      <td className="py-2 pr-3">{row.tenantName || '-'}</td>
                      <td className="py-2 pr-3">TZS {currency(row.serviceChargeAmount)}</td>
                      <td className="py-2 pr-3">{row.datePaid || '-'}</td>
                      <td className="py-2 pr-3">{row.nextPaymentDate || '-'}</td>
                      <td className="py-2 pr-3">{row.paymentStatus}</td>
                      <td className="py-2 pr-3">{row.notes || '-'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-amber-500 px-3 py-1 text-white"
                            onClick={() => onEditServiceCharge(row)}
                          >
                            {t(language, 'Edit', 'Hariri')}
                          </button>

                          <button
                            type="button"
                            className="rounded-lg bg-red-600 px-3 py-1 text-white"
                            onClick={() => {
                              const confirmed = window.confirm('Delete this service charge record?');
                              if (!confirmed) return;

                              onDeleteServiceCharge(row);
                            }}
                          >
                            {t(language, 'Delete', 'Futa')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'rentHistory' && (
        <Card>
          <CardHeader>
            <CardTitle>{t(language, 'Rent Payment History', 'Historia ya Malipo ya Kodi')}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
              {t(
                language,
                'This report is automatic and read-only. It records each rent payment saved from the main rent report.',
                'Ripoti hii inajijaza yenyewe na haisahihishwi hapa. Inatunza kila malipo ya kodi yanayohifadhiwa kupitia ripoti kuu ya kodi.'
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">{t(language, 'Date Paid', 'Tarehe Ilipolipwa')}</th>
                    <th className="py-2 pr-3">{t(language, 'House', 'Nyumba')}</th>
                    <th className="py-2 pr-3">{t(language, 'Tenant', 'Mpangaji')}</th>
                    <th className="py-2 pr-3">{t(language, 'Rent Start Date', 'Kodi Kuanza')}</th>
                    <th className="py-2 pr-3">{t(language, 'Rent End Date', 'Kodi Kuisha')}</th>
                    <th className="py-2 pr-3">{t(language, 'Amount Paid', 'Kiasi Kilicholipwa')}</th>
                    <th className="py-2 pr-3">{t(language, 'Payment Type', 'Aina ya Malipo')}</th>
                    <th className="py-2 pr-3">{t(language, 'Balance', 'Salio')}</th>
                    <th className="py-2 pr-3">{t(language, 'Next Payment', 'Malipo Yanayofuata')}</th>
                  </tr>
                </thead>

                <tbody>
                  {rentPayments.length === 0 ? (
                    <tr>
                      <td className="py-3 text-slate-500" colSpan={9}>
                        {t(
                          language,
                          'No rent payment history yet. Save a new rent payment to see it here.',
                          'Bado hakuna historia ya malipo ya kodi. Hifadhi malipo mapya ya kodi ili yaonekane hapa.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    rentPayments.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-2 pr-3">{row.rentPaidDate || '-'}</td>
                        <td className="py-2 pr-3">{row.houseNumber || '-'}</td>
                        <td className="py-2 pr-3">{row.tenantName || '-'}</td>
                        <td className="py-2 pr-3">{row.rentStartDate || '-'}</td>
                        <td className="py-2 pr-3">{row.rentEndDate || '-'}</td>
                        <td className="py-2 pr-3">TZS {currency(row.amountPaid)}</td>
                        <td className="py-2 pr-3">{row.paymentType || '-'}</td>
                        <td className="py-2 pr-3">TZS {currency(row.balance)}</td>
                        <td className="py-2 pr-3">{row.nextPaymentDate || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
