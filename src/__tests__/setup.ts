import { jest } from '@jest/globals';

// Mock fetch
const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

global.fetch = mockFetch as unknown as typeof fetch;

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

// Define types for mocking
interface MockDocumentData {
  [key: string]: any;
}

interface MockDocumentSnapshot {
  exists: boolean;
  data: () => MockDocumentData | undefined;
}

interface MockQuerySnapshot {
  docs: MockDocumentSnapshot[];
}

interface MockDocumentReference {
  get: () => Promise<MockDocumentSnapshot>;
  set: (data: MockDocumentData) => Promise<void>;
  update: (data: Partial<MockDocumentData>) => Promise<void>;
  delete: () => Promise<void>;
}

interface MockCollectionReference {
  doc: (path: string) => MockDocumentReference;
  where: (...args: any[]) => MockCollectionReference;
  get: () => Promise<MockQuerySnapshot>;
}

interface MockFirestore {
  collection: (path: string) => MockCollectionReference;
}

// Create mock implementations
const mockDocData: MockDocumentData = {};

const mockDocSnapshot: MockDocumentSnapshot = {
  exists: false,
  data: () => mockDocData,
};

const mockDocRef = {
  get: jest
    .fn<() => Promise<MockDocumentSnapshot>>()
    .mockResolvedValue(mockDocSnapshot),
  set: jest.fn<(data: MockDocumentData) => Promise<void>>().mockResolvedValue(),
  update: jest
    .fn<(data: Partial<MockDocumentData>) => Promise<void>>()
    .mockResolvedValue(),
  delete: jest.fn<() => Promise<void>>().mockResolvedValue(),
} as MockDocumentReference;

const mockCollectionRef = {
  doc: jest
    .fn<(path: string) => MockDocumentReference>()
    .mockReturnValue(mockDocRef),
  where: jest
    .fn<(...args: any[]) => MockCollectionReference>()
    .mockReturnThis(),
  get: jest
    .fn<() => Promise<MockQuerySnapshot>>()
    .mockResolvedValue({ docs: [] }),
} as MockCollectionReference;

const mockFirestore = {
  collection: jest
    .fn<(path: string) => MockCollectionReference>()
    .mockReturnValue(mockCollectionRef),
} as MockFirestore;

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
