import {Component} from '@angular/core';
import {MenuController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {MasterPage} from "../master/master"

/**
 * Generated class for the TutorialPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
export interface Slide {
    title: string;
    description: string;
    image: string;
}

@IonicPage()
@Component({
    selector: 'page-tutorial',
    templateUrl: 'tutorial.html',
})
export class TutorialPage {
    slides: Slide[];
    showSkip = true;

    constructor(public navCtrl: NavController, public menu: MenuController,) {
    }

    onSlideChangeStart(slider) {
        this.showSkip = !slider.isEnd();
    }

    ionViewDidEnter() {
        // the root left menu should be disabled on the tutorial page
        this.menu.enable(false);
    }

    ionViewWillLeave() {
        // enable the root left menu when leaving the tutorial page
        this.menu.enable(true);
    }

    goToHome(){
    this.navCtrl.setRoot(MasterPage, {}, {
        animate: true,
        direction: 'forward'
    });
}

}
