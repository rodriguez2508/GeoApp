import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Observable, concat, filter, first, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogUpdateService {

  update_active: boolean = false;
  constructor(private swUpdate: SwUpdate) {



    // swUpdate.versionUpdates
    // .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
    // .subscribe((evt) => {
    //   if (promptUser(evt)) {
    //     // Reload the page to update to the latest version.
    //     document.location.reload();
    //   }
    // });}


  }

  checkForUpdates(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.swUpdate.checkForUpdate().then(updateFound => {
        if (updateFound) {
          console.log('WS => A new version is available.');
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }).catch(err => {
        console.error('WS => Failed to check for updates:', err);
        observer.error(true);
      });
    });
  }
 
  public async activateUpdate(): Promise<boolean> {


    try {
      const updateFound = await this.swUpdate.activateUpdate();
      if (updateFound) {
        console.log('WS => Actualización instalada correctamente.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('WS => Error al instalar la actualización:', err);
      return true;
    }
  }

    // public async checkForUpdates(): Promise<boolean> {


    //   try {
    //     const updateFound = await this.swUpdate.checkForUpdate();
    //     if (updateFound) {
    //       console.log('WS => A new version is available.');
    //       return true;
    //     }
    //     return false;
    //   } catch (err) {
    //     console.error('WS => Failed to check for updates:', err);
    //     return true;
    //   }

    //   // this.swUpdate.versionUpdates.subscribe(async (evt) => {
    //   //   // console.log("checkForUpdates LISTEN..", evt.type);

    //   //   try {
    //   //     const updateFound = await this.swUpdate.checkForUpdate();
    //   //     if (updateFound) {
    //   //       console.log('WS => A new version is available.');
    //   //       return true;
    //   //       // document.location.reload();
    //   //     }
    //   //     return false;
    //   //   } catch (err) {
    //   //     console.error('WS => Failed to check for updates:', err);
    //   //     return true;

    //   //   } 
    //   // });
    // }

  }