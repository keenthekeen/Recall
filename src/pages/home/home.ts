import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FeaturesPage } from '../features/features';
import {QuizModel} from '../../models/quiz';
import {QuizPage} from '../quiz/quiz';

import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import {Subject} from 'rxjs/Subject';

import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: Observable<firebase.User>;
  quizes: FirebaseListObservable<any[]>;
  public userauth;
  constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    const subject = new Subject();
  	this.user = afAuth.authState;
    this.userauth =afAuth.auth.currentUser.uid;

    this.quizes = db.list('/quizzes', {
      query: {
        orderByChild: 'owner',
        equalTo: this.userauth,
      }
    });





  }
	featurespage(quiz :any){
		this.navCtrl.push(QuizPage, {
            quiz: quiz,
        });
	}

login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
}
