$(document).ready(function() {
    $.topnav.init();
    $.getCounter();
    $.showMsgBox();
});


/**
 * 擴充 topnav
 * $.topnav.init() // 初始化 - 判斷執行那些 ajax fn
 * $.topnav.guestTool()  //工具列
 * $.topnav.cart.init()  //購物車小視窗功能
 */
(function($) {
    function init () {
        if (Body.attr("lang") === "zh-TW") {
            $.topnav.guestTool();
        }
        $.topnav.langToggle();
    }

    // 工具列 (購物車、登入)
    function guestTool () {
        $.topnav.ajax({
            url: "/account/tools/",
            dataType: "html",
            data: $.param({
                t: "t",
                f: "s_guesttools"
            })
        }).done(function (tools) {
            $("#topnav").append(tools);
            $("#topnav").on('click', '#login-btn', function (e) {
                $.NDCLogin.setVirtualHost($(this).attr('href'));
                $.util.addScript('validate', '/templates/js/libs/jquery-validation/dist/jquery.validate.min.js', openLogin);
                return false;
            });
            $.topnav.cart.init();

            // 官網店家管理登入，載入 js 才執行
            if ($('#manager-login-js').length) {
                $.util.addWindowOnLoad(function () {
                    $.topnav.addManagerLogin();
                });
            }
        });
    }

    // 開啟消費者登入
    function openLogin () {
        if ($('#modal-login').length) {
            $('#modal-login').NDCLogin();
        } else {
            $.tplLoader.load('login.html', function (tpl) {
                tpl = tpl.format(
                    $('#logo').html(),
                    $('#logo').text()
                );
                $(tpl).appendTo('body').NDCLogin();
            });
        }
    }

    // 購物車小視窗
    var cart = (function () {
        var itemsTable;
        var cartBadge;

        // badge show or hide
        function setCartBadge (number) {
            // 初始化呼叫用
            if (typeof number === 'undefined') {
                if (parseInt(cartBadge.text()) === 0) {
                    cartBadge.hide();
                } else {
                    cartBadge.show();
                }

            } else if (parseInt(number) === 0) {
                cartBadge.hide();

            } else {
                cartBadge.text(number).show();
            }
        }

        function ajaxShoppingCart() {
            $.ajax({
                type: "POST",
                url: "/shopping/mycart/",
                dataType: "json",
                async: false,
                success: function(cart) {
                    updateCart(cart);
                }
            });
        }

        // 處理購車內容
        function updateCart (cartData) {
            var checkoutBox = $("#dropdown-checkout");
            var totalPrice = checkoutBox.find(".totalprice");
            var checkoutBtn = checkoutBox.children(".start-checkout");
            var cartEmptyStr = '<tr class="text-center"><td>目前沒有購買產品</td></tr>';
            /* jshint multistr: true */
            var cartItemStr = '<tr>\
                <th><a href="/{0}">{1}</a></th>\
                <td>{2}</td>\
                <td> &times;{3}</td>\
                <td class="price">{4}</td>\
                <td class="text-right"><a class="trash-btn" id="{5}" title="從購物車中移除本商品" data-toggle="tooltip" data-container="body"></a></td>\
                </tr>';
            var checkoutBtnStr = '<a href="https://{0}/shopping/cart/" class="start-checkout btn btn-block btn-cart"><i class="fa fa-shopping-cart fa-lg"></i>開始結帳</a>';

            if (cartData.num > 0) {
                itemsTable.html('');
                $.each(cartData.item, function(i, item) {
                    var sum = item.price * item.quantity;
                    $(cartItemStr.format(item.filename, item.name, item.spec, item.quantity, sum, item.id)).appendTo(itemsTable);
                });

                if (!checkoutBtn.length) {
                    checkoutBox.append(checkoutBtnStr.format(window.location.host));
                }

                totalPrice.text(cartData.subtotal);
                setCartBadge(cartData.num);

            } else {
                itemsTable.html(cartEmptyStr);
                if (checkoutBtn.length) {
                    checkoutBtn.remove();
                }
                totalPrice.text('0');
                setCartBadge(0);
            }
        }

        function delItems(btn) {
            var parmas = {
                "t": "t",
                "f": "d_delitems",
                "f_d_invid": btn.attr("id")
            };
            $.ajax({
                type: "POST",
                url: '/ajax/tools/',
                dataType: "json",
                data: $.param(parmas),
                success: function(msg) {
                    if (msg.state == 'success') {
                        ajaxShoppingCart();
                        $.productSpec.refreshModels();
                    } else {
                        e7notice(msg.error, 'error');
                    }
                }
            });
        }

        return {
            init: function () {
                itemsTable = $("#check-table");
                cartBadge = $('#cart-badge');

                // 購車中的移除
                itemsTable.on('click', '.trash-btn', function() {
                    $(this).tooltip('destroy');
                    delItems($(this));
                    return false;
                });

                // 讓購車一直出現
                $.util.addWindowOnLoad(function () {
                    if (parseInt(cartBadge.text()) !== 0) {
                        $('.cart .dropdown-toggle').dropdown('toggle');
                    }
                });

                setCartBadge();
                ajaxShoppingCart();
            }
        };
    }());

    $.extend($.topnav, {
        init: init,
        guestTool: guestTool,
        openLogin: openLogin,
        cart: cart
    });
})(jQuery);


/* 計數器 */
(function($) {
    $.getCounter = function() {
        var parmas = {
            "t": "t",
            "f": "d_counter"
        };
        $.ajax({
            type: "POST",
            url: '/ajax/tools/',
            dataType: "json",
            data: $.param(parmas),
            async: false,
            success: function(msg) {
                $("#counter span").html(msg.visitors);
            }
        });
    };
})(jQuery);


/**
 * webATM plugin 是否有安裝判斷
 * @param Function warning_callback 若未安裝執行的 fn
 */
