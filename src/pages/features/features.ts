/*
    Recall, an application that allow user to play a diagram quiz and create his own one, which is accessible by other users.
    Copyright (C) 2017 Siwat Techavoranant and Sarat Limawongpranee

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, ViewChild} from '@angular/core';
import {Content, InfiniteScroll, NavController} from 'ionic-angular';

import {QuizPage} from '../quiz/quiz';

import {QuizModel} from '../../models/quiz';
import {FirebaseApp} from "angularfire2";
import {AngularFireOfflineDatabase} from "angularfire2-offline";

@Component({
    selector: 'page-features',
    templateUrl: 'features.html'
})
export class FeaturesPage {
    public quizzes: Array<QuizModel> = [];
    public isLoaded: boolean;
    private limit: number = 5;

    @ViewChild(Content) contentRef: Content;

    constructor(public navCtrl: NavController, public db: AngularFireOfflineDatabase, private firebaseApp: FirebaseApp) {
        this.fetchQuizzes();
    }

    private fetchQuizzes() {
        return new Promise((resolve) => {
            QuizModel.fetch(this.db, {
                query: {
                    orderByChild: 'created_at',
                    limitToFirst: this.limit
                }
            }).subscribe((list) => {
                console.log("Featured Page: Quizzes list update (length=" + list.length + ")");
                if (list.length != this.quizzes.length) {
                    this.quizzes = [];
                    list.forEach((item) => {
                        let quiz = new QuizModel(item, this.firebaseApp);
                        quiz.setOwnerName(this.db);
                        this.quizzes.push(quiz);
                    });
                }
                this.isLoaded = true;
                resolve();
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FeaturesPage');
    }

    /**
     * When user triggered infinite scroll
     * Fetch quiz list again with increased limit
     *
     * @param infiniteScroll InfiniteScroll
     */
    doInfinite(infiniteScroll: InfiniteScroll) {
        if (this.limit <= 100 && this.quizzes.length >= this.limit) {
            this.limit += 5;
            console.log("Infinite scroll triggered (limit increased to " + this.limit + ")");
            this.fetchQuizzes().then(() => {
                infiniteScroll.complete();
            });
        } else {
            console.log("End of scroll (limited at " + this.limit + ")");
            infiniteScroll.complete();
            infiniteScroll.enable(false);
        }
    }

    quizPage(quiz: QuizModel) {
        this.navCtrl.push(QuizPage, {
            quiz: quiz
        });
    }
}
