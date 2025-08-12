// Socket.io client for real-time communication
export const socket = {
  on: <T>(_event: string, _callback: (data: T) => void): void => {},
  emit: <T>(_event: string, _data: Record<string, unknown>): void => {},
};