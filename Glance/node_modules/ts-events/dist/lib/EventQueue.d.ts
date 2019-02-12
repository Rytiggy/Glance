import { SyncEvent } from './sync-event';
/**
 * Simple synchronous event queue that needs to be drained manually.
 */
declare class EventQueue {
    /**
     * SyncEvent triggered after an event is added outside of a flush operation.
     * @param queue The event queue itself
     */
    evtFilled: SyncEvent<EventQueue>;
    /**
     * SyncEvent triggered after the queue is flushed empty
     * @param queue The event queue itself
     */
    evtDrained: SyncEvent<EventQueue>;
    /**
     * The module-global event queue
     */
    private static _instance;
    /**
     * The module-global event queue
     */
    static global(): EventQueue;
    /**
     * Testing purposes
     */
    static resetGlobal(): void;
    /**
     * Queued elements
     */
    private _queue;
    /**
     * True while flush() or flushOnce() is running
     */
    private _flushing;
    /**
     * Returns true iff the queue is empty
     */
    empty(): boolean;
    /**
     * Add an element to the queue. The handler is called when one of the flush
     * methods is called.
     */
    add(handler: () => void): void;
    /**
     * Calls all handlers currently in the queue. Does not call any handlers added
     * as a result of the flush
     */
    flushOnce(): void;
    /**
     * Flushes the QueuedEvents, calling all events currently in the queue and those
     * put into the queue as a result of the flush.
     * @param maxRounds Optional, default 10. Number of iterations after which to throw an error because
     *                  the queue keeps filling up. Set to null to disable this.
     */
    flush(maxRounds?: number): void;
}
export default EventQueue;
