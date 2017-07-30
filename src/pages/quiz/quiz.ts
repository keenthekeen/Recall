import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { QuizModel } from '../../models/quiz';
/**
 * Generated class for the QuizPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html',
})
export class QuizPage {
  public quiz: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
     this.quiz = this.navParams.get('quiz');
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
  }

}
