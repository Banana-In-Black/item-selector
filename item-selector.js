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
    initialize: function() {
        if(this.isModelValid()) {
            var _this = this;
            this.listenTo(this.model, 'change', function() { _this.render(); });
        }
    },
    render: function(target) {
        if(this.isModelValid()) {
            this.$el.html(_.template(this.template, this.model.toJSON()));
            
            this.target = target || this.target;
            if(target) {
                this.$el.appendTo(this.target);
            }
            
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
    target: null, // A DOM which this view will be appended to
    cols: 4,
    rows: 3,
    className: 'is-container bootstrap-style-border',
    template:
        '<div class="is-items-box clearfix"></div>' +
        '<div class="is-separator-bar"></div>' + 
        '<div class="is-bottom-bar clearfix">' +            
            '<div class="is-buttons pull-right">' +
                '<button class="btn btn-small is-btn-cancel">Cancel</button>' +
                '<button class="btn btn-primary btn-small is-btn-ok">OK</button>' +                
            '</div>' +
            '<div class="is-status-bar"></div>' +
        '</div>',        
    initialize: function() {
        var _this = this;
        this.cols = this.options.cols || this.cols;
        this.rows = this.options.rows || this.rows;
        
        if(!this.isCollectionValid()) {
            this.collection = new Items(this.collection);
            this.listenTo(this.collection, 'add', function() { _this.render(); });
            this.listenTo(this.collection, 'remove', function() { _this.render(); });
        }
        
        if(this.options.draggable && $.isFunction(this.$el.draggable)) {
            this.$el.draggable();
        }
    },
    render: function(target) {
        if(this.isCollectionValid()) {
            var _this = this.clearView();
            var $itemsBox = _this.$('.is-items-box');
            this.collection.each(function(model, index) {
                var itemView = new ItemView({ model: model }).render($itemsBox);
                _this.listenTo(itemView, 'select', function() {
                    _this.showMessage(_this.$('.pressed').size() + ' item(s) was(were) selected.', 'info');
                });

                // Setting columns
                if((index + 1) % _this.cols == 0) {
                    $itemsBox.append('<div class="is-clear-both"/>');
                }
            });

            this.target = target || this.target;
            if(target) {
                this.$el.appendTo(this.target);
            }
            
            // Setting rows
            if(this.collection.length / this.cols > this.rows) {
                var $itemsBox = this.$('.is-items-box');
                $itemsBox.css({ 
                    overflow: 'auto',
                    width: $itemsBox.width() + getScrollbarWidth(),
                    'max-height': this.$('.is-item-box').first().outerHeight(true) * this.rows 
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
        }
    },
    events: {
        'click .is-btn-cancel': 'cancel', // not implement yet
        'click .is-btn-ok': 'ok'
    },
    ok: function() {
        var _this = this;
        var selectedModels = new Array();
        
        this.$('.is-item-box').each(function(index) {
            if($(this).is('.pressed')) {
                selectedModels.push(_this.collection.at(index).toJSON());
            }
        });
        
        this.clearMessage();
        var errorMessage = this.doCallback(this.options.validate, [selectedModels]);
        if(errorMessage) {
            this.showMessage(errorMessage);
        } else {
            this.doCallback(this.options.ok, [selectedModels]);
        }
    },
    cancel: function() {
        this.doCallback(this.options.cancel);
    },
    /**
     * @param msg message to show on status bar
     * @level info|warn, default is warn
     */
    showMessage: function(msg, level) {
        var levelMap = {
            info: 'alert-info'
        };
        
        this.clearMessage();
        this.$('.is-status-bar')
            .addClass('alert').addClass(levelMap[level])
            .append('<span class="is-status-message is-text-overflow-ellipsis">' + msg + '</span>');
    },
    /**
     * Clear message on status bar
     */
    clearMessage: function() {
        this.$('.is-status-bar')
            .removeClass('alert')
            .removeClass('alert-info')
            .empty();
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