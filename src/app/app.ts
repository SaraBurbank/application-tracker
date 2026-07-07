import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KanbanBoardComponent } from './kanbanBoard/kanbanBoard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, KanbanBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('application-tracker');
}
