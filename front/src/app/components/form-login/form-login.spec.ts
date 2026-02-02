import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormLogin } from './form-login';
import { AccountService } from '../../services/account/account.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FormLogin', () => {
  let component: FormLogin;
  let fixture: ComponentFixture<FormLogin>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let router: Router;

  beforeEach(async () => {
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['login']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormLogin],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormLogin);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['formulaire'].value).toEqual({
      email: '',
      password: '',
    });
    expect(component['formulaire'].valid).toBeFalse();
  });

  it('should not call login if form is invalid', () => {
    component['formulaire'].patchValue({ email: '', password: '' });
    component.submitForm();
    expect(accountServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login and navigate on success', () => {
    const mockResponse = {
      access_token: 'abc123',
      username: 'John',
    };

    accountServiceSpy.login.and.returnValue(of(mockResponse));
    spyOn(localStorage, 'setItem');

    component['formulaire'].patchValue({
      email: 'john@example.com',
      password: 'Password1!',
    });

    component.submitForm();

    expect(accountServiceSpy.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'Password1!',
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
    expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'John');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show specific error message for 400', () => {
    accountServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 400 }))
    );

    component['formulaire'].patchValue({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    component.submitForm();

    expect(component['errorMessage']).toBe(
      'Adresse e-mail ou mot de passe incorrect.'
    );
  });

  it('should show specific error message for 401', () => {
    accountServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component['formulaire'].patchValue({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    component.submitForm();

    expect(component['errorMessage']).toBe(
      'Adresse e-mail ou mot de passe incorrect.'
    );
  });

  it('should show generic error message for other errors', () => {
    accountServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component['formulaire'].patchValue({
      email: 'john@example.com',
      password: 'Password1!',
    });

    component.submitForm();

    expect(component['errorMessage']).toBe(
      "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
    );
  });
});
