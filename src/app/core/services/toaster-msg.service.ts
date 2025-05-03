import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToasterMsgService {
  constructor(private messageService: MessageService) { }

  showSuccess(msgDetails: string, summary: string = 'Success') {
    this.messageService.add({ severity: 'success', summary, detail: msgDetails });
  }
  
  showInfo(msgDetails: string, summary: string = 'Info') {
    this.messageService.add({ severity: 'info', summary, detail: msgDetails });
  }
  
  showWarn(msgDetails: string, summary: string = 'Warning') {
    this.messageService.add({ severity: 'warn', summary, detail: msgDetails });
  }
  
  showError(msgDetails: string, summary: string = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail: msgDetails });
  }
  
  showContrast(msgDetails: string, summary: string = 'Contrast') {
    this.messageService.add({ severity: 'contrast', summary, detail: msgDetails });
  }
  
  showSecondary(msgDetails: string, summary: string = 'Secondary') {
    this.messageService.add({ severity: 'secondary', summary, detail: msgDetails });
  }  
}
