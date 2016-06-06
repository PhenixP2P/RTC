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

    describe('When using the PhenixRTC adapter', function () {
        var rtc = new PhenixRTC();

        if (rtc.isEnabled()) {
            describe('When creating a PeerConnection', function () {
                var pc;
                var peerConnectionConfig = {
                    'iceServers': [
                        {
                            url: 'stun:stun.l.google.com:19302'
                        },
                        {
                            url: 'stun:stun1.l.google.com:19302'
                        },
                        {
                            url: 'stun:stun2.l.google.com:19302'
                        },
                        {
                            url: 'stun:stun3.l.google.com:19302'
                        },
                        {
                            url: 'stun:stun4.l.google.com:19302'
                        }
                    ]
                };
                var peerConnectionConstraints = {
                    'optional': [
                        {
                            DtlsSrtpKeyAgreement: false
                        },
                        {
                            RtpDataChannels: false
                        }
                    ]
                };

                before(function () {
                    var RTCPeerConnection = rtc.getRTCPeerConnectionConstructor();

                    pc = new RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);
                });
                after(function () {
                    if (pc) {
                        pc.close();
                    }
                });

                it('is an object', function () {
                    expect(pc).to.be.an('object');
                });

                it('defines the iceConnectionState attribute', function () {
                    expect(pc.iceConnectionState).to.be.defined;
                    expect(pc).to.have.property('iceConnectionState');
                });
                it('defines the iceGatheringState attribute', function () {
                    expect(pc.iceGatheringState).to.be.defined;
                    expect(pc).to.have.property('iceGatheringState');
                });
                it('defines the localDescription attribute', function () {
                    expect(pc.localDescription).to.be.null;
                    expect(pc).to.have.property('localDescription');
                });
                it('defines the remoteDescription attribute', function () {
                    expect(pc.remoteDescription).to.be.null;
                    expect(pc).to.have.property('remoteDescription');
                });
                it('defines the signalingState attribute', function () {
                    expect(pc.signalingState).to.be.defined;
                    expect(pc).to.have.property('signalingState');
                });

                it('defines the addstream event', function () {
                    expect(pc.onaddstream).to.be.undefined;
                });
                it('defines the datachannel event', function () {
                    expect(pc.ondatachannel).to.be.undefined;
                });
                it('defines the icecandidate event', function () {
                    expect(pc.onicecandidate).to.be.undefined;
                });
                it('defines the iceconnectionstatechange event', function () {
                    expect(pc.oniceconnectionstatechange).to.be.undefined;
                });
                it('defines the negotiationneeded event', function () {
                    expect(pc.onnegotiationneeded).to.be.undefined;
                });
                it('defines the removestream event', function () {
                    expect(pc.onremovestream).to.be.undefined;
                });
                it('defines the signalingstatechange event', function () {
                    expect(pc.onsignalingstatechange).to.be.undefined;
                });

                it('defines addIceCandidate()', function () {
                    expect(pc.addIceCandidate).to.be.defined;
                });
                it('defines addStream()', function () {
                    expect(pc.addStream).to.be.defined;
                });
                it('defines close()', function () {
                    expect(pc.close).to.be.defined;
                });
                it('defines createAnswer()', function () {
                    expect(pc.createAnswer).to.be.defined;
                });
                it('defines createOffer()', function () {
                    expect(pc.createOffer).to.be.defined;
                });
                it('defines getLocalStreams()', function () {
                    expect(pc.getLocalStreams).to.be.defined;
                });
                it('defines getRemoteStreams()', function () {
                    expect(pc.getRemoteStreams).to.be.defined;
                });
                it('defines getStats()', function () {
                    expect(pc.getStats).to.be.defined;
                });
                it('defines getStreamById()', function () {
                    expect(pc.getStreamById).to.be.defined;
                });
                it('defines removeStream()', function () {
                    expect(pc.removeStream).to.be.defined;
                });
                it('defines setLocalDescription()', function () {
                    expect(pc.setLocalDescription).to.be.defined;
                });
                it('defines setRemoteDescription()', function () {
                    expect(pc.setRemoteDescription).to.be.defined;
                });
                it('defines updateIce()', function () {
                    expect(pc.updateIce).to.be.defined;
                });

                it('is has not preformed any networking activities', function () {
                    expect(pc.iceGatheringState).to.be.equal('new');
                });
                it('is not connected', function () {
                    expect(pc.iceConnectionState).to.be.equal('new');
                });

                describe('When setting the remote description', function () {
                    var remoteSdp;
                    var remoteOffer = 'v=0';
                    var streams = [];

                    before(function (done) {
                        var RTCSessionDescription = rtc.getRTCSessionDescriptionConstructor();

                        remoteSdp = new RTCSessionDescription({ type: 'offer', sdp: remoteOffer });

                        addEventListener(pc, 'addstream', function (stream) {
                            streams.push(stream);
                        });

                        function success() {
                            done();
                        }

                        function failure(e) {
                            expect(e).to.be.ok;
                            done(e);
                        }

                        pc.setRemoteDescription(remoteSdp, success, failure);
                    });

                    it('has a remote offer', function () {
                        expect(pc.signalingState).to.be.equal('have-remote-offer');
                    });
                    it('is gathering ICE candidates', function () {
                        expect([ 'gathering', 'complete' ]).to.contain(pc.iceGatheringState);
                    });
                    it('is attempting to connect', function () {
                        expect([ 'new', 'checking', 'connected', 'completed' ]).to.contain(pc.iceConnectionState);
                    });

                    it('updated the remote SDP', function () {
                        expect(pc.remoteDescription).to.be.defined;
                        expect(pc.remoteDescription.sdp).to.be.equal(remoteOffer);
                    });

                    it('did raise an addstream event', function () {
                        expect(streams).to.be.length(1);
                    });

                    describe('When creating the local answer', function () {
                        var localSdp;
                        before(function (done) {
                            function success(sdp) {
                                localSdp = sdp;
                                done();
                            }

                            function failure(e) {
                                expect(e).to.be.ok;
                                done(e);
                            }

                            pc.createAnswer(success, failure);
                        });

                        it('provides a local SDP', function () {
                            expect(localSdp).to.be.defined;
                            expect(localSdp.sdp).to.be.a('string');
                        });

                        describe('When setting the local description', function () {
                            before(function (done) {
                                function success() {
                                    done();
                                }

                                function failure(e) {
                                    expect(e).to.be.ok;
                                    done(e);
                                }

                                pc.setLocalDescription(localSdp, success, failure);
                            });

                            it('updated the local SDP', function () {
                                expect(pc.localDescription).to.be.defined;
                                expect(pc.localDescription.sdp).to.be.equal(localSdp.sdp);
                            });

                            it('connected to the remote peer', function () {
                                expect(pc.signalingState).to.be.equal('stable');
                            });

                            describe('When receiving a stream', function () {
                                before(function (done) {
                                    var maxTries = 100;

                                    function checkStreams() {
                                        if (maxTries-- < 0) {
                                            done('Add stream not triggered');
                                        }
                                        if (streams.length > 0) {
                                            done();
                                        } else {
                                            setTimeout(checkStreams, 50);
                                        }
                                    }

                                    checkStreams();
                                });

                                it('did raise the addstream event once', function () {
                                    expect(streams).to.be.length(1);
                                });

                                it('updates the local stream', function () {
                                    expect(pc.getLocalStreams()).to.be.length(1);
                                });

                                it('has no remote streams', function () {
                                    expect(pc.getRemoteStreams()).to.be.empty;
                                });

                                describe('When attaching the stream to a video element', function () {
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

                                        phenixEl = rtc.attachMediaStream(el, streams[0]);

                                        addEventListener(phenixEl, 'resize', onresize);
                                        addEventListener(phenixEl, 'timeupdate', ontimeupdate);
                                        addEventListener(phenixEl, 'error', onerror);
                                        addEventListener(phenixEl, 'loadedmetadata', onloadedmetadata);
                                        addEventListener(phenixEl, 'loadeddata', onloadeddata);
                                        addEventListener(phenixEl, 'volumechanged', onvolumechanged);

                                        $(phenixEl).appendTo(document.body);
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

                                    it('defines the src attribute', function () {
                                        expect(phenixEl.src).to.be.defined;
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

                                    describe('After playing the first frame', function () {
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

                                            describe('When closing the peer connection', function () {
                                                before(function () {
                                                    pc.close();
                                                });

                                                it('ends the video playback', function () {
                                                    expect(phenixEl.ended).to.be.true;
                                                });

                                                it('disconnects from remote peer', function () {
                                                    expect(pc.signalingState).to.be.equal('closed');
                                                });
                                                it('does not longer gather ICE candidates', function () {
                                                    expect(pc.iceGatheringState).to.be.equal('complete');
                                                });
                                                it('has shut down the ICE agent', function () {
                                                    expect(pc.iceConnectionState).to.be.equal('closed');
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                })
            });
        }
    });
});
