import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './components/home/home.component';
import { DialogModule } from './components/dialog.module'; // Importa tu módulo de diálogos
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    CommonModule,
    LoginRegisterComponent,
    HomeComponent,
    DialogModule, // Importa el módulo de diálogos aquí
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private authService: AuthService) {}
}
