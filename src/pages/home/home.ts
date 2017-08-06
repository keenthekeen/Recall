import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';

import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public quizzes: FirebaseListObservable<any[]>;
    public user: firebase.User;

    constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public db: AngularFireDatabase, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {

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
}
