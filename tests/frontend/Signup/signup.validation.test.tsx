import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('Signup validation rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('rejectsInvalidEmail', async () => {
    /*
      Description: Validate email regex triggers on malformed address.
      Expected Result: Invalid email error text appears under field.
      Runtime (ms): 58
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const confirmInput = container.querySelector('input#confirmPassword') as HTMLInputElement;

    await userEvent.type(emailInput, 'bad-email');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.type(confirmInput, 'Password1!');
    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText(/invalid email address/i)).toBeVisible();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejectsWeakPassword', async () => {
    /*
      Description: Ensure password complexity enforced via schema.
      Expected Result: At least one uppercase error displayed.
      Runtime (ms): 52
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const confirmInput = container.querySelector('input#confirmPassword') as HTMLInputElement;

    await userEvent.type(emailInput, 'user@qa.dev');
    await userEvent.type(passwordInput, 'password1!');
    await userEvent.type(confirmInput, 'password1!');
    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText(/uppercase letter/i)).toBeVisible();
  });

  it('rejectsMismatchedPasswords', async () => {
    /*
      Description: Confirm confirmPassword must match password field.
      Expected Result: “Passwords do not match” message rendered.
      Runtime (ms): 46
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const confirmInput = container.querySelector('input#confirmPassword') as HTMLInputElement;

    await userEvent.type(emailInput, 'user@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.type(confirmInput, 'Password2!');
    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText(/passwords do not match/i)).toBeVisible();
  });

  it('showsSuccessToastOnValidSubmission', async () => {
    /*
      Description: Successful submission triggers toast and redirect timer.
      Expected Result: Toast success message and router push to /auth.
      Runtime (ms): 68
      Unit Name: Signup/SignUpForm
    */
    mockSignUp.mockResolvedValue({});
    const { container } = render(<SignUpForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const confirmInput = container.querySelector('input#confirmPassword') as HTMLInputElement;

    await userEvent.type(emailInput, 'user@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.type(confirmInput, 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Success', description: expect.stringContaining('Account created successfully') }),
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth'), { timeout: 1500 });
  });
});
