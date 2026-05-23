import React, { useMemo, useState } from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
const GAS_PRICE_BOOK = {
  'Taifa Gas': {
    // Mihan/Taifa Gas use the same company price
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
    // O Gas is currently used for small cylinder only.
    smallBuy: 21000,
    smallSell: 25000,

    // Keep these unchanged for now to avoid breaking any existing code
    // that expects bigBuy/bigSell to exist.
    bigBuy: 49000,
    bigSell: 55000,
  },
};
function getGasProfitBreakdown(entry) {
  const smallSellPrice = Number(entry.smallGasSellPrice || 0);
  const smallBuyPrice = Number(entry.smallGasBuyPrice || 0);
  const bigSellPrice = Number(entry.bigGasSellPrice || 0);
  const bigBuyPrice = Number(entry.bigGasBuyPrice || 0);

  const smallQtySold = Number(entry.smallGasSoldToday || 0);
  const bigQtySold = Number(entry.bigGasSoldToday || 0);

  const smallGasProfit = smallQtySold * (smallSellPrice - smallBuyPrice);
  const bigGasProfit = bigQtySold * (bigSellPrice - bigBuyPrice);

  return {
    smallGasProfit,
    bigGasProfit,
    totalProfit: smallGasProfit + bigGasProfit,
  };
}

function getGasAlignmentWarnings(entry, language, t, formatQty) {
  const smallTotalRaw = entry.smallCylindersTotal;
  const bigTotalRaw = entry.bigCylindersTotal;

  const smallWithGasRaw = entry.smallCylindersWithGas;
  const smallEmptyRaw = entry.smallEmptyCylinders;
  const bigWithGasRaw = entry.bigCylindersWithGas;
  const bigEmptyRaw = entry.bigEmptyCylinders;

  const smallTotalWasFilled = String(smallTotalRaw ?? '').trim() !== '' && Number(smallTotalRaw || 0) > 0;
  const bigTotalWasFilled = String(bigTotalRaw ?? '').trim() !== '' && Number(bigTotalRaw || 0) > 0;

  const smallPartsWereFilled =
    String(smallWithGasRaw ?? '').trim() !== '' ||
    String(smallEmptyRaw ?? '').trim() !== '';

  const bigPartsWereFilled =
    String(bigWithGasRaw ?? '').trim() !== '' ||
    String(bigEmptyRaw ?? '').trim() !== '';

  const smallTotal = Number(smallTotalRaw || 0);
  const bigTotal = Number(bigTotalRaw || 0);

  const smallParts =
    Number(smallWithGasRaw || 0) + Number(smallEmptyRaw || 0);

  const bigParts =
    Number(bigWithGasRaw || 0) + Number(bigEmptyRaw || 0);

  const smallCheckReady = smallTotalWasFilled && smallPartsWereFilled;
  const bigCheckReady = bigTotalWasFilled && bigPartsWereFilled;

  const smallMatches = !smallCheckReady || smallTotal === smallParts;
  const bigMatches = !bigCheckReady || bigTotal === bigParts;

  return {
    smallMatches,
    bigMatches,

    smallMessage: !smallCheckReady
      ? t(
          language,
          'Small cylinder check will appear after total cylinders and cylinder status are filled.',
          'Uhakiki wa mitungi midogo utaonekana baada ya kujaza jumla ya mitungi na hali ya mitungi.'
        )
      : smallTotal === smallParts
        ? t(language, 'Small cylinders are aligned.', 'Mitungi midogo imeoana sawa.')
        : `${t(language, 'Small cylinders do not match: total is', 'Mitungi midogo haioani: jumla ni')} ${formatQty(smallTotal)} ${t(language, 'but with gas + empty is', 'lakini yenye gesi + mitupu ni')} ${formatQty(smallParts)}.`,

    bigMessage: !bigCheckReady
      ? t(
          language,
          'Big cylinder check will appear after total cylinders and cylinder status are filled.',
          'Uhakiki wa mitungi mikubwa utaonekana baada ya kujaza jumla ya mitungi na hali ya mitungi.'
        )
      : bigTotal === bigParts
        ? t(language, 'Big cylinders are aligned.', 'Mitungi mikubwa imeoana sawa.')
        : `${t(language, 'Big cylinders do not match: total is', 'Mitungi mikubwa haioani: jumla ni')} ${formatQty(bigTotal)} ${t(language, 'but with gas + empty is', 'lakini yenye gesi + mitupu ni')} ${formatQty(bigParts)}.`,
  };
}

