export const calculateExpenseTotals = (expenses) => {
  const totalEssential = expenses
    .filter(exp => exp.category === 'essential')
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
  const totalPersonal = expenses
    .filter(exp => exp.category === 'personal')
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
  const totalDebts = expenses
    .filter(exp => exp.category === 'debt')
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
  return {
    totalEssential,
    totalPersonal,
    totalDebts,
    totalExpenses: totalEssential + totalPersonal + totalDebts
  };
};

export const calculateFinancialPlan = (
  totalIncome, 
  totalEssentialExpenses, 
  totalPersonalExpenses, 
  totalDebts,
  actualSavings, 
  savingsPercentages
) => {
  const recommendedEssential = totalIncome * 0.5;
  const recommendedPersonal = totalIncome * 0.3;
  const recommendedDebts = totalIncome * 0.1; // 10% para deudas
  const recommendedRegularSavings = totalIncome * ((savingsPercentages.regular || 20) / 100);
  const recommendedEmergencySavings = totalIncome * ((savingsPercentages.emergency || 10) / 100);

  return [
    {
      category: 'Gastos Esenciales (50%)',
      recommended: recommendedEssential,
      actual: totalEssentialExpenses,
      difference: totalEssentialExpenses - recommendedEssential,
      remaining: recommendedEssential - totalEssentialExpenses
    },
    {
      category: 'Gastos Personales (30%)',
      recommended: recommendedPersonal,
      actual: totalPersonalExpenses,
      difference: totalPersonalExpenses - recommendedPersonal,
      remaining: recommendedPersonal - totalPersonalExpenses
    },
    {
      category: 'Deudas (10%)',
      recommended: recommendedDebts,
      actual: totalDebts,
      difference: totalDebts - recommendedDebts,
      remaining: recommendedDebts - totalDebts
    },
    {
      category: `Ahorro (${savingsPercentages.regular || 20}%)`,
      recommended: recommendedRegularSavings,
      actual: actualSavings > 0 ? Math.min(actualSavings, recommendedRegularSavings) : 0,
      difference: (actualSavings > 0 ? Math.min(actualSavings, recommendedRegularSavings) : 0) - recommendedRegularSavings,
      remaining: recommendedRegularSavings - (actualSavings > 0 ? Math.min(actualSavings, recommendedRegularSavings) : 0)
    },
    {
      category: `Reserva de Emergencia (${savingsPercentages.emergency || 10}%)`,
      recommended: recommendedEmergencySavings,
      actual: actualSavings > recommendedRegularSavings ? Math.min(actualSavings - recommendedRegularSavings, recommendedEmergencySavings) : 0,
      difference: (actualSavings > recommendedRegularSavings ? Math.min(actualSavings - recommendedRegularSavings, recommendedEmergencySavings) : 0) - recommendedEmergencySavings,
      remaining: recommendedEmergencySavings - (actualSavings > recommendedRegularSavings ? Math.min(actualSavings - recommendedRegularSavings, recommendedEmergencySavings) : 0)
    }
  ];
};