import { Component } from '@angular/core';
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
export class DebtModalComponent {
  newDebt = {
    numeroDocumento: '',
    empresa: '',
    montoTotal: 0,
    fechaVencimiento: '',
    estado: 'pendiente'  // Estado inicial
  };

  constructor(private authService: AuthService, public dialogRef: MatDialogRef<DebtModalComponent>) {}

  registerDebt() {
    // Transformar datos antes de enviar
    this.newDebt.empresa = this.newDebt.empresa.toUpperCase();
    this.newDebt.montoTotal = parseFloat(this.newDebt.montoTotal.toFixed(2));

    this.authService.registerDebt(this.newDebt).subscribe(response => {
      console.log('Deuda registrada', response);
      this.dialogRef.close();
    }, error => {
      console.error('Error registrando deuda', error);
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
