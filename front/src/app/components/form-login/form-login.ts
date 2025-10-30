import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule , Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { AccountService } from '../../services/account/account.service';

@Component({
  selector: 'app-form-login',
  imports: [RouterModule, ReactiveFormsModule, NgIf],
  templateUrl: './form-login.html',
  styleUrl: './form-login.scss'
})
export class FormLogin {

  protected formulaire: FormGroup;
  protected errorMessage: string = '';

  constructor(private readonly router: Router, private readonly AuthService: AccountService, private readonly formBuilder: FormBuilder) {
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
        
        this.router.navigate(['/']);
      },
      error: (error) => {
        if ([401, 400].includes(error.status)) {
          this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
        } else {
          this.errorMessage = 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer.';
        }
      },
    });
  }
}