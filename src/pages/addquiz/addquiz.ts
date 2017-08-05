import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Camera} from '@ionic-native/camera';
import {QuizPage} from "../quiz/quiz";

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
    public coordinates: Array<any> = [];

    /**
     * 'plug into' DOM canvas element using @ViewChild
     */
    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, public navParams: NavParams, private Camera: Camera,) {

    }

    getPicture() {

        console.log('AddQuiz page: getting photo');
        let cameraOptions = {
            sourceType: this.Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: this.Camera.DestinationType.FILE_URI,
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            encodingType: this.Camera.EncodingType.JPEG,
            correctOrientation: true,
        };
        this.isUp = true;
        this.Camera.getPicture(cameraOptions)
            .then(file_uri => this.createCanvas(file_uri),
                err => console.log(err));

    }

    createCanvas(uri) {
        console.log('AddQuiz page: creating canvas');

        let canvas = this.canvasEl.nativeElement;
        let context = canvas.getContext('2d');
        let vMin;
        let pinSize;

        // Load background image
        let bg = new Image();
        bg.src = uri;
        bg.addEventListener("load", function () {
            // Calculate canvas size
            console.log("Screen size: " + window.innerHeight + " x " + window.innerWidth);
            console.log("Image size: " + bg.height + " x " + bg.width);
            if (bg.height < bg.width) {
                canvas.width = (window.innerWidth) * 0.95;
                canvas.height = bg.height * canvas.width / bg.width;
            } else {
                canvas.height = (window.innerHeight) * 0.95;
                canvas.width = bg.width * canvas.height / bg.height;
            }
            console.log("Canvas size: " + canvas.height + " x " + canvas.width);
            vMin = QuizPage.getMinimum(canvas.height, canvas.width);
            pinSize = QuizPage.getMinimum(canvas.height, canvas.width) / 30;

            // Draw background image
            context.drawImage(bg, 0, 0, canvas.width, canvas.height);
        });

        // Set up mouse events
        canvas.addEventListener("mouseup", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = pinSize / 2;
            let mousePos = {
                name: "",
                other_name: [],
                x: (e.clientX - (rect.left + halfPin)) / canvas.width,
                y: (e.clientY - (rect.top + halfPin)) / canvas.height
            };
            let exist = QuizPage.isCoordinateExist(mousePos.x, mousePos.y, this.coordinates, pinSize / vMin);
            if (exist) {
                console.log("AddQuiz page: clicked " + exist);
                /*if (confirm("Do you want to delete this?")) {
                    this.coordinates = this.coordinates.filter(function (element) {
                        return element.name != exist;
                    });
                }*/
                alert("Clicked " + exist);
            } else {
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
                        }) : [];
                        context.drawImage(dotImg, mousePos.x * canvas.width, mousePos.y * canvas.height, pinSize, pinSize);
                        this.coordinates.push(mousePos);
                        console.log("AddQuiz page: Added label", mousePos);
                    }
                } else {
                    alert("You must supply name!");
                }
            }
        }.bind(this), false);
        canvas.addEventListener("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = pinSize / 2;
            let mousePos = {
                x: (e.clientX - (rect.left + halfPin)) / canvas.width,
                y: (e.clientY - (rect.top + halfPin)) / canvas.height
            };
            if (QuizPage.isCoordinateExist(mousePos.x, mousePos.y, this.coordinates, pinSize / vMin)) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "auto";
            }
        }.bind(this), false);


        // Load dot icon
        console.log("Loading dot icon");
        let dotImg = new Image();
        dotImg.src = 'assets/dot.png';
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AddquizPage');
    }


}
