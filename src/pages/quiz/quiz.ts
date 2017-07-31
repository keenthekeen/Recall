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
    public quiz: any;
    /**
     * 'plug into' DOM canvas element using @ViewChild
     */
    @ViewChild('canvas') canvasEl: ElementRef;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        //this.navParams.get('data');
        this.quiz = this.navParams.get('quiz');

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad QuizPage');

        // Load background image
        var bgWidth = 0;
        var bgHeight = 0;
        let canvas = this.canvasEl.nativeElement;
        let bg = new Image();
        bg.src = "http://www.massgeneral.org/childhood-epilepsy/assets/images/overview/i_brain_section-l.jpg";
        bg.addEventListener("load", function () {
            bgWidth = bg.width;
            bgHeight = bg.height;

            // Calculate canvas size
            let vMin = QuizPage.getMinimum(window.innerWidth, window.innerHeight);
            if (window.innerHeight < window.innerWidth) {
                canvas.width = (window.innerWidth)*0.9;
                canvas.height = (bgHeight * window.innerWidth / bgWidth)*0.9;
            } else {
                canvas.height = (window.innerHeight)*0.9;
                canvas.width = (bgWidth * window.innerHeight / bgHeight) *0.9;
            }

            //!!! Insert Canvas Image Here by using " "assets/images/" + this.quiz.pic + ".jpg"; "
            let context = canvas.getContext('2d');

            context.drawImage(bg,0,0, canvas.width, canvas.height);

            const coordinates = JSON.parse('[{"x":71,"y":34,"name":"ertert"},{"x":42,"y":20,"name":"hello"},{"x":72,"y":13,"name":"world"},{"x":20,"y":43,"name":"keen"}]');

            // Load dot icon
            console.log("Loading dot icon");
            let img = new Image();   // Create new img element
            img.addEventListener('load', function () {
                coordinates.forEach(function (element) {
                    context.drawImage(img, element.x, element.y, pinSize, pinSize);
                });
            }, false);
            img.src = 'assets/dot.png'; // Set source path

            let pinSize = QuizPage.getMinimum(canvas.height, canvas.width) / 30; // Calculate pin size

            // Set up mouse events
            canvas.addEventListener("mouseup", function (e) {
                let rect = canvas.getBoundingClientRect();
                let halfPin = pinSize / 2;
                let mousePos = {
                    x: e.clientX - (rect.left + halfPin),
                    y: e.clientY - (rect.top + halfPin)
                };
                let exist = QuizPage.isCoordinateExist(mousePos.x, mousePos.y, coordinates, pinSize);
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
                if (QuizPage.isCoordinateExist(mousePos.x, mousePos.y, coordinates, pinSize * 0.9)) {
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
