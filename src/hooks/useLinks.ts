import { useState, useEffect } from 'react';
import { Folder, Link } from '@/types/links';

const STORAGE_KEY = 'link-hub-folders';

const defaultFolders: Folder[] = [
  {
    id: '1',
    name: 'Favoris',
    color: '#3b82f6',
    isExpanded: true,
    createdAt: Date.now(),
    subfolders: [],
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
    color: '#22c55e',
    isExpanded: false,
    createdAt: Date.now(),
    subfolders: [],
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

// Helper to find folder by ID in nested structure
const findFolderById = (folders: Folder[], id: string): Folder | null => {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const found = findFolderById(folder.subfolders, id);
    if (found) return found;
  }
  return null;
};

// Helper to update folder in nested structure
const updateFolderInTree = (
  folders: Folder[],
  folderId: string,
  updater: (folder: Folder) => Folder
): Folder[] => {
  return folders.map((folder) => {
    if (folder.id === folderId) {
      return updater(folder);
    }
    return {
      ...folder,
      subfolders: updateFolderInTree(folder.subfolders, folderId, updater),
    };
  });
};

// Helper to delete folder from nested structure
const deleteFolderFromTree = (folders: Folder[], folderId: string): Folder[] => {
  return folders
    .filter((folder) => folder.id !== folderId)
    .map((folder) => ({
      ...folder,
      subfolders: deleteFolderFromTree(folder.subfolders, folderId),
    }));
};

// Helper to get all links from all folders recursively
const getAllLinks = (folders: Folder[]): { link: Link; folderId: string; folderName: string; folderColor?: string }[] => {
  const result: { link: Link; folderId: string; folderName: string; folderColor?: string }[] = [];
  
  const traverse = (folders: Folder[]) => {
    for (const folder of folders) {
      for (const link of folder.links) {
        result.push({ link, folderId: folder.id, folderName: folder.name, folderColor: folder.color });
      }
      traverse(folder.subfolders);
    }
  };
  
  traverse(folders);
  return result;
};

// Helper to get folder path
const getFolderPath = (folders: Folder[], targetId: string, path: Folder[] = []): Folder[] | null => {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return [...path, folder];
    }
    const found = getFolderPath(folder.subfolders, targetId, [...path, folder]);
    if (found) return found;
  }
  return null;
};

// Helper to flatten all folders for easy lookup
const flattenFolders = (folders: Folder[]): Folder[] => {
  const result: Folder[] = [];
  const traverse = (folders: Folder[]) => {
    for (const folder of folders) {
      result.push(folder);
      traverse(folder.subfolders);
    }
  };
  traverse(folders);
  return result;
};

export function useLinks() {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: add subfolders array if missing
      const migrate = (folders: Folder[]): Folder[] => {
        return folders.map(f => ({
          ...f,
          subfolders: f.subfolders ? migrate(f.subfolders) : [],
          color: f.color || '#6b7280',
        }));
      };
      return migrate(parsed);
    }
    return defaultFolders;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  const addFolder = (name: string, parentId?: string, color?: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      color: color || '#6b7280',
      links: [],
      subfolders: [],
      isExpanded: true,
      createdAt: Date.now(),
      parentId,
    };

    if (parentId) {
      setFolders((prev) =>
        updateFolderInTree(prev, parentId, (folder) => ({
          ...folder,
          subfolders: [...folder.subfolders, newFolder],
          isExpanded: true,
        }))
      );
    } else {
      setFolders((prev) => [...prev, newFolder]);
    }
  };

  const deleteFolder = (folderId: string) => {
    setFolders((prev) => deleteFolderFromTree(prev, folderId));
  };

  const renameFolder = (folderId: string, newName: string) => {
    setFolders((prev) =>
      updateFolderInTree(prev, folderId, (folder) => ({ ...folder, name: newName }))
    );
  };

  const updateFolderColor = (folderId: string, color: string) => {
    setFolders((prev) =>
      updateFolderInTree(prev, folderId, (folder) => ({ ...folder, color }))
    );
  };

  const toggleFolder = (folderId: string) => {
    setFolders((prev) =>
      updateFolderInTree(prev, folderId, (folder) => ({
        ...folder,
        isExpanded: !folder.isExpanded,
      }))
    );
  };

  const addLink = (folderId: string, link: Omit<Link, 'id' | 'createdAt'>) => {
    const newLink: Link = {
      ...link,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setFolders((prev) =>
      updateFolderInTree(prev, folderId, (folder) => ({
        ...folder,
        links: [...folder.links, newLink],
      }))
    );
  };

  const deleteLink = (folderId: string, linkId: string) => {
    setFolders((prev) =>
      updateFolderInTree(prev, folderId, (folder) => ({
        ...folder,
        links: folder.links.filter((l) => l.id !== linkId),
      }))
    );
  };

  const updateLink = (folderId: string, linkId: string, updates: Partial<Link>) => {
    setFolders((prev) =>
      updateFolderInTree(prev, folderId, (folder) => ({
        ...folder,
        links: folder.links.map((l) => (l.id === linkId ? { ...l, ...updates } : l)),
      }))
    );
  };

  const moveLinks = (
    linkIds: string[],
    sourceFolderId: string,
    targetFolderId: string
  ) => {
    setFolders((prev) => {
      // Get the links to move
      const sourceFolder = findFolderById(prev, sourceFolderId);
      if (!sourceFolder) return prev;

      const linksToMove = sourceFolder.links.filter((l) => linkIds.includes(l.id));
      if (linksToMove.length === 0) return prev;

      // Remove from source
      let updated = updateFolderInTree(prev, sourceFolderId, (folder) => ({
        ...folder,
        links: folder.links.filter((l) => !linkIds.includes(l.id)),
      }));

      // Add to target
      updated = updateFolderInTree(updated, targetFolderId, (folder) => ({
        ...folder,
        links: [...folder.links, ...linksToMove],
      }));

      return updated;
    });
  };

  return {
    folders,
    addFolder,
    deleteFolder,
    renameFolder,
    updateFolderColor,
    toggleFolder,
    addLink,
    deleteLink,
    updateLink,
    moveLinks,
    findFolderById: (id: string) => findFolderById(folders, id),
    getAllLinks: () => getAllLinks(folders),
    getFolderPath: (id: string) => getFolderPath(folders, id),
    flattenFolders: () => flattenFolders(folders),
  };
}
