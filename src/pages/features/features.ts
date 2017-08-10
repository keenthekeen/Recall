import {Component,ViewChild,ElementRef} from '@angular/core';
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

    @ViewChild('imagex') img: ElementRef;

    constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, templateElement: ElementRef) {
        this.quizzes = QuizModel.fetch(db);
        //let img = templateElement.getElementById('imagex') as HTMLImageElement;
        console.log(this.img)
        //img.src ='https://www.thewrap.com/wp-content/uploads/2015/11/Donald-Trump.jpg';

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FeaturesPage');
        console.log('img', this.img);
        this.img.nativeElement.src = 'https://www.thewrap.com/wp-content/uploads/2015/11/Donald-Trump.jpg';

    }

    quizPage(quiz: any) {
        this.navCtrl.push(QuizPage, {
            quiz: quiz
        });

    }
    loadImg(){
        let _img = <HTMLImageElement>document.getElementById('imagex');
        _img = document.createElement('img');
        let newImg = new Image;
        newImg.src = 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi';
        newImg.onload = function() {
            _img.src = newImg.src;
        }

    }

}
