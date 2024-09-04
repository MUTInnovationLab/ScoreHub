import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collectionData, collection, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
// import { getDocs } from 'firebase/firestore/lite';
import { MarkingService } from '../services/marking.service';
// import { getDocs } from 'firebase/firestore';
import { getDocs, QuerySnapshot, DocumentData } from '@firebase/firestore';

interface Top5Item {
  id?: string;
  rank: number;
  groupName?: string;
}

interface MarkingRecord {
  id?: string;
  groupName?: string;
  businessPlanScore: number;
  marketingPlanScore: number;
  webPageScore: number;
  totalScore?: number;
}

@Component({
  selector: 'app-rank',
  templateUrl: 'rank.page.html',
  styleUrls: ['rank.page.scss'],
})
export class RankPage implements OnInit {
  top5Items: Top5Item[] = [];
  detailedReports: MarkingRecord[] = [];
  markingRecords: MarkingRecord[] = [];

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private markingService: MarkingService
  ) {}

  ngOnInit() {
    // this.loadMarkingRecords();
    // this.loadDetailedReports();
  }

  // private loadMarkingRecords() {
  //   this.markingService.getMarkingRecords().subscribe(
  //     (data: any[]) => {
  //       this.markingRecords = data.map(item => ({
  //         id: item.id,
  //         groupName: item.groupName,
  //         businessPlanScore: item.businessPlanScore,
  //         marketingPlanScore: item.marketingPlanScore,
  //         webPageScore: item.webPageScore,
  //         totalScore: (item.businessPlanScore + item.marketingPlanScore + item.webPageScore) // Calculate totalScore if needed
  //       }));
  //     },
  //     (error: any) => {
  //       console.error('Error loading marking records:', error);
  //     }
  //   );
  // }

  // private loadDetailedReports() {
  //   const detailedReportsCollection = this.markingService.getMarkingRecords();

  //   alert(JSON.stringify(detailedReportsCollection));

  //   const detailedReportsQuery = query(detailedReportsCollection, orderBy('groupName')); // Adjust as needed
  //   collectionData(detailedReportsQuery, { idField: 'id' }).subscribe(
  //     (data: any[]) => {
  //       this.detailedReports = data.map(item => ({
  //         id: item.id,
  //         groupName: item.groupName,
  //         businessPlanScore: item.businessPlanScore,
  //         marketingPlanScore: item.marketingPlanScore,
  //         webPageScore: item.webPageScore,
  //         totalScore: (item.businessPlanScore + item.marketingPlanScore + item.webPageScore) // Calculate totalScore if needed
  //       }));
  //     },
  //     (error: any) => {
  //       console.error('Error loading detailed reports:', error);
  //     }
  //   );
  // }
  

private async loadDetailedReports() {
  try {
    // Get the query for the collection
    const detailedReportsQuery = this.markingService.getMarkingRecords();

    // Fetch the data
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(detailedReportsQuery);
    
    // Map the data
    this.detailedReports = querySnapshot.docs.map(doc => {
      const data = doc.data() as { 
        groupName?: string; 
        businessPlanScore?: number; 
        marketingPlanScore?: number; 
        webPageScore?: number;
      };
      
      return {
        id: doc.id,
        groupName: data.groupName || '',
        businessPlanScore: data.businessPlanScore || 0,
        marketingPlanScore: data.marketingPlanScore || 0,
        webPageScore: data.webPageScore || 0,
        totalScore: (data.businessPlanScore || 0) + 
                    (data.marketingPlanScore || 0) + 
                    (data.webPageScore || 0)
      };
    });
  } catch (error) {
    console.error('Error loading detailed reports:', error);
  }
}


  navigateToRankingPage(event: any) {
    const selectedUser = event.detail.value;
    if (selectedUser) {
      this.router.navigate(['/ranking-page', { user: selectedUser }])
        .then(nav => {
          console.log('Navigation successful?', nav);
        })
        .catch(err => {
          console.error('Navigation error:', err);
        });
    } else {
      console.warn('No user selected.');
    }
  }
}