function webATMPluginDetect (warning_callback) {
    var jsBrowserType = '41';
    switch (navigator.appName) {
        case "Microsoft Internet Explorer" :
            jsBrowserType = '11';
            break;
        default:
            break;
    }

    if (jsBrowserType === '11') //  IE 瀏覽器
    {
        jQuery(document.body).append('<object id="Xcsp" classid="clsid:A6132015-5796-48B5-B776-16D009021D81"></object>');
    }
    else
    {
        jQuery(document.body).append(jQuery('<embed/>', {
            'id': "Xcsp",
            'width': "0",
            'height': "0",
            'classid': "clsid:A6132015-5796-48B5-B776-16D009021D81",
            'type': "application/FCB-WebATM-plugin"
        }));
    }
    var Xcap = document.getElementById('Xcsp');

    try {
        // "已裝妥晶片金融卡安控元件"
        Xcsp.DisconnectCard();
        Xcsp.DisconnectDriver();
    }
    catch (e) {
        // "晶片金融卡安控元件不存在"
        warning_callback("https://eatm.firstbank.com.tw/lio1000s8");
    }
}


/**
 * 選擇付款方式 - fn 模組
 * 使用: $('#fieldset-payway').payway();
 */
(function($) {
    $.fn.payway = function() {
        var submitBtn = this.find('.btn-cart');
        var paywayForm = this.find('form');
        var paramsElem = this.find('.hidden');
        var alertBox;

        // 境外 -財付通
        if (this.find('.form-overseas-payway').length ) {
            getPayParmas( paywayForm.find("input[name='f_s_payment']").val() );
            paywayForm.find("input[name='f_s_payment']").remove();
        } else {
            this.children().on('change', "input[name='f_s_payment']", function (e) {
                getPayParmas($(this).val());

                // webATM 是否安裝
                if ($(this).val() === "4") {
                    var groupPayway = paywayForm.parent('.form-payway');
                    alertBox = groupPayway.prev('.alert');
                    webATMPluginDetect(function (pluginURL) {
                        if (!alertBox.length) {
                            alertBox =  $('<div/>', {
                                'class': 'alert alert-warning fade in',
                                role: 'alert'
                            }).insertBefore(groupPayway);
                        }
                        /* jshint multistr: true */
                        alertBox.html('<i class="fa fa-exclamation-triangle"></i>\
                            你尚未安裝由第一銀行提供的 WebATM 晶片金融卡安控元件，請您先執行 <a href="{0}" target="_blank" class="alert-link">安裝晶片金融卡安控元件</a>\
                            <br>※ 本WebATM尚不支援Firefox、Chrome瀏覽器'.format(pluginURL, 'https://eatm.firstbank.com.tw/lio1000s1?CtlSeqNo=20&naLoginSource=&naPushBranchId=')).alert();
                    });
                } else {
                    if (typeof alertBox !== 'undefined') {
                        alertBox.alert('close');
                    }
                }
            });

            paywayForm.submit(function () {
                if (paywayForm.find("input[name='f_s_payment']:checked").length === 0) {
                    alert('請選擇付款方式');
                    return false;
                }
            });
        }

        function getPayParmas (payment) {
            submitBtn.button('loading');

            var parmas = {
                "t": "t",
                "f": "s_getPayment",
                "f_s_custno": paywayForm.data("custno"),
                "f_s_payment": payment
            };

            $.ajax({
                type: "POST",
                url: '/shopping/payment/',
                dataType: "json",
                data: $.param(parmas),
                async: false,
                success: function(res) {
                    if (res.status == "success") {

                        submitBtn.button('complete');
                        paywayForm.attr("action", res.payment.paypage);

                        paramsElem.empty();
                        $.each(res.payment.parames, function(key, val) {
                            $("<input/>").attr({
                                'type': 'hidden',
                                'name': key,
                                'value': val
                            }).appendTo(paramsElem);
                        });
                    } else {
                        alert(res.message);
                    }
                },
                timeout: 10000
            });
        }
    };
})(jQuery);


