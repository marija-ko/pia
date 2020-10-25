import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  authListenerSubs: Subscription;
  username = null;
  role = null;

  constructor(private authService: AuthService) { }


  ngOnInit(): void {

    this.isAuthenticated = this.authService.getIsAuth();
    this.username = this.authService.getUsername()
    this.role = this.authService.getRole();
    this.authListenerSubs = this.authService.getAuthListener().subscribe(isAuthenticated=>{
        this.isAuthenticated = isAuthenticated;
        if(isAuthenticated) this.username = this.authService.getUsername()

    })
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }

  onLogout(){
    this.authService.logout();
    this.isAuthenticated = this.authService.getIsAuth();

  }

}
