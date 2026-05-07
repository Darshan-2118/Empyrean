// Static node configuration — single source of truth.
// Used by admin pages, seed script, and map components.

export interface NodeConfig {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'inactive';
}

export const NODES: NodeConfig[] = [
  {
    id: 'node1',
    name: 'RRCE',
    location: 'R.R. College of Engineering, Bangalore',
    coordinates: { lat: 12.88705, lng: 77.450153 },
    status: 'active',
  },
  {
    id: 'node2',
    name: 'RRDCH',
    location: 'RR Dental College & Hospital, Bangalore',
    coordinates: { lat: 12.8767, lng: 77.4475 },
    status: 'active',
  },
  {
    id: 'node3',
    name: 'RRMCH',
    location: 'RR Medical College & Hospital, Bangalore',
    coordinates: { lat: 12.896255, lng: 77.461852 },
    status: 'active',
  },
];

export const NODE_IDS = NODES.map((n) => n.id);
