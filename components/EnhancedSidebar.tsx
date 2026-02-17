"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Palette,
  Edit,
  Unplug,
  FolderInput,
  Trash2,
  FolderPlus,
  ChevronRight as ArrowRight,
} from "lucide-react";
import { CredentialsManager, type BucketConfig, type BucketGroup } from "@/lib/credentials";
import ColorPicker from "./ColorPicker";
import InputDialog from "./InputDialog";
import ConfirmDialog from "./ConfirmDialog";

interface EnhancedSidebarProps {
  buckets: BucketConfig[];
  currentBucket: string;
  onBucketChange: (bucketId: string) => void;
  onOpenSettings: () => void;
  onBucketUpdate: () => void;
}

type BucketContextMenu = {
  x: number;
  y: number;
  bucket: BucketConfig;
  showMoveToSubmenu?: boolean;
};

type GroupContextMenu = {
  x: number;
  y: number;
  group: BucketGroup;
};

export default function EnhancedSidebar({
  buckets,
  currentBucket,
  onBucketChange,
  onOpenSettings,
  onBucketUpdate,
}: EnhancedSidebarProps) {
  const [groups, setGroups] = useState<BucketGroup[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [bucketContextMenu, setBucketContextMenu] = useState<BucketContextMenu | null>(null);
  const [groupContextMenu, setGroupContextMenu] = useState<GroupContextMenu | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<{ type: 'bucket' | 'group'; id: string; currentColor?: string } | null>(null);
  const [showTitleEditor, setShowTitleEditor] = useState<BucketConfig | null>(null);
  const [showGroupNameEditor, setShowGroupNameEditor] = useState<BucketGroup | null>(null);
  const [confirmEject, setConfirmEject] = useState<BucketConfig | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<BucketGroup | null>(null);
  const [draggedBucket, setDraggedBucket] = useState<string | null>(null);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState<{ bucketId: string } | null>(null);

  useEffect(() => {
    setGroups(CredentialsManager.getGroups());
  }, [buckets]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (buckets[index]) {
          onBucketChange(buckets[index].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buckets, onBucketChange]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const ungroupedBuckets = buckets.filter((b) => !b.groupId);
  const groupedBuckets = groups.map((group) => ({
    group,
    buckets: buckets.filter((b) => b.groupId === group.id),
  }));

  const handleBucketContextMenu = (e: React.MouseEvent, bucket: BucketConfig) => {
    e.preventDefault();
    e.stopPropagation();
    setBucketContextMenu({ x: e.clientX, y: e.clientY, bucket });
    setGroupContextMenu(null);
  };

  const handleGroupContextMenu = (e: React.MouseEvent, group: BucketGroup) => {
    e.preventDefault();
    e.stopPropagation();
    setGroupContextMenu({ x: e.clientX, y: e.clientY, group });
    setBucketContextMenu(null);
  };

  const handleDragStart = (bucketId: string) => {
    setDraggedBucket(bucketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (groupId: string | undefined) => {
    if (draggedBucket) {
      CredentialsManager.updateBucketGroup(draggedBucket, groupId);
      onBucketUpdate();
      setDraggedBucket(null);
    }
  };

  const handleEject = () => {
    if (confirmEject) {
      CredentialsManager.removeBucket(confirmEject.id);
      onBucketUpdate();
      setConfirmEject(null);
    }
  };

  const handleMoveToGroup = (bucketId: string, groupId: string) => {
    CredentialsManager.updateBucketGroup(bucketId, groupId);
    onBucketUpdate();
    setBucketContextMenu(null);
  };

  const handleRemoveFromGroup = (bucketId: string) => {
    CredentialsManager.updateBucketGroup(bucketId, undefined);
    onBucketUpdate();
    setBucketContextMenu(null);
  };

  const handleCreateGroupAndMove = (groupName: string) => {
    if (showCreateGroupDialog) {
      const newGroup: BucketGroup = {
        id: `group-${Date.now()}`,
        name: groupName,
        color: "#3498db",
        order: groups.length,
      };
      CredentialsManager.addGroup(newGroup);
      CredentialsManager.updateBucketGroup(showCreateGroupDialog.bucketId, newGroup.id);
      setGroups(CredentialsManager.getGroups());
      onBucketUpdate();
      setShowCreateGroupDialog(null);
    }
  };

  const handleDeleteGroup = () => {
    if (confirmDeleteGroup) {
      CredentialsManager.removeGroup(confirmDeleteGroup.id);
      setGroups(CredentialsManager.getGroups());
      onBucketUpdate();
      setConfirmDeleteGroup(null);
    }
  };

  const renderBucket = (bucket: BucketConfig, index: number) => {
    const isActive = bucket.id === currentBucket;
    const shortcut = index < 9 ? `Ctrl+${index + 1}` : "";
    const displayName = bucket.customTitle || bucket.name;

    return (
      <div
        key={bucket.id}
        draggable
        onDragStart={() => handleDragStart(bucket.id)}
        onContextMenu={(e) => handleBucketContextMenu(e, bucket)}
        className={`
          w-full px-3 py-1.5 flex items-center gap-2 text-sm transition-colors cursor-pointer
          ${
            isActive
              ? "bg-[var(--gnome-bg-selected)] text-[var(--gnome-accent-blue)]"
              : `hover:bg-[var(--gnome-bg-hover)] ${!bucket.color ? "text-[var(--gnome-text-primary)]" : ""}`
          }
          ${draggedBucket === bucket.id ? "opacity-50" : ""}
        `}
        onClick={() => onBucketChange(bucket.id)}
        title={`${displayName}${shortcut ? ` (${shortcut})` : ""}`}
        style={bucket.color && !isActive ? { color: bucket.color } : undefined}
      >
        <HardDrive size={16} />

        <span className="flex-1 truncate">{displayName}</span>

        {shortcut && (
          <span className="text-xs text-[var(--gnome-text-secondary)]">{shortcut}</span>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className="w-[220px] bg-[var(--gnome-bg-sidebar)] border-r border-[var(--gnome-border)] flex flex-col">
        {/* Buckets section */}
        <div className="flex-1 py-2 overflow-y-auto">
          {/* Ungrouped buckets */}
          {ungroupedBuckets.length > 0 && (
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(undefined)}
              className="px-0"
            >
              <div className="px-3 py-1 text-xs font-semibold text-[var(--gnome-text-secondary)] uppercase">
                Buckets
              </div>
              {ungroupedBuckets.map((bucket, index) => renderBucket(bucket, index))}
            </div>
          )}

          {/* Grouped buckets - ALWAYS SHOW ALL GROUPS */}
          {groupedBuckets.map(({ group, buckets: groupBuckets }) => {
            const isCollapsed = collapsedGroups.has(group.id);

            return (
              <div key={group.id} className="mt-2">
                <button
                  onClick={() => toggleGroup(group.id)}
                  onContextMenu={(e) => handleGroupContextMenu(e, group)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(group.id)}
                  className="w-full px-3 py-1 flex items-center gap-2 text-xs font-semibold uppercase hover:bg-[var(--gnome-bg-hover)]"
                  style={{ color: group.color || "var(--gnome-text-secondary)" }}
                >
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <span className="flex-1 truncate text-left">{group.name}</span>
                  <span className="text-[10px] text-[var(--gnome-text-secondary)]">
                    {groupBuckets.length}
                  </span>
                </button>
                {!isCollapsed && groupBuckets.map((bucket, index) => renderBucket(bucket, buckets.indexOf(bucket)))}
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-px bg-[var(--gnome-border)] mx-2" />

        {/* Settings button only */}
        <button
          onClick={onOpenSettings}
          className="px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] transition-colors text-[var(--gnome-text-primary)]"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </aside>

      {/* Bucket Context Menu */}
      {bucketContextMenu && (
        <div
          className="fixed bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded shadow-2xl z-50 py-1 min-w-[180px]"
          style={{ left: bucketContextMenu.x, top: bucketContextMenu.y }}
          onMouseLeave={() => setBucketContextMenu(null)}
        >
          <button
            onClick={() => {
              setShowTitleEditor(bucketContextMenu.bucket);
              setBucketContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
          >
            <Edit size={14} />
            Edit Title
          </button>
          <button
            onClick={() => {
              setShowColorPicker({
                type: 'bucket',
                id: bucketContextMenu.bucket.id,
                currentColor: bucketContextMenu.bucket.color
              });
              setBucketContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
          >
            <Palette size={14} />
            Choose Color
          </button>

          <div className="h-px bg-[var(--gnome-border)] my-1" />

          {/* Move to Group submenu */}
          <div className="relative group/submenu">
            <button
              onMouseEnter={() => setBucketContextMenu({ ...bucketContextMenu, showMoveToSubmenu: true })}
              className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <FolderInput size={14} />
              <span className="flex-1 text-left">Move to Group</span>
              <ArrowRight size={12} />
            </button>

            {/* Submenu */}
            {bucketContextMenu.showMoveToSubmenu && (
              <div
                className="absolute left-full top-0 ml-1 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded shadow-2xl py-1 min-w-[160px]"
                onMouseLeave={() => setBucketContextMenu({ ...bucketContextMenu, showMoveToSubmenu: false })}
              >
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleMoveToGroup(bucketContextMenu.bucket.id, group.id)}
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
                    style={{ color: group.color }}
                  >
                    {group.name}
                  </button>
                ))}
                {groups.length === 0 && (
                  <div className="px-3 py-2 text-xs text-[var(--gnome-text-secondary)]">
                    No groups yet
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowCreateGroupDialog({ bucketId: bucketContextMenu.bucket.id });
              setBucketContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
          >
            <FolderPlus size={14} />
            Create New Group
          </button>

          {bucketContextMenu.bucket.groupId && (
            <button
              onClick={() => handleRemoveFromGroup(bucketContextMenu.bucket.id)}
              className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
            >
              <FolderInput size={14} />
              Remove from Group
            </button>
          )}

          <div className="h-px bg-[var(--gnome-border)] my-1" />

          <button
            onClick={() => {
              setConfirmEject(bucketContextMenu.bucket);
              setBucketContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-red-500"
          >
            <Unplug size={14} />
            Eject
          </button>
        </div>
      )}

      {/* Group Context Menu */}
      {groupContextMenu && (
        <div
          className="fixed bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded shadow-2xl z-50 py-1 min-w-[180px]"
          style={{ left: groupContextMenu.x, top: groupContextMenu.y }}
          onMouseLeave={() => setGroupContextMenu(null)}
        >
          <button
            onClick={() => {
              setShowGroupNameEditor(groupContextMenu.group);
              setGroupContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
          >
            <Edit size={14} />
            Rename Group
          </button>
          <button
            onClick={() => {
              setShowColorPicker({
                type: 'group',
                id: groupContextMenu.group.id,
                currentColor: groupContextMenu.group.color
              });
              setGroupContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-[var(--gnome-text-primary)]"
          >
            <Palette size={14} />
            Change Color
          </button>
          <div className="h-px bg-[var(--gnome-border)] my-1" />
          <button
            onClick={() => {
              setConfirmDeleteGroup(groupContextMenu.group);
              setGroupContextMenu(null);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--gnome-bg-hover)] text-red-500"
          >
            <Trash2 size={14} />
            Delete Group
          </button>
        </div>
      )}

      {/* Color Picker Dialog */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--gnome-bg-primary)] rounded-lg p-4 border border-[var(--gnome-border)] shadow-2xl">
            <h3 className="text-sm font-medium mb-3 text-[var(--gnome-text-primary)]">
              Choose Color
            </h3>
            <ColorPicker
              value={showColorPicker.currentColor || "#3498db"}
              onChange={(color) => {
                if (showColorPicker.type === 'bucket') {
                  CredentialsManager.updateBucketColor(showColorPicker.id, color);
                } else {
                  const group = groups.find(g => g.id === showColorPicker.id);
                  if (group) {
                    CredentialsManager.addGroup({ ...group, color });
                    setGroups(CredentialsManager.getGroups());
                  }
                }
                onBucketUpdate();
                setShowColorPicker(null);
              }}
            />
            <button
              onClick={() => setShowColorPicker(null)}
              className="gnome-button mt-3 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bucket Title Editor */}
      {showTitleEditor && (
        <InputDialog
          title="Edit Title"
          message={`Enter custom title for ${showTitleEditor.name}:`}
          placeholder="Custom title"
          defaultValue={showTitleEditor.customTitle || showTitleEditor.name}
          onConfirm={(title) => {
            CredentialsManager.updateBucketTitle(showTitleEditor.id, title);
            onBucketUpdate();
            setShowTitleEditor(null);
          }}
          onCancel={() => setShowTitleEditor(null)}
        />
      )}

      {/* Group Name Editor */}
      {showGroupNameEditor && (
        <InputDialog
          title="Rename Group"
          message="Enter new group name:"
          placeholder="Group name"
          defaultValue={showGroupNameEditor.name}
          onConfirm={(name) => {
            CredentialsManager.addGroup({ ...showGroupNameEditor, name });
            setGroups(CredentialsManager.getGroups());
            onBucketUpdate();
            setShowGroupNameEditor(null);
          }}
          onCancel={() => setShowGroupNameEditor(null)}
        />
      )}

      {/* Create Group Dialog */}
      {showCreateGroupDialog && (
        <InputDialog
          title="Create New Group"
          message="Enter group name:"
          placeholder="Group name"
          onConfirm={handleCreateGroupAndMove}
          onCancel={() => setShowCreateGroupDialog(null)}
        />
      )}

      {/* Confirm Eject */}
      {confirmEject && (
        <ConfirmDialog
          title="Eject Bucket"
          message={`Eject "${confirmEject.customTitle || confirmEject.name}"? This will disconnect the bucket from this app but won't delete any data.`}
          type="warning"
          confirmText="Eject"
          onConfirm={handleEject}
          onCancel={() => setConfirmEject(null)}
        />
      )}

      {/* Confirm Delete Group */}
      {confirmDeleteGroup && (
        <ConfirmDialog
          title="Delete Group"
          message={`Delete "${confirmDeleteGroup.name}"? Buckets in this group will not be deleted.`}
          type="danger"
          confirmText="Delete"
          onConfirm={handleDeleteGroup}
          onCancel={() => setConfirmDeleteGroup(null)}
        />
      )}
    </>
  );
}
