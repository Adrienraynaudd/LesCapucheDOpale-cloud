import { QuestForm } from './../../models/quest';
import { Component, OnInit } from '@angular/core';
import { QuestService } from '../../services/quest/quest.service';
import { FormQuest } from '../../components/form-quest/form-quest';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-quest',
  imports: [FormQuest],
  templateUrl: './update-quest.html',
  styleUrl: './update-quest.scss'
})
export class UpdateQuest implements OnInit {
  constructor(
    private readonly questService: QuestService,
    private readonly route: ActivatedRoute
  ) {}

  quest!: QuestForm;
  id!: number;

  ngOnInit() {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : -1;

    if (!idStr || !/^\d+$/.test(idStr) || this.id < 0 || isNaN(this.id)) {
      console.error('Invalid adventurer ID');
      return;
    }

    this.questService.getQuestById(this.id).subscribe((quest) => {
      this.quest = quest;
    });
  }

  onFormSubmitted(updatedQuest: QuestForm) {
    this.questService.updateQuest(this.id, updatedQuest).subscribe();
  }
}
