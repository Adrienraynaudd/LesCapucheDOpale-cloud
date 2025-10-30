import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormLogin } from './form-login';
import { AccountService } from '../../services/account/account.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FormLogin', () => {
  let component: FormLogin;
  let fixture: ComponentFixture<FormLogin>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // 🔹 Création des mocks
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormLogin],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect((component as any).formulaire.value).toEqual({
      email: '',
      password: '',
    });
    expect((component as any).formulaire.valid).toBeFalse();
  });

  it('should mark form as invalid if email or password missing', () => {
    (component as any).formulaire.patchValue({ email: '', password: '' });
    expect((component as any).formulaire.invalid).toBeTrue();
  });

  it('should mark form as valid with correct values', () => {
    (component as any).formulaire.patchValue({
      email: 'john@example.com',
      password: 'Password1!',
    });
    expect((component as any).formulaire.valid).toBeTrue();
  });

  it('should not call login if form is invalid', () => {
    (component as any).formulaire.patchValue({ email: '', password: '' });
    component.submitForm();
    expect(accountServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login with form data when form is valid', () => {
    // ✅ Le composant attend un champ access_token
    const mockResponse = { access_token: 'abc123' };
    accountServiceSpy.login.and.returnValue(of(mockResponse));

    spyOn(localStorage, 'setItem');

    (component as any).formulaire.patchValue({
      email: 'john@example.com',
      password: 'Password1!',
    });

    component.submitForm();

    expect(accountServiceSpy.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'Password1!',
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show specific error message for 401 or 400 status', () => {
    const mockError = { status: 401 };
    accountServiceSpy.login.and.returnValue(throwError(() => mockError));

    (component as any).formulaire.patchValue({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    component.submitForm();

    expect((component as any).errorMessage).toBe(
      'Adresse e-mail ou mot de passe incorrect.'
    );
  });

  it('should show generic error message for other errors', () => {
    const mockError = { status: 500 };
    accountServiceSpy.login.and.returnValue(throwError(() => mockError));

    (component as any).formulaire.patchValue({
      email: 'john@example.com',
      password: 'Password1!',
    });

    component.submitForm();

    expect((component as any).errorMessage).toBe(
      "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
    );
  });

  it('should not set token or navigate if login request fails', () => {
    const mockError = { status: 400 };
    accountServiceSpy.login.and.returnValue(throwError(() => mockError));

    spyOn(localStorage, 'setItem');

    (component as any).formulaire.patchValue({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    component.submitForm();

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
