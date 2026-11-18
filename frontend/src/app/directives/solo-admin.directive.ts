import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { Sesion } from '../services/sesion';

@Directive({
  selector: '[appSoloAdmin]',
})
export class SoloAdminDirective {
  private templateRef = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private sesion = inject(Sesion);
  private visible = false;

  constructor() {
    effect(() => {
      const esAdmin = this.sesion.esAdmin();
      if (esAdmin && !this.visible) {
        this.vcr.createEmbeddedView(this.templateRef);
        this.visible = true;
      } else if (!esAdmin && this.visible) {
        this.vcr.clear();
        this.visible = false;
      }
    });
  }
}
