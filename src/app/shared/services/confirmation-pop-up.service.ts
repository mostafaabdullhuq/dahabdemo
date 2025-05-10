import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationPopUpService {
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

 
  confirm(options: {
    message: string;
    header: string;
    icon?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    onAccept: () => void;
    onReject?: () => void;
    target?: EventTarget | null;
  }) {
    // Before showing the dialog, blur the active element to prevent focus retention
    (document.activeElement as HTMLElement)?.blur();

    this.confirmationService.confirm({
      target: options.target || undefined,
      message: options.message,
      header: options.header,
      icon: options.icon || 'pi pi-question-circle',
      acceptLabel: options.acceptLabel || 'Yes',
      rejectLabel: options.rejectLabel || 'No',
      accept: () => {
        options.onAccept();
      },
      reject: () => {
        options.onReject?.();
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled',
        });
      },
    });
  }
}