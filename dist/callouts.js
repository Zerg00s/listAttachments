// The file has been created, saved into "/_catalogs/masterpage/attachments/"
// and attached to the XLV via JSLink property.

SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {

  function getBaseHtml(ctx) {
    return SPClientTemplates["_defaultTemplates"].Fields.default.all.all[ctx.CurrentFieldSchema.FieldType][ctx.BaseViewID](ctx);
  }

  function init() {

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({

       OnPreRender: function(ctx) {
            if(typeof jQuery == 'function') 
                NotifyScriptLoadedAndExecuteWaitingJobs("jquery.js");
            else if (LoadSodByKey('jquery.js', null) == Sods.missing) 
                RegisterSod('jquery.js', '//code.jquery.com/jquery-1.12.4.js');
            SP.SOD.executeFunc("jquery.js", "jQuery", function () { 
                //console && console.log("jquery loaded");
                SP.SOD.loadMultiple(['sp.js', 'callout.js'], function() { 
                    console.log("callaout!!");
                });

            });

        },

      Templates: {
      },

       OnPostRender: function(ctx) {
           //console.log(ctx.ListData.Row);
           //console.log(ctx.listUrlDir);
               var rows = ctx.ListData.Row;
               for (var i=0;i<rows.length;i++)
               {
                    var rowElementId = GenerateIIDForListItem(ctx, rows[i]);
                    var tr = document.getElementById(rowElementId);

                        $.ajax({
                        url:"/demo/_api/Web/Lists/getByTitle('list2')/items/getById("+rows[i].ID+")/attachmentFiles",
                        method:"GET",
                        tr: tr,
                        headers: {
                            accept:"application/json;odata=verbose"
                        },
                        success: function(result){
                            //console.log(this.tr);
                            $(this.tr).hover(handlerIn, handlerOut);

                            var calloutContainer = jQuery("<div idCallout='"+$(this.tr).attr('id')+"' style='padding:10px;position:relative; '></div>");
                            calloutContainer.appendTo(this.tr);
                            calloutContainer.append("<div ><h4><strong>Attachments</strong></h4</div>");
                             for(var i=0; i< result.d.results.length;i++){
                                var attachment = result.d.results[i];
                                //console.log(attachment); 
                                calloutContainer.append("<div ><a href='"+attachment.ServerRelativeUrl+"'>"+attachment.FileName+"</a></div>");
                            }

                            function handlerIn(event){
                                //console.log(event);
                                $("[idCallout='"+$(event.currentTarget).attr('id')+"']").show();
                            }
                            function handlerOut(event){
                                $//("[idCallout='"+$(event.currentTarget).attr('id')+"']").hide();
                            }
                            

                        }
                    }) 
                }

        },

      ListTemplateType: 100

    });
  }

  RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~site/_catalogs/masterpage/attachments/callouts.js"), init);
  init();

});
