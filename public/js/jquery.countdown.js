//JQuery CreatePlugin
!function(){var t=!1;window.JQClass=function(){},JQClass.classes={},JQClass.extend=function e(n){function a(){!t&&this._init&&this._init.apply(this,arguments)}var s=this.prototype;t=!0;var i=new this;t=!1;for(var r in n)i[r]="function"==typeof n[r]&&"function"==typeof s[r]?function(t,e){return function(){var n=this._super;this._super=function(e){return s[t].apply(this,e||[])};var a=e.apply(this,arguments);return this._super=n,a}}(r,n[r]):n[r];return a.prototype=i,a.prototype.constructor=a,a.extend=e,a}}(),function($){function camelCase(t){return t.replace(/-([a-z])/g,function(t,e){return e.toUpperCase()})}JQClass.classes.JQPlugin=JQClass.extend({name:"plugin",defaultOptions:{},regionalOptions:{},_getters:[],_getMarker:function(){return"is-"+this.name},_init:function(){$.extend(this.defaultOptions,this.regionalOptions&&this.regionalOptions[""]||{});var t=camelCase(this.name);$[t]=this,$.fn[t]=function(e){var n=Array.prototype.slice.call(arguments,1);return $[t]._isNotChained(e,n)?$[t][e].apply($[t],[this[0]].concat(n)):this.each(function(){if("string"==typeof e){if("_"===e[0]||!$[t][e])throw"Unknown method: "+e;$[t][e].apply($[t],[this].concat(n))}else $[t]._attach(this,e)})}},setDefaults:function(t){$.extend(this.defaultOptions,t||{})},_isNotChained:function(t,e){return"option"===t&&(0===e.length||1===e.length&&"string"==typeof e[0])?!0:$.inArray(t,this._getters)>-1},_attach:function(t,e){if(t=$(t),!t.hasClass(this._getMarker())){t.addClass(this._getMarker()),e=$.extend({},this.defaultOptions,this._getMetadata(t),e||{});var n=$.extend({name:this.name,elem:t,options:e},this._instSettings(t,e));t.data(this.name,n),this._postAttach(t,n),this.option(t,e)}},_instSettings:function(t,e){return{}},_postAttach:function(t,e){},_getMetadata:function(elem){try{var data=elem.data(this.name.toLowerCase())||"";data=data.replace(/'/g,'"'),data=data.replace(/([a-zA-Z0-9]+):/g,function(t,e,n){var a=data.substring(0,n).match(/"/g);return a&&a.length%2!==0?e+":":'"'+e+'":'}),data=$.parseJSON("{"+data+"}");for(var name in data){var value=data[name];"string"==typeof value&&value.match(/^new Date\((.*)\)$/)&&(data[name]=eval(value))}return data}catch(e){return{}}},_getInst:function(t){return $(t).data(this.name)||{}},option:function(t,e,n){t=$(t);var a=t.data(this.name);if(!e||"string"==typeof e&&null==n){var s=(a||{}).options;return s&&e?s[e]:s}if(t.hasClass(this._getMarker())){var s=e||{};"string"==typeof e&&(s={},s[e]=n),this._optionsChanged(t,a,s),$.extend(a.options,s)}},_optionsChanged:function(t,e,n){},destroy:function(t){t=$(t),t.hasClass(this._getMarker())&&(this._preDestroy(t,this._getInst(t)),t.removeData(this.name).removeClass(this._getMarker()))},_preDestroy:function(t,e){}}),$.JQPlugin={createPlugin:function(t,e){"object"==typeof t&&(e=t,t="JQPlugin"),t=camelCase(t);var n=camelCase(e.name);JQClass.classes[n]=JQClass.classes[t].extend(e),new JQClass.classes[n]}}}(jQuery);


