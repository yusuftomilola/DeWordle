/**
 * Test-only snapshot and restore helpers for the local Soroban sandbox.
 *
 * Integration tests frequently need a known contract state before each case
 * runs. Capturing a snapshot once and restoring it between tests avoids
 * re-deploying and re-seeding the contracts every time.
 *
 * This module is intentionally NOT exported from the package barrel
 * (`index.ts`): it is a test utility and must not be shipped to production
 * consumers. Import it directly from its module path in test code.
 */

import type { xdr } from "@stellar/stellar-sdk";

/**
 * Minimal adapter over the local Soroban sandbox's state management surface.
 *
 * The sandbox implementation is environment specific, so the snapshot store
 * talks to it through this small interface: `captureState` reads the current
 * contract state and `applyState` writes a previously captured state back.
 */
export interface SandboxStateAdapter {
  /** Read the current sandbox/contract state as a serializable value. */
  captureState(): Promise<unknown>;
  /** Restore the sandbox/contract state from a previously captured value. */
  applyState(state: unknown): Promise<void>;
}

/** A named, point-in-time copy of the sandbox contract state. */
export interface ContractSnapshot {
  /** Caller supplied name, unique within a store. */
  name: string;
  /** ISO-8601 timestamp of when the snapshot was captured. */
  createdAt: string;
  /** Serialized sandbox state as captured from the adapter. */
  state: unknown;
}

/** Raised when a snapshot is restored but was never captured. */
export class SnapshotNotFoundError extends Error {
  constructor(public readonly name: string) {
    super(`Snapshot "${name}" not found`);
    this.name = "SnapshotNotFoundError";
  }
}

/**
 * In-memory store holding any number of named snapshots at once.
 *
 * Snapshots are kept as serialized JSON strings, matching the "store
 * snapshots as serialized JSON objects" requirement, so a store can be
 * persisted to or loaded from disk between test processes.
 */
export class SnapshotStore {
  private readonly snapshots = new Map<string, string>();

  /** Capture the current state under `name`, replacing any existing entry. */
  async takeSnapshot(name: string, adapter: SandboxStateAdapter): Promise<ContractSnapshot> {
    if (!name) throw new Error("Snapshot name is required");
    const state = await adapter.captureState();
    const snapshot: ContractSnapshot = {
      name,
      createdAt: new Date().toISOString(),
      state,
    };
    this.snapshots.set(name, JSON.stringify(snapshot));
    return snapshot;
  }

  /** Restore a previously captured state back into the sandbox. */
  async restoreSnapshot(name: string, adapter: SandboxStateAdapter): Promise<ContractSnapshot> {
    const serialized = this.snapshots.get(name);
    if (serialized === undefined) {
      throw new SnapshotNotFoundError(name);
    }
    const snapshot = JSON.parse(serialized) as ContractSnapshot;
    await adapter.applyState(snapshot.state);
    return snapshot;
  }

  /** Names of every snapshot currently held, in insertion order. */
  listSnapshots(): string[] {
    return Array.from(this.snapshots.keys());
  }

  hasSnapshot(name: string): boolean {
    return this.snapshots.has(name);
  }

  deleteSnapshot(name: string): boolean {
    return this.snapshots.delete(name);
  }

  clear(): void {
    this.snapshots.clear();
  }

  /** Serialize every snapshot for persistence to disk. */
  toJSON(): string {
    return JSON.stringify(Array.from(this.snapshots.values()).map((s) => JSON.parse(s)));
  }

  /** Rehydrate a store from the output of {@link toJSON}. */
  static fromJSON(serialized: string): SnapshotStore {
    const store = new SnapshotStore();
    const records = JSON.parse(serialized) as ContractSnapshot[];
    for (const record of records) {
      store.snapshots.set(record.name, JSON.stringify(record));
    }
    return store;
  }
}

/** Shared default store used by the standalone helpers below. */
export const defaultSnapshotStore = new SnapshotStore();

/** Convenience wrapper around {@link SnapshotStore.takeSnapshot}. */
export function takeSnapshot(
  name: string,
  adapter: SandboxStateAdapter,
  store: SnapshotStore = defaultSnapshotStore,
): Promise<ContractSnapshot> {
  return store.takeSnapshot(name, adapter);
}

/** Convenience wrapper around {@link SnapshotStore.restoreSnapshot}. */
export function restoreSnapshot(
  name: string,
  adapter: SandboxStateAdapter,
  store: SnapshotStore = defaultSnapshotStore,
): Promise<ContractSnapshot> {
  return store.restoreSnapshot(name, adapter);
}

/** List snapshot names held by a store (defaults to the shared store). */
export function listSnapshots(store: SnapshotStore = defaultSnapshotStore): string[] {
  return store.listSnapshots();
}

/** Remove every snapshot held by a store (defaults to the shared store). */
export function clearSnapshots(store: SnapshotStore = defaultSnapshotStore): void {
  store.clear();
}

/**
 * Build a {@link SandboxStateAdapter} from a pair of read/write callbacks,
 * for example wrappers around the sandbox's ledger entry accessors.
 */
export function createSandboxStateAdapter(handlers: {
  captureState: () => Promise<unknown>;
  applyState: (state: unknown) => Promise<void>;
}): SandboxStateAdapter {
  return {
    captureState: handlers.captureState,
    applyState: handlers.applyState,
  };
}

/** Type guard for the raw ledger entry values a sandbox may return. */
export function isXdrScVal(value: unknown): value is xdr.ScVal {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { toXDR?: unknown }).toXDR === "function"
  );
}
