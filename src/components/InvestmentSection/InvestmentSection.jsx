import React, { useState } from 'react';
import { calculateInvestmentTotals } from '../../utils/calculations';

const fmtCur = (v) =>
  '$' + (Math.round((v || 0) * 100) / 100).toLocaleString('es-AR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%';

const ASSET_TYPES = [
  { value: 'acciones',   label: '📈 Acciones' },
  { value: 'cedears',    label: '🌎 CEDEARs' },
  { value: 'bonos',      label: '🏛 Bonos' },
  { value: 'lecaps',     label: '📋 LECAPs' },
  { value: 'fondos',     label: '📊 Fondos / ETF' },
  { value: 'cripto',     label: '₿  Cripto' },
  { value: 'plazo_fijo', label: '🏦 Plazo fijo' },
  { value: 'inmuebles',  label: '🏠 Inmuebles' },
  { value: 'otro',       label: '💼 Otro' },
];

const InvestmentSection = ({ investments, setInvestments }) => {
  const [name, setName]       = useState('');
  const [type, setType]       = useState('acciones');
  const [amount, setAmount]   = useState('');
  const [returns, setReturns] = useState('');

  const [editId, setEditId]           = useState(null);
  const [editName, setEditName]       = useState('');
  const [editType, setEditType]       = useState('acciones');
  const [editAmount, setEditAmount]   = useState('');
  const [editReturns, setEditReturns] = useState('');

  const add = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    const ret = parseFloat(returns) || 0;
    setInvestments([
      ...investments,
      { id: Date.now(), name: name.trim(), type, amount: amt, returns: ret }
    ]);
    setName(''); setAmount(''); setReturns('');
  };

  const remove = (id) => setInvestments(investments.filter(i => i.id !== id));

  const startEdit = (inv) => {
    setEditId(inv.id);
    setEditName(inv.name);
    setEditType(inv.type || 'acciones');
    setEditAmount(String(inv.amount));
    setEditReturns(String(inv.returns || 0));
  };

  const saveEdit = () => {
    const amt = parseFloat(editAmount);
    if (!editName.trim() || isNaN(amt) || amt <= 0) return;
    const ret = parseFloat(editReturns) || 0;
    setInvestments(investments.map(i =>
      i.id === editId ? { ...i, name: editName.trim(), type: editType, amount: amt, returns: ret } : i
    ));
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const { totalInvested, totalReturns, totalValue, totalROI } = calculateInvestmentTotals(investments);

  const typeLabel = (t) => ASSET_TYPES.find(a => a.value === t)?.label || t;

  return (
    <>
      <div className="card">
        <div className="card-title">
          Agregar inversión
          <span className="badge badge-blue">PORTFOLIO</span>
        </div>

        <div className="input-row">
          <input
            className="inp" placeholder="Ej: Apple AAPL" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            style={{ flex: 2 }}
          />
          <div className="sel-wrap" style={{ flex: 1.5 }}>
            <select className="sel" value={type} onChange={e => setType(e.target.value)}>
              {ASSET_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
        </div>

        <div className="input-row" style={{ marginBottom: 14 }}>
          <input
            className="inp" type="number" placeholder="💰 Monto invertido" value={amount}
            min="0" step="0.01"
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <input
            className="inp" type="number"
            placeholder="📈 Ganancia/pérdida (puede ser negativo)"
            value={returns}
            step="0.01"
            onChange={e => setReturns(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button className="btn" onClick={add}>+ Agregar</button>
        </div>

        <ul className="item-list">
          {investments.map((inv) => {
            const roi = inv.amount > 0 ? (inv.returns / inv.amount) * 100 : 0;
            return (
              <li key={inv.id}>
                {editId === inv.id ? (
                  <div className="edit-row">
                    <input
                      className="inp" style={{ flex: 2 }} value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Nombre"
                    />
                    <div className="sel-wrap" style={{ flex: 1.2 }}>
                      <select className="sel" value={editType} onChange={e => setEditType(e.target.value)}>
                        {ASSET_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    <input
                      className="inp" type="number" style={{ flex: 1 }} value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      placeholder="Monto"
                    />
                    <input
                      className="inp" type="number" style={{ flex: 1 }} value={editReturns}
                      onChange={e => setEditReturns(e.target.value)}
                      placeholder="Ganancia"
                    />
                    <button className="btn" style={{ padding: '7px 10px', fontSize: 11 }} onClick={saveEdit}>✓</button>
                    <button className="btn-sm" onClick={cancelEdit}>✕</button>
                  </div>
                ) : (
                  <div style={{ width: '100%' }}>
                    <div className="item">
                      <span className="dot dot-investment" />
                      <span className="item-name">{inv.name}</span>
                      <span className="badge badge-blue" style={{ fontSize: 9 }}>{typeLabel(inv.type)}</span>
                      <span className="item-amt">{fmtCur(inv.amount)}</span>
                      <div className="item-acts">
                        <button className="btn-sm btn-edit" onClick={() => startEdit(inv)}>✎</button>
                        <button className="btn-sm btn-del" onClick={() => remove(inv.id)}>✕</button>
                      </div>
                    </div>
                    <div className="inv-return-row" style={{ padding: '3px 10px 6px' }}>
                      <span>Rendimiento:</span>
                      <span className={inv.returns >= 0 ? 'inv-return-pos' : 'inv-return-neg'}>
                        {inv.returns >= 0 ? '+' : ''}{fmtCur(inv.returns)}
                      </span>
                      <span style={{ color: 'var(--text3)' }}>·</span>
                      <span className={roi >= 0 ? 'inv-return-pos' : 'inv-return-neg'}>
                        {fmtPct(roi)}
                      </span>
                      <span style={{ color: 'var(--text3)' }}>· Valor actual:</span>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                        {fmtCur(inv.amount + (inv.returns || 0))}
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="lbl">INVERTIDO</div>
          <div className="val blue">{fmtCur(totalInvested)}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">RENDIMIENTO</div>
          <div className={`val ${totalReturns >= 0 ? 'green' : 'red'}`}>
            {totalReturns >= 0 ? '+' : ''}{fmtCur(totalReturns)}
          </div>
        </div>
        <div className="stat-box">
          <div className="lbl">VALOR TOTAL</div>
          <div className="val accent">{fmtCur(totalValue)}</div>
        </div>
        <div className="stat-box">
          <div className="lbl">ROI TOTAL</div>
          <div className={`val ${totalROI >= 0 ? 'green' : 'red'}`}>{fmtPct(totalROI)}</div>
        </div>
      </div>

      {investments.length > 0 && (
        <div className="card">
          <div className="card-title">Distribución por tipo</div>
          {ASSET_TYPES.map(a => {
            const items = investments.filter(i => i.type === a.value);
            if (!items.length) return null;
            const total = items.reduce((s, i) => s + i.amount, 0);
            const pct = totalInvested > 0 ? (total / totalInvested) * 100 : 0;
            return (
              <div key={a.value} className="prog-row">
                <div className="prog-lbl" style={{ fontSize: 10 }}>{a.label}</div>
                <div className="prog-bar-bg">
                  <div className="prog-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent5)' }} />
                </div>
                <div className="prog-pct">{Math.round(pct)}%</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default InvestmentSection;