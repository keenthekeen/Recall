/*
    Recall, an application that allow user to play a diagram quiz and create his own one, which is accessible by other users.
    Copyright (C) 2017 Siwat Techavoranant and Sarat Limawongpranee

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';

@Component({
    selector: 'page-addquiz-modal',
    templateUrl: 'addquiz-modal.html'
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
            OtherNames: this.OtherNames
        };
        this.viewCtrl.dismiss(data);
    }

    deleteName(name: string) {
        let index = this.OtherNames.indexOf(name);
        this.OtherNames.splice(index, 1);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}
