// A simple, lightweight event bus for cross-component communication.

type EventCallback = (data?: any) => void;

interface Events {
  [key: string]: EventCallback[];
}

const events: Events = {};

export const eventBus = {
  /**
   * Register an event listener.
   */
  on(event: string, callback: EventCallback): void {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(callback);
  },

  /**
   * Emit an event to all registered listeners.
   */
  emit(event: string, data?: any): void {
    if (events[event]) {
      events[event].forEach(callback => callback(data));
    }
  },

  /**
   * Remove an event listener to prevent memory leaks.
   */
  off(event: string, callback: EventCallback): void {
    if (events[event]) {
      events[event] = events[event].filter(cb => cb !== callback);
    }
  }
}; 