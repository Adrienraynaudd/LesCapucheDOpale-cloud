import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancesService } from '../../services/finances/finances.service';
import { QuestService } from '../../services/quest/quest.service';
import { Transaction, FinanceStats, CreateTransactionDto } from '../../models/finance';
import { Quest } from '../../models/quest';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.scss'
})
export class FinancesComponent implements OnInit {
  balance: number = 0;
  transactions: Transaction[] = [];
  statistics: FinanceStats | null = null;
  totalCount: number = 0;
  pendingQuests: Quest[] = [];
  totalPendingRewards: number = 0;

  newTransaction: CreateTransactionDto = {
    amount: 0,
    description: ''
  };

  skip: number = 0;
  take: number = 10;

  // Configuration du graphique de prédictions
  predictionChartType: ChartType = 'bar';
  predictionChartData: ChartConfiguration['data'] = {
    labels: ['Après quêtes en cours'],
    datasets: []
  };
  predictionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Prédiction du solde après les quêtes en cours'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Pièces d\'or'
        }
      }
    }
  };

  constructor(
    private readonly financesService: FinancesService,
    private readonly questService: QuestService
  ) {}

  ngOnInit(): void {
    this.loadBalance();
    this.loadHistory();
    this.loadStatistics();
    this.loadPendingQuests();
  }

  loadBalance(): void {
    this.financesService.getBalance().subscribe({
      next: (response) => {
        this.balance = response.balance;
      },
      error: (err) => console.error('Erreur lors du chargement du solde', err)
    });
  }

  loadHistory(): void {
    this.financesService.getHistory(this.skip, this.take).subscribe({
      next: (response) => {
        this.transactions = response.transactions;
        this.totalCount = response.totalCount;
      },
      error: (err) => console.error('Erreur lors du chargement de l\'historique', err)
    });
  }

  loadStatistics(): void {
    this.financesService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => console.error('Erreur lors du chargement des statistiques', err)
    });
  }

  submitTransaction(): void {
    if (!this.newTransaction.description || this.newTransaction.amount === 0) {
      return;
    }

    this.financesService.postTransaction(this.newTransaction).subscribe({
      next: () => {
        this.loadBalance();
        this.loadHistory();
        this.loadStatistics();
        this.loadPendingQuests();
        this.newTransaction = { amount: 0, description: '' };
      },
      error: (err) => console.error('Erreur lors de l\'ajout de la transaction', err)
    });
  }

  nextPage(): void {
    if (this.skip + this.take < this.totalCount) {
      this.skip += this.take;
      this.loadHistory();
    }
  }

  previousPage(): void {
    if (this.skip > 0) {
      this.skip = Math.max(0, this.skip - this.take);
      this.loadHistory();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadPendingQuests(): void {
    this.questService.getAllQuests().subscribe({
      next: (quests) => {
        this.pendingQuests = quests.filter(q => q.statusId === 4);
        this.updatePredictionChart();
      },
      error: (err) => console.error('Erreur lors du chargement des quêtes', err)
    });
  }

  updatePredictionChart(): void {
    this.totalPendingRewards = this.pendingQuests.reduce((sum, q) => sum + q.reward, 0);

    let totalSalaryCost = 0;
    for (const quest of this.pendingQuests) {
      for (const adventurer of quest.adventurers || []) {
        totalSalaryCost += (adventurer.dailyRate || 0) * quest.estimatedDuration;
      }
    }
    console.log('Total salary cost:', totalSalaryCost);
    
    // Scénario Optimiste: toutes les quêtes réussies
    // +80% des récompenses - 100% des salaires
    const optimisticGain = (this.totalPendingRewards * 0.8) - totalSalaryCost;
    
    // Scénario Pessimiste: toutes les quêtes échouées
    // 0 récompense supplémentaire - 40% des salaires
    const pessimisticGain = -(totalSalaryCost * 0.4);
    
    // Scénario Réaliste: 80% des quêtes réussies, 20% échouées
    // 80% * (+80% récompense - 100% salaires) + 20% * (-40% salaires)
    const realisticGain = (0.8 * ((this.totalPendingRewards * 0.8) - totalSalaryCost)) + (0.2 * (-(totalSalaryCost * 0.4)));

    this.predictionChartData = {
      labels: ['Après quêtes en cours'],
      datasets: [
        {
          label: 'Optimiste (100% réussies)',
          data: [this.balance + optimisticGain],
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#4caf50',
          borderWidth: 2
        },
        {
          label: 'Réaliste (80% réussies)',
          data: [this.balance + realisticGain],
          backgroundColor: 'rgba(33, 150, 243, 0.7)',
          borderColor: '#2196f3',
          borderWidth: 2
        },
        {
          label: 'Pessimiste (0% réussies)',
          data: [this.balance + pessimisticGain],
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: '#f44336',
          borderWidth: 2
        }
      ]
    };
  }
}
