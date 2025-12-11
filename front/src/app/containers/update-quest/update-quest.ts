import { QuestForm } from './../../models/quest';
import { Component, OnInit } from '@angular/core';
import { QuestService } from '../../services/quest/quest.service';
import { FormQuest } from '../../components/form-quest/form-quest';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-quest',
  imports: [FormQuest, ReactiveFormsModule],
  templateUrl: './update-quest.html',
  styleUrl: './update-quest.scss'
})
export class UpdateQuest implements OnInit {
  form = new FormGroup({
    recommendedXP: new FormControl(0)
  });

  constructor(
    private readonly questService: QuestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  quest!: QuestForm;
  id!: number;

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
      if (this.quest.statusId === 3) {
        this.router.navigate(['/quest', this.id, 'assign']);
      }
    });
  }

  onFormSubmitted(updatedQuest: QuestForm) {
    this.questService.updateQuest(this.id, updatedQuest).subscribe({
      next: (quest) => {
        this.router.navigate(['/quests']);
      },
      error: (error) => {
        console.error('Error updating quest:', error);
      }
    });
  }

  isAssistant(): boolean {
    return localStorage.getItem('role') === '1';
  }

  isClient(): boolean {
    return localStorage.getItem('role') === '2';
  }

  onValidate(): void {
    if (this.isAssistant()) {
      this.questService.validateQuest(this.id, this.form.value.recommendedXP ?? 0).subscribe({
        next: () => {
          this.router.navigate(['/quests']);
        },
        error: (error) => {
          console.error('Error validating quest:', error);
        }
      });
    }
  }

  onRefuse(): void {
    if (this.isAssistant()) {
      this.questService.refuseQuest(this.id).subscribe({
        next: () => {
          this.router.navigate(['/quests']);
        },
        error: (error) => {
          console.error('Error refusing quest:', error);
        }
      });
    }
  }

  onAbandon(): void {
    if (this.isClient()) {
      this.questService.abandonQuest(this.id).subscribe({
        next: () => {
          this.router.navigate(['/quests']);
        },
        error: (error) => {
          console.error('Error abandoning quest:', error);
        }
      });
    }
  }
}
