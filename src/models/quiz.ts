import {AngularFireDatabase} from "angularfire2/database";

export class QuizModel {

    public key: string|null;
    public name: string;
    public picture: string;
    public caption: string;
    public owner: string|null;
    public labels: Array<any>;

    constructor(obj: any) {
        this.name = obj.name;
        this.picture = obj.picture;
        this.caption = obj.caption || '';
        this.owner = obj.owner || null;
        this.labels = obj.labels;
    }

    static fetch(db: AngularFireDatabase) {
        return db.list("/quizzes", QuizModel);
    }

    save(db: AngularFireDatabase) {
        if (this.key) {
            return db.app.database().ref("/quizzes").child(this.key).set(this);
        } else {
            let objectRef = db.app.database().ref("/quizzes").push(this);
            this.key = objectRef.key;
            return objectRef;
        }
    }

}
