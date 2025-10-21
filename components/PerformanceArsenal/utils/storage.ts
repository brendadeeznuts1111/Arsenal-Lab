// components/PerformanceArsenal/utils/storage.ts
export function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}
