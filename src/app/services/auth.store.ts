import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { User } from "../model/user";

const AUTH_DATA = "auth_data";

@Injectable({
  providedIn: "root",
})
export class AuthStore {
  private _userSubject = new BehaviorSubject<User>(null);
  user$: Observable<User> = this._userSubject.asObservable();
  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  constructor(private _httpClient: HttpClient) {
    this.isLoggedIn$ = this.user$.pipe(map((user) => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map((loggedIn) => !loggedIn));

    const user = localStorage.getItem(AUTH_DATA);

    if (user) {
      this._userSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<User> {
    return this._httpClient.post<User>("/api/login", { email, password }).pipe(
      tap((user) => {
        this._userSubject.next(user);
        localStorage.setItem(AUTH_DATA, JSON.stringify(user));
      }),
      shareReplay()
    );
  }

  logout() {
    this._userSubject.next(null);
    localStorage.removeItem(AUTH_DATA);
  }
}
