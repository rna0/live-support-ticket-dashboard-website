// Add type definitions for the browser's timer IDs
interface Window {
    // Ensure setInterval returns a number for browser compatibility
    setInterval(handler: TimerHandler, timeout?: number, ...args: unknown[]): number;
}