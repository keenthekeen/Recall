import {Component} from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';
import {MasterPage} from "../master/master";
import {ScreenOrientation} from '@ionic-native/screen-orientation';

export interface Slide {
    title: string;
    description: string;
    image: string;
}

@Component({
    selector: 'page-tutorial',
    templateUrl: 'tutorial.html'
})
export class TutorialPage {
    showSkip = true;

    constructor(public navCtrl: NavController, public menu: MenuController, private screenOrientation: ScreenOrientation) {
        this.screenOrientation.lock('portrait');
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

    goToHome() {
        this.screenOrientation.unlock();
        this.navCtrl.setRoot(MasterPage, {}, {
            animate: true,
            direction: 'forward'
        });
    }

}
