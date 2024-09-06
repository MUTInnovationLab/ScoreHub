import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define a type for the group
export interface Group {
  groupId: string;
  groupName: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private firestore: AngularFirestore) {}

  // Fetch all groups
  getGroups(): Observable<Group[]> {
    return this.firestore.collection<Group>('Groups').valueChanges().pipe(
      catchError(error => {
        console.error('Error fetching groups:', error);
        throw error;
      })
    );
  }

  // Add a new group
  addGroup(group: Group): Promise<void> {
    return this.firestore.collection('Groups').doc(group.groupId).set(group).catch(error => {
      console.error('Error adding group:', error);
      throw error;
    });
  }

  // Update an existing group
  updateGroup(groupId: string, group: Partial<Group>): Promise<void> {
    return this.firestore.collection('Groups').doc(groupId).update(group).catch(error => {
      console.error('Error updating group:', error);
      throw error;
    });
  }

  // Delete a group
  deleteGroup(groupId: string): Promise<void> {
    return this.firestore.collection('Groups').doc(groupId).delete().catch(error => {
      console.error('Error deleting group:', error);
      throw error;
    });
  }
}
