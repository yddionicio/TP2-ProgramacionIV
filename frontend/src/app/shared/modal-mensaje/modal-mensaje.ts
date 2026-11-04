import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ModalData {
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-modal-mensaje',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './modal-mensaje.html',
  styleUrl: './modal-mensaje.scss',
})
export class ModalMensaje {
  data = inject<ModalData>(MAT_DIALOG_DATA);
}