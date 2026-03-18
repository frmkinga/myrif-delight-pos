import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ShoppingCart,
  Store,
  BarChart3,
  Package,
  CreditCard,
  AlertTriangle,
  LogOut,
  Receipt,
  PlusCircle,
  Boxes,
  Truck,
  Pencil,
  Trash2,
  Wallet,
  CalendarDays,
  HandCoins,
} from 'lucide-react';
const DEFAULT_LANGUAGE = "en";

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
async function exportBackup(auto = false) {
  try {
    const data = { ...localStorage }
    const result = await window.backupAPI.saveBackup(data)

    if (!result?.success) {
      console.error('Backup failed', result?.error)
      return
    }

    if (!auto) {
      alert(`Backup saved successfully.\n\n${result.filePath}`)
    }
  } catch (error) {
    console.error('Backup failed', error)
  }
}

async function restoreBackup() {
  try {
    const result = await window.backupAPI.restoreBackup()

    if (!result?.success) {
      if (!result?.canceled) {
        alert(`Restore failed: ${result?.error || 'Unknown error'}`)
      }
      return
    }

    const backupData = result.data || {}
    localStorage.clear()

    Object.entries(backupData).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    alert('Backup restored successfully. The app will now reload.')
    window.location.reload()
  } catch (error) {
    console.error('Restore failed', error)
    alert('Restore failed.')
  }
}
function Card({ className = '', children }) {
  return <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>;
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
function Button({ className = '', variant = 'default', size = 'default', type = 'button', children, ...props }) {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
    outline: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-100',
  };
  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-9 px-3 text-sm',
  };
  return <button type={type} className={cn('inline-flex items-center justify-center gap-2 rounded-xl transition', variants[variant] || variants.default, sizes[size] || sizes.default, className)} {...props}>{children}</button>;
}
function Input({ className = '', ...props }) {
  return <input className={cn('flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400', className)} {...props} />;
}
function Label({ className = '', children, ...props }) {
  return <label className={cn('mb-2 block text-sm font-medium text-slate-700', className)} {...props}>{children}</label>;
}
function Tabs({ value, onValueChange, children }) {
  const items = React.Children.toArray(children);
  return items.map((child) => React.isValidElement(child) ? React.cloneElement(child, { activeValue: value, setActiveValue: onValueChange }) : child);
}
function TabsList({ className = '', children, activeValue, setActiveValue }) {
  const items = React.Children.toArray(children);
  return <div className={className}>{items.map((child) => React.isValidElement(child) ? React.cloneElement(child, { activeValue, setActiveValue }) : child)}</div>;
}
function TabsTrigger({ value, className = '', children, activeValue, setActiveValue }) {
  const active = activeValue === value;
  return <button type="button" onClick={() => setActiveValue(value)} className={cn('px-4 py-2 text-sm transition', active ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900', className)}>{children}</button>;
}
function TabsContent({ value, children, activeValue }) {
  if (activeValue !== value) return null;
  return <div>{children}</div>;
}
function Table({ className = '', children }) { return <table className={cn('w-full text-left text-sm', className)}>{children}</table>; }
function TableHeader({ children }) { return <thead>{children}</thead>; }
function TableBody({ children }) { return <tbody>{children}</tbody>; }
function TableRow({ className = '', children }) { return <tr className={cn('border-b border-slate-100', className)}>{children}</tr>; }
function TableHead({ className = '', children }) { return <th className={cn('px-3 py-3 font-medium text-slate-600', className)}>{children}</th>; }
function TableCell({ className = '', children }) { return <td className={cn('px-3 py-3 align-top', className)}>{children}</td>; }
function Badge({ className = '', variant = 'secondary', children }) {
  const styles = variant === 'default' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700';
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', styles, className)}>{children}</span>;
}
function Separator({ className = '' }) { return <div className={cn('h-px w-full bg-slate-200', className)} />; }

const STORAGE_KEY = 'rafikiai_multi_shop_pos_v7';
const LOW_STOCK_THRESHOLD = 5;

const emptyProductRow = {
  id: '',
  name: '',
  unit: '',
  buyPrice: '',
  sellPrice: '',
  stockQty: '',
  minStockLevel: '5',
  expiryDate: '',
  subUnits: '0.5,0.25',
};

const emptyPurchaseRow = {
  id: '',
  productId: '',
  productName: '',
  qty: '',
  buyPrice: '',
};

const emptyExpenseRow = {
  id: '',
  description: '',
  amount: '',
};

const emptyChangeRow = {
  id: '',
  customerName: '',
  amountOwed: '',
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
    { id: 'u-admin', username: 'admin', password: 'admin123', role: 'owner', shopId: null, name: 'Owner Admin' },
    { id: 'u-1', username: 'shop1', password: '1234', role: 'shop', shopId: 'shop-1', name: 'Nyumbani Shop User' },
    { id: 'u-2', username: 'shop2', password: '1234', role: 'shop', shopId: 'shop-2', name: 'Mkwajuni Shop User' },
    { id: 'u-3', username: 'shop3', password: '1234', role: 'shop', shopId: 'shop-3', name: 'Kwa Maganga Shop User' },
    { id: 'u-4', username: 'shop4', password: '1234', role: 'shop', shopId: 'shop-4', name: 'Shangwe Shop User' },
    { id: 'u-5', username: 'shop5', password: '1234', role: 'shop', shopId: 'shop-5', name: 'Mungu Mwema Shop User' },
  ],
  products: [
    {
      id: 'p1',
      shopId: 'shop-1',
      name: 'Rice',
      baseUnit: 'kg',
      baseQty: 1,
      buyPrice: 2300,
      sellPrice: 2600,
      stockBaseQty: 50,
      minStockLevel: 5,
      expiryDate: '',
      subUnits: [
        { id: 'su1', label: '1kg', qty: 1, sellPrice: 2600 },
        { id: 'su2', label: '0.75kg', qty: 0.75, sellPrice: 1950 },
        { id: 'su3', label: '0.5kg', qty: 0.5, sellPrice: 1300 },
        { id: 'su4', label: '0.25kg', qty: 0.25, sellPrice: 650 },
      ],
    },
    {
      id: 'p2',
      shopId: 'shop-1',
      name: 'Edible Oil',
      baseUnit: 'ltr',
      baseQty: 1,
      buyPrice: 2400,
      sellPrice: 2600,
      stockBaseQty: 30,
      minStockLevel: 5,
      expiryDate: '',
      subUnits: [
        { id: 'su5', label: '1ltr', qty: 1, sellPrice: 2600 },
        { id: 'su6', label: '0.5ltr', qty: 0.5, sellPrice: 1300 },
        { id: 'su7', label: '0.25ltr', qty: 0.25, sellPrice: 650 },
      ],
    },
    {
      id: 'p3',
      shopId: 'shop-1',
      name: 'Whitedent',
      baseUnit: 'pc',
      baseQty: 1,
      buyPrice: 400,
      sellPrice: 500,
      stockBaseQty: 120,
      minStockLevel: 10,
      expiryDate: '',
      subUnits: [{ id: 'su8', label: '1pc', qty: 1, sellPrice: 500 }],
    },
  ],
  sales: [],
  creditSales: [],
  changeLedger: [],
  expenses: [],
  purchases: [],
};

function readData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...seedData,
      ...parsed,
      shops: parsed.shops?.length ? parsed.shops : seedData.shops,
      users: parsed.users?.length ? parsed.users : seedData.users,
      products: Array.isArray(parsed.products) ? parsed.products : seedData.products,
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
      creditSales: Array.isArray(parsed.creditSales) ? parsed.creditSales : [],
      changeLedger: Array.isArray(parsed.changeLedger) ? parsed.changeLedger : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
    };
  } catch {
    return seedData;
  }
}

