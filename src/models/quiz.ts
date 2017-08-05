import {AngularFireDatabase} from "angularfire2/database";

export class QuizModel {

    public key: any;
    public name: string;
    public pic: string;
    public caption: string;
    public owner: any;
    public labels: Array<any>;

    constructor(obj: any) {
        this.key = obj.key || null;
        this.name = obj.name;
        this.pic = obj.pic;
        this.caption = obj.caption || '';
        this.owner = obj.owner || null;
    }

    static fetch(db: AngularFireDatabase) {
        return db.list('/quizzes', QuizModel);
    }
}
