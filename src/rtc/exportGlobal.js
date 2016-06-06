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