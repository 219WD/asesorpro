// App.js - No changes needed here
import React, { useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header/Header';
import IncomeSection from './components/IncomeSection/IncomeSection';
import ExpenseSection from './components/ExpenseSection/ExpenseSection';
import SavingsSection from './components/SavingsSection/SavingsSection';
import FinancialPlanSection from './components/FinancialPlanSection/FinancialPlanSection';
import { calculateExpenseTotals } from './utils/calculations';
import './App.css';

function App() {
  const [incomes, setIncomes] = useLocalStorage('finances_incomes', []);
  const [expenses, setExpenses] = useLocalStorage('finances_expenses', []);
  const [savingsGoal, setSavingsGoal] = useLocalStorage('finances_savingsGoal', { regular: 0, emergency: 0 });
  const [savingsPercentages, setSavingsPercentages] = useLocalStorage('finances_savingsPercentages', { regular: 20, emergency: 10 });

  const totalIncome = useMemo(() => 
    incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0), 
    [incomes]
  );

  const { totalEssential, totalPersonal, totalDebts, totalExpenses } = useMemo(() => 
    calculateExpenseTotals(expenses), 
    [expenses]
  );

  const actualSavings = totalIncome - totalExpenses;

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <div className="top-sections">
          <IncomeSection incomes={incomes} setIncomes={setIncomes} />
          <ExpenseSection expenses={expenses} setExpenses={setExpenses} />
          <SavingsSection 
            actualSavings={actualSavings}
            savingsGoal={savingsGoal}
            setSavingsGoal={setSavingsGoal}
            savingsPercentages={savingsPercentages}
            setSavingsPercentages={setSavingsPercentages}
          />
        </div>
        
        <FinancialPlanSection 
          totalIncome={totalIncome}
          totalEssentialExpenses={totalEssential}
          totalPersonalExpenses={totalPersonal}
          totalDebts={totalDebts}
          actualSavings={actualSavings}
          savingsPercentages={savingsPercentages}
          savingsGoal={savingsGoal}
        />
      </main>
    </div>
  );
}

export default App;