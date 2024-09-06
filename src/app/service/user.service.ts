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
  // Method to add user to Firestore with a custom document ID (staffNumber)
  addUser(user: any, staffNumber: string) {
    return this.firestore.collection('Users').doc(staffNumber).set(user);
  }

  // Get user details by ID
  getUser(staffNumber: string): Observable<any> {
    return this.usersCollection.doc(staffNumber).valueChanges();
  }

  // Update user details
  updateUser(staffNumber: string, user: any): Promise<void> {
    return this.usersCollection.doc(staffNumber).update(user);
  }

  // Delete a user
  deleteUser(staffNumber: string): Promise<void> {
    return this.usersCollection.doc(staffNumber).delete();
  }
}
