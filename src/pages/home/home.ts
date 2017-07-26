import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FeaturesPage } from '../features/features';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }
	featurespage(){
		this.navCtrl.push(FeaturesPage);
	}
}
