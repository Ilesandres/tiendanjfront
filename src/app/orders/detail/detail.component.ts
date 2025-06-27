import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class DetailComponent implements OnInit {
  order: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(parseInt(id));
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(id).subscribe({
      next: (order: any) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la orden';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
