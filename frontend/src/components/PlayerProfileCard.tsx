"use client";

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
}

function hash(address: string): number[] {
  let h = 2166136261;
  const out: number[] = [];
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < address.length; j++) {
      h = Math.imul(h ^ (address.charCodeAt(j) + i), 16777619) >>> 0;
    }
    out.push(h);
  }
  return out;
}

/** Deterministic 5x5 mirrored identicon derived from the wallet address. */
export function Identicon({ address, size = 64 }: { address: string; size?: number }) {
  const bits = hash(address);
  const hue = bits[0] % 360;
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      if (bits[1 + y * 3 + x] % 2 === 0) {
        cells.push([x, y]);
        if (x < 2) cells.push([4 - x, y]);
      }
    }
  }
  return (
    <svg
      role="img"
      aria-label="Wallet identicon"
      width={size}
      height={size}
      viewBox="0 0 5 5"
      className="rounded-full bg-white/10"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={`hsl(${hue} 70% 55%)`} />
      ))}
    </svg>
  );
}

export function shortenAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export function PlayerProfileCard({ address, stats }: { address: string; stats: PlayerStats }) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  return (
    <section aria-label="Player profile" className="flex w-64 flex-col items-center gap-3 text-white">
      <Identicon address={address} />
      <p className="font-mono text-sm" title={address}>{shortenAddress(address)}</p>
      <dl className="grid w-full grid-cols-2 gap-2 text-center text-sm">
        <div><dt className="text-gray-400">Games</dt><dd>{stats.gamesPlayed}</dd></div>
        <div><dt className="text-gray-400">Win rate</dt><dd>{winRate}%</dd></div>
        <div><dt className="text-gray-400">Streak</dt><dd>{stats.currentStreak}</dd></div>
        <div><dt className="text-gray-400">Best</dt><dd>{stats.bestStreak}</dd></div>
      </dl>
    </section>
  );
}
