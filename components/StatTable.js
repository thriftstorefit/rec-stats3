import { useState } from 'react';

export default function StatTable({ columns, rows, defaultSort, defaultDir = 'desc', onRowClick }) {
  const [sortCol, setSortCol] = useState(defaultSort || columns[0]?.key);
  const [sortDir, setSortDir] = useState(defaultDir);

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(key); setSortDir('desc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    const an = parseFloat(av), bn = parseFloat(bv);
    const cmp = isNaN(an) || isNaN(bn) ? String(av).localeCompare(String(bv)) : an - bn;
    return sortDir === 'desc' ? -cmp : cmp;
  });

  return (
    <div className="stat-table-wrap">
      <table className="stat-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={sortCol === col.key ? (sortDir === 'asc' ? 'sorted asc' : 'sorted') : ''}
                title={col.desc || ''}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={onRowClick ? { cursor: 'pointer' } : {}}>
              {columns.map(col => (
                <td key={col.key} className={col.className?.(row[col.key], row) || ''}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
          {!sorted.length && (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px' }}>No data yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
