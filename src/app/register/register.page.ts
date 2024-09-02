import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service'; // Adjust path as needed

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  email: string = "";
  password: string = "";
  role: string = "marker"; // Default role
  name: string = "";
  userId: string = "";

  constructor(
    private alertController: AlertController, 
    private loadingController: LoadingController,
    private router: Router, 
    private auth: AngularFireAuth, 
    private toastController: ToastController,
    private navCtrl: NavController, 
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit() {}

  goToPage() {
    this.navCtrl.navigateForward("/login");
  }

  async register() {
    if (this.email === "") {
      this.presentAlert("Error", "Please enter your email.");
      return;
    }
    if (this.password === "") {
      this.presentAlert("Error", "Please enter your password.");
      return;
    }
    if (this.name === "") {
      this.presentAlert("Error", "Please enter your name.");
      return;
    }
    if (this.userId === "") {
      this.presentAlert("Error", "Please enter your UserID.");
      return;
    }

    const loader = await this.loadingController.create({
      message: 'Signing up',
      cssClass: 'custom-loader-class'
    });
    await loader.present();

    this.auth.createUserWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        // Add user details to Firestore
        const user = {
          email: this.email,
          role: this.role,
          name: this.name,
          userId: this.userId
        };

        this.userService.addUser(user)
          .then(() => {
            loader.dismiss();
            this.router.navigateByUrl("/login");
            this.presentToast('Successfully registered!');
          })
          .catch(error => {
            loader.dismiss();
            this.presentAlert("Firestore Error", error.message);
          });
      })
      .catch((error) => {
        loader.dismiss();
        this.handleAuthError(error);
      });
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

  private handleAuthError(error: any) {
    const errorMessage = error.message;

    if (errorMessage.includes("auth/missing-email")) {
      this.presentAlert("Error", "Email is required.");
    } else if (errorMessage.includes("auth/invalid-email")) {
      this.presentAlert("Error", "Invalid email format.");
    } else if (errorMessage.includes("auth/email-already-in-use")) {
      this.presentAlert("Error", "Email already in use.");
    } else if (errorMessage.includes("auth/user-not-found")) {
      this.presentAlert("Error", "User not found.");
    } else {
      this.presentAlert("Error", errorMessage);
    }
  }
}
