import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Application, ApplicationStatus } from '../application.model';
import { ApplicationCardComponent } from '../applicationCard/applicationCard';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [DragDropModule, ApplicationCardComponent],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnComponent {
  // Signal inputs are the current recommended replacement for @Input().
  status = input.required<ApplicationStatus>();
  applications = input.required<Application[]>();

  // Signal-based outputs, replacing EventEmitter + @Output().
  dropped = output<CdkDragDrop<Application[]>>();
  edit = output<Application>();
  delete = output<Application>();

  onDrop(event: CdkDragDrop<Application[]>): void {
    this.dropped.emit(event);
  }
}
