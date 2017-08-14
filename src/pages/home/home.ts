import {Component} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, NavController, Platform} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';

import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {AddquizPage} from "../addquiz/addquiz";
import {UserModel} from "../../models/user";
import {FirebaseApp} from "angularfire2";
import {QuizModel} from "../../models/quiz";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public quizzes: Array<QuizModel>;
    public user: UserModel|null;
    public isLoaded: boolean;

    constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public db: AngularFireDatabase, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public platform: Platform, public actionSheetCtrl: ActionSheetController, private firebaseApp: FirebaseApp) {

        this.afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        this.afAuth.auth.onAuthStateChanged(function (user) {
            console.log("Auth state changed.");
            if (user) {
                this.user = new UserModel(user);
                this.user.save(db);
            } else {
                this.user = null;
            }
            this.fetchQuiz();
        }.bind(this));

        this.getSigninResult();
    }

    private fetchQuiz() {
        console.log("Fetching quiz...");
        if (this.user) {
            this.db.list('/quizzes', {
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
        }.bind(this)).catch(function (error) {
            // Handle Errors here.
            this.alertCtrl.create({
                title: 'Error occurred while signing in!',
                subTitle: error.code + ': ' + error.message,
                buttons: ['OK']
            }).present();
        }.bind(this));
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
        }).catch(function (error) {
            // An error happened.
            loader.dismiss();
            this.alertCtrl.create({
                title: 'Error Occurred!',
                subTitle: 'Sign out failure',
                buttons: ['OK']
            }).present();
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
}
