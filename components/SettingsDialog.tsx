"use client";

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { CredentialsManager, type BucketConfig } from '@/lib/credentials';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdate: () => void;
}

export default function SettingsDialog({ isOpen, onClose, onCredentialsUpdate }: SettingsDialogProps) {
  const [buckets, setBuckets] = useState<BucketConfig[]>(CredentialsManager.getBuckets());
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddBucket = async () => {
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

      // Save credentials
      const newBucket: BucketConfig = {
        id: `bucket-${Date.now()}`,
        name: formData.name,
        credentials: {
          endpoint: formData.endpoint,
          accessKeyId: formData.accessKeyId,
          secretAccessKey: formData.secretAccessKey,
          bucket: formData.bucket,
        },
      };

      CredentialsManager.addBucket(newBucket);
      setBuckets(CredentialsManager.getBuckets());
      setShowAddForm(false);
      setFormData({
        name: '',
        endpoint: '',
        accessKeyId: '',
        secretAccessKey: '',
        bucket: '',
      });
      onCredentialsUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add connection");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBucket = (bucketId: string) => {
    if (confirm('Remove this storage connection?')) {
      CredentialsManager.removeBucket(bucketId);
      setBuckets(CredentialsManager.getBuckets());
      onCredentialsUpdate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--gnome-bg-primary)] rounded w-[600px] max-h-[80vh] flex flex-col border border-[var(--gnome-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gnome-border)]">
          <h2 className="text-base font-medium text-[var(--gnome-text-primary)]">R2 Storage Settings</h2>
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
                <button
                  onClick={() => handleRemoveBucket(bucket.id)}
                  className="gnome-button-icon text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add bucket button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="gnome-button flex items-center gap-2"
            >
              <Plus size={16} />
              Add Storage Connection
            </button>
          )}

          {/* Add form */}
          {showAddForm && (
            <div className="mt-4 p-4 border border-[var(--gnome-border)] rounded">
              <h3 className="text-sm font-medium mb-3 text-[var(--gnome-text-primary)]">New Connection</h3>

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
                  <label className="block text-xs font-medium mb-1 text-[var(--gnome-text-primary)]">R2 Endpoint</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)]"
                    placeholder="https://xxxxx.r2.cloudflarestorage.com"
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
                    onClick={() => {
                      setShowAddForm(false);
                      setError('');
                    }}
                    className="gnome-button px-3 py-1.5"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBucket}
                    className="gnome-button px-3 py-1.5 bg-[var(--gnome-accent-blue)] text-white"
                    disabled={loading}
                  >
                    {loading ? 'Testing...' : 'Add Connection'}
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
    </div>
  );
}
