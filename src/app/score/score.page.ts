import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { GroupService, Group } from '../services/group.service';

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
  groups: Group[] = [];
  newGroupName: string = '';
  newGroupDescription: string = '';
  updateGroupId: string = '';
  updateGroupName: string = '';
  updateGroupDescription: string = '';
  deleteGroupId: string = '';
  loading: boolean = false;
  userEmail: string | null = null;  // Property to store the user's email

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private groupService: GroupService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.loadUserEmail();  // Load the user's email when the component initializes
  }

  loadGroups() {
    this.loading = true;
    this.groupService.getGroups().subscribe(
      (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching groups:', error);
        this.presentToast('Error loading groups', 'danger');
        this.loading = false;
      }
    );
  }

  async loadUserEmail() {
    this.userEmail = await this.authService.getUserEmail();
  }

  async submitScores() {
    if (!this.selectedGroupId || this.businessPlanScore === null || this.marketingPlanScore === null || this.webPageScore === null) {
      this.presentToast('Please fill out all fields', 'danger');
      return;
    }

    const selectedGroup = this.groups.find(group => group.id === this.selectedGroupId);
    if (!selectedGroup) {
      this.presentToast('Group not found', 'danger');
      return;
    }

    const scores = {
      groupName: selectedGroup.groupName,
      businessPlanScore: this.businessPlanScore,
      marketingPlanScore: this.marketingPlanScore,
      webPageScore: this.webPageScore,
      timestamp: new Date(),
      email: this.userEmail
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
      this.loadGroups();
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
      this.loadGroups();
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
      this.loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      this.presentToast('Error deleting group', 'danger');
    }
  }

  async loadGroupDetailsForUpdate() {
    if (!this.updateGroupId) return;

    try {
      const group = await this.groupService.getGroup(this.updateGroupId).toPromise();
      if (group) {
        this.updateGroupName = group.groupName || '';
        this.updateGroupDescription = group.description || '';
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
