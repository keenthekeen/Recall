import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { FeaturesPage } from '../features/features';
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
  //tab3: any = ;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MasterPage');
  }

}
