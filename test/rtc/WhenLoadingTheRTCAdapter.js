/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define([
    'lodash',
    'rtc/RTCAdapter'
], function (_, RTCAdapter) {
    'use strict';

    describe('When loading the RTC adapter', function () {
        it('defines RTCPeerConnection', function () {
            expect(RTCAdapter).to.have.property('RTCPeerConnection');
        });
        it('defines RTCSessionDescription', function () {
            expect(RTCAdapter).to.have.property('RTCSessionDescription');
        });
        it('defines RTCIceCandidate', function () {
            expect(RTCAdapter).to.have.property('RTCIceCandidate');
        });
        it('defines getSources', function () {
            expect(RTCAdapter).to.have.property('getSources');
        });
        it('defines getUserMedia', function () {
            expect(RTCAdapter).to.have.property('getUserMedia');
        });
        it('defines attachMediaStream', function () {
            expect(RTCAdapter).to.have.property('attachMediaStream');
        });
        it('defines reattachMediaStream', function () {
            expect(RTCAdapter).to.have.property('reattachMediaStream');
        });
        it('defines webrtcDetectedBrowser', function () {
            expect(RTCAdapter).to.have.property('browser');
        });
        it('defines webrtcDetectedVersion', function () {
            expect(RTCAdapter).to.have.property('browserVersion');
        });
        it('defines webrtcSupported boolean flag', function () {
            expect(RTCAdapter.webrtcSupported).to.be.a('boolean');
        });
        it('defines phenixSupported boolean flag', function () {
            expect(RTCAdapter.phenixSupported).to.be.a('boolean');
        });
        it('defines phenixEnabled boolean flag', function () {
            expect(RTCAdapter.isPhenixEnabled).to.be.a('function');
        });
    });
});