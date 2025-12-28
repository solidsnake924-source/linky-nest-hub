import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Folder, Link } from '@/types/links';
import { LinkPreview } from './LinkPreview';
import { Button } from '@/components/ui/button';
import { AddLinkDialog } from './AddLinkDialog';

interface LinkGridProps {
  folders: Folder[];
  selectedFolderId: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onAddLink: (folderId: string, link: Omit<Link, 'id' | 'createdAt'>) => void;
  onDeleteLink: (folderId: string, linkId: string) => void;
  onUpdateLink: (folderId: string, linkId: string, updates: Partial<Link>) => void;
}

export function LinkGrid({
  folders,
  selectedFolderId,
  searchQuery,
  viewMode,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
}: LinkGridProps) {
  const selectedFolder = selectedFolderId 
    ? folders.find(f => f.id === selectedFolderId) 
    : null;

  // Get links based on selection and search
  const getFilteredLinks = () => {
    let linksWithFolder: { link: Link; folderId: string; folderName: string }[] = [];

    if (selectedFolder) {
      linksWithFolder = selectedFolder.links.map(link => ({
        link,
        folderId: selectedFolder.id,
        folderName: selectedFolder.name,
      }));
    } else {
      folders.forEach(folder => {
        folder.links.forEach(link => {
          linksWithFolder.push({
            link,
            folderId: folder.id,
            folderName: folder.name,
          });
        });
      });
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-medium text-foreground">
            {selectedFolder ? selectedFolder.name : 'Tous les liens'}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({filteredLinks.length} {filteredLinks.length > 1 ? 'liens' : 'lien'})
          </span>
        </div>
        
        {selectedFolder && (
          <AddLinkDialog onAdd={(link) => onAddLink(selectedFolder.id, link)} />
        )}
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
            {filteredLinks.map(({ link, folderId, folderName }) => (
              <LinkPreview
                key={link.id}
                link={link}
                folderName={!selectedFolder ? folderName : undefined}
                viewMode={viewMode}
                onDelete={() => onDeleteLink(folderId, link.id)}
                onUpdate={(updates) => onUpdateLink(folderId, link.id, updates)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
