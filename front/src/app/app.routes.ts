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
import { NewEquipment } from './containers/new-equipment/new-equipment';
import { ListEquipment } from './containers/list-equipment/list-equipment';
import { UpdateEquipment } from './containers/update-equipment/update-equipment';
import { Stock } from './containers/stock/stock';
import { NewConsumable } from './containers/new-consumable/new-consumable';
import { UpdateConsumable } from './containers/update-consumable/update-consumable';
import { ListConsumable } from './containers/list-consumable/list-consumable';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    
    // Adventurer
    { path: 'adventurer/new', component: NewAdventurerComponent, canActivate: [authGuard] },
    { path: 'adventurers', component: ListAdventurer, canActivate: [authGuard]},
    { path: 'adventurer/:id', component: UpdateAdventurer, canActivate: [authGuard]},

    // User
    { path: 'user/new', component: NewUserComponent},
    { path: 'login', component: Login },

    // Stock
    { path: 'stock', component: Stock, canActivate: [authGuard] },

    // Equipment
    { path: 'equipment/new', component: NewEquipment, canActivate: [authGuard] },
    { path: 'equipments', component: ListEquipment, canActivate: [authGuard]},
    { path: 'equipment/:id', component: UpdateEquipment, canActivate: [authGuard] },

    // Consumable
    { path: 'consumable/new', component: NewConsumable, canActivate: [authGuard] },
    { path: 'consumable/:id', component: UpdateConsumable, canActivate: [authGuard] },
    { path: 'consumables', component: ListConsumable, canActivate: [authGuard] },

    // Quest
    { path: 'quest/new', component: NewQuest, canActivate: [authGuard] },
    { path: 'quests', component: ListQuest, canActivate: [authGuard] },
    { path: 'quest/:id', component: UpdateQuest, canActivate: [authGuard] },
    { path: 'quest/:id/assign', component: AssignQuest, canActivate: [authGuard] },
];
