// import { Component, OnInit } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/compat/firestore';

// interface Marking {
//   groupName: string;
//   businessPlanScore: number;
//   marketingPlanScore: number;
//   webPageScore: number;
// }

// @Component({
//   selector: 'app-rank',
//   templateUrl: './rank.page.html',
//   styleUrls: ['./rank.page.scss'],
// })
// export class RankPage implements OnInit {
//   top5Items: { rank: number, groupName: string }[] = [];
//   detailedReports: { groupName: string, businessIdeaScore: number, marketingScore: number, webScore: number }[] = [];

//   constructor(private firestore: AngularFirestore) {}

//   ngOnInit() {
//     // Fetch Top 5 Items
//     this.firestore.collection<Marking>('Marking', ref => ref.orderBy('businessPlanScore', 'desc').limit(5))
//       .valueChanges()
//       .subscribe((data: Marking[]) => {
//         this.top5Items = data.map((item, index) => ({
//           rank: index + 1,
//           groupName: item.groupName
//         }));
//       });

//     // Fetch Detailed Reports
//     this.firestore.collection<Marking>('Marking').valueChanges().subscribe((data: Marking[]) => {
//       this.detailedReports = data.map(item => ({
//         groupName: item.groupName,
//         businessIdeaScore: item.businessPlanScore,
//         marketingScore: item.marketingPlanScore,
//         webScore: item.webPageScore
//       }));
//     });
//   }

//   navigateToRankingPage(event: any) {
//     const selectedUser = event.detail.value;
//     console.log('Selected User:', selectedUser);
//     // Implement navigation logic here
//   }
// }


import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface Marking {
  groupName: string;
  businessPlanScore: number;
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
  detailedReports: { groupName: string, businessIdeaScore: number, marketingScore: number, webScore: number, averageScore: number }[] = [];

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    // Fetch and rank Top 5 Items based on average score
    this.firestore.collection<Marking>('Marking').valueChanges().subscribe((data: Marking[]) => {
      // Calculate average scores and rank the top 5
      const rankedData = data.map(item => ({
        ...item,
        averageScore: (item.businessPlanScore + item.marketingPlanScore + item.webPageScore) / 3
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        groupName: item.groupName,
        averageScore: item.averageScore
      }));

      this.top5Items = rankedData;

      // Detailed Reports with average score
      this.detailedReports = data.map(item => ({
        groupName: item.groupName,
        businessIdeaScore: item.businessPlanScore,
        marketingScore: item.marketingPlanScore,
        webScore: item.webPageScore,
        averageScore: (item.businessPlanScore + item.marketingPlanScore + item.webPageScore) / 3
      }));
    });
  }

  navigateToRankingPage(event: any) {
    const selectedUser = event.detail.value;
    console.log('Selected User:', selectedUser);
    // Implement navigation logic here
  }
}
