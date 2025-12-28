import { useState } from 'react';
import { Search, X, Settings, HelpCircle, LayoutGrid, List, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DriveHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function DriveHeader({ 
  searchQuery, 
  onSearchChange,
  viewMode,
  onViewModeChange
}: DriveHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
          <Link2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-semibold text-foreground">LinkHub</span>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-2xl">
        <div 
          className={`relative flex items-center rounded-full transition-all ${
            isFocused 
              ? 'bg-card shadow-lg ring-1 ring-border' 
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          <Search className="h-5 w-5 text-muted-foreground absolute left-4" />
          <Input
            type="text"
            placeholder="Rechercher dans LinkHub"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="border-0 bg-transparent pl-12 pr-10 h-12 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 h-8 w-8 rounded-full"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <div className="flex items-center border border-border rounded-lg p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
