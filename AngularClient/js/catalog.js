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
    $scope.queryType = 'All Fields';
    $scope.page = 1;
    $scope.whichLibrary = 'HUNTER';
    $scope.schools = [{'value':'BARUCH', 'label':'Baruch College'}, {'value':'BOROUGH', 'label':'BMCC'}, {'value':'BRONX', 'label':'Bronx CC'},
        {'value':'BROOKLYN', 'label':'Brooklyn College'}, {'value':'CENTRO', 'label':'Centro at Hunter'},
        {'value':'CITY', 'label':'City College and DSI'}, {'value':'STATENISLAND', 'label':'College of Staten Island'},
        {'value':'GRADCENTER', 'label':'Graduate Center'}, {'value':'JOURNALISM', 'label':'Graduate School of Journalism'},
        {'value':'HOSTOS', 'label':'Hostos CC'}, {'value':'HUNTER', 'label':'Hunter College'}, {'value':'JOHNJAY', 'label':'John Jay College'},
        {'value':'KINGSBOROUGH', 'label':'Kingsborough CC'}, {'value':'LAGUARDIA', 'label':'LaGuardia CC'}, {'value':'LAW', 'label':'Law School'},
        {'value':'LEHMAN', 'label':'Lehman College'}, {'value':'MEDGAR', 'label':'Medgar Evers College'}, {'value':'NYCITY', 'label':'NYCCT'},
        {'value':'QUEENS', 'label':'Queens College'}, {'value':'QUEENSBOROUGH', 'label':'Queensborough CC'}, {'value':'YORK', 'label':'York College'}]

    $scope.choices = [{ "value": "All Fields", "label": "All fields" }, { "value": "TTL", "label": "Title" }, { "value": "AUT", "label": "Author" }
    , { "value": "SHL", "label": "Call Number" }, { "value": "SUL", "label": "Subject" }, { "value": "ISBN", "label": "ISBN" }];

    $scope.fetch = function(whichEvent) {
        $scope.dataOnPage = 0;
        if (whichEvent == 'new'){ $scope.page = 1; $scope.nextScanPage = ''; }else{ $scope.page = $scope.page + 1; };
        $scope.listType = $scope.queryType;
        var jqxhr = $.getJSON(APILocation + "/search", {'query':$scope.query, 'queryType':$scope.queryType, 'page': $scope.page,
            alephCookie: $scope.theCookie, 'scanStart': $scope.nextScanPage, 'school': $scope.whichLibrary},function(data) {})
        .success(function(data) {
            $scope.$apply(function(){
            $scope.theCookie = data.alephCookie;
            $scope.nextScanPage = data.scanStart;
                if ($scope.page == 1){
                    $scope.data = data.allBooks;
                }
                else{
                    $scope.data = $scope.data.concat(data.allBooks);
                };
                $scope.dataOnPage = data.allBooks.length;
                if ($scope.data[0] == undefined){
                    $scope.results = 'Nothing Found!'
                }
                else{ $scope.results = '' };
            });
        })
        .error(function(data) { alert('error') });
    };

    $scope.marc = function(item) {
        $scope.detailedItem = item;
        var jqxhr = $.getJSON(APILocation + "/marc", {'docNumber' : item.docNumber},function(data) {
        $scope.$apply(function(){
                $scope.marcRecord = data;
            });
        })
        .error(function(data) { alert('error') });
    };


    $scope.goRecord = function(item) {
        $scope.dataOnPage = 0;
        $scope.listType = 'All Fields';
        $('.table').hide();
        if (!$scope.isOpen(item)){
            if (item.title){
                $.getJSON(APILocation + "/details",{'docNumber':item.docNumber, 'library':item.libraryCode},function(data){
                    $scope.$apply(function(){
                        $scope.details = data;
                    });
                })
                .success(function(data) { $('.table').slideDown();})
                .error(function(data) { alert('error') });
            }
            else if (item.accessCode){
                $.getJSON(APILocation + "/search",{'accessCode': item.accessCode },function(data) {
                    $scope.$apply(function(){
                        $scope.data = data.allBooks;
                    });
                })
                .success(function(data) {$('.table').slideDown();})
                .error(function(data) { alert('error') });
            }
            else{
                docNumber = item.docNumber || '1';
                $.getJSON(APILocation + "/details",{'docNumber': docNumber, 'library': 'none' },function(new_data) {
                    $scope.$apply(function(){
                        $scope.details = new_data;
                    });
                })
                .success(function(data) {$('.table').slideDown();})
                .error(function(data) { alert('error') });
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

    $scope.needsAnotherPage = function(){
        if ($scope.queryType == 'All Fields'){return $scope.dataOnPage === 20}else{return $scope.dataOnPage === 10};
    };
};



