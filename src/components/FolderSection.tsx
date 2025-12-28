import { ChevronDown, ChevronRight, FolderOpen, Folder as FolderIcon, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Folder, Link } from '@/types/links';
import { LinkCard } from './LinkCard';
import { AddLinkDialog } from './AddLinkDialog';
import { Button } from '@/components/ui/button';
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

interface FolderSectionProps {
  folder: Folder;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onAddLink: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  onDeleteLink: (linkId: string) => void;
}

export function FolderSection({
  folder,
  onToggle,
  onDelete,
  onRename,
  onAddLink,
  onDeleteLink,
}: FolderSectionProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/50">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span className="text-muted-foreground transition-transform duration-200">
            {folder.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
          {folder.isExpanded ? (
            <FolderOpen className="h-5 w-5 text-primary" />
          ) : (
            <FolderIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground">{folder.name}</span>
          <span className="text-sm text-muted-foreground">
            ({folder.links.length})
          </span>
        </button>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <AddLinkDialog onAdd={onAddLink} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {folder.isExpanded && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-4">
          {folder.links.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucun lien dans ce dossier
            </p>
          ) : (
            folder.links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={() => onDeleteLink(link.id)}
              />
            ))
          )}
        </div>
      )}

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
            className="space-y-4"
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du dossier"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenaming(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Renommer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
