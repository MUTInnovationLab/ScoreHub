// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { Observable, forkJoin } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';

// interface Evaluation {
//   markerId: string;
//   businessPlanScore: number;
//   marketingPlanScore: number;
//   webPageScore: number;
// }

// interface GroupRanking {
//   id: string;
//   groupName: string;
//   description: string;
//   businessPlanAverage: number;
//   marketingPlanAverage: number;
//   webPageAverage: number;
//   overallAverage: number;
//   evaluations: Evaluation[];
// }

// interface Marker {
//   id: string;
//   markerName: string;
//   userId: string;
//   businessPlanScore: number;
//   marketingPlanScore: number;
//   webPageScore: number;
// }

// interface User {
//   userId: string;
//   email: string;
//   name: string;
//   role: string;
// }

// @Component({
//   selector: 'app-rank',
//   templateUrl: './rank.page.html',
//   styleUrls: ['./rank.page.scss'],
// })
// export class RankPage implements OnInit {
//   groupForm: FormGroup;
//   rankings: GroupRanking[] = [];
//   showTop5: boolean = false;
//   showDetailedReport: boolean = false;
//   users: User[] = [];
//   markers: Marker[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private firestore: AngularFirestore
//   ) {
//     this.groupForm = this.fb.group({
//       groupName: ['', Validators.required],
//       description: ['']
//     });
//   }

//   ngOnInit() {
//     this.loadAllData();
//   }

//   loadAllData() {
//     forkJoin({
//       groups: this.firestore.collection<GroupRanking>('Groups').valueChanges(),
//       markings: this.firestore.collection<Marker>('Marking').valueChanges(),
//       users: this.firestore.collection<User>('Users').valueChanges()
//     }).pipe(
//       map(({ groups, markings, users }) => {
//         this.users = users;
//         this.markers = markings as Marker[];

//         const userMarkerMap = new Map<string, Marker[]>();

//         // Map markers by userId
//         this.markers.forEach(marker => {
//           const userId = marker.userId;
//           if (!userMarkerMap.has(userId)) {
//             userMarkerMap.set(userId, []);
//           }
//           userMarkerMap.get(userId)?.push(marker);
//         });

//         const groupMap = new Map<string, GroupRanking>();

//         // Initialize groupMap
//         groups.forEach(group => {
//           groupMap.set(group.id, {
//             ...group,
//             evaluations: []
//           });
//         });

//         // Map evaluations to groups
//         markings.forEach(marking => {
//           const group = groupMap.get((marking as any).groupId);
//           if (group) {
//             group.evaluations.push({
//               markerId: (marking as any).markerId,
//               businessPlanScore: (marking as any).businessPlanScore,
//               marketingPlanScore: (marking as any).marketingPlanScore,
//               webPageScore: (marking as any).webPageScore
//             });
//           }
//         });

//         // Include marker details in the evaluations
//         groups.forEach(group => {
//           group.evaluations = group.evaluations.map(evaluation => {
//             const marker = this.getMarkerById(evaluation.markerId);
//             return marker ? {
//               ...evaluation,
//               markerName: marker.markerName
//             } : evaluation;
//           });
//         });

//         return Array.from(groupMap.values());
//       }),
//       map(groups => groups.map(group => ({
//         ...group,
//         businessPlanAverage: this.calculateAverage(group.evaluations, 'businessPlanScore'),
//         marketingPlanAverage: this.calculateAverage(group.evaluations, 'marketingPlanScore'),
//         webPageAverage: this.calculateAverage(group.evaluations, 'webPageScore'),
//         overallAverage: this.calculateOverallAverage(group.evaluations)
//       }))),
//       catchError(error => {
//         console.error('Error fetching data:', error);
//         return [];
//       })
//     ).subscribe(rankings => {
//       this.rankings = rankings;
//     });
//   }

//   calculateAverage(evaluations: Evaluation[], key: keyof Evaluation): number {
//     if (evaluations.length === 0) return 0;
//     const total = evaluations.reduce((sum, evaluation) => {
//       const value = evaluation[key];
//       return sum + (typeof value === 'number' ? value : 0);
//     }, 0);
//     return total / evaluations.length;
//   }

