import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrap">
      <div class="container">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Espace gestion</span>
            <h1>Bonjour, admin 👋</h1>
            <p>Un aperçu de l’activité de votre restaurant.</p>
          </div>
        </div>
        <div *ngIf="ordersError" class="alert alert-danger" role="alert">{{ ordersError }}</div>
        <div class="row g-3 mb-4">
          <div class="col-sm-6 col-xl-3">
            <div class="card stat-card stat-card--forest">
              <div class="card-body">
                <h6>Plats à la carte</h6><h2>{{ dishes.length }}</h2>
                <span class="stat-icon" aria-hidden="true">🍽️</span>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-xl-3">
            <div class="card stat-card stat-card--orange">
              <div class="card-body">
                <h6>Commandes reçues</h6><h2>{{ orders.length }}</h2>
                <span class="stat-icon" aria-hidden="true">🧾</span>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-xl-3">
            <div class="card stat-card stat-card--gold">
              <div class="card-body">
                <h6>À préparer</h6><h2>{{ countStatus('en_attente') }}</h2>
                <span class="stat-icon" aria-hidden="true">⏱️</span>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-xl-3">
            <div class="card stat-card stat-card--blue">
              <div class="card-body">
                <h6>Clients inscrits</h6><h2>{{ countClients() }}</h2>
                <span class="stat-icon" aria-hidden="true">👥</span>
              </div>
            </div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <a routerLink="/admin/plats" class="card dashboard-action">
              <div><span class="eyebrow">Votre cuisine</span><h2>Gérer les plats</h2><p>Modifiez la carte et les disponibilités.</p></div>
              <span aria-hidden="true">🍳</span>
            </a>
          </div>
          <div class="col-md-6">
            <a routerLink="/admin/commandes" class="card dashboard-action">
              <div><span class="eyebrow">Service en cours</span><h2>Gérer les commandes</h2><p>Suivez les commandes et leur préparation.</p></div>
              <span aria-hidden="true">📦</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  dishes: any[] = [];
  orders: any[] = [];
  users: any[] = [];
  ordersError = '';
  private refreshSubscription?: Subscription;

  constructor(
    private api: ApiService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getDishes().subscribe({
      next: dishes => {
        this.dishes = dishes;
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.ordersError = err.error?.message || err.error?.error || 'Impossible de charger les plats.';
        this.changeDetector.markForCheck();
      }
    });

    this.loadOrders();
    this.refreshSubscription = interval(15000).subscribe(() => this.loadOrders());
    this.api.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.ordersError = err.error?.message || err.error?.error || 'Impossible de charger les clients.';
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private loadOrders() {
    this.api.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.ordersError = '';
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.ordersError = err.error?.message || err.error?.error || 'Impossible de charger les commandes.';
        this.changeDetector.markForCheck();
      }
    });
  }

  countStatus(s: string): number {
    return this.orders.filter(o => o.statut === s).length;
  }

  countClients(): number {
    return this.users.filter(user => user.role === 'client').length;
  }
}