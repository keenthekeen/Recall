import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
/**
 * Generated class for the AddquizPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-addquiz',
  templateUrl: 'addquiz.html',
})

export class AddquizPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera) {

  }


  	getpicture(){
  		console.log('runned');
  		const options: CameraOptions = {
		  quality: 100,
		  destinationType: this.camera.DestinationType.DATA_URL,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE,
		  sourceType: 0,
		}

  		this.camera.getPicture(options).then((imageData) => {
		 // imageData is either a base64 encoded string or a file URI
		 // If it's base64:
		 let base64Image = 'data:image/jpeg;base64,' + imageData;
		}, (err) => {
		 // Handle error
		});
  	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddquizPage');
  }


}