(function ($) {
    var pluginName = "countdown";
    var Y = 0;
    var O = 1;
    var W = 2;
    var D = 3;
    var H = 4;
    var M = 5;
    var S = 6;
    $.JQPlugin.createPlugin({
        name: pluginName,
        defaultOptions: {
            until: null,
            since: null,
            timezone: null,
            serverSync: null,
            format: "dHMS",
            layout: "",
            compact: false,
            padZeroes: false,
            significant: 0,
            description: "",
            expiryUrl: "",
            expiryText: "",
            alwaysExpire: true,
            onExpiry: null,
            onTick: null,
            tickInterval: 1,
        },
        regionalOptions: {
            "": {
                labels: ["y", "m", "w", "d", "h", "m", "s"],
                labels1: ["y", "m", "w", "d", "h", "m", "s"],
                compactLabels: ["y", "m", "w", "d"],
                whichLabels: null,
                digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                timeSeparator: ":",
                isRTL: false,
            },
        },
        _getters: ["getTimes"],
        _rtlClass: pluginName + "-rtl",
        _sectionClass: pluginName + "-section",
        _amountClass: pluginName + "-amount",
        _periodClass: pluginName + "-period",
        _rowClass: pluginName + "-row",
        _holdingClass: pluginName + "-holding",
        _showClass: pluginName + "-show",
        _descrClass: pluginName + "-descr",
        _timerElems: [],
        _init: function () {
            var self = this;
            this._super();
            this._serverSyncs = [];
            var now =
                typeof Date.now == "function"
                    ? Date.now
                    : function () {
                          return new Date().getTime();
                      };
            var perfAvail = window.performance && typeof window.performance.now == "function";
            function timerCallBack(timestamp) {
                var drawStart = timestamp < 1e12 ? (perfAvail ? performance.now() + performance.timing.navigationStart : now()) : timestamp || now();
                if (drawStart - animationStartTime >= 1000) {
                    self._updateElems();
                    animationStartTime = drawStart;
                }
                requestAnimationFrame(timerCallBack);
            }
            var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || null;
            var animationStartTime = 0;
            if (!requestAnimationFrame || $.noRequestAnimationFrame) {
                $.noRequestAnimationFrame = null;
                setInterval(function () {
                    self._updateElems();
                }, 980);
            } else {
                animationStartTime = window.animationStartTime || window.webkitAnimationStartTime || window.mozAnimationStartTime || window.oAnimationStartTime || window.msAnimationStartTime || now();
                requestAnimationFrame(timerCallBack);
            }
        },
        UTCDate: function (tz, year, month, day, hours, mins, secs, ms) {
            if (typeof year == "object" && year.constructor == Date) {
                ms = year.getMilliseconds();
                secs = year.getSeconds();
                mins = year.getMinutes();
                hours = year.getHours();
                day = year.getDate();
                month = year.getMonth();
                year = year.getFullYear();
            }
            var d = new Date();
            d.setUTCFullYear(year);
            d.setUTCDate(1);
            d.setUTCMonth(month || 0);
            d.setUTCDate(day || 1);
            d.setUTCHours(hours || 0);
            d.setUTCMinutes((mins || 0) - (Math.abs(tz) < 30 ? tz * 60 : tz));
            d.setUTCSeconds(secs || 0);
            d.setUTCMilliseconds(ms || 0);
            return d;
        },
        periodsToSeconds: function (periods) {
            return periods[0] * 31557600 + periods[1] * 2629800 + periods[2] * 604800 + periods[3] * 86400 + periods[4] * 3600 + periods[5] * 60 + periods[6];
        },
        _instSettings: function (elem, options) {
            return { _periods: [0, 0, 0, 0, 0, 0, 0] };
        },
        _addElem: function (elem) {
            if (!this._hasElem(elem)) {
                this._timerElems.push(elem);
            }
        },
        _hasElem: function (elem) {
            return $.inArray(elem, this._timerElems) > -1;
        },
        _removeElem: function (elem) {
            this._timerElems = $.map(this._timerElems, function (value) {
                return value == elem ? null : value;
            });
        },
        _updateElems: function () {
            for (var i = this._timerElems.length - 1; i >= 0; i--) {
                this._updateCountdown(this._timerElems[i]);
            }
        },
        _optionsChanged: function (elem, inst, options) {
            if (options.layout) {
                options.layout = options.layout.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            }
            this._resetExtraLabels(inst.options, options);
            var timezoneChanged = inst.options.timezone != options.timezone;
            $.extend(inst.options, options);
            this._adjustSettings(elem, inst, options.until != null || options.since != null || timezoneChanged);
            var now = new Date();
            if ((inst._since && inst._since < now) || (inst._until && inst._until > now)) {
                this._addElem(elem[0]);
            }
            this._updateCountdown(elem, inst);
        },
        _updateCountdown: function (elem, inst) {
            elem = elem.jquery ? elem : $(elem);
            inst = inst || this._getInst(elem);
            if (!inst) {
                return;
            }
            elem.html(this._generateHTML(inst)).toggleClass(this._rtlClass, inst.options.isRTL);
            if ($.isFunction(inst.options.onTick)) {
                var periods = inst._hold != "lap" ? inst._periods : this._calculatePeriods(inst, inst._show, inst.options.significant, new Date());
                if (inst.options.tickInterval == 1 || this.periodsToSeconds(periods) % inst.options.tickInterval == 0) {
                    inst.options.onTick.apply(elem[0], [periods]);
                }
            }
            var expired = inst._hold != "pause" && (inst._since ? inst._now.getTime() < inst._since.getTime() : inst._now.getTime() >= inst._until.getTime());
            if (expired && !inst._expiring) {
                inst._expiring = true;
                if (this._hasElem(elem[0]) || inst.options.alwaysExpire) {
                    this._removeElem(elem[0]);

                    if ($.isFunction(inst.options.onExpiry)) {
                        inst.options.onExpiry.apply(elem[0], []);
                    }
                    if (inst.options.expiryText) {
                        var layout = inst.options.layout;
                        inst.options.layout = inst.options.expiryText;
                        this._updateCountdown(elem[0], inst);
                        inst.options.layout = layout;
                    }
                    if (inst.options.expiryUrl) {
                        window.location = inst.options.expiryUrl;
                    }
                }
                inst._expiring = false;
            } else if (inst._hold == "pause") {
                this._removeElem(elem[0]);
            }
        },
        _resetExtraLabels: function (base, options) {
            for (var n in options) {
                if (n.match(/[Ll]abels[02-9]|compactLabels1/)) {
                    base[n] = options[n];
                }
            }
            for (var n in base) {
                if (n.match(/[Ll]abels[02-9]|compactLabels1/) && typeof options[n] === "undefined") {
                    base[n] = null;
                }
            }
        },
        _adjustSettings: function (elem, inst, recalc) {
            var now;
            var serverOffset = 0;
            var serverEntry = null;
            for (var i = 0; i < this._serverSyncs.length; i++) {
                if (this._serverSyncs[i][0] == inst.options.serverSync) {
                    serverEntry = this._serverSyncs[i][1];
                    break;
                }
            }
            if (serverEntry != null) {
                serverOffset = inst.options.serverSync ? serverEntry : 0;
                now = new Date();
            } else {
                var serverResult = $.isFunction(inst.options.serverSync) ? inst.options.serverSync.apply(elem[0], []) : null;
                now = new Date();
                serverOffset = serverResult ? now.getTime() - serverResult.getTime() : 0;
                this._serverSyncs.push([inst.options.serverSync, serverOffset]);
            }
            var timezone = inst.options.timezone;
            timezone = timezone == null ? -now.getTimezoneOffset() : timezone;
            if (recalc || (!recalc && inst._until == null && inst._since == null)) {
                inst._since = inst.options.since;
                if (inst._since != null) {
                    inst._since = this.UTCDate(timezone, this._determineTime(inst._since, null));
                    if (inst._since && serverOffset) {
                        inst._since.setMilliseconds(inst._since.getMilliseconds() + serverOffset);
                    }
                }
                inst._until = this.UTCDate(timezone, this._determineTime(inst.options.until, now));
                if (serverOffset) {
                    inst._until.setMilliseconds(inst._until.getMilliseconds() + serverOffset);
                }
            }
            inst._show = this._determineShow(inst);
        },
        _preDestroy: function (elem, inst) {
            this._removeElem(elem[0]);
            elem.empty();
        },
        pause: function (elem) {
            this._hold(elem, "pause");
        },
        lap: function (elem) {
            this._hold(elem, "lap");
        },
        resume: function (elem) {
            this._hold(elem, null);
        },
        toggle: function (elem) {
            var inst = $.data(elem, this.name) || {};
            this[!inst._hold ? "pause" : "resume"](elem);
        },
        toggleLap: function (elem) {
            var inst = $.data(elem, this.name) || {};
            this[!inst._hold ? "lap" : "resume"](elem);
        },
        _hold: function (elem, hold) {
            var inst = $.data(elem, this.name);
            if (inst) {
                if (inst._hold == "pause" && !hold) {
                    inst._periods = inst._savePeriods;
                    var sign = inst._since ? "-" : "+";
                    inst[inst._since ? "_since" : "_until"] = this._determineTime(
                        sign +
                            inst._periods[0] +
                            "y" +
                            sign +
                            inst._periods[1] +
                            "o" +
                            sign +
                            inst._periods[2] +
                            "w" +
                            sign +
                            inst._periods[3] +
                            "d" +
                            sign +
                            inst._periods[4] +
                            "h" +
                            sign +
                            inst._periods[5] +
                            "m" +
                            sign +
                            inst._periods[6] +
                            "s"
                    );
                    this._addElem(elem);
                }
                inst._hold = hold;
                inst._savePeriods = hold == "pause" ? inst._periods : null;
                $.data(elem, this.name, inst);
                this._updateCountdown(elem, inst);
            }
        },
        getTimes: function (elem) {
            var inst = $.data(elem, this.name);
            return !inst ? null : inst._hold == "pause" ? inst._savePeriods : !inst._hold ? inst._periods : this._calculatePeriods(inst, inst._show, inst.options.significant, new Date());
        },
        _determineTime: function (setting, defaultTime) {
            var self = this;
            var offsetNumeric = function (offset) {
                var time = new Date();
                time.setTime(time.getTime() + offset * 1000);
                return time;
            };
            var offsetString = function (offset) {
                offset = offset.toLowerCase();
                var time = new Date();
                var year = time.getFullYear();
                var month = time.getMonth();
                var day = time.getDate();
                var hour = time.getHours();
                var minute = time.getMinutes();
                var second = time.getSeconds();
                var pattern = /([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;
                var matches = pattern.exec(offset);
                while (matches) {
                    switch (matches[2] || "s") {
                        case "s":
                            second += parseInt(matches[1], 10);
                            break;
                        case "m":
                            minute += parseInt(matches[1], 10);
                            break;
                        case "h":
                            hour += parseInt(matches[1], 10);
                            break;
                        case "d":
                            day += parseInt(matches[1], 10);
                            break;
                        case "w":
                            day += parseInt(matches[1], 10) * 7;
                            break;
                        case "o":
                            month += parseInt(matches[1], 10);
                            day = Math.min(day, self._getDaysInMonth(year, month));
                            break;
                        case "y":
                            year += parseInt(matches[1], 10);
                            day = Math.min(day, self._getDaysInMonth(year, month));
                            break;
                    }
                    matches = pattern.exec(offset);
                }
                return new Date(year, month, day, hour, minute, second, 0);
            };
            var time = setting == null ? defaultTime : typeof setting == "string" ? offsetString(setting) : typeof setting == "number" ? offsetNumeric(setting) : setting;
            if (time) time.setMilliseconds(0);
            return time;
        },
        _getDaysInMonth: function (year, month) {
            return 32 - new Date(year, month, 32).getDate();
        },
        _normalLabels: function (num) {
            return num;
        },
        _generateHTML: function (inst) {
            var self = this;
            inst._periods = inst._hold ? inst._periods : this._calculatePeriods(inst, inst._show, inst.options.significant, new Date());
            var shownNonZero = false;
            var showCount = 0;
            var sigCount = inst.options.significant;
            var show = $.extend({}, inst._show);
            for (var period = Y; period <= S; period++) {
                shownNonZero |= inst._show[period] == "?" && inst._periods[period] > 0;
                show[period] = inst._show[period] == "?" && !shownNonZero ? null : inst._show[period];
                showCount += show[period] ? 1 : 0;
                sigCount -= inst._periods[period] > 0 ? 1 : 0;
            }
            var showSignificant = [false, false, false, false, false, false, false];
            for (var period = S; period >= Y; period--) {
                if (inst._show[period]) {
                    if (inst._periods[period]) {
                        showSignificant[period] = true;
                    } else {
                        showSignificant[period] = sigCount > 0;
                        sigCount--;
                    }
                }
            }
            var labels = inst.options.compact ? inst.options.compactLabels : inst.options.labels;
            var whichLabels = inst.options.whichLabels || this._normalLabels;
            var showCompact = function (period) {
                var labelsNum = inst.options["compactLabels" + whichLabels(inst._periods[period])];
                return show[period] ? self._translateDigits(inst, inst._periods[period]) + (labelsNum ? labelsNum[period] : labels[period]) + " " : "";
            };
            var minDigits = inst.options.padZeroes ? 2 : 1;
            var showFull = function (period) {
                var labelsNum = inst.options["labels" + whichLabels(inst._periods[period])];
                return (!inst.options.significant && show[period]) || (inst.options.significant && showSignificant[period])
                    ? '<span class="' +
                          self._sectionClass +
                          '">' +
                          '<span class="' +
                          self._amountClass +
                          '">' +
                          self._minDigits(inst, inst._periods[period], minDigits) + (labelsNum ? labelsNum[period] : labels[period]) +
                          "</span></span>"
                    : "";
            };
            return inst.options.layout
                ? this._buildLayout(inst, show, inst.options.layout, inst.options.compact, inst.options.significant, showSignificant)
                : (inst.options.compact
                      ? '<span class="' +
                        this._rowClass +
                        " " +
                        this._amountClass +
                        (inst._hold ? " " + this._holdingClass : "") +
                        '">' +
                        showCompact(Y) +
                        showCompact(O) +
                        showCompact(W) +
                        showCompact(D) +
                        (show[H] ? this._minDigits(inst, inst._periods[H], 2) : "") +
                        (show[M] ? (show[H] ? inst.options.timeSeparator : "") + this._minDigits(inst, inst._periods[M], 2) : "") +
                        (show[S] ? (show[H] || show[M] ? inst.options.timeSeparator : "") + this._minDigits(inst, inst._periods[S], 2) : "")
                      : '<span class="' +
                        this._rowClass +
                        " " +
                        this._showClass +
                        (inst.options.significant || showCount) +
                        (inst._hold ? " " + this._holdingClass : "") +
                        '">' +
                        showFull(Y) +
                        showFull(O) +
                        showFull(W) +
                        showFull(D) +
                        showFull(H) +
                        showFull(M) +
                        showFull(S)) +
                      "</span>" +
                      (inst.options.description ? '<span class="' + this._rowClass + " " + this._descrClass + '">' + inst.options.description + "</span>" : "");
        },
        _buildLayout: function (inst, show, layout, compact, significant, showSignificant) {
            var labels = inst.options[compact ? "compactLabels" : "labels"];
            var whichLabels = inst.options.whichLabels || this._normalLabels;
            var labelFor = function (index) {
                return (inst.options[(compact ? "compactLabels" : "labels") + whichLabels(inst._periods[index])] || labels)[index];
            };
            var digit = function (value, position) {
                return inst.options.digits[Math.floor(value / position) % 10];
            };
            var subs = {
                desc: inst.options.description,
                sep: inst.options.timeSeparator,
                yl: labelFor(Y),
                yn: this._minDigits(inst, inst._periods[Y], 1),
                ynn: this._minDigits(inst, inst._periods[Y], 2),
                ynnn: this._minDigits(inst, inst._periods[Y], 3),
                y1: digit(inst._periods[Y], 1),
                y10: digit(inst._periods[Y], 10),
                y100: digit(inst._periods[Y], 100),
                y1000: digit(inst._periods[Y], 1000),
                ol: labelFor(O),
                on: this._minDigits(inst, inst._periods[O], 1),
                onn: this._minDigits(inst, inst._periods[O], 2),
                onnn: this._minDigits(inst, inst._periods[O], 3),
                o1: digit(inst._periods[O], 1),
                o10: digit(inst._periods[O], 10),
                o100: digit(inst._periods[O], 100),
                o1000: digit(inst._periods[O], 1000),
                wl: labelFor(W),
                wn: this._minDigits(inst, inst._periods[W], 1),
                wnn: this._minDigits(inst, inst._periods[W], 2),
                wnnn: this._minDigits(inst, inst._periods[W], 3),
                w1: digit(inst._periods[W], 1),
                w10: digit(inst._periods[W], 10),
                w100: digit(inst._periods[W], 100),
                w1000: digit(inst._periods[W], 1000),
                dl: labelFor(D),
                dn: this._minDigits(inst, inst._periods[D], 1),
                dnn: this._minDigits(inst, inst._periods[D], 2),
                dnnn: this._minDigits(inst, inst._periods[D], 3),
                d1: digit(inst._periods[D], 1),
                d10: digit(inst._periods[D], 10),
                d100: digit(inst._periods[D], 100),
                d1000: digit(inst._periods[D], 1000),
                hl: labelFor(H),
                hn: this._minDigits(inst, inst._periods[H], 1),
                hnn: this._minDigits(inst, inst._periods[H], 2),
                hnnn: this._minDigits(inst, inst._periods[H], 3),
                h1: digit(inst._periods[H], 1),
                h10: digit(inst._periods[H], 10),
                h100: digit(inst._periods[H], 100),
                h1000: digit(inst._periods[H], 1000),
                ml: labelFor(M),
                mn: this._minDigits(inst, inst._periods[M], 1),
                mnn: this._minDigits(inst, inst._periods[M], 2),
                mnnn: this._minDigits(inst, inst._periods[M], 3),
                m1: digit(inst._periods[M], 1),
                m10: digit(inst._periods[M], 10),
                m100: digit(inst._periods[M], 100),
                m1000: digit(inst._periods[M], 1000),
                sl: labelFor(S),
                sn: this._minDigits(inst, inst._periods[S], 1),
                snn: this._minDigits(inst, inst._periods[S], 2),
                snnn: this._minDigits(inst, inst._periods[S], 3),
                s1: digit(inst._periods[S], 1),
                s10: digit(inst._periods[S], 10),
                s100: digit(inst._periods[S], 100),
                s1000: digit(inst._periods[S], 1000),
            };
            var html = layout;
            for (var i = Y; i <= S; i++) {
                var period = "yowdhms".charAt(i);
                var re = new RegExp("\\{" + period + "<\\}([\\s\\S]*)\\{" + period + ">\\}", "g");
                html = html.replace(re, (!significant && show[i]) || (significant && showSignificant[i]) ? "$1" : "");
            }
            $.each(subs, function (n, v) {
                var re = new RegExp("\\{" + n + "\\}", "g");
                html = html.replace(re, v);
            });
            return html;
        },
        _minDigits: function (inst, value, len) {
            value = "" + value;
            if (value.length >= len) {
                return this._translateDigits(inst, value);
            }
            value = "0000000000" + value;
            return this._translateDigits(inst, value.substr(value.length - len));
        },
        _translateDigits: function (inst, value) {
            return ("" + value).replace(/[0-9]/g, function (digit) {
                return inst.options.digits[digit];
            });
        },
        _determineShow: function (inst) {
            var format = inst.options.format;
            var show = [];
            show[Y] = format.match("y") ? "?" : format.match("Y") ? "!" : null;
            show[O] = format.match("o") ? "?" : format.match("O") ? "!" : null;
            show[W] = format.match("w") ? "?" : format.match("W") ? "!" : null;
            show[D] = format.match("d") ? "?" : format.match("D") ? "!" : null;
            show[H] = format.match("h") ? "?" : format.match("H") ? "!" : null;
            show[M] = format.match("m") ? "?" : format.match("M") ? "!" : null;
            show[S] = format.match("s") ? "?" : format.match("S") ? "!" : null;
            return show;
        },
        _calculatePeriods: function (inst, show, significant, now) {
            inst._now = now;
            inst._now.setMilliseconds(0);
            var until = new Date(inst._now.getTime());
            if (inst._since) {
                if (now.getTime() < inst._since.getTime()) {
                    inst._now = now = until;
                } else {
                    now = inst._since;
                }
            } else {
                until.setTime(inst._until.getTime());
                if (now.getTime() > inst._until.getTime()) {
                    inst._now = now = until;
                }
            }
            var periods = [0, 0, 0, 0, 0, 0, 0];
            if (show[Y] || show[O]) {
                var lastNow = this._getDaysInMonth(now.getFullYear(), now.getMonth());
                var lastUntil = this._getDaysInMonth(until.getFullYear(), until.getMonth());
                var sameDay = until.getDate() == now.getDate() || (until.getDate() >= Math.min(lastNow, lastUntil) && now.getDate() >= Math.min(lastNow, lastUntil));
                var getSecs = function (date) {
                    return (date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds();
                };
                var months = Math.max(0, (until.getFullYear() - now.getFullYear()) * 12 + until.getMonth() - now.getMonth() + ((until.getDate() < now.getDate() && !sameDay) || (sameDay && getSecs(until) < getSecs(now)) ? -1 : 0));
                periods[Y] = show[Y] ? Math.floor(months / 12) : 0;
                periods[O] = show[O] ? months - periods[Y] * 12 : 0;
                now = new Date(now.getTime());
                var wasLastDay = now.getDate() == lastNow;
                var lastDay = this._getDaysInMonth(now.getFullYear() + periods[Y], now.getMonth() + periods[O]);
                if (now.getDate() > lastDay) {
                    now.setDate(lastDay);
                }
                now.setFullYear(now.getFullYear() + periods[Y]);
                now.setMonth(now.getMonth() + periods[O]);
                if (wasLastDay) {
                    now.setDate(lastDay);
                }
            }
            var diff = Math.floor((until.getTime() - now.getTime()) / 1000);
            var extractPeriod = function (period, numSecs) {
                periods[period] = show[period] ? Math.floor(diff / numSecs) : 0;
                diff -= periods[period] * numSecs;
            };
            extractPeriod(W, 604800);
            extractPeriod(D, 86400);
            extractPeriod(H, 3600);
            extractPeriod(M, 60);
            extractPeriod(S, 1);
            if (diff > 0 && !inst._since) {
                var multiplier = [1, 12, 4.3482, 7, 24, 60, 60];
                var lastShown = S;
                var max = 1;
                for (var period = S; period >= Y; period--) {
                    if (show[period]) {
                        if (periods[lastShown] >= max) {
                            periods[lastShown] = 0;
                            diff = 1;
                        }
                        if (diff > 0) {
                            periods[period]++;
                            diff = 0;
                            lastShown = period;
                            max = 1;
                        }
                    }
                    max *= multiplier[period];
                }
            }
            if (significant) {
                for (var period = Y; period <= S; period++) {
                    if (significant && periods[period]) {
                        significant--;
                    } else if (!significant) {
                        periods[period] = 0;
                    }
                }
            }
            return periods;
        },
    });
})(jQuery);