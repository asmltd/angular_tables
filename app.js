/**
 * Created by hariharaselvam on 7/19/17.
 */
window.appName = 'Angular_app_name';

window[appName] = angular.module(appName, ['list of required angular directives libraries']);

window[appName].config(function (list_of_providers) {
    /*
     * State and URL information of Angular application
     * */
});
window[appName].controller('controller_name', function (list_of_directives,$scope) {

    $scope.table_info = {"api": "/api/v1/table/", "type": "dashboard"};

});