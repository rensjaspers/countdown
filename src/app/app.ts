import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, interval, map, takeWhile, tap } from 'rxjs';
import { WakeLockService } from './wake-lock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly wakeLock = inject(WakeLockService);
  private readonly totalSeconds = 30 * 60;

  readonly time = toSignal(
    interval(1000).pipe(
      tap({ subscribe: () => this.wakeLock.enable() }),
      map((tick) => this.totalSeconds - tick - 1),
      takeWhile((seconds) => seconds >= 0),
      finalize(() => this.wakeLock.disable())
    ),
    { initialValue: this.totalSeconds }
  );

  readonly formattedTime = computed(() => this.formatTime(this.time()));

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
