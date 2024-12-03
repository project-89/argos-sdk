import { EventHandler, EventMap, EventType } from './types';

export class EventEmitter {
  private handlers: Map<EventType, Set<EventHandler<EventMap[EventType]>>> =
    new Map();

  on<E extends EventType>(event: E, handler: EventHandler<EventMap[E]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler as EventHandler<EventMap[EventType]>);
  }

  off<E extends EventType>(event: E, handler: EventHandler<EventMap[E]>): void {
    this.handlers
      .get(event)
      ?.delete(handler as EventHandler<EventMap[EventType]>);
  }

  emit<E extends EventType>(event: E, data: EventMap[E]): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        (handler as EventHandler<EventMap[E]>)(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
}
