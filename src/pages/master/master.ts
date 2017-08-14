import {Component} from '@angular/core';
import {HomePage} from '../home/home';
import {FeaturesPage} from '../features/features';
import {Firebase} from "@ionic-native/firebase";

/**
 * Generated class for the MasterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-master',
    templateUrl: 'master.html',
})
export class MasterPage {
    tab1: any = FeaturesPage;
    tab2: any = HomePage;

    constructor(private fb: Firebase) {

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MasterPage');
    }

    tabChanged(name: string) {
        console.log("User is viewing " + name);
        this.fb.setScreenName(name);
    }

}
