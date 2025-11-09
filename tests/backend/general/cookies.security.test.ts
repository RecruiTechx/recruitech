/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

type RouteHandler = (request: NextRequest) => Promise<Response>;

const cookiesMock = jest.fn();

jest.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: {} })),
}));

describe('Cookie security configuration', () => {
  let routeHandler: RouteHandler;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    jest.resetModules();
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
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('setsHttpOnlyAccessToken', async () => {
    /*
      Description: Access token cookie must be httpOnly for security.
      Expected Result: Cookie store receives httpOnly: true.
      Runtime (ms): 52
      Unit Name: Backend/CookieSecurity
    */
    const cookieStore = { set: jest.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    await routeHandler(
      new NextRequest('http://localhost/api/auth/set-session', {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          session: { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 },
        }),
      }),
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      'supabase-auth-token',
      'token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('usesOneYearMaxAgeForRefreshToken', async () => {
    /*
      Description: Refresh tokens should persist roughly one year.
      Expected Result: Cookie options maxAge equals 31536000 seconds.
      Runtime (ms): 50
      Unit Name: Backend/CookieSecurity
    */
    const cookieStore = { set: jest.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    await routeHandler(
      new NextRequest('http://localhost/api/auth/set-session', {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          session: { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 },
        }),
      }),
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      'supabase-refresh-token',
      'refresh',
      expect.objectContaining({ maxAge: 60 * 60 * 24 * 365 }),
    );
  });

  it('usesLaxSameSite', async () => {
    /*
      Description: SameSite flag should default to lax for auth cookies.
      Expected Result: Cookie options include sameSite: "lax".
      Runtime (ms): 48
      Unit Name: Backend/CookieSecurity
    */
    const cookieStore = { set: jest.fn() };
    cookiesMock.mockResolvedValue(cookieStore);

    await routeHandler(
      new NextRequest('http://localhost/api/auth/set-session', {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          session: { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 },
        }),
      }),
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      'supabase-auth-token',
      'token',
      expect.objectContaining({ sameSite: 'lax' }),
    );
  });
});
