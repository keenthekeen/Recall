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
    public img_id = [];
    public loaded:boolean;
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
    isLoad(id){
        let image = <HTMLImageElement>document.getElementById(id);
        if(image != null) {
            image.onload = ()=>{this.loaded = true;};
        }

    }

    Count(quiz: any){
        if ( this.img_id.indexOf(quiz.$key) == -1 ) {
            this.img_id.push(quiz.$key);
            console.log(this.img_id);
            this.isLoad(this.img_id);

        }
    }

}
