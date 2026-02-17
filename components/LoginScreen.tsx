"use client";

import { useState } from "react";
import { CredentialsManager } from "@/lib/credentials";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [credentials, setCredentials] = useState({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate credentials by testing connection
      const response = await fetch("/api/files/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-R2-Endpoint": credentials.endpoint,
          "X-R2-Access-Key-Id": credentials.accessKeyId,
          "X-R2-Secret-Access-Key": credentials.secretAccessKey,
          "X-R2-Bucket": credentials.bucket,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid credentials or connection failed");
      }

      // Save credentials to localStorage
      CredentialsManager.save(credentials);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--gnome-bg-primary)]">
      {/* Login Container */}
      <div className="w-full max-w-md relative">
        <div className="bg-[var(--gnome-bg-primary)] rounded border border-[var(--gnome-border)] p-8 shadow-lg">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--gnome-accent-blue)] rounded mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--gnome-text-primary)] mb-2">
              Welcome to S3 Explorer
            </h1>
            <p className="text-[var(--gnome-text-secondary)] text-sm">
              Connect your S3-compatible storage
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                S3 Endpoint URL
              </label>
              <input
                type="text"
                className="w-full"
                placeholder="https://s3.amazonaws.com or https://xxxxx.r2.cloudflarestorage.com"
                value={credentials.endpoint}
                onChange={(e) =>
                  setCredentials({ ...credentials, endpoint: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                Access Key ID
              </label>
              <input
                type="text"
                className="w-full"
                placeholder="Your access key ID"
                value={credentials.accessKeyId}
                onChange={(e) =>
                  setCredentials({ ...credentials, accessKeyId: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                Secret Access Key
              </label>
              <input
                type="password"
                className="w-full"
                placeholder="Your secret access key"
                value={credentials.secretAccessKey}
                onChange={(e) =>
                  setCredentials({ ...credentials, secretAccessKey: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                Bucket Name
              </label>
              <input
                type="text"
                className="w-full"
                placeholder="your-bucket-name"
                value={credentials.bucket}
                onChange={(e) =>
                  setCredentials({ ...credentials, bucket: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Connect to S3"
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-[var(--gnome-bg-sidebar)] rounded border border-[var(--gnome-border)]">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-[var(--gnome-text-secondary)] flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-[var(--gnome-text-secondary)] leading-relaxed">
                Your credentials are stored securely in your browser's localStorage
                and never sent to third-party servers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-6 text-sm text-[var(--gnome-text-secondary)]">
          Powered by AWS S3 SDK
        </p>
      </div>
    </div>
  );
}
