import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BrowseComponent } from './components/browse/browse.component';
import { BookComponent } from './components/book/book.component';
import { EventComponent } from './components/event/event.component';
import { AuthInterceptor } from './services/auth-interceptor';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { AddEventComponent } from './components/add-event/add-event.component';
import { AdminComponent } from './components/admin/admin.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    BrowseComponent,
    BookComponent,
    EventComponent,
    ProfileComponent,
    ChangePasswordComponent,
    AddBookComponent,
    AddEventComponent,
    AdminComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    HttpClientModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
