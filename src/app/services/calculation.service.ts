import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CalculationService {
  constructor() {}

  calculateAverages(groups: any[]): any[] {
    return groups.map(group => {
      const totalScore = group.criteria.reduce((total: any, criterion: { score: any; }) => total + criterion.score, 0);
      const averageScore = totalScore / group.criteria.length;

      return {
        ...group,
        averageScore,
      };
    });
  }

  calculateOverallAverage(groups: any[]): number {
    const totalAverage = groups.reduce((total, group) => total + group.averageScore, 0);
    return totalAverage / groups.length;
  }
}
