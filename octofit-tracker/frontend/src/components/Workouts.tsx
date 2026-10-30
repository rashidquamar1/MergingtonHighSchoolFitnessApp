import { CapabilityCard } from './CapabilityCard.js';

const fields = [
  { key: 'title', label: 'Workout' },
  { key: 'focus', label: 'Focus' },
  { key: 'reason', label: 'Reason' },
];

export default function Workouts() {
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." endpoint="/api/workouts/suggestions/mona%40example.com" collectionKey="suggestions" emptyMessage="No workout suggestions yet." fields={fields} />;
}
