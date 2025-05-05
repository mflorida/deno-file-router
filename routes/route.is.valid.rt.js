import { echoResponse } from '../lib/echoResponse.ts';

export const GET = (req) => echoResponse(req, import.meta.url);
