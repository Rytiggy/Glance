(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.listComponent = f()
    }
})(function() {
        var define, module, exports;
require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var sync_event_1 = require("./sync-event");
/**
 * Simple synchronous event queue that needs to be drained manually.
 */
var EventQueue = /** @class */ (function () {
    function EventQueue() {
        /**
         * SyncEvent triggered after an event is added outside of a flush operation.
         * @param queue The event queue itself
         */
        this.evtFilled = new sync_event_1.SyncEvent();
        /**
         * SyncEvent triggered after the queue is flushed empty
         * @param queue The event queue itself
         */
        this.evtDrained = new sync_event_1.SyncEvent();
        /**
         * Queued elements
         */
        this._queue = [];
        /**
         * True while flush() or flushOnce() is running
         */
        this._flushing = false;
    }
    /**
     * The module-global event queue
     */
    EventQueue.global = function () {
        if (!EventQueue._instance) {
            EventQueue.resetGlobal();
        }
        return EventQueue._instance;
    };
    /**
     * Testing purposes
     */
    EventQueue.resetGlobal = function () {
        EventQueue._instance = new EventQueue();
    };
    /**
     * Returns true iff the queue is empty
     */
    EventQueue.prototype.empty = function () {
        return this._queue.length === 0;
    };
    /**
     * Add an element to the queue. The handler is called when one of the flush
     * methods is called.
     */
    EventQueue.prototype.add = function (handler) {
        this._queue.push(handler);
        if (this._queue.length === 1 && !this._flushing) {
            this.evtFilled.post(this);
        }
    };
    /**
     * Calls all handlers currently in the queue. Does not call any handlers added
     * as a result of the flush
     */
    EventQueue.prototype.flushOnce = function () {
        var empty = (this._queue.length === 0);
        var flushing = this._flushing;
        this._flushing = true;
        try {
            var queue = this._queue;
            this._queue = [];
            for (var i = 0; i < queue.length; ++i) {
                queue[i]();
            }
        }
        finally {
            this._flushing = flushing;
            if (!empty && !flushing && this._queue.length === 0) {
                this.evtDrained.post(this);
            }
        }
    };
    /**
     * Flushes the QueuedEvents, calling all events currently in the queue and those
     * put into the queue as a result of the flush.
     * @param maxRounds Optional, default 10. Number of iterations after which to throw an error because
     *                  the queue keeps filling up. Set to null to disable this.
     */
    EventQueue.prototype.flush = function (maxRounds) {
        if (maxRounds === void 0) { maxRounds = 10; }
        var empty = (this._queue.length === 0);
        var flushing = this._flushing;
        this._flushing = true;
        try {
            var i = 0;
            while (this._queue.length > 0) {
                if (typeof maxRounds === 'number' && i >= maxRounds) {
                    this._queue = [];
                    throw new Error('unable to flush the queue due to recursively added event. Clearing queue now');
                }
                this.flushOnce();
                ++i;
            }
        }
        finally {
            this._flushing = flushing;
            if (!empty && !flushing && this._queue.length === 0) {
                this.evtDrained.post(this);
            }
        }
    };
    return EventQueue;
}());
exports.default = EventQueue;

},{"./sync-event":7}],2:[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var objects_1 = require("./objects");
var sync_event_1 = require("./sync-event");
var async_event_1 = require("./async-event");
var queued_event_1 = require("./queued-event");
var EventType;
(function (EventType) {
    EventType[EventType["Sync"] = 0] = "Sync";
    EventType[EventType["Async"] = 1] = "Async";
    EventType[EventType["Queued"] = 2] = "Queued";
})(EventType = exports.EventType || (exports.EventType = {}));
/**
 * An event that behaves like a Sync/Async/Queued event depending on how
 * you subscribe.
 */
var AnyEvent = /** @class */ (function () {
    function AnyEvent(opts) {
        /**
         * Underlying event implementations; one for every attach type + opts combination
         */
        this._events = [];
        if (opts && opts.monitorAttach) {
            this.evtFirstAttached = new VoidAnyEvent();
            this.evtLastDetached = new VoidAnyEvent();
        }
    }
    AnyEvent.prototype.attach = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var mode = EventType.Sync;
        if (args.length > 0 && typeof args[0] === 'number') {
            mode = args.shift();
        }
        var boundTo = this; // add ourselves as default 'boundTo' argument
        var handler;
        var opts;
        var postable;
        if (typeof args[0] === 'function' || (args[0] && typeof args[0] === 'object' && typeof args[0].post === 'function')) {
            if (typeof args[0] === 'function') {
                handler = args[0];
            }
            else {
                postable = args[0];
            }
            opts = args[1];
        }
        else {
            boundTo = args[0];
            handler = args[1];
            opts = args[2];
        }
        this._attach(mode, boundTo, handler, postable, opts, false);
    };
    AnyEvent.prototype.once = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var mode = EventType.Sync;
        if (args.length > 0 && typeof args[0] === 'number') {
            mode = args.shift();
        }
        var boundTo = this; // add ourselves as default 'boundTo' argument
        var handler;
        var opts;
        var postable;
        if (typeof args[0] === 'function' || (args[0] && typeof args[0] === 'object' && typeof args[0].post === 'function')) {
            if (typeof args[0] === 'function') {
                handler = args[0];
            }
            else {
                postable = args[0];
            }
            opts = args[1];
        }
        else {
            boundTo = args[0];
            handler = args[1];
            opts = args[2];
        }
        this._attach(mode, boundTo, handler, postable, opts, true);
    };
    AnyEvent.prototype._attach = function (mode, boundTo, handler, postable, opts, once) {
        var prevCount = (!!this.evtFirstAttached ? this.listenerCount() : 0);
        var event;
        switch (mode) {
            case EventType.Sync:
                {
                    for (var _i = 0, _a = this._events; _i < _a.length; _i++) {
                        var evt = _a[_i];
                        if (evt instanceof sync_event_1.SyncEvent) {
                            event = evt;
                        }
                    }
                    if (!event) {
                        event = new sync_event_1.SyncEvent();
                        this._events.push(event);
                    }
                }
                break;
            case EventType.Async:
                {
                    for (var _b = 0, _c = this._events; _b < _c.length; _b++) {
                        var evt = _c[_b];
                        if (evt instanceof async_event_1.AsyncEvent && objects_1.shallowEquals(evt.options, opts)) {
                            event = evt;
                        }
                    }
                    if (!event) {
                        event = new async_event_1.AsyncEvent(opts);
                        this._events.push(event);
                    }
                }
                break;
            case EventType.Queued:
                {
                    for (var _d = 0, _e = this._events; _d < _e.length; _d++) {
                        var evt = _e[_d];
                        if (evt instanceof queued_event_1.QueuedEvent && objects_1.shallowEquals(evt.options, opts)) {
                            event = evt;
                        }
                    }
                    if (!event) {
                        event = new queued_event_1.QueuedEvent(opts);
                        this._events.push(event);
                    }
                }
                break;
            default:
                throw new Error('unknown EventType');
        }
        if (once) {
            if (postable) {
                event.once(postable);
            }
            else {
                event.once(boundTo, handler);
            }
        }
        else {
            if (postable) {
                event.attach(postable);
            }
            else {
                event.attach(boundTo, handler);
            }
        }
        if (this.evtFirstAttached && prevCount === 0) {
            this.evtFirstAttached.post();
        }
    };
    AnyEvent.prototype.attachSync = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(EventType.Sync);
        this.attach.apply(this, args);
    };
    AnyEvent.prototype.onceSync = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(EventType.Sync);
        this.once.apply(this, args);
    };
    AnyEvent.prototype.attachAsync = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(EventType.Async);
        this.attach.apply(this, args);
    };
    AnyEvent.prototype.onceAsync = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(EventType.Async);
        this.once.apply(this, args);
    };
    AnyEvent.prototype.attachQueued = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(EventType.Queued);
        this.attach.apply(this, args);
    };
    AnyEvent.prototype.onceQueued = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift(EventType.Queued);
        this.once.apply(this, args);
    };
    /**
     * Detach event handlers regardless of type
     */
    AnyEvent.prototype.detach = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var prevCount = (!!this.evtLastDetached ? this.listenerCount() : 0);
        for (var i = 0; i < this._events.length; ++i) {
            this._events[i].detach.apply(this._events[i], args);
        }
        if (!!this.evtLastDetached && prevCount > 0 && this.listenerCount() === 0) {
            this.evtLastDetached.post();
        }
    };
    /**
     * Post an event to all current listeners
     */
    AnyEvent.prototype.post = function (data) {
        // make a copy of the array first to cover the case where event handlers
        // are attached during the post
        var events = [];
        for (var i = 0; i < this._events.length; ++i) {
            events.push(this._events[i]);
        }
        for (var i = 0; i < events.length; ++i) {
            events[i].post(data);
        }
    };
    /**
     * The number of attached listeners
     */
    AnyEvent.prototype.listenerCount = function () {
        var result = 0;
        for (var i = 0; i < this._events.length; ++i) {
            result += this._events[i].listenerCount();
        }
        return result;
    };
    return AnyEvent;
}());
exports.AnyEvent = AnyEvent;
/**
 * Convenience class for AnyEvents without data
 */
var VoidAnyEvent = /** @class */ (function (_super) {
    __extends(VoidAnyEvent, _super);
    function VoidAnyEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Send the AsyncEvent.
     */
    VoidAnyEvent.prototype.post = function () {
        _super.prototype.post.call(this, undefined);
    };
    return VoidAnyEvent;
}(AnyEvent));
exports.VoidAnyEvent = VoidAnyEvent;
/**
 * Similar to 'error' event on EventEmitter: throws when a post() occurs while no handlers set.
 */
