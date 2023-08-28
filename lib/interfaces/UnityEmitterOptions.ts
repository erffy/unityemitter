export interface UnityEmitterOptions {
  /**
   * Capture emit rejections.
   * @default false
   */
  rejections?: boolean;

  /**
   * Manage emitter limits.
   * @default undefined
   */
  limits?: UnityEmitterListenerLimitOptions;
};

export interface UnityEmitterListenerLimitOptions {
  /**
   * Ignore limits.
   * @default false
   */
  ignore?: boolean;

  /**
   * Set the maximum number of callbacks to be kept in the Set class.
   * @default 5
   */
  store?: number;

  /**
   * Set the maximum number of Sets to be kept in the UnityEmitter.
   * @default 11
   */
  storage?: number;
};

export const UnityEmitterDefaultOptions: UnityEmitterOptions = {
  rejections: false,
  limits: {
    ignore: false,
    store: 5,
    storage: 11
  }
};