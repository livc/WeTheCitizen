pragma solidity ^0.4.24;

contract WeTheCitizen {
    struct Issue{
        string submitter_name;
        string content;
        uint[] rewards;
        uint total_reward;
        uint status; // 0:unsolved 1:solved
        address solver;
        address[] crowdfunders;
    }

    uint private issue_cnt = 0;
    mapping(uint => Issue) private issues;
    mapping(uint => address) private solver;

    // return: issue id
    function submitIssue(string submitter_name, string content) public payable returns(uint){
        issues[issue_cnt].submitter_name = submitter_name;
        issues[issue_cnt].content = content;

        if(msg.value != 0){
            issues[issue_cnt].rewards[0] = msg.value;
            issues[issue_cnt].total_reward = msg.value;
            issues[issue_cnt].crowdfunders[0] = msg.sender;
        }else{
            issues[issue_cnt].total_reward = 0;
        }

        issues[issue_cnt].status = 0;
        issue_cnt++;

        return issue_cnt;
    }

    // submit crowfund
    function submitCrowfunding(uint issue_id) public payable{
        issues[issue_id].crowdfunders.push(msg.sender);
        issues[issue_id].rewards.push(msg.value);
        issues[issue_id].total_reward += msg.value;
    }

    // another citizen can claim he/she solved the issue.
    function setSovled(uint issue_id) public returns(uint, string, uint, uint, uint, address){
        address solver_address = msg.sender;
        string memory content;
        uint total_reward;
        uint status;
        uint crowdfunder_cnt;
        uint tmp;
        (tmp, content, total_reward, status, crowdfunder_cnt) = getIssue(issue_id);
        return (issue_id, content, total_reward, status, crowdfunder_cnt, solver_address);
    }

    // the process of checking is done offline by admin.
    // when an issue is solved, all reward will transfered to the solver.
    function completeIssue(uint issue_id) public{
        issues[issue_id].status = 1;
        uint allreward = issues[issue_id].total_reward;
        msg.sender.transfer(allreward);
    }

    // if noone solve an issue for a long time, it will be closed by admin and all fund will be returned back.
    function closeIssue(uint issue_id) public{
        for(uint i = 0; i < issues[issue_id].rewards.length; i++){
            address return_person = issues[issue_id].crowdfunders[i];
            uint return_reward = issues[issue_id].rewards[i];
            return_person.transfer(return_reward);

            issues[issue_id].total_reward = 0;
        }
    }

    function getTotalreward(uint issue_id) public returns(uint){
        return issues[issue_id].total_reward;
    }

    function getIssue(uint issue_id) public returns(uint, string, uint, uint, uint){
        string content = issues[issue_cnt].content;
        uint total_reward = issues[issue_cnt].total_reward;
        uint status = issues[issue_cnt].status;
        uint crowdfunder_cnt = issues[issue_cnt].crowdfunders.length;

        return (issue_id, content, total_reward, status, crowdfunder_cnt);
    }

    // all rewards of pending issues in the platform.
    function checkFund() public view returns(uint) {
        return this.balance;
    }
}
