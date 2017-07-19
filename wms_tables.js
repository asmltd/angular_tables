/**
 * ANGULAR-TABLES Directive library:
 * """""""""""""""""""""""""
 * Created by Hariharaselvam Balasubramanian on 8/8/16.
 * for Wireless Monitoring Server Project
 *
 *   This directive for table to have pagination, column sorting, data filter by search keyword, export and other options
 *   will be useful for wms project only
 *
 *   Main Template:
 *   """"""""""""""
 *   /media/js/directive/templates/datatable.tpl.html is the main template to have following special options
 *   1. Pagination
 *   2. Page size selection
 *   3. Start and end with total
 *   4. Filter
 *   5. Download
 *   6. Pin or edit button
 *   7. Loading icon while data fetching from api
 *
 *
 *   /media/js/directive/templates/tables/ folder have templates for each type of table
 *
 *   How to use:
 *   """ "" """"
 *   <angular-tables options="table_info"></angular-tables> on your html ( controller scope )
 *
 *   $scope.table_info={ "api": "/api/v1/table/", "type": "dashboard"}; on your js  ( controller function )
 *
 *   Options:
 *   """""""
 *   1. api         it is the url of the api which allows get method with following common parameters
 *                  page_size, page_number, sort, order, filter
 *   2. type        it is the name of the template file.
 *   3. title       it is optional parameter. it will be displyed above the table
 *   3. tools       it is optional paramater. default value is true. if we pass as false it will hide export, page size and
 *                  filter
 *   4. itemperpage it is optional parameter. default value is 10.
 *   5. location    it is to show hide some column based on the page
 *
 *   API Response JSON format for api call /api/v1/table/?page=1&page_limit=2&sort=version&order=asc&filter=SZ104
 *   {
    "page": 1,
    "total_rows": 10,
    "result": [
        {
            "version": "3.4.1.0.208",
            "color": "green",
            "id": "AV0ZSpekFXlum0ch5UAy",
            "tenant": "Unallocated",
            "name": "Lorenzo",
            "tenant_id": 1,
            "platform": null,
            "score": null,
            "timestamp": 1500443100,
            "record_id": "AV1ZfEzgrUuddpRa6Xvn",
            "model": "SZ104"
        },
        {
            "version": "3.4.1.0.208",
            "color": "red",
            "id": "AV0ZSabcXAyzu1kb4WEi",
            "tenant": "Unallocated",
            "name": "SuperComputer",
            "tenant_id": 1,
            "platform": null,
            "score": null,
            "timestamp": 1500443100,
            "record_id": "AV0ZDvbnWDlfd5fb3KFq",
            "model": "SZ104"
        }
    ],

    "number_of_rows": 2
}
 *
 *
 * */


