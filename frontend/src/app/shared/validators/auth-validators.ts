import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repetirPassword = control.get('repetirPassword')?.value;
  if (!password || !repetirPassword) return null;
  return password === repetirPassword ? null : { noCoinciden: true };
}
