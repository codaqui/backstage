import '@testing-library/jest-dom';

// Mock xterm to avoid HTMLCanvasElement errors in jsdom
jest.mock('@xterm/xterm');
