// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        // Optional
        loadProductFirst: true,
        numberFilterTree: 2,
        sliderRange: 3
    },
    selector: {
        products: '#product-loop'
    }
};

var bcSfFilterTemplate = {
    'saleLabelHtml': '<div class="sale-item icn">' + bcSfFilterConfig.label.sale + '</div>',
    'soldOutLabelHtml': '<div class="so icn">' + bcSfFilterConfig.label.sold_out + '</div>',
    'newLabelHtml': '<div class="new icn">' + bcSfFilterConfig.label.new + '</div>',
    'vendorHtml': '<h4>{{itemVendorLabel}}</h4>',
    'quickViewHtml': '<a class="fancybox.ajax product-modal" rel="nofollow" href="{{itemUrl}}?view=quick">' + bcSfFilterConfig.label.quick_view + '</a>',
    'imageFlipHtml': '<div class="hidden"><img src="{{imageFlipUrl}}" alt="{{itemTitle}}" /></div>',

    // Grid Template
  'productGridItemHtml':  '<div id="prod-{{itemId}}" class="product-index {{grid_item_width}}" data-alpha="{{itemTitle}}" data-price="{{itemPriceNumber}}">' +
                                '<div class="ci">' +
                                    '{{itemNewLabel}}' +
                                    '{{itemSaleLabel}}' +
                                    '{{itemSoldoutLabel}}' +

                                    '<a href="{{itemUrl}}" title="{{itemTitle}}">' +
                                        '<div class="reveal">' +
                                            '<img src="{{itemThumbUrl}}" alt="{{itemTitle}}" />' +
                                            '{{itemImageFlip}}' +
                                        '</div>' +
                                    '</a>' +
                                '</div>' +

                                '<div class="product-info">' +
                                    '{{itemQuickView}}' +
                                '</div>' +

                                '<div class="product-details">' +
                                    '<a href="{{itemUrl}}">' +
                                        '<h3>{{itemTitle}}</h3>' +
                                        '{{itemVendor}}' +
                                    '</a>' +
                                    '<div class="price">{{itemPrice}}</div>' +
  									'<div class="product_listing_options">' +
  										'{{swatchesSize}}'+
  									'</div>' +
                                '</div>' +
                            '</div>',

    // Pagination Template
    'previousHtml': '<a href="{{itemUrl}}"><</a>',
    'nextHtml': '<a href="{{itemUrl}}">></a>',
    'pageItemHtml': '<a href="{{itemUrl}}">{{itemTitle}}</a>',
    'pageItemSelectedHtml': '<span class="current">{{itemTitle}}</span>',
    'pageItemRemainHtml': '<span>{{itemTitle}}</span>',
    'paginateHtml': '<div id="pagination" class="desktop-12 mobile-3"><span class="count"></span>{{previous}}{{pageItems}}{{next}}</div>',

    // Sorting Template
    'sortingHtml': '<select id="sort-by" class="styled-select">{{sortingItems}}</select>',
};

function showSwatches(data){
  let checker = [];
  var swatchesHtml = "";
  if(data.variants.length > 1 && data.available){
    swatchesHtml +='<div class="size-swatch">'
    swatchesHtml +='<ul data-option-index="'+0+'" class="size options">';
    data.variants.forEach(variant =>{
      var size;
      if(variant.option_size && checker.indexOf(variant.option_size) < 0 ){
      	size = variant.option_size;
        checker.push(variant.option_size);
      }else if(variant.option_shirt_size && checker.indexOf(variant.option_shirt_size) < 0){
      	size = variant.option_shirt_size;
        checker.push(variant.option_shirt_size);
      }
      if(size){
        swatchesHtml +='<li data-option-title="'+size+'" data-href="'+variant.image+'" class="color '+size+'">';
        swatchesHtml +='<a href="{{itemUrl}}?variant='+ variant.id +'">'+size+'</a>';
        swatchesHtml +='</li>';
      }
      
    });
    swatchesHtml +='</ul>';
    swatchesHtml +='</div>';
  }
  return swatchesHtml;
  
}

