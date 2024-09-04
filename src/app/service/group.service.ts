import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  [x: string]: any;

  private groupsCollection = this.firestore.collection('Groups');

  constructor(private firestore: AngularFirestore) {}

  // Add a new group
  addGroup(group: any): Promise<void> {
    const { id } = group;
    return this.groupsCollection.doc(id).set(group);
  }

  // Fetch all groups
  getGroups(): Observable<any[]> {
    return this.groupsCollection.valueChanges();
  }

  // Get a group by ID
  getGroup(id: string): Observable<any> {
    return this.groupsCollection.doc(id).valueChanges();
  }

  // Update a group
  updateGroup(id: string, group: any): Promise<void> {
    return this.groupsCollection.doc(id).update(group);
  }

  // Delete a group
  deleteGroup(id: string): Promise<void> {
    return this.groupsCollection.doc(id).delete();
  }

  // Get all groups
  getAllGroups(): Observable<any[]> {
    return this.groupsCollection.valueChanges();
  }
}
