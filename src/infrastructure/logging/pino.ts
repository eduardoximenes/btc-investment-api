import path from 'node:path';
import pino, { type Logger } from 'pino';
import { getCorrelationId } from './correlation-id.store.ts';

/**
 * Injects the request's correlation id (if any is open on the
 * AsyncLocalStorage scope) into every log line, for both destinations
 * below — no call site has to pass it explicitly.
 */
function mixin(): Record<string, unknown> {
  const correlationId = getCorrelationId();
  return correlationId ? { correlationId } : {};
}

// Callers pass an `err` field in meta (e.g. `logger.error(msg, { err })`) and
// get pino's standard Error serialization (message, stack, cause, type — even
// for non-Error throws) instead of each call site picking fields by hand.
const serializers = { err: pino.stdSerializers.err };

/**
 * Request/HTTP-originated logs. Writes to stdout so live traffic can be
 * watched without job noise.
 */
export const requestLogger: Logger = pino({ mixin, serializers });

/**
 * Reserved for future job/worker activity (BullMQ workers, etc.). Writes to
 * its own file so it stays separate from request logs; nothing logs through
 * this yet, but the destination is configured and ready.
 */
export const jobLogger: Logger = pino(
  { mixin, serializers },
  pino.destination({
    dest: path.resolve(process.cwd(), 'logs', 'jobs.log'),
    mkdir: true,
  }),
);
