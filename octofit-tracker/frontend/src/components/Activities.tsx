import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = Record<string, unknown>;

const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities').then(({ activities }) => activities);

const fields = [
  { key: 'type', label: 'Activity' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'points', label: 'Points' },
];

export default function Activities() {
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." load={loadActivities} emptyMessage="No activities yet." fields={fields} />;
}
