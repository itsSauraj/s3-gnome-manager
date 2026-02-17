"use client";

import { useTheme } from 'next-themes';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronDown,
  Search,
  List,
  Grid3x3,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import type { BucketConfig } from '@/lib/credentials';

interface HeaderBarProps {
  currentPath: string;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onNavigateHome: () => void;
  buckets: BucketConfig[];
  currentBucket: string;
  onBucketChange: (id: string) => void;
}

export default function HeaderBar({
  currentPath,
  viewMode,
  onViewModeChange,
  onNavigateHome,
  buckets,
  currentBucket,
  onBucketChange
}: HeaderBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-12 bg-[var(--gnome-bg-header)] border-b border-[var(--gnome-border)] flex items-center px-2 gap-1">
      {/* Back/Forward buttons */}
      <button className="gnome-button-icon" disabled title="Back">
        <ChevronLeft size={18} />
      </button>
      <button className="gnome-button-icon" disabled title="Forward">
        <ChevronRight size={18} />
      </button>

      {/* Location/Home button */}
      <button
        className="gnome-button flex items-center gap-2 px-3"
        onClick={onNavigateHome}
        title="Go to Home"
      >
        <Home size={16} />
        <span className="text-sm">Home</span>
        <ChevronDown size={14} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search icon (placeholder) */}
      <button className="gnome-button-icon" title="Search">
        <Search size={18} />
      </button>

      {/* View switcher */}
      <div className="flex border border-[var(--gnome-border)] rounded">
        <button
          className={`gnome-button-icon ${
            viewMode === 'list' ? 'bg-[var(--gnome-bg-selected)]' : ''
          }`}
          onClick={() => onViewModeChange('list')}
          title="List view"
        >
          <List size={18} />
        </button>
        <button
          className={`gnome-button-icon ${
            viewMode === 'grid' ? 'bg-[var(--gnome-bg-selected)]' : ''
          }`}
          onClick={() => onViewModeChange('grid')}
          title="Grid view"
        >
          <Grid3x3 size={18} />
        </button>
      </div>

      {/* Theme toggle */}
      <button
        className="gnome-button-icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Menu */}
      <button className="gnome-button-icon" title="Menu">
        <Menu size={18} />
      </button>
    </header>
  );
}
