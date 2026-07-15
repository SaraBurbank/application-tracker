import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApplicationService } from '../application.service';
import { Application, ApplicationStatus } from '../application.model';
import { ColumnComponent } from '../Column/column';
import { FormComponent } from '../Form/form';
import { Router } from '@angular/router';
import { AuthService } from '../Auth/auth.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [DragDropModule, ColumnComponent, FormComponent],
  templateUrl: './board.html',
  styleUrls: ['./board.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  private readonly applicationService = inject(ApplicationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser = this.authService.currentUser;
  readonly statuses: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
 
  loading = signal(true);
  errorMessage = signal('');
  isFormOpen = signal(false);
  applicationBeingEdited = signal<Application | null>(null);
  
  // When adding via a column's "+" button, pre-selects that column's status.
  defaultStatusForNew = signal<ApplicationStatus | null>(null);
 
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
    this.applicationService.getAll().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.errorMessage.set('Could not load applications. Is the backend running?');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
 
  onCardDropped(event: CdkDragDrop<Application[]>): void {
    const movedApp = event.previousContainer.data[event.previousIndex];
 
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
 
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
 
  openAddForm(status?: ApplicationStatus): void {
    this.applicationBeingEdited.set(null);
    this.defaultStatusForNew.set(status ?? null);
    this.isFormOpen.set(true);
  }
 
  openEditForm(application: Application): void {
    this.applicationBeingEdited.set(application);
    this.defaultStatusForNew.set(null);
    this.isFormOpen.set(true);
  }
 
  closeForm(): void {
    this.isFormOpen.set(false);
    this.applicationBeingEdited.set(null);
    this.defaultStatusForNew.set(null);
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

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
