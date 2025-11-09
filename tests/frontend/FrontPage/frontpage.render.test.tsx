import { render, screen, within } from '@testing-library/react';
import OpenPositionsPage from '@/app/open/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
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

describe('FrontPage render contract', () => {
  it('rendersCoreSections', () => {
    /*
      Description: Ensure hero, notice, and role grid appear on first paint.
      Expected Result: Main heading, notice banner, and grid are visible.
      Runtime (ms): 28
      Unit Name: FrontPage/OpenPositionsPage
    */
    render(<OpenPositionsPage />);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /open positions/i })).toBeVisible();
    expect(screen.getByText(/important notice/i)).toBeVisible();
    expect(screen.getByRole('main')).toBeVisible();
  });

  it('displaysRoleCardsWithDescriptions', () => {
    /*
      Description: Validate both role cards include name and description text.
      Expected Result: UI/UX and Software Engineer cards show copy blocks.
      Runtime (ms): 32
      Unit Name: FrontPage/OpenPositionsPage
    */
    render(<OpenPositionsPage />);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);

    const uiux = within(cards[0]);
    expect(uiux.getByText(/ui\/ux designer/i)).toBeVisible();
    expect(uiux.getByText(/accessible experiences/i)).toBeVisible();

    const swe = within(cards[1]);
    expect(swe.getByText(/software engineer/i)).toBeVisible();
    expect(swe.getByText(/maintain reliable applications/i)).toBeVisible();
  });

  it('rendersNoticeBanner', () => {
    /*
      Description: Confirm the exam warning banner content is stable.
      Expected Result: Banner contains warning text and guidance copy.
      Runtime (ms): 24
      Unit Name: FrontPage/OpenPositionsPage
    */
    render(<OpenPositionsPage />);

    const notice = screen.getByText(/applying for any position will require/i);
    expect(notice).toBeVisible();
    expect(notice.closest('div')).toHaveClass('bg-orange-50');
  });
});
