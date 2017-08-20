import {Component, ElementRef, ViewChild} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Storage} from '@ionic/storage';

import {QuizModel} from '../../models/quiz';
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFireDatabase} from "angularfire2/database";
import {Firebase} from "@ionic-native/firebase";
import {UserModel} from '../../models/user';
import {TranslateService} from "@ngx-translate/core";
import {AngularFireOfflineDatabase} from "angularfire2-offline";

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

    private screenSize = {
        width: 0,
        height: 0
    };

    private isStatSaved: boolean;

    /**
     * 'plug into' DOM canvas element using @ViewChild
     */
    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, public navParams: NavParams, public afAuth: AngularFireAuth, private db: AngularFireDatabase, public toastCtrl: ToastController, public loadingCtrl: LoadingController, private storage: Storage, public alertCtrl: AlertController, fb: Firebase, private translate: TranslateService, odb: AngularFireOfflineDatabase) {
        this.quiz = navParams.get('quiz');
        this.quiz.setOwnerPhoto(odb);
        fb.setScreenName("quiz");

        storage.get('quiz_mode').then((val) => {
            this.setQuizMode(val);
        });
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
            this.translate.get("MODE." + (mode ? "QUIZ" : "KEY")).subscribe(currentModeName => {
                this.translate.get("MODE.MESSAGE", {mode: currentModeName}).subscribe(res => {
                    this.toastCtrl.create({
                        message: res,
                        duration: 3000
                    }).present();
                });
            });
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

        // Get screen size
        // screen size may be changed, e.g. keyboard on, so save for later use

        this.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        console.log("Screen size (H*W): " + this.screenSize.height + " x " + this.screenSize.width);

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
                    this.translate.get("LABEL_ASK").subscribe(res => {
                        this.alertCtrl.create({
                            title: res.WHAT,
                            inputs: [
                                {
                                    name: 'answer',
                                    placeholder: res.ANSWER,
                                    type: "text",
                                    value: (typeof exist === "string" && exist in this.answers) ? this.answers[exist] : ""
                                },
                            ],
                            buttons: [
                                {
                                    text: res.CANCEL,
                                    handler: () => {
                                        console.log('Cancel clicked');
                                    }
                                },
                                {
                                    text: res.SUBMIT,
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
                    });
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
        bg.addEventListener("load", () => {
            // Calculate canvas size
            if (bg.height < bg.width) {
                canvas.width = (this.screenSize.width) * 0.95;
                canvas.height = bg.height * canvas.width / bg.width;
            } else {
                canvas.height = (this.screenSize.height) * 0.95;
                canvas.width = bg.width * canvas.height / bg.height;
            }
            console.log("Recreating canvas: Image size: " + bg.height + " x " + bg.width + " / Canvas size: " + canvas.height + " x " + canvas.width);
            this.vMin = QuizPage.getMinimum(canvas.height, canvas.width);
            this.pinSize = QuizPage.calculatePinSize(canvas.width, canvas.height);

            // Draw background image
            context.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // Draw coordinates
            let dotImg = new Image();
            dotImg.src = 'assets/dot.png';
            dotImg.addEventListener("load", () => {
                coordinates.forEach((pos) => {
                    context.drawImage(dotImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                });
            });

            // Draw coordinates of answered
            let ansImg = new Image();
            ansImg.src = 'assets/dot-answered.png';
            ansImg.addEventListener("load", () => {
                coordinates.filter((pos) => {
                    return pos.name in this.answers && this.answers[pos.name];
                }).forEach((pos) => {
                    context.drawImage(ansImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                });
            });

            if (Object.keys(this.answerCheck).length > 0) {
                let incImg = new Image();
                incImg.src = 'assets/dot-incorrect.png';
                incImg.addEventListener("load", () => {
                    coordinates.filter((pos) => {
                        return !this.answerCheck[pos.name];
                    }).forEach((pos) => {
                        context.drawImage(incImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                    });
                });

                let corImg = new Image();
                corImg.src = 'assets/dot-correct.png';
                corImg.addEventListener("load", () => {
                    coordinates.filter((pos) => {
                        return this.answerCheck[pos.name];
                    }).forEach((pos) => {
                        context.drawImage(corImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                    });
                });
            }
        });
    }

    public checkAnswer() {
        let AnswerCount: number = this.quiz.labels.length;
        let CorrectAnswer: number = 0;
        if (this.canCheck) {
            this.quiz.labels.forEach(function (label) {
                if (label.name in this.answers) {
                    let answer = this.answers[label.name].trim().toUpperCase();
                    this.answerCheck[label.name] = answer == label.name.trim().toUpperCase() || (label.other_name instanceof Array && label.other_name.map(function (i) {
                        return i.trim().toUpperCase();
                    }).includes(answer));
                    if (this.answerCheck[label.name] === true) {
                        CorrectAnswer++;
                    }
                } else {
                    // Not answered
                    this.answerCheck[label.name] = false;
                }
            }.bind(this));
            this.canCheck = false;
            this.isChecked = true;
        }
        this.renderCanvas(this.canvasEl.nativeElement, this.quiz.labels);
        //Perform Rate Calculation here
        let Counter = this.quiz.stat['counter'];
        let Rate = this.quiz.stat['rate'];
        let thisQuizRate = CorrectAnswer / AnswerCount * 100;
        let GlobalQuizRate = ((Rate * Counter ) + thisQuizRate ) / (Counter + 1);
        let updateQuiz = {
            stat: {
                counter: Counter + 1,
                rate: GlobalQuizRate,
            }
        };

        // Add stat to user model
        if (this.afAuth.auth.currentUser) {
            let user = UserModel.find(this.db, this.afAuth.auth.currentUser.uid);

            UserModel.findOrNew(this.db, {
                uid: this.afAuth.auth.currentUser.uid,
            }).then((userModel) => {
                if (!userModel.stat || !userModel.stat.counter) {
                    userModel.stat = {
                        quizPlayed: [],
                        counter: 0,
                        rate: 0
                    };
                }
                let pre = userModel.stat.rate * userModel.stat.counter;
                userModel.stat.counter ++;
                userModel.stat.rate = (pre + thisQuizRate) / userModel.stat.counter;
                this.db.object('users/' + userModel.uid + '/stat/').update({
                    counter: userModel.stat.counter,
                    rate: userModel.stat.rate,
                });
            });

            let key = this.quiz.$key;
            let statArray: Array<any> = [];

            let subscription = user.subscribe((x) => {
                subscription.unsubscribe();
                if (x.val() && !this.isStatSaved) {
                    if ("stat" in x.val() && "quizPlayed" in x.val().stat && key in x.val().stat.quizPlayed) {
                        statArray = x.val().stat.quizPlayed[key];

                    }
                    statArray.push({
                        date: Date.now(),
                        score: thisQuizRate,
                    });
                    this.isStatSaved = true;

                    //user.update({stat: {quizPlayed: {[key]: statArray}}});
                    console.log('user/' + this.afAuth.auth.currentUser.uid + '/stat/quizPlayed/' + key);
                    this.db.object('users/' + this.afAuth.auth.currentUser.uid + '/stat/quizPlayed/' + key).update(statArray);
                }
            });


            console.log(updateQuiz);
            this.quiz.update(this.db, updateQuiz).catch((e) => console.log(e));
        }
    }


    public deleteQuiz() {
        console.log("Deleting quiz " + this.quiz.$key);
        this.translate.get("DELETING").subscribe(res => {
            let loader = this.loadingCtrl.create({
                content: res
            });
            loader.present();
            (new QuizModel(this.quiz)).deleteMe(this.db).then(() => {
                this.translate.get("DELETED").subscribe(res => {
                    this.toastCtrl.create({
                        message: res,
                        duration: 3000
                    }).present();
                    this.navCtrl.pop();
                    loader.dismiss();
                });
            });
        });
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
