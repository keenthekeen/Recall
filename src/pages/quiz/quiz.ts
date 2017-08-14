import {Component, ElementRef, ViewChild} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Storage} from '@ionic/storage';

import {QuizModel} from '../../models/quiz';
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFireDatabase} from "angularfire2/database";
import {Firebase} from "@ionic-native/firebase";

/**
 * Generated class for the QuizPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-quiz',
    templateUrl: 'quiz.html',
})
export class QuizPage {
    public quiz: QuizModel;
    public isOwner: boolean;
    public isQuizMode: boolean = true;
    public modeIcon: string = "key";
    private answers: {
        [key: string]: string
    } = {};
    private pinSize: number;
    private vMin: number;
    public canCheck: boolean;
    public answerCheck: {
        [key: string]: string
    } = {};
    public isChecked: boolean;
    /**
     * 'plug into' DOM canvas element using @ViewChild
     */
    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, public navParams: NavParams, public afAuth: AngularFireAuth, private db: AngularFireDatabase, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private storage: Storage, public alertCtrl: AlertController, private fb: Firebase) {
        this.quiz = navParams.get('quiz');
        fb.setScreenName("quiz");

        storage.get('quiz_mode').then(function (val) {
            this.setQuizMode(val);
        }.bind(this));
    }

    setQuizMode(mode?: boolean) {
        let isModeChanged = mode == undefined;
        if (mode == null) {
            mode = !this.isQuizMode;
        }
        this.isQuizMode = mode;
        this.modeIcon = mode ? "key" : "help";
        this.storage.set('quiz_mode', mode);
        if (isModeChanged) {
            this.toastCtrl.create({
                message: "Switched to " + (mode ? "quiz" : "key") + " mode",
                duration: 3000
            }).present();
            this.navCtrl.pop();
            this.navCtrl.push(QuizPage, {
                quiz: this.quiz
            });
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad QuizPage', this.quiz);

        if (this.afAuth.auth.currentUser) {
            this.isOwner = this.quiz.owner == this.afAuth.auth.currentUser.uid;
        }

        // Load background image
        let canvas = this.canvasEl.nativeElement;
        const coordinates = this.quiz.labels;
        this.renderCanvas(canvas, coordinates);

        // Set up mouse events
        canvas.addEventListener("mouseup", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = this.pinSize / 2;
            let mousePos = {
                x: e.clientX - (rect.left + halfPin),
                y: e.clientY - (rect.top + halfPin)
            };
            let exist = QuizPage.isCoordinateExist(mousePos.x / canvas.width, mousePos.y / canvas.height, coordinates, this.pinSize / this.vMin);
            if (exist) {
                if (this.isQuizMode) {
                    this.alertCtrl.create({
                        title: 'What is this?',
                        inputs: [
                            {
                                name: 'answer',
                                placeholder: 'Answer',
                                type: "text",
                                value: (typeof exist === "string" && exist in this.answers) ? this.answers[exist] : ""
                            },
                        ],
                        buttons: [
                            {
                                text: 'Cancel',
                                handler: () => {
                                    console.log('Cancel clicked');
                                }
                            },
                            {
                                text: 'Submit',
                                handler: function (data) {
                                    if (typeof exist === "string" && data.answer.trim().length > 0) {
                                        this.answers[exist] = data.answer.trim();
                                        this.renderCanvas(canvas, coordinates);
                                        this.canCheck = true;
                                        this.isChecked = false;
                                        this.answerCheck = {};
                                        console.log('Answered!', this.answers);
                                    }
                                }.bind(this)
                            }
                        ]
                    }).present();
                } else {
                    this.toastCtrl.create({
                        message: exist,
                        duration: 3000,
                        position: "top"
                    }).present();
                }
            }
        }.bind(this), false);
        canvas.addEventListener("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = this.pinSize / 2;
            let mousePos = {
                x: e.clientX - (rect.left + halfPin),
                y: e.clientY - (rect.top + halfPin)
            };
            if (QuizPage.isCoordinateExist(mousePos.x / canvas.width, mousePos.y / canvas.height, coordinates, this.pinSize / this.vMin)) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "auto";
            }
        }.bind(this), false);
    }

    renderCanvas(canvas: HTMLCanvasElement, coordinates: Array<any>) {
        let context = canvas.getContext('2d');

        // Load background image
        let bg = new Image();
        bg.src = this.quiz.picture;
        bg.addEventListener("load", function () {
            // Calculate canvas size
            if (bg.height < bg.width) {
                canvas.width = (window.innerWidth) * 0.95;
                canvas.height = bg.height * canvas.width / bg.width;
            } else {
                canvas.height = (window.innerHeight) * 0.95;
                canvas.width = bg.width * canvas.height / bg.height;
            }
            console.log("Recreating canvas: Screen size: " + window.innerHeight + " x " + window.innerWidth + " / Image size: " + bg.height + " x " + bg.width + " / Canvas size: " + canvas.height + " x " + canvas.width);
            this.vMin = QuizPage.getMinimum(canvas.height, canvas.width);
            this.pinSize = QuizPage.calculatePinSize(canvas.width, canvas.height);

            // Draw background image
            context.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // Draw coordinates
            let dotImg = new Image();
            dotImg.src = 'assets/dot.png';
            dotImg.addEventListener("load", function () {
                coordinates.forEach(function (pos) {
                    context.drawImage(dotImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                }.bind(this));
            }.bind(this));

            // Draw coordinates of answered
            let ansImg = new Image();
            ansImg.src = 'assets/dot-answered.png';
            ansImg.addEventListener("load", function () {
                coordinates.filter(function (pos) {
                    return pos.name in this.answers && this.answers[pos.name];
                }.bind(this)).forEach(function (pos) {
                    context.drawImage(ansImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                }.bind(this));
            }.bind(this));

            if (Object.keys(this.answerCheck).length > 0) {
                let incImg = new Image();
                incImg.src = 'assets/dot-incorrect.png';
                incImg.addEventListener("load", function () {
                    coordinates.filter(function (pos) {
                        return !this.answerCheck[pos.name];
                    }.bind(this)).forEach(function (pos) {
                        context.drawImage(incImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                    }.bind(this));
                }.bind(this));

                let corImg = new Image();
                corImg.src = 'assets/dot-correct.png';
                corImg.addEventListener("load", function () {
                    coordinates.filter(function (pos) {
                        return this.answerCheck[pos.name];
                    }.bind(this)).forEach(function (pos) {
                        context.drawImage(corImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    }

    public checkAnswer() {
        if (this.canCheck) {
            this.quiz.labels.forEach(function (label) {
                if (label.name in this.answers) {
                    let answer = this.answers[label.name].trim().toUpperCase();
                    this.answerCheck[label.name] = answer == label.name.trim().toUpperCase() || (label.other_name instanceof Array && label.other_name.map(function (i) {
                        return i.trim().toUpperCase();
                    }).includes(answer));
                } else {
                    // Not answered
                    this.answerCheck[label.name] = false;
                }
            }.bind(this));
            this.canCheck = false;
            this.isChecked = true;
            this.renderCanvas(this.canvasEl.nativeElement, this.quiz.labels);
        }
    }

    public deleteQuiz() {
        console.log("Deleting quiz " + this.quiz.$key);
        let loader = this.loadingCtrl.create({
            content: "Deleting..."
        });
        loader.present();
        (new QuizModel(this.quiz)).deleteMe(this.db).then(function () {
            this.toastCtrl.create({
                message: 'Deleted quiz!',
                duration: 3000
            }).present();
            this.navCtrl.pop();
            loader.dismissAll();
        }.bind(this));
    }

// Return minimum value of parameter provided
    static getMinimum(a, b) {
        return (a > b) ? b : a;
    }

    static getMaximum(a, b) {
        return (a < b) ? b : a;
    }

    static calculatePinSize(width, height) {
        return QuizPage.getMaximum(QuizPage.getMinimum(height, width) / 20, 25);
    }

    /**
     * Is (x,y) already exist in coordinates array
     * @param {int} x X axis value
     * @param {int} y Y axis value
     * @param {array} previous coordinates storage
     * @param {int} threshold size of pin
     */
    static isCoordinateExist(x, y, previous, threshold): string | boolean {
        let isFound = false;
        previous.forEach(function (e) {
            if (QuizPage.coordinateDistance({x: x, y: y}, e) <= threshold * 0.5) {
                isFound = e.name;
            }
        });
        return isFound;
    }

    // Calculate distance between two coordinates
    static coordinateDistance(a, b) {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }

}
