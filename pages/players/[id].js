import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import StatTable from '../../components/StatTable';
import { getPlayers, getPlayerGames, addGame, deleteGame, updateGame } from '../../lib/db';
import { sumTotals, calcAverages, calcShooting, calcAdvanced, calcRecord, careerHighs, countMultiDoubles, recentForm } from '../../lib/stats';

const emptyGame = { date: new Date().toISOString().split('T')[0], opponent: '', result: '', min: '', pts: '', reb: '', oreb: '', dreb: '', ast: '', stl: '', blk: '', tov: '', fgm: '', fga: '', fg3m: '', fg3a: '', ftm: '', fta: '', pf: '', myScore: '', oppScore: '' };

export default function PlayerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);
  const [tab, setTab] = useState('overview');
  const [showAddGame, setShowAddGame] = useState(false);
  const [editGame, setEditGame] = useState(null);
  const [form, setForm] = useState(emptyGame);

  const reload = () => {
    if (!id) return;
    const ps = getPlayers();
    setPlayer(ps.find(p => p.id === id) || null);
    setGames(getPlayerGames(id));
  };

  useEffect(() => { reload(); }, [id]);

  if (!player) return <><Header /><div className="page" style={{color:'var(--text3)'}}>Player not found. <Link href="/players">← Back</Link></div></>;

  const totals = sumTotals(games);
  const avgs = calcAverages(totals, games.length);
  const shoot = calcShooting(totals);
  const adv = calcAdvanced(totals, games.length);
  const record = calcRecord(games);
  const highs = careerHighs(games);
  const { dd, td } = countMultiDoubles(games);
  const last5pts = recentForm(games, 'pts');
  const gp = games.length;

  const handleSaveGame = () => {
    const g = { ...form, playerId: id };
    if (editGame) { updateGame(editGame.id, g); setEditGame(null); }
    else addGame(g);
    setForm(emptyGame);
    setShowAddGame(false);
    reload();
  };

  const handleEdit = (game) => {
    setForm({ ...emptyGame, ...game });
    setEditGame(game);
    setShowAddGame(true);
  };

  const handleDelete = (gameId) => {
    if (!confirm('Delete this game?')) return;
    deleteGame(gameId);
    reload();
  };

  const inp = (key, label, type = 'number', placeholder = '') => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={placeholder} min={type==='number'?'0':undefined} />
    </div>
  );

  const gameLogCols = [
    { key: 'date', label: 'Date', render: v => v },
    { key: 'opponent', label: 'OPP', render: v => v || '—' },
    { key: 'result', label: 'W/L', render: (v, row) => {
      if (!v && row.myScore && row.oppScore) {
        const r = Number(row.myScore) > Number(row.oppScore) ? 'W' : 'L';
        return <span className={r==='W'?'result-w':'result-l'}>{r} {row.myScore}-{row.oppScore}</span>;
      }
      if (v) return <span className={v==='W'?'result-w':'result-l'}>{v}{row.myScore?` ${row.myScore}-${row.oppScore}`:''}</span>;
      return '—';
    }},
    { key: 'min', label: 'MIN' },
    { key: 'pts', label: 'PTS', className: (v) => v >= 30 ? 'highlight' : v >= 20 ? '' : '' },
    { key: 'reb', label: 'REB', className: v => v >= 10 ? 'highlight' : '' },
    { key: 'ast', label: 'AST', className: v => v >= 10 ? 'highlight' : '' },
    { key: 'stl', label: 'STL' },
    { key: 'blk', label: 'BLK' },
    { key: 'tov', label: 'TOV', className: v => v >= 5 ? 'bad' : '' },
    { key: 'fgm', label: 'FGM' },
    { key: 'fga', label: 'FGA' },
    { key: 'fg3m', label: '3PM' },
    { key: 'fg3a', label: '3PA' },
    { key: 'ftm', label: 'FTM' },
    { key: 'fta', label: 'FTA' },
    { key: 'fgPct', label: 'FG%', render: (_, row) => row.fga > 0 ? `${((row.fgm/row.fga)*100).toFixed(0)}%` : '—' },
    { key: 'id', label: '', render: (v, row) => (
      <div style={{display:'flex',gap:4}}>
        <button className="btn btn-secondary" style={{padding:'2px 7px',fontSize:11}} onClick={e=>{e.stopPropagation();handleEdit(row);}}>✎</button>
        <button className="btn btn-danger" style={{padding:'2px 7px',fontSize:11}} onClick={e=>{e.stopPropagation();handleDelete(v);}}>✕</button>
      </div>
    )},
  ];

  const initials = player.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <>
      <Head><title>{player.name} — RecStats</title></Head>
      <Header />
      <div className="page">
        <div style={{marginBottom:8}}><Link href="/players" style={{fontSize:12,color:'var(--text3)'}}>← All Players</Link></div>

        <div className="player-hero">
          <div className="player-avatar">{initials}</div>
          <div>
            <div className="player-hero-name">{player.name}</div>
            <div className="player-hero-meta">
              <span>{player.position}</span>
              {player.build && <span>{player.build}</span>}
              {player.overall && <span className="badge badge-gold">OVR {player.overall}</span>}
              <span style={{marginLeft:8}}>{record.wins}W – {record.losses}L</span>
              {gp > 0 && <span style={{color:'var(--text3)'}}>{gp} games</span>}
            </div>
          </div>
          <div style={{marginLeft:'auto'}}>
            <button className="btn btn-primary" onClick={() => { setForm(emptyGame); setEditGame(null); setShowAddGame(true); }}>+ Log Game</button>
          </div>
        </div>

        {/* QUICK STAT CARDS */}
        {gp > 0 && (
          <div className="stat-cards">
            {[
              { v: avgs.pts, l: 'PPG' }, { v: avgs.reb, l: 'RPG' }, { v: avgs.ast, l: 'APG' },
              { v: avgs.stl, l: 'SPG' }, { v: avgs.blk, l: 'BPG' }, { v: avgs.tov, l: 'TPG' },
              { v: `${shoot.fgPct}%`, l: 'FG%' }, { v: `${shoot.fg3Pct}%`, l: '3P%' }, { v: `${shoot.ftPct}%`, l: 'FT%' },
              { v: `${adv.tsP}%`, l: 'TS%' }, { v: adv.gsPerGame, l: 'GmSc' }, { v: dd, l: 'Double-Doubles' },
            ].map(s => (
              <div key={s.l} className="stat-card">
                <div className="stat-card-value">{s.v}</div>
                <div className="stat-card-label">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {gp === 0 && <div style={{color:'var(--text3)',padding:'24px 0',fontSize:13}}>No games logged yet. Click "Log Game" to add your first game.</div>}

        {/* TABS */}
        {gp > 0 && (
          <>
            <div className="tabs">
              {['overview','gamelog','advanced','highs'].map(t => (
                <div key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
                  {t === 'overview' ? 'Overview' : t === 'gamelog' ? 'Game Log' : t === 'advanced' ? 'Advanced' : 'Career Highs'}
                </div>
              ))}
            </div>

            {tab === 'overview' && (
              <div>
                <div className="section-header">Season Averages</div>
                <div className="stat-table-wrap">
                  <table className="stat-table">
                    <thead><tr>
                      <th>G</th><th>MIN</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th>
                      <th>FGM</th><th>FGA</th><th>FG%</th><th>3PM</th><th>3PA</th><th>3P%</th><th>FTM</th><th>FTA</th><th>FT%</th>
                    </tr></thead>
                    <tbody><tr>
                      {[gp, avgs.min, avgs.pts, avgs.reb, avgs.ast, avgs.stl, avgs.blk, avgs.tov,
                        avgs.fgm, avgs.fga, `${shoot.fgPct}%`, avgs.fg3m, avgs.fg3a, `${shoot.fg3Pct}%`,
                        avgs.ftm, avgs.fta, `${shoot.ftPct}%`].map((v, i) => <td key={i}>{v ?? '—'}</td>)}
                    </tr></tbody>
                  </table>
                </div>

                <div className="section-header" style={{marginTop:24}}>Season Totals</div>
                <div className="stat-table-wrap">
                  <table className="stat-table">
                    <thead><tr>
                      <th>G</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th>
                      <th>FGM</th><th>FGA</th><th>3PM</th><th>3PA</th><th>FTM</th><th>FTA</th><th>ORB</th><th>DRB</th>
                    </tr></thead>
                    <tbody><tr>
                      {[gp, totals.pts, totals.reb, totals.ast, totals.stl, totals.blk, totals.tov,
                        totals.fgm, totals.fga, totals.fg3m, totals.fg3a, totals.ftm, totals.fta,
                        totals.oreb, totals.dreb].map((v, i) => <td key={i}>{v ?? 0}</td>)}
                    </tr></tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'gamelog' && (
              <StatTable columns={gameLogCols} rows={games} defaultSort="date" defaultDir="desc" />
            )}

            {tab === 'advanced' && (
              <div>
                <div className="section-header">Advanced Stats</div>
                <div className="stat-table-wrap">
                  <table className="stat-table">
                    <thead><tr>
                      <th title="True Shooting %">TS%</th>
                      <th title="Effective Field Goal %">eFG%</th>
                      <th title="Points per shot attempt">PPS</th>
                      <th title="Assist to Turnover ratio">AST/TOV</th>
                      <th title="Steals + Blocks per game">STK/G</th>
                      <th title="Free Throw Attempt Rate">FTr</th>
                      <th title="3-Point Attempt Rate">3PAr</th>
                      <th title="Game Score per game">GmSc</th>
                      <th title="Player Impact Estimate">PIE</th>
                      <th title="Double-Doubles">DD</th>
                      <th title="Triple-Doubles">TD</th>
                    </tr></thead>
                    <tbody><tr>
                      <td className={adv.tsP >= 60 ? 'good' : adv.tsP <= 45 ? 'bad' : ''}>{adv.tsP}%</td>
                      <td>{adv.efgP}%</td>
                      <td>{adv.pps}</td>
                      <td>{adv.astTov}</td>
                      <td>{+(( (totals.stl + totals.blk) / gp).toFixed(1))}</td>
                      <td>{(adv.ftRate * 100).toFixed(1)}%</td>
                      <td>{(adv.fg3Rate * 100).toFixed(1)}%</td>
                      <td className={adv.gsPerGame >= 15 ? 'good' : ''}>{adv.gsPerGame}</td>
                      <td>{adv.pie}</td>
                      <td>{dd}</td>
                      <td className={td > 0 ? 'highlight' : ''}>{td}</td>
                    </tr></tbody>
                  </table>
                </div>

                <div style={{marginTop:24, fontSize:12, color:'var(--text3)', lineHeight:1.8}}>
                  <strong style={{color:'var(--text2)'}}>Stat Glossary</strong><br/>
                  <strong>TS%</strong> — True Shooting % accounts for 2s, 3s, and free throws: PTS / (2 × (FGA + 0.44×FTA))<br/>
                  <strong>eFG%</strong> — Effective FG% weights 3-pointers: (FGM + 0.5×3PM) / FGA<br/>
                  <strong>PPS</strong> — Points per shot attempt<br/>
                  <strong>GmSc</strong> — Game Score: a single-number performance metric (like a box score rating)<br/>
                  <strong>PIE</strong> — Player Impact Estimate: combined box score contribution per game<br/>
                  <strong>FTr</strong> — How often you get to the line: FTA / FGA<br/>
                  <strong>3PAr</strong> — Share of shots that are 3s: 3PA / FGA
                </div>
              </div>
            )}

            {tab === 'highs' && (
              <div>
                <div className="section-header">Career Highs</div>
                <div className="stat-cards">
                  {[
                    { v: highs.pts, l: 'Points' }, { v: highs.reb, l: 'Rebounds' },
                    { v: highs.ast, l: 'Assists' }, { v: highs.stl, l: 'Steals' },
                    { v: highs.blk, l: 'Blocks' }, { v: highs.fg3m, l: '3-Pointers' },
                  ].map(s => (
                    <div key={s.l} className="stat-card">
                      <div className="stat-card-value">{s.v || 0}</div>
                      <div className="stat-card-label">{s.l}</div>
                    </div>
                  ))}
                </div>

                {last5pts !== null && (
                  <div style={{ marginTop: 16 }}>
                    <div className="section-header">Recent Form (Last 5)</div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {['pts','reb','ast','stl','blk'].map(s => (
                        <div key={s} className="stat-card" style={{ minWidth: 100 }}>
                          <div className="stat-card-value" style={{ fontSize: 22 }}>{recentForm(games, s)}</div>
                          <div className="stat-card-label">{s.toUpperCase()} L5</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ADD/EDIT GAME MODAL */}
      {showAddGame && (
        <div className="modal-overlay" onClick={() => setShowAddGame(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editGame ? 'Edit Game' : 'Log Game'} — {player.name}</div>

            <div className="section-header" style={{ marginBottom: 12 }}>Game Info</div>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
              {inp('date', 'Date', 'date')}
              <div className="form-group">
                <label>Opponent</label>
                <input value={form.opponent || ''} onChange={e => setForm(f=>({...f,opponent:e.target.value}))} placeholder="e.g. Team Name" />
              </div>
              <div className="form-group">
                <label>Result</label>
                <select value={form.result || ''} onChange={e => setForm(f=>({...f,result:e.target.value}))}>
                  <option value="">—</option>
                  <option value="W">Win</option>
                  <option value="L">Loss</option>
                </select>
              </div>
              {inp('min', 'Minutes')}
              {inp('myScore', 'My Team Score')}
              {inp('oppScore', 'Opp Team Score')}
            </div>

            <div className="section-header" style={{ marginBottom: 12 }}>Box Score</div>
            <div className="form-grid">
              {inp('pts', 'PTS')} {inp('reb', 'REB')} {inp('ast', 'AST')}
              {inp('stl', 'STL')} {inp('blk', 'BLK')} {inp('tov', 'TOV')}
              {inp('oreb', 'ORB')} {inp('dreb', 'DRB')} {inp('pf', 'PF')}
            </div>

            <div className="section-header" style={{ marginBottom: 12, marginTop: 8 }}>Shooting</div>
            <div className="form-grid">
              {inp('fgm', 'FGM')} {inp('fga', 'FGA')}
              {inp('fg3m', '3PM')} {inp('fg3a', '3PA')}
              {inp('ftm', 'FTM')} {inp('fta', 'FTA')}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => { setShowAddGame(false); setEditGame(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveGame}>{editGame ? 'Save Changes' : 'Log Game'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
