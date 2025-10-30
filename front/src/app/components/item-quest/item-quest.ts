import { Component, Input } from '@angular/core';
import { Quest } from '../../models/models';

@Component({
  selector: 'app-item-quest',
  imports: [],
  templateUrl: './item-quest.html',
  styleUrl: './item-quest.scss'
})
export class ItemQuest {
  @Input() quest!: Quest;

  getFinalDate() {
    return this.quest.finalDate.split('T')[0];
  }
}