function currency(n) {
  return new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(Number(n || 0));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isWithinDays(date, days) {
  if (!date) return false;
  const now = new Date();
  const d = new Date(date);
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

function makeSubUnits(baseUnit, sellPrice, text) {
  const values = [1, ...String(text || '').split(',').map((v) => Number(v.trim())).filter(Boolean)]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => b - a);
  return values.map((qty, i) => ({
    id: `${Date.now()}-${i}-${qty}`,
    label: `${qty}${baseUnit}`,
    qty,
    sellPrice: Math.round(Number(sellPrice || 0) * qty),
  }));
}

function buildDynamicUnit(baseUnit, sellPrice, rawQty) {
  const qty = Number(rawQty || 0);
  if (!qty || qty <= 0) return null;
  return {
    id: `dyn-${baseUnit}-${qty}`,
    label: `${qty}${baseUnit}`,
    qty,
    sellPrice: Math.round(Number(sellPrice || 0) * qty),
  };
}

function inRange(date, days) {
  const d = new Date(date);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return d >= start && d <= now;
}

function filterByPeriod(items, period) {
  if (period === 'daily') return items.filter((x) => x.date === todayISO());
  if (period === 'weekly') return items.filter((x) => inRange(x.date, 7));
  if (period === 'monthly') return items.filter((x) => inRange(x.date, 30));
  if (period === '6months') return items.filter((x) => inRange(x.date, 183));
  if (period === 'annual') return items.filter((x) => inRange(x.date, 365));
  return items;
}

function productExists(products, shopId, name, ignoreId = '') {
  const normalized = String(name || '').trim().toLowerCase();
  if (!normalized) return false;
  return products.some((p) => p.shopId === shopId && p.id !== ignoreId && String(p.name || '').trim().toLowerCase() === normalized);
}

function AppShell({ children }) {
  return <div className="min-h-screen bg-slate-50 p-4 md:p-6">{children}</div>;
}

function StatCard({ title, value, icon: Icon, note }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
            {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Login({ onLogin, users, resetDemo }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const submit = () => {
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      setError('Wrong username or password.');
      return;
    }
    setError('');
    onLogin(user);
  };

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Multi-Shop POS</h1>
                <p className="text-sm text-slate-500">Lightweight system for five independent shops</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button className="w-full rounded-2xl" onClick={submit}>Log in</Button>
              <Button variant="outline" className="w-full rounded-2xl" onClick={resetDemo}>Reset Demo Data</Button>
            </div>
            <Separator className="my-6" />
            <div className="text-sm text-slate-600">
              <p className="font-medium">Demo accounts</p>
              <p>Owner: admin / admin123</p>
              <p>Shop users: shop1 to shop5 / 1234</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold">What this MVP does</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white p-4 shadow-sm">Separate login for each shop</div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">Owner can click and view each shop separately</div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">Record products, purchases, sales, credit, expenses, and change owed</div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">Auto-derived sub-unit pricing like 0.5kg or 0.25ltr</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function OwnerDashboard({ data, openShop, logout, ownerPeriod, setOwnerPeriod }) {
  const salesInPeriod = filterByPeriod(data.sales, ownerPeriod);
  const expensesInPeriod = filterByPeriod(data.expenses, ownerPeriod);
  const creditInPeriod = filterByPeriod(data.creditSales, ownerPeriod);

  const totals = data.shops.map((shop) => {
    const shopSales = salesInPeriod.filter((s) => s.shopId === shop.id);
    const shopProducts = data.products.filter((p) => p.shopId === shop.id);
    const shopExpenses = expensesInPeriod.filter((e) => e.shopId === shop.id);
    const salesValue = shopSales.reduce((a, s) => a + s.total, 0);
    const expenseValue = shopExpenses.reduce((a, e) => a + e.amount, 0);
    const grossProfit = shopSales.reduce((a, sale) => a + sale.items.reduce((b, i) => b + ((i.unitSellPrice - i.unitBuyPrice) * i.quantity), 0), 0);
    const lowStockCount = shopProducts.filter((p) => Number(p.stockBaseQty) <= Number(p.minStockLevel || LOW_STOCK_THRESHOLD)).length;
    return {
      ...shop,
      salesValue,
      productsCount: shopProducts.length,
      expenseValue,
      netProfit: grossProfit - expenseValue,
      lowStockCount,
    };
  });

  const totalExpenses = expensesInPeriod.reduce((a, e) => a + e.amount, 0);
  const totalProfit = totals.reduce((a, s) => a + s.netProfit, 0);
  const totalSales = salesInPeriod.reduce((a, s) => a + s.total, 0);
  const totalCreditBalance = creditInPeriod.reduce((a, c) => a + c.balance, 0);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
          <p className="text-sm text-slate-500">Open any shop and see its activity instantly.</p>
        </div>
<Button onClick={exportBackup}>
  Backup Data
</Button>
<Button variant="outline" onClick={restoreBackup}>
Restore Backup
</Button>
        <Button variant="outline" className="rounded-2xl" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <CalendarDays className="h-4 w-4" />
        <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={ownerPeriod} onChange={(e) => setOwnerPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="6months">6 Months</option>
          <option value="annual">Annual</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Shops" value={data.shops.length} icon={Store} />
        <StatCard title="Sales" value={`TZS ${currency(totalSales)}`} icon={BarChart3} />
        <StatCard title="Expenses" value={`TZS ${currency(totalExpenses)}`} icon={AlertTriangle} />
        <StatCard title="Total Profit" value={`TZS ${currency(totalProfit)}`} icon={Wallet} />
        <StatCard title="Credit Balance" value={`TZS ${currency(totalCreditBalance)}`} icon={CreditCard} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {totals.map((shop) => (
          <Card key={shop.id} className="rounded-3xl shadow-sm">
            <CardHeader><CardTitle className="flex items-center justify-between"><span>{shop.name}</span><Badge variant="secondary">Independent</Badge></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">Products: {shop.productsCount}</p>
              <p className="text-sm text-slate-500">Sales: TZS {currency(shop.salesValue)}</p>
              <p className="text-sm text-slate-500">Expenses: TZS {currency(shop.expenseValue)}</p>
              <p className="text-sm text-slate-500">Net Profit: TZS {currency(shop.netProfit)}</p>
              <p className="text-sm text-slate-500">Low stock items: {shop.lowStockCount}</p>
              <Button className="w-full rounded-2xl" onClick={() => openShop(shop.id)}>Open {shop.name}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function ShopDashboard({ shop, data, saveData, backToOwner, logout, canBack }) {
  const products = data.products.filter((p) => p.shopId === shop.id);
  const sales = data.sales.filter((s) => s.shopId === shop.id);
  const creditSales = data.creditSales.filter((s) => s.shopId === shop.id);
  const changeLedger = data.changeLedger.filter((s) => s.shopId === shop.id);
  const expenses = data.expenses.filter((e) => e.shopId === shop.id);
  const purchases = data.purchases.filter((p) => p.shopId === shop.id);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedUnitLabel, setSelectedUnitLabel] = useState('');
  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [creditCustomer, setCreditCustomer] = useState('');
  const [creditAmountPaid, setCreditAmountPaid] = useState('0');
  const [creditTotal, setCreditTotal] = useState('');
  const [expenseRows, setExpenseRows] = useState([{ ...emptyExpenseRow }]);
  const [changeRows, setChangeRows] = useState([{ ...emptyChangeRow }]);
  const [quickSearch, setQuickSearch] = useState('');
  const [newProductRows, setNewProductRows] = useState([{ ...emptyProductRow }]);
  const [purchaseRows, setPurchaseRows] = useState([{ ...emptyPurchaseRow }]);
  const [quickQtyMap, setQuickQtyMap] = useState({});
  const [customUnitQty, setCustomUnitQty] = useState('');
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [productFormError, setProductFormError] = useState('');
  const [purchaseFormError, setPurchaseFormError] = useState('');
  const [creditFormError, setCreditFormError] = useState('');
  const [changeFormError, setChangeFormError] = useState('');
  const [purchaseAnalysisPeriod, setPurchaseAnalysisPeriod] = useState('monthly');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;
  const unitOptions = selectedProduct?.subUnits || [];
  const dynamicUnit = selectedProduct ? buildDynamicUnit(selectedProduct.baseUnit, selectedProduct.sellPrice, customUnitQty) : null;
  const mergedUnitOptions = dynamicUnit ? [dynamicUnit, ...unitOptions.filter((u) => u.label !== dynamicUnit.label)] : unitOptions;
  const selectedUnit = mergedUnitOptions.find((u) => u.label === selectedUnitLabel) || mergedUnitOptions[0] || null;

  const quickProducts = quickSearch.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(quickSearch.toLowerCase())).slice(0, 30)
    : [...products].slice(-30).reverse();

  const filteredSales = filterByPeriod(sales, reportPeriod);
  const filteredExpenses = filterByPeriod(expenses, reportPeriod);
  const filteredCredits = filterByPeriod(creditSales, reportPeriod);

  const todaySales = filterByPeriod(sales, 'daily').reduce((a, s) => a + s.total, 0);
  const stockCostValue = products.reduce((a, p) => a + p.stockBaseQty * p.buyPrice, 0);
  const totalExpenses = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const salesValue = filteredSales.reduce((a, s) => a + s.total, 0);
  const creditBalance = filteredCredits.reduce((a, c) => a + c.balance, 0);
  const expiringSoon = products.filter((p) => isWithinDays(p.expiryDate, 30));
  const lowStockProducts = products.filter((p) => Number(p.stockBaseQty) <= Number(p.minStockLevel || LOW_STOCK_THRESHOLD));

  const cartTotal = cart.reduce((a, item) => a + item.total, 0);
  const effectiveCreditTotal = Number(creditTotal || 0) > 0 ? Number(creditTotal || 0) : cartTotal;
  const grossProfitEstimate = filteredSales.reduce((a, sale) => a + sale.items.reduce((b, i) => b + ((i.unitSellPrice - i.unitBuyPrice) * i.quantity), 0), 0);
  const simplePL = grossProfitEstimate - totalExpenses;
  const stockSaleValue = products.reduce((sum, p) => sum + p.stockBaseQty * p.sellPrice, 0);
  const stockProfitIfSold = products.reduce((sum, p) => sum + p.stockBaseQty * (p.sellPrice - p.buyPrice), 0);
  const filteredPurchasesForAnalysis = filterByPeriod(purchases, purchaseAnalysisPeriod);
  const totalPurchaseSpendForAnalysis = filteredPurchasesForAnalysis.reduce((sum, p) => sum + Number(p.qty || 0) * Number(p.buyPrice || 0), 0);
  const filteredSalesForAnalysis = filterByPeriod(sales, purchaseAnalysisPeriod);
  const totalSalesForAnalysis = filteredSalesForAnalysis.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const grossProfitFromSalesForAnalysis = filteredSalesForAnalysis.reduce(
    (sum, sale) => sum + sale.items.reduce((inner, item) => inner + ((Number(item.unitSellPrice || 0) - Number(item.unitBuyPrice || 0)) * Number(item.quantity || 0)), 0),
    0,
  );
  const estimatedOperatingSurplusForAnalysis = totalSalesForAnalysis - totalPurchaseSpendForAnalysis;

  const fastMoving = useMemo(() => [...products].map((p) => {
    const soldQty = sales.flatMap((s) => s.items).filter((i) => i.productId === p.id).reduce((a, i) => a + (i.baseQtySold || 0), 0);
    return { ...p, soldQty };
  }).sort((a, b) => b.soldQty - a.soldQty).slice(0, 5), [products, sales]);

  const slowMoving = useMemo(() => [...products].map((p) => {
    const soldQty = sales.flatMap((s) => s.items).filter((i) => i.productId === p.id).reduce((a, i) => a + (i.baseQtySold || 0), 0);
    return { ...p, soldQty };
  }).sort((a, b) => a.soldQty - b.soldQty).slice(0, 5), [products, sales]);

const importProductsFromExcel = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const dataArray = new Uint8Array(e.target.result);
      const workbook = XLSX.read(dataArray, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const importedProducts = rows
        .map((row, index) => {
          const productName = String(row['product name'] || '').trim();
          const unitRaw = String(row['unit'] || '').trim().toLowerCase();
          const stock = Number(row['available stock'] || 0);
          const buyPrice = Number(row['buying price'] || 0);
          const sellPrice = Number(row['selling price'] || 0);
          const minStock = Number(row['minimum stock'] || 5);
          const qrCode = String(row['qr code'] || '').trim();

          const unit =
            unitRaw === 'kg' ? 'kg' :
            unitRaw === 'ltr' || unitRaw === 'lt' ? 'ltr' :
            unitRaw === 'pc' || unitRaw === 'pcs' ? 'pc' :
            '';

          if (!productName || !unit || buyPrice <= 0 || sellPrice <= 0) {
            return null;
          }

          return {
            id: `import-${Date.now()}-${index}`,
            shopId: shop.id,
            name: productName,
            baseUnit: unit,
            baseQty: 1,
            buyPrice,
            sellPrice,
            stockBaseQty: stock,
            minStockLevel: minStock,
            expiryDate: '',
            qrCode,
            subUnits: makeSubUnits(unit, sellPrice, '0.5,0.25'),
          };
        })
        .filter(Boolean);

      if (!importedProducts.length) {
        alert('No valid products found in the Excel file.');
        return;
      }

      saveData({
        ...data,
        products: [...data.products, ...importedProducts],
      });

      alert(`${importedProducts.length} products imported successfully.`);
      event.target.value = '';
    } catch (error) {
      console.error(error);
      alert('Excel import failed.');
    }
  };

  reader.readAsArrayBuffer(file);
};
  const addProductRow = () => {
    setProductFormError('');
    setNewProductRows((prev) => [...prev, { ...emptyProductRow }]);
  };

  const updateProductRow = (index, field, value) => {
    setProductFormError('');
    setNewProductRows((prev) => {
      const next = prev.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      if (field === 'name') {
        const match = products.find((p) => String(p.name || '').trim().toLowerCase() === String(value || '').trim().toLowerCase());
        if (match && !next[index].id) {
          next[index] = {
            id: match.id,
            name: match.name,
            unit: match.baseUnit,
            buyPrice: String(match.buyPrice),
            sellPrice: String(match.sellPrice),
            stockQty: String(match.stockBaseQty),
            minStockLevel: String(match.minStockLevel || LOW_STOCK_THRESHOLD),
            expiryDate: match.expiryDate || '',
            subUnits: match.subUnits.filter((u) => u.qty !== 1).map((u) => String(u.qty)).join(','),
          };
        }
      }
      return next;
    });
  };

  const removeProductRow = (index) => {
    setProductFormError('');
    setNewProductRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ ...emptyProductRow }];
    });
  };

  const saveProductRows = () => {
    const rows = newProductRows.filter((row) => row.name || row.unit || row.buyPrice || row.sellPrice || row.stockQty || row.subUnits);
    if (!rows.length) {
      setProductFormError('Please fill at least one product row.');
      return;
    }
const importProductsFromExcel = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(e.target.result, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const nextProducts = [...data.products];

      rows.forEach((row, idx) => {
        const productName = String(row['product name'] || '').trim();
        const unit = String(row['unit'] || '').trim().toLowerCase();
        const availableStock = Number(row['available stock'] || 0);
        const buyingPrice = Number(row['buying price'] || 0);
        const sellingPrice = Number(row['selling price'] || 0);
        const minimumStock = Number(row['minimum stock'] || LOW_STOCK_THRESHOLD);
        const qrCode = String(row['qr code'] || '').trim();

        if (!productName || !unit || buyingPrice <= 0 || sellingPrice <= 0) {
          return;
        }

        const normalizedUnit =
          unit === 'kg' ? 'kg' :
          unit === 'ltr' || unit === 'lt' ? 'ltr' :
          unit === 'pc' || unit === 'pcs' ? 'pc' :
          '';

        if (!normalizedUnit) return;

        const existingIndex = nextProducts.findIndex(
          (p) =>
            p.shopId === shop.id &&
            String(p.name || '').trim().toLowerCase() === productName.toLowerCase()
        );

        const productObj = {
          id: existingIndex >= 0 ? nextProducts[existingIndex].id : `p-import-${Date.now()}-${idx}`,
          shopId: shop.id,
          name: productName,
          baseUnit: normalizedUnit,
          baseQty: 1,
          buyPrice: buyingPrice,
          sellPrice: sellingPrice,
          stockBaseQty: availableStock,
          minStockLevel: minimumStock,
          expiryDate: '',
          qrCode,
          subUnits: makeSubUnits(normalizedUnit, sellingPrice, '0.5,0.25'),
        };

        if (existingIndex >= 0) {
          nextProducts[existingIndex] = productObj;
        } else {
          nextProducts.push(productObj);
        }
      });

      saveData({ ...data, products: nextProducts });
      alert('Products imported successfully.');
    } catch (error) {
      console.error(error);
      alert('Excel import failed.');
    }
  };

  reader.readAsArrayBuffer(file);
};
    if (rows.some((row) => !row.unit)) {
      setProductFormError('Please choose unit for every product: kg, lt or pcs.');
      return;
    }
    if (rows.some((row) => !row.name || !row.unit || row.buyPrice === '' || row.sellPrice === '' || row.stockQty === '')) {
      setProductFormError('Please fill product name, unit, buying price, selling price and opening stock for every row.');
      return;
    }

    const existingIds = new Set(data.products.map((p) => p.id));
    const nextProducts = [...data.products];
    rows.forEach((row, idx) => {
      const matchedExisting = row.id
        ? nextProducts.find((p) => p.id === row.id)
        : nextProducts.find(
            (p) => p.shopId === shop.id && String(p.name || '').trim().toLowerCase() === String(row.name || '').trim().toLowerCase(),
          );

      const productObj = {
        id: matchedExisting?.id || row.id || `p-${Date.now()}-${idx}`,
        shopId: shop.id,
        name: row.name,
        baseUnit: row.unit,
        baseQty: 1,
        buyPrice: Number(row.buyPrice || 0),
        sellPrice: Number(row.sellPrice || 0),
        stockBaseQty: Number(row.stockQty || 0),
        minStockLevel: Number(row.minStockLevel || LOW_STOCK_THRESHOLD),
        expiryDate: row.expiryDate || '',
        subUnits: makeSubUnits(row.unit, row.sellPrice || 0, row.subUnits),
      };

      if (matchedExisting && existingIds.has(productObj.id)) {
        const index = nextProducts.findIndex((p) => p.id === productObj.id);
        nextProducts[index] = productObj;
      } else {
        nextProducts.push(productObj);
      }
    });
    saveData({ ...data, products: nextProducts });
    setProductFormError('');
    setNewProductRows([{ ...emptyProductRow }]);
  };

  const editProduct = (product) => {
    setActiveTab('products');
    setProductFormError('');
    setNewProductRows([{
      id: product.id,
      name: product.name,
      unit: product.baseUnit,
      buyPrice: String(product.buyPrice),
      sellPrice: String(product.sellPrice),
      stockQty: String(product.stockBaseQty),
      minStockLevel: String(product.minStockLevel || LOW_STOCK_THRESHOLD),
      expiryDate: product.expiryDate || '',
      subUnits: product.subUnits.filter((u) => u.qty !== 1).map((u) => String(u.qty)).join(','),
    }]);
  };

  const deleteProduct = (productId) => {
    saveData({
      ...data,
      products: data.products.filter((p) => p.id !== productId),
      purchases: data.purchases.filter((p) => p.productId !== productId),
    });
  };

  const addPurchaseRow = () => {
    setPurchaseFormError('');
    setPurchaseRows((prev) => [...prev, { ...emptyPurchaseRow }]);
  };

  const updatePurchaseRow = (index, field, value) => {
    setPurchaseFormError('');
    setPurchaseRows((prev) => prev.map((row, i) => {
      if (i !== index) return row;
      const nextRow = { ...row, [field]: value };
      if (field === 'productName') {
        const match = products.find((p) => p.name.toLowerCase() === String(value).toLowerCase());
        if (match) {
          nextRow.productId = match.id;
          nextRow.productName = match.name;
          nextRow.buyPrice = nextRow.buyPrice || String(match.buyPrice || '');
        }
      }
      return nextRow;
    }));
  };

  const removePurchaseRow = (index) => {
    setPurchaseFormError('');
    setPurchaseRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ ...emptyPurchaseRow }];
    });
  };

  const savePurchases = () => {
    const rows = purchaseRows.filter((row) => row.productName || row.qty || row.buyPrice);
    if (!rows.length) {
      setPurchaseFormError('Please fill at least one purchase row.');
      return;
    }
    if (rows.some((row) => !row.productId || Number(row.qty) <= 0)) {
      setPurchaseFormError('Choose an existing product and quantity greater than zero for every purchase row.');
      return;
    }

    const updatedProducts = data.products.map((p) => {
      const adds = rows.filter((row) => row.productId === p.id).reduce((sum, row) => sum + Number(row.qty), 0);
      const latestBuy = rows.filter((row) => row.productId === p.id).slice(-1)[0]?.buyPrice;
      if (!adds) return p;
      return { ...p, stockBaseQty: Number(p.stockBaseQty) + adds, buyPrice: latestBuy ? Number(latestBuy) : p.buyPrice };
    });
    const purchaseRecords = rows.map((row, idx) => ({
      id: row.id || `pur-${Date.now()}-${idx}`,
      shopId: shop.id,
      productId: row.productId,
      productName: products.find((p) => p.id === row.productId)?.name || row.productName || 'Product',
      qty: Number(row.qty),
      buyPrice: Number(row.buyPrice || 0),
      date: todayISO(),
    }));
    const existingIds = new Set(data.purchases.map((p) => p.id));
    const nextPurchases = [...data.purchases];
    purchaseRecords.forEach((r) => {
      if (existingIds.has(r.id)) {
        const i = nextPurchases.findIndex((p) => p.id === r.id);
        nextPurchases[i] = r;
      } else {
        nextPurchases.push(r);
      }
    });
    saveData({ ...data, products: updatedProducts, purchases: nextPurchases });
    setPurchaseFormError('');
    setPurchaseRows([{ ...emptyPurchaseRow }]);
  };

  const editPurchase = (purchase) => {
    setActiveTab('purchases');
    setPurchaseFormError('');
    setPurchaseRows([{
      id: purchase.id,
      productId: purchase.productId,
      productName: purchase.productName,
      qty: String(purchase.qty),
      buyPrice: String(purchase.buyPrice),
    }]);
  };

  const deletePurchase = (purchaseId) => {
    saveData({ ...data, purchases: data.purchases.filter((p) => p.id !== purchaseId) });
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedUnit) return;
    const count = Number(qty || 1);
    const baseQtySold = selectedUnit.qty * count;
    if (selectedProduct.stockBaseQty < baseQtySold) return;
    const unitBuyPrice = selectedProduct.buyPrice * selectedUnit.qty;
    const item = {
      id: `${Date.now()}-${selectedProduct.id}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      unitLabel: selectedUnit.label,
      quantity: count,
      unitSellPrice: selectedUnit.sellPrice,
      unitBuyPrice,
      baseQtySold,
      total: selectedUnit.sellPrice * count,
    };
    setCart((prev) => [item, ...prev]);
    setQty(1);
    setCustomUnitQty('');
  };

  const quickAddProductToCart = (product, count = 1) => {
    const unit = product.subUnits?.[0];
    if (!unit) return;
    const qtyNumber = Number(count || 1);
    const baseQtySold = unit.qty * qtyNumber;
    if (product.stockBaseQty < baseQtySold) return;
    const unitBuyPrice = product.buyPrice * unit.qty;
    const item = {
      id: `${Date.now()}-${product.id}`,
      productId: product.id,
      name: product.name,
      unitLabel: unit.label,
      quantity: qtyNumber,
      unitSellPrice: unit.sellPrice,
      unitBuyPrice,
      baseQtySold,
      total: unit.sellPrice * qtyNumber,
    };
    setCart((prev) => [item, ...prev]);
    setSelectedProductId(product.id);
    setSelectedUnitLabel(unit.label);
  };

  const removeCartItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const commitSale = (type = 'cash') => {
    if (type === 'credit' && !creditCustomer.trim()) {
      setCreditFormError('Please enter customer name for credit sale.');
      return;
    }
    if (type === 'credit' && Number(effectiveCreditTotal) <= 0) {
      setCreditFormError('Please enter credit amount.');
      return;
    }
    if (type !== 'credit' && !cart.length) {
      setCreditFormError('Add items to selected items first.');
      return;
    }

    const saleTotal = type === 'credit' ? Number(effectiveCreditTotal) : cartTotal;
    const sale = {
      id: `sale-${Date.now()}`,
      shopId: shop.id,
      date: todayISO(),
      total: saleTotal,
      items: type === 'credit' ? [] : cart,
      type,
      customerName: type === 'credit' ? creditCustomer : customerName,
      amountPaid: type === 'credit' ? Number(creditAmountPaid || 0) : saleTotal,
    };

    const updatedProducts = type === 'credit'
      ? data.products
      : data.products.map((p) => {
          const sold = cart.filter((i) => i.productId === p.id).reduce((a, i) => a + i.baseQtySold, 0);
          return sold ? { ...p, stockBaseQty: Number((p.stockBaseQty - sold).toFixed(3)) } : p;
        });

    const next = { ...data, products: updatedProducts, sales: [...data.sales, sale] };
    if (type === 'credit') {
      next.creditSales = [
        ...data.creditSales,
        {
          id: `cr-${Date.now()}`,
          shopId: shop.id,
          customerName: creditCustomer || 'Walk-in Credit Customer',
          total: saleTotal,
          amountPaid: Number(creditAmountPaid || 0),
          balance: saleTotal - Number(creditAmountPaid || 0),
          date: todayISO(),
        },
      ];
    }
    saveData(next);
    setCreditFormError('');
    setCart([]);
    setCustomerName('');
    setCreditCustomer('');
    setCreditAmountPaid('0');
    setCreditTotal('');
  };

  const payCredit = (creditId, payAmount) => {
    const amount = Number(payAmount || 0);
    if (!amount || amount <= 0) return;
    let paymentSale = null;
    const updatedCredits = data.creditSales.map((c) => {
      if (c.id !== creditId) return c;
      const applied = Math.min(amount, Number(c.balance));
      paymentSale = { id: `repay-${Date.now()}`, shopId: shop.id, date: todayISO(), total: applied, items: [], type: 'credit-repayment', customerName: c.customerName, amountPaid: applied };
      return { ...c, amountPaid: Number(c.amountPaid) + applied, balance: Number(c.balance) - applied };
    });
    saveData({ ...data, creditSales: updatedCredits, sales: paymentSale ? [...data.sales, paymentSale] : data.sales });
  };

  const markCreditPaid = (creditId) => {
    let paymentSale = null;
    const updatedCredits = data.creditSales.map((c) => {
      if (c.id !== creditId) return c;
      if (Number(c.balance) <= 0) return c;
      paymentSale = { id: `repay-full-${Date.now()}`, shopId: shop.id, date: todayISO(), total: Number(c.balance), items: [], type: 'credit-repayment', customerName: c.customerName, amountPaid: Number(c.balance) };
      return { ...c, amountPaid: Number(c.amountPaid) + Number(c.balance), balance: 0 };
    });
    saveData({ ...data, creditSales: updatedCredits, sales: paymentSale ? [...data.sales, paymentSale] : data.sales });
  };

  const deleteCredit = (creditId) => {
    saveData({ ...data, creditSales: data.creditSales.filter((c) => c.id !== creditId) });
  };

  const addExpenseRow = () => setExpenseRows((prev) => [...prev, { ...emptyExpenseRow }]);
  const updateExpenseRow = (index, field, value) => setExpenseRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const removeExpenseRow = (index) => setExpenseRows((prev) => {
    const next = prev.filter((_, i) => i !== index);
    return next.length ? next : [{ ...emptyExpenseRow }];
  });
  const saveExpenseRows = () => {
    const validRows = expenseRows.filter((row) => row.description && Number(row.amount) > 0);
    if (!validRows.length) return;
    const nextExpenses = [...data.expenses];
    validRows.forEach((row, idx) => {
      const record = { id: row.id || `ex-${Date.now()}-${idx}`, shopId: shop.id, description: row.description, amount: Number(row.amount), date: todayISO() };
      const exIdx = nextExpenses.findIndex((e) => e.id === record.id);
      if (exIdx >= 0) nextExpenses[exIdx] = record; else nextExpenses.push(record);
    });
    saveData({ ...data, expenses: nextExpenses });
    setExpenseRows([{ ...emptyExpenseRow }]);
  };
  const deleteExpense = (id) => saveData({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
  const editExpense = (expense) => {
    setActiveTab('expenses');
    setExpenseRows([{ id: expense.id, description: expense.description, amount: String(expense.amount) }]);
  };

  const addChangeRow = () => {
    setChangeFormError('');
    setChangeRows((prev) => [...prev, { ...emptyChangeRow }]);
  };
  const updateChangeRow = (index, field, value) => {
    setChangeFormError('');
    setChangeRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };
  const removeChangeRow = (index) => {
    setChangeFormError('');
    setChangeRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ ...emptyChangeRow }];
    });
  };
  const saveChangeRows = () => {
    const rows = changeRows.filter((row) => row.customerName || row.amountOwed);
    if (!rows.length) {
      setChangeFormError('Please fill at least one change owed row.');
      return;
    }
    if (rows.some((row) => !row.customerName || Number(row.amountOwed) <= 0)) {
      setChangeFormError('Please enter customer name and amount owed for each row.');
      return;
    }
    const nextChanges = [...data.changeLedger];
    rows.forEach((row, idx) => {
      const record = { id: row.id || `chg-${Date.now()}-${idx}`, shopId: shop.id, customerName: row.customerName, amountOwed: Number(row.amountOwed), date: todayISO(), status: 'Pending' };
      const chIdx = nextChanges.findIndex((c) => c.id === record.id);
      if (chIdx >= 0) nextChanges[chIdx] = record; else nextChanges.push(record);
    });
    saveData({ ...data, changeLedger: nextChanges });
    setChangeFormError('');
    setChangeRows([{ ...emptyChangeRow }]);
  };
  const clearChange = (id) => saveData({ ...data, changeLedger: data.changeLedger.map((c) => c.id === id ? { ...c, status: 'Paid' } : c) });
  const reduceChange = (id, reduceAmount) => {
    const amount = Number(reduceAmount || 0);
    if (!amount || amount <= 0) return;
    saveData({
      ...data,
      changeLedger: data.changeLedger.map((c) => {
        if (c.id !== id) return c;
        const newBal = Math.max(0, Number(c.amountOwed) - amount);
        return { ...c, amountOwed: newBal, status: newBal === 0 ? 'Paid' : 'Pending' };
      }),
    });
  };
  const deleteChange = (id) => saveData({ ...data, changeLedger: data.changeLedger.filter((c) => c.id !== id) });
  const editChange = (change) => {
    setActiveTab('change');
    setChangeRows([{ id: change.id, customerName: change.customerName, amountOwed: String(change.amountOwed) }]);
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{shop.name}</h1>
          <p className="text-sm text-slate-500">Independent shop view with sales, stock, credit, and reports.</p>
        </div>
        <div className="flex gap-2">
          {canBack ? <Button variant="outline" className="rounded-2xl" onClick={backToOwner}>Back to Owner</Button> : null}
          <Button variant="outline" className="rounded-2xl" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex h-auto flex-wrap gap-2 rounded-2xl bg-transparent p-0">
          <TabsTrigger value="dashboard" className="rounded-2xl">Dashboard</TabsTrigger>
          <TabsTrigger value="products" className="rounded-2xl">Record Products</TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-2xl">Record Purchases</TabsTrigger>
          <TabsTrigger value="pos" className="rounded-2xl">Sales</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-2xl">Expenses</TabsTrigger>
          <TabsTrigger value="credit" className="rounded-2xl">Credit</TabsTrigger>
          <TabsTrigger value="change" className="rounded-2xl">Change Owed</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-2xl">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Today's Sales" value={`TZS ${currency(todaySales)}`} icon={ShoppingCart} />
            <StatCard title="Products" value={products.length} icon={Package} />
            <StatCard title="Stock Cost Value" value={`TZS ${currency(stockCostValue)}`} icon={Boxes} />
            <StatCard title="Expenses" value={`TZS ${currency(totalExpenses)}`} icon={AlertTriangle} />
            <StatCard title="Credit Balance" value={`TZS ${currency(creditBalance)}`} icon={CreditCard} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Expiry Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Expiring in 30 days: <span className="font-medium">{expiringSoon.length}</span></p>
                <div className="space-y-2">{expiringSoon.slice(0, 5).map((p) => <div key={p.id} className="rounded-2xl bg-white p-3 shadow-sm">{p.name} - {p.expiryDate}</div>)}</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Below Stock Level</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lowStockProducts.length === 0 ? <div className="rounded-2xl bg-white p-3 shadow-sm">No low stock items.</div> : lowStockProducts.slice(0, 8).map((p) => <div key={p.id} className="rounded-2xl bg-white p-3 shadow-sm text-red-600">{p.name} - {p.stockBaseQty} {p.baseUnit}</div>)}
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Movement Summary</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div><p className="mb-2 text-sm font-medium">Fast moving</p><div className="space-y-2">{fastMoving.map((p) => <div key={p.id} className="rounded-2xl bg-white p-3 shadow-sm text-sm">{p.name} - {p.soldQty.toFixed(2)} {p.baseUnit}</div>)}</div></div>
                <div><p className="mb-2 text-sm font-medium">Slow moving</p><div className="space-y-2">{slowMoving.map((p) => <div key={p.id} className="rounded-2xl bg-white p-3 shadow-sm text-sm">{p.name} - {p.soldQty.toFixed(2)} {p.baseUnit}</div>)}</div></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Product List</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Buy</TableHead><TableHead>Sale</TableHead><TableHead>Qty</TableHead><TableHead>Min</TableHead><TableHead>Total Amount</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id} className={Number(p.stockBaseQty) <= Number(p.minStockLevel || LOW_STOCK_THRESHOLD) ? 'bg-red-50' : ''}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>TZS {currency(p.buyPrice)}</TableCell>
                        <TableCell>TZS {currency(p.sellPrice)}</TableCell>
                        <TableCell className={Number(p.stockBaseQty) <= Number(p.minStockLevel || LOW_STOCK_THRESHOLD) ? 'text-red-600 font-medium' : ''}>{p.stockBaseQty} {p.baseUnit}</TableCell>
                        <TableCell>{p.minStockLevel || LOW_STOCK_THRESHOLD}</TableCell>
                        <TableCell>TZS {currency(Number(p.stockBaseQty) * Number(p.sellPrice))}</TableCell>
                        <TableCell><div className="flex gap-2"><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => editProduct(p)}><Pencil className="mr-1 h-4 w-4" />Edit</Button><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => deleteProduct(p.id)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button></div></TableCell>
                      </TableRow>
                    ))}

                    {/* TOTAL ROW */}
                    <TableRow className="bg-slate-100 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell>
                        TZS {currency(products.reduce((sum,p)=>sum+(p.buyPrice*p.stockBaseQty),0))}
                      </TableCell>
                      <TableCell>
                        TZS {currency(products.reduce((sum,p)=>sum+(p.sellPrice*p.stockBaseQty),0))}
                      </TableCell>
                      <TableCell>
                        {products.reduce((sum,p)=>sum+Number(p.stockBaseQty||0),0)}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        TZS {currency(products.reduce((sum,p)=>sum+(p.sellPrice*p.stockBaseQty),0))}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Record New Products</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {newProductRows.map((row, index) => (
                  <div key={index} className="rounded-2xl bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium">Item {index + 1}</div>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => removeProductRow(index)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Input list={`product-name-list-${shop.id}`} placeholder="Product name *" value={row.name} onChange={(e) => updateProductRow(index, 'name', e.target.value)} />
                        <datalist id={`product-name-list-${shop.id}`}>{products.map((p) => <option key={p.id} value={p.name} />)}</datalist>
                      </div>
                      <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={row.unit} onChange={(e) => updateProductRow(index, 'unit', e.target.value)}>
                        <option value="">Select unit</option>
                        <option value="kg">kg</option>
                        <option value="ltr">lt</option>
                        <option value="pc">pcs</option>
                      </select>
                      <Input type="number" placeholder="Buying price *" value={row.buyPrice} onChange={(e) => updateProductRow(index, 'buyPrice', e.target.value)} />
                      <Input type="number" placeholder="Selling price *" value={row.sellPrice} onChange={(e) => updateProductRow(index, 'sellPrice', e.target.value)} />
                      <Input type="number" placeholder="Opening stock *" value={row.stockQty} onChange={(e) => updateProductRow(index, 'stockQty', e.target.value)} />
                      <Input type="number" placeholder="Minimum stock level" value={row.minStockLevel} onChange={(e) => updateProductRow(index, 'minStockLevel', e.target.value)} />
                      <Input type="date" value={row.expiryDate} onChange={(e) => updateProductRow(index, 'expiryDate', e.target.value)} />
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                        Profit per base unit: <span className="font-semibold">TZS {currency(Number(row.sellPrice || 0) - Number(row.buyPrice || 0))}</span>
                      </div>
                      <div className="md:col-span-2"><Input placeholder="Sub units e.g. 0.5,0.25" value={row.subUnits} onChange={(e) => updateProductRow(index, 'subUnits', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                {productFormError ? <p className="text-sm text-red-600">{productFormError}</p> : null}
<div className="mb-4">
<label className="text-sm font-medium">Import Products From Excel</label>
<input
  type="file"
  accept=".xlsx,.xls"
  onChange={importProductsFromExcel}
  className="mt-2 block w-full text-sm"
/>
</div>
                <div className="flex gap-2"><Button variant="outline" className="rounded-2xl" onClick={addProductRow}><PlusCircle className="mr-2 h-4 w-4" />Add Another Item</Button><Button className="rounded-2xl" onClick={saveProductRows}>Save Items</Button></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Record Purchases / Restock</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {purchaseRows.map((row, index) => (
                  <div key={index} className="rounded-2xl bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium">Purchase {index + 1}</div>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => removePurchaseRow(index)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <Input list={`products-list-${shop.id}`} placeholder="Start typing product" value={row.productName} onChange={(e) => updatePurchaseRow(index, 'productName', e.target.value)} />
                        <datalist id={`products-list-${shop.id}`}>{products.map((p) => <option key={p.id} value={p.name} />)}</datalist>
                      </div>
                      <Input type="number" placeholder="Quantity added" value={row.qty} onChange={(e) => updatePurchaseRow(index, 'qty', e.target.value)} />
                      <Input type="number" placeholder="Buy price" value={row.buyPrice} onChange={(e) => updatePurchaseRow(index, 'buyPrice', e.target.value)} />
                    </div>
                  </div>
                ))}
                {purchaseFormError ? <p className="text-sm text-red-600">{purchaseFormError}</p> : null}
                <div className="flex gap-2"><Button variant="outline" className="rounded-2xl" onClick={addPurchaseRow}><Truck className="mr-2 h-4 w-4" />Add Another Purchase</Button><Button className="rounded-2xl" onClick={savePurchases}>Save Purchases</Button></div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Recent Purchases</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {purchases.length === 0 ? <div className="rounded-2xl bg-white p-3 shadow-sm">No purchases recorded yet.</div> : purchases.slice().reverse().slice(0, 12).map((p) => <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"><div><div className="font-medium">{p.productName}</div><div>{p.qty} added on {p.date}</div></div><div className="flex items-center gap-3"><span>TZS {currency(p.buyPrice)}</span><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => editPurchase(p)}><Pencil className="h-4 w-4" /></Button><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => deletePurchase(p.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pos">

<div className="grid gap-4 xl:grid-cols-2">

{/* LEFT SIDE : PRODUCT SEARCH */}
<Card className="rounded-3xl shadow-sm">
<CardHeader><CardTitle>Tafuta Bidhaa</CardTitle></CardHeader>
<CardContent className="space-y-3">

<Input
placeholder="Andika jina la bidhaa..."
value={quickSearch}
onChange={(e)=>setQuickSearch(e.target.value)}
/>

{quickSearch.trim()==="" ? (
<div className="text-sm text-slate-500">Anza kuandika jina la bidhaa.</div>
) : quickProducts.length===0 ? (
<div className="text-sm text-red-600">Hakuna bidhaa iliyopatikana.</div>
) : (
<div className="space-y-2">
{quickProducts.map((p)=>{
const unit=p.subUnits?.[0]
return (
<div key={p.id} className="flex items-center justify-between rounded-2xl border p-2">

<div>
  <div className="font-medium">{p.name}</div>
  <div className="text-xs text-slate-500">
    Iliyopo: {p.stockBaseQty} {p.baseUnit}
  </div>
  <div className="text-xs text-green-600 font-medium">
    Bei: TZS {currency(p.sellPrice)}
  </div>
</div>

<div className="flex items-center gap-2">

<Input
className="w-16"
type="number"
min="1"
placeholder="qty"
value={quickQtyMap[p.id]||''}
onChange={(e)=>setQuickQtyMap(prev=>({...prev,[p.id]:e.target.value}))}
/>

<Button
size="sm"
onClick={()=>{
const qty=Number(quickQtyMap[p.id]||1)
quickAddProductToCart(p,qty)
setQuickQtyMap(prev=>({...prev,[p.id]:''}))
}}
>
Add
</Button>

</div>

</div>
)
})}
</div>
)}

</CardContent>
</Card>

{/* RIGHT SIDE : CURRENT SALE */}
<Card className="rounded-3xl shadow-sm">
<CardHeader><CardTitle>Current Sale</CardTitle></CardHeader>
<CardContent className="space-y-3">

{cart.length===0 ? (
<div className="rounded-xl bg-slate-50 p-3 text-sm">No items selected.</div>
) : (
<div className="space-y-2">
{cart.map(item=>(
<div key={item.id} className="flex justify-between rounded-xl border p-2 text-sm">
<div>
<div className="font-medium">{item.name}</div>
<div>{item.quantity} × {currency(item.unitSellPrice)}</div>
</div>

<div className="flex items-center gap-2">
<span className="font-semibold">TZS {currency(item.total)}</span>
<Button size="sm" variant="outline" onClick={()=>removeCartItem(item.id)}>
Remove
</Button>
</div>

</div>
))}
</div>
)}

<div className="border-t pt-3">
<div className="flex justify-between text-lg font-semibold">
<span>Total</span>
<span>TZS {currency(cartTotal)}</span>
</div>
</div>

<Button className="w-full" onClick={()=>commitSale('cash')}>
Confirm Cash Sale
</Button>

<Button variant="outline" className="w-full" onClick={()=>setActiveTab('credit')}>
Record Credit Instead
</Button>

</CardContent>
</Card>

</div>

</TabsContent>

        <TabsContent value="expenses">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Record Expenses</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {expenseRows.map((row, index) => (
                  <div key={index} className="rounded-2xl bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium">Expense {index + 1}</div>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => removeExpenseRow(index)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input placeholder="Description e.g. rent, transport" value={row.description} onChange={(e) => updateExpenseRow(index, 'description', e.target.value)} />
                      <Input type="number" placeholder="Amount" value={row.amount} onChange={(e) => updateExpenseRow(index, 'amount', e.target.value)} />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2"><Button variant="outline" className="rounded-2xl" onClick={addExpenseRow}><PlusCircle className="mr-2 h-4 w-4" />Add Another Expense</Button><Button className="rounded-2xl" onClick={saveExpenseRows}>Save Expenses</Button></div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Saved Expenses</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {expenses.length === 0 ? <div className="rounded-2xl bg-white p-3 shadow-sm">No expenses saved yet.</div> : expenses.slice().reverse().map((e) => <div key={e.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"><div><div className="font-medium">{e.description}</div><div>{e.date}</div></div><div className="flex items-center gap-3"><span>TZS {currency(e.amount)}</span><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => editExpense(e)}><Pencil className="h-4 w-4" /></Button><Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => deleteExpense(e.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="credit">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Record Credit Sale</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Customer Name</Label><Input value={creditCustomer} onChange={(e) => { setCreditFormError(''); setCreditCustomer(e.target.value); }} /></div>
                <div><Label>Credit Amount</Label><Input type="number" value={creditTotal} onChange={(e) => { setCreditFormError(''); setCreditTotal(e.target.value); }} placeholder="Enter total amount owed" /></div>
                <div><Label>Amount Paid Now</Label><Input type="number" value={creditAmountPaid} onChange={(e) => setCreditAmountPaid(e.target.value)} /></div>
                <p className="text-sm text-slate-500">Remaining balance: TZS {currency(Math.max(0, Number(effectiveCreditTotal) - Number(creditAmountPaid || 0)))}</p>
                {creditFormError ? <p className="text-sm text-red-600">{creditFormError}</p> : null}
                <Button className="w-full rounded-2xl" onClick={() => commitSale('credit')}>Save Credit Sale</Button>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Credit List</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {creditSales.length === 0 ? <div className="rounded-2xl bg-white p-3 shadow-sm">No credit records yet.</div> : creditSales.map((c) => <CreditRow key={c.id} credit={c} onPay={payCredit} onMarkPaid={markCreditPaid} onDelete={deleteCredit} />)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="change">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Record Change Owed</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {changeRows.map((row, index) => (
                  <div key={index} className="rounded-2xl bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium">Change Row {index + 1}</div>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => removeChangeRow(index)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input placeholder="Customer name" value={row.customerName} onChange={(e) => updateChangeRow(index, 'customerName', e.target.value)} />
                      <Input type="number" placeholder="Amount owed" value={row.amountOwed} onChange={(e) => updateChangeRow(index, 'amountOwed', e.target.value)} />
                    </div>
                  </div>
                ))}
                {changeFormError ? <p className="text-sm text-red-600">{changeFormError}</p> : null}
                <div className="flex gap-2"><Button variant="outline" className="rounded-2xl" onClick={addChangeRow}><PlusCircle className="mr-2 h-4 w-4" />Add Another Row</Button><Button className="rounded-2xl" onClick={saveChangeRows}>Save Change Owed</Button></div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Saved Change Owed</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {changeLedger.length === 0 ? <div className="rounded-2xl bg-white p-3 shadow-sm">No change owed records yet.</div> : changeLedger.map((c) => <ChangeRow key={c.id} change={c} onReduce={reduceChange} onMarkPaid={clearChange} onDelete={deleteChange} onEdit={editChange} />)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="mb-4 flex items-center gap-3">
            <CalendarDays className="h-4 w-4" />
            <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="6months">6 Months</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Sales" value={`TZS ${currency(salesValue)}`} icon={BarChart3} />
            <StatCard title="Expenses" value={`TZS ${currency(totalExpenses)}`} icon={AlertTriangle} />
            <StatCard title="Net Profit" value={`TZS ${currency(simplePL)}`} icon={Wallet} />
            <StatCard title="Credit Balance" value={`TZS ${currency(creditBalance)}`} icon={HandCoins} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Stock Report</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead>Buy Price</TableHead><TableHead>Sale Price</TableHead><TableHead>Profit if Sold</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((p) => <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.stockBaseQty} {p.baseUnit}</TableCell><TableCell>TZS {currency(p.buyPrice)}</TableCell><TableCell>TZS {currency(p.sellPrice)}</TableCell><TableCell>TZS {currency(p.stockBaseQty * (p.sellPrice - p.buyPrice))}</TableCell></TableRow>)}
                  </TableBody>
                </Table>
                <div className="mt-4 grid gap-2 text-sm"><div className="rounded-2xl bg-white p-3 shadow-sm font-medium">Total stock sale value: TZS {currency(stockSaleValue)}</div><div className="rounded-2xl bg-white p-3 shadow-sm font-medium">Total stock profit if sold: TZS {currency(stockProfitIfSold)}</div></div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm">
              <CardHeader><CardTitle>Period Report Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>Sales in selected period: TZS {currency(salesValue)}</div>
                <div>Expenses in selected period: TZS {currency(totalExpenses)}</div>
                <div>Net profit in selected period: TZS {currency(simplePL)}</div>
                <div>Credit balance in selected period: TZS {currency(creditBalance)}</div>
                <div>Low stock items: {lowStockProducts.length}</div>
                <Separator />
                <div className="font-medium">Simple interpretation</div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">This report shows sales, expenses, credit balance, low stock items, and simple net profit for the selected period.</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 rounded-3xl shadow-sm">
            <CardHeader><CardTitle>Purchase Cost vs Sales Profit Report</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4" />
                <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={purchaseAnalysisPeriod} onChange={(e) => setPurchaseAnalysisPeriod(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="6months">6 Months</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-1">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  For this selected period, we spent <span className="font-semibold">TZS {currency(totalPurchaseSpendForAnalysis)}</span> to purchase products.
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  After selling products in the same period, we received <span className="font-semibold">TZS {currency(totalSalesForAnalysis)}</span> in total sales.
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  Profit made from products sold in this period was <span className="font-semibold">TZS {currency(grossProfitFromSalesForAnalysis)}</span>.
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                  Simple difference between sales and purchase spend for this period is <span className="font-semibold">TZS {currency(estimatedOperatingSurplusForAnalysis)}</span>.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function CreditRow({ credit, onPay, onMarkPaid, onDelete }) {
  const [payAmount, setPayAmount] = useState('');
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="font-medium">{credit.customerName}</div>
      <div className="mt-1">Total: TZS {currency(credit.total)} | Paid: TZS {currency(credit.amountPaid)} | Balance: TZS {currency(credit.balance)}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input type="number" placeholder="Reduce debt / pay amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
        <Button type="button" className="rounded-2xl" onClick={() => { onPay(credit.id, payAmount); setPayAmount(''); }}>Reduce</Button>
        {Number(credit.balance) > 0 ? <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onMarkPaid(credit.id)}>Mark Paid</Button> : null}
        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onDelete(credit.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function ChangeRow({ change, onReduce, onMarkPaid, onDelete, onEdit }) {
  const [reduceAmount, setReduceAmount] = useState('');
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="font-medium">{change.customerName}</div>
      <div className="mt-1">Balance: TZS {currency(change.amountOwed)} | Status: {change.status}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input type="number" placeholder="Reduce amount" value={reduceAmount} onChange={(e) => setReduceAmount(e.target.value)} />
        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => { onReduce(change.id, reduceAmount); setReduceAmount(''); }}>Reduce</Button>
        {change.status !== 'Paid' ? <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onMarkPaid(change.id)}>Mark Paid</Button> : null}
        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onEdit(change)}><Pencil className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onDelete(change.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export default function MultiShopPOSMVP() {
  const [data, setData] = useState(seedData);
  const [activeShopId, setActiveShopId] = useState(null);
  const [ownerPeriod, setOwnerPeriod] = useState('daily');
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    setData(readData());
  }, []);

  const saveData = (next) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(seedData);
    setActiveShopId(null);
    setOwnerPeriod('daily');
  };

  const handleLogin = (user) => {
    const next = { ...data, currentUser: user };
    saveData(next);

    if (user.role === 'shop') {
      setActiveShopId(user.shopId);
    } else {
      setActiveShopId(null);
    }
  };

  const logout = () => {
    saveData({ ...data, currentUser: null });
    setActiveShopId(null);
  };

  if (!data.currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        users={data.users}
        resetDemo={resetDemo}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  const effectiveShopId =
    data.currentUser.role === 'shop'
      ? data.currentUser.shopId
      : activeShopId;

  if (effectiveShopId) {
    const shop =
      data.shops.find((s) => s.id === effectiveShopId) || data.shops[0];

    return (
      <ShopDashboard
        shop={shop}
        data={data}
        saveData={saveData}
        logout={logout}
        canBack={data.currentUser.role === 'owner'}
        backToOwner={() => setActiveShopId(null)}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  return (
    <OwnerDashboard
      data={data}
      openShop={(id) => setActiveShopId(id)}
      logout={logout}
      ownerPeriod={ownerPeriod}
      setOwnerPeriod={setOwnerPeriod}
      language={language}
      setLanguage={setLanguage}
    />
  );
}
