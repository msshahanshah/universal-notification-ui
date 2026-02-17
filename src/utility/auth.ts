export const isAuthenticated = () => {
  if (window !== undefined) {
    return Boolean(localStorage.getItem("accessToken"));
  }
};

export const setLocalStorage = (key: string, value: string) => {
  if (window !== undefined) {
    localStorage.setItem(key, value);
  }
};