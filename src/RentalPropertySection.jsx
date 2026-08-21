import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const currency = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));

const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

const emptyMeterForm = {
  id: '',
  houseNumber: '',
  meterType: 'Water',
  meterNumber: '',
  readingDate: todayISO(),
  paymentReceived: 'No',
  paymentDate: '',
  amountReceived: '',
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
const emptyWaterPaymentForm = {
  houseNumber: '',
  tenantName: '',
  meterId: '',
  meterNumber: '',
  amountReceived: '',
  paymentDate: todayISO(),
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
  const [activeWaterSection, setActiveWaterSection] = useState('summary');
const [showWaterOptionalFields, setShowWaterOptionalFields] = useState(false);

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

const waterPaymentAllocations = Array.isArray(
  data?.waterPaymentAllocations
)
  ? data.waterPaymentAllocations
  : [];

const serviceCharges = Array.isArray(data?.serviceCharges)
  ? data.serviceCharges
  : [];

const rentPayments = Array.isArray(data?.rentPayments)
  ? data.rentPayments
  : [];

  const [houseForm, setHouseForm] = useState({ ...emptyHouseForm });
  const [meterForm, setMeterForm] = useState({ ...emptyMeterForm });
  const [isSavingMeter, setIsSavingMeter] = useState(false);
  const [waterPaymentForm, setWaterPaymentForm] = useState({
  ...emptyWaterPaymentForm,
});

const [isWaterPaymentOpen, setIsWaterPaymentOpen] = useState(false);
const [isSavingWaterPayment, setIsSavingWaterPayment] = useState(false);
  const [serviceChargeForm, setServiceChargeForm] = useState({ ...emptyServiceChargeForm });
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

const selectedMeterOutstandingBalance = waterBills
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

  const saveMeter = async () => {
  if (
    !meterForm.houseNumber ||
    !meterForm.meterNumber ||
    meterForm.previousUnits === '' ||
    (hasExistingMeter && meterForm.currentUnits === '')
  ) {
    alert(
      t(
        language,
        hasExistingMeter
          ? 'Please select a house and enter the current meter reading.'
          : 'Please select a house and enter the meter number and opening reading.',
        hasExistingMeter
          ? 'Tafadhali chagua nyumba na uweke usomaji wa sasa wa mita.'
          : 'Tafadhali chagua nyumba na uweke namba ya mita pamoja na usomaji wa kuanzia.'
      )
    );
    return;
  }

  if (
    hasExistingMeter &&
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

const registeredMeter = waterMeters.find(
  (meter) =>
    String(meter.houseNumber || '') ===
      String(meterForm.houseNumber || '') &&
    String(meter.meterNumber || '') ===
      String(meterForm.meterNumber || '') &&
    meter.active !== false
);

const meterRegistryId =
  registeredMeter?.id || `water-meter-${Date.now()}`;

const permanentMeterRecord = {
  id: meterRegistryId,
  shop_id: shopId,
  houseNumber: meterForm.houseNumber,
  meterNumber: meterForm.meterNumber,
  meterType: meterForm.meterType || 'Water',
  costPerUnit: Number(meterForm.costPerUnit || WATER_UNIT_PRICE),
  openingReading: registeredMeter
    ? Number(registeredMeter.openingReading || 0)
    : Number(meterForm.previousUnits || 0),
  lastReading: registeredMeter
    ? Number(meterForm.currentUnits || 0)
    : Number(meterForm.previousUnits || 0),
  lastReadingDate: meterForm.readingDate || null,
  nextReadingDate: meterPreviewNextReading || null,
  active: true,
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

const previousOutstandingBalance = waterBills
  .filter(
    (bill) =>
      String(bill.meterId || '') === String(meterRegistryId) &&
      Number(bill.balance || 0) > 0
  )
  .reduce(
    (total, bill) => total + Number(bill.balance || 0),
    0
  );

const currentBillAmount = Number(meterPreviewTotal || 0);

const waterBillRecord = {
  id: `water-bill-${Date.now()}`,
  shop_id: shopId,
  meterId: meterRegistryId,
  houseNumber: meterForm.houseNumber,
  tenantName: selectedHouse?.tenantName || '',
  houseStatus: selectedHouse?.houseStatus || '',
  meterNumber: meterForm.meterNumber,
  billingPeriodStart:
    registeredMeter?.lastReadingDate ||
    latestExistingReading?.readingDate ||
    null,
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
  previousBalance: previousOutstandingBalance,
  totalPayable:
    previousOutstandingBalance + currentBillAmount,
  amountPaid: 0,
  balance: currentBillAmount,
  status: currentBillAmount > 0 ? 'Unpaid' : 'Paid',
  dueDate: meterPreviewNextReading || null,
  nextReadingDate: meterPreviewNextReading || null,
  notes: meterForm.notes || '',
  created_at: new Date().toISOString(),
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
    currentUnits: registeredMeter
      ? Number(meterForm.currentUnits || 0)
      : Number(meterForm.previousUnits || 0),
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

const updatedWaterBills = registeredMeter
  ? [waterBillRecord, ...waterBills]
  : waterBills;

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
if (!registeredMeter) {
  alert(
    t(
      language,
      'The water meter and its opening reading were saved successfully. The first bill will be created after the next reading.',
      'Mita ya maji na usomaji wake wa kuanzia vimehifadhiwa. Ankara ya kwanza itatengenezwa baada ya usomaji unaofuata.'
    )
  );

  setMeterForm({ ...emptyMeterForm });
  return;
}
const { error: waterBillError } = await supabase
  .from('waterBills')
  .insert([waterBillRecord]);

if (waterBillError) {
  alert(
    `Monthly water bill sync failed: ${waterBillError.message}`
  );
  return;
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

  const dueSoon = houses.filter((h) => h.nextPaymentDate && daysBetween(today, h.nextPaymentDate) !== null && daysBetween(today, h.nextPaymentDate) >= 0 && daysBetween(today, h.nextPaymentDate) <= 7);
  const overdue = houses.filter((h) => h.nextPaymentDate && daysBetween(today, h.nextPaymentDate) < 0 && h.houseStatus === 'Occupied');
 const meterReminderSource = waterMeters.filter(
  (meter) => meter.active !== false
);

const housesWithoutMeters = houses.filter(
  (house) =>
    house.houseStatus === 'Occupied' &&
    !meterReminderSource.some(
      (meter) =>
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
  ...housesWithoutMeters.map((house) => ({
    id: `missing-meter-${house.id}`,
    houseNumber: house.houseNumber,
    meterNumber: '',
    lastReading: null,
    lastReadingDate: null,
    nextReadingDate: null,
    attentionType: 'missingMeter',
  })),
  ...metersWithoutReadings.map((meter) => ({
    ...meter,
    attentionType: 'noReading',
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

const totalDiscount = waterBills.reduce(
  (total, bill) =>
    total + Number(bill.discount || 0),
  0
);

const totalServiceCharge = serviceCharges.reduce(
  (total, service) =>
    total + Number(service.serviceChargeAmount || 0),
  0
);

  const tabs = [
    ['dashboard', t(language, 'Dashboard', 'Dashibodi')],
    ['houses', t(language, 'House Details', 'Taarifa za Nyumba')],
    ['meters', t(language, 'Water Information', 'Taarifa za Maji')],
    ['servicecharge', t(language, 'Service Charge', 'Service Charge')],
    ['reports', t(language, 'Reports', 'Ripoti')],
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
  ['alerts', t(language, 'Account Alerts', 'Tahadhari za Akaunti')],
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
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{t(language, 'House Details', 'Taarifa za Nyumba')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input label={t(language, 'House Number', 'Namba ya Nyumba')}  placeholder="e.g. G1" value={houseForm.houseNumber} onChange={(e) => setHouseForm((p) => ({ ...p, houseNumber: e.target.value }))} />
                <Input label={t(language, 'Tenant Name', 'Jina la Mpangaji')} placeholder="Tenant name" value={houseForm.tenantName} onChange={(e) => setHouseForm((p) => ({ ...p, tenantName: e.target.value }))} />
                <Input label={t(language, 'Date Rent Was Paid', 'Tarehe Kodi Ililipwa')} type="date" value={houseForm.rentPaidDate} onChange={(e) => setHouseForm((p) => ({ ...p, rentPaidDate: e.target.value }))} />
                <Input label={t(language, 'Rent Start Date', 'Tarehe Kodi Kuanza')} type="date" value={houseForm.rentStartDate} onChange={(e) => setHouseForm((p) => ({ ...p, rentStartDate: e.target.value }))} />
                <Input label={t(language, 'Rent End Date (Auto)', 'Tarehe Kodi Kuisha (Auto)')} type="date" value={housePreview.rentEndDate} readOnly />
                <Input label={t(language, 'Monthly Rent Amount', 'Kiasi cha Kodi kwa Mwezi')} type="number" placeholder="Amount" value={houseForm.monthlyRentAmount} onChange={(e) => setHouseForm((p) => ({ ...p, monthlyRentAmount: e.target.value }))} />
                <Input label={t(language, 'Amount Paid', 'Kiasi Kilicholipwa')} type="number" placeholder="Amount paid" value={houseForm.amountPaid} onChange={(e) => setHouseForm((p) => ({ ...p, amountPaid: e.target.value }))} />
                <PreviewValue
                  label={t(language, 'Rent Duration Covered (Auto)', 'Muda wa Kodi Uliolipwa (Auto)')}
                  value={
                    housePreview.calculatedMonths
                      ? `${housePreview.calculatedMonths.toFixed(2)} month(s)`
                      : '-'
                  }
                />

                <PreviewValue
                  label={t(language, 'Payment Type (Auto)', 'Aina ya Malipo (Auto)')}
                  value={housePreview.paymentStatus}
                />
                <Select label={t(language, 'House Status', 'Hali ya Nyumba')} value={houseForm.houseStatus} onChange={(e) => setHouseForm((p) => ({ ...p, houseStatus: e.target.value }))}>
                  <option value="Occupied">{t(language, 'Occupied', 'Ina Mpangaji')}</option>
                  <option value="Vacant">{t(language, 'Vacant', 'Tupu')}</option>
                </Select>
                <Textarea label={t(language, 'Items Issued / Notes', 'Vitu Vilivyotolewa / Maelezo')} rows={4} placeholder="Number of keys, cards, meter token, handover notes" value={houseForm.itemsIssued} onChange={(e) => setHouseForm((p) => ({ ...p, itemsIssued: e.target.value }))} />
                <div className="grid gap-3 md:grid-cols-2">
  <PreviewValue
    label={t(language, 'Next Payment Date', 'Tarehe ya Malipo Yanayofuata')}
    value={housePreview.nextPaymentDate || '-'}
  />

  <PreviewValue
    label={t(language, 'Full Months Paid', 'Miezi Kamili Iliyolipwa')}
    value={housePreview.fullMonths || 0}
  />

  <PreviewValue
    label={t(language, 'Amount Exceeding Full Months', 'Kiasi Kilichozidi Kuelekea Mwezi Unaofuata')}
    value={`TZS ${currency(housePreview.extraAmount)}`}
  />

  <PreviewValue
    label={t(language, 'Deficit to Complete Next Month', 'Pungufu ya Kukamilisha Mwezi Unaofuata')}
    value={`TZS ${currency(housePreview.balance)}`}
  />
</div>
                <Button type="button" onClick={saveHouse}>{t(language, 'Save House Details', 'Hifadhi Taarifa za Nyumba')}</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'meters' && (
          <div className="rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">
                  {t(
                    language,
                    'Water Management System',
                    'Mfumo wa Usimamizi wa Maji'
                  )}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {t(language, 'Water Information', 'Taarifa za Maji')}
                </h2>

                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                  {t(
                    language,
                    'Manage meter readings, water bills, tenant payments and accounts requiring attention.',
                    'Sehemu hii inasimamia usomaji wa mita, ankara za maji, malipo ya wapangaji na akaunti zinazohitaji hatua.'
                  )}
                </p>
              </div>

              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                {t(language, 'Owner only', 'Mmiliki pekee')}
              </span>
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
        meterNumber: e.target.value,
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
    previousMeterReading?.readingDate || '';

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
      hasExistingMeter
        ? t(
            language,
            'Previous Reading (Automatic)',
            'Usomaji Uliopita (Automatic)'
          )
        : t(
            language,
            'Opening Meter Reading',
            'Usomaji wa Kuanzia wa Mita'
          )
    }
    type="number"
    value={meterForm.previousUnits}
    readOnly={hasExistingMeter}
    className={
      hasExistingMeter
        ? 'cursor-not-allowed bg-slate-200 font-semibold text-slate-800'
        : 'bg-white'
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
    {hasExistingMeter
      ? t(
          language,
          'Retrieved from the latest saved reading.',
          'Imechukuliwa kutoka kwenye usomaji wa mwisho uliohifadhiwa.'
        )
      : t(
          language,
          'Required only when registering the meter for the first time.',
          'Inahitajika mara moja tu wakati wa kusajili mita kwa mara ya kwanza.'
        )}
  </p>
</div>

  <div
    className={`${
      hasExistingMeter ? '' : 'hidden'
    } self-start rounded-2xl border p-4 ${
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
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{t(language, 'Service Charge Details', 'Taarifa za Service Charge')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input label={t(language, 'House Name', 'Jina la Nyumba')} placeholder="e.g. G1" value={serviceChargeForm.houseNumber} onChange={(e) => setServiceChargeForm((p) => ({ ...p, houseNumber: e.target.value }))} />
                <Input label={t(language, 'Tenant Name', 'Jina la Mpangaji')} placeholder="Tenant name" value={serviceChargeForm.tenantName} onChange={(e) => setServiceChargeForm((p) => ({ ...p, tenantName: e.target.value }))} />
                <Input label={t(language, 'Service Charge Amount', 'Kiasi cha Service Charge')} type="number" value={serviceChargeForm.serviceChargeAmount} onChange={(e) => setServiceChargeForm((p) => ({ ...p, serviceChargeAmount: e.target.value }))} />
                <Input label={t(language, 'Date Paid', 'Tarehe Ilipolipwa')} type="date" value={serviceChargeForm.datePaid} onChange={(e) => setServiceChargeForm((p) => ({ ...p, datePaid: e.target.value, nextPaymentDate: addMonthsISO(e.target.value, 1) }))} />
                <Input label={t(language, 'Next Date of Payment', 'Tarehe ya Malipo Yanayofuata')} type="date" value={serviceChargeForm.nextPaymentDate || (serviceChargeForm.datePaid ? addMonthsISO(serviceChargeForm.datePaid, 1) : '')} readOnly />
                <Select label={t(language, 'Payment Status', 'Hali ya Malipo')} value={serviceChargeForm.paymentStatus} onChange={(e) => setServiceChargeForm((p) => ({ ...p, paymentStatus: e.target.value }))}>
                  <option value="Paid">{t(language, 'Paid', 'Imelipwa')}</option>
                  <option value="Unpaid">{t(language, 'Unpaid', 'Haijalipwa')}</option>
                </Select>
                <Textarea label={t(language, 'Notes', 'Maelezo')} rows={3} value={serviceChargeForm.notes} onChange={(e) => setServiceChargeForm((p) => ({ ...p, notes: e.target.value }))} />
                <Button type="button" onClick={saveServiceCharge}>{t(language, 'Save Service Charge', 'Hifadhi Service Charge')}</Button>
              </CardContent>
            </Card>
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
  houses,
  meters,
  waterMeters,
  waterBills,
  waterPayments,
waterPaymentAllocations,
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
  const [reportType, setReportType] = useState('rent');
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
      <div className="flex justify-end">
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="rent">{t(language, 'Rent Report', 'Ripoti ya Kodi')}</option>
          <option value="waterMeters">
  {t(
    language,
    'Water Meter Register',
    'Rejesta ya Mita za Maji'
  )}
</option>

<option value="waterBills">
  {t(
    language,
    'Monthly Water Bills',
    'Ankara za Maji za Mwezi'
  )}
</option>

<option value="waterPayments">
  {t(
    language,
    'Water Payment History',
    'Historia ya Malipo ya Maji'
  )}
</option>

<option value="legacyWater">
  {t(
    language,
    'Previous Water Records',
    'Historia ya Zamani ya Maji'
  )}
</option>
          <option value="service">{t(language, 'Service Charge Report', 'Ripoti ya Service Charge')}</option>
                    <option value="rentHistory">{t(language, 'Rent Payment History', 'Historia ya Malipo ya Kodi')}</option>
        </select>
      </div>

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

              return days !== null && days >= 0 && days <= 7;
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

              return days !== null && days < 0;
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

                const readingStatus =
                  readingDays === null
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
                            {meter.nextReadingDate || '-'}
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
