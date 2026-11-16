import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api';
import { PanierService } from '../../shared/services/panier';

const DISH_IMAGE_BY_NAME: Record<string, string> = {
  'pizza margherita': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'burger classique': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'salade cesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
  'pates carbonara': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
  'tiramisu': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
  'couscous au poisson': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'brik a l oeuf': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'lablabi': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'ojja aux merguez': 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  'mloukhia tunisienne': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'makrouna salsa': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
  'kafteji': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'fricasse tunisien': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'chapati tunisien': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'slata mechouia': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
  'loubya': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'
};

const DISH_IMAGE_BY_KEY: Array<[RegExp, string]> = [
  [/pizza|margherita|napolitaine|pepperoni/, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'],
  [/burger|sandwich|hamburger/, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'],
  [/couscous|tajine|tagine|grill|kebab|merguez/, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
  [/salade|fresh|veggie|green/, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80'],
  [/pasta|spaghetti|lasagne|ramen|carbonara/, 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80'],
  [/tacos|wrap|burrito/, 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80'],
  [/dessert|gateau|tiramisu|crepe|glace|cake/, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80'],
  [/.*$/, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80']
];

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './menu.scss',
  template: `
    <div class="page-wrap menu-page">
      <div class="container">
        <section class="menu-hero">
          <div class="menu-hero__content">
            <span class="eyebrow">Le goût du fait maison</span>
            <h1>Un bon repas.<br><span>Un vrai moment.</span></h1>
            <p>Des recettes généreuses, préparées avec soin et livrées directement à votre porte.</p>
            <a class="btn btn-warning" href="#carte">Découvrir la carte <span aria-hidden="true">↓</span></a>
          </div>
          <div class="menu-hero__visual" aria-hidden="true">
            <div class="hero-plate">🍝</div>
            <div class="hero-note">✦ Préparé avec amour</div>
          </div>
        </section>

        <div *ngIf="loadError" class="alert alert-warning" role="alert">
          Impossible de charger la carte. Vérifiez que le serveur API est démarré.
        </div>

        <section id="carte">
          <div class="menu-section-heading">
            <div>
              <span class="eyebrow">À table</span>
              <h2>Nos incontournables</h2>
            </div>
            <span class="text-muted fw-semibold">{{ dishes().length }} plats à découvrir</span>
          </div>

          <div *ngIf="!loadError && dishes().length === 0" class="alert alert-light">
            Notre carte arrive bientôt. Revenez nous voir !
          </div>

          <div class="row g-4">
            <div class="col-md-6 col-lg-4" *ngFor="let dish of dishes(); let i = index">
              <article class="card dish-card" [style.animation-delay]="i * 75 + 'ms'">
                <div class="dish-image">
                  <img [src]="getDishImage(dish)"
                       [alt]="dish.nom"
                       (error)="onDishImageError($event)">
                  <span class="dish-tag">{{ dish.disponible ? 'Tout frais' : 'Indisponible' }}</span>
                </div>
                <div class="card-body d-flex flex-column">
                  <h3 class="card-title">{{ dish.nom }}</h3>
                  <p class="card-text flex-grow-1">{{ dish.description || 'Une recette maison préparée avec des ingrédients soigneusement choisis.' }}</p>
                  <div class="d-flex justify-content-between align-items-center gap-2 mt-2">
                    <span class="dish-price">{{ dish.prix }} DT</span>
                    <button class="btn btn-warning btn-sm"
                            [disabled]="!dish.disponible"
                            (click)="addToCart(dish)">
                      Ajouter au panier <span aria-hidden="true">＋</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div *ngIf="toast" class="alert alert-success position-fixed bottom-0 end-0 m-3 toast-pop">
          {{ toast }}
        </div>
      </div>
    </div>
  `
})
export class MenuComponent implements OnInit {
  dishes = signal<any[]>([]);
  toast = '';
  loadError = false;

  constructor(private api: ApiService, private panier: PanierService) {}

  ngOnInit() {
    this.api.getDishes().subscribe({
      next: dishes => {
        this.dishes.set(dishes);
        this.loadError = false;
      },
      error: () => {
        this.loadError = true;
      }
    });
  }

  getDishImage(dish: any): string {
    const explicitImage = typeof dish?.image_url === 'string' ? dish.image_url.trim() : '';
    if (explicitImage) {
      return explicitImage;
    }

    const candidate = (dish?.nom ?? '').toLowerCase();
    const normalized = candidate
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (DISH_IMAGE_BY_NAME[normalized]) {
      return DISH_IMAGE_BY_NAME[normalized];
    }

    const match = DISH_IMAGE_BY_KEY.find(([pattern]) => pattern.test(normalized));
    return match ? match[1] : DISH_IMAGE_BY_KEY[DISH_IMAGE_BY_KEY.length - 1][1];
  }

  onDishImageError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (!target) {
      return;
    }

    target.src = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80';
  }

  addToCart(dish: any) {
    this.panier.add({
      dishId: dish.id, nom: dish.nom, prix: dish.prix, quantite: 1, image_url: this.getDishImage(dish)
    });
    this.toast = `✅ ${dish.nom} ajouté au panier !`;
    setTimeout(() => this.toast = '', 2000);
  }
}