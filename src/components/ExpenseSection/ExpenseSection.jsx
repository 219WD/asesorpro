import React, { useState } from 'react';
import { calculateExpenseTotals } from '../../utils/calculations';

const fmtCur = (v) =>
  '$' + (Math.round((v || 0) * 100) / 100).toLocaleString('es-AR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

const CAT_LABEL = { essential: 'Esencial', personal: 'Personal', debt: 'Deuda' };
const CAT_BADGE = { essential: 'badge-green', personal: 'badge-yellow', debt: 'badge-red' };

const ExpenseSection = ({ expenses, setExpenses }) => {
  const [name, setName]         = useState('');
  const [amount, setAmount]     = useState('');
  const [category, setCategory] = useState('essential');

  const [editId, setEditId]         = useState(null);
  const [editName, setEditName]     = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCat, setEditCat]       = useState('essential');

  const add = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    setExpenses([...expenses, { id: Date.now(), name: name.trim(), amount: amt, category }]);
    setName(''); setAmount('');
  };

  const remove = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const startEdit = (exp) => {
    setEditId(exp.id);
    setEditName(exp.name);
    setEditAmount(String(exp.amount));
    setEditCat(exp.category);
  };

  const saveEdit = () => {
    const amt = parseFloat(editAmount);
    if (!editName.trim() || isNaN(amt) || amt <= 0) return;
    setExpenses(expenses.map(e => e.id === editId ? { ...e, name: editName.trim(), amount: amt, category: editCat } : e));
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const { totalEssential, totalPersonal, totalDebts, totalExpenses } = calculateExpenseTotals(expenses);

  return (
    <>
      <div className="card">
        <div className="card-title">Agregar gasto</div>
        <div className="input-row">
          <input
            className="inp" placeholder="Ej: Alquiler" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <input
            className="inp" type="number" placeholder="$0.00" value={amount} min="0" step="0.01"
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
        </div>
        <div className="input-row" style={{ marginBottom: 14 }}>
          <div className="sel-wrap">
            <select className="sel" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="essential">🏠 Esencial — alquiler, comida, servicios</option>
              <option value="personal">🎯 Personal — ocio, ropa, salidas</option>
              <option value="debt">💳 Deuda — préstamos, tarjetas, cuotas</option>
            </select>
          </div>
          <button className="btn" onClick={add}>+ Agregar</button>
        </div>

        <ul className="item-list">
          {expenses.map((exp) => (
            <li key={exp.id}>
              {editId === exp.id ? (
                <div className="edit-row">
                  <input className="inp" style={{ flex: 2, minWidth: 80 }} value={editName} onChange={e => setEditName(e.target.value)} />
                  <input className="inp" type="number" style={{ flex: 1, minWidth: 70 }} value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                  <div className="sel-wrap" style={{ flex: 1.5, minWidth: 110 }}>
                    <select className="sel" value={editCat} onChange={e => setEditCat(e.target.value)}>
                      <option value="essential">🏠 Esencial</option>
                      <option value="personal">🎯 Personal</option>
                      <option value="debt">💳 Deuda</option>
                    </select>
                  </div>
                  <button className="btn" style={{ padding: '7px 10px', fontSize: 11 }} onClick={saveEdit}>✓</button>
                  <button className="btn-sm" onClick={cancelEdit}>✕</button>
                </div>
              ) : (
                <div className="item">
                  <span className={`dot dot-${exp.category}`} />
                  <span className="item-name">{exp.name}</span>
                  <span className={`badge ${CAT_BADGE[exp.category]}`} style={{ fontSize: 9 }}>
                    {CAT_LABEL[exp.category]}
                  </span>
                  <span className="item-amt">{fmtCur(exp.amount)}</span>
                  <div className="item-acts">
                    <button className="btn-sm btn-edit" onClick={() => startEdit(exp)}>✎</button>
                    <button className="btn-sm btn-del" onClick={() => remove(exp.id)}>✕</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="lbl">ESENCIALES</div>
          <div className="val green">{fmtCur(totalEssential)}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">PERSONALES</div>
          <div className="val yellow">{fmtCur(totalPersonal)}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">DEUDAS</div>
          <div className="val red">{fmtCur(totalDebts)}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">TOTAL GASTOS</div>
          <div className="val">{fmtCur(totalExpenses)}</div>
        </div>
      </div>
    </>
  );
};

export default ExpenseSection;