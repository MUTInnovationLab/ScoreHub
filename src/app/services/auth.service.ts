import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth
  ) { }

  async getUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
  }

  // Method to get the currently logged-in user's email
  async getUserEmail(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return (user as User | null)?.email || null;
  }

}