export function buildGasRecord(gasForm, existingEntry) {
  return {
  id: gasForm.id || `gas-${Date.now()}`,
  date: gasForm.date,
  gasType: gasForm.gasType || 'Taifa Gas',
  cylinderSize: gasForm.cylinderSize || 'Small Cylinder',
    totalCylinders: Number(gasForm.totalCylinders || 0),
    smallCylindersTotal: Number(gasForm.smallCylindersTotal || 0),
    bigCylindersTotal: Number(gasForm.bigCylindersTotal || 0),
    smallCylindersWithGas: Number(gasForm.smallCylindersWithGas || 0),
    bigCylindersWithGas: Number(gasForm.bigCylindersWithGas || 0),
    smallEmptyCylinders: Number(gasForm.smallEmptyCylinders || 0),
    bigEmptyCylinders: Number(gasForm.bigEmptyCylinders || 0),
    smallGasSoldToday: Number(gasForm.smallGasSoldToday || 0),
    bigGasSoldToday: Number(gasForm.bigGasSoldToday || 0),
    smallGasBuyPrice: Number(gasForm.smallGasBuyPrice || 0),
    smallGasSellPrice: Number(gasForm.smallGasSellPrice || 0),
    bigGasBuyPrice: Number(gasForm.bigGasBuyPrice || 0),
    bigGasSellPrice: Number(gasForm.bigGasSellPrice || 0),
    originalSmallCylindersTotal: existingEntry
      ? Number(existingEntry.originalSmallCylindersTotal ?? existingEntry.smallCylindersTotal ?? 0)
      : Number(gasForm.smallCylindersTotal || 0),
    originalBigCylindersTotal: existingEntry
      ? Number(existingEntry.originalBigCylindersTotal ?? existingEntry.bigCylindersTotal ?? 0)
      : Number(gasForm.bigCylindersTotal || 0),
  };
}

export function getGasDashboardSummary(todayGasEntries) {
  return todayGasEntries.reduce(
    (acc, entry) => {
      const profits = getGasProfitBreakdown(entry);
      const originalSmallTotal = Number(entry.originalSmallCylindersTotal ?? entry.smallCylindersTotal ?? 0);
      const originalBigTotal = Number(entry.originalBigCylindersTotal ?? entry.bigCylindersTotal ?? 0);
      const currentSmallTotal = Number(entry.smallCylindersTotal || 0);
      const currentBigTotal = Number(entry.bigCylindersTotal || 0);

      acc.smallCylindersTotal += currentSmallTotal;
      acc.bigCylindersTotal += currentBigTotal;
      acc.smallGasSold += Number(entry.smallGasSoldToday || 0);
      acc.bigGasSold += Number(entry.bigGasSoldToday || 0);
      acc.totalProfit += Number(profits.totalProfit || 0);
      if (currentSmallTotal !== originalSmallTotal) {
        acc.smallAlerts.push({ before: originalSmallTotal, after: currentSmallTotal, date: entry.date });
      }
      if (currentBigTotal !== originalBigTotal) {
        acc.bigAlerts.push({ before: originalBigTotal, after: currentBigTotal, date: entry.date });
      }
      return acc;
    },
    {
      smallCylindersTotal: 0,
      bigCylindersTotal: 0,
      smallGasSold: 0,
      bigGasSold: 0,
      totalProfit: 0,
      smallAlerts: [],
      bigAlerts: [],
    },
  );
}

