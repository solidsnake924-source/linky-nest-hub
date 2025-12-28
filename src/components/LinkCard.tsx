import { ExternalLink, Trash2, Globe } from 'lucide-react';
import { Link } from '@/types/links';
import { Button } from '@/components/ui/button';

interface LinkCardProps {
  link: Link;
  onDelete: () => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(link.url);

  return (
    <div className="group relative flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/20 animate-fade-in">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="h-5 w-5"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <Globe className={`h-5 w-5 text-muted-foreground ${faviconUrl ? 'hidden' : ''}`} />
      </div>

      <div className="min-w-0 flex-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
        >
          <span className="truncate">{link.title}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
        </a>
        {link.description && (
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {link.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/60 truncate">
          {link.url}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
