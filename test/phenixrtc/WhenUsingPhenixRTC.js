/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define([
    'lodash',
    'jquery',
    'bowser',
    'rtc/PhenixRTC'
], function (_, $, bowser, PhenixRTC) {
    'use strict';

    var supported = bowser.safari === true || bowser.msie === true;

    describe('When using PhenixRTC', function () {
        var rtc = new PhenixRTC();

        before(function (done) {
            if (!supported) {
                done();
            } else {
                rtc.onReady(function () {
                    done();
                });
            }
        });

        it('indicates if it is supported', function () {
            expect(PhenixRTC.isSupported()).to.be.equal(supported);
        });
        it('indicates if it is enabled', function () {
            expect(rtc.isEnabled()).to.be.equal(supported);
        });

        if (rtc.isEnabled()) {
            it('has a valid version', function () {
                expect(rtc.getVersion()).to.be.a('string');
                expect(rtc.getVersion().length).to.not.be.equal('');
            });

            it('provides the RTCPeerConnection constructor', function () {
                expect(rtc.getRTCPeerConnectionConstructor()).to.be.defined;
            });

            it('provides the RTCSessionDescription constructor', function () {
                expect(rtc.getRTCSessionDescriptionConstructor()).to.be.defined;
            });

            it('provides the RTCIceCandidate constructor', function () {
                expect(rtc.getRTCIceCandidateConstructor()).to.be.defined;
            });

            it('provides the UserMedia function', function () {
                expect(rtc.getUserMediaDelegate()).to.be.a('function');
            });

            it('provides the getSources function', function () {
                expect(rtc.getSourcesDelegate()).to.be.a('function');
            });
        }
    });
});
