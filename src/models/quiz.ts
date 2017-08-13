import {AngularFireDatabase} from "angularfire2/database";
import {FirebaseApp} from "angularfire2";

export class QuizModel {

    public $key: string | null;
    public name: string;
    public picture: string | null;
    public picture_on_gz: string | null;
    public caption: string;
    public owner: string | null;
    public labels: Array<{
        name: string,
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
        this.created_at = Date.now();
        if (firebaseApp != undefined) {
            this.setPictureUrl();
        }
    }

    static fetch(db: AngularFireDatabase) {
        return db.list("/quizzes");
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
