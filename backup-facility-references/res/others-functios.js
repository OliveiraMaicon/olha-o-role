var WM = {

    // Load Modules
    init : function() {
        WM.tabs.init(); // Tabs
        WM.wmCollapse.init(); // Collapse DOM Object
    },

    tabs : {

        init : function() {
            $('.show-first-tab').click(function() {
                // location.reload();
            })
        },

        toggle : function(tab) {
            $('.content-tabs').hide();
            $('.tabs').removeClass('active');
            $('#' + tab).addClass('active');
            $('.' + tab).show();
        },

        showFirstTab : function() {
            $('.content-tabs').hide();
            $('.content-tabs:first').show();
        }
    },

    /* ############################################################################# */
    /* # Module - Pagination # */
    /* ############################################################################# */
    pagination : {

        // TODO - Inicializing the pagination module, this module will make all
        // functions about the pagination
        init : function(object, scope) {
            // scope.maxSize = WM.pagination.getLimitPage();
            // scope.currentPage = 1;
            var index = 1; // Index equals 1 means we have showing the first
                            // page of our pagination
            var limitPage = 5 // Items of the data list displayed on the page,
                                // actually equals 2

            // Changing the selected page, this event is fired when there is a
            // click in a pagination link
            $(".pagValue").click(function() {
                WM.pagination.changeActiveLink($(this), limitPage);
                WM.pagination.goToPage($(this), object, limitPage);
            });

            // organiza a lista para o inicio da paginação
            $(".first").click(function() {
                WM.pagination.goToFirstPage($(this), object, limitPage);
            });

            // organiza a lista para o final da paginação
            $(".last").click(function() {
                WM.pagination.goToLastPage($(this), object, limitPage);
            });

        },

        buildPage : function(object, limitPage, index) {

            // Get value of index, if it wasn't declaire, the value must be 1
            index = (typeof (index) == 'undefined') ? 1 : index;
            $(object + " tbody tr").each(function() {
                // Get in the whole list
                (index <= limitPage) ? $(this).show() : $(this).hide(); // Set
                                                                        // as
                                                                        // visible
                                                                        // only
                                                                        // the
                                                                        // first
                                                                        // page,
                                                                        // the
                                                                        // limit
                                                                        // of
                                                                        // the
                                                                        // result
                                                                        // page
                                                                        // it
                                                                        // was
                                                                        // defined
                                                                        // at
                                                                        // the
                                                                        // variable
                                                                        // "limitPage"
                index++; // Increment the index
            });
        },

        goToPage : function(link, object, limitPage) {

            var value = link.text();
            var indexShow = limitPage * (value - 1) + 1;
            var endShow = limitPage * value;
            var count = 1;

            $(object + " tbody tr").each(
                    function() {
                        if (count == indexShow
                                || (count > indexShow && count <= endShow)) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                        count++;
                    });
        },

        changeActiveLink : function(object) {

            var value = object.text(); // Link clicked by the user
            var firstPage = "1"; // First value of the pagination
            var lastPage = $('.pagValue').length; // Last value of the
                                                    // pagination

            // This will verify if the link that is active it's the first one,
            // if it's, then the first button will be disabled
            (value != firstPage) ? $(".first").removeClass("disabled") : $(
                    ".first").addClass("disabled");

            // This will verify if the link that is active it's the last one, if
            // it's, then the last button will be disabled
            (value != lastPage) ? $(".last").removeClass("disabled") : $(
                    ".last").addClass("disabled");

            $(".active").removeClass("active"); // Removing class "active" of
                                                // the links
            object.parent("li").addClass("active"); // Then set as "active" just
                                                    // the link that was
                                                    // selected

        },

        goToFirstPage : function(link, object, limitPage) {

            // Building the first page
            WM.pagination.buildPage(object, limitPage);

        },

        goToLastPage : function(link, object, limitPage) {

            var value = $('.pagValue').length; // Count the elements from the
                                                // pagination
            var indexShow = limitPage * (value - 1) + 1;
            var endShow = limitPage * value;
            var count = 1;

            // Building the last page
            // WM.pagination.buildPage(object, limitPage);

            $(object + " tbody tr").each(
                    function() {
                        if (count == indexShow
                                || (count > indexShow && count <= endShow)) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                        count++;
                    });
        },

        getLimitPage : function(paginate) {
            if (paginate == false) {
                var limitPage = Infinity;
                return limitPage;
            } else {
                var limitPage = 5;
                return limitPage;
            }
        }
    },

    wmCollapse : {

        init : function() {

            $('.wm-collapse .title').click(function() {
                WM.wmCollapse.collapse($(this));
            });

        },

        collapse : function(object) {

            object.siblings('.content').slideToggle();

        }

    }
}

