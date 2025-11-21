/**
 * Mock implementation of xterm for Jest testing environment.
 * This prevents HTMLCanvasElement errors in jsdom which doesn't fully support Canvas API.
 */

type EventCallback = (...args: unknown[]) => void;

export class Terminal {
  private listeners: Map<string, Array<EventCallback>> = new Map();

  open(_container: HTMLElement): void {
    // Mock open method
  }

  write(_data: string | Uint8Array): void {
    // Mock write method
  }

  writeln(_data: string | Uint8Array): void {
    // Mock writeln method
  }

  clear(): void {
    // Mock clear method
  }

  reset(): void {
    // Mock reset method
  }

  dispose(): void {
    this.listeners.clear();
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  loadAddon(_addon: unknown): void {
    // Mock loadAddon method
  }

  get cols(): number {
    return 80;
  }

  get rows(): number {
    return 24;
  }

  resize(_cols: number, _rows: number): void {
    // Mock resize method
  }

  focus(): void {
    // Mock focus method
  }

  blur(): void {
    // Mock blur method
  }
}

export default Terminal;
