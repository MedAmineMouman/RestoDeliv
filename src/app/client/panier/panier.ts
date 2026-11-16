import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PanierService } from '../../shared/services/panier';
import { ApiService } from '../../shared/services/api';
import { AuthService } from '../../shared/services/auth';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrap">
      <div class="container">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Votre sélection</span>
            <h1>Votre panier</h1>
            <p>Encore une petite étape avant de vous régaler.</p>
          </div>
          <a class="btn btn-outline-primary" routerLink="/">← Retour à la carte</a>
        </div>

        <div *ngIf="items.length === 0" class="card text-center p-5">
          <div class="display-4 mb-3" aria-hidden="true">🧺</div>
          <h2>Votre panier est encore vide</h2>
          <p>Choisissez un plat qui vous fait envie, on s’occupe du reste.</p>
          <a class="btn btn-warning align-self-center" routerLink="/">Découvrir la carte</a>
        </div>

        <div *ngIf="items.length > 0">
          <div class="table-panel mb-4">
            <div class="table-responsive">
              <table class="table">
                <thead class="table-dark">
                  <tr><th>Plat</th><th>Prix</th><th>Quantité</th><th>Total</th><th></th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of items">
                    <td class="fw-bold">{{ item.nom }}</td>
                    <td>{{ item.prix }} DT</td>
                    <td>
                      <button class="btn btn-sm btn-outline-secondary me-1"
                              aria-label="Diminuer la quantité" (click)="dec(item.dishId)">−</button>
                      {{ item.quantite }}
                      <button class="btn btn-sm btn-outline-secondary ms-1"
                              aria-label="Augmenter la quantité" (click)="inc(item.dishId)">＋</button>
                    </td>
                    <td class="fw-bold">{{ item.prix * item.quantite }} DT</td>
                    <td>
                      <button class="btn btn-sm btn-danger" aria-label="Retirer ce plat"
                              (click)="remove(item.dishId)">Retirer</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-lg-7">
              <div class="card delivery-card h-100">
                <div class="card-body">
                  <span class="eyebrow">On vous retrouve où ?</span>
                  <h2 class="h4 mt-2 mb-4">Informations de livraison</h2>
                  <div class="mb-3">
                    <label class="form-label" for="delivery-address">Adresse complète *</label>
                    <input id="delivery-address" type="text" class="form-control"
                           placeholder="Ex. 12 rue de Tunis, Ariana"
                           [(ngModel)]="adresse" name="adresse" required>
                  </div>
                  <div>
                    <label class="form-label" for="delivery-phone">Téléphone *</label>
                    <input id="delivery-phone" type="tel" class="form-control"
                           placeholder="Ex. 216 12 345 678"
                           [(ngModel)]="telephone" name="telephone" required>
                  </div>
                  <small class="d-block mt-3 text-muted">Ces informations sont partagées avec le livreur pour vous remettre la commande.</small>
                </div>
              </div>
            </div>
            <div class="col-lg-5">
              <div class="card cart-summary">
                <div class="card-body">
                  <span class="eyebrow">Presque prêt</span>
                  <h2 class="h4 mt-2">Récapitulatif</h2>
                  <div class="d-flex justify-content-between py-3 border-bottom">
                    <span class="text-muted">Articles</span>
                    <span>{{ panier.getCount() }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-3">
                    <span class="fw-bold">Total</span>
                    <span class="dish-price">{{ panier.getTotal() }} DT</span>
                  </div>
                  <button class="btn btn-success btn-lg w-100"
                          (click)="commander()" [disabled]="loading">
                    {{ loading ? 'Envoi...' : 'Confirmer ma commande →' }}
                  </button>
                  <p class="small text-center mt-3 mb-0">Paiement à la livraison</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PanierComponent {
  items: any[] = [];
  loading = false;

  // (Correction 9) Champs de livraison
  adresse = '';
  telephone = '';

  constructor(
    public panier: PanierService,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {
    this.panier.cart$.subscribe(i => this.items = i);
  }

  inc(dishId: number) {
    const item = this.items.find(i => i.dishId === dishId);
    if (item) this.panier.updateQuantity(dishId, item.quantite + 1);
  }

  dec(dishId: number) {
    const item = this.items.find(i => i.dishId === dishId);
    if (item) this.panier.updateQuantity(dishId, item.quantite - 1);
  }

  remove(dishId: number) {
    this.panier.remove(dishId);
  }

  commander() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // (Correction 9) Validation adresse + téléphone
    if (!this.adresse.trim() || !this.telephone.trim()) {
      alert('Veuillez renseigner votre adresse et votre numéro de téléphone.');
      return;
    }

    if (this.items.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    this.loading = true;
    const user = this.auth.getCurrentUser();

    const payload = {
      client_id: user?.id,
      items: this.items.map(i => ({
        dish_id: i.dishId,
        quantite: i.quantite,
        prix_unitaire: i.prix
      })),
      total: this.panier.getTotal(),
      // (Correction 9) Champs envoyés au backend
      adresse_livraison: this.adresse.trim(),
      telephone: this.telephone.trim()
    };

    this.api.createOrder(payload).subscribe({
      next: () => {
        this.loading = false;
        this.panier.clear();
        this.adresse = '';
        this.telephone = '';
        alert('✅ Commande passée avec succès !');
        this.router.navigate(['/mes-commandes']);
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Erreur lors de la commande');
      }
    });
  }
}