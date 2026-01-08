import { useState, useMemo } from 'react';
import { Plus, FolderOpen, Check, X, Move, Search } from 'lucide-react';
import { Folder, Link } from '@/types/links';
import { LinkPreview } from './LinkPreview';
import { Button } from '@/components/ui/button';
import { AddLinkDialog } from './AddLinkDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LinkGridProps {
  folders: Folder[];
  selectedFolderId: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onAddLink: (folderId: string, link: Omit<Link, 'id' | 'createdAt'>) => void;
  onDeleteLink: (folderId: string, linkId: string) => void;
  onUpdateLink: (folderId: string, linkId: string, updates: Partial<Link>) => void;
  onMoveLinks: (linkIds: string[], sourceFolderId: string, targetFolderId: string) => void;
  allFolders: Folder[];
}

// Get all links from folder and its subfolders recursively
const getLinksFromFolder = (folder: Folder): { link: Link; folderId: string; folderName: string; folderColor?: string }[] => {
  const result: { link: Link; folderId: string; folderName: string; folderColor?: string }[] = [];
  
  folder.links.forEach(link => {
    result.push({ link, folderId: folder.id, folderName: folder.name, folderColor: folder.color });
  });
  
  folder.subfolders.forEach(subfolder => {
    result.push(...getLinksFromFolder(subfolder));
  });
  
  return result;
};

// Get all links from all folders
const getAllLinksFromFolders = (folders: Folder[]): { link: Link; folderId: string; folderName: string; folderColor?: string }[] => {
  const result: { link: Link; folderId: string; folderName: string; folderColor?: string }[] = [];
  folders.forEach(folder => {
    result.push(...getLinksFromFolder(folder));
  });
  return result;
};

// Find folder by ID recursively
const findFolderById = (folders: Folder[], id: string): Folder | null => {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const found = findFolderById(folder.subfolders, id);
    if (found) return found;
  }
  return null;
};

