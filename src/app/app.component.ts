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

import {Component} from '@angular/core';
import {AlertController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Storage} from '@ionic/storage';
import {MasterPage} from '../pages/master/master';
import {AngularFireAuth} from "angularfire2/auth";
import * as firebase from 'firebase/app';
import {TranslateService} from "@ngx-translate/core";
import {TutorialPage} from '../pages/tutorial/tutorial';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = MasterPage;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afAuth: AngularFireAuth, translate: TranslateService, alertCtrl: AlertController, storage: Storage,) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            statusBar.backgroundColorByHexString("#488AFF");
            splashScreen.hide();

            // Firebase Authentication Setup (Angularfire2)
            afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

            // Translation service setup
            // Get stored language name
            storage.get('language').then((val) => {
                if (val) {
                    translate.use(val);
                    this.rootPage = MasterPage;
                } else {
                    // No language setting saved, show dialog
                    MyApp.showLanguageSelect(alertCtrl).then((lang) => {
                        storage.set('language', lang);
                        translate.use(lang);
                    }).catch(() => {
                        // User refuse to select language, guess language from browser
                        let browserLang = translate.getBrowserLang();
                        let availableLang: Array<string> = ["en", "th", "kr"];
                        if (browserLang && availableLang.indexOf(browserLang) > -1) {
                            translate.setDefaultLang(browserLang);
                        } else {
                            translate.setDefaultLang('en');
                        }
                    });
                    this.rootPage = TutorialPage;
                }
            });
        });

    }

    static showLanguageSelect(alertCtrl: AlertController): Promise<string> {
        return new Promise((resolve, reject) => {
            let alert = alertCtrl.create().setTitle('Select your preferred langauge');

            alert.addInput({
                type: 'radio',
                label: 'English',
                value: 'en',
                checked: true
            });
            alert.addInput({
                type: 'radio',
                label: 'Thai',
                value: 'th'
            });
            alert.addInput({
                type: 'radio',
                label: 'Korean',
                value: 'kr'
            });

            alert.addButton({
                text: 'OK',
                handler: data => {
                    resolve(data);
                }
            });
            alert.present();

            alert.onDidDismiss(() => {
                reject();
            })
        });
    }
}

