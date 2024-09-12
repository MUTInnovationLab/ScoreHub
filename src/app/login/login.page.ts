import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseError } from '@firebase/util'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = ''; // This will be the staffNumber for regular users
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Admin credentials
  adminEmail: string = 'admin@mut.ac.za'; // Full Admin email
  adminPassword: string = 'Room16'; // Admin default password

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

      // Check if the email is admin and the password is admin's default password
      if (this.email === this.adminEmail && this.password === this.adminPassword) {
        loader.dismiss();
        this.navController.navigateForward('/admin'); // Navigate to admin page
        return;
      }

      // Regular user login with Firestore validation
      const userCredential = await this.auth.signInWithEmailAndPassword(this.email, this.password);
      const currentUser = await this.auth.currentUser;

      if (currentUser) {
        const userEmail = currentUser.email;
        console.log('Logged in user email:', userEmail);

        const isUserValid = await this.checkUserStaffNumber(userEmail!, this.password);
        if (isUserValid) {
          loader.dismiss();
          this.navController.navigateForward('/score'); // Navigate to score page for regular users
        } else {
          loader.dismiss();
          this.presentToast('Invalid staff number or no user found. Please contact support.');
        }
      } else {
        loader.dismiss();
        this.presentToast('Unable to fetch user data. Please try again.');
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
      console.log(`Email input: ${email}`);
      console.log(`StaffNumber input: ${staffNumber}`);
      
      // Ensure case-insensitive match by converting both Firestore and input email to lowercase
      const userDoc = await this.db.collection('Users').ref
        .where('email', '==', email.toLowerCase())  // Make sure to store email in lowercase in Firestore
        .where('staffNumber', '==', staffNumber)
        .limit(1)
        .get();
  
      if (userDoc.empty) {
        console.log('No user found with the provided email and staff number.');
        return false; // User not found
      } else {
        console.log('User found:', userDoc.docs[0].data());
        return true; // User found
      }
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
