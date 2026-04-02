import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const fmt  = (v) => '$' + (Math.round((v || 0) * 100) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v) => { v = v || 0; return Math.abs(v) >= 1000 ? (v < 0 ? '-' : '') + '$' + Math.round(Math.abs(v) / 100) / 10 + 'k' : fmt(v); };

const HistorySection = ({ history, onClear }) => {
  const chartRef  = useRef(null);
  const chartInst = useRef(null);

  const h = [...history].reverse();

  useEffect(() => {
    if (!chartRef.current || !h.length) return;
    if (chartInst.current) chartInst.current.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: h.map(x => x.label),
        datasets: [
          { label: 'Ingresos', data: h.map(x => x.income),   borderColor: '#7c6fff', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#7c6fff', tension: .4 },
          { label: 'Gastos',   data: h.map(x => x.expenses), borderColor: '#ff6b6b', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#ff6b6b', tension: .4 },
          { label: 'Ahorro',   data: h.map(x => x.savings),  borderColor: '#06d6a0', backgroundColor: 'rgba(6,214,160,.1)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#06d6a0', fill: true, tension: .4 },
          ...(h.some(x => x.invested > 0) ? [{ label: 'Portfolio', data: h.map(x => x.invested || 0), borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,.06)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#38bdf8', tension: .4 }] : []),
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#5a5a72', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,.04)' } },
          y: { ticks: { color: '#5a5a72', font: { size: 9 }, callback: v => fmtK(v) }, grid: { color: 'rgba(255,255,255,.04)' } }
        }
      }
    });
    return () => chartInst.current?.destroy();
  }, [history]);

  if (!history.length) return (
    <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text3)', fontSize: 13 }}>
      Cerrá el mes desde la pestaña Plan para ver tu evolución aquí
    </div>
  );

  const avgScore = Math.round(h.reduce((s, x) => s + x.score, 0) / h.length);

  return (
    <>
      <div className="card">
        <div className="card-title">Evolución mensual</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          {[['#7c6fff','Ingresos'],['#ff6b6b','Gastos'],['#06d6a0','Ahorro'],['#38bdf8','Portfolio']].map(([c,l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }}/>
              {l}
            </span>
          ))}
        </div>
        <div style={{ position: 'relative', height: 170 }}>
          <canvas ref={chartRef}/>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Score promedio
          <span className="badge badge-purple">{avgScore}/100</span>
        </div>
        <div className="prog-wrap">
          {h.map((x, i) => (
            <div key={i} className="prog-row">
              <div className="prog-lbl">{x.label}</div>
              <div className="prog-bar-bg">
                <div className="prog-bar-fill" style={{ width: `${x.score}%`, background: x.scoreColor }}/>
              </div>
              <div className="prog-pct" style={{ color: x.scoreColor, width: 34 }}>{x.score}</div>
            </div>
          ))}
        </div>
      </div>

      {h.map((x, i) => (
        <div key={i} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{x.label}</span>
            <span className="badge" style={{ color: x.scoreColor, borderColor: x.scoreColor + '40', background: x.scoreColor + '12' }}>
              {x.scoreLabel} · {x.score}/100
            </span>
          </div>
          <div className="stat-grid">
            <div className="stat-box"><div className="lbl">INGRESOS</div><div className="val accent">{fmt(x.income)}</div></div>
            <div className="stat-box"><div className="lbl">GASTOS</div><div className="val red">{fmt(x.expenses)}</div></div>
            <div className="stat-box"><div className="lbl">AHORRO</div><div className="val green">{fmt(x.savings)}</div></div>
            {x.invested > 0 && (
              <div className="stat-box"><div className="lbl">PORTFOLIO</div><div className="val blue">{fmt(x.invested)}</div></div>
            )}
          </div>
        </div>
      ))}

      <button className="btn" onClick={onClear}
        style={{ width: '100%', marginTop: 4, padding: 10, background: 'rgba(255,107,107,.15)', color: 'var(--accent2)', border: '1px solid rgba(255,107,107,.2)' }}>
        🗑 Borrar historial completo
      </button>
    </>
  );
};

export default HistorySection;