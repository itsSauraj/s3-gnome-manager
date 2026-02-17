"use client";

import {
  Settings,
  HardDrive
} from 'lucide-react';

interface BucketConfig {
  id: string;
  name: string;
}

interface SidebarProps {
  buckets: BucketConfig[];
  currentBucket: string;
  onBucketChange: (bucketId: string) => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ buckets, currentBucket, onBucketChange, onOpenSettings }: SidebarProps) {
  return (
    <aside className="w-[200px] bg-[var(--gnome-bg-sidebar)] border-r border-[var(--gnome-border)] flex flex-col">
      {/* Buckets section */}
      <div className="flex-1 py-2 overflow-y-auto">
        <div className="px-3 py-1 text-xs font-semibold text-[var(--gnome-text-secondary)] uppercase">
          Buckets
        </div>
        {buckets.map((bucket) => {
          const isActive = bucket.id === currentBucket;
          return (
            <button
              key={bucket.id}
              onClick={() => onBucketChange(bucket.id)}
              className={`
                w-full px-3 py-1.5 flex items-center gap-2 text-sm transition-colors
                ${
                  isActive
                    ? 'bg-[var(--gnome-bg-selected)] text-[var(--gnome-accent-blue)]'
                    : 'hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]'
                }
              `}
              title={bucket.name}
            >
              <HardDrive size={16} />
              <span className="truncate">{bucket.name}</span>
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-px bg-[var(--gnome-border)] mx-2" />

      {/* Settings button at bottom */}
      <button
        onClick={onOpenSettings}
        className="px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] transition-colors text-[var(--gnome-text-primary)]"
      >
        <Settings size={16} />
        <span>Settings</span>
      </button>
    </aside>
  );
}
