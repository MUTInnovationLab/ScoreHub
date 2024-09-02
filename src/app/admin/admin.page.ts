import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { GroupService } from '../service/group.service'; // Adjust path as needed

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {

  groupId: string = "";
  groupName: string = "";
  description: string = "";

  constructor(
    private navCtrl: NavController, 
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private groupService: GroupService // Inject GroupService
  ) {}

  async submitForm() {
    if (this.groupId && this.groupName && this.description) {
      const loader = await this.loadingController.create({
        message: 'Adding Group...',
        cssClass: 'custom-loader-class'
      });
      await loader.present();

      const group = {
        groupId: this.groupId,
        groupName: this.groupName,
        description: this.description
      };

      this.groupService.addGroup(group)
        .then(() => {
          loader.dismiss();
          this.presentToast('Group added successfully!');
        })
        .catch(error => {
          loader.dismiss();
          this.presentAlert("Firestore Error", error.message);
        });
    } else {
      this.presentAlert('Error', 'Please fill all fields.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top'
    });
    toast.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
