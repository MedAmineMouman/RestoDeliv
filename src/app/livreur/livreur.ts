import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../shared/services/api';
import { AuthService } from '../shared/services/auth';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-livreur',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">
      <div class="container">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Livraison avec le sourire</span>
            <h1>Votre espace livreur</h1>
            <p>Retrouvez les commandes à prendre et vos livraisons en cours.</p>
          </div>
          <span class="badge bg-success">🛵 En ligne</span>
        </div>

        <div class="alert alert-info" *ngIf="toast" role="status">{{ toast }}</div>
        <div class="alert alert-danger" *ngIf="loadError" role="alert">{{ loadError }}</div>

        <section class="livreur-section">
          <div class="page-heading mb-3">
            <div>
              <span class="eyebrow">À récupérer</span>
              <h2>Commandes disponibles</h2>
            </div>
            <span class="badge bg-warning text-dark">{{ disponibles.length }} commande(s)</span>
          </div>
          <div *ngIf="disponibles.length === 0" class="alert alert-light">
            Aucune commande disponible pour le moment.
          </div>
          <div class="row g-3">
            <div class="col-md-6" *ngFor="let o of disponibles">
              <article class="card livreur-order-card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div><span class="eyebrow">Commande</span><h3 class="h5 mt-1 mb-0">#{{ o.id }}</h3></div>
                    <span class="badge bg-warning text-dark">{{ o.statut }}</span>
                  </div>
                  <div class="delivery-details">
                    <p class="mb-2">👤 <strong>{{ o.client_nom }}</strong></p>
                    <p class="mb-2">💰 {{ o.total }} DT</p>
                    <p class="mb-3 small">📅 {{ o.created_at | date:'short' }}</p>
                  </div>
                  <button class="btn btn-success w-100" (click)="prendre(o.id)"
                          [disabled]="loading || !['en_preparation', 'en_livraison'].includes(o.statut)">
                    {{ o.statut === 'en_attente' ? 'En attente de validation admin' : 'Prendre cette commande →' }}
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="livreur-section">
          <div class="page-heading mb-3">
            <div>
              <span class="eyebrow">En route</span>
              <h2>Mes livraisons</h2>
            </div>
            <span class="badge bg-primary">{{ enCours.length }} en cours</span>
          </div>
          <div *ngIf="enCours.length === 0" class="alert alert-light">Aucune livraison en cours.</div>
          <div class="row g-3">
            <div class="col-md-6" *ngFor="let o of enCours">
              <article class="card border-primary livreur-order-card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <h3 class="h5">Commande #{{ o.id }}</h3>
                    <span class="badge bg-primary">{{ o.statut }}</span>
                  </div>
                  <p class="mb-2">👤 {{ o.client_nom }}</p>
                  <p class="mb-2">💰 {{ o.total }} DT</p>
                  <p class="mb-2">📞 {{ o.telephone || 'Non renseigné' }}</p>
                  <p class="mb-3">📍 {{ o.adresse_livraison || 'Adresse non renseignée' }}</p>
                  <div class="ratio ratio-16x9 mb-3" *ngIf="o.adresse_livraison">
                    <iframe
                      [src]="googleMapsEmbed(o.adresse_livraison)"
                      [title]="'Carte de livraison pour la commande #' + o.id"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                      allowfullscreen>
                    </iframe>
                  </div>
                  <a *ngIf="o.adresse_livraison"
                     class="btn btn-outline-primary w-100 mb-2"
                     [href]="googleMapsDirections(o.adresse_livraison)"
                     target="_blank"
                     rel="noopener noreferrer">
                    🗺️ Ouvrir l’itinéraire dans Google Maps
                  </a>
                  <button class="btn btn-success w-100" (click)="marquerLivree(o.id)">
                    Confirmer la livraison
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="livreur-section">
          <div class="page-heading mb-3">
            <div><span class="eyebrow">Vos dernières courses</span><h2>Historique</h2></div>
          </div>
          <div class="table-panel">
            <div class="table-responsive">
              <table class="table">
                <thead class="table-dark">
                  <tr><th>#</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of historique">
                    <td>#{{ o.id }}</td>
                    <td>{{ o.client_nom }}</td>
                    <td>{{ o.total }} DT</td>
                    <td><span class="badge bg-success">{{ o.statut }}</span></td>
                    <td>{{ o.created_at | date:'short' }}</td>
                  </tr>
                  <tr *ngIf="historique.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">Votre historique apparaîtra ici après vos premières livraisons.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class DashboardLivreurComponent implements OnInit, OnDestroy {
  disponibles: any[] = [];
  enCours: any[] = [];
  historique: any[] = [];
  loading = false;
  toast = '';
  loadError = '';
  private subs: Subscription[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.loadAll();

    // Polling de secours toutes les 15s
    const interval = setInterval(() => this.loadAll(), 15000);
    this.subs.push(new Subscription(() => clearInterval(interval)));
  }

  loadAll() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.http.get<any[]>('http://localhost:3000/api/orders/disponibles')
      .subscribe({
        next: orders => {
          this.disponibles = orders;
          this.loadError = '';
          this.changeDetector.markForCheck();
        },
        error: err => {
          this.loadError = err.error?.message || err.error?.error || 'Impossible de charger les commandes disponibles.';
          this.changeDetector.markForCheck();
        }
      });
    this.http.get<any[]>(`http://localhost:3000/api/orders/livreur/${user.id}`)
      .subscribe({
        next: orders => {
          this.enCours = orders.filter(o => o.statut === 'en_livraison');
          this.historique = orders.filter(o => o.statut === 'livre');
          this.changeDetector.markForCheck();
        },
        error: err => {
          this.loadError = err.error?.message || err.error?.error || 'Impossible de charger vos livraisons.';
          this.changeDetector.markForCheck();
        }
      });
  }

  prendre(orderId: number) {
    this.loading = true;
    this.http.put(`http://localhost:3000/api/orders/${orderId}/prendre`, {})
      .subscribe({
        next: () => {
          this.toast = `✅ Commande #${orderId} prise en charge`;
          setTimeout(() => this.toast = '', 3000);
          this.loadAll();
          this.loading = false;
          this.changeDetector.markForCheck();
        },
        error: (err) => {
          this.loadError = err.error?.message || err.error?.error || 'Impossible de prendre cette commande.';
          this.loading = false;
          this.changeDetector.markForCheck();
        }
      });
  }

  marquerLivree(orderId: number) {
    this.api.updateOrderStatus(orderId, 'livre').subscribe({
      next: () => {
        this.toast = `🎉 Commande #${orderId} livrée`;
        setTimeout(() => this.toast = '', 3000);
        this.loadAll();
        this.changeDetector.markForCheck();
      },
      error: err => {
        this.loadError = err.error?.message || err.error?.error || 'Impossible de terminer la livraison.';
        this.changeDetector.markForCheck();
      }
    });
  }

  googleMapsDirections(address: string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
  }

  googleMapsEmbed(address: string): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}