export function GasDashboardCard({ Card, CardHeader, CardTitle, CardContent, todayGasSummary, t, language, formatQty, currency }) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t(language, 'Gas Summary Today', 'Muhtasari wa Gesi Leo')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>{t(language, 'Small Cylinders Total', 'Jumla ya Mitungi Midogo')}: {formatQty(todayGasSummary.smallCylindersTotal)}</div>
          <div>{t(language, 'Big Cylinders Total', 'Jumla ya Mitungi Mikubwa')}: {formatQty(todayGasSummary.bigCylindersTotal)}</div>
          <div>{t(language, 'Small Gas Sold', 'Gesi Ndogo Iliyuzwa')}: {formatQty(todayGasSummary.smallGasSold)}</div>
          <div>{t(language, 'Big Gas Sold', 'Gesi Kubwa Iliyuzwa')}: {formatQty(todayGasSummary.bigGasSold)}</div>
          <div>{t(language, 'Total Gas Profit', 'Jumla ya Faida ya Gesi')}: TZS {currency(todayGasSummary.totalProfit)}</div>
        </div>

        {todayGasSummary.smallAlerts.length > 0 || todayGasSummary.bigAlerts.length > 0 ? (
          <div className="space-y-2">
            {todayGasSummary.smallAlerts.map((item, index) => (
              <div key={`small-${index}`} className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                {t(language, 'Small cylinders changed from', 'Mitungi midogo imebadilika kutoka')} {formatQty(item.before)} {t(language, 'to', 'hadi')} {formatQty(item.after)} {t(language, 'on', 'tarehe')} {item.date}.
              </div>
            ))}
            {todayGasSummary.bigAlerts.map((item, index) => (
              <div key={`big-${index}`} className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                {t(language, 'Big cylinders changed from', 'Mitungi mikubwa imebadilika kutoka')} {formatQty(item.before)} {t(language, 'to', 'hadi')} {formatQty(item.after)} {t(language, 'on', 'tarehe')} {item.date}.
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function GasBusinessSection({
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  language,
  t,
  currency,
  formatQty,
  todayISO,
gasTypes,
gasCylinderSizes,
  gasForm,
  setGasForm,
showGasStatus,
setShowGasStatus,
showGasSales,
setShowGasSales,
showGasPrices,
setShowGasPrices,
  gasEntries,
  todayGasEntries,
  isOwnerUser,
  onSaveGas,
  onEditGas,
  onDeleteGas,
  gasSalesRows,
  addGasSalesRow,
  updateGasSalesRow,
  removeGasSalesRow,
}) {
  const liveGasProfit = useMemo(() => getGasProfitBreakdown(gasForm), [gasForm]);
  const liveGasAlignment = useMemo(
    () => getGasAlignmentWarnings(gasForm, language, t, formatQty),
    [gasForm, language, t, formatQty],
  );
const [quickGasSaleForm, setQuickGasSaleForm] = useState({
  date: todayISO(),
  gasType: '',
  cylinderSize: '',
  quantity: '1',
});

const quickGasPrices = useMemo(() => {
  const gasType = quickGasSaleForm.gasType;
  const cylinderSize = quickGasSaleForm.cylinderSize;

  if (!gasType || !cylinderSize) {
    return {
      buyPrice: 0,
      sellPrice: 0,
    };
  }

  const priceDefaults = GAS_PRICE_BOOK[gasType] || null;

  if (!priceDefaults) {
    return {
      buyPrice: 0,
      sellPrice: 0,
    };
  }

  const isSmall = cylinderSize === 'Small Cylinder';

  return {
    buyPrice: isSmall ? Number(priceDefaults.smallBuy || 0) : Number(priceDefaults.bigBuy || 0),
    sellPrice: isSmall ? Number(priceDefaults.smallSell || 0) : Number(priceDefaults.bigSell || 0),
  };
}, [quickGasSaleForm.gasType, quickGasSaleForm.cylinderSize]);

const quickGasSalePreview = useMemo(() => {
  const qty = Number(quickGasSaleForm.quantity || 0);

  return {
    qty,
    totalSale: qty * quickGasPrices.sellPrice,
    totalProfit: qty * (quickGasPrices.sellPrice - quickGasPrices.buyPrice),
  };
}, [quickGasSaleForm.quantity, quickGasPrices]);

const saveQuickGasSale = async () => {
  const qty = Number(quickGasSaleForm.quantity || 0);

if (!quickGasSaleForm.gasType) {
  alert(t(language, 'Please select gas type sold.', 'Tafadhali chagua aina ya gesi iliyouzwa.'));
  return;
}

if (!quickGasSaleForm.cylinderSize) {
  alert(t(language, 'Please select cylinder size sold.', 'Tafadhali chagua ukubwa wa mtungi uliouzwa.'));
  return;
}

if (!qty || qty <= 0) {
  alert(t(language, 'Please enter quantity sold.', 'Tafadhali jaza idadi iliyouzwa.'));
  return;
}

  if (!quickGasPrices.buyPrice || !quickGasPrices.sellPrice) {
    alert(t(language, 'Gas prices are missing for this gas type.', 'Bei za gesi hazipo kwa aina hii ya gesi.'));
    return;
  }

  const isSmall = quickGasSaleForm.cylinderSize === 'Small Cylinder';
  const todayRecord =
    (todayGasEntries || []).find((entry) => String(entry.date || '') === String(quickGasSaleForm.date || todayISO())) ||
    null;

  const base = todayRecord || gasForm || {};

  const nextGasForm = {
    ...base,
    id: base.id || gasForm.id || '',
    date: quickGasSaleForm.date || todayISO(),
    gasType: quickGasSaleForm.gasType || 'Taifa Gas',
    cylinderSize: quickGasSaleForm.cylinderSize || 'Small Cylinder',

    smallGasBuyPrice: String(
      isSmall ? quickGasPrices.buyPrice : (base.smallGasBuyPrice || GAS_PRICE_BOOK[quickGasSaleForm.gasType]?.smallBuy || 0)
    ),
    smallGasSellPrice: String(
      isSmall ? quickGasPrices.sellPrice : (base.smallGasSellPrice || GAS_PRICE_BOOK[quickGasSaleForm.gasType]?.smallSell || 0)
    ),
    bigGasBuyPrice: String(
      !isSmall ? quickGasPrices.buyPrice : (base.bigGasBuyPrice || GAS_PRICE_BOOK[quickGasSaleForm.gasType]?.bigBuy || 0)
    ),
    bigGasSellPrice: String(
      !isSmall ? quickGasPrices.sellPrice : (base.bigGasSellPrice || GAS_PRICE_BOOK[quickGasSaleForm.gasType]?.bigSell || 0)
    ),

    smallGasSoldToday: String(Number(base.smallGasSoldToday || 0) + (isSmall ? qty : 0)),
    bigGasSoldToday: String(Number(base.bigGasSoldToday || 0) + (!isSmall ? qty : 0)),

    smallCylindersWithGas: String(
      isSmall
        ? Math.max(0, Number(base.smallCylindersWithGas || 0) - qty)
        : Number(base.smallCylindersWithGas || 0)
    ),
    bigCylindersWithGas: String(
      !isSmall
        ? Math.max(0, Number(base.bigCylindersWithGas || 0) - qty)
        : Number(base.bigCylindersWithGas || 0)
    ),

    smallEmptyCylinders: String(Number(base.smallEmptyCylinders || 0) + (isSmall ? qty : 0)),
    bigEmptyCylinders: String(Number(base.bigEmptyCylinders || 0) + (!isSmall ? qty : 0)),
  };

  setGasForm(nextGasForm);

  const saved = await onSaveGas(nextGasForm, { keepGasForm: true });

  if (saved) {
    alert(t(language, 'Gas sale saved successfully.', 'Mauzo ya gesi yamehifadhiwa kikamilifu.'));

    setQuickGasSaleForm((prev) => ({
  ...prev,
  date: todayISO(),
  gasType: '',
  cylinderSize: '',
  quantity: '1',
}));
  }
};

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t(language, 'Gas Business', 'Biashara ya Gesi')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
  {!isOwnerUser && !gasForm.id && todayGasEntries.length > 0 ? (
  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
    Mauzo ya gesi ya leo yanaendelea kurekodiwa. Bado unaweza kujaza taarifa kamili za gesi baada ya kufunga biashara.
  </div>
) : null}

  <div className="grid gap-3 md:grid-cols-2">
    <div>
      <div className="mb-1 text-sm text-slate-600">{t(language, 'Date', 'Tarehe')}</div>
      <Input
        type="date"
        value={gasForm.date}
        onChange={(e) => setGasForm((prev) => ({ ...prev, date: e.target.value }))}
      />
    </div>

    

    <div>
  <div className="mb-1 text-sm text-slate-600">{t(language, 'Total Cylinders', 'Jumla ya Mitungi')}</div>
  <Input
    type="number"
    value={gasForm.totalCylinders}
    onChange={(e) => setGasForm((prev) => ({ ...prev, totalCylinders: e.target.value }))}
  />
</div>

<div className="md:col-span-2">
  <button
    type="button"
    className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
    onClick={() => setShowGasStatus((prev) => !prev)}
  >
    <span>{t(language, 'Cylinder Status', 'Hali ya Mitungi')}</span>
    <span>{showGasStatus ? '▲' : '▼'}</span>
  </button>
</div>

{showGasStatus && (
  <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Small Cylinders Total (6kg)', 'Jumla ya Mitungi Midogo (6kg)')}
      value={gasForm.smallCylindersTotal}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallCylindersTotal: e.target.value }))}
    />

    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Big Cylinders Total (15kg)', 'Jumla ya Mitungi Mikubwa (15kg)')}
      value={gasForm.bigCylindersTotal}
      onChange={(e) => setGasForm((prev) => ({ ...prev, bigCylindersTotal: e.target.value }))}
    />

    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Small Cylinders With Gas', 'Mitungi Midogo Yenye Gesi')}
      value={gasForm.smallCylindersWithGas}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallCylindersWithGas: e.target.value }))}
    />

    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Big Cylinders With Gas', 'Mitungi Mikubwa Yenye Gesi')}
      value={gasForm.bigCylindersWithGas}
      onChange={(e) => setGasForm((prev) => ({ ...prev, bigCylindersWithGas: e.target.value }))}
    />

    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Small Empty Cylinders', 'Mitungi Midogo Mitupu')}
      value={gasForm.smallEmptyCylinders}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallEmptyCylinders: e.target.value }))}
    />

    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Big Empty Cylinders', 'Mitungi Mikubwa Mitupu')}
      value={gasForm.bigEmptyCylinders}
      onChange={(e) => setGasForm((prev) => ({ ...prev, bigEmptyCylinders: e.target.value }))}
    />
  </div>
)}


