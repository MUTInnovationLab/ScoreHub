// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import { IonicModule } from '@ionic/angular';

// import { RankPageRoutingModule } from './rank-routing.module';

// import { RankPage } from './rank.page';

// @NgModule({
//   imports: [
//     CommonModule,
//     FormsModule,
//     IonicModule,
//     RankPageRoutingModule
//   ],
//   declarations: [RankPage]
// })
// export class RankPageModule {}
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankPage } from './rank.page';
import { RouterModule } from '@angular/router';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: RankPage }]),
    AngularFirestoreModule, // Import Firestore if used directly in RankPage
  ],
  declarations: [RankPage],
})
export class RankPageModule {}


