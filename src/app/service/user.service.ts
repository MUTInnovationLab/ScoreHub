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
  addUser(user: any, staffNumber: string): Promise<void> {
    return this.firestore.collection('Users').doc(staffNumber).set(user);
  }

  // Get user details by staffNumber
  getUser(staffNumber: string): Observable<any> {
    return this.usersCollection.doc(staffNumber).valueChanges();
  }

  // Update user details by staffNumber
  updateUser(staffNumber: string, user: any): Promise<void> {
    return this.usersCollection.doc(staffNumber).update(user);
  }

  // Delete a user by staffNumber
  deleteUser(staffNumber: string): Promise<void> {
    return this.usersCollection.doc(staffNumber).delete();
  }

  // Optional: Fetch all users (be cautious with large datasets)
  getAllUsers(): Observable<any[]> {
    return this.firestore.collection('Users').valueChanges();
  }
}
