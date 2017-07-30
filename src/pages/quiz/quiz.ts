import { Component,ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { QuizModel } from '../../models/quiz';
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

        let canvas = this.canvasEl.nativeElement;
        canvas.width = 500;
        canvas.height = 500;
        //!!! Insert Canvas Image Here by using " "assets/images/" + this.quiz.pic + ".jpg"; "
        let context = canvas.getContext('2d');

        const coordinates = JSON.parse('[{"x":721,"y":364,"name":"ertert"},{"x":420,"y":230,"name":"hello"},{"x":792,"y":132,"name":"world"},{"x":220,"y":434,"name":"keen"}]');

        // Load dot icon
        console.log("Loading dot icon");
        let img = new Image();   // Create new img element
        img.addEventListener('load', function() {
            coordinates.forEach(function(element) {
                context.drawImage(img, element.x, element.y, pinSize, pinSize);
            });
        }, false);
        img.src = 'assets/dot.png'; // Set source path

        let pinSize = QuizPage.getMinimum(canvas.height,canvas.width)/14; // Calculate pin size

        // Set up mouse events
        canvas.addEventListener("mouseup", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = pinSize/2;
            let mousePos = {
                x: e.clientX - (rect.left+halfPin),
                y: e.clientY - (rect.top+halfPin)
            };
            let exist = QuizPage.isCoordinateExist(mousePos.x, mousePos.y, coordinates, pinSize);
            if (exist) {
                // Coordinate duplication found!   ...escaping...
                alert("You clicked on "+exist);
            }
        }, false);
        canvas.addEventListener("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let halfPin = pinSize/2;
            let mousePos = {
                x: e.clientX - (rect.left+halfPin),
                y: e.clientY - (rect.top+halfPin)
            };
            if (QuizPage.isCoordinateExist(mousePos.x, mousePos.y, coordinates, pinSize*0.9)) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "auto";
            }
        }, false);
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
        previous.forEach(function(e) {
            if (QuizPage.coordinateDistance({x:x, y:y}, e) <= threshold*0.5) {
                isFound = e.name;
            }
        });
        return isFound;
    }

    // Calculate distance between two coordinates
    static coordinateDistance(a, b) {
        return Math.sqrt(Math.pow((a.x-b.x), 2) + Math.pow((a.y-b.y), 2));
    }

}
