import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <div class="todo-content" *ngIf="!isEditing">
        <input
          type="checkbox"
          [checked]="todo.completed"
          (change)="toggleComplete()"
        />
        <span class="todo-title" (dblclick)="startEditing()">{{ todo.title }}</span>
        <div class="todo-actions">
          <button class="edit-btn" (click)="startEditing()">Edit</button>
          <button class="delete-btn" (click)="deleteTodo()">Delete</button>
        </div>
      </div>

      <div class="todo-edit" *ngIf="isEditing">
        <input
          type="text"
          [(ngModel)]="editedTitle"
          (keyup.enter)="saveEdit()"
          (keyup.escape)="cancelEdit()"
        />
        <button (click)="saveEdit()">Save</button>
        <button (click)="cancelEdit()">Cancel</button>
      </div>

      <span class="todo-date">Created: {{ todo.createdAt | date:'short' }}</span>
    </div>
  `,
  styles: [`
    .todo-item {
      background-color: #f9f9f9;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .todo-content {
      display: flex;
      align-items: center;
    }

    .todo-title {
      flex: 1;
      margin-left: 10px;
      word-break: break-word;
    }

    .completed .todo-title {
      text-decoration: line-through;
      color: #888;
    }

    .todo-actions {
      display: flex;
      gap: 5px;
    }

    .todo-edit {
      display: flex;
      gap: 5px;
      margin-top: 5px;
    }

    .todo-edit input {
      flex: 1;
      padding: 5px;
    }

    .todo-date {
      display: block;
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    button {
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .edit-btn {
      background-color: #2196F3;
      color: white;
    }

    .delete-btn {
      background-color: #f44336;
      color: white;
    }
  `]
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  isEditing = false;
  editedTitle = '';

  constructor(private todoService: TodoService) {}

  toggleComplete(): void {
    this.todoService.toggleComplete(this.todo.id);
  }

  startEditing(): void {
    this.isEditing = true;
    this.editedTitle = this.todo.title;
  }

  saveEdit(): void {
    if (this.editedTitle.trim() && this.editedTitle !== this.todo.title) {
      this.todoService.updateTodoTitle(this.todo.id, this.editedTitle);
    }
    this.isEditing = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  deleteTodo(): void {
    this.todoService.deleteTodo(this.todo.id);
  }
}
