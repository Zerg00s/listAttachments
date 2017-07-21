/*
    Denis Molodtsov 2017
    Displays attachments callouts for list items

    Deployment steps: 
    1) reference JSLink ~site/_catalogs/masterpage/attachments/callouts.js
    2) reference css file /_catalogs/masterpage/attachments/callouts.css
*/

SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {

    function getBaseHtml(ctx) {
        return SPClientTemplates["_defaultTemplates"].Fields.default.all.all[ctx.CurrentFieldSchema.FieldType][ctx.BaseViewID](ctx);
    }

    function init() {

        SPClientTemplates.TemplateManager.RegisterTemplateOverrides({

            OnPreRender: function (ctx) {
                if (typeof jQuery == 'function')
                    NotifyScriptLoadedAndExecuteWaitingJobs("jquery.js");
                else if (LoadSodByKey('jquery.js', null) == Sods.missing)
                    RegisterSod('jquery.js', '//code.jquery.com/jquery-1.12.4.js');
                SP.SOD.executeFunc("jquery.js", "jQuery", function () {
                });

            },

            Templates: {
            },

            OnPostRender: function (ctx) {
                var rows = ctx.ListData.Row;
                for (var i = 0; i < rows.length; i++) {
                    var rowElementId = GenerateIIDForListItem(ctx, rows[i]);
                    var tr = document.getElementById(rowElementId);
                    var listId = _spPageContextInfo.listId.replace('{', '').replace('}', '');
                    $.ajax({
                        url: _spPageContextInfo.webServerRelativeUrl + "/_api/Web/Lists(guid'" + listId + "')/items/getById(" + rows[i].ID + ")/attachmentFiles",
                        method: "GET",
                        tr: tr,
                        headers: {
                            accept: "application/json;odata=verbose"
                        },
                        success: function (result) {
                            if (result.d.results.length > 0) {
                                var calloutContainer = jQuery("<div class='tooltip' idCallout='" + $(this.tr).attr('id') + "'></div>");
                                calloutContainer.appendTo(this.tr);
                                calloutContainer.append("<div class='callout-header'><h4><strong><i class='fa fa-paperclip'></i>  Attachments</strong></h4</div>");
                                for (var i = 0; i < result.d.results.length; i++) {
                                    var attachment = result.d.results[i];
                                    calloutContainer.append("<div class='attachment-item'><a href='" + attachment.ServerRelativeUrl + "'>" + attachment.FileName + "</a></div>");
                                }
                            }

                        }
                    })
                }

            },

            //ListTemplateType: 100

        });
    }

    RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~site/_catalogs/masterpage/attachments/callouts.js"), init);
    init();

});
