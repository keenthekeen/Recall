/*
    Recall, an application that allow user to play a diagram quiz and create his own one, which is accessible by other users.
    Copyright (C) 2017 Siwat Techavoranant and Sarat Limawongpranee

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {Camera} from '@ionic-native/camera';

import {FeaturesPage} from '../pages/features/features';
import {TutorialPage} from '../pages/tutorial/tutorial';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {MasterPage} from '../pages/master/master';
import {QuizPage} from '../pages/quiz/quiz';
import {AddquizPage} from '../pages/addquiz/addquiz';
import {StatPage} from '../pages/stat/stat';
import {AddquizModalPage} from "../pages/addquiz-modal/addquiz-modal";
import {AngularFireModule} from "angularfire2";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireAuthModule} from "angularfire2/auth";
import {CameraMock, Helper} from './helper';
import {IonicStorageModule} from "@ionic/storage";
import {Firebase} from "@ionic-native/firebase";
import {ScreenOrientation} from '@ionic-native/screen-orientation';
import {AngularFireOfflineModule} from "angularfire2-offline";
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {KeytransformPipe} from '../pipes/keytransform/keytransform';

export const firebaseConfig = {
    apiKey: "AIzaSyDfUf1_8WfdaxNY5SJkA8SxMqPY-c1iNZs",
    authDomain: "recall-6c78e.firebaseapp.com",
    databaseURL: "https://recall-6c78e.firebaseio.com",
    projectId: "recall-6c78e",
    storageBucket: "recall-6c78e.appspot.com",
    messagingSenderId: "642647451373"
};

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        FeaturesPage,
        MasterPage,
        AddquizPage,
        QuizPage,
        AddquizModalPage,
        StatPage,
        KeytransformPipe,
        TutorialPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireOfflineModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        TutorialPage,
        FeaturesPage,
        MasterPage,
        QuizPage,
        AddquizPage,
        AddquizModalPage,
        StatPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: Camera, useClass: CameraMock},
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        Firebase,
        Helper,
        ScreenOrientation
    ]
})
export class AppModule {
}
