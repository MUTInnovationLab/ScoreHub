import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private navCtrl: NavController) {}

  // navigateToScorePage() {
  //   this.navCtrl.navigateForward('/score'); // Adjust the route path as needed
  // }

  navigateToRegisterPage() {
    this.navCtrl.navigateForward('/register'); // Adjust the route path as needed
  }

  navigateToLoginPage() {
    this.navCtrl.navigateForward('/login'); // Adjust the route path as needed
  }
}
