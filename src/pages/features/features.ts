import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {QuizPage} from '../quiz/quiz';

import {QuizModel} from '../../models/quiz';
import {FirebaseApp} from "angularfire2";
import {AngularFireOfflineDatabase} from "angularfire2-offline";

@Component({
    selector: 'page-features',
    templateUrl: 'features.html',
})
export class FeaturesPage {
    public quizzes: Array<QuizModel> = [];
    public isLoaded: boolean;


    constructor(public navCtrl: NavController, public db: AngularFireOfflineDatabase, private firebaseApp: FirebaseApp) {
        QuizModel.fetch(db, {
            query: {
                orderByChild: 'created_at'
            }
        }).subscribe((list) => {
            list.forEach((item) => {
                this.quizzes.push(new QuizModel(item, firebaseApp));
            });
            this.isLoaded = true;
        });
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
