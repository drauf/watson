import { render, screen } from '@testing-library/react';
import HelpPage from './HelpPage';

describe('HelpPage', () => {
  it('renders the support heading and contact links', () => {
    render(<HelpPage />);

    expect(screen.getByRole('heading', { name: "Glad you're here" })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Slack' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/drauf/watson');
    expect(screen.getByRole('link', { name: 'email' })).toHaveAttribute('href', 'mailto:drauf@atlassian.com');
  });
});
