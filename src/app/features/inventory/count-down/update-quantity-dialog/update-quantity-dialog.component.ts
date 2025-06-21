import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-update-quantity-dialog',
  imports: [SharedModule],
  templateUrl: './update-quantity-dialog.component.html',
  styleUrl: './update-quantity-dialog.component.scss'
})
export class UpdateQuantityDialogComponent {
  @Input() visible: boolean = false;
  @Input() quantity: number | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<number>();

  onClose() {
    this.visibleChange.emit(false);
  }

  onSave() {
    if (this.quantity !== null) {
      this.save.emit(this.quantity);
      this.visibleChange.emit(false);
    }
  }
}