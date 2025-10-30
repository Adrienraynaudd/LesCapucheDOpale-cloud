import { Component, OnInit } from '@angular/core';
import { Quest } from '../../models/models';
import { QuestService } from '../../services/quest/quest.service';
import { Router } from '@angular/router';
import { ItemQuest } from '../../components/item-quest/item-quest';

@Component({
  selector: 'app-list-quest',
  imports: [ItemQuest],
  templateUrl: './list-quest.html',
  styleUrl: './list-quest.scss'
})
export class ListQuest implements OnInit {
  quests: Quest[] = [];

  constructor(
    private readonly questService: QuestService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.questService.getAllQuests().subscribe(quests => {
      this.quests = quests;
    });
  }

  onQuestClick(questId: number) {
    this.router.navigate(['/quest', questId]);
  }
}
