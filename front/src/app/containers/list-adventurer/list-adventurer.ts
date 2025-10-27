import { Component, OnInit } from '@angular/core';
import { Adventurer } from '../../models/adventurer';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { ItemAdventurer } from '../../components/item-adventurer/item-adventurer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-adventurer',
  imports: [ItemAdventurer],
  templateUrl: './list-adventurer.html',
  styleUrl: './list-adventurer.scss'
})
export class ListAdventurer implements OnInit {
  adventurers: Adventurer[] = [];

  constructor(
    private readonly adventurerService: AdventurerService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.adventurerService.getAll().subscribe(adventurers => {
      this.adventurers = adventurers;
    });
  }

  onAdventurerClick(adventurerId: number) {
    this.router.navigate(['/adventurer', adventurerId]);
  }
}
