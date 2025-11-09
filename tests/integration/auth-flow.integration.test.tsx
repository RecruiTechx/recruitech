import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/components/auth-form';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockToast = jest.fn();
const mockSignIn = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: {} })),
}));

describe('Auth integration flow', () => {
  const originalEnv = { ...process.env };
  let activeCookieStore: { set: jest.Mock } | null = null;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      NODE_ENV: 'test',
    };

    activeCookieStore = null;

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url === '/api/auth/set-session') {
        const rawBody = typeof init?.body === 'string' ? init.body : init?.body ? JSON.stringify(init.body) : '{}';
        const parsed = JSON.parse(rawBody);
        if (activeCookieStore && parsed?.session) {
          const { session } = parsed;
          activeCookieStore.set('supabase-auth-token', session.access_token ?? '', expect.anything());
          if (session.refresh_token) {
            activeCookieStore.set('supabase-refresh-token', session.refresh_token, expect.anything());
          }
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(null, { status: 200 });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    activeCookieStore = null;
    global.fetch = originalFetch;
  });

  it('completesLoginFlowAndSetsCookies', async () => {
    /*
      Description: Full login flow stores cookies and navigates dashboard.
      Expected Result: Cookie set invoked, toast success, router replace /dashboard.
      Runtime (ms): 120
      Unit Name: Integration/AuthFlow
    */
    const cookieStore = { set: jest.fn() };
    activeCookieStore = cookieStore;
    mockSignIn.mockResolvedValue({
      session: { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 },
    });

    const { container } = render(<AuthForm />);
    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    await userEvent.type(emailInput, 'user@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(cookieStore.set).toHaveBeenCalled();
    });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
  });

  it('showsToastOnLoginFailure', async () => {
    /*
      Description: Downstream signIn rejection results in error toast.
      Expected Result: Toast called with destructive variant and router not invoked.
      Runtime (ms): 90
      Unit Name: Integration/AuthFlow
    */
  activeCookieStore = { set: jest.fn() };
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

    const { container } = render(<AuthForm />);
    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    await userEvent.type(emailInput, 'user@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('restoresRememberedEmailDuringFlow', async () => {
    /*
      Description: Integration ensures remember me hydrates and persists.
      Expected Result: Email input prefilled and remains stored after submission.
      Runtime (ms): 96
      Unit Name: Integration/AuthFlow
    */
    window.localStorage.setItem('rememberedEmail', 'rememberme@qa.dev');
  activeCookieStore = { set: jest.fn() };
    mockSignIn.mockResolvedValue({ session: null });

    const { container } = render(<AuthForm />);
    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    expect(emailInput.value).toBe('rememberme@qa.dev');

    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(window.localStorage.getItem('rememberedEmail')).toBe('rememberme@qa.dev');
  });
});
