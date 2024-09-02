import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersCollection = this.firestore.collection('Users');

  constructor(private firestore: AngularFirestore) {}

  // Add user details to the Users collection with a custom ID
  addUser(user: any): Promise<void> {
    return this.usersCollection.doc(user.userId).set(user); // Use userId as the document ID
  }

  // Get user details by ID
  getUser(userId: string): Observable<any> {
    return this.usersCollection.doc(userId).valueChanges();
  }

  // Update user details
  updateUser(userId: string, user: any): Promise<void> {
    return this.usersCollection.doc(userId).update(user);
  }

  // Delete a user
  deleteUser(userId: string): Promise<void> {
    return this.usersCollection.doc(userId).delete();
  }
}
