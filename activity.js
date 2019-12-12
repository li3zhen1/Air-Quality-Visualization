var globalDateFrom = new Date(2015, 0, 2);
var globalDate_DefautFrom = new Date(2015, 0, 2);
var globalDateTo = new Date(2015, 11, 31);
var AQIpath_BJ, AQIpath_SH, AQIpath_ZS;

var axisConfig = {
    innerPlateLineColor: '#4a4a4f',
    innerPlateLine: 0.4,
    cx: (document.body.clientWidth - 580) / 2,
    cy: (document.documentElement.clientHeight - 110) / 2,
    mainStroke: 1.5,
    subStroke: 1,
    subColor: '#d9d9db',
    mainColor: '#c6c6c8',
    axisNum: dateToIndex(globalDateTo) - dateToIndex(globalDateFrom) + 1,
    outerRadiusSeq: [0, 50, 100, 150, 200, 300, 500],
    scaleRatio: 3.2,
    innerRadius: 200,
    baseRadius: 100,
    innerLevel: 5,
}

function dateToIndex(dt) {
    return Math.round((dt - globalDate_DefautFrom) / 86400000);
}
function dateFormatToAxis(dt) {
    var mth = dt.getMonth() + 1;
    var dtt = dt.getDate();
    if (mth < 10)
        mth = '0' + mth;
    else mth = '' + mth;
    if (dtt < 10)
        dtt = '0' + dtt;
    else dtt = '' + dtt;
    return dt.getFullYear() + '/' + mth + '/' + dtt;
}
pageBody = d3.select("#Canvas");
function test_Selection(obj) {
    obj.append('rect').attr('width', 20).attr('height', 20).attr('fill', 'black');
}
function append_Geometry(parent, childId, dx, dy) {
    return parent.append('g')
        .attr('id', childId)
        .attr('transform', 'translate(' + dx + ',' + dy + ')')
}

function append_Lined_Circle(parent, childClass, r, stroke_width, stroke_color, fill, cx, cy) {
    return parent.append('circle')
        .attr('class', childClass).attr('r', r)
        .attr('cx', cx).attr('cy', cy)
        .attr('stroke-width', stroke_width)
        .attr('stroke', stroke_color)
        .attr('fill', fill)
}
function calcDots(A, angle) {
    _x = ((axisConfig.innerRadius + A / axisConfig.scaleRatio) * Math.cos(angle));
    _y = ((axisConfig.innerRadius + A / axisConfig.scaleRatio) * Math.sin(angle));
    return { x: _x, y: _y }
}

function calcDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2)
}


function calcRatioPoint(dist1, dist2, p1, p2) {
    _x = p1.x + (p2.x - p1.x) * (dist1 / (dist1 + dist2))
    _y = p1.y + (p2.y - p1.y) * (dist1 / (dist1 + dist2))
    return { x: _x, y: _y }
}
function calcMidPoint(p1, p2) {
    _x = (p1.x + p2.x) / 2
    _y = (p1.y + p2.y) / 2
    return { x: _x, y: _y }
}

