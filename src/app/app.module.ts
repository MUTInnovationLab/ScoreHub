

// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';
// // import { NgChartsModule } from 'ng2-charts';  // Import NgChartsModule
// // import { RankPage } from './rank/rank.page';

// import { AngularFireAuthModule } from '@angular/fire/compat/auth';

// import { RouteReuseStrategy } from '@angular/router';
// import { environment } from 'src/environments/environment';
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
// import { AngularFireModule } from '@angular/fire/compat';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     IonicModule.forRoot(),
//     AppRoutingModule,
//     AngularFireModule.initializeApp(environment.firebase),
//     AngularFireAuthModule,
//     AngularFirestoreModule,
//     // NgChartsModule,  // Add NgChartsModule here
//   ],
//   providers: [
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireAuthModule } from '@angular/fire/compat/auth';
// import { MarkingService } from '../services/marking.service';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    
    
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize Firebase
    AngularFirestoreModule, // Import AngularFirestoreModule here
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

