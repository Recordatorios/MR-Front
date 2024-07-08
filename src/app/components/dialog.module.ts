import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteDialogComponent } from './DeleteDialogComponent/delete.dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DeleteDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule
  ],
  exports: [
    DeleteDialogComponent
  ]
})
export class DialogModule { }
