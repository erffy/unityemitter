import { ListenerMap } from '../interfaces/ListenerMap';
import { SignaturedListenerMap } from '../interfaces/SignaturedListenerMap';
import { EchoEmitterOptions, EchoEmitterDefaultOptions } from '../interfaces/EchoEmitterOptions';

export default class EchoEmitter<Events extends SignaturedListenerMap<Events> = ListenerMap> {
  private readonly listeners: Map<string, Array<{ storage: Set<Function>, once?: boolean, emitted?: boolean }>>;
  private readonly options: EchoEmitterOptions;

  public constructor(options: EchoEmitterOptions = EchoEmitterDefaultOptions) {
    this.listeners = new Map<string, Array<{ storage: Set<Function>, once?: boolean, emitted?: boolean }>>();
    this.options = options;
  };
  
  public on<K extends keyof Events>(name: K, callback: Events[K]): this;
  public on(name: string, callback: Function): this {
    if (typeof name != 'string') throw new TypeError(`'name' must be a string.`);
    if (typeof callback != 'function') throw new TypeError(`'callback' must be a function.`);

    if (!this.listeners.has(name)) this.listeners.set(name, [{ storage: new Set<Function>() }]);

    // @ts-ignore
    let events: Array<{ storage: Set<Function>, once?: boolean, emitted?: boolean }> = this.listeners.get(name);
    if (!events.length) events = [];

    for (const event of events) {
      if (event?.storage && event.storage.size <= 5) event.storage.add(callback);
      else {
        const storage: Set<Function> = new Set<Function>();
        storage.add(callback);

        this.listeners.set(name, [...events, { storage }]);
      };
    };

    return this;
  };

  public once<K extends keyof Events>(name: K, callback: Events[K]): this;
  public once(name: string, callback: Function): this {
    if (typeof name != 'string') throw new TypeError(`'name' must be a string.`);
    if (typeof callback != 'function') throw new TypeError(`'callback' must be a function.`);

    if (!this.listeners.has(name)) this.listeners.set(name, [{ storage: new Set<Function>(), once: true }]);

    // @ts-ignore
    let events: Array<{ storage: Set<Function>, once?: boolean, emitted?: boolean }> = this.listeners.get(name);
    if (!events.length) events = [];

    for (const event of events) {
      if (!event?.once) continue;

      if (event.storage.size <= 5) event.storage.add(callback);
      else {
        const storage: Set<Function> = new Set<Function>();
        storage.add(callback);

        events.push({ storage, once: true });
      };
    };

    return this;
  };

  public emit<K extends keyof Events>(name: K, ...args: Array<any>): boolean | void;
  public emit(name: string, ...args: Array<any>): boolean | void {
    if (typeof name != 'string') throw new TypeError(`'name' must be a string.`);

    if (!this.listeners.has(name)) return void 0;

    // @ts-ignore
    let events: Array<{ storage: Set<Function>, once?: boolean, emitted?: boolean }> = this.listeners.get(name);
    if (!events?.length) events = [];

    for (const event of events) {
      for (const callback of event.storage) {
        if (event?.once && event?.emitted) {
          event.storage.delete(callback);
          continue;
        };

        callback(...args);
        event.emitted = true;
      };
    };

    return true;
  };
};