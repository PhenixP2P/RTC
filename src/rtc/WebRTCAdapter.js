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