<div className="md:col-span-2">
  <button
    type="button"
    className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
    onClick={() => setShowGasSales((prev) => !prev)}
  >
    <span>{t(language, 'Gas Sales Summary', 'Muhtasari wa Mauzo ya Gesi')}</span>
    <span>{showGasSales ? '▲' : '▼'}</span>
  </button>
</div>

{showGasSales && (
  <div className="md:col-span-2 space-y-3">
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {t(
        language,
        'Gas sales are now recorded from the “Sell Gas” section only. This area is for viewing today’s gas sales summary before closing daily gas records.',
        'Mauzo ya gesi sasa yanaingizwa kupitia sehemu ya “Uza Gesi” pekee. Eneo hili ni kwa ajili ya kuangalia muhtasari wa mauzo ya leo kabla ya kufunga rekodi za siku.'
      )}
    </div>

    <div className="grid gap-3 md:grid-cols-2 text-sm">
      <div className="rounded-2xl bg-slate-50 p-3">
        <div className="font-semibold">
          {t(language, 'Small Gas Sold Today', 'Gesi Ndogo Iliyuzwa Leo')}
        </div>
        <div className="mt-1 text-lg font-bold">
          {formatQty(gasForm.smallGasSoldToday || 0)}
        </div>
        <div className="mt-1 text-slate-600">
          {t(language, 'Buy Price', 'Bei ya Kununua')}: TZS {currency(gasForm.smallGasBuyPrice || 0)}
        </div>
        <div className="text-slate-600">
          {t(language, 'Sell Price', 'Bei ya Kuuza')}: TZS {currency(gasForm.smallGasSellPrice || 0)}
        </div>
        <div className="mt-1 font-medium text-slate-800">
          {t(language, 'Profit', 'Faida')}: TZS {currency(liveGasProfit.smallGasProfit)}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-3">
        <div className="font-semibold">
          {t(language, 'Big Gas Sold Today', 'Gesi Kubwa Iliyuzwa Leo')}
        </div>
        <div className="mt-1 text-lg font-bold">
          {formatQty(gasForm.bigGasSoldToday || 0)}
        </div>
        <div className="mt-1 text-slate-600">
          {t(language, 'Buy Price', 'Bei ya Kununua')}: TZS {currency(gasForm.bigGasBuyPrice || 0)}
        </div>
        <div className="text-slate-600">
          {t(language, 'Sell Price', 'Bei ya Kuuza')}: TZS {currency(gasForm.bigGasSellPrice || 0)}
        </div>
        <div className="mt-1 font-medium text-slate-800">
          {t(language, 'Profit', 'Faida')}: TZS {currency(liveGasProfit.bigGasProfit)}
        </div>
      </div>
    </div>

    <div className="rounded-2xl bg-slate-100 p-3 text-sm font-semibold">
      {t(language, 'Total Gas Profit', 'Jumla ya Faida ya Gesi')}: TZS {currency(liveGasProfit.totalProfit)}
    </div>
  </div>
)}


