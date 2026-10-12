import { fireEvent, render, screen } from '@testing-library/react';
import { CommunityResource } from './CommunityResource';

describe('CommunityResource', () => {
  const defaultProps = {
    title: 'Grupos WhatsApp',
    description: 'Conecte-se com a comunidade.',
    icon: <span data-testid="resource-icon" />,
    chips: ['Chat', 'Comunidade'],
    cardClass: 'custom-card',
  };

  it('renders title, description, icon and chips', () => {
    render(<CommunityResource {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'Grupos WhatsApp' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Conecte-se com a comunidade.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('resource-icon')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Comunidade')).toBeInTheDocument();
  });

  it('calls onClick when the card is activated', () => {
    const onClick = jest.fn();
    render(<CommunityResource {...defaultProps} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
