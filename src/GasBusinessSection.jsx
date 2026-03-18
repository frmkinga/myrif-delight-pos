import React, { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

function getGasProfitBreakdown(entry) {
  const smallGasProfit =
    (Number(entry.smallGasSellPrice || 0) - Number(entry.smallGasBuyPrice || 0)) * Number(entry.smallGasSoldToday || 0);
  const bigGasProfit =
    (Number(entry.bigGasSellPrice || 0) - Number(entry.bigGasBuyPrice || 0)) * Number(entry.bigGasSoldToday || 0);

  return {
    smallGasProfit,
    bigGasProfit,
    totalProfit: smallGasProfit + bigGasProfit,
  };
}

function getGasAlignmentWarnings(entry, language, t, formatQty) {
  const smallTotal = Number(entry.smallCylindersTotal || 0);
  const bigTotal = Number(entry.bigCylindersTotal || 0);
  const smallParts = Number(entry.smallCylindersWithGas || 0) + Number(entry.smallEmptyCylinders || 0);
  const bigParts = Number(entry.bigCylindersWithGas || 0) + Number(entry.bigEmptyCylinders || 0);

  return {
    smallMatches: smallTotal === smallParts,
    bigMatches: bigTotal === bigParts,
    smallMessage:
      smallTotal === smallParts
        ? t(language, 'Small cylinders are aligned.', 'Mitungi midogo imeoana sawa.')
        : `${t(language, 'Small cylinders do not match: total is', 'Mitungi midogo haioani: jumla ni')} ${formatQty(smallTotal)} ${t(language, 'but with gas + empty is', 'lakini yenye gesi + mitupu ni')} ${formatQty(smallParts)}.`,
    bigMessage:
      bigTotal === bigParts
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
}) {
  const liveGasProfit = useMemo(() => getGasProfitBreakdown(gasForm), [gasForm]);
  const liveGasAlignment = useMemo(
    () => getGasAlignmentWarnings(gasForm, language, t, formatQty),
    [gasForm, language, t, formatQty],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t(language, 'Gas Business', 'Biashara ya Gesi')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      <div className="mb-1 text-sm text-slate-600">{t(language, 'Gas Type', 'Aina ya Gesi')}</div>
      <select
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        value={gasForm.gasType || 'Taifa Gas'}
        onChange={(e) => setGasForm((prev) => ({ ...prev, gasType: e.target.value }))}
      >
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
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        value={gasForm.cylinderSize || 'Small Cylinder'}
        onChange={(e) => setGasForm((prev) => ({ ...prev, cylinderSize: e.target.value }))}
      >
        {gasCylinderSizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>

    <div>
      <div className="mb-1 text-sm text-slate-600">{t(language, 'Total Cylinders', 'Jumla ya Mitungi')}</div>
      <Input
        type="number"
        value={gasForm.totalCylinders}
        disabled={!isOwnerUser}
        onChange={(e) => setGasForm((prev) => ({ ...prev, totalCylinders: e.target.value }))}
      />
    </div>
<div className="md:col-span-2">
  <button
    type="button"
    className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
    onClick={() => {
      console.log('clicked status');
      setShowGasStatus((prev) => !prev);
    }}
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
      disabled={!isOwnerUser}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallCylindersTotal: e.target.value }))}
    />

    <input
      type="number"
      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
      placeholder={t(language, 'Big Cylinders Total (15kg)', 'Jumla ya Mitungi Mikubwa (15kg)')}
      value={gasForm.bigCylindersTotal}
      disabled={!isOwnerUser}
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
    <span>{t(language, 'Gas Sales Today', 'Mauzo ya Gesi Leo')}</span>
    <span>{showGasSales ? '▲' : '▼'}</span>
  </button>
</div>

{showGasSales && (
  <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
    <Input
      type="number"
      placeholder={t(language, 'Small Gas Sold Today', 'Gesi Ndogo Iliyuzwa Leo')}
      value={gasForm.smallGasSoldToday}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallGasSoldToday: e.target.value }))}
    />

    <Input
      type="number"
      placeholder={t(language, 'Big Gas Sold Today', 'Gesi Kubwa Iliyuzwa Leo')}
      value={gasForm.bigGasSoldToday}
      onChange={(e) => setGasForm((prev) => ({ ...prev, bigGasSoldToday: e.target.value }))}
    />
  </div>
)}
<div className="md:col-span-2">
  <button
    type="button"
    className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
    onClick={() => setShowGasPrices((prev) => !prev)}
  >
    <span>{t(language, 'Gas Prices', 'Bei za Gesi')}</span>
    <span>{showGasPrices ? '▲' : '▼'}</span>
  </button>
</div>

{showGasPrices && (
  <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
    <Input
      type="number"
      placeholder={t(language, 'Small Gas Buy Price', 'Bei ya Kununua Gesi Ndogo')}
      value={gasForm.smallGasBuyPrice}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallGasBuyPrice: e.target.value }))}
    />

    <Input
      type="number"
      placeholder={t(language, 'Small Gas Sell Price', 'Bei ya Kuuza Gesi Ndogo')}
      value={gasForm.smallGasSellPrice}
      onChange={(e) => setGasForm((prev) => ({ ...prev, smallGasSellPrice: e.target.value }))}
    />

    <Input
      type="number"
      placeholder={t(language, 'Big Gas Buy Price', 'Bei ya Kununua Gesi Kubwa')}
      value={gasForm.bigGasBuyPrice}
      onChange={(e) => setGasForm((prev) => ({ ...prev, bigGasBuyPrice: e.target.value }))}
    />

   <Input
  type="number"
  placeholder={t(language, 'Big Gas Sell Price', 'Bei ya Kuuza Gesi Kubwa')}
  value={gasForm.bigGasSellPrice}
  onChange={(e) => setGasForm((prev) => ({ ...prev, bigGasSellPrice: e.target.value }))}
/>
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
    <Button type="button" onClick={onSaveGas}>
      {gasForm.id ? t(language, 'Update Gas Record', 'Sasisha Rekodi ya Gesi') : t(language, 'Save Gas Record', 'Hifadhi Rekodi ya Gesi')}
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
                      {isOwnerUser ? (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => onEditGas(entry)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => onDeleteGas(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
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
