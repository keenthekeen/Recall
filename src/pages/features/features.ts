import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { QuizPage } from '../quiz/quiz';
import { AddquizPage } from  '../addquiz/addquiz';

import { QuizModel } from '../../models/quiz';

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
  public quiznames: any;
  Quizs=[
    new QuizModel("Bird", 'Bird', "Bird Quiz Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies"),
    new QuizModel("Fish", 'Peacock', "Peacok Quiz Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies"),
    new QuizModel("Fuck", 'Sunflower', "Sunflower Quiz Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies"),
    ];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeaturesPage');
  }
featurespage(quiz: any){
  this.navCtrl.push(QuizPage, {
    quiz: quiz,
  });

}
addquiz(){
  this.navCtrl.push(AddquizPage);
}

}
