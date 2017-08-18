import {AngularFireDatabase} from "angularfire2/database";
import {FirebaseApp} from "angularfire2";
import {FirebaseListFactoryOpts} from "angularfire2/interfaces";

export class QuizModel {

    public $key: string | null;
    public name: string;
    public picture: string | null;
    public picture_on_gz: string | null;
    public caption: string;
    public owner: string | null;
    public rate: number | null;
    public counter : number | null;
    public stat : Array<{
        counter: number,
        rate: number,
    }>;
    public labels: Array<{
        name: string,label
        other_name: Array<string>,
        x: number,
        y: number
    }>;
    public created_at: number;

    constructor(obj: any, protected firebaseApp?: FirebaseApp) {
        this.$key = obj.$key || null;
        this.name = obj.name;
        this.picture = obj.picture || null;
        this.picture_on_gz = obj.picture_on_gz || null;
        this.caption = obj.caption || '';
        this.owner = obj.owner;
        this.labels = obj.labels;
        this.stat = obj.stat;
        this.created_at = Date.now();
        if (firebaseApp != undefined) {
            this.setPictureUrl();
        }
    }

    static fetch(db: AngularFireDatabase, opts?: FirebaseListFactoryOpts) {
        return db.list("/quizzes", opts);
    }

    public save(db: AngularFireDatabase) {
        if (this.picture_on_gz) {
            this.picture = null;
        }
        if (!this.$key) {
            delete this.$key;
        }
        delete this.firebaseApp;
        if (this.$key) {
            return db.app.database().ref("/quizzes").child(this.$key).set(this);
        } else {
            let objectRef = db.app.database().ref("/quizzes").push(this);
            this.$key = objectRef.key;
            return objectRef;
        }
    }

    public update(db:AngularFireDatabase, obj: any){
        return db.app.database().ref("/quizzes").child(this.$key).update(obj);
    }

    public deleteMe(db: AngularFireDatabase) {
        return db.app.database().ref("/quizzes").child(this.$key).remove();
    }

    private setPictureUrl() {
        if (this.picture_on_gz) {
            console.log("Getting picture url");
            this.firebaseApp.storage().ref().child("quiz_pictures").child(this.picture_on_gz).getDownloadURL().then(function (url) {
                this.picture = url;
            }.bind(this)).catch(function (error) {
                // Handle any errors
            });
        }
    }

}
