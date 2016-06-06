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
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/PhenixRTC',
    [
        'rtc/WaitFor',
        'rtc/PhenixVideo'
    ], function (WaitFor, PhenixVideo) {
        'use strict';

        var log = function () {
                console.log.apply(console, arguments);
            } || function () {
            };
        var logError = function () {
                console.error.apply(console, arguments);
            } || log;

        function PhenixRTC() {
            var that = this;

            this._root = createInvisibleParentNode();
            this._version = '?';

            var ready = function ready(success) {
                that._loaded = true;
                that._enabled = success === true;
                that._version = that._phenixRTC.phenixVersion || '?.?.?.?';

                if (success) {
                    log('Phenix RTC ' + that._version);
                } else {
                    log('No Phenix RTC');
                }

                if (that._onReady) {
                    that._onReady(that._enabled);
                }
            };

            try {
                this._phenixRTC = createPhenixRTC(this._root);

                this._phenixRTC.onunload = function () {
                    that._loaded = false;
                };

                var waitFor = new WaitFor();

                waitFor.waitForReady(this._phenixRTC, ready);
            } catch (e) {
                logError('Error while loading Phenix RTC' + e);
                loaded(false);
            }
        }

        PhenixRTC.prototype.onReady = function (callback) {
            var that = this;

            if (this._loaded) {
                setTimeout(function () {
                    callback(that._enabled);
                }, 1)
            } else {
                this._onReady = callback;
            }
        };

        PhenixRTC.prototype.onLoaded = function (callback) {
            this._onLoaded = callback;
        };

        PhenixRTC.prototype.isLoaded = function () {
            return this._loaded === true;
        };

        // static function
        PhenixRTC.isSupported = function () {
            if (navigator.plugins) {
                var plugins = navigator.plugins;

                for (var i = 0; i < plugins.length; i++) {
                    if (plugins[i].name.indexOf('PhenixRTC') >= 0) {
                        return true;
                    }
                }
            }

            if (navigator.userAgent.match(/MSIE/) || navigator.userAgent.match(/Trident/)) {
                try {
                    var activeXObj = new ActiveXObject('PhenixP2P.RTC');

                    return true;
                } catch (e) {
                    return false;
                }
            }

            return false;
        };

        PhenixRTC.prototype.isEnabled = function () {
            verifyPhenixRTCInDOM.call(this);

            return this._phenixRTC && this._phenixRTC.phenixVersion != undefined;
        };

        PhenixRTC.prototype.getVersion = function () {
            verifyPhenixRTCInDOM.call(this);

            return this._version;
        };

        PhenixRTC.prototype.getRTCPeerConnectionConstructor = function () {
            verifyPhenixRTCInDOM.call(this);

            return this._phenixRTC.RTCPeerConnection;
        };

        PhenixRTC.prototype.getRTCSessionDescriptionConstructor = function () {
            verifyPhenixRTCInDOM.call(this);

            return this._phenixRTC.RTCSessionDescription;
        };

        PhenixRTC.prototype.getRTCIceCandidateConstructor = function () {
            verifyPhenixRTCInDOM.call(this);

            return this._phenixRTC.RTCIceCandidate;
        };

        PhenixRTC.prototype.getSourcesDelegate = function () {
            var that = this;

            return function (sourcesInfoCallback) {
                verifyPhenixRTCInDOM.call(that);

                return that._phenixRTC.getSources(sourcesInfoCallback);
            };
        };

        PhenixRTC.prototype.getUserMediaDelegate = function () {
            var that = this;

            return function (constraints, successCallback, failureCallback) {
                verifyPhenixRTCInDOM.call(that);

                return that._phenixRTC.getUserMedia(constraints, successCallback, failureCallback);
            };
        };

        PhenixRTC.prototype.getStatsDelegate = function () {
            return function (pc, track, successCallback, errorCallback) {
                return pc.getStats(track, successCallback, errorCallback);
            };
        };

        PhenixRTC.prototype.attachMediaStream = function (element, stream) {
            verifyPhenixRTCInDOM.call(this);

            return attachMediaStream.call(this, element, stream);
        };

        PhenixRTC.prototype.reattachMediaStream = function (to, from) {
            verifyPhenixRTCInDOM.call(this);

            return this.attachMediaStream(to, from.src);
        };

        function verifyPhenixRTCInDOM() {
            if (this._root && document.getElementById('phenixRTC') !== this._root) {
                document.body.appendChild(this._root);

                if (this._onLoaded) {
                    this._onLoaded.call(this);
                }
            }
        }

        function createInvisibleParentNode() {
            var node = document.createElement('div');

            node.id = 'phenixRTC';
            node.style.cssText = 'visibility:hidden !important;width:0px !important;height:0px !important;' +
            'margin:0px !important;padding:0px !important;' +
            'border-style:none !important;border-width:0px !important;' +
            'max-width:0px !important;max-height:0px !important;outline:none !important';

            document.body.appendChild(node);

            return node;
        }

        function createPhenixRTC(parent) {
            var phenixRTC = document.createElement('object');

            phenixRTC.type = 'application/x-phenix-rtc';

            parent.appendChild(phenixRTC);

            return phenixRTC;
        }

        function attachMediaStream(element, stream) {
            if (!element) {
                throw new Error('Can not attach a stream to a undefined element');
            }

            if (element.phenixVersion) {
                // It's one of ours
                element.src = stream;

                return element;
            }

            var phenixVideo = new PhenixVideo(element, stream);

            phenixVideo.getElement().phenixPresenter = phenixVideo;

            return phenixVideo.getElement();
        }


        return PhenixRTC;
    });
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/PhenixVideo',
    [
        'rtc/WaitFor'
    ], function (WaitFor) {
        'use strict';

        var log = function () {
                console.log.apply(console, arguments);
            } || function () {
            };
        var logError = function () {
                console.error.apply(console, arguments);
            } || log;

        function PhenixVideo(ghost, stream) {
            var that = this;

            this._ghost = ghost;
            this._stream = stream;
            this._events = {};

            var loaded = function loaded(success) {
                that._loaded = true;
                that._enabled = success === true;

                if (success) {
                    initialize.call(that);
                } else {
                    logError('Failed to create Phenix video element');
                }

                if (that._onReady) {
                    that._onReady(that._enabled);
                }
            };

            try {
                this._video = createPhenixVideoElement();
                this._video.className = this._ghost.className;
                this._video.height = this._ghost.height;
                this._video.width = this._ghost.width;

                this._ghost.style.cssText = 'visibility:hidden !important;width:0px !important;height:0px !important;' +
                'margin:0px !important;padding:0px !important;' +
                'border-style:none !important;border-width:0px !important;' +
                'max-width:0px !important;max-height:0px !important;outline:none !important';

                this._video.onunload = function () {
                    that._loaded = false;
                };

                observeInsertion.call(this);

                if (!document.body || !document.body.contains) {
                    log('document.body.contains is not supported');
                }

                if (document.body && document.body.contains && document.body.contains(this._ghost)) {
                    this._ghost.parentNode.replaceChild(this._video, this._ghost);
                }

                var waitFor = new WaitFor();

                waitFor.waitForReady(this._video, loaded);
            } catch (e) {
                logError('Error while loading Phenix RTC' + e);
                loaded(false);
            }
        }

        PhenixVideo.prototype.hookUpEvents = function () {
            var that = this;
            var ghost = this._ghost;

            this.addEventListener('error', function () {
                dispatchEvent(ghost, 'error');
            });
            this.addEventListener('mute', function () {
                ghost.muted = that._video.muted;
                dispatchEvent(ghost, 'mute');
            });
            this.addEventListener('unmute', function () {
                ghost.muted = that._video.muted;
                dispatchEvent(ghost, 'unmute');
            });
            this.addEventListener('ended', function () {
                ghost.ended = that._video.ended;
                dispatchEvent(ghost, 'ended');
            });
            this.addEventListener('loadedmetadata', function () {
                log('Video loaded metadata', that._video.videoWidth, that._video.videoHeight);
                ghost.width = that._video.width;
                ghost.height = that._video.height;
                dispatchEvent(ghost, 'loadedmetadata');
            });
            this.addEventListener('loadeddata', function () {
                ghost.width = that._video.width;
                ghost.height = that._video.height;
                dispatchEvent(ghost, 'loadeddata');
            });
            this.addEventListener('resize', function () {
                ghost.width = that._video.width;
                ghost.height = that._video.height;
                dispatchEvent(ghost, 'resize');
            });
        };

        PhenixVideo.prototype.onReady = function (callback) {
            var that = this;

            if (this._loaded) {
                setTimeout(function () {
                    callback(that._enabled);
                }, 1)
            } else {
                this._onReady = callback;
            }
        };

        PhenixVideo.prototype.getElement = function () {
            return this._video;
        };

        PhenixVideo.prototype.addEventListener = function (name, listener, useCapture) {
            addEventListener.call(this, name, listener, useCapture);
        };

        PhenixVideo.prototype.removeEventListener = function (name, listener, useCapture) {
            removeEventListener.call(this, name, listener, useCapture);
        };

        function createPhenixVideoElement() {
            var video = document.createElement('object');

            video.type = 'application/x-phenix-video';

            return video;
        }

        function addEventListener(name, listener, useCapture) {
            var listeners = this._events[name];

            if (!listeners) {
                listeners = this._events[name] = [];

                if (this._loaded) {
                    registerEvent.call(this, name);
                }
            }

            listeners.push(listener);
        }

        function removeEventListener(name, listener, useCapture) {
            var listeners = this._events[name];

            if (listeners) {
                var idx = listeners.indexOf(listener);

                if (idx >= 0) {
                    listeners = listeners.splice(idx, 1);

                    if (listeners.length > 0) {
                        this._events[name] = listeners;
                    } else {
                        delete this._events[name];
                    }
                }
            }
        }

        function registerEvent(name) {
            var that = this;

            function listener() {
                var listeners = that._events[name];

                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(that, arguments);
                    }
                }
            }

            that._video.phenixSetEventListener(name, listener);
        }

        function dispatchEvent(source, name) {
            var event; // The custom event that will be created

            if (document.createEvent) {
                event = document.createEvent('HTMLEvents');
                event.initEvent(name, true, true);
            } else {
                event = document.createEventObject();
                event.eventType = name;
            }

            event.eventName = name;

            setTimeout(function () {
                if (document.createEvent) {
                    source.dispatchEvent(event);
                } else {
                    source.fireEvent('on' + event.eventType, event);
                }
            });
        }

        function initialize() {
            var events = Object.keys(this._events);

            for (var i = 0; i < events.length; i++) {
                registerEvent.call(this, events[i]);
            }

            this.hookUpEvents();

            propagateAttributeChanges.call(this);

            this._video.id = this._ghost.id;
            this._video.style.cssText = this._ghost.cssText;
            this._video.className = this._ghost.className;
            this._video.innerHtml = this._ghost.innerHtml;
            this._video.width = this._ghost.width;
            this._video.height = this._ghost.height;
            this._video.autoplay = this._ghost.autoplay;
            this._video.muted = this._ghost.muted;
            this._video.defaultMuted = this._ghost.defaultMuted;
            this._video.volume = this._ghost.volume;

            if (this._stream) {
                this._video.src = this._stream;
            }
        }

        function propagateAttributeChanges() {
            var that = this;
            var readonly = [ 'style' ];

            if (window.MutationObserver) {
                // Newer browsers support an efficient way to observe DOM modifications
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.type === 'attributes' && mutation.target === that._ghost && readonly.indexOf(mutation.attributeName) === -1) {
                            that._video[mutation.attributeName] = that._ghost[mutation.attributeName];
                        }
                    });
                });

                var configAttributes = {attributes: true};

                observer.observe(that._ghost, configAttributes);
            } else {
                // For older browsers. There is a significant performance overhead with this method.
                // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
                log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

                if (that._ghost.addEventListener) {
                    that._ghost.addEventListener('DOMAttrModified', function (event) {
                        that._video[event.target.tagName] = that._ghost[event.target.tagName];
                    }, false);
                } else {
                    that._ghost.attachEvent('onpropertychange', function (event) {
                        that._video[event.target.tagName] = that._ghost[event.target.tagName];
                    });
                }
            }
        }

        function observeInsertion() {
            var that = this;

            if (window.MutationObserver) {
                // Newer browsers support an efficient way to observe DOM modifications
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.type === 'childList') {
                            for (var i = 0; i < mutation.addedNodes.length; i++) {
                                var node = mutation.addedNodes[i];

                                if (mutation.target !== that._video) {
                                    if (node === that._ghost) {
                                        // Replace element with our video element
                                        mutation.target.replaceChild(that._video, that._ghost);
                                        initialize.call(that);
                                    } else if (isDescendant(mutation.target, that._ghost)) {
                                        that._ghost.parentNode.replaceChild(that._video, that._ghost);
                                        initialize.call(that);
                                    }
                                }
                            }
                        }
                    });
                });

                var configMutations = {childList: true, attributes: false, characterData: false, subtree: true};

                observer.observe(document.body, configMutations);
            } else {
                // For older browsers. There is a significant performance overhead with this method.
                // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
                log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

                addEventListener(that._ghost, 'DOMNodeInserted', function (e) {
                    that._ghost.parentNode.replaceChild(that._video, that._ghost);
                    //that._video.appendChild(that._ghost);
                }, false);
            }
        }

        function isDescendant(parent, child) {
            var node = child.parentNode;

            while (node != null) {
                if (node == parent) {
                    return true;
                }

                node = node.parentNode;
            }

            return false;
        }

        return PhenixVideo;
    });
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/RTCAdapter',
    [
        'rtc/DetectBrowser',
        'rtc/WebRTCAdapter',
        'rtc/PhenixRTC'
    ], function (DetectBrowser, webRTC, PhenixRTC) {
        'use strict';

        var browser = new DetectBrowser(navigator.userAgent).detect();
        var adapter = {
            RTCPeerConnection: webRTC.RTCPeerConnection,
            RTCSessionDescription: webRTC.RTCSessionDescription,
            RTCIceCandidate: webRTC.RTCIceCandidate,
            getSources: webRTC.getSources,
            getUserMedia: webRTC.getUserMedia,
            getStats: webRTC.getStats,
            attachMediaStream: webRTC.attachMediaStream,
            reattachMediaStream: webRTC.reattachMediaStream,
            browser: browser.browser,
            browserVersion: browser.version,
            webrtcSupported: webRTC.webrtcSupported,
            phenixSupported: false,
            isPhenixEnabled: function() { return false; },
            onLoaded: undefined
        };

        if (PhenixRTC.isSupported()) {
            adapter.phenixSupported = true;

            var phenixRTC = new PhenixRTC();

            var enablePhenix = function enablePhenix() {
                adapter.RTCPeerConnection = phenixRTC.getRTCPeerConnectionConstructor();
                adapter.RTCSessionDescription = phenixRTC.getRTCSessionDescriptionConstructor();
                adapter.RTCIceCandidate = phenixRTC.getRTCIceCandidateConstructor();
                adapter.getSources = phenixRTC.getSourcesDelegate();
                adapter.getUserMedia = phenixRTC.getUserMediaDelegate();
                adapter.getStats = phenixRTC.getStatsDelegate();

                if (Function.prototype.bind) {
                    adapter.attachMediaStream = phenixRTC.attachMediaStream.bind(phenixRTC);
                    adapter.reattachMediaStream = phenixRTC.reattachMediaStream.bind(phenixRTC);
                    adapter.isPhenixEnabled = phenixRTC.isEnabled.bind(phenixRTC);
                } else {
                    adapter.attachMediaStream = function () {
                        phenixRTC.attachMediaStream.apply(phenixRTC, arguments);
                    };
                    adapter.reattachMediaStream = function () {
                        phenixRTC.reattachMediaStream.apply(phenixRTC, arguments);
                    };
                    adapter.isPhenixEnabled = function () {
                        phenixRTC.isEnabled();
                    };
                }

                adapter.webrtcSupported = true;
                adapter.phenixSupported = true;
                adapter.phenixVersion = phenixRTC.getVersion();

                if (adapter.onLoaded) {
                    adapter.onLoaded.call();
                }
            };


            if (phenixRTC.isEnabled()) {
                enablePhenix();
            } else {
                phenixRTC.onReady(function (enabled) {
                    if (enabled) {
                        enablePhenix();

                        if (adapter.onload && typeof adapter.onload === 'function') {
                            adapter.onload();
                        }
                    }
                });
            }

            phenixRTC.onLoaded(function () {
                enablePhenix();
            });
        } else {
            adapter.phenixSupported = false;
        }

        /**
         * All modern browsers including IE9+ support addEventListener
         * IE8 and less support attachEvent(...)
         * Phenix supports proprietary API to register events
         */
        adapter.addEventListener = function (target, name, listener, useCapture) {
            if (target.phenixSetEventListener) {
                target.phenixSetEventListener(name, listener);
            } else if (target.addEventListener) {
                target.addEventListener(name, listener, useCapture === true);
            } else {
                target.attachEvent('on' + name, listener);
            }
        };

        return adapter;
    });
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/WaitFor',
    [
        'rtc/DetectBrowser'
    ], function (DetectBrowser) {
        'use strict';

        var browser = new DetectBrowser(navigator.userAgent).detect();
        var ReadyStateComplete = 4;

        function WaitFor(timeout) {
            this._timeout = timeout || 15000;
        }

        var logError = function () {
                console.error.apply(console, arguments);
            } || log;

        WaitFor.prototype.waitForReadyWithTimeout = function (element, loaded, timeout) {
            var triggered = false;
            var waitFor = 1;
            var sum = waitFor;

            var guardedLoaded = function (success) {
                if (!triggered) {
                    triggered = true;
                    loaded(success);
                }
            };

            var checkLoaded = function checkLoaded() {
                if (element.readyState === ReadyStateComplete) { // IE
                    guardedLoaded(true);
                } else if (element.phenixVersion) { // property is available
                    guardedLoaded(true);
                } else {
                    waitFor = Math.min(waitFor + 1000, 2 * waitFor);
                    sum += waitFor;

                    if (sum > timeout) {
                        logError('Timed out while waiting for <object> to load');
                        guardedLoaded(false);
                    } else {
                        setTimeout(checkLoaded, waitFor);
                    }
                }
            };

            if (!(element.hasOwnProperty && element.hasOwnProperty('onload'))) {
                //  There are no events in IE to detect when it is loaded
                if (browser.browser !== 'IE') {
                    logError('No means of detecting when <object> is loaded');
                }
            }

            element.onload = function () {
                guardedLoaded(true);
            };

            checkLoaded();
        };

        WaitFor.prototype.waitForReady = function (element, loaded) {
            if (element.phenixVersion) { // Already loaded
                loaded(true);
            } else {
                this.waitForReadyWithTimeout(element, loaded, this._timeout);
            }
        };

        return WaitFor;
    });
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/WebRTCAdapter',
    [
        'rtc/DetectBrowser'
    ], function (DetectBrowser) {
        'use strict';

        var log = function () {
                console.log.apply(console, arguments);
            } || function () {
            };

        var RTCPeerConnection = null;
        var RTCSessionDescription = null;
        var RTCIceCandidate = null;
        var getSources = null;
        var getUserMedia = null;
        var getStats = null;
        var attachMediaStream = null;
        var reattachMediaStream = null;
        var createIceServer = null;
        var webrtcSupported = false;

        if (navigator.mozGetUserMedia) {
            log('Firefox detected', navigator.userAgent);

            // The RTCPeerConnection object.
            RTCPeerConnection = mozRTCPeerConnection;

            // The RTCSessionDescription object.
            RTCSessionDescription = mozRTCSessionDescription;

            // The RTCIceCandidate object.
            RTCIceCandidate = mozRTCIceCandidate;

            // Get UserMedia (only difference is the prefix).
            getUserMedia = navigator.mozGetUserMedia.bind(navigator);

            getStats = function (pc, track, successCallback) {
                var promise = pc.getStats(track).then(successCallback);

                if (promise.state === 'rejected') {
                    throw new Error(promise.message);
                }
            };

            // Creates iceServer from the url for FF.
            createIceServer = function (url, username, password) {
                var iceServer = null;
                var url_parts = url.split(':');
                // E.g. 'stun:stun.l.google.com:19302'
                if (url_parts[0].indexOf('stun') === 0) {
                    // Create iceServer with stun url.
                    iceServer = {'url': url};
                    // E.g. 'turn:public@turn.phenixp2p.com:80'
                } else if (url_parts[0].indexOf('turn') === 0) {
                    var browser = new DetectBrowser(navigator.userAgent).detect();

                    if (browser.version < 27) {
                        // Create iceServer with turn url.
                        // Ignore the transport parameter from TURN url for FF version <=27.
                        var turn_url_parts = url.split('?');
                        // Return null for createIceServer if transport=tcp.
                        if (turn_url_parts[1].indexOf('transport=udp') === 0) {
                            iceServer = {
                                'url': turn_url_parts[0],
                                'credential': password,
                                'username': username
                            };
                        }
                    } else {
                        // FF 27 and above supports transport parameters in TURN url,
                        // So passing in the full url to create iceServer.
                        iceServer = {
                            'url': url,
                            'credential': password,
                            'username': username
                        };
                    }
                }
                return iceServer;
            };

            // Attach a media stream to an element.
            attachMediaStream = function (element, stream) {
                log('Attaching media stream');

                var muted = element.muted;

                element.mozSrcObject = stream;
                element.play();

                if (muted === true) {
                    // FF unmutes upon play()
                    element.muted = true;
                }

                return element;
            };

            reattachMediaStream = function (to, from) {
                log('Reattaching media stream');

                var muted = to.muted;

                to.mozSrcObject = from.mozSrcObject;
                to.play();

                if (muted === true) {
                    // FF unmutes upon play()
                    to.muted = true;
                }

                return to;
            };

            // Fake get{Video,Audio}Tracks
            if (!MediaStream.prototype.getVideoTracks) {
                MediaStream.prototype.getVideoTracks = function () {
                    return [];
                };
            }

            if (!MediaStream.prototype.getAudioTracks) {
                MediaStream.prototype.getAudioTracks = function () {
                    return [];
                };
            }

            if (MediaStreamTrack.getSources) {
                getSources = MediaStreamTrack.getSources.bind(MediaStreamTrack);
            } else {
                getSources = function (callback) {
                    setTimeout(function () {
                        callback([
                            {kind: 'audio', id: 'default', label: '', facing: ''},
                            {kind: 'video', id: 'default', label: '', facing: ''}
                        ]);
                    }, 0);
                }
            }

            webrtcSupported = true;
        } else if (navigator.webkitGetUserMedia) {
            log('Webkit detected', navigator.userAgent);

            // Creates iceServer from the url for Chrome.
            createIceServer = function (url, username, password) {
                var iceServer = null;
                var url_parts = url.split(':');
                if (url_parts[0].indexOf('stun') === 0) {
                    // Create iceServer with stun url.
                    iceServer = {'url': url};
                } else if (url_parts[0].indexOf('turn') === 0) {
                    // Chrome M28 & above uses below TURN format.
                    iceServer = {
                        'url': url,
                        'credential': password,
                        'username': username
                    };
                }
                return iceServer;
            };

            // The RTCPeerConnection object.
            RTCPeerConnection = webkitRTCPeerConnection;

            // The RTCSessionDescription object.
            RTCSessionDescription = window.RTCSessionDescription;

            // The RTCIceCandidate object.
            RTCIceCandidate = window.RTCIceCandidate;

            // Get UserMedia (only difference is the prefix).
            getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

            getStats = function (pc, track, successCallback, errorCallback) {
                pc.getStats(successCallback, track, errorCallback);
            };

            // Attach a media stream to an element.
            attachMediaStream = function (element, stream) {
                if (typeof element.srcObject !== 'undefined') {
                    element.srcObject = stream;
                } else if (typeof element.mozSrcObject !== 'undefined') {
                    element.mozSrcObject = stream;
                } else if (typeof element.src !== 'undefined') {
                    element.src = URL.createObjectURL(stream);
                } else {
                    log('Error attaching stream to element.');
                }

                element.play();

                return element;
            };

            reattachMediaStream = function (to, from) {
                to.src = from.src;

                return to;
            };

            getSources = MediaStreamTrack.getSources.bind(MediaStreamTrack);

            webrtcSupported = true;
        } else {
            log('Browser does not appear to be WebRTC-capable', navigator.userAgent);
        }

        var adapter = {
            RTCPeerConnection: RTCPeerConnection,
            RTCSessionDescription: RTCSessionDescription,
            RTCIceCandidate: RTCIceCandidate,
            getSources: getSources,
            getUserMedia: getUserMedia,
            getStats: getStats,
            attachMediaStream: attachMediaStream,
            reattachMediaStream: reattachMediaStream,
            webrtcSupported: webrtcSupported
        };

        adapter.exportGlobal = function () {
            window.RTCPeerConnection = adapter.RTCPeerConnection;
            window.RTCSessionDescription = adapter.RTCSessionDescription;
            window.RTCIceCandidate = adapter.RTCIceCandidate;
        };

        return adapter;
    });
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/exportGlobal',
    [], function () {
        'use strict';

        var exportGlobal = function exportGlobal(adapter) {
            window.RTCPeerConnection = adapter.RTCPeerConnection;
            window.RTCSessionDescription = adapter.RTCSessionDescription;
            window.RTCIceCandidate = adapter.RTCIceCandidate;
        };

        return exportGlobal;
    });
/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
'use strict';

define('phenix-rtc', [
    'rtc/RTCAdapter',
    'rtc/exportGlobal'
], function (adapter, exportGlobal) {
    adapter.onLoaded = function () {
        exportGlobal(adapter);
    };

    adapter.onLoaded();

    return adapter;
});