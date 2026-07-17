import React, { useMemo, useState } from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
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

const GAS_SALE_CATEGORIES = [
  {
    value: 'refill',
    labelEn: 'Gas Refill',
    labelSw: 'Kujaza Gesi',
  },
  {
    value: 'complete',
    labelEn: 'Sell Complete Gas Cylinder',
    labelSw: 'Uza Mtungi Kamili wa Gesi',
  },
  {
    value: 'accessory',
    labelEn: 'Gas Accessories',
    labelSw: 'Vifaa vya Gesi',
  },
];

const GAS_ACCESSORY_PRICE_BOOK = {
  gasBurner: {
    labelEn: 'Sell Gas Burner',
    labelSw: 'Uza Bana za Gesi',
    buyPrice: 3500,
    sellPrice: 5500,
  },
  cylinderPotStand: {
    labelEn: 'Sell Cylinder Pot Stand',
    labelSw: 'Uza Mafiga ya Mitungi',
    buyPrice: 4000,
    sellPrice: 6000,
  },
};

const COMPLETE_GAS_PRICE_BOOK = {
  'Taifa / Mihan Gas': {
    smallBuy: 47000,
    smallSell: 57000,
    bigBuy: 95000,
    bigSell: 115000,
  },
  'Oryx Gas': {
    smallBuy: 50000,
    smallSell: 58000,
    bigBuy: 95000,
    bigSell: 115000,
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
  const refillProfit = smallGasProfit + bigGasProfit;

  const completeSmallQtySold = Number(entry.completeSmallCylinderSoldToday || 0);
  const completeBigQtySold = Number(entry.completeBigCylinderSoldToday || 0);

  const completeSmallCylinderProfit =
    completeSmallQtySold *
    (Number(entry.completeSmallCylinderSellPrice || 0) - Number(entry.completeSmallCylinderBuyPrice || 0));

  const completeBigCylinderProfit =
    completeBigQtySold *
    (Number(entry.completeBigCylinderSellPrice || 0) - Number(entry.completeBigCylinderBuyPrice || 0));

  const completeGasProfit = completeSmallCylinderProfit + completeBigCylinderProfit;

  const gasBurnerProfit =
    Number(entry.gasBurnerSoldToday || 0) *
    (Number(entry.gasBurnerSellPrice || 0) - Number(entry.gasBurnerBuyPrice || 0));

  const mafigaProfit =
    Number(entry.mafigaSoldToday || 0) *
    (Number(entry.mafigaSellPrice || 0) - Number(entry.mafigaBuyPrice || 0));

  const accessoryProfit = gasBurnerProfit + mafigaProfit;

  return {
    smallGasProfit,
    bigGasProfit,
    refillProfit,
    completeSmallCylinderProfit,
    completeBigCylinderProfit,
    completeGasProfit,
    gasBurnerProfit,
    mafigaProfit,
    accessoryProfit,
    totalProfit: refillProfit + completeGasProfit + accessoryProfit,
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
  gasType: gasForm.gasType || 'Taifa / Mihan Gas',
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

    completeSmallCylinderSoldToday: Number(gasForm.completeSmallCylinderSoldToday || 0),
    completeBigCylinderSoldToday: Number(gasForm.completeBigCylinderSoldToday || 0),
    completeSmallCylinderBuyPrice: Number(gasForm.completeSmallCylinderBuyPrice || 0),
    completeSmallCylinderSellPrice: Number(gasForm.completeSmallCylinderSellPrice || 0),
    completeBigCylinderBuyPrice: Number(gasForm.completeBigCylinderBuyPrice || 0),
    completeBigCylinderSellPrice: Number(gasForm.completeBigCylinderSellPrice || 0),

    gasBurnerSoldToday: Number(gasForm.gasBurnerSoldToday || 0),
    gasBurnerBuyPrice: Number(gasForm.gasBurnerBuyPrice || 0),
    gasBurnerSellPrice: Number(gasForm.gasBurnerSellPrice || 0),

    mafigaSoldToday: Number(gasForm.mafigaSoldToday || 0),
    mafigaBuyPrice: Number(gasForm.mafigaBuyPrice || 0),
    mafigaSellPrice: Number(gasForm.mafigaSellPrice || 0),

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
  saleCategory: 'refill',
  date: todayISO(),
  gasType: '',
  cylinderSize: '',
  accessoryType: '',
  quantity: '1',
  buyPrice: '',
  sellPrice: '',
});

const normalizeGasTypeName = (value) => {
  const name = String(value || '').trim();

  // These old names are kept only so old saved records can still be read correctly.
  if (name === 'Taifa Gas' || name === 'Mihan / Taifa Gas' || name === 'Taifa / Mihan Gas') {
    return 'Taifa / Mihan Gas';
  }

  return name;
};

const getLatestGasPriceValues = (gasTypeValue) => {
  const gasType = normalizeGasTypeName(gasTypeValue);
  const priceDefaults = GAS_PRICE_BOOK[gasType] || {};

  const latestSavedPriceRecord = (gasEntries || [])
    .filter((entry) => normalizeGasTypeName(entry.gasType) === gasType)
    .slice()
    .sort((a, b) => {
      const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));
      if (dateCompare !== 0) return dateCompare;

      return String(b.id || '').localeCompare(String(a.id || ''));
    })[0];

  return {
    smallGasBuyPrice: String(latestSavedPriceRecord?.smallGasBuyPrice || priceDefaults.smallBuy || ''),
    smallGasSellPrice: String(latestSavedPriceRecord?.smallGasSellPrice || priceDefaults.smallSell || ''),
    bigGasBuyPrice: String(latestSavedPriceRecord?.bigGasBuyPrice || priceDefaults.bigBuy || ''),
    bigGasSellPrice: String(latestSavedPriceRecord?.bigGasSellPrice || priceDefaults.bigSell || ''),
  };
};

