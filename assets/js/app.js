(() => {
  // js/app.js
  (() => {
    (() => {
      (() => {
        window.onload = function loader() {
          if (document.getElementById("preloader")) {
            setTimeout(() => {
              document.getElementById("preloader").style.visibility = "hidden";
              document.getElementById("preloader").style.opacity = "0";
            }, 350);
          }
          activateMenu();
          activateSidebarMenu();
        };
        function getClosest(elem, selector) {
          if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function(s) {
              var matches = (this.document || this.ownerDocument).querySelectorAll(s), i2 = matches.length;
              while (--i2 >= 0 && matches.item(i2) !== this) {
              }
              return i2 > -1;
            };
          }
          for (; elem && elem !== document; elem = elem.parentNode) {
            if (elem.matches(selector))
              return elem;
          }
          return null;
        }
        function activateMenu() {
          var menuItems = document.getElementsByClassName("sub-menu-item");
          if (menuItems) {
            var matchingMenuItem = null;
            for (var idx = 0; idx < menuItems.length; idx++) {
              if (menuItems[idx].href === window.location.href) {
                matchingMenuItem = menuItems[idx];
              }
            }
            if (matchingMenuItem) {
              matchingMenuItem.classList.add("active");
              var immediateParent = getClosest(matchingMenuItem, "li");
              if (immediateParent) {
                immediateParent.classList.add("active");
              }
              var parent = getClosest(matchingMenuItem, ".parent-menu-item");
              if (parent) {
                parent.classList.add("active");
                var parentMenuitem = parent.querySelector(".menu-item");
                if (parentMenuitem) {
                  parentMenuitem.classList.add("active");
                }
                var parentOfParent = getClosest(parent, ".parent-parent-menu-item");
                if (parentOfParent) {
                  parentOfParent.classList.add("active");
                }
              } else {
                var parentOfParent = getClosest(matchingMenuItem, ".parent-parent-menu-item");
                if (parentOfParent) {
                  parentOfParent.classList.add("active");
                }
              }
            }
          }
        }
        function activateSidebarMenu() {
          var current = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
          if (current !== "" && document.getElementById("sidebar")) {
            var menuItems = document.querySelectorAll("#sidebar a");
            for (var i2 = 0, len2 = menuItems.length; i2 < len2; i2++) {
              if (menuItems[i2].getAttribute("href").indexOf(current) !== -1) {
                menuItems[i2].parentElement.className += " active";
                menuItems[i2].href = "javascript:void(0)";
                if (menuItems[i2].closest(".sidebar-submenu")) {
                  menuItems[i2].closest(".sidebar-submenu").classList.add("d-block");
                }
                if (menuItems[i2].closest(".sidebar-dropdown")) {
                  menuItems[i2].closest(".sidebar-dropdown").classList.add("active");
                }
              }
            }
          } else if (current === "" && document.getElementById("sidebar")) {
            document.querySelectorAll("#sidebar li a")[0].parentElement.className += " active";
            document.querySelectorAll("#sidebar li a")[0].href = "javascript:void(0)";
          }
        }
        if (document.getElementById("close-sidebar")) {
          document.getElementById("close-sidebar").addEventListener("click", function() {
            document.getElementsByClassName("page-wrapper")[0].classList.toggle("toggled");
          });
        }
        if (document.getElementById("navigation")) {
          elements = document.getElementById("navigation").getElementsByTagName("a");
          for (i = 0, len = elements.length; i < len; i++) {
            elements[i].onclick = function(elem) {
              if (elem.target.getAttribute("href") === "javascript:void(0)") {
                var submenu = elem.target.nextElementSibling.nextElementSibling;
                submenu.classList.toggle("open");
              }
            };
          }
        }
        var elements;
        var i;
        var len;
        // This code was interfering with the subscriptionModal
        // if (document.getElementById("sidebar")) {
        //   elements = document.getElementById("sidebar").getElementsByTagName("a");
        //   for (i = 0, len = elements.length; i < len; i++) {
        //     elements[i].onclick = function(elem) {
        //       if (elem.target.getAttribute("href") === "javascript:void(0)") {
        //         elem.target.parentElement.classList.toggle("active");
        //         elem.target.nextElementSibling.classList.toggle("d-block");
        //       }
        //     };
        //   }
        // }
        var elements;
        var i;
        var len;
        function windowScroll() {
          var navbar = document.getElementById("topnav");
          if (navbar === null) {
          } else if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
            navbar.classList.add("nav-sticky");
          } else {
            navbar.classList.remove("nav-sticky");
          }
        }
        window.addEventListener("scroll", (ev) => {
          ev.preventDefault();
          windowScroll();
        });
        window.onscroll = function() {
          scrollFunction();
        };
        function scrollFunction() {
          var mybutton = document.getElementById("back-to-top");
          if (mybutton === null) {
          } else if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
            mybutton.style.display = "block";
          } else {
            mybutton.style.display = "none";
          }
        }
        feather.replace();
        if (document.getElementsByClassName("dd-menu")) {
          ddmenu = document.getElementsByClassName("dd-menu");
          for (i = 0, len = ddmenu.length; i < len; i++) {
            ddmenu[i].onclick = function(elem) {
              elem.stopPropagation();
            };
          }
        }
        var ddmenu;
        var i;
        var len;
        (function() {
          var current = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
          ;
          if (current === "")
            return;
          var menuItems = document.querySelectorAll(".sidebar-nav a");
          for (var i2 = 0, len2 = menuItems.length; i2 < len2; i2++) {
            if (menuItems[i2].getAttribute("href").indexOf(current) !== -1) {
              menuItems[i2].parentElement.className += " active";
            }
          }
        })();
        (function() {
          "use strict";
          if (document.getElementsByClassName("needs-validation").length > 0) {
            var forms = document.querySelectorAll(".needs-validation");
            Array.prototype.slice.call(forms).forEach(function(form) {
              form.addEventListener("submit", function(event) {
                if (!form.checkValidity()) {
                  event.preventDefault();
                  event.stopPropagation();
                }
                form.classList.add("was-validated");
              }, false);
            });
          }
        })();
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        try {
          let setTheme = function(theme) {
            document.getElementById("theme-opt").href = "assets/css/" + theme + ".min.css";
          };
          setTheme2 = setTheme;
          ;
        } catch (error) {
        }
        var setTheme2;
      })();
    })();
  })();
})();
//# sourceMappingURL=app.js.map
