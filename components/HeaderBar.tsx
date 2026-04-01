"use client";

import { useState, useRef, useEffect } from 'react';
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
  Moon,
  Upload,
  FolderUp,
  FolderPlus,
  CheckSquare,
  RefreshCcw,
  LogOut,
  SortAsc,
  ArrowDownAZ,
  ArrowDownWideNarrow,
  Clock,
  FileType,
  X,
} from 'lucide-react';
import type { BucketConfig } from '@/lib/credentials';

export type SortField = "name" | "size" | "date" | "type";
export type SortDirection = "asc" | "desc";

interface HeaderBarProps {
  currentPath: string;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onNavigateHome: () => void;
  buckets: BucketConfig[];
  currentBucket: string;
  onBucketChange: (id: string) => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onNewFolder: () => void;
  onUploadFile: () => void;
  onUploadFolder: (files: File[]) => void;
  onSelectAll: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function HeaderBar({
  currentPath,
  viewMode,
  onViewModeChange,
  onNavigateHome,
  buckets,
  currentBucket,
  onBucketChange,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  onNewFolder,
  onUploadFile,
  onUploadFolder,
  onSelectAll,
  onRefresh,
  onLogout,
}: HeaderBarProps) {
  const { theme, setTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSortSubmenu, setShowSortSubmenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowSortSubmenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const toggleSearch = () => {
    if (showSearch) {
      onSearchChange("");
      setShowSearch(false);
    } else {
      setShowSearch(true);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onSearchChange("");
      setShowSearch(false);
    }
  };

  const handleFolderUpload = () => {
    folderInputRef.current?.click();
  };

  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      onUploadFolder(Array.from(fileList));
    }
    e.target.value = "";
  };

  const sortOptions: { field: SortField; label: string; icon: React.ReactNode }[] = [
    { field: "name", label: "Name", icon: <ArrowDownAZ size={15} /> },
    { field: "size", label: "Size", icon: <ArrowDownWideNarrow size={15} /> },
    { field: "date", label: "Date Modified", icon: <Clock size={15} /> },
    { field: "type", label: "Type", icon: <FileType size={15} /> },
  ];

  return (
    <header className="h-12 bg-[var(--gnome-bg-header)] border-b border-[var(--gnome-border)] flex items-center px-2 gap-1">
      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        onChange={handleFolderSelected}
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        multiple
      />

      {/* Back/Forward buttons */}
      <button
        className="gnome-button-icon"
        onClick={onBack}
        disabled={!canGoBack}
        title="Back"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        className="gnome-button-icon"
        onClick={onForward}
        disabled={!canGoForward}
        title="Forward"
      >
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

      {/* Spacer - always present to keep right icons fixed */}
      <div className="flex-1 flex items-center">
        {showSearch && (
          <div className="flex items-center ml-auto mr-2 w-full max-w-md relative">
            <Search size={16} className="absolute left-3 text-[var(--gnome-text-secondary)] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full rounded bg-[var(--gnome-bg-sidebar)] border border-[var(--gnome-border)] text-sm text-[var(--gnome-text-primary)] placeholder:text-[var(--gnome-text-secondary)] focus:outline-none focus:border-[var(--gnome-accent-blue)]"
              style={{ paddingLeft: 36, paddingRight: 32, paddingTop: 6, paddingBottom: 6 }}
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              className="absolute right-2 text-[var(--gnome-text-secondary)] hover:text-[var(--gnome-text-primary)]"
              onClick={toggleSearch}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Search toggle */}
      <button
        className={`gnome-button-icon ${showSearch ? 'bg-[var(--gnome-accent-blue)] text-white' : ''}`}
        onClick={toggleSearch}
        title="Search"
      >
        <Search size={18} />
      </button>

      {/* View switcher */}
      <div className="flex border border-[var(--gnome-border)] rounded">
        <button
          className="gnome-button-icon"
          style={viewMode === 'list' ? { background: 'var(--gnome-accent-blue)', color: 'white' } : {}}
          onClick={() => onViewModeChange('list')}
          title="List view"
        >
          <List size={18} />
        </button>
        <button
          className="gnome-button-icon"
          style={viewMode === 'grid' ? { background: 'var(--gnome-accent-blue)', color: 'white' } : {}}
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

      {/* Hamburger Menu */}
      <div className="relative" ref={menuRef}>
        <button
          className={`gnome-button-icon ${showMenu ? 'bg-[var(--gnome-bg-hover)]' : ''}`}
          onClick={() => { setShowMenu(!showMenu); setShowSortSubmenu(false); }}
          title="Menu"
        >
          <Menu size={18} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded-lg shadow-2xl z-[60] py-1 min-w-[200px]">
            <button
              onClick={() => { onNewFolder(); setShowMenu(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <FolderPlus size={16} />
              New Folder
            </button>

            <div className="h-px bg-[var(--gnome-border)] my-1" />

            <button
              onClick={() => { onUploadFile(); setShowMenu(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <Upload size={16} />
              Upload Files
            </button>

            <button
              onClick={() => { handleFolderUpload(); setShowMenu(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <FolderUp size={16} />
              Upload Folder
            </button>

            <div className="h-px bg-[var(--gnome-border)] my-1" />

            <button
              onClick={() => { onSelectAll(); setShowMenu(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <CheckSquare size={16} />
              Select All
              <span className="ml-auto text-xs text-[var(--gnome-text-secondary)]">Ctrl+A</span>
            </button>

            {/* Sort submenu */}
            <div
              className="relative"
              onMouseEnter={() => setShowSortSubmenu(true)}
              onMouseLeave={() => setShowSortSubmenu(false)}
            >
              <button
                onClick={() => setShowSortSubmenu(!showSortSubmenu)}
                className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
              >
                <SortAsc size={16} />
                Sort By
                <ChevronLeft size={14} className="ml-auto" />
              </button>

              {showSortSubmenu && (
                <div className="absolute right-full top-0 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded-lg shadow-2xl z-[70] py-1 min-w-[180px]">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.field}
                      onClick={() => {
                        const newDir = sortField === opt.field && sortDirection === "asc" ? "desc" : "asc";
                        onSortChange(opt.field, newDir);
                        setShowMenu(false);
                        setShowSortSubmenu(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] ${
                        sortField === opt.field ? 'text-[var(--gnome-accent-blue)]' : 'text-[var(--gnome-text-primary)]'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                      {sortField === opt.field && (
                        <span className="ml-auto text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-[var(--gnome-border)] my-1" />

            <button
              onClick={() => { onRefresh(); setShowMenu(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <div className="h-px bg-[var(--gnome-border)] my-1" />

            <button
              onClick={() => { onLogout(); setShowMenu(false); }}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm hover:bg-[var(--gnome-bg-hover)] text-red-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
