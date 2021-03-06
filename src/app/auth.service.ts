import { Injectable, Output, EventEmitter } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { MessageService } from './message.service';

import { CookieService } from 'angular2-cookie/services/cookies.service';

@Injectable()
export class AuthService {

  public token: string;
  @Output() user: EventEmitter<string> = new EventEmitter();
  @Output() loggedIn: EventEmitter<boolean> = new EventEmitter();

  constructor(public http: HttpClient, public message: MessageService, public cookieService: CookieService) {
  }

  getLoggedInStatus() {
    return this.loggedIn;
  }

  getUser() {
    return this.user;
  }

  login(username: string, password: string): Observable<any> {

    return this.http.post('http://127.0.0.1:8000/rest-auth/login/', {
        'username': username,
        'password': password,
      }).pipe(
        map(res => {
          this.token = res['key'];
          this.loggedIn.emit(true);
          this.user.emit(username);

          this.cookieService.put('user', username);
          this.cookieService.put('token', res['key']);
        }),
        catchError(this.handleError('login', {}))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    this.message.setActiveMessage('Login Failed! Please Check your credentials!');
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }

  logout(): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/rest-auth/logout/', {}).pipe(
      map(res => {
        if (res['detail'] === 'Successfully logged out.') {
          console.log('logging Out');
          this.token = null;
          this.loggedIn.emit(false);
          this.user.emit(null);

          this.cookieService.remove('user');
        }
      })
    );
  }
}
