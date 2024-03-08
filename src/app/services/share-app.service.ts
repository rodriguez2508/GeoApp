import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareAppService {

  titleApp:string = 'Linki';
  textData:string = 'Descubre LINKI! La forma más fácil y rápida de solicitar un servicio de transporte. #TransporteSeguro #ViajesConEstilo #DescargaYa';

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
