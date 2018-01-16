import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchDocument, fetchTabularResults} from "../../../actions/index";
import { BaseExample } from "@blueprintjs/docs";

import {Table, Cell, Column, ColumnHeaderCell, Utils} from "@blueprintjs/table"

class TabularViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentId: 0,
            structuredData: [],
            data: [],
            columns: []
        };

        this.getStructuredData = this.getStructuredData.bind(this);
        this.getCellData = this.getCellData.bind(this);
        this.getColumn = this.getColumn.bind(this);
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

    sortedData(columns, rows) {
        let i, j;
        let sortedRows = [];
        let sortedData = [];
        for(i = 0; i < columns.length; i++) {
            sortedRows = [];
            for(j = 0; j < rows.length; j++) {
                if(rows[j].data[columns[i]] !== undefined && rows[j].data[columns[i]] !== null) {
                    sortedRows.push(rows[j].data[columns[i]])
                }
            }

            let sortedObject = {column: columns[i], rows: sortedRows};

            sortedData.push(sortedObject);
        }

        return sortedData;
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
        const cellRenderer = (rowIndex, index) => (
            <Cell>{getCellData(rowIndex, index, data)}</Cell>
        );
        return (
            <Column
                renderCell={cellRenderer}
                key={index}
                name={name}
            />
        );
    };

    getCellData(rowIndex, columnIndex, data) {
        //console.log(rowIndex, columnIndex);
        return data[columnIndex].rows[rowIndex];
    };

    render() {
        const columnArray = this.props.entities[this.props.documentId].columns;
        let numRows = 0;
        const rows = this.props.tabularResults.results;
        let columns = [];

        if(rows !== undefined) {
            numRows = rows.length;
            let data = this.sortedData(columnArray,rows);
            columns = this.state.columns.map((col, index) => this.getColumn(data, index, col, this.getCellData));
            console.log('sorted data', data);
        }
        return (
            <div className="ExcelViewer">
                <Table numRows={numRows}>
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
