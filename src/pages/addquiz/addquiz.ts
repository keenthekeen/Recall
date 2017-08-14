import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActionSheetController, LoadingController, NavController, Platform, ToastController, ModalController} from 'ionic-angular';
import {Camera} from '@ionic-native/camera';
import {QuizPage} from "../quiz/quiz";
import {QuizModel} from '../../models/quiz';
import {AddquizModalPage} from '../addquiz-modal/addquiz-modal';
import {AlertController} from 'ionic-angular';

import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {FirebaseApp} from 'angularfire2';
import * as firebase from 'firebase/app';
import 'firebase/storage';

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

    public pictureStorageRef: firebase.storage.Reference;

    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, private Camera: Camera, private db: AngularFireDatabase, public loadingCtrl: LoadingController, public afAuth: AngularFireAuth, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController, public platform: Platform, public modalCtrl: ModalController, public alertCtrl: AlertController, public firebaseApp: FirebaseApp) {
        this.pictureStorageRef = firebaseApp.storage().ref().child("quiz_pictures");
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
            content: "Uploading..."
        });
        loader.present();

        let quiz = new QuizModel({
            name: name,
            caption: caption,
            owner: userId,
            labels: this.coordinates
        });

        let afterPrepare;
        if (this.picture.startsWith("data:image/")) {
            // Data URL string
            let extension = this.picture.substring(this.picture.lastIndexOf("data:image/") + 11, this.picture.lastIndexOf(";base64"));
            let fileName = userId.substr(5, 6) + Math.round(Date.now() / 100) + Math.round(Math.random() * 100) + "." + extension;
            afterPrepare = new Promise(function (resolve, reject) {
                let uploadTask = this.pictureStorageRef.child(fileName).putString(this.picture, 'data_url');

                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (progress > 0) {
                        loader.setContent(progress + "% uploaded...");
                    }
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log('Upload is running');
                            break;
                    }
                }, function (error) {
                    // Handle unsuccessful uploads
                    loader.setContent("Error occured while uploading!").setDuration(3000);
                    reject("Upload error");
                }, function () {
                    // Handle successful uploads on complete
                    console.log('Uploaded!', uploadTask);
                    quiz.picture_on_gz = fileName;
                    resolve(quiz);
                });
            }.bind(this));
        } else {
            afterPrepare = new Promise(function (resolve, reject) {
                quiz.picture = this.picture;
                resolve(quiz);
            }.bind(this));
        }

        afterPrepare.then(function (quiz) {
            loader.setContent("Saving...");
            console.log("Saving quiz...", quiz);
            quiz.save(this.db).then(function () {
                loader.dismiss();
                this.navCtrl.pop();
            }.bind(this));
        }.bind(this)).catch(function (error) {
            loader.dismiss();
            alert("Failure");
            console.error("Error while saving", error);
        });
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
                err => console.error(err));

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
                let AddquizModal = this.modalCtrl.create(AddquizModalPage);
                let name: string;
                AddquizModal.onDidDismiss(data => {
                    console.log(data);
                    name = data.Title;

                    if (name) {
                        if (this.coordinates.map(function (e) {
                                // Ignore case
                                e.name = e.name.toUpperCase();
                                return e;
                            }).find(x => x.name == name.toUpperCase())) {
                            this.alertCtrl.create({
                                title: 'Name conflict!',
                                subTitle: "Point's name is conflicted. Try use other name. ",
                                buttons: ['OK']
                            }).present();
                        } else {
                            mousePos.name = name;
                            mousePos.other_name = data.OtherNames;
                            this.coordinates.push(mousePos);
                            this.renderCanvas(canvas);
                            console.log("AddQuiz page: Added label", mousePos);
                        }
                    }
                });
                AddquizModal.present();
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
            this.pinSize = QuizPage.calculatePinSize(canvas.width, canvas.height);

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
