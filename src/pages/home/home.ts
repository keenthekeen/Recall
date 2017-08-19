import {Component} from '@angular/core';
import {ActionSheetController, LoadingController, NavController, Platform} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';

import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {AddquizPage} from "../addquiz/addquiz";
import {UserModel} from "../../models/user";
import {FirebaseApp} from "angularfire2";
import {QuizModel} from "../../models/quiz";
import {Firebase} from "@ionic-native/firebase";
import {Helper} from "../../app/helper";
import {AngularFireDatabase} from "angularfire2/database";
import {StatPage} from '../stat/stat';
import {AngularFireOfflineDatabase} from "angularfire2-offline";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public quizzes: Array<QuizModel>;
    public user: UserModel | null;
    public isLoaded: boolean;

    constructor(public navCtrl: NavController, private afAuth: AngularFireAuth, private offlineDb: AngularFireOfflineDatabase, db: AngularFireDatabase, private loadingCtrl: LoadingController, private platform: Platform, private actionSheetCtrl: ActionSheetController, private firebaseApp: FirebaseApp, fb: Firebase, private helper: Helper) {

        this.afAuth.auth.onAuthStateChanged((userData) => {
            console.log("Auth state changed.");
            if (userData) {
                let user;
                UserModel.findOrNew(db, userData).then((userModel) => {
                    user = this.user = userModel;
                    user.save(db);
                if (platform.is("android")) {
                    console.log("Platform is android.");
                    fb.setUserId(user.uid);
                    fb.hasPermission().then((data) => {
                        console.log("Permission to notify", data);
                        if (data.isEnabled) {
                            fb.getToken()
                                .then(token => user.setDeviceToken(token).save(db)) // save the token server-side and use it to push notifications to this device
                                .catch(error => this.helper.error("Error while getting device token."));
                            fb.onTokenRefresh()
                                .subscribe((token: string) => this.user.setDeviceToken(token).save(db));
                        }
                    });
                }
                this.getSigninResult();
                this.fetchQuiz();
                // (Native) Firebase setup
                });
            } else {
                this.user = null;
                this.getSigninResult();
                this.fetchQuiz();
            }

        });

    }

    signIn() {
        this.offlineDb.reset(); // Reset offline database cache
        this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider()).then(() => {
            this.getSigninResult();
        });
    }

    signOut() {
        let loader = this.loadingCtrl.create({
            content: "Signing out..."
        });
        loader.present();
        this.offlineDb.reset(); // Reset offline database cache
        this.afAuth.auth.signOut().then(() => {
            // Sign-out successful.
            console.log("Signed out!");
            loader.dismiss();
            //window.location.reload(true);
        }).catch(() => {
            // An error happened.
            loader.dismiss();
            this.helper.error("Error while signing out.");
        });
    }

    quizPage(quiz: any) {
        this.navCtrl.push(QuizPage, {
            quiz: quiz,
        });
    }

    addQuiz() {
        this.navCtrl.push(AddquizPage);
    }

    userAction() {
        this.actionSheetCtrl.create({
            title: this.user.displayName + " (" + this.user.email + ")",
            buttons: [
                {
                    text: 'Sign out',
                    role: 'destructive',
                    icon: !this.platform.is('ios') ? 'log-out' : null,
                    handler: () => {
                        this.signOut();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel', // will always sort to be on the bottom
                    icon: !this.platform.is('ios') ? 'close' : null,
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        }).present();
    }

    private fetchQuiz() {
        console.log("Fetching quiz...");
        if (this.user) {
            QuizModel.fetch(this.offlineDb, {
                query: {
                    orderByChild: 'owner',
                    equalTo: this.user.uid
                }
            }).subscribe((list) => {
                this.quizzes = [];
                list.forEach((item) => {
                    this.quizzes.push(new QuizModel(item, this.firebaseApp));
                });
                this.isLoaded = true;
            });
        }
    }

    private getSigninResult() {
        this.afAuth.auth.getRedirectResult().then((result) => {
            // This gives you a Google Access Token, you can use it to access the Google API.
            console.log("Signin result", result);
        }).catch(() => {
            // Handle Errors here.
            this.helper.error("Error while signing in.");
        });
    }

    gostat() {
        this.navCtrl.push(StatPage);
    }
}
