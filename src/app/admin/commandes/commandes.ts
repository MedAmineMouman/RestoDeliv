import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-gestion-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <div class="container">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Service en cours</span>
            <h1>Gestion des commandes</h1>
            <p>Suivez la préparation et l’assignation des livreurs.</p>
          </div>
          <span class="badge bg-success">{{ orders.length }} commande(s)</span>
        </div>

        <div *ngIf="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>
        <div *ngIf="loading" class="alert alert-light">Chargement des commandes...</div>
        <div class="table-panel">
          <div class="table-responsive">
            <table class="table">
              <thead class="table-dark">
                <tr><th>#</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th><th>Livreur</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of orders">
                  <td class="fw-bold">#{{ o.id }}</td>
                  <td>{{ o.client_nom || o.client_id }}</td>
                  <td class="fw-semibold">{{ o.total }} DT</td>
                  <td>
                    <select class="form-select form-select-sm"
                            [ngModel]="o.statut"
                            (ngModelChange)="changeStatus(o.id, $event)">
                      <option value="en_attente">En attente</option>
                      <option value="en_preparation">En préparation</option>
                      <option value="en_livraison">En livraison</option>
                      <option value="livre">Livré</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </td>
                  <td>{{ o.created_at | date:'short' }}</td>
                  <td>
                    <select class="form-select form-select-sm"
                            [ngModel]="o.livreur_id || null"
                            (ngModelChange)="assignLivreur(o.id, $event)"
                            [disabled]="o.statut !== 'en_preparation' || !!o.livreur_id">
                      <option [ngValue]="null">
                        {{ o.statut === 'en_attente' ? 'Confirmer avant distribution' : 'Choisir un livreur' }}
                      </option>
                      <option *ngFor="let livreur of livreurs" [ngValue]="livreur.id">
                        {{ livreur.nom }}
                      </option>
                    </select>
                  </td>
                </tr>
                <tr *ngIf="!loading && !loadError && orders.length === 0">
                  <td colspan="6" class="text-center text-muted py-5">Aucune commande pour le moment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GestionCommandesComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  livreurs: any[] = [];
  loading = true;
  loadError = '';
  private refreshSubscription?: Subscription;

  constructor(
    private api: ApiService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.loadLivreurs();
    this.refreshSubscription = interval(15000).subscribe(() => this.load());
  }

  load() {
    this.api.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loadError = '';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.loadError = err.error?.message || err.error?.error || 'Impossible de charger les commandes.';
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private loadLivreurs() {
    this.api.getLivreurs().subscribe({
      next: livreurs => {
        this.livreurs = livreurs;
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.loadError = err.error?.message || err.error?.error || 'Impossible de charger les livreurs.';
        this.changeDetector.markForCheck();
      }
    });
  }

  assignLivreur(orderId: number, livreurId: number | null) {
    if (livreurId === null) return;

    this.api.assignOrderToLivreur(orderId, livreurId).subscribe({
      next: () => this.load(),
      error: err => {
        this.loadError = err.error?.message || err.error?.error || 'Impossible d’assigner le livreur.';
        this.load();
        this.changeDetector.markForCheck();
      }
    });
  }

  changeStatus(id: number, status: string) {
    this.api.updateOrderStatus(id, status).subscribe({
      next: () => this.load(),
      error: err => {
        this.loadError = err.error?.message || err.error?.error || 'Impossible de modifier le statut.';
        this.changeDetector.markForCheck();
      }
    });
  }
}