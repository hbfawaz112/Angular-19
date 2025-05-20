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
