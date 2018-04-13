var BCLS = (function (window, document) {
    "use strict";
    var proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/doc-samples-proxy-v2.php',
        accountID = document.getElementById('accountID'),
        account_id,
        clientID = document.getElementById('clientID'),
        clientSecret = document.getElementById('clientSecret'),
        playerID = document.getElementById('playerID'),
        playerWidth = document.getElementById('playerWidth'),
        playerHeight = document.getElementById('playerHeight'),
        videoID = document.getElementById('videoID'),
        video_id,
        generateMicrodata = document.getElementById('generateMicrodata'),
        generateJSON_ld = document.getElementById('generateJSON_ld'),
        publishingCode = document.getElementById('publishingCode'),
        videoData = null,
        defaults = {};

    /**
     * determines whether a var has value
     * @param  {*}  x var to evaluate - note that if x = {} or [], true will be returned
     * @return {Boolean}   whether var has a value
     */
    function isDefined(x) {
        if (x === '' || x === null || x === undefined) {
            return false;
        }
        return true;
    }

    /**
     * utility to extract h/m/s from seconds
     * @param {number} secs - seconds to convert to Thh:mm:ss
     * @return {String} ISO 8601 time string
     */
    function secondsToTime(secs) {
        var hours = Math.floor(secs / (60 * 60)),
            divisor_for_minutes = secs % (60 * 60),
            minutes = Math.floor(divisor_for_minutes / 60),
            divisor_for_seconds = divisor_for_minutes % 60,
            seconds = Math.ceil(divisor_for_seconds);

        if (hours < 10) {
            hours = '0' + hours.toString();
        } else {
            hours = hours.toString();
        }

        if (minutes < 10) {
            minutes = '0' + minutes.toString();
        } else {
            minutes = minutes.toString();
        }

        if (seconds < 10) {
            seconds = '0' + seconds.toString();
        } else {
            seconds = seconds.toString();
        }

        return 'T' + hours + ':' + minutes + ':' + seconds;
    }

    /**
     * send API request to the proxy
     * @param  {Object} options for the request
     * @param  {String} options.url the full API request URL
     * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
     * @param  {String} options.proxyURL proxyURL to send the request to
     * @param  {String} options.client_id client id for the account (default is in the proxy)
     * @param  {String} options.client_secret client secret for the account (default is in the proxy)
     * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
     * @param  {Function} [callback] callback function that will process the response
     */
    function makeRequest(options, callback) {
      var httpRequest = new XMLHttpRequest(),
        response,
        proxyURL = options.proxyURL,
        // response handler
        getResponse = function() {
          try {
            if (httpRequest.readyState === 4) {
              if (httpRequest.status >= 200 && httpRequest.status < 300) {
                response = httpRequest.responseText;
                // some API requests return '{null}' for empty responses - breaks JSON.parse
                if (response === '{null}') {
                  response = null;
                }
                // return the response
                callback(response);
              } else {
                alert('There was a problem with the request. Request returned ' + httpRequest.status);
              }
            }
          } catch (e) {
            alert('Caught Exception: ' + e);
          }
        };
      /**
       * set up request data
       * the proxy used here takes the following request body:
       * JSON.stringify(options)
       */
      // set response handler
      httpRequest.onreadystatechange = getResponse;
      // open the request
      httpRequest.open('POST', proxyURL);
      // set headers if there is a set header line, remove it
      // open and send request
      httpRequest.send(JSON.stringify(options));
    }

    function generateSchema(type) {
      var microData,
        json_ld,
        object_ld;
        // insert other data that the schema needs
        videoData.playerID = isDefined(playerID.textContent) ? playerID.textContent : defaults.playerID;
        videoData.playerWidth = isDefined(playerWidth.textContent) ? playerWidth.textContent : defaults.playerWidth;
        videoData.playerHeight = isDefined(playerHeight.textContent) ? playerHeight.textContent : defaults.playerHeight;
        // convert the duration to ISO format schema needs
        videoData.duration = secondsToTime(videoData.duration / 1000);
        microData = '<!-- Start Schema Code --> \n <div id="content"> \n <div itemscope itemtype="http://schema.org/VideoObject"> \n <meta itemprop="name" content="';
        microData += videoData.name + '"> \n <meta itemprop="description" content="';
        microData += videoData.description + '"> \n <meta itemprop="videoID" content="';
        microData += videoData.id + '"> \n <meta itemprop="duration" content="';
        microData += videoData.duration + '"> \n <link itemprop="thumbnail" href="';
        microData += videoData.images.thumbnail.src + '"> \n <link itemprop="embedURL" href="http://players.brightcove.net/';
        microData += videoData.account_id + '/';
        microData += videoData.playerID + '_default/index.html?videoID=';
        microData += videoData.id + '"> \n <meta itemprop="width" content="';
        microData += videoData.playerWidth + '"> \n <meta itemprop="height" content="';
        microData += videoData.playerHeight + '"> \n <!-- End Schema Code --> \n <!-- Start Player Code --> \n <iframe src="//players.brightcove.net/';
        microData += videoData.accountID + '/default_default/index.html?videoID=';
        microData += videoData.id + '" style="width:';
        microData += videoData.playerWidth + ';height:';
        microData += videoData.playerHeight + '" allowfullscreen webkitallowfullscreen mozallowfullscreen><\/iframe>  \n <!-- End Player Code --> \n <\/div> \n <\/div>';
        json_ld = '<!-- Start Schema Code --> \n <script type="application/ld+json"> \n';
        object_ld = {"@context": "http://schema.org/","@type": "VideoObject","name": videoData.name, "@id": videoData.url, "datePublished": videoData.created_at, "interactionStatistic": [ {"@type": "InteractionCounter", "interactionType": "http://schema.org/WatchAction", "userInteractionCount": videoData.total_plays}]};
        json_ld += JSON.stringify(object_ld) + ' \n';
        json_ld += '\</script\> \n <!-- End Schema Code --> \n';
        json_ld += '<!-- Start Player Code --> \n <iframe src="//players.brightcove.net/';
        json_ld += videoData.accountID + '/default_default/index.html?videoID=';
        json_ld += videoData.id + '" style="width:';
        json_ld += videoData.playerWidth + ';height:';
        json_ld += videoData.playerHeight + '" allowfullscreen webkitallowfullscreen mozallowfullscreen><\/iframe> \n <!-- End Player Code --> \n ';
        switch (type) {
          case 'microdata':
            publishingCode.textContent = microData;
            break;
          case 'json_ld':
            publishingCode.textContent = json_ld;
            break;
          default:
            break;
        }
    }

    // set listeners for buttons
    generateMicrodata.addEventListener("click", function () {
        // data setup
        var options = {};
        options.client_id = (isDefined(clientID.value)) ? clientID.value : defaults.client_id;
        options.client_secret = (isDefined(clientSecret.value)) ? clientSecret.value : defaults.client_secret;
        account_id = (isDefined(accountID.value)) ? accountID.value : defaults.account_id;
        video_id = (isDefined(videoID.value)) ? videoID.value : defaults.videoID;
        options.url = 'https://cms.api.brightcove.com/v1/accounts/' + account_id + '/videos/' + video_id;
        options.proxyURL = proxyURL;
        options.requestType = "GET";
        makeRequest(options, function(response) {
            videoData = JSON.parse(response);
            videoData.url = 'http://http://players.brightcove.net/' + account_id + '/default_default/index.html';
            options.url = 'https://analytics.api.brightcove.com/v1/alltime/accounts/' + account_id + '/videos/' + video_id;
            makeRequest(options, function(response) {
                response = JSON.parse(response);
                videoData.total_plays = response.alltime_video_views;
                generateSchema('microdata');
            });
        });
    });

    generateJSON_ld.addEventListener("click", function () {
        // data setup
        var options = {};
        options.client_id = (isDefined(clientID.value)) ? clientID.value : defaults.client_id;
        options.client_secret = (isDefined(clientSecret.value)) ? clientSecret.value : defaults.client_secret;
        account_id = (isDefined(accountID.value)) ? accountID.value : defaults.account_id;
        video_id = (isDefined(videoID.value)) ? videoID.value : defaults.videoID;
        options.url = 'https://cms.api.brightcove.com/v1/accounts/' + account_id + '/videos/' + video_id;
        options.proxyURL = proxyURL;
        options.requestType = "GET";
        makeRequest(options, function(response) {
            videoData = JSON.parse(response);
            videoData.url = 'http://http://players.brightcove.net/' + account_id + '/default_default/index.html';
            options.url = 'https://analytics.api.brightcove.com/v1/alltime/accounts/' + account_id + '/videos/' + video_id;
            makeRequest(options, function(response) {
                response = JSON.parse(response);
                videoData.total_plays = response.alltime_video_views;
                generateSchema('json_ld');
            });
        });
    });

    publishingCode.addEventListener('click', function() {
        publishingCode.select();
    });

    function init() {
        defaults.account_id = '1752604059001';
        defaults.playerID = 'default';
        defaults.videoID = '5625780785001';
        defaults.playerWidth = '480';
        defaults.playerHeight = '270';
        // proxy has credentials for the default account, so no need to send them
        defaults.client_id = '';
        defaults.client_secret = '';
    }

    init();
})(window, document);