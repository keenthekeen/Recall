import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

import {QuizPage} from '../quiz/quiz';

import {QuizModel} from '../../models/quiz';
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";

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
    public quizzes: FirebaseListObservable<any[]>;

    constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase) {
        this.quizzes = QuizModel.fetch(db);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FeaturesPage');
    }

    quizPage(quiz: any) {
        this.navCtrl.push(QuizPage, {
            quiz: quiz
        });

    }

}
