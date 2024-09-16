import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface User {
  email: string;
  name: string;
  lastName: string;
  staffNumber: string;
}

export interface Group {
  groupId: string;
  groupName: string;
}


interface Marking {
  markerEmail: string;
  businessPlanScore: number;
  email: string;
  groupName: string;
  marketingPlanScore: number;
  webPageScore: number;
  groupId: string;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.page.html',
  styleUrls: ['./rank.page.scss'],
})
export class RankPage implements OnInit {
  top5Items: { rank: number; groupName: string; groupId: string; averageScore: number }[] = [];
  detailedReports: {
    email: string;
    groupName: string;
    groupId: string; // Add groupId here
    businessPlanScore: number;
    marketingPlanScore: number;
    webPageScore: number;
    averageScore: number;
    markerEmail: string;
  }[] = [];
  paginatedReports: any[] = [];
  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 10; // Set page size to 10
  uniqueGroups: string[] = [];
  averages = {
    businessPlanAvg: 0,
    marketingPlanAvg: 0,
    webPageAvg: 0,
    criterionAverage: 0
  };
  showMarkerEvaluations: boolean = false;
  markers: User[] = [];
  markerEvaluations: { markerName: string; evaluations: Marking[] }[] = [];
  currentMarkerIndex: number = 0;
  currentMarkerEvaluations: Marking[] = [];
  currentMarkerName: string = '';
  searchGroupName: string = '';
  searchMarkerEmail: string = '';

  constructor(private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.fetchRankings();
    this.fetchMarkersAndEvaluations();
  }

  goBackToScore() {
    this.router.navigate(['/score']);
  }

  deleteReport(index: number) {
    const reportToDelete = this.paginatedReports[index];
    this.detailedReports = this.detailedReports.filter(report => report !== reportToDelete);
    this.paginatedReports.splice(index, 1);
    this.calculateAverages();
  }

  fetchRankings() {
    // fetchGroupsAndRankings() {
      // Fetch groups first
      this.firestore.collection<Group>('Groups').valueChanges()
        .pipe(
          catchError(error => {
            console.error('Error fetching groups:', error);
            return of([]);
          }),
          map(groups => {
            const groupMap = new Map<string, string>();
            groups.forEach(group => groupMap.set(group.groupName, group.groupId));
            return groupMap;
          }),
          switchMap(groupMap => 
            this.firestore.collection<Marking>('Marking').valueChanges().pipe(
              catchError(error => {
                console.error('Error fetching rankings:', error);
                return of([]);
              }),
              map(markings => {
                return markings.map(marking => ({
                  ...marking,
                  groupId: groupMap.get(marking.groupName) || '' // Use groupId from the map
                }));
              })
            )
          )
        )
        .subscribe((data: Marking[]) => {
          this.detailedReports = data.map(item => ({
            email: item.email,
            groupName: item.groupName,
            groupId: item.groupId, // Add groupId here
            businessPlanScore: item.businessPlanScore,
            marketingPlanScore: item.marketingPlanScore,
            webPageScore: item.webPageScore,
            averageScore: this.calculateWeightedAverage(item.businessPlanScore, item.marketingPlanScore, item.webPageScore),
            markerEmail: item.markerEmail
          }));
  
          this.uniqueGroups = [...new Set(this.detailedReports.map(item => item.groupName))];
          this.totalPages = Math.ceil(this.uniqueGroups.length / this.pageSize); // Adjust totalPages calculation
          this.updatePaginatedReports();
          this.calculateTop5();
        });
    }
  calculateWeightedAverage(businessPlanScore: number, marketingPlanScore: number, webPageScore: number): number {
    return (businessPlanScore + marketingPlanScore + webPageScore); // Adjusted to average
  }

  calculateTop5() {
    const groupAverages = this.uniqueGroups.map(groupName => {
      const groupReports = this.detailedReports.filter(report => report.groupName === groupName);
      const totalAverageScore = groupReports.reduce((acc, report) => acc + report.averageScore, 0);
      return { 
        groupName, 
        groupId: groupReports[0]?.groupId, // Use groupId from the first report
        averageScore: totalAverageScore / groupReports.length 
      };
    });
  
    this.top5Items = groupAverages
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((item, index) => ({
        rank: index + 1,
        groupName: item.groupName,
        groupId: item.groupId,
        averageScore: item.averageScore
      }));
  }
  
  

