import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api';
import { AuthService } from '../../shared/services/auth';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrap">
      <div class="container">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Votre historique</span>
            <h1>Mes commandes</h1>
            <p>Suivez vos commandes et retrouvez vos derniers repas.</p>
          </div>
        </div>

        <div *ngIf="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>
        <div *ngIf="loading" class="alert alert-light">Chargement de vos commandes...</div>
        <div *ngIf="!loading && !loadError && orders.length === 0" class="card text-center p-5">
          <div class="display-4 mb-3" aria-hidden="true">🍽️</div>
          <h2>Pas encore de commande</h2>
          <p>Votre prochaine découverte culinaire n’est qu’à quelques clics.</p>
          <a class="btn btn-warning align-self-center" routerLink="/">Explorer la carte</a>
        </div>

        <article class="card order-card mb-3" *ngFor="let o of orders">
          <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <span class="eyebrow">Commande du {{ o.created_at | date:'shortDate' }}</span>
                <h2 class="h4 mt-2 mb-1">Commande #{{ o.id }}</h2>
                <p class="small mb-0">{{ o.created_at | date:'shortTime' }}</p>
              </div>
              <span class="badge" [ngClass]="getBadge(o.statut)">{{ o.statut }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <span class="text-muted">Total de la commande</span>
              <span class="dish-price">{{ o.total }} DT</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  `
})
export class MesCommandesComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  loading = true;
  loadError = '';
  private refreshSubscription?: Subscription;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.refreshSubscription = interval(15000).subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private load() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.loading = false;
      this.loadError = 'Impossible d’identifier votre compte. Veuillez vous reconnecter.';
      this.changeDetector.markForCheck();
      return;
    }

    this.api.getMyOrders(user.id).subscribe({
      next: orders => {
        this.orders = orders;
        this.loadError = '';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.loadError = err.error?.message || err.error?.error || 'Impossible de charger vos commandes.';
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  getBadge(statut: string): string {
    return {
      'en_attente': 'bg-warning text-dark',
      'en_preparation': 'bg-info text-dark',
      'en_livraison': 'bg-primary',
      'livre': 'bg-success',
      'annule': 'bg-danger'
    }[statut] || 'bg-secondary';
  }
}