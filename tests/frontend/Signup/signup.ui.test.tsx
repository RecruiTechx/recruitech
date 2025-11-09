import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '@/components/signup-form';

const mockPush = jest.fn();
const mockSignUp = jest.fn();
const mockToast = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('@/lib/supabase-client', () => ({
  supabase: { auth: { signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }) } },
}));

describe('Signup UI contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rendersCoreFields', () => {
    /*
      Description: Verify email, password, confirm password inputs render.
      Expected Result: Three text fields exist with expected ids.
      Runtime (ms): 30
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    expect(container.querySelector('input#email')).toBeInTheDocument();
    expect(container.querySelector('input#password')).toBeInTheDocument();
    expect(container.querySelector('input#confirmPassword')).toBeInTheDocument();
  });

  it('disablesSubmitWhileLoading', async () => {
    /*
      Description: Submission disables button until async completes.
      Expected Result: aria-busy true and disabled flag set during call.
      Runtime (ms): 54
      Unit Name: Signup/SignUpForm
    */
    let resolveSignUp: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolveSignUp = resolve;
    });
    mockSignUp.mockImplementation(() => pending);

    const { container } = render(<SignUpForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const confirmInput = container.querySelector('input#confirmPassword') as HTMLInputElement;

    await userEvent.type(emailInput, 'new@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.type(confirmInput, 'Password1!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await userEvent.click(submitButton);

    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(submitButton).toBeDisabled();
    resolveSignUp?.();
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it('showsContinueWithGoogleButton', () => {
    /*
      Description: Ensure alternative SSO option visible.
      Expected Result: Button with text “Continue with Google” is rendered.
      Runtime (ms): 24
      Unit Name: Signup/SignUpForm
    */
    render(<SignUpForm />);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });
});
