import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PanierService } from '../../services/panier';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="app-navbar">
      <div class="container app-navbar__inner">
        <a class="brand-lockup" routerLink="/" (click)="isOpen = false">
          <span class="brand-mark">🍽️</span>
          <span>Resto<strong>Deliv</strong></span>
        </a>
        <button class="navbar-toggle" type="button" (click)="toggle()"
                [attr.aria-expanded]="isOpen"
                [attr.aria-label]="isOpen ? 'Fermer le menu' : 'Ouvrir le menu'">
          {{ isOpen ? '×' : '☰' }}
        </button>
        <div class="navbar-content" [class.show]="isOpen">
          <div class="navbar-links">
            <a class="nav-link" routerLink="/" (click)="isOpen = false">La carte</a>
            <a class="nav-link" routerLink="/mes-commandes"
               *ngIf="auth.isLoggedIn() && !auth.isAdmin() && !auth.isLivreur()"
               (click)="isOpen = false">Mes commandes</a>
            <a class="nav-link" routerLink="/admin" *ngIf="auth.isAdmin()"
               (click)="isOpen = false">Administration</a>
            <a class="nav-link" routerLink="/livreur" *ngIf="auth.isLivreur()"
               (click)="isOpen = false">Espace livreur</a>
          </div>

          <div class="navbar-actions">
            <a routerLink="/panier" class="btn btn-warning position-relative"
               *ngIf="auth.isLoggedIn() && !auth.isAdmin() && !auth.isLivreur()"
               (click)="isOpen = false">
              🛒 Panier
              <span *ngIf="(panier.cart$ | async)?.length"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ panier.getCount() }}
              </span>
            </a>

            <ng-container *ngIf="auth.isLoggedIn(); else guestLinks">
              <span class="user-chip">
                <span aria-hidden="true">👤</span>
                <span>{{ auth.getCurrentUser()?.nom }}</span>
                <span class="user-chip__role">{{ auth.getCurrentUser()?.role | uppercase }}</span>
              </span>
              <button class="btn btn-sm btn-outline-light" (click)="logout()">Quitter</button>
            </ng-container>
            <ng-template #guestLinks>
              <a class="nav-link" routerLink="/login" (click)="isOpen = false">Connexion</a>
              <a class="btn btn-warning" routerLink="/register" (click)="isOpen = false">Créer un compte</a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  isOpen = false;

  constructor(
    public auth: AuthService,
    public panier: PanierService,
    private router: Router
  ) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.auth.logout();
    this.panier.clear();
    this.router.navigate(['/login']);
  }
}