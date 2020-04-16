import React, {Component} from 'react';
import {FormGroup, FormControl, Button} from "react-bootstrap";
import {Link} from 'react-router-dom';

class ConductTx extends Component {
    state = {recipient: '', amount: 0};

    updateRecipient = event => {
        this.setState({recipient: String(event.target.value)});
    }

    updateAmount = event => {
        this.setState({amount: Number(event.target.value)});
    }

    conductTx = () => {
         const {recipient, amount} = this.state;

         fetch('http://localhost:3000/api/transact', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({recipient, amount})
         }).then(response => response.json())
             .then(json => {
             alert(json.message || json.type)
         });
    }

    render() {
        return (
            <div className='ConductTx'>
                <h3>Conduct a transaction</h3>
                <br/>
                <FormGroup>
                    <FormControl
                        input='text'
                        placeholder='Recipient'
                        value={this.state.recipient}
                        onChange={this.updateRecipient}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        input='number'
                        placeholder='Amount'
                        value={this.state.amount}
                        onChange={this.updateAmount}
                    />
                </FormGroup>
                <div>
                    <Button
                        variant='danger'
                        size='sm'
                        onClick={this.conductTx}
                    >
                        Submit
                    </Button>
                </div>
                <br/>
                <Link to='/'>Back to wallet</Link>
            </div>
        )
    }
}

export default ConductTx;