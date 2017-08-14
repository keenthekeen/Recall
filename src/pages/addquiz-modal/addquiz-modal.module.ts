import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {AddquizModalPage} from './addquiz-modal';

@NgModule({
  declarations: [
    AddquizModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AddquizModalPage),
  ],
  exports: [
    AddquizModalPage
  ]
})
export class AddquizModalPageModule {}
