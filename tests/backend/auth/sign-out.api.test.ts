/**
 * @jest-environment node
 */
import express from 'express';
import request from 'supertest';
import { NextRequest } from 'next/server';

const cookiesMock = jest.fn();

jest.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

describe('POST /api/auth/sign-out', () => {
  let app: express.Express;
  let routeHandler: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.resetModules();

    const module = await import('@/app/api/auth/sign-out/route');
    routeHandler = module.POST;

    app = express();
    app.post('/api/auth/sign-out', async (_req: express.Request, res: express.Response) => {
      const nextRequest = new NextRequest('http://localhost/api/auth/sign-out', {
        method: 'POST',
      });

      const response = await routeHandler(nextRequest);
      const payload = await response.json();
      res
        .status(response.status ?? 200)
        .set(Object.fromEntries(response.headers.entries()))
        .json(payload);
    });
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('clearsAuthCookies', async () => {
    /*
      Description: Ensure sign-out deletes Supabase session cookies.
      Expected Result: Cookie store delete called for both tokens.
      Runtime (ms): 64
      Unit Name: Backend/SignOutRoute
    */
    const cookieStore = { delete: jest.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    const response = await request(app).post('/api/auth/sign-out');

    expect(response.status).toBe(200);
    expect(cookieStore.delete).toHaveBeenCalledWith('supabase-auth-token');
    expect(cookieStore.delete).toHaveBeenCalledWith('supabase-refresh-token');
  });

  it('ignoresMissingCookies', async () => {
    /*
      Description: Lack of cookies should not break handler.
      Expected Result: Response still 200 success true.
      Runtime (ms): 45
      Unit Name: Backend/SignOutRoute
    */
    cookiesMock.mockResolvedValue({ delete: jest.fn() });
    const response = await request(app).post('/api/auth/sign-out');
    expect(response.body).toEqual({ success: true });
  });

  it('returns500OnCookieDeletionFailure', async () => {
    /*
      Description: Handle delete throwing errors gracefully.
      Expected Result: Response status 500 with failure message.
      Runtime (ms): 72
      Unit Name: Backend/SignOutRoute
    */
    const cookieStore = {
      delete: jest.fn(() => {
        throw new Error('delete failed');
      }),
    };
    cookiesMock.mockResolvedValue(cookieStore);

    const response = await request(app).post('/api/auth/sign-out');

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Failed to sign out');
  });
});
