import React, { Component } from 'react';

import './view.css'


import $ from 'jquery'

class View extends Component {

	constructor(props) {
		super(props)
		this.IssueContract = props.contractObject
		this.web3 = props.web3Obj
		console.log('Class: View')

		this.updateUser = this.updateUser.bind(this);
		this.renderTable = this.renderTable.bind(this);

		this.actionFirstButton = this.actionFirstButton.bind(this);
		this.actionSecondButton = this.actionSecondButton.bind(this);
		this.actionThirdButton = this.actionThirdButton.bind(this);
		this.actionFourthButton = this.actionFourthButton.bind(this);
		this.sendTransPolList = this.sendTransPolList.bind(this);
		this.updatePoliceList = this.updatePoliceList.bind(this);
		this.actionPolFund = this.actionPolFund.bind(this);

		this.state = {
			table: [],
			classFirst: 'glyphicon glyphicon-plus',
			classSecond: 'hidden',
			tipFirst: 'Assign new Police accounts',
			tipSecond: 'Empty',
			isSuperUser: 'visible',
			isCitizen: 'invisible',
			secondBtn: 'invisible',
			polFund: 'invisible',
			polTip: 'Fund this Issue',
			notification: '',
			notiClass: 'success',
			polAcc: []
		}

		this.fetchedIssues = []
		this.promiseEachIssue = []
		this.selectUser = 0

		this.accounts = []
		this.polList = ''

		this.getAccounts()
	}

	catType(a) {
        console.log('dfdsfsdf'+ a)
        if(a==0)
            return 'Lost'
        else if(a==1)
            return 'Theft'
    }

    statusType(a) {
        if(a == 0)
            return 'Pending'
        else if(a == 1)
            return 'Accepted'
        else if(a == 2)
            return 'Resolved'
        else if(a == 3)
        	return 'Proposed'
    }

    actionFirstButton(e) {
    	var Issue = this.fetchedIssues[e.target.getAttribute('data-index')]
    	var context = this;

    	if(this.selectUser == 1) {
    		console.log('Issue Status: '+Issue.status)
    		if(Issue.status < 2) {
    			this.IssueContract.methods.changeStatus(Issue.cid, parseInt(Issue.status) + 1).send({from: this.accounts[this.selectUser]})
    				.then(function(res) {
    					console.log(res)
    					context.setState({notification: 'Issue Status Changed.', notiClass: 'success'})
    					context.componentWillMount()
    				}).catch(function(res) {
    					context.setState({notification: 'Error: This might not be added as a Police Account', notiClass: 'danger'})
    					console.log(res)
    				})
    		}
    		else {
    			this.setState({notification: 'Issue Status cant go above "Resolved" or "Proposed"', notiClass: 'danger'})
    		}
    		
    	}
    	else if(this.selectUser == 2 || this.selectUser == 3) {
    		console.log("Fund : "+Issue.cid)
    		if($('#input-reward').val() == '') {
    			context.setState({notification: 'No Fund Specified. Please enter some amount.', notiClass: 'danger'})
    			return
    		}
    		var fundValue = parseInt($('#input-reward').val()) * 1e9
    		this.IssueContract.methods.fundIssue(Issue.cid).send({from: this.accounts[this.selectUser], value: fundValue})
    				.then(function(res) {
    					console.log(res)
    					context.setState({notification: 'Issue Funded', notiClass: 'success'})
    					context.componentWillMount()
    				}).catch(() => {context.setState({notification: 'Error Occured: Issue should be Accepted or Proposed', notiClass: 'danger'})})
    	}
    }

    actionSecondButton(e) {
    	var Issue = this.fetchedIssues[e.target.getAttribute('data-index')]
    	var context = this;
    	if(this.selectUser == 1) {
    		if(Issue.status > 0) {
    			this.IssueContract.methods.changeStatus(Issue.cid, parseInt(Issue.status) - 1).send({from: this.accounts[this.selectUser]})
    				.then(function(res) {
    					console.log(res)
    					context.setState({notification: 'Status Changed', notiClass: 'success'})
    					context.componentWillMount()
    				}).catch(() => {context.setState({notification: 'Error Dec: This might not be added as a Police Account', notiClass: 'danger'})})
    		}
    		else {
    			this.setState({notification: 'Issue Status cant go below "Pending"', notiClass: 'danger'})
    		}
    		
    	}
    	else if(this.selectUser == 2 || this.selectUser == 3) {
    		this.IssueContract.methods.claimSolution(Issue.cid).send({from: this.accounts[this.selectUser]})
    				.then(function(res) {
    					console.log(res)
    					context.setState({notification: 'Solution Claimed', notiClass: 'success'})
    					context.componentWillMount()
    				}).catch(() => {context.setState({notification: 'Error Occured: You cant propose on your Issue or a solution is already proposed.', notiClass: 'danger'})})
    	}
    }

