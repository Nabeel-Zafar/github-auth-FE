import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubDataService } from './github-data.service';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-github-viewer',
  templateUrl: './github-viewer.component.html',
  styleUrls: ['./github-viewer.component.css']
})
export class GithubViewerComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
  selectedTabIndex = 0;
  loading = false;

  public defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: false,
    floatingFilter: false,
    flex: 1,
    minWidth: 320,
    cellStyle: { 
      'margin-top': '10px',
      'align-items': 'center',
      'font-size': '14px',
      'color': 'rgba(0, 0, 0, 0.87)',
    },
    headerClass: 'ag-header-cell'
  };

  public gridOptions: GridOptions = {
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    rowHeight: 48,
    headerHeight: 56,
    suppressDragLeaveHidesColumns: true,
    suppressMovableColumns: true,
    animateRows: true,
    enableCellTextSelection: true,
    getContextMenuItems: this.getContextMenuItems.bind(this)
  };

  constructor(private githubService: GithubDataService) {}

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections() {
    this.githubService.getCollections().subscribe(cols => {
      this.collections = cols;
      if (cols.length > 0) {
        this.selectedCollection = cols[0];
        this.fetchData();
      }
    });
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.activeTab = index === 0 ? 'integration' : 'analytics';
  }

  onCollectionChange() {
    this.page = 1;
    this.fetchData();
  }

  onSearchChange() {
    this.githubService.globalSearch(this.search).subscribe(console.log);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
     setTimeout(() => {
    this.gridApi.resetRowHeights();
  });
    window.addEventListener('resize', () => {
      setTimeout(() => params.api.sizeColumnsToFit());
    });
  }

  getRowHeight = (params: any) => {
  if (params.data && params.data.name) {
    const lineHeight = 20;
    const lineCount = Math.ceil(params.data.name.length / 30); 
    return lineCount * lineHeight;
  }
  return 25;
};

  onPageChange(page: number) {
    this.page = page;
    this.fetchData();
  }

  openColumnMenu() {
    if (this.columnDefs.length > 0 && this.gridApi) {
      const column = this.gridApi.getColumn(this.columnDefs[0].field!);
      if (column) {
        this.gridApi.showColumnMenu(column);
      }
    }
  }

  private getContextMenuItems(params: any): any[] {
    return [
      {
        name: 'Sort Ascending',
        action: () => params.column.setSort('asc'),
        icon: '<span class="material-icons">arrow_upward</span>'
      },
      {
        name: 'Sort Descending',
        action: () => params.column.setSort('desc'),
        icon: '<span class="material-icons">arrow_downward</span>'
      },
      'separator',
      {
        name: 'Filter',
        action: () => this.gridApi.showColumnMenu(params.column),
        icon: '<span class="material-icons">filter_list</span>'
      },
      'separator',
      {
        name: 'Reset Columns',
        action: () => this.gridApi.resetColumnState(),
        icon: '<span class="material-icons">restart_alt</span>'
      }
    ];
  }

  fetchData() {
    this.loading = true;
    this.columnDefs = [{ field: 'loading', headerName: 'Status', cellRenderer: () => 'Loading data...' }];
    this.rowData = [{ loading: true }];
    
    this.githubService.getCollectionData(this.selectedCollection, this.page, this.pageSize)
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            const sample = res.data[0];
            const flatKeys = Object.keys(sample).filter(k => typeof sample[k] !== 'object');
            
            this.columnDefs = flatKeys.map(key => ({
              field: key,
              filter: true,
              sortable: true,
              resizable: true,
              valueFormatter: params => params.value === null ? '—' : params.value
            }));

            this.rowData = res.data;
            this.total = res.total || res.data.length;
            
            setTimeout(() => {
              if (this.gridApi) {
                this.gridApi.setGridOption('columnDefs', this.columnDefs);
                this.gridApi.setGridOption('rowData', this.rowData);
                this.gridApi.sizeColumnsToFit();
              }
            });
          } else {
            this.columnDefs = [{ field: 'noData', headerName: 'No Data', cellRenderer: () => 'No records found' }];
            this.rowData = [{ noData: true }];
            this.total = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          this.columnDefs = [{ field: 'error', headerName: 'Error', cellRenderer: () => 'Failed to load data' }];
          this.rowData = [{ error: true }];
          this.loading = false;
        }
      });
  }
}