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

  constructor(public navCtrl: NavController, public navParams: NavParams, private Camera: Camera,) {

  }

  	public imageSrc:any;
  	getpicture(){
  		console.log('runned');
  		let cameraOptions = {
		    sourceType: this.Camera.PictureSourceType.PHOTOLIBRARY,
		    destinationType: this.Camera.DestinationType.FILE_URI,      
		    quality: 100,
		    targetWidth: 1000,
		    targetHeight: 1000,
		    encodingType: this.Camera.EncodingType.JPEG,      
		    correctOrientation: true
		  }

		  this.Camera.getPicture(cameraOptions)
		    .then(file_uri => this.imageSrc = file_uri, 
		    err => console.log(err));   
  	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddquizPage');
  }


}
