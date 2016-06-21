/** --content
 *    --menu
 *    --tool
 *      --actions
 *      --
 */
var Report = React.createClass({
    handleClick: function(){
        var rV = Math.random() * 1000;
        var intV = parseInt(rV);
        var value = intV + 1;

        var groupMemberCount = ct.groupMemberNameArr.length;
        for(var i = 0; i < value; i++){
            var theOne = ct.groupMemberNameArr[(i % groupMemberCount)];
            $("#the-one-result").text(theOne);

        }
    },
    render: function() {
        var title = "", memberTasks = "";

        if (this.props.data.length > 0) {
            var data = ct.analyze(this.props.data);

            title = [[" "], data.task].join().split(',').map(function (title) {
                return (
                    <th>{title}</th>
                );
            });

            function getTasksByName(name){
                return data.task.map(function(action){
                    return (
                        <td>{data.memberTask[name][action].length}</td>
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
                <div id="the-one">
                    <h2 id="the-one-result"></h2>
                    <button onClick={this.handleClick}> Who is the One? </button>
                </div>
            </div>
        );
    }
});

var Menu = React.createClass({
    handleClick: function(report){
        this.props.onMenuItemClicked(report);
    },
    render: function () {
        var reports = ct.sortById(this.props.data).map(function(report) {
            return (
                <li>
                    <a id={report.id} href='#'
                       onClick={this.handleClick.bind(this, report)}>
                        {report.name} - {report.pair}
                    </a>
                </li>
            );
        }.bind(this));

        return (
            <div id="menu">
                <h2>Menu</h2>
                <ul>{reports}</ul>
            </div>
        );
    }
});

var CTBox = React.createClass({
    handleReportSubmit: function (report) {
        ct.saveReport(report, function(data){
            this.setState({menu: data}, null);
        }.bind(this));
    },
    handleReportUpdate: function (report) {
        this.setState({data:report}, null);
    },
    handleMenuItemClicked: function (report) {
        var reportData = JSON.parse(report.data);
        reportData.name = report.name;
        reportData.id = report.id;
        reportData.pair = report.pair;
        this.setState({data:reportData}, null);
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
                    <Report data={this.state.data} />
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <CTBox />,
    document.getElementById('content')
);