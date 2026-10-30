import { CapabilityCard } from './CapabilityCard.js';

const fields = [
  { key: 'type', label: 'Activity' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'points', label: 'Points' },
];

export default function Activities() {
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." endpoint="/api/activities" collectionKey="activities" emptyMessage="No activities yet." fields={fields} />;
}
