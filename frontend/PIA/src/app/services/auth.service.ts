import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment';
import { User } from '../models/users';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  users: User[] = [];
  private token: string;
  private isAuthenticated = false;
  private userId: string;
  private username: string;
  private role: string;

  private authStatusListener = new Subject<boolean>();

  private tokenTimer;


  constructor(private http: HttpClient, private router: Router) { }

  getToken(): string {
    return this.token
  }

  getAuthListener(){
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  getUsername() {
    return this.username;
  }
  login(username: string, password: string){
      this.http.post<{token: string, expiresIn: number, userId: string, username: string, role: string}>(environment.apiBaseUrl + '/auth/login', {username: username, password: password})
        .subscribe(res => {
          const token = res.token;
          this.token = token;
          if(token){
            const expiresIn = res.expiresIn;
            this.setTimer(expiresIn)
            this.isAuthenticated = true;
            this.userId = res.userId;
            this.username = res.username;
            this.role = res.role;
            this.authStatusListener.next(true);
            const now  = new Date();
            const expirationDate = new Date(now.getTime() + expiresIn * 1000)
            this.saveAuthData(token, expirationDate, this.userId, this.username, this.role)
            this.router.navigate(['/browse'])
          }
        }, error => {

          this.authStatusListener.next(false);
        });
  }

  registerUser(user: User, photo: File){
    const userData = new FormData();
    userData.append("name", user.name);
    userData.append("username", user.username);
    userData.append("surname", user.surname);
    userData.append("email", user.email);
    userData.append("password", user.password);
    userData.append("birthdate", user.birthdate.toString());
    userData.append("city", user.city);
    userData.append("country", user.country);
    if(photo) userData.append("photo", photo, user.name+"_"+user.surname);
    return this.http.post<{ message: string; user: User }>(environment.apiBaseUrl + '/auth/register', userData)
     .subscribe(responseData => {
      const u: User = {
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        password: user.password,
        birthdate: user.birthdate,
        city: user.city,
        country: user.country,
        photo: responseData.user.photo,
        id: responseData.user.id,
        lastSeen: responseData.user.lastSeen,
        status: responseData.user.status
      };
      this.users.push(u);
    }, error => {
      this.authStatusListener.next(false);
    });

  }

  checkUsername(username: string){
      return this.http.get<{data: {ok: boolean, message: string}}>(environment.apiBaseUrl + '/auth/username/' + username)
  }
  checkEmail(email: string){
    return this.http.get<{data: {ok: boolean, message: string}}>(environment.apiBaseUrl + '/auth/email/' + email)
}



  sendToken(token){
    return this.http.post<any>(environment.apiBaseUrl + '/auth/token_validate', {recaptcha: token})
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getRole(){
    return this.role;
  }

  logout(){
    this.token = null;
    this.isAuthenticated = false
    this.authStatusListener.next(false)
    clearTimeout(this.tokenTimer)
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/login'])

  }

  autoAuth(){
    const authInfo = this.getAuthData()
    if(!authInfo) return;
    const now = new Date();
    let expiresIn = authInfo.expirationDate.getTime() - now.getTime()

    if (now < authInfo.expirationDate) {
      this.token = authInfo.token;
      this.userId = authInfo.userId;
      this.username = authInfo.username;
      this.role = authInfo.role;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setTimer(expiresIn / 1000)
    }
  }

  private saveAuthData(token: string, expiresIn: Date, userId: string, username: string, role: string){
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    localStorage.setItem("expiration", JSON.stringify(expiresIn));

  }

  private clearAuthData(){
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");


  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    const expirationDate = JSON.parse(localStorage.getItem("expiration"));
    if(token && expirationDate) {

      return {
        token: token,
        userId: userId,
        username: username,
        role: role,
        expirationDate: new Date(expirationDate)
      }
    }
    return;
  }
 
  private setTimer(expiresIn){
    this.tokenTimer = setTimeout(()=>{
      this.logout();
    }, expiresIn * 1000)

  }

  changePassword(userId: string, oldPass, newPass){
    return this.http.put<{message:string}>(
    environment.apiBaseUrl + '/auth/password/' + userId, {userId: userId, oldPassword: oldPass, newPassword: newPass}
    )
  }
  
  changeUser(user: User, photo: File){
    let userData: FormData | User ;
    if (photo && typeof photo === "object") {
    userData = new FormData();
    userData.append("name", user.name);
    userData.append("username", user.username);
    userData.append("surname", user.surname);
    userData.append("email", user.email);
    userData.append("password", user.password);
    userData.append("birthdate", user.birthdate.toString());
    userData.append("city", user.city);
    userData.append("country", user.country);
    userData.append("status", user.status);
    if(user.lastSeen)userData.append('lastSeen', user.lastSeen.toString())
    userData.append("role", user.status)
    if (photo) userData.append("photo", photo, user.name+"_"+user.surname);
  }else{
    userData = user;
   }
    return this.http.put<{ message: string; user: User }>(environment.apiBaseUrl + '/auth/'+user.id, userData)
     .subscribe(responseData => {
    })

  }

}
