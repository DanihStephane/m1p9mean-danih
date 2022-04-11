import { User } from './../model/User';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly rootUrl = 'http://localhost:3000/auth';

  users: User[] = [{ "username": "admin", "password": "123", "roles": ['ADMIN'] },
  { "username": "Danih", "password": "123456", "roles": ['USER'] }];

  public loggedUser: string;
  public isloggedIn: Boolean = false;
  public roles: string[];


  constructor(private router: Router, private http: HttpClient) { }

  //general
  getHeaders() {
    const headers = new HttpHeaders()
      .set('Content-type', 'application/json');
    return headers;
  }
  getStatus(data) {
    return (data.meta.status == 1);
  };


  logout() {
    let head = new HttpHeaders()
      .set("Authorization", "Bearer " + localStorage.getItem('token'));
    let out= this.http.delete(this.rootUrl + '/logout', { headers: head }).subscribe((data: any) => {
      console.log(data);
    });
    localStorage.removeItem('token');
    localStorage.removeItem('id_utilisateur');
    localStorage.removeItem('id_profile');

    this.isloggedIn = false;
    this.loggedUser = undefined;
    this.roles = undefined;
    localStorage.removeItem('loggedUser');
    localStorage.setItem('isloggedIn', String(this.isloggedIn));
    this.router.navigate(['/login']);
  }

  SignIn(user: User) {
    var body = {
      "nomUtilisateur": user.username,
      "mdp": user.password
    };
    return this.http.post(this.rootUrl + '/login', body, { headers: this.getHeaders() }).subscribe((data: any) => {
      if (this.getStatus(data)) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('id_utilisateur', data.data.id_utilisateur);
        localStorage.setItem('id_profile', data.data.id_profile);
        let name = data.data.nom + " " + data.data.prenom;
        let loggedIn = true;
        localStorage.setItem('loggedUser', name);
        localStorage.setItem('isloggedIn', String(loggedIn));
      } else{
        Swal.fire('Non connecté','Login ou mot de passe incorrecte!','error');
      }  
    },
    (err : HttpErrorResponse)=>{
      console.log(err);
    });;
  }

  isAdmin(): Boolean {
    if (!this.roles) //this.roles== undefiened
      return false;
    return (this.roles.indexOf('ADMIN') > -1);
  }

  setLoggedUserFromLocalStorage(login: string) {
    this.loggedUser = login;
    this.isloggedIn = true;
    this.getUserRoles(login);
  }

  getUserRoles(username: string) {
    this.users.forEach((curUser) => {
      if (curUser.username == username) {
        this.roles = curUser.roles;
      }
    });
  }
}
