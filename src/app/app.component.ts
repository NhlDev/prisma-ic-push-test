import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { Prisma } from 'capacitor-prisma-campaigns'
import { environment } from '../environments/environment';
import { NotificationEvent, PushService } from './services/push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private pushSrv: PushService, private alertController: AlertController) { }

  public ngOnInit(): void {

    // Inicializacion plugin de prisma
    Prisma.Load({
      server: environment.prisma.server,
      port: environment.prisma.port,
      appToken: environment.prisma.appToken,
      customerId: environment.prisma.customerId,
      protocol: environment.prisma.protocol
    });

    // Incializacion de plugin push
    this.pushSrv.initNotifications();

    // observable para atender los eventos push
    this.pushSrv.pushEventsObservable$.subscribe((notificationEvent: NotificationEvent) => {
      switch (notificationEvent?.eventName) {
        case "registration":
          // se envia a prisma el identificador push para recibir notificaciones
          Prisma.Subscribe({ registrationToken: notificationEvent.token.value });
          break;
        case "registrationError":
          console.error("Error en subscripcion PUSH", notificationEvent.error);
          break;
        case "pushNotificationReceived":

          this.alertController.create({
            header: notificationEvent.notification.title,
            message: notificationEvent.notification.body
          }).then(e => e.present());
          
          break;
        case "pushNotificationActionPerformed":
          break;
        default:
          break;
      }
    });
  }
}
