import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpenPositionsPage from '@/app/open/page';

const mockRouterPush = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Navigation integration scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirectsUnauthenticatedApplyToAuth', async () => {
    /*
      Description: Clicking Apply from header when signed out should go to /auth.
      Expected Result: Router push invoked with /auth on unauthenticated click.
      Runtime (ms): 84
      Unit Name: Integration/Navigation
    */
    mockUseAuth.mockReturnValue({ isAuthenticated: false, signOut: jest.fn(), user: null });
    render(<OpenPositionsPage />);

  const applyButton = screen.getByRole('button', { name: /apply/i });
    await userEvent.click(applyButton);

    expect(mockRouterPush).toHaveBeenCalledWith('/auth');
  });

  it('maintainsOpenPositionsContent', () => {
    /*
      Description: Verify rendering of content alongside header with auth logic.
      Expected Result: Role cards and hero text visible with auth mock.
      Runtime (ms): 32
      Unit Name: Integration/Navigation
    */
    mockUseAuth.mockReturnValue({ isAuthenticated: false, signOut: jest.fn(), user: null });
    render(<OpenPositionsPage />);

  expect(screen.getByText(/open positions/i)).toBeVisible();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('allowsDirectNavigationForAuthenticatedUsers', async () => {
    /*
      Description: Applying when authenticated should go straight to /open.
      Expected Result: Router push receives /open after button click.
      Runtime (ms): 88
      Unit Name: Integration/Navigation
    */
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      signOut: jest.fn(),
      user: { user_metadata: { full_name: 'QA User' } },
    });
    render(<OpenPositionsPage />);

  const applyButton = screen.getByRole('button', { name: /apply/i });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/open');
    });
  });
});
