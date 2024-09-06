/*import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
      cssClass: 'custom-loader-class' // Ensure this CSS class is defined in your styles
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
      const userDoc = await this.db.collection('Users').ref.where('email', '==', this.email).limit(1).get();
      
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data() as User;
        return userData.role || 'unknown';
      } else {
        return 'unknown';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'unknown';
    }
  }

  navigateBasedOnRole(role: string) {
    switch (role) {
      case 'marker':
        this.navController.navigateForward('/score');
        break;
      case 'admin':
        this.navController.navigateForward('/admin');
        break;
      default:
        this.presentToast('User role is not recognized.');
        break;
    }
  }

  async showLoading() {
    const loader = await this.loadingController.create({
      message: 'Loading...',
      duration: 2000
    });
    await loader.present();
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
*/import { Component, OnInit } from '@angular/core';
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
  password: string = '';
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

      // Non-admin users: Authenticate via Firebase and check Firestore for user data
      const userCredential = await this.auth.signInWithEmailAndPassword(this.email, this.password);
      if (userCredential) {
        const isUserValid = await this.checkUserExistsInFirestore(this.email);
        if (isUserValid) {
          loader.dismiss();
          this.navController.navigateForward('/score'); // Navigate to score page for regular users
        } else {
          loader.dismiss();
          this.presentToast('No user found in the database. Please contact support.');
        }
      }
    } catch (error: unknown) {
      loader.dismiss();
      if (error instanceof FirebaseError) {
        console.error('Firebase Authentication Error:', error.message);
        this.presentToast(`Firebase Error: ${error.message}`);
      } else if (error instanceof Error) {
        console.error('General Error:', error.message);
        this.presentToast(`Error: ${error.message}`);
      } else {
        console.error('Unknown Error:', error);
        this.presentToast('An unknown error occurred.');
      }
    }
  }

  async checkUserExistsInFirestore(email: string): Promise<boolean> {
    try {
      const userDoc = await this.db.collection('Users').ref.where('email', '==', email).limit(1).get();
      return !userDoc.empty; // Return true if a user is found in Firestore
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
