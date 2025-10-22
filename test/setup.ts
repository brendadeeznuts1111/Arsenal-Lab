// test/setup.ts - Test environment setup for Bun
import { GlobalRegistrator } from '@happy-dom/global-registrator';

// Register happy-dom globally to provide browser APIs
GlobalRegistrator.register();

// Ensure document has proper structure
if (!document.documentElement) {
  const html = document.createElement('html');
  document.appendChild(html);
}

if (!document.body) {
  const body = document.createElement('body');
  document.documentElement.appendChild(body);
}

// Setup global mocks
global.URL.createObjectURL = () => 'blob:mock-url';
global.URL.revokeObjectURL = () => {};

// Add window.matchMedia mock (needed by some components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});
