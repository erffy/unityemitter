import { UnityEmitterOptions } from './lib/interfaces/UnityEmitterOptions';
import { ListenerCallback } from './lib/interfaces/ListenerCallback';
import { SignaturedListenerMap } from './lib/interfaces/SignaturedListenerMap';
import { EventEmitter } from 'stream';

declare module 'unityemitter' {
  /**
   * The `UnityEmitter` class is defined and exposed by the `unityemitter` module:
   *
   * ```js
   * import UnityEmitter from 'unityemitter';
   * ```
   * 
   * @since v1.0.0
   */
  export default class UnityEmitter<Events extends SignaturedListenerMap<Events> = ListenerMap> {
    protected readonly storage: Map<string, Array<Set<Function>>>;
    public readonly options: UnityEmitterOptions;

    public constructor(options?: UnityEmitterOptions);

    /**
     * Adds the `callback` function to the end of the listeners array for the
     * event named `name`. No checks are made to see if the `callback` has
     * already been added. Multiple calls passing the same combination of `name`and `callback` will result in the `callback` being added, and called, multiple
     * times.
     *
     * ```js
     * server.on('connection', (stream) => {
     *   console.log('someone connected!');
     * });
     * ```
     *
     * Returns a reference to the `UnityEmitter`, so that calls can be chained.
     *
     * ```js
     * import UnityEmitter from 'unityemitter';
     * const myEE = new UnityEmitter();
     * myEE.on('foo', () => console.log('a'));
     * myEE.emit('foo');
     * // Prints:
     * //   b
     * //   a
     * ```
     * @since v1.0.0
     * @param name The name of the event.
     * @param callback The callback function
     */
    public on<K extends keyof Events>(name: K, callback: Events[K]): this;
    /**
     * Removes the specified `callback` from the callback array for the event named `name`.
     *
     * ```js
     * const callback = (stream) => {
     *   console.log('someone connected!');
     * };
     * server.on('connection', callback);
     * // ...
     * server.off('connection', callback);
     * ```
     *
     * `off()` will remove, at most, one instance of a listener from the
     * listener array. If any single listener has been added multiple times to the
     * listener array for the specified `name`, then `off()` must be
     * called multiple times to remove each instance.
     *
     * Once an event is emitted, all listeners attached to it at the
     * time of emitting are called in order. This implies that any `off()` calls _after_ emitting and _before_ the last listener finishes execution
     * will not remove them from `emit()` in progress. Subsequent events behave as expected.
     *
     * ```js
     * import UnityEmitter from 'unityemitter';
     * class MyEmitter extends EventEmitter {}
     * const myEmitter = new MyEmitter();
     *
     * const callbackA = () => {
     *   console.log('A');
     *   myEmitter.off('event', callbackB);
     * };
     *
     * const callbackB = () => {
     *   console.log('B');
     * };
     *
     * myEmitter.on('event', callbackA);
     *
     * myEmitter.on('event', callbackB);
     *
     * // callbackA removes listener callbackB but it will still be called.
     * // Internal listener array at time of emit [callbackA, callbackB]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * //   B
     *
     * // callbackB is now removed.
     * // Internal listener array [callbackA]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * ```
     *
     * Because listeners are managed using an internal array, calling this will
     * change the position indices of any listener registered _after_ the listener
     * being removed. This will not impact the order in which listeners are called,
     * but it means that any copies of the listener array as returned by
     * the `emitter.listeners()` method will need to be recreated.
     *
     * When a single function has been added as a handler multiple times for a single
     * event (as in the example below), `removeListener()` will remove the most
     * recently added instance. In the example the `once('ping')` listener is removed:
     *
     * ```js
     * import UnityEmitter from 'unityemitter';
     * const ee = new UnityEmitter();
     *
     * function pong() {
     *   console.log('pong');
     * }
     *
     * ee.on('ping', pong);
     * ee.once('ping', pong);
     * ee.off('ping', pong);
     *
     * ee.emit('ping');
     * ee.emit('ping');
     * ```
     *
     * Returns a reference to the `UnityEmitter`, so that calls can be chained.
     * @since v1.0.0
     */
    public off<K extends keyof Events>(name: K, callback: Events[K]): boolean;
    /**
     * Adds a **one-time**`callback` function for the event named `name`. The
     * next time `name` is triggered, this callback is removed and then invoked.
     *
     * ```js
     * server.once('connection', (stream) => {
     *   console.log('Ah, we have our first user!');
     * });
     * ```
     *
     * Returns a reference to the `UnityEmitter`, so that calls can be chained.
     * 
     * ```js
     * import UnityEmitter from 'unityemitter';
     * const myEE = new UnityEmitter();
     * myEE.once('foo', () => console.log('a'));
     * myEE.emit('foo');
     * // Prints:
     * //   b
     * //   a
     * ```
     * @since v1.0.0
     * @param name The name of the event.
     * @param callback The callback function
     */
    public once<K extends keyof Events>(name: K, callback: Events[K]): this;
    /**
     * Synchronously calls each of the listeners registered for the event named `name`, in the order they were registered, passing the supplied arguments
     * to each.
     *
     * Returns `true` if the event had listeners, `false` otherwise.
     *
     * ```js
     * import UnityEmitter from 'unityemitter';
     * const myEmitter = new UnityEmitter();
     *
     * // First listener
     * myEmitter.on('event', function firstListener() {
     *   console.log('Helloooo! first listener');
     * });
     * // Second listener
     * myEmitter.on('event', function secondListener(arg1, arg2) {
     *   console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
     * });
     * // Third listener
     * myEmitter.on('event', function thirdListener(...args) {
     *   const parameters = args.join(', ');
     *   console.log(`event with parameters ${parameters} in third listener`);
     * });
     *
     * console.log(myEmitter.getListener('event'));
     *
     * myEmitter.emit('event', 1, 2, 3, 4, 5);
     *
     * // Prints:
     * // [
     * //   Set(3) {
     * //    [Function: firstListener],
     * //    [Function: secondListener],
     * //    [Function: thirdListener]
     * //   }
     * // ]
     * // Helloooo! first listener
     * // event with parameters 1, 2 in second listener
     * // event with parameters 1, 2, 3, 4, 5 in third listener
     * ```
     * @since v1.0.0
     */
    public emit<K extends keyof Events>(name: K, ...args: Parameters<Events[K]>): boolean | void;

