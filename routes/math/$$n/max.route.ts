import { echoResponse } from '../../../lib/echoResponse.ts';

export const GET = (req: { url: string }) => echoResponse(req, import.meta.url);
