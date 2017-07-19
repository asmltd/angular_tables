/**
 * Created by hariharaselvam on 7/27/16.
 * Angular JS factory for custom HTTP requests
 * Objective:
 * 1 All API calls can be send via single code
 * 2 Customize error messages for API error response
 * 3 Loading div visibility toggled as per API Request
 */

window[appName].factory('http', function ($http, $rootScope, $state) {
    return {
        Requests: function (method, URL, parameter) {
            /* Request to API with JSONs and receive Response as JSONs*/
            /* Show Loading... message before API request */
            $rootScope.showLoader = true;
            var $promise = {};
            switch (method) {
                case 'post':
                    $promise = $http.post(URL, parameter);
                    break;
                case 'patch':
                    $promise = $http.patch(URL, parameter);
                    break;
                case 'put':
                    $promise = $http.put(URL, parameter);
                    break;
                case 'get':
                    $promise = $http.get(URL, parameter);
                    break;
                case 'delete':
                    $promise = $http.delete(URL, parameter);
                    break;
            }
            $promise.error(function (response, error) {

                if (response["detail"] == "Authentication credentials were not provided.") {
                    /* Redirect to Login page if session unavailable */
                    window.location = "/auth/login/?next=/" + window.location.hash;
                }
                else {
                    /* Redirect to Error page if API response Error */
                    $state.go('error', {type: error.toString()});

                }


            });
            $promise.finally(function () {
                /* Hide Loading... message after completion of API request */
                $rootScope.showLoader = false;
            });

            return $promise;

        },
        Uploads: function (file, data, uploadUrl) {
            /* Upload file to API */
            var fd = new FormData();
            fd.append('file', file);
            var params = Object.keys(data);
            for (i = 0; i < params.length; i++) {
                fd.append(params[i], data[params[i]])
            }
            /* Show Loading... message before API request */
            $rootScope.showLoader = true;
            $promise = $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
            $promise.error(function (response, error) {

                if (response["detail"] == "Authentication credentials were not provided.") {
                    /* Redirect to Login page if session unavailable */
                    window.location = "/auth/login/?next=/" + window.location.hash;
                }
                else {
                    /* Redirect to Error page if API response Error */
                    $state.go('error', {type: error.toString()});

                }


            });
            $promise.finally(function () {
                /* Hide Loading... message after completion of API request */
                $rootScope.showLoader = false;
            });

            return $promise;


        }

    }
});

