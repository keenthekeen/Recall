import {AngularFireDatabase} from "angularfire2/database";
import {UserInfo} from "firebase/app";

export class UserModel implements UserInfo {

    public displayName: string | null;
    public email: string | null;
    public phoneNumber: string | null;
    public photoURL: string | null;
    public providerId: string;
    public uid: string;

    public deviceToken: string|null;

    public createdAt: number;
    public modifiedAt: number;

    constructor(obj: any) {
        this.displayName = obj.displayName || null;
        this.email = obj.email || null;
        this.phoneNumber = obj.phoneNumber || null;
        this.photoURL = obj.photoURL || null;
        this.providerId = obj.providerId;
        this.uid = obj.uid;

        this.createdAt = obj.createdAt || Date.now();
        this.modifiedAt = Date.now();
    }

    public setDeviceToken (token: string) {
        console.log("Set device token ("+token.length+")");
        this.deviceToken = token;
        return this;
    }

    public save(db: AngularFireDatabase) {
        return db.app.database().ref("/users").child(this.uid).set(this);
    }

}