function dotPlus(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y }
}
function dotMinus(p1, p2) {
    return { x: p1.x - p2.x, y: p1.y - p2.y }
}
function dotToStr(p1) {
    return (p1.x) + ' ' + (p1.y)
}
function bezierInterpolate(dotList) {
    var i;
    var midpt = [];
    var distList = [];
    var interDots = [];
    var ratiopt = [];
    for (i = 0; i < dotList.length - 1; i++) {
        midpt.push(calcMidPoint(dotList[i], dotList[i + 1]))
        distList.push(calcDistance(dotList[i], dotList[i + 1]))
    }
    for (i = 0; i < midpt.length - 1; i++) {
        ratiopt.push(calcRatioPoint(distList[i], distList[i + 1], midpt[i], midpt[i + 1]));
        interDots.push(dotPlus(dotMinus(dotList[i + 1], ratiopt[i]), midpt[i]));
        interDots.push(dotPlus(dotMinus(dotList[i + 1], ratiopt[i]), midpt[i + 1]));
    }
    return interDots
}
function getPathAnchor(city, index1, index2) {
    //console.log(city, index1, index2);
    var Dots = [];
    var rad = 0;
    for (var i = index1; i <= index2; i++) {
        rad = (i - index1) / (index2 - index1 + 1) * Math.PI * 2;
        Dots.push(calcDots(data[city].data[i].A, rad));
    }
    var InterD = bezierInterpolate(Dots);
    var pth = "M" + axisConfig.innerRadius + " " + 0 + "L" + dotToStr(Dots[0]) + "S" + dotToStr(InterD[0]) + ' ' + dotToStr(Dots[1]);
    var i;
    for (i = 1; i < Dots.length - 2; i++) {
        pth += "C" + dotToStr(InterD[2 * i - 1]) + ' ' + dotToStr(InterD[2 * i]) + ' '
            + dotToStr(Dots[i + 1])
    }
    pth += "S" + dotToStr(InterD[2 * i - 1]) + ' ' + dotToStr(Dots[i + 1]);
    pth += "L" + dotToStr(calcDots(0, rad));
    pth += "A" + axisConfig.innerRadius + ' ' + axisConfig.innerRadius
        + " 0 1 0 " + axisConfig.innerRadius + " 0 Z";
    return pth;
}

function append_Radius_Line(parent, childClass, stroke_width, stroke_color, begin, end, angle) {
    begin_x = begin * Math.cos(angle);
    begin_y = begin * Math.sin(angle);
    end_x = end * Math.cos(angle);
    end_y = end * Math.sin(angle);
    return parent.append('path')
        .attr('class', childClass)
        .attr('d', 'M' + begin_x + ' ' + begin_y + ' L' + end_x + ' ' + end_y)
        .attr('stroke-width', stroke_width)
        .attr('stroke', stroke_color)
}

var mainGraph = append_Geometry(pageBody, "mainGraph", 50, 50)


var TransCenter_Outter = append_Geometry(mainGraph, "TransCenter_Outter", axisConfig.cx, axisConfig.cy)
var TransCenter_Inner = append_Geometry(mainGraph, "TransCenter_Inner", axisConfig.cx, axisConfig.cy)

var _OutterPlateField = append_Geometry(TransCenter_Outter, "_OutterPlateField", 0, 0)
var _OutterPathField = append_Geometry(TransCenter_Outter, "_OutterPathField", 0, 0)
var _InnerPathField = append_Geometry(TransCenter_Inner, "_InnerPathField", 0, 0)
var _InnerPlateField = append_Geometry(TransCenter_Inner, "_InnerPlateField", 0, 0)
var _MiniMax = append_Geometry(TransCenter_Inner, "_MiniMax", 0, 0)

var OutterPlateField = append_Geometry(_OutterPlateField, "OutterPlateField", 0, 0)
var OutterPathField = append_Geometry(_OutterPathField, "OutterPathField", 0, 0)
var InnerPlateField = append_Geometry(_InnerPlateField, "InnerPlateField", 0, 0)
var InnerPathField = append_Geometry(_InnerPathField, "InnerPathField", 0, 0)
var MiniMax = append_Geometry(TransCenter_Outter, "MiniMax", 0, 0)

var mapSVG = TransCenter_Inner.append('image').attr('xlink:href', 'resources/beijing.svg').attr('height', '160').attr('width', '160')
    .attr('transform', 'translate(' + -80 + ',' + -80 + ')')
var GraphTitle_plac = TransCenter_Inner.append('text').text('Beijing').attr('class','graphTitle').attr("alignment-baseline", 'middle').attr("text-anchor", 'middle')
.attr('transform', 'translate(' + 0 + ',' + -32 + ')')
var GraphTitle_time1 = TransCenter_Inner.append('text').text(dateFormatToAxis(globalDateFrom)).attr('class','graphSubTitle').attr("alignment-baseline", 'middle').attr("text-anchor", 'middle')
.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
var GraphTitle_time2 = TransCenter_Inner.append('text').text('~').attr('class','graphSubTitle').attr("alignment-baseline", 'middle').attr("text-anchor", 'middle')
.attr('transform', 'translate(' + 0 + ',' + 18 + ')')
var GraphTitle_time3 = TransCenter_Inner.append('text').text(dateFormatToAxis(globalDateTo)).attr('class','graphSubTitle').attr("alignment-baseline", 'middle').attr("text-anchor", 'middle')
.attr('transform', 'translate(' + 0 + ',' + 36 + ')')

