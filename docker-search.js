// CREDIT:
//
// @ushis
// github-search-chrome-extension
// https://github.com/ushis/github-search-chrome-extension/blob/master/github-search.js
//
// Copied from file location on May 13, 2016


(function() {
  // Chrome displays max 5 results.
  var maxResults = 5;

  // Docker Hub locations.
  var locations = {
    html: {
      base: 'https://hub.docker.com',
      search: '/search?isAutomated=0&isOfficial=0&page=1&pullCount=0&q=:query&starCount=1'
    }
  };

  // Returns the url for an Array of keys or a dotted path.
  //
  //   urlFor('html.search', { query: 'ubuntu' });
  //   //=> 'https://hub.docker.com/search?q=ubuntu'
  //
  // The second argument is a object of with.
  var urlFor = function(keys, params) {
    var path = locations;

    if ( ! (keys instanceof Array)) {
      keys = keys.split('.');
    }

    keys.forEach(function(key) {
      path = path[key];
    });

    for (var param in params) {
      path = path.replace(':' + param, encodeURIComponent(params[param]));
    }

    return locations[keys[0]].base + path;
  };

  //
  // Result formatters.
  //

  // Builds a description for history entries.
  var historyDescription = function(url, query) {
    url = url.slice(1);

    return o.utils.tag('url', o.utils.highlight(url, query));
  };

  //
  // Requests.
  //

  // Items in the history.
  var findInHistory = function(query, callback) {
    o.history.find(query, function(data) {
      callback(data.map(function(url) {
        return {
          content: locations.html.base + url,
          description: historyDescription(url, query)
        };
      }));
    });
  };

  //
  // Events.
  //

  // Process search request.
  chrome.omnibox.onInputChanged.addListener(o.utils.debounce(function(query, callback) {
    query = query.trim().toLowerCase();
  }, 300));

  // Open the new page on enter.
  chrome.omnibox.onInputEntered.addListener(function (url) {
    if (o.utils.isUrl(url)) {
      o.history.push(url.slice(locations.html.base.length));
    } else {
      url = urlFor('html.search', { query: url });
    }

    chrome.tabs.update({ url: url });
  });
}).call(this);
