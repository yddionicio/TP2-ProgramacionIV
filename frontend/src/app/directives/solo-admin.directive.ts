import { Directive, effect, inject, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Sesion } from '../services/sesion';

@Directive({
  selector: '[appSoloAdmin]',
  standalone: true,
})
export class SoloAdminDirective implements OnInit {
  private templateRef = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private sesion = inject(Sesion);
  private visible = false;

  constructor() {
    effect(() => {
      this.actualizar(this.sesion.esAdmin());
    });
  }

  ngOnInit() {
    this.actualizar(this.sesion.esAdmin());
  }

  private actualizar(esAdmin: boolean) {
    if (esAdmin && !this.visible) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.visible = true;
    } else if (!esAdmin && this.visible) {
      this.vcr.clear();
      this.visible = false;
    }
  }
}
