import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { HomeComponent } from './components/home/home.component';
import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {UserGuard} from "./services/guards/user.guard";

export const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [UserGuard] },
  { path: 'login', component: LoginRegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
