type AuthEvent = 'session:expired' | 'session:restored';
type AuthCallback = () => void;

/**
 * Industrial-Grade Auth Switchboard
 * Centralized technical primitive to coordinate session signals across
 * isolated technical planes (API Client, Context, and UI Hubs).
 */
class AuthSwitchboard {
  private listeners: Map<AuthEvent, Set<AuthCallback>> = new Map();

  /**
   * Register a listener for a mission-critical auth event.
   */
  on(event: AuthEvent, callback: AuthCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    
    // Return unsubscribe function for high-fidelity cleanup
    return () => this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit an absolute auth signal to all anchored listeners.
   */
  emit(event: AuthEvent) {
    console.log(`[Auth Switchboard] Emitting signal: ${event}`);
    this.listeners.get(event)?.forEach(callback => callback());
  }
}

export const authSwitchboard = new AuthSwitchboard();
