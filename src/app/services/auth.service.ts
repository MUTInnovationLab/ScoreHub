import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

  async getUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
  }

  async getUserEmail(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return (user as User | null)?.email || null;
  }

  getGroups(): Observable<any[]> {
    return this.firestore.collection('Groups').valueChanges();
  }

  getMarkings(): Observable<any[]> {
    return this.firestore.collection('Marking').valueChanges();
  }
}