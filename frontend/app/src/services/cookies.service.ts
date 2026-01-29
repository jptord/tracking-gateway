import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookiesService {
  constructor() {}

  public setCookie(cname, cvalue, exdays = 10000) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 100000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
  public getCookie(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '{}';
  }
  public setCookieStorage(cname, cvalue) {
	localStorage.setItem(cname, cvalue);
  }
  public getCookieStorage(cname,defaultValue) {
	let value = localStorage.getItem(cname);
    return value==null?defaultValue:value;
  }
}
