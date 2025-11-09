import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/components/auth-form';

const mockReplace = jest.fn();
const mockSignIn = jest.fn();
const mockToast = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
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

jest.mock('@/lib/supabase-client', () => ({
  supabase: { auth: { signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }) } },
}));

describe('Login UI contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it('rendersAuthFormFields', () => {
    /*
      Description: Guarantee key inputs, toggles, and buttons render.
      Expected Result: Email, password, remember checkbox, submit, and Google button visible.
      Runtime (ms): 31
      Unit Name: Login/AuthForm
    */
    const { container } = render(<AuthForm />);

    const emailInput = container.querySelector('input#email');
    expect(emailInput).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  it('submitButtonShowsBusyState', async () => {
    /*
      Description: Validate busy flag and disable state during submission.
      Expected Result: Submit button toggles aria-busy and disables while signIn resolves.
      Runtime (ms): 48
      Unit Name: Login/AuthForm
    */
    mockSignIn.mockResolvedValue({ session: null });
    const { container } = render(<AuthForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    await userEvent.type(emailInput, 'qa@sample.com');
    await userEvent.type(passwordInput, 'Password1!');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
      expect(submitButton).toBeDisabled();
    });
  });

  it('rendersGoogleSignInButton', async () => {
    /*
      Description: Confirm Google OAuth button triggers Supabase call.
      Expected Result: signInWithOAuth invoked with google provider.
      Runtime (ms): 42
      Unit Name: Login/AuthForm
    */
    const user = userEvent.setup();
    render(<AuthForm />);

    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleButton);

    const { supabase } = await import('@/lib/supabase-client');
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/dashboard') },
    });
  });

  it('navigatesToDashboardAfterSuccessfulSignIn', async () => {
    /*
      Description: Successful form submission should redirect users to dashboard.
      Expected Result: Router replace called with /dashboard after toast success.
      Runtime (ms): 60
      Unit Name: Login/AuthForm
    */
    mockSignIn.mockResolvedValue({
      session: { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 },
    });

    const { container } = render(<AuthForm />);
    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    await userEvent.type(emailInput, 'qa@sample.com');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Success', description: expect.stringContaining('Signed in successfully') }),
      );
    });
  });
});
