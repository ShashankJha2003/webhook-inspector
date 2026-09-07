import { EventEmitter } from "events";

// Preserve the emitter instance across dev hot-reloads
const globalForEvents = globalThis as unknown as {
  eventEmitter: EventEmitter | undefined;
};

export const eventEmitter =
  globalForEvents.eventEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.eventEmitter = eventEmitter;
}