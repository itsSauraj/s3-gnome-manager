/**
 * Navigation history manager for bucket-based navigation
 * Tracks navigation history separately for each bucket and persists to localStorage
 */

interface BucketHistory {
  stack: string[];
  currentIndex: number;
}

interface NavigationHistory {
  [bucketId: string]: BucketHistory;
}

const STORAGE_KEY = "r2_navigation_history";

export class NavigationHistoryManager {
  private static getHistory(): NavigationHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Failed to load navigation history:", error);
      return {};
    }
  }

  private static saveHistory(history: NavigationHistory): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save navigation history:", error);
    }
  }

  static getBucketHistory(bucketId: string): BucketHistory {
    const history = this.getHistory();
    return history[bucketId] || { stack: [""], currentIndex: 0 };
  }

  static canGoBack(bucketId: string): boolean {
    const bucketHistory = this.getBucketHistory(bucketId);
    return bucketHistory.currentIndex > 0;
  }

  static canGoForward(bucketId: string): boolean {
    const bucketHistory = this.getBucketHistory(bucketId);
    return bucketHistory.currentIndex < bucketHistory.stack.length - 1;
  }

  static getCurrentPath(bucketId: string): string {
    const bucketHistory = this.getBucketHistory(bucketId);
    return bucketHistory.stack[bucketHistory.currentIndex] || "";
  }

  static pushPath(bucketId: string, path: string): void {
    const history = this.getHistory();
    const bucketHistory = history[bucketId] || { stack: [""], currentIndex: 0 };

    // Don't add if it's the same as current path
    if (bucketHistory.stack[bucketHistory.currentIndex] === path) {
      return;
    }

    // Remove all forward history
    bucketHistory.stack = bucketHistory.stack.slice(0, bucketHistory.currentIndex + 1);

    // Add new path
    bucketHistory.stack.push(path);
    bucketHistory.currentIndex = bucketHistory.stack.length - 1;

    history[bucketId] = bucketHistory;
    this.saveHistory(history);
  }

  static goBack(bucketId: string): string | null {
    const history = this.getHistory();
    const bucketHistory = history[bucketId];

    if (!bucketHistory || bucketHistory.currentIndex <= 0) {
      return null;
    }

    bucketHistory.currentIndex--;
    history[bucketId] = bucketHistory;
    this.saveHistory(history);

    return bucketHistory.stack[bucketHistory.currentIndex];
  }

  static goForward(bucketId: string): string | null {
    const history = this.getHistory();
    const bucketHistory = history[bucketId];

    if (!bucketHistory || bucketHistory.currentIndex >= bucketHistory.stack.length - 1) {
      return null;
    }

    bucketHistory.currentIndex++;
    history[bucketId] = bucketHistory;
    this.saveHistory(history);

    return bucketHistory.stack[bucketHistory.currentIndex];
  }

  static clearBucketHistory(bucketId: string): void {
    const history = this.getHistory();
    delete history[bucketId];
    this.saveHistory(history);
  }

  static clearAllHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static initializeBucket(bucketId: string, initialPath: string = ""): void {
    const history = this.getHistory();
    if (!history[bucketId]) {
      history[bucketId] = { stack: [initialPath], currentIndex: 0 };
      this.saveHistory(history);
    }
  }
}
