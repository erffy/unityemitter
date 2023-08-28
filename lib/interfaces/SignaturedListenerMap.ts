import { ListenerCallback } from './ListenerCallback';

export type SignaturedListenerMap<T> = {
    [key in keyof T]: ListenerCallback;
}