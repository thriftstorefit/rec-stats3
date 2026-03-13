import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import { getPlayers, getGames } from '../lib/db';
import { sumTotals, calcAverages, calcShooting, calcAdvanced, calcRecord, recentForm } from '../lib/stats';

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    setPlayers(getPlayers());
    setGames(getGames());
  }, []);

  const totalGames = games.length;
  const totalPlayers = players.length;

  // Top scorer
  const playerStats = players.map(p => {
    const pg = games.filter(g => g.playerId === p.id);
    const totals = sumTotals(pg);
    const avgs = calcAverages(totals, pg.length);
    return { ...p, avgs, gp: pg.length };
  }).filter(p => p.gp > 0);

  const topScorer = playerStats.sort((a,b) => b.avgs.pts - a.avgs.pts)[0];
  const topRebounder = [...playerStats].sort((a,b) => b.avgs.reb - a.avgs.reb)[0];
  const topAssister = [...playerStats].sort((a,b) => b.avgs.ast - a.avgs.ast)[0];

  const recentGames = [...games].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <>
      <Head><title>RecStats — 2K MyPlayer Tracker</title></Head>
      <Header />
      <div className="page">
        <div style={{ marginBottom: 32 }}>
          <div className="page-title">REC<span>STATS</span></div>
          <div className="page-subtitle">NBA 2K MyPlayer Rec Center Statistics Tracker</div>
        </div>

        <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-card-value">{totalPlayers}</div>
            <div className="stat-card-label">Players Tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{totalGames}</div>
            <div className="stat-card-label">Games Logged</div>
          </div>
          {topScorer && <div className="stat-card">
            <div className="stat-card-value">{topScorer.avgs.pts}</div>
            <div className="stat-card-label">Top Scorer PPG<br/><span style={{color:'var(--text2)', fontSize:11}}>{topScorer.name}</span></div>
          </div>}
          {topRebounder && <div className="stat-card">
            <div className="stat-card-value">{topRebounder.avgs.reb}</div>
            <div className="stat-card-label">Top Rebounder RPG<br/><span style={{color:'var(--text2)', fontSize:11}}>{topRebounder.name}</span></div>
          </div>}
          {topAssister && <div className="stat-card">
            <div className="stat-card-value">{topAssister.avgs.ast}</div>
            <div className="stat-card-label">Top Assist APG<br/><span style={{color:'var(--text2)', fontSize:11}}>{topAssister.name}</span></div>
          </div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="section-header">Recent Games</div>
            {recentGames.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No games logged yet. <Link href="/games">Add your first game →</Link></p>}
            {recentGames.map(g => {
              const player = players.find(p => p.id === g.playerId);
              return (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <Link href={`/players/${g.playerId}`} style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{player?.name || 'Unknown'}</Link>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {g.opponent ? `vs ${g.opponent}` : ''} {g.date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'IBM Plex Mono' }}>
                      {g.pts}pts / {g.reb}reb / {g.ast}ast
                    </span>
                    {g.result && <span className={g.result === 'W' ? 'result-w' : 'result-l'}>{g.result}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="section-header">Players</div>
            {players.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No players yet. <Link href="/players">Add a player →</Link></p>}
            {playerStats.slice(0,8).map(p => (
              <Link key={p.id} href={`/players/${p.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.position} · {p.gp}G</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'IBM Plex Mono' }}>
                  {p.avgs.pts} / {p.avgs.reb} / {p.avgs.ast}
                </div>
              </Link>
            ))}
            {players.length > 0 && <div style={{ marginTop: 12 }}><Link href="/players" style={{ fontSize: 12 }}>View all players →</Link></div>}
          </div>
        </div>
      </div>
    </>
  );
}
