// in html
//
// Product
// <a href="#" onClick="ShopCare.Product.addToCart(this)">Add To Cart</a>
//
// Checkout
// <a href="#" onClick="ShopCare.Checkout.nextStep(this, 'shippingMethod')">Next Step</a>
//
// Auto SearchBar
// <form action="/search">
//    <input type="text" onKeyUp="ShopCare.SearchBar.search(this)">
//    <input type="submit" value="Search">
// </form>!!!!

(function($) {

    window.ShopCare = {};
    
    ShopCare.Http = {
        send: function(el, action, update, callback) {
            var options = {
              update: update,
              onAfterUpdate: callback
            };
            $(el).sendRequest(action, options);
        }
    };
    

    ShopCare.SearchBar = {
        search: function(el) {
          var text = $(el).val();
          $.ajax('/search.json', {
            action: 'GET',
            data: {query: text}
          }, function(response) {
            ShopCare.SearchBar.showResults(response.data);
          })
        },
        showResults: function(data) {
          var products = data;
        }
    };
  
    ShopCare.Menu = (function() {
      
      var menuLink, menuList;
      
      function showMenuList() {
        menuList.show();
        menuLink.css('margin-bottom', '40%');
      }
      
      function hideMenuList() {
        menuList.hide(); 
        menuLink.css('margin-bottom', '0px');
      }
      
      function registerHover() {
        menuLink.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (menuList.is(':visible')) {
                hideMenuList();
            } else {
                showMenuList();
            }
        });
        
        $('body').click(function() {
          hideMenuList();
        });
        
        menuList.click(function(e){
            e.stopPropagation();
        });
      }
      return {
        start: function(args) {
            menuLink = $(args.link);
            menuList = $(args.list);
            registerHover();
        }    
      }
    }());
  
    ShopCare.Cart = (function() {
        
        var cart, updateHash;
        
        function updateCart() {
            ShopCare.Http.send(cart.parents('form'), 'shop:cart', updateHash);
        }
        
        function changeQuantity(button, amount) {
            var parent = $(button).parent();
            var input = parent.find('[data-cart-quantity="input"]');
            var number = parent.find('[data-cart-quantity="number"]');
            var newQty = parseInt(input.val()) + amount;
            input.val(newQty);
            number.html(newQty);
        }
        
        function registerQuantityButtons() {
            cart.on('click', '[data-cart-quantity="down"]', function(e) {
                e.preventDefault();
                changeQuantity(this, -1);
                updateCart();
            });
            cart.on('click', '[data-cart-quantity="up"]', function(e) {
                e.preventDefault();
                changeQuantity(this, 1);
                updateCart()
            });
        }
        
        return {
            start: function(args) {
                cart = $('#' + args.cart_id);
                updateHash = args.on_update;
                registerQuantityButtons();
            }
        }
    }());
    
    ShopCare.Checkout = (function() {
        
        var checkout, updateHash;

        var copyButton = {
            copyAddress: function() {
                return $('[data-checkout-copy-billing-address]').is(":checked");
            },
            setButtonState: function() {
                if (sessionStorage.getItem('checkout.copy_address') == "false") {
                    this.unselect();
                } else {
                    this.select();
                }
            },
            initCopyButton: function() {
                this.setButtonState();
                var that = this;
                checkout.on('change', '[data-checkout-copy-billing-address]', function() {
                    if (that.copyAddress()) {
                        that.select()
                    } else {
                        that.unselect();
                    }
                });
                
            },
            select: function() {
                $('[data-checkout-copy-billing-address]').prop("checked", true);
                checkout.find('#shipping_address_container').hide();
                sessionStorage.setItem('checkout.copy_address', "true");
            },
            unselect: function() {
                $('[data-checkout-copy-billing-address]').prop("checked", false);
                checkout.find('#shipping_address_container').show();
                sessionStorage.setItem('checkout.copy_address', "false");
            }
        }
        
        function toShippingMethods() {
            console.log(checkout.find('form'));
            ShopCare.Http.send(checkout.find('form'), 'shop:checkout', updateHash);
        }
        
        function registerCheckoutAddressToShipping () {
            checkout.on('click', '[data-checkout-address-to-shipping]', function(e) {
                e.preventDefault();
                if (copyButton.copyAddress()) {
                    ShopCare.Http.send(checkout.find('form'), 'shop:onCheckoutBillingInfo', {}, function() {
                        ShopCare.Http.send($(this), 'shop:onCopyBillingToShipping', {'#checkout-page': 'shop-checkout-address'}, toShippingMethods);
                    });
                } else {
                    toShippingMethods();
                }
            });
        }
        
        function registerPaymentForm() {
            checkout.on('change', '#payment_method', function() {
                ShopCare.Http.send(checkout.find('form'), 'shop:onUpdatePaymentMethod', {'#payment_form' : 'shop-paymentform'});
            });
        }
        
        return {
            start: function(args) {
                checkout = $('#' + args.checkout_id);
                updateHash = args.on_update;
                registerCheckoutAddressToShipping();
                $(window).on('onAjaxAfterUpdate', function() {
                    copyButton.setButtonState();
                });
                copyButton.initCopyButton();
                registerPaymentForm();
            }
        }
    }());
    
    ShopCare.Category = (function() {
        var filterForm, updateHash, priceSlider, priceValue;
        
        function registerCollectionFilter() {
            $("[data-category-filter-family]").click(function() {
                if ($(this).hasClass('active')) {
                    $("[data-category-filter-family]").removeClass("active");
                    filterForm.find('[name="filter_collection"]').val('');
                } else {
                    $("[data-category-filter-family]").removeClass("active");
                    $(this).addClass("active");
                    filterForm.find('[name="filter_collection"]').val($(this).data('family'));
                }
                ShopCare.Http.send(filterForm, 'shop:category', {'#product-list' : 'shop-product-list-filtered'});
            });
        }
        
        function registerPriceFilter() {
            var max = priceSlider.prop('max');
            priceSlider.val(max);
            priceValue.val(max);
            
            priceSlider.change(function() {
                priceValue.val(priceSlider.val());
                ShopCare.Http.send(filterForm, 'shop:category', {'#product-list' : 'shop-product-list-filtered'});
            });
        }
        
        function registerListItems() {
            $('body').on('mouseenter', '.product-list-item', function() {
                console.log("mouse enter");
                $(this).find('[data-product-list-overlay]').addClass('quick-view-enabled');
                $(this).find('.category-product-details').addClass('quick-view-description-hidden');
            });
            $('body').on('mouseleave', '.product-list-item', function() {
                console.log("mouse leave");
                $(this).find('[data-product-list-overlay]').removeClass('quick-view-enabled');
                $(this).find('.category-product-details').removeClass('quick-view-description-hidden');
            });
        }
        
        return {
            start: function(args) {
                filterForm = $('#'+args.form_id);
                updateHash = args.on_update;
                priceSlider = $('[name="filter_price"]');
                priceValue = $('#'+args.price_value_id);
                registerCollectionFilter();
                registerPriceFilter();
                registerListItems();
            }
        }
    }());

})(jQuery)
