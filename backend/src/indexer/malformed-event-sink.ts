/**
 * Where events that cannot be indexed are sent so they are not silently lost.
 * Implement it with the dead-letter queue (see `common/dlq.service.ts`) and
 * register it with `IndexerService.setMalformedEventSink`.
 */
export interface MalformedEvent {
  /** The event exactly as the RPC returned it. */
  raw: unknown;
  /** Position of the event within the RPC response. */
  index: number;
  stage: 'structure' | 'validation';
  reason: string;
}

export interface MalformedEventSink {
  record(event: MalformedEvent): Promise<void> | void;
}
