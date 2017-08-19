import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {MasterPage} from '../pages/master/master';
import {AngularFireAuth} from "angularfire2/auth";
import * as firebase from 'firebase/app';
import {TranslateService} from "@ngx-translate/core";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = MasterPage;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afAuth: AngularFireAuth, translate: TranslateService) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();

            // Firebase Authentication Setup (Angularfire2)
            afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

            // Translation service setup
            let browserLang = translate.getBrowserLang();
            let availableLang: Array<string> = ["en", "th"];
            if (browserLang && availableLang.indexOf(browserLang) > -1) {
                translate.setDefaultLang(browserLang);
            } else {
                translate.setDefaultLang('en');
            }
            console.log("Browser lang: " + browserLang);
        });

    }
}

