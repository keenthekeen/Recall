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
  quizes: FirebaseListObservable<any[]>;
  public user;
  public isSigned:boolean;
  constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    const subject = new Subject();
    this.user = afAuth.auth.currentUser;
    afAuth.authState.subscribe(auth => {
        if(auth) {
          console.log('logged in');
          this.isSigned = true;
          console.log('doquery');
          this.quizes = db.list('/quizzes', {
          query: {
            orderByChild: 'owner',
            equalTo: afAuth.auth.currentUser.uid,
          }
        });  

        } else {
          console.log('not logged in');
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


  logout(){
     this.afAuth.auth.signOut();
     this.isSigned = false;
  }
}
