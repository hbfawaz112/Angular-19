# Angular 19 Todo App Tutorial with localStorage

This tutorial will guide you through building a simple Todo application using Angular 19. The app will allow users to create, complete, edit, and delete tasks, with all data persisted to localStorage so tasks remain saved even after the browser is closed.

## Prerequisites

- Node.js (v18.x or later recommended)
- npm (v9.x or later recommended)
- Basic understanding of TypeScript and HTML/CSS

## Table of Contents

1. [Setting Up the Project](#setting-up-the-project)
2. [Creating the Todo Model](#creating-the-todo-model)
3. [Building the Todo Service](#building-the-todo-service)
4. [Creating Components](#creating-components)
5. [Implementing the UI](#implementing-the-ui)
6. [Adding Styles](#adding-styles)
7. [Testing the Application](#testing-the-application)
8. [Next Steps](#next-steps)

## Setting Up the Project

First, let's create a new Angular project using the Angular CLI:

```bash
# Install Angular CLI globally if you haven't already
npm install -g @angular/cli

# Create a new Angular project
ng new angular-todo-app

# Navigate to the project directory
cd angular-todo-app

# Start the development server
ng serve
```

Your application should now be running at `http://localhost:4200/`.

## Creating the Todo Model

Let's create a model for our Todo items. Create a new file at `src/app/models/todo.model.ts`:

```typescript
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}
```

## Building the Todo Service

Now let's create a service to handle data operations using localStorage. Run the following command:

```bash
ng generate service services/todo
```

Open the generated file at `src/app/services/todo.service.ts` and replace its contents with:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly STORAGE_KEY = 'angular-todos';
  private todos: Todo[] = [];
  private todosSubject = new BehaviorSubject<Todo[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  addTodo(title: string): void {
    if (!title.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    this.todos = [...this.todos, newTodo];
    this.saveToLocalStorage();
  }

  toggleComplete(id: number): void {
    this.todos = this.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.saveToLocalStorage();
  }

  updateTodoTitle(id: number, newTitle: string): void {
    if (!newTitle.trim()) return;
    
    this.todos = this.todos.map(todo => 
      todo.id === id ? { ...todo, title: newTitle.trim() } : todo
    );
    this.saveToLocalStorage();
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    this.todosSubject.next([...this.todos]);
  }

  private loadFromLocalStorage(): void {
    const storedTodos = localStorage.getItem(this.STORAGE_KEY);
    if (storedTodos) {
      try {
        this.todos = JSON.parse(storedTodos);
        // Convert string dates back to Date objects
        this.todos = this.todos.map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        this.todosSubject.next([...this.todos]);
      } catch (e) {
        console.error('Failed to parse todos from localStorage', e);
      }
    }
  }

  clearCompleted(): void {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.saveToLocalStorage();
  }
}
```

## Creating Components

Let's create the necessary components for our app:

```bash
# Generate the todo-list component
ng generate component components/todo-list

# Generate the todo-item component
ng generate component components/todo-item

# Generate the todo-form component
ng generate component components/todo-form
```

### Todo Form Component

Open `src/app/components/todo-form/todo-form.component.ts` and update it:

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="addTodo()" class="todo-form">
      <input 
        type="text" 
        [(ngModel)]="newTodoTitle" 
        name="newTodoTitle" 
        placeholder="Add a new task..." 
        required
      />
      <button type="submit">Add</button>
    </form>
  `,
  styles: [`
    .todo-form {
      display: flex;
      margin-bottom: 20px;
    }
    
    input {
      flex: 1;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
    }
    
    button {
      padding: 10px 15px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-size: 16px;
    }
    
    button:hover {
      background-color: #45a049;
    }
  `]
})
export class TodoFormComponent {
  newTodoTitle = '';

  constructor(private todoService: TodoService) {}

  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      this.todoService.addTodo(this.newTodoTitle);
      this.newTodoTitle = '';
    }
  }
}
```

### Todo Item Component

Open `src/app/components/todo-item/todo-item.component.ts` and update it:

```typescript
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
```

### Todo List Component

Open `src/app/components/todo-list/todo-list.component.ts` and update it:

```typescript
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
```

## Implementing the UI

Now, let's update our main application component to use our Todo components.

Open `src/app/app.component.ts` and update it:

```typescript
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
```

## Adding Styles

Let's add some global styles. Open `src/styles.css` and add:

```css
/* You can add global styles to this file, and also import other style files */
body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

button {
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}
```

## Testing the Application

Now that we've built all the necessary components, let's make sure our application is working correctly:

1. Start the development server:
```bash
ng serve
```

2. Open your browser and navigate to `http://localhost:4200/`

3. Test the todo application by:
  - Adding new todos
  - Marking todos as completed
  - Editing todo titles
  - Deleting todos
  - Filtering todos (All, Active, Completed)
  - Clearing completed todos
  - Refreshing the page to ensure localStorage persistence works

## Next Steps

Congratulations! You've built a functional Todo application with Angular 19 using localStorage for data persistence. Here are some ideas to enhance your app:

1. **Add Categories or Tags**: Allow users to categorize their todos
2. **Add Due Dates**: Implement a calendar picker for setting deadlines
3. **Add Priority Levels**: Let users set priorities for their tasks
4. **Implement Drag and Drop**: For reordering todos
5. **Add Search Functionality**: Allow users to search through their todos
6. **Implement Authentication**: Add user accounts to store todos on a server
7. **Create a Progressive Web App (PWA)**: Make your app installable on devices
8. **Add Unit Tests**: Improve code reliability with test coverage

## Conclusion

This tutorial demonstrated how to build a simple Todo application with Angular 19. The app uses localStorage for data persistence and implements all the basic CRUD operations. You've learned how to:

- Set up an Angular 19 project
- Use standalone components
- Implement a service with localStorage
- Create reactive UIs with Observable patterns
- Handle form inputs and user interactions

Feel free to expand on this foundation to build more complex applications!
