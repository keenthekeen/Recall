import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

import {QuizModel} from '../../models/quiz';

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
    /**
     * 'plug into' DOM canvas element using @ViewChild
     */
    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.quiz = this.navParams.get('quiz');

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad QuizPage');

        // Load background image
        let canvas = this.canvasEl.nativeElement;
        const coordinates = this.quiz.labels;
        let bg = new Image();
        bg.src = this.quiz.pic;
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
            let vMin = QuizPage.getMinimum(canvas.height, canvas.width);

            let pinSize = QuizPage.getMinimum(canvas.height, canvas.width) / 30; // Calculate pin size

            let context = canvas.getContext('2d');
            context.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // Load dot icon
            console.log("Loading dot icon");
            let dotImg = new Image();   // Create new dotImg element
            dotImg.addEventListener('load', function () {
                coordinates.forEach(function (element) {
                    context.drawImage(dotImg, element.x * canvas.width, element.y * canvas.height, pinSize, pinSize);
                });
            }, false);
            dotImg.src = 'assets/dot.png'; // Set source path

            // Set up mouse events
            canvas.addEventListener("mouseup", function (e) {
                let rect = canvas.getBoundingClientRect();
                let halfPin = pinSize / 2;
                let mousePos = {
                    x: e.clientX - (rect.left + halfPin),
                    y: e.clientY - (rect.top + halfPin)
                };
                let exist = QuizPage.isCoordinateExist(mousePos.x/canvas.width, mousePos.y/canvas.height, coordinates, pinSize/vMin);
                if (exist) {
                    // Coordinate duplication found!   ...escaping...
                    alert("You clicked on " + exist);
                }
            }, false);
            canvas.addEventListener("mousemove", function (e) {
                let rect = canvas.getBoundingClientRect();
                let halfPin = pinSize / 2;
                let mousePos = {
                    x: e.clientX - (rect.left + halfPin),
                    y: e.clientY - (rect.top + halfPin)
                };
                if (QuizPage.isCoordinateExist(mousePos.x/canvas.width, mousePos.y/canvas.height, coordinates, pinSize/vMin)) {
                    canvas.style.cursor = "pointer";
                } else {
                    canvas.style.cursor = "auto";
                }
            }, false);
        });
    }

// Return minimum value of parameter provided
    static getMinimum(a, b) {
        return (a > b) ? b : a;
    }

    /**
     * Is (x,y) already exist in coordinates array
     * @param {int} x X axis value
     * @param {int} y Y axis value
     * @param {array} previous coordinates storage
     * @param {int} threshold size of pin
     */
    static isCoordinateExist(x, y, previous, threshold) {
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