    public emitted<K extends keyof Events>(name: K): boolean;

    public hasListener<K extends keyof Events>(name: K, callback?: Events[K]): boolean;

    public addListener<K extends keyof Events>(name: K, callbacks: Array<Events[K]>): this;
    /**
     * Removes the specified `callback` from the callback array for the event named `name`.
     *
     * ```js
     * const callback = (stream) => {
     *   console.log('someone connected!');
     * };
     * server.on('connection', callback);
     * // ...
     * server.off('connection', callback);
     * ```
     *
     * `off()` will remove, at most, one instance of a listener from the
     * listener array. If any single listener has been added multiple times to the
     * listener array for the specified `name`, then `off()` must be
     * called multiple times to remove each instance.
     *
     * Once an event is emitted, all listeners attached to it at the
     * time of emitting are called in order. This implies that any `off()` or `removeListener()` calls _after_ emitting and _before_ the last listener finishes execution
     * will not remove them from `emit()` in progress. Subsequent events behave as expected.
     *
     * ```js
     * import UnityEmitter from 'unityemitter';
     * class MyEmitter extends UnityEmitter {}
     * const myEmitter = new MyEmitter();
     *
     * const callbackA = () => {
     *   console.log('A');
     *   myEmitter.off('event', callbackB);
     * };
     *
     * const callbackB = () => {
     *   console.log('B');
     * };
     *
     * myEmitter.on('event', callbackA);
     *
     * myEmitter.on('event', callbackB);
     *
     * // callbackA removes listener callbackB but it will still be called.
     * // Internal listener array at time of emit [callbackA, callbackB]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * //   B
     *
     * // callbackB is now removed.
     * // Internal listener array [callbackA]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * ```
     *
     * Because listeners are managed using an internal array, calling this will
     * change the position indices of any listener registered _after_ the listener
     * being removed. This will not impact the order in which listeners are called,
     * but it means that any copies of the listener array as returned by
     * the `emitter.getListener()` method will need to be recreated.
     *
     * When a single function has been added as a handler multiple times for a single
     * event (as in the example below), `removeListener()` will remove the most
     * recently added instance. In the example the `once('ping')` listener is removed:
     *
     * ```js
     * import UnityEmitter from 'unityemitter';
     * const ee = new UnityEmitter();
     *
     * function pong() {
     *   console.log('pong');
     * }
     *
     * ee.on('ping', pong);
     * ee.once('ping', pong);
     * ee.off('ping', pong);
     *
     * ee.emit('ping');
     * ee.emit('ping');
     * ```
     *
     * Returns a reference to the `UnityEmitter`, so that calls can be chained.
     * @since v1.0.0
     */
    public removeListener<K extends keyof Events>(name: K, callbacks: Array<Events[K]>): this;

    public getListener<K extends keyof Events>(name: K): Array<Set<Function>> | undefined;

    public suspendListener<K extends keyof Events>(name: K, time: number): boolean | void;

    public suspendListeners<K extends keyof Events>(entries: Array<{ name: K, time: number }>): this;

    /**
     * Check emitter options.
     * @param options Emitter options
     */
    static checkOptions(options: UnityEmitterOptions): UnityEmitterOptions;
  };

  export { UnityEmitter, ListenerCallback, UnityEmitterOptions, SignaturedListenerMap };
}