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

app.get('/test', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var testing = req.query["id"];
    console.log(query);

});



app.get('/search', function (req, res) {
    var searchQuery = req.query["query"];
    var searchType = req.query["queryType"];
    var accessCode = req.query["accessCode"];
    console.log(req.query)

    if (searchType == 'All Fields' || accessCode){
        if (accessCode){
            var options = { 
                uri: 'http://p83-apps.appl.cuny.edu.proxy.wexler.hunter.cuny.edu/F/?func=find-acc&acc_sequence=' + accessCode + '&local_base=HUNTER',    
            }
        }
        else{
        var options = { 
            uri: 'http://apps.appl.cuny.edu:83/F/?func=find-e&adjacent=N&find_scan_code=FIND_WRD&request=' + searchQuery.replace(' ', '+') + '&Search=+Search+&local_base=HUNTER',
            };
        }

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
                    var resultsTable = $('table')[4];
                    var rows = $(resultsTable).children('tr');
            
                    allBooks = new Array();

                        rows.each(function (i, item) {
                            var image = $(item).children('td')[2];
                            // remove script from image (PROBABLY not relevant)
                            $($(image).children('script')).remove();
                            //Get rid of stupid follow-on requests
                            var imageSrc = $(image).find('img')
                            if ($(imageSrc).attr('src') == 'src') $(imageSrc).removeAttr('src');
                            
                            var author = $(item).children('td')[3];
                            
                            var title = $(item).children('td')[4];
                            // remove script from title (PROBABLY not relevant)
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
                    
                    console.log(allBooks);
                    res.writeHead(200, {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin' : '*'
                    });
                    res.end(JSON.stringify(allBooks));
            });
        });
    }
        else{
            var options = { 
                uri: 'http://p83-apps.appl.cuny.edu.proxy.wexler.hunter.cuny.edu/F/?func=find-e&adjacent=N&find_scan_code='+ searchType +'&request=' + searchQuery + '&Search=+Search+&local_base=HUNTER',
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
                    res.end(JSON.stringify(allChoices));
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

                    if (allRecords[i].location == 'WEB Resource'){
                        var newTable = $('table')[4];
                        console.log($(newTable).html());
                        console.log('!!!!!!!');
                    };

                });

                // console.log(allRecords);
                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                });

                res.end(JSON.stringify(allRecords));
        });
    });
});


app.get('/feed', function (req, res) {
    var allNews = new Array();
    var news = feedparser.parseUrl('http://feeds2.feedburner.com/HunterCollegeLibrariesBlog')
        .on('article', function (article) {
            var paper = JSON.stringify(article)
            // console.log(paper);
            allNews.push(paper)
        })
        .on('complete', function callback (meta, articles){
            // console.log('Feed info');
            // console.log('%s - %s - %s', meta.title, meta.link, meta.xmlurl);
            // console.log('Articles');
            articles.forEach(function (article){
              console.log('%s - %s (%s)', article.date, article.title, article.link);
              // res.send(JSON.stringify(article.title))
            });
            res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                });
            res.end(JSON.stringify(articles))
          });
    // res.end(JSON.stringify(allNews));
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

                var resultsTable = $('table')[0];

                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                });

                res.end($(resultsTable).html());
        });
    });
});





app.listen(3000, 'localhost');

console.log('Server running at http://127.0.0.1:3000/');
