import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController, LoadingController, ToastController } from '@ionic/angular';

interface User {
  email: string;
  role: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  adminEmail: string = 'mutinnovationlab@gmail.com';
  adminPassword: string = 'InnovationLab123';

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
      this.presentToast('Please enter your email and password.');
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
      message: 'Signing in',
      cssClass: 'custom-loader-class'
    });

    try {
      await loader.present();

      const userCredential = await this.auth.signInWithEmailAndPassword(this.email, this.password);

      if (this.checkAdminCredentials()) {
        loader.dismiss();
        this.navController.navigateForward('/dashboard');
        return;
      }

      if (userCredential) {
        const userRole = await this.getUserRole();
        loader.dismiss();
        this.navigateBasedOnRole(userRole);
      }
    } catch (error) {
      loader.dismiss();
      const errorMessage = (error as Error).message;

      switch (errorMessage) {
        case 'Firebase: The password is invalid or the user does not have a password. (auth/wrong-password)':
        case 'Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found)':
          this.presentToast('Invalid email or password');
          break;
        case 'Firebase: The email address is badly formatted. (auth/invalid-email)':
          this.presentToast('Incorrectly formatted email');
          break;
        default:
          this.presentToast('An unexpected error occurred.');
          break;
      }
    }
  }

  checkAdminCredentials(): boolean {
    return this.email === this.adminEmail && this.password === this.adminPassword;
  }

  async getUserRole(): Promise<string> {
    try {
      // Fetch the document snapshot for the user with the given email
      const userDoc = await this.db.collection('Users').ref.where('email', '==', this.email).limit(1).get();
      
      // Check if the document exists
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data() as User; // Safely access the first document's data
        return userData.role || 'unknown'; // Return role or 'unknown' if role is not defined
      } else {
        // Document does not exist
        return 'unknown';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'unknown'; // Return 'unknown' in case of any errors
    }
  }
  
  navigateBasedOnRole(role: string) {
    switch (role) {
      case 'marker':
        this.navController.navigateForward('/score');  // Correct path
        break;
      case 'admin':
        this.navController.navigateForward('/admin');  // Correct path
        break;
      default:
        this.presentToast('User role is not recognized.');
        break;
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
