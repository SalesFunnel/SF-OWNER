/** --content
 *    --menu
 *    --tool
 *      --actions
 *      --
 */
var Report = React.createClass({
    handleClick: function(name, action){
        var me = this;
        var time = new Date().format("yyyy-MM-dd HH:mm:ss");
        var content = "Add " + action + " one more time for " + name + " at " + time + "?";
        dialog({
            title: 'Information Confirmed',
            content: content,
            okValue: 'Sure',
            ok: function () {
                me.props.onReportSubmit({
                    name: name,
                    action: action,
                    time: time
                });
            },
        }).show(document.getElementById(name+action));
    },
    render: function() {
        var title = "", memberTasks = "";

        if (this.props.data.length > 0) {
            var data = ct.analyze(this.props.data);

            var sorted = ct.getRanking(data);
            document.getElementById("ranking").innerHTML =
                "SalesFunnel Owner Table 排行榜：" + sorted.join("   ");

            title = [[" "], data.task].join().split(',').map(function (title) {
                return (
                    <th>{title}</th>
                );
            });

            var me = this;
            function getTasksByName(name){
                return data.task.map(function(action){
                    var uniqueId = name + action;
                    var count = data.memberTask[name][action].length;
                    var latestTime = '';
                    if(count > 0) {
                        latestTime = data.memberTask[name][action][count - 1]["time"];
                    }
                    return (
                        <td>
                            {count}
                            <button id={uniqueId} className="plus" onClick={me.handleClick.bind(this, name, action)}>+</button>
                            <p>{latestTime}</p>
                        </td>
                    );
                });
            };

            memberTasks = data.member.map(function(member) {
                return (
                    <tr>
                        <td>{member}</td>
                        {getTasksByName(member)}
                    </tr>
                );
            });
        }

        return (
            <div className="report">
                <h3>Owner</h3>
                <div>
                    <table id="report-table">
                        <tr>{title}</tr>
                        {memberTasks}
                    </table>
                </div>
                <PrizePool />
            </div>
        );
    }
});

var PrizePool = React.createClass({
    handleClick: function(){
        var groupMemberCount = ct.groupMemberNameArr.length;

        var rand = 0
        var preNum;
        ct.isRun = true;
        ct.playRunningMusic();

        ct.tx = setInterval(function () {
            if (ct.isRun) {
                while (true) {
                    rand = parseInt(Math.random() * 1000) % groupMemberCount;
                    if (rand != preNum) {
                        break;
                    }
                }
                preNum = rand;
                $(".item.active").removeClass("active");
                $("li.item").eq(rand).addClass("active");
            }
        }, 50);

        ct.stopTx = setTimeout(function () {
            ct.isRun = false;
            ct.playPauseMusic();
        }, 3000);
    },
    render: function () {
        var member = '';
        if(ct.groupMemberNameArr && ct.groupMemberNameArr.length > 0) {
            member = ct.groupMemberNameArr.map(function (name) {
                return (
                    <li className="item" id={name}>{name}</li>
                );
            });
        }

        return (
            <div id="the-one">
                <div id="the-one-result">
                    <ul>{member}</ul>
                </div>
                <button onClick={this.handleClick}> Who is the One?</button>
            </div>
        );
    }
});

var CTBox = React.createClass({
    handleReportSubmit: function (report) {
        ct.saveReport(report, function(data){
            this.setState({data: data}, null);
        }.bind(this));
    },
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        ct.getReport(function(data){
            this.setState({data: data}, null);
        }.bind(this));
    },
    render: function () {
        return (
            <div className="CTBox">
                <h1>Sales Funnel Owner Table</h1>
                <div id="report">
                    <Report data={this.state.data}
                            onReportSubmit={this.handleReportSubmit}/>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <CTBox />,
    document.getElementById('content')
);