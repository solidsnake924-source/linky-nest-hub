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
  links: Link[];
  isExpanded: boolean;
  createdAt: number;
}
