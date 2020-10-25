import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Observer, observable, Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { User } from '../../models/users';
import { mimeType } from '../../validators/mimetype.validator'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  photoPreview: string;
  photoPicked: boolean = false;

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  passwordRegex = /^((?=.*[a-z])(?=.*[A-Z])[A-Za-z](?=.*\d)(?=.*[@$!%*?&]))[A-Za-z\d@$!%*?&]{6,}$/
  usernameRegex = /^[a-zA-Z0-9\._-]{3,50}$/

  showSuccessMessage: boolean;
  showErrorMessages: boolean = false;
  serverErrorMessages: String;

  recaptchaOk: boolean;
  usernameOk: boolean;
  emailOk: boolean;
  authStatusSub: Subscription;
  isAuthenticated: boolean;
  role: string;

  constructor(private formBuilder: FormBuilder,  
    private authService: AuthService,
    private router: Router) {
        this.registerForm = this.createFormGroup();
     }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuth();
    if(this.isAuthenticated) this.role = this.authService.getRole();

    if(this.isAuthenticated && this.role!=='admin') this.router.navigate(['/browse']);

  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      username: new FormControl('',[Validators.required, Validators.pattern(this.usernameRegex), this.usernameValidator()]),
      email: new FormControl('', [Validators.required, Validators.email, this.emailValidator()]),
      photo: new FormControl('', {asyncValidators: mimeType}),
      password: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex)]),
      confirmPassword: new FormControl('', [Validators.required, this.confirmValidator()]),
      city: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      recaptcha: new FormControl('', [Validators.required])
    });
  }

  onImagePicked(event: Event){

    const file = (event.target as HTMLInputElement).files[0];
    this.registerForm.patchValue({photo: file});
    this.registerForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    }
    reader.readAsDataURL(file);
    this.photoPicked = true;
  }
  onSubmit() {
    this.showErrorMessages = false;
    this.showSuccessMessage = false;
    let user : User;
    user = {
      name: this.registerForm.value.name,
      surname: this.registerForm.value.surname,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      photo: this.registerForm.value.photo,
      password: this.registerForm.value.password,
      city: this.registerForm.value.city,
      country: this.registerForm.value.country,
      birthdate: new Date(this.registerForm.value.date),
      id:null,
      lastSeen:null,
      status: "pending"
    };
   if(this.recaptchaOk && this.emailOk && this.usernameOk){
        this.authService.registerUser(user, this.registerForm.value.photo);
        this.showSuccessMessage = true;
        this.registerForm.reset();
        this.photoPreview = null;
    }
    else {
        this.showErrorMessages = true;
        if(!this.recaptchaOk) {this.serverErrorMessages = "Fill in reCAPTCHA again to continue."}
        if(!this.usernameOk) {this.serverErrorMessages = "This username is taken."}
        if(!this.emailOk) {this.serverErrorMessages = "This email is already in use."}

    }
  }

  get name() {
    return this.registerForm.get('name');
  }

  get surname() {
    return this.registerForm.get('surname');
  }

  get photo() {
    return this.registerForm.get('photo');
  }


  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get city() {
    return this.registerForm.get('city');
  }

  get country() {
    return this.registerForm.get('country');
  }

  get date() {
    return this.registerForm.get('date');
  }

  confirmValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) { return null; }
      return this.registerForm.get('password').valid && this.registerForm.get('password').value === value
        ? null : { invalid: true };
    };
  }

  usernameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) { return null; }
      this.authService.checkUsername(value).subscribe((res) => {
        if (res.data.ok) {
          this.usernameOk = true;
          return null;
        } 
        else  { 
            this.usernameOk = false;
            return {invalid: true} 
        }      })
    };
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) { return null; }
      this.authService.checkEmail(value).subscribe((res) => {
        if (res.data.ok) {
          this.emailOk = true;
          return null;
        } 
        else  { 
            this.emailOk = false;
            return {invalid: true} 
        }
      })
    };
  }

  async resolved(captchaResponse: string) {
    this.sendTokenToBackend(captchaResponse); 
  }

  sendTokenToBackend(tok){

    this.authService.sendToken(tok).subscribe(
      data => {
        this.recaptchaOk = data.success;

      },
      err => {
      },
      () => {}
    );
  }


}
