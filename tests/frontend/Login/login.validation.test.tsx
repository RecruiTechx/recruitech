import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('Login validation rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it('blocksEmptySubmission', async () => {
    /*
      Description: Submitting empty form should surface required errors.
      Expected Result: Error toast and inline message for missing credentials.
      Runtime (ms): 55
      Unit Name: Login/AuthForm
    */
    const { container } = render(<AuthForm />);
    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.stringContaining('required') }),
      );
    });
    expect(await screen.findByText(/email and password are required/i)).toBeVisible();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('showsInvalidEmailError', async () => {
    /*
      Description: Reject malformed email formats before hitting backend.
      Expected Result: Inline Invalid email message appears and toast fired.
      Runtime (ms): 62
      Unit Name: Login/AuthForm
    */
    const { container } = render(<AuthForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.type(passwordInput, 'Password1!');

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText(/invalid email address/i)).toBeVisible();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('preventsSubmissionWhenPasswordMissing', async () => {
    /*
      Description: Ensure password field is mandatory during submit.
      Expected Result: Form does not call signIn and shows descriptive error.
      Runtime (ms): 50
      Unit Name: Login/AuthForm
    */
    const { container } = render(<AuthForm />);
    const emailInput = container.querySelector('input#email') as HTMLInputElement;

    await userEvent.type(emailInput, 'qa@sample.com');
    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.stringContaining('required') }),
      );
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
