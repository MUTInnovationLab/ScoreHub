
import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseError } from '@firebase/util'; // Import FirebaseError

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = ''; // This will be the staffNumber
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Admin credentials
  adminDomain: string = '@mut.ac.za'; // Admin email domain
  defaultAdminPassword: string = 'Room16'; // Admin default password

  constructor(
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private auth: AngularFireAuth,
    private navController: NavController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async validate() {
    if (!this.email || !this.password) {
      this.presentToast('Please enter your email and staff number.');
      return;
    }
    if (!this.emailRegex.test(this.email)) {
      this.presentToast('Please provide a valid email address.');
      return;
    }
    await this.login();
  }

  async login() {
    const loader = await this.loadingController.create({
      message: 'Signing in...',
      cssClass: 'custom-loader-class'
    });

    try {
      await loader.present();

      // Check if the email belongs to an admin and if they are using the default admin password
      if (this.email.endsWith(this.adminDomain) && this.password === this.defaultAdminPassword) {
        loader.dismiss();
        this.navController.navigateForward('/admin'); // Navigate to admin page
        return;
      }

      // Regular user login
      const isUserValid = await this.checkUserStaffNumber(this.email, this.password);
      if (isUserValid) {
        loader.dismiss();
        this.navController.navigateForward('/score'); // Navigate to score page for regular users
      } else {
        loader.dismiss();
        this.presentToast('Invalid staff number or no user found. Please contact support.');
      }
    } catch (error: any) {
      loader.dismiss();
      if (error instanceof FirebaseError) {
        this.presentToast(`Firebase Error: ${error.message}`);
      } else if (error instanceof Error) {
        this.presentToast(`Error: ${error.message}`);
      } else {
        this.presentToast('An unknown error occurred.');
      }
    }
  }

  // Method to check if user exists in Firestore and validate staffNumber
  async checkUserStaffNumber(email: string, staffNumber: string): Promise<boolean> {
    try {
      const userDoc = await this.db.collection('Users').ref
        .where('email', '==', email)
        .where('staffNumber', '==', staffNumber)
        .limit(1)
        .get();
      return !userDoc.empty; // Return true if a user with the given email and staffNumber is found in Firestore
    } catch (error) {
      console.error('Error checking user in Firestore:', error);
      return false;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
}
