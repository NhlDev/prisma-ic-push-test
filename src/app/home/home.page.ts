import { Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private pushSrv: PushService) { }

  public ngOnInit(): void {
    this.pushSrv.initNotifications();
  }

}
