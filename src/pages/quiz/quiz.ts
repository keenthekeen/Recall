import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
     //this.navParams.get('data');
 
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizPage');
  }

}