//   calculateOverallAverage(evaluations: Evaluation[]): number {
//     if (evaluations.length === 0) return 0;

//     const total = evaluations.reduce((sum, evaluation) => {
//       const businessPlanScore = Number(evaluation.businessPlanScore);
//       const marketingPlanScore = Number(evaluation.marketingPlanScore);
//       const webPageScore = Number(evaluation.webPageScore);

//       return sum + (businessPlanScore + marketingPlanScore + webPageScore) / 3;
//     }, 0);

//     return total / evaluations.length;
//   }

//   toggleTop5() {
//     this.showTop5 = !this.showTop5;
//   }

//   toggleDetailedReport() {
//     this.showDetailedReport = !this.showDetailedReport;
//   }

//   // Helper method to get marker details
//   getMarkerById(markerId: string): Marker | undefined {
//     return this.markers.find(marker => marker.id === markerId);
//   }

//   // Helper method to get group details
//   getGroupByName(groupName: string): GroupRanking | undefined {
//     return this.rankings.find(group => group.groupName === groupName);
//   }
// }


//second




/*
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface Evaluation {
  markerId: string;
  businessPlanScore: number;
  marketingPlanScore: number;
  webPageScore: number;
  markerName?: string;
}

interface GroupRanking {
  id: string;
  groupName: string;
  description: string;
  businessPlanAverage: number;
  marketingPlanAverage: number;
  webPageAverage: number;
  overallAverage: number;
  evaluations: Evaluation[];
}

interface Marker {
  groupId: string;
  markerId: string;
  id: string;
  markerName: string;
  userId: string;
  businessPlanScore: number;
  marketingPlanScore: number;
  webPageScore: number;
}

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.page.html',
  styleUrls: ['./rank.page.scss'],
})
export class RankPage implements OnInit {
  groupForm: FormGroup;
  rankings: GroupRanking[] = [];
  showTop5: boolean = false;
  showDetailedReport: boolean = false;
  users: User[] = [];
  markers: Marker[] = [];

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    forkJoin({
      groups: this.firestore.collection<GroupRanking>('Groups').valueChanges(),
      markings: this.firestore.collection<Marker>('Marking').valueChanges(),
      users: this.firestore.collection<User>('Users').valueChanges()
    }).pipe(
      map(({ groups, markings, users }) => {
        this.users = users;
        this.markers = markings as Marker[];

        console.log('Fetched Groups:', groups);
        console.log('Fetched Markings:', markings);

        const groupMap = new Map<string, GroupRanking>();

        // Initialize groupMap
        groups.forEach(group => {
          groupMap.set(group.id, {
            ...group,
            evaluations: []
          });
        });

        // Map evaluations to groups
        markings.forEach(marking => {
          const group = groupMap.get(marking.groupId);
          if (group) {
            group.evaluations.push({
              markerId: marking.markerId,
              businessPlanScore: marking.businessPlanScore,
              marketingPlanScore: marking.marketingPlanScore,
              webPageScore: marking.webPageScore
            });
          }
        });

        console.log('Group Map with Evaluations:', Array.from(groupMap.values()));

        return Array.from(groupMap.values());
      }),
      map(groups => groups.map(group => ({
        ...group,
        businessPlanAverage: this.calculateAverage(group.evaluations, 'businessPlanScore'),
        marketingPlanAverage: this.calculateAverage(group.evaluations, 'marketingPlanScore'),
        webPageAverage: this.calculateAverage(group.evaluations, 'webPageScore'),
        overallAverage: this.calculateOverallAverage(group.evaluations)
      }))),
      catchError(error => {
        console.error('Error fetching data:', error);
        return [];
      })
    ).subscribe(rankings => {
      console.log('Final Rankings:', rankings);
      this.rankings = rankings;
    });
  }

  calculateAverage(evaluations: Evaluation[], key: keyof Evaluation): number {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, evaluation) => {
      const value = evaluation[key];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    return total / evaluations.length;
  }

  calculateOverallAverage(evaluations: Evaluation[]): number {
    if (evaluations.length === 0) return 0;

    const total = evaluations.reduce((sum, evaluation) => {
      const businessPlanScore = Number(evaluation.businessPlanScore);
      const marketingPlanScore = Number(evaluation.marketingPlanScore);
      const webPageScore = Number(evaluation.webPageScore);

      return sum + (businessPlanScore + marketingPlanScore + webPageScore) / 3;
    }, 0);

    return total / evaluations.length;
  }

  toggleTop5() {
    this.showTop5 = !this.showTop5;
  }

  toggleDetailedReport() {
    this.showDetailedReport = !this.showDetailedReport;
  }

  getMarkerById(markerId: string): Marker | undefined {
    return this.markers.find(marker => marker.id === markerId);
  }
}
*/

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface Evaluation {
  markerId: string;
  businessPlanScore: number;
  marketingPlanScore: number;
  webPageScore: number;
  markerName?: string;
}

