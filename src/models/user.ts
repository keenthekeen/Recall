import {AngularFireDatabase} from "angularfire2/database";
import {UserInfo} from "firebase/app";

export class UserModel implements UserInfo {

    public displayName: string | null;
    public email: string | null;
    public phoneNumber: string | null;
    public photoURL: string | null;
    public providerId: string;
    public uid: string;

    public created_at: number;
    public modified_at: number;

    constructor(obj: any) {
        this.displayName = obj.displayName || null;
        this.email = obj.email || null;
        this.phoneNumber = obj.phoneNumber || null;
        this.photoURL = obj.photoURL || null;
        this.providerId = obj.providerId;
        this.uid = obj.uid;

        this.created_at = obj.created_at || Date.now();
        this.modified_at = Date.now();
    }

    public save(db: AngularFireDatabase) {
        return db.app.database().ref("/users").child(this.uid).set(this);
    }

}
