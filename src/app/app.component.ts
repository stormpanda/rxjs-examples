import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, buffer, bufferTime, combineLatest, concat, concatMap, debounce, debounceTime, distinct, distinctUntilChanged, exhaust, exhaustMap, filter, first, forkJoin, interval, map, mergeMap, Observable, Subject, Subscription, switchMap, take, takeUntil, tap, timer, withLatestFrom } from 'rxjs';
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
    take$: this.sources.sourceA$.pipe(
      map(emit => emit.message),
      // play with the number to see the difference
      take(3)
    ),

    first$: this.sources.sourceA$.pipe(
      // you can also give no default or no predicate or skip both
      first(emit => emit.value === 3, { value: -1, message: 'No value received' }),
      map(emit => emit.message),
    ),

    filter$: this.sources.sourceA$.pipe(
      // play with the condition to see the difference
      filter(emit => emit.value % 2 === 0),
      map(emit => emit.message)
    ),

    takeUntil$: this.sources.sourceA$.pipe(
      takeUntil(this.sources.sourceC$),
      map(emit => emit.message)
    ),

    map$: this.sources.sourceA$.pipe(
      map(emit => String(emit.value * 2))
    ),

    tap$: this.sources.sourceA$.pipe(
      tap(emit => this.log(`Tap: ${emit.message}`)),
      map(emit => emit.message)
    ),

    distinctUntilChanged$: this.sources.sourceA$.pipe(
      // play with the condition to see the difference
      map(emit => String(Math.floor(emit.value / 3))),
      distinctUntilChanged(),
    ),

    combineLatest$: combineLatest([this.sources.sourceA$, this.sources.sourceB$, this.sources.sourceC$]).pipe(
      map(([a, b, c]) => `${a.message}, ${b.message}, ${c.message}`)
    ),
  
    // use the "complete sources" button to see an emit
    forkJoin$: forkJoin([this.sources.sourceA$, this.sources.sourceB$, this.sources.sourceC$]).pipe(
      map(([a, b, c]) => `${a.message}, ${b.message}, ${c.message}`)
    ),

    concat$: concat(
      this.sources.sourceA$.pipe(take(3)), 
      this.sources.sourceB$.pipe(take(3)), 
      this.sources.sourceC$.pipe(take(3))
    ).pipe(
      map(emit => emit.message)
    ),

    // use the "complete sources" button to see the full behavior
    switchMap$: this.sources.sourceA$.pipe(
      switchMap(emit => interval(1000).pipe(
        map(i => `${emit.message}, X: ${i}`),
        take(3)
      ))
    ),

    mergeMap$: this.sources.sourceA$.pipe(
      mergeMap(emit => interval(1000).pipe(
        map(i => `${emit.message}, X: ${i}`),
        // remove the take to see the mergeMap go out of control
        take(3)
      ))
    ),

    // use the "complete sources" button to see the full behavior
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

    buffer$: this.sources.sourceA$.pipe(
      // play with the time to see the difference
      buffer(interval(3000)),
      map(emits => emits.map(emit => emit.message).join(', '))
    ),

    bufferTime$: this.sources.sourceA$.pipe(
      // play with the time to see the difference
      bufferTime(3000),
      map(emits => emits.map(emit => emit.message).join(', '))
    ),

    debounce$: this.sources.sourceA$.pipe(
      // play with the time to see the difference
      debounce(() => interval(3000)),
      map(emit => emit.message)
    ),

    debounceTime$: this.sources.sourceA$.pipe(
      // play with the time to see the difference
      debounceTime(3000),
      map(emit => emit.message)
    ),

    withLatestFrom$: this.sources.sourceA$.pipe(
      withLatestFrom(this.sources.sourceB$, this.sources.sourceC$),
      map(([a, b, c]) => `${a.message}, ${b.message}, ${c.message}`)
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
