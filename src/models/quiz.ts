import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {FirebaseApp} from "angularfire2";
import {FirebaseListFactoryOpts} from "angularfire2/interfaces";
import {AngularFireOfflineDatabase} from "angularfire2-offline";

export class QuizModel {

    public $key: string | null;
    public name: string;
    public picture: string | null;
    public picture_on_gz: string | null;
    public caption: string;
    public category: string | null;
    public owner: string | null;
    public rate: number | null;
    public counter: number | null;
    public stat: {
        counter: number,
        rate: number,
    };
    public labels: Array<{
        name: string, label
        other_name: Array<string>,
        x: number,
        y: number,
    }>;
    public created_at: number;

    constructor(obj: any, protected firebaseApp?: FirebaseApp) {
        this.$key = obj.$key || null;
        this.name = obj.name;
        this.picture = obj.picture || null;
        this.picture_on_gz = obj.picture_on_gz || null;
        this.category = obj.category || null;
        this.caption = obj.caption || '';
        this.owner = obj.owner;
        this.labels = obj.labels;
        this.stat = obj.stat;
        this.created_at = Date.now();
        if (firebaseApp != undefined) {
            this.setPictureUrl();
        }
    }

    static fetch(db: AngularFireOfflineDatabase, opts?: FirebaseListFactoryOpts) {
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

    public update(db: AngularFireDatabase, obj: any) {
        return db.app.database().ref("/quizzes").child(this.$key).update(obj);
    }

    public deleteMe(db: AngularFireDatabase) {
        return db.app.database().ref("/quizzes").child(this.$key).remove();
    }

    public getRate(): string {
        if (!this.stat || !this.stat.rate) {
            return "N/A";
        }
        return Math.round((100 - this.stat.rate) * 15 / 100).toString();
    }

    public setPictureUrl() {
        return new Promise(resolve => {
            if (this.picture_on_gz) {
                console.log("Getting picture url");
                this.firebaseApp.storage().ref().child("quiz_pictures").child(this.picture_on_gz).getDownloadURL().then((url) => {
                    this.picture = url;
                    console.log("Got picture url: " + url);
                    resolve(url);
                });
            } else {
                resolve();
            }
        });
    }

    static newThenWaitPicture(obj: any, firebaseApp: FirebaseApp): Promise<QuizModel> {
        return new Promise(resolve => {
            let quiz = new QuizModel(obj, firebaseApp);
            quiz.setPictureUrl().then(() => {
                resolve(quiz);
            });
        });
    }

    static find(db: AngularFireDatabase, key: string): FirebaseObjectObservable<any> {
        return db.object('/quizzes/' + key, {preserveSnapshot: true});
    }

}