$(document).ready(function() {

    $(document).tooltip({
        position : {
            my : 'left+5 center',
            at : 'right+5 center'
        }
    });

    // Load all functions, controllers, etc... of the entire site

    WM.init();

    // define menu header ativo baseado na url
    var url = window.location.href;

    $("#header .navbar-nav a").each(function() {
        if (url == (this.href)) {
            $(this).addClass("ativo");
        }
    });
    
    $(".datetime").mask("00/00/0000");

    // define imagem orderby table
    $(".wm-table thead th").click(function() {

        if ($(this).hasClass("order-desc")) {
            $(this).removeClass("order-desc");
        } else {
            $(".wm-table thead th").removeClass("order-desc");
            $(this).addClass("order-desc");
        }

    });

});


$(function () {
    $('.list-group.checked-list-box .list-group-item').each(function () {
        
        // Settings
        var $widget = $(this),
            $checkbox = $('<input type="checkbox" class="hidden" />'),
            color = ($widget.data('color') ? $widget.data('color') : "primary"),
            style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };
            
        $widget.css('cursor', 'pointer')
        $widget.append($checkbox);

        // Event Handlers
        $widget.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });
          

        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $widget.addClass(style + color + ' active');
            } else {
                $widget.removeClass(style + color + ' active');
            }
        }

        // Initialization
        function init() {
            
            if ($widget.data('checked') == true) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            }
            
            updateDisplay();

            // Inject the icon if applicable
            if ($widget.find('.state-icon').length == 0) {
                $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
            }
        }
        init();
    });
    
    $('#get-checked-data').on('click', function(event) {
        event.preventDefault(); 
        var checkedItems = {}, counter = 0;
        $("#check-list-box li.active").each(function(idx, li) {
            checkedItems[counter] = $(li).text();
            counter++;
        });
        $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
    });
});



