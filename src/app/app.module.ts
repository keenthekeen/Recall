import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
//import { ImagePicker } from '@ionic-native/image-picker';
import { Camera } from '@ionic-native/camera';

import { FeaturesPage } from '../pages/features/features';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { MasterPage } from '../pages/master/master';
import { QuizPage } from '../pages/quiz/quiz';
import { AddquizPage } from  '../pages/addquiz/addquiz';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    FeaturesPage,
    MasterPage,
    QuizPage,
    AddquizPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    FeaturesPage,
    MasterPage,
    QuizPage,
    AddquizPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
   // ImagePicker,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
