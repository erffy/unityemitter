export type SignaturedListenerMap<T> = {
    [key in keyof T]: (...args: any[]) => any;
}