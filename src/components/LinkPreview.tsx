import { useState } from 'react';
import { ExternalLink, Trash2, Pencil, X, Check, Maximize2, Minimize2, RefreshCw, MoreVertical, Folder } from 'lucide-react';
import { Link } from '@/types/links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LinkPreviewProps {
  link: Link;
  folderName?: string;
  folderColor?: string;
  viewMode?: 'grid' | 'list';
  onDelete: () => void;
  onUpdate: (updates: Partial<Link>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function LinkPreview({ 
  link, 
  folderName, 
  folderColor, 
  viewMode = 'grid', 
  onDelete, 
  onUpdate,
  isSelected,
  onSelect,
}: LinkPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editDescription, setEditDescription] = useState(link.description || '');
  const [iframeKey, setIframeKey] = useState(0);

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      url: editUrl,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditDescription(link.description || '');
    setIsEditing(false);
  };

  const refreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // List view
  if (viewMode === 'list') {
    return (
      <div 
        className={`group flex items-center gap-4 p-3 pl-10 rounded-lg border transition-colors ${
          isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-card hover:bg-secondary/30'
        }`}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            onSelect?.();
          }
        }}
      >
        {/* Favicon */}
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {getFaviconUrl(link.url) ? (
            <img 
              src={getFaviconUrl(link.url)!} 
              alt="" 
              className="w-5 h-5"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          ) : (
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{link.title}</h3>
            {folderName && (
              <span 
                className="text-xs text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ backgroundColor: `${folderColor}20` }}
              >
                <Folder className="w-3 h-3" style={{ color: folderColor }} />
                {folderName}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`group relative flex flex-col rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border bg-card hover:border-primary/20'
      } ${isExpanded ? 'col-span-2 md:col-span-3 lg:col-span-4' : ''}`}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          onSelect?.();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/30 px-3 py-2">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-7 text-sm font-medium"
            placeholder="Titre"
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1 pl-6">
            {getFaviconUrl(link.url) && (
              <img 
                src={getFaviconUrl(link.url)!} 
                alt="" 
                className="w-4 h-4 shrink-0"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            )}
            <span className="font-medium text-foreground truncate text-sm">
              {link.title}
            </span>
            {folderName && (
              <span 
                className="text-xs text-muted-foreground px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0"
                style={{ backgroundColor: `${folderColor}20` }}
              >
                <Folder className="w-3 h-3" style={{ color: folderColor }} />
                {folderName}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={handleSave}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleCancel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={refreshIframe}
                title="Rafraîchir"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Réduire' : 'Agrandir'}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div className="border-b border-border bg-secondary/20 px-3 py-2 space-y-2">
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="h-8 text-xs"
            placeholder="URL"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="text-xs min-h-[60px] resize-none"
            placeholder="Description (optionnel)"
          />
        </div>
      )}

      {/* Iframe preview */}
      <div className={`relative bg-background ${isExpanded ? 'h-[600px]' : 'h-[280px]'}`}>
        <iframe
          key={iframeKey}
          src={link.url}
          title={link.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
        />
        {/* Fallback overlay for sites that block iframes */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-card/10 to-transparent" />
      </div>

      {/* URL footer */}
      <div className="px-3 py-1.5 bg-secondary/20 border-t border-border">
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
        {link.description && !isEditing && (
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {link.description}
          </p>
        )}
      </div>

    </div>
  );
}
