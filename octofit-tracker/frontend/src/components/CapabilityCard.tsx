import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type DataRecord = Record<string, unknown>;
type State =
  | { status: 'loading' }
  | { status: 'success'; items: DataRecord[] }
  | { status: 'error'; message: string };
type Props = {
  title: string;
  description: string;
  endpoint: string;
  collectionKey: string;
  emptyMessage: string;
  fields: readonly { key: string; label: string }[];
};

function isRecord(value: unknown): value is DataRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

export function CapabilityCard({ title, description, endpoint, collectionKey, emptyMessage, fields }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    getJson<unknown>(endpoint)
      .then((response) => {
        if (!isRecord(response) || !Array.isArray(response[collectionKey]) || !response[collectionKey].every(isRecord)) {
          throw new Error('Unexpected response format');
        }
        if (active) setState({ status: 'success', items: response[collectionKey] });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });

    return () => {
      active = false;
    };
  }, [collectionKey, endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && state.items.length === 0 && <p>{emptyMessage}</p>}
        {state.status === 'success' && state.items.length > 0 && (
          <ul className="list-group">
            {state.items.map((item, index) => (
              <li className="list-group-item" key={String(item._id ?? index)}>
                {fields.map(({ key, label }) => {
                  const value = formatValue(item[key]);
                  return value ? <span className="me-3" key={key}><strong>{label}:</strong> {value}</span> : null;
                })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
