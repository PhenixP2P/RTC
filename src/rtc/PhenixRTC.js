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