function HighlightOutterGraph(city) {
    if (city == 0) {
        AQIPlot_BJ.attr('class', 'AQIpath_BJ_Highlight')
        AQIPlot_SH.attr('class', 'AQIpath_SH')
        AQIPlot_ZS.attr('class', 'AQIpath_ZS')
        mapSVG.attr('xlink:href', 'resources/beijing.svg');
        GraphTitle_plac.text('Beijing').attr('class','graphTitle_BJ')
    }
    else if (city == 1) {
        AQIPlot_BJ.attr('class', 'AQIpath_BJ')
        AQIPlot_SH.attr('class', 'AQIpath_SH_Highlight')
        AQIPlot_ZS.attr('class', 'AQIpath_ZS')
        mapSVG.attr('xlink:href', 'resources/shanghai.svg');
        GraphTitle_plac.text('Shanghai').attr('class','graphTitle_SH')
    }
    else if (city == 2) {
        AQIPlot_BJ.attr('class', 'AQIpath_BJ')
        AQIPlot_SH.attr('class', 'AQIpath_SH')
        AQIPlot_ZS.attr('class', 'AQIpath_ZS_Highlight')
        mapSVG.attr('xlink:href', 'resources/zhoushan.svg');
        GraphTitle_plac.text('Zhoushan').attr('class','graphTitle_ZS')
    }
    GraphTitle_time1.text(dateFormatToAxis(globalDateFrom))
    GraphTitle_time3.text(dateFormatToAxis(globalDateTo))
    rerenderMiniMax(city);
}

var DayPerMonth_acc = [0, 30, 58, 89, 119, 150, 180, 211, 242, 272, 303, 333, 364, 395, 424, 455, 485, 516, 546, 577, 608, 638, 669, 699, 730, 761, 789, 820, 850, 881, 911, 942, 973, 1003, 1034, 1064, 1095, 1126, 1154, 1185, 1215, 1246, 1276, 1307, 1338, 1368, 1399, 1429, 1460, 1491, 1519, 1550, 1580, 1611, 1641, 1672, 1703, 1733, 1764, 1794];
var MiniLength = [[], [], []];
var MaxLength = [[], [], []];
function calcMinimax() {
    var tmpMax, tmpMin;
    for (var city = 0; city < 3; city++) {
        for (var idd = 0; idd < 59; idd++) {
            tmpMax = 0; tmpMin = 50000;
            for (var idx = DayPerMonth_acc[idd]; idx < DayPerMonth_acc[idd + 1]; idx++) {
                tmpMax = Math.max(tmpMax, data[city].data[idx].Amax);
                if (data[city].data[idx].Amin > 0) tmpMin = Math.min(tmpMin, data[city].data[idx].Amin);
            }
            MiniLength[city].push(tmpMin);
            MaxLength[city].push(tmpMax)
        }
    }
}



