import { Routes } from '@angular/router';
import { NewAdventurerComponent } from './containers/new-adventurer/new-adventurer.component';
import { ListAdventurer } from './containers/list-adventurer/list-adventurer';
import { UpdateAdventurer } from './containers/update-adventurer/update-adventurer';
import { NewUserComponent } from '../app/containers/new-user/new-user.component';
import { HomeComponent } from '../app/containers/home/home'
import { NewQuest } from './containers/new-quest/new-quest';
import { ListQuest } from './containers/list-quest/list-quest';
import { UpdateQuest } from './containers/update-quest/update-quest';
import { Login } from './containers/login/login';
import { authGuard } from './guard/auth-guard';
import { AssignQuest } from './containers/assign-quest/assign-quest';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    
    // Adventurer routes
    { path: 'adventurer/new', component: NewAdventurerComponent, canActivate: [authGuard] },
    { path: 'adventurers', component: ListAdventurer, canActivate: [authGuard]},
    { path: 'adventurer/:id', component: UpdateAdventurer, canActivate: [authGuard]},

    // User routes
    { path: 'user/new', component: NewUserComponent, canActivate: [authGuard] },
    { path: 'login', component: Login },

    // Quest routes
    { path: 'quest/new', component: NewQuest, canActivate: [authGuard] },
    { path: 'quests', component: ListQuest, canActivate: [authGuard] },
    { path: 'quest/:id', component: UpdateQuest, canActivate: [authGuard] },
    { path: 'quest/:id/assign', component: AssignQuest, canActivate: [authGuard] },
];
