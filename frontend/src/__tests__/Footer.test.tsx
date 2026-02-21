import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer Component', () => {
    it('renders the copyright text with the current year', () => {
        render(<Footer />);

        expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(new Date().getFullYear().toString(), 'i'))).toBeInTheDocument();
    });
});
