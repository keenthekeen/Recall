/*
    Recall, an application that allow user to play a diagram quiz and create his own one, which is accessible by other users.
    Copyright (C) 2017 Siwat Techavoranant and Sarat Limawongpranee

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {FirebaseApp} from "angularfire2";
import {FirebaseListFactoryOpts} from "angularfire2/interfaces";
import {AngularFireOfflineDatabase} from "angularfire2-offline";

export class QuizModel {

    public name: string;
    public picture: string | null;
    public picture_on_gz: string | null;
    public caption: string;
    public category: string | null;
    public owner: string | null;
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

    // Internal Use (Shouldn't be written to database)
    public $key: string | null;
    public ownerName: string;
    public ownerPhoto: string;

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
        delete this.ownerName;
        delete this.ownerPhoto;
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

    public setOwnerName(db: AngularFireOfflineDatabase) {
        console.log("Getting owner name of " + this.name);
        db.object('/users/' + this.owner + '/displayName').subscribe(x => {
            this.ownerName = x.$value;
        });
    }

    public setOwnerPhoto(db: AngularFireOfflineDatabase) {
        console.log("Getting owner picture of " + this.name);
        db.object('/users/' + this.owner + '/photoURL').subscribe(x => {
            this.ownerPhoto = x.$value;
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
