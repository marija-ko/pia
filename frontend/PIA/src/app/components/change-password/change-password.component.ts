import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  passwordRegex = /^((?=.*[a-z])(?=.*[A-Z])[A-Za-z](?=.*\d)(?=.*[@$!%*?&]))[A-Za-z\d@$!%*?&]{6,}$/
  passwordForm: FormGroup;
  username:string;
  userId: string;

  constructor(private authService: AuthService, private router: Router, private userService: UserService) {
    this.passwordForm = this.createFormGroup()
   }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userId = this.authService.getUserId();

  }

  createFormGroup() {
    return new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex)]),
      confirmPassword: new FormControl('', [Validators.required, this.confirmValidator()]),
    });
  }

  confirmValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (!value) { return null; }
      return this.passwordForm.get('newPassword').valid && this.passwordForm.get('newPassword').value === value
        ? null : { invalid: true };
    };
  }

  get oldPassword() {
    return this.passwordForm.get('oldPassword');
  }

 
  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  onSubmit(){

    this.authService.changePassword(this.userId, this.passwordForm.get("oldPassword").value, 
    this.passwordForm.get("newPassword").value).subscribe(() => {})
    this.router.navigate(['/user', this.username])
  }

  onCancel(){
    this.router.navigate(['/user',this.username])
  }


}
