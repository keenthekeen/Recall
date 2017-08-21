import {Pipe, PipeTransform,} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";

@Pipe({
    name: 'keytransform',
})
export class KeytransformPipe implements PipeTransform {
    /**
     * Takes a value and makes it lowercase.
     */
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
