import { Injectable } from '@angular/core';
import { Firestore, collectionData, deleteDoc, doc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import { collection, getDocs, query, orderBy } from '@firebase/firestore';
// import { Query } from 'firebase/firestore/lite';
import { collection, query, orderBy, Query } from '@firebase/firestore';
// import { Query } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class MarkingService {

  constructor(private firestore: Firestore) {}

  // Fetch all marking records without any sorting


  // import { collection, query, orderBy, Query } from '@firebase/firestore';

  getMarkingRecords(): Query<any> {
    return query(collection(this.firestore, 'Marking'), orderBy('groupName'));
  }

  // async deleteReport(reportId: string) {
  //   const reportDocRef = doc(this.firestore, `reports/${reportId}`);
  //   return await deleteDoc(reportDocRef);
  // }
  

 

// getMarkingRecords(): Query<any> {
//   return query(collection(this.firestore, 'Marking'), orderBy('groupName'));
// }

  
}

