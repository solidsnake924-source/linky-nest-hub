import { useState } from 'react';
import { ExternalLink, Trash2, Pencil, X, Check, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Link } from '@/types/links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LinkPreviewProps {
  link: Link;
  onDelete: () => void;
  onUpdate: (updates: Partial<Link>) => void;
}

export function LinkPreview({ link, onDelete, onUpdate }: LinkPreviewProps) {
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

  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 animate-fade-in overflow-hidden ${
        isExpanded ? 'col-span-full' : ''
      }`}
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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-medium text-foreground truncate text-sm">
              {link.title}
            </span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
                title="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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
