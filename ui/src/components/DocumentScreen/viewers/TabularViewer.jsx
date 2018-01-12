import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchDocument, fetchTabularResults} from "../../../actions/index";

import {Table, Cell, Column, ColumnHeaderCell, Utils} from "@blueprintjs/table"

class TabularViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentId: 0,
            structuredData: [],
            data: [],
            sortedIndexMap: [],
            columns: []
        };

        this.getStructuredData = this.getStructuredData.bind(this);
        this.getCellData = this.getCellData.bind(this);
        this.getColumn = this.getColumn.bind(this);
        this.sortColumn = this.sortColumn.bind(this);
    }

    componentDidMount() {
        if (!this.props.tabularResults.isLoaded) {
            this.props.fetchDocument({id: this.props.documentId});
            this.props.fetchTabularResults({documentId: this.props.documentId});
            const rows = this.props.tabularResults.results;
            let data = [];
            if(rows !== undefined) {
                data = this.getStructuredData(this.props.entities[this.props.documentId].columns, rows);
                //this.setState({data: data})
            }
            this.setState({columns: this.props.entities[this.props.documentId].columns, data: data});
        }
    }

    getStructuredData(columns, rows) {
        let tempData = new Array(200);
        let structuredData = this.state.structuredData;

        columns.forEach(function (column, index) {
            rows.forEach(function (row, rowIndex) {
                if(row !== null && row !== undefined) {
                    if(row.data !== undefined) {
                        let tempRows;
                        structuredData.forEach(function (item, index) {
                            if(item.columnName === column) {
                                tempRows = item.rows;
                            }
                        });

                        if(structuredData.length === 0) {
                            tempRows = [];
                        }
                        if(tempData[index] === undefined) {
                            if(row.data[column] !== null && row.data[column] !== undefined) {
                                tempRows.push(row.data[column]);
                                tempData.push({columnName: column, rows: tempRows});
                            } else {
                                tempRows.push('');
                                tempData.push({columnName: column, rows: tempRows});
                            }
                        } else {
                            if(row.data[column] !== undefined) {
                                tempData[index].rows.push(row.data[column]);
                                tempRows = tempData[index].rows;
                                this.setState()

                            } else {
                                tempData[index].rows.push('');
                            }
                        }
                    }
                }
            })
        });

        return tempData

    }

    getColumn(data, index, name, getCellData) {
        const cellRenderer = (rowIndex, columnIndex) => (
            <Cell>{getCellData(rowIndex, columnIndex, data)}</Cell>
        );
        console.log('NAME', name)
        return (
            <Column
                renderCell={cellRenderer}
                key={index}
                name={name}
            />
        );
    };

    getCellData(rowIndex, columnIndex, data) {
        const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
        if (sortedRowIndex !== null) {
            rowIndex = sortedRowIndex;
        }
        console.log('DATA', data[200 + columnIndex], rowIndex, columnIndex);
        return data[200 + columnIndex].rows[0];
    };

    sortColumn = (columnIndex, comparator) => {
        const { data } = this.state;
        const sortedIndexMap = Utils.times(data.length, (i) => i);
        sortedIndexMap.sort((a, b) => {
            return comparator(data[a][columnIndex], data[b][columnIndex]);
        });
        this.setState({ sortedIndexMap });
    };

    render() {
        const columnArray = this.props.entities[this.props.documentId].columns;
        const numRows = this.props.tabularResults.total;
        const rows = this.props.tabularResults.results;
        let data = [];
        let columns = [];
        if(rows !== undefined) {
            data = this.getStructuredData(columnArray, rows);
            columns = this.state.columns.map((col, index) => this.getColumn(data, index, col, this.getCellData));

            //this.setState({data: data})
        }
        //const renderCell = (rowIndex) => <Cell>{this.props.edgeOverrides[rowIndex]}</Cell>;
        //const renderCell = (rowIndex) => <Cell>10</Cell>;

        /*let columns = columnArray.map(function(item) {
            return <Column name={item.toString()} renderCell={renderCell}/>;
        });*/
        //const renderCell = this.renderCell();
        return (
            <div className="ExcelViewer">
                <Table numRows={3}>
                    {columns}
                </Table>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        collections: state.collections,
        tabularResults: state.tabularResults,
        entities: state.entities
    };
};

export default connect(mapStateToProps, {fetchDocument, fetchTabularResults})(TabularViewer);
