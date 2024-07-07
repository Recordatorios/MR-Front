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
  paginatedDebts: Deuda[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
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
    this.debts = [];  // Limpiar la lista de deudas antes de cargar las nuevas
    this.filteredDebts = [];  // Limpiar la lista de deudas filtradas
    this.paginatedDebts = [];  // Limpiar la lista de deudas paginadas
    this.authService.getDebtsByMonthAndYear(this.currentMonth, this.currentYear).subscribe(response => {
      this.debts = response.sort((a: Deuda, b: Deuda) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());
      this.applyFilter();
    }, error => {
      console.error('Error loading debts', error);
      this.applyFilter(); // Asegurarse de aplicar el filtro incluso si hay un error
    });
  }

  applyFilter() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

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
    this.totalPages = Math.ceil(this.filteredDebts.length / this.pageSize);
    this.setPage(this.currentPage); // Mantener la página actual al aplicar el filtro
  }


  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredDebts.length);
    this.paginatedDebts = this.filteredDebts.slice(startIndex, endIndex);
  }

  searchByDocument() {
    if (!this.searchTerm.trim()) {
      alert('Ingrese un número de documento para buscar.');
      this.loadDebts();
      return;
    }

    const foundDebt = this.debts.find(debt => debt.numeroDocumento === this.searchTerm);
    if (foundDebt) {
      const dueDate = new Date(foundDebt.fechaVencimiento);
      this.currentMonth = dueDate.getMonth() + 1; // Cambiar al mes de la deuda encontrada
      this.currentYear = dueDate.getFullYear(); // Cambiar al año de la deuda encontrada
      this.loadDebts();
      this.setPage(1);
    } else {
      alert('No se encontró ninguna deuda con ese número de documento.');
      this.searchTerm = ''; // Clear the search term
      this.loadDebts(); // Reload debts for the current month and year
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
    today.setHours(0, 0, 0, 0); // Asegurarse de comparar solo la fecha
    const dueDate = new Date(debt.fechaVencimiento);
    dueDate.setHours(0, 0, 0, 0); // Asegurarse de comparar solo la fecha

    const oneWeekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

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
