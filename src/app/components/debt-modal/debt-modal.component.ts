import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debt-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debt-modal.component.html',
  styleUrls: ['./debt-modal.component.css'],
})
export class DebtModalComponent implements OnInit {
  newDebt = {
    numeroDocumento: '',
    empresa: '',
    montoTotal: 0,
    fechaVencimiento: '',
    estado: 'pendiente'
  };
  errorMessage: string = '';

  constructor(private authService: AuthService, public dialogRef: MatDialogRef<DebtModalComponent>) {}

  ngOnInit() {
  }

  registerDebt() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.newDebt.fechaVencimiento);
    dueDate.setHours(0, 0, 0, 0);

    const oneWeekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (dueDate.getTime() === today.getTime() || (dueDate > today && dueDate <= oneWeekAhead)) {
      this.newDebt.estado = 'proxima';
    } else if (dueDate < today) {
      this.newDebt.estado = 'vencida';
    } else {
      this.newDebt.estado = 'pendiente';
    }

    this.newDebt.empresa = this.newDebt.empresa.toUpperCase();
    this.newDebt.montoTotal = parseFloat(this.newDebt.montoTotal.toFixed(2));

    this.authService.registerDebt(this.newDebt).subscribe(response => {
      console.log('Deuda registrada', response);
      this.dialogRef.close();
    }, error => {
      console.error('Error registrando deuda', error);
      this.errorMessage = error.error.message;
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
