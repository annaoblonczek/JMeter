/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 48.78048780487805, "KoPercent": 51.21951219512195};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "JSON Placeholder API"], "isController": false}, {"data": [0.0, 500, 1500, "Altium Store"], "isController": false}, {"data": [0.0, 500, 1500, "Altium"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 41, 21, 51.21951219512195, 4170.7317073170725, 1762, 7167, 3050.0, 7039.400000000001, 7113.3, 7167.0, 4.012919643731037, 690.4781476338455, 0.4721756631105021], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JSON Placeholder API", 1, 0, 0.0, 1762.0, 1762, 1762, 1762.0, 1762.0, 1762.0, 1762.0, 0.5675368898978433, 0.5758504185584563, 0.07759293416572077], "isController": false}, {"data": ["Altium Store", 20, 20, 100.0, 5918.9, 4499, 7167, 6337.0, 7113.3, 7164.35, 7167.0, 2.770466823659787, 756.7260928192962, 0.3273696149051115], "isController": false}, {"data": ["Altium", 20, 1, 5.0, 2543.0000000000005, 1994, 3050, 2590.5, 2968.3, 3046.35, 3050.0, 6.230529595015576, 495.574742017134, 0.7240556853582555], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 3,050 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 7,077 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,416 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 4,749 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 7,107 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 4,499 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,321 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 4,974 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 5,517 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 4,730 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,889 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 7,114 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 4,728 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,439 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 4,759 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,648 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 5,335 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 7,167 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 5,046 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,510 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}, {"data": ["The operation lasted too long: It took 6,353 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.761904761904762, 2.4390243902439024], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 41, 21, "The operation lasted too long: It took 3,050 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 7,077 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 6,416 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 4,749 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 7,107 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Altium Store", 20, 20, "The operation lasted too long: It took 7,077 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 6,416 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 4,749 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 7,107 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 4,499 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, {"data": ["Altium", 20, 1, "The operation lasted too long: It took 3,050 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
