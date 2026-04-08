import React, { useMemo, useState } from 'react';

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

function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>{children}</div>;
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

  const houses = Array.isArray(data?.houses) ? data.houses : [];
  const meters = Array.isArray(data?.meters) ? data.meters : [];
  const serviceCharges = Array.isArray(data?.serviceCharges) ? data.serviceCharges : [];

  const [houseForm, setHouseForm] = useState({ ...emptyHouseForm });
  const [meterForm, setMeterForm] = useState({ ...emptyMeterForm });
  const [serviceChargeForm, setServiceChargeForm] = useState({ ...emptyServiceChargeForm });

  const meterPreviewUnitsUsed = Math.max(0, Number(meterForm.currentUnits || 0) - Number(meterForm.previousUnits || 0));
  const meterPreviewTotal = Math.max(0, meterPreviewUnitsUsed * Number(meterForm.costPerUnit || 0) - Number(meterForm.discount || 0));
  const meterPreviewNextReading = meterForm.readingDate ? addMonthsISO(meterForm.readingDate, 1) : '';

  const housePreview = useMemo(() => {
    const monthlyRent = Number(houseForm.monthlyRentAmount || 0);
    const paid = Number(houseForm.amountPaid || 0);
    const durationMonths = Number(houseForm.rentDurationMonths || 0);
    const rentStartDate = houseForm.rentStartDate || '';
    const paymentType = houseForm.paymentType || 'Full';

    let rentEndDate = '';
    let nextPaymentDate = '';

    if (rentStartDate) {
      if (paymentType === 'Partial' && monthlyRent > 0) {
        const proportion = paid / monthlyRent;
        const coveredDays = Math.max(1, Math.round(30 * proportion));
        rentEndDate = addDaysISO(rentStartDate, coveredDays - 1);
        nextPaymentDate = addDaysISO(rentEndDate, 1);
      } else {
        rentEndDate = addDaysISO(addMonthsISO(rentStartDate, durationMonths || 1), -1);
        nextPaymentDate = addDaysISO(rentEndDate, 1);
      }
    }

    const expectedAmount = monthlyRent * (durationMonths || 0);
    const balance = Math.max(0, expectedAmount - paid);

    return { rentEndDate, nextPaymentDate, balance };
  }, [houseForm]);

  const saveHouse = () => {
  if (!houseForm.houseNumber || !houseForm.monthlyRentAmount || !houseForm.rentStartDate) return;

  const monthlyRent = Number(houseForm.monthlyRentAmount || 0);
  const paid = Number(houseForm.amountPaid || 0);
  const durationMonths = Number(houseForm.rentDurationMonths || 0);
  const paymentType = houseForm.paymentType || 'Full';
  const expectedAmount = monthlyRent * (durationMonths || 0);

  const record = {
    id: houseForm.id || `house-${Date.now()}`,
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
    balance: Math.max(0, expectedAmount - paid),
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

  saveData({
    ...data,
    houses: updatedHouses,
  });

  setHouseForm({ ...emptyHouseForm });
};
  const saveMeter = () => {
  if (!meterForm.houseNumber || !meterForm.meterNumber || meterForm.previousUnits === '' || meterForm.currentUnits === '') return;

  const record = {
    id: meterForm.id || `meter-${Date.now()}`,
    houseNumber: meterForm.houseNumber,
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

  saveData({
    ...data,
    meters: updatedMeters,
  });

  setMeterForm({ ...emptyMeterForm });
};

  const saveServiceCharge = () => {
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

  setServiceChargeForm({ ...emptyServiceChargeForm });
};
const editHouse = (row) => {
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
  const today = todayISO();

  const dueSoon = houses.filter((h) => h.nextPaymentDate && daysBetween(today, h.nextPaymentDate) !== null && daysBetween(today, h.nextPaymentDate) >= 0 && daysBetween(today, h.nextPaymentDate) <= 7);
  const overdue = houses.filter((h) => h.nextPaymentDate && daysBetween(today, h.nextPaymentDate) < 0 && h.houseStatus === 'Occupied');
  const readingSoon = meters.filter((m) => m.nextReadingDate && daysBetween(today, m.nextReadingDate) !== null && daysBetween(today, m.nextReadingDate) >= 0 && daysBetween(today, m.nextReadingDate) <= 7);
  const serviceChargeSoon = serviceCharges.filter((s) => s.nextPaymentDate && daysBetween(today, s.nextPaymentDate) !== null && daysBetween(today, s.nextPaymentDate) >= 0 && daysBetween(today, s.nextPaymentDate) <= 7);

  const totalRent = houses.reduce((a, h) => a + Number(h.monthlyRentAmount || 0), 0);
  const totalPaid = houses.reduce((a, h) => a + Number(h.amountPaid || 0), 0);
  const totalOutstanding = houses.reduce((a, h) => a + Number(h.balance || 0), 0);
  const totalUnitsUsed = meters.reduce((a, m) => a + Number(m.unitsUsed || 0), 0);
  const totalWaterAmount = meters.reduce((a, m) => a + Number(m.totalAmount || 0), 0);
  const totalDiscount = meters.reduce((a, m) => a + Number(m.discount || 0), 0);
  const totalServiceCharge = serviceCharges.reduce((a, s) => a + Number(s.serviceChargeAmount || 0), 0);

  const tabs = [
    ['dashboard', t(language, 'Dashboard', 'Dashibodi')],
    ['houses', t(language, 'House Details', 'Taarifa za Nyumba')],
    ['meters', t(language, 'Meter Details', 'Taarifa za Mita')],
    ['servicecharge', t(language, 'Service Charge', 'Service Charge')],
    ['reports', t(language, 'Reports', 'Ripoti')],
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-2 shadow-sm">
  <div className="flex flex-wrap gap-2">
    {tabs.map(([value, label]) => (
      <button
        key={value}
        type="button"
        onClick={() => setActiveTab(value)}
        className={`rounded-xl px-4 py-2 text-sm ${activeTab === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
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
            <div className="grid gap-4 md:grid-cols-6">
              <Card><CardContent>{t(language, 'Occupied Houses', 'Nyumba Zenye Wapangaji')}: {houses.filter((h) => h.houseStatus === 'Occupied').length}</CardContent></Card>
              <Card><CardContent>{t(language, 'Vacant Houses', 'Nyumba Tupu')}: {houses.filter((h) => h.houseStatus === 'Vacant').length}</CardContent></Card>
              <Card><CardContent>{t(language, 'Rent Due Soon', 'Kodi Inakaribia')}: {dueSoon.length}</CardContent></Card>
              <Card><CardContent>{t(language, 'Overdue Rent', 'Kodi Iliyochelewa')}: {overdue.length}</CardContent></Card>
              <Card><CardContent>{t(language, 'Meter Reading Due Soon', 'Usomaji wa Mita Unakaribia')}: {readingSoon.length}</CardContent></Card>
              <Card><CardContent>{t(language, 'Service Charge Due Soon', 'Service Charge Inakaribia')}: {serviceChargeSoon.length}</CardContent></Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle>Upcoming Rent Reminder</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
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
                          <tr key={row.id} className="border-b">
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

              <Card>
                <CardHeader><CardTitle>Upcoming Meter Reminder</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 pr-3">House</th>
                          <th className="py-2 pr-3">Meter Number</th>
                          <th className="py-2 pr-3">Next Reading</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readingSoon.length === 0 ? (
                          <tr><td className="py-3 text-slate-500" colSpan={3}>No upcoming meter reading.</td></tr>
                        ) : readingSoon.map((row) => (
                          <tr key={row.id} className="border-b">
                            <td className="py-2 pr-3">{row.houseNumber}</td>
                            <td className="py-2 pr-3">{row.meterNumber}</td>
                            <td className="py-2 pr-3">{row.nextReadingDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Upcoming Service Charge Reminder</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
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
                          <tr key={row.id} className="border-b">
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
                <Input label={t(language, 'Rent Duration (Months)', 'Muda wa Kodi (Miezi)')} type="number" placeholder="e.g. 1, 2, 3" value={houseForm.rentDurationMonths} onChange={(e) => setHouseForm((p) => ({ ...p, rentDurationMonths: e.target.value }))} />
                <Select label={t(language, 'Payment Type', 'Aina ya Malipo')} value={houseForm.paymentType} onChange={(e) => setHouseForm((p) => ({ ...p, paymentType: e.target.value }))}>
                  <option value="Full">{t(language, 'Full', 'Kamili')}</option>
                  <option value="Partial">{t(language, 'Partial', 'Nusu')}</option>
                </Select>
                <Select label={t(language, 'House Status', 'Hali ya Nyumba')} value={houseForm.houseStatus} onChange={(e) => setHouseForm((p) => ({ ...p, houseStatus: e.target.value }))}>
                  <option value="Occupied">{t(language, 'Occupied', 'Ina Mpangaji')}</option>
                  <option value="Vacant">{t(language, 'Vacant', 'Tupu')}</option>
                </Select>
                <Textarea label={t(language, 'Items Issued / Notes', 'Vitu Vilivyotolewa / Maelezo')} rows={4} placeholder="Number of keys, cards, meter token, handover notes" value={houseForm.itemsIssued} onChange={(e) => setHouseForm((p) => ({ ...p, itemsIssued: e.target.value }))} />
                <div className="grid gap-3 md:grid-cols-2">
                  <PreviewValue label={t(language, 'Next Payment Date', 'Tarehe ya Malipo Yanayofuata')} value={housePreview.nextPaymentDate || '-'} />
                  <PreviewValue label={t(language, 'Outstanding Balance', 'Salio Linalodaiwa')} value={`TZS ${currency(housePreview.balance)}`} />
                </div>
                <Button type="button" onClick={saveHouse}>{t(language, 'Save House Details', 'Hifadhi Taarifa za Nyumba')}</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'meters' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{t(language, 'Meter Details', 'Taarifa za Mita')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input label={t(language, 'House Number', 'Namba ya Nyumba')} placeholder="e.g. G1" value={meterForm.houseNumber} onChange={(e) => setMeterForm((p) => ({ ...p, houseNumber: e.target.value }))} />
                <Select label={t(language, 'Meter Type', 'Aina ya Mita')} value={meterForm.meterType} onChange={(e) => setMeterForm((p) => ({ ...p, meterType: e.target.value }))}>
                  <option value="Water">{t(language, 'Water Meter', 'Mita ya Maji')}</option>
                  <option value="Electricity">{t(language, 'Electricity Meter', 'Mita ya Umeme')}</option>
                </Select>
                <Input label={t(language, 'Meter Number', 'Namba ya Mita')} placeholder="e.g. G1" value={meterForm.meterNumber} onChange={(e) => setMeterForm((p) => ({ ...p, meterNumber: e.target.value }))} />
                <Input label={t(language, 'Reading Date', 'Tarehe ya Usomaji')} type="date" value={meterForm.readingDate} onChange={(e) => setMeterForm((p) => ({ ...p, readingDate: e.target.value, nextReadingDate: addMonthsISO(e.target.value, 1) }))} />
                <Input label={t(language, 'Previous Units', 'Units za Zamani')} type="number" placeholder="Previous units" value={meterForm.previousUnits} onChange={(e) => setMeterForm((p) => ({ ...p, previousUnits: e.target.value }))} />
                <Input label={t(language, 'Current Units', 'Units za Sasa')} type="number" placeholder="Current units" value={meterForm.currentUnits} onChange={(e) => setMeterForm((p) => ({ ...p, currentUnits: e.target.value }))} />
                <Input label={t(language, 'Cost Per Unit', 'Bei kwa Unit')} type="number" placeholder="Cost per unit" value={meterForm.costPerUnit} onChange={(e) => setMeterForm((p) => ({ ...p, costPerUnit: e.target.value }))} />
                <Input label={t(language, 'Discount', 'Punguzo')} type="number" placeholder="Discount" value={meterForm.discount} onChange={(e) => setMeterForm((p) => ({ ...p, discount: e.target.value }))} />
                <Input label={t(language, 'Next Reading Date (Auto)', 'Tarehe ya Usomaji Ujao (Auto)')} type="date" value={meterPreviewNextReading} readOnly />
                <Textarea label={t(language, 'Notes', 'Maelezo')} rows={3} placeholder="Notes" value={meterForm.notes} onChange={(e) => setMeterForm((p) => ({ ...p, notes: e.target.value }))} />
                <div className="grid gap-3 md:grid-cols-3">
                  <PreviewValue label={t(language, 'Units Used', 'Units Zilizotumika')} value={meterPreviewUnitsUsed} />
                  <PreviewValue label="Cost Per Unit" value={`TZS ${currency(meterForm.costPerUnit)}`} />
                  <PreviewValue label={t(language, 'Total Amount To Be Paid', 'Jumla ya Kiasi cha Kulipa')} value={`TZS ${currency(meterPreviewTotal)}`} />
                </div>
                <Button type="button" onClick={saveMeter}>{t(language, 'Save Meter Details', 'Hifadhi Taarifa za Mita')}</Button>
              </CardContent>
            </Card>
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
  serviceCharges={serviceCharges}
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
  onDeleteHouse={(row) => {
    const confirmed = window.confirm('Delete this house record?');
    if (!confirmed) return;

    saveData({
      ...data,
      houses: houses.filter((item) => item.id !== row.id),
    });
  }}
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
  serviceCharges,
  totalRent,
  totalPaid,
  totalOutstanding,
  totalUnitsUsed,
  totalWaterAmount,
  totalDiscount,
  totalServiceCharge,
  onEditHouse,
  onDeleteHouse,
  onEditMeter,
}) {
  const [reportType, setReportType] = useState('rent');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="rent">{t(language, 'Rent Report', 'Ripoti ya Kodi')}</option>
          <option value="utilities">{t(language, 'Utilities Report', 'Ripoti ya Utilities')}</option>
          <option value="service">{t(language, 'Service Charge Report', 'Ripoti ya Service Charge')}</option>
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
                    <th className="py-2 pr-3">House Name</th>
                    <th className="py-2 pr-3">Tenant Name</th>
                    <th className="py-2 pr-3">Date Paid</th>
                    <th className="py-2 pr-3">Rent Start Date</th>
                    <th className="py-2 pr-3">Rent End Date</th>
                    <th className="py-2 pr-3">Next Date of Payment</th>
                    <th className="py-2 pr-3">Rent Amount</th>
                    <th className="py-2 pr-3">Amount Paid</th>
                    <th className="py-2 pr-3">Balance</th>
                    <th className="py-2 pr-3">Payment Status</th>
                    <th className="py-2 pr-3">House Status</th>
                    <th className="py-2 pr-3">Items Issued / Notes</th>
<th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.map((row) => (
                    <tr key={row.id} className="border-b">
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
  <div className="flex gap-2">
 <button
  type="button"
  className="rounded-lg bg-amber-500 px-3 py-1 text-white"
  onClick={() => onEditHouse(row)}
>
  Edit
</button>

   <button
  type="button"
  className="rounded-lg bg-red-600 px-3 py-1 text-white"
  onClick={() => {
    const confirmed = window.confirm('Delete this house record?');
    if (!confirmed) return;

    onDeleteHouse(row);
  }}
>
  Delete
</button>
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

      {reportType === 'utilities' && (
  <Card>
    <CardHeader><CardTitle>{t(language, 'Utilities Report', 'Ripoti ya Utilities')}</CardTitle></CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3">House</th>
              <th className="py-2 pr-3">Meter</th>
              <th className="py-2 pr-3">Units Used</th>
              <th className="py-2 pr-3">Total Amount</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
               <tbody>
  {meters.map((row) => (
    <tr key={row.id} className="border-b">
      <td className="py-2 pr-3">{row.houseNumber}</td>
      <td className="py-2 pr-3">{row.meterNumber}</td>
      <td className="py-2 pr-3">{row.unitsUsed}</td>
      <td className="py-2 pr-3">TZS {currency(row.totalAmount)}</td>

      <td className="py-2 pr-3">
        <div className="flex gap-2">
          <button
  type="button"
  className="rounded-lg bg-amber-500 px-3 py-1 text-white"
  onClick={() => onEditMeter(row)}
>
  Edit
</button>

          <button
            type="button"
            className="rounded-lg bg-red-600 px-3 py-1 text-white"
            onClick={() => alert('meter delete next')}
          >
            Delete
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

      {reportType === 'service' && (
        <Card>
          <CardHeader><CardTitle>{t(language, 'Service Charge Report', 'Ripoti ya Service Charge')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">House</th>
                    <th className="py-2 pr-3">Tenant</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCharges.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 pr-3">{row.houseNumber}</td>
                      <td className="py-2 pr-3">{row.tenantName || '-'}</td>
                      <td className="py-2 pr-3">TZS {currency(row.serviceChargeAmount)}</td>
                      <td className="py-2 pr-3">{row.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
