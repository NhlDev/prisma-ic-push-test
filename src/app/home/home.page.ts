import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

import { Prisma } from 'capacitor-prisma-campaigns';

import { environment } from '../../environments/environment';
import { NotificationEvent, PushService } from '../services/push.service';


const CONFIG_KEY = "CONFIG_PRISMA";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  prismaConfig = JSON.parse(localStorage.getItem(CONFIG_KEY)) || environment.prisma;
  prismaForm: FormGroup;

  constructor(private pushSrv: PushService, private alertController: AlertController, private fb: FormBuilder) { }

  public ngOnInit(): void {
    this.prismaForm = this.fb.group({
      server: ['', [Validators.required]],
      port: ['', [Validators.required]],
      appToken: ['', [Validators.required]],
      customerId: ['', Validators.required],
      protocol: ['', Validators.required],
    });

    this.prismaForm.patchValue({
      ...this.prismaConfig
    });
  }

  async startPrisma() {

    // Inicializacion plugin de prisma
    Prisma.Load({
      server: this.prismaConfig.server,
      port: this.prismaConfig.port,
      appToken: this.prismaConfig.appToken,
      customerId: this.prismaConfig.customerId,
      protocol: this.prismaConfig.protocol
    });

    // Inicializar las push y subcripcion a los eventos
    this.startPush();

    const alert = await this.alertController.create({
      header: "Prisma cargado",
      message: "Configuracion guardada"
    });
    alert.present();

    // Guardo la configuracion
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.prismaForm.value));
  }

  private startPush() {

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
          console.log(notificationEvent);
          break;
      }
    });
  }
}
