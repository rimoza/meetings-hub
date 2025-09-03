'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { GlobalSearch } from '@/components/global-search';

export function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className="relative max-w-md flex-1 cursor-pointer"
        onClick={handleClick}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search meetings, tasks, contacts..."
          className="pl-10 pr-20 h-9 bg-muted/40 border-muted focus:bg-background transition-colors cursor-pointer"
          readOnly
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Badge 
            variant="secondary" 
            className="text-xs px-1.5 py-0.5 h-5 bg-muted-foreground/10 text-muted-foreground border-0"
          >
            <kbd className="font-mono">Ctrl</kbd>
            <kbd className="font-mono">K</kbd>
          </Badge>
        </div>
      </div>

      <GlobalSearch isOpen={isOpen} onClose={handleClose} />
    </>
  );
}