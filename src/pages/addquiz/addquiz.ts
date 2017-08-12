import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActionSheetController, LoadingController, NavController, Platform, ToastController} from 'ionic-angular';
import {Camera} from '@ionic-native/camera';
import {QuizPage} from "../quiz/quiz";
import {QuizModel} from '../../models/quiz';

import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";

/**
 * Generated class for the AddquizPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-addquiz',
    templateUrl: 'addquiz.html',
})

export class AddquizPage {

    public isUp: boolean = false;
    public errorText: string;

    public coordinates: Array<any> = [];
    private picture: string;
    private pinSize: number;
    private vMin: number;

    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, private Camera: Camera, private db: AngularFireDatabase, public loadingCtrl: LoadingController, public afAuth: AngularFireAuth, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController, public platform: Platform) {

    }

    submit(name: string, caption: string) {
        if (name.length < 3 || name.length > 100) {
            this.errorText = "Name must be 3-100 characters long.";
            return false;
        } else if (this.picture.length == 0) {
            this.errorText = "Please select picture.";
            return false;
        } else if (this.picture.length > 2000000) {
            this.errorText = "The selected picture is too big.";
            return false;
        } else if (this.coordinates.length == 0) {
            this.errorText = "Please label the picture.";
            return false;
        }

        let userId = this.afAuth.auth.currentUser.uid;

        let loader = this.loadingCtrl.create({
            content: "Saving..."
        });
        loader.present();

        let quiz = new QuizModel({
            name: name,
            caption: caption,
            picture: this.picture,
            owner: userId,
            labels: this.coordinates
        });
        console.log(quiz);
        quiz.save(this.db).then(function () {
            loader.dismiss();
            this.navCtrl.pop();
        }.bind(this));
    }

    getPicture() {
        console.log('AddQuiz page: getting photo');
        let cameraOptions = {
            sourceType: 0, // Photo Library
            destinationType: 0, // Data URL
            quality: 90,
            targetWidth: 1000,
            targetHeight: 1000,
            encodingType: this.Camera.EncodingType.JPEG,
            correctOrientation: true,
        };
        this.isUp = true;
        this.Camera.getPicture(cameraOptions)
            .then(file_uri => this.initializeCanvas(file_uri),
                err => console.log(err));

    }

    initializeCanvas(uri) {
        if (!(uri.startsWith('http') || uri.startsWith('data:'))) {
            uri = "data:image/jpeg;base64," + uri;
        }
        this.picture = uri;

        let canvas = this.canvasEl.nativeElement;
        this.renderCanvas(canvas);

        // Set up mouse events
        canvas.addEventListener("mouseup", function (e) {
            console.log("Mouse clicked.");
            let rect = canvas.getBoundingClientRect();
            let halfPin = this.pinSize / 2;
            let mousePos = {
                name: "",
                other_name: [],
                x: (e.clientX - (rect.left + halfPin)) / canvas.width,
                y: (e.clientY - (rect.top + halfPin)) / canvas.height
            };
            let existName = QuizPage.isCoordinateExist(mousePos.x, mousePos.y, this.coordinates, this.pinSize / this.vMin);
            if (existName) {
                console.log("AddQuiz page: clicked " + existName);
                let exist = this.coordinates.filter(function (element) {
                    return element.name == existName;
                })[0];
                this.actionSheetCtrl.create({
                    title: (exist.other_name.length <= 0) ? existName : (existName + " (" + exist.other_name.join(", ") + ")"),
                    buttons: [
                        {
                            text: 'Delete',
                            role: 'destructive',
                            icon: !this.platform.is('ios') ? 'trash' : null,
                            handler: function () {
                                this.coordinates = this.coordinates.filter(function (element) {
                                    return element.name != existName;
                                });
                                this.renderCanvas(canvas);
                                this.toastCtrl.create({
                                    message: 'Deleted ' + existName + '!',
                                    duration: 3000
                                }).present();
                            }.bind(this)
                        }, {
                            text: 'Cancel',
                            role: 'cancel', // will always sort to be on the bottom
                            icon: !this.platform.is('ios') ? 'close' : null,
                            handler: () => {
                                console.log('Cancel clicked');
                            }
                        }
                    ]
                }).present();
            } else {
                // @TODO: Use ionic's modal instead
                let name: string = prompt("Name?");
                if (name) {
                    if (this.coordinates.map(function (e) {
                            // Ignore case
                            e.name = e.name.toUpperCase();
                            return e;
                        }).find(x => x.name == name.toUpperCase())) {
                        alert("Name conflict!");
                    } else {
                        let otherName: string = prompt("Other names, separated by comma?");
                        mousePos.name = name;
                        mousePos.other_name = otherName ? otherName.split(",").map(function (item) {
                            return item.trim();
                        }).filter(function (item) {
                            return item != "";
                        }) : [];
                        this.coordinates.push(mousePos);
                        this.renderCanvas(canvas);
                        console.log("AddQuiz page: Added label", mousePos);
                    }
                }
            }
        }.bind(this), false);
        canvas.addEventListener("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = this.pinSize / 2;
            let mousePos = {
                x: (e.clientX - (rect.left + halfPin)) / canvas.width,
                y: (e.clientY - (rect.top + halfPin)) / canvas.height
            };
            if (QuizPage.isCoordinateExist(mousePos.x, mousePos.y, this.coordinates, this.pinSize / this.vMin)) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "auto";
            }
        }.bind(this), false);
    }

    renderCanvas(canvas: HTMLCanvasElement) {
        console.log('AddQuiz page: recreating canvas');

        let context = canvas.getContext('2d');

        // Load background image
        let bg = new Image();
        bg.src = this.picture;
        bg.addEventListener("load", function () {
            // Calculate canvas size
            if (bg.height < bg.width) {
                canvas.width = (window.innerWidth) * 0.90;
                canvas.height = bg.height * canvas.width / bg.width;
            } else {
                canvas.height = (window.innerHeight) * 0.90;
                canvas.width = bg.width * canvas.height / bg.height;
            }
            console.log("Screen size: " + window.innerHeight + " x " + window.innerWidth + " / Image size: " + bg.height + " x " + bg.width + " / Canvas size: " + canvas.height + " x " + canvas.width);
            this.vMin = QuizPage.getMinimum(canvas.height, canvas.width);
            this.pinSize = QuizPage.getMinimum(canvas.height, canvas.width) / 20;

            // Draw background image
            context.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // Draw coordinates
            let dotImg = new Image();
            dotImg.src = 'assets/dot.png';
            dotImg.addEventListener("load", function () {
                this.coordinates.forEach(function (pos) {
                    context.drawImage(dotImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AddquizPage');
    }


}
