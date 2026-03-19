import { Component, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { AccountService } from '../../services/account/account.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './form-login.html',
  styleUrl: './form-login.scss',
  encapsulation: ViewEncapsulation.None
})
export class FormLogin {
  protected formulaire: FormGroup;
  protected errorMessage: string = '';
  protected readonly githubAuthUrl = `${environment.apiUrl}/auth/github`;

  constructor(
    private readonly router: Router,
    private readonly AuthService: AccountService,
    private readonly formBuilder: FormBuilder
  ) {
    this.formulaire = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submitForm() {
  
    if (this.formulaire.invalid) return;
    const user = {
      email: this.formulaire.value.email,
      password: this.formulaire.value.password,
    };
    this.AuthService.login(user).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('username', response.username);
        
        this.router.navigate(['/']);
      },
      error: (error) => {
        if ([401, 400].includes(error.status)) {
          this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
        } else {
          this.errorMessage =
            "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
        }
      },
    });
  }

  loginWithGithub() {
    window.location.href = this.githubAuthUrl;
  }
}
