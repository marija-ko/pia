import { CanActivate, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable()
export class AdminGuard implements CanActivate{

    constructor(private authService: AuthService, private router: Router){}

    canActivate(route: import("@angular/router")
        .ActivatedRouteSnapshot, state: import("@angular/router").RouterStateSnapshot): boolean | import("@angular/router").UrlTree | import("rxjs").Observable<boolean | import("@angular/router").UrlTree> | Promise<boolean | import("@angular/router").UrlTree> {
        const role = this.authService.getRole();
        if(role!="admin") {
            this.router.navigate(['/login'])
        }
        return (role=="admin");
    }

}