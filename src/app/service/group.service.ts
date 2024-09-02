import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groupsCollection = this.firestore.collection('Groups');

  constructor(private firestore: AngularFirestore) {}

  // Add a new group
  addGroup(group: any): Promise<void> {
    const { groupId } = group;
    return this.groupsCollection.doc(groupId).set(group);
  }

  // Get a group by ID
  getGroup(groupId: string): Observable<any> {
    return this.groupsCollection.doc(groupId).valueChanges();
  }

  // Update a group
  updateGroup(groupId: string, group: any): Promise<void> {
    return this.groupsCollection.doc(groupId).update(group);
  }

  // Delete a group
  deleteGroup(groupId: string): Promise<void> {
    return this.groupsCollection.doc(groupId).delete();
  }

  // Get all groups
  getAllGroups(): Observable<any[]> {
    return this.groupsCollection.valueChanges();
  }
}
