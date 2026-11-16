import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

const getStorage = (): Storage | null => {
  return typeof localStorage === 'undefined' ? null : localStorage;
};

export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'admin' | 'client' | 'livreur';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(res => {
        const storage = getStorage();
        if (!storage) {
          this.currentUserSubject.next(res.user);
          return;
        }

        storage.setItem('token', res.token);
        storage.setItem('user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, data).pipe(
      tap(res => {
        const storage = getStorage();
        if (!storage) {
          this.currentUserSubject.next(res.user);
          return;
        }

        storage.setItem('token', res.token);
        storage.setItem('user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout(): void {
    const storage = getStorage();
    if (!storage) {
      this.currentUserSubject.next(null);
      return;
    }

    storage.removeItem('token');
    storage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const storage = getStorage();
    return storage ? storage.getItem('token') : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  isLivreur(): boolean {
    return this.getCurrentUser()?.role === 'livreur';
  }

  private getUserFromStorage(): User | null {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    try {
      const user = storage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
}