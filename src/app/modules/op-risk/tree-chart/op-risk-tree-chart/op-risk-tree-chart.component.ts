import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { fuseAnimations } from '@fuse/animations';
import { AlertService } from '#shared/services/alert.service';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';
import { FormContainer } from 'app/shared/models/FromContainer';
import { Observable, of } from 'rxjs';
import { OpRiskMappingDialogComponent } from '../op-risk-mapping-dialog/op-risk-mapping-dialog.component';
import { OpRiskTreeChartService } from '../op-risk-tree-chart.service';
import { TreeMappingService } from '../tree-mapping.service';
import { stateType, TreeChartFlatNode, TreeChartMapping, TreeChartNode } from './op-risk-tree-chart.types';

@Component({
    selector: 'app-op-risk-tree-chart',
    templateUrl: './op-risk-tree-chart.component.html',
    styleUrls: ['./op-risk-tree-chart.component.scss'],
    animations: fuseAnimations,
})
export class OpRiskTreeChartComponent implements OnChanges, FormContainer {
    @Input() selected: string;

    // ---------------------------------------- Menu

    @ViewChild(MatMenuTrigger, { static: true })
    contextMenu: MatMenuTrigger;

    contextMenuPosition = { x: '0px', y: '0px' };
    selectedChildId = -1;
    subMenu = 'main';

    // --- ADD
    addChildForm: any;

    // --- EDIT
    editChildForm: any;

    subMenuState = stateType.PRESENT;

    // ---------------------------------------- Global State

    form: FormArray;
    deleteMode = false;
    isWorking: any = false;
    failed = false;
    stateType = stateType;
    state = stateType.LOADING;

    // ---------------------------------------- Tree
    expandAll = true;

    flatNodeMap: Map<TreeChartFlatNode, TreeChartNode>;
    nestedNodeMap: Map<TreeChartNode, TreeChartFlatNode>;

    checklistSelection = new SelectionModel<TreeChartFlatNode>(true);

    treeControl: FlatTreeControl<TreeChartFlatNode>;
    treeFlattener: MatTreeFlattener<TreeChartNode, TreeChartFlatNode>;
    dataSource: MatTreeFlatDataSource<TreeChartNode, TreeChartFlatNode>;

    // Mapping
    allMaps: any;
    mappableTree: any;

    constructor(
        private dialog: MatDialog,
        private alertService: AlertService,
        private ortcs: OpRiskTreeChartService,
        private tms: TreeMappingService,
        private fb: FormBuilder
    ) {
        this.form = fb.array([]);

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<TreeChartFlatNode>(this.getLevel, this.isExpandable);

        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.flatNodeMap = new Map<TreeChartFlatNode, TreeChartNode>();
        this.nestedNodeMap = new Map<TreeChartNode, TreeChartFlatNode>();

        //    Menu
        this.addChildForm = fb.control('');
        this.editChildForm = fb.control('');

        //  Mapping
        tms._latestMapping.subscribe((v) => {
            this.allMaps = v;
            this.checkMapping(this.allMaps);
        });
    }

    ngOnChanges(): void {
        if (!this.selected) {
            this.state = stateType.NO_SELECT;
            return;
        }

        this.expandAll = true;
        this.mappableTree = null;
        this.checkMapping(this.allMaps);
        this.get();
    }

    get(): void {
        this.state = stateType.LOADING;
        this.ortcs.getTree(this.selected).subscribe(
            (tree) => {
                this.state = stateType.PRESENT;

                const parseTree = (node, parent): TreeChartNode => {
                    const parsedNode = new TreeChartNode();
                    parsedNode.id = node.id;
                    parsedNode.titleFA = node.titleFA;
                    parsedNode.mappings = node.mappings;
                    parsedNode.children = [];
                    parsedNode.parent = parent;

                    if (node.children && node.children.length > 0) {
                        node.children.forEach((child) => parsedNode.children.push(parseTree(child, parsedNode)));
                    }

                    return parsedNode;
                };

                this.patchData([parseTree(tree, null)]);
            },
            () => (this.state = stateType.FAILED)
        );
    }

    patchData(data): void {
        this.dataSource.data = data;
    }

    refreshData(): void {
        const data = this.dataSource.data;
        this.dataSource.data = [];
        this.dataSource.data = data;
    }

    checkMapping(allMaps: any): void {
        if (!allMaps) return;

        allMaps.forEach((el) => {
            if (el.fromName === this.selected) {
                this.mappableTree = {
                    name: el.toName,
                    titleFA: el.toTitleFA,
                };
            }
        });
    }

    // ---------------------------------------- Tree

    transformer = (node: TreeChartNode, level: number) => {
        const flatNode = this.nestedNodeMap.has(node) && this.nestedNodeMap.get(node)!.id === node.id ? this.nestedNodeMap.get(node)! : new TreeChartFlatNode();

        flatNode.id = node.id;
        flatNode.level = level;
        flatNode.titleFA = node.titleFA;
        flatNode.expandable = !!node.children && node.children.length > 0;
        flatNode.mappings = node.mappings;

        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);