// Build Product List
BCSfFilter.prototype.buildProductGridItem = function(data, index, totalProduct) {
    /*** Prepare data ***/
    var images = data.images_info;
     // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;
	itemHtml = itemHtml.replace(/{{swatchesSize}}/g, showSwatches(data));
    // Add itemGridWidthClass
    var itemGridWidthClass = '';
    var productsPerRow = bcSfFilterConfig.custom.grid_item_width;
    
    itemHtml = itemHtml.replace(/{{grid_item_width}}/g, productsPerRow);

    // Add Label
    var itemNewLabelHtml = '';
    var itemSaleLabelHtml = '';
    var itemSoldoutLabelHtml = '';
    if (!soldOut) {
        for (var k in data.collections) {
            if (data['collections'][k]['handle'] == 'new') {
                itemNewLabelHtml = bcSfFilterTemplate.newLabelHtml;
                break;
            }
        }
        if (onSale) {
            itemSaleLabelHtml = bcSfFilterTemplate.saleLabelHtml;
        }
    } else {
        itemSoldoutLabelHtml = bcSfFilterTemplate.soldOutLabelHtml;
    }
    itemHtml = itemHtml.replace(/{{itemNewLabel}}/g, itemNewLabelHtml);
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabelHtml);
    itemHtml = itemHtml.replace(/{{itemSoldoutLabel}}/g, itemSoldoutLabelHtml);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add price
    var itemPriceHtml = '';
    if (onSale) {
        itemPriceHtml += '<div class="onsale">' + this.formatMoney(data.price_min, this.moneyFormat) + '</div>';
        itemPriceHtml += '<div class="was-listing">' + this.formatMoney(data.compare_at_price_min, this.moneyFormat) + '</div>'
    } else {
        itemPriceHtml += '<div class="prod-price">';
        if (priceVaries) {
            itemPriceHtml += bcSfFilterConfig.label.from_price + ' ' + this.formatMoney(data.price_min, this.moneyFormat) + ' - ' + this.formatMoney(data.price_max, this.moneyFormat);
        } else {
            itemPriceHtml += this.formatMoney(data.price_min, this.moneyFormat);
        }
        itemPriceHtml += '</div>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add Thumbnail
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src'], '305x457') : bcSfFilterConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Image Flip
    var itemImageFlipHtml = '';
    if (bcSfFilterConfig.custom.image_flip_enable && images.length > 1) { 
        itemImageFlipHtml = (bcSfFilterTemplate.imageFlipHtml).replace(/{{imageFlipUrl}}/g, this.optimizeImage(images[1]['src']));
    }
    itemHtml = itemHtml.replace(/{{itemImageFlip}}/g, itemImageFlipHtml);

    // Add Quick view
    var itemQuickViewHtml = bcSfFilterConfig.custom.quick_view_enable ? bcSfFilterTemplate.quickViewHtml : '';
    itemHtml = itemHtml.replace(/{{itemQuickView}}/g, itemQuickViewHtml);    

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemPriceNumber}}/g, this.formatMoney(data.price_min, this.moneyFormat));
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
}

function buildItemGridClass(itemClass, index, productsPerRow) {
    var temp = index < productsPerRow ? index : index % productsPerRow;
    if (temp == 1) { itemClass += ' first'; }
    else if (temp == 0) { itemClass += ' last'; };
    return itemClass;
}

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    // Get page info
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
        jQ(this.selector.bottomPagination).html('');
        return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
        var paginationHtml = bcSfFilterTemplate.paginateHtml;

        // Build wrapper
        paginationHtml = paginationHtml.replace(/{{paginateWrapperClass}}/g, 'twelve');

        // Build Previous
        var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousHtml : '';
        previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage -1));
        paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

        // Build Next
        var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextHtml : '';
        nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
        paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

        // Create page items array
        var beforeCurrentPageArr = [];
        for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
            beforeCurrentPageArr.unshift(iBefore);
        }
        if (currentPage - 4 > 0) {
            beforeCurrentPageArr.unshift('...');
        }
        if (currentPage - 4 >= 0) {
            beforeCurrentPageArr.unshift(1);
        }
        beforeCurrentPageArr.push(currentPage);

        var afterCurrentPageArr = [];
        for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
            afterCurrentPageArr.push(iAfter);
        }
        if (currentPage + 3 < totalPage) {
            afterCurrentPageArr.push('...');
        }
        if (currentPage + 3 <= totalPage) {
            afterCurrentPageArr.push(totalPage);
        }

        // Build page items
        var pageItemsHtml = '';
        var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
        for (var iPage = 0; iPage < pageArr.length; iPage++) {
            if (pageArr[iPage] == '...') {
                pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
            } else {
                pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
            }
            pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
            pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
        }
        paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

        jQ(this.selector.bottomPagination).html(paginationHtml);
    }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Breadcrumb
