/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define([
    'lodash',
    'jquery',
    'rtc/PhenixRTC'
], function (_, $, PhenixRTC) {
    'use strict';

    describe('When using the PhenixRTC adapter', function () {
        var rtc = new PhenixRTC();

        if (rtc.isEnabled()) {
            describe('When attaching a "null" stream to a video element', function () {
                var el;
                var mediaStream = null;
                var phenixEl;

                before(function () {
                    el = document.createElement('video');
                    $(el).appendTo(document.body);
                    phenixEl = rtc.attachMediaStream(el, mediaStream);
                });
                after(function () {
                    $(phenixEl).remove();
                    $(el).remove();
                });

                it('removes the original element from the DOM', function () {
                    expect(document.body.contains(el)).to.be.false;
                });
                it('adds the new element to the DOM', function () {
                    expect(document.body.contains(phenixEl)).to.be.true;
                });

                it('defines the phenixVersion', function () {
                    expect(phenixEl.phenixVersion).to.be.a('string');
                    expect(phenixEl).to.have.property('phenixVersion');
                });
                it('defines the src attribute', function () {
                    expect(phenixEl.src).to.be.null;
                    expect(phenixEl).to.have.property('src');
                });
                it('defines the autoplay attribute', function () {
                    expect(phenixEl.autoplay).to.be.a('boolean');
                    expect(phenixEl).to.have.property('autoplay');
                });
                it('defines the muted attribute', function () {
                    expect(phenixEl.muted).to.be.a('boolean');
                    expect(phenixEl).to.have.property('muted');
                });
                it('defines the defaultMuted attribute', function () {
                    expect(phenixEl.defaultMuted).to.be.a('boolean');
                    expect(phenixEl).to.have.property('defaultMuted');
                });
                it('defines the ended attribute', function () {
                    expect(phenixEl.ended).to.be.a('boolean');
                    expect(phenixEl).to.have.property('ended');
                });
                it('defines the videoWidth attribute', function () {
                    expect(phenixEl.videoWidth).to.be.a('number');
                    expect(phenixEl).to.have.property('videoWidth');
                });
                it('defines the videoHeight attribute', function () {
                    expect(phenixEl.videoHeight).to.be.a('number');
                    expect(phenixEl).to.have.property('videoHeight');
                });
                it('defines the volume attribute', function () {
                    expect(phenixEl.volume).to.be.a('number');
                    expect(phenixEl).to.have.property('volume');
                });
                it('defines the phenixVersion attribute', function () {
                    expect(phenixEl.phenixVersion).to.be.a('string');
                    expect(phenixEl).to.have.property('phenixVersion');
                });
                it('defines the phenixFramesRendered attribute', function () {
                    expect(phenixEl.phenixFramesRendered).to.be.a('number');
                    expect(phenixEl.phenixFramesRendered).to.be.equal(0);
                    expect(phenixEl).to.have.property('phenixFramesRendered');
                });

                it('defines the resize event', function () {
                    expect(phenixEl.onresize).to.be.undefined;
                });
                it('defines the timeupdate event', function () {
                    expect(phenixEl.ontimeupdate).to.be.undefined;
                });
                it('defines the error event', function () {
                    expect(phenixEl.onerror).to.be.undefined;
                });
                it('defines the loadedmetadata event', function () {
                    expect(phenixEl.onloadedmetadata).to.be.undefined;
                });
                it('defines the loadeddata event', function () {
                    expect(phenixEl.onloadeddata).to.be.undefined;
                });
                it('defines the volumechanged event', function () {
                    expect(phenixEl.onvolumechanged).to.be.undefined;
                });

                it('defines load()', function () {
                    expect(phenixEl.load).to.be.defined;
                });
                it('defines play()', function () {
                    expect(phenixEl.play).to.be.defined;
                });
                it('defines pause()', function () {
                    expect(phenixEl.pause).to.be.defined;
                });
            });
        }
    });
});
