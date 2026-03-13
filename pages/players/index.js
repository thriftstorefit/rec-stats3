import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import StatTable from '../components/StatTable';
import { getPlayers, getGames, addPlayer, deletePlayer } from '../../lib/db';
import { sumTotals, calcAverages, calcShooting, calcAdvanced, calcRecord } from '../../lib/stats';

const POSITIONS = ['PG','SG','SF','PF','C'];

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', position: 'PG', build: '', overall: '' });

  const reload = () => { setPlayers(getPlayers()); setGames(getGames()); };
  useEffect(() => { reload(); }, []);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addPlayer(form);
    setForm({ name: '', position: 'PG', build: '', overall: '' });
    setShowModal(false);
    reload();
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete ${name} and all their games?`)) return;
    deletePlayer(id);
    reload();
  };

  const rows = players.map(p => {
    const pg = games.filter(g => g.playerId === p.id);
    const totals = sumTotals(pg);
    const avgs = calcAverages(totals, pg.length);
    const shoot = calcShooting(totals);
    const adv = calcAdvanced(totals, pg.length);
    const rec = calcRecord(pg);
    return { ...p, ...avgs, ...shoot, ...adv, gp: pg.length, wins: rec.wins, losses: rec.losses };
  });

  const columns = [
    { key: 'name', label: 'Player', render: (v, row) => <Link href={`/players/${row.id}`} className="player-name" style={{color:'var(--text)',fontWeight:600}}>{v}</Link> },
    { key: 'position', label: 'POS' },
    { key: 'gp', label: 'G' },
    { key: 'pts', label: 'PTS', className: (v) => v >= 20 ? 'highlight' : '' },
    { key: 'reb', label: 'REB' },
    { key: 'ast', label: 'AST' },
    { key: 'stl', label: 'STL' },
    { key: 'blk', label: 'BLK' },
    { key: 'tov', label: 'TOV' },
    { key: 'fgPct', label: 'FG%', render: v => v ? `${v}%` : '—' },
    { key: 'fg3Pct', label: '3P%', render: v => v ? `${v}%` : '—' },
    { key: 'ftPct', label: 'FT%', render: v => v ? `${v}%` : '—' },
    { key: 'tsP', label: 'TS%', render: v => v ? `${v}%` : '—', desc: 'True Shooting %' },
    { key: 'efgP', label: 'eFG%', render: v => v ? `${v}%` : '—', desc: 'Effective Field Goal %' },
    { key: 'gsPerGame', label: 'GmSc', desc: 'Game Score per game' },
    { key: 'wins', label: 'W', className: () => 'good' },
    { key: 'losses', label: 'L', className: () => 'bad' },
    {
      key: 'id', label: '', render: (v, row) => (
        <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }} onClick={e => { e.stopPropagation(); handleDelete(v, row.name); }}>✕</button>
      )
    },
  ];

  return (
    <>
      <Head><title>Players — RecStats</title></Head>
      <Header />
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div className="page-title">Players</div>
            <div className="page-subtitle">Per-game averages — click column headers to sort</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Player</button>
        </div>

        <StatTable columns={columns} rows={rows} defaultSort="pts" />

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Player</div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Gamertag / Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. xX_Buckets_Xx" autoFocus />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <select value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))}>
                    {POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Overall Rating</label>
                  <input type="number" min="60" max="99" value={form.overall} onChange={e => setForm(f => ({...f, overall: e.target.value}))} placeholder="e.g. 90" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Build / Archetype</label>
                  <input value={form.build} onChange={e => setForm(f => ({...f, build: e.target.value}))} placeholder="e.g. Slashing Playmaker" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Add Player</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