var ErrorAnyEvent = /** @class */ (function (_super) {
    __extends(ErrorAnyEvent, _super);
    function ErrorAnyEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorAnyEvent.prototype.post = function (data) {
        if (this.listenerCount() === 0) {
            throw new Error("error event posted while no listeners attached. Error: " + data.message);
        }
        _super.prototype.post.call(this, data);
    };
    return ErrorAnyEvent;
}(AnyEvent));
exports.ErrorAnyEvent = ErrorAnyEvent;

},{"./async-event":3,"./objects":5,"./queued-event":6,"./sync-event":7}],3:[function(require,module,exports){
(function (setImmediate){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_event_1 = require("./base-event");
/**
 * A-synchronous event. Handlers are called in the next Node.JS cycle.
 * - Optionally condenses multiple post() calls into one (the last post() gets through)
 * - Handlers are called only for events posted after they were attached.
 * - Handlers are not called anymore when they are detached, even if a post() is in progress
 */
var AsyncEvent = /** @class */ (function (_super) {
    __extends(AsyncEvent, _super);
    /**
     * Constructor
     * @param opts Optional. Various settings:
     *             - condensed: a Boolean indicating whether to condense multiple post() calls within the same cycle.
     */
    function AsyncEvent(opts) {
        var _this = _super.call(this) || this;
        _this._queued = false;
        _this.options = opts;
        var options = opts || {};
        if (typeof options.condensed === 'boolean') {
            _this._condensed = options.condensed;
        }
        else {
            _this._condensed = false;
        }
        return _this;
    }
    /**
     * The default scheduler uses setImmediate() or setTimeout(..., 0) if setImmediate is not available.
     */
    AsyncEvent.defaultScheduler = function (callback) {
        /* istanbul ignore else  */
        if (typeof window !== 'undefined') {
            // browsers don't always support setImmediate()
            setTimeout(callback, 0);
        }
        else {
            // node.js
            setImmediate(callback);
        }
    };
    /**
     * By default, AsyncEvent uses setImmediate() to schedule event handler invocation.
     * You can change this for e.g. setTimeout(..., 0) by calling this static method once.
     * @param scheduler A function that takes a callback and executes it in the next Node.JS cycle.
     */
    AsyncEvent.setScheduler = function (scheduler) {
        AsyncEvent._scheduler = scheduler;
    };
    AsyncEvent.prototype.post = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._listeners || this._listeners.length === 0) {
            return;
        }
        if (this._condensed) {
            this._queuedData = args;
            this._queuedListeners = this._listeners;
            if (this._queued) {
                return;
            }
            else {
                this._queued = true;
                AsyncEvent._scheduler(function () {
                    // immediately mark non-queued to allow new AsyncEvent to happen as result
                    // of calling handlers
                    _this._queued = false;
                    // cache listeners and data because they might change while calling event handlers
                    var data = _this._queuedData;
                    var listeners = _this._queuedListeners;
                    for (var i = 0; i < listeners.length; ++i) {
                        var listener = listeners[i];
                        _this._call(listener, data);
                    }
                });
            }
        }
        else { // not condensed
            var listeners_1 = this._listeners;
            AsyncEvent._scheduler(function () {
                for (var i = 0; i < listeners_1.length; ++i) {
                    var listener = listeners_1[i];
                    _this._call(listener, args);
                }
            });
        }
    };
    // inherited
    AsyncEvent.prototype._call = function (listener, args) {
        // performance optimization: don't use consecutive nodejs cycles
        // for asyncevents attached to asyncevents
        if (listener.event && listener.event instanceof AsyncEvent) {
            listener.event._postDirect(args);
        }
        else {
            _super.prototype._call.call(this, listener, args);
        }
    };
    /**
     * Performance optimization: if this async signal is attached to another
     * async signal, we're already a the next cycle and we can call listeners
     * directly
     */
    AsyncEvent.prototype._postDirect = function (args) {
        if (!this._listeners || this._listeners.length === 0) {
            return;
        }
        // copy a reference to the array because this._listeners might be replaced during
        // the handler calls
        var listeners = this._listeners;
        for (var i = 0; i < listeners.length; ++i) {
            var listener = listeners[i];
            this._call(listener, args);
        }
    };
    /**
     * The current scheduler
     */
    AsyncEvent._scheduler = AsyncEvent.defaultScheduler;
    return AsyncEvent;
}(base_event_1.BaseEvent));
exports.AsyncEvent = AsyncEvent;
/**
 * Convenience class for AsyncEvents without data
 */
var VoidAsyncEvent = /** @class */ (function (_super) {
    __extends(VoidAsyncEvent, _super);
    function VoidAsyncEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Send the AsyncEvent.
     */
    VoidAsyncEvent.prototype.post = function () {
        _super.prototype.post.call(this, undefined);
    };
    return VoidAsyncEvent;
}(AsyncEvent));
exports.VoidAsyncEvent = VoidAsyncEvent;
/**
 * Similar to 'error' event on EventEmitter: throws when a post() occurs while no handlers set.
 */
var ErrorAsyncEvent = /** @class */ (function (_super) {
    __extends(ErrorAsyncEvent, _super);
    function ErrorAsyncEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorAsyncEvent.prototype.post = function (data) {
        if (this.listenerCount() === 0) {
            throw new Error("error event posted while no listeners attached. Error: " + data.message);
        }
        _super.prototype.post.call(this, data);
    };
    return ErrorAsyncEvent;
}(AsyncEvent));
exports.ErrorAsyncEvent = ErrorAsyncEvent;

}).call(this,require("timers").setImmediate)

},{"./base-event":4,"timers":9}],4:[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for events.
 * Handles attaching and detaching listeners
 */
var BaseEvent = /** @class */ (function () {
    function BaseEvent() {
    }
    /**
     * Attach implementation
     */
    BaseEvent.prototype.attach = function (a, b) {
        this._attach(a, b, false);
    };
    /**
     * Attach implementation
     */
    BaseEvent.prototype.once = function (a, b) {
        this._attach(a, b, true);
    };
    /**
     * Attach / once implementation
     * @param a
     * @param b
     * @param once
     */
    BaseEvent.prototype._attach = function (a, b, once) {
        var boundTo;
        var handler;
        var event;
        if (typeof a === 'function') {
            handler = a;
        }
        else if (!b && typeof a.post === 'function') {
            event = a;
        }
        else {
            if (typeof a !== 'object') {
                throw new Error('Expect a function or object as first argument');
            }
            if (typeof b !== 'function') {
                throw new Error('Expect a function as second argument');
            }
            boundTo = a;
            handler = b;
        }
        if (!this._listeners) {
            this._listeners = [];
        }
        else {
            // make a copy of the array so events that are underway have a stable local copy
            // of the listeners array at the time of post()
            this._listeners = this._listeners.slice();
        }
        this._listeners.push({
            deleted: false,
            boundTo: boundTo,
            handler: handler,
            event: event,
            once: once
        });
    };
    /**
     * Detach implementation. See the overloads for description.
     */
    BaseEvent.prototype.detach = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._listeners || this._listeners.length === 0) {
            return;
        }
        var boundTo;
        var handler;
        var event;
        if (args.length >= 1) {
            if (typeof (args[0]) === 'function') {
                handler = args[0];
            }
            else if (args.length === 1 && typeof args[0].post === 'function') {
                event = args[0];
            }
            else {
                boundTo = args[0];
            }
        }
        if (args.length >= 2) {
            handler = args[1];
        }
        // remove listeners AND mark them as deleted so subclasses don't send any more events to them
        this._listeners = this._listeners.filter(function (listener) {
            if ((typeof handler === 'undefined' || listener.handler === handler)
                && (typeof event === 'undefined' || listener.event === event)
                && (typeof boundTo === 'undefined' || listener.boundTo === boundTo)) {
                listener.deleted = true;
                return false;
            }
            return true;
        });
        if (this._listeners.length === 0) {
            delete this._listeners;
        }
    };
    /**
     * Abstract post() method to be able to connect any type of event to any other directly
     * @abstract
     */
    BaseEvent.prototype.post = function (data) {
        throw new Error('abstract');
    };
    /**
     * The number of attached listeners
     */
    BaseEvent.prototype.listenerCount = function () {
        return (this._listeners ? this._listeners.length : 0);
    };
    /**
     * Call the given listener, if it is not marked as 'deleted'
     * @param listener The listener to call
     * @param args The arguments to the handler
     */
    BaseEvent.prototype._call = function (listener, args) {
        if (!listener.deleted) {
            if (listener.once) {
                // remove listeners AND mark as deleted so subclasses don't send any more events to them
                listener.deleted = true;
                this._listeners = this._listeners.filter(function (l) { return l !== listener; });
                if (this._listeners.length === 0) {
                    delete this._listeners;
                }
            }
            if (listener.event) {
                listener.event.post.apply(listener.event, args);
            }
            else {
                listener.handler.apply((typeof listener.boundTo === 'object' ? listener.boundTo : this), args);
            }
        }
    };
    return BaseEvent;
}());
exports.BaseEvent = BaseEvent;

},{}],5:[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function shallowEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== typeof b) {
        return false;
    }
    switch (typeof a) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'function':
        case 'symbol':
        case 'undefined':
            // already did === compare
            return false;
        case 'object':
            if (a === null || b === null) {
                return false; // already compared ===
            }
            if (Array.isArray(a) || Array.isArray(b)) {
                if (!Array.isArray(a) || !Array.isArray(b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) {
                        return false;
                    }
                }
                return true;
            }
            var namesA = [];
            var namesB = [];
            for (var name_1 in a) {
                if (a.hasOwnProperty(name_1)) {
                    namesA.push(name_1);
                }
            }
            for (var name_2 in b) {
                if (b.hasOwnProperty(name_2)) {
                    namesB.push(name_2);
                }
            }
            namesA.sort();
            namesB.sort();
            if (namesA.join(',') !== namesB.join(',')) {
                return false;
            }
            for (var i = 0; i < namesA.length; ++i) {
                if (a[namesA[i]] !== b[namesA[i]]) {
                    return false;
                }
            }
            return true;
        default:
            return false;
    }
}
exports.shallowEquals = shallowEquals;

},{}],6:[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_event_1 = require("./base-event");
var EventQueue_1 = require("./EventQueue");
/**
 * Event that stays in a queue until you process the queue. Allows fine-grained
 * control over when events happen.
 * - Optionally condenses multiple post() calls into one.
 * - Handlers are called only for events posted after they were attached.
 * - Handlers are not called anymore when they are detached, even if a post() is in progress
 */
var QueuedEvent = /** @class */ (function (_super) {
    __extends(QueuedEvent, _super);
    /**
     * Constructor
     * @param opts Optional, an object with the following members:
     *             - condensed: a Boolean indicating whether to condense multiple calls to post() into one (default false)
     *             - queue: a specific event queue to use. The global EventQueue instance is used if not given.
     */
    function QueuedEvent(opts) {
        var _this = _super.call(this) || this;
        _this._queued = false;
        _this.options = opts;
        var options = opts || {};
        if (typeof options.condensed === 'boolean') {
            _this._condensed = options.condensed;
        }
        else {
            _this._condensed = false;
        }
        if (typeof options.queue === 'object' && options.queue !== null) {
            _this._queue = options.queue;
        }
        return _this;
    }
    QueuedEvent.prototype.post = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._listeners || this._listeners.length === 0) {
            return;
        }
        var queue = (this._queue ? this._queue : EventQueue_1.default.global());
        if (this._condensed) {
            this._queuedData = args;
            this._queuedListeners = this._listeners;
            if (this._queued) {
                return;
            }
            else {
                this._queued = true;
                queue.add(function () {
                    // immediately mark non-queued to allow new AsyncEvent to happen as result
                    // of calling handlers
                    _this._queued = false;
                    // cache listeners and data because they might change while calling event handlers
                    var data = _this._queuedData;
                    var listeners = _this._queuedListeners;
                    for (var i = 0; i < listeners.length; ++i) {
                        var listener = listeners[i];
                        _this._call(listener, data);
                    }
                });
            }
        }
        else { // not condensed
            var listeners_1 = this._listeners;
            queue.add(function () {
                for (var i = 0; i < listeners_1.length; ++i) {
                    var listener = listeners_1[i];
                    _this._call(listener, args);
                }
            });
        }
    };
    return QueuedEvent;
}(base_event_1.BaseEvent));
exports.QueuedEvent = QueuedEvent;
/**
 * Convenience class for events without data
 */
var VoidQueuedEvent = /** @class */ (function (_super) {
    __extends(VoidQueuedEvent, _super);
    function VoidQueuedEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Send the event.
     */
    VoidQueuedEvent.prototype.post = function () {
        _super.prototype.post.call(this, undefined);
    };
    return VoidQueuedEvent;
}(QueuedEvent));
exports.VoidQueuedEvent = VoidQueuedEvent;
/**
 * Similar to 'error' event on EventEmitter: throws when a post() occurs while no handlers set.
 */
var ErrorQueuedEvent = /** @class */ (function (_super) {
    __extends(ErrorQueuedEvent, _super);
    function ErrorQueuedEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorQueuedEvent.prototype.post = function (data) {
        if (!this._listeners || this._listeners.length === 0) {
            throw new Error("error event posted while no listeners attached. Error: " + data.message);
        }
        _super.prototype.post.call(this, data);
    };
    return ErrorQueuedEvent;
}(QueuedEvent));
exports.ErrorQueuedEvent = ErrorQueuedEvent;

},{"./EventQueue":1,"./base-event":4}],7:[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_event_1 = require("./base-event");
/**
 * This is a true EventEmitter replacement: the handlers are called synchronously when
 * you post the event.
 * - Allows better error handling by aggregating any errors thrown by handlers.
 * - Prevents livelock by throwing an error when recursion depth is above a maximum.
 * - Handlers are called only for events posted after they were attached.
 * - Handlers are not called anymore when they are detached, even if a post() is in progress
 */
var SyncEvent = /** @class */ (function (_super) {
    __extends(SyncEvent, _super);
    function SyncEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Recursive post() invocations
         */
        _this._recursion = 0;
        return _this;
    }
    SyncEvent.prototype.post = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._listeners || this._listeners.length === 0) {
            return;
        }
        this._recursion++;
        if (SyncEvent.MAX_RECURSION_DEPTH > 0 &&
            this._recursion > SyncEvent.MAX_RECURSION_DEPTH) {
            throw new Error('event fired recursively');
        }
        // copy a reference to the array because this._listeners might be replaced during
        // the handler calls
        var listeners = this._listeners;
        for (var i = 0; i < listeners.length; ++i) {
            var listener = listeners[i];
            this._call(listener, args);
        }
        this._recursion--;
    };
    /**
     * Maximum number of times that an event handler may cause the same event
     * recursively.
     */
    SyncEvent.MAX_RECURSION_DEPTH = 10;
    return SyncEvent;
}(base_event_1.BaseEvent));
exports.SyncEvent = SyncEvent;
/**
 * Convenience class for events without data
 */
