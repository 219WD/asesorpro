// utils/calculations.js

export const getMethodPcts = (method, customPct = {}) => {
  if (method === '50-30-20') return { essential: 50, personal: 30, savings: 20 };
  if (method === '60-20-20') return { essential: 60, personal: 20, savings: 20 };
  if (method === '70-20-10') return { essential: 70, personal: 20, savings: 10 };
  return {
    essential: customPct.essential || 50,
    personal:  customPct.personal  || 30,
    savings:   customPct.savings   || 20,
  };
};

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
    totalExpenses: totalEssential + totalPersonal + totalDebts,
  };
};

export const calculateInvestmentTotals = (investments) => {
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalReturns  = investments.reduce((sum, inv) => sum + (inv.returns || 0), 0);
  const totalValue    = totalInvested + totalReturns;
  const totalROI      = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  return { totalInvested, totalReturns, totalValue, totalROI };
};

export const calculateFinancialPlan = (
  totalIncome,
  totalEssentialExpenses,
  totalPersonalExpenses,
  totalDebts,
  actualSavings,
  savingsMethod = '50-30-20',
  customPct = {}
) => {
  const pcts = getMethodPcts(savingsMethod, customPct);

  const recommendedEssential        = totalIncome * (pcts.essential / 100);
  const recommendedPersonal         = totalIncome * (pcts.personal  / 100);
  const recommendedDebts            = totalIncome * 0.1;
  const recommendedRegularSavings   = totalIncome * (pcts.savings   / 100);
  const recommendedEmergencySavings = totalIncome * 0.1;

  const actualRegular =
    actualSavings > 0 ? Math.min(actualSavings, recommendedRegularSavings) : 0;

  const actualEmergency =
    actualSavings > recommendedRegularSavings
      ? Math.min(actualSavings - recommendedRegularSavings, recommendedEmergencySavings)
      : 0;

  return [
    {
      category:    `Gastos Esenciales (${pcts.essential}%)`,
      recommended: recommendedEssential,
      actual:      totalEssentialExpenses,
      difference:  totalEssentialExpenses - recommendedEssential,
      remaining:   recommendedEssential   - totalEssentialExpenses,
    },
    {
      category:    `Gastos Personales (${pcts.personal}%)`,
      recommended: recommendedPersonal,
      actual:      totalPersonalExpenses,
      difference:  totalPersonalExpenses - recommendedPersonal,
      remaining:   recommendedPersonal   - totalPersonalExpenses,
    },
    {
      category:    'Deudas (10%)',
      recommended: recommendedDebts,
      actual:      totalDebts,
      difference:  totalDebts      - recommendedDebts,
      remaining:   recommendedDebts - totalDebts,
    },
    {
      category:    `Ahorro (${pcts.savings}%)`,
      recommended: recommendedRegularSavings,
      actual:      actualRegular,
      difference:  actualRegular            - recommendedRegularSavings,
      remaining:   recommendedRegularSavings - actualRegular,
    },
    {
      category:    'Reserva de Emergencia (10%)',
      recommended: recommendedEmergencySavings,
      actual:      actualEmergency,
      difference:  actualEmergency             - recommendedEmergencySavings,
      remaining:   recommendedEmergencySavings  - actualEmergency,
    },
  ];
};