import React, { useState } from 'react';

const fmtCur = (v) =>
  '$' + (Math.round((v || 0) * 100) / 100).toLocaleString('es-AR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

const IncomeSection = ({ incomes, setIncomes }) => {
  const [name, setName]       = useState('');
  const [amount, setAmount]   = useState('');
  const [editId, setEditId]   = useState(null);
  const [editName, setEditName]     = useState('');
  const [editAmount, setEditAmount] = useState('');

  const add = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    setIncomes([...incomes, { id: Date.now(), name: name.trim(), amount: amt }]);
    setName(''); setAmount('');
  };

  const remove = (id) => setIncomes(incomes.filter(i => i.id !== id));

  const startEdit = (inc) => {
    setEditId(inc.id);
    setEditName(inc.name);
    setEditAmount(String(inc.amount));
  };

  const saveEdit = () => {
    const amt = parseFloat(editAmount);
    if (!editName.trim() || isNaN(amt) || amt <= 0) return;
    setIncomes(incomes.map(i => i.id === editId ? { ...i, name: editName.trim(), amount: amt } : i));
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const total = incomes.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <>
      <div className="card">
        <div className="card-title">
          Agregar ingreso
          <span className="badge badge-purple">MENSUAL</span>
        </div>
        <div className="input-row">
          <input
            className="inp" placeholder="Ej: Salario" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <input
            className="inp" type="number" placeholder="$0.00" value={amount} min="0" step="0.01"
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button className="btn" onClick={add}>+ Agregar</button>
        </div>

        <ul className="item-list">
          {incomes.map((inc) => (
            <li key={inc.id}>
              {editId === inc.id ? (
                <div className="edit-row">
                  <input className="inp" style={{ flex: 1 }} value={editName} onChange={e => setEditName(e.target.value)} />
                  <input className="inp" type="number" style={{ flex: 1 }} value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                  <button className="btn" style={{ padding: '7px 12px', fontSize: 11 }} onClick={saveEdit}>✓ Guardar</button>
                  <button className="btn-sm" onClick={cancelEdit}>✕</button>
                </div>
              ) : (
                <div className="item">
                  <span className="item-name">{inc.name}</span>
                  <span className="item-amt">{fmtCur(inc.amount)}</span>
                  <div className="item-acts">
                    <button className="btn-sm btn-edit" onClick={() => startEdit(inc)}>✎</button>
                    <button className="btn-sm btn-del" onClick={() => remove(inc.id)}>✕</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="lbl">TOTAL INGRESOS</div>
          <div className="val accent">{fmtCur(total)}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">FUENTES</div>
          <div className="val">{incomes.length}</div>
        </div>
      </div>
    </>
  );
};

export default IncomeSection;