BCSfFilter.prototype.buildBreadcrumb = function(colData, apiData) {
    if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
        var colInfo = colData.collection;
        var breadcrumbHtml = '<a href="/" class="homepage-link" title="' + bcSfFilterConfig.label.breadcrumb_home + '">' + bcSfFilterConfig.label.breadcrumb_home + '</a>';
        breadcrumbHtml += '<span class="separator">&raquo;</span>';
        if (bcSfFilterConfig.general.current_tags !== null) {
            var currentTags = bcSfFilterConfig.general.current_tags;
            breadcrumbHtml += ' <a href="/collections/' + colInfo.handle + '">' + colInfo.title + '</a>';
            breadcrumbHtml += ' <span class="separator">&raquo;</span>'
            breadcrumbHtml += ' <span class="page-title">' + currentTags[0] + '</span>';
        } else {
            breadcrumbHtml += ' <span class="page-title">' + colInfo.title + '</span>';
        }
        jQ('#breadcrumb').html(breadcrumbHtml);
    }
};

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data) {};

// Capitalize label of filter option
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
    var from = this.queryParams.page == 1 ? this.queryParams.page : (this.queryParams.page - 1) * this.queryParams.limit + 1;
    var to = this.queryParams.page * this.queryParams.limit;
    jQ(this.selector.bottomPagination).find('.count').html(bcSfFilterConfig.label.showing_items + ' ' + from + '-' + to + ' / ' + data.total_product);    
};

// Build Default layout
function buildDefaultLink(a,b){var c=window.location.href.split("?")[0];return c+="?"+a+"="+b}BCSfFilter.prototype.buildDefaultElements=function(a){if(bcSfFilterConfig.general.hasOwnProperty("collection_count")&&jQ("#bc-sf-filter-bottom-pagination").length>0){var b=bcSfFilterConfig.general.collection_count,c=parseInt(this.queryParams.page),d=Math.ceil(b/this.queryParams.limit);if(1==d)return jQ(this.selector.pagination).html(""),!1;if("default"==this.getSettingValue("general.paginationType")){var e=bcSfFilterTemplate.paginateHtml,f="";f=c>1?bcSfFilterTemplate.hasOwnProperty("previousActiveHtml")?bcSfFilterTemplate.previousActiveHtml:bcSfFilterTemplate.previousHtml:bcSfFilterTemplate.hasOwnProperty("previousDisabledHtml")?bcSfFilterTemplate.previousDisabledHtml:"",f=f.replace(/{{itemUrl}}/g,buildDefaultLink("page",c-1)),e=e.replace(/{{previous}}/g,f);var g="";g=c<d?bcSfFilterTemplate.hasOwnProperty("nextActiveHtml")?bcSfFilterTemplate.nextActiveHtml:bcSfFilterTemplate.nextHtml:bcSfFilterTemplate.hasOwnProperty("nextDisabledHtml")?bcSfFilterTemplate.nextDisabledHtml:"",g=g.replace(/{{itemUrl}}/g,buildDefaultLink("page",c+1)),e=e.replace(/{{next}}/g,g);for(var h=[],i=c-1;i>c-3&&i>0;i--)h.unshift(i);c-4>0&&h.unshift("..."),c-4>=0&&h.unshift(1),h.push(c);for(var j=[],k=c+1;k<c+3&&k<=d;k++)j.push(k);c+3<d&&j.push("..."),c+3<=d&&j.push(d);for(var l="",m=h.concat(j),n=0;n<m.length;n++)"..."==m[n]?l+=bcSfFilterTemplate.pageItemRemainHtml:l+=m[n]==c?bcSfFilterTemplate.pageItemSelectedHtml:bcSfFilterTemplate.pageItemHtml,l=l.replace(/{{itemTitle}}/g,m[n]),l=l.replace(/{{itemUrl}}/g,buildDefaultLink("page",m[n]));e=e.replace(/{{pageItems}}/g,l),jQ(this.selector.pagination).html(e)}}if(bcSfFilterTemplate.hasOwnProperty("sortingHtml")&&jQ(this.selector.topSorting).length>0){jQ(this.selector.topSorting).html("");var o=this.getSortingList();if(o){var p="";for(var q in o)p+='<option value="'+q+'">'+o[q]+"</option>";var r=bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g,p);jQ(this.selector.topSorting).html(r);var s=void 0!==this.queryParams.sort_by?this.queryParams.sort_by:this.defaultSorting;jQ(this.selector.topSorting+" select").val(s),jQ(this.selector.topSorting+" select").change(function(a){window.location.href=buildDefaultLink("sort_by",jQ(this).val())})}}};

