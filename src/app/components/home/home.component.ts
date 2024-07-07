import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DebtModalComponent } from '../debt-modal/debt-modal.component';
import { ScheduleModalComponent } from '../schedule-modal/schedule-modal.component';
import { AuthService } from '../../services/auth.service';
import { Deuda } from '../../models/debt.model';
import { FormsModule } from "@angular/forms";
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'; // Importar el componente de confirmación

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    DebtModalComponent,
    ScheduleModalComponent,
    CommonModule,
    FormsModule,
    ConfirmDialogComponent  // Asegúrate de importar el componente de confirmación
  ]
})
export class HomeComponent implements OnInit {
  debts: Deuda[] = [];
  filteredDebts: Deuda[] = [];
  currentMonth: number;
  currentYear: number;
  filtroEstado: string = 'Todos';
  searchTerm: string = '';

  constructor(private dialog: MatDialog, private authService: AuthService) {
    const date = new Date();
    this.currentMonth = date.getMonth() + 1; // Enero es 0, así que sumamos 1
    this.currentYear = date.getFullYear();
  }

  ngOnInit() {
    this.loadDebts();
  }

  loadDebts() {
    this.authService.getDebtsByMonthAndYear(this.currentMonth, this.currentYear).subscribe(response => {
      this.debts = response.sort((a: Deuda, b: Deuda) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
      this.applyFilter();
    }, error => {
      console.error('Error loading debts', error);
    });
  }

  applyFilter() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(startOfWeek.getDate() + 6));

    let filtered = this.debts;

    if (this.filtroEstado !== 'Todos') {
      if (this.filtroEstado === 'pendiente') {
        filtered = filtered.filter(debt => debt.estado === 'pendiente' && new Date(debt.fechaVencimiento) > endOfWeek);
      } else if (this.filtroEstado === 'pagada') {
        filtered = filtered.filter(debt => debt.estado === 'pagada');
      } else if (this.filtroEstado === 'vencida') {
        filtered = filtered.filter(debt => new Date(debt.fechaVencimiento) < today && debt.estado !== 'pagada');
      } else if (this.filtroEstado === 'proxima') {
        filtered = filtered.filter(debt => {
          const dueDate = new Date(debt.fechaVencimiento);
          return dueDate >= startOfWeek && dueDate <= endOfWeek && debt.estado !== 'pagada';
        });
      }
    }

    if (this.searchTerm) {
      filtered = filtered.filter(debt => debt.numeroDocumento.includes(this.searchTerm));
    }

    this.filteredDebts = filtered.sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
  }

  searchByDocument() {
    const matchingDebt = this.debts.find(debt => debt.numeroDocumento.includes(this.searchTerm));
    if (matchingDebt) {
      const dueDate = new Date(matchingDebt.fechaVencimiento);
      this.currentMonth = dueDate.getMonth() + 1;
      this.currentYear = dueDate.getFullYear();
      this.authService.getDebtsByMonthAndYear(this.currentMonth, this.currentYear).subscribe(response => {
        this.debts = response.sort((a: Deuda, b: Deuda) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
        this.applyFilter();
      }, error => {
        console.error('Error loading debts', error);
      });
    } else {
      this.applyFilter();
    }
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  openDebtModal(): void {
    const dialogRef = this.dialog.open(DebtModalComponent, {
      width: '400px',
      enterAnimationDuration: '250ms',
      exitAnimationDuration: '250ms'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadDebts(); // Refresh the list after a new debt is registered
    });
  }

  openScheduleModal(): void {
    const dialogRef = this.dialog.open(ScheduleModalComponent, {
      width: '400px',
      enterAnimationDuration: '250ms',
      exitAnimationDuration: '250ms'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadDebts(); // Refresh the list after a new schedule is registered
    });
  }

  getDebtClass(debt: Deuda): string {
    const today = new Date();
    const dueDate = new Date(debt.fechaVencimiento);

    if (debt.estado === 'pagada') {
      return 'deuda-pagada';
    } else if (dueDate < today) {
      return 'deuda-vencida';
    } else if (dueDate >= today && dueDate <= new Date(today.setDate(today.getDate() + 7))) {
      return 'deuda-semana';
    } else {
      return 'deuda-proxima';
    }
  }

  prevMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.loadDebts();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.loadDebts();
  }

  getMonthName(month: number): string {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[month - 1];
  }

  get currentMonthName(): string {
    return this.getMonthName(this.currentMonth);
  }

  openConfirmDialog(debt: Deuda): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: debt
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.markAsPaid(debt);
      }
    });
  }

  markAsPaid(debt: Deuda): void {
    this.authService.markAsPaid(debt.id).subscribe(response => {
      this.loadDebts(); // Refresh the list after marking as paid
    }, error => {
      console.error('Error marking debt as paid', error);
      if (error.status === 403) {
        alert("No tienes permiso para realizar esta acción.");
      } else {
        alert("Ocurrió un error al intentar marcar la deuda como pagada.");
      }
    });
  }
}
