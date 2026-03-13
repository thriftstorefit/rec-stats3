import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import StatTable from '../components/StatTable';
import { getPlayers, getGames, deleteGame } from '../lib/db';

export default function Games() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('all');

  const reload = () => { setPlayers(getPlayers()); setGames(getGames()); };
  useEffect(() => { reload(); }, []);

  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));
  const filtered = filter === 'all' ? games : games.filter(g => g.playerId === filter);

  const rows = filtered.map(g => ({
    ...g,
    playerName: playerMap[g.playerId]?.name || '—',
    fgPct: g.fga > 0 ? +((g.fgm / g.fga) * 100).toFixed(0) : null,
  }));

  const handleDelete = (id) => {
    if (!confirm('Delete this game?')) return;
    deleteGame(id);
    reload();
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'playerName', label: 'Player', render: (v, row) => <Link href={`/players/${row.playerId}`} style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</Link> },
    { key: 'opponent', label: 'OPP', render: v => v || '—' },
    { key: 'result', label: 'W/L', render: (v, row) => {
      const r = v || (row.myScore && row.oppScore ? (Number(row.myScore) > Number(row.oppScore) ? 'W' : 'L') : null);
      if (!r) return '—';
      return <span className={r === 'W' ? 'result-w' : 'result-l'}>{r}{row.myScore ? ` ${row.myScore}-${row.oppScore}` : ''}</span>;
    }},
    { key: 'min', label: 'MIN' },
    { key: 'pts', label: 'PTS', className: v => Number(v) >= 30 ? 'highlight' : '' },
    { key: 'reb', label: 'REB', className: v => Number(v) >= 10 ? 'highlight' : '' },
    { key: 'ast', label: 'AST', className: v => Number(v) >= 10 ? 'highlight' : '' },
    { key: 'stl', label: 'STL' },
    { key: 'blk', label: 'BLK' },
    { key: 'tov', label: 'TOV' },
    { key: 'fgm', label: 'FGM' },
    { key: 'fga', label: 'FGA' },
    { key: 'fgPct', label: 'FG%', render: v => v != null ? `${v}%` : '—' },
    { key: 'fg3m', label: '3PM' },
    { key: 'fg3a', label: '3PA' },
    { key: 'ftm', label: 'FTM' },
    { key: 'fta', label: 'FTA' },
    { key: 'id', label: '', render: (v) => (
      <button className="btn btn-danger" style={{ padding: '2px 7px', fontSize: 11 }} onClick={e => { e.stopPropagation(); handleDelete(v); }}>✕</button>
    )},
  ];

  return (
    <>
      <Head><title>Game Log — RecStats</title></Head>
      <Header />
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div className="page-title">Game Log</div>
            <div className="page-subtitle">{rows.length} games — click column headers to sort</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Barlow Condensed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, padding: '5px 8px', color: 'var(--text)', fontSize: 13 }}>
              <option value="all">All Players</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <StatTable columns={columns} rows={rows} defaultSort="date" defaultDir="desc" />
      </div>
    </>
  );
}
