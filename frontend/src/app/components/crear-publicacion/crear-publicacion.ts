import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublicacionesApi } from '../../services/publicaciones-api';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Component({
  selector: 'app-crear-publicacion',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './crear-publicacion.html',
  styleUrl: './crear-publicacion.scss',
})
export class CrearPublicacion {
  private fb = inject(FormBuilder);
  private api = inject(PublicacionesApi);
  private ref = inject(MatDialogRef<CrearPublicacion>);

  archivo: File | null = null;
  enviando = false;
  error = '';

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(500)]],
  });

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.error = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      this.error = 'El archivo seleccionado debe ser una imagen válida (JPG, PNG, GIF, WEBP).';
      this.archivo = null;
      input.value = '';
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      this.error = 'La imagen seleccionada supera el límite máximo permitido de 10 MB.';
      this.archivo = null;
      input.value = '';
      return;
    }
    this.archivo = f;
  }

  quitarArchivo() {
    this.archivo = null;
    this.error = '';
  }

  publicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const fd = new FormData();
    fd.append('titulo', this.form.controls.titulo.value.trim());
    fd.append('mensaje', this.form.controls.mensaje.value.trim());
    if (this.archivo) {
      fd.append('imagen', this.archivo);
    }

    this.enviando = true;
    this.error = '';

    this.api.crear(fd).subscribe({
      next: () => this.ref.close(true),
      error: (e) => {
        this.enviando = false;
        if (e.status === 413) {
          this.error = 'La imagen o el contenido es demasiado pesado. El límite máximo es de 10 MB.';
        } else if (e.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Verificá tu conexión o que el backend esté corriendo.';
        } else if (Array.isArray(e.error?.message)) {
          this.error = e.error.message.join('. ');
        } else {
          this.error = e.error?.message ?? 'Ocurrió un error inesperado al publicar. Por favor, intentá nuevamente.';
        }
      },
    });
  }
}
