import { Routes } from '@angular/router';
import { NewAdventurerComponent } from './containers/new-adventurer/new-adventurer.component';
import { ListAdventurer } from './containers/list-adventurer/list-adventurer';
import { UpdateAdventurer } from './containers/update-adventurer/update-adventurer';

export const routes: Routes = [
    { path: 'adventurer/new', component: NewAdventurerComponent },
    { path: 'adventurers', component: ListAdventurer},
    { path: 'adventurer/:id', component: UpdateAdventurer},
];
