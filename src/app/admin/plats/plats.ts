import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api';

@Component({
  selector: 'app-gestion-plats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <div class="container">
        <div class="page-heading">
          <div>
            <span class="eyebrow">Votre cuisine</span>
            <h1>Gestion des plats</h1>
            <p>Gardez votre carte à jour et appétissante.</p>
          </div>
          <button class="btn btn-warning" (click)="openForm()">＋ Nouveau plat</button>
        </div>

        <div class="card admin-form mb-4" *ngIf="showForm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span class="eyebrow">{{ editingId ? 'Mise à jour' : 'Nouvelle recette' }}</span>
                <h2 class="h4 mt-2">{{ editingId ? 'Modifier le plat' : 'Ajouter un plat' }}</h2>
              </div>
              <button class="btn btn-outline-secondary btn-sm" (click)="showForm = false">Fermer</button>
            </div>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label" for="dish-name">Nom du plat</label>
                <input id="dish-name" class="form-control" placeholder="Ex. Pizza Margherita" [(ngModel)]="form.nom">
              </div>
              <div class="col-md-4">
                <label class="form-label" for="dish-price">Prix (DT)</label>
                <input id="dish-price" class="form-control" type="number" min="0" placeholder="0.00" [(ngModel)]="form.prix">
              </div>
              <div class="col-md-4">
                <label class="form-label" for="dish-image">Image URL</label>
                <input id="dish-image" class="form-control" placeholder="https://..." [(ngModel)]="form.image_url">
              </div>
              <div class="col-md-8">
                <label class="form-label" for="dish-description">Description</label>
                <input id="dish-description" class="form-control" placeholder="Les ingrédients et petits détails..." [(ngModel)]="form.description">
              </div>
              <div class="col-md-4 d-flex align-items-end justify-content-between gap-3">
                <label class="form-check d-flex align-items-center gap-2 mb-2" for="disp">
                  <input class="form-check-input mt-0" type="checkbox" [(ngModel)]="form.disponible" id="disp">
                  <span class="form-check-label">Disponible à la commande</span>
                </label>
                <button class="btn btn-success" (click)="save()">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>

        <div class="table-panel">
          <div class="table-responsive">
            <table class="table">
              <thead class="table-dark">
                <tr><th>ID</th><th>Nom</th><th>Prix</th><th>Disponibilité</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of dishes">
                  <td class="text-muted">#{{ d.id }}</td>
                  <td class="fw-bold">{{ d.nom }}</td>
                  <td>{{ d.prix }} DT</td>
                  <td>
                    <span class="badge" [ngClass]="d.disponible ? 'bg-success' : 'bg-secondary'">
                      {{ d.disponible ? 'Disponible' : 'Indisponible' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1" aria-label="Modifier le plat"
                            (click)="edit(d)">Modifier</button>
                    <button class="btn btn-sm btn-danger" aria-label="Supprimer le plat"
                            (click)="del(d.id)">Supprimer</button>
                  </td>
                </tr>
                <tr *ngIf="dishes.length === 0">
                  <td colspan="5" class="text-center text-muted py-5">Aucun plat dans la carte.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GestionPlatsComponent implements OnInit {
  dishes: any[] = [];
  showForm = false;
  editingId: number | null = null;
  form = { nom: '', prix: 0, description: '', image_url: '', disponible: true };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getDishes().subscribe(d => this.dishes = d); }

  openForm() {
    this.form = { nom: '', prix: 0, description: '', image_url: '', disponible: true };
    this.editingId = null;
    this.showForm = true;
  }

  edit(d: any) {
    this.form = { nom: d.nom, prix: d.prix, description: d.description, image_url: d.image_url, disponible: !!d.disponible };
    this.editingId = d.id;
    this.showForm = true;
  }

  save() {
    if (this.editingId) {
      this.api.updateDish(this.editingId, this.form).subscribe(() => { this.showForm = false; this.load(); });
    } else {
      this.api.createDish(this.form).subscribe(() => { this.showForm = false; this.load(); });
    }
  }

  del(id: number) {
    if (confirm('Supprimer ce plat ?')) {
      this.api.deleteDish(id).subscribe(() => this.load());
    }
  }
}