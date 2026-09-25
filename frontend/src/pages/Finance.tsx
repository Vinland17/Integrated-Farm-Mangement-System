import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Trash2, Percent } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { FormModal } from '../components/common/FormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { financeService } from '../services/financeService';
import { Expense, Income, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const Finance: React.FC = () => {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income'>('overview');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteIncomeId, setDeleteIncomeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense Form
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Fertilizer');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('500');
  const [expField, setExpField] = useState('General Farm');
  const [expPayment, setExpPayment] = useState('Bank Transfer');

  // Income Form
  const [incCrop, setIncCrop] = useState('Tomato (Roma)');
  const [incBuyer, setIncBuyer] = useState('FreshHarvest Wholesalers');
  const [incAmount, setIncAmount] = useState('5000');
  const [incTons, setIncTons] = useState('6.0');

  useEffect(() => {
    loadFinancials();
  }, []);

  const loadFinancials = async () => {
    setLoading(true);
    try {
      const [eData, iData] = await Promise.all([
        financeService.getExpenses(),
        financeService.getIncome(),
      ]);
      setExpenses(eData);
      setIncomes(iData);
    } catch (err: any) {
      showToast('Error Loading Financials', err?.response?.data?.message || 'Database connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalRevenue = incomes.reduce((acc, i) => acc + i.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const roiPercentage = totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(1) : '0.0';

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;

    setIsSubmitting(true);
    try {
      await financeService.addExpense({
        category: expCategory,
        description: expDesc.trim(),
        amount: parseFloat(expAmount) || 0,
        date: new Date().toISOString().split('T')[0],
        fieldName: expField.trim() || 'General Farm',
        paymentMethod: expPayment,
      });
      showToast('Expense Recorded', `Expense of ${formatCurrency(parseFloat(expAmount))} logged to database.`, 'info');
      setIsAddExpenseOpen(false);
      setExpDesc('');
      loadFinancials();
    } catch (err: any) {
      showToast('Expense Failed', err?.response?.data?.message || 'Failed to save expense.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    try {
      await financeService.deleteExpense(deleteExpenseId);
      showToast('Expense Removed', 'Expense entry removed from financial ledger.', 'info');
      setDeleteExpenseId(null);
      loadFinancials();
    } catch (err: any) {
      showToast('Delete Failed', err?.response?.data?.message || 'Could not delete expense.', 'error');
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incCrop.trim()) return;

    setIsSubmitting(true);
    try {
      await financeService.addIncome({
        cropName: incCrop.trim(),
        buyer: incBuyer.trim(),
        amount: parseFloat(incAmount) || 0,
        quantityTons: parseFloat(incTons) || 0,
        date: new Date().toISOString().split('T')[0],
      });
      showToast('Revenue Logged', `Income of ${formatCurrency(parseFloat(incAmount))} recorded in database.`, 'success');
      setIsAddIncomeOpen(false);
      setIncCrop('Tomato (Roma)');
      loadFinancials();
    } catch (err: any) {
      showToast('Income Failed', err?.response?.data?.message || 'Failed to record revenue.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async () => {
    if (!deleteIncomeId) return;
    try {
      await financeService.deleteIncome(deleteIncomeId);
      showToast('Income Removed', 'Crop sale revenue record deleted.', 'info');
      setDeleteIncomeId(null);
      loadFinancials();
    } catch (err: any) {
      showToast('Delete Failed', err?.response?.data?.message || 'Could not delete income record.', 'error');
    }
  };

  // Dynamic Pie Chart Data for Expenses by Category
  const CATEGORY_COLORS: Record<string, string> = {
    Fertilizer: '#16a34a',
    Labour: '#eab308',
    Fuel: '#3b82f6',
    Seeds: '#8b5cf6',
    Pesticides: '#f43f5e',
    Equipment: '#06b6d4',
    Other: '#64748b',
  };

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const expenseCategoryData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
    color: CATEGORY_COLORS[cat] || '#64748b',
  }));

  const financialOverviewChart = [
    { name: 'Financial Overview', Revenue: totalRevenue, Expenses: totalExpenses, 'Net Profit': netProfit },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Financial Ledger & ROI Tracker"
        subtitle="Operational expenses, crop sales revenue, and net profitability metrics."
        icon={<DollarSign className="w-6 h-6" />}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Expense
            </button>
            <button
              onClick={() => setIsAddIncomeOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Record Crop Sale
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<ArrowUpRight className="w-6 h-6 text-emerald-600" />}
          subtitle="Income from harvest sales"
          accentColor="emerald"
        />
        <StatCard
          title="Total Operating Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<ArrowDownRight className="w-6 h-6 text-rose-600" />}
          subtitle="Input & labor costs"
          accentColor="amber"
        />
        <StatCard
          title="Net Farm Profit"
          value={formatCurrency(netProfit)}
          icon={<Wallet className="w-6 h-6 text-agri-600" />}
          subtitle={netProfit >= 0 ? 'Profitable operation' : 'Operating loss'}
          accentColor="green"
        />
        <StatCard
          title="Farm Return on Investment"
          value={`${roiPercentage}% ROI`}
          icon={<Percent className="w-6 h-6 text-sky-600" />}
          subtitle="Net return vs input cost"
          accentColor="blue"
        />
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-agri-700 text-agri-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Financial Analytics
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-agri-700 text-agri-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Expenses Ledger ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'income'
              ? 'border-agri-700 text-agri-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Income & Crop Sales ({incomes.length})
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-64" />
      ) : (
        <>
          {/* Overview Analytics View */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">Financial Performance Summary</h3>
                <p className="text-xs text-slate-500 mb-4">Gross Revenue vs Operating Expenses vs Net Profit ($ USD)</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialOverviewChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="Revenue" fill="#15803d" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Net Profit" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Expense Breakdown by Category</h3>
                  <p className="text-xs text-slate-500 mb-4">Input cost distribution</p>
                  {expenseCategoryData.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">No expenses recorded yet.</div>
                  ) : (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expenseCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                            {expenseCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                  {expenseCategoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <strong className="text-slate-900">{formatCurrency(item.value)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expenses Ledger Table */}
          {activeTab === 'expenses' && (
            expenses.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="w-10 h-10 text-slate-400" />}
                title="No Expenses Logged"
                description="Log your operational expenses to keep track of farm inputs."
                action={
                  <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Log First Expense
                  </button>
                }
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Field Sector</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {expenses.map((exp) => {
                      const expId = (exp._id || exp.id) as string;
                      return (
                        <tr key={expId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-700">{formatDate(exp.date)}</td>
                          <td className="py-4 px-4 font-bold text-rose-700">
                            <span className="px-2.5 py-1 bg-rose-50 rounded-full text-xs">{exp.category}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-900 font-medium">{exp.description}</td>
                          <td className="py-4 px-4 text-slate-600">{exp.fieldName || 'General Farm'}</td>
                          <td className="py-4 px-4 text-slate-500">{exp.paymentMethod}</td>
                          <td className="py-4 px-4 text-right font-extrabold text-rose-700">-{formatCurrency(exp.amount)}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setDeleteExpenseId(expId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Income Ledger Table */}
          {activeTab === 'income' && (
            incomes.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="w-10 h-10 text-slate-400" />}
                title="No Harvest Revenue Recorded"
                description="Record your crop produce sales to compute gross revenue and net profit."
                action={
                  <button
                    onClick={() => setIsAddIncomeOpen(true)}
                    className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Record Crop Sale
                  </button>
                }
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Crop Produce</th>
                      <th className="py-3.5 px-4">Buyer / Wholesaler</th>
                      <th className="py-3.5 px-4">Volume Sold</th>
                      <th className="py-3.5 px-4 text-right">Revenue</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {incomes.map((inc) => {
                      const incId = (inc._id || inc.id) as string;
                      return (
                        <tr key={incId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-slate-800">{inc.invoiceNumber}</td>
                          <td className="py-4 px-4 font-semibold text-slate-700">{formatDate(inc.date)}</td>
                          <td className="py-4 px-4 font-bold text-agri-800">{inc.cropName}</td>
                          <td className="py-4 px-4 text-slate-900 font-medium">{inc.buyer}</td>
                          <td className="py-4 px-4 font-semibold text-slate-700">{inc.quantityTons} Tons</td>
                          <td className="py-4 px-4 text-right font-extrabold text-emerald-700">+{formatCurrency(inc.amount)}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setDeleteIncomeId(incId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Income"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* Add Expense Modal */}
      <FormModal isOpen={isAddExpenseOpen} title="Log Operational Expense" onClose={() => setIsAddExpenseOpen(false)}>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expense Category</label>
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            >
              <option value="Fertilizer">Fertilizer</option>
              <option value="Seeds">Seeds</option>
              <option value="Labour">Labour</option>
              <option value="Fuel">Fuel</option>
              <option value="Equipment">Equipment</option>
              <option value="Pesticides">Pesticides</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <input
              type="text"
              required
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              placeholder="e.g. Tractor diesel refill"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount ($ USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Field Sector</label>
              <input
                type="text"
                value={expField}
                onChange={(e) => setExpField(e.target.value)}
                placeholder="e.g. Field A - Tomato Plot"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Add Income Modal */}
      <FormModal isOpen={isAddIncomeOpen} title="Record Crop Harvest Sale" onClose={() => setIsAddIncomeOpen(false)}>
        <form onSubmit={handleAddIncome} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Crop Produce</label>
              <input
                type="text"
                required
                value={incCrop}
                onChange={(e) => setIncCrop(e.target.value)}
                placeholder="e.g. Tomato (Roma)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Buyer Name</label>
              <input
                type="text"
                required
                value={incBuyer}
                onChange={(e) => setIncBuyer(e.target.value)}
                placeholder="e.g. FreshHarvest Wholesalers"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Revenue ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={incAmount}
                onChange={(e) => setIncAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Volume Sold (Tons)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={incTons}
                onChange={(e) => setIncTons(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddIncomeOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Record Income'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteExpenseId}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record from the database?"
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteExpenseId(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteIncomeId}
        title="Delete Income Record"
        message="Are you sure you want to remove this crop sale income record?"
        onConfirm={handleDeleteIncome}
        onCancel={() => setDeleteIncomeId(null)}
      />
    </div>
  );
};
