import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms'
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  authStatusSub: Subscription;
  showMessage: boolean;
  isAuthenticated: boolean;
  constructor(private authService: AuthService, private router: Router){ }

  ngOnInit(): void {

    this.isAuthenticated = this.authService.getIsAuth();
    if(this.isAuthenticated) this.router.navigate(['/browse']);

  }

  onSubmit(form: NgForm){
    this.showMessage = false;
    this.authService.login(form.value.username, form.value.password);
    this.isAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthListener().subscribe(
      authStatus => {
        this.isAuthenticated = authStatus; 
        if(!this.isAuthenticated) this.showMessage = true;
      }
    );
  }

  continueAsGuest(){
      this.router.navigate(['/browse'])
  }

  ngOnDestroy(){
    if(this.authStatusSub) this.authStatusSub.unsubscribe();
  }

}
