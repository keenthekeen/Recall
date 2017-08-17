import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';


/**
 * Generated class for the AddquizModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
    selector: 'page-addquiz-modal',
    templateUrl: 'addquiz-modal.html',
})
export class AddquizModalPage {
    public NewOtherName: string;
    public OtherNames = [];
    public Title: string;

    constructor(public viewCtrl: ViewController) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AddquizModalPage');
    }

    AddMoreName(name: string) {
        if (this.OtherNames.indexOf(name) == -1 && !(name === "")) {
            this.OtherNames.push(name);
        }
        this.NewOtherName = "";
    }

    save() {
        let data = {
            Title: this.Title,
            OtherNames: this.OtherNames,
        };
        this.viewCtrl.dismiss(data);
    }

    deleteName(name: string) {
        let index = this.OtherNames.indexOf(name);
        this.OtherNames.splice(index, 1);
    }
}
