import { Component, OnInit } from '@angular/core';
import { Adventurer, Quest } from '../../models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestService } from '../../services/quest/quest.service';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { ItemAdventurer } from '../../components/item-adventurer/item-adventurer';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-assign-quest',
  imports: [ItemAdventurer, DatePipe],
  templateUrl: './assign-quest.html',
  styleUrl: './assign-quest.scss'
})
export class AssignQuest implements OnInit {

  constructor(
    private readonly questService: QuestService,
    private readonly adventurerService: AdventurerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) { }

  quest!: Quest;
  id!: number;
  adventurers: Adventurer[] = [];
  selectedAdventurerIds: Set<number> = new Set<number>();
  cost: number = 0;
  successRateForAdventurer: { [adventurerId: number]: number } = {};

  ngOnInit() {
    const idStr = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : -1;

    if (!idStr || !/^\d+$/.test(idStr) || this.id < 0 || isNaN(this.id)) {
      console.error('Invalid quest ID');
      this.router.navigate(['/quests']);
      return;
    }

    this.questService.getQuestById(this.id).subscribe((quest) => {
      this.quest = quest;
      if (quest.statusId !== 3) {
        this.router.navigate(['/quest/', this.id]);
        return;
      }
      this.selectedAdventurerIds = new Set<number>(quest.adventurers.map(a => a.id));
      this.cost = quest.adventurers.reduce(
        (sum, a) => sum + a.dailyRate * quest.estimatedDuration,
        0
      );
      for (const adventurer of quest.adventurers) {
        this.successRateForAdventurer[adventurer.id] = Math.min(
          this.quest.recommendedXP,
          adventurer.experience
        ) / this.quest.recommendedXP;
      }
    });

    this.adventurerService.getAll().subscribe((adventurers) => {
      this.adventurers = adventurers;
    });
  }

  onToggleAdventurer(adventurer: Adventurer) {
    if (this.selectedAdventurerIds.has(adventurer.id)) {
      this.questService.unassignAdventurer(this.id, adventurer.id).subscribe({
        next: () => {
          this.selectedAdventurerIds.delete(adventurer.id);
          this.cost -= adventurer.dailyRate * this.quest.estimatedDuration;
          delete this.successRateForAdventurer[adventurer.id];
        }
      });
    } else {
      this.questService.assignAdventurer(this.id, adventurer.id).subscribe({
        next: () => {
          this.selectedAdventurerIds.add(adventurer.id);
          this.cost += adventurer.dailyRate * this.quest.estimatedDuration;
          this.successRateForAdventurer[adventurer.id] = Math.min(
            this.quest.recommendedXP,
            adventurer.experience
          ) / this.quest.recommendedXP;
        }
      });
    }
  }

  get costBreakdown() {
    return {
      po: Math.floor(this.cost / 100),
      pa: Math.floor((this.cost % 100) / 10),
      pc: this.cost % 10
    };
  }

  get rewardBreakdown() {
    return {
      po: Math.floor(this.quest.reward / 100),
      pa: Math.floor((this.quest.reward % 100) / 10),
      pc: this.quest.reward % 10
    };
  }

  get successRate(): number {
    const totalSuccess = Object.values(this.successRateForAdventurer).reduce((sum, rate) => sum + rate, 0);
    const totalAdventurers = Object.keys(this.successRateForAdventurer).length;
    return totalAdventurers > 0 ? Math.round((Math.min(1, totalSuccess / Math.max(1,totalAdventurers*0.8)) * 80) * 100) / 100 : 0;
  }
}
