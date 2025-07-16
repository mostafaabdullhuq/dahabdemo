import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PermissionService } from '../../../core/services/permission.service';
import { Subscription } from 'rxjs';
import { LiveGoldRatesService, GoldPrices } from '../../../shared/services/live-gold-rates.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  items: MenuItem[] | undefined;
  businessName: string = JSON.parse(localStorage.getItem('user') || '')?.business_name;
  private permissionService = inject(PermissionService)
  private pricesSubscription!: Subscription;
  currentGoldRates: GoldPrices = {
    price_gram_18k: null,
    price_gram_21k: null,
    price_gram_22k: null,
    price_gram_24k: null
  }

  constructor(
    private liveGoldRatesService: LiveGoldRatesService
  ) {
    this.items = [];

    if (this.permissionService.hasPermission(100)) {
      this.items.push({
        label: 'POS',
        icon: 'pi pi-money-bill',
        link: 'pos'
      });
    }

    this.items.push({
      label: 'Chats',
      icon: 'pi pi-comments',
      badge: '3',
      items: [
        {
          label: 'Team Chat',
          icon: 'pi pi-bolt',
        },
        {
          label: 'Support Chat',
          icon: 'pi pi-server',
        },
      ],
    });
  }

  ngOnInit() {
    this.setupPriceSubscription();
  }

  private setupPriceSubscription(): void {
    console.log('[Navbar] Subscribing to gold price updates');
    this.pricesSubscription = this.liveGoldRatesService.currentPrices$.subscribe(
      prices => {
        this.currentGoldRates = prices;
      }
    );
  }

  ngOnDestroy(): void {
    this.pricesSubscription?.unsubscribe();
  }
}
