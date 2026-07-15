import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { AuthService } from '../Auth/auth.service';

// Cross-field validator to the group since it compares two sibling fields against each other
function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
//   styleUrls: ['./register.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submitting = signal(false);
  errorMessage = signal('');

  form = this.fb.group(
    {
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() }
  );

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get showPasswordMismatch(): boolean {
    const confirmControl = this.form.get('confirmPassword');
    return (
      this.form.hasError('passwordsMismatch') &&
      !!confirmControl &&
      (confirmControl.dirty || confirmControl.touched)
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const { name, email, password } = this.form.getRawValue();
    this.authService.register({ name: name || undefined, email: email!, password: password! }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/board']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.status === 409
            ? 'An account with this email already exists.'
            : 'Something went wrong creating your account.'
        );
      },
    });
  }
}