<div className="grid gap-3 md:grid-cols-3 text-sm">
    <div className="rounded-2xl bg-slate-50 p-3">
      {t(language, 'Small Gas Profit', 'Faida ya Gesi Ndogo')}: TZS {currency(liveGasProfit.smallGasProfit)}
    </div>
    <div className="rounded-2xl bg-slate-50 p-3">
      {t(language, 'Big Gas Profit', 'Faida ya Gesi Kubwa')}: TZS {currency(liveGasProfit.bigGasProfit)}
    </div>
    <div className="rounded-2xl bg-slate-100 p-3 font-semibold">
      {t(language, 'Total Profit', 'Jumla ya Faida')}: TZS {currency(liveGasProfit.totalProfit)}
    </div>
  </div>
  <div className="grid gap-3 md:grid-cols-2 text-sm">
    <div className={`rounded-2xl p-3 ${liveGasAlignment.smallMatches ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
      {liveGasAlignment.smallMessage}
    </div>
    <div className={`rounded-2xl p-3 ${liveGasAlignment.bigMatches ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
      {liveGasAlignment.bigMessage}
    </div>
  </div>

  {!isOwnerUser ? (
    <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">
      {t(language, 'Shop user can record gas details, but only owner can change cylinder totals.', 'Mtumiaji wa duka anaweza kujaza taarifa za gesi, lakini ni owner pekee anaweza kubadili jumla ya mitungi.')}
    </div>
  ) : null}

  <div className="flex gap-2">
    <Button
  type="button"
  onClick={onSaveGas}
  disabled={isOwnerUser && !gasForm.id}
>
  {isOwnerUser && !gasForm.id
    ? 'Owner hawezi kuanzisha rekodi mpya'
    : gasForm.id || todayGasEntries.length > 0
      ? t(language, 'Update Gas Record', 'Sasisha Rekodi ya Gesi')
      : t(language, 'Save Gas Record', 'Hifadhi Rekodi ya Gesi')}
</Button>

    {gasForm.id ? (
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setGasForm({
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
          })
        }
      >
        {t(language, 'Cancel Edit', 'Ghairi Kuhariri')}
      </Button>
    ) : null}
  </div>
  </div>
</CardContent>
      </Card>

            <Card>
        <CardHeader>
          <CardTitle>{t(language, 'Sell Gas', 'Uza Gesi')}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
            {t(
              language,
              'Sell gas without filling the full gas record. This will update today’s gas record automatically.',
              'Uza gesi bila kujaza taarifa zote za gesi. Mfumo utasasisha rekodi ya gesi ya leo kiotomatiki.'
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-sm text-slate-600">{t(language, 'Sale Date', 'Tarehe ya Mauzo')}</div>
              <Input
                type="date"
                value={quickGasSaleForm.date}
                readOnly
              />
              <div className="mt-1 text-xs text-slate-400">Auto</div>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-600">{t(language, 'Gas Type', 'Aina ya Gesi')}</div>
             <select
  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
  value={quickGasSaleForm.gasType}
  onChange={(e) =>
    setQuickGasSaleForm((prev) => ({
      ...prev,
      gasType: e.target.value,
    }))
  }
>
  <option value="">
    {t(language, 'Select gas type sold', 'Chagua aina ya gesi iliyouzwa')}
  </option>

  {gasTypes.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-600">{t(language, 'Cylinder Size', 'Ukubwa wa Mtungi')}</div>
             <select
  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
  value={quickGasSaleForm.cylinderSize}
  onChange={(e) =>
    setQuickGasSaleForm((prev) => ({
      ...prev,
      cylinderSize: e.target.value,
    }))
  }
>
  <option value="">
    {t(language, 'Select cylinder size sold', 'Chagua ukubwa wa mtungi uliouzwa')}
  </option>
  <option value="Small Cylinder">{t(language, 'Small Cylinder', 'Mtungi Mdogo')}</option>
  <option value="Big Cylinder">{t(language, 'Big Cylinder', 'Mtungi Mkubwa')}</option>
</select>
            </div>

            <Input
              type="number"
              label={t(language, 'Quantity Sold', 'Idadi Iliyuzwa')}
              value={quickGasSaleForm.quantity}
              onChange={(e) =>
                setQuickGasSaleForm((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }))
              }
            />

            <Input
              label={t(language, 'Buying Price', 'Bei ya Kununua')}
              value={`TZS ${currency(quickGasPrices.buyPrice)}`}
              readOnly
            />

            <Input
              label={t(language, 'Selling Price', 'Bei ya Kuuza')}
              value={`TZS ${currency(quickGasPrices.sellPrice)}`}
              readOnly
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-slate-500">{t(language, 'Quantity', 'Idadi')}</div>
              <div className="mt-1 font-semibold">{formatQty(quickGasSalePreview.qty)}</div>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-3">
              <div className="text-emerald-700">{t(language, 'Total Sale', 'Jumla ya Mauzo')}</div>
              <div className="mt-1 font-semibold text-emerald-800">
                TZS {currency(quickGasSalePreview.totalSale)}
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 p-3">
              <div className="text-amber-700">{t(language, 'Estimated Profit', 'Faida Inayokadiriwa')}</div>
              <div className="mt-1 font-semibold text-amber-800">
                TZS {currency(quickGasSalePreview.totalProfit)}
              </div>
            </div>
          </div>

          <Button type="button" onClick={saveQuickGasSale}>
            {t(language, 'Save Gas Sale', 'Hifadhi Mauzo ya Gesi')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t(language, 'Saved Gas Records', 'Rekodi za Gesi')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {todayGasEntries.length === 0 ? (
            <div className="text-slate-500">{t(language, 'No gas records for today yet.', 'Hakuna rekodi za gesi za leo bado.')}</div>
          ) : (
            todayGasEntries.slice().reverse().map((entry) => {
              const profits = getGasProfitBreakdown(entry);
              const alignment = getGasAlignmentWarnings(entry, language, t, formatQty);
              return (
                <div key={entry.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">
  {entry.date} — {entry.gasType || 'Gas'} ({entry.cylinderSize || '-'})
</div>
                      <div className="mt-1">{t(language, 'Total Cylinders', 'Jumla ya Mitungi')}: {formatQty(entry.totalCylinders)}</div>
                      <div className="mt-1 font-semibold">{t(language, 'Total Profit', 'Jumla ya Faida')}: TZS {currency(profits.totalProfit)}</div>
                    </div>

                   <div className="flex items-center gap-2">
  <Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => onEditGas(entry)}
>
  <Pencil className="h-4 w-4" />
</Button>
  <Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => onDeleteGas(entry.id)}
  disabled={!isOwnerUser}
>
  <Trash2 className="h-4 w-4" />
</Button>
</div>
</div>

<div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
                    <div className={`rounded-2xl p-3 ${alignment.bigMatches ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {alignment.bigMessage}
                    </div>
                    <div className={`rounded-2xl p-3 ${alignment.smallMatches ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {alignment.smallMessage}
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 font-semibold">{t(language, 'BIG GAS (Upper Section)', 'GESI KUBWA (Sehemu ya Juu)')}</div>
                    <div>{t(language, 'Big Cylinders Total', 'Jumla ya Mitungi Mikubwa')}: {formatQty(entry.bigCylindersTotal)}</div>
                    <div>{t(language, 'Big Cylinders With Gas', 'Mitungi Mikubwa Yenye Gesi')}: {formatQty(entry.bigCylindersWithGas)}</div>
                    <div>{t(language, 'Big Empty Cylinders', 'Mitungi Mikubwa Mitupu')}: {formatQty(entry.bigEmptyCylinders)}</div>
                    <div>{t(language, 'Big Gas Sold Today', 'Gesi Kubwa Iliyuzwa Leo')}: {formatQty(entry.bigGasSoldToday)}</div>
                    <div>{t(language, 'Big Gas Buy Price', 'Bei ya Kununua Gesi Kubwa')}: TZS {currency(entry.bigGasBuyPrice)}</div>
                    <div>{t(language, 'Big Gas Sell Price', 'Bei ya Kuuza Gesi Kubwa')}: TZS {currency(entry.bigGasSellPrice)}</div>
                    <div className="font-medium">{t(language, 'Big Gas Profit', 'Faida ya Gesi Kubwa')}: TZS {currency(profits.bigGasProfit)}</div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 font-semibold">{t(language, 'SMALL GAS (Lower Section)', 'GESI NDOGO (Sehemu ya Chini)')}</div>
                    <div>{t(language, 'Small Cylinders Total', 'Jumla ya Mitungi Midogo')}: {formatQty(entry.smallCylindersTotal)}</div>
                    <div>{t(language, 'Small Cylinders With Gas', 'Mitungi Midogo Yenye Gesi')}: {formatQty(entry.smallCylindersWithGas)}</div>
                    <div>{t(language, 'Small Empty Cylinders', 'Mitungi Midogo Mitupu')}: {formatQty(entry.smallEmptyCylinders)}</div>
                    <div>{t(language, 'Small Gas Sold Today', 'Gesi Ndogo Iliyuzwa Leo')}: {formatQty(entry.smallGasSoldToday)}</div>
                    <div>{t(language, 'Small Gas Buy Price', 'Bei ya Kununua Gesi Ndogo')}: TZS {currency(entry.smallGasBuyPrice)}</div>
                    <div>{t(language, 'Small Gas Sell Price', 'Bei ya Kuuza Gesi Ndogo')}: TZS {currency(entry.smallGasSellPrice)}</div>
                    <div className="font-medium">{t(language, 'Small Gas Profit', 'Faida ya Gesi Ndogo')}: TZS {currency(profits.smallGasProfit)}</div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function GasReportBlock({ filteredGas, language, t, currency, formatQty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1600px] text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-3">{t(language, 'Date', 'Tarehe')}</th>
            <th className="py-2 pr-3">{t(language, 'Total Cylinders', 'Jumla ya Mitungi')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Cylinders Total', 'Jumla ya Mitungi Midogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Cylinders Total', 'Jumla ya Mitungi Mikubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Cylinders With Gas', 'Mitungi Midogo Yenye Gesi')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Cylinders With Gas', 'Mitungi Mikubwa Yenye Gesi')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Empty Cylinders', 'Mitungi Midogo Mitupu')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Empty Cylinders', 'Mitungi Mikubwa Mitupu')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Gas Sold Today', 'Gesi Ndogo Iliyuzwa Leo')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Gas Sold Today', 'Gesi Kubwa Iliyuzwa Leo')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Gas Buy Price', 'Bei ya Kununua Gesi Ndogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Gas Sell Price', 'Bei ya Kuuza Gesi Ndogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Gas Buy Price', 'Bei ya Kununua Gesi Kubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Gas Sell Price', 'Bei ya Kuuza Gesi Kubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Gas Profit', 'Faida ya Gesi Ndogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Gas Profit', 'Faida ya Gesi Kubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Total Profit', 'Jumla ya Faida')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredGas.length === 0 ? (
            <tr>
              <td colSpan="17" className="py-4 text-slate-500">
                {t(language, 'No gas records in this period.', 'Hakuna rekodi za gesi katika kipindi hiki.')}
              </td>
            </tr>
          ) : (
            <>
              {filteredGas.slice().reverse().map((entry) => {
                const profits = getGasProfitBreakdown(entry);
                return (
                  <tr key={entry.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3">{entry.date}</td>
                    <td className="py-3 pr-3">{formatQty(entry.totalCylinders)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.smallCylindersTotal)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.bigCylindersTotal)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.smallCylindersWithGas)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.bigCylindersWithGas)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.smallEmptyCylinders)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.bigEmptyCylinders)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.smallGasSoldToday)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.bigGasSoldToday)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.smallGasBuyPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.smallGasSellPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.bigGasBuyPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.bigGasSellPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(profits.smallGasProfit)}</td>
                    <td className="py-3 pr-3">TZS {currency(profits.bigGasProfit)}</td>
                    <td className="py-3 pr-3">TZS {currency(profits.totalProfit)}</td>
                  </tr>
                );
              })}

              <tr className="bg-slate-50 font-semibold">
                <td className="py-3 pr-3">{t(language, 'TOTAL', 'JUMLA')}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.totalCylinders || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.smallCylindersTotal || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.bigCylindersTotal || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.smallCylindersWithGas || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.bigCylindersWithGas || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.smallEmptyCylinders || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.bigEmptyCylinders || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.smallGasSoldToday || 0), 0))}</td>
                <td className="py-3 pr-3">{formatQty(filteredGas.reduce((a, x) => a + Number(x.bigGasSoldToday || 0), 0))}</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">TZS {currency(filteredGas.reduce((a, x) => a + getGasProfitBreakdown(x).smallGasProfit, 0))}</td>
                <td className="py-3 pr-3">TZS {currency(filteredGas.reduce((a, x) => a + getGasProfitBreakdown(x).bigGasProfit, 0))}</td>
                <td className="py-3 pr-3">TZS {currency(filteredGas.reduce((a, x) => a + getGasProfitBreakdown(x).totalProfit, 0))}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
