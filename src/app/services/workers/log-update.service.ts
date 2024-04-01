import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Observable, concat, filter, first, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogUpdateService {

  update_active: boolean = false;
  constructor(private appRef: ApplicationRef, private swUpdate: SwUpdate) {



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

      const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      everySixHoursOnceAppIsStable$.subscribe(async () => {
        try {
          const updateFound = await this.swUpdate.checkForUpdate();
          
          if(updateFound)
            observer.next(true);
          else
            observer.next(false);

          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        } catch (err) {
          console.error('Failed to check for updates:', err);
          observer.next(false);
        }
      });

      //   this.swUpdate.checkForUpdate().then(updateFound => {
      //     if (updateFound) {
      //       console.log('WS => A new version is available.');
      //       observer.next(true);
      //     } else {
      //       observer.next(false);
      //     }
      //     observer.complete();
      //   }).catch(err => {
      //     console.error('WS => Failed to check for updates:', err);
      //     observer.error(true);
      //   });
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
      return false;
    }
  }


}