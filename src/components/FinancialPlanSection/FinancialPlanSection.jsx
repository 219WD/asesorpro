import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { getMethodPcts } from '../../utils/calculations';

Chart.register(...registerables);

const fmt = (v) => '$' + (Math.round((v || 0) * 100) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v) => { v = v || 0; return Math.abs(v) >= 1000 ? (v < 0 ? '-' : '') + '$' + Math.round(Math.abs(v) / 100) / 10 + 'k' : fmt(v); };

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export function calcScore(incomes, expenses, savingsMethod, customPct) {
  const inc = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  if (inc <= 0) return { score: 0, color: '#5a5a72', label: 'Sin datos', desc: '', items: [] };
  const p = getMethodPcts(savingsMethod, customPct);
  const ess = expenses.filter(e => e.category === 'essential').reduce((s, e) => s + (e.amount || 0), 0);
  const per = expenses.filter(e => e.category === 'personal').reduce((s, e) => s + (e.amount || 0), 0);
  const dbt = expenses.filter(e => e.category === 'debt').reduce((s, e) => s + (e.amount || 0), 0);
  const tot = ess + per + dbt;
  const sav = Math.max(0, inc - tot);
  const recE = inc * p.essential / 100, recP = inc * p.personal / 100, recS = inc * p.savings / 100;
  let score = 100, items = [];
  const eR = ess / recE, pR = per / recP, sR = recS > 0 ? sav / recS : 1;
  if (eR > 1) { const pen = Math.round(Math.min(30, (eR - 1) * 60)); score -= pen; items.push({ txt: `Esenciales ${Math.round((eR - 1) * 100)}% sobre límite`, bad: true }); }
  else items.push({ txt: 'Esenciales bajo control', bad: false });
  if (pR > 1) { const pen = Math.round(Math.min(25, (pR - 1) * 50)); score -= pen; items.push({ txt: `Personales ${Math.round((pR - 1) * 100)}% sobre límite`, bad: true }); }
  else items.push({ txt: 'Personales dentro del límite', bad: false });
  if (sR >= 1) items.push({ txt: 'Ahorro ✓ cumplís la meta', bad: false });
  else { const pen = Math.round((1 - sR) * 30); score -= pen; items.push({ txt: `Ahorro al ${Math.round(sR * 100)}% de la meta`, bad: sR < 0.5 }); }
  if (dbt > inc * 0.2) { score -= 10; items.push({ txt: `Deudas altas (${Math.round(dbt / inc * 100)}% del ingreso)`, bad: true }); }
  score = Math.max(0, Math.min(100, score));
  let color = '#ff6b6b', label = 'Crítico';
  if (score >= 80) { color = '#06d6a0'; label = 'Excelente'; }
  else if (score >= 60) { color = '#ffd166'; label = 'Bueno'; }
  else if (score >= 40) { color = '#ff9f43'; label = 'Regular'; }
  const descs = { Excelente: 'Estás manejando tu plata como un pro. Seguí así.', Bueno: 'Buen trabajo, hay margen para optimizar algunas áreas.', Regular: 'Hay oportunidades claras de mejora. Revisá los excesos.', Crítico: 'Atención: tus gastos comprometen tu estabilidad financiera.' };
  return { score, color, label, desc: descs[label] || '', items };
}

