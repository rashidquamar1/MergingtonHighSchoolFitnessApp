import { CapabilityCard } from './CapabilityCard.js';

const fields = [
  { key: 'rank', label: 'Rank' },
  { key: 'teamName', label: 'Team' },
  { key: 'totalPoints', label: 'Points' },
];

export default function Leaderboard() {
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." endpoint="/api/leaderboard" collectionKey="leaderboard" emptyMessage="No leaderboard rankings yet." fields={fields} />;
}
