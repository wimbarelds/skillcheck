import { type Dispatch, type SetStateAction } from 'react';

export type Setter<T> = Dispatch<SetStateAction<T>>;
