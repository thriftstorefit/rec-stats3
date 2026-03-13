const PLAYERS_KEY = 'rec_players';
const GAMES_KEY = 'rec_games';

export function getPlayers() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]'); } catch { return []; }
}

export function savePlayers(players) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function addPlayer(player) {
  const players = getPlayers();
  const newPlayer = { ...player, id: Date.now().toString(), createdAt: new Date().toISOString() };
  players.push(newPlayer);
  savePlayers(players);
  return newPlayer;
}

export function updatePlayer(id, updates) {
  const players = getPlayers();
  const idx = players.findIndex(p => p.id === id);
  if (idx === -1) return;
  players[idx] = { ...players[idx], ...updates };
  savePlayers(players);
}

export function deletePlayer(id) {
  savePlayers(getPlayers().filter(p => p.id !== id));
  // Also delete their games
  saveGames(getGames().filter(g => g.playerId !== id));
}

export function getGames() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(GAMES_KEY) || '[]'); } catch { return []; }
}

export function saveGames(games) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

export function getPlayerGames(playerId) {
  return getGames().filter(g => g.playerId === playerId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function addGame(game) {
  const games = getGames();
  const newGame = { ...game, id: Date.now().toString(), createdAt: new Date().toISOString() };
  games.push(newGame);
  saveGames(games);
  return newGame;
}

export function updateGame(id, updates) {
  const games = getGames();
  const idx = games.findIndex(g => g.id === id);
  if (idx === -1) return;
  games[idx] = { ...games[idx], ...updates };
  saveGames(games);
}

export function deleteGame(id) {
  saveGames(getGames().filter(g => g.id !== id));
}

export function exportData() {
  return JSON.stringify({ players: getPlayers(), games: getGames() }, null, 2);
}

export function importData(json) {
  const data = JSON.parse(json);
  if (data.players) savePlayers(data.players);
  if (data.games) saveGames(data.games);
}