const FinancialPlanSection = ({
  totalIncome, totalEssentialExpenses, totalPersonalExpenses,
  totalDebts, actualSavings, savingsMethod, customPct, savingsGoal,
  incomes, expenses,
}) => {
  const donaRef  = useRef(null);
  const projRef  = useRef(null);
  const donaChart  = useRef(null);
  const projChart  = useRef(null);

  const p    = getMethodPcts(savingsMethod, customPct);
  const recE = totalIncome * p.essential / 100;
  const recP = totalIncome * p.personal  / 100;
  const recD = totalIncome * 0.1;
  const recS = totalIncome * p.savings   / 100;
  const left = totalIncome - totalEssentialExpenses - totalPersonalExpenses - totalDebts;

  const cats = [
    { n: 'Gastos Esenciales', d: 'Alquiler, comida, servicios', rec: recE, act: totalEssentialExpenses, c: '#06d6a0' },
    { n: 'Gastos Personales', d: 'Ocio, salidas, ropa',         rec: recP, act: totalPersonalExpenses,  c: '#ffd166' },
    { n: 'Deudas',            d: 'Préstamos, tarjetas',          rec: recD, act: totalDebts,              c: '#ff6b6b' },
    { n: 'Ahorro',            d: 'Lo que te queda libre',        rec: recS, act: Math.max(0, left),      c: '#7c6fff' },
  ];

  const sc       = calcScore(incomes, expenses, savingsMethod, customPct);
  const nowM     = new Date().getMonth();
  const projLabels = Array.from({ length: 12 }, (_, i) => MONTHS[(nowM + i) % 12]);
  const projSav  = Math.max(0, left);
  const projData = Array.from({ length: 12 }, (_, i) => Math.round(projSav * (i + 1)));
  const circumference = 201;
  const offset   = circumference - (sc.score / 100) * circumference;

  useEffect(() => {
    if (!donaRef.current) return;
    if (donaChart.current) donaChart.current.destroy();
    donaChart.current = new Chart(donaRef.current, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.n),
        datasets: [{ data: cats.map(c => Math.max(0, c.act)), backgroundColor: cats.map(c => c.c), borderWidth: 0, hoverOffset: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)}` } } } }
    });
    return () => donaChart.current?.destroy();
  }, [totalEssentialExpenses, totalPersonalExpenses, totalDebts, actualSavings]);

  useEffect(() => {
    if (!projRef.current) return;
    if (projChart.current) projChart.current.destroy();
    projChart.current = new Chart(projRef.current, {
      type: 'line',
      data: { labels: projLabels, datasets: [{ label: 'Ahorro acumulado', data: projData, borderColor: '#7c6fff', backgroundColor: 'rgba(124,111,255,.1)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#7c6fff', fill: true, tension: .4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#5a5a72', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,.04)' } }, y: { ticks: { color: '#5a5a72', font: { size: 9 }, callback: v => fmtK(v) }, grid: { color: 'rgba(255,255,255,.04)' } } } }
    });
    return () => projChart.current?.destroy();
  }, [actualSavings]);

  if (totalIncome <= 0) return (
    <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text3)', fontSize: 13 }}>
      Agregá ingresos y gastos para ver tu plan financiero
    </div>
  );

  const totalGastos = totalEssentialExpenses + totalPersonalExpenses + totalDebts;
  const savPct = totalIncome > 0 ? Math.round(Math.max(0, left) / totalIncome * 100) : 0;
  const methodLabel = savingsMethod === 'custom' ? 'CUSTOM' : savingsMethod.toUpperCase();

  return (
    <>
      {/* SCORE */}
      <div className="card">
        <div className="card-title">Score financiero</div>
        <div className="score-ring-wrap">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#1c1c2a" strokeWidth="8"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke={sc.color} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset .8s ease' }}/>
          </svg>
          <div className="score-txt">
            <div className="score-num" style={{ color: sc.color }}>{sc.score}</div>
            <div className="score-lbl">{sc.label}</div>
            <div className="score-desc">{sc.desc}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {sc.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: it.bad ? 'var(--accent2)' : 'var(--text2)' }}>
              <span style={{ fontSize: 12 }}>{it.bad ? '✗' : '✓'}</span>{it.txt}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stat-grid">
        <div className="stat-box"><div className="lbl">INGRESO</div><div className="val accent">{fmt(totalIncome)}</div></div>
        <div className="stat-box"><div className="lbl">GASTOS</div><div className={`val ${totalGastos > totalIncome ? 'red' : 'neutral'}`}>{fmt(totalGastos)}</div></div>
        <div className="stat-box"><div className="lbl">SALDO</div><div className={`val ${left >= 0 ? 'green' : 'red'}`}>{fmt(left)}</div></div>
      </div>

      {/* DONA */}
      <div className="card">
        <div className="card-title">Distribución <span className="badge badge-purple">{methodLabel}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
            <canvas ref={donaRef}/>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{savPct}%</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>ahorro</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cats.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--text2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c.c, flexShrink: 0 }}/>
                <span style={{ flex: 1 }}>{c.n}</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{fmt(c.act)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BARRAS */}
      <div className="card">
        <div className="card-title">Barras de progreso</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>Línea blanca = límite recomendado</div>
        <div className="prog-wrap">
          {cats.map((c, i) => {
            const pct = Math.min(100, totalIncome > 0 ? c.act / totalIncome * 100 : 0);
            const rp  = totalIncome > 0 ? c.rec / totalIncome * 100 : 0;
            return (
              <div key={i} className="prog-row">
                <div className="prog-lbl" style={{ width: 110, fontSize: 10 }}>{c.n}</div>
                <div className="prog-bar-bg" style={{ position: 'relative' }}>
                  <div className="prog-bar-fill" style={{ width: `${pct}%`, background: c.c }}/>
                  <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${rp}%`, width: 1.5, background: 'rgba(255,255,255,.25)' }}/>
                </div>
                <div className="prog-pct">{Math.round(pct)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROYECCIÓN */}
      <div className="card">
        <div className="card-title">Proyección anual</div>
        {[
          ['Ahorro mensual estimado', fmt(projSav), 'var(--accent3)'],
          ['Proyección a 6 meses',    fmt(projSav * 6), 'var(--accent)'],
          ['Proyección a 12 meses',   fmt(projSav * 12), 'var(--accent4)'],
        ].map(([lbl, val, color], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize: 11 }}>
            <span style={{ color: 'var(--text2)' }}>{lbl}</span>
            <span style={{ fontFamily: 'var(--mono)', color }}>{val}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, position: 'relative', height: 160 }}>
          <canvas ref={projRef}/>
        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        <div className="card-title">Tabla detallada</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>
          🟢 Verde = dentro del límite · 🔴 Rojo = exceso
        </div>
        <div className="plan-wrap">
          <table className="plan-table">
            <thead><tr><th>Categoría</th><th>Recomendado</th><th>Actual</th><th>Diferencia</th><th>Estado</th></tr></thead>
            <tbody>
              {cats.map((c, i) => {
                const diff = c.act - c.rec, ok = diff <= 0;
                return (
                  <tr key={i}>
                    <td className="cat-cell">{c.n}<small>{c.d}</small></td>
                    <td>{fmt(c.rec)}</td>
                    <td className={ok ? 'ok' : 'warn'}>{fmt(c.act)}</td>
                    <td className={ok ? 'ok' : 'warn'}>{ok ? '-' : '+'}{fmt(Math.abs(diff))}</td>
                    <td className={ok ? 'ok' : 'warn'}>{ok ? '✓ OK' : '✗ Exceso'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FinancialPlanSection;