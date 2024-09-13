import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { catchError, of } from 'rxjs';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface User {
  email: string;
  name: string;
  lastName: string;
  staffNumber: string;
}

interface Marking {
  markerEmail: any;
  businessPlanScore: number;
  email: string;
  groupName: string;
  marketingPlanScore: number;
  webPageScore: number;
  // markerEmail: string;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.page.html',
  styleUrls: ['./rank.page.scss'],
})
export class RankPage implements OnInit {
  top5Items: { rank: number, groupName: string, averageScore: number }[] = [];
  detailedReports: {
    email: string;
    groupName: string;
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

  constructor(private firestore: AngularFirestore, private router: Router,) {}

  ngOnInit() {
    this.fetchRankings();
    this.fetchMarkersAndEvaluations();
  }

  goBackToScore(){
    this.router.navigate(['/score']);
  }

  deleteReport(index: number) {
    // Find the actual report to delete from the original detailedReports array
    const reportToDelete = this.paginatedReports[index];
  
    // Remove the report from both the paginated reports and the detailedReports array
    this.detailedReports = this.detailedReports.filter(report => report !== reportToDelete);
    this.paginatedReports.splice(index, 1);
  
    // Update the averages after deletion
    this.calculateAverages();
  }  


  fetchRankings() {
    this.firestore.collection<Marking>('Marking').valueChanges()
      .pipe(
        catchError(error => {
          console.error('Error fetching rankings:', error);
          return of([]);
        })
      )
      .subscribe((data: Marking[]) => {
        this.detailedReports = data.map(item => ({
          email: item.email,
          groupName: item.groupName,
          businessPlanScore: item.businessPlanScore,
          marketingPlanScore: item.marketingPlanScore,
          webPageScore: item.webPageScore,
          averageScore: this.calculateWeightedAverage(item.businessPlanScore, item.marketingPlanScore, item.webPageScore),
          markerEmail: item.markerEmail
        }));
  
        this.uniqueGroups = [...new Set(this.detailedReports.map(item => item.groupName))];
        this.totalPages = this.uniqueGroups.length;
        this.updatePaginatedReports();
        this.calculateTop5();
      });
  }  
  
  calculateWeightedAverage(businessPlanScore: number, marketingPlanScore: number, webPageScore: number): number {
    return (businessPlanScore + marketingPlanScore + webPageScore) ;
  }
  mapScoreToPercentage(score: number, thresholds: number[], percentages: number[]): number {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (score >= thresholds[i]) {
        return percentages[i];
      }
    }
    return 0;
  }

  calculateTop5() {
    const groupAverages = this.uniqueGroups.map(groupName => {
      const groupReports = this.detailedReports.filter(report => report.groupName === groupName);
      const totalAverageScore = groupReports.reduce((acc, report) => acc + report.averageScore, 0);
      return { groupName, averageScore: totalAverageScore / groupReports.length };
    });

    this.top5Items = groupAverages
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        groupName: item.groupName,
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
  
    // Calculate the overall average by adding all criterion averages and dividing by 3
    this.averages.criterionAverage = 
      (this.averages.businessPlanAvg + this.averages.marketingPlanAvg + this.averages.webPageAvg);
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
      this.currentMarkerName = '';
    }
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
