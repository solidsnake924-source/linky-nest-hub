export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  links: Link[];
  subfolders: Folder[];
  isExpanded: boolean;
  createdAt: number;
  parentId?: string;
}

export const FOLDER_COLORS = [
  { name: 'Gris', value: '#6b7280' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
];