function renderOutterPlate(parent) {
    var delta = (axisConfig.axisNum > 365) ? 30 : 1;
    outerL = axisConfig.innerRadius +
        axisConfig.outerRadiusSeq[axisConfig.outerRadiusSeq.length - 1] / axisConfig.scaleRatio;
    var initialIndex = dateToIndex(globalDateFrom);
    var endingIndex = dateToIndex(globalDateTo)
    for (var i = 0; i < axisConfig.outerRadiusSeq.length - 1; i++) {
        var rad = axisConfig.innerRadius + axisConfig.outerRadiusSeq[i] / axisConfig.scaleRatio;
        append_Lined_Circle(parent,
            "circleAxis", rad, axisConfig.subStroke, axisConfig.subColor, 'transparent', 0, 0)
    }
    for (var i = 0; i < axisConfig.axisNum; i += delta) {
        append_Radius_Line(
            parent, "radiusLine", axisConfig.subStroke, axisConfig.subColor,
            axisConfig.innerRadius, outerL, i / axisConfig.axisNum * Math.PI * 2)
    }
    var dttmp = new Date;
    var rotateAngle, flg;
    append_Lined_Circle(parent, "circleAxis",
        axisConfig.innerRadius
        + axisConfig.outerRadiusSeq[axisConfig.outerRadiusSeq.length - 1] / axisConfig.scaleRatio,
        axisConfig.mainStroke, axisConfig.mainColor, 'transparent', 0, 0)
    outerL += 36;
    for (var ii = initialIndex; ii <= endingIndex; ii++) {
        flg = DayPerMonth_acc.indexOf(ii);
        if ((flg >= 0 && axisConfig.axisNum < 700) || (flg >= 0 && axisConfig.axisNum >= 700 && flg % 2 == 0)) {
            dttmp.setTime(globalDateFrom.getTime() + 86400000 * (ii - initialIndex))
            rotateAngle = ((ii - initialIndex) / axisConfig.axisNum * 360)
            rotateAngle = (rotateAngle < 270 && rotateAngle > 90) ? (rotateAngle - 180) : rotateAngle
            parent.append('text').text(dateFormatToAxis(dttmp)).attr("alignment-baseline", 'middle').attr("text-anchor", 'middle')
                .attr('transform', 'translate(' + ((outerL) * Math.cos((ii - initialIndex) / axisConfig.axisNum * Math.PI * 2)) + ',' + ((outerL) * Math.sin((ii - initialIndex) / axisConfig.axisNum * Math.PI * 2)) + ') rotate(' + rotateAngle + ')')
        }
    }
    var angl = 1.27;
    for (var i = 0; i < axisConfig.outerRadiusSeq.length; i++) {
        var rad = axisConfig.innerRadius + axisConfig.outerRadiusSeq[i] / axisConfig.scaleRatio + 5;
        parent.append('text').text(axisConfig.outerRadiusSeq[i]).attr('class', 'NumberIndicator').attr("alignment-baseline", 'middle').attr("text-anchor", 'middle')
            .attr('transform', 'translate(' + (rad * Math.cos(Math.PI * angl)) + ',' + (rad * Math.sin(Math.PI * angl)) + ') rotate(' + (90 + angl * 180) + ')')
    }
}
function renderInnerPlate(parent) {
    var delta = (axisConfig.axisNum > 365) ? 30 : 1;
    for (var i = 0; i < axisConfig.axisNum; i += delta) {
        append_Radius_Line(
            parent, "radiusLine", axisConfig.innerPlateLine, axisConfig.innerPlateLineColor,
            axisConfig.baseRadius, axisConfig.innerRadius, i / axisConfig.axisNum * Math.PI * 2)
    }

    for (var i = 0; i <= axisConfig.innerLevel; i++) {
        var rad = axisConfig.baseRadius + (axisConfig.innerRadius - axisConfig.baseRadius) * i / axisConfig.innerLevel;
        append_Lined_Circle(parent,
            "circleAxis", rad, axisConfig.innerPlateLine, axisConfig.innerPlateLineColor, 'transparent', 0, 0)
    }
    var ls = [axisConfig.baseRadius, axisConfig.innerRadius * 0.2 + axisConfig.baseRadius * 0.8,
    axisConfig.innerRadius * 0.4 + axisConfig.baseRadius * 0.6,
    axisConfig.innerRadius * 0.6 + axisConfig.baseRadius * 0.4,
    axisConfig.innerRadius * 0.8 + axisConfig.baseRadius * 0.2,
    axisConfig.innerRadius]
    var pollutantsStandard = [1, 1, 1, 2, 3]

    function renderStandardLine() {
        for (var i = 0; i < 5; i++) {
            var r = ls[4 - i] * 0.2 * pollutantsStandard[i] + ls[5 - i] * (1 - 0.2 * pollutantsStandard[i])
            InnerPlateField.append("circle").attr('r', r).attr('stroke-width', axisConfig.innerPlateLine)
                .attr('stroke', axisConfig.innerPlateLineColor)
                .attr('stroke-dasharray', '3 2').attr('fill', 'transparent')
        }
    }
    renderStandardLine();
}
function renderInnerGraph(city, id1, id2) {
    function _calcRadius(len, angle) {
        _x = ((len) * Math.cos(angle));
        _y = ((len) * Math.sin(angle));
        return { x: _x, y: _y }
    }
    function _calcAngle(index) {
        return index * (Math.PI * 2 / axisConfig.axisNum)
    }
    function _calcPath(val, level, begin, end, index) {
        _begin = end - (end - begin) * Math.min((Math.floor(val / level + 0.6)) / 5, 1)
        p1 = _calcRadius(_begin, _calcAngle(index))
        p2 = _calcRadius(end, _calcAngle(index))
        p3 = _calcRadius(end, _calcAngle(index + 1))
        p4 = _calcRadius(_begin, _calcAngle(index + 1))
        return "M" + dotToStr(p1) + "L" + dotToStr(p2) +
            "A" + end + ' ' + end + " 0 0 1 " + dotToStr(p3) + "L" + dotToStr(p4) +
            "A" + _begin + ' ' + _begin + " 0 0 0 " + dotToStr(p1);
    }
    var PM2base = 75;
    var PM10base = 100;
    var SO2base = 20;
    var NO2base = 40;
    var CObase = 1;
    var ls = [axisConfig.baseRadius, axisConfig.innerRadius * 0.2 + axisConfig.baseRadius * 0.8,
    axisConfig.innerRadius * 0.4 + axisConfig.baseRadius * 0.6,
    axisConfig.innerRadius * 0.6 + axisConfig.baseRadius * 0.4,
    axisConfig.innerRadius * 0.8 + axisConfig.baseRadius * 0.2,
    axisConfig.innerRadius]
    function _render(city, index1, index2) {
        var i;
        for (i = 0; i <= index2 - index1; i++) {

            InnerPathField.append("path").attr('d',
                _calcPath(data[city].data[i + index1].C, CObase,
                    ls[0], ls[1], i))
                .attr('class', 'PollutionCO2')

            InnerPathField.append("path").attr('d',
                _calcPath(data[city].data[i + index1].N, NO2base,
                    ls[1], ls[2], i))
                .attr('class', 'PollutionNO2')

            InnerPathField.append("path").attr('d',
                _calcPath(data[city].data[i + index1].S, SO2base,
                    ls[2], ls[3], i))
                .attr('class', 'PollutionSO2')

            InnerPathField.append("path").attr('d',
                _calcPath(data[city].data[i + index1].P2, PM10base,
                    ls[3], ls[4], i))
                .attr('class', 'PollutionPM10')

            InnerPathField.append("path").attr('d',
                _calcPath(data[city].data[i + index1].P1, PM2base,
                    ls[4], ls[5], i))
                .attr('class', 'PollutionPM25')
        }
    }
    _render(city, id1, id2);
}
var HighlightCityNo = 0;
var data = [];
d3.json("dataset.json", function (d) {
    data = d;
    calcMinimax();
    renderOutterPlate(OutterPlateField);
    AQIPlot_BJ = OutterPathField.append("path").attr('d', getPathAnchor(0, dateToIndex(globalDateFrom), dateToIndex(globalDateTo))).attr('class', 'AQIpath_BJ')
    AQIPlot_SH = OutterPathField.append("path").attr('d', getPathAnchor(1, dateToIndex(globalDateFrom), dateToIndex(globalDateTo))).attr('class', 'AQIpath_SH')
    AQIPlot_ZS = OutterPathField.append("path").attr('d', getPathAnchor(2, dateToIndex(globalDateFrom), dateToIndex(globalDateTo))).attr('class', 'AQIpath_ZS')
    HighlightOutterGraph(HighlightCityNo);
    renderInnerGraph(0, dateToIndex(globalDateFrom), dateToIndex(globalDateTo));
    renderInnerPlate(InnerPlateField);
})
function rerenderGraph() {
    axisConfig.axisNum = dateToIndex(globalDateTo) - dateToIndex(globalDateFrom) + 1;
    OutterPlateField.remove();
    OutterPlateField = append_Geometry(_OutterPlateField, "OutterPlateField", 0, 0)
    InnerPlateField.remove();
    InnerPlateField = append_Geometry(_InnerPlateField, "InnerPlateField", 0, 0)
    InnerPathField.remove();
    InnerPathField = append_Geometry(_InnerPathField, "InnerPathField", 0, 0)
    renderOutterPlate(OutterPlateField);
    AQIPlot_BJ.attr('d', getPathAnchor(0, dateToIndex(globalDateFrom), dateToIndex(globalDateTo)))
    AQIPlot_SH.attr('d', getPathAnchor(1, dateToIndex(globalDateFrom), dateToIndex(globalDateTo)))
    AQIPlot_ZS.attr('d', getPathAnchor(2, dateToIndex(globalDateFrom), dateToIndex(globalDateTo)))
    HighlightOutterGraph(HighlightCityNo);
    renderInnerGraph(HighlightCityNo, dateToIndex(globalDateFrom), dateToIndex(globalDateTo));
    renderInnerPlate(InnerPlateField);
}
function changeMainCity(k) {
    if (k == HighlightCityNo) return;
    HighlightCityNo = k;
    var buttonIDs = ["BeijingButton", "ShanghaiButton", "ZhoushanButton"]
    for (var i = 0; i < 3; i++) {
        if (i == k) {
            d3.select('#' + buttonIDs[i]).attr('class', 'CityButton ' + buttonIDs[i] + 'Selected');
        }
        else {
            d3.select('#' + buttonIDs[i]).attr('class', 'CityButton ' + buttonIDs[i]);
        }
    }
    InnerPathField.remove();
    InnerPathField = append_Geometry(_InnerPathField, "InnerPathField", 0, 0)
    HighlightOutterGraph(k);
    renderInnerGraph(HighlightCityNo, dateToIndex(globalDateFrom), dateToIndex(globalDateTo));
}
window.onresize = function () {
    axisConfig.cx = (document.body.clientWidth - 580) / 2;
    axisConfig.cy = (document.documentElement.clientHeight - 110) / 2;
    TransCenter_Outter.attr('transform', 'translate(' + axisConfig.cx + ',' + axisConfig.cy + ')')
    TransCenter_Inner.attr('transform', 'translate(' + axisConfig.cx + ',' + axisConfig.cy + ')')
};
function rerenderMiniMax(city) {
    var initialIndex = dateToIndex(globalDateFrom);
    var endingIndex = dateToIndex(globalDateTo)
    var rotateAngle, flg, _st, _ed;
    MiniMax.remove(); MiniMax = append_Geometry(TransCenter_Outter, "MiniMax", 0, 0)
    for (var ii = initialIndex; ii <= endingIndex; ii++) {
        flg = DayPerMonth_acc.indexOf(ii);
        _st = MiniLength[city][flg] / axisConfig.scaleRatio + axisConfig.innerRadius;
        _ed = MaxLength[city][flg] / axisConfig.scaleRatio + axisConfig.innerRadius;
        if ((flg >= 0 && axisConfig.axisNum < 700) || (flg >= 0 && axisConfig.axisNum >= 700 && flg % 2 == 0)) {
            rotateAngle = (ii - initialIndex) / axisConfig.axisNum * Math.PI * 2
            append_Radius_Line(MiniMax, "MiniMaxClass", 2, "#000000a0", _st, _ed, rotateAngle)
            MiniMax.append('circle').attr('r', '3').attr('cx', _st * Math.cos((ii - initialIndex) / axisConfig.axisNum * Math.PI * 2))
                .attr('cy', _st * Math.sin((ii - initialIndex) / axisConfig.axisNum * Math.PI * 2)).attr('fill', '#000000a0')
            MiniMax.append('circle').attr('r', '3').attr('cx', _ed * Math.cos((ii - initialIndex) / axisConfig.axisNum * Math.PI * 2))
                .attr('cy', _ed * Math.sin((ii - initialIndex) / axisConfig.axisNum * Math.PI * 2)).attr('fill', '#000000a0')
        }
    }
}