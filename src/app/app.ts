import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { interval, scan, switchMap, takeWhile } from 'rxjs';
import { WakeLockService } from './wake-lock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown.space)': 'togglePaused($event)',
    '(click)': 'togglePaused($event)',
  },
})
export class App {
  private readonly wakeLock = inject(WakeLockService);
  private readonly totalSeconds = 45 * 60;

  readonly paused = signal(false);

  readonly time = toSignal(
    toObservable(this.paused).pipe(
      switchMap((paused) => (paused ? [] : interval(1000))),
      scan((seconds) => seconds - 1, this.totalSeconds + 1),
      takeWhile((seconds) => seconds >= 0)
    ),
    { initialValue: this.totalSeconds }
  );

  readonly formattedTime = computed(() => this.formatTime(this.time()));

  readonly onPausedChange = effect(() => {
    this.paused() ? this.wakeLock.disable() : this.wakeLock.enable();
  });

  togglePaused(event: Event) {
    event.preventDefault();
    this.paused.update((p) => !p);
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
