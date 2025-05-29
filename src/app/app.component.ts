import  Aura  from '@primeng/themes/aura';
import { Component } from '@angular/core';
import { SharedModule } from './shared/shared.module';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ThemeService } from './shared/services/theme.service';
import { updatePreset } from '@primeng/themes';
export const AmberPreset = updatePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fff8e1',  // very light amber
      100: '#ffecb3',
      200: '#ffe082',
      300: '#ffd54f',
      400: '#ffca28',
      500: '#ffc107',  // primary amber
      600: '#ffb300',
      700: '#ffa000',
      800: '#ff8f00',
      900: '#ff6f00',
    },
    surface: {
      background: '#fff8e1',
      card: '#ffffff',
      border: '#ffe082'
    },
    text: {
      primary: '#ff6f00',    // dark amber
      secondary: '#ffb300'   // medium amber
    }
  }
});
@Component({
  selector: 'app-root',
  imports: [SharedModule ,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dahab2';
   switchToStone() {
    this.themeService.setTheme(AmberPreset);
  }
  constructor( private themeService:ThemeService, private confirmationService:ConfirmationService,private messageService: MessageService){}
  confirm1(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure that you want to proceed?',
        header: 'Confirmation',
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptButtonProps: {
            label: 'Save',
        },
        accept: () => {
            this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
        },
        reject: () => {
            this.messageService.add({
                severity: 'error',
                summary: 'Rejected',
                detail: 'You have rejected',
                life: 3000,
            });
        },
    });
}
}
