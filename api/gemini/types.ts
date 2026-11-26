import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ServerlessRequest extends IncomingMessage {
  body?: unknown;
}

export interface ServerlessResponse extends ServerResponse {
  status(code: number): this;
  json(body: unknown): this;
}
