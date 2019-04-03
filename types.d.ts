import {Callbag} from 'callbag';

export type START = 0;
export type DATA = 1;
export type END = 2;
export type RESERVED_3 = 3;
export type RESERVED_4 = 4;
export type RESERVED_5 = 5;
export type RESERVED_6 = 6;
export type RESERVED_7 = 7;
export type RESERVED_8 = 8;
export type RESERVED_9 = 9;

/**
 * A Tallbag dynamically receives input of type I
 * and dynamically delivers output of type O
 */
export type Tallbag<I, O, M> = {
  (t: START, d: Tallbag<O, I, M>, s?: Callbag<void, M>): void;
  (t: DATA, d: I): void;
  (t: END, d?: any): void;
};

/**
 * A source only delivers data
 */
export type Source<T, M> = Tallbag<never, T, M>;

/**
 * A sink only receives data
 */
export type Sink<T, M> = Tallbag<T, never, M>;

export type SourceFactory<T, M> = (...args: Array<any>) => Source<T, M>;

export type SourceOperator<T, R, M> = (
  ...args: Array<any>
) => (source: Source<T, M>) => Source<R, M>;

/**
 * Conditional types for contained type retrieval
 */
export type UnwrapSource<T extends Source<any, any>> = T extends Source<
  infer R,
  any
>
  ? R
  : never;
export type UnwrapSink<T extends Sink<any, any>> = T extends Sink<infer R, any>
  ? R
  : never;
