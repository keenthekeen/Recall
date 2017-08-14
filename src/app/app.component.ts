import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {MasterPage} from '../pages/master/master';
import {Firebase} from "@ionic-native/firebase";
import {AngularFireAuth} from "angularfire2/auth";
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from "angularfire2/database";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = MasterPage;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private afAuth: AngularFireAuth, db: AngularFireDatabase) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();

            // Firebase Authentication Setup (Angularfire2)
            afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        });

    }
}

