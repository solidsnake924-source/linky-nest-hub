import { Header } from '@/components/Header';
import { FolderSection } from '@/components/FolderSection';
import { AddFolderDialog } from '@/components/AddFolderDialog';
import { useLinks } from '@/hooks/useLinks';
import { FolderOpen, Link2 } from 'lucide-react';

const Index = () => {
  const {
    folders,
    addFolder,
    deleteFolder,
    renameFolder,
    toggleFolder,
    addLink,
    deleteLink,
  } = useLinks();

  const totalLinks = folders.reduce((acc, f) => acc + f.links.length, 0);

  return (
    <div className="min-h-screen gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              <span>{folders.length} dossiers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <span>{totalLinks} liens</span>
            </div>
          </div>
          <AddFolderDialog onAdd={addFolder} />
        </div>

        {/* Folders */}
        <div className="space-y-4">
          {folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-16 text-center animate-fade-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Aucun dossier
              </h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Créez votre premier dossier pour commencer à organiser vos liens
              </p>
              <AddFolderDialog onAdd={addFolder} />
            </div>
          ) : (
            folders.map((folder) => (
              <FolderSection
                key={folder.id}
                folder={folder}
                onToggle={() => toggleFolder(folder.id)}
                onDelete={() => deleteFolder(folder.id)}
                onRename={(newName) => renameFolder(folder.id, newName)}
                onAddLink={(link) => addLink(folder.id, link)}
                onDeleteLink={(linkId) => deleteLink(folder.id, linkId)}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Vos liens sont sauvegardés localement dans votre navigateur</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
