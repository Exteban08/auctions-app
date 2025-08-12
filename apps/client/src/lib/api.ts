// API client for making HTTP requests
export const api = {
  get: async <T>(_url: string): Promise<T> => {
    return {} as T;
  },
  post: async <T>(_url: string, _data: Record<string, unknown>): Promise<T> => {
    return {} as T;
  },
};