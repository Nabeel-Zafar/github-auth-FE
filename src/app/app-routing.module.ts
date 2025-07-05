import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GithubComponent } from './github/github.component';
import { GithubViewerComponent } from './github/github-viewer.component';

const routes: Routes = [
  { path: '', component: GithubComponent },
  { path: 'viewer', component: GithubViewerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
