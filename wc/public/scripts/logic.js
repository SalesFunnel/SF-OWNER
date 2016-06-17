/** --content
 *    --menu
 *    --tool
 *      --actions
 *      --
 */
var Report = React.createClass({
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
            </div>
        );
    }
});

var Summary = React.createClass({
    render: function() {
        var startValue = '', endValue = '', total = '', nodes = [];
        if (this.props.data.constructor != Array) {
            startValue = this.props.data.steps.startValue;
            endValue = this.props.data.steps.endValue;
            total = this.props.data.summary.total;

            nodes = this.props.data.summary.stage.map(function(stage) {
                return (
                    <li>
                        {stage.name + ' : ' + stage.value}
                    </li>
                );
            });
        }

        return (
            <div className="Summary">
                <span>from: </span>
                <strong>{startValue}</strong>
                <span> to: </span>
                <strong>{endValue}</strong>
                <p>Total: {total}</p>
                <ul>
                    {nodes}
                </ul>
            </div>
        );
    }
});

var Cycles = React.createClass({
    render: function() {
        function getStages(stages){
            return stages.map(function(stage) {
                return (
                    <li>
                        {stage.name + ' : ' + stage.value}
                    </li>
                );
            });
        };

        function getCycles(cycles){
            return cycles.map(function(cycle) {
                var nodes = getStages(cycle.stage);
                var detail = {};
                if (cycle.detail && cycle.detail.length > 0){
                    detail = cycle.detail[0];
                }

                return (
                    <div>
                        <a href={cycle.link} target='_blank'>{cycle.number}</a>
                        <span>:   <strong>{cycle.duration}</strong> days:  </span>
                        <span>{cycle.name}</span>

                        <div>
                            <span><strong>Stream</strong>: {detail.stream}</span>
                            <span>  </span>
                            <span><strong>Size</strong>: {detail.size}</span>
                            <span>  </span>
                            <span><strong>Own1</strong>: {detail.own1}</span>
                            <span>  </span>
                            <span><strong>Own2</strong>: {detail.own2}</span>
                            <span>  </span>
                            <span><strong>Completed Date</strong>: {detail.completedDate}</span>
                            <span>  </span>
                        </div>

                        <ul>{nodes}</ul>

                        <div id="detail-editor">
                            <textarea id={cycle.number} name="textarea" rows="10" cols="50" defaultValue="2: Input static story HTML source here"></textarea>
                        </div>
                    </div>
                );
            });
        };

        var cycles = '';
        if (this.props.data.constructor != Array) {
            cycles = getCycles(this.props.data.stories);
        }

        return (
            <div className="Cycles">
                {cycles}
            </div>
        );
    }
});

var Tool = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function () {
        $('#analyse-detail-button').click(function () {
            var detailTextArea = $('#detail-editor textarea');
            var details = $.map(detailTextArea, function(textarea) {
                var key = $(textarea).attr('id');
                var value = $(textarea).val();
                return {
                    id: key,
                    html: value
                };
            });
            var storyDetail = ct.analyzeDetail(details);
            var mergedData = ct.mergeDetail(this.state.data, storyDetail);

            this.setState({data: mergedData}, null);
            this.props.onReportUpdate(mergedData);
        }.bind(this));

        $('#analyse-button').click(function(){
            var htmlSourceStr = $('#editor textarea:first').val();
            var result = ct.analyze(htmlSourceStr);

            this.setState({data: result}, null);
            this.props.onReportUpdate(result);
        }.bind(this));

        $('#save-button').click(function(){
            var paras = {data: this.state.data};
            var reportName = $('input#name').val();
            var pairNumber = $('input#pair').val();
            if(!reportName || !pairNumber){
                alert('Report Name and Dev Pair are required.');
                return;
            }

            paras.reportName = reportName;
            paras.pairNumber = pairNumber;
            this.props.onReportSubmit(paras);
        }.bind(this));
    },
    render: function () {
        return (
            <div id="tool">
                <h2>Tool</h2>
                <button id="analyse-button">1: Analyse</button>
                <button id="analyse-detail-button">2: Analyse Detail</button>
                <button id="save-button">3: Save Report</button>

                <div id="editor">
                    <textarea name="textarea" rows="10" cols="50" defaultValue="1: Input static mingle cycle time HTML source here"></textarea>
                </div>
                <div id="result">
                    <h3>Analyse Result:</h3>
                    <Summary data={this.state.data} />
                    <Cycles data={this.state.data} />
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