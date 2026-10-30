import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamData = Record<string, unknown>;

const loadTeams = () => getJson<{ teams: TeamData[] }>('/api/teams').then(({ teams }) => teams);

const fields = [
  { key: 'name', label: 'Team' },
  { key: 'mascot', label: 'Mascot' },
  { key: 'members', label: 'Members' },
];

export default function Teams() {
  return <CapabilityCard title="Teams" description="Manage teams and members." load={loadTeams} emptyMessage="No teams yet." fields={fields} />;
}
