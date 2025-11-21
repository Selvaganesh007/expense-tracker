export const localStorageSetItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const localStorageGetItem = (key: string) => {
  return localStorage.getItem(key);
};

export const localStorageRemoveItem = (key: string) => {
  localStorage.removeItem(key);
};

export const localStorageClear = () => {
  localStorage.clear();
};
