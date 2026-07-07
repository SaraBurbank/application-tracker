import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationService } from '../application.service';
import { Application, ApplicationStatus } from '../application.model';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './applicationForm.html',
  // styleUrls: ['./applicationForm.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);

  // If set, the form is in "edit" mode; otherwise it's "create" mode.
  applicationToEdit = input<Application | null>(null);

  saved = output<void>();
  cancelled = output<void>();

  readonly statuses: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

  submitting = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: ['Applied' as ApplicationStatus, Validators.required],
    dateApplied: [''],
    link: [''],
    contactName: [''],
    salaryRange: [''],
    notes: [''],
  });

  constructor() {
    // Reacts whenever the `applicationToEdit` input changes, replacing
    // the old ngOnChanges lifecycle hook.
    effect(() => {
      const app = this.applicationToEdit();
      if (app) {
        this.form.patchValue({
          company: app.company,
          role: app.role,
          status: app.status,
          dateApplied: app.dateApplied?.substring(0, 10) ?? '',
          link: app.link ?? '',
          contactName: app.contactName ?? '',
          salaryRange: app.salaryRange ?? '',
          notes: app.notes ?? '',
        });
      } else {
        this.form.reset({ status: 'Applied' });
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.applicationToEdit()?._id;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    const formValue = this.form.getRawValue() as Application;

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

  onCancel(): void {
    this.cancelled.emit();
  }
}
