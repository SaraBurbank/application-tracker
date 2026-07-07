import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApplicationService } from '../application.service';
import { Application, ApplicationStatus } from '../application.model';
import { KanbanColumnComponent } from '../kanbanColumn/kanbanColumn';
import { ApplicationFormComponent } from '../applicationForm/applicationForm';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [DragDropModule, KanbanColumnComponent, ApplicationFormComponent],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  private readonly applicationService = inject(ApplicationService);

  // The four fixed Kanban columns. Order here defines display order.
  readonly statuses: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

  loading = signal(true);
  errorMessage = signal('');

  // Controls the add/edit form modal.
  isFormOpen = signal(false);
  applicationBeingEdited = signal<Application | null>(null);

  // Derived, read-only grouping of the service's `applications` signal.
  // Recomputes automatically whenever the underlying signal changes.
  columns = computed<Record<ApplicationStatus, Application[]>>(() => {
    const grouped: Record<ApplicationStatus, Application[]> = {
      Applied: [],
      Interviewing: [],
      Offer: [],
      Rejected: [],
    };
    for (const app of this.applicationService.applications()) {
      grouped[app.status].push(app);
    }
    return grouped;
  });

  constructor() {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.loading.set(true);
    this.applicationService.loadApplications().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.errorMessage.set('Could not load applications. Is the backend running?');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  // Fired by a column when a card is dropped, whether within the same
  // column (reorder) or into a different one (status change).
  onCardDropped(event: CdkDragDrop<Application[]>): void {
    const movedApp = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      // Reordering within the same column (visual only, not persisted)
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    // Moved to a different column -> status changed
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const newStatus = this.getStatusForColumnData(event.container.data);
    if (newStatus && movedApp._id) {
      this.applicationService.update(movedApp._id, { status: newStatus }).subscribe({
        error: (err) => {
          console.error('Failed to update status', err);
          // Roll back on failure by re-fetching the true server state
          this.fetchApplications();
        },
      });
    }
  }

  private getStatusForColumnData(data: Application[]): ApplicationStatus | null {
    const columns = this.columns();
    for (const status of this.statuses) {
      if (columns[status] === data) return status;
    }
    return null;
  }

  openAddForm(): void {
    this.applicationBeingEdited.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(application: Application): void {
    this.applicationBeingEdited.set(application);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.applicationBeingEdited.set(null);
  }

  onFormSaved(): void {
    this.closeForm();
    this.fetchApplications();
  }

  onDeleteApplication(application: Application): void {
    if (!application._id) return;
    const confirmed = confirm(`Delete application for ${application.role} at ${application.company}?`);
    if (!confirmed) return;

    this.applicationService.delete(application._id).subscribe({
      next: () => this.fetchApplications(),
      error: (err) => console.error('Failed to delete application', err),
    });
  }
}
