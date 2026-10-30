import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = Record<string, unknown>;

const loadWorkoutSuggestions = () => getJson<{ suggestions: WorkoutSuggestion[] }>('/api/workouts/suggestions/mona%40example.com').then(({ suggestions }) => suggestions);

const fields = [
  { key: 'title', label: 'Workout' },
  { key: 'focus', label: 'Focus' },
  { key: 'reason', label: 'Reason' },
];

export default function Workouts() {
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." load={loadWorkoutSuggestions} emptyMessage="No workout suggestions yet." fields={fields} />;
}
