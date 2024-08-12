import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, interval, map, Observable, Subject, Subscription, take, takeUntil, tap } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FakeConsoleComponent } from './components/fake-console/fake-console.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FakeConsoleComponent, AsyncPipe, NgIf, NgFor],
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

  private readonly sources = {
    sourceA$: interval(1200).pipe(
      map(value => `A: ${value}`), 
      this.tapLogSource(),
      takeUntil(this.completeSubject)
    ),
  
    sourceB$: interval(2200).pipe(
      map(value => `B: ${value}`), 
      this.tapLogSource(),
      takeUntil(this.completeSubject)
    ),
  
    sourceC$: interval(3200).pipe(
      map(value => `C: ${value}`), 
      this.tapLogSource(),
      takeUntil(this.completeSubject)
    )
  } as const

  private readonly examples = {
    combineLatest$: combineLatest([this.sources.sourceA$, this.sources.sourceB$, this.sources.sourceC$]).pipe(
      map(([a, b, c]) => `${a} ${b} ${c}`)
    ),
  
    forkJoin$: forkJoin([this.sources.sourceA$, this.sources.sourceB$, this.sources.sourceC$]).pipe(
      map(([a, b, c]) => `${a} ${b} ${c}`)
    )
  } as const

  getSources() {
    return Object.entries(this.sources).map(([key, value]) => ({ name: key, observable$: value }));
  }

  getExamples() {
    return Object.entries(this.examples).map(([key, value]) => ({ name: key, observable$: value }));
  }

  subscribe(observable: Observable<string>) {
    this.completeSources();
    this.clearLogs();

    this.log('Subscribing...');
    this.log('---');

    observable.subscribe({
      next: (value) => {
        this.log(`Subscription: ${value}`);
        this.log('---');
      },
      complete: () => {
        this.log('###');
        this.log('Subscription completed');
      },
      error: (error) => {
        this.log(`Subscription error: ${error}`);
      }
    });
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
