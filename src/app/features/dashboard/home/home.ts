import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  // CORRECCIÓN: Quitamos LucideAngularModule y dejamos LucideDynamicIcon igual que en el sidebar
  imports: [], 
  templateUrl: './home.html' 
})
export class Home {
}