import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DebtModalComponent } from '../debt-modal/debt-modal.component';
import { AuthService } from '../../services/auth.service';
import { Deuda } from '../../models/debt.model';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'; // Importar el componente de confirmación
import { NotifyComponent } from '../notify/notify.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    DebtModalComponent,
    CommonModule,
    FormsModule,
    ConfirmDialogComponent, // Asegúrate de importar el componente de confirmación
  ],
})
export class HomeComponent implements OnInit {
  debts: Deuda[] = [];
  filteredDebts: Deuda[] = [];
  paginatedDebts: Deuda[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  currentMonth: number;
  currentYear: number;
  filtroEstado: string = 'Todos';
  searchTerm: string = '';
  errorMessage: string = '';

  constructor(private dialog: MatDialog, private authService: AuthService) {
    const date = new Date();
    this.currentMonth = date.getMonth() + 1;
    this.currentYear = date.getFullYear();
  }

  ngOnInit() {
    this.loadDebts();
    this.checkDebtsDueToday();
  }

  loadDebts() {
    this.debts = [];
    this.filteredDebts = [];
    this.paginatedDebts = [];
    this.authService
      .getDebtsByMonthAndYear(this.currentMonth, this.currentYear)
      .subscribe(
        (response) => {
          this.debts = response.sort(
            (a: Deuda, b: Deuda) =>
              new Date(a.fechaVencimiento).getTime() -
              new Date(b.fechaVencimiento).getTime()
          );
          this.applyFilter();
        },
        (error) => {
          console.error('Error loading debts', error);
          this.applyFilter();
        }
      );
  }

  applyFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = this.debts;

    if (this.filtroEstado !== 'Todos') {
      filtered = this.debts.filter((debt) => debt.estado === this.filtroEstado);
    }

    if (this.searchTerm) {
      filtered = filtered.filter((debt) =>
        debt.numeroDocumento.includes(this.searchTerm)
      );
    }

    this.filteredDebts = filtered.sort(
      (a, b) =>
        new Date(a.fechaVencimiento).getTime() -
        new Date(b.fechaVencimiento).getTime()
    );
    this.totalPages = Math.ceil(this.filteredDebts.length / this.pageSize);
    this.setPage(this.currentPage); // Mantener la página actual al aplicar el filtro

    // Mostrar mensaje de error si no se encuentran deudas
    if (this.filteredDebts.length === 0) {
      this.errorMessage = 'No se encontraron deudas que cumplan con el filtro.';
    } else {
      this.errorMessage = '';
    }
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredDebts.length
    );
    this.paginatedDebts = this.filteredDebts.slice(startIndex, endIndex);
  }

  searchByDocument() {
    if (!this.searchTerm.trim()) {
      alert('Ingrese un número de documento para buscar.');
      this.loadDebts();
      return;
    }

    this.authService.searchDebtsByNumeroDocumento(this.searchTerm).subscribe(
      (response) => {
        this.debts = response;
        this.applyFilter();
      },
      (error) => {
        console.error('Error fetching debts by document number', error);
        alert('No se encontró ninguna deuda con ese número de documento.');
        this.searchTerm = ''; // Clear the search term
        this.loadDebts(); // Reload debts for the current month and year
      }
    );
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  openDebtModal(): void {
    const dialogRef = this.dialog.open(DebtModalComponent, {
      width: '400px',
      enterAnimationDuration: '250ms',
      exitAnimationDuration: '250ms',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadDebts(); // Refresh the list after a new debt is registered
    });
  }

  getDebtClass(debt: Deuda): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegurarse de comparar solo la fecha
    const dueDate = new Date(debt.fechaVencimiento);
    dueDate.setHours(0, 0, 0, 0); // Asegurarse de comparar solo la fecha

    if (debt.estado === 'pagada') {
      return 'deuda-pagada';
    } else if (debt.estado === 'vencida') {
      return 'deuda-vencida';
    } else if (debt.estado === 'proxima') {
      return 'deuda-proxima';
    } else if (debt.estado === 'pendiente') {
      return 'deuda-pendiente';
    } else {
      return '';
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
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return monthNames[month - 1];
  }

  get currentMonthName(): string {
    return this.getMonthName(this.currentMonth);
  }

  openConfirmDialog(debt: Deuda): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: debt,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.markAsPaid(debt);
      }
    });
  }

  markAsPaid(debt: Deuda): void {
    this.authService.markAsPaid(debt.id).subscribe(
      (response) => {
        this.loadDebts();
      },
      (error) => {
        console.error('Error marking debt as paid', error);
        if (error.status === 403) {
          alert('No tienes permiso para realizar esta acción.');
        } else {
          alert('Ocurrió un error al intentar marcar la deuda como pagada.');
        }
      }
    );
  }

  checkDebtsDueToday() {
    this.authService.alertDueToday().subscribe(
      (response) => {
        if (response.message.includes('Tienes deudas que vencen hoy')) {
          this.dialog.open(NotifyComponent, {
            data: { message: response.message, deudasHoy: response.deudasHoy },
            width: '400px',
          });
        }
      },
      (error) => {
        console.error('Error checking debts due today', error);
      }
    );
  }

  openDeleteDialog(debt: Deuda): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: debt,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.deleteDebt(debt);
      }
    });
  }

  deleteDebt(debt: Deuda): void {
    this.authService.deleteDebt(debt.id).subscribe(
      (response) => {
        this.loadDebts();
      },
      (error) => {
        console.error('Error deleting debt', error);
        alert('Ocurrió un error al intentar eliminar la deuda.');
      }
    );
  }
}
