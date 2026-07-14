import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Application, ApplicationStatus } from '../application.model';
import { CardComponent } from '../Card/card';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [NgClass, DragDropModule, CardComponent],
  templateUrl: './column.html',
  styleUrls: ['./column.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnComponent implements OnDestroy {
  status = input.required<ApplicationStatus>();
  applications = input.required<Application[]>();

  dropped = output<CdkDragDrop<Application[]>>();
  addRequested = output<ApplicationStatus>();
  edit = output<Application>();
  delete = output<Application>();
  
  count = computed(() => this.applications().length);
  badgePulse = signal(false);
  private previousCount: number | null = null;
  private pulseTimeout?: ReturnType<typeof setTimeout>;
 
  constructor() {
    effect(() => {
      const current = this.count();
      if (this.previousCount !== null && current !== this.previousCount) {
        this.triggerBadgePulse();
      }
      this.previousCount = current;
    });
  }
 
  ngOnDestroy(): void {
    clearTimeout(this.pulseTimeout);
  }
 
  private triggerBadgePulse(): void {
    clearTimeout(this.pulseTimeout);
    // Reset first so the animation restarts cleanly even if a second
    // change lands while the previous pulse is still playing.
    this.badgePulse.set(false);
    requestAnimationFrame(() => {
      this.badgePulse.set(true);
      this.pulseTimeout = setTimeout(() => this.badgePulse.set(false), 350);
    });
  }

  onDrop(event: CdkDragDrop<Application[]>): void {
    this.dropped.emit(event);
  }
  
  get headerClass(): string {
    return 'header-' + this.status().toLowerCase();
  }
}
