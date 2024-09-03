import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface User {
  email: string;
  name: string;
  role: string;
  userId: string;
}

interface Marking {
  businessPlanScore: number;
  email: string;
  groupName: string;
  marketingPlanScore: number;
  webPageScore: number;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.page.html',
  styleUrls: ['./rank.page.scss'],
})
export class RankPage implements OnInit {
  top5Items: { rank: number, groupName: string, averageScore: number }[] = [];
  detailedReports: { groupName: string, businessPlanScore: number, marketingPlanScore: number, webPageScore: number, averageScore: number }[] = [];
  paginatedReports: any[] = [];
  currentPage: number = 0;
  totalPages: number = 1;
  uniqueGroups: string[] = [];
  averages: { businessPlanAvg: number, marketingPlanAvg: number, webPageAvg: number, criterionAverage: number } = {
    businessPlanAvg: 0,
    marketingPlanAvg: 0,
    webPageAvg: 0,
    criterionAverage: 0
  };
  showMarkerEvaluations: boolean = false;
  markers: User[] = [];
  markerEvaluations: { markerName: string, evaluations: Marking[] }[] = [];
  currentMarkerIndex: number = 0;
  currentMarkerEvaluations: Marking[] = [];
  currentMarkerName: string = '';

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.fetchRankings();
    this.fetchMarkersAndEvaluations();
  }

  fetchRankings() {
    this.firestore.collection<Marking>('Marking').valueChanges().subscribe((data: Marking[]) => {
      // Map data to detailed reports
      this.detailedReports = data.map(item => ({
        groupName: item.groupName,
        businessPlanScore: item.businessPlanScore,
        marketingPlanScore: item.marketingPlanScore,
        webPageScore: item.webPageScore,
        averageScore: (item.businessPlanScore + item.marketingPlanScore + item.webPageScore) / 3
      }));

      this.uniqueGroups = [...new Set(this.detailedReports.map(item => item.groupName))];
      this.totalPages = this.uniqueGroups.length;

      this.updatePaginatedReports();
      this.calculateTop5();
    });
  }

  calculateTop5() {
    // Group by groupName and calculate the overall average for each group
    const groupAverages: { groupName: string, averageScore: number }[] = this.uniqueGroups.map(groupName => {
      const groupReports = this.detailedReports.filter(report => report.groupName === groupName);
      const totalAverageScore = groupReports.reduce((acc, report) => acc + report.averageScore, 0);
      const overallAverage = totalAverageScore / groupReports.length;
      return { groupName, averageScore: overallAverage };
    });

    // Sort the groups by their averageScore in descending order and take the top 5
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
    this.averages.criterionAverage = (this.averages.businessPlanAvg + this.averages.marketingPlanAvg + this.averages.webPageAvg) / 3;
  }

  fetchMarkersAndEvaluations() {
    this.firestore.collection<User>('Users', ref => ref.where('role', '==', 'marker')).valueChanges().subscribe((users: User[]) => {
      this.markers = users;

      // Fetch evaluations for each marker
      this.markers.forEach(marker => {
        this.firestore.collection<Marking>('Marking', ref => ref.where('email', '==', marker.email)).valueChanges().subscribe((evaluations: Marking[]) => {
          this.markerEvaluations.push({
            markerName: marker.name,
            evaluations
          });
          this.updateCurrentMarker();
        });
      });
    });
  }

  updateCurrentMarker() {
    if (this.markerEvaluations.length > 0) {
      this.currentMarkerEvaluations = this.markerEvaluations[this.currentMarkerIndex].evaluations;
      this.currentMarkerName = this.markerEvaluations[this.currentMarkerIndex].markerName;
    }
  }

  nextMarker() {
    if (this.currentMarkerIndex < this.markerEvaluations.length - 1) {
      this.currentMarkerIndex++;
      this.updateCurrentMarker();
    }
  }

  previousMarker() {
    if (this.currentMarkerIndex > 0) {
      this.currentMarkerIndex--;
      this.updateCurrentMarker();
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
  

  toggleMarkerEvaluations() {
    this.showMarkerEvaluations = !this.showMarkerEvaluations;
  }
}
