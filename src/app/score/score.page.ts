import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { GroupService, Group } from '../services/group.service';
import { Router } from '@angular/router';

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
    private router: Router,
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
    const userData = await this.authService.getUserData();
    this.userEmail = userData ? userData.email : null; // Get email and store it
    alert(this.userEmail);
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
      email: this.userEmail  // Add user's email to the scores
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

  // Other methods remain unchanged...

  resetForm() {
    this.selectedGroupId = '';
    this.businessPlanScore = null;
    this.marketingPlanScore = null;
    this.webPageScore = null;
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

  goToRankings(){
    this.router.navigate(['/rank']);
  }
}
