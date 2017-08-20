import {Component} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, NavController, Platform} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';
import {Storage} from '@ionic/storage';

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
import {TranslateService} from "@ngx-translate/core";
import {MyApp} from "../../app/app.component";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public quizzes: Array<QuizModel> = [];
    public user: UserModel | null;
    public isLoaded: boolean;
    public viewStat: object;

    constructor(public navCtrl: NavController, private afAuth: AngularFireAuth, private offlineDb: AngularFireOfflineDatabase, public db: AngularFireDatabase, private loadingCtrl: LoadingController, private platform: Platform, private actionSheetCtrl: ActionSheetController, private firebaseApp: FirebaseApp, fb: Firebase, private helper: Helper, private translate: TranslateService, private alertCtrl: AlertController, private storage: Storage) {

        console.log("User at construct", afAuth.auth.currentUser);

        afAuth.auth.onAuthStateChanged((userData) => {
            console.log("Auth state changed.", userData);
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
                    text: this.translate.instant('CHANGE_LANGUAGE'),
                    icon: !this.platform.is('ios') ? 'globe' : null,
                    handler: () => {
                        MyApp.showLanguageSelect(this.alertCtrl).then((lang) => {
                            this.storage.set('language', lang);
                            this.translate.use(lang);
                        });
                    }
                },
                {
                    text: this.translate.instant('SIGN_OUT'),
                    role: 'destructive',
                    icon: !this.platform.is('ios') ? 'log-out' : null,
                    handler: () => {
                        this.signOut();
                    }
                },
                {
                    text: this.translate.instant('CANCEL'),
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
                if (list.length != this.quizzes.length) {
                    this.quizzes = [];
                    list.forEach((item) => {
                        let quiz = new QuizModel(item, this.firebaseApp);
                        quiz.setOwnerName(this.offlineDb);
                        this.quizzes.push(quiz);
                    });
                }
                this.isLoaded = true;
            });
        } else {
            this.isLoaded = true;
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

    goStat() {
        this.navCtrl.push(StatPage, {viewStat: this.viewStat});
    }

    ionViewDidEnter() {
        if (this.afAuth.auth.currentUser) {
            UserModel.findOrNew(this.db, {
                uid: this.afAuth.auth.currentUser.uid,
            }).then((model) => {
                this.user = model;
                if (model.stat) {
                    this.viewStat = this.user.stat;
                    this.user.stat.rate = Math.round(this.user.stat.rate);
                    console.log("viewstat", this.viewStat);
                } else {
                    this.viewStat = {
                        quizPlayed: [],
                        counter: 0,
                        rate: 0
                    };
                }
            });
        }

    }
}
