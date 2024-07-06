import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router
      .navigate([''])
      .catch((err) => console.error('Navigation error:', err));
  }
}
