import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '@/components/signup-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ signUp: jest.fn() }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/lib/supabase-client', () => ({
  supabase: { auth: { signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }) } },
}));

describe('Signup password visibility toggles', () => {
  it('togglesPrimaryPasswordVisibility', async () => {
    /*
      Description: Clicking eye icon swaps password input type.
      Expected Result: Input type toggles between password and text.
      Runtime (ms): 40
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const [togglePrimary] = screen.getAllByRole('button', { name: /password/i });

    expect(passwordInput.type).toBe('password');
    await userEvent.click(togglePrimary);
    expect(passwordInput.type).toBe('text');
  });

  it('togglesConfirmPasswordVisibility', async () => {
    /*
      Description: Confirm password eye toggle flips input type.
      Expected Result: Confirm field type becomes text after click.
      Runtime (ms): 38
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    const confirmInput = container.querySelector('input#confirmPassword') as HTMLInputElement;
    const toggles = screen.getAllByRole('button', { name: /password/i });

    await userEvent.click(toggles[1]);
    expect(confirmInput.type).toBe('text');
  });

  it('maintainsPasswordValuesAfterToggle', async () => {
    /*
      Description: Toggling visibility should not lose typed value.
      Expected Result: Input retains password string after toggle cycle.
      Runtime (ms): 44
      Unit Name: Signup/SignUpForm
    */
    const { container } = render(<SignUpForm />);

    const passwordInput = container.querySelector('input#password') as HTMLInputElement;
    const [togglePrimary] = screen.getAllByRole('button', { name: /password/i });

    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.click(togglePrimary);
    await userEvent.click(togglePrimary);

    expect(passwordInput.value).toBe('Password1!');
    expect(passwordInput.type).toBe('password');
  });
});