  updatePaginatedReports() {
    const currentGroupName = this.uniqueGroups[this.currentPage];
    this.paginatedReports = this.detailedReports.filter(report => report.groupName === currentGroupName);
    this.calculateAverages();
  }

  calculateAverages() {
    if (this.paginatedReports.length === 0) {
      this.averages = { businessPlanAvg: 0, marketingPlanAvg: 0, webPageAvg: 0, criterionAverage: 0 };
      return;
    }

    const totalBusinessPlanScore = this.paginatedReports.reduce((acc, report) => acc + report.businessPlanScore, 0);
    const totalMarketingPlanScore = this.paginatedReports.reduce((acc, report) => acc + report.marketingPlanScore, 0);
    const totalWebPageScore = this.paginatedReports.reduce((acc, report) => acc + report.webPageScore, 0);
    const totalReports = this.paginatedReports.length;

    this.averages.businessPlanAvg = totalBusinessPlanScore / totalReports;
    this.averages.marketingPlanAvg = totalMarketingPlanScore / totalReports;
    this.averages.webPageAvg = totalWebPageScore / totalReports;

    this.averages.criterionAverage = 
      (this.averages.businessPlanAvg + this.averages.marketingPlanAvg + this.averages.webPageAvg); // Adjusted to average
  }

  searchDetailedReports() {
    if (this.searchGroupName.trim() === '') {
      this.updatePaginatedReports();
      return;
    }
    
    this.paginatedReports = this.detailedReports.filter(report => 
      report.groupName.toLowerCase().includes(this.searchGroupName.toLowerCase())
    );
    this.calculateAverages();
  }

  fetchMarkersAndEvaluations() {
    this.firestore.collection<User>('Users').valueChanges()
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      )
      .subscribe((users: User[]) => {
        this.markers = users;
        const markerObservables = this.markers.map(marker =>
          this.firestore.collection<Marking>('Marking', ref => ref.where('markerEmail', '==', marker.email)).valueChanges().pipe(
            map((evaluations: Marking[]) => ({
              markerName: marker.name,
              evaluations
            })),
            catchError(error => {
              console.error(`Error fetching evaluations for ${marker.email}:`, error);
              return of({ markerName: marker.name, evaluations: [] });
            })
          )
        );

        forkJoin(markerObservables).subscribe((evaluationsList: { markerName: string, evaluations: Marking[] }[]) => {
          this.markerEvaluations = evaluationsList;
          this.updateCurrentMarker();
        }, error => {
          console.error('Error fetching marker evaluations:', error);
        });
      });
  }

  updateCurrentMarker() {
    if (this.markerEvaluations.length > 0) {
      const currentMarker = this.markerEvaluations[this.currentMarkerIndex];
      this.currentMarkerEvaluations = currentMarker.evaluations;
      this.currentMarkerName = currentMarker.markerName;
    } else {
      this.currentMarkerEvaluations = [];
    }
  }

  viewEvaluations(markerName: string) {
    const marker = this.markerEvaluations.find(e => e.markerName === markerName);
    if (marker) {
      this.currentMarkerEvaluations = marker.evaluations;
      this.currentMarkerName = marker.markerName;
      this.currentMarkerIndex = this.markerEvaluations.indexOf(marker);
      this.showMarkerEvaluations = true;
    }
  }
  
  prevMarker() {
    if (this.currentMarkerIndex > 0) {
      this.currentMarkerIndex--;
      this.updateCurrentMarker();
    }
  }

  nextMarker() {
    if (this.currentMarkerIndex < this.markerEvaluations.length - 1) {
      this.currentMarkerIndex++;
      this.updateCurrentMarker();
    }
  }

  closeEvaluation() {
    this.showMarkerEvaluations = false;
    this.currentMarkerEvaluations = [];
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedReports();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedReports();
    }
  }
}
