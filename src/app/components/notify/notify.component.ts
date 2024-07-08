import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Deuda } from '../../models/debt.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notify',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './notify.component.html',
  styleUrl: './notify.component.css',
})
export class NotifyComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { message: string; deudasHoy: Deuda[] }
  ) {}
}
