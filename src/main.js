/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
'use strict';

define('phenix-rtc', [
    'rtc/RTCAdapter',
    'rtc/exportGlobal'
], function (adapter, exportGlobal) {
    adapter.onLoaded = function () {
        exportGlobal(adapter);
    };

    adapter.onLoaded();

    return adapter;
});