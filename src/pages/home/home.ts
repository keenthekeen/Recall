import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {QuizPage} from '../quiz/quiz';

import {Observable} from 'rxjs/Observable';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    quizzes: FirebaseListObservable<any[]>;
    user: Observable<firebase.User>;

    constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
        // const subject = new Subject();
        this.user = afAuth.authState;
        if (this.user) {
            let userId = afAuth.auth.currentUser.uid;
            //let userId = "TODO";

            this.quizzes = db.list('/quizzes', {
                query: {
                    orderByChild: 'owner',
                    equalTo: userId
                }
            });
        }
    }

    login() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    logout() {
        this.afAuth.auth.signOut();
    }

    quizPage(quiz: any) {
        this.navCtrl.push(QuizPage, {
            quiz: quiz,
        });
    }
}
