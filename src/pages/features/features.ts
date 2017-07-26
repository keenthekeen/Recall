import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { QuizPage } from '../quiz/quiz';
/**
 * Generated class for the FeaturesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-features',
  templateUrl: 'features.html',
})
export class FeaturesPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeaturesPage');
  }
featurespage(){
  this.navCtrl.push(QuizPage);
}
}
