import { useState, useEffect } from 'react';
import { Folder, Link } from '@/types/links';

const STORAGE_KEY = 'link-hub-folders';

const defaultFolders: Folder[] = [
  {
    id: '1',
    name: 'Favoris',
    isExpanded: true,
    createdAt: Date.now(),
    links: [
      {
        id: '1-1',
        title: 'Google',
        url: 'https://google.com',
        description: 'Moteur de recherche',
        createdAt: Date.now(),
      },
      {
        id: '1-2',
        title: 'GitHub',
        url: 'https://github.com',
        description: 'Plateforme de développement',
        createdAt: Date.now(),
      },
    ],
  },
  {
    id: '2',
    name: 'Travail',
    isExpanded: false,
    createdAt: Date.now(),
    links: [
      {
        id: '2-1',
        title: 'Notion',
        url: 'https://notion.so',
        description: 'Espace de travail collaboratif',
        createdAt: Date.now(),
      },
    ],
  },
];

export function useLinks() {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultFolders;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      links: [],
      isExpanded: true,
      createdAt: Date.now(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const deleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  const renameFolder = (folderId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
    );
  };

  const toggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
      )
    );
  };

  const addLink = (folderId: string, link: Omit<Link, 'id' | 'createdAt'>) => {
    const newLink: Link = {
      ...link,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, links: [...f.links, newLink] } : f
      )
    );
  };

  const deleteLink = (folderId: string, linkId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, links: f.links.filter((l) => l.id !== linkId) }
          : f
      )
    );
  };

  const updateLink = (folderId: string, linkId: string, updates: Partial<Link>) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              links: f.links.map((l) =>
                l.id === linkId ? { ...l, ...updates } : l
              ),
            }
          : f
      )
    );
  };

  return {
    folders,
    addFolder,
    deleteFolder,
    renameFolder,
    toggleFolder,
    addLink,
    deleteLink,
    updateLink,
  };
}
