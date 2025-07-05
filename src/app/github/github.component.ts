import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GithubService } from './github.service';

@Component({
  selector: 'app-github',
  templateUrl: './github.component.html'
})
export class GithubComponent implements OnInit {
  isConnected = false;
  userId: string = '';
  connectedAt: string = '';

  constructor(
    private githubService: GithubService,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['userId']) {
        this.userId = params['userId'];
        localStorage.setItem('userId', this.userId);
      } else {
        this.userId = localStorage.getItem('userId') || '';
      }

      if (this.userId) {
        this.githubService.getStatus(this.userId).subscribe((data: any) => {
          if (data) {
            this.isConnected = true;
            this.connectedAt = data.connectedAt;
          }
        });
      }
    });
  }

   connect(): void {
    this.githubService.getAuthUrl().subscribe((res: any) => {
      window.location.href = res.url;
    });
  }

  remove(): void {
    this.githubService.removeIntegration(this.userId).subscribe(() => {
      this.isConnected = false;
      this.connectedAt = '';
    });
  }

  reSync(): void {
    this.githubService.reSyncData(this.userId).subscribe(() => {
      alert('Re-sync completed');
    });
  }
}
