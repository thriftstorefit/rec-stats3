// Calculate per-game averages from totals
export function calcAverages(totals, gp) {
  if (!gp) return {};
  const avg = (v) => gp > 0 ? +(v / gp).toFixed(1) : 0;
  return {
    gp,
    pts: avg(totals.pts),
    reb: avg(totals.reb),
    ast: avg(totals.ast),
    stl: avg(totals.stl),
    blk: avg(totals.blk),
    tov: avg(totals.tov),
    fgm: avg(totals.fgm),
    fga: avg(totals.fga),
    fg3m: avg(totals.fg3m),
    fg3a: avg(totals.fg3a),
    ftm: avg(totals.ftm),
    fta: avg(totals.fta),
    min: avg(totals.min),
    oreb: avg(totals.oreb),
    dreb: avg(totals.dreb),
    pf: avg(totals.pf),
  };
}

// Shooting percentages
export function calcShooting(totals) {
  return {
    fgPct: totals.fga > 0 ? +((totals.fgm / totals.fga) * 100).toFixed(1) : 0,
    fg3Pct: totals.fg3a > 0 ? +((totals.fg3m / totals.fg3a) * 100).toFixed(1) : 0,
    ftPct: totals.fta > 0 ? +((totals.ftm / totals.fta) * 100).toFixed(1) : 0,
  };
}

// Advanced stats
export function calcAdvanced(totals, gp) {
  const { pts, reb, ast, stl, blk, tov, fgm, fga, fg3m, fg3a, ftm, fta, min, oreb, dreb } = totals;

  // True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))
  const tsa = fga + 0.44 * fta;
  const tsP = tsa > 0 ? +((pts / (2 * tsa)) * 100).toFixed(1) : 0;

  // Effective FG% = (FGM + 0.5 * 3PM) / FGA
  const efgP = fga > 0 ? +(((fgm + 0.5 * fg3m) / fga) * 100).toFixed(1) : 0;

  // Usage rate estimate (simplified, no team data): (FGA + 0.44*FTA + TOV) / min * 48
  // Without team stats we normalize per minute
  const minPerGame = gp > 0 ? min / gp : 0;
  const possPerGame = (fga/gp || 0) + 0.44*(fta/gp || 0) + (tov/gp || 0);

  // Assist to Turnover ratio
  const astTov = tov > 0 ? +((ast / tov).toFixed(2)) : ast > 0 ? 'N/A' : 0;

  // Stock (steals + blocks)
  const stock = stl + blk;

  // Double doubles / triple doubles (need game log)
  // Points per shot (PPS)
  const pps = fga > 0 ? +((pts / fga).toFixed(2)) : 0;

  // Free throw rate
  const ftRate = fga > 0 ? +((fta / fga).toFixed(3)) : 0;

  // 3-point attempt rate
  const fg3Rate = fga > 0 ? +((fg3a / fga).toFixed(3)) : 0;

  // Game score (per game): PTS + 0.4*FGM - 0.7*FGA - 0.4*(FTA-FTM) + 0.7*OREB + 0.3*DREB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV
  const gsPerGame = gp > 0 ? +((
    pts/gp + 0.4*(fgm/gp) - 0.7*(fga/gp) - 0.4*((fta-ftm)/gp) +
    0.7*(oreb/gp) + 0.3*(dreb/gp) + stl/gp + 0.7*(ast/gp) + 0.7*(blk/gp) - tov/gp
  ).toFixed(1)) : 0;

  // PIE estimate (simplified): (PTS + REB + AST + STL + BLK - FGA + FGM - FTA + FTM - TOV) per game
  const pie = gp > 0 ? +((
    (pts + reb + ast + stl + blk - fga + fgm - fta + ftm - tov) / gp
  ).toFixed(1)) : 0;

  return { tsP, efgP, astTov, stock, pps, ftRate, fg3Rate, gsPerGame, pie };
}

// Sum totals from game log
export function sumTotals(games) {
  const zero = { pts:0, reb:0, ast:0, stl:0, blk:0, tov:0, fgm:0, fga:0, fg3m:0, fg3a:0, ftm:0, fta:0, min:0, oreb:0, dreb:0, pf:0 };
  return games.reduce((acc, g) => {
    Object.keys(zero).forEach(k => { acc[k] += (Number(g[k]) || 0); });
    return acc;
  }, { ...zero });
}

// Count double/triple doubles from game log
export function countMultiDoubles(games) {
  let dd = 0, td = 0;
  for (const g of games) {
    const cats = [g.pts, g.reb, g.ast, g.stl, g.blk].map(Number).filter(v => v >= 10);
    if (cats.length >= 3) td++;
    else if (cats.length >= 2) dd++;
  }
  return { dd, td };
}

// Win/loss record
export function calcRecord(games) {
  const wins = games.filter(g => g.result === 'W').length;
  const losses = games.filter(g => g.result === 'L').length;
  return { wins, losses, pct: (wins + losses) > 0 ? +((wins / (wins + losses)) * 100).toFixed(1) : 0 };
}

// Career highs
export function careerHighs(games) {
  if (!games.length) return {};
  const stat = (key) => Math.max(...games.map(g => Number(g[key]) || 0));
  return {
    pts: stat('pts'), reb: stat('reb'), ast: stat('ast'),
    stl: stat('stl'), blk: stat('blk'), fg3m: stat('fg3m'),
  };
}

// Hot/cold streaks (last 5 games)
export function recentForm(games, stat = 'pts') {
  const last5 = [...games].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (!last5.length) return null;
  const avg = last5.reduce((s, g) => s + (Number(g[stat]) || 0), 0) / last5.length;
  return +avg.toFixed(1);
}

export const STAT_LABELS = {
  gp: 'G', pts: 'PTS', reb: 'REB', ast: 'AST', stl: 'STL', blk: 'BLK',
  tov: 'TOV', fgm: 'FGM', fga: 'FGA', fg3m: '3PM', fg3a: '3PA',
  ftm: 'FTM', fta: 'FTA', min: 'MIN', oreb: 'ORB', dreb: 'DRB', pf: 'PF',
  fgPct: 'FG%', fg3Pct: '3P%', ftPct: 'FT%',
  tsP: 'TS%', efgP: 'eFG%', astTov: 'AST/TOV', stock: 'STK',
  pps: 'PPS', ftRate: 'FTr', fg3Rate: '3PAr', gsPerGame: 'GmSc', pie: 'PIE',
};
