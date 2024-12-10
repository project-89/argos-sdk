import { jest } from '@jest/globals';
// Mock fetch
const mockFetch = jest.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
}));
global.fetch = mockFetch;
// Mock Firebase Admin
jest.unstable_mockModule('firebase-admin/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn().mockReturnValue([]),
    getApp: jest.fn(),
}));
jest.unstable_mockModule('firebase-admin/firestore', () => ({
    getFirestore: jest.fn(),
}));
// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: true,
});
// Create mock implementations
const mockDocData = {};
const mockDocSnapshot = {
    exists: false,
    data: () => mockDocData,
};
const mockDocRef = {
    get: jest
        .fn()
        .mockResolvedValue(mockDocSnapshot),
    set: jest.fn().mockResolvedValue(),
    update: jest
        .fn()
        .mockResolvedValue(),
    delete: jest.fn().mockResolvedValue(),
};
const mockCollectionRef = {
    doc: jest
        .fn()
        .mockReturnValue(mockDocRef),
    where: jest
        .fn()
        .mockReturnThis(),
    get: jest
        .fn()
        .mockResolvedValue({ docs: [] }),
};
const mockFirestore = {
    collection: jest
        .fn()
        .mockReturnValue(mockCollectionRef),
};
jest.mock('firebase-admin/firestore', () => ({
    getFirestore: jest.fn().mockReturnValue(mockFirestore),
}));
let firestoreInitialized = false;
beforeAll(() => {
    firestoreInitialized = true;
});
// Dummy test to verify Firebase mocking
describe('Firebase Mock Setup', () => {
    test('Firebase mocking is initialized', () => {
        expect(firestoreInitialized).toBe(true);
    });
});
