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
        'click': 'select'
    },
    select: function() {
        this.$el.toggleClass('pressed');
        this.trigger('select', this.model);
    },
    isModelValid: function() {
        return this.model instanceof Item;
    }
});

Items = Backbone.Collection.extend({
    model: Item
});

/**
 * A View represents item collection.
 * 
 * options for new instance
 * - validate: validation before calling confirmSelection callback, recieving an array of selected model objects (Item), 'this' refer to this View
 * - ok: callback of Button 'OK', recieving an array of selected models, 'this' refer to this View
 * - cancel: callback of Button 'Cancel'
 * - cols: the number of columns to display
 * - rows: the number of rows to display
 */
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
                '<div class="btn btn-small is-btn-cancel">Cancel</div>' +
                '<div class="btn btn-primary btn-small is-btn-ok">OK</div>' +                
            '</div>' +
            '<div class="is-status-bar"></div>' +
        '</div>',        
    initialize: function() {
        this.collection = new Items(this.collection);
        this.cols = this.options.cols || this.cols;
        this.rows = this.options.rows || this.rows;
    },
    render: function() {
        if(this.isCollectionValid()) {
            var _this = this.clearView();
            var $itemsBox = _this.$el.find('.is-items-box');
            this.collection.each(function(model, index) {
                var itemView = new ItemView({ model: model }).render().appendTo($itemsBox);
                _this.listenTo(itemView, 'select', _this.clearMessage);

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
    },
    doCallback: function(func, args) {
        if($.isFunction(func)) {
            return func.apply(this, args);
        } else {
            console.log('Not a function!');
            return null;
        }
    },
    events: {
        'click .is-btn-cancel': 'cancel', // not implement yet
        'click .is-btn-ok': 'ok'
    },
    ok: function() {
        var _this = this;
        var selectedModels = new Array();
        
        this.$el.find('.is-item-box').each(function(index) {
            if($(this).is('.pressed')) {
                selectedModels.push(_this.collection.at(index).toJSON());
            }
        });
        
        this.clearMessage();
        var errorMessage = this.doCallback(this.options.validate, [selectedModels]);
        if(errorMessage) {
            this.alertMessage(errorMessage);
        } else {
            this.doCallback(this.options.ok, [selectedModels]);
        }
    },
    cancel: function() {
        this.doCallback(this.options.cancel);
    },
    /**
     * @param msg message to show on status bar
     */
    alertMessage: function(msg) {
        this.$el.find('.is-status-bar')
            .addClass('alert')
            .append('<span class="label label-warning">Warning</span>')
            .append('<span class="is-status-message is-text-overflow-ellipsis">' + msg + '</span>');
    },
    /**
     * Clear message on status bar
     */
    clearMessage: function() {
        this.$el.find('.is-status-bar')
            .removeClass('alert')
            .empty();
    },
    /**
     * Overrite to custimize behavior
     * @param selectedModels the models which is selected in item-selector
     * @return error message; return null or nothing if validation is passed
     */
    validate: function(selectedModels) {
        if(selectedModels.length < 1) {
            return 'Please select at least 1 item.';
        }
    },
    /**
     * Overrite to custimize behavior
     * @param selectedModels the models which is selected in item-selector
     */
    ok: function(selectedModels) {
        alert(JSON.stringify(selectedModels, '', 4));
    }
});

/**
 * 1. Generate nested divs
 * 2. Calculate the width of inner div before and after scrollbar becomes visible
 * @return calculated scrollbar width
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