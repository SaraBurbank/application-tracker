import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
export class ColumnComponent {
  status = input.required<ApplicationStatus>();
  applications = input.required<Application[]>();

  dropped = output<CdkDragDrop<Application[]>>();
  addRequested = output<ApplicationStatus>();
  edit = output<Application>();
  delete = output<Application>();

  onDrop(event: CdkDragDrop<Application[]>): void {
    this.dropped.emit(event);
  }
  
  get headerClass(): string {
    return 'header-' + this.status().toLowerCase();
  }
}