var VoidSyncEvent = /** @class */ (function (_super) {
    __extends(VoidSyncEvent, _super);
    function VoidSyncEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Send the event.
     */
    VoidSyncEvent.prototype.post = function () {
        _super.prototype.post.call(this, undefined);
    };
    return VoidSyncEvent;
}(SyncEvent));
exports.VoidSyncEvent = VoidSyncEvent;
/**
 * Similar to 'error' event on EventEmitter: throws when a post() occurs while no handlers set.
 */
var ErrorSyncEvent = /** @class */ (function (_super) {
    __extends(ErrorSyncEvent, _super);
    function ErrorSyncEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorSyncEvent.prototype.post = function (data) {
        if (this.listenerCount() === 0) {
            throw new Error("error event posted while no listeners attached. Error: " + data.message);
        }
        _super.prototype.post.call(this, data);
    };
    return ErrorSyncEvent;
}(SyncEvent));
exports.ErrorSyncEvent = ErrorSyncEvent;

},{"./base-event":4}],8:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],9:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":8,"timers":9}],"ts-events":[function(require,module,exports){
// Copyright © 2015 Rogier Schouten<github@workingcode.ninja>
// License: ISC
'use strict';
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./base-event"));
__export(require("./sync-event"));
__export(require("./queued-event"));
__export(require("./async-event"));
__export(require("./any-event"));
var EventQueue_1 = require("./EventQueue");
var EventQueue_2 = require("./EventQueue");
exports.EventQueue = EventQueue_2.default;
/**
 * The global event queue for QueuedEvents
 */
function queue() {
    return EventQueue_1.default.global();
}
exports.queue = queue;
/**
 * Convenience function, same as EventQueue.global().flushOnce().
 * Flushes the QueuedEvents, calling all events currently in the queue but not
 * any events put into the queue as a result of the flush.
 */
function flushOnce() {
    EventQueue_1.default.global().flushOnce();
}
exports.flushOnce = flushOnce;
/**
 * Convenience function, same as EventQueue.global().flush().
 * Flushes the QueuedEvents, calling all handlers currently in the queue and those
 * put into the queue as a result of the flush.
 * @param maxRounds Optional, default 10. Number of iterations after which to throw an error because
 *                  the queue keeps filling up. Set to undefined or null to disable this.
 */
