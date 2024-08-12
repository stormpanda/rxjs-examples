import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-fake-console',
  standalone: true,
  imports: [NgFor],
  templateUrl: './fake-console.component.html',
  styleUrl: './fake-console.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FakeConsoleComponent implements OnChanges {
  @Input() logs: string[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  scrollToBottom() {
    this.elementRef.nativeElement.scrollTop =
      this.elementRef.nativeElement.scrollHeight;
  }
}
