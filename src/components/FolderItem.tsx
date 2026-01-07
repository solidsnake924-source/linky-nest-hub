import { useState } from 'react';
import { 
  FolderOpen, 
  Folder as FolderIcon, 
  ChevronRight,
  ChevronDown,
  Plus, 
  Trash2,
  MoreVertical,
  Pencil,
  Palette
} from 'lucide-react';
import { Folder } from '@/types/links';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ColorPicker } from './ColorPicker';

interface FolderItemProps {
  folder: Folder;
  selectedFolderId: string | null;
  depth?: number;
  onSelectFolder: (folderId: string) => void;
  onAddSubfolder: (parentId: string, name: string, color: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onUpdateColor: (folderId: string, color: string) => void;
  onToggleFolder: (folderId: string) => void;
}

export function FolderItem({
  folder,
  selectedFolderId,
  depth = 0,
  onSelectFolder,
  onAddSubfolder,
  onDeleteFolder,
  onRenameFolder,
  onUpdateColor,
  onToggleFolder,
}: FolderItemProps) {
  const [isAddingSubfolder, setIsAddingSubfolder] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState('');
  const [newSubfolderColor, setNewSubfolderColor] = useState('#6b7280');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const [isChangingColor, setIsChangingColor] = useState(false);
  const [tempColor, setTempColor] = useState(folder.color || '#6b7280');

  const isSelected = selectedFolderId === folder.id;
  const hasSubfolders = folder.subfolders.length > 0;
  const totalLinks = folder.links.length + folder.subfolders.reduce((acc, sf) => acc + sf.links.length, 0);

  const handleAddSubfolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubfolderName.trim()) {
      onAddSubfolder(folder.id, newSubfolderName.trim(), newSubfolderColor);
      setNewSubfolderName('');
      setNewSubfolderColor('#6b7280');
      setIsAddingSubfolder(false);
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameFolder(folder.id, renameValue.trim());
      setIsRenaming(false);
    }
  };

  const handleColorChange = () => {
    onUpdateColor(folder.id, tempColor);
    setIsChangingColor(false);
  };

  return (
    <>
      <div className="group relative" style={{ paddingLeft: `${depth * 16}px` }}>
        <div className="flex items-center">
          {/* Expand/Collapse button */}
          {hasSubfolders ? (
            <button
              onClick={() => onToggleFolder(folder.id)}
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {folder.isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Folder button */}
          <button
            onClick={() => onSelectFolder(folder.id)}
            className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              isSelected
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-secondary'
            }`}
          >
            {isSelected ? (
              <FolderOpen className="h-4 w-4" style={{ color: folder.color }} />
            ) : (
              <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
            )}
            <span className="truncate flex-1 text-left">{folder.name}</span>
            <span className="text-xs text-muted-foreground">{totalLinks}</span>
          </button>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setIsAddingSubfolder(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Sous-dossier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setRenameValue(folder.name);
                  setIsRenaming(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setTempColor(folder.color || '#6b7280');
                  setIsChangingColor(true);
                }}
              >
                <Palette className="mr-2 h-4 w-4" />
                Couleur
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

        {/* Subfolders */}
        {hasSubfolders && folder.isExpanded && (
          <div className="mt-0.5">
            {folder.subfolders.map((subfolder) => (
              <FolderItem
                key={subfolder.id}
                folder={subfolder}
                selectedFolderId={selectedFolderId}
                depth={depth + 1}
                onSelectFolder={onSelectFolder}
                onAddSubfolder={onAddSubfolder}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
                onUpdateColor={onUpdateColor}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add subfolder dialog */}
      <Dialog open={isAddingSubfolder} onOpenChange={setIsAddingSubfolder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau sous-dossier dans "{folder.name}"</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubfolder} className="space-y-4">
            <Input
              value={newSubfolderName}
              onChange={(e) => setNewSubfolderName(e.target.value)}
              placeholder="Nom du sous-dossier"
              autoFocus
            />
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Couleur
              </label>
              <ColorPicker value={newSubfolderColor} onChange={setNewSubfolderColor} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddingSubfolder(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
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
              <Button type="button" variant="outline" onClick={() => setIsRenaming(false)}>
                Annuler
              </Button>
              <Button type="submit">Renommer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Color dialog */}
      <Dialog open={isChangingColor} onOpenChange={setIsChangingColor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer la couleur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ColorPicker value={tempColor} onChange={setTempColor} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsChangingColor(false)}>
                Annuler
              </Button>
              <Button onClick={handleColorChange}>Appliquer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
