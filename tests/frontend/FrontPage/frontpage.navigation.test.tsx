import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import OpenPositionsPage from '@/app/open/page';

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

jest.mock('@/components/site-header', () => ({
  SiteHeader: () => <nav data-testid="site-header">Header</nav>,
}));

describe('FrontPage navigation hints', () => {
  it('uiUxCardNavigatesToUiUxTest', async () => {
    /*
      Description: Check UI/UX Apply Now button links to /test/ui-ux.
      Expected Result: Anchor carries correct href target.
      Runtime (ms): 36
      Unit Name: FrontPage/OpenPositionsPage
    */
    render(<OpenPositionsPage />);

    const uiuxLink = screen.getByRole('link', { name: /^apply now$/i });

    await userEvent.click(uiuxLink);
    expect(uiuxLink).toHaveAttribute('href', '/test/ui-ux');
  });

  it('softwareEngineerCardHasAccessibleLabel', () => {
    /*
      Description: Ensure Software Engineer CTA exposes descriptive aria-label.
      Expected Result: Link includes aria-label that matches intent.
      Runtime (ms): 22
      Unit Name: FrontPage/OpenPositionsPage
    */
    render(<OpenPositionsPage />);

    const link = screen.getByRole('link', {
      name: /apply to software engineer and proceed to test/i,
    });
    expect(link).toHaveAttribute('href', '/test/software-engineer');
  });

  it('ensuresBothApplyButtonsPresent', () => {
    /*
      Description: Verify both Apply Now buttons render simultaneously.
      Expected Result: Two action links exist with Apply text.
      Runtime (ms): 20
      Unit Name: FrontPage/OpenPositionsPage
    */
    render(<OpenPositionsPage />);
    expect(screen.getByRole('link', { name: /^apply now$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /apply to software engineer and proceed to test/i,
      }),
    ).toBeInTheDocument();
  });
});
