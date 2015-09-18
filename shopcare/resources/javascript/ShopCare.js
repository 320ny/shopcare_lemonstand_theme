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

  ShopCare.Checkout = {
      nextStep: function(el, step) {
        var update = {};
        ShopCare.Checkout._update(el, update);
      },
      previousStep: function(step) {
        var update = {};
        var extra = {'nextStep': step};
        var body = document.getElementsByName('body');
        ShopCare.Checkout._update(body);
      },
      _update: function(el, update) {
        // loading actions
        ShopCare.Http.send(el, 'shop:checkout', update, function() {
          // stop loading things
        });
      }
  }

  ShopCare.Product = {
    addToCart: function(el) {
      // starting loading animations
      var update = {'#mini-cart':'shop-minicart', '#product-page':'shop-product'};
      ShopCare.Http.send(el, 'shop:onAddToCart', update, function() {
        // stop loading indicator
      });
    }
  };

  ShopCare.Http = {
    send: function(el, action, update, callback) {
            var options = {
              update: update,
              onAfterUpdate: callback
            };
            $(el).sendRequest(action, options);
          }
  };
  
  ShopCare.Menu = (function() {
      
      var menuLink, menuList;
      
      function registerHover() {
        menuLink.on('mouseover', function() {
            menuList.show();
            $(this).css('margin-bottom', '33%');
        });
        
        $('body').click(function() {
            menuList.hide(); 
            menuLink.css('margin-bottom', '0px');
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
  
  // Initalization
  $(function() {
    ShopCare.Menu.start({
      link: '.shop-link',
      list: '.shop-nav'
    });
  });
  

})(jQuery)
