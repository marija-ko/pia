import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { BrowseComponent } from './components/browse/browse.component'
import { BookComponent } from './components/book/book.component'
import { ProfileComponent } from './components/profile/profile.component'
import { ChangePasswordComponent } from './components/change-password/change-password.component'
import { EventComponent } from './components/event/event.component';
import { AddEventComponent } from './components/add-event/add-event.component';
import { AdminComponent } from './components/admin/admin.component'
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component'

import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard'
import { AddBookComponent } from './components/add-book/add-book.component';

const routes: Routes = [
  { path: "", redirectTo: '/login', pathMatch: 'full' },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "browse", component: BrowseComponent },
  { path : "book/:bookId", component: BookComponent }, 
  { path : "user/:username", component: ProfileComponent, canActivate: [AuthGuard] },
  { path : "changePassword", component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path : "event/:eventId", component: EventComponent, canActivate: [AuthGuard] },
  { path : "addBook", component: AddBookComponent, canActivate: [AuthGuard] },
  { path : "addEvent", component: AddEventComponent, canActivate: [AuthGuard] },
  { path : "admin", component: AdminComponent, canActivate: [AuthGuard, AdminGuard] },
  { path : "editBook/:id", component: AddBookComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '**', component: PageNotFoundComponent },





];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, AdminGuard]
})
export class AppRoutingModule { }
