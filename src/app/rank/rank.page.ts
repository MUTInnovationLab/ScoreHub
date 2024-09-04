import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rank',
  templateUrl: 'rank.page.html',
  styleUrls: ['rank.page.scss'],
})
export class RankPage {
  top5Items = [
    { rank: 1, groupName: 'Group A' },
    { rank: 2, groupName: 'Group B' },
    { rank: 3, groupName: 'Group C' },
    { rank: 4, groupName: 'Group D' },
    { rank: 5, groupName: 'Group E' },
  ];

  detailedReports = [
    { groupName: 'Group A', businessIdeaScore: 85, marketingScore: 90, webScore: 88 },
    { groupName: 'Group B', businessIdeaScore: 80, marketingScore: 85, webScore: 82 },
    { groupName: 'Group C', businessIdeaScore: 40, marketingScore: 95, webScore: 52 },
    { groupName: 'Group D', businessIdeaScore: 60, marketingScore: 45, webScore: 62 },
    { groupName: 'Group E', businessIdeaScore: 70, marketingScore: 65, webScore: 92 },
    { groupName: 'Group F', businessIdeaScore: 80, marketingScore: 75, webScore: 72 },
    // Add more reports here
  ];

  constructor(private router: Router) {}

  navigateToRankingPage(event: any) {
    const selectedUser = event.detail.value;
    this.router.navigate(['/ranking-page', { user: selectedUser }]);
  }
}
