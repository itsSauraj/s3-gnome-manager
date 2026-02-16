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

  const handleLoadFromEnv = async () => {
    try {
      const response = await fetch("/api/files/env-credentials");
      if (response.ok) {
        const envCreds = await response.json();
        setCredentials(envCreds);
      }
    } catch (error) {
      console.error("Failed to load env credentials:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafbfc] dark:bg-[#0d1117]">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md relative">
        <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to R2 Explorer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect your Cloudflare R2 storage
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
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
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                R2 Endpoint
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://xxxxx.r2.cloudflarestorage.com"
                value={credentials.endpoint}
                onChange={(e) =>
                  setCredentials({ ...credentials, endpoint: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Key ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your access key ID"
                value={credentials.accessKeyId}
                onChange={(e) =>
                  setCredentials({ ...credentials, accessKeyId: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secret Access Key
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your secret access key"
                value={credentials.secretAccessKey}
                onChange={(e) =>
                  setCredentials({ ...credentials, secretAccessKey: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bucket Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
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
                "Connect to R2"
              )}
            </button>

            <button
              type="button"
              onClick={handleLoadFromEnv}
              className="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm transition-colors"
            >
              Load from environment variables
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-[#0d1117] rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Your credentials are stored securely in your browser's localStorage
                and never sent to third-party servers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Powered by Cloudflare R2
        </p>
      </div>
    </div>
  );
}
