/**
 * Module dependencies.
 */
var express = require('express')
, jsdom = require('jsdom')
, request = require('request')
, url = require('url')
, querystring = require('querystring')
, feedparser = require('feedparser');

var app = express();

app.get('/', function (req, res){
    res.end('Hi!');
});

app.get('/search', function (req, res) {
    var searchQuery = req.query["query"];
    var searchType = req.query["queryType"];
    var accessCode = req.query["accessCode"];
    var pagination = req.query["page"];
    var alephCookie = req.query["alephCookie"];
    var uriBase = 'http://p83-apps.appl.cuny.edu.proxy.wexler.hunter.cuny.edu/F/'
    console.log(req.searchQuery)
    if (searchType == 'All Fields' || accessCode){
        if (accessCode){
            func = '?func=find-acc&acc_sequence=' + accessCode + '&local_base=HUNTER'
        }
        else{
            func = '?func=find-e&adjacent=N&find_scan_code=FIND_WRD&request=' + searchQuery.replace(' ', '+') + '&Search=+Search+&local_base=HUNTER'
        };
        if (pagination && alephCookie){
            uriBase = uriBase + (alephCookie);
            var page = '000021';
            var func = '?func=short-jump&jump=' + page;
        }
        var options = {uri: uriBase + func};
        request(options, function(error, response, body) {
        //  debugger;
            console.log(options.uri)
            if (error && response.statusCode !== 200) {
                console.log(error);
            }
            jsdom.env({
                html: body,
                scripts: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
                ]
                }, function (err, window) {
                // load jquery
                var $ = window.jQuery;

                var cookieTable = $('table')[2];
                var mine = $(cookieTable).find('td')[2];
                var cookieSource = $($(mine).find('form')).attr('action') || '/ ';
                var cookie = cookieSource.substr(cookieSource.lastIndexOf("/") + 1);

                var resultsTable = $('table')[4];
                var rows = $(resultsTable).children('tr');

                allBooks = new Array();

                rows.each(function (i, item) {
                    var image = $(item).children('td')[2];
                    $($(image).children('script')).remove();
                    //Get rid of follow-on requests
                    var imageSrc = $(image).find('img')
                    if ($(imageSrc).attr('src') == 'src') $(imageSrc).removeAttr('src');

                    var author = $(item).children('td')[3];

                    var title = $(item).children('td')[4];

                    $($(title).children('script')).remove();

                    var year = $(item).children('td')[5];
                    var resourceType = $(item).children('td')[6];

                    var holdingsAndLink = $(item).children('td')[7];
                    var holdingLibrary = $(holdingsAndLink).find('a');
                    var link = $(holdingLibrary).attr('href');

                    allBooks[i] = {
                        title: $(title).text().trim(),
                        author: $(author).text().trim(),
                        year: $(year).text().trim(),
                        resourceType: $(resourceType).text().trim(),
                        library: $(holdingLibrary).text().trim(),
                        };

                        if (image !== undefined)
                            allBooks[i].thumbnail = $(imageSrc).attr('src');

                        if (link !== undefined){
                            var urlObj = url.parse(link, true);
                            allBooks[i].docNumber = urlObj.query['doc_number'];
                            allBooks[i].libraryCode = urlObj.query['sub_library'];
                            allBooks[i].url = link;
                        };
                });
                res.cookie('AlephSession', cookie, { maxAge: 900000, httpOnly: false});
                // console.log(allBooks);
                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                });
                finalJSON = {
                    alephCookie: cookie,
                    allBooks: allBooks
                }
                res.end(JSON.stringify(finalJSON));
            });
        });
    }
        else{
            var func = '?func=find-e&adjacent=N&find_scan_code='+ searchType +'&request=' + searchQuery + '&Search=+Search+&local_base=HUNTER';
            if (pagination){
                uriBase = uriBase + alephCookie;
                func = '?func=scan&scan_start=025138317&scan_code=TTL&scan_op=NEXT';
            }
            var options = {uri: uriBase + func};

            request(options, function(error, response, body) {
            //  debugger;
                console.log(options.uri)
                if (error && response.statusCode !== 200) {
                    console.log(error);
                }
                jsdom.env({
                    html: body,
                    scripts: [
                        'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
                    ]
                }, function (err, window) {
                    // load jquery
                    var $ = window.jQuery;
                    var resultsTable = $('table')[3];
                    var rows = $(resultsTable).children('tr');
                    allChoices = new Array();
                    rows.each(function (i, item) {
                        var callNumber = $(item).children('td')[0];
                        var name = $(item).children('td')[1];
                        var link = $(name).find('a').attr('href');
                        allChoices[i] = {
                            callNumber: $(callNumber).text().trim(),
                            name: $(name).text().trim(),
                        }
                        if (link != undefined){
                                    var urlObj = url.parse(link, true);
                                    allChoices[i].docNumber = urlObj.query['doc_number'];
                                    allChoices[i].accessCode = urlObj.query['acc_sequence'];
                                    allChoices[i].url = link;
                                }
                        });
                    console.log(allChoices);

                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                });
                finalJSON = {
                    alephCookie: cookie,
                    allBooks: allChoices
                }
                res.end(JSON.stringify(finalJSON));
            });
        });
    };
})

