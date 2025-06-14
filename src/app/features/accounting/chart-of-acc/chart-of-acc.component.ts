import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { AccService } from '../@services/acc.service';
import { SharedModule } from '../../../shared/shared.module';
import { AddEditAccComponent } from '../add-edit-acc/add-edit-acc.component';
import { ViewAccLedgerComponent } from '../view-acc-ledger/view-acc-ledger.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chart-of-acc',
  imports: [SharedModule,RouterLink],
  templateUrl: './chart-of-acc.component.html',
  styleUrl: './chart-of-acc.component.scss'
})
export class ChartOfAccComponent {
  nodes: TreeNode[] = [];
  loading = false;

  constructor(private _accService: AccService) { }

  ngOnInit() {
    this.loadNodes(); // load root accounts (parent_id=4)
  }
  manualExpand(node: TreeNode | any) {
    if (!node.expanded) {
      node.expanded = true; // mark it as expanded to reflect UI
      this.loadNodes(node.key, node);
    }
  }
  loadNodes(parentId?: number, parentNode: TreeNode | null = null) {
    this.loading = true;
    this._accService.getChartOfAcc(parentId ? `parent_id=${parentId}` : '').subscribe(data => {
      const children = data?.map((acc: any) => ({
        label: acc.name,
        key: acc.id,
        leaf: false,
        data: acc,
        children: [], // for lazy loading
      }));

      if (parentNode) {
        parentNode.children = children;
      } else {
        this.nodes = children;
      }

      this.loading = false;
    });
  }

  onNodeExpand(event: any) {
    const node = event.node;
    this.loadNodes(node.key, node);
  }
  expandAll() {
    this.nodes.forEach(node => this.expandRecursive(node, true));
  }

  collapseAll() {
    this.nodes.forEach(node => this.expandRecursive(node, false));
  }

  expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(child => this.expandRecursive(child, isExpand));
    }
  }
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  componentRef!: ComponentRef<any>;
  addAcc(id?: any) {
    this.container.clear();
    this.componentRef = this.container.createComponent(AddEditAccComponent);
    this.componentRef.instance.visible = true;
    this.componentRef.instance.accId = id;
  }

}