    actionThirdButton(e) {
    	var Issue = this.fetchedIssues[e.target.getAttribute('data-index')]
    	var context = this;
    	this.IssueContract.methods.resolve(Issue.cid).send({from: this.accounts[this.selectUser]})
				.then(function(res) {
    					console.log(res)
    					context.setState({notification: 'Issue resolved and closed. Fund Transfered.', notiClass: 'success'})
    					context.componentWillMount()
    				}).catch(() => {context.setState({notification: 'Error Occured: This might not be your Issue.', notiClass: 'danger'})})
    }

    actionFourthButton(e) {
    	var Issue = this.fetchedIssues[e.target.getAttribute('data-index')]
    	var context = this;
    	this.IssueContract.methods.declineProposal(Issue.cid).send({from: this.accounts[this.selectUser]})
				.then(function(res) {
    					console.log(res)
    					context.setState({notification: 'Issue Solution declined. Set to Accept Status.', notiClass: 'success'})
    					context.componentWillMount()
    				}).catch(() => {context.setState({notification: 'Error Occured: You might not be the owner of this Issue.', notiClass: 'danger'})})
    }

    actionPolFund(e) {
    	var Issue = this.fetchedIssues[e.target.getAttribute('data-index')]
    	var context = this;

    	var fundValue = parseInt($('#input-reward').val()) * 1e9

    	this.IssueContract.methods.fundIssue(Issue.cid).send({from: this.accounts[this.selectUser], value: fundValue})
			.then(function(res) {
				console.log(res)
				context.setState({notification: 'Issue Funded'})
				context.componentWillMount()
			}).catch(() => {context.setState({notification: 'Error Occured', notiClass: 'danger'})})
    }

    getAccounts() {
    	var context = this
    	this.web3.eth.getAccounts().then(function(res) {
    		context.accounts = res
    		console.log(context.accounts)
    	})
    }



	componentWillMount() {
		this.fetchedIssues = []
		this.promiseEachIssue = []
        this.fetchFreshData()

        var context = this

        Promise.all(this.promiseEachIssue).then(function() {
        	context.setState({table: context.renderTable()})
        })
        
	}

	fetchFreshData() {
		var noOfIssuesFetch = 20

        var context = this

        var majorPromise = new Promise(function(resolve, reject) {
            for(var i=0; i<noOfIssuesFetch; i++) {
                context.promiseEachIssue.push(context.IssueContract.methods.viewIssue(i).call())
            }

            resolve()
        })

        var context = this

        var p = []
        majorPromise.then(function() {
            for(var i=0; i<noOfIssuesFetch; i++) {
                context.promiseEachIssue[i].then(function(response) {
                    console.log(response)
                    if(response[5] === "")
                        return
                    var fetchData = {cid: response[0], reward: response[1], long: response[2], lat: response[3], cat: response[4], data: atob(response[5]), status: response[6]}

                    context.fetchedIssues.push(fetchData)
                    
                });
            }
        });

        
	}

	updateUser(e) {
		this.selectUser = e.target.value

		if(this.selectUser == 0) {

			this.setState({polFund: 'invisible', secondBtn: 'invisible', isSuperUser: 'visible',isCitizen: 'invisible', classFirst: 'glyphicon glyphicon-plus', classSecond: 'hidden', tipFirst: 'Assign new Police accounts', tipSecond: 'Empty'}, function() {
	    		this.setState({table: this.renderTable()})
	    	})
		}
		else if(this.selectUser == 1) {
			this.setState({polFund: 'visible', secondBtn: 'visible', isSuperUser: 'invisible',isCitizen: 'invisible', classFirst: 'glyphicon glyphicon-arrow-up', classSecond: 'glyphicon glyphicon-arrow-down', tipFirst: 'Upgrade Issue status', tipSecond: 'Downgrade Issue status'}, function() {
	    		this.setState({table: this.renderTable()})
	    	})
		}
		else if(this.selectUser == 2 || this.selectUser == 3) {
			this.setState({polFund: 'invisible', secondBtn: 'visible', isSuperUser: 'invisible',isCitizen: 'visible', classFirst: 'glyphicon glyphicon-flash', classSecond: 'glyphicon glyphicon-send', tipFirst: 'Fund a Issue', tipSecond: 'Report a Solution'}, function() {
	    		this.setState({table: this.renderTable()})
	    	})
		}

		this.componentWillMount()

    	
    	console.log(this.state.classFirst)
	}


