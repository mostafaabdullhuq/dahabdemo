import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { routes } from './layout.routes';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    LayoutComponent,SharedModule,RouterLinkActive
  ]
})
export class LayoutModule { }
