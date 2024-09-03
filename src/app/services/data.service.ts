import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: AngularFirestore) { }

  // Fetch all groups
  getGroups(): Observable<any[]> {
    return this.firestore.collection('Groups').valueChanges();
  }

  // Fetch all markings
  getMarkings(): Observable<any[]> {
    return this.firestore.collection('Marking').valueChanges();
  }

  // Fetch all users
  getUsers(): Observable<any[]> {
    return this.firestore.collection('Users').valueChanges();
  }

  // Fetch detailed reports combining group, marking, and user data
  getDetailedReports(): Observable<any[]> {
    return combineLatest([
      this.getGroups(),
      this.getMarkings(),
      this.getUsers()
    ]).pipe(
      map(([groups, markings, users]) => {
        // Combine the data
        return groups.map(group => {
          const groupMarkings = markings.filter(marking => marking.groupId === group.id);
          const userReports = groupMarkings.map(marking => {
            const user = users.find(user => user.userId === marking.userId);
            return {
              userName: user ? user.name : 'Unknown',
              ...marking,
              groupName: group.groupName,
              overallAverage: (marking.businessPlanScore + marking.marketingPlanScore + marking.webPageScore) / 3
            };
          });
          return {
            groupName: group.groupName,
            userReports
          };
        });
      })
    );
  }
}
