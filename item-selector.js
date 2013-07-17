Item = Backbone.Model.extend({
    defaults: {
        icon: 'http://sites.google.com/site/bananainblack/pic/avatar/hanged_banana.jpg',
        name: 'Banana',
        attribute1: 'This is a banana.',
        attribute2: 'A real, banana.'
    }
});

ItemView = Backbone.View.extend({
    className: 'is-item-box is-clickable',
    template:
        '<img class="is-item-icon" src="<%= icon %>">' +
        '<div class="is-item-attributes">' +
            '<div class="is-item-name is-text-ovlerfow-el"><%= name %></div>' +
            '<div class="is-item-attribute-1 is-text-ovlerfow-el"><%= attribute1 %></div>' +
            '<div class="is-item-attribute-2 is-text-ovlerfow-el"><%= attribute2 %></div>' +
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
        }
        return this;
    },
    events: {
        'click': 'alertMsg'
    },
    alertMsg: function() {
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
    className: 'is-items-box',    
    initialize: function() {
        this.collection = new Items(this.collection);
    },
    render: function() {
        if(this.isCollectionValid()) {
            var _this = this.clearView();
            this.collection.each(function(model, index) {
                new ItemView({ model: model }).render().appendTo(_this.$el);
                
                if((index + 1) % _this.cols == 0) {
                    _this.$el.append('<div class="is-clear-both"/>');
                }
            });
        }
        return this;
    },
    appendTo: function(target) {
        if(this.isCollectionValid()) {
            this.$el.appendTo(target);

            if(this.collection.length / this.cols >= this.rows) {
                this.$el.css({ 
                    'overflow': 'auto',
                    'width': this.$el.width() + getScrollbarWidth(),
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
        this.$el.empty();
        return this;
    }
});

/**
 * 1. Generate nested divs
 * 2. Calculate the width of inner div before and after scrollbar becomes visible.
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