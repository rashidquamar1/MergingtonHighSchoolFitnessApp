import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = Record<string, unknown>;

const loadLeaderboard = () => getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard);

const fields = [
  { key: 'rank', label: 'Rank' },
  { key: 'teamName', label: 'Team' },
  { key: 'totalPoints', label: 'Points' },
];

export default function Leaderboard() {
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." load={loadLeaderboard} emptyMessage="No leaderboard rankings yet." fields={fields} />;
}
