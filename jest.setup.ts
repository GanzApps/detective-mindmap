import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

if (typeof globalThis.MessageChannel === 'undefined') {
  class MockMessagePort {
    onmessage: ((event: { data: unknown }) => void) | null = null;

    postMessage(data: unknown) {
      this.onmessage?.({ data });
    }

    addEventListener() {}

    removeEventListener() {}

    start() {}

    close() {}
  }

  class MockMessageChannel {
    port1 = new MockMessagePort();
    port2 = new MockMessagePort();
  }

  globalThis.MessageChannel = MockMessageChannel as typeof globalThis.MessageChannel;
}
