import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {QuizPage} from '../quiz/quiz';

import {QuizModel} from '../../models/quiz';
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {FirebaseApp} from "angularfire2";

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
    public quizzes: Array<QuizModel> = [];
    public isLoaded: boolean;

    constructor(public navCtrl: NavController, public db: AngularFireDatabase, private firebaseApp: FirebaseApp) {
        QuizModel.fetch(db).subscribe(function (list: FirebaseListObservable<any[]>) {
            list.forEach(function (item) {
                this.quizzes.push(new QuizModel(item, firebaseApp));
            }.bind(this));
            this.isLoaded = true;
        }.bind(this));
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FeaturesPage');
    }

    quizPage(quiz: QuizModel) {
        this.navCtrl.push(QuizPage, {
            quiz: quiz
        });
    }

}
