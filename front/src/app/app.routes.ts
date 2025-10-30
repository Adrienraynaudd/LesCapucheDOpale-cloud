import { Routes } from '@angular/router';
import { NewAdventurerComponent } from './containers/new-adventurer/new-adventurer.component';
import { ListAdventurer } from './containers/list-adventurer/list-adventurer';
import { UpdateAdventurer } from './containers/update-adventurer/update-adventurer';
import { NewUserComponent } from '../app/containers/new-user/new-user.component';
import { HomeComponent } from '../app/containers/home/home'
import { NewQuest } from './containers/new-quest/new-quest';
import { ListQuest } from './containers/list-quest/list-quest';
import { UpdateQuest } from './containers/update-quest/update-quest';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    
    // Adventurer routes
    { path: 'adventurer/new', component: NewAdventurerComponent },
    { path: 'adventurers', component: ListAdventurer },
    { path: 'adventurer/:id', component: UpdateAdventurer },

    // User routes
    { path: 'user/new', component: NewUserComponent },

    // Quest routes
    { path: 'quest/new', component: NewQuest },
    { path: 'quests', component: ListQuest },
    { path: 'quest/:id', component: UpdateQuest },
];