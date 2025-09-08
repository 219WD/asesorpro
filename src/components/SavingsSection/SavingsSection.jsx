import React, { useState } from 'react';

const SavingsSection = ({ 
  actualSavings, 
  savingsGoal, 
  setSavingsGoal, 
  savingsPercentages, 
  setSavingsPercentages 
}) => {
  const [regularSavingsPercent, setRegularSavingsPercent] = useState(savingsPercentages.regular || 20);
  const [emergencySavingsPercent, setEmergencySavingsPercent] = useState(savingsPercentages.emergency || 10);

  const updateSavingsGoal = (e, type) => {
    const value = parseFloat(e.target.value) || 0;
    setSavingsGoal({ ...savingsGoal, [type]: value });
  };

  const updateSavingsPercentages = (e, type) => {
    const value = parseFloat(e.target.value) || 0;
    if (type === 'regular') {
      setRegularSavingsPercent(value);
      setSavingsPercentages({ ...savingsPercentages, regular: value });
    } else {
      setEmergencySavingsPercent(value);
      setSavingsPercentages({ ...savingsPercentages, emergency: value });
    }
  };

  return (
    <section className="section savings-section">
      <h2>Metas de Ahorros Mensual</h2>
      <div className="savings-goals">
        <div className="savings-input">
          <label>Ahorro Regular ({savingsPercentages.regular || 20}%)</label>
          <input
            type="number"
            placeholder="Porcentaje de ahorro regular"
            value={regularSavingsPercent || ''}
            onChange={(e) => updateSavingsPercentages(e, 'regular')}
            min="0"
            max="100"
          />
          <input
            type="number"
            placeholder="Meta de ahorro regular"
            value={savingsGoal.regular || ''}
            onChange={(e) => updateSavingsGoal(e, 'regular')}
            min="0"
          />
          <div>Meta Actual: ${(savingsGoal.regular || 0).toFixed(2)}</div>
        </div>
        <div className="savings-input">
          <label>Reserva de Emergencia ({savingsPercentages.emergency || 10}%)</label>
          <input
            type="number"
            placeholder="Porcentaje de reserva de emergencia"
            value={emergencySavingsPercent || ''}
            onChange={(e) => updateSavingsPercentages(e, 'emergency')}
            min="0"
            max="100"
          />
          <input
            type="number"
            placeholder="Meta de reserva de emergencia"
            value={savingsGoal.emergency || ''}
            onChange={(e) => updateSavingsGoal(e, 'emergency')}
            min="0"
          />
          <div>Meta Actual: ${(savingsGoal.emergency || 0).toFixed(2)}</div>
        </div>
      </div>
      <div className="total">Ahorro Real (Ingresos - Gastos): ${(actualSavings || 0).toFixed(2)}</div>
      <div className={actualSavings >= 0 ? 'under' : 'over'}>
        {actualSavings >= 0 ? 
          `Estás ahorrando $${actualSavings.toFixed(2)} este mes` : 
          `Tienes un déficit de $${Math.abs(actualSavings).toFixed(2)} este mes`}
      </div>
    </section>
  );
};

export default SavingsSection;