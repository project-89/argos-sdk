import "@testing-library/jest-dom";

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock window location
Object.defineProperty(window, "location", {
  value: {
    hostname: "test.com",
    pathname: "/test-page",
  },
  writable: true,
});
