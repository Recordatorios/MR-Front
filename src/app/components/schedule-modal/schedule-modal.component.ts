import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService} from "../../services/auth.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-modal.component.html',
  styleUrls: ['./schedule-modal.component.css'],
})
export class ScheduleModalComponent {
  newSchedule = {
    numeroDocumento: '',
    empresa: '',
    monto: 0,
    fechaDesembolso: '',
    plazo: '',
    interes: 0
  };

  constructor(private authService: AuthService, public dialogRef: MatDialogRef<ScheduleModalComponent>) {}

  registerSchedule() {
    this.authService.registerSchedule(this.newSchedule).subscribe(response => {
      console.log('Cronograma registrado', response);
      this.dialogRef.close();
    }, error => {
      console.error('Error registrando cronograma', error);
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
