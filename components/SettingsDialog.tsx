"use client";

import { useState } from 'react';
import { X, Plus, Trash2, Edit, Copy } from 'lucide-react';
import { CredentialsManager, type BucketConfig } from '@/lib/credentials';
import ConfirmDialog from './ConfirmDialog';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdate: () => void;
}

type FormMode = 'add' | 'edit' | 'duplicate';

export default function SettingsDialog({ isOpen, onClose, onCredentialsUpdate }: SettingsDialogProps) {
  const [buckets, setBuckets] = useState<BucketConfig[]>(CredentialsManager.getBuckets());
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [editingBucketId, setEditingBucketId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ bucketId: string; bucketName: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveBucket = async () => {
    if (!formData.name || !formData.endpoint || !formData.accessKeyId || !formData.secretAccessKey || !formData.bucket) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Test connection
      const response = await fetch("/api/files/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-R2-Endpoint": formData.endpoint,
          "X-R2-Access-Key-Id": formData.accessKeyId,
          "X-R2-Secret-Access-Key": formData.secretAccessKey,
          "X-R2-Bucket": formData.bucket,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid credentials or connection failed");
      }

      const bucketConfig: BucketConfig = {
        id: formMode === 'edit' && editingBucketId ? editingBucketId : `bucket-${Date.now()}`,
        name: formData.name,
        credentials: {
          endpoint: formData.endpoint,
          accessKeyId: formData.accessKeyId,
          secretAccessKey: formData.secretAccessKey,
          bucket: formData.bucket,
        },
      };

      CredentialsManager.addBucket(bucketConfig);

      setBuckets(CredentialsManager.getBuckets());
      resetForm();
      onCredentialsUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connection");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBucket = (bucket: BucketConfig) => {
    setFormMode('edit');
    setEditingBucketId(bucket.id);
    setFormData({
      name: bucket.name,
      endpoint: bucket.credentials.endpoint,
      accessKeyId: bucket.credentials.accessKeyId,
      secretAccessKey: bucket.credentials.secretAccessKey,
      bucket: bucket.credentials.bucket,
    });
    setShowForm(true);
    setError('');
  };

  const handleDuplicateBucket = (bucket: BucketConfig) => {
    setFormMode('duplicate');
    setEditingBucketId(null);
    setFormData({
      name: `${bucket.name} (Copy)`,
      endpoint: bucket.credentials.endpoint,
      accessKeyId: bucket.credentials.accessKeyId,
      secretAccessKey: bucket.credentials.secretAccessKey,
      bucket: bucket.credentials.bucket,
    });
    setShowForm(true);
    setError('');
  };

  const resetForm = () => {
    setShowForm(false);
    setFormMode('add');
    setEditingBucketId(null);
    setFormData({
      name: '',
      endpoint: '',
      accessKeyId: '',
      secretAccessKey: '',
      bucket: '',
    });
    setError('');
  };

  const handleRemoveBucket = (bucketId: string, bucketName: string) => {
    setConfirmDelete({ bucketId, bucketName });
  };

  const confirmRemoveBucket = () => {
    if (confirmDelete) {
      CredentialsManager.removeBucket(confirmDelete.bucketId);
      setBuckets(CredentialsManager.getBuckets());
      onCredentialsUpdate();
      setConfirmDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--gnome-bg-primary)] rounded w-[600px] max-h-[80vh] flex flex-col border border-[var(--gnome-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gnome-border)]">
          <h2 className="text-base font-medium text-[var(--gnome-text-primary)]">S3 Storage Settings</h2>
          <button onClick={onClose} className="gnome-button-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Bucket list */}
          <div className="space-y-2 mb-4">
            {buckets.map((bucket) => (
              <div key={bucket.id} className="flex items-center justify-between p-3 bg-[var(--gnome-bg-hover)] rounded">
                <div>
                  <div className="font-medium text-sm text-[var(--gnome-text-primary)]">{bucket.name}</div>
                  <div className="text-xs text-[var(--gnome-text-secondary)]">{bucket.credentials.bucket}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditBucket(bucket)}
                    className="gnome-button-icon"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDuplicateBucket(bucket)}
                    className="gnome-button-icon"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveBucket(bucket.id, bucket.name)}
                    className="gnome-button-icon text-red-500"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add bucket button */}
          {!showForm && (
            <button
              onClick={() => {
                setFormMode('add');
                setShowForm(true);
              }}
              className="gnome-button flex items-center gap-2"
            >
              <Plus size={16} />
              Add Storage Connection
            </button>
          )}

          {/* Form */}
          {showForm && (
            <div className="mt-4 p-4 border border-[var(--gnome-border)] rounded">
              <h3 className="text-sm font-medium mb-3 text-[var(--gnome-text-primary)]">
                {formMode === 'edit' ? 'Edit Connection' : formMode === 'duplicate' ? 'Duplicate Connection' : 'New Connection'}
              </h3>

              {error && (
                <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--gnome-text-primary)]">Connection Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)]"
                    placeholder="My R2 Bucket"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--gnome-text-primary)]">S3 Endpoint URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)]"
                    placeholder="https://s3.amazonaws.com or https://xxxxx.r2.cloudflarestorage.com"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--gnome-text-primary)]">Access Key ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)]"
                    placeholder="Your access key ID"
                    value={formData.accessKeyId}
                    onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--gnome-text-primary)]">Secret Access Key</label>
                  <input
                    type="password"
                    className="w-full px-3 py-1.5 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)]"
                    placeholder="Your secret access key"
                    value={formData.secretAccessKey}
                    onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--gnome-text-primary)]">Bucket Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)]"
                    placeholder="your-bucket-name"
                    value={formData.bucket}
                    onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="gnome-button px-3 py-1.5"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBucket}
                    className="gnome-button px-3 py-1.5 bg-[var(--gnome-accent-blue)] text-white"
                    disabled={loading}
                  >
                    {loading ? 'Testing...' : formMode === 'edit' ? 'Save Changes' : 'Add Connection'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--gnome-border)]">
          <button onClick={onClose} className="gnome-button px-4 py-2">
            Close
          </button>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Remove Storage Connection"
          message={`Are you sure you want to remove "${confirmDelete.bucketName}"? This will only remove the connection from this app, not delete any data.`}
          type="danger"
          confirmText="Remove"
          onConfirm={confirmRemoveBucket}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
