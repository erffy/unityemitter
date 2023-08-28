import { ListenerMap } from '../interfaces/ListenerMap';
import { SignaturedListenerMap } from '../interfaces/SignaturedListenerMap';
import { UnityEmitterOptions, UnityEmitterDefaultOptions } from '../interfaces/UnityEmitterOptions';

export default class UnityEmitter<Events extends SignaturedListenerMap<Events> = ListenerMap> {
  protected readonly storage: Map<string, Array<Set<Function>>>;
  public readonly options: UnityEmitterOptions;

  public constructor(options: UnityEmitterOptions = UnityEmitterDefaultOptions) {
    UnityEmitter.checkOptions(options);

    this.storage = new Map<string, Array<Set<Function>>>();
    this.options = options;

    if (options.rejections) {
      process.on('unhandledRejection', (reason) => console.log(`[${this.constructor.name}] Unhandled Rejection: ${reason}`));
      process.on('uncaughtException', (error) => console.log(`[${this.constructor.name}] Uncaught Exception: ${error.message}`));
    };
  };
  
  *[Symbol.iterator]() {
    yield* this.storage;
  };

  public on<K extends keyof Events>(name: K, callback: Events[K]): this {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');
    if (typeof callback != 'function') throw new TypeError('\'callback\' is not function.');
    // @ts-ignore
    if (!this.options.limits.ignore && (this.storage.size > this.options.limits.storage)) process.emitWarning('Possibly EventEmitter memory leak detected. EventEmitter limit exceeded.', { detail: `${this.storage.size}/${this.options.limits.storage}` });

    if (!this.storage.has(name)) this.storage.set(name, [new Set<Function>()]);

    if (!Object.hasOwn(callback, 'data')) Object.defineProperty(callback, 'data', { value: {}, writable: false, configurable: false, enumerable: false });
    // @ts-ignore
    Object.defineProperties(callback.data, {
      'name': { value: name, writable: false, configurable: false, enumerable: true },
      'suspended': { value: false, writable: true, configurable: false, enumerable: true },
      'once': { value: false, writable: false, configurable: false, enumerable: true },
      'emitted': { value: false, writable: true, configurable: false, enumerable: true }
    });
    // @ts-ignore
    const events: Array<Set<Function>> = this.storage.get(name);
    const lastEvent: Set<Function> = events[events.length - 1];

    lastEvent.add(callback);

    // @ts-ignore
    if (!this.options.limits.ignore && !(this.options.limits.store - lastEvent.size)) events.push(new Set<Function>());

    return this;
  };

  public off<K extends keyof Events>(name: K, callback: Events[K]): boolean {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');
    if (typeof callback != 'function') throw new TypeError('\'callback\' is not function.');
    // @ts-ignore
    let events: Array<Set<Function>> = this.storage.get(name);

    for (const event of events) {
      for (const _callback of event) {
        // @ts-ignore
        if (_callback.data.name != callback.data.name) continue;

        event.delete(callback);
      };
    };

    return true;
  };

  public once<K extends keyof Events>(name: K, callback: Events[K]): this {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');
    if (typeof callback != 'function') throw new TypeError('\'callback\' is not function.');
    // @ts-ignore
    if (!this.options.limits.ignore && (this.storage.size > this.options.limits.storage)) process.emitWarning('Possibly EventEmitter memory leak detected. EventEmitter limit exceeded.', { detail: `${this.storage.size}/${this.options.limits.storage}` });

    if (!this.storage.has(name)) this.storage.set(name, [new Set<Function>()]);

    if (!Object.hasOwn(callback, 'data')) Object.defineProperty(callback, 'data', { value: {}, writable: false, configurable: false, enumerable: false });
    // @ts-ignore
    Object.defineProperties(callback.data, {
      'name': { value: name, writable: false, configurable: false, enumerable: true },
      'suspended': { value: false, writable: true, configurable: false, enumerable: true },
      'once': { value: true, writable: false, configurable: false, enumerable: true },
      'emitted': { value: false, writable: true, configurable: false, enumerable: true }
    });
    // @ts-ignore
    const events: Array<Set<Function>> = this.storage.get(name);
    const lastEvent: Set<Function> = events[events.length - 1];
    // @ts-ignore
    lastEvent.add(callback);

    // @ts-ignore
    if (!this.options.limits.ignore && !(this.options.limits.store - lastEvent.size)) events.push(new Set<Function>());

    return this;
  };

