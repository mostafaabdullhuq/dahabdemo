import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PosService } from '../@services/pos.service';
import { FormBuilder } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-close-shift-report',
  imports: [SharedModule],
  templateUrl: './close-shift-report.component.html',
  styleUrl: './close-shift-report.component.scss'
})
export class CloseShiftReportComponent implements OnInit{
  visible: boolean = false;
  orgImg:any = JSON.parse(localStorage.getItem('user')|| '')?.image;
  reportData:any = {};
  @Output() onSubmitPayments = new EventEmitter<any[]>();

  constructor( private _formBuilder: FormBuilder, private _posService: PosService) { }

  ngOnInit(): void {
   this.getReportData()
  }
 
  showDialog() {
    this.visible = true;
  }
getReportData(){
  this._posService.getShiftReport().subscribe(res=>{
this.reportData = res
  })
}

printInvoice() {
  const printContents = document.getElementById('reoprt-section')?.innerHTML;
  const originalContents = document.body.innerHTML;

  if (printContents) {
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    // window.location.reload(); // reload to restore Angular bindings
  }
}
}
