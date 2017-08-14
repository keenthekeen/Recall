import {Camera} from '@ionic-native/camera';
import {Firebase} from "@ionic-native/firebase";
import {Injectable} from "@angular/core";
import {AlertController} from "ionic-angular";

export class CameraMock extends Camera {
    getPicture(options) {
        if (document.URL.includes('localhost')) {
            console.log("Camera: getting photo using mock");
            return new Promise((resolve) => {
                resolve("https://c1.staticflickr.com/5/4428/35558124943_eaef481a3b_h.jpg");
            });
        } else {
            console.log("Camera: getting photo from camera");
            return super.getPicture(options);
        }
    }
}

@Injectable()
export class Helper {
    constructor(private firebase: Firebase, private alertCtrl: AlertController) {
    }

    error(message: string) {
        console.error(message);
        this.firebase.logError(message);
        this.alertCtrl.create({
            title: 'Error Occurred!',
            subTitle: message,
            buttons: ['OK']
        }).present();
    }
}