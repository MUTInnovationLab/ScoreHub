import { Component, OnInit } from '@angular/core';
import { GroupService } from '../service/group.service'; // Ensure path is correct
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Group } from '../services/group.service';

// Component Decorator
@Component({
  selector: 'app-ranking-page',
  templateUrl: './ranking-page.component.html',
  styleUrls: ['./ranking-page.component.scss']
})
export class RankingPageComponent implements OnInit {
  groupScores: any[] = [];
  error: string | null = null;

  constructor(private groupService: GroupService, private firestore: AngularFirestore) {}

  ngOnInit() {
    this.fetchGroupScores();
  }

  fetchGroupScores() {
    this.groupService['getGroups']().pipe(
      switchMap(groups => {
        const typedGroups = groups as Group[];
        return Promise.all(typedGroups.map(group => 
          this.firestore.collection('Marking', ref => ref.where('groupId', '==', group.id)).valueChanges().pipe(
            map(markings => {
              const scores = markings as any[];
              const averageScores = this.calculateAverages(scores);
              return {
                groupName: group.groupName,
                averageBusinessPlanScore: averageScores.businessPlanScore,
                averageMarketingPlanScore: averageScores.marketingPlanScore,
                averageWebPageScore: averageScores.webPageScore,
                average: averageScores.average
              };
            })
          ).toPromise()
        ));
      })
    ).subscribe(
      (groupScores: any[]) => {
        this.groupScores = groupScores;
      },
      (error: any) => {
        this.error = 'An error occurred while fetching data.';
        console.error(error);
      }
    );
  }

  calculateAverages(scores: any[]) {
    if (scores.length === 0) return {
      businessPlanScore: 0,
      marketingPlanScore: 0,
      webPageScore: 0,
      average: 0
    };

    const totalScores = scores.reduce((acc, score) => {
      acc.businessPlanScore += score.businessPlanScore || 0;
      acc.marketingPlanScore += score.marketingPlanScore || 0;
      acc.webPageScore += score.webPageScore || 0;
      return acc;
    }, { businessPlanScore: 0, marketingPlanScore: 0, webPageScore: 0 });

    const count = scores.length;
    return {
      businessPlanScore: totalScores.businessPlanScore / count,
      marketingPlanScore: totalScores.marketingPlanScore / count,
      webPageScore: totalScores.webPageScore / count,
      average: (totalScores.businessPlanScore + totalScores.marketingPlanScore + totalScores.webPageScore) / (3 * count)
    };
  }
}
