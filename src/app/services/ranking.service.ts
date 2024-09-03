import { Injectable } from '@angular/core';
import { CalculationService } from './calculation.service';

@Injectable({
  providedIn: 'root',
})
export class RankingService {
  constructor(private calculationService: CalculationService) {}

  rankGroups(groups: any[]): any[] {
    const rankedGroups = this.calculationService.calculateAverages(groups)
      .sort((a, b) => b.averageScore - a.averageScore);
    return rankedGroups;
  }

  displayTop5Groups(groups: any[]): string {
    const top5 = this.rankGroups(groups).slice(0, 5);
    return top5.map((group, index) => `Rank ${index + 1}: ${group.name} with an average score of ${group.averageScore}`).join('\n');
  }
}