const getGasPriceForSelectedSize = (gasTypeValue, cylinderSizeValue) => {
  const latestPrices = getLatestGasPriceValues(gasTypeValue);
  const isSmall = cylinderSizeValue === 'Small Cylinder';

  return {
    buyPrice: isSmall ? latestPrices.smallGasBuyPrice : latestPrices.bigGasBuyPrice,
    sellPrice: isSmall ? latestPrices.smallGasSellPrice : latestPrices.bigGasSellPrice,
  };
};

const defaultGasPriceForm = {
  gasType: 'Taifa / Mihan Gas',
  cylinderSize: 'Small Cylinder',
  ...getGasPriceForSelectedSize('Taifa / Mihan Gas', 'Small Cylinder'),
};

const [gasPriceForm, setGasPriceForm] = useState(defaultGasPriceForm);

const saveGasPriceSettings = async () => {
  const selectedGasType = normalizeGasTypeName(gasPriceForm.gasType);
  const selectedCylinderSize = gasPriceForm.cylinderSize || 'Small Cylinder';
  const isSmall = selectedCylinderSize === 'Small Cylinder';

  if (!selectedGasType) {
    alert(t(language, 'Please select gas type.', 'Tafadhali chagua aina ya gesi.'));
    return;
  }

  if (!gasPriceForm.buyPrice || !gasPriceForm.sellPrice) {
    alert(t(language, 'Please enter buying and selling price.', 'Tafadhali jaza bei ya kununua na bei ya kuuza.'));
    return;
  }

  const latestPrices = getLatestGasPriceValues(selectedGasType);

  const todayPriceRecord =
    (todayGasEntries || []).find(
      (entry) =>
        String(entry.date || '') === String(todayISO()) &&
        normalizeGasTypeName(entry.gasType) === selectedGasType
    ) || null;

  const base = todayPriceRecord || {};

  const nextGasForm = {
    ...base,
    id: base.id || `gas-price-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: todayISO(),
    gasType: selectedGasType,
    cylinderSize: selectedCylinderSize,

    totalCylinders: String(base.totalCylinders || ''),
    smallCylindersTotal: String(base.smallCylindersTotal || ''),
    bigCylindersTotal: String(base.bigCylindersTotal || ''),
    smallCylindersWithGas: String(base.smallCylindersWithGas || ''),
    bigCylindersWithGas: String(base.bigCylindersWithGas || ''),
    smallEmptyCylinders: String(base.smallEmptyCylinders || ''),
    bigEmptyCylinders: String(base.bigEmptyCylinders || ''),
    smallGasSoldToday: String(base.smallGasSoldToday || ''),
    bigGasSoldToday: String(base.bigGasSoldToday || ''),

    smallGasBuyPrice: String(isSmall ? gasPriceForm.buyPrice : latestPrices.smallGasBuyPrice || 0),
    smallGasSellPrice: String(isSmall ? gasPriceForm.sellPrice : latestPrices.smallGasSellPrice || 0),
    bigGasBuyPrice: String(!isSmall ? gasPriceForm.buyPrice : latestPrices.bigGasBuyPrice || 0),
    bigGasSellPrice: String(!isSmall ? gasPriceForm.sellPrice : latestPrices.bigGasSellPrice || 0),
  };

  const saved = await onSaveGas(nextGasForm, { keepGasForm: true });

  if (saved) {
    alert(t(language, 'Gas prices updated successfully.', 'Bei za gesi zimesasishwa kikamilifu.'));
  }
};
const parseGasPriceValue = (value) =>
  Number(String(value || '').replace(/TZS/g, '').replace(/,/g, '').trim() || 0);

const quickGasPrices = useMemo(() => {
  const saleCategory = quickGasSaleForm.saleCategory || 'refill';
  const gasType = normalizeGasTypeName(quickGasSaleForm.gasType);
  const cylinderSize = quickGasSaleForm.cylinderSize;
  const accessoryType = quickGasSaleForm.accessoryType || '';

  const manualBuyPrice = parseGasPriceValue(quickGasSaleForm.buyPrice);
  const manualSellPrice = parseGasPriceValue(quickGasSaleForm.sellPrice);

  const findLatestRecordWithPrices = (matches) =>
    (gasEntries || [])
      .filter(matches)
      .slice()
      .sort((a, b) => {
        const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));
        if (dateCompare !== 0) return dateCompare;

        return String(b.id || '').localeCompare(String(a.id || ''));
      })[0] || {};

  if (saleCategory === 'accessory') {
    const accessoryDefaults = GAS_ACCESSORY_PRICE_BOOK[accessoryType] || {};

    let savedBuyPrice = 0;
    let savedSellPrice = 0;

    if (accessoryType === 'gasBurner') {
      const latestAccessoryPriceRecord = findLatestRecordWithPrices(
        (entry) =>
          Number(entry.gasBurnerBuyPrice || 0) > 0 ||
          Number(entry.gasBurnerSellPrice || 0) > 0
      );

      savedBuyPrice = Number(latestAccessoryPriceRecord.gasBurnerBuyPrice || 0);
      savedSellPrice = Number(latestAccessoryPriceRecord.gasBurnerSellPrice || 0);
    }

    if (accessoryType === 'cylinderPotStand') {
      const latestAccessoryPriceRecord = findLatestRecordWithPrices(
        (entry) =>
          Number(entry.mafigaBuyPrice || 0) > 0 ||
          Number(entry.mafigaSellPrice || 0) > 0
      );

      savedBuyPrice = Number(latestAccessoryPriceRecord.mafigaBuyPrice || 0);
      savedSellPrice = Number(latestAccessoryPriceRecord.mafigaSellPrice || 0);
    }

    const defaultBuyPrice = Number(accessoryDefaults.buyPrice || 0);
    const defaultSellPrice = Number(accessoryDefaults.sellPrice || 0);

    const resolvedBuyPrice = savedBuyPrice > 0 ? savedBuyPrice : defaultBuyPrice;
    const resolvedSellPrice = savedSellPrice > 0 ? savedSellPrice : defaultSellPrice;

    return {
      buyPrice: manualBuyPrice > 0 ? manualBuyPrice : resolvedBuyPrice,
      sellPrice: manualSellPrice > 0 ? manualSellPrice : resolvedSellPrice,
    };
  }

  if (!gasType || !cylinderSize) {
    return {
      buyPrice: manualBuyPrice,
      sellPrice: manualSellPrice,
    };
  }

  const isSmall = cylinderSize === 'Small Cylinder';

  if (saleCategory === 'complete') {
    const latestCompletePriceRecord = findLatestRecordWithPrices((entry) => {
      const sameGasType = normalizeGasTypeName(entry.gasType) === gasType;

      if (!sameGasType) return false;

      if (isSmall) {
        return (
          Number(entry.completeSmallCylinderBuyPrice || 0) > 0 ||
          Number(entry.completeSmallCylinderSellPrice || 0) > 0
        );
      }

      return (
        Number(entry.completeBigCylinderBuyPrice || 0) > 0 ||
        Number(entry.completeBigCylinderSellPrice || 0) > 0
      );
    });

    const savedBuyPrice = isSmall
      ? Number(latestCompletePriceRecord.completeSmallCylinderBuyPrice || 0)
      : Number(latestCompletePriceRecord.completeBigCylinderBuyPrice || 0);

    const savedSellPrice = isSmall
      ? Number(latestCompletePriceRecord.completeSmallCylinderSellPrice || 0)
      : Number(latestCompletePriceRecord.completeBigCylinderSellPrice || 0);

    const completeDefaults = COMPLETE_GAS_PRICE_BOOK[gasType] || {};

    const defaultBuyPrice = isSmall
      ? Number(completeDefaults.smallBuy || 0)
      : Number(completeDefaults.bigBuy || 0);

    const defaultSellPrice = isSmall
      ? Number(completeDefaults.smallSell || 0)
      : Number(completeDefaults.bigSell || 0);

    const resolvedBuyPrice = savedBuyPrice > 0 ? savedBuyPrice : defaultBuyPrice;
    const resolvedSellPrice = savedSellPrice > 0 ? savedSellPrice : defaultSellPrice;

    return {
      buyPrice: manualBuyPrice > 0 ? manualBuyPrice : resolvedBuyPrice,
      sellPrice: manualSellPrice > 0 ? manualSellPrice : resolvedSellPrice,
    };
  }

  const latestSavedPriceRecord = findLatestRecordWithPrices((entry) => {
    const sameGasType = normalizeGasTypeName(entry.gasType) === gasType;

    if (!sameGasType) return false;

    if (isSmall) {
      return (
        Number(entry.smallGasBuyPrice || 0) > 0 ||
        Number(entry.smallGasSellPrice || 0) > 0
      );
    }

    return (
      Number(entry.bigGasBuyPrice || 0) > 0 ||
      Number(entry.bigGasSellPrice || 0) > 0
    );
  });

  const savedBuyPrice = isSmall
    ? Number(latestSavedPriceRecord.smallGasBuyPrice || 0)
    : Number(latestSavedPriceRecord.bigGasBuyPrice || 0);

  const savedSellPrice = isSmall
    ? Number(latestSavedPriceRecord.smallGasSellPrice || 0)
    : Number(latestSavedPriceRecord.bigGasSellPrice || 0);

  const priceDefaults = GAS_PRICE_BOOK[gasType] || {};

  const defaultBuyPrice = isSmall
    ? Number(priceDefaults.smallBuy || 0)
    : Number(priceDefaults.bigBuy || 0);

  const defaultSellPrice = isSmall
    ? Number(priceDefaults.smallSell || 0)
    : Number(priceDefaults.bigSell || 0);

  const resolvedBuyPrice = savedBuyPrice > 0 ? savedBuyPrice : defaultBuyPrice;
  const resolvedSellPrice = savedSellPrice > 0 ? savedSellPrice : defaultSellPrice;

  return {
    buyPrice: manualBuyPrice > 0 ? manualBuyPrice : resolvedBuyPrice,
    sellPrice: manualSellPrice > 0 ? manualSellPrice : resolvedSellPrice,
  };
}, [
  quickGasSaleForm.saleCategory,
  quickGasSaleForm.gasType,
  quickGasSaleForm.cylinderSize,
  quickGasSaleForm.accessoryType,
  quickGasSaleForm.buyPrice,
  quickGasSaleForm.sellPrice,
  gasEntries,
]);

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
  const saleCategory = quickGasSaleForm.saleCategory || 'refill';

  if (saleCategory === 'accessory') {
    if (!quickGasSaleForm.accessoryType) {
      alert(t(language, 'Please select accessory sold.', 'Tafadhali chagua kifaa kilichouzwa.'));
      return;
    }

    if (!qty || qty <= 0) {
      alert(t(language, 'Please enter quantity sold.', 'Tafadhali jaza idadi iliyouzwa.'));
      return;
    }

    if (!quickGasPrices.buyPrice || !quickGasPrices.sellPrice) {
      alert(t(language, 'Accessory prices are missing.', 'Bei za kifaa hazipo.'));
      return;
    }

    const todayRecord =
      (todayGasEntries || []).find((entry) => String(entry.date || '') === String(quickGasSaleForm.date || todayISO())) ||
      null;

    const base = todayRecord || gasForm || {};
    const isBurner = quickGasSaleForm.accessoryType === 'gasBurner';
    const isMafiga = quickGasSaleForm.accessoryType === 'cylinderPotStand';

    const nextGasForm = {
      ...base,
      id: base.id || gasForm.id || '',
      date: quickGasSaleForm.date || todayISO(),
      gasType: base.gasType || 'Taifa / Mihan Gas',
      cylinderSize: base.cylinderSize || 'Small Cylinder',

      gasBurnerSoldToday: String(Number(base.gasBurnerSoldToday || 0) + (isBurner ? qty : 0)),
      gasBurnerBuyPrice: String(isBurner ? quickGasPrices.buyPrice : base.gasBurnerBuyPrice || 0),
      gasBurnerSellPrice: String(isBurner ? quickGasPrices.sellPrice : base.gasBurnerSellPrice || 0),

      mafigaSoldToday: String(Number(base.mafigaSoldToday || 0) + (isMafiga ? qty : 0)),
      mafigaBuyPrice: String(isMafiga ? quickGasPrices.buyPrice : base.mafigaBuyPrice || 0),
      mafigaSellPrice: String(isMafiga ? quickGasPrices.sellPrice : base.mafigaSellPrice || 0),
    };

    setGasForm(nextGasForm);

    const saved = await onSaveGas(nextGasForm, { keepGasForm: true });

    if (saved) {
      alert(t(language, 'Accessory sale saved successfully.', 'Mauzo ya kifaa yamehifadhiwa kikamilifu.'));

      setQuickGasSaleForm((prev) => ({
        ...prev,
        saleCategory: 'accessory',
        date: todayISO(),
        gasType: '',
        cylinderSize: '',
        accessoryType: '',
        quantity: '1',
        buyPrice: '',
        sellPrice: '',
      }));
    }

    return;
  }

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
  const selectedGasType = normalizeGasTypeName(quickGasSaleForm.gasType);
  const selectedDefaultPrices = GAS_PRICE_BOOK[selectedGasType] || {};

  const todayRecord =
    (todayGasEntries || []).find((entry) => String(entry.date || '') === String(quickGasSaleForm.date || todayISO())) ||
    null;

  const base = todayRecord || gasForm || {};

    if (saleCategory === 'complete') {
    const completeDefaultPrices = COMPLETE_GAS_PRICE_BOOK[selectedGasType] || {};

    const nextGasForm = {
      ...base,
      id: base.id || gasForm.id || '',
      date: quickGasSaleForm.date || todayISO(),
      gasType: selectedGasType || 'Taifa / Mihan Gas',
      cylinderSize: quickGasSaleForm.cylinderSize || 'Small Cylinder',

      completeSmallCylinderSoldToday: String(
        Number(base.completeSmallCylinderSoldToday || 0) + (isSmall ? qty : 0)
      ),
      completeBigCylinderSoldToday: String(
        Number(base.completeBigCylinderSoldToday || 0) + (!isSmall ? qty : 0)
      ),

      completeSmallCylinderBuyPrice: String(
        isSmall
          ? quickGasPrices.buyPrice
          : (base.completeSmallCylinderBuyPrice || completeDefaultPrices.smallBuy || 0)
      ),
      completeSmallCylinderSellPrice: String(
        isSmall
          ? quickGasPrices.sellPrice
          : (base.completeSmallCylinderSellPrice || completeDefaultPrices.smallSell || 0)
      ),
      completeBigCylinderBuyPrice: String(
        !isSmall
          ? quickGasPrices.buyPrice
          : (base.completeBigCylinderBuyPrice || completeDefaultPrices.bigBuy || 0)
      ),
      completeBigCylinderSellPrice: String(
        !isSmall
          ? quickGasPrices.sellPrice
          : (base.completeBigCylinderSellPrice || completeDefaultPrices.bigSell || 0)
      ),

      totalCylinders: String(
        Math.max(0, Number(base.totalCylinders || 0) - qty)
      ),
      smallCylindersTotal: String(
        isSmall
          ? Math.max(0, Number(base.smallCylindersTotal || 0) - qty)
          : Number(base.smallCylindersTotal || 0)
      ),
      bigCylindersTotal: String(
        !isSmall
          ? Math.max(0, Number(base.bigCylindersTotal || 0) - qty)
          : Number(base.bigCylindersTotal || 0)
      ),

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

      smallEmptyCylinders: String(Number(base.smallEmptyCylinders || 0)),
      bigEmptyCylinders: String(Number(base.bigEmptyCylinders || 0)),
    };

    setGasForm(nextGasForm);

    const saved = await onSaveGas(nextGasForm, { keepGasForm: true });

    if (saved) {
      alert(t(language, 'Complete gas cylinder sale saved successfully.', 'Mauzo ya mtungi kamili wa gesi yamehifadhiwa kikamilifu.'));

      setQuickGasSaleForm((prev) => ({
        ...prev,
        saleCategory: 'complete',
        date: todayISO(),
        gasType: '',
        cylinderSize: '',
        accessoryType: '',
        quantity: '1',
        buyPrice: '',
        sellPrice: '',
      }));
    }

    return;
  }
  const nextGasForm = {
    ...base,
    id: base.id || gasForm.id || '',
    date: quickGasSaleForm.date || todayISO(),
    gasType: selectedGasType || 'Taifa / Mihan Gas',
    cylinderSize: quickGasSaleForm.cylinderSize || 'Small Cylinder',

    smallGasBuyPrice: String(
      isSmall
        ? quickGasPrices.buyPrice
        : (base.smallGasBuyPrice || selectedDefaultPrices.smallBuy || 0)
    ),
    smallGasSellPrice: String(
      isSmall
        ? quickGasPrices.sellPrice
        : (base.smallGasSellPrice || selectedDefaultPrices.smallSell || 0)
    ),
    bigGasBuyPrice: String(
      !isSmall
        ? quickGasPrices.buyPrice
        : (base.bigGasBuyPrice || selectedDefaultPrices.bigBuy || 0)
    ),
    bigGasSellPrice: String(
      !isSmall
        ? quickGasPrices.sellPrice
        : (base.bigGasSellPrice || selectedDefaultPrices.bigSell || 0)
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
  buyPrice: '',
  sellPrice: '',
}));
  }
};

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="xl:col-span-2">
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


<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
  <div className="rounded-2xl bg-slate-50 p-3">
    {t(language, 'Refill Profit', 'Faida ya Kujaza Gesi')}: TZS {currency(liveGasProfit.refillProfit)}
  </div>

  <div className="rounded-2xl bg-slate-50 p-3">
    {t(language, 'Complete Cylinder Profit', 'Faida ya Mtungi Kamili')}: TZS {currency(liveGasProfit.completeGasProfit)}
  </div>

  <div className="rounded-2xl bg-slate-50 p-3">
    {t(language, 'Gas Burner Profit', 'Faida ya Bana za Gesi')}: TZS {currency(liveGasProfit.gasBurnerProfit)}
  </div>

  <div className="rounded-2xl bg-slate-50 p-3">
    {t(language, 'Cylinder Pot Stand Profit', 'Faida ya Mafiga ya Mitungi')}: TZS {currency(liveGasProfit.mafigaProfit)}
  </div>

  <div className="rounded-2xl bg-slate-100 p-3 font-semibold">
    {t(language, 'Total Gas Business Profit', 'Jumla ya Faida ya Biashara ya Gesi')}: TZS {currency(liveGasProfit.totalProfit)}
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
          <CardTitle>{t(language, 'Update Gas Prices', 'Sasisha Bei za Gesi')}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold text-amber-900">
                {t(language, 'Update Gas Prices', 'Sasisha Bei za Gesi')}
              </div>
              <div className="text-xs text-amber-700">
                {t(
                  language,
                  'Update prices before selling. Sell Gas will use these prices automatically.',
                  'Sasisha bei kabla ya kuuza. Uza Gesi itatumia bei hizi kiotomatiki.'
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-sm text-slate-600">
                  {t(language, 'Gas Company', 'Kampuni ya Gesi')}
                </div>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={gasPriceForm.gasType}
                  onChange={(e) => {
                    const nextGasType = e.target.value;
                    setGasPriceForm((prev) => ({
                      ...prev,
                      gasType: nextGasType,
                      ...getGasPriceForSelectedSize(nextGasType, prev.cylinderSize),
                    }));
                  }}
                >
                  {gasTypes
                    .filter((type) => type !== 'Other')
                    .map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <div className="mb-1 text-sm text-slate-600">
                  {t(language, 'Cylinder Size', 'Ukubwa wa Mtungi')}
                </div>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={gasPriceForm.cylinderSize}
                  onChange={(e) => {
                    const nextCylinderSize = e.target.value;
                    setGasPriceForm((prev) => ({
                      ...prev,
                      cylinderSize: nextCylinderSize,
                      ...getGasPriceForSelectedSize(prev.gasType, nextCylinderSize),
                    }));
                  }}
                >
                  <option value="Small Cylinder">
                    {t(language, 'Small Cylinder', 'Mtungi Mdogo')}
                  </option>
                  <option value="Big Cylinder">
                    {t(language, 'Big Cylinder', 'Mtungi Mkubwa')}
                  </option>
                </select>
              </div>

              <Input
                type="number"
                label={t(language, 'Buying Price', 'Bei ya Kununua')}
                value={gasPriceForm.buyPrice}
                onChange={(e) =>
                  setGasPriceForm((prev) => ({
                    ...prev,
                    buyPrice: e.target.value,
                  }))
                }
              />

              <Input
                type="number"
                label={t(language, 'Selling Price', 'Bei ya Kuuza')}
                value={gasPriceForm.sellPrice}
                onChange={(e) =>
                  setGasPriceForm((prev) => ({
                    ...prev,
                    sellPrice: e.target.value,
                  }))
                }
              />
            </div>

            <div className="mt-3">
              <Button type="button" onClick={saveGasPriceSettings}>
                {t(language, 'Save Gas Prices', 'Hifadhi Bei za Gesi')}
              </Button>
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
            <div className="md:col-span-2">
              <div className="mb-1 text-sm text-slate-600">
                {t(language, 'Sale Category', 'Aina ya Mauzo')}
              </div>

              <select
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                value={quickGasSaleForm.saleCategory || 'refill'}
                onChange={(e) => {
                  const nextCategory = e.target.value;

                  setQuickGasSaleForm((prev) => ({
                    ...prev,
                    saleCategory: nextCategory,
                    gasType: '',
                    cylinderSize: '',
                    accessoryType: '',
                    quantity: '1',
                    buyPrice: '',
                    sellPrice: '',
                  }));
                }}
              >
                {GAS_SALE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {t(language, category.labelEn, category.labelSw)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-600">{t(language, 'Sale Date', 'Tarehe ya Mauzo')}</div>
              <Input
                type="date"
                value={quickGasSaleForm.date}
                readOnly
              />
              <div className="mt-1 text-xs text-slate-400">Auto</div>
            </div>

            {quickGasSaleForm.saleCategory !== 'accessory' ? (
              <>
                <div>
                  <div className="mb-1 text-sm text-slate-600">{t(language, 'Gas Type', 'Aina ya Gesi')}</div>
                  <select
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={quickGasSaleForm.gasType}
                    onChange={(e) =>
                      setQuickGasSaleForm((prev) => ({
                        ...prev,
                        gasType: e.target.value,
                        buyPrice: '',
                        sellPrice: '',
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
                        buyPrice: '',
                        sellPrice: '',
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
              </>
            ) : null}

                        {quickGasSaleForm.saleCategory === 'accessory' ? (
              <div className="md:col-span-2">
                <div className="mb-1 text-sm text-slate-600">
                  {t(language, 'Accessory Sold', 'Kifaa Kilichouzwa')}
                </div>

                <select
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={quickGasSaleForm.accessoryType || ''}
                  onChange={(e) => {
  const selectedAccessory = e.target.value;

  setQuickGasSaleForm((prev) => ({
    ...prev,
    accessoryType: selectedAccessory,
    buyPrice: '',
    sellPrice: '',
  }));
}}
                >
                  <option value="">
                    {t(language, 'Select accessory sold', 'Chagua kifaa kilichouzwa')}
                  </option>

                  {Object.entries(GAS_ACCESSORY_PRICE_BOOK).map(([key, item]) => (
                    <option key={key} value={key}>
                      {t(language, item.labelEn, item.labelSw)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

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
  type="number"
  label={t(language, 'Buying Price', 'Bei ya Kununua')}
  value={quickGasSaleForm.buyPrice || quickGasPrices.buyPrice || ''}
  onChange={(e) =>
    setQuickGasSaleForm((prev) => ({
      ...prev,
      buyPrice: e.target.value,
    }))
  }
/>

            <Input
  type="number"
  label={t(language, 'Selling Price', 'Bei ya Kuuza')}
  value={quickGasSaleForm.sellPrice || quickGasPrices.sellPrice || ''}
  onChange={(e) =>
    setQuickGasSaleForm((prev) => ({
      ...prev,
      sellPrice: e.target.value,
    }))
  }
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

      <Card className="xl:col-span-2">
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
                      <div className="mt-3 grid gap-2 text-xs text-slate-700 md:grid-cols-2">
  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Complete Small Cylinders Sold', 'Mitungi Midogo Kamili Iliyouzwa')}: {formatQty(entry.completeSmallCylinderSoldToday || 0)}
  </div>

  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Complete Big Cylinders Sold', 'Mitungi Mikubwa Kamili Iliyouzwa')}: {formatQty(entry.completeBigCylinderSoldToday || 0)}
  </div>

  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Complete Cylinder Profit', 'Faida ya Mtungi Kamili')}: TZS {currency(profits.completeGasProfit)}
  </div>

  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Gas Burners Sold', 'Bana za Gesi Zilizouzwa')}: {formatQty(entry.gasBurnerSoldToday || 0)}
  </div>

  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Gas Burner Profit', 'Faida ya Bana za Gesi')}: TZS {currency(profits.gasBurnerProfit)}
  </div>

  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Cylinder Pot Stands Sold', 'Mafiga ya Mitungi Yaliyouzwa')}: {formatQty(entry.mafigaSoldToday || 0)}
  </div>

  <div className="rounded-2xl bg-white px-3 py-2">
    {t(language, 'Cylinder Pot Stand Profit', 'Faida ya Mafiga ya Mitungi')}: TZS {currency(profits.mafigaProfit)}
  </div>
</div>
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
  const sumQty = (field) =>
    filteredGas.reduce((sum, entry) => sum + Number(entry?.[field] || 0), 0);

  const sumProfit = (field) =>
    filteredGas.reduce((sum, entry) => {
      const profits = getGasProfitBreakdown(entry);
      return sum + Number(profits?.[field] || 0);
    }, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[2600px] text-sm">
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

            <th className="py-2 pr-3">{t(language, 'Small Refill Sold', 'Gesi Ndogo Iliyojazwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Refill Sold', 'Gesi Kubwa Iliyojazwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Refill Buy Price', 'Bei ya Kununua Gesi Ndogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Refill Sell Price', 'Bei ya Kuuza Gesi Ndogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Refill Buy Price', 'Bei ya Kununua Gesi Kubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Refill Sell Price', 'Bei ya Kuuza Gesi Kubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Small Refill Profit', 'Faida ya Gesi Ndogo')}</th>
            <th className="py-2 pr-3">{t(language, 'Big Refill Profit', 'Faida ya Gesi Kubwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Refill Profit', 'Faida ya Kujaza Gesi')}</th>

            <th className="py-2 pr-3">{t(language, 'Complete Small Cylinders Sold', 'Mitungi Midogo Kamili Iliyouzwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Complete Big Cylinders Sold', 'Mitungi Mikubwa Kamili Iliyouzwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Complete Small Buy Price', 'Bei ya Kununua Mtungi Mdogo Kamili')}</th>
            <th className="py-2 pr-3">{t(language, 'Complete Small Sell Price', 'Bei ya Kuuza Mtungi Mdogo Kamili')}</th>
            <th className="py-2 pr-3">{t(language, 'Complete Big Buy Price', 'Bei ya Kununua Mtungi Mkubwa Kamili')}</th>
            <th className="py-2 pr-3">{t(language, 'Complete Big Sell Price', 'Bei ya Kuuza Mtungi Mkubwa Kamili')}</th>
            <th className="py-2 pr-3">{t(language, 'Complete Cylinder Profit', 'Faida ya Mtungi Kamili')}</th>

            <th className="py-2 pr-3">{t(language, 'Gas Burners Sold', 'Bana za Gesi Zilizouzwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Gas Burner Profit', 'Faida ya Bana za Gesi')}</th>
            <th className="py-2 pr-3">{t(language, 'Cylinder Pot Stands Sold', 'Mafiga ya Mitungi Yaliyouzwa')}</th>
            <th className="py-2 pr-3">{t(language, 'Cylinder Pot Stand Profit', 'Faida ya Mafiga ya Mitungi')}</th>

            <th className="py-2 pr-3">{t(language, 'Total Gas Business Profit', 'Jumla ya Faida ya Biashara ya Gesi')}</th>
          </tr>
        </thead>

        <tbody>
          {filteredGas.length === 0 ? (
            <tr>
              <td colSpan="29" className="py-4 text-slate-500">
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
                    <td className="py-3 pr-3">TZS {currency(profits.refillProfit)}</td>

                    <td className="py-3 pr-3">{formatQty(entry.completeSmallCylinderSoldToday)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.completeBigCylinderSoldToday)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.completeSmallCylinderBuyPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.completeSmallCylinderSellPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.completeBigCylinderBuyPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(entry.completeBigCylinderSellPrice)}</td>
                    <td className="py-3 pr-3">TZS {currency(profits.completeGasProfit)}</td>

                    <td className="py-3 pr-3">{formatQty(entry.gasBurnerSoldToday)}</td>
                    <td className="py-3 pr-3">TZS {currency(profits.gasBurnerProfit)}</td>
                    <td className="py-3 pr-3">{formatQty(entry.mafigaSoldToday)}</td>
                    <td className="py-3 pr-3">TZS {currency(profits.mafigaProfit)}</td>

                    <td className="py-3 pr-3 font-semibold">TZS {currency(profits.totalProfit)}</td>
                  </tr>
                );
              })}

              <tr className="bg-slate-50 font-semibold">
                <td className="py-3 pr-3">{t(language, 'TOTAL', 'JUMLA')}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('totalCylinders'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('smallCylindersTotal'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('bigCylindersTotal'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('smallCylindersWithGas'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('bigCylindersWithGas'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('smallEmptyCylinders'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('bigEmptyCylinders'))}</td>

                <td className="py-3 pr-3">{formatQty(sumQty('smallGasSoldToday'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('bigGasSoldToday'))}</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">TZS {currency(sumProfit('smallGasProfit'))}</td>
                <td className="py-3 pr-3">TZS {currency(sumProfit('bigGasProfit'))}</td>
                <td className="py-3 pr-3">TZS {currency(sumProfit('refillProfit'))}</td>

                <td className="py-3 pr-3">{formatQty(sumQty('completeSmallCylinderSoldToday'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('completeBigCylinderSoldToday'))}</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">-</td>
                <td className="py-3 pr-3">TZS {currency(sumProfit('completeGasProfit'))}</td>

                <td className="py-3 pr-3">{formatQty(sumQty('gasBurnerSoldToday'))}</td>
                <td className="py-3 pr-3">TZS {currency(sumProfit('gasBurnerProfit'))}</td>
                <td className="py-3 pr-3">{formatQty(sumQty('mafigaSoldToday'))}</td>
                <td className="py-3 pr-3">TZS {currency(sumProfit('mafigaProfit'))}</td>

                <td className="py-3 pr-3">TZS {currency(sumProfit('totalProfit'))}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
