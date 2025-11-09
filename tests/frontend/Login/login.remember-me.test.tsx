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

describe('Login remember me behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    window.localStorage.clear();
  });

  it('prepopulatesEmailFromStorage', () => {
    /*
      Description: Stored email should hydrate input on mount.
      Expected Result: Email input value equals rememberedEmail entry.
      Runtime (ms): 35
      Unit Name: Login/AuthForm
    */
    window.localStorage.setItem('rememberedEmail', 'remember@qa.dev');
    const { container } = render(<AuthForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    expect(emailInput.value).toBe('remember@qa.dev');
  });

  it('storesEmailWhenRememberMeChecked', async () => {
    /*
      Description: Successful login with remember me stores email.
      Expected Result: localStorage receives rememberedEmail key.
      Runtime (ms): 58
      Unit Name: Login/AuthForm
    */
    mockSignIn.mockResolvedValue({ session: null });
    const { container } = render(<AuthForm />);

    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

  await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'store@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    await userEvent.click(screen.getByRole('checkbox', { name: /remember me/i }));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem('rememberedEmail')).toBe('store@qa.dev');
    });
  });

  it('removesEmailWhenRememberMeUnchecked', async () => {
    /*
      Description: Opting out clears cached email from storage.
      Expected Result: remember key absent after successful login.
      Runtime (ms): 60
      Unit Name: Login/AuthForm
    */
    window.localStorage.setItem('rememberedEmail', 'remove@qa.dev');
    mockSignIn.mockResolvedValue({ session: null });

    const { container } = render(<AuthForm />);
    const emailInput = container.querySelector('input#email') as HTMLInputElement;
    const passwordInput = container.querySelector('input#password') as HTMLInputElement;

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'remove@qa.dev');
    await userEvent.type(passwordInput, 'Password1!');
    const checkbox = screen.getByRole('checkbox', { name: /remember me/i }) as HTMLInputElement;
    await waitFor(() => expect(checkbox).toBeChecked());
    await userEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem('rememberedEmail')).toBeNull();
    });
  });
});