	renderTable() {
		var context = this
		console.log('jhgjhg')
		/*var pp  = React.createElement('tbody', {'id': 'table-body'}, p)

		console.log(pp)
		context.setState({table: pp})*/
		//context.iconNode.props.className = 'glyphicon glyphicon-arrow-up'
		
		console.log(context.fetchedIssues)
		var reactTableRows = []
		for(var i = 0; i<context.fetchedIssues.length; i++) {

			var fetchData = context.fetchedIssues[i]
			var details = fetchData.data.split('?')
	        //console.log(details)

	        var _th  = <th scope="row">{fetchData.cid}</th>
	        var _td1 = <td>{details[0]}</td>
	        var _td2 = <td>{details[1]}</td>
	        var _td3 = <td>{details[2]}</td>
	        var _td4 = <td>{context.catType(fetchData.cat)}</td>
	        var _td5 = <td>&#8377; {(fetchData.reward/1e9).toFixed(2)}</td>
	        var _td6 = <td><p className={context.statusType(fetchData.status)}>{context.statusType(fetchData.status)}</p></td>
	        var _td7 = <td className="action-class">
	        	<span className={context.state.secondBtn+" label label-success"}>
	        		<span data-index={i} data-toggle="tooltip" data-placement="left" title={context.state.tipFirst} className={context.state.classFirst} aria-hidden="true" onClick={context.actionFirstButton}></span>
	        	</span>
	        	<span className={context.state.secondBtn+" label label-primary"}>
	        		<span data-index={i} data-toggle="tooltip" data-placement="left" title={context.state.tipSecond} className={context.state.classSecond} aria-hidden="true" onClick={context.actionSecondButton}></span>
	        	</span>
	        	<span className={context.state.polFund+" label label-info"}>
	        		<span data-index={i} data-toggle="tooltip" data-placement="left" title={context.state.polTip} className="glyphicon glyphicon-flash" aria-hidden="true" onClick={context.actionPolFund}></span>
	        	</span>
	        	<span className={context.state.isCitizen+" label label-info"} >
	        		<span data-index={i} data-toggle="tooltip" data-placement="left" title="Close/Resolve Issue [Funds will be awarded or sent back]" className="glyphicon glyphicon-ok" aria-hidden="true" onClick={context.actionThirdButton}></span>
	        	</span>
	        	<span className={context.state.isCitizen+" label label-danger"} >
	        		<span data-index={i} data-toggle="tooltip" data-placement="left" title="Decline Proposal" className="glyphicon glyphicon-remove" aria-hidden="true" onClick={context.actionFourthButton}></span>
	        	</span>
	        	</td>


	        //var t = <tr></tr>

	        //var u = React.cloneElement(t)
	        //var _td = <td>Hello</td>
	        var _tr = <tr>{_th}{_td1}{_td2}{_td3}{_td4}{_td5}{_td6}{_td7}</tr>

	        reactTableRows.push(_tr)

	        
		}
		var reactTBody  = React.createElement('tbody', {'id': 'table-body'}, reactTableRows)

		console.log(reactTBody)
		return reactTBody
		//context.setState({table: pp})
    	//p.push(_tr)
	}

	updatePoliceList(e) {
		this.polList = e.target.value;
		console.log(this.polList)
	}

	sendTransPolList() {
		var accList = this.polList.split(',')
		console.log(accList)
		var context = this;
		this.IssueContract.methods.modifyPoliceAccounts(accList).send({from: this.accounts[this.selectUser]})
			.then(function(res) {
				console.log(res)
				context.setState({notification: 'Police Acoounts Modified', notiClass: 'success'})
				//context.checkPolAccount()
				

			}).catch(() => {context.setState({notification: 'Error Occured while modifying Police Accounts', notiClass: 'danger'})})
	}

