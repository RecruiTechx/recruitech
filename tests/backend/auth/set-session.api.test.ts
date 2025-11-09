/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: {} })),
}));

const cookiesMock = jest.fn();

jest.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

describe('POST /api/auth/set-session', () => {
  const originalEnv = { ...process.env };
  let routeHandler: (request: NextRequest) => Promise<Response>;

  async function invokeHandler(payload: unknown) {
    const request = { json: async () => payload } as Pick<NextRequest, 'json'>;
    return routeHandler(request as NextRequest);
  }

  beforeEach(async () => {
    jest.resetModules();
    cookiesMock.mockReset();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      NODE_ENV: 'test',
    };

    const module = await import('@/app/api/auth/set-session/route');
    routeHandler = module.POST;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('setsAuthAndRefreshCookies', async () => {
    /*
      Description: Valid session creates access and refresh cookies.
      Expected Result: Cookie store set invoked with correct maxAge and flags.
      Runtime (ms): 70
      Unit Name: Backend/SetSessionRoute
    */
    const cookieStore = { set: jest.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    const response = await invokeHandler({
      session: {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(cookieStore.set).toHaveBeenCalledWith(
      'supabase-auth-token',
      'token',
      expect.objectContaining({ httpOnly: true, maxAge: 3600 }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'supabase-refresh-token',
      'refresh',
      expect.objectContaining({ maxAge: 60 * 60 * 24 * 365 }),
    );
  });

  it('returns400WhenSessionMissing', async () => {
    /*
      Description: Missing session payload should produce client error.
      Expected Result: Response status 400 with descriptive message.
      Runtime (ms): 55
      Unit Name: Backend/SetSessionRoute
    */
    cookiesMock.mockResolvedValue({ set: jest.fn() });

    const response = await invokeHandler({});

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'No session provided' });
  });

  it('marksCookiesSecureInProduction', async () => {
    /*
      Description: Production mode must set secure flag.
      Expected Result: Cookie options secure property true.
      Runtime (ms): 60
      Unit Name: Backend/SetSessionRoute
    */
  process.env = { ...process.env, NODE_ENV: 'production' };
    const cookieStore = { set: jest.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    await invokeHandler({
      session: {
        access_token: 'prod-token',
        refresh_token: 'prod-refresh',
        expires_in: 1800,
      },
    });

    expect(cookieStore.set).toHaveBeenCalledWith(
      'supabase-auth-token',
      'prod-token',
      expect.objectContaining({ secure: true }),
    );
  });

  it('handlesCookieWriteFailures', async () => {
    /*
      Description: When cookie set throws, route should respond 500.
      Expected Result: Response status 500 with failure message.
      Runtime (ms): 65
      Unit Name: Backend/SetSessionRoute
    */
    const cookieStore = {
      set: jest.fn(() => {
        throw new Error('Write failed');
      }),
    };
    cookiesMock.mockResolvedValue(cookieStore);

    const response = await invokeHandler({
      session: {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
      },
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to set session' });
  });
});
