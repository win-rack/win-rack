$(document).ready(function(){Body.hasClass("productdetail")&&$.productSpec(),$.fancyboxFunc(),$.updateCaptcha(),$.sendContact(),$.sideNav(),$.sharebtn(),$.ldTip(),$.searchProduct(),$.banner()}),function(t){t.updateCaptcha=function(){t("#captcha").click(function(){var a=new Date;t(this).attr("src","/captcha.php?"+a.getMilliseconds())})}}(jQuery),function(t){function a(){var a="",n=/[\w-]+@([\w-]+\.)+[\w-]+/;return t("input[name='requireField[]']").each(function(){var n=t(this).val();""===t("input[name="+n+"]").val()&&(a+=n+"不可以是空白。\n"),""===t("textarea[name="+n+"]").val()&&(a+=n+"不可以是空白。\n")}),""!==t("#mail").val()&&n.test(t("#mail").val())!==!0&&(a+="信箱格式錯誤。\n"),""===t("input[name=f_d_authcode]").val()?a+="驗證碼不可以是空白。\n":t("#statepic").hasClass("success")||(a+="驗證碼錯誤。\n"),""===a||(alert(a),!1)}function n(){var a={t:"t",f:"d_captcha",f_d_authcode:t("input[name=f_d_authcode]").val()};t.ajax({type:"POST",url:location.pathname,dataType:"json",data:t.param(a),async:!1,beforeSend:function(){t("#state").html("<img src='/templates/images/loading.gif' class='error ajaxloading' style='vertical-align:middle;'>")},success:function(a){"success"==a.state?t("#state").html("<img id='statepic' src='/templates/images/captcha-right.png' class='success' style='vertical-align:middle;'>"):t("#state").html("<img id='statepic' src='/templates/images/captcha-error.png' class='error' style='vertical-align:middle;'>")},timeout:1e4})}t.sendContact=function(){t("#contact-form").submit(function(){return a()}),t("#authcode").blur(function(){n()})}}(jQuery),function(t){function a(){var a={t:"t",f:"d_getspecpanel"};t.ajax({type:"POST",url:window.location.pathname,dataType:"json",data:t.param(a),async:!1,success:function(a){var i=t("<div/>",{"class":"dd"});if(a.inves.length>1||"無規格"!==a.inves[0].spec){var s=t("<ol/>");t.each(a.inves,function(t,a){a.qty>0?(0===s.find("li.current").length&&(d=a.qty),s.append('<li data-inveid="{0}" {2}>{1}</li>'.format(a.id,a.spec,0===s.find("li.current").length?'class="current"':""))):s.append('<li data-inveid="{0}" title="缺貨" data-toggle="tooltip">{1}</li>'.format(a.id,a.spec))}),t("<li/>",{"class":"model"}).append("<b>"+a.lang.specification+"</b>").append(i.clone().attr("id","model-li").append(s)).insertBefore("#shopping-pay-way,#size-info,#shopping-means")}else d=a.inves[0].qty;if(0!==a.open){var o=t("<li><b>"+a.lang.quantity+'</b>                                        <div class="dd">                                            <input type="number" id="quantity" class="input-quantity" value="1" min="1">                                            <b>'+a.lang.inventory+'</b>                                            <span id="inventory"></span>                                        </div>                                    </li>                                    <li>                                        <div class="dd" id="shopping-cart-btns"></div>                                    </li>').insertBefore("#shopping-pay-way,#size-info,#shopping-means");c={quantityInput:o.find("#quantity"),inventory:o.find("#inventory"),cartBtn:o.find("#shopping-cart-btns")},n(a)}e(),i=null}})}function n(t){c.quantityInput.attr("max",d).prop("disabled",0===d),c.inventory.text(d),d>0&&2==t.open?c.cartBtn.html(s.prepare+" "+s.wantTrack):d>0?c.cartBtn.html(s.addCart+" "+s.wantTrack):0===d?c.cartBtn.html(s.empty+" "+s.waitTrack):c.cartBtn.html(s.empty+" "+s.wantTrack)}function e(){t("#main-content").on("click","#add-to-cart",function(){return o.addtoCart(),!1}),t("#main-content").on("click","#add-want-track",function(){return o.addToTrack("want"),!1}),t("#main-content").on("click","#add-wait-track",function(){return o.addToTrack("wait"),!1}),t("#model-li").find("li").click(function(a){var n=t(this);if(!n.hasClass("current"))return i(a),!1})}function i(a){var e;e=void 0===a?t("#model-li li.current").data("inveid"):t(a.target).data("inveid");var i={t:"t",f:"d_getinventory",f_d_invid:e};t.ajax({type:"POST",url:window.location.pathname,dataType:"json",data:t.param(i),async:!1,success:function(e){void 0!==a&&t(a.target).addClass("current").siblings().removeClass("current"),d=e.inventory,n(e)}})}var s={addCart:'<button type="button" id="add-to-cart" class="btn btn-cart"><i class="fa fa-shopping-cart fa-lg"></i> 放入購物車</button>',wantTrack:'<button type="button" id="add-want-track" class="btn btn-default">加入追蹤清單</button>',waitTrack:'<button type="button" id="add-wait-track" class="btn btn-default">加入到貨通知</button>',prepare:'<button type="button" class="btn btn-info" disabled="disabled">商品準備中</button>',empty:'<button type="button" class="btn btn-info" disabled="disabled">商品補貨中</button>'},c={},d=0,o={addtoCart:function(){if(t("#model-1").length>0&&t("#model-1 li.current").length<1)return e7notice("請選取商品規格","error"),!1;var a={t:"t",f:"d_getssluri"};t.ajax({type:"POST",url:window.location.pathname,dataType:"json",data:t.param(a),success:function(a){t("<form/>").attr({method:"POST",action:a.location}).append('<input type="hidden" name="t" value="t">').append('<input type="hidden" name="f" value="d_addtocart">').append('<input type="hidden" name="f_d_invid" value="'+t("#model-li li.current").attr("data-inveid")+'">').append('<input type="hidden" name="f_d_quantity" value="'+t("#quantity").val()+'">').appendTo(document.body).submit()}})},addToTrack:function(a){var n={t:"t",f:"d_addtotrack",f_d_tracktype:a,f_d_invid:t("#model-li li.current").data("inveid")};t.ajax({type:"POST",url:window.location.pathname,dataType:"json",data:t.param(n),async:!1,success:function(a){"success"===a.state?(t("#track-list").find(".badge").text(a.count),e7notice("商品已加入追蹤清單","success")):e7notice(a.error,"error")}})}};t.productSpec=function(){a()},t.extend(t.productSpec,{refreshModels:i})}(jQuery),function(t){t.sideNav=function(){t(".side-content").find(".children").closest("li").prepend("<span></span>").end().end().find(".current").addClass("open").parents("li").addClass("open").end().end().find("span").bind(Mouse.CLICK,function(){t(this).closest("li").toggleClass("open")})}}(jQuery),function(t){t.openQA=function(){t("#inquiry-btn").click(function(){return t("#inquiry-div").toggle(),!1}),t("#close-inquiry-div").click(function(){return t("#inquiry-div").hide(),!1});var a=t("#inquiry-div textarea").val();t("#inquiry-div textarea").focus(function(){t(this).val()==a&&t(this).val("").css("color","#000")}),t("#inquiry-div textarea").blur(function(){""===t(this).val()&&t(this).val(a).css("color","#777")})}}(jQuery),function(t){t.sharebtn=function(){t(".sharebtn").each(function(){t(this).click(function(){return t(this).hasClass("facebook")?window.open("http://www.facebook.com/share.php?u=".concat(encodeURIComponent(location.href))):t(this).hasClass("twitter")?window.open("http://twitter.com/home/?status=".concat(encodeURIComponent(document.title)).concat(" ").concat(encodeURIComponent(location.href))):t(this).hasClass("plurk")&&window.open("http://www.plurk.com/?qualifier=shares&amp;status=".concat(encodeURIComponent(location.href)).concat(" ").concat("(").concat(encodeURIComponent(document.title)).concat(")")),!1})})}}(jQuery),function(t){function a(a){s=t(a.currentTarget);var e=s.prev("input").val();return""===e?alert("請輸入關鍵字"):(s.button("loading"),n(e)),!1}function n(a){var n={t:"t",f:"d_getsearchresult",f_d_keyword:a};t.ajax({type:"POST",url:location.pathname,dataType:"json",data:t.param(n),async:!1,success:function(n){if(s.button("reset"),"success"===n.status)if(c=t("#product-search-modal"),0===c.length&&(c=t('<div id="product-search-modal" class="modal fade">                                        <div class="modal-dialog modal-lg">                                            <div class="modal-content">                                                <div class="modal-header">                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>                                                    <h4 class="modal-title" id="psm-title"></h4>                                                </div>                                                <div class="modal-body">                                                    <div class="container-fluid">                                                        <div class="row">                                                            <div class="col-sm-3">                                                                <div class="list-group" id="psm-menu"></div>                                                            </div>                                                            <div class="col-sm-9 cart-items" id="psm-product">                                                                <div id="psm-products"></div>                                                                <div id="psm-pagein"></div>                                                            </div>                                                        </div>                                                    </div>                                                </div>                                            </div>                                        </div>                                    </div>'),c.appendTo("body"),c.find("#psm-pagein").on("page",i),c.on("hidden.bs.modal",function(t){console.log(t),o=[]})),c.find("#psm-title").html('「<b class="text-primary">{0}</b>」的搜尋結果 <small>共 <b class="text-success">{1}</b> 筆資料</small>'.format(a,n.count)),n.count>0){var d='<a href="#" class="list-group-item active" data-cid="all"><span class="badge">{0}</span>所有分類</a>'.format(n.count),r=[];t.each(n.cates,function(t,a){d+='<a href="#" class="list-group-item" data-cid="{0}"><span class="badge">{1}</span>{2}</a>'.format(a.id,a.count,a.name),r=r.concat(a.products)}),c.find("#psm-menu").html("").append(d).find("a").each(function(a,i){t(i).on("click",function(){if(!t(this).hasClass("active")){t(this).addClass("active").siblings().removeClass("active");var a=this.getAttribute("data-cid");e("all"===a?r:n.cates[a].products)}return!1})}),e(r),c.modal()}else c.find("#psm-title").html('「<b class="text-primary">{0}</b>」 查無此產品'.format(a,n.count)),c.find(".modal-body").html("<p>請嘗試輸入其他的關鍵字</p>"),c.modal();else e7notice(n.message,"error")}})}function e(t){o=t,c.find("#psm-pagein").bootpag({total:Math.ceil(o.length/d),maxVisible:8,page:1,leaps:!0}),c.find("#psm-pagein").trigger("page",1)}function i(a,n){var e=Math.min(n*d,o.length),i={};c.find("#psm-products").html("");for(var s=(n-1)*d;s<e;s++)i=o[s],"2"==i.type?t("<div/>",{"class":"media item"}).append('<div class="media-left img"><a href="{0}"><img src="{1}" class="media-object"></a></div>'.format(i.filename,i.photo)).append('<div class="media-body"><a href="{0}" class="goods-name media-heading">{1}</a><p>{2}</p></div>'.format(i.filename,i.name,i.desc)).append('<div class="media-right pull-right"><span class="single-price price">{0}</div>'.format(i.price)).appendTo(c.find("#psm-products")):t("<div/>",{"class":"media item"}).append('<div class="media-left img"><a href="{0}"><img src="{1}"></a></div>'.format(i.filename,i.photo)).append('<div class="media-body"><a href="{0}" class="goods-name">{1}</a><p>{2}</p></div>'.format(i.filename,i.name,i.desc)).appendTo(c.find("#psm-products"))}var s,c,d=5,o=[];t.searchProduct=function(){t("#product-search").find('[type="submit"]').click(a),t("#rwd-side .product-search").on("click",'[type="submit"]',a)}}(jQuery),function(t){t.banner=function(){bannerGen.initIsPremium(),t("#banner > #banner-flash").length?bannerGen.flash():t("#banner > #banner-img").length&&bannerGen.swiper()}}(jQuery);