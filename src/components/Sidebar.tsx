import { useState } from 'react';
import { 
  FolderOpen, 
  Folder as FolderIcon, 
  Plus, 
  ChevronRight,
  HardDrive,
  Clock,
  Star,
  Trash2,
  MoreVertical,
  Pencil
} from 'lucide-react';
import { Folder } from '@/types/links';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
}

export function Sidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
}: SidebarProps) {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingFolder && renameValue.trim()) {
      onRenameFolder(renamingFolder.id, renameValue.trim());
      setRenamingFolder(null);
      setRenameValue('');
    }
  };

  const totalLinks = folders.reduce((acc, f) => acc + f.links.length, 0);

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
              <div key={folder.id} className="group relative">
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {selectedFolderId === folder.id ? (
                    <FolderOpen className="h-5 w-5 text-primary" />
                  ) : (
                    <FolderIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="truncate flex-1 text-left">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">{folder.links.length}</span>
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem 
                      onClick={() => {
                        setRenamingFolder(folder);
                        setRenameValue(folder.name);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Renommer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteFolder(folder.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddingFolder(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename folder dialog */}
      <Dialog open={!!renamingFolder} onOpenChange={() => setRenamingFolder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Nouveau nom"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRenamingFolder(null)}>
                Annuler
              </Button>
              <Button type="submit">Renommer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
