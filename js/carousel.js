/*
	20160204
	简易的Carousel插件基于jQuery
	参数说明
		cWidth：插件宽度；cHeight：插件高度；
		width：第一张图片的宽度，数值需小于cWidth；
		height：第一张图片的高度，数值需小于cHeight；*width与height比例需与图片自身宽高比例一致
		speed：图片移动的速度；
		verticalAlign：对齐方式 top、middle、bottom（传入值错误则默认top）；
		isAutoPlay：是否自动播放下一张图片；
		delay：自动播放的时间间隔；
		scale：图片间的缩放比例，数值为正数且需小于1。
 */
;(function($){
	var Carousel = function(carousel){

		this.carousel = carousel;
		this.picsList = carousel.find("ul.carousel-list");
		this.firstPic = carousel.find("ul.carousel-list li.carousel-item").first();
		this.lastPic = carousel.find("ul.carousel-list li.carousel-item").last();
		this.btns = carousel.find("div.carousel-btn");
		this.prevBtn = carousel.find("div.carousel-prev-btn");
		this.nextBtn = carousel.find("div.carousel-next-btn");
		this.pics = carousel.find("li.carousel-item");
		this.isMoving = false;
		

		var _this_ = this;

		// 插件默认参数
		this.setting = {
			cWidth : 900,
			cHeight : 500,
			width : 700,
			height : 600,
			speed : 700,
			verticalAlign : "middle",
			isAutoPlay : true,
			delay : 1000,
			scale : 0.6
		};

		// 获取用户参数
		this.setting = this.getParams();
		// 生效Carousel结构参数：按钮参数和最前一张图的参数
		this.setPositions();
		// 生效Carousel剩余图片的参数
		this.setRestPics();
		// 添加按钮点击事件
		this.prevBtn.click(function(){
			if(_this_.isMoving == false){
				_this_.isMoving = true;
				_this_.picsMove("right");
			}
		});
		this.nextBtn.click(function(){
			if(_this_.isMoving == false){
				_this_.isMoving = true;
				_this_.picsMove("left");
			}
		});
		// 判断是否自动展示下一张图片
		if(this.setting.isAutoPlay){
			this.setIsAutoPlay();
			this.carousel.hover(function(){
				_this_.btns.show();
				window.clearInterval(_this_.timer);
			},function(){
				_this_.btns.hide();
				_this_.setIsAutoPlay();
			});
		}
		// 按钮icon
		this.carousel.hover(function(){
			_this_.btns.show();
		},function(){
			_this_.btns.hide();
		});


	};

	Carousel.prototype = {
		getParams : function(){
			var finalParams = this.setting;
			try{
				var userParams = $.parseJSON(this.carousel.attr("data-setting"));
				finalParams = $.extend(this.setting,userParams);
			}catch(e){
				console.error("Carousel插件：data-setting解析为JSON对象时错误。");
			}
			return finalParams;
		},
		setPositions : function(){
			var topZIndex = Math.floor(this.pics.size()/2),
				btnWidth = Math.ceil((this.setting.cWidth - this.setting.width)/2),
				btnHeight = this.setting.cHeight;

			// 生效最外层框架
			this.carousel.css({
				width : this.setting.cWidth,
				height : this.setting.cHeight
			});
			// 生效放置图片的ul参数
			this.picsList.css({
				width : this.setting.cWidth,
				height : this.setting.cHeight
			});
			// 生效按钮参数
			this.prevBtn.css({
				width : btnWidth,
				height : btnHeight,
				zIndex : topZIndex,
				top : 0,
				right : 0
			});
			this.nextBtn.css({
				width : btnWidth,
				height : btnHeight,
				zIndex : topZIndex,
				top : 0,
				right : 0
			});
			// 生效最前位置的图片（第一张图片）参数
			this.firstPic.css({
				width : this.setting.width,
				height : this.setting.height,
				zIndex : topZIndex,
				left : btnWidth,
				top : this.getPicsTop(this.setting.height)
			});

		},
		setRestPics : function(){
			var _this_ = this,
				restPics = this.pics.slice(1),// 除去第一张图片
				amount = this.pics.size(),// 图片总数根据奇偶差别，布局不同
				gapWidth = (this.setting.cWidth - this.setting.width)/2/(Math.floor(restPics.size()/2)),// 剩余单张图片露出的宽度
				scale = this.setting.scale,
				zIndex = Math.floor(this.pics.size()/2),
				opacityDifference = 1/Math.ceil(this.pics.size()/2),// 透明度差值
				width = this.setting.width,// 图片宽度，初始值是第一张图的宽
				height = this.setting.height,
				btnWidth = Math.ceil((this.setting.cWidth - this.setting.width)/2),
				leftPics,rightPics,leftFirstPic,hiddenPic;
				
			if(amount%2 != 0 ){// 奇数
				rightPics = restPics.slice(0,restPics.size()/2);
				leftPics = restPics.slice(restPics.size()/2);
				
			} else{// 偶数
				rightPics = restPics.slice(0,Math.floor(restPics.size()/2));
				hiddenPic = restPics.slice(Math.floor(restPics.size()/2),Math.floor(restPics.size()/2)+1);
				leftPics = restPics.slice(Math.floor(restPics.size()/2)+1);
			}

			// 生效左右图片参数
			rightPics.each(function(i){
				width = width*scale;
				height = height*scale;
				zIndex--;
				$(this).css({
					width : width,
					height : height,
					zIndex : zIndex,
					opacity : 1 - (i+1)*opacityDifference,
					left : btnWidth + _this_.setting.width + gapWidth*(i+1) - width,
					top : _this_.getPicsTop(height)
				});
			});
			leftFirstPic = rightPics.last();
			width = leftFirstPic.width();
			height = leftFirstPic.height();
			opacity = Number((leftFirstPic.css("opacity")-0).toFixed(2));
			leftPics.each(function(i){
				$(this).css({
					width : width,
					height : height,
					zIndex : i,
					opacity : opacity + i*opacityDifference,
					left : i*gapWidth,
					top : _this_.getPicsTop(height)
				});
				width = width/scale;
				height = height/scale;
			});
			// 总图片为偶数时，将restPics里，正中间一张图置于看不见的位置
			if(amount%2 == 0 ){
				hiddenPic.css({
					width : leftFirstPic.width(),
					height : leftFirstPic.height(),
					zIndex : 0,
					opacity : Number((leftFirstPic.css("opacity")-0).toFixed(2)),
					left : _this_.firstPic.css("left"),
					top : _this_.getPicsTop(leftFirstPic.height())
				});
			}
		},
		// 图片移动逻辑
		picsMove : function(dir){
			var _this_ = this,
				zIndexArr = [],
				nextPic,prevPic;
			
			if(dir == "right"){
				this.pics.each(function(){
					nextPic = $(this).next().size() ? $(this).next() : $(_this_.pics[0]);
					zIndexArr.push(nextPic.css("zIndex"));
				});
				this.pics.each(function(i){
					nextPic = $(this).next().size() ? $(this).next() : $(_this_.pics[0]);
					$(this).animate({
						width : nextPic.css("width"),
						height : nextPic.css("height"),
						opacity : nextPic.css("opacity"),
						left : nextPic.css("left"),
						top : nextPic.css("top")
					},_this_.setting.speed,function(){
						_this_.isMoving = false;
					}).css({
						zIndex : zIndexArr[i]
					});
				});
			} else if(dir == "left"){
				this.pics.each(function(){
					prevPic = $(this).prev().size() ? $(this).prev() : _this_.pics.last();
					zIndexArr.push(prevPic.css("zIndex"));
				});
				this.pics.each(function(i){
					prevPic = $(this).prev().size() ? $(this).prev() : _this_.pics.last();
					$(this).animate({
						width : prevPic.css("width"),
						height : prevPic.css("height"),
						opacity : prevPic.css("opacity"),
						left : prevPic.css("left"),
						top : prevPic.css("top")
					},_this_.setting.speed,function(){
						_this_.isMoving = false;
					}).css({
						zIndex : zIndexArr[i]
					});
				});
			}
		},
		// 根据verticalAlign获取图片的top值
		getPicsTop : function(height){
			var verticalAlign = this.setting.verticalAlign;
			if(verticalAlign == "middle"){
				return (this.setting.cHeight - height)/2;
			} else if(verticalAlign == "top"){
				return 0;
			} else if(verticalAlign == "bottom"){
				return this.setting.cHeight - height;
			} else {
				return 0;// 如果传入的参数非定义值，则默认为顶部对齐
			}
		},
		// 自动展示下一张图片逻辑
		setIsAutoPlay : function(){
			var _this_ = this;
			this.timer = window.setInterval(function(){
				_this_.nextBtn.click();
			},_this_.setting.delay);
		}
	};
	
	// 批量初始化
	Carousel.init = function(carousels){
		var _this_ = this;
		carousels.each(function(){
			new _this_($(this));
		});
	};

	window.Carousel = Carousel;
})(jQuery);