// Socket.io client for real-time communication
export const socket = {
  on: <T>(event: string, callback: (data: T) => void): void => {},
  emit: <T>(event: string, data: Record<string, unknown>): void => {},
};