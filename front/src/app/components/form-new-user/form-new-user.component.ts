import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {AccountService} from '../../services/account/account.service'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-form-new-user',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, RouterModule],
  templateUrl: './form-new-user.component.html',
  styleUrl: './form-new-user.component.scss',
})
export class FormNewUserComponent {
  selectedOption = 2;
  errorMessage = '';
  roles: number[] = [1, 2];    
  formSignUp = new FormGroup({
    role: new FormControl(this.roles[0], [Validators.required]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$')]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(private accountService: AccountService, private readonly router: Router,) {
    
  }


  onSubmit() {
    if (this.formSignUp.invalid) {
      this.errorMessage = 'Le formulaire est invalide. Veuillez vérifier les champs.';
      if (this.formSignUp.controls['username'].invalid) {
        this.errorMessage = 'Le nom d\'utilisateur doit contenir au moins 3 caractères.';
      } 
      else if (this.formSignUp.controls['email'].invalid) {
        this.errorMessage = 'L\'adresse e-mail n\'est pas valide.';
      }
      else if (this.formSignUp.controls['password'].invalid) {
        this.errorMessage = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial";
      }
      else if (this.formSignUp.controls['confirmPassword'].value !== this.formSignUp.controls['password'].value) {
        this.errorMessage = 'Le mot de passe et la confirmation doivent être identiques';
      }
    }
    else {
      const user = {
        roleId : +this.formSignUp.value.role!,
        name : this.formSignUp.value.username,
        email : this.formSignUp.value.email,
        password : this.formSignUp.value.password
      };
      this.accountService.signUp(user).subscribe({
        next: (response) => {
          this.errorMessage = 'L\'utilisateur a été créé avec succès.';
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = 'Une erreur est survenue lors de la création de l\'utilisateur.';
        }
      });

    }
  }

}
