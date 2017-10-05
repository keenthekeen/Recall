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

import {AngularFireDatabase} from "angularfire2/database";
import {UserInfo} from "firebase/app";

export class UserModel implements UserInfo {

    public displayName: string | null;
    public email: string | null;
    public phoneNumber: string | null;
    public photoURL: string | null;
    public providerId: string;
    public uid: string;
    public stat: {
        quizPlayed: Array<{
            uid: string,
            date: number,
        }>,
        counter: number,
        rate: number,
    } | null;

    public deviceToken: string | null;
    public createdAt: number;
    public modifiedAt: number;

    constructor(obj: any) {
        this.displayName = obj.displayName || null;
        this.email = obj.email || null;
        this.phoneNumber = obj.phoneNumber || null;
        this.photoURL = obj.photoURL || null;
        this.providerId = obj.providerId;
        this.uid = obj.uid;
        this.stat = obj.stat || {
            counter: 0,
            rate: 0,
            quizPlayed: [],
        };

        this.createdAt = obj.createdAt || Date.now();
        this.modifiedAt = Date.now();
    }

    public setDeviceToken(token: string) {
        console.log("Set device token (" + token.length + ")");
        this.deviceToken = token;
        return this;
    }

    public save(db: AngularFireDatabase) {
        this.modifiedAt = Date.now();
        return db.app.database().ref("/users").child(this.uid).set(this);
    }

    static find(db, uid: string) {
        return db.object('/users/' + uid, {preserveSnapshot: true});
    }

    static findOrNew(db: AngularFireDatabase, obj: any): Promise<UserModel> {
        return new Promise((resolve) => {
            let user = UserModel.find(db, obj.uid);
            if (user) {
                let subscription = user.subscribe(x => {
                    if (subscription) subscription.unsubscribe();
                    if (x.val()) {
                        resolve(new UserModel(x.val()));
                    } else {
                        resolve(new UserModel(obj));
                    }
                });
            } else {
                resolve(new UserModel(obj));
            }
        });
    }
}