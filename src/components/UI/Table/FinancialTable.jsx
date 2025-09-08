import React from 'react';

const FinancialTable = ({ data, totalIncome }) => {
  return (
    <table className="plan-table">
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Recomendado</th>
          <th>Actual</th>
          <th>Diferencia</th>
          <th>Restante</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.category}</td>
            <td>${(row.recommended || 0).toFixed(2)} ({((row.recommended / totalIncome) * 100 || 0).toFixed(0)}%)</td>
            <td>${(row.actual || 0).toFixed(2)}</td>
            <td className={row.difference > 0 ? 'over' : 'under'}>
              ${Math.abs(row.difference || 0).toFixed(2)} {row.difference > 0 ? '(Exceso)' : '(Ahorro)'}
            </td>
            <td className={row.remaining >= 0 ? 'under' : 'over'}>
              ${Math.abs(row.remaining || 0).toFixed(2)} {row.remaining >= 0 ? '(Disponible)' : '(Faltante)'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FinancialTable;