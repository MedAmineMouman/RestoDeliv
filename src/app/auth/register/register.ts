import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth';

@Component({
  selector: 'app-register',
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
              <span class="eyebrow">Bienvenue à table</span>
              <h1>Le plaisir<br>commence ici.</h1>
              <p>Créez votre compte et découvrez une cuisine généreuse, préparée juste pour vous.</p>
              <div class="auth-food-art" aria-hidden="true">🥗</div>
            </div>
            <div class="auth-perks">
              <span>✦ Des produits choisis</span>
              <span>⌁ Une livraison aux petits soins</span>
            </div>
          </section>

          <section class="auth-form-panel">
            <span class="eyebrow">Nouveau chez nous ?</span>
            <h2>Créer un compte</h2>
            <p>Quelques infos et votre prochaine commande est à portée de clic.</p>
            <div *ngIf="error" class="alert alert-danger" role="alert">{{ error }}</div>
            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label" for="register-name">Votre nom</label>
                <input id="register-name" class="form-control" [(ngModel)]="nom" name="nom"
                       autocomplete="name" placeholder="Ex. Amira Ben Ali" required>
              </div>
              <div class="mb-3">
                <label class="form-label" for="register-email">Adresse e-mail</label>
                <input id="register-email" type="email" class="form-control" [(ngModel)]="email"
                       name="email" autocomplete="email" placeholder="vous@exemple.com" required>
              </div>
              <div class="mb-3">
                <label class="form-label" for="register-password">Mot de passe</label>
                <input id="register-password" type="password" class="form-control" [(ngModel)]="password"
                       name="password" autocomplete="new-password" placeholder="Choisissez un mot de passe" required>
              </div>
              <button type="submit" class="btn btn-warning w-100" [disabled]="loading">
                {{ loading ? 'Inscription...' : "S'inscrire" }}
              </button>
            </form>
            <p class="auth-switch">Déjà membre ? <a routerLink="/login">Se connecter</a></p>
          </section>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  nom = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.register({ nom: this.nom, email: this.email, password: this.password, role: 'client' })
      .subscribe({
        next: () => { this.loading = false; this.router.navigate(['/']); },
        error: (err) => { this.loading = false; this.error = err.error?.message || 'Erreur inscription'; }
      });
  }
}