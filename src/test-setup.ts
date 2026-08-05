import '@testing-library/jest-dom';
import { setBooleanFeatureFlagResolver } from '@atlaskit/platform-feature-flags';
import { vi } from 'vitest';

type AtlaskitTokens = typeof import('@atlaskit/tokens');

setBooleanFeatureFlagResolver(() => false);

vi.mock('@atlaskit/tokens', async (importOriginal) => {
  const actual = await importOriginal<AtlaskitTokens>();
  return {
    ...actual,
    setGlobalTheme: vi.fn(),
  };
});

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
