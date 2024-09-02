import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Group {
  id: string;
  groupName: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private groupsCollection = this.firestore.collection<Group>('Groups');

  constructor(private firestore: AngularFirestore) {}

  getGroups(): Observable<Group[]> {
    return this.groupsCollection.snapshotChanges().pipe(
      map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Omit<Group, 'id'>;
        const id = action.payload.doc.id;
        return { id, ...data }; // Combine id with data
      }))
    );
  }

  addGroup(group: Omit<Group, 'id'>): Promise<void> {
    const id = this.firestore.createId();
    return this.groupsCollection.doc(id).set({ ...group, id });
  }

  updateGroup(id: string, group: Partial<Omit<Group, 'id'>>): Promise<void> {
    return this.groupsCollection.doc(id).update(group);
  }

  deleteGroup(id: string): Promise<void> {
    return this.groupsCollection.doc(id).delete();
  }

  getGroup(id: string): Observable<Group | undefined> {
    return this.groupsCollection.doc(id).valueChanges();
  }
}
