/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/DetectBrowser',
    [], function () {
        'use strict';

        function DetectBrowser(userAgent) {
            this._userAgent = userAgent;
        }

        DetectBrowser.prototype.detect = function () {
            var browser = 'Unknown';
            var version = '?';
            var browserMatch = this._userAgent.match(/(Chrome|Chromium|Firefox|Opera|Safari)+\//);
            var versionMatch = this._userAgent.match(/(Chrome|Chromium|Firefox|Version)+\/([0-9]+)\./);

            if (browserMatch && browserMatch.length >= 2) {
                browser = browserMatch[1];
            } else if (this._userAgent.match(/^\(?Mozilla/)) {
                browser = 'Mozilla';

                if (this._userAgent.match(/MSIE/)
                    || this._userAgent.match(/; Trident\/.*rv:[0-9]+/)) {
                    browser = 'IE';

                    if (versionMatch = this._userAgent.match(/MSIE ([0-9]+)/)) {
                        version = parseInt(versionMatch[1], 10);
                        // compatibility view?
                        if (versionMatch = this._userAgent.match(/MSIE [0-9]+.*MSIE ([0-9]+)/)) {
                            version = parseInt(versionMatch[1], 10);
                        }
                    } else if (versionMatch = this._userAgent.match(/rv:([0-9]+)/)) {
                        version = parseInt(versionMatch[1], 10);
                    }
                }
            }

            if (browser === 'Chrome' && this._userAgent.match(/OPR\//)) {
                // Opera pretends to be Chrome
                browser = 'Opera';
                versionMatch = this._userAgent.match(/(OPR)\/([0-9]+)\./);
            } else if ((browser === 'Firefox' || browser === 'IE') && this._userAgent.match(/Opera/)) {
                // Opera pretends to be Firefox or IE
                browser = 'Opera';
                versionMatch = this._userAgent.match(/(Opera) ([0-9]+)\./);
            }

            if (browser !== 'IE' && versionMatch && versionMatch.length >= 3) {
                version = parseInt(versionMatch[2], 10);
            }

            return {
                browser: browser,
                version: version
            };
        };

        return DetectBrowser;
    });