import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // --- Plats ---
  getDishes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dishes`);
  }
  getDish(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dishes/${id}`);
  }
  createDish(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/dishes`, data);
  }
  updateDish(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/dishes/${id}`, data);
  }
  deleteDish(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dishes/${id}`);
  }

  // --- Commandes ---
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }
  getMyOrders(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders/client/${clientId}`);
  }
  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, data);
  }
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/orders/${id}/status`, { status });
  }

  // --- Utilisateurs (admin) ---
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }
  getLivreurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/livreurs`);
  }
  assignOrderToLivreur(orderId: number, livreurId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/orders/${orderId}/assign`, {
      livreur_id: livreurId
    });
  }
}