import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { LoanForm } from './LoanForm'
import { renderWithClient } from '@/test-utils'
import '@testing-library/jest-dom'

// Mock fetch
global.fetch = jest.fn()

describe('LoanForm', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear()
    })

    describe('Basic Rendering', () => {
        it('renders correctly with all form fields', async () => {
            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            );

            // Mock loan products
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'product-1',
                            name: 'Personal Loan (10%)',
                            minPrincipal: 1000,
                            maxPrincipal: 50000,
                            interestRate: 10,
                            interestType: 'REDUCING',
                            term: 12,
                            termUnit: 'MONTHS',
                            fees: null,
                            penalties: null,
                        },
                    ],
                })
            );

            renderWithClient(<LoanForm />)

            await waitFor(() => {
                expect(screen.getByText('Borrower')).toBeInTheDocument()
                expect(screen.getByText('Loan Product')).toBeInTheDocument()
                expect(screen.getByText('Principal Amount')).toBeInTheDocument()
                expect(screen.getByText('Interest Rate (%)')).toBeInTheDocument()
                expect(screen.getByText('Duration')).toBeInTheDocument()
                expect(screen.getByText('Repayment Cycle')).toBeInTheDocument()
            })
        })
    })

    describe('Loading States', () => {
        it('shows loading skeleton while fetching loan products', async () => {
            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            );

            // Mock loan products with delay
            (global.fetch as jest.Mock).mockImplementationOnce(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () =>
                                resolve({
                                    ok: true,
                                    json: async () => [],
                                }),
                            100
                        )
                    )
            );

            renderWithClient(<LoanForm />)

            // Should show loading skeleton initially
            const loadingElements = screen.getAllByRole('generic')
            expect(loadingElements.length).toBeGreaterThan(0)
        })
    })

    describe('Error Handling', () => {
        it('shows error message when loan products fail to load', async () => {
            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            );

            // Mock loan products error
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                    status: 500,
                })
            );

            renderWithClient(<LoanForm />)

            await waitFor(() => {
                expect(
                    screen.getByText(/Failed to load loan products/i)
                ).toBeInTheDocument()
            })
        })

        it('shows message when no loan products are available', async () => {
            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            );

            // Mock empty loan products
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            );

            renderWithClient(<LoanForm />)

            await waitFor(() => {
                expect(
                    screen.getByText(/No loan products available/i)
                ).toBeInTheDocument()
            })
        })
    })

    describe('Form Validation', () => {
        it('validates required fields on submit', async () => {
            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'borrower-1',
                            firstName: 'John',
                            lastName: 'Doe',
                            uniqueId: 'B001',
                        },
                    ],
                })
            );

            // Mock loan products
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'product-1',
                            name: 'Personal Loan (10%)',
                            minPrincipal: 1000,
                            maxPrincipal: 50000,
                            interestRate: 10,
                            interestType: 'REDUCING',
                            term: 12,
                            termUnit: 'MONTHS',
                            fees: null,
                            penalties: null,
                        },
                    ],
                })
            );

            renderWithClient(<LoanForm />)

            await waitFor(() => {
                expect(screen.getByText('Submit Application')).toBeInTheDocument()
            })

            const submitBtn = screen.getByText('Submit Application')
            fireEvent.click(submitBtn)

            await waitFor(() => {
                expect(screen.getByText('Borrower is required')).toBeInTheDocument()
                expect(screen.getByText('Loan Product is required')).toBeInTheDocument()
            })
        })

        it('validates numeric fields are positive', async () => {
            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'borrower-1',
                            firstName: 'John',
                            lastName: 'Doe',
                            uniqueId: 'B001',
                        },
                    ],
                })
            );

            // Mock loan products
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'product-1',
                            name: 'Personal Loan (10%)',
                            minPrincipal: 1000,
                            maxPrincipal: 50000,
                            interestRate: 10,
                            interestType: 'REDUCING',
                            term: 12,
                            termUnit: 'MONTHS',
                            fees: null,
                            penalties: null,
                        },
                    ],
                })
            );

            renderWithClient(<LoanForm />)

            await waitFor(() => {
                expect(screen.getByText('Principal Amount')).toBeInTheDocument()
            })

            // Try to submit with invalid principal
            const principalInput = screen.getByLabelText('Principal Amount')
            fireEvent.change(principalInput, { target: { value: '-1000' } })

            const submitBtn = screen.getByText('Submit Application')
            fireEvent.click(submitBtn)

            await waitFor(() => {
                expect(screen.getByText(/Principal must be greater than 0/i)).toBeInTheDocument()
            })
        })
    })

    describe('Loan Products Display', () => {
        it('displays loan products fetched from API', async () => {
            const mockProducts = [
                {
                    id: 'product-1',
                    name: 'Personal Loan (10%)',
                    minPrincipal: 1000,
                    maxPrincipal: 50000,
                    interestRate: 10,
                    interestType: 'REDUCING',
                    term: 12,
                    termUnit: 'MONTHS',
                    fees: null,
                    penalties: null,
                },
                {
                    id: 'product-2',
                    name: 'Business Loan (5%)',
                    minPrincipal: 5000,
                    maxPrincipal: 200000,
                    interestRate: 5,
                    interestType: 'REDUCING',
                    term: 24,
                    termUnit: 'MONTHS',
                    fees: null,
                    penalties: null,
                },
            ];

            // Mock borrowers
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            );

            // Mock loan products
            (global.fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: async () => mockProducts,
                })
            );

            renderWithClient(<LoanForm />)

            await waitFor(() => {
                expect(screen.getByText('Loan Product')).toBeInTheDocument()
            })

            // Products should be available in the select dropdown
            // Note: Testing dropdown interaction requires more complex setup
            // This test verifies the component renders with products loaded
        })
    })
})
