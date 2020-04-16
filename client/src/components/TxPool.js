import React, {Component} from 'react';
import {Button} from "react-bootstrap";
import {Link} from 'react-router-dom';
import Tx from './Tx';
import history from "../history";

const POLL_INTERVAL_MS = 10000;

class TxPool extends Component {

    state = {txPoolMap: {}};

    fetchTxPoolMap = () => {
        fetch(`${document.location.origin}/api/tx-pool-map`)
            .then(response => response.json())
            .then(json => this.setState({txPoolMap: json}));
    }

    fetchMineTx = () => {
        fetch(`${document.location.origin}/api/mine-tx`)
            .then(response => {
                if (response.status === 200) {
                    alert('success');
                    history.push('/blocks');
                } else {
                    alert('The mine-transactions request did not complete.');
                }
            });
    }

    componentDidMount() {
        this.fetchTxPoolMap();

        this.fetchPoolMapInterval = setInterval(() => this.fetchTxPoolMap(), POLL_INTERVAL_MS);
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
    }

    render() {
        return (
            <div className='TxPool'>
                <h3>Transaction Pool</h3>
                <div><Link to='/'>Back to wallet</Link></div>
                <br/>
                <hr color='#fff'/>
                {
                    Object.values(this.state.txPoolMap).map(tx => {
                        return (
                            <div key={tx.id}>
                                <hr/>
                                <Tx tx={tx}/>
                            </div>
                        )
                    })
                }
                <hr/>
                <Button
                    variant='danger'
                    size='sm'
                    onClick={this.fetchMineTx}
                >
                    Mine Transactions
                </Button>
            </div>
        )
    }
}

export default TxPool;