function flush(maxRounds) {
    if (maxRounds === void 0) { maxRounds = 10; }
    EventQueue_1.default.global().flush(maxRounds);
}
exports.flush = flush;

},{"./EventQueue":1,"./any-event":2,"./async-event":3,"./base-event":4,"./queued-event":6,"./sync-event":7}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL0V2ZW50UXVldWUudHMiLCJzcmMvbGliL2FueS1ldmVudC50cyIsImRpc3QvbGliL3NyYy9saWIvYXN5bmMtZXZlbnQudHMiLCJzcmMvbGliL2Jhc2UtZXZlbnQudHMiLCJzcmMvbGliL29iamVjdHMudHMiLCJzcmMvbGliL3F1ZXVlZC1ldmVudC50cyIsInNyYy9saWIvc3luYy1ldmVudC50cyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcyIsInNyYy9saWIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSw2REFBNkQ7QUFDN0QsZUFBZTtBQUVmLFlBQVksQ0FBQzs7QUFFYiwyQ0FBdUM7QUFFdkM7O0dBRUc7QUFDSDtJQUFBO1FBRUk7OztXQUdHO1FBQ0ksY0FBUyxHQUEwQixJQUFJLHNCQUFTLEVBQWMsQ0FBQztRQUN0RTs7O1dBR0c7UUFDSSxlQUFVLEdBQTBCLElBQUksc0JBQVMsRUFBYyxDQUFDO1FBd0J2RTs7V0FFRztRQUNLLFdBQU0sR0FBbUIsRUFBRSxDQUFDO1FBRXBDOztXQUVHO1FBQ0ssY0FBUyxHQUFZLEtBQUssQ0FBQztJQXFFdkMsQ0FBQztJQTlGRzs7T0FFRztJQUNXLGlCQUFNLEdBQXBCO1FBQ0ksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDdkIsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxVQUFVLENBQUMsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNXLHNCQUFXLEdBQXpCO1FBQ0ksVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFZRDs7T0FFRztJQUNJLDBCQUFLLEdBQVo7UUFDSSxPQUFPLElBQUksQ0FBQyxNQUFN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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzRUEsNkRBQTZEO0FBQzdELGVBQWU7QUFFZixZQUFZLENBQUM7Ozs7O0FBRWIsa0NBQTZCO0FBQzdCLGtDQUE2QjtBQUM3QixvQ0FBK0I7QUFDL0IsbUNBQThCO0FBQzlCLGlDQUE0QjtBQUU1QiwyQ0FBbUQ7QUFDbkQsMkNBQW1EO0FBQTNDLGtDQUFBLE9BQU8sQ0FBYztBQUU3Qjs7R0FFRztBQUNILFNBQWdCLEtBQUs7SUFDakIsT0FBTyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFGRCxzQkFFQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixTQUFTO0lBQ3JCLG9CQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUZELDhCQUVDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLFNBQXNCO0lBQXRCLDBCQUFBLEVBQUEsY0FBc0I7SUFDeEMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUZELHNCQUVDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ29weXJpZ2h0IMKpIDIwMTUgUm9naWVyIFNjaG91dGVuPGdpdGh1YkB3b3JraW5nY29kZS5uaW5qYT5cclxuLy8gTGljZW5zZTogSVNDXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge1N5bmNFdmVudH0gZnJvbSAnLi9zeW5jLWV2ZW50JztcclxuXHJcbi8qKlxyXG4gKiBTaW1wbGUgc3luY2hyb25vdXMgZXZlbnQgcXVldWUgdGhhdCBuZWVkcyB0byBiZSBkcmFpbmVkIG1hbnVhbGx5LlxyXG4gKi9cclxuY2xhc3MgRXZlbnRRdWV1ZSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTeW5jRXZlbnQgdHJpZ2dlcmVkIGFmdGVyIGFuIGV2ZW50IGlzIGFkZGVkIG91dHNpZGUgb2YgYSBmbHVzaCBvcGVyYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gcXVldWUgVGhlIGV2ZW50IHF1ZXVlIGl0c2VsZlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZXZ0RmlsbGVkOiBTeW5jRXZlbnQ8RXZlbnRRdWV1ZT4gPSBuZXcgU3luY0V2ZW50PEV2ZW50UXVldWU+KCk7XHJcbiAgICAvKipcclxuICAgICAqIFN5bmNFdmVudCB0cmlnZ2VyZWQgYWZ0ZXIgdGhlIHF1ZXVlIGlzIGZsdXNoZWQgZW1wdHlcclxuICAgICAqIEBwYXJhbSBxdWV1ZSBUaGUgZXZlbnQgcXVldWUgaXRzZWxmXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBldnREcmFpbmVkOiBTeW5jRXZlbnQ8RXZlbnRRdWV1ZT4gPSBuZXcgU3luY0V2ZW50PEV2ZW50UXVldWU+KCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9kdWxlLWdsb2JhbCBldmVudCBxdWV1ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IEV2ZW50UXVldWU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9kdWxlLWdsb2JhbCBldmVudCBxdWV1ZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdsb2JhbCgpOiBFdmVudFF1ZXVlIHtcclxuICAgICAgICBpZiAoIUV2ZW50UXVldWUuX2luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIEV2ZW50UXVldWUucmVzZXRHbG9iYWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEV2ZW50UXVldWUuX2luc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVzdGluZyBwdXJwb3Nlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlc2V0R2xvYmFsKCk6IHZvaWQge1xyXG4gICAgICAgIEV2ZW50UXVldWUuX2luc3RhbmNlID0gbmV3IEV2ZW50UXVldWUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXVlZCBlbGVtZW50c1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9xdWV1ZTogKCgpID0+IHZvaWQpW10gPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRydWUgd2hpbGUgZmx1c2goKSBvciBmbHVzaE9uY2UoKSBpcyBydW5uaW5nXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ZsdXNoaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBxdWV1ZSBpcyBlbXB0eVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhbiBlbGVtZW50IHRvIHRoZSBxdWV1ZS4gVGhlIGhhbmRsZXIgaXMgY2FsbGVkIHdoZW4gb25lIG9mIHRoZSBmbHVzaFxyXG4gICAgICogbWV0aG9kcyBpcyBjYWxsZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goaGFuZGxlcik7XHJcbiAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhdGhpcy5fZmx1c2hpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5ldnRGaWxsZWQucG9zdCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxscyBhbGwgaGFuZGxlcnMgY3VycmVudGx5IGluIHRoZSBxdWV1ZS4gRG9lcyBub3QgY2FsbCBhbnkgaGFuZGxlcnMgYWRkZWRcclxuICAgICAqIGFzIGEgcmVzdWx0IG9mIHRoZSBmbHVzaFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmx1c2hPbmNlKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGVtcHR5ID0gKHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgY29uc3QgZmx1c2hpbmcgPSB0aGlzLl9mbHVzaGluZztcclxuICAgICAgICB0aGlzLl9mbHVzaGluZyA9IHRydWU7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcXVldWUgPSB0aGlzLl9xdWV1ZTtcclxuICAgICAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgcXVldWVbaV0oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmx1c2hpbmc7XHJcbiAgICAgICAgICAgIGlmICghZW1wdHkgJiYgIWZsdXNoaW5nICYmIHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldnREcmFpbmVkLnBvc3QodGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGbHVzaGVzIHRoZSBRdWV1ZWRFdmVudHMsIGNhbGxpbmcgYWxsIGV2ZW50cyBjdXJyZW50bHkgaW4gdGhlIHF1ZXVlIGFuZCB0aG9zZVxyXG4gICAgICogcHV0IGludG8gdGhlIHF1ZXVlIGFzIGEgcmVzdWx0IG9mIHRoZSBmbHVzaC5cclxuICAgICAqIEBwYXJhbSBtYXhSb3VuZHMgT3B0aW9uYWwsIGRlZmF1bHQgMTAuIE51bWJlciBvZiBpdGVyYXRpb25zIGFmdGVyIHdoaWNoIHRvIHRocm93IGFuIGVycm9yIGJlY2F1c2VcclxuICAgICAqICAgICAgICAgICAgICAgICAgdGhlIHF1ZXVlIGtlZXBzIGZpbGxpbmcgdXAuIFNldCB0byBudWxsIHRvIGRpc2FibGUgdGhpcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGZsdXNoKG1heFJvdW5kczogbnVtYmVyID0gMTApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBlbXB0eSA9ICh0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDApO1xyXG4gICAgICAgIGNvbnN0IGZsdXNoaW5nID0gdGhpcy5fZmx1c2hpbmc7XHJcbiAgICAgICAgdGhpcy5fZmx1c2hpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWF4Um91bmRzID09PSAnbnVtYmVyJyAmJiBpID49IG1heFJvdW5kcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gZmx1c2ggdGhlIHF1ZXVlIGR1ZSB0byByZWN1cnNpdmVseSBhZGRlZCBldmVudC4gQ2xlYXJpbmcgcXVldWUgbm93Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZsdXNoT25jZSgpO1xyXG4gICAgICAgICAgICAgICAgKytpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgdGhpcy5fZmx1c2hpbmcgPSBmbHVzaGluZztcclxuICAgICAgICAgICAgaWYgKCFlbXB0eSAmJiAhZmx1c2hpbmcgJiYgdGhpcy5fcXVldWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2dERyYWluZWQucG9zdCh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRRdWV1ZTtcclxuIiwiLy8gQ29weXJpZ2h0IMKpIDIwMTUgUm9naWVyIFNjaG91dGVuPGdpdGh1YkB3b3JraW5nY29kZS5uaW5qYT5cclxuLy8gTGljZW5zZTogSVNDXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge3NoYWxsb3dFcXVhbHN9IGZyb20gJy4vb2JqZWN0cyc7XHJcblxyXG5pbXBvcnQge0Jhc2VFdmVudCwgUG9zdGFibGUsIExpc3RlbmVyfSBmcm9tICcuL2Jhc2UtZXZlbnQnO1xyXG5pbXBvcnQge1N5bmNFdmVudH0gZnJvbSAnLi9zeW5jLWV2ZW50JztcclxuaW1wb3J0IHtBc3luY0V2ZW50LCBBc3luY0V2ZW50T3B0c30gZnJvbSAnLi9hc3luYy1ldmVudCc7XHJcbmltcG9ydCB7UXVldWVkRXZlbnQsIFF1ZXVlZEV2ZW50T3B0c30gZnJvbSAnLi9xdWV1ZWQtZXZlbnQnO1xyXG5cclxuZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcclxuICAgIFN5bmMsXHJcbiAgICBBc3luYyxcclxuICAgIFF1ZXVlZFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFueUV2ZW50T3B0cyB7XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBldnRGaXJzdEF0dGFjaGVkIGFuZCBldnRMYXN0RGV0YWNoZWQgc28geW91IGNhbiBtb25pdG9yIHdoZW4gc29tZW9uZSBpcyBzdWJzY3JpYmVkXHJcbiAgICAgKi9cclxuICAgIG1vbml0b3JBdHRhY2g/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQW4gZXZlbnQgdGhhdCBiZWhhdmVzIGxpa2UgYSBTeW5jL0FzeW5jL1F1ZXVlZCBldmVudCBkZXBlbmRpbmcgb24gaG93XHJcbiAqIHlvdSBzdWJzY3JpYmUuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQW55RXZlbnQ8VD4gaW1wbGVtZW50cyBQb3N0YWJsZTxUPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmlnZ2VyZWQgd2hlbmV2ZXIgc29tZW9uZSBhdHRhY2hlcyBhbmQgbm9ib2R5IHdhcyBhdHRhY2hlZC5cclxuICAgICAqIE5vdGU6IHlvdSBtdXN0IGNhbGwgdGhlIGNvbnN0cnVjdG9yIHdpdGggbW9uaXRvckF0dGFjaCBzZXQgdG8gdHJ1ZSB0byBjcmVhdGUgdGhpcyBldmVudCFcclxuICAgICAqL1xyXG4gICAgcHVibGljIGV2dEZpcnN0QXR0YWNoZWQ6IFZvaWRBbnlFdmVudDtcclxuICAgIC8qKlxyXG4gICAgICogVHJpZ2dlcmVkIHdoZW5ldmVyIHNvbWVvbmUgZGV0YWNoZXMgYW5kIG5vYm9keSBpcyBhdHRhY2hlZCBhbnltb3JlXHJcbiAgICAgKiBOb3RlOiB5b3UgbXVzdCBjYWxsIHRoZSBjb25zdHJ1Y3RvciB3aXRoIG1vbml0b3JBdHRhY2ggc2V0IHRvIHRydWUgdG8gY3JlYXRlIHRoaXMgZXZlbnQhXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBldnRMYXN0RGV0YWNoZWQ6IFZvaWRBbnlFdmVudDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuZGVybHlpbmcgZXZlbnQgaW1wbGVtZW50YXRpb25zOyBvbmUgZm9yIGV2ZXJ5IGF0dGFjaCB0eXBlICsgb3B0cyBjb21iaW5hdGlvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9ldmVudHM6IEJhc2VFdmVudDxUPltdID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0cz86IEFueUV2ZW50T3B0cykge1xyXG4gICAgICAgIGlmIChvcHRzICYmIG9wdHMubW9uaXRvckF0dGFjaCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2dEZpcnN0QXR0YWNoZWQgPSBuZXcgVm9pZEFueUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXZ0TGFzdERldGFjaGVkID0gbmV3IFZvaWRBbnlFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExlZ2FjeSBtZXRob2RcclxuICAgICAqIHNhbWUgYXMgYXR0YWNoU3luYy9hdHRhY2hBc3luYy9hdHRhY2hRdWV1ZWQ7IGJhc2VkIG9uIHRoZSBnaXZlbiBlbnVtXHJcbiAgICAgKiBAcGFyYW0gbW9kZSBkZXRlcm1pbmVzIHdoZXRoZXIgdG8gYXR0YWNoIHN5bmMvYXN5bmMvcXVldWVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhdHRhY2goaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQsIG9wdHM/OiBBc3luY0V2ZW50T3B0cyB8IFF1ZXVlZEV2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgYXR0YWNoKGJvdW5kVG86IE9iamVjdCwgaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQsIG9wdHM/OiBBc3luY0V2ZW50T3B0cyB8IFF1ZXVlZEV2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgYXR0YWNoKGV2ZW50OiBQb3N0YWJsZTxUPiwgb3B0cz86IEFzeW5jRXZlbnRPcHRzIHwgUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2gobW9kZTogRXZlbnRUeXBlLCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCwgb3B0cz86IEFzeW5jRXZlbnRPcHRzIHwgUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2gobW9kZTogRXZlbnRUeXBlLCBib3VuZFRvOiBPYmplY3QsIGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkLCBvcHRzPzogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIGF0dGFjaChtb2RlOiBFdmVudFR5cGUsIGV2ZW50OiBQb3N0YWJsZTxUPiwgb3B0cz86IEFzeW5jRXZlbnRPcHRzIHwgUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2goLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBsZXQgbW9kZSA9IEV2ZW50VHlwZS5TeW5jO1xyXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDAgJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG1vZGUgPSBhcmdzLnNoaWZ0KCkgYXMgRXZlbnRUeXBlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYm91bmRUbzogT2JqZWN0ID0gdGhpczsgLy8gYWRkIG91cnNlbHZlcyBhcyBkZWZhdWx0ICdib3VuZFRvJyBhcmd1bWVudFxyXG4gICAgICAgIGxldCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZDtcclxuICAgICAgICBsZXQgb3B0czogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHM7XHJcbiAgICAgICAgbGV0IHBvc3RhYmxlOiBQb3N0YWJsZTxUPjtcclxuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdmdW5jdGlvbicgfHwgKGFyZ3NbMF0gJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdvYmplY3QnICYmIHR5cGVvZiBhcmdzWzBdLnBvc3QgPT09ICdmdW5jdGlvbicpKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGFyZ3NbMF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwb3N0YWJsZSA9IGFyZ3NbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0cyA9IGFyZ3NbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm91bmRUbyA9IGFyZ3NbMF07XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSBhcmdzWzFdO1xyXG4gICAgICAgICAgICBvcHRzID0gYXJnc1syXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXR0YWNoKG1vZGUsIGJvdW5kVG8sIGhhbmRsZXIsIHBvc3RhYmxlLCBvcHRzLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMZWdhY3kgbWV0aG9kXHJcbiAgICAgKiBzYW1lIGFzIG9uY2VTeW5jL29uY2VBc3luYy9vbmNlUXVldWVkOyBiYXNlZCBvbiB0aGUgZ2l2ZW4gZW51bVxyXG4gICAgICogQHBhcmFtIG1vZGUgZGV0ZXJtaW5lcyB3aGV0aGVyIHRvIG9uY2Ugc3luYy9hc3luYy9xdWV1ZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uY2UoaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQsIG9wdHM/OiBBc3luY0V2ZW50T3B0cyB8IFF1ZXVlZEV2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgb25jZShib3VuZFRvOiBPYmplY3QsIGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkLCBvcHRzPzogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2UoZXZlbnQ6IFBvc3RhYmxlPFQ+LCBvcHRzPzogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2UobW9kZTogRXZlbnRUeXBlLCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCwgb3B0cz86IEFzeW5jRXZlbnRPcHRzIHwgUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBvbmNlKG1vZGU6IEV2ZW50VHlwZSwgYm91bmRUbzogT2JqZWN0LCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCwgb3B0cz86IEFzeW5jRXZlbnRPcHRzIHwgUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBvbmNlKG1vZGU6IEV2ZW50VHlwZSwgZXZlbnQ6IFBvc3RhYmxlPFQ+LCBvcHRzPzogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2UoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBsZXQgbW9kZSA9IEV2ZW50VHlwZS5TeW5jO1xyXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDAgJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG1vZGUgPSBhcmdzLnNoaWZ0KCkgYXMgRXZlbnRUeXBlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYm91bmRUbzogT2JqZWN0ID0gdGhpczsgLy8gYWRkIG91cnNlbHZlcyBhcyBkZWZhdWx0ICdib3VuZFRvJyBhcmd1bWVudFxyXG4gICAgICAgIGxldCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZDtcclxuICAgICAgICBsZXQgb3B0czogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHM7XHJcbiAgICAgICAgbGV0IHBvc3RhYmxlOiBQb3N0YWJsZTxUPjtcclxuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdmdW5jdGlvbicgfHwgKGFyZ3NbMF0gJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdvYmplY3QnICYmIHR5cGVvZiBhcmdzWzBdLnBvc3QgPT09ICdmdW5jdGlvbicpKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IGFyZ3NbMF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwb3N0YWJsZSA9IGFyZ3NbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3B0cyA9IGFyZ3NbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm91bmRUbyA9IGFyZ3NbMF07XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSBhcmdzWzFdO1xyXG4gICAgICAgICAgICBvcHRzID0gYXJnc1syXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXR0YWNoKG1vZGUsIGJvdW5kVG8sIGhhbmRsZXIsIHBvc3RhYmxlLCBvcHRzLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hdHRhY2goXHJcbiAgICAgICAgbW9kZTogRXZlbnRUeXBlLFxyXG4gICAgICAgIGJvdW5kVG86IE9iamVjdCB8IHVuZGVmaW5lZCxcclxuICAgICAgICBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCB8IHVuZGVmaW5lZCxcclxuICAgICAgICBwb3N0YWJsZTogUG9zdGFibGU8VD4gfCB1bmRlZmluZWQsXHJcbiAgICAgICAgb3B0czogQXN5bmNFdmVudE9wdHMgfCBRdWV1ZWRFdmVudE9wdHMgfCB1bmRlZmluZWQsXHJcbiAgICAgICAgb25jZTogYm9vbGVhblxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcHJldkNvdW50ID0gKCEhdGhpcy5ldnRGaXJzdEF0dGFjaGVkID8gdGhpcy5saXN0ZW5lckNvdW50KCkgOiAwKTtcclxuICAgICAgICBsZXQgZXZlbnQ6IEJhc2VFdmVudDxUPjtcclxuICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFdmVudFR5cGUuU3luYzoge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBldnQgb2YgdGhpcy5fZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2dCBpbnN0YW5jZW9mIFN5bmNFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudCA9IGV2dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBuZXcgU3luY0V2ZW50PFQ+KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnB1c2goZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5Bc3luYzoge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBldnQgb2YgdGhpcy5fZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2dCBpbnN0YW5jZW9mIEFzeW5jRXZlbnQgJiYgc2hhbGxvd0VxdWFscygoPEFzeW5jRXZlbnQ8VD4+ZXZ0KS5vcHRpb25zLCBvcHRzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudCA9IGV2dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBuZXcgQXN5bmNFdmVudDxUPihvcHRzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlF1ZXVlZDoge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBldnQgb2YgdGhpcy5fZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2dCBpbnN0YW5jZW9mIFF1ZXVlZEV2ZW50ICYmIHNoYWxsb3dFcXVhbHMoKDxRdWV1ZWRFdmVudDxUPj5ldnQpLm9wdGlvbnMsIG9wdHMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gZXZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudCA9IG5ldyBRdWV1ZWRFdmVudDxUPihvcHRzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gRXZlbnRUeXBlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbmNlKSB7XHJcbiAgICAgICAgICAgIGlmIChwb3N0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQub25jZShwb3N0YWJsZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5vbmNlKGJvdW5kVG8sIGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBvc3RhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5hdHRhY2gocG9zdGFibGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuYXR0YWNoKGJvdW5kVG8sIGhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmV2dEZpcnN0QXR0YWNoZWQgJiYgcHJldkNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZ0Rmlyc3RBdHRhY2hlZC5wb3N0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhdHRhY2hTeW5jKGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2hTeW5jKGJvdW5kVG86IE9iamVjdCwgaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgcHVibGljIGF0dGFjaFN5bmMoZXZlbnQ6IFBvc3RhYmxlPFQ+KTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2hTeW5jKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgYXJncy51bnNoaWZ0KEV2ZW50VHlwZS5TeW5jKTtcclxuICAgICAgICB0aGlzLmF0dGFjaC5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25jZVN5bmMoaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2VTeW5jKGJvdW5kVG86IE9iamVjdCwgaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2VTeW5jKGV2ZW50OiBQb3N0YWJsZTxUPik6IHZvaWQ7XHJcbiAgICBwdWJsaWMgb25jZVN5bmMoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBhcmdzLnVuc2hpZnQoRXZlbnRUeXBlLlN5bmMpO1xyXG4gICAgICAgIHRoaXMub25jZS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXR0YWNoQXN5bmMoaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQsIG9wdHM/OiBBc3luY0V2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgYXR0YWNoQXN5bmMoYm91bmRUbzogT2JqZWN0LCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCwgb3B0cz86IEFzeW5jRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2hBc3luYyhldmVudDogUG9zdGFibGU8VD4sIG9wdHM/OiBBc3luY0V2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgYXR0YWNoQXN5bmMoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBhcmdzLnVuc2hpZnQoRXZlbnRUeXBlLkFzeW5jKTtcclxuICAgICAgICB0aGlzLmF0dGFjaC5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25jZUFzeW5jKGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkLCBvcHRzPzogQXN5bmNFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2VBc3luYyhib3VuZFRvOiBPYmplY3QsIGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkLCBvcHRzPzogQXN5bmNFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2VBc3luYyhldmVudDogUG9zdGFibGU8VD4sIG9wdHM/OiBBc3luY0V2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgb25jZUFzeW5jKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgYXJncy51bnNoaWZ0KEV2ZW50VHlwZS5Bc3luYyk7XHJcbiAgICAgICAgdGhpcy5vbmNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhdHRhY2hRdWV1ZWQoaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQsIG9wdHM/OiBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIGF0dGFjaFF1ZXVlZChib3VuZFRvOiBPYmplY3QsIGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkLCBvcHRzPzogUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2hRdWV1ZWQoZXZlbnQ6IFBvc3RhYmxlPFQ+LCBvcHRzPzogUXVldWVkRXZlbnRPcHRzKTogdm9pZDtcclxuICAgIHB1YmxpYyBhdHRhY2hRdWV1ZWQoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBhcmdzLnVuc2hpZnQoRXZlbnRUeXBlLlF1ZXVlZCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2guYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uY2VRdWV1ZWQoaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQsIG9wdHM/OiBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2VRdWV1ZWQoYm91bmRUbzogT2JqZWN0LCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCwgb3B0cz86IFF1ZXVlZEV2ZW50T3B0cyk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgb25jZVF1ZXVlZChldmVudDogUG9zdGFibGU8VD4sIG9wdHM/OiBRdWV1ZWRFdmVudE9wdHMpOiB2b2lkO1xyXG4gICAgcHVibGljIG9uY2VRdWV1ZWQoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBhcmdzLnVuc2hpZnQoRXZlbnRUeXBlLlF1ZXVlZCk7XHJcbiAgICAgICAgdGhpcy5vbmNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXRhY2goaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgcHVibGljIGRldGFjaChib3VuZFRvOiBPYmplY3QsIGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkKTogdm9pZDtcclxuICAgIHB1YmxpYyBkZXRhY2goYm91bmRUbzogT2JqZWN0KTogdm9pZDtcclxuICAgIHB1YmxpYyBkZXRhY2goZXZlbnQ6IFBvc3RhYmxlPFQ+KTogdm9pZDtcclxuICAgIHB1YmxpYyBkZXRhY2goKTogdm9pZDtcclxuICAgIC8qKlxyXG4gICAgICogRGV0YWNoIGV2ZW50IGhhbmRsZXJzIHJlZ2FyZGxlc3Mgb2YgdHlwZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGV0YWNoKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcHJldkNvdW50ID0gKCEhdGhpcy5ldnRMYXN0RGV0YWNoZWQgPyB0aGlzLmxpc3RlbmVyQ291bnQoKSA6IDApO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZXZlbnRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50c1tpXS5kZXRhY2guYXBwbHkodGhpcy5fZXZlbnRzW2ldLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEhdGhpcy5ldnRMYXN0RGV0YWNoZWQgJiYgcHJldkNvdW50ID4gMCAmJiB0aGlzLmxpc3RlbmVyQ291bnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2dExhc3REZXRhY2hlZC5wb3N0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUG9zdCBhbiBldmVudCB0byBhbGwgY3VycmVudCBsaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHBvc3QoZGF0YTogVCk6IHZvaWQge1xyXG4gICAgICAgIC8vIG1ha2UgYSBjb3B5IG9mIHRoZSBhcnJheSBmaXJzdCB0byBjb3ZlciB0aGUgY2FzZSB3aGVyZSBldmVudCBoYW5kbGVyc1xyXG4gICAgICAgIC8vIGFyZSBhdHRhY2hlZCBkdXJpbmcgdGhlIHBvc3RcclxuICAgICAgICBjb25zdCBldmVudHM6IEJhc2VFdmVudDxUPltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9ldmVudHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgZXZlbnRzLnB1c2godGhpcy5fZXZlbnRzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgZXZlbnRzW2ldLnBvc3QoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG51bWJlciBvZiBhdHRhY2hlZCBsaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGxpc3RlbmVyQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2V2ZW50cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gdGhpcy5fZXZlbnRzW2ldLmxpc3RlbmVyQ291bnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlbmllbmNlIGNsYXNzIGZvciBBbnlFdmVudHMgd2l0aG91dCBkYXRhXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVm9pZEFueUV2ZW50IGV4dGVuZHMgQW55RXZlbnQ8dm9pZD4ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCB0aGUgQXN5bmNFdmVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHBvc3QoKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIucG9zdCh1bmRlZmluZWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2ltaWxhciB0byAnZXJyb3InIGV2ZW50IG9uIEV2ZW50RW1pdHRlcjogdGhyb3dzIHdoZW4gYSBwb3N0KCkgb2NjdXJzIHdoaWxlIG5vIGhhbmRsZXJzIHNldC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFcnJvckFueUV2ZW50IGV4dGVuZHMgQW55RXZlbnQ8RXJyb3I+IHtcclxuXHJcbiAgICBwdWJsaWMgcG9zdChkYXRhOiBFcnJvcik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3RlbmVyQ291bnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGVycm9yIGV2ZW50IHBvc3RlZCB3aGlsZSBubyBsaXN0ZW5lcnMgYXR0YWNoZWQuIEVycm9yOiAke2RhdGEubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3VwZXIucG9zdChkYXRhKTtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgwqkgMjAxNSBSb2dpZXIgU2Nob3V0ZW48Z2l0aHViQHdvcmtpbmdjb2RlLm5pbmphPlxyXG4vLyBMaWNlbnNlOiBJU0NcclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7QmFzZUV2ZW50LCBQb3N0YWJsZSwgTGlzdGVuZXJ9IGZyb20gJy4vYmFzZS1ldmVudCc7XHJcblxyXG4vKipcclxuICogT3B0aW9ucyBmb3IgdGhlIEFzeW5jRXZlbnQgY29uc3RydWN0b3JcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNFdmVudE9wdHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25kZW5zZSBtdWx0aXBsZSBjYWxscyB0byBwb3N0KCkgaW50byBvbmUgd2hpbGUgdGhlIHByZXZpb3VzIG9uZVxyXG4gICAgICogaGFzIG5vdCBiZWVuIGhhbmRsZWQgeWV0LlxyXG4gICAgICovXHJcbiAgICBjb25kZW5zZWQ/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQS1zeW5jaHJvbm91cyBldmVudC4gSGFuZGxlcnMgYXJlIGNhbGxlZCBpbiB0aGUgbmV4dCBOb2RlLkpTIGN5Y2xlLlxyXG4gKiAtIE9wdGlvbmFsbHkgY29uZGVuc2VzIG11bHRpcGxlIHBvc3QoKSBjYWxscyBpbnRvIG9uZSAodGhlIGxhc3QgcG9zdCgpIGdldHMgdGhyb3VnaClcclxuICogLSBIYW5kbGVycyBhcmUgY2FsbGVkIG9ubHkgZm9yIGV2ZW50cyBwb3N0ZWQgYWZ0ZXIgdGhleSB3ZXJlIGF0dGFjaGVkLlxyXG4gKiAtIEhhbmRsZXJzIGFyZSBub3QgY2FsbGVkIGFueW1vcmUgd2hlbiB0aGV5IGFyZSBkZXRhY2hlZCwgZXZlbiBpZiBhIHBvc3QoKSBpcyBpbiBwcm9ncmVzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEFzeW5jRXZlbnQ8VD4gZXh0ZW5kcyBCYXNlRXZlbnQ8VD4gaW1wbGVtZW50cyBQb3N0YWJsZTxUPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGludGVybmFsbHkgLSB0aGUgZXhhY3Qgb3B0aW9ucyBvYmplY3QgZ2l2ZW4gdG8gY29uc3RydWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9wdGlvbnM6IEFzeW5jRXZlbnRPcHRzO1xyXG5cclxuICAgIHByaXZhdGUgX2NvbmRlbnNlZDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgX3F1ZXVlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfcXVldWVkTGlzdGVuZXJzOiBMaXN0ZW5lcjxUPltdO1xyXG4gICAgcHJpdmF0ZSBfcXVldWVkRGF0YTogYW55W107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCBzY2hlZHVsZXIgdXNlcyBzZXRJbW1lZGlhdGUoKSBvciBzZXRUaW1lb3V0KC4uLiwgMCkgaWYgc2V0SW1tZWRpYXRlIGlzIG5vdCBhdmFpbGFibGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFNjaGVkdWxlcihjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICAqL1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAvLyBicm93c2VycyBkb24ndCBhbHdheXMgc3VwcG9ydCBzZXRJbW1lZGlhdGUoKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBub2RlLmpzXHJcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZShjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGN1cnJlbnQgc2NoZWR1bGVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIF9zY2hlZHVsZXI6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZCA9IEFzeW5jRXZlbnQuZGVmYXVsdFNjaGVkdWxlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJ5IGRlZmF1bHQsIEFzeW5jRXZlbnQgdXNlcyBzZXRJbW1lZGlhdGUoKSB0byBzY2hlZHVsZSBldmVudCBoYW5kbGVyIGludm9jYXRpb24uXHJcbiAgICAgKiBZb3UgY2FuIGNoYW5nZSB0aGlzIGZvciBlLmcuIHNldFRpbWVvdXQoLi4uLCAwKSBieSBjYWxsaW5nIHRoaXMgc3RhdGljIG1ldGhvZCBvbmNlLlxyXG4gICAgICogQHBhcmFtIHNjaGVkdWxlciBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjayBhbmQgZXhlY3V0ZXMgaXQgaW4gdGhlIG5leHQgTm9kZS5KUyBjeWNsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzZXRTY2hlZHVsZXIoc2NoZWR1bGVyOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICBBc3luY0V2ZW50Ll9zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIG9wdHMgT3B0aW9uYWwuIFZhcmlvdXMgc2V0dGluZ3M6XHJcbiAgICAgKiAgICAgICAgICAgICAtIGNvbmRlbnNlZDogYSBCb29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0byBjb25kZW5zZSBtdWx0aXBsZSBwb3N0KCkgY2FsbHMgd2l0aGluIHRoZSBzYW1lIGN5Y2xlLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRzPzogQXN5bmNFdmVudE9wdHMpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdHM7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uczogQXN5bmNFdmVudE9wdHMgPSBvcHRzIHx8IHt9O1xyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jb25kZW5zZWQgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICB0aGlzLl9jb25kZW5zZWQgPSBvcHRpb25zLmNvbmRlbnNlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jb25kZW5zZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIHRoZSBBc3luY0V2ZW50LiBIYW5kbGVycyBhcmUgY2FsbGVkIGluIHRoZSBuZXh0IE5vZGUuSlMgY3ljbGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwb3N0KGRhdGE6IFQpOiB2b2lkO1xyXG4gICAgcHVibGljIHBvc3QoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xpc3RlbmVycyB8fCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmRlbnNlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWV1ZWREYXRhID0gYXJncztcclxuICAgICAgICAgICAgdGhpcy5fcXVldWVkTGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcXVldWVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgQXN5bmNFdmVudC5fc2NoZWR1bGVyKCgpOiB2b2lkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpbW1lZGlhdGVseSBtYXJrIG5vbi1xdWV1ZWQgdG8gYWxsb3cgbmV3IEFzeW5jRXZlbnQgdG8gaGFwcGVuIGFzIHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9mIGNhbGxpbmcgaGFuZGxlcnNcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjYWNoZSBsaXN0ZW5lcnMgYW5kIGRhdGEgYmVjYXVzZSB0aGV5IG1pZ2h0IGNoYW5nZSB3aGlsZSBjYWxsaW5nIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuX3F1ZXVlZERhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fcXVldWVkTGlzdGVuZXJzO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWxsKGxpc3RlbmVyLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIG5vdCBjb25kZW5zZWRcclxuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xyXG4gICAgICAgICAgICBBc3luY0V2ZW50Ll9zY2hlZHVsZXIoKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWxsKGxpc3RlbmVyLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGluaGVyaXRlZFxyXG4gICAgcHJvdGVjdGVkIF9jYWxsKGxpc3RlbmVyOiBMaXN0ZW5lcjxUPiwgYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICAvLyBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb246IGRvbid0IHVzZSBjb25zZWN1dGl2ZSBub2RlanMgY3ljbGVzXHJcbiAgICAgICAgLy8gZm9yIGFzeW5jZXZlbnRzIGF0dGFjaGVkIHRvIGFzeW5jZXZlbnRzXHJcbiAgICAgICAgaWYgKGxpc3RlbmVyLmV2ZW50ICYmIGxpc3RlbmVyLmV2ZW50IGluc3RhbmNlb2YgQXN5bmNFdmVudCkge1xyXG4gICAgICAgICAgICAoPEFzeW5jRXZlbnQ8VD4+bGlzdGVuZXIuZXZlbnQpLl9wb3N0RGlyZWN0KGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN1cGVyLl9jYWxsKGxpc3RlbmVyLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb246IGlmIHRoaXMgYXN5bmMgc2lnbmFsIGlzIGF0dGFjaGVkIHRvIGFub3RoZXJcclxuICAgICAqIGFzeW5jIHNpZ25hbCwgd2UncmUgYWxyZWFkeSBhIHRoZSBuZXh0IGN5Y2xlIGFuZCB3ZSBjYW4gY2FsbCBsaXN0ZW5lcnNcclxuICAgICAqIGRpcmVjdGx5XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfcG9zdERpcmVjdChhcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGlzdGVuZXJzIHx8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjb3B5IGEgcmVmZXJlbmNlIHRvIHRoZSBhcnJheSBiZWNhdXNlIHRoaXMuX2xpc3RlbmVycyBtaWdodCBiZSByZXBsYWNlZCBkdXJpbmdcclxuICAgICAgICAvLyB0aGUgaGFuZGxlciBjYWxsc1xyXG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5fY2FsbChsaXN0ZW5lciwgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29udmVuaWVuY2UgY2xhc3MgZm9yIEFzeW5jRXZlbnRzIHdpdGhvdXQgZGF0YVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvaWRBc3luY0V2ZW50IGV4dGVuZHMgQXN5bmNFdmVudDx2b2lkPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIHRoZSBBc3luY0V2ZW50LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcG9zdCgpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5wb3N0KHVuZGVmaW5lZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaW1pbGFyIHRvICdlcnJvcicgZXZlbnQgb24gRXZlbnRFbWl0dGVyOiB0aHJvd3Mgd2hlbiBhIHBvc3QoKSBvY2N1cnMgd2hpbGUgbm8gaGFuZGxlcnMgc2V0LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEVycm9yQXN5bmNFdmVudCBleHRlbmRzIEFzeW5jRXZlbnQ8RXJyb3I+IHtcclxuXHJcbiAgICBwdWJsaWMgcG9zdChkYXRhOiBFcnJvcik6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3RlbmVyQ291bnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGVycm9yIGV2ZW50IHBvc3RlZCB3aGlsZSBubyBsaXN0ZW5lcnMgYXR0YWNoZWQuIEVycm9yOiAke2RhdGEubWVzc2FnZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3VwZXIucG9zdChkYXRhKTtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgwqkgMjAxNSBSb2dpZXIgU2Nob3V0ZW48Z2l0aHViQHdvcmtpbmdjb2RlLm5pbmphPlxyXG4vLyBMaWNlbnNlOiBJU0NcclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUG9zdGFibGU8VD4ge1xyXG4gICAgcG9zdChkYXRhOiBUKTogdm9pZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIGludGVyZmFjZSBiZXR3ZWVuIEJhc2VFdmVudCBhbmQgaXRzIHN1YmNsYXNzZXNcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGVuZXI8VD4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgbGlzdGVuZXIgd2FzIGRldGFjaGVkXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZWQ6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBoYW5kbGVyXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZXI/OiAoZGF0YTogVCkgPT4gdm9pZDtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRoaXMgcG9pbnRlciBmb3IgdGhlIGhhbmRsZXJcclxuICAgICAqL1xyXG4gICAgYm91bmRUbz86IE9iamVjdDtcclxuICAgIC8qKlxyXG4gICAgICogSW5zdGVhZCBvZiBhIGhhbmRsZXIsIGFuIGF0dGFjaGVkIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIGV2ZW50PzogUG9zdGFibGU8VD47XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhZnRlciBmaXJzdCBjYWxsP1xyXG4gICAgICovXHJcbiAgICBvbmNlOiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQmFzZSBjbGFzcyBmb3IgZXZlbnRzLlxyXG4gKiBIYW5kbGVzIGF0dGFjaGluZyBhbmQgZGV0YWNoaW5nIGxpc3RlbmVyc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJhc2VFdmVudDxUPiBpbXBsZW1lbnRzIFBvc3RhYmxlPFQ+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVkIGxpc3RlbmVycy4gTk9URTogZG8gbm90IG1vZGlmeS5cclxuICAgICAqIEluc3RlYWQsIHJlcGxhY2Ugd2l0aCBhIG5ldyBhcnJheSB3aXRoIHBvc3NpYmx5IHRoZSBzYW1lIGVsZW1lbnRzLiBUaGlzIGVuc3VyZXNcclxuICAgICAqIHRoYXQgYW55IHJlZmVyZW5jZXMgdG8gdGhlIGFycmF5IGJ5IGV2ZW50cyB0aGF0IGFyZSB1bmRlcndheSByZW1haW4gdGhlIHNhbWUuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfbGlzdGVuZXJzOiBMaXN0ZW5lcjxUPltdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIGFuIGV2ZW50IGhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBjYWxsLiBUaGUgdGhpcyBhcmd1bWVudCBvZiB0aGUgZnVuY3Rpb24gd2lsbCBiZSB0aGlzIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGF0dGFjaChoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0gYm91bmRUbyBUaGUgdGhpcyBhcmd1bWVudCBvZiB0aGUgaGFuZGxlclxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGNhbGwuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhdHRhY2goYm91bmRUbzogT2JqZWN0LCBoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhbiBldmVudCBkaXJlY3RseVxyXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBiZSBwb3N0ZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGF0dGFjaChldmVudDogUG9zdGFibGU8VD4pOiB2b2lkO1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIGF0dGFjaChhOiAoKGRhdGE6IFQpID0+IHZvaWQpIHwgT2JqZWN0IHwgUG9zdGFibGU8VD4sIGI/OiAoZGF0YTogVCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuX2F0dGFjaChhLCBiLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciB3aGljaCBhdXRvbWF0aWNhbGx5IGdldHMgcmVtb3ZlZCBhZnRlciB0aGUgZmlyc3QgY2FsbFxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGNhbGwuIFRoZSB0aGlzIGFyZ3VtZW50IG9mIHRoZSBmdW5jdGlvbiB3aWxsIGJlIHRoaXMgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb25jZShoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIHdoaWNoIGF1dG9tYXRpY2FsbHkgZ2V0cyByZW1vdmVkIGFmdGVyIHRoZSBmaXJzdCBjYWxsXHJcbiAgICAgKiBAcGFyYW0gYm91bmRUbyBUaGUgdGhpcyBhcmd1bWVudCBvZiB0aGUgaGFuZGxlclxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGNhbGwuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbmNlKGJvdW5kVG86IE9iamVjdCwgaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgZGlyZWN0bHkgYW5kIGRlLWF0dGFjaCBhZnRlciB0aGUgZmlyc3QgY2FsbFxyXG4gICAgICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0byBiZSBwb3N0ZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uY2UoZXZlbnQ6IFBvc3RhYmxlPFQ+KTogdm9pZDtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbmNlKGE6ICgoZGF0YTogVCkgPT4gdm9pZCkgfCBPYmplY3QgfCBQb3N0YWJsZTxUPiwgYj86IChkYXRhOiBUKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fYXR0YWNoKGEsIGIsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIC8gb25jZSBpbXBsZW1lbnRhdGlvblxyXG4gICAgICogQHBhcmFtIGFcclxuICAgICAqIEBwYXJhbSBiXHJcbiAgICAgKiBAcGFyYW0gb25jZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9hdHRhY2goYTogKChkYXRhOiBUKSA9PiB2b2lkKSB8IE9iamVjdCB8IFBvc3RhYmxlPFQ+LCBiOiAoKGRhdGE6IFQpID0+IHZvaWQpIHwgdW5kZWZpbmVkLCBvbmNlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGJvdW5kVG86IE9iamVjdDtcclxuICAgICAgICBsZXQgaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQ7XHJcbiAgICAgICAgbGV0IGV2ZW50OiBQb3N0YWJsZTxUPjtcclxuICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgaGFuZGxlciA9IGEgYXMgKChkYXRhOiBUKSA9PiB2b2lkKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFiICYmIHR5cGVvZiAoYSBhcyBQb3N0YWJsZTxUPikucG9zdCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBldmVudCA9IGEgYXMgUG9zdGFibGU8VD47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3QgYSBmdW5jdGlvbiBvciBvYmplY3QgYXMgZmlyc3QgYXJndW1lbnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGIgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0IGEgZnVuY3Rpb24gYXMgc2Vjb25kIGFyZ3VtZW50Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYm91bmRUbyA9IGE7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSBiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBtYWtlIGEgY29weSBvZiB0aGUgYXJyYXkgc28gZXZlbnRzIHRoYXQgYXJlIHVuZGVyd2F5IGhhdmUgYSBzdGFibGUgbG9jYWwgY29weVxyXG4gICAgICAgICAgICAvLyBvZiB0aGUgbGlzdGVuZXJzIGFycmF5IGF0IHRoZSB0aW1lIG9mIHBvc3QoKVxyXG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuc2xpY2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xyXG4gICAgICAgICAgICBkZWxldGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgYm91bmRUbyxcclxuICAgICAgICAgICAgaGFuZGxlcixcclxuICAgICAgICAgICAgZXZlbnQsXHJcbiAgICAgICAgICAgIG9uY2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGFjaCBhbGwgbGlzdGVuZXJzIHdpdGggdGhlIGdpdmVuIGhhbmRsZXIgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRldGFjaChoYW5kbGVyOiAoZGF0YTogVCkgPT4gdm9pZCk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIERldGFjaCBhbGwgbGlzdGVuZXJzIHdpdGggdGhlIGdpdmVuIGhhbmRsZXIgZnVuY3Rpb24gYW5kIGJvdW5kVG8gb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGV0YWNoKGJvdW5kVG86IE9iamVjdCwgaGFuZGxlcjogKGRhdGE6IFQpID0+IHZvaWQpOiB2b2lkO1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRhY2ggYWxsIGxpc3RlbmVycyB0aGF0IHdlcmUgYXR0YWNoZWQgd2l0aCB0aGUgZ2l2ZW4gYm91bmRUbyBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZXRhY2goYm91bmRUbzogT2JqZWN0KTogdm9pZDtcclxuICAgIC8qKlxyXG4gICAgICogRGV0YWNoIHRoZSBnaXZlbiBldmVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRldGFjaChldmVudDogUG9zdGFibGU8VD4pOiB2b2lkO1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRhY2ggYWxsIGxpc3RlbmVyc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGV0YWNoKCk6IHZvaWQ7XHJcbiAgICAvKipcclxuICAgICAqIERldGFjaCBpbXBsZW1lbnRhdGlvbi4gU2VlIHRoZSBvdmVybG9hZHMgZm9yIGRlc2NyaXB0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGV0YWNoKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9saXN0ZW5lcnMgfHwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBib3VuZFRvOiBPYmplY3Q7XHJcbiAgICAgICAgbGV0IGhhbmRsZXI6IChkYXRhOiBUKSA9PiB2b2lkO1xyXG4gICAgICAgIGxldCBldmVudDogUG9zdGFibGU8VD47XHJcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoYXJnc1swXSkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBhcmdzWzBdO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxICYmIHR5cGVvZiBhcmdzWzBdLnBvc3QgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50ID0gYXJnc1swXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJvdW5kVG8gPSBhcmdzWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIgPSBhcmdzWzFdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVycyBBTkQgbWFyayB0aGVtIGFzIGRlbGV0ZWQgc28gc3ViY2xhc3NlcyBkb24ndCBzZW5kIGFueSBtb3JlIGV2ZW50cyB0byB0aGVtXHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmZpbHRlcigobGlzdGVuZXI6IExpc3RlbmVyPFQ+KTogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmICgodHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnIHx8IGxpc3RlbmVyLmhhbmRsZXIgPT09IGhhbmRsZXIpXHJcbiAgICAgICAgICAgICAgICAmJiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyB8fCBsaXN0ZW5lci5ldmVudCA9PT0gZXZlbnQpXHJcbiAgICAgICAgICAgICAgICAmJiAodHlwZW9mIGJvdW5kVG8gPT09ICd1bmRlZmluZWQnIHx8IGxpc3RlbmVyLmJvdW5kVG8gPT09IGJvdW5kVG8pKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5kZWxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVycztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBYnN0cmFjdCBwb3N0KCkgbWV0aG9kIHRvIGJlIGFibGUgdG8gY29ubmVjdCBhbnkgdHlwZSBvZiBldmVudCB0byBhbnkgb3RoZXIgZGlyZWN0bHlcclxuICAgICAqIEBhYnN0cmFjdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcG9zdChkYXRhOiBUKTogdm9pZCB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG51bWJlciBvZiBhdHRhY2hlZCBsaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGxpc3RlbmVyQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2xpc3RlbmVycyA/IHRoaXMuX2xpc3RlbmVycy5sZW5ndGggOiAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGwgdGhlIGdpdmVuIGxpc3RlbmVyLCBpZiBpdCBpcyBub3QgbWFya2VkIGFzICdkZWxldGVkJ1xyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciB0byBjYWxsXHJcbiAgICAgKiBAcGFyYW0gYXJncyBUaGUgYXJndW1lbnRzIHRvIHRoZSBoYW5kbGVyXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY2FsbChsaXN0ZW5lcjogTGlzdGVuZXI8VD4sIGFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFsaXN0ZW5lci5kZWxldGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lci5vbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIEFORCBtYXJrIGFzIGRlbGV0ZWQgc28gc3ViY2xhc3NlcyBkb24ndCBzZW5kIGFueSBtb3JlIGV2ZW50cyB0byB0aGVtXHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5kZWxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5maWx0ZXIoKGw6IExpc3RlbmVyPFQ+KTogYm9vbGVhbiA9PiBsICE9PSBsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyLmV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5ldmVudC5wb3N0LmFwcGx5KGxpc3RlbmVyLmV2ZW50LCBhcmdzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmhhbmRsZXIuYXBwbHkoKHR5cGVvZiBsaXN0ZW5lci5ib3VuZFRvID09PSAnb2JqZWN0JyA/IGxpc3RlbmVyLmJvdW5kVG8gOiB0aGlzKSwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbiIsIi8vIENvcHlyaWdodCDCqSAyMDE1IFJvZ2llciBTY2hvdXRlbjxnaXRodWJAd29ya2luZ2NvZGUubmluamE+XHJcbi8vIExpY2Vuc2U6IElTQ1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dFcXVhbHMoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGEgIT09IHR5cGVvZiBiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0eXBlb2YgYSkge1xyXG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxyXG4gICAgICAgIGNhc2UgJ251bWJlcic6XHJcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcclxuICAgICAgICBjYXNlICdmdW5jdGlvbic6XHJcbiAgICAgICAgY2FzZSAnc3ltYm9sJzpcclxuICAgICAgICBjYXNlICd1bmRlZmluZWQnOlxyXG4gICAgICAgICAgICAvLyBhbHJlYWR5IGRpZCA9PT0gY29tcGFyZVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcclxuICAgICAgICAgICAgaWYgKGEgPT09IG51bGwgfHwgYiA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBhbHJlYWR5IGNvbXBhcmVkID09PVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGEpIHx8IEFycmF5LmlzQXJyYXkoYikpIHtcclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShhKSB8fCAhQXJyYXkuaXNBcnJheShiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmFtZXNBOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lc0I6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzQS5wdXNoKG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzQi5wdXNoKG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5hbWVzQS5zb3J0KCk7XHJcbiAgICAgICAgICAgIG5hbWVzQi5zb3J0KCk7XHJcbiAgICAgICAgICAgIGlmIChuYW1lc0Euam9pbignLCcpICE9PSBuYW1lc0Iuam9pbignLCcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lc0EubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhW25hbWVzQVtpXV0gIT09IGJbbmFtZXNBW2ldXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gQ29weXJpZ2h0IMKpIDIwMTUgUm9naWVyIFNjaG91dGVuPGdpdGh1YkB3b3JraW5nY29kZS5uaW5qYT5cclxuLy8gTGljZW5zZTogSVNDXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQge0Jhc2VFdmVudCwgUG9zdGFibGUsIExpc3RlbmVyfSBmcm9tICcuL2Jhc2UtZXZlbnQnO1xyXG5pbXBvcnQge2RlZmF1bHQgYXMgRXZlbnRRdWV1ZX0gZnJvbSAnLi9FdmVudFF1ZXVlJztcclxuXHJcbi8qKlxyXG4gKiBPcHRpb25zIGZvciB0aGUgUXVldWVkRXZlbnQgY29uc3RydWN0b3JcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVkRXZlbnRPcHRzIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uZGVuc2UgbXVsdGlwbGUgY2FsbHMgdG8gcG9zdCgpIGludG8gb25lLlxyXG4gICAgICovXHJcbiAgICBjb25kZW5zZWQ/OiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZpYyBldmVudCBxdWV1ZSB0byB1c2UuIElmIG5vdCBwcm92aWRlZCwgdGhlIGdsb2JhbCBpbnN0YW5jZSBpcyB1c2VkLlxyXG4gICAgICovXHJcbiAgICBxdWV1ZT86IEV2ZW50UXVldWU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFdmVudCB0aGF0IHN0YXlzIGluIGEgcXVldWUgdW50aWwgeW91IHByb2Nlc3MgdGhlIHF1ZXVlLiBBbGxvd3MgZmluZS1ncmFpbmVkXHJcbiAqIGNvbnRyb2wgb3ZlciB3aGVuIGV2ZW50cyBoYXBwZW4uXHJcbiAqIC0gT3B0aW9uYWxseSBjb25kZW5zZXMgbXVsdGlwbGUgcG9zdCgpIGNhbGxzIGludG8gb25lLlxyXG4gKiAtIEhhbmRsZXJzIGFyZSBjYWxsZWQgb25seSBmb3IgZXZlbnRzIHBvc3RlZCBhZnRlciB0aGV5IHdlcmUgYXR0YWNoZWQuXHJcbiAqIC0gSGFuZGxlcnMgYXJlIG5vdCBjYWxsZWQgYW55bW9yZSB3aGVuIHRoZXkgYXJlIGRldGFjaGVkLCBldmVuIGlmIGEgcG9zdCgpIGlzIGluIHByb2dyZXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUXVldWVkRXZlbnQ8VD4gZXh0ZW5kcyBCYXNlRXZlbnQ8VD4gaW1wbGVtZW50cyBQb3N0YWJsZTxUPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGludGVybmFsbHkgLSB0aGUgZXhhY3Qgb3B0aW9ucyBvYmplY3QgZ2l2ZW4gdG8gY29uc3RydWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9wdGlvbnM6IFF1ZXVlZEV2ZW50T3B0cztcclxuXHJcbiAgICBwcml2YXRlIF9jb25kZW5zZWQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9xdWV1ZTogRXZlbnRRdWV1ZTtcclxuICAgIHByaXZhdGUgX3F1ZXVlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfcXVldWVkTGlzdGVuZXJzOiBMaXN0ZW5lcjxUPltdO1xyXG4gICAgcHJpdmF0ZSBfcXVldWVkRGF0YTogYW55W107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIG9wdHMgT3B0aW9uYWwsIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgbWVtYmVyczpcclxuICAgICAqICAgICAgICAgICAgIC0gY29uZGVuc2VkOiBhIEJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIGNvbmRlbnNlIG11bHRpcGxlIGNhbGxzIHRvIHBvc3QoKSBpbnRvIG9uZSAoZGVmYXVsdCBmYWxzZSlcclxuICAgICAqICAgICAgICAgICAgIC0gcXVldWU6IGEgc3BlY2lmaWMgZXZlbnQgcXVldWUgdG8gdXNlLiBUaGUgZ2xvYmFsIEV2ZW50UXVldWUgaW5zdGFuY2UgaXMgdXNlZCBpZiBub3QgZ2l2ZW4uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdHM/OiBRdWV1ZWRFdmVudE9wdHMpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdHM7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uczogUXVldWVkRXZlbnRPcHRzID0gb3B0cyB8fCB7fTtcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29uZGVuc2VkID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29uZGVuc2VkID0gb3B0aW9ucy5jb25kZW5zZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fY29uZGVuc2VkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5xdWV1ZSA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucy5xdWV1ZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWV1ZSA9IG9wdGlvbnMucXVldWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBTZW5kIHRoZSBldmVudC4gRXZlbnRzIGFyZSBxdWV1ZWQgaW4gdGhlIGV2ZW50IHF1ZXVlIHVudGlsIGZsdXNoZWQgb3V0LlxyXG4gICAgKiBJZiB0aGUgJ2NvbmRlbnNlZCcgb3B0aW9uIHdhcyBnaXZlbiBpbiB0aGUgY29uc3RydWN0b3IsIG11bHRpcGxlIHBvc3RzKClcclxuICAgICogYmV0d2VlbiBxdWV1ZSBmbHVzaGVzIGFyZSBjb25kZW5zZWQgaW50byBvbmUgY2FsbCB3aXRoIHRoZSBkYXRhIGZyb20gdGhlXHJcbiAgICAqIGxhc3QgcG9zdCgpIGNhbGwuXHJcbiAgICAqL1xyXG4gICAgcHVibGljIHBvc3QoZGF0YTogVCk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgcG9zdCguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGlzdGVuZXJzIHx8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBxdWV1ZSA9ICh0aGlzLl9xdWV1ZSA/IHRoaXMuX3F1ZXVlIDogRXZlbnRRdWV1ZS5nbG9iYWwoKSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmRlbnNlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWV1ZWREYXRhID0gYXJncztcclxuICAgICAgICAgICAgdGhpcy5fcXVldWVkTGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcXVldWVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcXVldWUuYWRkKCgpOiB2b2lkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpbW1lZGlhdGVseSBtYXJrIG5vbi1xdWV1ZWQgdG8gYWxsb3cgbmV3IEFzeW5jRXZlbnQgdG8gaGFwcGVuIGFzIHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9mIGNhbGxpbmcgaGFuZGxlcnNcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjYWNoZSBsaXN0ZW5lcnMgYW5kIGRhdGEgYmVjYXVzZSB0aGV5IG1pZ2h0IGNoYW5nZSB3aGlsZSBjYWxsaW5nIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuX3F1ZXVlZERhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fcXVldWVkTGlzdGVuZXJzO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWxsKGxpc3RlbmVyLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIG5vdCBjb25kZW5zZWRcclxuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xyXG4gICAgICAgICAgICBxdWV1ZS5hZGQoKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWxsKGxpc3RlbmVyLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29udmVuaWVuY2UgY2xhc3MgZm9yIGV2ZW50cyB3aXRob3V0IGRhdGFcclxuICovXHJcbmV4cG9ydCBjbGFzcyBWb2lkUXVldWVkRXZlbnQgZXh0ZW5kcyBRdWV1ZWRFdmVudDx2b2lkPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIHRoZSBldmVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHBvc3QoKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIucG9zdCh1bmRlZmluZWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFNpbWlsYXIgdG8gJ2Vycm9yJyBldmVudCBvbiBFdmVudEVtaXR0ZXI6IHRocm93cyB3aGVuIGEgcG9zdCgpIG9jY3VycyB3aGlsZSBubyBoYW5kbGVycyBzZXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRXJyb3JRdWV1ZWRFdmVudCBleHRlbmRzIFF1ZXVlZEV2ZW50PEVycm9yPiB7XHJcblxyXG4gICAgcHVibGljIHBvc3QoZGF0YTogRXJyb3IpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xpc3RlbmVycyB8fCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZXJyb3IgZXZlbnQgcG9zdGVkIHdoaWxlIG5vIGxpc3RlbmVycyBhdHRhY2hlZC4gRXJyb3I6ICR7ZGF0YS5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdXBlci5wb3N0KGRhdGEpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIENvcHlyaWdodCDCqSAyMDE1IFJvZ2llciBTY2hvdXRlbjxnaXRodWJAd29ya2luZ2NvZGUubmluamE+XHJcbi8vIExpY2Vuc2U6IElTQ1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHtCYXNlRXZlbnQsIFBvc3RhYmxlfSBmcm9tICcuL2Jhc2UtZXZlbnQnO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgaXMgYSB0cnVlIEV2ZW50RW1pdHRlciByZXBsYWNlbWVudDogdGhlIGhhbmRsZXJzIGFyZSBjYWxsZWQgc3luY2hyb25vdXNseSB3aGVuXHJcbiAqIHlvdSBwb3N0IHRoZSBldmVudC5cclxuICogLSBBbGxvd3MgYmV0dGVyIGVycm9yIGhhbmRsaW5nIGJ5IGFnZ3JlZ2F0aW5nIGFueSBlcnJvcnMgdGhyb3duIGJ5IGhhbmRsZXJzLlxyXG4gKiAtIFByZXZlbnRzIGxpdmVsb2NrIGJ5IHRocm93aW5nIGFuIGVycm9yIHdoZW4gcmVjdXJzaW9uIGRlcHRoIGlzIGFib3ZlIGEgbWF4aW11bS5cclxuICogLSBIYW5kbGVycyBhcmUgY2FsbGVkIG9ubHkgZm9yIGV2ZW50cyBwb3N0ZWQgYWZ0ZXIgdGhleSB3ZXJlIGF0dGFjaGVkLlxyXG4gKiAtIEhhbmRsZXJzIGFyZSBub3QgY2FsbGVkIGFueW1vcmUgd2hlbiB0aGV5IGFyZSBkZXRhY2hlZCwgZXZlbiBpZiBhIHBvc3QoKSBpcyBpbiBwcm9ncmVzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN5bmNFdmVudDxUPiBleHRlbmRzIEJhc2VFdmVudDxUPiBpbXBsZW1lbnRzIFBvc3RhYmxlPFQ+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoYXQgYW4gZXZlbnQgaGFuZGxlciBtYXkgY2F1c2UgdGhlIHNhbWUgZXZlbnRcclxuICAgICAqIHJlY3Vyc2l2ZWx5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE1BWF9SRUNVUlNJT05fREVQVEg6IG51bWJlciA9IDEwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVjdXJzaXZlIHBvc3QoKSBpbnZvY2F0aW9uc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9yZWN1cnNpb246IG51bWJlciA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIHRoZSBldmVudC4gSGFuZGxlcnMgYXJlIGNhbGxlZCBpbW1lZGlhdGVseSBhbmQgc3luY2hyb25vdXNseS5cclxuICAgICAqIElmIGFuIGVycm9yIGlzIHRocm93biBieSBhIGhhbmRsZXIsIHRoZSByZW1haW5pbmcgaGFuZGxlcnMgYXJlIHN0aWxsIGNhbGxlZC5cclxuICAgICAqIEFmdGVyd2FyZCwgYW4gQWdncmVnYXRlRXJyb3IgaXMgdGhyb3duIHdpdGggdGhlIG9yaWdpbmFsIGVycm9yKHMpIGluIGl0cyAnY2F1c2VzJyBwcm9wZXJ0eS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHBvc3QoZGF0YTogVCk6IHZvaWQ7XHJcbiAgICBwdWJsaWMgcG9zdCguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGlzdGVuZXJzIHx8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWN1cnNpb24rKztcclxuICAgICAgICBpZiAoU3luY0V2ZW50Lk1BWF9SRUNVUlNJT05fREVQVEggPiAwICYmXHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3Vyc2lvbiA+IFN5bmNFdmVudC5NQVhfUkVDVVJTSU9OX0RFUFRIKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXZlbnQgZmlyZWQgcmVjdXJzaXZlbHknKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29weSBhIHJlZmVyZW5jZSB0byB0aGUgYXJyYXkgYmVjYXVzZSB0aGlzLl9saXN0ZW5lcnMgbWlnaHQgYmUgcmVwbGFjZWQgZHVyaW5nXHJcbiAgICAgICAgLy8gdGhlIGhhbmRsZXIgY2FsbHNcclxuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XHJcbiAgICAgICAgICAgIHRoaXMuX2NhbGwobGlzdGVuZXIsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWN1cnNpb24tLTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlbmllbmNlIGNsYXNzIGZvciBldmVudHMgd2l0aG91dCBkYXRhXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVm9pZFN5bmNFdmVudCBleHRlbmRzIFN5bmNFdmVudDx2b2lkPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIHRoZSBldmVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHBvc3QoKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIucG9zdCh1bmRlZmluZWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2ltaWxhciB0byAnZXJyb3InIGV2ZW50IG9uIEV2ZW50RW1pdHRlcjogdGhyb3dzIHdoZW4gYSBwb3N0KCkgb2NjdXJzIHdoaWxlIG5vIGhhbmRsZXJzIHNldC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFcnJvclN5bmNFdmVudCBleHRlbmRzIFN5bmNFdmVudDxFcnJvcj4ge1xyXG5cclxuICAgIHB1YmxpYyBwb3N0KGRhdGE6IEVycm9yKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMubGlzdGVuZXJDb3VudCgpID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZXJyb3IgZXZlbnQgcG9zdGVkIHdoaWxlIG5vIGxpc3RlbmVycyBhdHRhY2hlZC4gRXJyb3I6ICR7ZGF0YS5tZXNzYWdlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdXBlci5wb3N0KGRhdGEpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCIvLyBDb3B5cmlnaHQgwqkgMjAxNSBSb2dpZXIgU2Nob3V0ZW48Z2l0aHViQHdvcmtpbmdjb2RlLm5pbmphPlxyXG4vLyBMaWNlbnNlOiBJU0NcclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCAqIGZyb20gJy4vYmFzZS1ldmVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vc3luYy1ldmVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vcXVldWVkLWV2ZW50JztcclxuZXhwb3J0ICogZnJvbSAnLi9hc3luYy1ldmVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vYW55LWV2ZW50JztcclxuXHJcbmltcG9ydCB7ZGVmYXVsdCBhcyBFdmVudFF1ZXVlfSBmcm9tICcuL0V2ZW50UXVldWUnO1xyXG5leHBvcnQge2RlZmF1bHQgYXMgRXZlbnRRdWV1ZX0gZnJvbSAnLi9FdmVudFF1ZXVlJztcclxuXHJcbi8qKlxyXG4gKiBUaGUgZ2xvYmFsIGV2ZW50IHF1ZXVlIGZvciBRdWV1ZWRFdmVudHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZSgpOiBFdmVudFF1ZXVlIHtcclxuICAgIHJldHVybiBFdmVudFF1ZXVlLmdsb2JhbCgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHNhbWUgYXMgRXZlbnRRdWV1ZS5nbG9iYWwoKS5mbHVzaE9uY2UoKS5cclxuICogRmx1c2hlcyB0aGUgUXVldWVkRXZlbnRzLCBjYWxsaW5nIGFsbCBldmVudHMgY3VycmVudGx5IGluIHRoZSBxdWV1ZSBidXQgbm90XHJcbiAqIGFueSBldmVudHMgcHV0IGludG8gdGhlIHF1ZXVlIGFzIGEgcmVzdWx0IG9mIHRoZSBmbHVzaC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmbHVzaE9uY2UoKTogdm9pZCB7XHJcbiAgICBFdmVudFF1ZXVlLmdsb2JhbCgpLmZsdXNoT25jZSgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHNhbWUgYXMgRXZlbnRRdWV1ZS5nbG9iYWwoKS5mbHVzaCgpLlxyXG4gKiBGbHVzaGVzIHRoZSBRdWV1ZWRFdmVudHMsIGNhbGxpbmcgYWxsIGhhbmRsZXJzIGN1cnJlbnRseSBpbiB0aGUgcXVldWUgYW5kIHRob3NlXHJcbiAqIHB1dCBpbnRvIHRoZSBxdWV1ZSBhcyBhIHJlc3VsdCBvZiB0aGUgZmx1c2guXHJcbiAqIEBwYXJhbSBtYXhSb3VuZHMgT3B0aW9uYWwsIGRlZmF1bHQgMTAuIE51bWJlciBvZiBpdGVyYXRpb25zIGFmdGVyIHdoaWNoIHRvIHRocm93IGFuIGVycm9yIGJlY2F1c2VcclxuICogICAgICAgICAgICAgICAgICB0aGUgcXVldWUga2VlcHMgZmlsbGluZyB1cC4gU2V0IHRvIHVuZGVmaW5lZCBvciBudWxsIHRvIGRpc2FibGUgdGhpcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmbHVzaChtYXhSb3VuZHM6IG51bWJlciA9IDEwKTogdm9pZCB7XHJcbiAgICBFdmVudFF1ZXVlLmdsb2JhbCgpLmZsdXNoKG1heFJvdW5kcyk7XHJcbn1cclxuIl19
return require('ts-events');
});