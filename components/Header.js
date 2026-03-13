import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  return (
    <header className="site-header">
      <div className="site-logo">
        REC<span>STATS</span>
      </div>
      <nav className="site-nav">
        <Link href="/" className={router.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link href="/players" className={isActive('/players') ? 'active' : ''}>Players</Link>
        <Link href="/games" className={isActive('/games') ? 'active' : ''}>Game Log</Link>
        <Link href="/leaderboard" className={isActive('/leaderboard') ? 'active' : ''}>Leaders</Link>
      </nav>
    </header>
  );
}
