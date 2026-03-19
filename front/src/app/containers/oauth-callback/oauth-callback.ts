import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { AccountService } from '../../services/account/account.service';
// import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-oauth-callback',
  imports: [RouterLink],
  templateUrl: './oauth-callback.html',
  styleUrl: './oauth-callback.scss',
})
export class OauthCallback implements OnInit {
  protected statusMessage = 'Connexion GitHub en cours...';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountService: AccountService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('access_token');
    const username = this.route.snapshot.queryParamMap.get('username');

    if (!token) {
      this.fail('Token OAuth manquant. Merci de réessayer.');
      return;
    }

    localStorage.setItem('token', token);
    if (username) {
      localStorage.setItem('username', username);
    }

    this.accountService.isLogin().subscribe({
      next: (response) => {
        if (!response || response === false) {
          this.fail('Session invalide. Merci de vous reconnecter.');
          return;
        }

        localStorage.setItem('role', String(response.roleId));
        this.router.navigate(['/'], { replaceUrl: true });
      },
      error: () => {
        this.fail('Connexion impossible. Merci de réessayer.');
      },
    });
  }

  private fail(message: string): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.statusMessage = message;
  }
}