// Render folder tree for move dialog
function FolderTree({ 
  folders, 
  selectedId, 
  onSelect, 
  excludeId,
  depth = 0,
  searchQuery = ''
}: { 
  folders: Folder[]; 
  selectedId: string | null; 
  onSelect: (id: string) => void; 
  excludeId?: string;
  depth?: number;
  searchQuery?: string;
}) {
  // Filter folders based on search query
  const filteredFolders = folders.filter(f => {
    if (f.id === excludeId) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    // Check if folder name matches or any subfolder matches
    const nameMatches = f.name.toLowerCase().includes(query);
    const hasMatchingSubfolder = f.subfolders.some(sf => 
      sf.name.toLowerCase().includes(query)
    );
    return nameMatches || hasMatchingSubfolder;
  });

  return (
    <div className="space-y-0.5">
      {filteredFolders.map((folder) => (
        <div key={folder.id}>
          <button
            onClick={() => onSelect(folder.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              selectedId === folder.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-secondary'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <FolderOpen className="h-4 w-4" style={{ color: folder.color }} />
            <span className="truncate">{folder.name}</span>
          </button>
          {folder.subfolders.length > 0 && (
            <FolderTree
              folders={folder.subfolders}
              selectedId={selectedId}
              onSelect={onSelect}
              excludeId={excludeId}
              depth={depth + 1}
              searchQuery={searchQuery}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function LinkGrid({
  folders,
  selectedFolderId,
  searchQuery,
  viewMode,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
  onMoveLinks,
  allFolders,
}: LinkGridProps) {
  const [selectedLinks, setSelectedLinks] = useState<Map<string, string>>(new Map()); // linkId -> folderId
  const [isMoving, setIsMoving] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [folderSearchQuery, setFolderSearchQuery] = useState('');

  const selectedFolder = selectedFolderId
    ? findFolderById(folders, selectedFolderId)
    : null;

  // Get links based on selection and search
  const getFilteredLinks = () => {
    let linksWithFolder: { link: Link; folderId: string; folderName: string; folderColor?: string }[] = [];

    if (selectedFolder) {
      linksWithFolder = getLinksFromFolder(selectedFolder);
    } else {
      linksWithFolder = getAllLinksFromFolders(folders);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      linksWithFolder = linksWithFolder.filter(
        ({ link }) =>
          link.title.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query) ||
          link.description?.toLowerCase().includes(query)
      );
    }

    return linksWithFolder;
  };

  const filteredLinks = getFilteredLinks();

  const toggleLinkSelection = (linkId: string, folderId: string) => {
    setSelectedLinks(prev => {
      const next = new Map(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.set(linkId, folderId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const next = new Map<string, string>();
    filteredLinks.forEach(({ link, folderId }) => {
      next.set(link.id, folderId);
    });
    setSelectedLinks(next);
  };

  const clearSelection = () => {
    setSelectedLinks(new Map());
  };

  const handleMove = () => {
    if (!targetFolderId) return;
    
    // Group links by source folder
    const linksByFolder = new Map<string, string[]>();
    selectedLinks.forEach((folderId, linkId) => {
      if (!linksByFolder.has(folderId)) {
        linksByFolder.set(folderId, []);
      }
      linksByFolder.get(folderId)!.push(linkId);
    });

    // Move links from each source folder
    linksByFolder.forEach((linkIds, sourceFolderId) => {
      if (sourceFolderId !== targetFolderId) {
        onMoveLinks(linkIds, sourceFolderId, targetFolderId);
      }
    });

    setSelectedLinks(new Map());
    setIsMoving(false);
    setTargetFolderId(null);
  };

  const isSelectionMode = selectedLinks.size > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {selectedFolder && (
            <div 
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: selectedFolder.color }}
            />
          )}
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-medium text-foreground">
            {selectedFolder ? selectedFolder.name : 'Tous les liens'}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({filteredLinks.length} {filteredLinks.length > 1 ? 'liens' : 'lien'})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedLinks.size} sélectionné(s)
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsMoving(true)}>
                <Move className="h-4 w-4 mr-2" />
                Déplacer
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            selectedFolder && (
              <AddLinkDialog onAdd={(link) => onAddLink(selectedFolder.id, link)} />
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center">
              <FolderOpen className="w-24 h-24 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucun lien'}
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery 
                ? `Aucun lien ne correspond à "${searchQuery}"`
                : selectedFolder 
                  ? 'Ajoutez des liens pour commencer à les organiser'
                  : 'Sélectionnez un dossier et ajoutez des liens'
              }
            </p>
            {selectedFolder && !searchQuery && (
              <AddLinkDialog onAdd={(link) => onAddLink(selectedFolder.id, link)} />
            )}
          </div>
        ) : (
          <div 
            className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredLinks.map(({ link, folderId, folderName, folderColor }) => (
              <div key={link.id} className="relative">
                {/* Selection checkbox */}
                <div 
                  className={`absolute top-2 left-2 z-10 transition-opacity ${
                    isSelectionMode ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                  }`}
                >
                  <Checkbox
                    checked={selectedLinks.has(link.id)}
                    onCheckedChange={() => toggleLinkSelection(link.id, folderId)}
                    className="bg-background border-2"
                  />
                </div>
                <LinkPreview
                  link={link}
                  folderName={!selectedFolder ? folderName : undefined}
                  folderColor={folderColor}
                  viewMode={viewMode}
                  onDelete={() => onDeleteLink(folderId, link.id)}
                  onUpdate={(updates) => onUpdateLink(folderId, link.id, updates)}
                  isSelected={selectedLinks.has(link.id)}
                  onSelect={() => toggleLinkSelection(link.id, folderId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move dialog */}
      <Dialog open={isMoving} onOpenChange={(open) => {
        setIsMoving(open);
        if (!open) setFolderSearchQuery('');
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Déplacer {selectedLinks.size} lien(s)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un dossier..."
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64 border border-border rounded-lg p-2">
              <FolderTree
                folders={folders}
                selectedId={targetFolderId}
                onSelect={setTargetFolderId}
                searchQuery={folderSearchQuery}
              />
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMoving(false)}>
                Annuler
              </Button>
              <Button onClick={handleMove} disabled={!targetFolderId}>
                Déplacer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
