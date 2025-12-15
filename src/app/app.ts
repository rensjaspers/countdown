import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { interval, of, scan, startWith, switchMap, takeWhile } from 'rxjs';
import { WakeLockService } from './wake-lock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(click)': 'togglePaused($event)',
    '(document:keydown.space)': 'togglePaused($event)',
    '(document:keydown.arrowdown)': 'decrementTimeLeft()',
    '(document:keydown.arrowup)': 'incrementTimeLeft()',
  },
})
export class App {
  private readonly wakeLock = inject(WakeLockService);
  readonly totalSeconds = signal(45 * 60);
  readonly paused = signal(false);

  private totalSeconds$ = toObservable(this.totalSeconds);
  private paused$ = toObservable(this.paused);

  readonly secondsLeft = toSignal(
    this.totalSeconds$.pipe(
      switchMap((totalSeconds) =>
        this.paused$.pipe(
          switchMap((paused) => (paused ? of([]) : interval(1000))),
          scan((seconds) => seconds - 1, totalSeconds),
          startWith(totalSeconds),
          takeWhile((seconds) => seconds >= 0)
        )
      )
    ),
    { initialValue: this.totalSeconds() }
  );

  readonly formattedTimeLeft = computed(() => this.formatTime(this.secondsLeft()));

  readonly onPausedChange = effect(() => {
    this.paused() ? this.wakeLock.disable() : this.wakeLock.enable();
  });

  togglePaused(event: Event) {
    event.preventDefault();
    this.paused.update((p) => !p);
  }

  incrementTimeLeft() {
    this.totalSeconds.set(this.secondsLeft() + 10);
  }

  decrementTimeLeft() {
    this.totalSeconds.set(this.secondsLeft() - 10);
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
