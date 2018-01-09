import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchDocument, fetchTabularResults} from "../../../actions/index";

import {Table, Cell, Column} from "@blueprintjs/table"

class TabularViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            documentId: 0,
            structuredData: []
        };

        this.getStructuredData = this.getStructuredData.bind(this)
    }

    componentDidMount() {
        if (!this.props.tabularResults.isLoaded) {
            this.props.fetchDocument({id: this.props.documentId});
            this.props.fetchTabularResults({documentId: this.props.documentId});
        }
    }

    renderCell(rowIndex) {
        return <Cell>10</Cell>
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

    render() {
        const columns = this.props.entities[this.props.documentId].columns;
        const numRows = this.props.tabularResults.total;
        const rows = this.props.tabularResults.results;
        if(rows !== undefined) {
            let data = this.getStructuredData(columns, rows);
            console.log('data', data);
        }
        const renderCell = this.renderCell();
        return (
            <div className="ExcelViewer">
                <Table numRows={numRows}>
                    {columns.forEach(function (item, index) {
                        <Column name={item.toString()} renderCell={renderCell}/>
                    })}
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
