import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Application } from '../application.model';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './applicationCard.html',
  // styleUrls: ['./applicationCard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationCardComponent {
  application = input.required<Application>();

  edit = output<Application>();
  delete = output<Application>();

  onEditClick(event: MouseEvent): void {
    event.stopPropagation(); // don't let this trigger a drag
    this.edit.emit(this.application());
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.application());
  }
}
