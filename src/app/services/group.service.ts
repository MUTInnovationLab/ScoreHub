import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private collectionName = 'Groups';

  constructor(private firestore: AngularFirestore) { }

  // Add a new group
  addGroup(group: { groupName: string, description?: string, members?: string[], createdAt?: Date, updatedAt?: Date }): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.collectionName).doc(id).set({
      ...group,
      id,
      createdAt: group.createdAt || new Date(),
      updatedAt: group.updatedAt || new Date(),
    });
  }

  // Retrieve all groups
  getGroups(): Observable<{ id: string, groupName: string, description?: string, members?: string[], createdAt?: Date, updatedAt?: Date }[]> {
    return this.firestore.collection(this.collectionName).valueChanges({ idField: 'id' }) as Observable<{ id: string, groupName: string, description?: string, members?: string[], createdAt?: Date, updatedAt?: Date }[]>;
  }

  // Retrieve a single group by ID
  getGroup(id: string): Observable<{ id: string, groupName: string, description?: string, members?: string[], createdAt?: Date, updatedAt?: Date }> {
    return this.firestore.collection(this.collectionName).doc(id).valueChanges() as Observable<{ id: string, groupName: string, description?: string, members?: string[], createdAt?: Date, updatedAt?: Date }>;
  }

  // Update a group
  updateGroup(id: string, group: Partial<{ groupName: string, description?: string, members?: string[], updatedAt?: Date }>): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).update({
      ...group,
      updatedAt: group.updatedAt || new Date(),
    });
  }

  // Delete a group
  deleteGroup(id: string): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}
