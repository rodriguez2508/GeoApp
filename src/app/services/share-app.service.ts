import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareAppService {

  titleApp:string = 'Linki';
  textData:string = 'Hola, somos Linki-Project, gracias por usar nuestra aplicaión.';

  constructor() { }

  compartir(): Promise<void> {
    if (navigator.share) {
      return navigator.share({
        title: this.titleApp,
        text: this.textData,
        url: window.location.href,
      });
    } else {
      console.error('La API de compartir no está disponible en este navegador.');
      return Promise.reject();
    }
  }


}
