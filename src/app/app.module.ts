import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {Camera} from '@ionic-native/camera';

import {FeaturesPage} from '../pages/features/features';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {MasterPage} from '../pages/master/master';
import {QuizPage} from '../pages/quiz/quiz';
import {AddquizPage} from '../pages/addquiz/addquiz';
import {AngularFireModule} from "angularfire2";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireAuthModule} from "angularfire2/auth";
import {CameraMock} from './devmode';


export const firebaseConfig = {
    apiKey: "AIzaSyDfUf1_8WfdaxNY5SJkA8SxMqPY-c1iNZs",
    authDomain: "recall-6c78e.firebaseapp.com",
    databaseURL: "https://recall-6c78e.firebaseio.com",
    projectId: "recall-6c78e",
    storageBucket: "recall-6c78e.appspot.com",
    messagingSenderId: "642647451373"
};

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        FeaturesPage,
        MasterPage,
        AddquizPage,
        QuizPage,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        FeaturesPage,
        MasterPage,
        QuizPage,
        AddquizPage,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: Camera, useClass: CameraMock},
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
