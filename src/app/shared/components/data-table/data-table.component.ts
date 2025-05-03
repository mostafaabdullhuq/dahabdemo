import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-data-table',
  standalone:false,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit {
  @Input() data!: any[];
  @Input() cols!: any[];
  @Input() totalRecords!: number;
  @Input() first!: number;
  @Input() rows!: number;
  @Output() pageChange: EventEmitter<any> = new EventEmitter();
  @Input() contextMenuItems: MenuItem[] = [];

  selectedRow: any;
@Output() rowSelected = new EventEmitter<any>();


onContextMenuRowSelect(row: any) {
  this.selectedRow = row;
  this.rowSelected.emit(row);
}

  ngOnInit() {
  }

  onPageChange(event: any): void {
    this.pageChange.emit(event);
  }

  viewRow(row: any): void {
    console.log('Viewing:', row);
    // Trigger a custom output or action
  }

  deleteRow(row: any): void {
    console.log('Deleting:', row);
    this.data = this.data.filter(r => r.id !== row.id); // Or emit to parent to handle
  }
}

