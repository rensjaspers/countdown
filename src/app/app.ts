import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map, takeWhile } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly totalSeconds = 30 * 60;

  readonly time = toSignal(
    interval(1000).pipe(
      map((tick) => this.totalSeconds - tick - 1),
      takeWhile((seconds) => seconds >= 0)
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
