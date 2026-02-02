import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdventurerAvailabilityService } from '../../services/adventurer-availability/adventurer-availability.service';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { Adventurer } from '../../models/adventurer';
import { 
  AdventurerAvailability, 
  AdventurerRest, 
  CreateAdventurerRestData, 
  DayStatus, 
  DayStatusType, 
  RestType 
} from '../../models/adventurer-availability';
import { FormRestPeriod } from '../../components/form-rest-period/form-rest-period';

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  status: DayStatusType;
  events: any[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'app-adventurer-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FormRestPeriod],
  templateUrl: './adventurer-schedule.html',
  styleUrl: './adventurer-schedule.scss'
})
export class AdventurerSchedule implements OnInit {
  adventurers: Adventurer[] = [];
  selectedAdventurerId: number | null = null;
  selectedAdventurer: Adventurer | null = null;
  
  currentDate = new Date();
  currentMonth: Date = new Date();
  calendarWeeks: CalendarWeek[] = [];
  schedule: DayStatus[] = [];
  availability: AdventurerAvailability | null = null;
  
  restPeriods: AdventurerRest[] = [];
  showAddRestForm = false;
  editingRest: AdventurerRest | null = null;
  
  viewMode: 'calendar' | 'list' = 'calendar';
  
  statusColors: Record<DayStatusType, string> = {
    available: '#4CAF50',
    mission: '#2196F3',
    rest: '#FF9800',
    unavailable: '#f44336',
    mission_rest: '#9C27B0'
  };
  
  statusLabels: Record<DayStatusType, string> = {
    available: 'Disponible',
    mission: 'En mission',
    rest: 'Repos',
    unavailable: 'Indisponible',
    mission_rest: 'Repos post-mission'
  };

  constructor(
    private readonly adventurerService: AdventurerService,
    private readonly availabilityService: AdventurerAvailabilityService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadAdventurers();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedAdventurerId = +params['id'];
        this.onAdventurerChange();
      }
    });
  }

  loadAdventurers() {
    this.adventurerService.getAll().subscribe(adventurers => {
      this.adventurers = adventurers;
      if (this.selectedAdventurerId) {
        this.selectedAdventurer = adventurers.find(a => a.id === this.selectedAdventurerId) || null;
      }
    });
  }

  onAdventurerChange() {
    if (this.selectedAdventurerId) {
      this.selectedAdventurer = this.adventurers.find(a => a.id === this.selectedAdventurerId) || null;
      this.loadSchedule();
      this.loadRestPeriods();
    } else {
      this.selectedAdventurer = null;
      this.schedule = [];
      this.restPeriods = [];
      this.calendarWeeks = [];
    }
  }

  loadSchedule() {
    if (!this.selectedAdventurerId) return;
    
    const { startDate, endDate } = this.getMonthRange();
    
    this.availabilityService.getSchedule(this.selectedAdventurerId, startDate, endDate)
      .subscribe(schedule => {
        this.schedule = schedule;
        this.buildCalendar();
      });
    
    this.availabilityService.checkAvailability(this.selectedAdventurerId, startDate, endDate)
      .subscribe(availability => {
        this.availability = availability;
      });
  }

  loadRestPeriods() {
    if (!this.selectedAdventurerId) return;
    
    this.availabilityService.getRestPeriods(this.selectedAdventurerId)
      .subscribe(rests => {
        this.restPeriods = rests;
      });
  }

  getMonthRange(): { startDate: string; endDate: string } {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  }

  buildCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    
    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
    startDate.setDate(startDate.getDate() - diff);
    
    const weeks: CalendarWeek[] = [];
    const currentDate = new Date(startDate);
    
    // Build 6 weeks to cover all possible month layouts
    for (let w = 0; w < 6; w++) {
      const week: CalendarWeek = { days: [] };
      
      for (let d = 0; d < 7; d++) {
        const dateStr = this.formatDateLocal(currentDate);
        const daySchedule = this.schedule.find(s => s.date === dateStr);
        
        week.days.push({
          date: new Date(currentDate),
          dateStr,
          dayOfMonth: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          status: daySchedule?.status || 'available',
          events: daySchedule?.events || []
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
      
      if (currentDate > lastDayOfMonth && weeks.length >= 4) {
        break;
      }
    }
    
    this.calendarWeeks = weeks;
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.loadSchedule();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.loadSchedule();
  }

  goToToday() {
    this.currentMonth = new Date();
    this.loadSchedule();
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  getDayClass(day: CalendarDay): string {
    let classes = 'calendar-day';
    if (!day.isCurrentMonth) classes += ' other-month';
    if (day.dateStr === this.formatDateLocal(new Date())) classes += ' today';
    classes += ` status-${day.status}`;
    return classes;
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  getStatusColor(status: DayStatusType): string {
    return this.statusColors[status];
  }

  getStatusLabel(status: DayStatusType): string {
    return this.statusLabels[status];
  }

  getRestTypeLabel(type: RestType): string {
    const labels: Record<RestType, string> = {
      rest: 'Repos',
      unavailable: 'Indisponible',
      mission_rest: 'Repos post-mission'
    };
    return labels[type];
  }

  openAddRestForm() {
    this.editingRest = null;
    this.showAddRestForm = true;
  }

  openEditRestForm(rest: AdventurerRest) {
    this.editingRest = rest;
    this.showAddRestForm = true;
  }

  closeRestForm() {
    this.showAddRestForm = false;
    this.editingRest = null;
  }

  onRestFormSubmit(data: CreateAdventurerRestData) {
    if (this.editingRest) {
      this.availabilityService.updateRestPeriod(this.editingRest.id, data).subscribe(() => {
        this.closeRestForm();
        this.loadRestPeriods();
        this.loadSchedule();
      });
    } else {
      this.availabilityService.createRestPeriod(data).subscribe(() => {
        this.closeRestForm();
        this.loadRestPeriods();
        this.loadSchedule();
      });
    }
  }

  deleteRest(rest: AdventurerRest) {
    if (confirm(`Voulez-vous vraiment supprimer ce repos ?`)) {
      this.availabilityService.deleteRestPeriod(rest.id).subscribe(() => {
        this.loadRestPeriods();
        this.loadSchedule();
      });
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'calendar' ? 'list' : 'calendar';
  }
}
