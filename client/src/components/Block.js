import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import Tx from './Tx';

class Block extends Component {

    state = {displayTx: false};

    toggleTx = () => {
        this.setState({displayTx: !this.state.displayTx});
    }

    get displayTx() {
        const {data} = this.props.block;
        const stringifiedData = JSON.stringify(data);
        const dataDisplay = stringifiedData.length > 35 ? `${stringifiedData.substring(0, 35)}...` : stringifiedData;

        if (this.state.displayTx) {
            return (
                <div>
                    {
                        data.map(tx => (
                            <div key={tx.id}>
                                <hr color="#fff"/>
                                <Tx tx={tx} />
                            </div>
                        ))
                    }
                    <br/>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={this.toggleTx}
                    >
                        Show Less
                    </Button>
                </div>
            );
        }
        return (
            <div>
                <div>Data: {dataDisplay}</div>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={this.toggleTx}
                >
                    Show More
                </Button>
            </div>
        );
    }

    render() {
        console.log('this.displayTx', this.displayTx);
        const {timestamp, hash} = this.props.block;
        const hashDisplay = `${hash.substring(0, 15)}...`;

        return (
            <div className='Block'>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                <div>Hash: {hashDisplay}</div>
                {this.displayTx}
            </div>
        );
    }
}

export default Block;