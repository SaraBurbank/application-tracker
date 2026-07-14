import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Application } from '../application.model';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './card.html',
  styleUrls: ['./card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  application = input.required<Application>();

  edit = output<Application>();
  delete = output<Application>();
  resumeLabel = computed(() => this.application().resumeUsed ?? 'N/A');
  showNotes = signal(false);

  onToggleNotes(event: MouseEvent): void {
    event.stopPropagation(); // don't let this trigger a drag
    this.showNotes.update((value) => !value);
  }

  onEditClick(event: MouseEvent): void {
    event.stopPropagation(); // don't let this trigger a drag
    this.edit.emit(this.application());
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.application());
  }
}
