import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, interval, map, Observable, Subject, Subscription, take, takeUntil, tap } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { FakeConsoleComponent } from './components/fake-console/fake-console.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FakeConsoleComponent, AsyncPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'rxjs-examples';

  private completeSubject = new Subject<void>()
  private logsSubject = new BehaviorSubject<string[]>([]);
  logs$ = this.logsSubject.asObservable();

  private tapLogSource = () => {
    return tap((value: string) => this.log(`Source: ${value}`));
  }

  sourceA$ = interval(1200).pipe(
    map(value => `A: ${value}`), 
    this.tapLogSource(),
    takeUntil(this.completeSubject)
  );

  sourceB$ = interval(2200).pipe(
    map(value => `B: ${value}`), 
    this.tapLogSource(),
    takeUntil(this.completeSubject)
  );

  sourceC$ = interval(3200).pipe(
    map(value => `C: ${value}`), 
    this.tapLogSource(),
    takeUntil(this.completeSubject)
  );

  combineLatest$ = combineLatest([this.sourceA$, this.sourceB$, this.sourceC$]).pipe(
    map(([a, b, c]) => `${a} ${b} ${c}`)
  );

  forkJoin$ = forkJoin([this.sourceA$, this.sourceB$, this.sourceC$]).pipe(
    map(([a, b, c]) => `${a} ${b} ${c}`)
  );

  subscribe(observable: Observable<string>) {
    this.completeSources();
    this.clearLogs();

    this.log('Subscribing...');
    this.log('---');

    observable.pipe(
      tap(value => {
        this.log(`Subscription: ${value}`);
        this.log('---');
      }),
    ).subscribe();
  }

  completeSources() {
    this.completeSubject.next();
  }

  log(log: string) {
    this.logsSubject.next([...this.logsSubject.value, log]);
  }

  clearLogs() {
    this.logsSubject.next([]);
  }
}