  public emit<K extends keyof Events>(name: K, ...args: Parameters<Events[K]>): boolean | void {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');

    if (!this.storage.has(name)) return void 0;
    // @ts-ignore
    let events: Array<Set<Function>> = this.storage.get(name);

    for (const event of events) {
      for (const callback of event) {
        // @ts-ignore
        if (callback.data.suspended) continue;
        // @ts-ignore
        if (callback.data.once && callback.data.emitted) {
          event.delete(callback);
          continue;
        };

        const res: any = callback(...args);
        // @ts-ignore
        if ((res instanceof Promise)) res.then(() => Object.defineProperty(callback.data, 'emitted', { value: true }));
        // @ts-ignore
        else Object.defineProperty(callback.data, 'emitted', { value: true });
      };
    };

    return true;
  };

  public emitted<K extends keyof Events>(name: K): boolean {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');

    // @ts-ignore
    let events: Array<Set<Function>> = this.storage.get(name);

    let state: boolean = false;

    for (const event of events) {
      for (const callback of event) {
        // @ts-ignore
        if (name != callback.data.name) continue;
        // @ts-ignore
        state = callback.data.emitted;
      };
    };

    return state;
  };

  public hasListener<K extends keyof Events>(name: K, callback?: Events[K]): boolean {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');
    if (callback && typeof callback != 'function') throw new TypeError('\'callback\' is not function.');

    if (!this.storage.has(name)) return false;

    // @ts-ignore
    let events: Array<Set<Function>> = this.storage.get(name);
    // @ts-ignore
    events = events.filter((store: Set<Function>) => {
      let e: Array<any> = [];
      // @ts-ignore
      for (const entry of store) (entry.data.name === callback?.data?.name) ? e.push(callback) : void 0;

      return e;
    });

    if (events.length > 0) return true;

    return false;
  };

  public addListeners<K extends keyof Events>(name: K, callbacks: Array<Events[K]>): this {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');

    for (const callback of callbacks) this.on(name, callback);

    return this;
  };

  public removeListeners<K extends keyof Events>(name: K, callbacks: Array<Events[K]>): this {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');

    for (const callback of callbacks) {
      if (typeof callback != 'function') continue;

      this.off(name, callback);
    };

    return this;
  };

  public getListener<K extends keyof Events>(name?: K): Array<Set<Function>> | undefined {
    if (name && typeof name != 'string') throw new TypeError('\'name\' is not string.');
    // @ts-ignore
    const events: Array<Set<Function>> | undefined = this.storage.get(name);
    if (!events?.length) {
      const __events: Array<Set<Function>> = [];

      for (const [, cbset] of this) {
        for (const callback of cbset) __events.push(callback);
      };

      return __events;
    };

    return events;
  };

  public suspendListener<K extends keyof Events>(name: K, time: number): boolean | void {
    if (typeof name != 'string') throw new TypeError('\'name\' is not string.');

    //@ts-ignore
    let events: Array<Set<Function>> = this.storage.get(name);
    for (const event of events) {
      for (const callback of event) {
        // @ts-ignore
        if (name != callback.data.name) continue;
        // @ts-ignore
        Object.defineProperty(callback.data, 'suspended', { value: true });
        // @ts-ignore
        setTimeout(() => Object.defineProperty(callback.data, 'suspended', { value: false }), time);
      };
    };

    return void 0;
  };

  public suspendListeners<K extends keyof Events>(entries: Array<{ name: K, time: number }>): this {
    for (const entry of entries) this.suspendListener(entry.name, entry.time);

    return this;
  };

  static checkOptions(options: UnityEmitterOptions): UnityEmitterOptions {
    if (typeof options != 'object') throw new TypeError('\'options\' is not object.');

    options.rejections ??= false;
    options.limits ??= UnityEmitterDefaultOptions.limits;

    if (typeof options?.rejections != 'boolean') throw new TypeError('\'options.rejections\' is not boolean.');
    if (typeof options?.limits != 'object') throw new TypeError('\'options.limits\' is not object.');

    if (options.limits) {
      // @ts-ignore
      options.limits.storage ??= UnityEmitterDefaultOptions.limits.storage;
      // @ts-ignore
      options.limits.store ??= UnityEmitterDefaultOptions.limits.store;

      if (typeof options.limits?.storage != 'number') throw new TypeError('\'options.limits.storage\' is not number.');
      if (typeof options.limits?.store != 'number') throw new TypeError('\'options.limits.store\' is not number.');
    };

    return options;
  };
};

export * from '../interfaces/UnityEmitterOptions';