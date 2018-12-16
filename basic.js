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

			var createButton = Ext.create('Ext.Button', {
			text: 'Создать',
			margin: 5,
			renderTo: 'panel',
			listeners: {
				click: function() {
					editorWin.show(new Extensible.calendar.data.EventModel());
					this.setText('I was clicked!');
					}
				}
			});
			
			var deleteButton = Ext.create('Ext.Button', {
			text: 'Удалить',
			margin: 5,
			renderTo: 'panel',
			listeners: {
				click: function() {
					//rec = table.getView();
					var rec = table.getSelectionModel().getSelection()[0];
					eventStore.remove(rec);
					eventStore.sync();
					this.setText('I was clicked!');
					}
				}
			});
	
	var table = Ext.create('Ext.grid.Panel', {
	store: eventStore,
	renderTo: 'panel',
    columns: [
			{header: 'Название встречи',  dataIndex: 'Title', flex: true},
			{header: 'Ф. И. О.', dataIndex: 'PersonName', flex: true}
    ],
               viewConfig: {
                  plugins: {
                     ddGroup: 'GridExample',
                     ptype: 'gridviewdragdrop',
                     enableDrop: false
                  }
				},
				listeners: {
					itemdblclick: function(grid, record){
							editorWin.show(record);
							console.log(record.data.Title);
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
            var formPanelDropTarget = Ext.create('Ext.dd.DropTarget', formPanelDropTargetEl, {
               ddGroup: 'GridExample',
               notifyEnter: function(ddSource, e, data) {
                  formPanel.body.stopAnimation();
                  formPanel.body.highlight();
				 
               },
               notifyDrop  : function(ddSource, e, data) {
                  var selectedRecord = ddSource.dragData.records[0];
                 // formPanel.getForm().loadRecord(selectedRecord);
                 // ddSource.view.store.remove(selectedRecord);
				 
				  var el = e.getTarget('td', 3);
				  var parts = el.id.split(formPanel.activeView.dayElIdDelimiter);
					dt = parts[parts.length-1],
					parsedDate = Ext.Date.parseDate(dt + ' 12:00', 'Ymd G:i');
					selectedRecord.data.StartDate = parsedDate;
					selectedRecord.data.EndDate = '2101-01-12 13:30:00';
				  rec = new Extensible.calendar.data.EventModel({ StartDate: parsedDate, EndDate: '2101-01-12 13:30:00', Title: selectedRecord.data.name, Notes: 'Some notes' })
				  formPanel.activeView.getEventEditor().show(selectedRecord, null, formPanel.activeView);
                  return true;
               }
            });

});
