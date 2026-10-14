export interface SnapshotMetadata {
  fromCache: boolean;
  hasPendingWrites: boolean;
}

export interface DocSnapshot<T> {
  id: string;
  exists: boolean;
  data: () => T | undefined;
  metadata: SnapshotMetadata;
}

export interface CollectionSnapshot<T> {
  docs: DocSnapshot<T>[];
  size: number;
  empty: boolean;
  metadata: SnapshotMetadata;
}

export type Unsubscribe = () => void;

export interface DocRef<T> {
  id: string;
  path: string;
  get: () => Promise<DocSnapshot<T>>;
  set: (data: T) => Promise<void>;
  update: (data: Partial<T>) => Promise<void>;
  delete: () => Promise<void>;
  onSnapshot: (
    onNext: (snap: DocSnapshot<T>) => void,
    onError?: (err: unknown) => void,
  ) => Unsubscribe;
}

export interface CollectionRef<T> {
  path: string;
  doc: (id?: string) => DocRef<T>;
  add: (data: T) => Promise<DocRef<T>>;
  get: () => Promise<CollectionSnapshot<T>>;
  onSnapshot: (
    onNext: (snap: CollectionSnapshot<T>) => void,
    onError?: (err: unknown) => void,
  ) => Unsubscribe;
}

export interface LocalDatabase {
  doc: <T>(path: string) => DocRef<T>;
  collection: <T>(path: string) => CollectionRef<T>;
}

export interface WriteError {
  code: "quota_exceeded" | "invalid_argument" | "unknown";
}
