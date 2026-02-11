import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, DollarSign, PieChart, Search, Calendar, Trash2 } from 'lucide-react';

const InvestmentManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [budget, setBudget] = useState({ income: [], expenses: [] });
  const [portfolio, setPortfolio] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [screenFilters, setScreenFilters] = useState({
    minYield: 50,
    payoutFrequency: 'all'
  });

  // Sample high-yield dividend securities (realistic examples)
  const sampleSecurities = [
    { ticker: 'QYLD', name: 'Global X NASDAQ Covered Call ETF', yield: 52.3, price: 17.85, frequency: 'monthly', sector: 'ETF' },
    { ticker: 'XYLD', name: 'Global X S&P 500 Covered Call ETF', yield: 51.8, price: 42.15, frequency: 'monthly', sector: 'ETF' },
    { ticker: 'RYLD', name: 'Global X Russell 2000 Covered Call', yield: 53.2, price: 38.90, frequency: 'monthly', sector: 'ETF' },
    { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income', yield: 50.4, price: 55.20, frequency: 'monthly', sector: 'ETF' },
    { ticker: 'DIVO', name: 'Amplify CWP Enhanced Dividend', yield: 52.1, price: 28.45, frequency: 'quarterly', sector: 'ETF' },
    { ticker: 'SVOL', name: 'Simplify Volatility Premium ETF', yield: 68.5, price: 31.20, frequency: 'monthly', sector: 'ETF' },
    { ticker: 'ULTY', name: 'YieldMax Ultra Option Income', yield: 71.2, price: 18.95, frequency: 'monthly', sector: 'ETF' },
  ];

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const budgetData = await window.storage.get('budget-data');
        const portfolioData = await window.storage.get('portfolio-data');
        const accountsData = await window.storage.get('accounts-data');
        
        if (budgetData) setBudget(JSON.parse(budgetData.value));
        if (portfolioData) setPortfolio(JSON.parse(portfolioData.value));
        if (accountsData) setAccounts(JSON.parse(accountsData.value));
      } catch (error) {
        console.log('No saved data found, starting fresh');
      }
    };
    loadData();
  }, []);

  // Save data to storage
  const saveData = async (type, data) => {
    try {
      await window.storage.set(`${type}-data`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Budget functions
  const addIncome = (item) => {
    const newBudget = { ...budget, income: [...budget.income, { ...item, id: Date.now() }] };
    setBudget(newBudget);
    saveData('budget', newBudget);
  };

  const addExpense = (item) => {
    const newBudget = { ...budget, expenses: [...budget.expenses, { ...item, id: Date.now() }] };
    setBudget(newBudget);
    saveData('budget', newBudget);
  };

  const deleteIncome = (id) => {
    const newBudget = { ...budget, income: budget.income.filter(i => i.id !== id) };
    setBudget(newBudget);
    saveData('budget', newBudget);
  };

  const deleteExpense = (id) => {
    const newBudget = { ...budget, expenses: budget.expenses.filter(e => e.id !== id) };
    setBudget(newBudget);
    saveData('budget', newBudget);
  };

  // Portfolio functions
  const addToPortfolio = (security, shares) => {
    const newHolding = {
      id: Date.now(),
      ...security,
      shares: parseFloat(shares),
      purchasePrice: security.price,
      purchaseDate: new Date().toISOString()
    };
    const newPortfolio = [...portfolio, newHolding];
    setPortfolio(newPortfolio);
    saveData('portfolio', newPortfolio);
  };

  const removeFromPortfolio = (id) => {
    const newPortfolio = portfolio.filter(h => h.id !== id);
    setPortfolio(newPortfolio);
    saveData('portfolio', newPortfolio);
  };

  // Account functions
  const addAccount = (account) => {
    const newAccount = { ...account, id: Date.now() };
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    saveData('accounts', newAccounts);
  };

  const updateAccountBalance = (id, newBalance) => {
    const newAccounts = accounts.map(acc => 
      acc.id === id ? { ...acc, balance: parseFloat(newBalance) } : acc
    );
    setAccounts(newAccounts);
    saveData('accounts', newAccounts);
  };

  const deleteAccount = (id) => {
    const newAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(newAccounts);
    saveData('accounts', newAccounts);
  };

  // Calculations
  const totalIncome = budget.income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalExpenses = budget.expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;

  const portfolioValue = portfolio.reduce((sum, holding) => sum + (holding.shares * holding.price), 0);
  const annualDividendIncome = portfolio.reduce((sum, holding) => {
    return sum + (holding.shares * holding.price * (holding.yield / 100));
  }, 0);
  const monthlyDividendIncome = annualDividendIncome / 12;

  const totalAccountBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const totalNetWorth = totalAccountBalance + portfolioValue;

  // Filter securities
  const filteredSecurities = sampleSecurities.filter(sec => {
    const meetsYield = sec.yield >= screenFilters.minYield;
    const meetsFrequency = screenFilters.payoutFrequency === 'all' || sec.frequency === screenFilters.payoutFrequency;
    return meetsYield && meetsFrequency;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Investment Manager Pro
          </h1>
          <p className="text-slate-400">Track your budget, portfolio, and discover high-yield opportunities</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 p-2 rounded-lg">
          {[
            { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
            { id: 'accounts', icon: DollarSign, label: 'Accounts' },
            { id: 'budget', icon: Calendar, label: 'Budget Tracker' },
            { id: 'portfolio', icon: TrendingUp, label: 'Portfolio' },
            { id: 'screener', icon: Search, label: 'Dividend Screener' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Net Worth"
                value={`${totalNetWorth.toFixed(2)}`}
                subtitle="Accounts + Portfolio"
                color="emerald"
              />
              <StatCard
                title="Account Balance"
                value={`${totalAccountBalance.toFixed(2)}`}
                subtitle={`${accounts.length} Accounts`}
                color="blue"
              />
              <StatCard
                title="Portfolio Value"
                value={`${portfolioValue.toFixed(2)}`}
                subtitle={`${portfolio.length} Holdings`}
                color="purple"
              />
              <StatCard
                title="Monthly Dividends"
                value={`${monthlyDividendIncome.toFixed(2)}`}
                subtitle="Average"
                color="cyan"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Budget Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Income</span>
                    <span className="text-emerald-400 font-semibold">${totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Expenses</span>
                    <span className="text-red-400 font-semibold">${totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                    <span className="font-semibold">Net Cash Flow</span>
                    <span className={`font-bold text-lg ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${netCashFlow.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Top Holdings</h3>
                <div className="space-y-3">
                  {portfolio.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No holdings yet</p>
                  ) : (
                    portfolio.slice(0, 5).map(holding => (
                      <div key={holding.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{holding.ticker}</span>
                          <span className="text-slate-400 text-sm ml-2">{holding.shares} shares</span>
                        </div>
                        <span className="text-emerald-400">${(holding.shares * holding.price).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts */}
        {activeTab === 'accounts' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <AccountsSection 
              accounts={accounts}
              onAdd={addAccount}
              onUpdate={updateAccountBalance}
              onDelete={deleteAccount}
              totalBalance={totalAccountBalance}
            />
          </div>
        )}

        {/* Budget Tracker */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetSection
              title="Income"
              items={budget.income}
              onAdd={addIncome}
              onDelete={deleteIncome}
              color="emerald"
            />
            <BudgetSection
              title="Expenses"
              items={budget.expenses}
              onAdd={addExpense}
              onDelete={deleteExpense}
              color="red"
            />
          </div>
        )}

        {/* Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">My Portfolio</h2>
            {portfolio.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No holdings yet. Add securities from the Dividend Screener!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-700">
                      <th className="pb-3 font-semibold">Ticker</th>
                      <th className="pb-3 font-semibold">Shares</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Value</th>
                      <th className="pb-3 font-semibold">Yield</th>
                      <th className="pb-3 font-semibold">Annual Dividend</th>
                      <th className="pb-3 font-semibold">Frequency</th>
                      <th className="pb-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map(holding => (
                      <tr key={holding.id} className="border-b border-slate-700/50">
                        <td className="py-4 font-semibold">{holding.ticker}</td>
                        <td className="py-4">{holding.shares}</td>
                        <td className="py-4">${holding.price.toFixed(2)}</td>
                        <td className="py-4 text-emerald-400">${(holding.shares * holding.price).toFixed(2)}</td>
                        <td className="py-4">{holding.yield.toFixed(1)}%</td>
                        <td className="py-4 text-emerald-400">
                          ${(holding.shares * holding.price * (holding.yield / 100)).toFixed(2)}
                        </td>
                        <td className="py-4 capitalize">{holding.frequency}</td>
                        <td className="py-4">
                          <button
                            onClick={() => removeFromPortfolio(holding.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Dividend Screener */}
        {activeTab === 'screener' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">High-Yield Dividend Screener</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Yield (%)</label>
                  <input
                    type="number"
                    value={screenFilters.minYield}
                    onChange={(e) => setScreenFilters({ ...screenFilters, minYield: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payout Frequency</label>
                  <select
                    value={screenFilters.payoutFrequency}
                    onChange={(e) => setScreenFilters({ ...screenFilters, payoutFrequency: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    <option value="all">All</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 text-sm text-slate-400">
                Found {filteredSecurities.length} securities matching your criteria
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-700">
                      <th className="pb-3 font-semibold">Ticker</th>
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Yield</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Frequency</th>
                      <th className="pb-3 font-semibold">Sector</th>
                      <th className="pb-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSecurities.map(security => (
                      <SecurityRow
                        key={security.ticker}
                        security={security}
                        onAdd={addToPortfolio}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-200">
                <strong>Note:</strong> This screener uses sample data for demonstration. For live market data, 
                you would need to integrate a financial data API (Alpha Vantage, IEX Cloud, etc.). 
                High-yield securities often carry higher risk - always perform thorough due diligence.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AccountsSection = ({ accounts, onAdd, onUpdate, onDelete, totalBalance }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'checking', 
    balance: '', 
    institution: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [editBalance, setEditBalance] = useState('');

  const accountTypes = [
    { value: 'checking', label: 'Checking', color: 'blue' },
    { value: 'savings', label: 'Savings', color: 'emerald' },
    { value: 'investment', label: 'Investment', color: 'purple' },
    { value: 'credit', label: 'Credit Card', color: 'red' },
    { value: 'loan', label: 'Loan', color: 'orange' },
    { value: 'other', label: 'Other', color: 'slate' }
  ];

  const handleSubmit = () => {
    if (formData.name && formData.balance) {
      onAdd(formData);
      setFormData({ name: '', type: 'checking', balance: '', institution: '' });
      setShowForm(false);
    }
  };

  const handleUpdateBalance = (id) => {
    if (editBalance) {
      onUpdate(id, editBalance);
      setEditingId(null);
      setEditBalance('');
    }
  };

  const getTypeColor = (type) => {
    return accountTypes.find(t => t.value === type)?.color || 'slate';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Accounts & Balances</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-slate-700 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Account Name (e.g., Chase Checking)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          >
            {accountTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Institution (optional)"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Current Balance"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2">
              Add Account
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-500 rounded-lg py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 shadow-lg">
        <h3 className="text-sm font-medium opacity-90 mb-2">Total Balance</h3>
        <p className="text-4xl font-bold">${totalBalance.toFixed(2)}</p>
        <p className="text-sm opacity-75 mt-1">Across all accounts</p>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No accounts yet. Add your first account to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(account => (
            <div key={account.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded bg-${getTypeColor(account.type)}-900/50 text-${getTypeColor(account.type)}-400`}>
                      {accountTypes.find(t => t.value === account.type)?.label}
                    </span>
                  </div>
                  {account.institution && (
                    <p className="text-sm text-slate-400">{account.institution}</p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(account.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600">
                {editingId === account.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="flex-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateBalance(account.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditBalance('');
                      }}
                      className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-emerald-400">
                      ${parseFloat(account.balance).toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(account.id);
                        setEditBalance(account.balance);
                      }}
                      className="text-sm bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded"
                    >
                      Update Balance
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, subtitle, color }) => {
  const colors = {
    emerald: 'from-emerald-600 to-emerald-700',
    red: 'from-red-600 to-red-700',
    blue: 'from-blue-600 to-blue-700',
    purple: 'from-purple-600 to-purple-700',
    cyan: 'from-cyan-600 to-cyan-700'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 shadow-lg`}>
      <h3 className="text-sm font-medium opacity-90 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-75">{subtitle}</p>
    </div>
  );
};

const BudgetSection = ({ title, items, onAdd, onDelete, color }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: '' });

  const handleSubmit = () => {
    if (formData.description && formData.amount) {
      onAdd(formData);
      setFormData({ description: '', amount: '', category: '' });
      setShowForm(false);
    }
  };

  const total = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 bg-${color}-600 hover:bg-${color}-700 rounded-lg transition-colors`}
        >
          <PlusCircle className="w-4 h-4" />
          Add {title}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-slate-700 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2"
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className={`flex-1 bg-${color}-600 hover:bg-${color}-700 rounded-lg py-2`}>
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-500 rounded-lg py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {items.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No {title.toLowerCase()} items yet</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
              <div>
                <p className="font-semibold">{item.description}</p>
                {item.category && <p className="text-sm text-slate-400">{item.category}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold text-${color}-400`}>${parseFloat(item.amount).toFixed(2)}</span>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`border-t border-slate-700 pt-4 flex justify-between items-center`}>
        <span className="font-semibold text-lg">Total {title}</span>
        <span className={`font-bold text-xl text-${color}-400`}>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

const SecurityRow = ({ security, onAdd }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [shares, setShares] = useState('');

  const handleAdd = () => {
    if (shares && parseFloat(shares) > 0) {
      onAdd(security, shares);
      setShares('');
      setShowAddForm(false);
    }
  };

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
      <td className="py-4 font-semibold text-cyan-400">{security.ticker}</td>
      <td className="py-4 text-sm">{security.name}</td>
      <td className="py-4">
        <span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded font-semibold">
          {security.yield.toFixed(1)}%
        </span>
      </td>
      <td className="py-4">${security.price.toFixed(2)}</td>
      <td className="py-4 capitalize">{security.frequency}</td>
      <td className="py-4">{security.sector}</td>
      <td className="py-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded text-sm"
            >
              ✓
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded text-sm"
            >
              ✕
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default InvestmentManager;
