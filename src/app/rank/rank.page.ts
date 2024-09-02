// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-rank',
//   templateUrl: './rank.page.html',
//   styleUrls: ['./rank.page.scss'],
// })
// export class RankPage implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }



import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

interface Group {
  groupId: string;
  groupName: string;
  businessPlanAverage: number;
  marketingPlanAverage: number;
  webPageAverage: number;
  overallAverage: number;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.page.html',
  styleUrls: ['./rank.page.scss'],
})
export class RankPage implements OnInit {
  private groupsCollection: AngularFirestoreCollection<Group>;
  rankings: Group[] = [];

  constructor(private afs: AngularFirestore) {
    this.groupsCollection = this.afs.collection<Group>('Groups', (ref) =>
      ref.orderBy('overallAverage', 'desc')
    );
  }

  ngOnInit() {
    this.getRankings();
  }

  getRankings() {
    this.groupsCollection.valueChanges({ idField: 'groupId' }).subscribe((groups) => {
      this.rankings = groups;
    });
  }
}