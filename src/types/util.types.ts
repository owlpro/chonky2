export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;
export type Nilable<T> = T | null | undefined;
export type MaybePromise<T> = T | Promise<T>;

export type AnyObject = Record<string | number, any>;
export type AnyObjectWithStringKeys = Record<string, any>;

export type WritableProps<T> = { -readonly [P in keyof T]: T[P] };
