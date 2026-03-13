import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import StatTable from '../components/StatTable';
import { getPlayers, getGames } from '../lib/db';
import { sumTotals, calcAverages, calcShooting, calcAdvanced, calcRecord } from '../lib/stats';

const CATEGORIES = [
  { key: 'pts', label: 'Points' },
  { key: 'reb', label: 'Rebounds' },
  { key: 'ast', label: 'Assists' },
  { key: 'stl', label: 'Steals' },
  { key: 'blk', label: 'Blocks' },
  { key: 'tov', label: 'Turnovers' },
  { key: 'fgPct', label: 'FG%' },
  { key: 'fg3Pct', label: '3P%' },
  { key: 'ftPct', label: 'FT%' },
  { key: 'tsP', label: 'TS%' },
  { key: 'gsPerGame', label: 'Game Score' },
];

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [minGames, setMinGames] = useState(1);

  useEffect(() => { setPlayers(getPlayers()); setGames(getGames()); }, []);

  const rows = players.map(p => {
    const pg = games.filter(g => g.playerId === p.id);
    const totals = sumTotals(pg);
    const avgs = calcAverages(totals, pg.length);
    const shoot = calcShooting(totals);
    const adv = calcAdvanced(totals, pg.length);
    const rec = calcRecord(pg);
    return { ...p, ...avgs, ...shoot, ...adv, gp: pg.length, wins: rec.wins, losses: rec.losses };
  }).filter(p => p.gp >= minGames);

  const columns = [
    { key: 'rank', label: '#', render: (_, __, i) => i + 1 },
    { key: 'name', label: 'Player', render: (v, row) => <Link href={`/players/${row.id}`} style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</Link> },
    { key: 'position', label: 'POS' },
    { key: 'gp', label: 'G' },
    { key: 'pts', label: 'PTS', className: (v) => v >= 20 ? 'highlight' : '' },
    { key: 'reb', label: 'REB', className: v => v >= 10 ? 'highlight' : '' },
    { key: 'ast', label: 'AST', className: v => v >= 7 ? 'highlight' : '' },
    { key: 'stl', label: 'STL' },
    { key: 'blk', label: 'BLK' },
    { key: 'tov', label: 'TOV' },
    { key: 'fgPct', label: 'FG%', render: v => v ? `${v}%` : '—' },
    { key: 'fg3Pct', label: '3P%', render: v => v ? `${v}%` : '—' },
    { key: 'ftPct', label: 'FT%', render: v => v ? `${v}%` : '—' },
    { key: 'tsP', label: 'TS%', render: v => v ? `${v}%` : '—' },
    { key: 'efgP', label: 'eFG%', render: v => v ? `${v}%` : '—' },
    { key: 'gsPerGame', label: 'GmSc' },
    { key: 'wins', label: 'W', className: () => 'good' },
    { key: 'losses', label: 'L', className: () => 'bad' },
  ];

  // Per-category leaders
  const leaders = CATEGORIES.map(cat => {
    const sorted = [...rows].sort((a,b) => {
      const av = parseFloat(a[cat.key]) || 0, bv = parseFloat(b[cat.key]) || 0;
      return cat.key === 'tov' ? av - bv : bv - av;
    });
    return { ...cat, leader: sorted[0], value: sorted[0]?.[cat.key] };
  });

  return (
    <>
      <Head><title>Leaderboard — RecStats</title></Head>
      <Header />
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div className="page-title">Leaders</div>
            <div className="page-subtitle">Statistical leaders — click any column to sort</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min Games:</label>
            <select value={minGames} onChange={e => setMinGames(Number(e.target.value))} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, padding: '5px 8px', color: 'var(--text)', fontSize: 13 }}>
              {[1,3,5,10].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
        </div>

        {/* LEADERS BY CATEGORY */}
        <div className="section-header">Category Leaders</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 28 }}>
          {leaders.filter(l => l.leader).map(cat => (
            <div key={cat.key} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text3)', marginBottom: 6 }}>{cat.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href={`/players/${cat.leader.id}`} style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{cat.leader.name}</Link>
                <span style={{ fontFamily: 'IBM Plex Mono', color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>
                  {cat.key.includes('Pct') || cat.key === 'tsP' || cat.key === 'efgP' ? `${cat.value}%` : cat.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="section-header">Full Standings</div>
        <StatTable columns={columns} rows={rows} defaultSort="pts" />
      </div>
    </>
  );
}
