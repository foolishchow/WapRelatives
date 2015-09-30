
;var SERVE = SERVE || {};
SERVE.com = (function(){
  
    //输入获取焦点文字消失
    var textShow = function (text,defVal) {
        $(text).each(function(){
            var _defVal = defVal || document.querySelector(text).defaultValue;
                $(this).focus(function(){
                var v = $.trim($(this).val());
                if(v == _defVal){
                    $(this).val("").css("color","#333");
                }else if(_defVal == undefined){
                    $(this).css("color","#333");
                }
            });
            $(this).blur(function(){
                var v = $.trim($(this).val());
                if(v == "" || v == _defVal){
                    $(this).val(_defVal).css("color","#999");
                }else if(_defVal == undefined){
                    $(this).css("color","#999");
                }
            });
        });
    };

    //输入文本控制
    var codeCount = function(o,c,t,n){
        $(o).keyup(function(){
            var _v = $.trim($(this).val());
            var _l = _v.length;
            if(_l > n){
                _l = n;
                $(this).val(_v.substring(0,_l));
            }
            $(c).find(t).html(_l);
        });
    };
   

    // 选项卡
    var tab = function (options) {
        var def = {selector: null, start: 0, event: "click", delay: 200, selected: ".selected", callback: $.noop};
        var args = arguments[0];
        if (!args || !(typeof(args) == "object" && Object.prototype.toString.call(args).toLowerCase() == "[object object]" && !args.length)) {
            return $.error("tab: 参数必须为JSON格式")
        }
        $.extend(def, options);
        def.selected = def.selected.replace(/^\./, "");
        var tab = function (idArray, tagRel, handle) {
            tagRel.removeClass(def.selected);
            handle.addClass(def.selected);
            $(idArray.join(",")).hide();
            var thisTagRel = handle.attr("rel");
            $(thisTagRel).show();
            def.callback.apply(this, [thisTagRel.split('#')[1]])
        };
        var tabWrap = $(def.selector);
        var numIndex = !!(typeof def.start === "number");
        tabWrap.each(function () {
            var T = $(this);
            var _id = [], container, display, tagRel = T.children("[rel^='#']");
            if (tagRel.size() == 0) {
                return true
            }
            tagRel.removeClass(def.selected);
            for (var i = 0; i < tagRel.length; i++) {
                var rel = tagRel.eq(i).attr("rel");
                _id.push(rel);
                if (numIndex && def.start == i) {
                    display = $(rel);
                    tagRel.eq(i).addClass(def.selected);
                }
            }
            if (!numIndex) {
                display = $(def.start);
                T.children("[rel^='" + def.start + "']").addClass(def.selected)
            }
            container = $(_id.join(","));
            container.not($(display)).hide();
            display.show();
            def.callback.apply(this, [display.attr("id")]);
            var timer, isDelay = (/^mouseover|mouseout|mouseleave|mouseenter$/.test(def.event));
            if (!isDelay) {
                def.delay = 15
            } else {
                tagRel.bind("mouseout", function () {
                    clearTimeout(timer);
                });
            }
            tagRel.bind(def.event, function () {
                var _this = $(this);
                var thisTagRel = _this.attr("rel");
                clearTimeout(timer);
                timer = setTimeout(function () {
                    tab(_id, tagRel, _this)
                }, def.delay);
            });
        })		
    };
	

   
    //打开弹出框
    var popupbox = function(popbox,callback){
        var _this = $(popbox);
        var w = _this.outerWidth();
		var h = _this.outerHeight();
		var pop_w = document.documentElement.clientWidth;
		var pop_h = document.documentElement.clientHeight;
		//判断弹出框高度，不超过浏览器高度
		var popboxH = parseInt(_this.outerHeight());
//		if(popboxH>parseInt(pop_h)){
//			_this.addClass("pop-scroll");
//			_this.find(".pop-box-main").height(pop_h-90);
//		}else{
//			_this.removeClass("pop-scroll");
//			_this.find(".pop-box-main").height("auto");
//		}
		
		var h = _this.outerHeight();
        var l = Math.round((pop_w - w) / 2 + document.documentElement.scrollLeft);
        var t = Math.round((pop_h - h) / 2);
		
        _this.css({"top":t,"left":l});
        var cover = parent.document.createElement("div");
		var cw = $(document).width();
		var ch = $(document).height();
        cover.id = "cover";
		cover.style.width = cw+"px";
		cover.style.height = ch + "px";
        cover.innerHTML = '<iframe id="if" name="if" style="position:absolute;top:-5px;left:0;border:none;width:100%;height:100%;background:#666666;filter:alpha(opacity=0);" ></iframe>';
		
        $(window).resize(function(){
			if(_this.hasClass("pop-edit-pic")){
				var thisH = _this.height();
				_this.find(".cut-pic .pic").height(thisH-200);
			}
			var pop_w = document.documentElement.clientWidth;
			var pop_h = document.documentElement.clientHeight;
			var l = Math.round((pop_w - w) / 2 + document.documentElement.scrollLeft);
			//判断弹出框高度，不超过浏览器高度
			var popboxH = parseInt(_this.outerHeight());
//			if(popboxH>parseInt(pop_h)){
//				_this.addClass("pop-scroll");
//				_this.find(".pop-box-main").height(pop_h-90);
//			}else{
//				_this.removeClass("pop-scroll");
//				_this.find(".pop-box-main").height("auto");
//			}
			var h = _this.outerHeight();
			
			var t = Math.round((pop_h - h) / 2);
			_this.css({"top":t,"left":l});
            var ncw = $(document).width();
            var nch = $(document).height();
            cover.style.width = ncw+"px";
			cover.style.height = nch + "px";
        })
		
        var lhtml = document.body.appendChild(cover);
		if($(".JS_btnYellow").length==1){
			$("#cover").animate({opacity:0.4}, 200, function() {
				var _thisCover = $("#cover");
				_this.show();
				_this.css({"z-index":1002});
				_thisCover.css('z-index',1001);
				_thisCover.addClass("coverLayer");
                if(callback){
                    callback();
                }
			})
		}else{
			$("#cover").animate({opacity:0.4}, 200, function() {
				_this.show();
                if(callback){
                    callback();
                }
			})
		}

    };
	
    var closebox = function(popup){
		$("#cover").remove();
		$(popup).hide();
    };
	
    return {
        textShow:textShow,
        popupbox:popupbox,
        closebox:closebox,
        codeCount:codeCount,
		tab:tab
    };
})(jQuery);


$(function(){
    SERVE.com.textShow('.placeholder');
});
