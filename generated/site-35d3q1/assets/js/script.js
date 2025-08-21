(function ($) {
    "use strict";

    /*------------------------------------
        Mobile Menu
    --------------------------------------*/
    $('.main-menu nav > ul > li').slice(-3).addClass('menu-last');

    /*-------------------------------------------
        Sticky Header
    --------------------------------------------- */

    let win = $(window);
    
    /*------------------------------------
        Preloader
    --------------------------------------*/
    win.on('load',function() {
        $("#loading").fadeOut(500);
    })
    let sticky_id = $(".header-area");
    win.on('scroll', function () {
        let scroll = win.scrollTop();
        if (scroll < 245) {
            sticky_id.removeClass("sticky-header");
        } else {
            sticky_id.addClass("sticky-header");
        }
    });


    /*------------------------------------
        Overlay Close
    --------------------------------------*/
    win.scroll(function () {
        if ($(this).scrollTop() !== 0) {
            $('#scrollUp').fadeIn();
        } else {
            $('#scrollUp').fadeOut();
        }
    });

    $('#scrollUp').on('click', function () {
        $("html, body").animate({scrollTop: 0}, 600);
        return false;
    });

/* magnificPopup img view */
$('.popup-image,.insta-thumb a').magnificPopup({
	type: 'image',
	gallery: {
	  enabled: true
	}
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});

    /*------------------------------------
        Categories Slider
    --------------------------------------*/
    $('.categories-slider').slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: false,
        autoplay: false,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 560,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
    /*------------------------------------
        Gallery Slider
    --------------------------------------*/
    $('.news-gallery').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: true,
        autoplay: true,
        prevArrow: '<button type="button" class="slick-prev"><i class="fal fa-arrow-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fal fa-arrow-right"></i></button>'
    });
    /*------------------------------------
        news Slider
    --------------------------------------*/
    $('.news-slider').slick({
        slidesToShow:1,
        slidesToScroll: 1,
        infinite: true,
        centerPadding: '525px',
        dots: false,
        arrows: false,
        centerMode: true,
        autoplay: true,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    centerPadding: '150px',
                }
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerPadding: '200px',
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerPadding: '200px',
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerPadding: '150px',
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 560,
                settings: {
                    slidesToShow: 1,
                    centerPadding: '0',
                    slidesToScroll: 1
                }
            }
        ]
    });
    /*------------------------------------
    Related news Slider
    --------------------------------------*/
    $('.related-active').slick({
        slidesToShow:2,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: false,
        centerMode: false,
        autoplay: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 560,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    /*------------------------------------
        Testimonial Slider
    --------------------------------------*/
    $('.testimonial-content-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
        arrows: false,
        autoplay: true,
        fade: true,
        autoplaySpeed: 5000,
    });

    $('.category-slider').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: true,
        autoplay: false,
        prevArrow: '<button type="button" class="slick-prev"><i class="fal fa-arrow-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fal fa-arrow-right"></i></button>',
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 560,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    if ($(".filter-wrapper").length > 0) {
        $('.filter-wrapper .filter-grid').imagesLoaded(function () {
            let $grid = $('.filter-wrapper .filter-grid').isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                layoutMode: 'fitRows',
                masonry: {
                    columnWidth: '.grid-item' // columnWidth: 1
                }
            });

            // filter items on button click
            $('.filter-wrapper .filter-nav').on('click', 'button', function () {
                let filterValue = $(this).attr('data-filter');
                $grid.isotope({filter: filterValue});
            });

            //for menu active class
            $('.filter-wrapper .filter-nav button').on('click', function (event) {
                $(this).siblings('.active').removeClass('active');
                $(this).addClass('active');
                event.preventDefault();
            });

        });
    }

    if ($(".odometer").length > 0) {
        $('.odometer').appear(function (e) {
            var odo = $(".odometer");
            odo.each(function () {
                var countNumber = $(this).attr("data-count");
                $(this).html(countNumber);
            });
        });
    }

    if ($(".testimonial-slider").length > 0) {
        $('.testimonial-slider').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
            arrows: false,
            autoplay: false,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                },
                {
                    breakpoint: 560,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    if ($(".testimonial-slider-2").length > 0) {
        $('.testimonial-slider-2').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
            autoplay: false,
            arrows: true,
            prevArrow: '<button type="button" class="slick-prev"><i class="fal fa-arrow-left"></i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="far fa-arrow-right"></i></button>',
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                },
                {
                    breakpoint: 560,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    if ($(".cities-slider").length > 0) {
        $('.cities-slider').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
            autoplay: false,
            arrows: true,
            prevArrow: '<button type="button" class="slick-prev"><i class="fal fa-arrow-left"></i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="far fa-arrow-right"></i></button>',
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 4
                    }
                },
                {
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 769,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 560,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    if ($(".brand-slider").length > 0) {
        $('.brand-slider').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
            autoplay: false,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 4
                    }
                },
                {
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 769,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 560,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    var triggerTabList = [].slice.call(document.querySelectorAll('#filterTab a'))
    triggerTabList.forEach(function (triggerEl) {
        var tabTrigger = new bootstrap.Tab(triggerEl)

        triggerEl.addEventListener('click', function (event) {
            event.preventDefault()
            tabTrigger.show()
        })
    })
    $('.has-select select').niceSelect();
    $('#sort').niceSelect();
    $('.price-select select').niceSelect();
    $('.search-form select').niceSelect();
     //range slider activation

     if ($("#slider-range").length > 0) {
        $("#slider-range").slider({
            range: true,
            min: 0,
            max: 500,
            values: [75, 300],
            slide: function (event, ui) {
                $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
            }
        });
        $("#amount").val("$" + $("#slider-range").slider("values", 0) +
            " - $" + $("#slider-range").slider("values", 1));
        $('.search-form select').niceSelect();
    }

    if ($(".wow").length > 0) {
        new WOW().init();
    }
    //data width 
    $("[data-width]").each(function(){
        $(this).css("width",$(this).attr("data-width"))
    });
    // data background
    $("[data-background").each(function(){
        $(this).css("background-image","url("+$(this).attr("data-background") + ") ")
    })

    // meanmenu
    $('#mobile-menu').meanmenu({
        meanMenuContainer: '.mobile-menu',
        meanScreenWidth: "992"
    });

    $('.open-mobile-menu,.menu-open').on('click', function () {
        $('.side-info').addClass('info-open');
        $('.offcanvas-overlay').addClass('overlay-open');
    })

    $('.side-info-close,.offcanvas-overlay,.mobile_one_page li.menu-item a.nav-link').on('click', function () {
        $('.side-info').removeClass('info-open');
        $('.offcanvas-overlay').removeClass('overlay-open');
    })



})(jQuery);
