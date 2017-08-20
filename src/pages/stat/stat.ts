import {Component} from '@angular/core';
import * as Chart from 'chart.js/dist/Chart';
import {UserModel} from '../../models/user';
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {KeytransformPipe} from '../../pipes/keytransform/keytransform'

@Component({
    selector: 'page-stat',
    templateUrl: 'stat.html',
})
export class StatPage {
    private screenSize = {
        width: 0,
        height: 0
    };
    public quizPlayed: Array<{
        uid: string,
        date: number,
    }>;
    public quizPlayedArray = [];

    constructor(db: AngularFireDatabase, public afAuth: AngularFireAuth) {
        UserModel.findOrNew(db, {
            uid: this.afAuth.auth.currentUser.uid,
        }).then((userModel) => {
            this.quizPlayed = userModel.stat ? userModel.stat.quizPlayed: [];
            console.log(this.quizPlayed);
            this.quizPlayedArray = Object.keys(this.quizPlayed);
            for (let property in this.quizPlayed) {
                if (this.quizPlayed.hasOwnProperty(property)) {
                    if(this.quizPlayedArray.indexOf(property) == -1 ) {
                        this.quizPlayedArray.push(property);
                    }
                }
            }
        });
    }
    public goQuiz(){
        this.
    }
    ionViewDidLoad() {
        this.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        console.log('ionViewDidLoad StatPage');
        let canvas = <HTMLCanvasElement>document.getElementById('StatChart');
        canvas.width = this.screenSize.width * 0.95;
        canvas.height = this.screenSize.height * 0.5;

        let chartCanvas = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            }
        );
    }

}
