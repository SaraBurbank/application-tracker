import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { ApplicationService } from '../application.service';
import { Application, ApplicationStatus } from '../application.model';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
 
function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return inputDate > endOfToday ? { futureDate: true } : null;
  };
}

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrls: ['./form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);

  // If set, the form is in "edit" mode; otherwise it's "create" mode.
  applicationToEdit = input<Application | null>(null);
  // Pre-selects a status when creating via a column's "+" button.
  defaultStatus = input<ApplicationStatus | null>(null);
 
  saved = output<void>();
  cancelled = output<void>();
 
  readonly statuses: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
 
  submitting = signal(false);
  errorMessage = signal('');
 
  form = this.fb.group({
    company: ['', [Validators.required, Validators.minLength(2)]],
    role: ['', [Validators.required, Validators.minLength(2)]],
    status: ['Applied' as ApplicationStatus, Validators.required],
    dateApplied: ['', noFutureDateValidator()],
    link: ['', Validators.pattern(URL_PATTERN)],
    resumeUsed: [''],
    salaryRange: [''],
    notes: ['', Validators.maxLength(500)],
  });
 
  constructor() {
    effect(() => {
      const app = this.applicationToEdit();
      if (app) {
        this.form.patchValue({
          company: app.company,
          role: app.role,
          status: app.status,
          dateApplied: app.dateApplied?.substring(0, 10) ?? '',
          link: app.link ?? '',
          resumeUsed: app.resumeUsed ?? '',
          salaryRange: app.salaryRange ?? '',
          notes: app.notes ?? '',
        });
      } else {
        this.form.reset({ status: this.defaultStatus() ?? 'Applied' });
      }
    });
  }
 
  get isEditMode(): boolean {
    return !!this.applicationToEdit()?._id;
  }
  
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
 
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.submitting.set(true);
    this.errorMessage.set('');
    const formValue = this.form.getRawValue() as Application;
    formValue.link = this.normalizeLink(formValue.link);
 
    const editTarget = this.applicationToEdit();
    const request$ = this.isEditMode
      ? this.applicationService.update(editTarget!._id!, formValue)
      : this.applicationService.create(formValue);
 
    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set('Something went wrong saving this application.');
        console.error(err);
      },
    });
  }

  private normalizeLink(link: string | undefined): string | undefined {
    if (!link) return link;
    const trimmed = link.trim();
    if (!trimmed) return trimmed;
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
  }
 
  onCancel(): void {
    this.cancelled.emit();
  }
}