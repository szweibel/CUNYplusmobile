var catalog = {};
var app = angular.module('catalog',['ngResource']);

var APILocation = 'http://mighty-wildwood-7308.herokuapp.com';
jQuery(document).ready(function($) {
    $.blockUI.defaults.css = {
        padding:        0,
        margin:         0,
        width:          '30%',
        top:            '40%',
        left:           '35%',
        textAlign:      'center',
        color:          '#ffff',
        border:         'none',
        backgroundColor:'transparent',
        cursor:         'auto'
    }
    // $.blockUI.defaults.showOverlay = false

    $.blockUI.defaults.message = '<img src="img/ajax-loader.gif"/>';
    $('input[type=text]').keyup(function(e) {
        if(e.keyCode == 13) { $('#search').trigger('click'); }
    });
    $(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
});


function CatalogCtrl($scope, $http, $templateCache) {
    $scope.APILocation = APILocation;
    $scope.query = null;
    $scope.queryType = 'All Fields';
    $scope.results = '';
    $scope.page = 1
    $scope.theCookie = ''
    $scope.nextScanPage = ''
    $scope.listType = 'books'
    $scope.choices = [{ "value": "All Fields", "label": "All fields" }, { "value": "TTL", "label": "Title" }, { "value": "AUT", "label": "Author" }
    , { "value": "SHL", "label": "Call Number" }, { "value": "SUL", "label": "Subject" }];

    $scope.fetch = function() {
        $scope.listType = $scope.queryType;
        var jqxhr = $.getJSON(APILocation + "/search", {'query':$scope.query, 'queryType':$scope.queryType, 'page': $scope.page,
            alephCookie: $scope.theCookie, 'scanStart': $scope.nextScanPage},function(data) {
        $scope.$apply(function(){
                $scope.data = data.allBooks;
                if ($scope.data[0] == undefined){
                    $scope.results = 'Nothing Found!'
                }
                else{ $scope.results = '' };
            });
        })
        .error(function(data) { alert('error') });
    };


    $scope.goRecord = function(item) {
        $scope.listType = 'All Fields';
        $('.table').hide();
        if (!$scope.isOpen(item)){
            if (item.title){
                $.getJSON(APILocation + "/details",{'docNumber':item.docNumber, 'library':item.libraryCode},function(data){
                    $scope.$apply(function(){
                        $scope.details = data;
                    });
                })
                .error(function(data) { alert('error') })
                .complete(function(data) { $('.table').slideDown();});
            }
            else if (item.accessCode){
                $.getJSON(APILocation + "/search",{'accessCode': item.accessCode },function(data) {
                    $scope.$apply(function(){
                        $scope.data = data.allBooks;
                    });
                })
                .error(function(data) { alert('error') })
                .complete(function(data) {$('.table').slideDown();});
            }
            else{
                docNumber = item.docNumber || '1';
                $.getJSON(APILocation + "/details",{'docNumber': docNumber, 'library': 'none' },function(new_data) {
                    $scope.$apply(function(){
                        $scope.details = new_data;
                        console.log($scope.details);
                    });
                })
                .error(function(data) { alert('error') })
                .complete(function(data) {$('.table').slideDown();});
            };
        };
        if ($scope.isOpen(item)){
            $scope.opened = undefined;
        }else {
            $scope.opened = item;
        };

    };

    $scope.isOpen = function(item){
        return $scope.opened === item;
    };
};