/*
* 登入 - 使用 fn 模組
*/
(function($){
    var formAction = {
        login: '/account/login/auth/',
        forgot: '/account/forget/',
        singup: '/account/singup/'
    };
    var redirect = '';
    var host = '';
    var code = '';

    $.NDCLogin = {
        setVirtualHost: function (url) {
            var reg = /(https?\:\/\/|\/\/)?[^\/\s]+\.iyp\.tw/i;
            if (reg.test(url)) {
                host = reg.exec(url)[0] || '';
            }
        },
        setValiCode: function (val) {
            code = '&code=' + val;
        }
    };

    $.fn.NDCLogin = function () {
        var modalOptions = {};
        if (Body.hasClass('login')) {
            modalOptions = {
                keyboard: true,
                backdrop: 'static'
            };
        }

        this.modal(modalOptions);

        if (window.location.pathname !== '/account/login/') {
            redirect = '?redirect=' + host + window.location.pathname + code;
        } else {
            redirect = '?redirect=/account/order/';
        }

        if (typeof $.data(this[0], 'elem') === 'undefined') {
            bindEvent(this[0]);
        }
    };

    function bindEvent (element) {
        $.data(element, 'elem', {
            blockLogin: $(element).find('.block-login'),
            blockForgot: $(element).find('.block-forgot'),
            subblockLogin: $(element).find('.subblock-login'),
            subblockSignup: $(element).find('.subblock-signup'),
            forgetBtn: $(element).find('.link-forgot'),
            cancelBtn: $(element).find('.cancel'),
            linkSignupBtn: $(element).find('.link-signup'),
            backLoginBtn: $(element).find('.back-login'),
            inputAccount: $(element).find('input[name="account"]'),
            inputPasswd: $(element).find('input[name="passwd"]'),
            inputCaptcha: $(element).find('input[name="captcha"]'),
            form: $(element).find('form'),
            isForgot: false,
            isSignup: false
        });

        var formElem = $.data(element, 'elem');

        formElem.form.attr('action', host + formAction.login + redirect);

        formElem.forgetBtn.bind('click', function () {
            formElem.isForgot = true;
            formElem.form.attr('action', host + formAction.forgot + redirect);
            formElem.blockLogin.slideUp('fast');
            formElem.blockForgot.slideDown('fast');
        });

        formElem.cancelBtn.bind('click', function () {
            formElem.isForgot = false;
            formElem.form.attr('action', host + formAction.login + redirect);
            formElem.blockLogin.slideDown('fast');
            formElem.blockForgot.slideUp('fast');
        });

        formElem.linkSignupBtn.bind('click', function () {
            formElem.isSignup = true;
            formElem.form.attr('action', host + formAction.singup + redirect);
            formElem.subblockLogin.slideUp('fast');
            formElem.subblockSignup.slideDown('fast');
        });

        formElem.backLoginBtn.bind('click', function () {
            formElem.isSignup = false;
            formElem.form.attr('action', host + formAction.login + redirect);
            formElem.subblockLogin.slideDown('fast');
            formElem.subblockSignup.slideUp('fast');
        });

        formElem.form.validate({
            rules: {
                account: {
                    required: true,
                    email: true
                },
                passwd: {
                    minlength : 6,
                    required: function () {
                        return !formElem.isForgot;
                    }
                },
                captcha: {
                    required: function () {
                        return formElem.isForgot;
                    }
                },
                passwdagain: {
                    required: function () {
                        return formElem.isSignup;
                    },
                    equalTo: "#passwd"
                },
                agree: {
                    required: function () {
                        return formElem.isSignup;
                    }
                }
            },
            messages: {
                account: {
                    required: "請輸入 email",
                    email: "請輸入正確的 email 格式"
                },
                passwd: {
                    minlength: "請輸入6個以上的英數字元",
                    required: "請輸入密碼"
                },
                captcha: {
                    required: "請輸入驗證碼"
                },
                passwdagain: {
                    required: "請再次輸入密碼",
                    equalTo: "您再次輸入的密碼不相符"
                },
                agree: {
                    required: "您必須同意服務條款"
                }
            },
            highlight: function (element, errorClass, validClass) {
                $(element).parents('.form-group').addClass('has-error');
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).parents('.form-group').removeClass('has-error');
                $(element).next('.help-block').remove();
            },
            errorClass: 'error',
            errorPlacement: function(error, element) {
                var block = $(element).parents('.form-group').children('.help-block');
                if (!block.length) {
                    block = $('<p/>', {
                        'class': 'help-block'
                    }).appendTo(element.parents('.form-group'));
                }
                block.text(error.text());
            },
            submitHandler: function(form) {
                $(form).find('button[type="submit"]').button('loading');
                form.submit();
            }
        });
    }
})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24udHBsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICQudG9wbmF2LmluaXQoKTtcbiAgICAkLmdldENvdW50ZXIoKTtcbiAgICAkLnNob3dNc2dCb3goKTtcbn0pO1xuXG5cbi8qKlxuICog5pO05YWFIHRvcG5hdlxuICogJC50b3BuYXYuaW5pdCgpIC8vIOWIneWni+WMliAtIOWIpOaWt+Wft+ihjOmCo+S6myBhamF4IGZuXG4gKiAkLnRvcG5hdi5ndWVzdFRvb2woKSAgLy/lt6XlhbfliJdcbiAqICQudG9wbmF2LmNhcnQuaW5pdCgpICAvL+izvOeJqei7iuWwj+imlueql+WKn+iDvVxuICovXG4oZnVuY3Rpb24oJCkge1xuICAgIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgICAgICBpZiAoQm9keS5hdHRyKFwibGFuZ1wiKSA9PT0gXCJ6aC1UV1wiKSB7XG4gICAgICAgICAgICAkLnRvcG5hdi5ndWVzdFRvb2woKTtcbiAgICAgICAgfVxuICAgICAgICAkLnRvcG5hdi5sYW5nVG9nZ2xlKCk7XG4gICAgfVxuXG4gICAgLy8g5bel5YW35YiXICjos7znianou4rjgIHnmbvlhaUpXG4gICAgZnVuY3Rpb24gZ3Vlc3RUb29sICgpIHtcbiAgICAgICAgJC50b3BuYXYuYWpheCh7XG4gICAgICAgICAgICB1cmw6IFwiL2FjY291bnQvdG9vbHMvXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJodG1sXCIsXG4gICAgICAgICAgICBkYXRhOiAkLnBhcmFtKHtcbiAgICAgICAgICAgICAgICB0OiBcInRcIixcbiAgICAgICAgICAgICAgICBmOiBcInNfZ3Vlc3R0b29sc1wiXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KS5kb25lKGZ1bmN0aW9uICh0b29scykge1xuICAgICAgICAgICAgJChcIiN0b3BuYXZcIikuYXBwZW5kKHRvb2xzKTtcbiAgICAgICAgICAgICQoXCIjdG9wbmF2XCIpLm9uKCdjbGljaycsICcjbG9naW4tYnRuJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAkLk5EQ0xvZ2luLnNldFZpcnR1YWxIb3N0KCQodGhpcykuYXR0cignaHJlZicpKTtcbiAgICAgICAgICAgICAgICAkLnV0aWwuYWRkU2NyaXB0KCd2YWxpZGF0ZScsICcvdGVtcGxhdGVzL2pzL2xpYnMvanF1ZXJ5LXZhbGlkYXRpb24vZGlzdC9qcXVlcnkudmFsaWRhdGUubWluLmpzJywgb3BlbkxvZ2luKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQudG9wbmF2LmNhcnQuaW5pdCgpO1xuXG4gICAgICAgICAgICAvLyDlrpjntrLlupflrrbnrqHnkIbnmbvlhaXvvIzovInlhaUganMg5omN5Z+36KGMXG4gICAgICAgICAgICBpZiAoJCgnI21hbmFnZXItbG9naW4tanMnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkLnV0aWwuYWRkV2luZG93T25Mb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJC50b3BuYXYuYWRkTWFuYWdlckxvZ2luKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOmWi+WVn+a2iOiyu+iAheeZu+WFpVxuICAgIGZ1bmN0aW9uIG9wZW5Mb2dpbiAoKSB7XG4gICAgICAgIGlmICgkKCcjbW9kYWwtbG9naW4nKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICQoJyNtb2RhbC1sb2dpbicpLk5EQ0xvZ2luKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkLnRwbExvYWRlci5sb2FkKCdsb2dpbi5odG1sJywgZnVuY3Rpb24gKHRwbCkge1xuICAgICAgICAgICAgICAgIHRwbCA9IHRwbC5mb3JtYXQoXG4gICAgICAgICAgICAgICAgICAgICQoJyNsb2dvJykuaHRtbCgpLFxuICAgICAgICAgICAgICAgICAgICAkKCcjbG9nbycpLnRleHQoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgJCh0cGwpLmFwcGVuZFRvKCdib2R5JykuTkRDTG9naW4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g6LO854mp6LuK5bCP6KaW56qXXG4gICAgdmFyIGNhcnQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaXRlbXNUYWJsZTtcbiAgICAgICAgdmFyIGNhcnRCYWRnZTtcblxuICAgICAgICAvLyBiYWRnZSBzaG93IG9yIGhpZGVcbiAgICAgICAgZnVuY3Rpb24gc2V0Q2FydEJhZGdlIChudW1iZXIpIHtcbiAgICAgICAgICAgIC8vIOWIneWni+WMluWRvOWPq+eUqFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1iZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KGNhcnRCYWRnZS50ZXh0KCkpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcnRCYWRnZS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FydEJhZGdlLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQobnVtYmVyKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNhcnRCYWRnZS5oaWRlKCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FydEJhZGdlLnRleHQobnVtYmVyKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhamF4U2hvcHBpbmdDYXJ0KCkge1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3Nob3BwaW5nL215Y2FydC9cIixcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgYXN5bmM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGNhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2FydChjYXJ0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiZleeQhuizvOi7iuWFp+WuuVxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVDYXJ0IChjYXJ0RGF0YSkge1xuICAgICAgICAgICAgdmFyIGNoZWNrb3V0Qm94ID0gJChcIiNkcm9wZG93bi1jaGVja291dFwiKTtcbiAgICAgICAgICAgIHZhciB0b3RhbFByaWNlID0gY2hlY2tvdXRCb3guZmluZChcIi50b3RhbHByaWNlXCIpO1xuICAgICAgICAgICAgdmFyIGNoZWNrb3V0QnRuID0gY2hlY2tvdXRCb3guY2hpbGRyZW4oXCIuc3RhcnQtY2hlY2tvdXRcIik7XG4gICAgICAgICAgICB2YXIgY2FydEVtcHR5U3RyID0gJzx0ciBjbGFzcz1cInRleHQtY2VudGVyXCI+PHRkPuebruWJjeaykuacieizvOiyt+eUouWTgTwvdGQ+PC90cj4nO1xuICAgICAgICAgICAgLyoganNoaW50IG11bHRpc3RyOiB0cnVlICovXG4gICAgICAgICAgICB2YXIgY2FydEl0ZW1TdHIgPSAnPHRyPlxcXG4gICAgICAgICAgICAgICAgPHRoPjxhIGhyZWY9XCIvezB9XCI+ezF9PC9hPjwvdGg+XFxcbiAgICAgICAgICAgICAgICA8dGQ+ezJ9PC90ZD5cXFxuICAgICAgICAgICAgICAgIDx0ZD4gJnRpbWVzO3szfTwvdGQ+XFxcbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwcmljZVwiPns0fTwvdGQ+XFxcbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ0ZXh0LXJpZ2h0XCI+PGEgY2xhc3M9XCJ0cmFzaC1idG5cIiBpZD1cIns1fVwiIHRpdGxlPVwi5b6e6LO854mp6LuK5Lit56e76Zmk5pys5ZWG5ZOBXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgZGF0YS1jb250YWluZXI9XCJib2R5XCI+PC9hPjwvdGQ+XFxcbiAgICAgICAgICAgICAgICA8L3RyPic7XG4gICAgICAgICAgICB2YXIgY2hlY2tvdXRCdG5TdHIgPSAnPGEgaHJlZj1cImh0dHBzOi8vezB9L3Nob3BwaW5nL2NhcnQvXCIgY2xhc3M9XCJzdGFydC1jaGVja291dCBidG4gYnRuLWJsb2NrIGJ0bi1jYXJ0XCI+PGkgY2xhc3M9XCJmYSBmYS1zaG9wcGluZy1jYXJ0IGZhLWxnXCI+PC9pPumWi+Wni+e1kOW4szwvYT4nO1xuXG4gICAgICAgICAgICBpZiAoY2FydERhdGEubnVtID4gMCkge1xuICAgICAgICAgICAgICAgIGl0ZW1zVGFibGUuaHRtbCgnJyk7XG4gICAgICAgICAgICAgICAgJC5lYWNoKGNhcnREYXRhLml0ZW0sIGZ1bmN0aW9uKGksIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1bSA9IGl0ZW0ucHJpY2UgKiBpdGVtLnF1YW50aXR5O1xuICAgICAgICAgICAgICAgICAgICAkKGNhcnRJdGVtU3RyLmZvcm1hdChpdGVtLmZpbGVuYW1lLCBpdGVtLm5hbWUsIGl0ZW0uc3BlYywgaXRlbS5xdWFudGl0eSwgc3VtLCBpdGVtLmlkKSkuYXBwZW5kVG8oaXRlbXNUYWJsZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNoZWNrb3V0QnRuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja291dEJveC5hcHBlbmQoY2hlY2tvdXRCdG5TdHIuZm9ybWF0KHdpbmRvdy5sb2NhdGlvbi5ob3N0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdG90YWxQcmljZS50ZXh0KGNhcnREYXRhLnN1YnRvdGFsKTtcbiAgICAgICAgICAgICAgICBzZXRDYXJ0QmFkZ2UoY2FydERhdGEubnVtKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtc1RhYmxlLmh0bWwoY2FydEVtcHR5U3RyKTtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tvdXRCdG4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrb3V0QnRuLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b3RhbFByaWNlLnRleHQoJzAnKTtcbiAgICAgICAgICAgICAgICBzZXRDYXJ0QmFkZ2UoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkZWxJdGVtcyhidG4pIHtcbiAgICAgICAgICAgIHZhciBwYXJtYXMgPSB7XG4gICAgICAgICAgICAgICAgXCJ0XCI6IFwidFwiLFxuICAgICAgICAgICAgICAgIFwiZlwiOiBcImRfZGVsaXRlbXNcIixcbiAgICAgICAgICAgICAgICBcImZfZF9pbnZpZFwiOiBidG4uYXR0cihcImlkXCIpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6ICcvYWpheC90b29scy8nLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiAkLnBhcmFtKHBhcm1hcyksXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtc2cuc3RhdGUgPT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhamF4U2hvcHBpbmdDYXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkLnByb2R1Y3RTcGVjLnJlZnJlc2hNb2RlbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGU3bm90aWNlKG1zZy5lcnJvciwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaXRlbXNUYWJsZSA9ICQoXCIjY2hlY2stdGFibGVcIik7XG4gICAgICAgICAgICAgICAgY2FydEJhZGdlID0gJCgnI2NhcnQtYmFkZ2UnKTtcblxuICAgICAgICAgICAgICAgIC8vIOizvOi7iuS4reeahOenu+mZpFxuICAgICAgICAgICAgICAgIGl0ZW1zVGFibGUub24oJ2NsaWNrJywgJy50cmFzaC1idG4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b29sdGlwKCdkZXN0cm95Jyk7XG4gICAgICAgICAgICAgICAgICAgIGRlbEl0ZW1zKCQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyDorpPos7zou4rkuIDnm7Tlh7rnj75cbiAgICAgICAgICAgICAgICAkLnV0aWwuYWRkV2luZG93T25Mb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KGNhcnRCYWRnZS50ZXh0KCkpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuY2FydCAuZHJvcGRvd24tdG9nZ2xlJykuZHJvcGRvd24oJ3RvZ2dsZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzZXRDYXJ0QmFkZ2UoKTtcbiAgICAgICAgICAgICAgICBhamF4U2hvcHBpbmdDYXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSgpKTtcblxuICAgICQuZXh0ZW5kKCQudG9wbmF2LCB7XG4gICAgICAgIGluaXQ6IGluaXQsXG4gICAgICAgIGd1ZXN0VG9vbDogZ3Vlc3RUb29sLFxuICAgICAgICBvcGVuTG9naW46IG9wZW5Mb2dpbixcbiAgICAgICAgY2FydDogY2FydFxuICAgIH0pO1xufSkoalF1ZXJ5KTtcblxuXG4vKiDoqIjmlbjlmaggKi9cbihmdW5jdGlvbigkKSB7XG4gICAgJC5nZXRDb3VudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXJtYXMgPSB7XG4gICAgICAgICAgICBcInRcIjogXCJ0XCIsXG4gICAgICAgICAgICBcImZcIjogXCJkX2NvdW50ZXJcIlxuICAgICAgICB9O1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6ICcvYWpheC90b29scy8nLFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgZGF0YTogJC5wYXJhbShwYXJtYXMpLFxuICAgICAgICAgICAgYXN5bmM6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAgICAgJChcIiNjb3VudGVyIHNwYW5cIikuaHRtbChtc2cudmlzaXRvcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkoalF1ZXJ5KTtcblxuXG4vKipcbiAqIHdlYkFUTSBwbHVnaW4g5piv5ZCm5pyJ5a6J6KOd5Yik5pa3XG4gKiBAcGFyYW0gRnVuY3Rpb24gd2FybmluZ19jYWxsYmFjayDoi6XmnKrlronoo53ln7fooYznmoQgZm5cbiAqL1xuZnVuY3Rpb24gd2ViQVRNUGx1Z2luRGV0ZWN0ICh3YXJuaW5nX2NhbGxiYWNrKSB7XG4gICAgdmFyIGpzQnJvd3NlclR5cGUgPSAnNDEnO1xuICAgIHN3aXRjaCAobmF2aWdhdG9yLmFwcE5hbWUpIHtcbiAgICAgICAgY2FzZSBcIk1pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlclwiIDpcbiAgICAgICAgICAgIGpzQnJvd3NlclR5cGUgPSAnMTEnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoanNCcm93c2VyVHlwZSA9PT0gJzExJykgLy8gIElFIOeAj+imveWZqFxuICAgIHtcbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50LmJvZHkpLmFwcGVuZCgnPG9iamVjdCBpZD1cIlhjc3BcIiBjbGFzc2lkPVwiY2xzaWQ6QTYxMzIwMTUtNTc5Ni00OEI1LUI3NzYtMTZEMDA5MDIxRDgxXCI+PC9vYmplY3Q+Jyk7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIGpRdWVyeShkb2N1bWVudC5ib2R5KS5hcHBlbmQoalF1ZXJ5KCc8ZW1iZWQvPicsIHtcbiAgICAgICAgICAgICdpZCc6IFwiWGNzcFwiLFxuICAgICAgICAgICAgJ3dpZHRoJzogXCIwXCIsXG4gICAgICAgICAgICAnaGVpZ2h0JzogXCIwXCIsXG4gICAgICAgICAgICAnY2xhc3NpZCc6IFwiY2xzaWQ6QTYxMzIwMTUtNTc5Ni00OEI1LUI3NzYtMTZEMDA5MDIxRDgxXCIsXG4gICAgICAgICAgICAndHlwZSc6IFwiYXBwbGljYXRpb24vRkNCLVdlYkFUTS1wbHVnaW5cIlxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIHZhciBYY2FwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1hjc3AnKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIFwi5bey6KOd5aal5pm254mH6YeR6J6N5Y2h5a6J5o6n5YWD5Lu2XCJcbiAgICAgICAgWGNzcC5EaXNjb25uZWN0Q2FyZCgpO1xuICAgICAgICBYY3NwLkRpc2Nvbm5lY3REcml2ZXIoKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gXCLmmbbniYfph5Hono3ljaHlronmjqflhYPku7bkuI3lrZjlnKhcIlxuICAgICAgICB3YXJuaW5nX2NhbGxiYWNrKFwiaHR0cHM6Ly9lYXRtLmZpcnN0YmFuay5jb20udHcvbGlvMTAwMHM4XCIpO1xuICAgIH1cbn1cblxuXG4vKipcbiAqIOmBuOaTh+S7mOasvuaWueW8jyAtIGZuIOaooee1hFxuICog5L2/55SoOiAkKCcjZmllbGRzZXQtcGF5d2F5JykucGF5d2F5KCk7XG4gKi9cbihmdW5jdGlvbigkKSB7XG4gICAgJC5mbi5wYXl3YXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN1Ym1pdEJ0biA9IHRoaXMuZmluZCgnLmJ0bi1jYXJ0Jyk7XG4gICAgICAgIHZhciBwYXl3YXlGb3JtID0gdGhpcy5maW5kKCdmb3JtJyk7XG4gICAgICAgIHZhciBwYXJhbXNFbGVtID0gdGhpcy5maW5kKCcuaGlkZGVuJyk7XG4gICAgICAgIHZhciBhbGVydEJveDtcblxuICAgICAgICAvLyDlooPlpJYgLeiyoeS7mOmAmlxuICAgICAgICBpZiAodGhpcy5maW5kKCcuZm9ybS1vdmVyc2Vhcy1wYXl3YXknKS5sZW5ndGggKSB7XG4gICAgICAgICAgICBnZXRQYXlQYXJtYXMoIHBheXdheUZvcm0uZmluZChcImlucHV0W25hbWU9J2Zfc19wYXltZW50J11cIikudmFsKCkgKTtcbiAgICAgICAgICAgIHBheXdheUZvcm0uZmluZChcImlucHV0W25hbWU9J2Zfc19wYXltZW50J11cIikucmVtb3ZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuKCkub24oJ2NoYW5nZScsIFwiaW5wdXRbbmFtZT0nZl9zX3BheW1lbnQnXVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGdldFBheVBhcm1hcygkKHRoaXMpLnZhbCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIHdlYkFUTSDmmK/lkKblronoo51cbiAgICAgICAgICAgICAgICBpZiAoJCh0aGlzKS52YWwoKSA9PT0gXCI0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwUGF5d2F5ID0gcGF5d2F5Rm9ybS5wYXJlbnQoJy5mb3JtLXBheXdheScpO1xuICAgICAgICAgICAgICAgICAgICBhbGVydEJveCA9IGdyb3VwUGF5d2F5LnByZXYoJy5hbGVydCcpO1xuICAgICAgICAgICAgICAgICAgICB3ZWJBVE1QbHVnaW5EZXRlY3QoZnVuY3Rpb24gKHBsdWdpblVSTCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGVydEJveC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydEJveCA9ICAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGFzcyc6ICdhbGVydCBhbGVydC13YXJuaW5nIGZhZGUgaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlOiAnYWxlcnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5zZXJ0QmVmb3JlKGdyb3VwUGF5d2F5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnRCb3guaHRtbCgnPGkgY2xhc3M9XCJmYSBmYS1leGNsYW1hdGlvbi10cmlhbmdsZVwiPjwvaT5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIOS9oOWwmuacquWuieijneeUseesrOS4gOmKgOihjOaPkOS+m+eahCBXZWJBVE0g5pm254mH6YeR6J6N5Y2h5a6J5o6n5YWD5Lu277yM6KuL5oKo5YWI5Z+36KGMIDxhIGhyZWY9XCJ7MH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBjbGFzcz1cImFsZXJ0LWxpbmtcIj7lronoo53mmbbniYfph5Hono3ljaHlronmjqflhYPku7Y8L2E+XFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnI+4oC7IOacrFdlYkFUTeWwmuS4jeaUr+aPtEZpcmVmb3jjgIFDaHJvbWXngI/opr3lmagnLmZvcm1hdChwbHVnaW5VUkwsICdodHRwczovL2VhdG0uZmlyc3RiYW5rLmNvbS50dy9saW8xMDAwczE/Q3RsU2VxTm89MjAmbmFMb2dpblNvdXJjZT0mbmFQdXNoQnJhbmNoSWQ9JykpLmFsZXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYWxlcnRCb3ggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydEJveC5hbGVydCgnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwYXl3YXlGb3JtLnN1Ym1pdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBheXdheUZvcm0uZmluZChcImlucHV0W25hbWU9J2Zfc19wYXltZW50J106Y2hlY2tlZFwiKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ+iri+mBuOaTh+S7mOasvuaWueW8jycpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRQYXlQYXJtYXMgKHBheW1lbnQpIHtcbiAgICAgICAgICAgIHN1Ym1pdEJ0bi5idXR0b24oJ2xvYWRpbmcnKTtcblxuICAgICAgICAgICAgdmFyIHBhcm1hcyA9IHtcbiAgICAgICAgICAgICAgICBcInRcIjogXCJ0XCIsXG4gICAgICAgICAgICAgICAgXCJmXCI6IFwic19nZXRQYXltZW50XCIsXG4gICAgICAgICAgICAgICAgXCJmX3NfY3VzdG5vXCI6IHBheXdheUZvcm0uZGF0YShcImN1c3Rub1wiKSxcbiAgICAgICAgICAgICAgICBcImZfc19wYXltZW50XCI6IHBheW1lbnRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgdXJsOiAnL3Nob3BwaW5nL3BheW1lbnQvJyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogJC5wYXJhbShwYXJtYXMpLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gXCJzdWNjZXNzXCIpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmJ1dHRvbignY29tcGxldGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheXdheUZvcm0uYXR0cihcImFjdGlvblwiLCByZXMucGF5bWVudC5wYXlwYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zRWxlbS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHJlcy5wYXltZW50LnBhcmFtZXMsIGZ1bmN0aW9uKGtleSwgdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxpbnB1dC8+XCIpLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuYXBwZW5kVG8ocGFyYW1zRWxlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KHJlcy5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKGpRdWVyeSk7XG5cblxuLypcbiog55m75YWlIC0g5L2/55SoIGZuIOaooee1hFxuKi9cbihmdW5jdGlvbigkKXtcbiAgICB2YXIgZm9ybUFjdGlvbiA9IHtcbiAgICAgICAgbG9naW46ICcvYWNjb3VudC9sb2dpbi9hdXRoLycsXG4gICAgICAgIGZvcmdvdDogJy9hY2NvdW50L2ZvcmdldC8nLFxuICAgICAgICBzaW5ndXA6ICcvYWNjb3VudC9zaW5ndXAvJ1xuICAgIH07XG4gICAgdmFyIHJlZGlyZWN0ID0gJyc7XG4gICAgdmFyIGhvc3QgPSAnJztcbiAgICB2YXIgY29kZSA9ICcnO1xuXG4gICAgJC5ORENMb2dpbiA9IHtcbiAgICAgICAgc2V0VmlydHVhbEhvc3Q6IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgIHZhciByZWcgPSAvKGh0dHBzP1xcOlxcL1xcL3xcXC9cXC8pP1teXFwvXFxzXStcXC5peXBcXC50dy9pO1xuICAgICAgICAgICAgaWYgKHJlZy50ZXN0KHVybCkpIHtcbiAgICAgICAgICAgICAgICBob3N0ID0gcmVnLmV4ZWModXJsKVswXSB8fCAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0VmFsaUNvZGU6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgIGNvZGUgPSAnJmNvZGU9JyArIHZhbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkLmZuLk5EQ0xvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbW9kYWxPcHRpb25zID0ge307XG4gICAgICAgIGlmIChCb2R5Lmhhc0NsYXNzKCdsb2dpbicpKSB7XG4gICAgICAgICAgICBtb2RhbE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAga2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb2RhbChtb2RhbE9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgIT09ICcvYWNjb3VudC9sb2dpbi8nKSB7XG4gICAgICAgICAgICByZWRpcmVjdCA9ICc/cmVkaXJlY3Q9JyArIGhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBjb2RlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVkaXJlY3QgPSAnP3JlZGlyZWN0PS9hY2NvdW50L29yZGVyLyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mICQuZGF0YSh0aGlzWzBdLCAnZWxlbScpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYmluZEV2ZW50KHRoaXNbMF0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGJpbmRFdmVudCAoZWxlbWVudCkge1xuICAgICAgICAkLmRhdGEoZWxlbWVudCwgJ2VsZW0nLCB7XG4gICAgICAgICAgICBibG9ja0xvZ2luOiAkKGVsZW1lbnQpLmZpbmQoJy5ibG9jay1sb2dpbicpLFxuICAgICAgICAgICAgYmxvY2tGb3Jnb3Q6ICQoZWxlbWVudCkuZmluZCgnLmJsb2NrLWZvcmdvdCcpLFxuICAgICAgICAgICAgc3ViYmxvY2tMb2dpbjogJChlbGVtZW50KS5maW5kKCcuc3ViYmxvY2stbG9naW4nKSxcbiAgICAgICAgICAgIHN1YmJsb2NrU2lnbnVwOiAkKGVsZW1lbnQpLmZpbmQoJy5zdWJibG9jay1zaWdudXAnKSxcbiAgICAgICAgICAgIGZvcmdldEJ0bjogJChlbGVtZW50KS5maW5kKCcubGluay1mb3Jnb3QnKSxcbiAgICAgICAgICAgIGNhbmNlbEJ0bjogJChlbGVtZW50KS5maW5kKCcuY2FuY2VsJyksXG4gICAgICAgICAgICBsaW5rU2lnbnVwQnRuOiAkKGVsZW1lbnQpLmZpbmQoJy5saW5rLXNpZ251cCcpLFxuICAgICAgICAgICAgYmFja0xvZ2luQnRuOiAkKGVsZW1lbnQpLmZpbmQoJy5iYWNrLWxvZ2luJyksXG4gICAgICAgICAgICBpbnB1dEFjY291bnQ6ICQoZWxlbWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImFjY291bnRcIl0nKSxcbiAgICAgICAgICAgIGlucHV0UGFzc3dkOiAkKGVsZW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJwYXNzd2RcIl0nKSxcbiAgICAgICAgICAgIGlucHV0Q2FwdGNoYTogJChlbGVtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiY2FwdGNoYVwiXScpLFxuICAgICAgICAgICAgZm9ybTogJChlbGVtZW50KS5maW5kKCdmb3JtJyksXG4gICAgICAgICAgICBpc0ZvcmdvdDogZmFsc2UsXG4gICAgICAgICAgICBpc1NpZ251cDogZmFsc2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGZvcm1FbGVtID0gJC5kYXRhKGVsZW1lbnQsICdlbGVtJyk7XG5cbiAgICAgICAgZm9ybUVsZW0uZm9ybS5hdHRyKCdhY3Rpb24nLCBob3N0ICsgZm9ybUFjdGlvbi5sb2dpbiArIHJlZGlyZWN0KTtcblxuICAgICAgICBmb3JtRWxlbS5mb3JnZXRCdG4uYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3JtRWxlbS5pc0ZvcmdvdCA9IHRydWU7XG4gICAgICAgICAgICBmb3JtRWxlbS5mb3JtLmF0dHIoJ2FjdGlvbicsIGhvc3QgKyBmb3JtQWN0aW9uLmZvcmdvdCArIHJlZGlyZWN0KTtcbiAgICAgICAgICAgIGZvcm1FbGVtLmJsb2NrTG9naW4uc2xpZGVVcCgnZmFzdCcpO1xuICAgICAgICAgICAgZm9ybUVsZW0uYmxvY2tGb3Jnb3Quc2xpZGVEb3duKCdmYXN0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvcm1FbGVtLmNhbmNlbEJ0bi5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvcm1FbGVtLmlzRm9yZ290ID0gZmFsc2U7XG4gICAgICAgICAgICBmb3JtRWxlbS5mb3JtLmF0dHIoJ2FjdGlvbicsIGhvc3QgKyBmb3JtQWN0aW9uLmxvZ2luICsgcmVkaXJlY3QpO1xuICAgICAgICAgICAgZm9ybUVsZW0uYmxvY2tMb2dpbi5zbGlkZURvd24oJ2Zhc3QnKTtcbiAgICAgICAgICAgIGZvcm1FbGVtLmJsb2NrRm9yZ290LnNsaWRlVXAoJ2Zhc3QnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9ybUVsZW0ubGlua1NpZ251cEJ0bi5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvcm1FbGVtLmlzU2lnbnVwID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvcm1FbGVtLmZvcm0uYXR0cignYWN0aW9uJywgaG9zdCArIGZvcm1BY3Rpb24uc2luZ3VwICsgcmVkaXJlY3QpO1xuICAgICAgICAgICAgZm9ybUVsZW0uc3ViYmxvY2tMb2dpbi5zbGlkZVVwKCdmYXN0Jyk7XG4gICAgICAgICAgICBmb3JtRWxlbS5zdWJibG9ja1NpZ251cC5zbGlkZURvd24oJ2Zhc3QnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9ybUVsZW0uYmFja0xvZ2luQnRuLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9ybUVsZW0uaXNTaWdudXAgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcm1FbGVtLmZvcm0uYXR0cignYWN0aW9uJywgaG9zdCArIGZvcm1BY3Rpb24ubG9naW4gKyByZWRpcmVjdCk7XG4gICAgICAgICAgICBmb3JtRWxlbS5zdWJibG9ja0xvZ2luLnNsaWRlRG93bignZmFzdCcpO1xuICAgICAgICAgICAgZm9ybUVsZW0uc3ViYmxvY2tTaWdudXAuc2xpZGVVcCgnZmFzdCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3JtRWxlbS5mb3JtLnZhbGlkYXRlKHtcbiAgICAgICAgICAgIHJ1bGVzOiB7XG4gICAgICAgICAgICAgICAgYWNjb3VudDoge1xuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhc3N3ZDoge1xuICAgICAgICAgICAgICAgICAgICBtaW5sZW5ndGggOiA2LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFmb3JtRWxlbS5pc0ZvcmdvdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FwdGNoYToge1xuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1FbGVtLmlzRm9yZ290O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXNzd2RhZ2Fpbjoge1xuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1FbGVtLmlzU2lnbnVwO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcXVhbFRvOiBcIiNwYXNzd2RcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWdyZWU6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3JtRWxlbS5pc1NpZ251cDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXNzYWdlczoge1xuICAgICAgICAgICAgICAgIGFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFwi6KuL6Ly45YWlIGVtYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiBcIuiri+i8uOWFpeato+eiuueahCBlbWFpbCDmoLzlvI9cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFzc3dkOiB7XG4gICAgICAgICAgICAgICAgICAgIG1pbmxlbmd0aDogXCLoq4vovLjlhaU25YCL5Lul5LiK55qE6Iux5pW45a2X5YWDXCIsXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBcIuiri+i8uOWFpeWvhueivFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYXB0Y2hhOiB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBcIuiri+i8uOWFpempl+itieeivFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXNzd2RhZ2Fpbjoge1xuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogXCLoq4vlho3mrKHovLjlhaXlr4bnorxcIixcbiAgICAgICAgICAgICAgICAgICAgZXF1YWxUbzogXCLmgqjlho3mrKHovLjlhaXnmoTlr4bnorzkuI3nm7jnrKZcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWdyZWU6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFwi5oKo5b+F6aCI5ZCM5oSP5pyN5YuZ5qKd5qy+XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGlnaGxpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCwgZXJyb3JDbGFzcywgdmFsaWRDbGFzcykge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5oaWdobGlnaHQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGVycm9yQ2xhc3MsIHZhbGlkQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkubmV4dCgnLmhlbHAtYmxvY2snKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvckNsYXNzOiAnZXJyb3InLFxuICAgICAgICAgICAgZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uKGVycm9yLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gJChlbGVtZW50KS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmNoaWxkcmVuKCcuaGVscC1ibG9jaycpO1xuICAgICAgICAgICAgICAgIGlmICghYmxvY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrID0gJCgnPHAvPicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdjbGFzcyc6ICdoZWxwLWJsb2NrJ1xuICAgICAgICAgICAgICAgICAgICB9KS5hcHBlbmRUbyhlbGVtZW50LnBhcmVudHMoJy5mb3JtLWdyb3VwJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBibG9jay50ZXh0KGVycm9yLnRleHQoKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VibWl0SGFuZGxlcjogZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICAgICAgICAgICQoZm9ybSkuZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5idXR0b24oJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICBmb3JtLnN1Ym1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KShqUXVlcnkpO1xuIl0sImZpbGUiOiJjb21tb24udHBsLmpzIn0=
