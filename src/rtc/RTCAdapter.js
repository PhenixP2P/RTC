/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
        './DetectBrowser',
        './WebRTCAdapter',
        './PhenixRTC'
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
        isPhenixEnabled: function () {
            return false;
        },
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
                    return phenixRTC.isEnabled();
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