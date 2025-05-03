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
    this.confirmationService.confirm({
      message: options.message,
      header: options.header,
      icon: options.icon || 'pi pi-question-circle',
      target: options.target || undefined,
      acceptLabel: options.acceptLabel || 'Yes',
      rejectLabel: options.rejectLabel || 'No',
      acceptButtonProps: {
        label: options.acceptLabel || 'Yes',
        severity: 'danger',
      },
      rejectButtonProps: {
        label: options.rejectLabel || 'No',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        options.onAccept();
        this.messageService.add({
          severity: 'success',
          summary: 'Confirmed',
          detail: 'Action accepted',
        });
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
