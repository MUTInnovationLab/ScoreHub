import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Import AngularFireAuth for Firebase authentication
import { Router } from '@angular/router'; // Import Router for navigation
import { ToastController } from '@ionic/angular'; // Import ToastController for displaying messages

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
})
export class ResetPage implements OnInit {
  resetForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router, // Inject Router
    private toastController: ToastController // Inject ToastController
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  async onResetPassword() {
    const email = this.resetForm.get('email')?.value;
    if (email) {
      try {
        await this.afAuth.sendPasswordResetEmail(email);
        await this.presentToast('Password reset email sent. Please check your inbox.');
        this.router.navigate(['/login']); // Navigate to login page after sending the email
      } catch (error) {
        console.error('Password reset failed', error);
        await this.presentToast('Password reset failed. Please try again.');
      }
    } else {
      console.error('Please provide an email');
      await this.presentToast('Please provide an email.');
    }
  }

  // Method to present a toast message
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // Duration in milliseconds
      position: 'bottom'
    });
    toast.present();
  }
}
