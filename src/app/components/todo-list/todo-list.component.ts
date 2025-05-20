import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent, TodoFormComponent],
  template: `
    <div class="todo-container">
      <h1>Angular 19 Todo App</h1>

      <app-todo-form></app-todo-form>

      <div class="todo-filters">
        <button
          [class.active]="filter === 'all'"
          (click)="changeFilter('all')"
        >
          All
        </button>
        <button
          [class.active]="filter === 'active'"
          (click)="changeFilter('active')"
        >
          Active
        </button>
        <button
          [class.active]="filter === 'completed'"
          (click)="changeFilter('completed')"
        >
          Completed
        </button>
      </div>

      <div class="todos-list">
        <div *ngIf="filteredTodos.length === 0" class="empty-state">
          No todos to display
        </div>

        <app-todo-item
          *ngFor="let todo of filteredTodos"
          [todo]="todo"
        ></app-todo-item>
      </div>

      <div class="todo-summary" *ngIf="todos.length > 0">
        <span>{{ activeCount }} items left</span>
        <button
          *ngIf="completedCount > 0"
          (click)="clearCompleted()"
          class="clear-completed"
        >
          Clear completed
        </button>
      </div>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      color: #333;
    }

    .todo-filters {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      gap: 10px;
    }

    .todo-filters button {
      padding: 8px 12px;
      background-color: #f1f1f1;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .todo-filters button.active {
      background-color: #4CAF50;
      color: white;
    }

    .todos-list {
      margin-bottom: 20px;
    }

    .empty-state {
      text-align: center;
      color: #888;
      padding: 20px;
    }

    .todo-summary {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #666;
    }

    .clear-completed {
      background: none;
      border: none;
      color: #f44336;
      cursor: pointer;
      text-decoration: underline;
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  filter: 'all' | 'active' | 'completed' = 'all';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
      this.applyFilter();
    });
  }

  get activeCount(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }

  get completedCount(): number {
    return this.todos.filter(todo => todo.completed).length;
  }

  changeFilter(filter: 'all' | 'active' | 'completed'): void {
    this.filter = filter;
    this.applyFilter();
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }

  private applyFilter(): void {
    switch (this.filter) {
      case 'active':
        this.filteredTodos = this.todos.filter(todo => !todo.completed);
        break;
      case 'completed':
        this.filteredTodos = this.todos.filter(todo => todo.completed);
        break;
      default:
        this.filteredTodos = [...this.todos];
    }
  }
}
