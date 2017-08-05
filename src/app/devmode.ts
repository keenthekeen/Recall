import {Camera} from '@ionic-native/camera';

export class CameraMock extends Camera {
    getPicture(options) {
        if (document.URL.includes('localhost')) {
            console.log("Camera: getting photo using mock");
            return new Promise((resolve) => {
                resolve("https://c1.staticflickr.com/5/4341/35564091693_63178d17a5_z.jpg");
            });
        } else {
            console.log("Camera: getting photo from camera");
            return super.getPicture(options);
        }
    }
}