	checkPolAccount() {
		var context = this
		var yy = []
		var dep = []
		for(var i =0; i<this.accounts.length; i++) {
			dep.push(this.IssueContract.methods.checkIfPoliceAccount(this.accounts[i]).call({from: this.accounts[this.selectUser]}))
		}

		for(var i = 0; i<dep.length; i++) {
			dep[i].then(function(res) {
				yy.push(res);
			})
		}
		console.log(yy)

		this.setState({polAcc: yy})
	} 

	componentWillUpdate() {
		//this.fetchedIssues = []
		//this.fetchFreshData()
	}


	render() {
		
		return (
			<div className="view-class">
				<select className="form-control" onChange={this.updateUser}>
					<option value="0">Super User</option>
					<option value="1">Police</option>
					<option value="2">Citizen 1</option>
					<option value="3">Citizen 2</option>
				</select>
				<br/>
				<input type="name" className={"form-control "+this.state.secondBtn} id="input-reward" placeholder="Reward in &#8377;"/>
				<br/>
				<div className="panel panel-default">
					<div className="panel-heading">Issue fetched from Blockchain</div>
					<table className="table" id="table-data"> 
						<thead> 
							<tr> 
								<th>#</th> 
								<th>Name</th> 
								<th>Location</th>
								<th>Description</th>
								<th>Type</th> 
								<th>Reward</th> 
								<th>Status</th> 
								<th>Action</th>
							</tr> 
						</thead>

							{this.state.table}




					</table> 
				</div>

				<div className="tags-desc">
					<span className={this.state.secondBtn+" label label-success"}>
	        			<span data-toggle="tooltip" data-placement="left" title={this.state.tipFirst} className={this.state.classFirst} aria-hidden="true"></span>
		        	</span>
		        	<h5 className={this.state.secondBtn}>{this.state.tipFirst}</h5>
		        	<span className={this.state.secondBtn+" label label-primary"}>
		        		<span data-toggle="tooltip" data-placement="left" title={this.state.tipSecond} className={this.state.classSecond} aria-hidden="true"></span>
		        	</span>
		        	<h5 className={this.state.secondBtn}>{this.state.tipSecond}</h5>
		        	
		        	<span className={this.state.isCitizen+" label label-info"} >
		        		<span data-toggle="tooltip" data-placement="left" title="Close/Resolve Issue [Funds will be awarded or sent back]" className="glyphicon glyphicon-ok" aria-hidden="true"></span>
		        	</span>
		        	<h5 className={this.state.isCitizen}>Close/Resolve Issue [Funds will be awarded or sent back]</h5>
		        	<span className={this.state.isCitizen+" label label-danger"} >
		        		<span data-toggle="tooltip" data-placement="left" title="Decline Proposal" className="glyphicon glyphicon-remove" aria-hidden="true"></span>
		        	</span>
		        	<h5 className={this.state.isCitizen}>Decline Proposal</h5>
		        	<span className={this.state.polFund+" label label-info"}>
		        		<span data-toggle="tooltip" data-placement="left" title={this.state.polTip} className="glyphicon glyphicon-flash" aria-hidden="true"></span>
		        	</span>
		        	<h5 className={this.state.polFund}>{this.state.polTip}</h5>
				</div>

				<br/>
				<hr/>
				<div className={"row police-accounts "+this.state.isSuperUser}>
					<div className="col-md-6">
							<h3>Update Police Accounts</h3>
							<input type="name" className="form-control" id="input-address" onChange={this.updatePoliceList} placeholder="comma seperated list of account eg. 0x6f85e63bb1ed0d07a9d653b3f18b0bc389b0165b, 0x665dd2d0028473eab94584000cedcbef9fdcb7d4..." />
							<button type="submit" className="btn btn-default btn-block" id="Issue-submit" onClick={this.sendTransPolList}>Submit</button>
							<div className="alert alert-danger" role="alert">Police account is not added to the list by default. Issue status change will fail if not added.</div>

					</div>
					<div className="col-md-6">
						<h3>Account Addresses</h3>
						<div>
							
							<ul className="list-group">
							  <li className="list-group-item">SuperUser : {this.accounts[0]}</li>
							  <li className="list-group-item">Police : {this.accounts[1]}</li>
							  <li className="list-group-item">Citizen1 : {this.accounts[2]}</li>
							  <li className="list-group-item">Citizen2 : {this.accounts[3]}</li>
							</ul>
						</div>
					
							
					</div>
				</div>

				
				
				
		        <div className={"notify alert alert-dismissible alert-"+this.state.notiClass}>
		        	<button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		        	{this.state.notification}
		        </div>
			</div>
		);
	}


}

	export default View;

