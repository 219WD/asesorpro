import React, { useState, useMemo, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import useToast from './hooks/useToast';
import Header from './components/Header/Header';
import IncomeSection from './components/IncomeSection/IncomeSection';
import ExpenseSection from './components/ExpenseSection/ExpenseSection';
import SavingsSection from './components/SavingsSection/SavingsSection';
import FinancialPlanSection, { calcScore } from './components/FinancialPlanSection/FinancialPlanSection';
import HistorySection from './components/HistorySection/HistorySection';
import Toast from './components/Toast/Toast';
import { calculateExpenseTotals } from './utils/calculations';
import './App.css';

const TABS = [
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos',   label: 'Gastos'   },
  { id: 'ahorros',  label: 'Ahorros'  },
  { id: 'plan',     label: 'Plan'      },
  { id: 'historial',label: 'Historial' },
];

function App() {
  const [activeTab, setActiveTab] = useState('ingresos');
  const [incomes, setIncomes]             = useLocalStorage('finances_incomes', []);
  const [expenses, setExpenses]           = useLocalStorage('finances_expenses', []);
  const [savingsGoal, setSavingsGoal]     = useLocalStorage('finances_savingsGoal', { regular: 0, emergency: 0 });
  const [savingsMethod, setSavingsMethod] = useLocalStorage('finances_savingsMethod', '50-30-20');
  const [customPct, setCustomPct]         = useLocalStorage('finances_customPct', { essential: 50, personal: 30, savings: 20 });
  const [history, setHistory]             = useLocalStorage('finances_history', []);

  const { showToast, toasts } = useToast();

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + (i.amount || 0), 0), [incomes]);
  const { totalEssential, totalPersonal, totalDebts, totalExpenses } = useMemo(() => calculateExpenseTotals(expenses), [expenses]);
  const actualSavings = totalIncome - totalExpenses;

  const handleExpensesChange = useCallback((newExpenses) => {
    setExpenses(newExpenses);
    const inc = totalIncome;
    if (inc <= 0) return;
    const ess = newExpenses.filter(e => e.category === 'essential').reduce((s, e) => s + (e.amount || 0), 0);
    const per = newExpenses.filter(e => e.category === 'personal').reduce((s, e) => s + (e.amount || 0), 0);
    const dbt = newExpenses.filter(e => e.category === 'debt').reduce((s, e) => s + (e.amount || 0), 0);
    const p = savingsMethod === '50-30-20' ? { essential: 50, personal: 30 }
            : savingsMethod === '60-20-20' ? { essential: 60, personal: 20 }
            : savingsMethod === '70-20-10' ? { essential: 70, personal: 20 }
            : customPct;
    if (ess > inc * p.essential / 100) showToast(`Esenciales superaron el ${p.essential}% recomendado`, '#ff6b6b');
    else if (per > inc * p.personal / 100) showToast(`Personales superaron el ${p.personal}% recomendado`, '#ff6b6b');
    else if (dbt > inc * 0.2) showToast('Tus deudas superan el 20% del ingreso', '#ff6b6b');
  }, [totalIncome, savingsMethod, customPct, setExpenses, showToast]);

  const saveMonthSnapshot = useCallback(() => {
    if (totalIncome <= 0) { showToast('Agregá ingresos primero', '#ff6b6b'); return; }
    const now = new Date();
    const label = now.toLocaleString('es-AR', { month: 'short', year: '2-digit' });
    const sc = calcScore(incomes, expenses, savingsMethod, customPct);
    const newHistory = [
      { label, date: now.toISOString(), income: totalIncome, expenses: totalExpenses, savings: Math.max(0, actualSavings), score: sc.score, scoreColor: sc.color, scoreLabel: sc.label },
      ...history,
    ].slice(0, 12);
    setHistory(newHistory);
    showToast(`Snapshot de ${label} guardado`, '#06d6a0');
  }, [totalIncome, totalExpenses, actualSavings, incomes, expenses, savingsMethod, customPct, history, setHistory, showToast]);

  const clearHistory = useCallback(() => { setHistory([]); }, [setHistory]);

  return (
    <div className="app">
      <Header />
      <Toast toasts={toasts} />

      <nav className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="content">
        <div className={`page${activeTab === 'ingresos'  ? ' active' : ''}`}><IncomeSection incomes={incomes} setIncomes={setIncomes}/></div>
        <div className={`page${activeTab === 'gastos'    ? ' active' : ''}`}><ExpenseSection expenses={expenses} setExpenses={handleExpensesChange}/></div>
        <div className={`page${activeTab === 'ahorros'   ? ' active' : ''}`}>
          <SavingsSection actualSavings={actualSavings} totalIncome={totalIncome}
            savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal}
            savingsMethod={savingsMethod} setSavingsMethod={setSavingsMethod}
            customPct={customPct} setCustomPct={setCustomPct}/>
        </div>
        <div className={`page${activeTab === 'plan'      ? ' active' : ''}`}>
          <FinancialPlanSection
            totalIncome={totalIncome} totalEssentialExpenses={totalEssential}
            totalPersonalExpenses={totalPersonal} totalDebts={totalDebts}
            actualSavings={actualSavings} savingsMethod={savingsMethod}
            customPct={customPct} savingsGoal={savingsGoal}
            incomes={incomes} expenses={expenses}/>
          {totalIncome > 0 && (
            <button className="btn" onClick={saveMonthSnapshot} style={{ width: '100%', marginTop: 4, padding: 11 }}>
              💾 Guardar snapshot del mes
            </button>
          )}
        </div>
        <div className={`page${activeTab === 'historial' ? ' active' : ''}`}>
          <HistorySection history={history} onClear={clearHistory}/>
        </div>
      </div>
    </div>
  );
}

export default App;