app.get('/details', function (req, res) {
    var docNumber = req.query["docNumber"];
    var library = req.query["library"];
    if (library == 'none'){
        var options = {
        uri: 'http://apps.appl.cuny.edu:83/F/?func=item-global&doc_library=CUN01&doc_number=' + docNumber,
        };
    }
    else {
        var options = {
            uri: 'http://apps.appl.cuny.edu:83/F/?func=item-global&doc_library=CUN01&doc_number=' + docNumber + '&year=&volume=&sub_library=' + library,
        };
    };
    request(options, function(error, response, body) {
    //  debugger;
        console.log(options.uri)
        if (error && response.statusCode !== 200) {
            console.log(error);
        }

        jsdom.env({
                html: body,
                scripts: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
                ]
            }, function (err, window) {
            // load jquery
            var $ = window.jQuery;
            $('img[src]').each(function(i,el){
                $(el).removeAttr('src');
            });

            var allRecords = new Array();

            var resultsTable = $('table')[7];
            var citation = $('table')[2];

            var rows = $(resultsTable).children('tr');
            rows.each(function (i, item) {

                var expLibrary = $(item).children('td')[1];
                var expLocation = $(item).children('td')[2];
                var callNumber = $(item).children('td')[3];
                var description = $(item).children('td')[4];
                var status = $(item).children('td')[5];
                var dueDate = $(item).children('td')[6];
                var dueHour = $(item).children('td')[7];
                var requestUrl = 'http://apps.appl.cuny.edu:83/F/?func=title-request-form&bib_doc_number=' + docNumber;

                allRecords[i] = {
                    citation: $(citation).html().trim(),
                    library: $(expLibrary).html(),
                    location: $(expLocation).html(),
                    callNumber: $(callNumber).html(),
                    description: $(description).html(),
                    status: $(status).html(),
                    dueDate: $(dueDate).html(),
                    dueHour: $(dueHour).html(),
                    requestUrl: requestUrl,
                    docNumber: docNumber
                }

                if (allRecords[i].location){
                    if (allRecords[i].location == 'WEB Resource' || allRecords[i].location.indexOf("WEB") != -1 ){
                        var newTable = $('table')[3];
                        var rows = $(newTable).children('tr');
                        rows.each(function (j,item){
                            var test = $(item).children('td')[1];
                            if ($(test).html().indexOf("Hunter") != -1 || $(test).html().indexOf("access limited to CUNY") != -1
                            || $(test).html().indexOf("for all CUNY Users") != -1 || $(test).html().indexOf("Free") != -1){
                                var href = $(test).find('a').attr('href');
                                if (href === undefined) {
                                    var nextRow = $(newTable).children('tr')[1];
                                    var nextTd = $(nextRow).children('td')[1];
                                    href = $(nextTd).find('a').attr('href');
                                }
                                var start = 'javascript.open_window('.length;
                                var linky = href.substring(start, href.length - 2)
                                var composed = '<a href='+ linky +'>Access online</a>'
                                allRecords[i].location = composed
                            };
                        });
                    };
                };
            });
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin' : '*'
            });
            // console.log(allRecords);
            res.end(JSON.stringify(allRecords));
        });
    });
});


app.get('/feed', function (req, res) {
    var allNews = new Array();
    var news = feedparser.parseUrl('http://feeds2.feedburner.com/HunterCollegeLibrariesBlog')
        .on('article', function (article) {
            var paper = JSON.stringify(article)
            allNews.push(paper)
        })
        .on('complete', function callback (meta, articles){
            res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                });
            res.end(JSON.stringify(articles))
        });
});

app.get('/hours', function (req, res) {
    var options = {
        uri: 'http://library.hunter.cuny.edu/about/hours',
    };

    request(options, function(error, response, body) {
    //  debugger;
        console.log(options.uri)
        if (error && response.statusCode !== 200) {
            console.log(error);
        }

        jsdom.env({
                html: body,
                scripts: [
                    'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
                ]
            }, function (err, window) {
                // load jquery
            var $ = window.jQuery;

            var hoursTable = $('table')[0];

            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin' : '*'
            });
            res.end($(hoursTable).html());
        });
    });
});

var port = process.env.PORT || 3002
app.listen(port, '0.0.0.0');

console.log('Server running at http://127.0.0.1:' + (port || '3002'));
