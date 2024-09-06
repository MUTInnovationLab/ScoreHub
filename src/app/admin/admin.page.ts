import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Import AngularFireAuth
import { GroupService } from '../service/group.service'; // Adjust path as needed
import { UserService } from '../service/user.service'; // Adjust path as needed
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  addOption: string = 'group'; // Toggle between 'group' and 'user'

  // Group fields
  groupId: string = "";
  groupName: string = "";
  description: string = "";
  groups: { groupId: string, groupName: string, description: string }[] = []; // Array to hold group data
  selectedGroupId: string = ""; // To hold selected group ID

  // User fields
  name: string = "";
  staffNumber: string = ""; // Changed from userId to staffNumber
  email: string = "";
  lastName: string = ""; // Changed from password to lastName

  constructor(
    private navCtrl: NavController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private groupService: GroupService, // Inject GroupService for Groups collection
    private userService: UserService, // Inject UserService for Users collection
    private auth: AngularFireAuth // Inject AngularFireAuth for Firebase Authentication
  ) {}

  ngOnInit() {
    this.loadGroups(); // Load groups on component initialization
  }

  // Fetch existing groups from the service
  loadGroups() {
    this.groupService.getGroups().pipe(
      catchError(error => {
        this.presentAlert('Firestore Error', error.message);
        return of([]); // Return an empty observable to prevent further errors
      })
    ).subscribe(groups => {
      this.groups = groups;
    });
  }

  // Method to handle the change in selected group
  onGroupChange(groupId: string) {
    const selectedGroup = this.groups.find(group => group.groupId === groupId);
    if (selectedGroup) {
      this.groupId = selectedGroup.groupId;
      this.groupName = selectedGroup.groupName;
      this.description = selectedGroup.description;
    }
  }

  async submitForm() {
    if (this.addOption === 'group') {
      // Add Group
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

        this.groupService.addGroup(group).then(() => {
          loader.dismiss();
          this.presentToast('Group added successfully!');
          this.resetForm(); // Reset form after submission
          this.loadGroups(); // Reload groups list
        }).catch(error => {
          loader.dismiss();
          this.presentAlert('Firestore Error', error.message);
        });
      } else {
        this.presentAlert('Error', 'Please fill all group fields.');
      }
    } else if (this.addOption === 'user') {
      // Add User
      if (this.name && this.staffNumber && this.email && this.lastName) { // Updated field names
        const loader = await this.loadingController.create({
          message: 'Adding User...',
          cssClass: 'custom-loader-class'
        });
        await loader.present();

        try {
          // Create user in Firebase Authentication
          await this.auth.createUserWithEmailAndPassword(this.email, this.staffNumber); // Use staffNumber as password

          // Prepare user object for Firestore
          const user = {
            name: this.name,
            staffNumber: this.staffNumber, // Updated field names
            email: this.email,
            lastName: this.lastName // Updated field names
          };

          // Add user to Firestore using staffNumber as the document ID
          await this.userService.addUser(user, this.staffNumber);  // Pass staffNumber as document ID

          loader.dismiss();
          this.presentToast('User added successfully!');
          this.resetForm(); // Reset form after submission
        } catch (error) {
          loader.dismiss();
          this.handleAuthError(error);
        }
      } else {
        this.presentAlert('Error', 'Please fill all user fields.');
      }
    }
  }

  // Update Group method
  async updateGroup() {
    if (this.selectedGroupId && this.groupName && this.description) {
      const loader = await this.loadingController.create({
        message: 'Updating Group...',
        cssClass: 'custom-loader-class'
      });
      await loader.present();

      const group = {
        groupName: this.groupName,
        description: this.description
      };

      this.groupService.updateGroup(this.selectedGroupId, group).then(() => {
        loader.dismiss();
        this.presentToast('Group updated successfully!');
        this.resetForm(); // Reset form after update
        this.loadGroups(); // Reload groups list
      }).catch(error => {
        loader.dismiss();
        this.presentAlert('Firestore Error', error.message);
      });
    } else {
      this.presentAlert('Error', 'Please fill all group fields.');
    }
  }

  // Delete Group method
  async deleteGroup() {
    if (this.selectedGroupId) {
      const loader = await this.loadingController.create({
        message: 'Deleting Group...',
        cssClass: 'custom-loader-class'
      });
      await loader.present();

      this.groupService.deleteGroup(this.selectedGroupId).then(() => {
        loader.dismiss();
        this.presentToast('Group deleted successfully!');
        this.resetForm(); // Reset form after deletion
        this.loadGroups(); // Reload groups list
      }).catch(error => {
        loader.dismiss();
        this.presentAlert('Firestore Error', error.message);
      });
    } else {
      this.presentAlert('Error', 'Please select a group to delete.');
    }
  }

  // Reset form fields
  resetForm() {
    this.groupId = "";
    this.groupName = "";
    this.description = "";
    this.selectedGroupId = "";
    this.name = "";
    this.staffNumber = ""; // Updated field names
    this.email = "";
    this.lastName = ""; // Updated field names
  }

  // Helper method to show toast messages
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  // Helper method to show alert messages
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
    } else if (errorMessage.includes("auth/weak-password")) {
      this.presentAlert("Error", "Password is too weak.");
    } else {
      this.presentAlert("Error", errorMessage);
    }
  }

  // Logout method
  // Logout method with confirmation
  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Logout cancelled');
          }
        },
        {
          text: 'Logout',
          handler: async () => {
            try {
              await this.auth.signOut();
              this.navCtrl.navigateRoot('/login'); // Redirect to login page after logout
            } catch (error) {
              this.presentAlert('Logout Error', 'An error occurred while logging out.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
