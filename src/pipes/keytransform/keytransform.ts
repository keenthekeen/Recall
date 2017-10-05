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

import {Pipe, PipeTransform} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";

@Pipe({
    name: 'keytransform'
})
export class KeytransformPipe implements PipeTransform {
    constructor(private db: AngularFireDatabase) {

    }

    transform(key: string) {
        return new Promise(resolve => {
            let quizzes = this.db.object('/quizzes');
            let subscription = quizzes.subscribe((quizzes) => {
                if (quizzes[key] && quizzes[key].name) {
                    resolve(quizzes[key].name);
                }
                else {
                    resolve('DELETED QUIZ');
                }
                subscription.unsubscribe();
            });
        });

    }
}
