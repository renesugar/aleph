import React, {Component} from 'react';

import { Menu, MenuItem } from "@blueprintjs/core";
import {
    Cell,
    Column,
    ColumnHeaderCell,
    CopyCellsMenuItem,
    Table,
    Utils,
} from "@blueprintjs/table";

class AbstractSortableColumn {
    constructor(name, index) {}

getColumn(getCellData, sortColumn) {
    const cellRenderer = (rowIndex, columnIndex) => (
        <Cell>{getCellData(rowIndex, columnIndex)}</Cell>
    );
    const menuRenderer = this.renderMenu.bind(this, sortColumn);
    const columnHeaderCellRenderer = () => <ColumnHeaderCell name={this.name} menuRenderer={menuRenderer} />;
    return (
        <Column
            cellRenderer={cellRenderer}
            columnHeaderCellRenderer={columnHeaderCellRenderer}
            key={this.index}
            name={this.name}
        />
    );
}
}

class TextSortableColumn extends AbstractSortableColumn {
    renderMenu(sortColumn) {
        const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b));
        const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a));
        return (
            <Menu>
                <MenuItem iconName="sort-asc" onClick={sortAsc} text="Sort Asc" />
                <MenuItem iconName="sort-desc" onClick={sortDesc} text="Sort Desc" />
            </Menu>
        );
    }

    private compare(a, b) {
        return a.toString().localeCompare(b);
    }
}

class RankSortableColumn extends AbstractSortableColumn {
    private static RANK_PATTERN = /([YOSKMJ])([0-9]+)(e|w)/i;
    private static TITLES = {
        J: 5, // Juryo
        K: 3, // Komusubi
        M: 4, // Maegashira
        O: 1, // Ozeki
        S: 2, // Sekiwake
        Y: 0, // Yokozuna
    };

    renderMenu(sortColumn) {
        const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b));
        const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a));
        return (
            <Menu>
                <MenuItem iconName="sort-asc" onClick={sortAsc} text="Sort Rank Asc" />
                <MenuItem iconName="sort-desc" onClick={sortDesc} text="Sort Rank Desc" />
            </Menu>
        );
    }

    private toRank(str) {
        const match = RankSortableColumn.RANK_PATTERN.exec(str);
        if (match === null) {
            return 1000;
        }
        const [title, rank, side] = match.slice(1);
        return RankSortableColumn.TITLES[title] * 100 + (side === "e" ? 0 : 1) + parseInt(rank, 10) * 2;
    }

    private compare(a, b) {
        return this.toRank(a) - this.toRank(b);
    }
}

class RecordSortableColumn extends AbstractSortableColumn {
    private static WIN_LOSS_PATTERN = /^([0-9]+)(-([0-9]+))?(-([0-9]+)) ?.*/;

    renderMenu(sortColumn) {
        // tslint:disable:jsx-no-lambda
        return (
            <Menu>
                <MenuItem
                    iconName="sort-asc"
                    onClick={() => sortColumn(this.index, this.transformCompare(this.toWins, false))}
                    text="Sort Wins Asc"
                />
                <MenuItem
                    iconName="sort-desc"
                    onClick={() => sortColumn(this.index, this.transformCompare(this.toWins, true))}
                    text="Sort Wins Desc"
                />
                <MenuItem
                    iconName="sort-asc"
                    onClick={() => sortColumn(this.index, this.transformCompare(this.toLosses, false))}
                    text="Sort Losses Asc"
                />
                <MenuItem
                    iconName="sort-desc"
                    onClick={() => sortColumn(this.index, this.transformCompare(this.toLosses, true))}
                    text="Sort Losses Desc"
                />
                <MenuItem
                    iconName="sort-asc"
                    onClick={() => sortColumn(this.index, this.transformCompare(this.toTies, false))}
                    text="Sort Ties Asc"
                />
                <MenuItem
                    iconName="sort-desc"
                    onClick={() => sortColumn(this.index, this.transformCompare(this.toTies, true))}
                    text="Sort Ties Desc"
                />
            </Menu>
        );
        // tslint:enable:jsx-no-lambda
    }

    private transformCompare(transform, reverse) {
        if (reverse) {
            return (a, b) => transform(b) - transform(a);
        } else {
            return (a, b) => transform(a) - transform(b);
        }
    }

    private toWins(a) {
        const match = RecordSortableColumn.WIN_LOSS_PATTERN.exec(a);
        return match === null ? -1 : parseInt(match[1], 10);
    }

    private toTies(a) {
        const match = RecordSortableColumn.WIN_LOSS_PATTERN.exec(a);
        return match === null || match[3] === null ? -1 : parseInt(match[3], 10);
    }

    private toLosses(a) {
        const match = RecordSortableColumn.WIN_LOSS_PATTERN.exec(a);
        return match === null ? -1 : parseInt(match[5], 10);
    }
}

export class ExcelSheet extends Component {
    public state = {
        columns: [
            new TextSortableColumn("Rikishi", 0),
            new RankSortableColumn("Rank - Hatsu Basho", 1),
            new RecordSortableColumn("Record - Hatsu Basho", 2),
            new RankSortableColumn("Rank - Haru Basho", 3),
            new RecordSortableColumn("Record - Haru Basho", 4),
            new RankSortableColumn("Rank - Natsu Basho", 5),
            new RecordSortableColumn("Record - Natsu Basho", 6),
            new RankSortableColumn("Rank - Nagoya Basho", 7),
            new RecordSortableColumn("Record - Nagoya Basho", 8),
            new RankSortableColumn("Rank - Aki Basho", 9),
            new RecordSortableColumn("Record - Aki Basho", 10),
            new RankSortableColumn("Rank - Kyūshū Basho", 11),
            new RecordSortableColumn("Record - Kyūshū Basho", 12),
        ],
        sortedIndexMap: [],
    };

    public render() {
        const numRows = this.state.data.length;
        const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));
        return (
            <Table
                numRows={numRows}>
                {columns}
            </Table>
        );
    }

    private getCellData = (rowIndex, columnIndex) => {
        const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
        if (sortedRowIndex !== null) {
            rowIndex = sortedRowIndex;
        }
        return this.state.data[rowIndex][columnIndex];
    };

    private renderBodyContextMenu = (context) => {
        return (
            <Menu>
                <CopyCellsMenuItem context={context} getCellData={this.getCellData} text="Copy" />
            </Menu>
        );
    };

    private sortColumn = (columnIndex, comparator) => {
        const { data } = this.state;
        const sortedIndexMap = Utils.times(data.length, (i) => i);
        sortedIndexMap.sort((a, b) => {
            return comparator(data[a][columnIndex], data[b][columnIndex]);
        });
        this.setState({ sortedIndexMap });
    };
}