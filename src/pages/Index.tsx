import { useState } from 'react';
import { DriveHeader } from '@/components/DriveHeader';
import { Sidebar } from '@/components/Sidebar';
import { LinkGrid } from '@/components/LinkGrid';
import { useLinks } from '@/hooks/useLinks';

const Index = () => {
  const {
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
    flattenFolders,
  } = useLinks();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="h-screen flex flex-col bg-background">
      <DriveHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onAddFolder={addFolder}
          onDeleteFolder={deleteFolder}
          onRenameFolder={renameFolder}
          onUpdateFolderColor={updateFolderColor}
          onToggleFolder={toggleFolder}
        />
        
        <LinkGrid
          folders={folders}
          selectedFolderId={selectedFolderId}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onAddLink={addLink}
          onDeleteLink={deleteLink}
          onUpdateLink={updateLink}
          onMoveLinks={moveLinks}
          allFolders={flattenFolders()}
        />
      </div>
    </div>
  );
};

export default Index;
