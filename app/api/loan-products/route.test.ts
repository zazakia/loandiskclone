/**
 * Unit tests for Loan Products API
 * Tests GET and POST endpoints with mocked authentication
 */

import { GET, POST } from './route';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}));

// Mock database
jest.mock('@/lib/db', () => ({
    db: {
        loanProduct: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Loan Products API', () => {
    const mockAuth = auth as jest.MockedFunction<typeof auth>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/loan-products', () => {
        it('should return 401 when not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null } as any);

            const request = new Request('http://localhost:3001/api/loan-products');
            const response = await GET(request);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('should return an array of loan products when authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

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
            ];

            (db.loanProduct.findMany as jest.Mock).mockResolvedValue(mockProducts);

            const request = new Request('http://localhost:3001/api/loan-products');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);
            expect(data).toEqual(mockProducts);
            expect(db.loanProduct.findMany).toHaveBeenCalledWith({
                orderBy: { name: 'asc' },
            });
        });

        it('should return products in alphabetical order by name', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const mockProducts = [
                { id: '1', name: 'Business Loan (5%)', minPrincipal: 5000, maxPrincipal: 200000, interestRate: 5, interestType: 'REDUCING', term: 24, termUnit: 'MONTHS', fees: null, penalties: null },
                { id: '2', name: 'Personal Loan (10%)', minPrincipal: 1000, maxPrincipal: 50000, interestRate: 10, interestType: 'REDUCING', term: 12, termUnit: 'MONTHS', fees: null, penalties: null },
            ];

            (db.loanProduct.findMany as jest.Mock).mockResolvedValue(mockProducts);

            const request = new Request('http://localhost:3001/api/loan-products');
            const response = await GET(request);

            const data = await response.json();
            expect(db.loanProduct.findMany).toHaveBeenCalledWith({
                orderBy: { name: 'asc' },
            });
        });

        it('should handle database errors gracefully', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
            (db.loanProduct.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            const request = new Request('http://localhost:3001/api/loan-products');
            const response = await GET(request);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('Internal server error');
        });
    });

    describe('POST /api/loan-products', () => {
        it('should return 401 when not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null } as any);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test Product',
                    minPrincipal: 1000,
                    maxPrincipal: 50000,
                    interestRate: 10,
                    interestType: 'REDUCING',
                    term: 12,
                    termUnit: 'MONTHS',
                }),
            });

            const response = await POST(request);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('should create a loan product with valid data', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const productData = {
                name: 'Test Loan Product',
                minPrincipal: 1000,
                maxPrincipal: 50000,
                interestRate: 10,
                interestType: 'REDUCING',
                term: 12,
                termUnit: 'MONTHS',
            };

            const mockCreatedProduct = {
                id: 'product-123',
                ...productData,
                fees: null,
                penalties: null,
            };

            (db.loanProduct.create as jest.Mock).mockResolvedValue(mockCreatedProduct);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify(productData),
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.name).toBe(productData.name);
            expect(data.id).toBeDefined();
            expect(db.loanProduct.create).toHaveBeenCalled();
        });

        it('should return 400 when required fields are missing', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Incomplete Product',
                    // Missing required fields
                }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Validation failed');
            expect(data.details).toBeDefined();
        });

        it('should return 400 when maxPrincipal is less than minPrincipal', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Invalid Product',
                    minPrincipal: 50000,
                    maxPrincipal: 1000, // Less than min
                    interestRate: 10,
                    interestType: 'REDUCING',
                    term: 12,
                    termUnit: 'MONTHS',
                }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('Maximum principal must be greater than minimum principal');
        });

        it('should return 400 for invalid interest type', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Invalid Interest Type',
                    minPrincipal: 1000,
                    maxPrincipal: 50000,
                    interestRate: 10,
                    interestType: 'INVALID', // Invalid enum value
                    term: 12,
                    termUnit: 'MONTHS',
                }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Validation failed');
        });

        it('should return 400 for negative interest rate', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Negative Interest',
                    minPrincipal: 1000,
                    maxPrincipal: 50000,
                    interestRate: -5, // Negative
                    interestType: 'REDUCING',
                    term: 12,
                    termUnit: 'MONTHS',
                }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Validation failed');
        });

        it('should accept optional fees and penalties', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

            const productData = {
                name: 'Product with Fees',
                minPrincipal: 1000,
                maxPrincipal: 50000,
                interestRate: 10,
                interestType: 'REDUCING',
                term: 12,
                termUnit: 'MONTHS',
                fees: { processingFee: 500 },
                penalties: { lateFee: 100 },
            };

            const mockCreatedProduct = {
                id: 'product-456',
                ...productData,
            };

            (db.loanProduct.create as jest.Mock).mockResolvedValue(mockCreatedProduct);

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify(productData),
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.fees).toEqual(productData.fees);
            expect(data.penalties).toEqual(productData.penalties);
        });

        it('should handle database errors gracefully', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
            (db.loanProduct.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            const request = new Request('http://localhost:3001/api/loan-products', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test Product',
                    minPrincipal: 1000,
                    maxPrincipal: 50000,
                    interestRate: 10,
                    interestType: 'REDUCING',
                    term: 12,
                    termUnit: 'MONTHS',
                }),
            });

            const response = await POST(request);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('Internal server error');
        });
    });
});
