/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define([
    'lodash',
    'rtc/WebRTCAdapter'
], function (_, WebRTCAdapter) {
    'use strict';

    describe('When loading the WebRTC adapter', function () {
        it('defines RTCPeerConnection', function () {
            expect(WebRTCAdapter).to.have.property('RTCPeerConnection');
        });
        it('defines RTCSessionDescription', function () {
            expect(WebRTCAdapter).to.have.property('RTCSessionDescription');
        });
        it('defines RTCIceCandidate', function () {
            expect(WebRTCAdapter).to.have.property('RTCIceCandidate');
        });
        it('defines getSources', function () {
            expect(WebRTCAdapter).to.have.property('getSources');
        });
        it('defines getUserMedia', function () {
            expect(WebRTCAdapter).to.have.property('getUserMedia');
        });
        it('defines attachMediaStream', function () {
            expect(WebRTCAdapter).to.have.property('attachMediaStream');
        });
        it('defines reattachMediaStream', function () {
            expect(WebRTCAdapter).to.have.property('reattachMediaStream');
        });
        it('defines webrtcSupported boolean flag', function () {
            expect(WebRTCAdapter.webrtcSupported).to.be.a('boolean');
        });
        it('defines the api to export it global', function () {
            expect(WebRTCAdapter.exportGlobal).to.be.a('function');
        });
    });
});