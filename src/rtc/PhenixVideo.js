/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
define('rtc/PhenixVideo',
    [
        'rtc/WaitFor'
    ], function (WaitFor) {
        'use strict';

        var log = function () {
                console.log.apply(console, arguments);
            } || function () {
            };
        var logError = function () {
                console.error.apply(console, arguments);
            } || log;

        function PhenixVideo(ghost, stream) {
            var that = this;

            this._ghost = ghost;
            this._stream = stream;
            this._events = {};

            var loaded = function loaded(success) {
                that._loaded = true;
                that._enabled = success === true;

                if (success) {
                    initialize.call(that);
                } else {
                    logError('Failed to create Phenix video element');
                }

                if (that._onReady) {
                    that._onReady(that._enabled);
                }
            };

            try {
                this._video = createPhenixVideoElement();
                this._video.className = this._ghost.className;
                this._video.height = this._ghost.height;
                this._video.width = this._ghost.width;

                this._ghost.style.cssText = 'visibility:hidden !important;width:0px !important;height:0px !important;' +
                'margin:0px !important;padding:0px !important;' +
                'border-style:none !important;border-width:0px !important;' +
                'max-width:0px !important;max-height:0px !important;outline:none !important';

                this._video.onunload = function () {
                    that._loaded = false;
                };

                observeInsertion.call(this);

                if (!document.body || !document.body.contains) {
                    log('document.body.contains is not supported');
                }

                if (document.body && document.body.contains && document.body.contains(this._ghost)) {
                    this._ghost.parentNode.replaceChild(this._video, this._ghost);
                }

                var waitFor = new WaitFor();

                waitFor.waitForReady(this._video, loaded);
            } catch (e) {
                logError('Error while loading Phenix RTC' + e);
                loaded(false);
            }
        }

        PhenixVideo.prototype.hookUpEvents = function () {
            var that = this;
            var ghost = this._ghost;

            this.addEventListener('error', function () {
                dispatchEvent(ghost, 'error');
            });
            this.addEventListener('mute', function () {
                ghost.muted = that._video.muted;
                dispatchEvent(ghost, 'mute');
            });
            this.addEventListener('unmute', function () {
                ghost.muted = that._video.muted;
                dispatchEvent(ghost, 'unmute');
            });
            this.addEventListener('ended', function () {
                ghost.ended = that._video.ended;
                dispatchEvent(ghost, 'ended');
            });
            this.addEventListener('loadedmetadata', function () {
                log('Video loaded metadata', that._video.videoWidth, that._video.videoHeight);
                ghost.width = that._video.width;
                ghost.height = that._video.height;
                dispatchEvent(ghost, 'loadedmetadata');
            });
            this.addEventListener('loadeddata', function () {
                ghost.width = that._video.width;
                ghost.height = that._video.height;
                dispatchEvent(ghost, 'loadeddata');
            });
            this.addEventListener('resize', function () {
                ghost.width = that._video.width;
                ghost.height = that._video.height;
                dispatchEvent(ghost, 'resize');
            });
        };

        PhenixVideo.prototype.onReady = function (callback) {
            var that = this;

            if (this._loaded) {
                setTimeout(function () {
                    callback(that._enabled);
                }, 1)
            } else {
                this._onReady = callback;
            }
        };

        PhenixVideo.prototype.getElement = function () {
            return this._video;
        };

        PhenixVideo.prototype.addEventListener = function (name, listener, useCapture) {
            addEventListener.call(this, name, listener, useCapture);
        };

        PhenixVideo.prototype.removeEventListener = function (name, listener, useCapture) {
            removeEventListener.call(this, name, listener, useCapture);
        };

        function createPhenixVideoElement() {
            var video = document.createElement('object');

            video.type = 'application/x-phenix-video';

            return video;
        }

        function addEventListener(name, listener, useCapture) {
            var listeners = this._events[name];

            if (!listeners) {
                listeners = this._events[name] = [];

                if (this._loaded) {
                    registerEvent.call(this, name);
                }
            }

            listeners.push(listener);
        }

        function removeEventListener(name, listener, useCapture) {
            var listeners = this._events[name];

            if (listeners) {
                var idx = listeners.indexOf(listener);

                if (idx >= 0) {
                    listeners = listeners.splice(idx, 1);

                    if (listeners.length > 0) {
                        this._events[name] = listeners;
                    } else {
                        delete this._events[name];
                    }
                }
            }
        }

        function registerEvent(name) {
            var that = this;

            function listener() {
                var listeners = that._events[name];

                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(that, arguments);
                    }
                }
            }

            that._video.phenixSetEventListener(name, listener);
        }

        function dispatchEvent(source, name) {
            var event; // The custom event that will be created

            if (document.createEvent) {
                event = document.createEvent('HTMLEvents');
                event.initEvent(name, true, true);
            } else {
                event = document.createEventObject();
                event.eventType = name;
            }

            event.eventName = name;

            setTimeout(function () {
                if (document.createEvent) {
                    source.dispatchEvent(event);
                } else {
                    source.fireEvent('on' + event.eventType, event);
                }
            });
        }

        function initialize() {
            var events = Object.keys(this._events);

            for (var i = 0; i < events.length; i++) {
                registerEvent.call(this, events[i]);
            }

            this.hookUpEvents();

            propagateAttributeChanges.call(this);

            this._video.id = this._ghost.id;
            this._video.style.cssText = this._ghost.cssText;
            this._video.className = this._ghost.className;
            this._video.innerHtml = this._ghost.innerHtml;
            this._video.width = this._ghost.width;
            this._video.height = this._ghost.height;
            this._video.autoplay = this._ghost.autoplay;
            this._video.muted = this._ghost.muted;
            this._video.defaultMuted = this._ghost.defaultMuted;
            this._video.volume = this._ghost.volume;

            if (this._stream) {
                this._video.src = this._stream;
            }
        }

        function propagateAttributeChanges() {
            var that = this;
            var readonly = [ 'style' ];

            if (window.MutationObserver) {
                // Newer browsers support an efficient way to observe DOM modifications
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.type === 'attributes' && mutation.target === that._ghost && readonly.indexOf(mutation.attributeName) === -1) {
                            that._video[mutation.attributeName] = that._ghost[mutation.attributeName];
                        }
                    });
                });

                var configAttributes = {attributes: true};

                observer.observe(that._ghost, configAttributes);
            } else {
                // For older browsers. There is a significant performance overhead with this method.
                // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
                log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

                if (that._ghost.addEventListener) {
                    that._ghost.addEventListener('DOMAttrModified', function (event) {
                        that._video[event.target.tagName] = that._ghost[event.target.tagName];
                    }, false);
                } else {
                    that._ghost.attachEvent('onpropertychange', function (event) {
                        that._video[event.target.tagName] = that._ghost[event.target.tagName];
                    });
                }
            }
        }

        function observeInsertion() {
            var that = this;

            if (window.MutationObserver) {
                // Newer browsers support an efficient way to observe DOM modifications
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.type === 'childList') {
                            for (var i = 0; i < mutation.addedNodes.length; i++) {
                                var node = mutation.addedNodes[i];

                                if (mutation.target !== that._video) {
                                    if (node === that._ghost) {
                                        // Replace element with our video element
                                        mutation.target.replaceChild(that._video, that._ghost);
                                        initialize.call(that);
                                    } else if (isDescendant(mutation.target, that._ghost)) {
                                        that._ghost.parentNode.replaceChild(that._video, that._ghost);
                                        initialize.call(that);
                                    }
                                }
                            }
                        }
                    });
                });

                var configMutations = {childList: true, attributes: false, characterData: false, subtree: true};

                observer.observe(document.body, configMutations);
            } else {
                // For older browsers. There is a significant performance overhead with this method.
                // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
                log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

                addEventListener(that._ghost, 'DOMNodeInserted', function (e) {
                    that._ghost.parentNode.replaceChild(that._video, that._ghost);
                    //that._video.appendChild(that._ghost);
                }, false);
            }
        }

        function isDescendant(parent, child) {
            var node = child.parentNode;

            while (node != null) {
                if (node == parent) {
                    return true;
                }

                node = node.parentNode;
            }

            return false;
        }

        return PhenixVideo;
    });