import React from 'react';
import { calculateFinancialPlan } from '../../utils/calculations';
import FinancialTable from '../UI/Table/FinancialTable';

const FinancialPlanSection = ({ 
  totalIncome, 
  totalEssentialExpenses, 
  totalPersonalExpenses, 
  totalDebts,
  actualSavings, 
  savingsPercentages,
  savingsGoal 
}) => {
  if (totalIncome <= 0) return null;

  const tableData = calculateFinancialPlan(
    totalIncome, 
    totalEssentialExpenses, 
    totalPersonalExpenses, 
    totalDebts,
    actualSavings, 
    savingsPercentages
  );

  const recommendedRegularSavings = totalIncome * ((savingsPercentages.regular || 20) / 100);
  const recommendedEmergencySavings = totalIncome * ((savingsPercentages.emergency || 10) / 100);
  
  const regularSavingsVariance = (savingsGoal.regular || 0) - recommendedRegularSavings;
  const emergencySavingsVariance = (savingsGoal.emergency || 0) - recommendedEmergencySavings;

  return (
    <section className="section plan-section">
      <h2>Plan Financiero Mensual (Método 50/30/10/10)</h2>
      <FinancialTable data={tableData} totalIncome={totalIncome} />
      {(regularSavingsVariance !== 0 || emergencySavingsVariance !== 0) && (
        <div className="variance">
          <div>Variación Ahorro Regular vs. Meta: {regularSavingsVariance > 0 ? '+' : ''}${(regularSavingsVariance || 0).toFixed(2)}</div>
          <div>Variación Reserva de Emergencia vs. Meta: {emergencySavingsVariance > 0 ? '+' : ''}${(emergencySavingsVariance || 0).toFixed(2)}</div>
        </div>
      )}
    </section>
  );
};

export default FinancialPlanSection;