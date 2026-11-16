import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="container">
        <div class="auth-layout">
          <section class="auth-story">
            <a class="brand-lockup" routerLink="/">
              <span class="brand-mark">🍽️</span>
              <span>Resto<strong>Deliv</strong></span>
            </a>
            <div>
              <span class="eyebrow">Heureux de vous revoir</span>
              <h1>Vos envies.<br>Notre cuisine.</h1>
              <p>Reconnectez-vous pour retrouver votre carte, votre panier et vos commandes.</p>
              <div class="auth-food-art" aria-hidden="true">🍕</div>
            </div>
            <div class="auth-perks">
              <span>✦ Fait avec soin</span>
              <span>⌁ Livré chez vous</span>
            </div>
          </section>

          <section class="auth-form-panel">
            <span class="eyebrow">Votre espace gourmand</span>
            <h2>Connexion</h2>
            <p>Entrez vos identifiants pour continuer.</p>
            <div *ngIf="error" class="alert alert-danger" role="alert">{{ error }}</div>
            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label" for="login-email">Adresse e-mail</label>
                <input id="login-email" type="email" class="form-control" [(ngModel)]="email"
                       name="email" autocomplete="email" placeholder="vous@exemple.com" required>
              </div>
              <div class="mb-3">
                <label class="form-label" for="login-password">Mot de passe</label>
                <input id="login-password" type="password" class="form-control" [(ngModel)]="password"
                       name="password" autocomplete="current-password" placeholder="Votre mot de passe" required>
              </div>
              <button type="submit" class="btn btn-warning w-100" [disabled]="loading">
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </form>
            <p class="auth-switch">Pas encore de compte ? <a routerLink="/register">Créer un compte</a></p>
          </section>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user.role === 'admin') this.router.navigate(['/admin']);
        else if (res.user.role === 'livreur') this.router.navigate(['/livreur']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Identifiants invalides';
      }
    });
  }
}