import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-user-dashboard',
  imports: [SharedModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
userName:any = JSON.parse(localStorage?.getItem('user')?? '').username;

data:any[]= [
  {title:'Income', balance:"DB 1000"},
  {title:'Expenses', balance:"DB 1000"},
  {title:'purchase', balance:"DB 1000"},
  {title:'profile', balance:"DB 1000"},
]
inventory:any[]= [
  {title:'Silver', balance:"DB 1000"},
  {title:'Gold', balance:"DB 1000"},
  {title:'Dimond', balance:"DB 1000"},
  {title:'stones', balance:"DB 1000"},
]
}
