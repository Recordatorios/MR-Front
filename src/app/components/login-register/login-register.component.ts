import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css'],
})
export class LoginRegisterComponent {
  registerForm: FormGroup;
  loginForm: FormGroup;
  loginErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password?.value !== confirmPassword?.value) {
      return { mismatch: true };
    }
    return null;
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const user = {
        name: this.registerForm.get('name')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
      };

      this.apiService.register(user).subscribe(
        (response) => {
          if (response && response.id) {
            alert('User registered successfully');
            this.resetForms();
            this.router
              .navigate([''])
              .catch((err) => console.error('Navigation error:', err));
          } else {
            console.log('No userId in response', response);
          }
        },
        (error) => {
          console.error('Error registering user', error);
        }
      );
    } else {
      console.log('Form is invalid', this.registerForm.errors);
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value,
      };

      this.apiService.login(credentials).subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          this.router
            .navigate(['home'])
            .catch((err) => console.error('Navigation error:', err));
          this.loginErrorMessage = '';
        },
        (error) => {
          console.error('Error logging in', error);
          this.loginErrorMessage = 'Correo o contraseña incorrectos, por favor intente nuevamente'
        }
      );
    } else {
      console.log('Form is invalid', this.loginForm.errors);
    }
  }

  resetForms(): void {
    this.registerForm.reset();
    this.loginForm.reset();
  }

  isInvalid(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    if (
      controlName === 'confirmPassword' &&
      this.registerForm.errors?.['mismatch']
    ) {
      return control ? control.dirty || control.touched : false;
    }
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
}
