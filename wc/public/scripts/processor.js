(function (ct) {

    function initMemberActions(member, task) {
        var action = {};
        $.each(member, function (index, name) {
            action[name] = {};
            $.each(task, function (index, t) {
                action[name][t] = [];
            });
        });
        return action;
    };

    function getMemberTask(actions, member, task) {
        var memberTask = initMemberActions(member, task);
        $.each(actions, function (index, action) {
            memberTask[action.name][action.action].push(action);
        });

        return memberTask;
    }

    ct.analyze = function (data) {
        if (data.length === 0) return;

        var member = data[0].member.split(", ");
        var task = data[0].task.split(", ");
        data.shift();

        ct.groupMemberNameArr = member;
        return {
            memberTask: getMemberTask(data, member, task),
            member: member,
            task: task
        };

    };

    ct.saveReport = function (data, cb) {

        var stringifyReport = {
            name: data.reportName,
            pair: data.pairNumber,
            data: JSON.stringify(data.data)
        };

        $.ajax({
            url: '/api/reports',
            dataType: 'json',
            type: 'POST',
            data: stringifyReport,
            success: function (data) {
                cb(data);
            }.bind(this),
            error: function (xhr, status, err) {
                alert(err);
            }.bind(this)
        });
    };

    ct.getReport = function (cb) {
        $.ajax({
            url: '/api/reports',
            dataType: 'json',
            cache: false,
            success: function (data) {
                cb(data);
            }.bind(this),
            error: function (xhr, status, err) {
                alert(err);
            }.bind(this)
        });
    };

    ct.sortById = function (list) {
        function sortByName(a, b) {
            var aID = a.id;
            var bID = b.id;
            return ((aID > bID) ? -1 : ((aID < bID) ? 1 : 0));
        }

        return list.sort(sortByName);
    };

    ct.playRunningMusic = function(){
        var runningMusic = document.getElementById("runingmic");
        runningMusic.volume = 0.5;
        runningMusic.currentTime = 0;
        runningMusic.play();
    };

    ct.playPauseMusic = function(){
        var runningMusic = document.getElementById("runingmic");
        runningMusic.pause();

        var pauseMusic=document.getElementById("pausemic");
        pauseMusic.volume=1.0;
        pauseMusic.currentTime = 0;
        pauseMusic.play();
    };

})(window.ct = window.ct || {})

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "H+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}