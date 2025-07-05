import { Component, OnInit } from '@angular/core';
import { GithubDataService } from './github-data.service';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-github-viewer',
  templateUrl: './github-viewer.component.html',
})
export class GithubViewerComponent implements OnInit {
  activeTab = 'integration';
  integrations = ['GitHub'];
  collections: string[] = [];
  selectedCollection = '';
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  total = 0;
  page = 1;
  pageSize = 50;
  search = '';
  gridApi!: GridApi;
  gridOptions: GridOptions = {};
  selectedTabIndex = 0;
  

  constructor(private githubService: GithubDataService) {}

  ngOnInit(): void {
    
  this.githubService.getCollections().subscribe(cols => {
    this.collections = cols;
    if (cols.length > 0) {
      this.selectedCollection = cols[0];       // Set default collection
      this.fetchData();                        // Fetch data immediately
    }
  });
}


  onTabChange(index: number) {
  this.selectedTabIndex = index;
  this.activeTab = index === 0 ? 'integration' : 'analytics';
  }

  onCollectionChange() {
    this.fetchData();
  }

  onSearchChange() {
    this.githubService.globalSearch(this.search).subscribe(console.log);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchData();
  }

fetchData() {
  console.log('📦 Fetching data for collection:', this.selectedCollection);
  this.githubService.getCollectionData(this.selectedCollection, this.page, this.pageSize)
    .subscribe(res => {
      console.log('✅ Data response:', res);
      console.log('📊 Columns:', this.columnDefs);

      if (res.data.length > 0) {
  const sample = res.data[0];
  const flatKeys = Object.keys(sample).filter(k => typeof sample[k] !== 'object');
  console.log('Flat keys used for columns:', flatKeys);

  this.columnDefs = flatKeys.map(key => ({
    field: key,
    filter: true,
    sortable: true,
  }));

  this.rowData = res.data;
} else {
  this.columnDefs = [];
  this.rowData = [];
}
    }, err => {
      console.error('❌ Error fetching data:', err);
    });
}





}