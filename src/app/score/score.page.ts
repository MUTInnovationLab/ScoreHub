import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { GroupService } from '../services/group.service'; // Import the GroupService

interface UserData {
  name?: string;
}

interface GroupData {
  id: string;
  groupName?: string;
  description?: string;
}

@Component({
  selector: 'app-score',
  templateUrl: './score.page.html',
  styleUrls: ['./score.page.scss'],
})
export class ScorePage implements OnInit {
  businessPlanScore: number | null = null;
  marketingPlanScore: number | null = null;
  webPageScore: number | null = null;
  selectedGroupId: string = '';
  markerId: string = '';
  markerName: string = 'Unknown';
  groups: Array<GroupData> = [];
  newGroupName: string = '';
  newGroupDescription: string = '';
  updateGroupId: string = '';
  updateGroupName: string = '';
  updateGroupDescription: string = '';
  deleteGroupId: string = '';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private groupService: GroupService, // Inject GroupService
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    try {
      const userId = await this.authService.getUserId();
      if (userId) {
        this.markerId = userId;
        await this.loadMarkerDetails();
        await this.loadGroups();
      } else {
        this.presentToast('Unable to retrieve user ID', 'danger');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      this.presentToast('Error initializing page', 'danger');
    }
  }

  async loadMarkerDetails() {
    try {
      const userDocSnapshot = await this.firestore.collection('Users').doc(this.markerId).get().toPromise();
      if (userDocSnapshot?.exists) {
        const userData = userDocSnapshot.data() as UserData;
        this.markerName = userData.name || 'Unknown';
      } else {
        this.markerName = 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching marker details:', error);
      this.presentToast('Error loading marker details', 'danger');
    }
  }

  async loadGroups() {
    try {
      const groupsSnapshot = await this.groupService.getGroups().toPromise();
      if (groupsSnapshot && groupsSnapshot.length > 0) {
        this.groups = groupsSnapshot.map(group => ({
          id: group.id,
          groupName: group.groupName || 'Unnamed Group'
        }));
      } else {
        this.presentToast('No groups found', 'warning');
        this.groups = [];
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      this.presentToast('Error loading groups', 'danger');
    }
  }

  async submitScores() {
    if (!this.selectedGroupId || this.businessPlanScore === null || this.marketingPlanScore === null || this.webPageScore === null) {
      this.presentToast('Please fill out all fields', 'danger');
      return;
    }

    const scores = {
      groupId: this.selectedGroupId,
      markerId: this.markerId,
      markerName: this.markerName,
      businessPlanScore: this.businessPlanScore,
      marketingPlanScore: this.marketingPlanScore,
      webPageScore: this.webPageScore,
      timestamp: new Date(),
    };

    try {
      await this.firestore.collection('Marking').add(scores);
      this.presentToast('Scores submitted successfully!', 'success');
      this.resetForm();
    } catch (error) {
      console.error('Error submitting scores:', error);
      this.presentToast('Error submitting scores', 'danger');
    }
  }

  async addGroup() {
    if (!this.newGroupName) {
      this.presentToast('Group name is required', 'danger');
      return;
    }

    try {
      await this.groupService.addGroup({
        groupName: this.newGroupName,
        description: this.newGroupDescription
      });
      this.presentToast('Group added successfully!', 'success');
      this.newGroupName = '';
      this.newGroupDescription = '';
      await this.loadGroups(); // Reload groups to reflect changes
    } catch (error) {
      console.error('Error adding group:', error);
      this.presentToast('Error adding group', 'danger');
    }
  }

  async updateGroup() {
    if (!this.updateGroupId || !this.updateGroupName) {
      this.presentToast('Group name and ID are required', 'danger');
      return;
    }

    try {
      await this.groupService.updateGroup(this.updateGroupId, {
        groupName: this.updateGroupName,
        description: this.updateGroupDescription
      });
      this.presentToast('Group updated successfully!', 'success');
      this.updateGroupId = '';
      this.updateGroupName = '';
      this.updateGroupDescription = '';
      await this.loadGroups(); // Reload groups to reflect changes
    } catch (error) {
      console.error('Error updating group:', error);
      this.presentToast('Error updating group', 'danger');
    }
  }

  async deleteGroup() {
    if (!this.deleteGroupId) {
      this.presentToast('Group ID is required', 'danger');
      return;
    }

    try {
      await this.groupService.deleteGroup(this.deleteGroupId);
      this.presentToast('Group deleted successfully!', 'success');
      this.deleteGroupId = '';
      await this.loadGroups(); // Reload groups to reflect changes
    } catch (error) {
      console.error('Error deleting group:', error);
      this.presentToast('Error deleting group', 'danger');
    }
  }

  async loadGroupDetailsForUpdate() {
    if (!this.updateGroupId) return;

    try {
      const groupDoc = await this.groupService.getGroup(this.updateGroupId).toPromise();
      if (groupDoc) {
        this.updateGroupName = groupDoc.groupName || '';
        this.updateGroupDescription = groupDoc.description || '';
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      this.presentToast('Error loading group details', 'danger');
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }

  resetForm() {
    this.selectedGroupId = '';
    this.businessPlanScore = null;
    this.marketingPlanScore = null;
    this.webPageScore = null;
  }
}
