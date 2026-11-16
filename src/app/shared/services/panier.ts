import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  dishId: number;
  nom: string;
  prix: number;
  quantite: number;
  image_url?: string;
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  add(item: CartItem): void {
    const existing = this.items.find(i => i.dishId === item.dishId);
    if (existing) {
      existing.quantite += item.quantite;
    } else {
      this.items.push(item);
    }
    this.emit();
  }

  remove(dishId: number): void {
    this.items = this.items.filter(i => i.dishId !== dishId);
    this.emit();
  }

  updateQuantity(dishId: number, quantite: number): void {
    const item = this.items.find(i => i.dishId === dishId);
    if (item) {
      item.quantite = quantite;
      if (item.quantite <= 0) this.remove(dishId);
      else this.emit();
    }
  }

  getItems(): CartItem[] { return [...this.items]; }

  getTotal(): number {
    return this.items.reduce((s, i) => s + i.prix * i.quantite, 0);
  }

  getCount(): number {
    return this.items.reduce((s, i) => s + i.quantite, 0);
  }

  clear(): void {
    this.items = [];
    this.emit();
  }

  private emit(): void {
    this.cartSubject.next([...this.items]);
  }
}