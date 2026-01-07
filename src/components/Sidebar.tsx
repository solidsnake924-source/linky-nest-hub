import { useState } from 'react';
import { 
  Plus, 
  HardDrive,
} from 'lucide-react';
import { Folder } from '@/types/links';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FolderItem } from './FolderItem';
import { ColorPicker } from './ColorPicker';

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddFolder: (name: string, parentId?: string, color?: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onUpdateFolderColor: (folderId: string, color: string) => void;
  onToggleFolder: (folderId: string) => void;
}

// Count all links recursively
const countAllLinks = (folders: Folder[]): number => {
  return folders.reduce((acc, folder) => {
    return acc + folder.links.length + countAllLinks(folder.subfolders);
  }, 0);
};

export function Sidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
  onUpdateFolderColor,
  onToggleFolder,
}: SidebarProps) {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6b7280');

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim(), undefined, newFolderColor);
      setNewFolderName('');
      setNewFolderColor('#6b7280');
      setIsAddingFolder(false);
    }
  };

  const handleAddSubfolder = (parentId: string, name: string, color: string) => {
    onAddFolder(name, parentId, color);
  };

  const totalLinks = countAllLinks(folders);

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      {/* New button */}
      <div className="p-3">
        <Button
          onClick={() => setIsAddingFolder(true)}
          className="w-full justify-start gap-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Nouveau</span>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1">
          {/* All links */}
          <button
            onClick={() => onSelectFolder(null)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFolderId === null
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-secondary'
            }`}
          >
            <HardDrive className="h-5 w-5" />
            <span>Tous les liens</span>
            <span className="ml-auto text-xs text-muted-foreground">{totalLinks}</span>
          </button>

          {/* Divider */}
          <div className="py-2">
            <div className="h-px bg-border" />
          </div>

          {/* Folders */}
          <div className="space-y-0.5">
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                selectedFolderId={selectedFolderId}
                onSelectFolder={onSelectFolder}
                onAddSubfolder={handleAddSubfolder}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
                onUpdateColor={onUpdateFolderColor}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Storage indicator */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <HardDrive className="h-4 w-4" />
          <span>Stockage local</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min((totalLinks / 100) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{totalLinks} liens sauvegardés</p>
      </div>

      {/* Add folder dialog */}
      <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFolder} className="space-y-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du dossier"
              autoFocus
            />
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Couleur
              </label>
              <ColorPicker value={newFolderColor} onChange={setNewFolderColor} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddingFolder(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
