import React from 'react';
import { getMethodPcts } from '../../utils/calculations';

const fmtCur = (v) =>
  '$' + (Math.round((v || 0) * 100) / 100).toLocaleString('es-AR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

const METHODS = [
  { id: '50-30-20', name: '50 / 30 / 20', desc: 'El clásico. 50% esencial, 30% personal, 20% ahorro.' },
  { id: '60-20-20', name: '60 / 20 / 20', desc: 'Más cobertura básica. Ideal si tus gastos fijos son altos.' },
  { id: '70-20-10', name: '70 / 20 / 10', desc: 'Arranque conservador. Buen punto de partida si estás ajustado.' },
  { id: 'custom',   name: 'Personalizado ✏️', desc: 'Definí tus propios porcentajes libremente.' },
];

const SavingsSection = ({
  actualSavings, totalIncome,
  savingsGoal, setSavingsGoal,
  savingsMethod, setSavingsMethod,
  customPct, setCustomPct,
}) => {
  const pcts    = getMethodPcts(savingsMethod, customPct);
  const recSav  = totalIncome * pcts.savings / 100;
  const goalTotal = (savingsGoal.regular || 0) + (savingsGoal.emergency || 0);
  const pctSum  = (customPct.essential || 0) + (customPct.personal || 0) + (customPct.savings || 0);

  const progRows = [
    { label: 'Ahorro real',   pct: totalIncome > 0 ? actualSavings / totalIncome * 100 : 0, color: '#06d6a0' },
    { label: 'Meta método',   pct: pcts.savings, color: '#7c6fff' },
    ...(goalTotal > 0 ? [{ label: 'Vs. meta $', pct: actualSavings > 0 ? actualSavings / goalTotal * 100 : 0, color: '#ffd166' }] : []),
  ];

  let statusColor = '#ffd166', statusText = '';
  if (actualSavings >= recSav && totalIncome > 0) {
    statusColor = '#06d6a0';
    statusText  = `✓ Ahorrás ${fmtCur(actualSavings)} — cumplís la meta del ${pcts.savings}%`;
  } else if (actualSavings >= 0) {
    statusColor = '#ffd166';
    statusText  = `→ Ahorrás ${fmtCur(actualSavings)} pero la meta es ${fmtCur(recSav)}. Te falta ${fmtCur(recSav - actualSavings)}`;
  } else {
    statusColor = '#ff6b6b';
    statusText  = `✗ Déficit de ${fmtCur(Math.abs(actualSavings))} este mes. Gastás más de lo que ingresa.`;
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Método de ahorro</div>
        <div className="sec-label">Elegí tu estrategia</div>

        <div className="method-grid">
          {METHODS.map(m => (
            <div
              key={m.id}
              className={`method-card${savingsMethod === m.id ? ' selected' : ''}`}
              onClick={() => setSavingsMethod(m.id)}
            >
              <div className="mc-name">{m.name}</div>
              <div className="mc-desc">{m.desc}</div>
            </div>
          ))}
        </div>

        {savingsMethod === 'custom' && (
          <div style={{ marginBottom: 12 }}>
            <div className="sec-label" style={{ marginBottom: 8 }}>Porcentajes personalizados</div>
            <div className="input-row">
              {[['essential','% Esencial'],['personal','% Personal'],['savings','% Ahorro']].map(([key, ph]) => (
                <input
                  key={key} className="inp" type="number" placeholder={ph}
                  min="0" max="100" value={customPct[key] || ''}
                  onChange={e => setCustomPct({ ...customPct, [key]: parseFloat(e.target.value) || 0 })}
                />
              ))}
            </div>
            {Math.abs(pctSum - 100) > 1 && (
              <div style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4 }}>
                ⚠️ Los porcentajes no suman 100% (suma actual: {pctSum}%)
              </div>
            )}
          </div>
        )}

        <div className="sec-label">Metas de ahorro (monto objetivo)</div>
        <div className="input-row">
          {[['regular','AHORRO REGULAR'],['emergency','FONDO DE EMERGENCIA']].map(([key, label]) => (
            <div key={key} style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5, fontFamily: 'var(--mono)' }}>{label}</div>
              <input
                className="inp" type="number" placeholder="$0.00" min="0" step="0.01"
                value={savingsGoal[key] || ''}
                onChange={e => setSavingsGoal({ ...savingsGoal, [key]: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Estado del ahorro</div>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="lbl">AHORRO REAL</div>
            <div className={`val ${actualSavings >= 0 ? 'green' : 'red'}`}>{fmtCur(actualSavings)}</div>
          </div>
          <div className="stat-box">
            <div className="lbl">META TOTAL</div>
            <div className="val accent">{fmtCur(goalTotal)}</div>
          </div>
        </div>

        <div className="prog-wrap">
          {progRows.map((row, i) => (
            <div key={i} className="prog-row">
              <div className="prog-lbl">{row.label}</div>
              <div className="prog-bar-bg">
                <div className="prog-bar-fill" style={{ width: `${Math.min(100, Math.max(0, row.pct))}%`, background: row.color }} />
              </div>
              <div className="prog-pct">{Math.round(Math.max(0, row.pct))}%</div>
            </div>
          ))}
        </div>

        <div className="status-box" style={{ color: statusColor }}>{statusText}</div>
      </div>
    </>
  );
};

export default SavingsSection;