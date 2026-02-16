"use client";

import { useState, useEffect } from "react";
import type { FileMetadata } from "@/lib/types";

export default function FileManager() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/files?prefix=${encodeURIComponent(prefix)}`
      );
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setFiles(data.files);
      showMessage("success", "Files loaded successfully");
    } catch (error) {
      showMessage(
        "error",
        `Error loading files: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage("error", "Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("key", `${prefix}${selectedFile.name}`);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      showMessage("success", "File uploaded successfully");
      setSelectedFile(null);
      await loadFiles();
    } catch (error) {
      showMessage(
        "error",
        `Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete ${key}?`)) return;

    try {
      const response = await fetch(`/api/files?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete file");

      showMessage("success", "File deleted successfully");
      await loadFiles();
    } catch (error) {
      showMessage(
        "error",
        `Error deleting file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const response = await fetch(
        `/api/files/download?key=${encodeURIComponent(key)}`
      );
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = key.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showMessage("success", "File downloaded successfully");
    } catch (error) {
      showMessage(
        "error",
        `Error downloading file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">R2 File Manager</h1>

      {message && (
        <div
          className={`alert ${
            message.type === "success"
              ? "alert-success"
              : message.type === "error"
                ? "alert-error"
                : "alert-info"
          } mb-4`}
        >
          <span>{message.text}</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Upload File</h2>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Folder Prefix (optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., images/"
              className="input input-bordered w-full"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Select File</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Files</h2>
            <button
              className="btn btn-sm btn-outline"
              onClick={loadFiles}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </button>
          </div>

          {loading && files.length === 0 ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No files found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Last Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.key}>
                      <td className="font-mono text-sm">{file.key}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>{formatDate(file.lastModified)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleDownload(file.key)}
                          >
                            Download
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDelete(file.key)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
