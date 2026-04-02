import React, { useState, useMemo, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import useToast from './hooks/useToast';
import Header from './components/Header/Header';
import IncomeSection from './components/IncomeSection/IncomeSection';
import ExpenseSection from './components/ExpenseSection/ExpenseSection';
import InvestmentSection from './components/InvestmentSection/InvestmentSection.jsx';
import SavingsSection from './components/SavingsSection/SavingsSection';
import FinancialPlanSection, { calcScore } from './components/FinancialPlanSection/FinancialPlanSection';
import HistorySection from './components/HistorySection/HistorySection';
import Toast from './components/Toast/Toast';
import { calculateExpenseTotals, calculateInvestmentTotals } from './utils/calculations';
import './App.css';

const TABS = [
  { id: 'ingresos',   label: 'Ingresos'    },
  { id: 'gastos',     label: 'Gastos'      },
  { id: 'inversiones',label: '📈 Inversiones' },
  { id: 'ahorros',    label: 'Ahorros'     },
  { id: 'plan',       label: 'Plan'        },
  { id: 'historial',  label: 'Historial'   },
];

function App() {
  const [activeTab, setActiveTab] = useState('ingresos');

  // Current month data
  const [incomes,       setIncomes]       = useLocalStorage('finances_incomes',       []);
  const [expenses,      setExpenses]      = useLocalStorage('finances_expenses',      []);
  const [investments,   setInvestments]   = useLocalStorage('finances_investments',   []);
  const [savingsGoal,   setSavingsGoal]   = useLocalStorage('finances_savingsGoal',   { regular: 0, emergency: 0 });
  const [savingsMethod, setSavingsMethod] = useLocalStorage('finances_savingsMethod', '50-30-20');
  const [customPct,     setCustomPct]     = useLocalStorage('finances_customPct',     { essential: 50, personal: 30, savings: 20 });
  const [history,       setHistory]       = useLocalStorage('finances_history',       []);
  const [currentMonth,  setCurrentMonth]  = useLocalStorage('finances_currentMonth',  getCurrentMonthLabel());

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const { showToast, toasts } = useToast();

  function getCurrentMonthLabel() {
    return new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  }

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + (i.amount || 0), 0), [incomes]);
  const { totalEssential, totalPersonal, totalDebts, totalExpenses } = useMemo(
    () => calculateExpenseTotals(expenses), [expenses]
  );
  const { totalInvested } = useMemo(() => calculateInvestmentTotals(investments), [investments]);
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
    if (ess > inc * p.essential / 100)
      showToast(`Esenciales superaron el ${p.essential}% recomendado`, '#ff6b6b');
    else if (per > inc * p.personal / 100)
      showToast(`Personales superaron el ${p.personal}% recomendado`, '#ff6b6b');
    else if (dbt > inc * 0.2)
      showToast('Tus deudas superan el 20% del ingreso', '#ff6b6b');
  }, [totalIncome, savingsMethod, customPct, setExpenses, showToast]);

  // Save a snapshot without closing (for quick saves mid-month)
  const saveMonthSnapshot = useCallback(() => {
    if (totalIncome <= 0) { showToast('Agregá ingresos primero', '#ff6b6b'); return; }
    const now   = new Date();
    const label = now.toLocaleString('es-AR', { month: 'short', year: '2-digit' });
    const sc    = calcScore(incomes, expenses, savingsMethod, customPct);
    const newHistory = [
      {
        label, date: now.toISOString(),
        income: totalIncome, expenses: totalExpenses,
        savings: Math.max(0, actualSavings),
        invested: totalInvested,
        score: sc.score, scoreColor: sc.color, scoreLabel: sc.label
      },
      ...history,
    ].slice(0, 12);
    setHistory(newHistory);
    showToast(`Snapshot de ${label} guardado`, '#06d6a0');
  }, [totalIncome, totalExpenses, actualSavings, totalInvested, incomes, expenses, savingsMethod, customPct, history, setHistory, showToast]);

  // Close month: save snapshot then reset current month data
  const closeMonth = useCallback(() => {
    if (totalIncome <= 0) { showToast('Agregá ingresos primero', '#ff6b6b'); return; }
    const now   = new Date();
    const label = now.toLocaleString('es-AR', { month: 'short', year: '2-digit' });
    const sc    = calcScore(incomes, expenses, savingsMethod, customPct);
    const newHistory = [
      {
        label, date: now.toISOString(),
        income: totalIncome, expenses: totalExpenses,
        savings: Math.max(0, actualSavings),
        invested: totalInvested,
        score: sc.score, scoreColor: sc.color, scoreLabel: sc.label
      },
      ...history,
    ].slice(0, 12);
    setHistory(newHistory);

    // Reset current month
    setIncomes([]);
    setExpenses([]);
    setInvestments([]);

    // Update current month label
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setCurrentMonth(nextMonth.toLocaleString('es-AR', { month: 'long', year: 'numeric' }));

    setShowCloseConfirm(false);
    showToast(`✓ Mes cerrado. Empezás ${nextMonth.toLocaleString('es-AR', { month: 'long' })} desde cero`, '#06d6a0');
    setActiveTab('ingresos');
  }, [
    totalIncome, totalExpenses, actualSavings, totalInvested,
    incomes, expenses, savingsMethod, customPct, history,
    setHistory, setIncomes, setExpenses, setInvestments, setCurrentMonth, showToast
  ]);

  const clearHistory = useCallback(() => { setHistory([]); }, [setHistory]);

  return (
    <div className="app">
      <Header currentMonth={currentMonth} />
      <Toast toasts={toasts} />

      <nav className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="content">
        {/* CLOSE MONTH CONFIRMATION MODAL */}
        {showCloseConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)', padding: 24, maxWidth: 340, width: '100%',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>🔒 Cerrar mes</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                Esto guardará el snapshot del mes actual en el historial y <strong style={{ color: 'var(--text)' }}>borrará todos los ingresos, gastos e inversiones</strong> para empezar el mes nuevo desde cero.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1, background: 'var(--accent3)', padding: 10 }} onClick={closeMonth}>
                  ✓ Confirmar cierre
                </button>
                <button className="btn-sm" style={{ flex: 1, padding: 10, fontSize: 12 }} onClick={() => setShowCloseConfirm(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`page${activeTab === 'ingresos'    ? ' active' : ''}`}>
          <IncomeSection incomes={incomes} setIncomes={setIncomes}/>
        </div>

        <div className={`page${activeTab === 'gastos'      ? ' active' : ''}`}>
          <ExpenseSection expenses={expenses} setExpenses={handleExpensesChange}/>
        </div>

        <div className={`page${activeTab === 'inversiones' ? ' active' : ''}`}>
          <InvestmentSection investments={investments} setInvestments={setInvestments}/>
        </div>

        <div className={`page${activeTab === 'ahorros'     ? ' active' : ''}`}>
          <SavingsSection
            actualSavings={actualSavings} totalIncome={totalIncome}
            savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal}
            savingsMethod={savingsMethod} setSavingsMethod={setSavingsMethod}
            customPct={customPct} setCustomPct={setCustomPct}
          />
        </div>

        <div className={`page${activeTab === 'plan'        ? ' active' : ''}`}>
          <FinancialPlanSection
            totalIncome={totalIncome} totalEssentialExpenses={totalEssential}
            totalPersonalExpenses={totalPersonal} totalDebts={totalDebts}
            actualSavings={actualSavings} savingsMethod={savingsMethod}
            customPct={customPct} savingsGoal={savingsGoal}
            incomes={incomes} expenses={expenses} investments={investments}
          />
          {totalIncome > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="btn"
                onClick={saveMonthSnapshot}
                style={{ flex: 1, padding: 11, background: 'rgba(124,111,255,0.18)', color: 'var(--accent)', border: '1px solid rgba(124,111,255,0.3)' }}
              >
                💾 Guardar snapshot
              </button>
              <button
                className="btn"
                onClick={() => setShowCloseConfirm(true)}
                style={{ flex: 1, padding: 11, background: 'rgba(6,214,160,0.15)', color: 'var(--accent3)', border: '1px solid rgba(6,214,160,0.25)' }}
              >
                🔒 Cerrar mes
              </button>
            </div>
          )}
        </div>

        <div className={`page${activeTab === 'historial'   ? ' active' : ''}`}>
          <HistorySection history={history} onClear={clearHistory}/>
        </div>
      </div>
    </div>
  );
}

export default App;