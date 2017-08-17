import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController, Platform, ToastController} from 'ionic-angular';
import {Camera} from '@ionic-native/camera';
import {QuizPage} from "../quiz/quiz";
import {QuizModel} from '../../models/quiz';
import {AddquizModalPage} from '../addquiz-modal/addquiz-modal';

import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {FirebaseApp} from 'angularfire2';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import {Helper} from "../../app/helper";
import UploadTaskSnapshot = firebase.storage.UploadTaskSnapshot;

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
    private screenSize = {
        width: 0,
        height: 0
    };
    private bgImg: HTMLImageElement;

    public pictureStorageRef: firebase.storage.Reference;

    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, private Camera: Camera, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private afAuth: AngularFireAuth, private toastCtrl: ToastController, private actionSheetCtrl: ActionSheetController, private platform: Platform, private modalCtrl: ModalController, private alertCtrl: AlertController, firebaseApp: FirebaseApp, private helper: Helper) {
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
            afterPrepare = new Promise((resolve, reject) => {
                let uploadTask = this.pictureStorageRef.child(fileName).putString(this.picture, 'data_url');

                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function progress(snapshot: UploadTaskSnapshot) {
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
                }, function error() {
                    // Handle unsuccessful uploads
                    loader.setContent("Error occured while uploading!").setDuration(3000);
                    reject("Upload error");
                }, function complete() {
                    // Handle successful uploads on complete
                    console.log('Uploaded!', uploadTask);
                    quiz.picture_on_gz = fileName;
                    resolve(quiz);
                    return undefined;
                });
            });
        } else {
            afterPrepare = new Promise((resolve) => {
                quiz.picture = this.picture;
                resolve(quiz);
            });
        }

        afterPrepare.then((quiz) => {
            loader.setContent("Saving...");
            console.log("Saving quiz...", quiz);
            quiz.save(this.db).then(() => {
                loader.dismiss();
                this.navCtrl.pop();
            });
        }).catch(() => {
            loader.dismiss();
            this.helper.error("Error while saving");
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
                err => this.helper.error("Error while getting picture"));

    }

    initializeCanvas(uri) {
        if (!(uri.startsWith('http') || uri.startsWith('data:'))) {
            uri = "data:image/jpeg;base64," + uri;
        }
        this.picture = uri;

        let canvas = this.canvasEl.nativeElement;

        // Get screen size
        // screen size may be changed, e.g. keyboard on, so save for later use
        this.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        console.log("Screen size (H*W): " + window.innerHeight + " x " + window.innerWidth);

        // Load background image
        this.bgImg = new Image();
        this.bgImg.src = this.picture;
        this.bgImg.addEventListener("load", () => {
            // Calculate canvas size
            if (this.bgImg.height < this.bgImg.width) {
                canvas.width = (this.screenSize.width) * 0.90;
                canvas.height = this.bgImg.height * canvas.width / this.bgImg.width;
            } else {
                canvas.height = (this.screenSize.height) * 0.90;
                canvas.width = this.bgImg.width * canvas.height / this.bgImg.height;
            }
            console.log("Image size: " + this.bgImg.height + " x " + this.bgImg.width + " / Canvas size: " + canvas.height + " x " + canvas.width);
            this.vMin = QuizPage.getMinimum(canvas.height, canvas.width);
            this.pinSize = QuizPage.calculatePinSize(canvas.width, canvas.height);

            canvas.getContext('2d').drawImage(this.bgImg, 0, 0, canvas.width, canvas.height);
        });

        // Draw!
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
        canvas.addEventListener("mousemove", (e) => {
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
        }, false);
    }

    renderCanvas(canvas: HTMLCanvasElement) {
        console.log('AddQuiz page: recreating canvas');

        let context = canvas.getContext('2d');

        // Draw background image
        context.drawImage(this.bgImg, 0, 0, canvas.width, canvas.height);

        // Draw coordinates
        let dotImg = new Image();
        dotImg.src = 'assets/dot.png';
        dotImg.addEventListener("load", () => {
            this.coordinates.forEach((pos) => {
                context.drawImage(dotImg, pos.x * canvas.width, pos.y * canvas.height, this.pinSize, this.pinSize);
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AddquizPage');
    }

}
