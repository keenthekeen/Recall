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

import {Component} from '@angular/core';
import {UserModel} from '../../models/user';
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {QuizModel} from "../../models/quiz";
import {QuizPage} from "../quiz/quiz";
import {FirebaseApp} from "angularfire2";
import {TranslateService} from "@ngx-translate/core";


@Component({
    selector: 'page-stat',
    templateUrl: 'stat.html'
})
export class StatPage {
    public quizPlayed: Array<{
        uid: string,
        date: number,
    }>;
    public quizPlayedArray = [];
    public viewStat;

    constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, private firebaseApp: FirebaseApp, private loadingCtrl: LoadingController, private translate: TranslateService, public toastCtrl: ToastController) {
        this.viewStat = this.navParams.get('viewStat');
        console.log('viewstat', this.viewStat);
        UserModel.findOrNew(db, {
            uid: this.afAuth.auth.currentUser.uid
        }).then((userModel) => {
            this.quizPlayed = userModel.stat ? userModel.stat.quizPlayed : [];
            console.log(this.quizPlayed);
            this.quizPlayedArray = this.quizPlayed ? Object.keys(this.quizPlayed) : [];
            for (let property in this.quizPlayed) {
                if (this.quizPlayed.hasOwnProperty(property)) {
                    if (this.quizPlayedArray.indexOf(property) == -1) {
                        this.quizPlayedArray.push(property);
                    }
                }
            }
        });
    }

    public goQuiz(quiz) {
        let loader = this.loadingCtrl.create({
            content: "Loading..."
        });
        loader.present();
        this.translate.get('LOADING').subscribe((res: string) => {
            loader.setContent(res);
        });
        QuizModel.find(this.db, quiz).subscribe((quizModelSnapshot) => {
            if (quizModelSnapshot.val() != null) {
                QuizModel.newThenWaitPicture(quizModelSnapshot.val(), this.firebaseApp).then(quiz => {
                    this.navCtrl.push(QuizPage, {
                        quiz: quiz
                    }).then(() => {
                        loader.dismiss();
                    });
                });
            }
            else {
                loader.dismiss();
                this.toastCtrl.create({
                    message: 'This quiz has been deleted',
                    duration: 3000
                }).present();
            }
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad StatPage');
    }

}
