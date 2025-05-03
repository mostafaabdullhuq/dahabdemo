import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-filter-collapse',
  standalone:false,
  templateUrl: './filter-collapse.component.html',
  styleUrl: './filter-collapse.component.scss'
})
export class FilterCollapseComponent {
  @Input() title:string = 'Filter'
}
