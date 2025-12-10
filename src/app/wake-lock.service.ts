import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;

  async enable() {
    if (!('wakeLock' in navigator)) {
      return;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock enabled');
    } catch {
      // Ignore errors (e.g., low battery, permission denied)
    }
  }

  async disable() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Wake lock disabled');
    }
  }
}
