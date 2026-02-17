"use client";

import { useState } from "react";
import { X, Plus, Trash2, Edit } from "lucide-react";
import { CredentialsManager, type BucketGroup } from "@/lib/credentials";
import ColorPicker from "./ColorPicker";
import InputDialog from "./InputDialog";
import ConfirmDialog from "./ConfirmDialog";

interface GroupManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function GroupManagerDialog({
  isOpen,
  onClose,
  onUpdate,
}: GroupManagerDialogProps) {
  const [groups, setGroups] = useState<BucketGroup[]>(CredentialsManager.getGroups());
  const [editingGroup, setEditingGroup] = useState<BucketGroup | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BucketGroup | null>(null);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    setEditingGroup({
      id: `group-${Date.now()}`,
      name: "",
      color: "#3498db",
      order: groups.length,
    });
    setShowNameDialog(true);
  };

  const handleEditGroup = (group: BucketGroup) => {
    setEditingGroup(group);
    setShowNameDialog(true);
  };

  const handleSaveGroup = (name: string) => {
    if (editingGroup) {
      const updatedGroup = { ...editingGroup, name };
      CredentialsManager.addGroup(updatedGroup);
      setGroups(CredentialsManager.getGroups());
      onUpdate();
    }
    setShowNameDialog(false);
    setEditingGroup(null);
  };

  const handleColorChange = (groupId: string, color: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      CredentialsManager.addGroup({ ...group, color });
      setGroups(CredentialsManager.getGroups());
      onUpdate();
    }
  };

  const handleDeleteGroup = () => {
    if (confirmDelete) {
      CredentialsManager.removeGroup(confirmDelete.id);
      setGroups(CredentialsManager.getGroups());
      onUpdate();
      setConfirmDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--gnome-bg-primary)] rounded-lg w-[500px] max-h-[80vh] flex flex-col border border-[var(--gnome-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gnome-border)]">
          <h2 className="text-base font-medium text-[var(--gnome-text-primary)]">
            Manage Groups
          </h2>
          <button onClick={onClose} className="gnome-button-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 p-3 bg-[var(--gnome-bg-hover)] rounded"
              >
                {/* Color indicator */}
                <div
                  className="w-4 h-4 rounded-full border border-[var(--gnome-border)]"
                  style={{ backgroundColor: group.color || "#3498db" }}
                />

                {/* Group name */}
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--gnome-text-primary)]">
                    {group.name}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="gnome-button-icon"
                    title="Edit name"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(group)}
                    className="gnome-button-icon text-red-500"
                    title="Delete group"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {groups.length === 0 && (
              <div className="text-center py-8 text-[var(--gnome-text-secondary)] text-sm">
                No groups yet. Create one to organize your buckets.
              </div>
            )}
          </div>

          <button
            onClick={handleAddGroup}
            className="gnome-button flex items-center gap-2 mt-4 w-full justify-center"
          >
            <Plus size={16} />
            Add Group
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--gnome-border)]">
          <button onClick={onClose} className="gnome-button px-4 py-2">
            Close
          </button>
        </div>
      </div>

      {/* Name Input Dialog */}
      {showNameDialog && editingGroup && (
        <InputDialog
          title={editingGroup.name ? "Edit Group Name" : "New Group"}
          message="Enter group name:"
          placeholder="Group name"
          defaultValue={editingGroup.name}
          onConfirm={handleSaveGroup}
          onCancel={() => {
            setShowNameDialog(false);
            setEditingGroup(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Group"
          message={`Delete "${confirmDelete.name}"? Buckets in this group will not be deleted.`}
          type="danger"
          confirmText="Delete"
          onConfirm={handleDeleteGroup}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
