import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';


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
    public NewOtherName : string;
    public OtherNames = [];
    public Title :string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddquizModalPage');
  }

  AddMoreName(name:string){
      if(this.OtherNames.indexOf(name) == -1) {
          this.OtherNames.push(name);
      }
    this.NewOtherName = "";
  }
  save(){
      let data = {
          Title: this.Title,
          OtherNames: this.OtherNames,
      };
      this.viewCtrl.dismiss(data);
  }

}
