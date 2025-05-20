import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TodoListComponent],
  template: `
    <div class="app-container">
      <app-todo-list></app-todo-list>
    </div>
  `,
  styles: [`
    .app-container {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'angular-todo-app';
}
