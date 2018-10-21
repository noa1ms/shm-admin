angular
  .module('shm_categories', [
    'angular-jsoneditor',
  ])
  .controller('ShmCategoriesController', ['$scope', '$modal', 'shm', 'shm_request', function($scope, $modal, shm, shm_request) {
    'use strict';

    var url = 'admin/services_commands.cgi';
    $scope.url = url;

    $scope.columnDefs = [
        {field: 'category'},
        {field: 'name'},
        {field: 'params'},
    ];

    $scope.service_editor = function (title, row, size) {
        return $modal.open({
            templateUrl: 'views/services_commands_edit.html',
            controller: function ($scope, $modalInstance, $modal) {
                $scope.title = title;
                $scope.data = angular.copy(row);

                // Load servers groups
                shm_request('GET','/admin/servers_groups.cgi').then(function(servers) {
                    $scope.servers = servers;
                });

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.save = function () {
                    $modalInstance.close( $scope.data );
                };

                $scope.delete = function () {
                    $modalInstance.dismiss('delete');
                };

                $scope.editJson = function(data) {
                    shm.editJson(data).result.then(function(json) {
                        $scope.data.settings = json;
                    },function(cancel) {
                    })
                };
            },
            size: size,
        });
    }

    var save_service = function( row, save_data ) {
        delete save_data.$$treeLevel;
        console.log('SAVE: ', save_data );
        shm_request('POST_JSON','/'+url, save_data ).then(function(new_data) {
            angular.extend( row, new_data );
        });
    };

    $scope.add = function() {
        var row = {
            next: null,
        };

        $scope.service_editor('Создание события', row, 'lg').result.then(function(data){
            shm_request('PUT_JSON','/'+url, data ).then(function(row) {
                row.$$treeLevel = 0;
                $scope.gridOptions.data.push( row );
            });
        }, function(cancel) {
        });
    };

    $scope.row_dbl_click = function(row) {
        $scope.service_editor('Редактирование события', row, 'lg').result.then(function(data){
            save_service( row, data );
        }, function(resp) {
            if ( resp === 'delete' ) {
                shm_request('DELETE','/'+url+'?id='+row.id ).then(function() {
                    $scope.gridOptions.data.splice(
                        $scope.gridOptions.data.indexOf( row ),
                        1
                    );
                })
            }
        });
    }

  }]);

