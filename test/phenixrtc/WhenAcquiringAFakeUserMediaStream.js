/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define([
    'lodash',
    'jquery',
    'rtc/PhenixRTC'
], function (_, $, PhenixRTC) {
    'use strict';

    /**
     * All + IE9+ support addEventListener
     */
    function addEventListener(target, name, listener, useCapture) {
        if (target.phenixSetEventListener) {
            target.phenixSetEventListener(name, listener);
        } else if (target.addEventListener) {
            target.addEventListener(name, listener, useCapture === true);
        } else {
            target.attachEvent('on' + name, listener);
        }
    }

    describe('Using the PhenixRTC adapter', function () {
        var rtc = new PhenixRTC();

        if (rtc.isEnabled()) {
            describe('When acquiring a fake user media stream', function () {
                var mediaStream;

                before(function (done) {
                    var constraints = {
                        video: true,
                        audio: true,
                        phenixFake: true /* A flag to request the creation of fake streams. */
                    };

                    function successCallback(res) {
                        mediaStream = res;
                        done();
                    }

                    function failureCallback(err) {
                        done(err);
                    }

                    rtc.getUserMediaDelegate()(constraints, successCallback, failureCallback);
                });

                it('defines the ended attribute', function () {
                    expect(mediaStream.ended).to.be.a('boolean');
                    expect(mediaStream).to.have.property('ended');
                });
                it('defines the id attribute', function () {
                    expect(mediaStream.id).to.be.a('string');
                    expect(mediaStream).to.have.property('id');
                });
                it('defines the label attribute', function () {
                    expect(mediaStream.label).to.be.a('string');
                    expect(mediaStream).to.have.property('label');
                });

                it('defines the addtrack event', function () {
                    expect(mediaStream.onaddtrack).to.be.undefined;
                });
                it('defines the ended event', function () {
                    expect(mediaStream.onended).to.be.undefined;
                });
                it('defines the removetrack event', function () {
                    expect(mediaStream.onremovetrack).to.be.undefined;
                });

                it('defines addTrack()', function () {
                    expect(mediaStream.addTrack).to.be.defined;
                });
                it('defines clone()', function () {
                    expect(mediaStream.clone).to.be.defined;
                });
                it('defines getAudioTracks()', function () {
                    expect(mediaStream.getAudioTracks).to.be.defined;
                });
                it('defines getTrackById()', function () {
                    expect(mediaStream.getTrackById).to.be.defined;
                });
                it('defines getTracks()', function () {
                    expect(mediaStream.getTracks).to.be.defined;
                });
                it('defines getVideoTracks()', function () {
                    expect(mediaStream.getVideoTracks).to.be.defined;
                });
                it('defines removeTrack()', function () {
                    expect(mediaStream.removeTrack).to.be.defined;
                });
                it('defines stop()', function () {
                    expect(mediaStream.stop).to.be.defined;
                });

                it('has not ended', function () {
                    expect(mediaStream.ended).to.be.false;
                });
                it('has an id', function () {
                    expect(mediaStream.id).to.have.length.of.at.least(1);
                });
                it('has a label', function () {
                    expect(mediaStream.label).to.have.length.of.at.least(1);
                });
                it('contains two media tracks', function () {
                    expect(mediaStream.getTracks()).to.be.defined;
                    expect(mediaStream.getTracks().length).to.be.equal(2);
                });
                it('contains one audio track', function () {
                    expect(mediaStream.getAudioTracks()).to.be.defined;
                    expect(mediaStream.getAudioTracks()).to.have.length(1);
                });
                it('contains one video track', function () {
                    expect(mediaStream.getVideoTracks()).to.be.defined;
                    expect(mediaStream.getVideoTracks()).to.have.length(1);
                });

                describe('When accessing the video track', function () {
                    var track;

                    before(function () {
                        track = mediaStream.getVideoTracks()[0];
                    });

                    it('defines the enabled attribute', function () {
                        expect(track).to.have.property('enabled');
                    });
                    it('defines the id attribute', function () {
                        expect(track).to.have.property('id');
                    });
                    it('defines the kind attribute', function () {
                        expect(track).to.have.property('kind');
                    });
                    it('defines the label attribute', function () {
                        expect(track).to.have.property('label');
                    });
                    it('defines the muted attribute', function () {
                        expect(track).to.have.property('muted');
                    });
                    it('defines the readyState attribute', function () {
                        expect(track).to.have.property('readyState');
                    });

                    it('defines the ended event', function () {
                        expect(track.onended).to.be.undefined;
                    });
                    it('defines the mute event', function () {
                        expect(track.onmuted).to.be.undefined;
                    });
                    it('defines the unmute event', function () {
                        expect(track.onunmuted).to.be.undefined;
                    });

                    it('defines clone()', function () {
                        expect(track.clone).to.be.defined;
                    });
                    it('defines stop()', function () {
                        expect(track.stop).to.be.defined;
                    });

                    it('is enabled', function () {
                        expect(track.enabled).to.be.true;
                    });
                    it('is a video track', function () {
                        expect(track.kind).to.be.equal('video');
                    });
                    it('is unmuted', function () {
                        expect(track.muted).to.be.false;
                    });
                    it('is live', function () {
                        expect(track.readyState).to.be.equal('live');
                    });
                });

                describe('When accessing the audio track', function () {
                    var track;

                    before(function () {
                        track = mediaStream.getAudioTracks()[0];
                    });

                    it('defines the enabled attribute', function () {
                        expect(track).to.have.property('enabled');
                    });
                    it('defines the id attribute', function () {
                        expect(track).to.have.property('id');
                    });
                    it('defines the kind attribute', function () {
                        expect(track).to.have.property('kind');
                    });
                    it('defines the label attribute', function () {
                        expect(track).to.have.property('label');
                    });
                    it('defines the muted attribute', function () {
                        expect(track).to.have.property('muted');
                    });
                    it('defines the readyState attribute', function () {
                        expect(track).to.have.property('readyState');
                        expect(track.readyState).to.be.a('string');
                    });

                    it('defines the ended event', function () {
                        expect(track.onended).to.be.undefined;
                    });
                    it('defines the mute event', function () {
                        expect(track.onmuted).to.be.undefined;
                    });
                    it('defines the unmute event', function () {
                        expect(track.onunmuted).to.be.undefined;
                    });

                    it('defines clone()', function () {
                        expect(track.clone).to.be.defined;
                    });
                    it('defines stop()', function () {
                        expect(track.stop).to.be.defined;
                    });

                    it('is enabled', function () {
                        expect(track.enabled).to.be.true;
                    });
                    it('is a audio track', function () {
                        expect(track.kind).to.be.equal('audio');
                    });
                    it('is unmuted', function () {
                        expect(track.muted).to.be.false;
                    });
                    it('is live', function () {
                        expect(track.readyState).to.be.equal('live');
                    });
                });

                describe('When attaching the fake stream to a video element', function () {
                    var el;
                    var phenixEl;
                    var onresize;
                    var ontimeupdate;
                    var onerror;
                    var onloadedmetadata;
                    var onloadeddata;
                    var onvolumechanged;

                    before(function () {
                        el = document.createElement('video');

                        onresize = sinon.stub();
                        ontimeupdate = sinon.stub();
                        onerror = sinon.stub();
                        onloadedmetadata = sinon.stub();
                        onloadeddata = sinon.stub();
                        onvolumechanged = sinon.stub();

                        addEventListener(el, 'resize', onresize);
                        addEventListener(el, 'timeupdate', ontimeupdate);
                        addEventListener(el, 'error', onerror);
                        addEventListener(el, 'loadedmetadata', onloadedmetadata);
                        addEventListener(el, 'loadeddata', onloadeddata);
                        addEventListener(el, 'volumechanged', onvolumechanged);

                        $(el).appendTo(document.body);

                        phenixEl = rtc.attachMediaStream(el, mediaStream);

                    });
                    after(function () {
                        $(phenixEl).remove();
                        $(el).remove();
                    });

                    it('has a presenter attached', function () {
                        expect(phenixEl.phenixPresenter).to.be.defined;
                    });
                    it('removes the original element from the DOM', function () {
                        expect(document.body.contains(el)).to.be.false;
                    });
                    it('adds the new element to the DOM', function () {
                        expect(document.body.contains(phenixEl)).to.be.true;
                    });

                    describe('When the native module is loaded', function () {
                        before(function (done) {
                            phenixEl.phenixPresenter.onReady(done);
                        });

                        it('defines the src attribute', function () {
                            expect(phenixEl.src).to.be.defined;
                            expect(phenixEl.src.id).to.be.defined;
                            expect(phenixEl.src.id).to.be.equal(mediaStream.id);
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

                        describe('After playing the first frames', function () {
                            before(function (done) {
                                var maxTries = 100;

                                function checkProgress() {
                                    if (maxTries-- < 0) {
                                        done('No frames received in time');
                                    }
                                    if (phenixEl.phenixFramesRendered > 0) {
                                        done();
                                    } else {
                                        setTimeout(checkProgress, 50);
                                    }
                                }

                                checkProgress();
                            });

                            it('has not ended', function () {
                                expect(phenixEl.ended).to.be.false;
                            });
                            it('has updated videoWidth', function () {
                                expect(phenixEl.videoWidth).to.be.at.least(1);
                            });
                            it('has updated videoHeight', function () {
                                expect(phenixEl.videoHeight).to.be.at.least(1);
                            });
                            it('has not triggered the resize event', function () {
                                onresize.should.have.not.been.called;
                            });
                            it('has triggered the timeupdate event', function () {
                                ontimeupdate.should.have.been.calledOnce;
                            });
                            it('has not triggered the error event', function () {
                                onerror.should.have.not.been.called;
                            });
                            it('has triggered the loadedmetadata event', function () {
                                onloadedmetadata.should.have.been.calledOnce;
                            });
                            it('has triggered the loadeddata event', function () {
                                onloadeddata.should.have.been.calledOnce;
                            });
                            it('has not triggered the volumechanged event', function () {
                                onvolumechanged.should.have.not.been.called;
                            });

                            describe('After pausing the video', function () {
                                before(function () {
                                    phenixEl.pause();
                                });

                                it('does not render frames anymore', function (done) {
                                    var before = phenixEl.phenixFramesRendered;

                                    setTimeout(function () {
                                        try {
                                            var after = phenixEl.phenixFramesRendered;

                                            expect(after).to.be.equal(before);

                                            done();
                                        } catch (e) {
                                            done(e);
                                        }
                                    }, 200);
                                });

                                it('has not ended', function () {
                                    expect(phenixEl.ended).to.be.false;
                                });
                            });
                        });
                    });
                });
            });
        }
    });
});
