import {Component} from '@angular/core';
import {ActionSheetController, LoadingController, NavController, Platform} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';

import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {AddquizPage} from "../addquiz/addquiz";
import {UserModel} from "../../models/user";
import {FirebaseApp} from "angularfire2";
import {QuizModel} from "../../models/quiz";
import {Firebase} from "@ionic-native/firebase";
import {Helper} from "../../app/helper";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public quizzes: Array<QuizModel>;
    public user: UserModel | null;
    public isLoaded: boolean;

    constructor(public navCtrl: NavController, private afAuth: AngularFireAuth, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private platform: Platform, private actionSheetCtrl: ActionSheetController, private firebaseApp: FirebaseApp, private fb: Firebase, private helper: Helper) {

        this.afAuth.auth.onAuthStateChanged(function (userData) {
            console.log("Auth state changed.");
            if (userData) {
                let user = this.user = new UserModel(userData);
                user.save(db);
                // (Native) Firebase setup
                if (platform.is("android")) {
                    console.log("Platform is android.");
                    fb.setUserId(user.uid);
                    fb.hasPermission().then(function (data) {
                        console.log("Permission to notify", data);
                        if (data.isEnabled) {
                            fb.getToken()
                                .then(token => user.setDeviceToken(token).save(db)) // save the token server-side and use it to push notifications to this device
                                .catch(error => this.helper.error("Error while getting device token."));
                            fb.onTokenRefresh()
                                .subscribe((token: string) => user.setDeviceToken(token).save(db));
                        }
                    }.bind(this));
                }
            } else {
                this.user = null;
            }
            this.fetchQuiz();
        }.bind(this));

        this.getSigninResult();
    }

    signIn() {
        this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider()).then(function () {
            this.getSigninResult();
        }.bind(this));
    }

    signOut() {
        let loader = this.loadingCtrl.create({
            content: "Signing out..."
        });
        loader.present();
        this.afAuth.auth.signOut().then(function () {
            // Sign-out successful.
            console.log("Signed out!");
            loader.dismiss();
            //window.location.reload(true);
        }).catch(function () {
            // An error happened.
            loader.dismiss();
            this.helper.error("Error while signing out.");
        }.bind(this));
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
                    handler: function () {
                        this.signOut();
                    }.bind(this)
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
            QuizModel.fetch(this.db, {
                query: {
                    orderByChild: 'owner',
                    equalTo: this.user.uid
                }
            }).subscribe(function (list: FirebaseListObservable<any[]>) {
                this.quizzes = [];
                list.forEach(function (item) {
                    this.quizzes.push(new QuizModel(item, this.firebaseApp));
                }.bind(this));
                this.isLoaded = true;
            }.bind(this));
        }
    }

    private getSigninResult() {
        this.afAuth.auth.getRedirectResult().then(function (result) {
            // This gives you a Google Access Token, you can use it to access the Google API.
            console.log("Signin result", result);
        }.bind(this)).catch(function () {
            // Handle Errors here.
            this.helper.error("Error while signing in.");
        }.bind(this));
    }
}
