import { NgModule } from '@angular/core';
import { KeytransformPipe } from './../pipes/keytransform/keytransform';
import { TestPipe } from './../pipes/test/test';
@NgModule({
	declarations: [KeytransformPipe,
    TestPipe],
	imports: [],
	exports: [KeytransformPipe,
    TestPipe]
})
export class PipesModule {}