window[appName].directive("wmsTables", function (http, message, pin, wmslib, $rootScope) {
    return {

        restrict: 'E',

        templateUrl: "/media/js/directive/templates/datatable.tpl.html",

        scope: {
            config: '=options',
            popup: "&showPopup"
        },

        controller: function ($scope, $sce, $interval) {


            $scope.start = 0;
            $scope.end = 0;
            $scope.items = 0;
            $scope.list = [];
            $scope.boundaryLinks = true;
            $scope.directionLinks = true;
            $scope.title = $scope.config.title;
            $scope.alert = false;

            $scope.host = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');


            $scope.get_data = function () {
                /* Do nothing if API is empty */
                if ($scope.config.api == "" || $scope.config.api == undefined) {
                    return false;
                }
                /* Show loader image before API request */
                $scope.loaded = false;
                /* API URL generated with options */
                $scope.api = $scope.config.api;
                $scope.api = $scope.api + "?page=" + $scope.pagination.current; /* Page number */
                $scope.api = $scope.api +"&page_limit=" + $scope.itemperpage; /* Number of rows to return */
                $scope.api = $scope.api + "&sort=" + $scope.sort; /* Column name to be sorted */
                $scope.api = $scope.api + "&order=" + $scope.order; /* Ascending Descending order */
                $scope.api = $scope.api + "&filter=" + $scope.filter; /* Search text */

                /* Call API and convert data to table */
                http.Requests('get', $scope.api, '').success(function (response) {

                    $scope.loaded = true; /* to hide loading icon over the table */
                    $scope.list = response.result; /* list of dictionary from the API Response */
                    $scope.items = response.total_rows; /* Total number of rows in DB */
                    $scope.start = ($scope.itemperpage * ($scope.pagination.current - 1)) + 1; /* Starting point of row in data table */
                    $scope.end = $scope.start + response.number_of_rows - 1; /* Ending point of row in data table */
                    $scope.export = $scope.config.api + "?export=true&page=1&page_limit=" + $scope.items; /* Export URL */
                    $scope.pages = generatePagesArray($scope.pagination.current, $scope.items, $scope.itemperpage, 7); /* list of page numbers */
                    $scope.pagination.last = $scope.pages[$scope.pages.length - 1]; /* Last number of page*/


                    /*if ($scope.config.type == "uesession_history") {

                        for (i = 0; i < $scope.list.length; i++) {
                            var ls = new Date($scope.list[i].last_seen);
                            var fs = new Date($scope.list[i].first_seen);
                            var seconds = (ls - fs);
                            $scope.list[i].session_time = seconds;

                        }
                    }*/
                    /*
                    * Write custom format for table types here
                    * */
                    $scope.highlight(); /* Highlight */


                });


            };

            /* for ng-bind-html with highlight */
            $scope.to_trusted = function (html_code) {
                var html = "";
                try {
                    html = $sce.trustAsHtml(html_code)
                }
                catch (e) {
                    html = html_code
                }
                return html;
            };

            $scope.highlight = function () {
                if ($scope.filter != "" && $scope.filter != undefined) {

                    for (i = 0; i < $scope.list.length; i++) {
                        var columns = Object.keys($scope.list[i]);
                        /* To skip columns form highlight */
                        var no_highlight = ['id','record_id', 'codename', 'color', 'content', 'status', 'tx_rate', 'rx_rate'];

                        for (j = 0; j < columns.length; j++) {
                            if (no_highlight.indexOf(columns[j]) != -1) {
                                continue;
                            }
                            if (typeof $scope.list[i][columns[j]] == "string") {
                                var keys = $scope.filter.split(" ");
                                for (k = 0; k < keys.length; k++) {

                                    if (['or', 'Or', 'OR', 'and', 'And', 'AND'].indexOf(keys[k]) != -1) {
                                        continue;
                                    }

                                    var regEx = new RegExp(keys[k], "ig");
                                    var to_match = $scope.list[i][columns[j]].replace(/<span class='highlight'>(.*?)<\/span>/g, '');
                                    var matches = to_match.match(regEx);

                                    console.log("match " + matches);
                                    if (matches != null) {
                                        console.log("key " + keys[j]);
                                        var highlight = "<span class='highlight'>$&</span>";
                                        $scope.list[i][columns[j]] = $scope.list[i][columns[j]].replace(regEx, highlight);
                                        console.log($scope.list[i][columns[j]]);
                                    }


                                }


                            }

                        }

                    }

                }


            };

            /* Initiation of data table */
            $scope.default_page = function () {
                $scope.sort = "";
                $scope.order = "";
                $scope.filter = "";

                if ($scope.config.filter != undefined) {
                    $scope.filter = $scope.config.filter;
                }
                $scope.itemperpage = 10;

                if ($scope.config.itemperpage != undefined) {
                    $scope.itemperpage = $scope.config.itemperpage;
                }
                $scope.pagination = {};
                $scope.pagination.current = 1;
                $scope.get_data();

            };

            /* Page change function */
            $scope.setCurrent = function (pagenum) {
                if (pagenum == '...') {
                    return false;
                }
                $scope.pagination.current = pagenum;
                $scope.get_data();
            };

            /* Number of rows change function */
            $scope.setSize = function () {
                $scope.pagination.current = 1;
                $scope.get_data();
            };

            /* Go to fist page function */
            $scope.firstPage = function () {
                $scope.pagination.current = 1;
                $scope.get_data();
            };

            /* Sort data by column name function */
            $scope.colum_sort = function (colname) {
                if ($scope.sort == colname) {
                    if ($scope.order == "") {
                        $scope.order = "desc";
                    }
                    else {
                        $scope.order = "";

                    }

                }
                $scope.sort = colname;
                $scope.get_data();
            };

            /* Change icon at column name as per sorting */
            $scope.get_col_icon = function (colname) {

                if ($scope.sort == colname) {
                    if ($scope.order == "") {
                        return "fa-sort-asc";
                    }
                    else {
                        return "fa-sort-desc";

                    }

                }
                else {
                    return "fa-sort";

                }

            };

            /* Draw columns as per type of table */
            $scope.get_template = function () {

                return "/media/js/directive/templates/tables/" + $scope.config.type + ".table.html?v=" + window.version;
            };


            /* for loading time */
            $scope.get_opacity = function () {
                if (!$scope.loaded) {
                    return {opacity: 0.5};
                }
                return {}
            };



            $scope.default_page();


            /* Sample function called from table rows */
            /* for Custom dashboard share to group and users tables */
            $scope.toggle_dash = function (id, share) {

                var param = {'object_id': id, 'action': share};
                $scope.update_and_call_back('post', $scope.config.api, param);

            };


            /* update the table operations and call the data back */
            $scope.update_and_call_back = function (method, api, param) {

                http.Requests(method, api, param).success(function (response) {
                    $scope.alert = true;
                    $("#alert").html(message.alert(response.status, response.result));
                    $scope.get_data();
                });

            };

            /* Reload table data as for each 15 mins */
            $scope.Timer = null;

            $scope.StartTimer = function () {

                $scope.Timer = $interval(function () {
                    console.log("Table Reloading...");
                    $scope.get_data();
                }, 15 * 60 * 1000);
            };


            $scope.StopTimer = function () {

                if (angular.isDefined($scope.Timer)) {
                    $interval.cancel($scope.Timer);
                }
            };

            if ($scope.config.auto_reload == true) {
                $scope.StartTimer();
            }


            /* to get array of pages */
            function generatePagesArray(currentPage, collectionLength, rowsPerPage, paginationRange) {
                var pages = [];
                var totalPages = Math.ceil(collectionLength / rowsPerPage);
                var halfWay = Math.ceil(paginationRange / 2);
                var position;

                if (currentPage <= halfWay) {
                    position = 'start';
                } else if (totalPages - halfWay < currentPage) {
                    position = 'end';
                } else {
                    position = 'middle';
                }

                var ellipsesNeeded = paginationRange < totalPages;
                var i = 1;
                while (i <= totalPages && i <= paginationRange) {
                    var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

                    var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                    var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
                    if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                        pages.push('...');
                    } else {
                        pages.push(pageNumber);
                    }
                    i++;
                }
                return pages;
            }
            /* Pagination calculations */
            function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
                var halfWay = Math.ceil(paginationRange / 2);
                if (i === paginationRange) {
                    return totalPages;
                } else if (i === 1) {
                    return i;
                } else if (paginationRange < totalPages) {
                    if (totalPages - halfWay < currentPage) {
                        return totalPages - paginationRange + i;
                    } else if (halfWay < currentPage) {
                        return currentPage - halfWay + i;
                    } else {
                        return i;
                    }
                } else {
                    return i;
                }
            }


        },
        link: function (scope, element, attrs) {
            /* Re initiate table when configuration changed */
            scope.$watch('config', function () {
                scope.default_page();
            });
            /* Destroy Timer while table destructed */
            scope.$on('$destroy', function () {
                console.log(scope.config.type + " Table destroyed");
                scope.StopTimer();
            })


        }
    };
});
