Item = Backbone.Model.extend({
    defaults: {
        icon: 'http://sites.google.com/site/bananainblack/pic/avatar/hanged_banana.jpg',
        name: 'Banana',
        attribute1: 'This is a banana.',
        attribute2: 'A real, banana.'
    }
});

ItemView = Backbone.View.extend({
    className: 'is-item-box is-clickable pull-left',
    template:
        '<img class="is-item-icon" src="<%= icon %>">' +
        '<div class="is-item-attributes">' +
            '<div class="is-item-name is-text-overflow-ellipsis"><%= name %></div>' +
            '<div class="is-item-attribute-1 is-text-overflow-ellipsis"><%= attribute1 %></div>' +
            '<div class="is-item-attribute-2 is-text-overflow-ellipsis"><%= attribute2 %></div>' +
        '</div>',
    render: function() {
        if(this.isModelValid()) {
            this.$el.html(_.template(this.template, this.model.toJSON()));
        }
        return this;
    },
    appendTo: function(target) {
        if(this.isModelValid()) {
            this.$el.appendTo(target);
            appendTooltipForEllipsis();
        }
        return this;
    },
    events: {
        'click': 'itemSelect'
    },
    itemSelect: function() {
        this.$el.toggleClass('pressed');
        console.log(JSON.stringify(this.model.toJSON(), null, 4));
    },
    isModelValid: function() {
        return this.model instanceof Item;
    }
});

Items = Backbone.Collection.extend({
    model: Item
});

ItemsView = Backbone.View.extend({
    cols: 4,
    rows: 3,
    className: 'is-container bootstrap-style-border',
    template:
        '<div class="is-items-box clearfix"></div>' +
        '<div class="is-separator-bar"></div>' + 
        '<div class="is-bottom-bar clearfix">' +            
            '<div class="is-buttons pull-right">' +
                /*'<div class="btn-group">' +
                    '<div class="btn btn-small">' +
                        '<i class="icon-play"></i>' +
                    '</div>' +
                '</div>' +*/
                '<div class="btn btn-small">Cancel</div>' +
                '<div class="btn btn-primary btn-small">OK</div>' +                
            '</div>' +
            '<div class="is-status-bar"></div>' +
        '</div>',        
    initialize: function() {
        this.collection = new Items(this.collection);
    },
    render: function() {
        if(this.isCollectionValid()) {
            var _this = this.clearView();
            var $itemsBox = _this.$el.find('.is-items-box');
            this.collection.each(function(model, index) {
                new ItemView({ model: model }).render().appendTo($itemsBox);

                if((index + 1) % _this.cols == 0) {
                    $itemsBox.append('<div class="is-clear-both"/>');
                }
            });
        }
        return this;
    },
    appendTo: function(target) {
        if(this.isCollectionValid()) {
            this.$el.appendTo(target);

            if(this.collection.length / this.cols >= this.rows) {
                var $itemsBox = this.$el.find('.is-items-box');
                $itemsBox.css({ 
                    overflow: 'auto',
                    width: $itemsBox.width() + getScrollbarWidth(),
                    'max-height': this.$el.find('.is-item-box').first().outerHeight(true) * this.rows 
                });
            }
        }
        return this;
    },
    isCollectionValid: function() {
        return this.collection instanceof Items;
    },
    clearView: function() {
        this.$el.html(this.template);
        return this;
    }
});

/**
 * 1. Generate nested divs
 * 2. Calculate the width of inner div before and after scrollbar becomes visible
 * @returns calculated scrollbar width
 */
function getScrollbarWidth() {
    var $tempNode = 
        $('<div/>')
            .css({
                width: 100,
                position: 'absolute',
                top: -1000
            })
            .append($('<div/>', { height: 100 }))
            .appendTo('body');
    
    var withoutSroll = $tempNode.children(':first').innerWidth();
    var withScroll = $tempNode.css({ 'overflow-y': 'scroll' }).children(':first').innerWidth();

    $tempNode.remove();
    return withoutSroll - withScroll;
}

/**
 * Apply tilte attribute to element which has text-overflow: ellipsis
 */
function appendTooltipForEllipsis() {
    $('.is-text-overflow-ellipsis').each(function() {
        if(this.offsetWidth < this.scrollWidth && !$(this).attr('title')) {
            $(this).attr('title', $(this).text());
        }
    });
}