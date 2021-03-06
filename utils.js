utils = (function () {

    return {
        addURLParam: function (url, key, value) {
            if (!url) {
                url = '';
            }

            key = escape(key);
            value = escape(value);

            var base = url;
            var q = '';
            var kvp = [];

            if (url.indexOf('?') > -1) {
                base = url.split('?')[0];
                q = url.split('?')[1];
                if (url.split('?')[1]) {
                    kvp = q.split('&');
                }
            }

            var i = kvp.length;
            var x;
            while (i--) {
                x = kvp[i].split('=');

                if (x[0] == key) {
                    x[1] = value;
                    kvp[i] = x.join('=');
                    break;
                }
            }

            if (i < 0) {
                kvp[kvp.length] = [key, value].join('=');
            }

            return base + '?' + kvp.join('&');
        },


        addHashParam: function (url, key, value) {
            if (!url) {
                url = '';
            }

            var query = '';

            if (url.indexOf('?') > -1) {
                query = (url.split('?')[1]) ? '?' + url.split('?')[1] : '?';
                url = url.split('?')[0];
            }

            key = escape(key);
            value = escape(value);

            var base = url;
            var q = "";
            var kvp = [];

            if (url.indexOf('#') > -1) {
                base = url.split('#')[0];
                q = url.split('#')[1];
                if (url.split('#')[1]) {
                    kvp = q.split('&');
                }
            }

            var i = kvp.length;
            var x;
            while (i--) {
                x = kvp[i].split('=');

                if (x[0] == key) {
                    x[1] = value;
                    kvp[i] = x.join('=');
                    break;
                }
            }

            if (i < 0) {
                kvp[kvp.length] = [key, value].join('=');
            }

            return base + '#' + kvp.join('&') + query;
        },

        //http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
        isFunction: function (v) {
            if (v && typeof (v) == 'function') {
                return true;
            } else {
                return false;
            }
        },

        /*Since script is injected it will be loaded asynchronously by most browsers. This is ideal so that
        we don't block rendering and downloads in the host page while this file is downloading.*/
        loadJsFile: function (filename, callback) {
            var fileRef;
            fileRef = document.createElement('script');
            fileRef.setAttribute('type', 'text/javascript');
            /*async is the html5 standard way of telling a browser to download asynchronously ... also needed for Opera to
            force the asynchronous download.*/
            fileRef.async = true;
            fileRef.setAttribute('src', filename);
            /*Appending to an existing "script" tag is more reliable then appending to a "head" or "body" tag, which
            may not always be there. Loading this way sometimes maintains the execution order of async scripts loaded
            this way, which can slow a page down (async = true is set to counter this in some browsers). Also, in 
            some older browser, the "onLoad" event cannot be relied on to indicate that these scripts have been
            loaded: (http://www.stevesouders.com/blog/2012/01/13/javascript-performance/)*/
            var entry = document.getElementsByTagName('script')[0];
            entry.parentNode.insertBefore(fileRef, entry);

            if (callback) {
                if (fileRef.addEventListener) {
                    fileRef.addEventListener('load', callback, false); // W3C standard event
                } else {
                    fileRef.attachEvent('onreadystatechange', //Microsoft proprietary event
                    readyHandler = function () {
                        if (/complete|loaded/.test(fileRef.readyState)) {
                            callback();
                            fileRef.detachEvent('onreadystatechange', readyHandler); //Detaching event fixes IE memory leak
                        }
                    });
                }
            }
        }
    };
})();