        return flatNode;
    };

    getLevel = (node: TreeChartFlatNode) => {
        return node.level;
    };

    isExpandable = (node: TreeChartFlatNode) => {
        return node.expandable;
    };

    getChildren = (node: TreeChartNode): Observable<TreeChartNode[]> => {
        return of(node.children);
    };

    hasChild = (_: number, _nodeData: TreeChartFlatNode) => {
        return _nodeData.expandable;
    };

    hasNoContent = (_: number, _nodeData: TreeChartFlatNode) => {
        return _nodeData.id === null;
    };

    // ---------------------------------------- Select

    toggleNode(node: TreeChartFlatNode): void {
        this.deleteMode = true;
        if (node.expandable) {
            this.checklistSelection.toggle(node);
        } else {
            this.checklistSelection.toggle(node);
            const descendants = this.treeControl.getDescendants(node);
            this.checklistSelection.isSelected(node) ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);
        }
        if (this.checklistSelection.isEmpty()) {
            this.deleteMode = false;
        }
    }

    descendantsAllSelected(node: TreeChartFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        return descendants.every((child) => this.checklistSelection.isSelected(child));
    }

    descendantsPartiallySelected(node: TreeChartFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child) => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    // ---------------------------------------- Menu
    onContextMenu(event: MouseEvent, item: any, contextMenuTrigger: any): void {
        this.selectedChildId = item.id;
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        contextMenuTrigger.openMenu();
        contextMenuTrigger.menuClosed.subscribe(() => {
            this.subMenu = 'main';
            this.selectedChildId = -1;
        });
    }

    editSelect(node: any): void {
        node.expanded = !node.expanded;
    }

    gotoSubMenu(event: any, menuName: string): void {
        event.stopPropagation();
        this.subMenu = menuName;
    }

    addChild(event: any, menu: any, parent: TreeChartFlatNode, name: string): void {
        event.stopPropagation();
        const parentNode = this.flatNodeMap.get(parent);

        this.subMenuState = stateType.LOADING;
        this.ortcs.addNode(parentNode.id, name).subscribe(
            (newNodeData) => {
                this.subMenuState = stateType.SUCCESS;
                const newNode = new TreeChartNode();
                newNode.id = newNodeData.id;
                newNode.titleFA = newNodeData.titleFA;
                newNode.children = [];
                newNode.parent = parentNode;
                newNode.mappings = [];
                this.addChildForm.setValue('');
                parentNode.children.push(newNode);

                setTimeout(() => {
                    this.subMenuState = stateType.PRESENT;
                    this.refreshData();
                    this.treeControl.expand(parent);
                    menu.closeMenu();
                }, 500);
            },
            () => {
                this.subMenuState = stateType.FAILED;
                setTimeout(() => (this.subMenuState = stateType.PRESENT), 500);
            }
        );
    }

    editNode(event: any, menu: any, node: TreeChartFlatNode, newName: string): void {
        event.stopPropagation();
        const foundedNode = this.flatNodeMap.get(node);

        this.subMenuState = stateType.LOADING;
        this.ortcs.updateNode(foundedNode.id, newName).subscribe(
            () => {
                this.subMenuState = stateType.SUCCESS;
                foundedNode.titleFA = newName;

                setTimeout(() => {
                    this.subMenuState = stateType.PRESENT;
                    this.refreshData();
                    menu.closeMenu();
                }, 500);
            },
            () => {
                this.subMenuState = stateType.FAILED;
                setTimeout(() => (this.subMenuState = stateType.PRESENT), 500);
            }
        );
    }

    deleteNode(node: TreeChartFlatNode): void {
        const warnings = [];
        if (node?.expandable) {
            warnings.push('در صورت حذف این زیر درخت تمام زیر درخت‌های آن نیز حذف می‌شود.');
        }

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-w40',
            data: {
                title: `حذف زیر درخت ${node.titleFA} `,
                description: ` آیا از حذف زیر درخت «${node.titleFA}» اطمینان دارید؟`,
                warnings,
            },
        });

        dialogRef.afterClosed().subscribe((r) => {
            if (r) {
                this.ortcs.deleteNode(node.id, this.selected).subscribe(
                    () => {
                        this.alertService.onSuccess('با موفقیت حذف شد.');
                        const foundedNode = this.flatNodeMap.get(node);
                        const index = foundedNode.parent.children.findIndex((el) => el.id === node.id);
                        foundedNode.parent.children.splice(index, 1);
                        this.refreshData();
                    },
                    () => this.alertService.onError('حذف نشد.')
                );
            }
        });
    }

    addMapping(node: TreeChartFlatNode): void {
        const foundedNode = this.flatNodeMap.get(node);

        this.dialog.open(OpRiskMappingDialogComponent, {
            panelClass: 'dialog-w80',
            data: { treeName: this.mappableTree.name, mappedNode: foundedNode },
        });
    }

    removeMapping(relation: TreeChartMapping, node: TreeChartFlatNode): void {
        const foundedNode = this.flatNodeMap.get(node);

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-w40',
            data: {
                title: 'حذف نگاشت',
                description: `آیا از حذف نگاشت «${node.titleFA}» به «${relation.childTitleFa}» اطمینان دارید؟`,
            },
        });
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.tms.deleteMapping(relation.id).subscribe(
                    () => {
                        const index = foundedNode.mappings.findIndex((el) => el.id === relation.id);
                        foundedNode.mappings.splice(index, 1);
                        this.refreshData();
                        this.alertService.onSuccess('نگاشت با موفقیت حذف شد.');
                    },
                    () => this.alertService.onError('نگاشت حذف نشد.')
                );
            }
        });
    }

    // ----------------------------------------

    handleError(): boolean {
        this.failed = true;
        return false;
    }

    toggleExpandTable(): void {
        if (this.expandAll) {
            this.treeControl.expandAll();
            this.expandAll = false;
        } else {
            this.treeControl.collapseAll();
            this.expandAll = true;
        }
    }

    setDefaultEdit(titleFA: any): void {
        this.editChildForm.setValue(titleFA);
    }
}