interface GroupRanking {
  id: string;
  groupName: string;
  description: string;
  businessPlanAverage: number;
  marketingPlanAverage: number;
  webPageAverage: number;
  overallAverage: number;
  evaluations: Evaluation[];
}

interface Marker {
  groupId: string;
  markerId: string;
  id: string;
  markerName: string;
  businessPlanScore: number;
  marketingPlanScore: number;
  webPageScore: number;
}

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.page.html',
  styleUrls: ['./rank.page.scss'],
})
export class RankPage implements OnInit {
  groupForm: FormGroup;
  rankings: GroupRanking[] = [];
  showTop5: boolean = false;
  showDetailedReport: boolean = false;
  users: User[] = [];
  markers: Marker[] = [];

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    forkJoin({
      groups: this.firestore.collection<GroupRanking>('Groups').valueChanges(),
      markings: this.firestore.collection<Marker>('Marking').valueChanges(),
      users: this.firestore.collection<User>('Users').valueChanges()
    }).pipe(
      map(({ groups, markings, users }) => {
        this.users = users;
        this.markers = markings as Marker[];

        // Ensure groups and markings are arrays and filter out any undefined or null values
        const validGroups = (groups as GroupRanking[]).filter(group => group && group.id);
        const validMarkings = (markings as Marker[]).filter(marking => marking && marking.groupId);

        const groupMap = new Map<string, GroupRanking>();

        // Initialize groupMap
        validGroups.forEach(group => {
          groupMap.set(group.id, {
            ...group,
            evaluations: []
          });
        });

        // Map evaluations to groups
        validMarkings.forEach(marking => {
          const group = groupMap.get(marking.groupId);
          if (group) {
            group.evaluations.push({
              markerId: marking.markerId,
              businessPlanScore: marking.businessPlanScore,
              marketingPlanScore: marking.marketingPlanScore,
              webPageScore: marking.webPageScore,
              markerName: marking.markerName
            });
          }
        });

        return Array.from(groupMap.values());
      }),
      map(groups => groups.map(group => ({
        ...group,
        businessPlanAverage: this.calculateAverage(group.evaluations, 'businessPlanScore'),
        marketingPlanAverage: this.calculateAverage(group.evaluations, 'marketingPlanScore'),
        webPageAverage: this.calculateAverage(group.evaluations, 'webPageScore'),
        overallAverage: this.calculateOverallAverage(group.evaluations)
      }))),
      catchError(error => {
        console.error('Error fetching data:', error);
        return [];
      })
    ).subscribe(rankings => {
      this.rankings = rankings;
    });
  }

  calculateAverage(evaluations: Evaluation[], key: keyof Evaluation): number {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, evaluation) => {
      const value = evaluation[key];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    return total / evaluations.length;
  }

  calculateOverallAverage(evaluations: Evaluation[]): number {
    if (evaluations.length === 0) return 0;

    const total = evaluations.reduce((sum, evaluation) => {
      const businessPlanScore = Number(evaluation.businessPlanScore);
      const marketingPlanScore = Number(evaluation.marketingPlanScore);
      const webPageScore = Number(evaluation.webPageScore);

      return sum + (businessPlanScore + marketingPlanScore + webPageScore) / 3;
    }, 0);

    return total / evaluations.length;
  }

  toggleTop5() {
    this.showTop5 = !this.showTop5;
  }

  toggleDetailedReport() {
    this.showDetailedReport = !this.showDetailedReport;
  }

  getMarkerById(markerId: string): Marker | undefined {
    return this.markers.find(marker => marker.id === markerId);
  }
}
