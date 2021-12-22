import { Injectable } from '@angular/core';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  private _pushEventsSubject: BehaviorSubject<NotificationEvent> = new BehaviorSubject<NotificationEvent>(null);

  public pushEventsObservable$: Observable<NotificationEvent> = this._pushEventsSubject.asObservable();

  constructor() { }

  public initNotifications() {
    console.log('Initializing Push');

    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.log("forbbiden");
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        this._pushEventsSubject.next({ eventName: 'registrationError', error: error });
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this._pushEventsSubject.next({ eventName: 'pushNotificationReceived', notification: notification });
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        this._pushEventsSubject.next({ eventName: 'pushNotificationActionPerformed', notificationAction: notification });
      }
    );

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        this._pushEventsSubject.next({ eventName: 'pushNotificationActionPerformed', token: token });
      }
    );
  }
}

export interface NotificationEvent {
  eventName: "registrationError" | "pushNotificationReceived" | "pushNotificationActionPerformed" | "registration";
  error?: any;
  notification?: PushNotificationSchema;
  notificationAction?: ActionPerformed;
  token?: Token;
}