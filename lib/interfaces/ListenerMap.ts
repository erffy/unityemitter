export interface ListenerMap {
  [key: string]: (...args: Array<any>) => any;
};

// gereksiz dosya kargaşası olur olmaz bir şey ben öyle yapıyorum db de