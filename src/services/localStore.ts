import type {
  CollectionRef,
  CollectionSnapshot,
  DocRef,
  DocSnapshot,
  LocalDatabase,
  SnapshotMetadata,
  Unsubscribe,
} from "@app-types/store.types";

type Store = Record<string, unknown>;

interface Subscription {
  path?: string;
  col?: string;
  onNext: (snap: DocSnapshot<unknown> | CollectionSnapshot<unknown>) => void;
}

const METADATA: SnapshotMetadata = { fromCache: false, hasPendingWrites: false };

function clone<T>(value: T): T {
  return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * Banco local persistido em localStorage, com a mesma forma de API usada
 * por bancos de documentos (doc/collection/onSnapshot) para manter os hooks
 * independentes de onde os dados realmente moram.
 */
export function createLocalDatabase(storageKey: string, seed: Store): LocalDatabase {
  let store: Store = loadOrSeed();
  let subscriptions: Subscription[] = [];

  function loadOrSeed(): Store {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as Store;
    } catch {
      // localStorage indisponível ou dado corrompido: cai para o seed.
    }
    return clone(seed);
  }

  function persist(): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch {
      // Sem espaço de armazenamento: a escrita em memória ainda é aplicada.
    }
  }

  function snapshotDoc<T>(path: string): DocSnapshot<T> {
    const data = store[path] as T | undefined;
    return {
      id: path.split("/").pop() ?? path,
      exists: data !== undefined,
      data: () => (data === undefined ? undefined : clone(data)),
      metadata: METADATA,
    };
  }

  function snapshotCollection<T>(col: string): CollectionSnapshot<T> {
    const docs = Object.keys(store)
      .filter((path) => {
        const segments = path.split("/");
        return segments.length === 2 && segments[0] === col;
      })
      .sort()
      .map((path) => snapshotDoc<T>(path));
    return { docs, size: docs.length, empty: docs.length === 0, metadata: METADATA };
  }

  function emit(): void {
    persist();
    subscriptions.forEach((sub) => {
      setTimeout(() => {
        sub.onNext(sub.col ? snapshotCollection(sub.col) : snapshotDoc(sub.path as string));
      }, 0);
    });
  }

  function docRef<T>(path: string): DocRef<T> {
    return {
      id: path.split("/").pop() ?? path,
      path,
      get: () => Promise.resolve(snapshotDoc<T>(path)),
      set: (data: T) => {
        store[path] = clone(data);
        emit();
        return Promise.resolve();
      },
      update: (data: Partial<T>) => {
        const current = store[path] as T | undefined;
        if (current === undefined) return Promise.reject({ code: "invalid_argument" });
        store[path] = Object.assign({}, current, clone(data));
        emit();
        return Promise.resolve();
      },
      delete: () => {
        delete store[path];
        emit();
        return Promise.resolve();
      },
      onSnapshot: (onNext, onError) => {
        const sub: Subscription = { path, onNext: onNext as Subscription["onNext"] };
        subscriptions.push(sub);
        setTimeout(() => onNext(snapshotDoc<T>(path)), 0);
        void onError;
        return () => {
          subscriptions = subscriptions.filter((s) => s !== sub);
        };
      },
    };
  }

  function collectionRef<T>(col: string): CollectionRef<T> {
    return {
      path: col,
      doc: (id) => docRef<T>(`${col}/${id ?? Math.random().toString(36).slice(2, 12)}`),
      add: (data: T) => {
        const ref = docRef<T>(`${col}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`);
        return ref.set(data).then(() => ref);
      },
      get: () => Promise.resolve(snapshotCollection<T>(col)),
      onSnapshot: (onNext, onError) => {
        const sub: Subscription = { col, onNext: onNext as Subscription["onNext"] };
        subscriptions.push(sub);
        setTimeout(() => onNext(snapshotCollection<T>(col)), 0);
        void onError;
        return () => {
          subscriptions = subscriptions.filter((s) => s !== sub);
        };
      },
    };
  }

  return {
    doc: docRef,
    collection: collectionRef,
  };
}

export type { Unsubscribe };
