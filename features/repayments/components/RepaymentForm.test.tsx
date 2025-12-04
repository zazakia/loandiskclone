import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { RepaymentForm } from './RepaymentForm'
import { renderWithClient } from '@/test-utils'

// Mock fetch
global.fetch = jest.fn()

describe('RepaymentForm', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear()
    })

    it('renders correctly', () => {
        renderWithClient(<RepaymentForm />)
        expect(screen.getByText('Select Loan')).toBeInTheDocument()
        expect(screen.getByText('Amount')).toBeInTheDocument()
        expect(screen.getByText('Payment Method')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
        renderWithClient(<RepaymentForm />)

        const submitBtn = screen.getByText('Record Repayment')
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText('Loan is required')).toBeInTheDocument()
            expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument()
        })
    })
})
