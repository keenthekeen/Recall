import {Component} from '@angular/core';
import {UserModel} from '../../models/user';
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {LoadingController, NavController, NavParams} from 'ionic-angular';
import {QuizModel} from "../../models/quiz";
import {QuizPage} from "../quiz/quiz";
import {FirebaseApp} from "angularfire2";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'page-stat',
    templateUrl: 'stat.html',
})
export class StatPage {
    public quizPlayed: Array<{
        uid: string,
        date: number,
    }>;
    public quizPlayedArray = [];
    public viewStat;

    constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, private firebaseApp: FirebaseApp, private loadingCtrl: LoadingController, private translate: TranslateService) {
        this.viewStat = this.navParams.get('viewStat');
        console.log('viewstat', this.viewStat);
        UserModel.findOrNew(db, {
            uid: this.afAuth.auth.currentUser.uid,
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
            QuizModel.newThenWaitPicture(quizModelSnapshot.val(), this.firebaseApp).then(quiz => {
                this.navCtrl.push(QuizPage, {
                    quiz: quiz
                }).then(() => {
                    loader.dismiss();
                });
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad StatPage');
    }

}
