import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'rental-point-root',
  templateUrl: './rentalPoint.component.html',
  styleUrls: ['./rentalPoint.component.css']
})
export class RentalPointComponent {
  title = 'My first AGM project';
  latC = 46.06698;
  lngC = 11.15503;
  rentalPoints: RentalPoint[] | undefined;
  selectedRentalName: string = "";

  constructor(private http: HttpClient, private apiloader: MapsAPILoader, private router: Router) {
    this.getRentalPoints();
  }

  async newRentalPoint(name: string, address: string, lat: number, lng: number, type: string, event: any) {
    event.preventDefault()
    // @ts-ignore
    document.getElementById("creationRentalPointError")?.innerHTML = "";

    if(this.checkLatLng(lat, lng) == true){
      const params = new HttpParams().set("name", name).set("address", address).set("lat", lat).set("lng", lng).set("type", type);
      await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v1/rental`, params).pipe(map(data => {
        this.router.navigate(['/']);    
      }), catchError(error => {
        // @ts-ignore
        document.getElementById("creationRentalPointError")?.innerHTML = error.error.message;
        return of([]);
      })))

      this.getRentalPoints();
      this.selectRentalPoint(undefined);
    }
  }

  async changeRentalPoint(name: string, address: string, lat: number, lng: number, type: string, event: any) {
    event.preventDefault()

    if(this.checkLatLng(lat, lng) == true){
      const params = new HttpParams().set("name", name).set("address", address).set("lat", lat).set("lng", lng).set("type", type);
      await lastValueFrom(this.http.put<any>(`${environment.apiUrl}/api/v1/rental`, params).pipe(map(data => {

      })))

      // @ts-ignore
      document.getElementById("changeRentalPointForm").style.display = 'none';
      // @ts-ignore
      document.getElementById("addRentalForm").style.display = 'block';
      await this.getRentalPoints();
      this.selectRentalPoint(undefined);
    }
  }

  async removeRentalPoint() {
    const params = new HttpParams().set('name', this.selectedRentalName)
    await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v1/rental`, { params }).pipe(map(data => {

    })));
    this.selectedRentalName = "";
    await this.getRentalPoints();
    this.selectRentalPoint(undefined);
  }

  async getRentalPoints() {
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/rental`).pipe(map(data => {
      let i;
      this.rentalPoints = new Array(data.rentalPoints.length);

      if (data.rentalPoints.length > 0) {
        for (i = 0; i < data.rentalPoints.length; i++) {
          this.rentalPoints[i] = new RentalPoint(data.rentalPoints[i].id, data.rentalPoints[i].name, data.rentalPoints[i].address, data.rentalPoints[i].lat, data.rentalPoints[i].lng, data.rentalPoints[i].type, data.rentalPoints[i].bikeNumber);
        }
      }
    })));
  }

  addItemOptions() {
    return sessionStorage.getItem("permissions") != undefined && sessionStorage.getItem("permissions") == 'true';
  }

  checkLatLng(lat: number, lng: number){

    if(lat > 90 || lat < -90){
      // @ts-ignore
      document.getElementById("creationRentalPointError").innerHTML = "Valore latitudine non corretto";
      return false;
    } else if (lng > 180 || lng < -180){
      // @ts-ignore
      document.getElementById("creationRentalPointError").innerHTML = "Valore longitudine non corretto";
      return false;
    } else {
      return true;
    }
  }

  annullaModifica(){
    // @ts-ignore
    document.getElementById("changeRentalPointForm").style.display = 'none';
    // @ts-ignore
    document.getElementById("addRentalForm").style.display = 'block';
  }

  allowRentalPointChange() {
    // @ts-ignore
    document.getElementById("addRentalForm").style.display = 'none';
    // @ts-ignore
    document.getElementById("changeRentalPointForm").style.display = 'block';
    let rentalPoint = this.getRentalPoint();

    // @ts-ignore
    document.getElementById("nameChange").value = rentalPoint.name;
    // @ts-ignore
    document.getElementById("addressChange").value = rentalPoint.address;
    // @ts-ignore
    document.getElementById("latChange").value = rentalPoint.lat;
    // @ts-ignore
    document.getElementById("lngChange").value = rentalPoint.lng;
    // @ts-ignore
    document.getElementById("typeRentalPointChange").value = rentalPoint.type;
    // @ts-ignore
    document.getElementById("bikeNumberChange").value = rentalPoint.bikeNumber;
  }

  getRentalPoint() {
    let rentalPoint = undefined;
    let name = this.selectedRentalName;

    // @ts-ignore
    for (let i = 0; i < this.rentalPoints.length; i++) {
      // @ts-ignore
      if (this.rentalPoints[i].name == name) {
        // @ts-ignore
        rentalPoint = this.rentalPoints[i];
      }
    }
    return rentalPoint;
  }

  selectRentalPoint(event: any) {
    // @ts-ignore
    document.getElementById("changeRentalPointForm").style.display = 'none';

    if (event != undefined) {
      this.selectedRentalName = event.target.id;
    }
    if (this.selectedRentalName != "") {
      let rentalInfo = "";
      let rentalPoint = this.getRentalPoint();

      // @ts-ignore
      rentalInfo = "<b>Nome negozio:</b> " + rentalPoint.name + "<br><b>Indirizzo:</b> " + rentalPoint.address + "<br><b>Tipo:</b> " + rentalPoint.type + "<br><b>Numero di bici disponibili:</b> " + rentalPoint.bikeNumber;

      // @ts-ignore  
      document.getElementById("rentalShopSelected").innerHTML = rentalInfo;
    } else {
      // @ts-ignore  
      document.getElementById("rentalShopSelected").innerHTML = "";
    }
  }

  showMarkerInfo(event: any) {
    let lat = event.latitude;
    let lng = event.longitude;
    let rentalPoint;

    // @ts-ignore
    for (let i = 0; i < this.rentalPoints.length; i++) {
      // @ts-ignore
      if (this.rentalPoints[i].lat == lat && this.rentalPoints[i].lng == lng) {
        // @ts-ignore
        rentalPoint = this.rentalPoints[i];
      }
    }
    // @ts-ignore
    this.selectedRentalName = rentalPoint?.name;
    let rentalInfo = "";
    // @ts-ignore
    rentalInfo = "<b>Nome negozio:</b> " + rentalPoint.name + "<br><b>Indirizzo:</b> " + rentalPoint.address + "<br><b>Tipo:</b> " + rentalPoint.type + "<br><b>Numero di bici disponibili:</b> " + rentalPoint.bikeNumber;
    // @ts-ignore  
    document.getElementById("rentalShopSelected").innerHTML = rentalInfo;

  }

  async filterTypeBased(event: any) {
    if (event.target.value != "") {
      let del = true;
      const params = new HttpParams().set('type', event.target.value)
      await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/rental/type`, { params }).pipe(map(data => {
        let i;
        this.rentalPoints = new Array(data.rentalPoints.length);

        if (data.rentalPoints.length > 0) {
          for (i = 0; i < data.rentalPoints.length; i++) {
            this.rentalPoints[i] = new RentalPoint(data.rentalPoints[i].id, data.rentalPoints[i].name, data.rentalPoints[i].address, data.rentalPoints[i].lat, data.rentalPoints[i].lng, data.rentalPoints[i].type, data.rentalPoints[i].bikeNumber);
            if (this.rentalPoints[i].name == this.selectedRentalName) {
              del = false;
            }
          }
        }
      })));

      if (del == true) {
        this.selectedRentalName = "";
        // @ts-ignore  
        document.getElementById("rentalShopSelected").innerHTML = "";
      }
    } else {
      this.getRentalPoints();
    }
  }
  
  checkFutureDate(date: Date){
    if(new Date(date) > new Date()){
      return true;      
    } else {
      // @ts-ignore  
      document.getElementById("dateError").innerHTML = "Scegliere una data futura";
      return false;
    }
  }

  async filterDataBased(event: any) {
    // @ts-ignore  
    document.getElementById("dateError").innerHTML = "";
    if (event.target.value != "") {
      if(this.checkFutureDate(event.target.value)){
      const params = new HttpParams().set('date', event.target.value)
      await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/rental/date`, { params }).pipe(map(data => {
        
        let i;
        this.rentalPoints = new Array(data.rentalPoints.length);

        if (data.rentalPoints.length > 0) {
          for (i = 0; i < data.rentalPoints.length; i++) {
            this.rentalPoints[i] = new RentalPoint(data.rentalPoints[i].id, data.rentalPoints[i].name, data.rentalPoints[i].address, data.rentalPoints[i].lat, data.rentalPoints[i].lng, data.rentalPoints[i].type, data.rentalPoints[i].bikeNumber);
          }
        }
      })));

      this.selectRentalPoint(undefined);
      } 
    } else {
      this.getRentalPoints();
    }
    
  }

}

class RentalPoint {
  id: string | undefined;
  name: string | undefined;
  address: string | undefined;
  lat: number = 0;
  lng: number = 0;
  type: string | undefined;
  bikeNumber: number | undefined;

  constructor(id: string, name: string, address: string, lat: number, lng: number, type: string, bikeNumber: number) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.type = type;
    this.bikeNumber = bikeNumber;

  }

}
