// This is a simple polyfill for AsyncStorage that works in SSR environments
const memoryStorage: Record<string, string> = {};

export const ssrCompatibleStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(memoryStorage[key] || null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
    return Promise.resolve();
  }
}; 