BCSfFilter.prototype.prepareProductData = function(data) { var countData = data.length; for (var k = 0; k < countData; k++) { data[k]['images'] = data[k]['images_info']; if (data[k]['images'].length > 0) { data[k]['featured_image'] = data[k]['images'][0] } else { data[k]['featured_image'] = { src: bcSfFilterConfig.general.no_image_url, width: '', height: '', aspect_ratio: 0 } } data[k]['url'] = '/products/' + data[k].handle; var optionsArr = []; var countOptionsWithValues = data[k]['options_with_values'].length; for (var i = 0; i < countOptionsWithValues; i++) { optionsArr.push(data[k]['options_with_values'][i]['name']) } data[k]['options'] = optionsArr; if (typeof bcSfFilterConfig.general.currencies != 'undefined' && bcSfFilterConfig.general.currencies.length > 1) { var currentCurrency = bcSfFilterConfig.general.current_currency.toLowerCase().trim(); function updateMultiCurrencyPrice(oldPrice, newPrice) { if (typeof newPrice != 'undefined') { return newPrice; } return oldPrice; } data[k].price_min = updateMultiCurrencyPrice(data[k].price_min, data[k]['price_min_' + currentCurrency]); data[k].price_max = updateMultiCurrencyPrice(data[k].price_max, data[k]['price_max_' + currentCurrency]); data[k].compare_at_price_min = updateMultiCurrencyPrice(data[k].compare_at_price_min, data[k]['compare_at_price_min_' + currentCurrency]); data[k].compare_at_price_max = updateMultiCurrencyPrice(data[k].compare_at_price_max, data[k]['compare_at_price_max_' + currentCurrency]); } data[k]['price_min'] *= 100, data[k]['price_max'] *= 100, data[k]['compare_at_price_min'] *= 100, data[k]['compare_at_price_max'] *= 100; data[k]['price'] = data[k]['price_min']; data[k]['compare_at_price'] = data[k]['compare_at_price_min']; data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max']; var firstVariant = data[k]['variants'][0]; if (getParam('variant') !== null && getParam('variant') != '') { var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant') }); if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0] } else { var countVariants = data[k]['variants'].length; for (var i = 0; i < countVariants; i++) { if (data[k]['variants'][i].available) { firstVariant = data[k]['variants'][i]; break } } } data[k]['selected_or_first_available_variant'] = firstVariant; var countVariants = data[k]['variants'].length; for (var i = 0; i < countVariants; i++) { var variantOptionArr = []; var count = 1; var variant = data[k]['variants'][i]; var variantOptions = variant['merged_options']; if (Array.isArray(variantOptions)) { var countVariantOptions = variantOptions.length; for (var j = 0; j < countVariantOptions; j++) { var temp = variantOptions[j].split(':'); data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1]; data[k]['variants'][i]['option_' + temp[0]] = temp[1]; variantOptionArr.push(temp[1]) } data[k]['variants'][i]['options'] = variantOptionArr } data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100; data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100 } data[k]['description'] = data[k]['content'] = data[k]['body_html']; if(data[k].hasOwnProperty('original_tags') && data[k]['original_tags'].length > 0){ data[k].tags = data[k]['original_tags'].slice(0); }} return data };