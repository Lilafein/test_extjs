/*!
 * Extensible 1.6.1
 * Copyright(c) Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        "Extensible": "../../src",
        "Extensible.example": "..",
		"Org.Silv": ""
    }
});
Ext.require([
    'Extensible.calendar.data.MemoryEventStore',
    'Extensible.calendar.CalendarPanel',
    'Extensible.example.calendar.data.Events',
	'Org.Silv.form.MeetingEventWindow'
]);
Extensible.calendar.data.EventMappings.PersonName = {
    name: 'PersonName',
    mapping: 'presonName'
};

    // Don't forget to reconfigure!
    Extensible.calendar.data.EventModel.reconfigure();
 


Ext.override(Extensible.calendar.view.Month, {

	isEventVisible: function(evt) {
		if(evt[Extensible.calendar.data.EventMappings.StartDate.name] == null) return false;
		
		  var eventMappings = Extensible.calendar.data.EventMappings,
            calendarMappings = Extensible.calendar.data.CalendarMappings,
            data = evt.data || evt,
            calRec = this.calendarStore ? this.calendarStore.findRecord(calendarMappings.CalendarId.name,
                evt[eventMappings.CalendarId.name]) : null;
				
		
		
        if (calRec && calRec.data[calendarMappings.IsHidden.name] === true) {
            return false;
        }

        var start = this.viewStart.getTime(),
            end = this.viewEnd.getTime(),
            evStart = data[eventMappings.StartDate.name].getTime(),
            evEnd = data[eventMappings.EndDate.name].getTime(),
            isOverlapping = Extensible.Date.rangesOverlap(start, end, evStart, evEnd);

        return isOverlapping;
      
    }
});
Ext.onReady(function(){
    var eventStore = Ext.create('Extensible.calendar.data.MemoryEventStore', {
        // defined in ../data/Events.js
        data: Extensible.example.calendar.data.Events.getData()
    });
	var eventStore2 = Ext.create('Extensible.calendar.data.MemoryEventStore', {
        // defined in ../data/Events.js
        data: Extensible.example.calendar.data.Events.getData()
    });
	
 var editorWin = Ext.create('Org.Silv.form.MeetingEventWindow', {
                id: 'ext-data-editwin',
                modal: true,

                listeners: {
                    'eventadd': {
                        fn: function(win, rec, animTarget, options) {
                            //win.hide(animTarget);
                           //  win.currentView.onEventEditorAdd(null, rec, options);
							eventStore.add(rec);
							eventStore.sync();
							editorWin.onCancel();
							editorWin.hide();
                        },
                        scope: this
                    },
                    'eventupdate': {
                        fn: function(win, rec, animTarget, options) {
                            //win.hide(animTarget);
                            win.currentView.onEventEditorUpdate(null, rec, options);
                        },
                        scope: this
                    },
                    'eventdelete': {
                        fn: function(win, rec, animTarget, options) {
                            //win.hide(animTarget);
                            win.currentView.onEventEditorDelete(null, rec, options);
                        },
                        scope: this
                    },
                    'editdetails': {
                        fn: function(win, rec, animTarget, view) {
                            // explicitly do not animate the hide when switching to detail
                            // view as it looks weird visually
                            win.animateTarget = null;
                            win.hide();
                            win.currentView.fireEvent('editdetails', win.currentView, rec);
                        },
                        scope: this
                    },
                    'eventcancel': {
                        fn: function(win, rec, animTarget) {
                            //this.dismissEventEditor(null, animTarget);
                            //win.currentView.onEventEditorCancel();
							editorWin.hide()
                        },
                        scope: this
                    }
                }
            });
   formPanel = Ext.create('Extensible.calendar.CalendarPanel', {
        eventStore: eventStore,
        renderTo: 'simple',
        title: 'Basic Calendar',
        width: 700,
        height: 500,
		monthText : 'test_month'
    });

    //
    // example 2: shows off some common Ext.Panel configs as well as a
    // few extra CalendarPanel-specific configs + a calendar store
    //
			var button = Ext.create('Ext.Button', {
			text: 'Button',
			margin: 5,
			renderTo: 'panel',
			 listeners: {
    click: function() {
		
 rec = new Extensible.calendar.data.EventModel({  Title: 'My cool event', Notes: 'Some notes' });
		editorWin.show(rec)
	// eventStore.add(rec);
        this.setText('I was clicked!');
    }}
			 
		});
	
	var table = Ext.create('Ext.grid.Panel', {
	 store: eventStore,
	  renderTo: 'panel',
    columns: [
        {header: 'Name',  dataIndex: 'Title', flex: true}
    ],
               viewConfig: {
                  plugins: {
                     ddGroup: 'GridExample',
                     ptype: 'gridviewdragdrop',
                     enableDrop: false
                  }
               },
               enableDragDrop   : true,
               width            : 300,
               margins          : '0 2 0 0',
              
               selModel         : Ext.create('Ext.selection.RowModel',{
                  singleSelect  : true
               })
               
            });
			
			var formPanelDropTargetEl =  formPanel.body.dom;
            
            //Creation of tager variable for drop.
            var formPanelDropTarget = Ext.create('Ext.dd.DropTarget', formPanelDropTargetEl, {
               ddGroup: 'GridExample',
               notifyEnter: function(ddSource, e, data) {
                  formPanel.body.stopAnimation();
                  formPanel.body.highlight();
				 
               },
               notifyDrop  : function(ddSource, e, data) {
                  var selectedRecord = ddSource.dragData.records[0];
                  //formPanel.getForm().loadRecord(selectedRecord);
                  ddSource.view.store.remove(selectedRecord);
				  var el = e.getTarget('td', 3);
				  var parts = el.id.split(formPanel.activeView.dayElIdDelimiter);
					dt = parts[parts.length-1],
					parsedDate = Ext.Date.parseDate(dt + ' 12:00', 'Ymd G:i');
				  rec = new Extensible.calendar.data.EventModel({ StartDate: parsedDate, EndDate: '2101-01-12 13:30:00', Title: selectedRecord.data.name, Notes: 'Some notes' })
				  formPanel.activeView.getEventEditor().show(rec, null, formPanel.activeView);
                  return true;
               }
            });

});
