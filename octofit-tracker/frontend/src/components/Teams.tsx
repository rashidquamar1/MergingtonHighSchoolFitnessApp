import { CapabilityCard } from './CapabilityCard.js';

const fields = [
  { key: 'name', label: 'Team' },
  { key: 'mascot', label: 'Mascot' },
  { key: 'members', label: 'Members' },
];

export default function Teams() {
  return <CapabilityCard title="Teams" description="Manage teams and members." endpoint="/api/teams" collectionKey="teams" emptyMessage="No teams yet." fields={fields} />;
}
