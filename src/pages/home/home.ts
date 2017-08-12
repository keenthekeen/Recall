import {Component} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, NavController, Platform} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';

import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {AddquizPage} from "../addquiz/addquiz";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public quizzes: FirebaseListObservable<any[]>;
    public user: firebase.User;
    public isLoaded: boolean;

    constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public db: AngularFireDatabase, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public platform: Platform, public actionSheetCtrl: ActionSheetController) {

        this.afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        this.afAuth.auth.getRedirectResult().then(function (result) {
            // This gives you a Google Access Token, you can use it to access the Google API.
            this.user = result.user;
        }.bind(this)).catch(function (error) {
            // Handle Errors here.
            this.alertCtrl.create({
                title: 'Error occurred while signing in!',
                subTitle: error.code + ': ' + error.message,
                buttons: ['OK']
            }).present();
        }.bind(this));

        this.afAuth.auth.onAuthStateChanged(function (user) {
            this.user = user;
            this.fetchQuiz();
        }.bind(this));

        this.fetchQuiz();
    }

    private fetchQuiz() {
        if (this.user) {
            console.log('User is signed in.', this.user);
            this.quizzes = this.db.list('/quizzes', {
                query: {
                    orderByChild: 'owner',
                    equalTo: this.user.uid
                }
            });
            this.quizzes.subscribe(function () {
                this.isLoaded = true;
            }.bind(this));
        } else {
            console.log("No user is signed in.");
        }
    }

    signIn() {
        this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider()).then(function () {
            this.afAuth.auth.getRedirectResult().then(function (result) {
                // This gives you a Google Access Token, you can use it to access the Google API.
                this.user = result.user;
            }.bind(this)).catch(function (error) {
                // Handle Errors here.
                this.alertCtrl.create({
                    title: 'Error occurred while signing in!',
                    subTitle: error.code + ': ' + error.message,
                    buttons: ['OK']
                }).present();
            }.bind(this));
        }.bind(this));
    }

    signOut() {
        let loader = this.loadingCtrl.create({
            content: "Signing out...",
            duration: 3000
        });
        loader.present();
        this.afAuth.auth.signOut().then(function () {
            // Sign-out successful.
            loader.dismiss();
            //window.location.reload(true);
        }).catch(function (error) {
            // An error happened.
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
            title: this.user.displayName,
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
