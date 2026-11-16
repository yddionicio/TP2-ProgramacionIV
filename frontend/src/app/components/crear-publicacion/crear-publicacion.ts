import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublicacionesApi } from '../../services/publicaciones-api';

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
    const f = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.error = '';
    if (f && !f.type.startsWith('image/')) { this.error = 'El archivo debe ser una imagen'; this.archivo = null; return; }
    if (f && f.size > 3 * 1024 * 1024) { this.error = 'La imagen no puede superar los 3 MB'; this.archivo = null; return; }
    this.archivo = f;
  }

  publicar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const fd = new FormData();
    fd.append('titulo', this.form.controls.titulo.value);
    fd.append('mensaje', this.form.controls.mensaje.value);
    if (this.archivo) fd.append('imagen', this.archivo); // mismo nombre que en el FileInterceptor

    this.enviando = true;
    this.api.crear(fd).subscribe({
      next: () => this.ref.close(true),
      error: (e) => {
        this.enviando = false;
        this.error = Array.isArray(e.error?.message) ? e.error.message.join('. ') : (e.error?.message ?? 'No se pudo publicar');
      },
    });
  }
}