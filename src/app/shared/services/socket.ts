import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any;

  onCommandeDisponible(): Observable<any> {
    return new Observable((observer: any) => {
      this.socket.on('commande_disponible', (data: any) => observer.next(data));
    });
  }

  onCommandeRetiree(): Observable<any> {
    return new Observable((observer: any) => {
      this.socket.on('commande_retiree', (data: any) => observer.next(data));
    });
  }
}