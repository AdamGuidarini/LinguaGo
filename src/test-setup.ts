import { vi } from 'vitest';

vi.mock('webextension-polyfill', () => import('./__mocks__/browser'));
