import React, { useState } from 'react';
import Form from '../UI/Form/Form';
import List from '../UI/List/List';

const IncomeSection = ({ incomes, setIncomes }) => {
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const addIncome = (e) => {
    e.preventDefault();
    if (incomeName && incomeAmount) {
      setIncomes([...incomes, { name: incomeName, amount: parseFloat(incomeAmount) || 0 }]);
      setIncomeName('');
      setIncomeAmount('');
    }
  };

  const removeIncome = (index) => {
    const newIncomes = incomes.filter((_, i) => i !== index);
    setIncomes(newIncomes);
  };

  const editIncome = (index, item) => {
    setIsEditing(true);
    setEditIndex(index);
  };

  const saveEditIncome = (index, value) => {
    // Parsear el valor editado (formato: "Nombre: $Monto")
    const parts = value.split(': $');
    if (parts.length === 2) {
      const newIncomes = [...incomes];
      newIncomes[index] = {
        name: parts[0].trim(),
        amount: parseFloat(parts[1]) || 0
      };
      setIncomes(newIncomes);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditIndex(null);
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);

  const formFields = [
    {
      type: 'text',
      placeholder: 'Nombre del ingreso (ej. Salario)',
      value: incomeName,
      onChange: (e) => setIncomeName(e.target.value),
      required: true
    },
    {
      type: 'number',
      placeholder: 'Monto',
      value: incomeAmount,
      onChange: (e) => setIncomeAmount(e.target.value),
      required: true
    }
  ];

  return (
    <section className="section income-section">
      <h2>Ingresos Mensuales</h2>
      <Form 
        onSubmit={addIncome} 
        fields={formFields} 
        buttonText="Agregar Ingreso" 
      />
      <List 
        items={incomes} 
        onRemove={removeIncome} 
        onEdit={editIncome}
        onSaveEdit={saveEditIncome}
        onCancelEdit={cancelEdit}
        isEditing={isEditing}
        editIndex={editIndex}
        formatItem={(inc) => `${inc.name}: $${(inc.amount || 0).toFixed(2)}`}
      />
      <div className="total">Total Ingresos: ${(totalIncome || 0).toFixed(2)}</div>
    </section>
  );
};

export default IncomeSection;