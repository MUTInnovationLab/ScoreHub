import { Injectable } from '@angular/core';
import { CalculationService } from './calculation.service';

@Injectable({
  providedIn: 'root',
})
export class ReportingService {
  constructor(private calculationService: CalculationService) {}

  generateReport(groups: any[]): string {
    const report = groups.map(group => {
      const criteriaDetails = group.criteria.map((criterion: { name: any; score: any; }) => `${criterion.name}: ${criterion.score}`).join('\n');
      return `Group: ${group.name}\n${criteriaDetails}\nAverage: ${group.averageScore}\n\n`;
    }).join('');

    const overallAverage = this.calculationService.calculateOverallAverage(groups);
    return `${report}Overall Average: ${overallAverage}`;
  }

  displayMarkerEvaluations(groups: any[]): string {
    return groups.map(group => {
      const evaluations = group.criteria.map((criterion: { name: any; marker: any; score: any; }) => `${criterion.name}: ${criterion.marker} rated ${criterion.score}`).join('\n');
      return `Group: ${group.name}\n${evaluations}\n\n`;
    }).join('');
  }
}
