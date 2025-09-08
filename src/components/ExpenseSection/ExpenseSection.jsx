import React, { useState } from 'react';
import Form from '../UI/Form/Form';
import List from '../UI/List/List';
import { calculateExpenseTotals } from '../../utils/calculations';

const ExpenseSection = ({ expenses, setExpenses }) => {
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('essential');
  const [isEditing, setIsEditing] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const addExpense = (e) => {
    e.preventDefault();
    if (expenseName && expenseAmount) {
      setExpenses([...expenses, { 
        name: expenseName, 
        amount: parseFloat(expenseAmount) || 0, 
        category: expenseCategory 
      }]);
      setExpenseName('');
      setExpenseAmount('');
    }
  };

  const removeExpense = (index) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
  };

  const editExpense = (index, item) => {
    setIsEditing(true);
    setEditIndex(index);
  };

  const saveEditExpense = (index, value) => {
    // Parsear el valor editado (formato: "Nombre (Categoría): $Monto")
    const categoryMatch = value.match(/\((.*?)\)/);
    const amountMatch = value.match(/\$\s*([0-9,.]+)/);
    
    if (categoryMatch && amountMatch) {
      const category = categoryMatch[1].toLowerCase();
      const name = value.split(' (')[0].trim();
      const amount = parseFloat(amountMatch[1].replace(',', '')) || 0;
      
      // Validar categoría
      let finalCategory = 'essential';
      if (category.includes('personal')) finalCategory = 'personal';
      if (category.includes('deuda')) finalCategory = 'debt';
      
      const newExpenses = [...expenses];
      newExpenses[index] = {
        name,
        amount,
        category: finalCategory
      };
      setExpenses(newExpenses);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditIndex(null);
  };

  const { totalEssential, totalPersonal, totalDebts, totalExpenses } = calculateExpenseTotals(expenses);

  const formFields = [
    {
      type: 'text',
      placeholder: 'Nombre del gasto (ej. Alquiler)',
      value: expenseName,
      onChange: (e) => setExpenseName(e.target.value),
      required: true
    },
    {
      type: 'number',
      placeholder: 'Monto',
      value: expenseAmount,
      onChange: (e) => setExpenseAmount(e.target.value),
      required: true
    },
    {
      type: 'select',
      value: expenseCategory,
      onChange: (e) => setExpenseCategory(e.target.value),
      options: [
        { value: 'essential', label: 'Esencial (alquiler, comida, etc.)' },
        { value: 'personal', label: 'Personal (estilo de vida)' },
        { value: 'debt', label: 'Deuda (préstamos, tarjetas)' }
      ]
    }
  ];

  const formatExpenseItem = (exp) => {
    const categoryText = 
      exp.category === 'essential' ? 'Esencial' : 
      exp.category === 'personal' ? 'Personal' : 'Deuda';
    return `${exp.name} (${categoryText}): $${(exp.amount || 0).toFixed(2)}`;
  };

  return (
    <section className="section expense-section">
      <h2>Gastos Mensuales</h2>
      <Form 
        onSubmit={addExpense} 
        fields={formFields} 
        buttonText="Agregar Gasto" 
      />
      <List 
        items={expenses} 
        onRemove={removeExpense} 
        onEdit={editExpense}
        onSaveEdit={saveEditExpense}
        onCancelEdit={cancelEdit}
        isEditing={isEditing}
        editIndex={editIndex}
        formatItem={formatExpenseItem}
      />
      <div className="totals">
        <div>Esenciales: ${(totalEssential || 0).toFixed(2)}</div>
        <div>Personales: ${(totalPersonal || 0).toFixed(2)}</div>
        <div>Deudas: ${(totalDebts || 0).toFixed(2)}</div>
        <div>Total Gastos: ${(totalExpenses || 0).toFixed(2)}</div>
      </div>
    </section>
  );
};

export default ExpenseSection;