//jQuery Mask Plugin v1.6.5
//github.com/igorescobar/jQuery-Mask-Plugin
(function(g){"function"===typeof define&&define.amd?define(["jquery"],g):g(window.jQuery||window.Zepto)})(function(g){var z=function(b,f,d){var l=this,x,y;b=g(b);f="function"===typeof f?f(b.val(),void 0,b,d):f;l.init=function(){d=d||{};l.byPassKeys=[9,16,17,18,36,37,38,39,40,91];l.translation={0:{pattern:/\d/},9:{pattern:/\d/,optional:!0},"#":{pattern:/\d/,recursive:!0},A:{pattern:/[a-zA-Z0-9]/},S:{pattern:/[a-zA-Z]/}};l.translation=g.extend({},l.translation,d.translation);l=g.extend(!0,{},l,d);y=
c.getRegexMask();b.each(function(){!1!==d.maxlength&&b.attr("maxlength",f.length);d.placeholder&&b.attr("placeholder",d.placeholder);b.attr("autocomplete","off");c.destroyEvents();c.events();var a=c.getCaret();c.val(c.getMasked());c.setCaret(a+c.getMaskCharactersBeforeCount(a,!0))})};var c={getCaret:function(){var a;a=0;var e=b.get(0),c=document.selection,e=e.selectionStart;if(c&&!~navigator.appVersion.indexOf("MSIE 10"))a=c.createRange(),a.moveStart("character",b.is("input")?-b.val().length:-b.text().length),
a=a.text.length;else if(e||"0"===e)a=e;return a},setCaret:function(a){if(b.is(":focus")){var e;e=b.get(0);e.setSelectionRange?e.setSelectionRange(a,a):e.createTextRange&&(e=e.createTextRange(),e.collapse(!0),e.moveEnd("character",a),e.moveStart("character",a),e.select())}},events:function(){b.on("keydown.mask",function(){x=c.val()});b.on("keyup.mask",c.behaviour);b.on("paste.mask drop.mask",function(){setTimeout(function(){b.keydown().keyup()},100)});b.on("change.mask",function(){b.data("changeCalled",
!0)});b.on("blur.mask",function(a){a=g(a.target);a.prop("defaultValue")!==a.val()&&(a.prop("defaultValue",a.val()),a.data("changeCalled")||a.trigger("change"));a.data("changeCalled",!1)});b.on("focusout.mask",function(){d.clearIfNotMatch&&!y.test(c.val())&&c.val("")})},getRegexMask:function(){var a=[],e,b,c,d,k;for(k in f)(e=l.translation[f[k]])?(b=e.pattern.toString().replace(/.{1}$|^.{1}/g,""),c=e.optional,(e=e.recursive)?(a.push(f[k]),d={digit:f[k],pattern:b}):a.push(c||e?b+"?":b)):a.push("\\"+
f[k]);a=a.join("");d&&(a=a.replace(RegExp("("+d.digit+"(.*"+d.digit+")?)"),"($1)?").replace(RegExp(d.digit,"g"),d.pattern));return RegExp(a)},destroyEvents:function(){b.off("keydown.mask keyup.mask paste.mask drop.mask change.mask blur.mask focusout.mask").removeData("changeCalled")},val:function(a){var e=b.is("input");return 0<arguments.length?e?b.val(a):b.text(a):e?b.val():b.text()},getMaskCharactersBeforeCount:function(a,e){for(var b=0,c=0,d=f.length;c<d&&c<a;c++)l.translation[f.charAt(c)]||(a=
e?a+1:a,b++);return b},determineCaretPos:function(a,b,d,h){return l.translation[f.charAt(Math.min(a-1,f.length-1))]?Math.min(a+d-b-h,d):c.determineCaretPos(a+1,b,d,h)},behaviour:function(a){a=a||window.event;var b=a.keyCode||a.which;if(-1===g.inArray(b,l.byPassKeys)){var d=c.getCaret(),f=c.val(),n=f.length,k=d<n,p=c.getMasked(),m=p.length,q=c.getMaskCharactersBeforeCount(m-1)-c.getMaskCharactersBeforeCount(n-1);p!==f&&c.val(p);!k||65===b&&a.ctrlKey||(8!==b&&46!==b&&(d=c.determineCaretPos(d,n,m,q)),
c.setCaret(d));return c.callbacks(a)}},getMasked:function(a){var b=[],g=c.val(),h=0,n=f.length,k=0,p=g.length,m=1,q="push",s=-1,r,u;d.reverse?(q="unshift",m=-1,r=0,h=n-1,k=p-1,u=function(){return-1<h&&-1<k}):(r=n-1,u=function(){return h<n&&k<p});for(;u();){var v=f.charAt(h),w=g.charAt(k),t=l.translation[v];if(t)w.match(t.pattern)?(b[q](w),t.recursive&&(-1===s?s=h:h===r&&(h=s-m),r===s&&(h-=m)),h+=m):t.optional&&(h+=m,k-=m),k+=m;else{if(!a)b[q](v);w===v&&(k+=m);h+=m}}a=f.charAt(r);n!==p+1||l.translation[a]||
b.push(a);return b.join("")},callbacks:function(a){var e=c.val(),g=c.val()!==x;if(!0===g&&"function"===typeof d.onChange)d.onChange(e,a,b,d);if(!0===g&&"function"===typeof d.onKeyPress)d.onKeyPress(e,a,b,d);if("function"===typeof d.onComplete&&e.length===f.length)d.onComplete(e,a,b,d)}};l.remove=function(){var a=c.getCaret(),b=c.getMaskCharactersBeforeCount(a);c.destroyEvents();c.val(l.getCleanVal()).removeAttr("maxlength");c.setCaret(a-b)};l.getCleanVal=function(){return c.getMasked(!0)};l.init()};
g.fn.mask=function(b,f){this.unmask();return this.each(function(){g(this).data("mask",new z(this,b,f))})};g.fn.unmask=function(){return this.each(function(){try{g(this).data("mask").remove()}catch(b){}})};g.fn.cleanVal=function(){return g(this).data("mask").getCleanVal()};g("*[data-mask]").each(function(){var b=g(this),f={};"true"===b.attr("data-mask-reverse")&&(f.reverse=!0);"false"===b.attr("data-mask-maxlength")&&(f.maxlength=!1);"true"===b.attr("data-mask-clearifnotmatch")&&(f.clearIfNotMatch=
!0);b.mask(b.attr("data-mask"),f)})});