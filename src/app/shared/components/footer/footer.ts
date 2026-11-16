import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="container app-footer__inner">
        <div class="brand-lockup">
          <span class="brand-mark">🍽️</span>
          <span>Resto<strong>Deliv</strong></span>
        </div>
        <p>Des bons petits plats, livrés avec le sourire. © {{ year }} RestoDeliv</p>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}