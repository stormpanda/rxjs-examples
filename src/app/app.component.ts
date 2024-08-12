import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, concat, concatMap, exhaust, exhaustMap, filter, first, forkJoin, interval, map, mergeMap, Observable, Subject, Subscription, switchMap, take, takeUntil, tap } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FakeConsoleComponent } from './components/fake-console/fake-console.component';

interface SourceEmit {
  value: number;
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FakeConsoleComponent, AsyncPipe, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'rxjs-examples';

  private completeSourcesSubject = new Subject<void>();
  private completeSubscriptionSubject = new Subject<void>();
  private logsSubject = new BehaviorSubject<string[]>([]);
  logs$ = this.logsSubject.asObservable();

  private tapLogSource = () => {
    return tap((emit: SourceEmit) => this.log(`Source: ${emit.message}`));
  }

  private readonly sources = {
    sourceA$: interval(1200).pipe(
      map(value => ({value: value, message: `A: ${value}`})), 
      this.tapLogSource(),
      takeUntil(this.completeSourcesSubject)
    ),
  
    sourceB$: interval(2200).pipe(
      map(value => ({value: value, message: `B: ${value}`})),
      this.tapLogSource(),
      takeUntil(this.completeSourcesSubject)
    ),
  
    sourceC$: interval(3200).pipe(
      map(value => ({value: value, message: `C: ${value}`})),
      this.tapLogSource(),
      takeUntil(this.completeSourcesSubject)
    )
  } as const

  private readonly examples = {
    take3$: this.sources.sourceA$.pipe(
      map(emit => emit.message),
      take(3)
    ),

    first$: this.sources.sourceC$.pipe(
      map(emit => emit.message),
      first()
    ),

    filter$: this.sources.sourceA$.pipe(
      filter(emit => emit.value % 2 === 0),
      map(emit => emit.message)
    ),

    combineLatest$: combineLatest([this.sources.sourceA$, this.sources.sourceB$, this.sources.sourceC$]).pipe(
      map(([a, b, c]) => `${a.message}, ${b.message}, ${c.message}`)
    ),
  
    forkJoin$: forkJoin([this.sources.sourceA$, this.sources.sourceB$, this.sources.sourceC$]).pipe(
      map(([a, b, c]) => `${a.message}, ${b.message}, ${c.message}`)
    ),

    switchMap$: this.sources.sourceA$.pipe(
      switchMap(emit => interval(1000).pipe(
        map(i => `${emit.message}, X: ${i}`),
        take(3)
      ))
    ),

    mergeMap$: this.sources.sourceA$.pipe(
      mergeMap(emit => interval(1000).pipe(
        map(i => `${emit.message}, X: ${i}`),
        take(3)
      ))
    ),

    concatMap$: this.sources.sourceA$.pipe(
      concatMap(emit => interval(1000).pipe(
        map(i => `${emit.message}, X: ${i}`),
        take(3)
      ))
    ),

    exhaustMap$: this.sources.sourceA$.pipe(
      exhaustMap(emit => interval(1000).pipe(
        map(i => `${emit.message}, X: ${i}`),
        take(3)
      ))
    ),
  } as const

  getSources() {
    return Object.entries(this.sources).map(([key, value]) => ({ name: key, observable$: value }));
  }

  getExamples() {
    return Object.entries(this.examples).map(([key, value]) => ({ name: key, observable$: value }));
  }

  subscribe(observable: Observable<string | SourceEmit>) {
    this.completeSources();
    this.completeSubscription();
    this.clearLogs();

    this.log('Subscribing...');
    this.log('---');

    observable.pipe(
      takeUntil(this.completeSubscriptionSubject)
    ).subscribe({
      next: (value) => {
        const message = typeof value === 'object' ? value.message : value;
        
        this.log(`Subscription: ${message ?? value}`);
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
    this.completeSourcesSubject.next();
  }

  completeSubscription() {
    this.completeSubscriptionSubject.next();
  }

  log(log: string) {
    this.logsSubject.next([...this.logsSubject.value, log]);
  }

  clearLogs() {
    this.logsSubject.next([]);
  }
}
