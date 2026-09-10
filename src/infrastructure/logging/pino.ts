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
// get consistent Error serialization instead of each call site picking
// fields by hand. Deliberately NOT pino.stdSerializers.err: it also copies
// every other own-enumerable property of the error (plus a `raw: err`
// reference back to the original) — fine for a plain JS Error, but Prisma/pg
// errors can carry things like the failing query or connection details in
// extra fields, and those would otherwise get logged verbatim.
function errSerializer(err: unknown): unknown {
  if (err instanceof Error) {
    return { type: err.name, message: err.message, stack: err.stack };
  }
  // next()/a rejected promise can carry any value (a string, a plain object
  // with arbitrary — possibly sensitive — fields). Redact it rather than
  // logging it verbatim; the whole point of this serializer is to not leak
  // whatever shape an error happens to have.
  return { type: typeof err, message: 'non-Error value thrown or rejected with (redacted)' };
}

const serializers = { err: errSerializer };

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
